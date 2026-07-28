import fs from 'node:fs'
import path from 'node:path'

import { sourceRecordSchema, type SourcePost, type SourceRecord } from '../contracts/v1'
import { migrationConfig } from '../lib/config'
import { validateTransformed } from '../validate'
import {
  asArray,
  asBoolean,
  asObject,
  asString,
  contentHash,
  finalizeTarget,
  legacyRef,
  mediaToken,
  sourceURL,
} from './helpers'
import { htmlToLexical, htmlToPlainText } from './lexical'
import { mapArticleLayout, mapPageLayout, type ReusableLookup } from './blocks'
import type { TargetRecord, TransformCoverage } from './types'

const resolveRunId = (requested?: string): string => {
  if (requested) return requested
  const latest = path.join(migrationConfig.workDir, 'latest-run.txt')
  if (!fs.existsSync(latest)) {
    throw new Error('No migration run supplied and migration/work/latest-run.txt does not exist.')
  }
  return fs.readFileSync(latest, 'utf8').trim()
}

const readRecords = (runDir: string): SourceRecord[] => {
  const sourcePath = path.join(runDir, 'source.ndjson')
  return fs
    .readFileSync(sourcePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => sourceRecordSchema.parse(JSON.parse(line)))
}

const removeSearchActions = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(removeSearchActions).filter((child) => child !== undefined)
  }
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>
    if (object['@type'] === 'SearchAction') return undefined
    return Object.fromEntries(
      Object.entries(object)
        .map(([key, child]) => [key, removeSearchActions(child)] as const)
        .filter(([, child]) => child !== undefined),
    )
  }
  return value
}

const truncateAtWord = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) return value
  const candidate = value.slice(0, maxLength - 1)
  const wordBoundary = candidate.lastIndexOf(' ')
  const shortened =
    wordBoundary >= Math.floor(maxLength * 0.65) ? candidate.slice(0, wordBoundary) : candidate
  return `${shortened.trimEnd()}…`
}

const seoFrom = (post: SourcePost): Record<string, unknown> => {
  const settings = asObject(post.acf.page_settings)
  const canonical = asObject(settings.canonical)
  const indexFollow = asObject(settings.index_follow)
  const socialImage = mediaToken(post.featuredMediaId)
  const rawTitle = asString(settings.page_title) || post.title
  const rawDescription = asString(settings.meta_description)

  const schemaMarkup = asString(settings.schema_markup)
    .replace(/^\s*<script[^>]*>/i, '')
    .replace(/<\/script>\s*$/i, '')
    .trim()
  let structuredData: unknown
  if (schemaMarkup) {
    try {
      structuredData = removeSearchActions(
        JSON.parse(schemaMarkup.replaceAll('http://trayport.local', '')),
      )
    } catch {
      structuredData = undefined
    }
  }

  return {
    title: truncateAtWord(rawTitle, 70),
    description: truncateAtWord(rawDescription, 180),
    image: socialImage,
    canonicalURL:
      asString(canonical.use_canonical_tag) === '1' ? asString(canonical.canonical_tag) : '',
    noIndex: asString(indexFollow.index) === 'noindex',
    noFollow: asString(indexFollow.follow) === 'nofollow',
    structuredData,
  }
}

const baseLegacy = (post: SourcePost) => ({
  source: 'wordpress' as const,
  legacyId: post.legacyId,
  originalUrl: sourceURL(post.path),
  modifiedGmt: post.modifiedAt,
})

