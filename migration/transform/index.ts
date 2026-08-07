import fs from 'node:fs'
import path from 'node:path'

import { normalizeTrayportSlug } from '../../src/fields/slug'
import { normalizeHubSpotFormID } from '../../src/integrations/hubSpotForm'
import {
  sourceRecordSchema,
  type SourcePost,
  type SourceRecord,
  type SourceReusable,
} from '../contracts/v1'
import { assertRunNotAccepted, atomicWriteText, sealAcceptedRun } from '../lib/acceptedRun'
import { migrationConfig } from '../lib/config'
import { pilotScope, type AcceptedRouteDependency, type PilotRoot } from '../scopes/pilot'
import { validateSource, validateTransformed } from '../validate'
import {
  asArray,
  asBoolean,
  asObject,
  asString,
  contentHash,
  finalizeTarget,
  legacyRef,
  liveSourceURL,
  mediaToken,
  referenceId,
  sourceURL,
} from './helpers'
import { htmlToLexical, htmlToMultilinePlainText, htmlToPlainText } from './lexical'
import { mapBannerReusable } from './banner'
import { mapLifecycleReusable } from './lifecycle'
import {
  mapArticleLayout,
  mapPageLayout,
  statsRightComponentsFromWordPress,
  type ManagedLinkLookup,
  type ReusableLookup,
} from './blocks'
import type { LegacyReference, TargetRecord, TransformCoverage } from './types'
import {
  legacyExternalHTTPSDestination,
  migrationDestination,
  normalizeMigrationPath,
  ownedPathsFromSource,
  setMigrationOwnedCorpusPaths,
} from './url'

const pilotRootByLegacyId = new Map<number, PilotRoot>(
  pilotScope.roots.map((root) => [root.legacyId, root]),
)
const acceptedRouteByLegacyId = new Map<number, PilotRoot | AcceptedRouteDependency>(
  [...pilotScope.roots, ...pilotScope.acceptedRouteDependencies].map((route) => [
    route.legacyId,
    route,
  ]),
)

const tradingInJouleLegacyAlias = {
  from: '/learning-hub/watch/trading-in-joule/',
  legacyId: 8454,
} as const

const requestDemoTemporaryRedirect = {
  from: '/request-a-demo/',
  legacyId: 4031,
  toLegacyId: 34,
  type: '302',
} as const

type ManagedLinkTarget = ManagedLinkLookup extends Map<number, infer Target> ? Target : never

const pageTypeByArchetype = {
  'page.homepage': 'homepage',
  'page.standard': 'standard',
  'page.product': 'product',
  'page.landing': 'landing',
  'page.legal': 'legal',
  'page.conversion': 'conversion',
  'page.interactive-market-matrix': 'interactive',
  'page.content-index': 'index',
} as const

const managedMapColors = new Set([
  '#1f2a44',
  '#002d72',
  '#0057b8',
  '#009cde',
  '#00c1d5',
  '#32b77b',
  '#ff671f',
  '#f7ea48',
])

const legacyMarketHubAliasesByTitle: Record<string, string[]> = {
  'cegh vtp (austrian)': ['Austria VTP'],
  'czech gas': ['CZ'],
  'gtf (danish)': ['Denmark ETF', 'GTF'],
  'nbp (uk)': ['NBP'],
  'peg (french)': ['France PEG', 'PEG'],
  'psv (italian)': ['PSV'],
  'pvb (spanish)': ['PVB'],
  'the (german)': ['THE'],
  'ttf (dutch)': ['TTF'],
  'ztp (belgian)': ['ZEE', 'ZTP'],
}

