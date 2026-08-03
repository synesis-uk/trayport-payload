// @vitest-environment node

import fs from 'node:fs'
import path from 'node:path'

import config from '@/payload.config'
import type { FAQComponent, Page } from '@/payload-types'
import { redirects as nextRedirects } from '../../redirects'
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

const documentByLegacyID = <T extends { legacySource?: { legacyId?: number | null } | null }>(
  documents: T[],
  legacyID: number,
): T => {
  const document = documents.find(({ legacySource }) => legacySource?.legacyId === legacyID)
  if (!document) throw new Error(`Missing imported WordPress document ${legacyID}`)
  return document
}

const pageComponents = (page: Page) =>
  page.layout.flatMap((block) =>
    block.blockType === 'contentSection'
      ? block.columns.flatMap(({ components }) => components)
      : [],
  )

const faqComponents = (page: Page): FAQComponent[] =>
  pageComponents(page).filter(
    (component): component is FAQComponent => component.blockType === 'faq',
  )

const relationshipID = (value: number | { id: number }): number =>
  typeof value === 'number' ? value : value.id

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
      articleCategories: 3,
      articles: 71,
      connectedVenues: 21,
      deferredHubSpotForms: 3,
      eexConnections: 37,
      eventArticles: 1,
      featuredInsights: 4,
      footerColumns: 3,
      fingerprintedMedia: 104,
      insightsArticles: 39,
      learningListingVideos: 14,
      learningVideos: 15,
      mapHubs: 55,
      mapMarkers: 58,
      marketRows: 1194,
      media: 124,
      newsArticles: 31,
      offices: 4,
      pages: 9,
      protectedVideoExcluded: true,
      roots: 14,
      unavailableMedia: 20,
    })
    expect(transformed.ok).toBe(true)
    expect(transformed.checks).toMatchObject({
      articles: 71,
      commoditiesReportExcluded: true,
      eexConnections: 37,
      fullArticles: 2,
      fingerprintedMedia: 104,
      globals: 3,
      hubs: 55,
      learningListingVideos: 14,
      learningVideos: 15,
      listingArticles: 69,
      media: 124,
      offices: 4,
      pages: 9,
      protectedVideoExcluded: true,
      redirects: 1,
      routableDocuments: 14,
      uniqueTargetIdentities: 328,
      venues: 21,
    })
    expect(review.missingMedia.map(({ legacyId }) => legacyId).sort((a, b) => a - b)).toEqual([
      8337, 9158, 9698, 9727, 11573, 11721, 11722, 11723, 11724, 11725, 11726, 11727, 11728, 11729,
      11730, 11731, 11732, 11733, 11734, 11735,
    ])
    expect(review.altTextReview).toHaveLength(112)
  })

  it('loads the nine pages and 71 articles with their agreed route policies', async () => {
    const [pages, articles] = await Promise.all([
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
    ])

    expect(pages.docs).toHaveLength(9)
    expect(articles.docs).toHaveLength(71)
    expect(
      articles.docs.filter(({ articleType, featured }) => articleType === 'insight' && featured),
    ).toHaveLength(4)
    expect(
      articles.docs.filter(({ articleType, featured }) => articleType === 'news' && featured),
    ).toHaveLength(1)
    expect(pages.docs.find(({ legacySource }) => legacySource?.legacyId === 1898)?.pageType).toBe(
      'homepage',
    )

    const fullArticles = articles.docs.filter(({ contentMode }) => contentMode === 'full')
    const listingArticles = articles.docs.filter(({ contentMode }) => contentMode === 'listing')
    expect(fullArticles).toHaveLength(2)
    expect(listingArticles).toHaveLength(69)
    expect(fullArticles.map(({ path }) => path).sort()).toEqual([
      '/event/e-world-2026/',
      '/insights/on-demand-webinar-data-analytics-for-energy-traders/',
    ])
    expect(listingArticles.every(({ path }) => path === null)).toBe(true)
    expect(
      listingArticles.every(
        ({ externalDestination }) =>
          typeof externalDestination === 'string' &&
          externalDestination.startsWith('https://www.trayport.com/'),
      ),
    ).toBe(true)
    const routableDocuments = [...pages.docs, ...articles.docs]
    const separatelyOwnedRouteIDs = new Set([2495, 8454, 3363])
    for (const route of representativeRoutes.filter(
      ({ legacyId }) => !separatelyOwnedRouteIDs.has(legacyId),
    )) {
      const document = routableDocuments.find(
        ({ legacySource }) => legacySource?.legacyId === route.legacyId,
      )
      expect(document, `Missing WordPress ${route.legacyId}`).toBeDefined()
      expect(document?.path).toBe(route.path)
    }
  })

  it('loads the Office Locations route and its four ordered office records', async () => {
    const [pages, offices] = await Promise.all([
      payload.find({
        collection: 'pages',
        depth: 0,
        limit: 20,
        overrideAccess: true,
        pagination: false,
        where: wordpressWhere,
      }),
      payload.find({
        collection: 'offices',
        depth: 0,
        limit: 20,
        overrideAccess: true,
        pagination: false,
        sort: 'displayOrder',
        where: wordpressWhere,
      }),
    ])

    const officePage = documentByLegacyID(pages.docs, 2205)
    expect(officePage).toMatchObject({
      pageType: 'standard',
      path: '/company/offices/',
      title: 'Office Locations',
    })

    const officeComponents = pageComponents(officePage).filter(
      (component) => component.blockType === 'office',
    )
    expect(officeComponents).toHaveLength(4)
    expect(
      officeComponents.map(({ office }) => relationshipID(office)).sort((a, b) => a - b),
    ).toEqual(offices.docs.map(({ id }) => id).sort((a, b) => a - b))
    expect(
      offices.docs.map(({ country, displayOrder, legacySource, title }) => ({
        country,
        displayOrder,
        legacyId: legacySource?.legacyId,
        title,
      })),
    ).toEqual([
      { country: 'United Kingdom', displayOrder: 0, legacyId: 4052, title: 'Head Office' },
      { country: 'Austria', displayOrder: 1, legacyId: 4055, title: 'Austria' },
      { country: 'Germany', displayOrder: 2, legacyId: 4056, title: 'Germany' },
      { country: 'Singapore', displayOrder: 3, legacyId: 4057, title: 'Singapore' },
    ])
  })

  it('loads Tradesignal and FAQs as distinct managed page structures', async () => {
    const pages = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 20,
      overrideAccess: true,
      pagination: false,
      where: wordpressWhere,
    })
    const tradesignal = documentByLegacyID(pages.docs, 1926)
    const faqPage = documentByLegacyID(pages.docs, 7609)

    expect(tradesignal).toMatchObject({
      pageType: 'product',
      path: '/products/tradesignal/',
      title: 'Tradesignal',
    })
    expect(tradesignal.layout.map(({ blockType }) => blockType)).toEqual([
      'trayportHero',
      'contentSection',
      'contentSection',
      'contentSection',
      'contentSection',
      'contentSection',
      'contentSection',
    ])
    expect(faqComponents(tradesignal)[0]?.items).toHaveLength(5)
    expect(JSON.stringify(tradesignal.layout)).not.toMatch(/"blockType":"form"/)

    expect(faqPage).toMatchObject({
      pageType: 'standard',
      path: '/resources/faqs/',
      title: 'FAQs',
    })
    expect(faqComponents(faqPage)[0]?.items).toHaveLength(6)
  })

  it('loads the News index and E-World event with separate listing and detail policies', async () => {
    const [pages, articles] = await Promise.all([
      payload.find({
        collection: 'pages',
        depth: 0,
        limit: 20,
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
        where: wordpressWhere,
      }),
    ])
    const newsPage = documentByLegacyID(pages.docs, 9244)
    const event = documentByLegacyID(articles.docs, 10030)
    const newsArticles = articles.docs.filter(({ articleType }) => articleType === 'news')

    expect(newsPage).toMatchObject({
      pageType: 'index',
      path: '/resources/news/',
      title: 'News',
    })
    expect(newsPage.layout.find(({ blockType }) => blockType === 'articleListing')).toMatchObject({
      blockType: 'articleListing',
      family: 'news',
    })
    expect(newsArticles).toHaveLength(31)
    expect(
      newsArticles.every(
        ({ contentMode, externalDestination, path }) =>
          contentMode === 'listing' &&
          path === null &&
          externalDestination?.startsWith('https://www.trayport.com/'),
      ),
    ).toBe(true)

    expect(event).toMatchObject({
      articleType: 'event',
      contentMode: 'full',
      externalDestination: null,
      path: '/event/e-world-2026/',
      title: 'Trayport confirms participation at E-World 2026',
    })
    expect(event.layout).toHaveLength(3)
    expect(JSON.stringify(event.layout)).not.toMatch(/"blockType":"form"/)
  })

  it('loads the Learning Hub index and a metadata-only subscriber gate', async () => {
    const [pages, learningVideos, media] = await Promise.all([
      payload.find({
        collection: 'pages',
        depth: 0,
        limit: 20,
        overrideAccess: true,
        pagination: false,
        where: wordpressWhere,
      }),
      payload.find({
        collection: 'learning-videos',
        depth: 0,
        limit: 100,
        overrideAccess: true,
        pagination: false,
        where: wordpressWhere,
      }),
      payload.find({
        collection: 'media',
        depth: 0,
        limit: 200,
        overrideAccess: true,
        pagination: false,
        where: wordpressWhere,
      }),
    ])
    const learningHub = documentByLegacyID(pages.docs, 3311)
    const gate = documentByLegacyID(learningVideos.docs, 8454)
    const listingVideos = learningVideos.docs.filter(({ contentMode }) => contentMode === 'listing')

    expect(learningHub).toMatchObject({
      pageType: 'index',
      path: '/learning-hub/',
      title: 'Learning Hub',
    })
    expect(
      learningHub.layout.filter(({ blockType }) => blockType === 'learningVideoListing'),
    ).toHaveLength(1)
    expect(learningVideos.docs).toHaveLength(15)
    expect(listingVideos).toHaveLength(14)
    expect(
      listingVideos.every(
        ({ accessMode, externalDestination, path }) =>
          accessMode === 'subscriber' &&
          path === null &&
          externalDestination?.startsWith('https://www.trayport.com/learning-hub/watch/'),
      ),
    ).toBe(true)

    expect(gate).toMatchObject({
      accessMode: 'subscriber',
      contentMode: 'full',
      externalDestination: null,
      externalVideoURL: '',
      path: '/learning-hub-video/trading-in-joule/',
      title: 'Trading in Joule',
      video: null,
    })
    expect(gate.poster).not.toBeNull()
    const poster = media.docs.find(({ id }) => id === relationshipID(gate.poster!))
    expect(poster?.legacySource?.legacyId).toBe(11728)
    expect(media.docs.some(({ legacySource }) => legacySource?.legacyId === 8455)).toBe(false)
  })

  it('owns the Trading in Joule legacy alias through a Payload redirect and route claim', async () => {
    const aliasPath = '/learning-hub/watch/trading-in-joule/'
    const canonicalPath = '/learning-hub-video/trading-in-joule/'
    const [learningVideos, redirects, claims] = await Promise.all([
      payload.find({
        collection: 'learning-videos',
        depth: 0,
        limit: 20,
        overrideAccess: true,
        pagination: false,
        where: wordpressWhere,
      }),
      payload.find({
        collection: 'redirects',
        depth: 0,
        limit: 10,
        overrideAccess: true,
        pagination: false,
        where: { from: { equals: aliasPath } },
      }),
      payload.find({
        collection: 'route-registry',
        depth: 0,
        limit: 10,
        overrideAccess: true,
        pagination: false,
        where: { path: { in: [aliasPath, canonicalPath] } },
      }),
    ])

    const gate = documentByLegacyID(learningVideos.docs, 8454)
    expect(redirects.docs).toHaveLength(1)
    const managedRedirect = redirects.docs[0]
    expect(managedRedirect).toMatchObject({ from: aliasPath, type: '301' })
    expect(managedRedirect?.to?.type).toBe('reference')
    expect(managedRedirect?.to?.reference?.relationTo).toBe('learning-videos')
    expect(relationshipID(managedRedirect!.to!.reference!.value)).toBe(gate.id)

    const aliasClaim = claims.docs.find(({ path }) => path === aliasPath)
    expect(aliasClaim).toMatchObject({
      archetype: 'redirect',
      ownerCollection: 'redirects',
      ownerDocumentId: String(managedRedirect?.id),
      ownerKind: 'redirect',
      state: 'published',
    })
    const canonicalClaim = claims.docs.find(({ path }) => path === canonicalPath)
    expect(canonicalClaim).toMatchObject({
      archetype: 'learning-video.public-detail',
      ownerCollection: 'learning-videos',
      ownerDocumentId: String(gate.id),
      ownerKind: 'content',
      state: 'published',
    })

    if (!nextRedirects) throw new Error('Next redirects configuration is missing.')
    await expect(nextRedirects()).resolves.not.toEqual(
      expect.arrayContaining([expect.objectContaining({ source: aliasPath })]),
    )
  })

  it('loads EEX as a public venue with 37 resolved hub connections', async () => {
    const [venues, hubs] = await Promise.all([
      payload.find({
        collection: 'venues',
        depth: 0,
        limit: 100,
        overrideAccess: true,
        pagination: false,
        where: wordpressWhere,
      }),
      payload.find({
        collection: 'hubs',
        depth: 0,
        limit: 100,
        overrideAccess: true,
        pagination: false,
        where: wordpressWhere,
      }),
    ])
    const eex = documentByLegacyID(venues.docs, 3363)
    const connectionHubIDs = (eex.marketConnections || []).map(({ hub }) => relationshipID(hub))
    const hubIDs = new Set(hubs.docs.map(({ id }) => id))

    expect(eex).toMatchObject({
      contentMode: 'page',
      path: '/venue/eex/',
      title: 'EEX',
    })
    expect(connectionHubIDs).toHaveLength(37)
    expect(new Set(connectionHubIDs)).toHaveLength(37)
    expect(connectionHubIDs.every((id) => hubIDs.has(id))).toBe(true)
    expect(
      countValues(eex.marketConnections || [], ({ connectionType }) => connectionType),
    ).toEqual({ b: 13, d: 24 })
    expect(
      hubs.docs
        .filter(({ id }) => connectionHubIDs.includes(id))
        .map(({ legacySource }) => legacySource?.legacyId),
    ).toEqual(expect.arrayContaining([2490, 3332, 3333, 3336, 6776]))
    expect(
      venues.docs
        .filter(({ legacySource }) => legacySource?.legacyId !== 3363)
        .every(({ contentMode, path }) => contentMode === 'relationship-only' && path === null),
    ).toBe(true)
  })

  it('loads 55 hubs, 58 markers, and German Power relationship totals', async () => {
    const hubs = await payload.find({
      collection: 'hubs',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      pagination: false,
      where: wordpressWhere,
    })
    expect(hubs.docs).toHaveLength(55)
    expect(hubs.docs.flatMap(({ map }) => map?.markers || [])).toHaveLength(58)

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

  it('loads all 124 scoped media identities while retaining the 20-item review report', async () => {
    const media = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 200,
      overrideAccess: true,
      pagination: false,
      where: wordpressWhere,
    })
    expect(media.docs).toHaveLength(124)
    expect(
      media.docs.filter(({ sourceFileHash }) => /^[a-f0-9]{64}$/.test(sourceFileHash || '')),
    ).toHaveLength(104)

    const review = readRunReport<ContentReviewReport>(runDirectory, 'content-review.json')
    expect(review.missingMedia).toHaveLength(20)
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