const mapPost = (
  post: SourcePost,
  coverage: TransformCoverage,
  hubConnections: Extract<SourceRecord, { entity: 'hub-connections' }> | undefined,
  mapHub: Extract<SourceRecord, { entity: 'map-hub' }> | undefined,
  reusables: ReusableLookup,
): TargetRecord | null => {
  if (post.postType === 'page') {
    const isInsights = post.legacyId === 9248
    const data = {
      title: post.title,
      path: post.path || `/${post.slug}/`,
      layout: mapPageLayout(post.acf, coverage, { appendArticleListing: isInsights }, reusables),
      publishedAt: post.publishedAt,
      pageType: isInsights ? 'index' : post.legacyId === 1924 ? 'product' : 'standard',
      meta: seoFrom(post),
      _status: post.status === 'publish' ? 'published' : 'draft',
    }
    return finalizeTarget({ target: 'pages', legacy: baseLegacy(post), data })
  }

  if (post.postType === 'post') {
    const categories = (post.taxonomies.category || []).map((id) =>
      legacyRef('article-category', id),
    )
    const displayDate = asString(post.acf.display_date)
    const normalizedDisplayDate = /^\d{8}$/.test(displayDate)
      ? `${displayDate.slice(0, 4)}-${displayDate.slice(4, 6)}-${displayDate.slice(6, 8)}T00:00:00.000Z`
      : post.publishedAt
    const header = asObject(post.acf.article_header)
    const articleTitle = htmlToPlainText(
      asObject(header.header).text || header.text || post.acf.article_header || post.title,
    )
    const isFeatured = asBoolean(post.acf.featured)
    const data = {
      title: articleTitle || post.title,
      slug: post.slug,
      path: post.path || `/insights/${post.slug}/`,
      excerpt: post.excerpt,
      heroMedia: mediaToken(post.featuredMediaId),
      publishedAt: normalizedDisplayDate,
      location: asString(post.acf.location),
      categories,
      articleType: post.legacyId === 9351 ? 'webinar' : 'insight',
      contentMode: post.scopeRole === 'root' ? 'full' : 'listing',
      featured: isFeatured,
      featuredOrder: isFeatured ? post.featuredOrder : null,
      layout: post.scopeRole === 'root' ? mapArticleLayout(post.acf.sections, coverage) : [],
      meta: seoFrom(post),
      _status: post.status === 'publish' ? 'published' : 'draft',
    }
    return finalizeTarget({ target: 'articles', legacy: baseLegacy(post), data })
  }

  if (post.postType === 'hub') {
    const region = legacyRef('region', mapHub?.regionLegacyId || post.acf.region)
    const assetClass = legacyRef('asset-class', mapHub?.assetClassLegacyId || post.acf.class)
    const connections =
      hubConnections?.connections.map((connection) => ({
        venue: legacyRef('venue', connection.venueLegacyId),
        connectionType: connection.connectionType || 'direct',
        supportsJoule: connection.supportsJoule,
        supportsAutoTrader: connection.supportsAutoTrader,
      })) || []
    const markers =
      mapHub?.markers.map((marker) => ({
        label: marker.name,
        location: {
          latitude: marker.latitude,
          longitude: marker.longitude,
        },
      })) || []
    const firstMarker = markers[0]
    const data = {
      title: post.title,
      slug: post.slug,
      path: post.path || `/market-coverage/${post.slug}/`,
      contentMode: 'page',
      code: asString(post.acf.code),
      marketDataKey: `wordpress-hub:${post.legacyId}`,
      assetClasses: assetClass ? [assetClass] : [],
      venueTypes: [
        ...new Set(
          (hubConnections?.connections || [])
            .map(({ venueTypeLegacyId }) => venueTypeLegacyId)
            .filter((id): id is number => typeof id === 'number'),
        ),
      ].map((id) => legacyRef('venue-type', id)),
      regions: region ? [region] : [],
      heroMedia: mediaToken(post.acf.image),
      layout: [],
      showOnMap: mapHub?.showOnMap ?? true,
      map: {
        locationLabel: firstMarker?.label || post.title,
        centre: firstMarker?.location,
        zoom: 6,
        markers,
      },
      connections,
      meta: seoFrom(post),
      _status: post.status === 'publish' ? 'published' : 'draft',
    }
    return finalizeTarget({ target: 'hubs', legacy: baseLegacy(post), data })
  }

  if (post.postType === 'venue') {
    const type = asObject(post.acf.type)
    const venueType = legacyRef('venue-type', type.venue_type)
    const data = {
      title: post.title,
      slug: post.slug,
      summary: asString(post.acf.display_name) || post.title,
      website: asString(post.acf.website),
      venueTypes: venueType ? [venueType] : [],
      assetClasses: [],
      regions: [],
      _status: post.status === 'publish' ? 'published' : 'draft',
    }
    return finalizeTarget({ target: 'venues', legacy: baseLegacy(post), data })
  }

  return null
}

const termCollection: Record<
  string,
  'article-categories' | 'asset-classes' | 'venue-types' | 'regions'
> = {
  category: 'article-categories',
  'asset-class': 'asset-classes',
  'venue-type': 'venue-types',
  region: 'regions',
}

const buildMenuTree = (
  items: Extract<SourceRecord, { entity: 'menu' }>['items'],
  parentId = 0,
): Record<string, unknown>[] =>
  items
    .filter((item) => item.parentId === parentId)
    .sort((left, right) => left.order - right.order)
    .map((item) => ({
      label: item.title,
      url: item.url.replace(/^http:\/\/trayport\.local/, ''),
      newTab: item.target === '_blank',
      children: buildMenuTree(items, item.legacyId),
    }))

