// @vitest-environment node

import fs from 'node:fs'
import path from 'node:path'

import config from '@/payload.config'
import { getPayload, type Payload } from 'payload'
import { Pool } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  type AcceptanceReport,
  type ContentReviewReport,
  readRunReport,
  resolveCompleteMigrationRun,
} from '../helpers/migrationRun'
import { representativeRoutes } from '../helpers/site'

let payload: Payload
let marketPool: Pool
let runDirectory: string

const wordpressWhere = {
  'legacySource.source': {
    equals: 'wordpress',
  },
} as const

const countValues = <T>(values: T[], value: (item: T) => string) =>
  values.reduce<Record<string, number>>((totals, item) => {
    const key = value(item)
    totals[key] = (totals[key] || 0) + 1
    return totals
  }, {})

describe.sequential('post-import acceptance', () => {
  beforeAll(async () => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for import acceptance')

    runDirectory = resolveCompleteMigrationRun()
    payload = await getPayload({ config })
    marketPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
    })
  })

  afterAll(async () => {
    await marketPool?.end()
  })

  it('uses the dedicated migration validator reports as the source-side contract', () => {
    const source = readRunReport<AcceptanceReport>(runDirectory, 'acceptance-source.json')
    const transformed = readRunReport<AcceptanceReport>(runDirectory, 'acceptance-transform.json')
    const review = readRunReport<ContentReviewReport>(runDirectory, 'content-review.json')

    expect(source.ok).toBe(true)
    expect(source.checks).toMatchObject({
      activeNavigationRoots: 5,
      connectedVenues: 21,
      featuredArticles: 4,
      footerColumns: 3,
      insightsArticles: 39,
      mapHubs: 50,
      mapMarkers: 55,
      marketRows: 1194,
      media: 91,
      roots: 6,
      unavailableMedia: 5,
    })
    expect(transformed.ok).toBe(true)
    expect(transformed.checks).toMatchObject({
      articles: 39,
      commoditiesReportExcluded: true,
      globals: 3,
      hubs: 50,
      media: 91,
      pages: 4,
      venues: 21,
    })
    expect(review.missingMedia.map(({ legacyId }) => legacyId).sort((a, b) => a - b)).toEqual([
      8337, 9158, 9698, 9727, 11573,
    ])
    expect(review.altTextReview).toHaveLength(81)
  })

  it('loads the four pages and 39 Insights records with their agreed route policies', async () => {
    const [pages, articles, venues] = await Promise.all([
      payload.find({
        collection: 'pages',
        depth: 0,
        limit: 100,
        overrideAccess: true,
        pagination: false,
        where: wordpressWhere,
      }),
      payload.find({
        collection: 'articles',
        depth: 0,
        limit: 100,
        overrideAccess: true,
        pagination: false,
        where: {
          and: [wordpressWhere, { _status: { equals: 'published' } }],
        },
      }),
      payload.find({
        collection: 'venues',
        depth: 0,
        limit: 100,
        overrideAccess: true,
        pagination: false,
        where: wordpressWhere,
      }),
    ])

    expect(pages.docs).toHaveLength(4)
    expect(articles.docs).toHaveLength(39)
    expect(articles.docs.filter(({ featured }) => featured)).toHaveLength(4)
    expect(pages.docs.find(({ legacySource }) => legacySource?.legacyId === 1898)?.pageType).toBe(
      'homepage',
    )

    const fullArticles = articles.docs.filter(({ contentMode }) => contentMode === 'full')
    const listingArticles = articles.docs.filter(({ contentMode }) => contentMode === 'listing')
    expect(fullArticles).toHaveLength(1)
    expect(listingArticles).toHaveLength(38)
    expect(fullArticles[0]?.path).toBe(
      '/insights/on-demand-webinar-data-analytics-for-energy-traders/',
    )
    expect(listingArticles.every(({ path }) => path === null)).toBe(true)
    expect(
      listingArticles.every(
        ({ externalDestination }) =>
          typeof externalDestination === 'string' &&
          externalDestination.startsWith('https://www.trayport.com/'),
      ),
    ).toBe(true)
    expect(venues.docs).toHaveLength(21)
    expect(
      venues.docs.every(
        ({ contentMode, path }) => contentMode === 'relationship-only' && path === null,
      ),
    ).toBe(true)

    const routableDocuments = [...pages.docs, ...articles.docs]
    for (const route of representativeRoutes.filter(({ legacyId }) => legacyId !== 2495)) {
      const document = routableDocuments.find(
        ({ legacySource }) => legacySource?.legacyId === route.legacyId,
      )
      expect(document, `Missing WordPress ${route.legacyId}`).toBeDefined()
      expect(document?.path).toBe(route.path)
    }
  })

  it('loads 50 hubs, 55 markers, and German Power relationship totals', async () => {
    const hubs = await payload.find({
      collection: 'hubs',
      depth: 2,
      limit: 100,
      overrideAccess: true,
      pagination: false,
      where: wordpressWhere,
    })
    expect(hubs.docs).toHaveLength(50)
    expect(hubs.docs.flatMap(({ map }) => map?.markers || [])).toHaveLength(55)

    const german = hubs.docs.find(({ legacySource }) => legacySource?.legacyId === 2495)
    expect(german).toBeDefined()
    expect(german?.path).toBe('/market-coverage/german-power/')
    expect(german?.connections).toHaveLength(21)
    expect(countValues(german?.connections || [], ({ connectionType }) => connectionType)).toEqual({
      a: 2,
      b: 9,
      d: 10,
    })
    expect(german?.connections?.filter(({ supportsJoule }) => supportsJoule)).toHaveLength(19)
    expect(
      german?.connections?.filter(({ supportsAutoTrader }) => supportsAutoTrader),
    ).toHaveLength(11)
  })

  it('loads all 91 scoped media identities while retaining the five-item review report', async () => {
    const media = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 200,
      overrideAccess: true,
      pagination: false,
      where: wordpressWhere,
    })
    expect(media.docs).toHaveLength(91)

    const review = readRunReport<ContentReviewReport>(runDirectory, 'content-review.json')
    expect(review.missingMedia).toHaveLength(5)
    for (const missing of review.missingMedia) {
      expect(
        media.docs.some(({ legacySource }) => legacySource?.legacyId === missing.legacyId),
        `Missing media review placeholder for WordPress ${missing.legacyId}`,
      ).toBe(true)
    }
  })

  it('loads the three managed globals from active option data', async () => {
    const [navigation, footer, settings] = await Promise.all([
      payload.findGlobal({
        slug: 'navigation',
        depth: 1,
        draft: false,
        overrideAccess: false,
      }),
      payload.findGlobal({
        slug: 'footer',
        depth: 1,
        draft: false,
        overrideAccess: false,
      }),
      payload.findGlobal({
        slug: 'site-settings',
        depth: 1,
        draft: false,
        overrideAccess: false,
      }),
    ])

    expect(navigation.primaryItems).toHaveLength(5)
    expect(navigation.primaryItems?.map(({ label }) => label)).toEqual([
      'Company',
      'Products',
      'Markets',
      'Regions',
      'Resources',
    ])
    expect(JSON.stringify(navigation)).not.toMatch(/commodities report/i)
    expect(footer.columns).toHaveLength(3)
    expect(settings.siteName).toBe('Trayport')
    expect(settings.socialLinks).toHaveLength(2)
  })

  it('loads exactly 1,194 app-owned market rows outside Payload', async () => {
    const result = await marketPool.query<{
      asset_class_legacy_id: number
      rows: number
    }>(`
      SELECT asset_class_legacy_id::int, count(*)::int AS rows
      FROM app.market_volume_monthly
      GROUP BY asset_class_legacy_id
      ORDER BY asset_class_legacy_id
    `)

    expect(result.rows).toEqual([
      { asset_class_legacy_id: 21, rows: 595 },
      { asset_class_legacy_id: 22, rows: 599 },
    ])
    expect(result.rows.reduce((total, item) => total + item.rows, 0)).toBe(1194)

    const marketReportPath = path.join(runDirectory, 'reports', 'market-load.json')
    if (fs.existsSync(marketReportPath)) {
      const marketReport = JSON.parse(fs.readFileSync(marketReportPath, 'utf8')) as {
        importedRows: number
        scopeRowsAfterLoad: number
      }
      expect(marketReport.importedRows).toBe(1194)
      expect(marketReport.scopeRowsAfterLoad).toBe(1194)
    }
  })
})
