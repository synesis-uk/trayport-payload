import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { sourceRecordSchema, type SourceRecord } from '../contracts/v1'
import { migrationConfig } from '../lib/config'
import type { TargetRecord } from '../transform/types'

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

export const validateSource = (
  runId: string,
  runDir: string,
  records: SourceRecord[],
): AcceptanceReport => {
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

  const rootPaths: Record<number, string> = {
    1898: '/',
    1924: '/products/joule/',
    2203: '/company/about-us/',
    2495: '/market-coverage/german-power/',
    9248: '/resources/insights/',
    9351: '/insights/on-demand-webinar-data-analytics-for-energy-traders/',
  }
  for (const [legacyIdText, expectedPath] of Object.entries(rootPaths)) {
    const legacyId = Number(legacyIdText)
    const root = posts.find((post) => post.legacyId === legacyId && post.scopeRole === 'root')
    assert(root, `Missing agreed root ${legacyId}`)
    assert.equal(root.path, expectedPath, `Unexpected path for root ${legacyId}`)
  }

  const pageSectionCounts: Record<number, number> = { 1898: 9, 1924: 9, 2203: 8, 9248: 1 }
  for (const [legacyIdText, expected] of Object.entries(pageSectionCounts)) {
    const post = posts.find(({ legacyId }) => legacyId === Number(legacyIdText))
    assert(post)
    assert.equal(
      Array.isArray(post.acf.sections_new) ? post.acf.sections_new.length : 0,
      expected,
      `Unexpected sections_new count for ${legacyIdText}`,
    )
  }
  const articleRoot = posts.find(({ legacyId }) => legacyId === 9351)
  assert(articleRoot)
  assert.equal(Array.isArray(articleRoot.acf.sections) ? articleRoot.acf.sections.length : 0, 9)

  const articles = posts.filter(({ postType }) => postType === 'post')
  assert.equal(articles.length, 39)
  const featured = articles
    .filter(({ acf }) => acf.featured === true || acf.featured === 1 || acf.featured === '1')
    .sort((left, right) => (left.featuredOrder ?? 99) - (right.featuredOrder ?? 99))
  assert.deepEqual(
    featured.map(({ legacyId }) => legacyId),
    [11694, 11553, 11203, 10790],
  )
  assert.deepEqual(
    featured.map(({ featuredOrder }) => featuredOrder),
    [0, 1, 2, 3],
  )

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

  assert.equal(mapHubs.length, 50)
  assert.equal(
    mapHubs.reduce((total, hub) => total + hub.markers.length, 0),
    55,
  )
  assert.deepEqual(
    sortedNumbers(
      mapHubs.filter(({ markers }) => markers.length === 0).map(({ legacyId }) => legacyId),
    ),
    [10565, 10752],
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

  assert.equal(media.length, 91)
  assert.deepEqual(
    countBy(media, ({ mimeType }) => mimeType),
    {
      'image/jpeg': 44,
      'image/png': 43,
      'image/webp': 1,
      'video/mp4': 3,
    },
  )
  assert.deepEqual(
    sortedNumbers(
      media
        .filter(({ availability }) => availability === 'unavailable')
        .map(({ legacyId }) => legacyId),
    ),
    [8337, 9158, 9698, 9727, 11573],
  )
  assert.equal(media.filter(({ mimeType }) => mimeType.startsWith('image/')).length, 88)
  assert.equal(media.filter(({ needsAltReview }) => needsAltReview).length, 81)
  const videos = media.filter(({ mimeType }) => mimeType.startsWith('video/'))
  assert.deepEqual(sortedNumbers(videos.map(({ legacyId }) => legacyId)), [3990, 7666, 11403])
  assert(videos.every(({ availability, relativePath }) => availability === 'local' && relativePath))

  assert.deepEqual(
    countBy(reusables, ({ postType }) => postType),
    {
      clients: 26,
      features: 1,
      people: 9,
      product: 3,
      'stats-group': 1,
      videos: 1,
    },
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
      roots: 6,
      insightsArticles: 39,
      featuredArticles: 4,
      connectedVenues: 21,
      mapHubs: 50,
      mapMarkers: 55,
      marketRows: 1194,
      media: 91,
      unavailableMedia: 5,
      altTextReview: 81,
      reusables: 41,
      activeNavigationRoots: 5,
      footerColumns: 3,
    },
  }
  fs.writeFileSync(
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
  const counts = countBy(targets, ({ target }) => target)
  assert.equal(counts.pages, 4)
  assert.equal(counts.articles, 39)
  assert.equal(counts.hubs, 50)
  assert.equal(counts.venues, 21)
  assert.equal(counts.media, 91)
  assert.equal(counts.global, 3)

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
  const articles = targets.filter(({ target }) => target === 'articles')
  assert.equal(articles.filter(({ data }) => data.contentMode === 'full').length, 1)
  assert.equal(articles.filter(({ data }) => data.contentMode === 'listing').length, 38)

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
  const localVideos = targetMedia.filter(({ data }) => {
    const source = data.source as { availability?: string; mimeType?: string } | undefined
    return source?.availability === 'local' && source.mimeType?.startsWith('video/')
  })
  assert.deepEqual(
    sortedNumbers(localVideos.map(({ legacy }) => legacy.legacyId)),
    [3990, 7666, 11403],
  )
  assert(localVideos.every(({ data }) => data.externalURL === ''))
  const unavailableMedia = targetMedia.filter(({ data }) => {
    const source = data.source as { availability?: string; originalURL?: string | null } | undefined
    return source?.availability === 'unavailable'
  })
  assert.equal(unavailableMedia.length, 5)
  assert(
    unavailableMedia.every(({ data }) => {
      const source = data.source as { originalURL?: string | null }
      return data.externalURL === source.originalURL
    }),
  )

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
  assert(!/commodities report|2233/i.test(JSON.stringify(navigation.data)))
  assert.equal(Array.isArray(footer.data.columns) ? footer.data.columns.length : 0, 3)

  const report: AcceptanceReport = {
    ok: true,
    runId,
    checks: {
      targetRecords: targets.length,
      pages: 4,
      articles: 39,
      hubs: 50,
      venues: 21,
      media: 91,
      localVideos: 3,
      globals: 3,
      articleBodyBlocks: 9,
      commoditiesReportExcluded: true,
    },
  }
  fs.writeFileSync(
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
  const records = fs
    .readFileSync(path.join(runDir, 'source.ndjson'), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => sourceRecordSchema.parse(JSON.parse(line)))
  const targets = fs
    .readFileSync(path.join(runDir, 'transformed.ndjson'), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as TargetRecord)

  const source = validateSource(runId, runDir, records)
  const transformed = validateTransformed(runId, runDir, targets)
  process.stdout.write(
    `${JSON.stringify({ ok: true, runId, source: source.checks, transformed: transformed.checks }, null, 2)}\n`,
  )
}