const customLink = (label: string, url: string, newTab = false): Record<string, unknown> => ({
  label,
  type: 'custom',
  url: url.replace(/^https?:\/\/(?:www\.)?trayport\.local/, '') || '/',
  newTab,
})

const optionItemLink = (value: unknown): Record<string, unknown> | null => {
  const item = asObject(value)
  const pageLink = asObject(item.page_link)
  const link = asObject(pageLink.link || item.link)
  const legacyId = Number(link.value)
  const url = asString(link.url || link.value)
  const label = htmlToPlainText(link.title || item.text || link.name)

  if (legacyId === 2233 || /commodities-report/i.test(url)) return null
  if (!label || !url) return null

  return customLink(label, url, asString(link.target) === '_blank')
}

const navigationFromOptions = (
  options: Extract<SourceRecord, { entity: 'options' }> | undefined,
): Record<string, unknown> => {
  const dropdowns = asArray(options?.values.dropdown)
  const primaryItems = dropdowns.map((value) => {
    const dropdown = asObject(value)
    const title = htmlToPlainText(dropdown.title)
    const children = asArray(dropdown.menu_block).flatMap((blockValue) => {
      const block = asObject(blockValue)
      return asArray(block.menu_items)
        .map(optionItemLink)
        .filter((item): item is Record<string, unknown> => Boolean(item))
        .map(({ label, ...link }) => ({
          label,
          link,
        }))
    })
    const rootURL =
      asString(dropdown.for_page) ||
      (title ? `/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/` : '/')
    const rootLink = {
      type: 'custom',
      url: rootURL.replace(/^https?:\/\/(?:www\.)?trayport\.local/, '') || '/',
      newTab: false,
    }

    return {
      label: title,
      link: rootLink,
      children,
    }
  })

  return {
    primaryItems,
    utilityItems: [],
    primaryAction: {
      link: customLink('Contact', '/contact/'),
    },
  }
}

const footerFromOptions = (
  options: Extract<SourceRecord, { entity: 'options' }> | undefined,
): Record<string, unknown> => {
  const footer = asObject(options?.values.footer_new)
  const fallbackTitles = ['Company', 'Resources', 'Legal']
  const columns = asArray(footer.menu_block).map((blockValue, index) => {
    const block = asObject(blockValue)
    const sourceItems = asArray(block.menu_items)
    const section = sourceItems
      .map(asObject)
      .find((item) => asString(item.acf_fc_layout) === 'menu_section_title')
    const sectionLink = asObject(section?.link)
    const title =
      htmlToPlainText(section?.title || sectionLink.title || sectionLink.name) ||
      fallbackTitles[index] ||
      `Links ${index + 1}`
    const links = sourceItems
      .map(optionItemLink)
      .filter((item): item is Record<string, unknown> => Boolean(item))
      .map((link) => ({ link }))

    return { title, links }
  })
  const legal = asObject(options?.values.legal)

  return {
    intro: htmlToPlainText(legal.disclaimer),
    columns,
    legalLinks: [],
    copyright: `Company no. ${asString(legal.company_number)} · © {year} Trayport`,
    certificationMarks: [],
  }
}

const mapHubTarget = (hub: Extract<SourceRecord, { entity: 'map-hub' }>): TargetRecord => {
  const assetClass = legacyRef('asset-class', hub.assetClassLegacyId)
  const region = legacyRef('region', hub.regionLegacyId)
  const markers = hub.markers.map((marker) => ({
    label: marker.name,
    location: {
      latitude: marker.latitude,
      longitude: marker.longitude,
    },
  }))
  const firstMarker = markers[0]
  const data = {
    title: hub.title,
    slug: hub.slug,
    contentMode: 'map-only',
    marketDataKey: `wordpress-hub:${hub.legacyId}`,
    assetClasses: assetClass ? [assetClass] : [],
    venueTypes: [],
    regions: region ? [region] : [],
    layout: [],
    showOnMap: hub.showOnMap,
    map: {
      locationLabel: firstMarker?.label || hub.title,
      centre: firstMarker?.location,
      zoom: 6,
      markers,
    },
    connections: [],
    _status: 'published',
  }

  return finalizeTarget({
    target: 'hubs',
    legacy: {
      source: 'wordpress',
      legacyId: hub.legacyId,
      originalUrl: sourceURL(hub.path),
      modifiedGmt: null,
    },
    data,
  })
}

