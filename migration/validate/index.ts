import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { sourceRecordSchema, type SourceRecord } from '../contracts/v1'
import {
  acceptedRunMarkerName,
  atomicWriteText,
  sealAcceptedRun,
  verifyAcceptedRun,
} from '../lib/acceptedRun'
import { migrationConfig } from '../lib/config'
import { pilotScope } from '../scopes/pilot'
import type { LegacyReference, TargetCollection, TargetRecord } from '../transform/types'

type AcceptanceReport = {
  checks: Record<string, number | string | boolean>
  ok: true
  runId: string
}

const countBy = <T>(values: T[], key: (value: T) => string): Record<string, number> => {
  const counts: Record<string, number> = {}
  for (const value of values) {
    const name = key(value)
    counts[name] = (counts[name] || 0) + 1
  }
  return counts
}

const sortedNumbers = (values: number[]): number[] => [...values].sort((a, b) => a - b)

const objectValue = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const arrayValue = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const referenceID = (value: unknown, expectedKind?: string): number | null => {
  const reference = objectValue(value)
  if (expectedKind && reference.$ref !== expectedKind && reference.$legacyRef !== expectedKind) {
    return null
  }
  return typeof reference.id === 'number'
    ? reference.id
    : typeof reference.legacyId === 'number'
      ? reference.legacyId
      : null
}

const targetForReferenceKind: Record<LegacyReference['$legacyRef'], TargetCollection> = {
  media: 'media',
  page: 'pages',
  article: 'articles',
  hub: 'hubs',
  venue: 'venues',
  'learning-video': 'learning-videos',
  office: 'offices',
  'article-category': 'article-categories',
  'learning-video-category': 'learning-video-categories',
  'asset-class': 'asset-classes',
  'venue-type': 'venue-types',
  region: 'regions',
}

const collectLegacyReferences = (
  value: unknown,
  references: LegacyReference[],
  valuePath = 'data',
): void => {
  if (Array.isArray(value)) {
    value.forEach((child, index) =>
      collectLegacyReferences(child, references, `${valuePath}.${index}`),
    )
    return
  }
  if (!value || typeof value !== 'object') return

  const object = value as Record<string, unknown>
  if (Object.hasOwn(object, '$legacyRef')) {
    assert(
      typeof object.$legacyRef === 'string' &&
        Object.hasOwn(targetForReferenceKind, object.$legacyRef) &&
        typeof object.legacyId === 'number' &&
        Number.isInteger(object.legacyId) &&
        object.legacyId >= 0,
      `Invalid legacy reference at ${valuePath}`,
    )
    references.push(object as LegacyReference)
    return
  }

  for (const [key, child] of Object.entries(object)) {
    collectLegacyReferences(child, references, `${valuePath}.${key}`)
  }
}

export const assertTransformedReferenceClosure = (
  targets: TargetRecord[],
): { legacyReferences: number; uniqueTargetIdentities: number } => {
  const targetIdentities = targets.map((target) => {
    if (target.target === 'global') return `global:${target.globalSlug || ''}`
    if (target.target === 'redirects') return `redirect:${String(target.data.from || '')}`
    return `${target.target}:${target.legacy.source}:${target.legacy.legacyId}`
  })
  const duplicateIdentity = targetIdentities.find(
    (identity, index) => targetIdentities.indexOf(identity) !== index,
  )
  assert(!duplicateIdentity, `Duplicate transformed target identity: ${duplicateIdentity}`)

  const collectionIdentities = new Set(
    targets
      .filter(
        (target): target is TargetRecord & { target: TargetCollection } =>
          target.target !== 'global' && target.target !== 'redirects',
      )
      .map((target) => `${target.target}:${target.legacy.legacyId}`),
  )
  const legacyReferences: LegacyReference[] = []
  for (const target of targets) {
    collectLegacyReferences(
      target.data,
      legacyReferences,
      `${target.target}:${target.legacy.legacyId}`,
    )
  }
  for (const reference of legacyReferences) {
    const target = targetForReferenceKind[reference.$legacyRef]
    assert(
      collectionIdentities.has(`${target}:${reference.legacyId}`),
      `Unresolved transformed relationship ${reference.$legacyRef}:${reference.legacyId}`,
    )
  }

  return {
    legacyReferences: legacyReferences.length,
    uniqueTargetIdentities: targetIdentities.length,
  }
}