const marketDataAliasesForHub = (
  legacyId: number,
  title: string,
  additional: string[] = [],
): Array<{ value: string }> =>
  [
    ...new Set(
      [
        `wordpress-hub:${legacyId}`,
        title,
        ...additional,
        ...(legacyMarketHubAliasesByTitle[title.trim().toLocaleLowerCase('en-GB')] || []),
      ]
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ].map((value) => ({ value }))

const mapColorFromTerm = (acf: Record<string, unknown>, slug: string): string => {
  const source = asObject(acf.color)
  const raw = asString(
    asString(source.type) === 'shades' ? source.shade : source.color || source.shade || acf.color,
  ).toLowerCase()
  if (managedMapColors.has(raw)) return raw
  if (slug === 'gas') return '#f7ea48'
  if (slug === 'power') return '#ff671f'
  return '#00c1d5'
}

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

const seoFrom = (
  post: Pick<SourcePost, 'acf' | 'featuredMediaId' | 'title'>,
): Record<string, unknown> => {
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

const wordpressDate = (value: unknown): string | null => {
  const source = asString(value).trim()
  if (/^\d{8}$/.test(source)) {
    return `${source.slice(0, 4)}-${source.slice(4, 6)}-${source.slice(6, 8)}T00:00:00.000Z`
  }
  const timestamp = Date.parse(source)
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString()
}

type EventDetails = {
  city?: string
  coordinates?: { latitude: number; longitude: number }
  country?: string
  endsAt: string | null
  formTitle?: string
  hideFormsAfterEnd?: boolean
  hubspotFormId?: string
  region?: string
  showFinishedNotice?: boolean
  startsAt: string | null
  venueName?: string
}

export const eventDetailsFromWordPress = (
  source: Pick<SourcePost, 'acf'> & Partial<Pick<SourcePost, 'postType'>>,
): EventDetails => {
  const location = asObject(source.acf.latlng)
  const latitude = Number(location.lat)
  const longitude = Number(location.lng)
  const coordinates =
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
      ? { latitude, longitude }
      : undefined
  const startsAt = wordpressDate(source.acf.start_date || source.acf.display_date)
  const endsAt = wordpressDate(source.acf.date) || startsAt
  const formId = normalizeHubSpotFormID(source.acf.hubspot_form_id)
  const legacyLifecycle = source.postType === 'events'
  const legacyLocation = htmlToPlainText(source.acf.location)

  return {
    startsAt,
    endsAt,
    ...(asString(location.name) ? { venueName: asString(location.name) } : {}),
    ...(asString(location.city) && asString(location.city) !== asString(location.name)
      ? { city: asString(location.city) }
      : !asString(location.name) && legacyLocation
        ? { city: legacyLocation }
        : {}),
    ...(asString(location.state) ? { region: asString(location.state) } : {}),
    ...(asString(location.country) ? { country: asString(location.country) } : {}),
    ...(coordinates ? { coordinates } : {}),
    ...(asString(source.acf.form_title)
      ? { formTitle: htmlToPlainText(source.acf.form_title) }
      : {}),
    ...(formId ? { hubspotFormId: formId } : {}),
    ...(legacyLifecycle ? { hideFormsAfterEnd: true, showFinishedNotice: true } : {}),
  }
}

export const canonicalEventArticleSlug = (post: Pick<SourcePost, 'legacyId' | 'slug'>): string =>
  post.legacyId === 10974 ? 'commodity-trading-week-2026' : normalizeTrayportSlug(post.slug)

export const canonicalEventPath = (slug: string): string => `/event/${normalizeTrayportSlug(slug)}/`

const readingSection = (components: Array<Record<string, unknown>>): Record<string, unknown> => ({
  blockType: 'contentSection',
  surfaceTone: 'white',
  wrapperTheme: 'none',
  backgroundOpacity: 'none',
  surfaceRadius: 'default',
  surfacePadding: 'none',
  width: 'reading',
  spacingTop: 'tight',
  spacingBottom: 'tight',
  columnGap: 'regular',
  columns: [
    {
      span: '12',
      horizontalAlign: 'left',
      verticalAlign: 'start',
      heightMode: 'fill',
      componentGap: 'regular',
      padding: 'none',
      surface: 'none',
      border: 'none',
      backgroundOpacity: 'none',
      radius: 'default',
      components,
    },
  ],
})

const legacyEventLayout = (post: SourcePost): Array<Record<string, unknown>> => {
  const heading = htmlToPlainText(post.acf.name) || post.title
  const description = asString(post.acf.description)
  const eventDetails = eventDetailsFromWordPress(post)
  const form = eventDetails.hubspotFormId
    ? {
        blockType: 'hubspotForm',
        formId: eventDetails.hubspotFormId,
        title: eventDetails.formTitle || 'Contact the Trayport team',
      }
    : null
  const layout: Array<Record<string, unknown>> = [
    {
      blockType: 'trayportHero',
      heading,
      body: asString(post.acf.short_description)
        ? htmlToLexical(post.acf.short_description)
        : undefined,
      media: mediaToken(post.featuredMediaId),
      actions: [],
      appearance: post.featuredMediaId ? 'image' : 'light',
    },
  ]

  if (description) {
    layout.push(
      readingSection([
        {
          blockType: 'richText',
          body: htmlToLexical(description),
          size: 'regular',
        },
      ]),
    )
  }
  for (const sectionValue of asArray(asObject(post.acf.page_content).sections)) {
    const section = asObject(sectionValue)
    for (const layoutValue of asArray(section.layout)) {
      const statsLayout = asObject(layoutValue)
      if (asString(statsLayout.acf_fc_layout) !== 'stats-right') continue
      const components = statsRightComponentsFromWordPress(statsLayout)
      if (components.length) layout.push(readingSection(components))
    }
  }
  if (form) layout.push(readingSection([form]))
  return layout
}

const mapLegacyEventPost = (post: SourcePost): TargetRecord => {
  const slug = normalizeTrayportSlug(post.slug)
  const data = {
    title: htmlToPlainText(post.acf.name) || post.title,
    slug,
    path: canonicalEventPath(slug),
    externalDestination: null,
    excerpt: htmlToPlainText(post.acf.short_description),
    heroMedia: mediaToken(post.featuredMediaId),
    displayDate: wordpressDate(post.acf.start_date) || post.publishedAt,
    publishedAt: post.publishedAt,
    location: htmlToPlainText(asObject(post.acf.latlng).address),
    categories: [legacyRef('article-category', 119)],
    articleType: 'event',
    eventDetails: eventDetailsFromWordPress(post),
    contentMode: 'full',
    featured: false,
    featuredOrder: null,
    layout: legacyEventLayout(post),
    meta: seoFrom(post),
    _status: post.status === 'publish' ? 'published' : 'draft',
  }
  return finalizeTarget({ target: 'articles', legacy: baseLegacy(post), data })
}

export const personDataFromWordPress = (person: SourceReusable): Record<string, unknown> => {
  const featuredMediaId = referenceId(person.data.image, 'media')
  const description = asString(person.data.description)
  const quote = asString(person.data.quote)
  const team = asString(person.data.team)
  const jobRole = htmlToPlainText(person.data.job_role)
  const image = mediaToken(person.data.image)

  return {
    title: htmlToPlainText(person.data.name) || person.title,
    slug: normalizeTrayportSlug(person.path?.split('/').filter(Boolean).at(-1) || person.title),
    path: person.path || `/people/${normalizeTrayportSlug(person.title)}/`,
    ...(jobRole ? { jobRole } : {}),
    team: ['ceo', 'smt', 'head', 'careers'].includes(team) ? team : 'head',
    displayOrder: Math.max(0, person.menuOrder || 0),
    ...(image ? { image } : {}),
    ...(description ? { description: htmlToLexical(description) } : {}),
    ...(quote ? { quote: htmlToLexical(quote) } : {}),
    joinedAt: wordpressDate(person.data.date),
    externalProfileURL: legacyExternalHTTPSDestination(person.data.external_link) || undefined,
    publishedAt: person.publishedAt || null,
    meta: seoFrom({
      acf: { page_settings: person.data.page_settings },
      featuredMediaId,
      title: htmlToPlainText(person.data.name) || person.title,
    }),
    _status: person.status === 'publish' ? 'published' : 'draft',
  }
}

const mapPersonReusable = (person: SourceReusable): TargetRecord =>
  finalizeTarget({
    target: 'people',
    legacy: {
      source: 'wordpress',
      legacyId: person.legacyId,
      originalUrl: sourceURL(person.path),
      modifiedGmt: person.modifiedAt || null,
    },
    data: personDataFromWordPress(person),
  })

/**
 * Keep venue index copy and visible editorial content separate from SEO metadata.
 * WordPress EEX has a meta description but no authored About body, so promoting
 * that metadata into visible content would invent source content.
 */
export const venueEditorialDataFromWordPress = (post: SourcePost, isPublic: boolean) => {
  const meta = isPublic ? seoFrom(post) : undefined
  if (meta && typeof meta.description === 'string') {
    meta.description = meta.description.trim()
  }

  // `display_name` is the venue's public-facing name — the reference headlines its detail page
  // with it and lists it alongside the title. Conditioning it on the record being private wiped
  // it from every venue once the whole corpus became public. A handful of venues have a URL in
  // that field instead of a name; keep those out rather than headlining a link.
  const displayName = asString(post.acf.display_name)
  const usableDisplayName =
    displayName && !/^https?:\/\//i.test(displayName) && displayName !== post.title
      ? displayName
      : ''

  return {
    description: isPublic ? null : undefined,
    meta,
    summary: usableDisplayName || (isPublic ? null : post.title),
  }
}

export const venueConnectionsFromWordPress = (
  value: unknown,
): Array<{ connectionType: string; hub: LegacyReference }> => {
  const normalized = new Map<number, { connectionType: string; hub: LegacyReference }>()

  for (const row of asArray(value)) {
    const connection = asObject(row)
    const hubID = referenceId(connection.hub, 'post')
    const hub = hubID ? legacyRef('hub', hubID) : null
    if (!hubID || !hub) continue
    const connectionType = asString(connection.type || connection.connection_type) || 'd'
    const existing = normalized.get(hubID)

    // Preserve the first source-row position while retaining the broader dual-product
    // relationship if a later duplicate supplies it.
    if (!existing || connectionType === 'b') {
      normalized.set(hubID, { connectionType, hub })
    }
  }

  return [...normalized.values()]
}

export const venueWebsiteFromWordPress = (value: unknown): string | undefined =>
  legacyExternalHTTPSDestination(value) ?? undefined

const baseLegacy = (post: SourcePost) => ({
  source: 'wordpress' as const,
  legacyId: post.legacyId,
  originalUrl: sourceURL(post.path),
  modifiedGmt: post.modifiedAt,
})

const ensurePageHero = (
  post: SourcePost,
  layout: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> => {
  if (layout.some(({ blockType }) => blockType === 'trayportHero')) return layout

  const firstSection = layout[0]
  const columns = Array.isArray(firstSection?.columns)
    ? (firstSection.columns as Array<Record<string, unknown>>)
    : []
  const components = columns.flatMap((column) =>
    Array.isArray(column.components) ? (column.components as Array<Record<string, unknown>>) : [],
  )
  const heading = components.find(({ blockType }) => blockType === 'heading')
  const body = components.find(({ blockType }) => blockType === 'richText')
  const media = components.find(({ blockType }) => blockType === 'media')
  const consumed = new Set([heading, body, media].filter(Boolean))
  const remainingColumns = columns
    .map((column) => ({
      ...column,
      components: Array.isArray(column.components)
        ? (column.components as Array<Record<string, unknown>>).filter(
            (component) => !consumed.has(component),
          )
        : [],
    }))
    .filter((column) => column.components.length)
  const remaining = [...layout]
  if (firstSection) {
    if (remainingColumns.length) remaining[0] = { ...firstSection, columns: remainingColumns }
    else remaining.shift()
  }

  return [
    {
      blockType: 'trayportHero',
      heading: asString(heading?.text) || post.title,
      body: body?.body,
      media: media?.media,
      actions: [],
      appearance: media?.media ? 'image' : 'light',
    },
    ...remaining,
  ]
}

const appendMarketMatrix = (
  layout: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> => {
  let appended = false
  const next = layout.map((block) => {
    if (appended || block.blockType !== 'contentSection') return block
    const columns = asArray(block.columns).map((columnValue, index) => {
      const column = asObject(columnValue)
      if (index !== 0) return column
      appended = true
      return {
        ...column,
        components: [
          ...asArray(column.components).map(asObject),
          {
            blockType: 'marketMatrix',
            caption: 'Trayport venue connectivity by market hub',
            assetClasses: [],
            venueTypes: [],
            regions: [],
            defaultView: 'joule',
            showFilters: true,
            showDownload: true,
          },
        ],
      }
    })
    return { ...block, columns }
  })

  if (!appended) {
    throw new Error('Market Matrix page 2231 requires a mapped content section.')
  }
  return next
}

const removeDeferredContactFormPrompts = (
  layout: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> =>
  layout.flatMap((block) => {
    if (block.blockType !== 'contentSection') return [block]
    const columns = asArray(block.columns).flatMap((columnValue) => {
      const column = asObject(columnValue)
      const components = asArray(column.components)
        .map(asObject)
        .filter(
          (component) =>
            !/complete\s+the\s+form|form\s+below|hubspot/i.test(JSON.stringify(component)),
        )
      return components.length ? [{ ...column, components }] : []
    })
    return columns.length ? [{ ...block, columns }] : []
  })

export const articleDatesFromWordPress = (
  post: Pick<SourcePost, 'acf' | 'publishedAt'>,
): { displayDate: string | null; publishedAt: string | null } => {
  const sourceDisplayDate = asString(post.acf.display_date)
  const displayDate = /^\d{8}$/.test(sourceDisplayDate)
    ? `${sourceDisplayDate.slice(0, 4)}-${sourceDisplayDate.slice(4, 6)}-${sourceDisplayDate.slice(6, 8)}T00:00:00.000Z`
    : post.publishedAt

  return {
    displayDate,
    publishedAt: post.publishedAt,
  }
}

const mapPost = (
  post: SourcePost,
  coverage: TransformCoverage,
  hubConnections: Extract<SourceRecord, { entity: 'hub-connections' }> | undefined,
  mapHub: Extract<SourceRecord, { entity: 'map-hub' }> | undefined,
  allMapHubs: Map<number, Extract<SourceRecord, { entity: 'map-hub' }>>,
  reusables: ReusableLookup,
  links: ManagedLinkLookup,
  legacyEvent?: SourcePost,
): TargetRecord | null => {
  if (post.postType === 'page') {
    const acceptedRoute = acceptedRouteByLegacyId.get(post.legacyId)
    if (acceptedRoute?.targetOwner === 'redirects') return null
    // The `articles-list` template renders its listing from the theme rather than from ACF, so
    // the family is derived from the route rather than authored. Keyed on the path so every
    // content-index page gets one, not just the three the pilot happened to include.
    const articleListingFamilyByPath: Record<string, 'all' | 'events' | 'insights' | 'news'> = {
      '/resources/events/': 'events',
      '/resources/insights/': 'insights',
      '/resources/news/': 'news',
      '/resources/news-events-insights/': 'all',
    }
    const articleListingFamily = post.path ? articleListingFamilyByPath[post.path] : undefined
    const isLearningHub = post.legacyId === 3311
    const pageType =
      acceptedRoute && acceptedRoute.archetype in pageTypeByArchetype
        ? pageTypeByArchetype[acceptedRoute.archetype as keyof typeof pageTypeByArchetype]
        : 'standard'
    const usesArticleStyleSections =
      acceptedRoute?.archetype === 'page.legal' &&
      asArray(post.acf.sections_new).length === 0 &&
      asArray(post.acf.sections).length > 0
    const mappedLayout = usesArticleStyleSections
      ? mapArticleLayout(post.acf.sections, coverage, links, reusables)
      : mapPageLayout(
          post.acf,
          coverage,
          {
            appendArticleListing: Boolean(articleListingFamily),
            articleFamily: articleListingFamily,
            appendLearningVideoListing: isLearningHub,
            marketCoveragePresentation: post.legacyId === 1898 ? 'mapOnly' : undefined,
            suppressedHeadingTexts:
              post.legacyId === 1898 ? ['Why Trayport?', 'Who we serve'] : undefined,
          },
          reusables,
          links,
        )
    const routeLayout =
      post.legacyId === 2231
        ? appendMarketMatrix(mappedLayout)
        : post.legacyId === 34
          ? removeDeferredContactFormPrompts(mappedLayout)
          : mappedLayout
    const meta = seoFrom(post)
    if (post.legacyId === 7609) {
      meta.title = 'Frequently Asked Questions | Trayport'
      meta.description =
        'Find answers to common Trayport account, login, password, server and product-support questions.'
    }
    const data = {
      title: post.title,
      path: post.path || `/${post.slug}/`,
      layout: usesArticleStyleSections
        ? [
            {
              blockType: 'trayportHero',
              heading: htmlToPlainText(post.acf.article_header) || post.title,
              actions: [],
              appearance: 'light',
            },
            ...routeLayout,
          ]
        : ensurePageHero(post, routeLayout),
      publishedAt: post.publishedAt,
      pageType,
      meta,
      _status: post.status === 'publish' ? 'published' : 'draft',
    }
    return finalizeTarget({ target: 'pages', legacy: baseLegacy(post), data })
  }

  if (post.postType === 'post') {
    const root = pilotRootByLegacyId.get(post.legacyId)
    const isEvent = (post.taxonomies.category || []).includes(119)
    const isFullArticle = root?.archetype === 'article.full' || post.scopeRole === 'event-listing'
    if (!isFullArticle && !post.path) {
      throw new Error(
        `Listing-only WordPress article ${post.legacyId} has no source path for its live-site destination.`,
      )
    }
    const categories = (post.taxonomies.category || []).map((id) =>
      legacyRef('article-category', id),
    )
    const articleDates = articleDatesFromWordPress(post)
    const header = asObject(post.acf.article_header)
    const articleTitle = htmlToPlainText(
      asObject(header.header).text || header.text || post.acf.article_header || post.title,
    )
    const isFeatured = asBoolean(post.acf.featured)
    const articleType = (post.taxonomies.category || []).includes(111)
      ? 'news'
      : isEvent
        ? 'event'
        : post.legacyId === 9351
          ? 'webinar'
          : 'insight'
    const data = {
      title: articleTitle || post.title,
      slug: isEvent ? canonicalEventArticleSlug(post) : normalizeTrayportSlug(post.slug),
      path: isFullArticle
        ? isEvent
          ? canonicalEventPath(canonicalEventArticleSlug(post))
          : post.path || `/insights/${post.slug}/`
        : null,
      externalDestination: isFullArticle ? null : liveSourceURL(post.path),
      excerpt: post.excerpt,
      heroMedia: mediaToken(post.featuredMediaId),
      ...articleDates,
      location: asString(post.acf.location),
      categories,
      articleType,
      ...(isEvent ? { eventDetails: eventDetailsFromWordPress(legacyEvent || post) } : {}),
      contentMode: isFullArticle ? 'full' : 'listing',
      featured: isFeatured,
      featuredOrder: isFeatured ? post.featuredOrder : null,
      layout: isFullArticle ? mapArticleLayout(post.acf.sections, coverage, links, reusables) : [],
      meta: seoFrom(post),
      _status: post.status === 'publish' ? 'published' : 'draft',
    }
    return finalizeTarget({ target: 'articles', legacy: baseLegacy(post), data })
  }

  if (post.postType === 'learning-hub-video') {
    const root = pilotRootByLegacyId.get(post.legacyId)
    const isFull = root?.archetype === 'learning-video.public-detail'
    const productID = referenceId(post.acf.product, 'post')
    const product = productID ? reusables.get(productID) : undefined
    const categories = asArray(post.acf.categories)
      .map((value) => legacyRef('learning-video-category', value))
      .filter(Boolean)
    const rawTags = asArray(post.acf.tags)
      .map((value) => htmlToPlainText(asObject(value).name || value))
      .filter(Boolean)
    const stringTags = asString(post.acf.tags)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    const data = {
      title: htmlToPlainText(post.title),
      summary: htmlToPlainText(post.acf.short_description),
      description: isFull ? htmlToLexical(post.acf.description) : undefined,
      contentMode: isFull ? 'full' : 'listing',
      externalDestination: isFull
        ? null
        : `https://www.trayport.com/learning-hub/watch/${post.slug}/`,
      accessMode: asString(post.acf.permissions) === '0' ? 'public' : 'subscriber',
      video: null,
      externalVideoURL: '',
      poster: mediaToken(post.acf.image),
      duration: asString(post.acf.duration),
      categories,
      product: htmlToPlainText(product?.title),
      tags: [...new Set([...rawTags, ...stringTags])].map((label) => ({ label })),
      displayOrder: Number(asString(post.acf.order)) || 0,
      layout: [],
      slug: normalizeTrayportSlug(post.slug),
      path: isFull ? post.path || `/learning-hub-video/${post.slug}/` : null,
      publishedAt: post.publishedAt,
      meta: seoFrom(post),
      _status: post.status === 'publish' ? 'published' : 'draft',
    }
    return finalizeTarget({ target: 'learning-videos', legacy: baseLegacy(post), data })
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
    const mapConnections =
      mapHub?.connections.map((connection) => ({
        hub: legacyRef('hub', connection.hubLegacyId),
        route: connection.route,
        showLineMarker: connection.showLineMarker,
        lineMarkerLabel: connection.lineMarkerLabel,
      })) || []
    const data = {
      title: post.title,
      slug: normalizeTrayportSlug(post.slug),
      path: post.path || `/market-coverage/${post.slug}/`,
      contentMode: 'page',
      code: asString(post.acf.code),
      marketDataKey: `hub:${normalizeTrayportSlug(post.slug)}`,
      marketDataAliases: marketDataAliasesForHub(post.legacyId, post.title, [
        asString(post.acf.code),
      ]),
      hubType: mapHub?.hubType || 'vhub',
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
      countryCode: mapHub?.countryCode || null,
      connectedCountryCodes: mapHub?.connectedCountryCodes.map((code) => ({ code })) || [],
      relatedHubs:
        mapHub?.connections.map(({ hubLegacyId }) => legacyRef('hub', hubLegacyId)) || [],
      map: {
        locationLabel: firstMarker?.label || post.title,
        centre: firstMarker?.location,
        zoom: 6,
        markers,
        connections: mapConnections,
      },
      connections,
      meta: seoFrom(post),
      _status: post.status === 'publish' ? 'published' : 'draft',
    }
    return finalizeTarget({ target: 'hubs', legacy: baseLegacy(post), data })
  }

  if (post.postType === 'venue') {
    const root = pilotRootByLegacyId.get(post.legacyId)
    const isPublic = root?.archetype === 'venue.public-detail'
    const type = asObject(post.acf.type)
    const venueType = legacyRef('venue-type', type.venue_type)
    const normalizedConnections = venueConnectionsFromWordPress(post.acf.connections)
    const connectedHubs = normalizedConnections
      .map(({ hub }) => allMapHubs.get(hub.legacyId))
      .filter((value): value is Extract<SourceRecord, { entity: 'map-hub' }> => Boolean(value))
    const data = {
      title: post.title,
      slug: normalizeTrayportSlug(post.slug),
      path: isPublic ? post.path || `/venue/${post.slug}/` : null,
      contentMode: isPublic ? 'page' : 'relationship-only',
      ...venueEditorialDataFromWordPress(post, isPublic),
      layout: [],
      website: venueWebsiteFromWordPress(post.acf.website),
      logo: mediaToken(post.acf.logo),
      venueTypes: venueType ? [venueType] : [],
      assetClasses: [
        ...new Set(connectedHubs.map(({ assetClassLegacyId }) => assetClassLegacyId)),
      ].map((id) => legacyRef('asset-class', id)),
      regions: [...new Set(connectedHubs.map(({ regionLegacyId }) => regionLegacyId))].map((id) =>
        legacyRef('region', id),
      ),
      marketConnections: normalizedConnections,
      _status: post.status === 'publish' ? 'published' : 'draft',
    }
    return finalizeTarget({ target: 'venues', legacy: baseLegacy(post), data })
  }

  return null
}

const termCollection: Record<
  string,
  'article-categories' | 'learning-video-categories' | 'asset-classes' | 'venue-types' | 'regions'
> = {
  category: 'article-categories',
  'lh-category': 'learning-video-categories',
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

const normalizedCustomLinkURL = (value: string): string => {
  try {
    return normalizeMigrationPath(value)
  } catch {
    return value
  }
}

const customLink = (label: string, url: string, newTab = false): Record<string, unknown> | null => {
  const destination = migrationDestination(url)
  return destination
    ? {
        label,
        type: 'custom',
        url: destination,
        newTab,
      }
    : null
}

const optionItemLink = (value: unknown): Record<string, unknown> | null => {
  const item = asObject(value)
  const pageLink = asObject(item.page_link)
  const link = asObject(pageLink.link || item.link)
  const legacyId = Number(link.value)
  const url = asString(link.url || link.value)
  const label = htmlToPlainText(link.title || item.text || link.name)

  if (legacyId === 2233 || /commodities-report/i.test(url)) return null
  if (!label || !url) return null

  if (legacyId === 2207) {
    return customLink(label, '/company/careers/', asString(link.target) === '_blank')
  }

  return customLink(label, url, asString(link.target) === '_blank')
}

const footerIconByLegacyName = {
  'address-card': 'companyProfile',
  buildings: 'offices',
  handshake: 'careers',
  envelope: 'contact',
  'grid-round-4': 'marketMatrix',
  'earth-europe': 'regionEurope',
  'earth-americas': 'regionNorthAmerica',
  'earth-asia': 'regionAsiaPacific',
  'file-pen': 'legalDocument',
} as const

const footerAccentFromColor = (value: unknown): 'cyan' | 'yellow' | 'orange' | 'white' => {
  const color = asString(value).toLowerCase()
  if (color.includes('#00c1d5')) return 'cyan'
  if (color.includes('#f7ea48')) return 'yellow'
  if (color.includes('#ff671f') || color.includes('#ff6021')) return 'orange'
  return 'white'
}

const footerItemFromOption = (value: unknown): Record<string, unknown> | null => {
  const item = asObject(value)
  if (asString(item.acf_fc_layout) !== 'page_link') return null
  const pageLink = asObject(item.page_link)
  const link = optionItemLink(value)
  if (!link) return null

  const legacyIcon = asString(pageLink.icon)
  const icon = footerIconByLegacyName[legacyIcon as keyof typeof footerIconByLegacyName]

  return {
    link,
    ...(icon ? { icon } : {}),
    accent: footerAccentFromColor(pageLink.color),
  }
}

const navigationIconByLegacyName = {
  'people-group': 'people',
  buildings: 'offices',
  'chart-user': 'tradingScreen',
  'chart-network': 'network',
  'diagram-project': 'connections',
  'hexagon-nodes': 'connectivity',
  code: 'code',
  'code-compare': 'compare',
  'chart-waterfall': 'waterfallChart',
  'chart-candlestick': 'candlestickChart',
  'calculator-simple': 'calculator',
  users: 'users',
  'money-bill-trend-up': 'marketAccess',
  'message-quote': 'quote',
  'chart-pie': 'pieChart',
  ballot: 'ballot',
  shield: 'shield',
  lock: 'lock',
  'file-csv': 'csvFile',
  'building-lock': 'buildingSecurity',
  file: 'file',
  'lightbulb-on': 'power',
  'fire-flame': 'gas',
  coins: 'metals',
  seedling: 'climate',
  'fire-flame-simple': 'bulkMarkets',
  'oil-well': 'oil',
  earth: 'world',
  'earth-americas': 'northAmerica',
  'earth-europe': 'europe',
  'earth-asia': 'asiaPacific',
  video: 'video',
  'grid-round-4': 'marketMatrix',
  'map-location-dot': 'map',
  'arrows-spin': 'lifecycle',
  newspaper: 'news',
  'calendar-days': 'calendar',
  'magnifying-glass-chart': 'insight',
  list: 'list',
  envelope: 'email',
  'monitor-waveform': 'demo',
} as const

const navigationAccentFromColor = (
  value: unknown,
): 'blue' | 'cyan' | 'green' | 'yellow' | 'orange' | undefined => {
  const color = asString(value).toLowerCase()
  if (color.includes('#00c1d5')) return 'cyan'
  if (color.includes('#32b77b')) return 'green'
  if (color.includes('#f7ea48')) return 'yellow'
  if (color.includes('#ff671f') || color.includes('#ff6021')) return 'orange'
  if (color.includes('#009cde') || color.includes('#52afde')) return 'blue'
}

const navigationItemFromOption = (value: unknown): Record<string, unknown> | null => {
  const item = asObject(value)
  const pageLink = asObject(item.page_link)
  const linked = optionItemLink(value)
  if (!linked) return null

  const { label, ...link } = linked
  const legacyIcon = asString(pageLink.icon || item.icon).trim()
  const icon = navigationIconByLegacyName[legacyIcon as keyof typeof navigationIconByLegacyName]
  const kind = asString(item.acf_fc_layout) === 'menu_feature' ? 'feature' : 'link'
  const sourceDescription = htmlToPlainText(item.text)
  const media = kind === 'feature' ? mediaToken(item.image) : null

  return {
    kind,
    label,
    link,
    ...(sourceDescription && sourceDescription !== label ? { description: sourceDescription } : {}),
    ...(icon ? { icon } : {}),
    ...(navigationAccentFromColor(pageLink.color)
      ? { accent: navigationAccentFromColor(pageLink.color) }
      : kind === 'feature'
        ? { accent: 'blue' }
        : {}),
    ...(media ? { media } : {}),
  }
}

const navigationGroupFromOption = (value: unknown): Record<string, unknown> | null => {
  const block = asObject(value)
  const sourceItems = asArray(block.menu_items)
  const section = sourceItems
    .map(asObject)
    .find((item) => asString(item.acf_fc_layout) === 'menu_section_title')
  const sectionLink = asObject(section?.link)
  const items = sourceItems
    .filter((item) => asString(asObject(item).acf_fc_layout) !== 'menu_section_title')
    .map(navigationItemFromOption)
    .filter((item): item is Record<string, unknown> => Boolean(item))

  if (!items.length) return null

  const featureGroup = items.every(({ kind }) => kind === 'feature')
  const title = featureGroup
    ? ''
    : htmlToPlainText(section?.title || sectionLink.title || sectionLink.name)
  const linkedTitle = sectionLink.url ? optionItemLink({ page_link: { link: sectionLink } }) : null
  const titleLink = linkedTitle
    ? Object.fromEntries(Object.entries(linkedTitle).filter(([key]) => key !== 'label'))
    : null
  const sourceSpan = asString(block.acfe_layout_col)
  const span = ['2', '3', '4', '6'].includes(sourceSpan) ? sourceSpan : 'auto'

  return {
    ...(title ? { title } : {}),
    ...(titleLink ? { titleLink } : {}),
    span,
    items,
  }
}

export const navigationFromOptions = (
  options: Extract<SourceRecord, { entity: 'options' }> | undefined,
): Record<string, unknown> => {
  const dropdowns = asArray(options?.values.dropdown)
  const primaryItems = dropdowns.map((value) => {
    const dropdown = asObject(value)
    const title = htmlToPlainText(dropdown.title)
    const groups = asArray(dropdown.menu_block)
      .map(navigationGroupFromOption)
      .filter((group): group is Record<string, unknown> => Boolean(group))
    const children = groups.flatMap((group) =>
      asArray(group.items).map((value) => {
        const item = asObject(value)
        return {
          label: item.label,
          description: item.description,
          link: item.link,
        }
      }),
    )
    const rootURL =
      asString(dropdown.for_page) ||
      (title ? `/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/` : '/')
    const rootDestination = migrationDestination(rootURL)
    const rootLink = rootDestination
      ? {
          type: 'custom',
          url: rootDestination,
          newTab: false,
        }
      : null

    return {
      label: title,
      ...(rootLink ? { link: rootLink } : {}),
      groups,
      children,
    }
  })

  return {
    primaryItems,
    utilityItems: [
      { label: 'See Joule', url: '/products/joule/', icon: 'playCircle' },
      { label: 'Request A Demo', url: '/request-a-demo/', icon: 'calendar' },
      { label: 'Contact Us', url: '/contact/', icon: 'messages' },
    ].flatMap(({ icon, label, url }) => {
      const link = customLink(label, url)
      return link ? [{ link, icon }] : []
    }),
  }
}

export const footerFromOptions = (
  options: Extract<SourceRecord, { entity: 'options' }> | undefined,
): Record<string, unknown> => {
  const footer = asObject(options?.values.footer_new)
  const columns = asArray(footer.menu_block).map((blockValue) => {
    const block = asObject(blockValue)
    const sourceItems = asArray(block.menu_items)
    const section = sourceItems
      .map(asObject)
      .find((item) => asString(item.acf_fc_layout) === 'menu_section_title')
    const sectionLink = asObject(section?.link)
    const title = htmlToPlainText(section?.title || sectionLink.title || sectionLink.name)
    const rawTitleLink = sectionLink.url
      ? optionItemLink({ page_link: { link: sectionLink } })
      : null
    const titleLink = rawTitleLink
      ? Object.fromEntries(Object.entries(rawTitleLink).filter(([key]) => key !== 'label'))
      : null
    const links = sourceItems
      .map(footerItemFromOption)
      .filter((item): item is Record<string, unknown> => Boolean(item))

    return {
      ...(title ? { title } : {}),
      ...(titleLink ? { titleLink } : {}),
      links,
    }
  })
  const legal = asObject(options?.values.legal)
  const address = asString(legal.address)
  const companyNumber = asString(legal.company_number)
  const companyRegistrationText =
    asString(options?.values.footer_company_registration_text) ||
    (companyNumber && address
      ? `Trayport Limited is a private limited company registered in England and Wales (Registered No. ${companyNumber} ) whose registered office is ${address}`
      : '')

  return {
    intro: htmlToMultilinePlainText(legal.disclaimer),
    columns,
    legalLinks: [],
    copyright: 'Copyright © {year} Trayport Limited',
    companyRegistrationText,
    parentCompanyText:
      asString(options?.values.footer_parent_company_text) ||
      'Trayport Holdings Limited is a wholly-owned subsidiary of TMX Group Limited (TMX Group).',
    certificationMarks: [],
  }
}

export const siteSettingsFromOptions = (
  options: Extract<SourceRecord, { entity: 'options' }> | undefined,
): Record<string, unknown> => {
  const legal = asObject(options?.values.legal)
  const cookieNotice = asObject(options?.values.cookie_notice)
  const cookiePolicyPath = asString(cookieNotice.policy_path)
  const normalizedCookiePolicyPath = normalizedCustomLinkURL(cookiePolicyPath)
  const managedCookiePolicy = pilotScope.roots.find(
    (root) => root.targetOwner === 'pages' && root.path === normalizedCookiePolicyPath,
  )

  return {
    siteName: 'Trayport',
    tagline: htmlToPlainText(legal.disclaimer),
    defaultSEO: {
      titleSuffix: ' | Trayport',
      description: 'Trayport connects traders, brokers and exchanges across global energy markets.',
    },
    contact: {
      address: asString(legal.address),
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
    cookieNotice: {
      enabled: asBoolean(cookieNotice.enabled),
      title: htmlToPlainText(cookieNotice.title),
      message: htmlToPlainText(cookieNotice.message),
      ...(managedCookiePolicy
        ? { policyPage: legacyRef('page', managedCookiePolicy.legacyId) }
        : {}),
      policyURL: normalizedCookiePolicyPath,
      policyLinkLabel: htmlToPlainText(cookieNotice.policy_label),
      acceptLabel: htmlToPlainText(cookieNotice.accept_label),
      rejectLabel: htmlToPlainText(cookieNotice.reject_label),
    },
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
  const connections = hub.connections.map((connection) => ({
    hub: legacyRef('hub', connection.hubLegacyId),
    route: connection.route,
    showLineMarker: connection.showLineMarker,
    lineMarkerLabel: connection.lineMarkerLabel,
  }))
  const data = {
    title: hub.title,
    slug: normalizeTrayportSlug(hub.slug),
    contentMode: 'map-only',
    externalDestination: hub.path ? liveSourceURL(hub.path) : null,
    marketDataKey: `hub:${normalizeTrayportSlug(hub.slug)}`,
    marketDataAliases: marketDataAliasesForHub(hub.legacyId, hub.title),
    hubType: hub.hubType,
    assetClasses: assetClass ? [assetClass] : [],
    venueTypes: [],
    regions: region ? [region] : [],
    layout: [],
    showOnMap: hub.showOnMap,
    countryCode: hub.countryCode,
    connectedCountryCodes: hub.connectedCountryCodes.map((code) => ({ code })),
    relatedHubs: hub.connections.map(({ hubLegacyId }) => legacyRef('hub', hubLegacyId)),
    map: {
      locationLabel: firstMarker?.label || hub.title,
      centre: firstMarker?.location,
      zoom: 6,
      markers,
      connections,
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
  assertRunNotAccepted(runId, runDir)
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
  const coreEvents = records.filter(
    (record): record is SourcePost =>
      record.entity === 'post' &&
      record.postType === 'post' &&
      (record.taxonomies.category || []).includes(119),
  )
  const coreEventBySourceSlug = new Map(coreEvents.map((record) => [record.slug, record]))
  const legacyEvents = records.filter(
    (record): record is SourcePost => record.entity === 'post' && record.postType === 'events',
  )
  const legacyEventBySlug = new Map(legacyEvents.map((record) => [record.slug, record]))
  setMigrationOwnedCorpusPaths(ownedPathsFromSource(records))
  const videoPosterByMediaId = new Map<number, number>(
    records
      .filter(
        (record): record is Extract<SourceRecord, { entity: 'reusable' }> =>
          record.entity === 'reusable' && record.postType === 'videos',
      )
      .flatMap((record) => {
        const videoId = referenceId(record.data.video, 'media')
        const posterId = referenceId(record.data.image, 'media')
        return videoId && posterId ? [[videoId, posterId] as const] : []
      }),
  )
  const mapHubs = new Map(
    records
      .filter(
        (record): record is Extract<SourceRecord, { entity: 'map-hub' }> =>
          record.entity === 'map-hub',
      )
      .map((record) => [record.legacyId, record]),
  )
  // Hubs that own a public route arrive as full `post` records. The map-hub pass must not also
  // emit them, or one legacy identity would have two writers and the shallower map-only target
  // would win on load, discarding the hub's page content.
  const hubPostLegacyIds = new Set(
    records.flatMap((record) =>
      record.entity === 'post' && record.postType === 'hub' ? [record.legacyId] : [],
    ),
  )
  const mapRegions = new Map(
    records
      .filter(
        (record): record is Extract<SourceRecord, { entity: 'map-region' }> =>
          record.entity === 'map-region',
      )
      .map((record) => [record.regionLegacyId, record]),
  )
  const managedLinks: ManagedLinkLookup = new Map([
    ...records
      .filter(
        (record): record is Extract<SourceRecord, { entity: 'post' }> => record.entity === 'post',
      )
      .flatMap((record): Array<[number, ManagedLinkTarget]> => {
        const root = pilotRootByLegacyId.get(record.legacyId)
        if (record.postType === 'post' && (record.taxonomies.category || []).includes(119)) {
          return [[record.legacyId, { kind: 'article', relationTo: 'articles' }]]
        }
        if (record.postType === 'events') {
          return [
            [
              record.legacyId,
              {
                kind: 'article',
                legacyId: coreEventBySourceSlug.get(record.slug)?.legacyId || record.legacyId,
                relationTo: 'articles',
              },
            ],
          ]
        }
        if (!root && record.postType === 'page') {
          return [[record.legacyId, { kind: 'page' as const, relationTo: 'pages' as const }]]
        }
        if (!root) return []
        if (root.targetOwner === 'redirects') {
          return [[record.legacyId, { url: root.path }]]
        }
        const target =
          root.targetOwner === 'pages'
            ? { kind: 'page' as const, relationTo: 'pages' as const }
            : root.targetOwner === 'articles'
              ? { kind: 'article' as const, relationTo: 'articles' as const }
              : root.targetOwner === 'hubs'
                ? { kind: 'hub' as const, relationTo: 'hubs' as const }
                : root.targetOwner === 'venues'
                  ? { kind: 'venue' as const, relationTo: 'venues' as const }
                  : root.targetOwner === 'learning-videos'
                    ? { kind: 'learning-video' as const, relationTo: 'learning-videos' as const }
                    : null
        return target ? [[record.legacyId, target]] : []
      }),
    ...[...reusables.values()]
      .filter((record) => record.postType === 'people' && record.status === 'publish')
      .map((record): [number, ManagedLinkTarget] => [
        record.legacyId,
        { kind: 'person', relationTo: 'people' },
      ]),
  ])

  for (const record of records) {
    if (record.entity === 'post') {
      if (record.postType === 'events') {
        if (!coreEventBySourceSlug.has(record.slug)) targets.push(mapLegacyEventPost(record))
        continue
      }
      const target = mapPost(
        record,
        coverage,
        hubConnections,
        mapHubs.get(record.legacyId),
        mapHubs,
        reusables,
        managedLinks,
        record.postType === 'post' ? legacyEventBySlug.get(record.slug) : undefined,
      )
      if (target) targets.push(target)
      continue
    }

    if (record.entity === 'reusable' && record.postType === 'banner') {
      targets.push(mapBannerReusable(record))
      continue
    }

    if (
      record.entity === 'reusable' &&
      record.postType === 'people' &&
      record.status === 'publish'
    ) {
      targets.push(mapPersonReusable(record))
      continue
    }

    if (record.entity === 'reusable' && record.postType === 'office') {
      const address = asObject(record.data.address)
      const data = {
        title: record.title,
        legalName: htmlToPlainText(record.data.name) || record.title,
        addressPrefix: htmlToPlainText(record.data.address_prefix),
        address: htmlToPlainText(address.address),
        city: htmlToPlainText(address.city),
        postcode: htmlToPlainText(address.post_code),
        country: htmlToPlainText(address.country),
        countryCode: htmlToPlainText(address.country_short).toUpperCase(),
        coordinates: {
          latitude: Number(address.lat),
          longitude: Number(address.lng),
        },
        phone: htmlToPlainText(record.data.phone),
        email: htmlToPlainText(record.data.email),
        displayOrder: [4052, 4055, 4056, 4057].indexOf(record.legacyId),
        _status: 'published',
      }
      targets.push(
        finalizeTarget({
          target: 'offices',
          legacy: {
            source: 'wordpress',
            legacyId: record.legacyId,
            originalUrl: sourceURL(record.path),
            modifiedGmt: null,
          },
          data,
        }),
      )
      continue
    }

    if (record.entity === 'reusable' && record.postType === 'lifecycle') {
      targets.push(mapLifecycleReusable(record))
      continue
    }

    if (record.entity === 'map-hub') {
      if (record.legacyId !== 2495 && !hubPostLegacyIds.has(record.legacyId)) {
        targets.push(mapHubTarget(record))
      }
      continue
    }

    if (record.entity === 'media') {
      const posterLegacyId = videoPosterByMediaId.get(record.legacyId)
      const data = {
        title: record.title,
        alt: record.alt || record.title,
        decorative: record.decorative,
        altSource: record.altSource,
        caption: record.caption ? htmlToLexical(record.caption) : undefined,
        externalURL: record.availability === 'unavailable' ? record.url : '',
        sourceFileHash: record.fileHash,
        source: {
          fileSize: record.fileSize,
          fileHash: record.fileHash,
          relativePath: record.relativePath,
          recoveryURL: record.recoveryURL,
          originalURL: record.url,
          mimeType: record.mimeType,
          width: record.width,
          height: record.height,
          availability: record.availability,
          availabilityReason: record.availabilityReason,
          needsAltReview: record.needsAltReview,
        },
        ...(posterLegacyId ? { poster: legacyRef('media', posterLegacyId) } : {}),
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
      const slug = normalizeTrayportSlug(record.slug)
      const mapRegion = record.taxonomy === 'region' ? mapRegions.get(record.legacyId) : undefined
      const data = {
        title: record.name,
        slug,
        description: record.description,
        ...(target === 'regions'
          ? {}
          : { displayOrder: Number(asString(record.acf.display_order)) || 0 }),
        ...(target === 'regions'
          ? {
              code: asString(record.acf.code),
              map: {
                label: mapRegion?.label || record.name,
                centre: mapRegion?.centre || undefined,
                zoom: 4,
                boundary: mapRegion?.boundary || null,
                pointsOfInterest:
                  mapRegion?.pointsOfInterest.map((point) => ({
                    label: point.label || mapRegion.title,
                    popupText: point.popupText,
                    location: {
                      latitude: point.latitude,
                      longitude: point.longitude,
                    },
                  })) || [],
              },
            }
          : {}),
        ...(target === 'asset-classes'
          ? {
              marketDataKey: `asset-class:${slug}`,
              marketDataAliases: [
                { value: `wordpress-asset-class:${record.legacyId}` },
                { value: record.name },
                { value: slug },
              ],
              mapAppearance: {
                color: mapColorFromTerm(record.acf as Record<string, unknown>, slug),
                volumeLabel: asString(record.acf.volume_label),
                priceLabel: asString(record.acf.price_label),
                currency: asString(record.acf.currency),
              },
            }
          : {}),
        ...(target === 'venue-types'
          ? {
              parentVenueType:
                record.parentId > 0 ? legacyRef('venue-type', record.parentId) : null,
              mapLabel: asString(record.acf.map_label) || record.name,
            }
          : {}),
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

  for (const legacyEvent of legacyEvents) {
    const canonicalOwner = coreEventBySourceSlug.get(legacyEvent.slug) || legacyEvent
    targets.push(
      finalizeTarget({
        target: 'redirects',
        legacy: baseLegacy(legacyEvent),
        data: {
          from: `/events/${normalizeTrayportSlug(legacyEvent.slug)}/`,
          to: {
            type: 'reference',
            reference: {
              relationTo: 'articles',
              value: legacyRef('article', canonicalOwner.legacyId),
            },
          },
          type: '301',
        },
      }),
    )
  }

  const tradingInJoule = records.find(
    (record): record is SourcePost =>
      record.entity === 'post' &&
      record.postType === 'learning-hub-video' &&
      record.legacyId === tradingInJouleLegacyAlias.legacyId,
  )
  if (tradingInJoule) {
    targets.push(
      finalizeTarget({
        target: 'redirects',
        legacy: baseLegacy(tradingInJoule),
        data: {
          from: tradingInJouleLegacyAlias.from,
          to: {
            type: 'reference',
            reference: {
              relationTo: 'learning-videos',
              value: legacyRef('learning-video', tradingInJoule.legacyId),
            },
          },
          type: '301',
        },
      }),
    )
  }

  const requestDemo = records.find(
    (record): record is SourcePost =>
      record.entity === 'post' &&
      record.postType === 'page' &&
      record.legacyId === requestDemoTemporaryRedirect.legacyId,
  )
  if (requestDemo) {
    targets.push(
      finalizeTarget({
        target: 'redirects',
        legacy: baseLegacy(requestDemo),
        data: {
          from: requestDemoTemporaryRedirect.from,
          to: {
            type: 'reference',
            reference: {
              relationTo: 'pages',
              value: legacyRef('page', requestDemoTemporaryRedirect.toLegacyId),
            },
          },
          type: requestDemoTemporaryRedirect.type,
        },
      }),
    )
  }

  const options = records.find(
    (record): record is Extract<SourceRecord, { entity: 'options' }> => record.entity === 'options',
  )
  const settingsData = siteSettingsFromOptions(options)
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

  atomicWriteText(
    path.join(runDir, 'transformed.ndjson'),
    `${targets.map((target) => JSON.stringify(target)).join('\n')}\n`,
  )
  atomicWriteText(
    path.join(runDir, 'market-volume.ndjson'),
    `${marketRows.map((row) => JSON.stringify(row)).join('\n')}\n`,
  )
  atomicWriteText(
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
  atomicWriteText(
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

  validateSource(runId, runDir, records)
  validateTransformed(runId, runDir, targets)
  const accepted = sealAcceptedRun(runId, runDir)

  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        runId,
        acceptanceHash: accepted.acceptanceHash,
        targetCount: targets.length,
        coverage,
      },
      null,
      2,
    )}\n`,
  )
  return { runId, targets }
}