export const transform = (requestedRunId?: string): { runId: string; targets: TargetRecord[] } => {
  const runId = resolveRunId(requestedRunId)
  const runDir = path.resolve(migrationConfig.workDir, runId)
  const records = readRecords(runDir)
  const coverage: TransformCoverage = {
    componentLayouts: {},
    ignoredComponentLayouts: {},
    topLevelLayouts: {},
    ignoredTaxonomies: {},
    unsupportedComponentLayouts: [],
    unsupportedTopLevelLayouts: [],
  }
  const targets: TargetRecord[] = []

  const hubConnections = records.find(
    (record): record is Extract<SourceRecord, { entity: 'hub-connections' }> =>
      record.entity === 'hub-connections',
  )
  const reusables: ReusableLookup = new Map(
    records
      .filter(
        (record): record is Extract<SourceRecord, { entity: 'reusable' }> =>
          record.entity === 'reusable',
      )
      .map((record) => [record.legacyId, record]),
  )
  const mapHubs = new Map(
    records
      .filter(
        (record): record is Extract<SourceRecord, { entity: 'map-hub' }> =>
          record.entity === 'map-hub',
      )
      .map((record) => [record.legacyId, record]),
  )

  for (const record of records) {
    if (record.entity === 'post') {
      const target = mapPost(
        record,
        coverage,
        hubConnections,
        mapHubs.get(record.legacyId),
        reusables,
      )
      if (target) targets.push(target)
      continue
    }

    if (record.entity === 'map-hub') {
      if (record.legacyId !== 2495) {
        targets.push(mapHubTarget(record))
      }
      continue
    }

    if (record.entity === 'media') {
      const data = {
        title: record.title,
        alt: record.alt || record.title,
        decorative: record.decorative,
        altSource: record.altSource,
        caption: record.caption ? htmlToLexical(record.caption) : undefined,
        externalURL: record.availability === 'unavailable' ? record.url : '',
        source: {
          relativePath: record.relativePath,
          originalURL: record.url,
          mimeType: record.mimeType,
          width: record.width,
          height: record.height,
          availability: record.availability,
          availabilityReason: record.availabilityReason,
          needsAltReview: record.needsAltReview,
        },
      }
      targets.push(
        finalizeTarget({
          target: 'media',
          legacy: {
            source: 'wordpress',
            legacyId: record.legacyId,
            originalUrl: record.url || sourceURL('/'),
            modifiedGmt: null,
          },
          data,
        }),
      )
      continue
    }

    if (record.entity === 'term') {
      const target = termCollection[record.taxonomy]
      if (!target) {
        coverage.ignoredTaxonomies[record.taxonomy] =
          (coverage.ignoredTaxonomies[record.taxonomy] || 0) + 1
        continue
      }
      const data = {
        title: record.name,
        slug: record.slug,
        description: record.description,
        displayOrder: Number(asString(record.acf.display_order)) || 0,
        ...(target === 'regions' ? { code: asString(record.acf.code) } : {}),
      }
      targets.push(
        finalizeTarget({
          target,
          legacy: {
            source: 'wordpress',
            legacyId: record.legacyId,
            originalUrl: sourceURL(`/${record.taxonomy}/${record.slug}/`),
            modifiedGmt: null,
          },
          data,
        }),
      )
      continue
    }

    if (record.entity === 'menu') {
      const data = {
        items: buildMenuTree(record.items),
      }
      targets.push(
        finalizeTarget({
          target: 'global',
          globalSlug: 'navigation',
          legacy: {
            source: 'wordpress',
            legacyId: record.legacyId,
            originalUrl: sourceURL('/'),
            modifiedGmt: null,
          },
          data,
        }),
      )
    }
  }

  const options = records.find(
    (record): record is Extract<SourceRecord, { entity: 'options' }> => record.entity === 'options',
  )
  const settingsData = {
    siteName: 'Trayport',
    tagline: htmlToPlainText(asObject(options?.values.legal).disclaimer),
    defaultSEO: {
      titleSuffix: ' | Trayport',
      description: 'Trayport connects traders, brokers and exchanges across global energy markets.',
    },
    contact: {
      address: asString(asObject(options?.values.legal).address),
    },
    socialLinks: [
      {
        platform: 'linkedin',
        label: 'LinkedIn',
        url: 'https://uk.linkedin.com/company/trayport',
      },
      {
        platform: 'x',
        label: 'X',
        url: 'https://x.com/Trayport',
      },
    ],
  }
  targets.push(
    finalizeTarget({
      target: 'global',
      globalSlug: 'navigation',
      legacy: {
        source: 'wordpress',
        legacyId: 1,
        originalUrl: sourceURL('/'),
        modifiedGmt: null,
      },
      data: navigationFromOptions(options),
    }),
  )
  targets.push(
    finalizeTarget({
      target: 'global',
      globalSlug: 'footer',
      legacy: {
        source: 'wordpress',
        legacyId: 2,
        originalUrl: sourceURL('/'),
        modifiedGmt: null,
      },
      data: footerFromOptions(options),
    }),
  )
  targets.push(
    finalizeTarget({
      target: 'global',
      globalSlug: 'site-settings',
      legacy: {
        source: 'wordpress',
        legacyId: 0,
        originalUrl: sourceURL('/'),
        modifiedGmt: null,
      },
      data: settingsData,
    }),
  )

  const unsupportedComponents = [...new Set(coverage.unsupportedComponentLayouts)].sort()
  const unsupportedLayouts = [...new Set(coverage.unsupportedTopLevelLayouts)].sort()
  coverage.unsupportedComponentLayouts = unsupportedComponents
  coverage.unsupportedTopLevelLayouts = unsupportedLayouts

  const marketRows = records
    .filter(
      (record): record is Extract<SourceRecord, { entity: 'market-volume' }> =>
        record.entity === 'market-volume',
    )
    .map((record) => ({
      ...record,
      sourceFingerprint: contentHash(record),
    }))
  const warnings = records
    .filter(
      (record): record is Extract<SourceRecord, { entity: 'warning' }> =>
        record.entity === 'warning',
    )
    .sort(
      (left, right) =>
        left.code.localeCompare(right.code) ||
        (left.legacyId || 0) - (right.legacyId || 0) ||
        left.message.localeCompare(right.message),
    )
  const mediaRecords = records.filter(
    (record): record is Extract<SourceRecord, { entity: 'media' }> => record.entity === 'media',
  )
  const seoLengthReviews = records
    .filter(
      (record): record is Extract<SourceRecord, { entity: 'post' }> => record.entity === 'post',
    )
    .flatMap((record) => {
      const settings = asObject(record.acf.page_settings)
      const fields = [
        ['title', asString(settings.page_title) || record.title, 70],
        ['description', asString(settings.meta_description), 180],
      ] as const
      return fields
        .filter(([, value, maxLength]) => value.length > maxLength)
        .map(([field, value, maxLength]) => ({
          code: 'seo-length-normalized',
          field,
          legacyId: record.legacyId,
          maxLength,
          sourceLength: value.length,
        }))
    })

  fs.writeFileSync(
    path.join(runDir, 'transformed.ndjson'),
    `${targets.map((target) => JSON.stringify(target)).join('\n')}\n`,
  )
  fs.writeFileSync(
    path.join(runDir, 'market-volume.ndjson'),
    `${marketRows.map((row) => JSON.stringify(row)).join('\n')}\n`,
  )
  fs.writeFileSync(
    path.join(runDir, 'reports', 'content-review.json'),
    `${JSON.stringify(
      {
        runId,
        warnings,
        missingMedia: mediaRecords
          .filter(({ availability }) => availability === 'unavailable')
          .map(({ legacyId, relativePath, availabilityReason, url }) => ({
            legacyId,
            relativePath,
            availabilityReason,
            url,
          })),
        altTextReview: mediaRecords
          .filter(({ needsAltReview }) => needsAltReview)
          .map(({ legacyId, title, altSource }) => ({ legacyId, title, altSource })),
        seoLengthReviews,
        curatedExclusions: [2233],
      },
      null,
      2,
    )}\n`,
  )
  fs.writeFileSync(
    path.join(runDir, 'reports', 'transform-coverage.json'),
    `${JSON.stringify(
      {
        runId,
        sourceCount: records.length,
        targetCount: targets.length,
        targetCounts: Object.fromEntries(
          [...new Set(targets.map(({ target }) => target))]
            .sort()
            .map((target) => [target, targets.filter((item) => item.target === target).length]),
        ),
        coverage,
      },
      null,
      2,
    )}\n`,
  )

  if (unsupportedComponents.length || unsupportedLayouts.length) {
    throw new Error(
      `Transformation has unsupported layouts: ${[
        ...unsupportedLayouts.map((layout) => `top-level:${layout}`),
        ...unsupportedComponents.map((layout) => `component:${layout}`),
      ].join(', ')}`,
    )
  }

  validateTransformed(runId, runDir, targets)

  process.stdout.write(
    `${JSON.stringify({ ok: true, runId, targetCount: targets.length, coverage }, null, 2)}\n`,
  )
  return { runId, targets }
}