const readSourceRecords = (runDir: string): SourceRecord[] =>
  fs
    .readFileSync(path.join(runDir, 'source.ndjson'), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => sourceRecordSchema.parse(JSON.parse(line)))

export const validateSource = (
  runId: string,
  runDir: string,
  records: SourceRecord[],
): AcceptanceReport => {
  const manifest = records.find(
    (record): record is Extract<SourceRecord, { entity: 'manifest' }> =>
      record.entity === 'manifest',
  )
  const posts = records.filter(
    (record): record is Extract<SourceRecord, { entity: 'post' }> => record.entity === 'post',
  )
  const media = records.filter(
    (record): record is Extract<SourceRecord, { entity: 'media' }> => record.entity === 'media',
  )
  const mapHubs = records.filter(
    (record): record is Extract<SourceRecord, { entity: 'map-hub' }> => record.entity === 'map-hub',
  )
  const marketRows = records.filter(
    (record): record is Extract<SourceRecord, { entity: 'market-volume' }> =>
      record.entity === 'market-volume',
  )
  const reusables = records.filter(
    (record): record is Extract<SourceRecord, { entity: 'reusable' }> =>
      record.entity === 'reusable',
  )
  const options = records.find(
    (record): record is Extract<SourceRecord, { entity: 'options' }> => record.entity === 'options',
  )
  const connections = records.find(
    (record): record is Extract<SourceRecord, { entity: 'hub-connections' }> =>
      record.entity === 'hub-connections',
  )
  const warnings = records.filter(
    (record): record is Extract<SourceRecord, { entity: 'warning' }> => record.entity === 'warning',
  )
  const terms = records.filter(
    (record): record is Extract<SourceRecord, { entity: 'term' }> => record.entity === 'term',
  )

  assert(manifest, 'Missing pilot source manifest')
  assert.deepEqual(
    manifest.rootIds,
    pilotScope.roots.map(({ legacyId }) => legacyId),
    'The exporter must receive the exact ordered pilot root set.',
  )

  const roots = posts.filter(({ scopeRole }) => scopeRole === 'root')
  assert.equal(roots.length, 14)
  assert.equal(new Set(roots.map(({ legacyId }) => legacyId)).size, 14)
  for (const expectedRoot of pilotScope.roots) {
    const root = roots.find(({ legacyId }) => legacyId === expectedRoot.legacyId)
    assert(root, `Missing agreed root ${expectedRoot.legacyId}`)
    assert.equal(root.postType, expectedRoot.postType)
    assert.equal(root.status, 'publish')
    assert.equal(root.path, expectedRoot.path, `Unexpected path for root ${expectedRoot.legacyId}`)
  }

  const pageSectionCounts: Record<number, number> = {
    1898: 9,
    1924: 9,
    1926: 7,
    2203: 8,
    2205: 2,
    3311: 2,
    7609: 2,
    9244: 1,
    9248: 1,
  }
  for (const [legacyIdText, expected] of Object.entries(pageSectionCounts)) {
    const post = posts.find(({ legacyId }) => legacyId === Number(legacyIdText))
    assert(post)
    assert.equal(
      Array.isArray(post.acf.sections_new) ? post.acf.sections_new.length : 0,
      expected,
      `Unexpected sections_new count for ${legacyIdText}`,
    )
  }
  assert.equal(Object.keys(pageSectionCounts).length, 9)
  for (const [legacyId, expectedSections] of [
    [9351, 9],
    [10030, 5],
  ] as const) {
    const articleRoot = roots.find((post) => post.legacyId === legacyId)
    assert(articleRoot)
    assert.equal(
      Array.isArray(articleRoot.acf.sections) ? articleRoot.acf.sections.length : 0,
      expectedSections,
    )
  }

  const articles = posts.filter(({ postType }) => postType === 'post')
  assert.equal(articles.length, 71)
  assert.equal(articles.filter(({ scopeRole }) => scopeRole === 'insights-listing').length, 38)
  assert.equal(articles.filter(({ scopeRole }) => scopeRole === 'news-listing').length, 31)
  assert.equal(articles.filter(({ scopeRole }) => scopeRole === 'root').length, 2)
  assert.equal(articles.filter(({ taxonomies }) => taxonomies.category?.includes(120)).length, 39)
  assert.equal(articles.filter(({ taxonomies }) => taxonomies.category?.includes(111)).length, 31)
  assert.equal(articles.filter(({ taxonomies }) => taxonomies.category?.includes(119)).length, 1)

  const featuredInsights = articles
    .filter(({ taxonomies }) => taxonomies.category?.includes(120))
    .filter(({ acf }) => acf.featured === true || acf.featured === 1 || acf.featured === '1')
    .sort((left, right) => (left.featuredOrder ?? 99) - (right.featuredOrder ?? 99))
  assert.deepEqual(
    featuredInsights.map(({ legacyId }) => legacyId),
    [11694, 11553, 11203, 10790],
  )
  assert.deepEqual(
    featuredInsights.map(({ featuredOrder }) => featuredOrder),
    [0, 1, 2, 3],
  )
  assert.deepEqual(
    articles
      .filter(({ taxonomies }) => taxonomies.category?.includes(111))
      .filter(({ acf }) => acf.featured === true || acf.featured === 1 || acf.featured === '1')
      .map(({ legacyId }) => legacyId),
    [10763],
  )

  const learningVideos = posts.filter(({ postType }) => postType === 'learning-hub-video')
  assert.equal(learningVideos.length, 15)
  assert.equal(learningVideos.filter(({ scopeRole }) => scopeRole === 'root').length, 1)
  assert.equal(
    learningVideos.filter(({ scopeRole }) => scopeRole === 'learning-listing').length,
    14,
  )
  assert(
    learningVideos.every(
      ({ acf }) => !Object.hasOwn(acf, 'video') && !Object.hasOwn(acf, 'caption_file'),
    ),
    'Protected learning-video binaries and captions must not enter the pilot source graph.',
  )
  const learningDetail = learningVideos.find(({ legacyId }) => legacyId === 8454)
  assert(learningDetail)
  assert.equal(learningDetail.acf.permissions, '1')

  const eex = roots.find(({ legacyId }) => legacyId === 3363)
  assert(eex)
  const eexConnectionIDs = arrayValue(eex.acf.connections).map((value) =>
    referenceID(objectValue(value).hub, 'post'),
  )
  assert.equal(eexConnectionIDs.length, 38)
  assert(eexConnectionIDs.every((legacyId) => legacyId !== null))
  assert.equal(new Set(eexConnectionIDs).size, 37)

  assert(connections)
  assert.equal(connections.connections.length, 21)
  assert.deepEqual(
    countBy(connections.connections, ({ connectionType }) => connectionType),
    {
      a: 2,
      b: 9,
      d: 10,
    },
  )
  assert.deepEqual(
    countBy(connections.connections, ({ venueTypeLegacyId }) => String(venueTypeLegacyId)),
    { 41: 11, 42: 7, 43: 3 },
  )
  assert.equal(connections.connections.filter(({ supportsJoule }) => supportsJoule).length, 19)
  assert.equal(
    connections.connections.filter(({ supportsAutoTrader }) => supportsAutoTrader).length,
    11,
  )

  assert.equal(mapHubs.length, 55)
  assert.equal(
    mapHubs.reduce((total, hub) => total + hub.markers.length, 0),
    58,
  )
  assert.deepEqual(
    sortedNumbers(
      mapHubs.filter(({ markers }) => markers.length === 0).map(({ legacyId }) => legacyId),
    ),
    [3332, 3336, 10565, 10752],
  )

  assert.equal(marketRows.length, 1194)
  assert.equal(marketRows.filter(({ assetClassLegacyId }) => assetClassLegacyId === 21).length, 595)
  assert.equal(marketRows.filter(({ assetClassLegacyId }) => assetClassLegacyId === 22).length, 599)
  assert.equal(new Set(marketRows.map(({ hubLegacyId }) => hubLegacyId)).size, 22)
  assert.equal(
    new Set(
      marketRows.map(
        ({ assetClassLegacyId, hubLegacyId, year, month }) =>
          `${assetClassLegacyId}:${hubLegacyId}:${year}:${month}`,
      ),
    ).size,
    1194,
    'Market rows must have unique composite keys',
  )

  assert(media.length > 0)
  assert.equal(new Set(media.map(({ legacyId }) => legacyId)).size, media.length)
  assert(!media.some(({ legacyId }) => legacyId === 8455), 'Protected media 8455 was exported')
  for (const asset of media) {
    if (asset.availability === 'local') {
      assert(asset.relativePath, `Local media ${asset.legacyId} is missing its relative path`)
      assert.match(
        asset.fileHash || '',
        /^[a-f0-9]{64}$/,
        `Local media ${asset.legacyId} is missing its SHA-256 fingerprint`,
      )
      assert.equal(asset.availabilityReason, null)
    } else {
      assert.equal(
        asset.fileHash,
        null,
        `Unavailable media ${asset.legacyId} must not claim a source-file fingerprint`,
      )
    }
  }

  const offices = reusables.filter(({ postType }) => postType === 'office')
  assert.deepEqual(sortedNumbers(offices.map(({ legacyId }) => legacyId)), [4052, 4055, 4056, 4057])

  const articleCategories = terms.filter(({ taxonomy }) => taxonomy === 'category')
  assert.deepEqual(
    sortedNumbers(articleCategories.map(({ legacyId }) => legacyId)),
    [111, 119, 120],
  )
  const learningCategories = terms.filter(({ taxonomy }) => taxonomy === 'lh-category')
  assert.deepEqual(
    sortedNumbers(learningCategories.map(({ legacyId }) => legacyId)),
    [85, 86, 121, 122, 123, 124, 125, 127, 128, 131, 132],
  )

  assert(options)
  assert.equal(Array.isArray(options.values.dropdown) ? options.values.dropdown.length : 0, 5)
  const footer = options.values.footer_new
  assert(footer && typeof footer === 'object' && !Array.isArray(footer))
  const footerObject = footer as Record<string, unknown>
  assert.equal(Array.isArray(footerObject.menu_block) ? footerObject.menu_block.length : 0, 3)
  assert(
    !records.some(({ entity }) => entity === 'menu'),
    'Classic WordPress menu must not be exported',
  )
  assert(warnings.some(({ code, legacyId }) => code === 'curated-exclusion' && legacyId === 2233))
  assert(warnings.some(({ code, legacyId }) => code === 'stale-private-link' && legacyId === 2207))
  const deferredForms = warnings
    .filter(({ code }) => code === 'deferred-hubspot-form')
    .map(({ legacyId, sourcePath }) => ({ legacyId, sourcePath }))
    .sort((left, right) => (left.sourcePath || '').localeCompare(right.sourcePath || ''))
  assert.deepEqual(deferredForms, [
    { legacyId: 1926, sourcePath: 'pages.1926.sections_new' },
    { legacyId: 10030, sourcePath: 'posts.10030.sections.2' },
    { legacyId: 10030, sourcePath: 'posts.10030.sections.4' },
  ])
  assert.deepEqual(
    warnings
      .filter(({ code }) => code === 'protected-learning-media')
      .map(({ legacyId }) => legacyId),
    [8454],
  )

  const serialized = JSON.stringify(records)
  assert(!/AIza[0-9A-Za-z_-]{20,}/.test(serialized), 'Google API key leaked into source export')
  assert(
    !/"(?:api[_-]?key|password|secret|token)"\s*:/i.test(serialized),
    'Secret-shaped key leaked',
  )

  const report: AcceptanceReport = {
    ok: true,
    runId,
    checks: {
      roots: 14,
      pages: 9,
      articles: 71,
      insightsArticles: 39,
      newsArticles: 31,
      eventArticles: 1,
      featuredInsights: 4,
      learningVideos: 15,
      learningListingVideos: 14,
      offices: 4,
      articleCategories: 3,
      learningVideoCategories: 11,
      eexConnections: 37,
      connectedVenues: 21,
      mapHubs: 55,
      mapMarkers: 58,
      marketRows: 1194,
      media: media.length,
      fingerprintedMedia: media.filter(({ fileHash }) => fileHash !== null).length,
      unavailableMedia: media.filter(({ availability }) => availability === 'unavailable').length,
      altTextReview: media.filter(({ needsAltReview }) => needsAltReview).length,
      reusables: reusables.length,
      deferredHubSpotForms: 3,
      protectedVideoExcluded: true,
      activeNavigationRoots: 5,
      footerColumns: 3,
    },
  }
  atomicWriteText(
    path.join(runDir, 'reports', 'acceptance-source.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  )
  return report
}

export const validateTransformed = (
  runId: string,
  runDir: string,
  targets: TargetRecord[],
): AcceptanceReport => {
  const sourceRecords = readSourceRecords(runDir)
  const sourceMedia = sourceRecords.filter(
    (record): record is Extract<SourceRecord, { entity: 'media' }> => record.entity === 'media',
  )
  const counts = countBy(targets, ({ target }) => target)
  assert.deepEqual(counts, {
    pages: 9,
    articles: 71,
    hubs: 55,
    venues: 21,
    'learning-videos': 15,
    offices: 4,
    'article-categories': 3,
    'learning-video-categories': 11,
    'asset-classes': 4,
    'venue-types': 3,
    regions: 4,
    media: sourceMedia.length,
    redirects: 1,
    global: 3,
  })

  const targetGraph = assertTransformedReferenceClosure(targets)

  const serializedTargets = JSON.stringify(targets)
  assert(
    !serializedTargets.includes('"link":null'),
    'Optional managed-link groups must be omitted instead of serialized as null.',
  )
  assert(
    !/"icon":"(?:|arrow-trend-up)"/.test(serializedTargets),
    'Legacy feature icons must be omitted or normalized to the controlled target values.',
  )

  const layoutCount = (target: 'pages' | 'articles', legacyId: number): number => {
    const record = targets.find(
      (candidate) => candidate.target === target && candidate.legacy.legacyId === legacyId,
    )
    assert(record, `Missing transformed ${target}:${legacyId}`)
    return Array.isArray(record.data.layout) ? record.data.layout.length : 0
  }
  assert.equal(layoutCount('pages', 1898), 9)
  assert.equal(layoutCount('pages', 2203), 8)
  assert.equal(layoutCount('pages', 1924), 9)
  assert.equal(layoutCount('pages', 9248), 2)
  assert.equal(layoutCount('articles', 9351), 9)
  assert.equal(layoutCount('articles', 10030), 3)

  const transformCoverage = JSON.parse(
    fs.readFileSync(path.join(runDir, 'reports', 'transform-coverage.json'), 'utf8'),
  ) as {
    coverage?: {
      ignoredComponentLayouts?: Record<string, { count?: number; reason?: string }>
    }
  }
  assert.equal(transformCoverage.coverage?.ignoredComponentLayouts?.form?.count, 3)
  assert.match(
    transformCoverage.coverage?.ignoredComponentLayouts?.form?.reason || '',
    /HubSpot forms are explicitly deferred/i,
  )

  const articles = targets.filter(({ target }) => target === 'articles')
  const fullArticles = articles.filter(({ data }) => data.contentMode === 'full')
  const listingArticles = articles.filter(({ data }) => data.contentMode === 'listing')
  assert.equal(fullArticles.length, 2)
  assert.equal(listingArticles.length, 69)
  assert.deepEqual(sortedNumbers(fullArticles.map(({ legacy }) => legacy.legacyId)), [9351, 10030])
  assert.deepEqual(fullArticles.map(({ data }) => data.path).sort(), [
    '/event/e-world-2026/',
    '/insights/on-demand-webinar-data-analytics-for-energy-traders/',
  ])
  assert(
    listingArticles.every(
      ({ data }) =>
        data.path === null &&
        Array.isArray(data.layout) &&
        data.layout.length === 0 &&
        typeof data.externalDestination === 'string' &&
        data.externalDestination.startsWith('https://www.trayport.com/') &&
        data.externalDestination !== 'https://www.trayport.com/',
    ),
    'Listing-only articles must be non-routable and retain their live-site destination.',
  )
  assert.deepEqual(
    countBy(articles, ({ data }) => String(data.articleType)),
    {
      event: 1,
      insight: 38,
      news: 31,
      webinar: 1,
    },
  )
  assert.deepEqual(
    articles
      .filter(({ data }) => data.articleType === 'news' && data.featured === true)
      .map(({ legacy }) => legacy.legacyId),
    [10763],
  )
  const articleCategoryIDs = (article: TargetRecord): number[] =>
    arrayValue(article.data.categories)
      .map((category) => referenceID(category, 'article-category'))
      .filter((legacyId): legacyId is number => legacyId !== null)
  assert.equal(articles.filter((article) => articleCategoryIDs(article).includes(120)).length, 39)
  assert.equal(articles.filter((article) => articleCategoryIDs(article).includes(111)).length, 31)
  assert.equal(articles.filter((article) => articleCategoryIDs(article).includes(119)).length, 1)

  const german = targets.find(({ target, legacy }) => target === 'hubs' && legacy.legacyId === 2495)
  assert(german)
  assert.equal(Array.isArray(german.data.connections) ? german.data.connections.length : 0, 21)
  const map = german.data.map as { markers?: unknown[] } | undefined
  assert.equal(map?.markers?.length, 1)
  for (const hub of targets.filter(({ target }) => target === 'hubs')) {
    const hubMap = hub.data.map as
      | {
          centre?: unknown
          markers?: Array<{ location?: unknown }>
        }
      | undefined
    if (hubMap?.centre) assert(!Array.isArray(hubMap.centre))
    for (const marker of hubMap?.markers || []) assert(!Array.isArray(marker.location))
  }
  const home = targets.find(({ target, legacy }) => target === 'pages' && legacy.legacyId === 1898)
  assert(home)
  assert.equal(home.data.pageType, 'homepage')
  assert(!/"@type":"SearchAction"/.test(JSON.stringify(home.data.meta)))
  const joule = targets.find(({ target, legacy }) => target === 'pages' && legacy.legacyId === 1924)
  assert(joule)
  for (const page of [home, joule]) {
    const hero = (page.data.layout as Array<Record<string, unknown>>).find(
      ({ blockType }) => blockType === 'trayportHero',
    )
    assert(hero, `Missing hero for ${page.data.path}`)
    assert.deepEqual(hero.media, { $legacyRef: 'media', legacyId: 3990 })
    assert.equal(hero.externalVideoURL, '')
  }

  const targetMedia = targets.filter(({ target }) => target === 'media')
  assert.equal(new Set(targetMedia.map(({ legacy }) => legacy.legacyId)).size, targetMedia.length)
  const targetMediaByLegacyID = new Map(
    targetMedia.map((record) => [record.legacy.legacyId, record] as const),
  )
  for (const source of sourceMedia) {
    const target = targetMediaByLegacyID.get(source.legacyId)
    assert(target, `Missing transformed media:${source.legacyId}`)
    const targetSource = objectValue(target.data.source)
    assert.equal(targetSource.mimeType, source.mimeType)
    assert.equal(targetSource.fileHash, source.fileHash)
    assert.equal(targetSource.relativePath, source.relativePath)
    assert.equal(targetSource.originalURL, source.url)
    assert.equal(targetSource.availability, source.availability)
    assert.equal(targetSource.availabilityReason, source.availabilityReason)
    assert.equal(target.data.sourceFileHash, source.fileHash)
  }
  assert(!targetMediaByLegacyID.has(8455), 'Protected media 8455 was transformed')

  const unavailableMedia = targetMedia.filter(({ data }) => {
    const source = data.source as { availability?: string; originalURL?: string | null } | undefined
    return source?.availability === 'unavailable'
  })
  assert(
    unavailableMedia.every(({ data }) => {
      const source = data.source as { originalURL?: string | null }
      return data.externalURL === source.originalURL
    }),
  )

  const offices = targets.filter(({ target }) => target === 'offices')
  assert.deepEqual(
    sortedNumbers(offices.map(({ legacy }) => legacy.legacyId)),
    [4052, 4055, 4056, 4057],
  )

  const venues = targets.filter(({ target }) => target === 'venues')
  const eex = venues.find(({ legacy }) => legacy.legacyId === 3363)
  assert(eex)
  assert.equal(eex.data.contentMode, 'page')
  assert.equal(eex.data.path, '/venue/eex/')
  const eexHubIDs = arrayValue(eex.data.marketConnections)
    .map((connection) => referenceID(objectValue(connection).hub, 'hub'))
    .filter((legacyId): legacyId is number => legacyId !== null)
  assert.equal(eexHubIDs.length, 37)
  assert.equal(new Set(eexHubIDs).size, 37)
  const targetHubIDs = new Set(
    targets.filter(({ target }) => target === 'hubs').map(({ legacy }) => legacy.legacyId),
  )
  assert(eexHubIDs.every((legacyId) => targetHubIDs.has(legacyId)))
  assert(
    venues
      .filter(({ legacy }) => legacy.legacyId !== 3363)
      .every(({ data }) => data.contentMode === 'relationship-only' && data.path === null),
    'Only EEX may become a public venue in the pilot.',
  )

  const learningVideos = targets.filter(({ target }) => target === 'learning-videos')
  const learningDetail = learningVideos.find(({ legacy }) => legacy.legacyId === 8454)
  assert(learningDetail)
  assert.equal(learningDetail.data.contentMode, 'full')
  assert.equal(learningDetail.data.accessMode, 'subscriber')
  assert.equal(learningDetail.data.path, '/learning-hub-video/trading-in-joule/')
  assert.equal(learningDetail.data.video, null)
  assert.equal(learningDetail.data.externalVideoURL, '')
  assert.deepEqual(learningDetail.data.poster, { $legacyRef: 'media', legacyId: 11728 })
  const learningListings = learningVideos.filter(({ data }) => data.contentMode === 'listing')
  assert.equal(learningListings.length, 14)
  assert(
    learningListings.every(
      ({ data }) =>
        data.path === null &&
        data.video === null &&
        data.externalVideoURL === '' &&
        typeof data.externalDestination === 'string' &&
        data.externalDestination.startsWith('https://www.trayport.com/learning-hub/watch/'),
    ),
    'Learning listing records must remain gated, non-routable metadata.',
  )

  const redirects = targets.filter(({ target }) => target === 'redirects')
  assert.equal(redirects.length, 1)
  const tradingInJouleAlias = redirects[0]
  assert(tradingInJouleAlias)
  assert.equal(tradingInJouleAlias.legacy.legacyId, 8454)
  assert.equal(tradingInJouleAlias.data.from, '/learning-hub/watch/trading-in-joule/')
  assert.equal(tradingInJouleAlias.data.type, '301')
  const redirectTo = objectValue(tradingInJouleAlias.data.to)
  const redirectReference = objectValue(redirectTo.reference)
  assert.equal(redirectTo.type, 'reference')
  assert.equal(redirectReference.relationTo, 'learning-videos')
  assert.equal(referenceID(redirectReference.value, 'learning-video'), 8454)
  assert(!Object.hasOwn(tradingInJouleAlias.data, 'path'))

  const expectedDiscriminators: Record<number, [field: string, value: string]> = {
    1898: ['pageType', 'homepage'],
    1924: ['pageType', 'product'],
    1926: ['pageType', 'product'],
    2203: ['pageType', 'standard'],
    2205: ['pageType', 'standard'],
    2495: ['contentMode', 'page'],
    3311: ['pageType', 'index'],
    3363: ['contentMode', 'page'],
    7609: ['pageType', 'standard'],
    8454: ['contentMode', 'full'],
    9244: ['pageType', 'index'],
    9248: ['pageType', 'index'],
    9351: ['contentMode', 'full'],
    10030: ['contentMode', 'full'],
  }
  for (const root of pilotScope.roots) {
    const owners = targets.filter(
      ({ legacy, target }) => legacy.legacyId === root.legacyId && target === root.targetOwner,
    )
    assert.equal(owners.length, 1, `Expected one ${root.targetOwner} owner for ${root.legacyId}`)
    const owner = owners[0]
    assert(owner)
    assert.equal(owner.data.path, root.path)
    assert.equal(owner.data._status, 'published')
    const discriminator = expectedDiscriminators[root.legacyId]
    assert(discriminator)
    assert.equal(owner.data[discriminator[0]], discriminator[1])
  }

  const routablePaths = targets
    .map(({ data }) => data.path)
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .sort()
  assert.deepEqual(
    routablePaths,
    pilotScope.roots.map(({ path }) => path).sort(),
    'Only the 14 agreed pilot documents may own public paths.',
  )
  assert.equal(new Set(routablePaths).size, routablePaths.length)

  const insightsIndex = targets.find(
    ({ legacy, target }) => target === 'pages' && legacy.legacyId === 9248,
  )
  const newsIndex = targets.find(
    ({ legacy, target }) => target === 'pages' && legacy.legacyId === 9244,
  )
  const learningIndex = targets.find(
    ({ legacy, target }) => target === 'pages' && legacy.legacyId === 3311,
  )
  assert(insightsIndex && newsIndex && learningIndex)
  const listingBlocks = (record: TargetRecord, blockType: string) =>
    arrayValue(record.data.layout)
      .map(objectValue)
      .filter((block) => block.blockType === blockType)
  assert.deepEqual(
    listingBlocks(insightsIndex, 'articleListing').map(({ family }) => family),
    ['insights'],
  )
  assert.deepEqual(
    listingBlocks(newsIndex, 'articleListing').map(({ family }) => family),
    ['news'],
  )
  assert.equal(listingBlocks(learningIndex, 'learningVideoListing').length, 1)

  const navigation = targets.find(
    ({ target, globalSlug }) => target === 'global' && globalSlug === 'navigation',
  )
  const footer = targets.find(
    ({ target, globalSlug }) => target === 'global' && globalSlug === 'footer',
  )
  assert(navigation)
  assert(footer)
  assert.equal(
    Array.isArray(navigation.data.primaryItems) ? navigation.data.primaryItems.length : 0,
    5,
  )
  const resourceNavigation = objectValue(arrayValue(navigation.data.primaryItems)[4])
  assert.deepEqual(
    arrayValue(resourceNavigation.children)
      .map(objectValue)
      .slice(-4)
      .map((item) => objectValue(item.link).url),
    ['/venue/', '/market-coverage/', '/contact/', '/request-a-demo/'],
  )
  assert(!/commodities report|2233/i.test(JSON.stringify(navigation.data)))
  assert.equal(Array.isArray(footer.data.columns) ? footer.data.columns.length : 0, 3)

  const report: AcceptanceReport = {
    ok: true,
    runId,
    checks: {
      targetRecords: targets.length,
      legacyReferences: targetGraph.legacyReferences,
      uniqueTargetIdentities: targetGraph.uniqueTargetIdentities,
      pages: 9,
      articles: 71,
      fullArticles: 2,
      listingArticles: 69,
      hubs: 55,
      venues: 21,
      learningVideos: 15,
      learningListingVideos: 14,
      offices: 4,
      articleCategories: 3,
      learningVideoCategories: 11,
      media: sourceMedia.length,
      fingerprintedMedia: sourceMedia.filter(({ fileHash }) => fileHash !== null).length,
      eexConnections: 37,
      routableDocuments: 14,
      deferredHubSpotForms: 3,
      protectedVideoExcluded: true,
      redirects: 1,
      globals: 3,
      articleBodyBlocks: 12,
      commoditiesReportExcluded: true,
    },
  }
  atomicWriteText(
    path.join(runDir, 'reports', 'acceptance-transform.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  )
  return report
}

export const validateRun = (requestedRunId?: string): void => {
  const runId =
    requestedRunId ||
    fs.readFileSync(path.join(migrationConfig.workDir, 'latest-run.txt'), 'utf8').trim()
  const runDir = path.resolve(migrationConfig.workDir, runId)
  const acceptedMarkerPath = path.join(runDir, 'reports', acceptedRunMarkerName)
  if (fs.existsSync(acceptedMarkerPath)) {
    const accepted = verifyAcceptedRun(runId, runDir)
    const source = JSON.parse(
      fs.readFileSync(path.join(runDir, 'reports', 'acceptance-source.json'), 'utf8'),
    ) as AcceptanceReport
    const transformed = JSON.parse(
      fs.readFileSync(path.join(runDir, 'reports', 'acceptance-transform.json'), 'utf8'),
    ) as AcceptanceReport
    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          runId,
          acceptanceHash: accepted.acceptanceHash,
          source: source.checks,
          transformed: transformed.checks,
        },
        null,
        2,
      )}\n`,
    )
    return
  }
  const records = readSourceRecords(runDir)
  const targets = fs
    .readFileSync(path.join(runDir, 'transformed.ndjson'), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as TargetRecord)

  const source = validateSource(runId, runDir, records)
  const transformed = validateTransformed(runId, runDir, targets)
  const accepted = sealAcceptedRun(runId, runDir)
  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        runId,
        acceptanceHash: accepted.acceptanceHash,
        source: source.checks,
        transformed: transformed.checks,
      },
      null,
      2,
    )}\n`,
  )
}
