import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  sourceLifecycleReusableSchema,
  sourceRecordSchema,
  type SourcePost,
  type SourceRecord,
} from '../contracts/v1'
import {
  acceptedRunMarkerName,
  atomicWriteText,
  sealAcceptedRun,
  verifyAcceptedRun,
} from '../lib/acceptedRun'
import { migrationConfig } from '../lib/config'
import { pilotScope } from '../scopes/pilot'
import type { LegacyReference, TargetCollection, TargetRecord } from '../transform/types'
import { migrationOwnedPaths } from '../transform/url'
import { safeExternalHTTPSURL } from '../../src/routing/urlPolicy'

type AcceptanceReport = {
  checks: Record<string, number | string | boolean>
  ok: true
  runId: string
}

const pilotRootCount = pilotScope.roots.length
const pilotSourcePageCount = pilotScope.roots.filter(({ postType }) => postType === 'page').length
const pilotTargetPageCount = pilotScope.roots.filter(
  ({ targetOwner }) => targetOwner === 'pages',
).length
const expectedNavigationFooterLiveFallbacks = 30

const countBy = <T>(values: T[], key: (value: T) => string): Record<string, number> => {
  const counts: Record<string, number> = {}
  for (const value of values) {
    const name = key(value)
    counts[name] = (counts[name] || 0) + 1
  }
  return counts
}

const sortedNumbers = (values: number[]): number[] => [...values].sort((a, b) => a - b)

const eexMarketSourceOrder = [
  2472, 2519, 2493, 2497, 2494, 2495, 2496, 2498, 8670, 2499, 2500, 2502, 2503, 2505, 2506, 2508,
  2509, 2510, 2511, 2513, 3318, 3321, 3329, 4071, 4522, 2488, 3315, 3320, 3323, 3316, 2471, 3314,
  3332, 3333, 3336, 2490, 6776,
]

const objectValue = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const arrayValue = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

export const containsUnresolvedWordPressShortcode = (value: unknown): boolean => {
  if (typeof value === 'string') return /\[[^\]]+\]/.test(value)
  if (Array.isArray(value)) return value.some(containsUnresolvedWordPressShortcode)
  if (!value || typeof value !== 'object') return false

  return Object.values(value as Record<string, unknown>).some(containsUnresolvedWordPressShortcode)
}

const collectURLFields = (value: unknown, urls: string[]): void => {
  if (Array.isArray(value)) {
    value.forEach((child) => collectURLFields(child, urls))
    return
  }
  if (!value || typeof value !== 'object') return

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key === 'url' && typeof child === 'string' && child) urls.push(child)
    collectURLFields(child, urls)
  }
}

const internalPath = (value: string): string | null => {
  if (!value.startsWith('/')) return null
  return new URL(value, 'http://trayport.local').pathname
}

type ManagedLinkReference = {
  legacyId: number
  relationTo: string
}

const collectManagedLinkReferences = (value: unknown, references: ManagedLinkReference[]): void => {
  if (Array.isArray(value)) {
    value.forEach((child) => collectManagedLinkReferences(child, references))
    return
  }
  if (!value || typeof value !== 'object') return

  const object = value as Record<string, unknown>
  if (object.type === 'reference') {
    const reference = objectValue(object.reference)
    const valueReference = objectValue(reference.value)
    if (
      typeof reference.relationTo === 'string' &&
      valueReference.$legacyRef &&
      typeof valueReference.legacyId === 'number'
    ) {
      references.push({
        legacyId: valueReference.legacyId,
        relationTo: reference.relationTo,
      })
    }
  }

  Object.values(object).forEach((child) => collectManagedLinkReferences(child, references))
}

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
  'lifecycle-item': 'lifecycle-items',
  office: 'offices',
  'article-category': 'article-categories',
  'learning-video-category': 'learning-video-categories',
  'asset-class': 'asset-classes',
  'venue-type': 'venue-types',
  region: 'regions',
}

type TransformedDataChart = {
  chart: Record<string, unknown>
  valuePath: string
}

const collectTransformedDataCharts = (
  value: unknown,
  charts: TransformedDataChart[],
  valuePath: string,
): void => {
  if (Array.isArray(value)) {
    value.forEach((child, index) =>
      collectTransformedDataCharts(child, charts, `${valuePath}.${index}`),
    )
    return
  }
  if (!value || typeof value !== 'object') return

  const object = value as Record<string, unknown>
  if (object.blockType === 'dataChart') charts.push({ chart: object, valuePath })
  for (const [key, child] of Object.entries(object)) {
    collectTransformedDataCharts(child, charts, `${valuePath}.${key}`)
  }
}

export const assertTransformedDataChartContracts = (targets: TargetRecord[]): number => {
  const importedAssetClassIDs = new Set(
    targets.filter(({ target }) => target === 'asset-classes').map(({ legacy }) => legacy.legacyId),
  )
  const importedHubIDs = new Set(
    targets.filter(({ target }) => target === 'hubs').map(({ legacy }) => legacy.legacyId),
  )
  const charts: TransformedDataChart[] = []
  for (const target of targets) {
    collectTransformedDataCharts(target.data, charts, `${target.target}:${target.legacy.legacyId}`)
  }

  const rangeKeys = ['fromYear', 'fromQuarter', 'toYear', 'toQuarter'] as const
  for (const { chart, valuePath } of charts) {
    const assetClass = objectValue(chart.assetClass)
    const assetClassLegacyID = assetClass.legacyId
    assert.equal(
      assetClass.$legacyRef,
      'asset-class',
      `Data chart at ${valuePath} must use a managed asset-class relationship.`,
    )
    assert(
      typeof assetClassLegacyID === 'number' &&
        Number.isInteger(assetClassLegacyID) &&
        assetClassLegacyID > 0 &&
        importedAssetClassIDs.has(assetClassLegacyID),
      `Data chart at ${valuePath} must reference an imported asset class.`,
    )
    assert.equal(
      chart.assetClassLegacyId,
      assetClassLegacyID,
      `Data chart at ${valuePath} must retain the same application-data lookup key as its relationship.`,
    )

    const hubIDs = (field: 'excludedHubs' | 'includedHubs'): number[] => {
      const value = chart[field]
      assert(
        Array.isArray(value),
        `Data chart at ${valuePath} must serialize ${field} as an array.`,
      )
      return value.map((candidate, index) => {
        const relationship = objectValue(candidate)
        const legacyID = relationship.legacyId
        assert(
          relationship.$legacyRef === 'hub' &&
            typeof legacyID === 'number' &&
            Number.isInteger(legacyID) &&
            legacyID > 0 &&
            importedHubIDs.has(legacyID),
          `Data chart at ${valuePath} has an unresolved ${field} relationship at index ${index}.`,
        )
        return legacyID
      })
    }
    const includedHubIDs = hubIDs('includedHubs')
    const excludedHubIDs = hubIDs('excludedHubs')
    assert(
      !includedHubIDs.some((legacyID) => excludedHubIDs.includes(legacyID)),
      `Data chart at ${valuePath} cannot include and exclude the same hub.`,
    )

    assert(
      chart.displayInterval === 'month' ||
        chart.displayInterval === 'quarter' ||
        chart.displayInterval === 'year',
      `Data chart at ${valuePath} has an unsupported display interval.`,
    )
    if (chart.seriesDimension === 'executionType') {
      assert(
        chart.dataType === 'volume' && chart.chartType === 'stackedColumn',
        `Execution-type data chart at ${valuePath} must use volume stacked columns.`,
      )
      assert(
        includedHubIDs.length === 0 && excludedHubIDs.length === 0,
        `Execution-type data chart at ${valuePath} cannot filter hubs.`,
      )
    } else {
      assert.equal(
        chart.seriesDimension,
        'hub',
        `Data chart at ${valuePath} has an unsupported series dimension.`,
      )
      assert(
        (chart.dataType === 'volume' && chart.chartType === 'column') ||
          (chart.dataType === 'price' && chart.chartType === 'line'),
        `Hub data chart at ${valuePath} must use volume columns or a price line.`,
      )
    }

    const presentRangeKeys = rangeKeys.filter(
      (key) => chart[key] !== null && chart[key] !== undefined,
    )
    if (presentRangeKeys.length === 0) {
      assert(
        rangeKeys.every((key) => !Object.hasOwn(chart, key)),
        `Unbounded data chart at ${valuePath} must omit all range fields.`,
      )
      continue
    }

    assert.equal(
      presentRangeKeys.length,
      rangeKeys.length,
      `Data chart at ${valuePath} must have a complete range or no range.`,
    )
    const fromYear = chart.fromYear
    const fromQuarter = chart.fromQuarter
    const toYear = chart.toYear
    const toQuarter = chart.toQuarter
    assert(
      typeof fromYear === 'number' &&
        Number.isInteger(fromYear) &&
        fromYear >= 2000 &&
        fromYear <= 2100 &&
        typeof toYear === 'number' &&
        Number.isInteger(toYear) &&
        toYear >= 2000 &&
        toYear <= 2100,
      `Data chart at ${valuePath} must use years from 2000 through 2100.`,
    )
    assert(
      typeof fromQuarter === 'number' &&
        Number.isInteger(fromQuarter) &&
        fromQuarter >= 1 &&
        fromQuarter <= 4 &&
        typeof toQuarter === 'number' &&
        Number.isInteger(toQuarter) &&
        toQuarter >= 1 &&
        toQuarter <= 4,
      `Data chart at ${valuePath} must use quarters from 1 through 4.`,
    )
    assert(
      fromYear * 4 + fromQuarter <= toYear * 4 + toQuarter,
      `Data chart at ${valuePath} must not start after it ends.`,
    )
  }

  return charts.length
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
  const mapRegions = records.filter(
    (record): record is Extract<SourceRecord, { entity: 'map-region' }> =>
      record.entity === 'map-region',
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
  assert.equal(roots.length, pilotRootCount)
  assert.equal(new Set(roots.map(({ legacyId }) => legacyId)).size, pilotRootCount)
  for (const expectedRoot of pilotScope.roots) {
    const root = roots.find(({ legacyId }) => legacyId === expectedRoot.legacyId)
    assert(root, `Missing agreed root ${expectedRoot.legacyId}`)
    assert.equal(root.postType, expectedRoot.postType)
    assert.equal(root.status, 'publish')
    assert.equal(root.path, expectedRoot.path, `Unexpected path for root ${expectedRoot.legacyId}`)
    if ('sourceTitle' in expectedRoot) {
      assert.equal(root.title, expectedRoot.sourceTitle)
    }
  }

  const pageSectionCounts: Record<number, number> = {
    1898: 9,
    1924: 9,
    1926: 7,
    2203: 8,
    2205: 2,
    3311: 2,
    34: 2,
    2231: 1,
    2221: 6,
    4737: 6,
    5920: 2,
    5981: 8,
    5983: 8,
    7585: 3,
    7589: 2,
    7609: 2,
    9244: 1,
    9248: 1,
    11475: 10,
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
  assert.equal(Object.keys(pageSectionCounts).length, 19)
  const sourceLayoutNames = (post: SourcePost, field: 'sections' | 'sections_new'): string[] =>
    arrayValue(post.acf[field]).map((section) => String(objectValue(section).acf_fc_layout || ''))
  const expandedPageLayouts: Record<
    number,
    { field: 'sections' | 'sections_new'; layouts: string[] }
  > = {
    34: { field: 'sections_new', layouts: ['hero', 'columns'] },
    2221: {
      field: 'sections_new',
      layouts: ['single', 'columns', 'columns', 'columns', 'columns', 'columns'],
    },
    2231: { field: 'sections_new', layouts: ['columns'] },
    4737: {
      field: 'sections_new',
      layouts: ['columns', 'columns', 'columns', 'columns', 'columns', 'columns'],
    },
    4803: {
      field: 'sections',
      layouts: [
        'index-point',
        'post-content',
        'divider',
        'index-point',
        'post-content',
        'divider',
        'index-point',
        'post-content',
        'divider',
        'index-point',
        'post-content',
        'paragraph',
        'divider',
        'index-point',
        'header',
        'buttons',
        'divider',
        'index-point',
        'header',
        'buttons',
      ],
    },
    5920: { field: 'sections_new', layouts: ['columns', 'single'] },
    5981: {
      field: 'sections_new',
      layouts: [
        'single',
        'columns',
        'columns',
        'columns',
        'columns',
        'columns',
        'columns',
        'columns',
      ],
    },
    5983: {
      field: 'sections_new',
      layouts: [
        'columns',
        'single',
        'columns',
        'columns',
        'columns',
        'columns',
        'columns',
        'columns',
      ],
    },
    7573: {
      field: 'sections',
      layouts: [
        'paragraph',
        'index-point',
        'header',
        'paragraph',
        'index-point',
        'header',
        'paragraph',
        'index-point',
        'header',
        'paragraph',
        'index-point',
        'header',
        'paragraph',
        'index-point',
        'header',
        'paragraph',
        'index-point',
        'header',
        'paragraph',
        'buttons',
      ],
    },
    7585: { field: 'sections_new', layouts: ['columns', 'columns', 'columns'] },
    11475: {
      field: 'sections_new',
      layouts: [
        'hero',
        'columns',
        'single',
        'columns',
        'columns',
        'columns',
        'single',
        'single',
        'single',
        'columns',
      ],
    },
  }
  for (const [legacyIdText, expectation] of Object.entries(expandedPageLayouts)) {
    const post = roots.find(({ legacyId }) => legacyId === Number(legacyIdText))
    assert(post)
    assert.deepEqual(sourceLayoutNames(post, expectation.field), expectation.layouts)
  }
  const cookiePolicySource = roots.find(({ legacyId }) => legacyId === 7589)
  assert(cookiePolicySource)
  assert.equal(cookiePolicySource.title, 'Cookie and Privacy Policy')
  assert.match(JSON.stringify(cookiePolicySource.acf), /Our Use Of Cookies/)
  assert.match(JSON.stringify(cookiePolicySource.acf), /WHAT ARE COOKIES\?/)
  const requestDemoSource = roots.find(({ legacyId }) => legacyId === 4031)
  assert(requestDemoSource)
  assert.equal(requestDemoSource.title, 'Request A Demo')
  assert.equal(requestDemoSource.featuredMediaId, null)
  assert(!Object.hasOwn(requestDemoSource.acf, 'sections'))
  assert(!Object.hasOwn(requestDemoSource.acf, 'sections_new'))
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

  const pages = posts.filter(({ postType }) => postType === 'page')
  const bannerTargetPages = pages.filter(({ scopeRole }) => scopeRole === 'banner-target')
  const bannerActionPages = pages.filter(({ scopeRole }) => scopeRole === 'banner-action')
  const bannerDependencyPages = [...bannerTargetPages, ...bannerActionPages]
  assert.equal(pages.length, pilotSourcePageCount + bannerDependencyPages.length)
  assert.equal(pages.filter(({ scopeRole }) => scopeRole === 'root').length, 22)
  assert.deepEqual(
    sortedNumbers(bannerTargetPages.map(({ legacyId }) => legacyId)),
    [1930, 1940, 4028, 6773],
  )
  assert.deepEqual(sortedNumbers(bannerActionPages.map(({ legacyId }) => legacyId)), [11299])

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

  const venues = posts.filter(({ postType }) => postType === 'venue')
  assert.equal(venues.length, 66)
  assert.equal(venues.filter(({ scopeRole }) => scopeRole === 'root').length, 1)
  assert.equal(venues.filter(({ scopeRole }) => scopeRole === 'venue-summary').length, 65)
  const sourceVenueConnections = venues.flatMap((venue) =>
    arrayValue(venue.acf.connections).map((connection) => ({
      hubLegacyId: referenceID(objectValue(connection).hub, 'post'),
      type: String(objectValue(connection).type || ''),
      venueLegacyId: venue.legacyId,
    })),
  )
  assert.equal(sourceVenueConnections.length, 657)
  assert(sourceVenueConnections.every(({ hubLegacyId }) => hubLegacyId !== null))
  assert.deepEqual(
    countBy(sourceVenueConnections, ({ type }) => type),
    {
      a: 20,
      b: 218,
      d: 419,
    },
  )
  const uniqueSourceVenueConnections = new Set(
    sourceVenueConnections.map(
      ({ hubLegacyId, venueLegacyId }) => `${venueLegacyId}:${hubLegacyId}`,
    ),
  )
  assert.equal(uniqueSourceVenueConnections.size, 655)
  assert.deepEqual(
    sourceVenueConnections
      .filter(({ hubLegacyId, venueLegacyId }) => venueLegacyId === 3373 && hubLegacyId === 2490)
      .map(({ type }) => type),
    ['d', 'd'],
  )
  assert.deepEqual(
    sourceVenueConnections
      .filter(({ hubLegacyId, venueLegacyId }) => venueLegacyId === 3363 && hubLegacyId === 2493)
      .map(({ type }) => type),
    ['b', 'd'],
  )
  assert.equal(venues.filter(({ acf }) => arrayValue(acf.connections).length > 0).length, 64)

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
  const seenEexConnections = new Set<number | null>()
  assert.deepEqual(
    eexConnectionIDs.filter((legacyId) => {
      if (seenEexConnections.has(legacyId)) return false
      seenEexConnections.add(legacyId)
      return true
    }),
    eexMarketSourceOrder,
  )
  assert.equal(eexConnectionIDs.filter((legacyId) => legacyId === 2493).length, 2)

  const german = roots.find(({ legacyId }) => legacyId === 2495)
  assert(german)
  assert.equal(referenceID(german.acf.image, 'media'), 9727)
  const germanHeaderMedia = media.find(({ legacyId }) => legacyId === 9727)
  assert(germanHeaderMedia)
  assert(
    germanHeaderMedia.availability === 'unavailable' ||
      germanHeaderMedia.availability === 'recovered',
  )
  if (germanHeaderMedia.availability === 'unavailable') {
    assert.equal(germanHeaderMedia.availabilityReason, 'missing-or-unreadable-local-file')
  } else {
    assert.equal(germanHeaderMedia.availabilityReason, null)
    assert.match(germanHeaderMedia.recoveryURL || '', /^https:\/\//)
  }
  const power = terms.find(
    ({ legacyId, taxonomy }) => legacyId === 21 && taxonomy === 'asset-class',
  )
  assert(power)
  assert.equal(power.acf.icon, 'lightbulb-cfl')

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

  assert.equal(mapHubs.length, 72)
  assert.equal(mapRegions.length, 3)
  assert(mapRegions.every(({ boundary, centre }) => boundary && centre))
  assert(mapRegions.some(({ pointsOfInterest }) => pointsOfInterest.length > 0))
  assert(mapHubs.some(({ connections: hubConnections }) => hubConnections.length > 0))
  assert(mapHubs.some(({ countryCode }) => countryCode !== null))
  assert.equal(
    mapHubs.reduce((total, hub) => total + hub.markers.length, 0),
    62,
  )
  assert.deepEqual(
    sortedNumbers(
      mapHubs.filter(({ markers }) => markers.length === 0).map(({ legacyId }) => legacyId),
    ),
    [
      2491, 3332, 3334, 3335, 3336, 3337, 3339, 3340, 3341, 3342, 3343, 6800, 8520, 10565, 10749,
      10751, 10752,
    ],
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
    if (asset.availability === 'local' || asset.availability === 'recovered') {
      assert(asset.relativePath, `Available media ${asset.legacyId} is missing its relative path`)
      assert.match(
        asset.fileHash || '',
        /^[a-f0-9]{64}$/,
        `Available media ${asset.legacyId} is missing its SHA-256 fingerprint`,
      )
      assert.equal(asset.availabilityReason, null)
      if (asset.availability === 'recovered') {
        assert.match(
          asset.recoveryURL || '',
          /^https:\/\//,
          `Recovered media ${asset.legacyId} is missing its HTTPS provenance URL`,
        )
      } else {
        assert.equal(asset.recoveryURL, null)
      }
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
  const lifecycleItems = reusables.filter(({ postType }) => postType === 'lifecycle')
  if (lifecycleItems.length) {
    assert.deepEqual(
      sortedNumbers(lifecycleItems.map(({ legacyId }) => legacyId)),
      [4026, 4208, 4209, 4210, 4211, 4212, 4213, 4214, 10337, 10485, 10489, 11241],
    )
    lifecycleItems.forEach((record) => sourceLifecycleReusableSchema.parse(record))
  }
  const banners = reusables.filter(({ postType }) => postType === 'banner')
  assert.deepEqual(
    sortedNumbers(banners.map(({ legacyId }) => legacyId)),
    [4362, 4363, 7597, 11602],
  )
  assert(banners.every(({ status }) => status === 'publish'))
  const activeBanner = banners.find(({ legacyId }) => legacyId === 11602)
  assert(activeBanner)
  assert.equal(activeBanner.data.start_at, '2026-07-20T00:00:00+00:00')
  assert.equal(activeBanner.data.end_at, '2026-12-31T17:00:00+00:00')
  assert.deepEqual(activeBanner.data.pages, [1940, 6773])
  assert.deepEqual(activeBanner.data.notification_recipient_emails, [
    'sophie.inghamclark@trayport.com',
  ])
  const jouleFunctionalityVideo = reusables.find(
    ({ legacyId, postType }) => legacyId === 7665 && postType === 'videos',
  )
  assert(jouleFunctionalityVideo, 'Missing reusable Joule Functionality video 7665')
  assert.equal(referenceID(jouleFunctionalityVideo.data.video, 'media'), 7666)
  assert.equal(referenceID(jouleFunctionalityVideo.data.image, 'media'), 8519)
  const companyData = reusables.filter(({ postType }) => postType === 'company-data')
  assert.deepEqual(
    sortedNumbers(companyData.map(({ legacyId }) => legacyId)),
    [4846, 4848, 4849, 4850],
  )
  assert(
    companyData.every(({ data }) => !containsUnresolvedWordPressShortcode(data)),
    'Curated company-data values must not retain unresolved WordPress shortcodes.',
  )
  const careersPeople = reusables.filter(
    ({ data, postType }) => postType === 'people' && data.team === 'careers',
  )
  assert.deepEqual(
    sortedNumbers(careersPeople.map(({ legacyId }) => legacyId)),
    [4145, 4146, 4837, 4839, 4841, 4843],
  )
  assert(
    reusables.some(({ legacyId, postType }) => legacyId === 3838 && postType === 'stats-group'),
  )

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
  const assetClasses = terms.filter(({ taxonomy }) => taxonomy === 'asset-class')
  assert.deepEqual(
    sortedNumbers(assetClasses.map(({ legacyId }) => legacyId)),
    [21, 22, 25, 26, 27, 88, 89, 90, 108, 109, 114, 192],
  )
  const venueTypes = terms.filter(({ taxonomy }) => taxonomy === 'venue-type')
  assert.deepEqual(sortedNumbers(venueTypes.map(({ legacyId }) => legacyId)), [41, 42, 43])

  assert(options)
  assert.equal(Array.isArray(options.values.dropdown) ? options.values.dropdown.length : 0, 5)
  const footer = options.values.footer_new
  assert(footer && typeof footer === 'object' && !Array.isArray(footer))
  const footerObject = footer as Record<string, unknown>
  assert.equal(Array.isArray(footerObject.menu_block) ? footerObject.menu_block.length : 0, 3)
  assert.equal(
    options.values.footer_company_registration_text,
    'Trayport Limited is a private limited company registered in England and Wales (Registered No. 02769279 ) whose registered office is Trayport Limited, 3rd Floor, 2 Gresham Street, London, EC2V 7AD',
  )
  assert.equal(
    options.values.footer_parent_company_text,
    'Trayport Holdings Limited is a wholly-owned subsidiary of TMX Group Limited (TMX Group).',
  )
  const cookieNotice = objectValue(options.values.cookie_notice)
  assert.equal(cookieNotice.enabled, true)
  assert.equal(cookieNotice.title, 'Trayport Cookie Consent')
  assert.equal(cookieNotice.accept_label, 'Accept All')
  assert.equal(cookieNotice.reject_label, 'Reject All')
  assert.equal(cookieNotice.policy_label, 'Cookie Policy')
  assert.equal(cookieNotice.policy_path, '/legal/cookie-policy/')
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
    { legacyId: 34, sourcePath: 'pages.34.sections_new.1.columns.0.components.1' },
    { legacyId: 34, sourcePath: 'pages.34.sections_new.1.columns.0.components.5' },
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
      roots: pilotRootCount,
      pages: pages.length,
      bannerTargetPages: bannerTargetPages.length,
      bannerActionPages: bannerActionPages.length,
      bannerDependencyPages: bannerDependencyPages.length,
      banners: banners.length,
      articles: 71,
      insightsArticles: 39,
      newsArticles: 31,
      eventArticles: 1,
      featuredInsights: 4,
      learningVideos: 15,
      learningListingVideos: 14,
      offices: 4,
      lifecycleItems: lifecycleItems.length,
      articleCategories: 3,
      learningVideoCategories: 11,
      assetClasses: 12,
      venueTypes: 3,
      eexConnections: 37,
      eexDuplicateSourceRows: 1,
      eexSourceOrderValidated: true,
      connectedVenues: 21,
      marketMatrixHubs: 72,
      marketMatrixVenues: 66,
      marketMatrixVenueRows: 64,
      marketMatrixSourceConnections: 657,
      marketMatrixUniqueConnections: 655,
      germanHeaderMediaRecovered: germanHeaderMedia.availability === 'recovered',
      germanHeaderMediaUnavailable: germanHeaderMedia.availability === 'unavailable',
      mapHubs: 72,
      mapMarkers: 62,
      marketRows: 1194,
      media: media.length,
      fingerprintedMedia: media.filter(({ fileHash }) => fileHash !== null).length,
      unavailableMedia: media.filter(({ availability }) => availability === 'unavailable').length,
      altTextReview: media.filter(({ needsAltReview }) => needsAltReview).length,
      reusables: reusables.length,
      deferredHubSpotForms: 5,
      protectedVideoExcluded: true,
      activeNavigationRoots: 5,
      footerColumns: 3,
      footerLinks: 13,
      cookieNoticeImported: true,
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
  const sourceLifecycleItems = sourceRecords.filter(
    (record): record is Extract<SourceRecord, { entity: 'reusable' }> =>
      record.entity === 'reusable' && record.postType === 'lifecycle',
  )
  const sourceBanners = sourceRecords.filter(
    (record): record is Extract<SourceRecord, { entity: 'reusable' }> =>
      record.entity === 'reusable' && record.postType === 'banner',
  )
  const sourceBannerTargetPages = sourceRecords.filter(
    (record): record is SourcePost =>
      record.entity === 'post' && record.scopeRole === 'banner-target',
  )
  const sourceBannerActionPages = sourceRecords.filter(
    (record): record is SourcePost =>
      record.entity === 'post' && record.scopeRole === 'banner-action',
  )
  const sourceBannerDependencyPages = [...sourceBannerTargetPages, ...sourceBannerActionPages]
  const expectedPageTargets = pilotTargetPageCount + sourceBannerDependencyPages.length
  const counts = countBy(targets, ({ target }) => target)
  assert.deepEqual(counts, {
    pages: expectedPageTargets,
    articles: 71,
    hubs: 72,
    venues: 66,
    'learning-videos': 15,
    ...(sourceLifecycleItems.length ? { 'lifecycle-items': sourceLifecycleItems.length } : {}),
    offices: 4,
    'article-categories': 3,
    'learning-video-categories': 11,
    'asset-classes': 12,
    'venue-types': 3,
    regions: 4,
    media: sourceMedia.length,
    banners: sourceBanners.length,
    redirects: 2,
    global: 3,
  })

  const targetGraph = assertTransformedReferenceClosure(targets)
  const dataChartCount = assertTransformedDataChartContracts(targets)

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
  const nestedComponents = (record: TargetRecord): Record<string, unknown>[] =>
    arrayValue(record.data.layout)
      .map(objectValue)
      .flatMap((block) => arrayValue(block.columns).map(objectValue))
      .flatMap((column) => arrayValue(column.components).map(objectValue))
  assert.equal(layoutCount('pages', 1898), 9)
  assert.equal(layoutCount('pages', 2203), 8)
  assert.equal(layoutCount('pages', 1924), 9)
  assert.equal(layoutCount('pages', 7589), 2)
  assert.equal(layoutCount('pages', 2231), 2)
  assert.equal(layoutCount('pages', 5920), 2)
  assert.equal(layoutCount('pages', 4803), 21)
  assert.equal(layoutCount('pages', 7573), 21)
  assert.equal(layoutCount('pages', 34), 2)
  assert.equal(layoutCount('pages', 9248), 2)
  const cookiePolicy = targets.find(
    ({ legacy, target }) => target === 'pages' && legacy.legacyId === 7589,
  )
  assert(cookiePolicy)
  assert.equal(cookiePolicy.data.title, 'Cookie and Privacy Policy')
  assert.match(JSON.stringify(cookiePolicy.data.layout), /Our Use Of Cookies/)
  assert.match(JSON.stringify(cookiePolicy.data.layout), /WHAT ARE COOKIES\?/)
  assert.equal(layoutCount('articles', 9351), 9)
  assert.equal(layoutCount('articles', 10030), 3)

  const marketMatrixPage = targets.find(
    ({ legacy, target }) => target === 'pages' && legacy.legacyId === 2231,
  )
  assert(marketMatrixPage)
  const marketMatrixComponents = nestedComponents(marketMatrixPage).filter(
    ({ blockType }) => blockType === 'marketMatrix',
  )
  assert.deepEqual(marketMatrixComponents, [
    {
      assetClasses: [],
      blockType: 'marketMatrix',
      caption: 'Trayport venue connectivity by market hub',
      defaultView: 'joule',
      regions: [],
      showDownload: true,
      showFilters: true,
      venueTypes: [],
    },
  ])

  const marketsMapPage = targets.find(
    ({ legacy, target }) => target === 'pages' && legacy.legacyId === 5920,
  )
  assert(marketsMapPage)
  const marketsMapComponents = nestedComponents(marketsMapPage).filter(
    ({ blockType, mode }) => blockType === 'marketCoverage' && mode === 'regionalConnectivity',
  )
  assert.equal(marketsMapComponents.length, 1)
  const marketsMap = marketsMapComponents[0]
  assert(marketsMap)
  assert.equal(marketsMap.presentation, 'mapOnly')
  assert.equal(marketsMap.height, 650)
  assert.equal(marketsMap.showLines, true)
  assert.equal(marketsMap.lineColor, '#009cde')
  assert.equal(marketsMap.showSidebar, true)
  assert.equal(marketsMap.showMarketData, true)
  assert.equal(marketsMap.dataDisplay, 'always')
  assert.equal(referenceID(marketsMap.defaultAssetClass, 'asset-class'), 21)
  assert.deepEqual(
    arrayValue(marketsMap.assetClasses).map((value) => referenceID(value, 'asset-class')),
    [108, 22, 21],
  )
  assert.deepEqual(
    arrayValue(marketsMap.regions).map((value) => referenceID(value, 'region')),
    [31, 29, 30],
  )
  assert.deepEqual(
    arrayValue(marketsMap.venueTypes).map((value) => referenceID(value, 'venue-type')),
    [41, 43, 42],
  )

  for (const [pageLegacyID, regionLegacyID] of [
    [5981, 29],
    [5983, 31],
    [2221, 30],
  ] as const) {
    const regionPage = targets.find(
      ({ legacy, target }) => target === 'pages' && legacy.legacyId === pageLegacyID,
    )
    assert(regionPage)
    const regionalMap = nestedComponents(regionPage).find(
      ({ blockType, mode }) => blockType === 'marketCoverage' && mode === 'regionalConnectivity',
    )
    assert(regionalMap)
    assert.equal(referenceID(regionalMap.defaultAssetClass, 'asset-class'), 22)
    assert.deepEqual(
      arrayValue(regionalMap.regions).map((value) => referenceID(value, 'region')),
      [regionLegacyID],
    )
  }

  const contactPage = targets.find(
    ({ legacy, target }) => target === 'pages' && legacy.legacyId === 34,
  )
  assert(contactPage)
  const serializedContact = JSON.stringify(contactPage.data.layout)
  assert(!/complete\s+the\s+form|form\s+below|hubspot/i.test(serializedContact))
  assert.match(serializedContact, /support@trayport\.com/)
  for (const phone of ['+44 (0)20 7960 5555', '+44 (0)20 7960 5530', '+44 (0)20 7960 5511']) {
    assert(
      serializedContact.includes(phone),
      `Contact page is missing the imported support number ${phone}`,
    )
  }
  assert.deepEqual(
    sortedNumbers(
      nestedComponents(contactPage)
        .filter(({ blockType }) => blockType === 'office')
        .map(({ office }) => referenceID(office, 'office'))
        .filter((legacyId): legacyId is number => legacyId !== null),
    ),
    [4052, 4055, 4056, 4057],
  )

  const transformCoverage = JSON.parse(
    fs.readFileSync(path.join(runDir, 'reports', 'transform-coverage.json'), 'utf8'),
  ) as {
    coverage?: {
      ignoredComponentLayouts?: Record<string, { count?: number; reason?: string }>
    }
  }
  const deferredHubSpotForms = transformCoverage.coverage?.ignoredComponentLayouts?.form?.count || 0
  assert.equal(deferredHubSpotForms, 7)
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
  assert.deepEqual(german.data.heroMedia, { $legacyRef: 'media', legacyId: 9727 })
  assert.deepEqual(
    arrayValue(german.data.connections).map((connection) =>
      referenceID(objectValue(connection).venue, 'venue'),
    ),
    [
      1394, 2516, 2518, 2525, 2528, 2529, 2531, 2535, 2540, 2542, 3356, 3363, 3364, 3365, 3368,
      3373, 3374, 3376, 4381, 4382, 9263,
    ],
  )
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
  const asiaPacific = targets.find(
    ({ target, legacy }) => target === 'pages' && legacy.legacyId === 5983,
  )
  const europe = targets.find(
    ({ target, legacy }) => target === 'pages' && legacy.legacyId === 5981,
  )
  assert(asiaPacific && europe)
  const dataChartEvidence = (record: TargetRecord) =>
    nestedComponents(record)
      .filter(({ blockType }) => blockType === 'dataChart')
      .map(
        ({
          assetClassLegacyId,
          chartType,
          dataType,
          displayInterval,
          excludedHubs,
          fromQuarter,
          fromYear,
          includedHubs,
          seriesDimension,
          title,
          toQuarter,
          toYear,
        }) => ({
          assetClassLegacyId,
          chartType,
          dataType,
          displayInterval,
          excludedHubLegacyIds: arrayValue(excludedHubs).map((hub) => referenceID(hub, 'hub')),
          fromQuarter,
          fromYear,
          includedHubLegacyIds: arrayValue(includedHubs).map((hub) => referenceID(hub, 'hub')),
          path: record.data.path,
          seriesDimension,
          title,
          toQuarter,
          toYear,
        }),
      )
  assert.deepEqual([home, asiaPacific, europe].flatMap(dataChartEvidence), [
    {
      assetClassLegacyId: 22,
      chartType: 'stackedColumn',
      dataType: 'volume',
      displayInterval: 'quarter',
      excludedHubLegacyIds: [],
      fromQuarter: 1,
      fromYear: 2021,
      includedHubLegacyIds: [],
      path: '/',
      seriesDimension: 'executionType',
      title: 'Traded Gas Volumes by Execution (Quarterly)',
      toQuarter: 4,
      toYear: 2025,
    },
    {
      assetClassLegacyId: 21,
      chartType: 'stackedColumn',
      dataType: 'volume',
      displayInterval: 'quarter',
      excludedHubLegacyIds: [],
      fromQuarter: 1,
      fromYear: 2021,
      includedHubLegacyIds: [],
      path: '/',
      seriesDimension: 'executionType',
      title: 'Traded Power Volumes by Execution (Quarterly)',
      toQuarter: 4,
      toYear: 2025,
    },
    {
      assetClassLegacyId: 21,
      chartType: 'column',
      dataType: 'volume',
      displayInterval: 'month',
      excludedHubLegacyIds: [],
      fromQuarter: 3,
      fromYear: 2023,
      includedHubLegacyIds: [2500],
      path: '/regions/asia-pacific/',
      seriesDimension: 'hub',
      title: 'Japan Power Market by Volume',
      toQuarter: 1,
      toYear: 2026,
    },
    {
      assetClassLegacyId: 21,
      chartType: 'column',
      dataType: 'volume',
      displayInterval: 'year',
      excludedHubLegacyIds: [2511, 2496, 2500],
      fromQuarter: 1,
      fromYear: 2025,
      includedHubLegacyIds: [],
      path: '/regions/europe/',
      seriesDimension: 'hub',
      title: 'Power Volumes by Hub',
      toQuarter: 4,
      toYear: 2025,
    },
    {
      assetClassLegacyId: 21,
      chartType: 'line',
      dataType: 'price',
      displayInterval: 'month',
      excludedHubLegacyIds: [],
      fromQuarter: 1,
      fromYear: 2025,
      includedHubLegacyIds: [2513, 2495, 2494, 2499, 2502],
      path: '/regions/europe/',
      seriesDimension: 'hub',
      title: 'Power Prices from Commodities Report (front month = Jan 2025)',
      toQuarter: 4,
      toYear: 2025,
    },
    {
      assetClassLegacyId: 22,
      chartType: 'column',
      dataType: 'volume',
      displayInterval: 'quarter',
      excludedHubLegacyIds: [],
      fromQuarter: 1,
      fromYear: 2025,
      includedHubLegacyIds: [3315, 3316, 3320, 2488],
      path: '/regions/europe/',
      seriesDimension: 'hub',
      title: 'Gas Volumes by Hub',
      toQuarter: 4,
      toYear: 2025,
    },
  ])
  assert.equal(dataChartCount, 6)
  const joule = targets.find(({ target, legacy }) => target === 'pages' && legacy.legacyId === 1924)
  assert(joule)
  const featureLists = (record: TargetRecord): Record<string, unknown>[] =>
    nestedComponents(record).filter(({ blockType }) => blockType === 'featureList')
  const featureWithTitle = (record: TargetRecord, title: string): Record<string, unknown> => {
    const feature = featureLists(record).find((list) =>
      arrayValue(list.items).some((item) => objectValue(item).title === title),
    )
    assert(feature, `Missing feature list containing ${title}`)
    return feature
  }

  const homeProducts = featureWithTitle(home, 'Joule')
  assert.equal(homeProducts.presentation, 'leadCarousel')
  assert.equal(arrayValue(homeProducts.items).length, 8)
  assert(
    arrayValue(homeProducts.items).every((item) => objectValue(item).display === 'image'),
    'Home product features must retain their image display.',
  )
  const jouleProduct = objectValue(arrayValue(homeProducts.items)[0])
  assert.equal(jouleProduct.showAction, true)
  assert.equal(jouleProduct.actionStyle, 'accent')

  const homeIcons = nestedComponents(home)
    .filter(({ blockType }) => blockType === 'standaloneIcon')
    .map(({ icon }) => icon)
  assert.deepEqual(homeIcons, ['gas', 'power', 'emissions'])

  const informedDecisions = featureWithTitle(joule, 'Complete Market View')
  assert.equal(informedDecisions.presentation, 'carousel')
  assert.equal(arrayValue(informedDecisions.items).length, 5)
  assert(arrayValue(informedDecisions.items).every((item) => objectValue(item).display === 'plain'))
  const jouleMobile = featureWithTitle(joule, 'Faster & Safer Login Using Biometrics')
  assert.equal(jouleMobile.presentation, 'carousel')
  assert.equal(arrayValue(jouleMobile.items).length, 4)
  const relatedProducts = featureWithTitle(joule, 'Automated Trading')
  assert.equal(relatedProducts.presentation, 'grid')
  assert.equal(arrayValue(relatedProducts.items).length, 3)
  assert(
    arrayValue(relatedProducts.items).every((item) => {
      const feature = objectValue(item)
      return feature.display === 'image' && feature.showAction === true
    }),
    'Related products must remain linked image tiles.',
  )
  for (const [page, expectedMediaLegacyID] of [
    [home, 10867],
    [joule, 3547],
  ] as const) {
    const hero = (page.data.layout as Array<Record<string, unknown>>).find(
      ({ blockType }) => blockType === 'trayportHero',
    )
    assert(hero, `Missing hero for ${page.data.path}`)
    assert.deepEqual(hero.media, { $legacyRef: 'media', legacyId: expectedMediaLegacyID })
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
    assert.equal(targetSource.fileSize, source.fileSize)
    assert.equal(targetSource.fileHash, source.fileHash)
    assert.equal(targetSource.relativePath, source.relativePath)
    assert.equal(targetSource.recoveryURL, source.recoveryURL)
    assert.equal(targetSource.originalURL, source.url)
    assert.equal(targetSource.availability, source.availability)
    assert.equal(targetSource.availabilityReason, source.availabilityReason)
    assert.equal(target.data.sourceFileHash, source.fileHash)
  }
  assert.deepEqual(targetMediaByLegacyID.get(7666)?.data.poster, {
    $legacyRef: 'media',
    legacyId: 8519,
  })
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

  const lifecycleItems = targets.filter(({ target }) => target === 'lifecycle-items')
  assert.equal(lifecycleItems.length, sourceLifecycleItems.length)
  for (const lifecycleItem of lifecycleItems) {
    assert.equal(lifecycleItem.data._status, 'published')
    assert.equal(lifecycleItem.data.active, true)
    assert.equal(typeof lifecycleItem.data.productLabel, 'string')
    assert.equal(typeof lifecycleItem.data.serviceName, 'string')
    assert.match(String(lifecycleItem.data.endOfLifeDate), /^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/)
  }

  const banners = targets.filter(({ target }) => target === 'banners')
  assert.equal(banners.length, sourceBanners.length)
  assert.deepEqual(
    sortedNumbers(banners.map(({ legacy }) => legacy.legacyId)),
    [4362, 4363, 7597, 11602],
  )
  const activeBanner = banners.find(({ legacy }) => legacy.legacyId === 11602)
  assert(activeBanner)
  assert.equal(activeBanner.data._status, 'published')
  assert.equal(activeBanner.data.targetMode, 'specific')
  assert.deepEqual(activeBanner.data.targetPages, [
    { $legacyRef: 'page', legacyId: 1940 },
    { $legacyRef: 'page', legacyId: 6773 },
  ])

  const venues = targets.filter(({ target }) => target === 'venues')
  const venueWebsites = venues.flatMap(({ data }) =>
    typeof data.website === 'string' ? [data.website] : [],
  )
  assert(
    venueWebsites.every((website) => safeExternalHTTPSURL(website) === website),
    'Transformed venue websites must satisfy the credential-free external HTTPS policy.',
  )
  const gfi = venues.find(({ legacy }) => legacy.legacyId === 2525)
  assert(gfi, 'Missing transformed venue:2525')
  assert.equal(gfi.data.website, 'https://www.gfigroup.co.uk/')
  const targetVenueConnections = venues.flatMap((venue) =>
    arrayValue(venue.data.marketConnections).map((connection) => ({
      hubLegacyId: referenceID(objectValue(connection).hub, 'hub'),
      type: String(objectValue(connection).connectionType || ''),
      venueLegacyId: venue.legacy.legacyId,
    })),
  )
  assert.equal(targetVenueConnections.length, 655)
  assert(targetVenueConnections.every(({ hubLegacyId }) => hubLegacyId !== null))
  assert.deepEqual(
    countBy(targetVenueConnections, ({ type }) => type),
    {
      a: 20,
      b: 218,
      d: 417,
    },
  )
  assert.equal(
    new Set(
      targetVenueConnections.map(
        ({ hubLegacyId, venueLegacyId }) => `${venueLegacyId}:${hubLegacyId}`,
      ),
    ).size,
    655,
  )
  assert.equal(
    venues.filter(({ data }) => arrayValue(data.marketConnections).length > 0).length,
    64,
  )
  assert.deepEqual(
    targetVenueConnections.filter(
      ({ hubLegacyId, venueLegacyId }) => venueLegacyId === 3373 && hubLegacyId === 2490,
    ),
    [{ hubLegacyId: 2490, type: 'd', venueLegacyId: 3373 }],
  )
  assert.deepEqual(
    targetVenueConnections.filter(
      ({ hubLegacyId, venueLegacyId }) => venueLegacyId === 3363 && hubLegacyId === 2493,
    ),
    [{ hubLegacyId: 2493, type: 'b', venueLegacyId: 3363 }],
  )
  const eex = venues.find(({ legacy }) => legacy.legacyId === 3363)
  assert(eex)
  assert.equal(eex.data.contentMode, 'page')
  assert.equal(eex.data.path, '/venue/eex/')
  assert.equal(eex.data.summary, null)
  assert.equal(eex.data.description, null)
  assert.equal(
    objectValue(eex.data.meta).description,
    'Discover EEX on Trayport: access real-time trading, market insights, and exchange opportunities for efficient commodity trading.',
  )
  const eexHubIDs = arrayValue(eex.data.marketConnections)
    .map((connection) => referenceID(objectValue(connection).hub, 'hub'))
    .filter((legacyId): legacyId is number => legacyId !== null)
  assert.equal(eexHubIDs.length, 37)
  assert.equal(new Set(eexHubIDs).size, 37)
  assert.deepEqual(eexHubIDs, eexMarketSourceOrder)
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
  assert.equal(redirects.length, 2)
  const tradingInJouleAlias = redirects.find(({ legacy }) => legacy.legacyId === 8454)
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
  const requestDemoRedirect = redirects.find(({ legacy }) => legacy.legacyId === 4031)
  assert(requestDemoRedirect)
  assert.equal(requestDemoRedirect.data.from, '/request-a-demo/')
  assert.equal(requestDemoRedirect.data.type, '302')
  const requestDemoTo = objectValue(requestDemoRedirect.data.to)
  const requestDemoReference = objectValue(requestDemoTo.reference)
  assert.equal(requestDemoTo.type, 'reference')
  assert.equal(requestDemoReference.relationTo, 'pages')
  assert.equal(referenceID(requestDemoReference.value, 'page'), 34)
  assert(!Object.hasOwn(requestDemoRedirect.data, 'path'))

  const expectedDiscriminators: Record<number, [field: string, value: string]> = {
    34: ['pageType', 'standard'],
    1898: ['pageType', 'homepage'],
    1924: ['pageType', 'product'],
    1926: ['pageType', 'product'],
    2203: ['pageType', 'standard'],
    2205: ['pageType', 'standard'],
    2221: ['pageType', 'standard'],
    2231: ['pageType', 'interactive'],
    2495: ['contentMode', 'page'],
    3311: ['pageType', 'index'],
    3363: ['contentMode', 'page'],
    4737: ['pageType', 'legal'],
    4803: ['pageType', 'legal'],
    5981: ['pageType', 'standard'],
    5983: ['pageType', 'standard'],
    5920: ['pageType', 'standard'],
    7573: ['pageType', 'legal'],
    7585: ['pageType', 'legal'],
    7589: ['pageType', 'legal'],
    7609: ['pageType', 'standard'],
    8454: ['contentMode', 'full'],
    9244: ['pageType', 'index'],
    9248: ['pageType', 'index'],
    9351: ['contentMode', 'full'],
    10030: ['contentMode', 'full'],
    11475: ['pageType', 'standard'],
  }
  for (const root of pilotScope.roots) {
    const owners = targets.filter(
      ({ legacy, target }) => legacy.legacyId === root.legacyId && target === root.targetOwner,
    )
    assert.equal(owners.length, 1, `Expected one ${root.targetOwner} owner for ${root.legacyId}`)
    const owner = owners[0]
    assert(owner)
    if (root.targetOwner === 'redirects') {
      assert.equal(owner.data.from, root.path)
      assert.equal(owner.data.type, '302')
      continue
    }
    assert.equal(owner.data.path, root.path)
    assert.equal(owner.data._status, 'published')
    const discriminator = expectedDiscriminators[root.legacyId]
    assert(discriminator)
    assert.equal(owner.data[discriminator[0]], discriminator[1])
  }
  for (const dependency of pilotScope.acceptedRouteDependencies) {
    const owners = targets.filter(
      ({ legacy, target }) => legacy.legacyId === dependency.legacyId && target === 'pages',
    )
    assert.equal(owners.length, 1, `Expected one Pages owner for ${dependency.legacyId}`)
    const owner = owners[0]
    assert(owner)
    assert.equal(owner.data.path, dependency.path)
    assert.equal(owner.data._status, 'published')
    assert.equal(
      owner.data.pageType,
      dependency.archetype === 'page.product' ? 'product' : 'standard',
    )
  }

  const routablePaths = targets
    .map(({ data }) => data.path)
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .sort()
  assert.deepEqual(
    routablePaths,
    [
      ...pilotScope.roots
        .filter(({ targetOwner }) => targetOwner !== 'redirects')
        .map(({ path }) => path),
      ...sourceBannerDependencyPages.flatMap(({ path }) => (path ? [path] : [])),
    ].sort(),
    'Only agreed pilot owners and required banner Page dependencies may own canonical paths.',
  )
  assert.equal(new Set(routablePaths).size, routablePaths.length)

  const importedAcceptedOwners = [
    ...pilotScope.roots,
    ...pilotScope.acceptedRouteDependencies,
  ].flatMap((root) => {
    if (root.targetOwner === 'redirects') return []
    const owner = targets.find(
      ({ legacy, target }) => legacy.legacyId === root.legacyId && target === root.targetOwner,
    )
    assert(owner)
    return [owner]
  })
  const contentURLs: string[] = []
  const contentLinkReferences: ManagedLinkReference[] = []
  importedAcceptedOwners.forEach((owner) => {
    collectURLFields(owner.data.layout, contentURLs)
    collectManagedLinkReferences(owner.data.layout, contentLinkReferences)
  })
  for (const url of contentURLs) {
    const path = internalPath(url)
    if (path) {
      assert(
        migrationOwnedPaths.has(path),
        `Imported content exposes unmatched internal URL ${url}`,
      )
      continue
    }
    if (/^(?:#|mailto:|tel:)/i.test(url)) continue
    assert.match(url, /^https:\/\//i, `Imported content link must use HTTPS: ${url}`)
    const parsed = new URL(url)
    assert.notEqual(parsed.hostname, 'trayport.local')
  }
  const relationByTarget: Partial<Record<TargetCollection, string>> = {
    articles: 'articles',
    hubs: 'hubs',
    'learning-videos': 'learning-videos',
    pages: 'pages',
    venues: 'venues',
  }
  for (const reference of contentLinkReferences) {
    const root = pilotScope.roots.find(({ legacyId }) => legacyId === reference.legacyId)
    if (root) {
      assert.notEqual(root.targetOwner, 'redirects')
      assert.equal(reference.relationTo, relationByTarget[root.targetOwner])
      continue
    }
    assert(
      sourceBannerDependencyPages.some(({ legacyId }) => legacyId === reference.legacyId),
      `Managed Page reference ${reference.legacyId} is outside the accepted dependency graph.`,
    )
    assert.equal(reference.relationTo, 'pages')
  }

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
  const navigationAndFooterURLs: string[] = []
  const navigationFooterLiveFallbacks = new Set<string>()
  collectURLFields(navigation.data, navigationAndFooterURLs)
  collectURLFields(footer.data, navigationAndFooterURLs)
  assert(navigationAndFooterURLs.length > 0)
  for (const url of navigationAndFooterURLs) {
    const path = internalPath(url)
    if (path) {
      assert(
        migrationOwnedPaths.has(path),
        `Navigation or footer exposes unmatched internal URL ${url}`,
      )
      continue
    }
    const parsed = new URL(url)
    assert.equal(parsed.protocol, 'https:')
    assert.equal(parsed.hostname, 'www.trayport.com')
    navigationFooterLiveFallbacks.add(parsed.pathname)
  }
  assert.equal(navigationFooterLiveFallbacks.size, expectedNavigationFooterLiveFallbacks)
  assert.equal(
    Array.isArray(navigation.data.primaryItems) ? navigation.data.primaryItems.length : 0,
    5,
  )
  const resourceNavigation = objectValue(arrayValue(navigation.data.primaryItems)[4])
  const productNavigation = objectValue(arrayValue(navigation.data.primaryItems)[1])
  assert.equal(arrayValue(productNavigation.groups).length, 6)
  assert.equal(arrayValue(resourceNavigation.groups).length, 4)
  assert.deepEqual(
    arrayValue(navigation.data.utilityItems).map((item) => objectValue(item).icon),
    ['playCircle', 'calendar', 'messages'],
  )
  assert.deepEqual(
    arrayValue(resourceNavigation.children)
      .map(objectValue)
      .slice(-4)
      .map((item) => objectValue(item.link).url),
    ['/venue/', '/market-coverage/', '/contact/', '/request-a-demo/'],
  )
  assert(!/commodities report|2233/i.test(JSON.stringify(navigation.data)))
  const footerColumns = arrayValue(footer.data.columns).map(objectValue)
  assert.equal(footerColumns.length, 3)
  const footerLinkCount = footerColumns.reduce(
    (count, column) =>
      count +
      arrayValue(column.links).length +
      (Object.keys(objectValue(column.titleLink)).length ? 1 : 0),
    0,
  )
  assert.equal(footerLinkCount, 13)
  assert.equal(objectValue(footerColumns[2]).title, 'Legal')
  assert.equal(
    objectValue(footer.data).companyRegistrationText,
    'Trayport Limited is a private limited company registered in England and Wales (Registered No. 02769279 ) whose registered office is Trayport Limited, 3rd Floor, 2 Gresham Street, London, EC2V 7AD',
  )
  assert.equal(
    objectValue(footer.data).parentCompanyText,
    'Trayport Holdings Limited is a wholly-owned subsidiary of TMX Group Limited (TMX Group).',
  )
  const settings = targets.find(
    ({ target, globalSlug }) => target === 'global' && globalSlug === 'site-settings',
  )
  assert(settings)
  assert.deepEqual(objectValue(settings.data.cookieNotice), {
    acceptLabel: 'Accept All',
    enabled: true,
    message:
      'By clicking “Accept All”, you agree to the storing of cookies on your device to enhance site navigation, analyse site usage, and assist in our marketing efforts. For more information please refer to our',
    policyLinkLabel: 'Cookie Policy',
    policyPage: { $legacyRef: 'page', legacyId: 7589 },
    policyURL: '/legal/cookie-policy/',
    rejectLabel: 'Reject All',
    title: 'Trayport Cookie Consent',
  })

  const report: AcceptanceReport = {
    ok: true,
    runId,
    checks: {
      targetRecords: targets.length,
      legacyReferences: targetGraph.legacyReferences,
      uniqueTargetIdentities: targetGraph.uniqueTargetIdentities,
      pages: expectedPageTargets,
      bannerTargetPages: sourceBannerTargetPages.length,
      bannerActionPages: sourceBannerActionPages.length,
      bannerDependencyPages: sourceBannerDependencyPages.length,
      banners: banners.length,
      articles: 71,
      fullArticles: 2,
      listingArticles: 69,
      hubs: 72,
      venues: 66,
      venueWebsitesHTTPS: true,
      learningVideos: 15,
      learningListingVideos: 14,
      offices: 4,
      lifecycleItems: lifecycleItems.length,
      articleCategories: 3,
      learningVideoCategories: 11,
      media: sourceMedia.length,
      fingerprintedMedia: sourceMedia.filter(({ fileHash }) => fileHash !== null).length,
      eexConnections: 37,
      eexSeoKeptOutOfVisibleContent: true,
      eexSourceOrderPreserved: true,
      marketMatrixVenueRows: 64,
      marketMatrixConnections: 655,
      marketMatrixDirectConnections: 417,
      marketMatrixAutoTraderConnections: 20,
      marketMatrixDualConnections: 218,
      marketMatrixDuplicateMergeValidated: true,
      germanConnectionOrderPreserved: true,
      germanHeaderMediaBridge:
        sourceMedia.find(({ legacyId }) => legacyId === 9727)?.availability === 'unavailable',
      dataCharts: dataChartCount,
      routableDocuments: pilotRootCount + sourceBannerDependencyPages.length,
      deferredHubSpotForms,
      protectedVideoExcluded: true,
      redirects: 2,
      globals: 3,
      footerLinks: 13,
      importedContentURLs: contentURLs.length,
      importedContentReferences: contentLinkReferences.length,
      navigationFooterLinksClosed: navigationAndFooterURLs.length,
      navigationFooterLiveFallbacks: navigationFooterLiveFallbacks.size,
      cookieNoticeImported: true,
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
