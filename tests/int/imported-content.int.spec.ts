// @vitest-environment node

import fs from 'node:fs'
import path from 'node:path'

import config from '@/payload.config'
import type {
  DataChartComponent,
  FAQComponent,
  FeatureListComponent,
  MarketCoverageComponent,
  Page,
  StandaloneIconComponent,
} from '@/payload-types'
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
import { managedRedirectRoutes, representativeRoutes } from '../helpers/site'

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

const featureListComponents = (page: Page): FeatureListComponent[] =>
  pageComponents(page).filter(
    (component): component is FeatureListComponent => component.blockType === 'featureList',
  )

const dataChartComponents = (page: Page): DataChartComponent[] =>
  pageComponents(page).filter(
    (component): component is DataChartComponent => component.blockType === 'dataChart',
  )

const relationshipID = (value: number | { id: number }): number =>
  typeof value === 'number' ? value : value.id

const collectURLs = (value: unknown, urls: string[]): void => {
  if (Array.isArray(value)) {
    value.forEach((child) => collectURLs(child, urls))
    return
  }
  if (!value || typeof value !== 'object') return
  const object = value as Record<string, unknown>
  if (object.type === 'custom' && typeof object.url === 'string' && object.url) {
    urls.push(object.url)
  }
  Object.values(object).forEach((child) => collectURLs(child, urls))
}

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
      assetClasses: 12,
      articles: 71,
      banners: 4,
      bannerActionPages: 1,
      bannerDependencyPages: 5,
      bannerTargetPages: 4,
      connectedVenues: 21,
      deferredHubSpotForms: 5,
      eexConnections: 37,
      eventArticles: 1,
      featuredInsights: 4,
      cookieNoticeImported: true,
      footerColumns: 3,
      footerLinks: 13,
      insightsArticles: 39,
      learningListingVideos: 14,
      learningVideos: 15,
      mapHubs: 72,
      mapMarkers: 62,
      marketMatrixHubs: 72,
      marketMatrixSourceConnections: 657,
      marketMatrixUniqueConnections: 655,
      marketMatrixVenueRows: 64,
      marketMatrixVenues: 66,
      marketRows: 1194,
      newsArticles: 31,
      offices: 4,
      pages: 27,
      protectedVideoExcluded: true,
      roots: 27,
      venueTypes: 3,
    })
    expect(transformed.ok).toBe(true)
    expect(transformed.checks).toMatchObject({
      articles: 71,
      banners: 4,
      bannerActionPages: 1,
      bannerDependencyPages: 5,
      bannerTargetPages: 4,
      commoditiesReportExcluded: true,
      eexConnections: 37,
      fullArticles: 2,
      globals: 3,
      cookieNoticeImported: true,
      footerLinks: 13,
      hubs: 72,
      learningListingVideos: 14,
      learningVideos: 15,
      listingArticles: 69,
      offices: 4,
      pages: 26,
      deferredHubSpotForms: 7,
      protectedVideoExcluded: true,
      redirects: 2,
      routableDocuments: 32,
      marketMatrixAutoTraderConnections: 20,
      marketMatrixConnections: 655,
      marketMatrixDirectConnections: 417,
      marketMatrixDualConnections: 218,
      marketMatrixDuplicateMergeValidated: true,
      marketMatrixVenueRows: 64,
      navigationFooterLiveFallbacks: 30,
      venues: 66,
      venueWebsitesHTTPS: true,
    })
    expect(review.missingMedia).toHaveLength(Number(source.checks.unavailableMedia))
    expect(review.altTextReview).toHaveLength(Number(source.checks.altTextReview))
    expect(new Set(review.missingMedia.map(({ legacyId }) => legacyId)).size).toBe(
      review.missingMedia.length,
    )
  })

  it('loads 26 Pages, including banner dependencies, and 71 Articles', async () => {
    const [pages, articles, assetClasses] = await Promise.all([
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
        collection: 'asset-classes',
        depth: 0,
        limit: 100,
        overrideAccess: true,
        pagination: false,
        where: wordpressWhere,
      }),
    ])

    expect(pages.docs).toHaveLength(26)
    expect(articles.docs).toHaveLength(71)
    expect(
      articles.docs.filter(({ articleType, featured }) => articleType === 'insight' && featured),
    ).toHaveLength(4)
    expect(
      articles.docs.filter(({ articleType, featured }) => articleType === 'news' && featured),
    ).toHaveLength(1)
    expect(
      articles.docs.find(({ legacySource }) => legacySource?.legacyId === 11694),
    ).toMatchObject({
      displayDate: '2026-07-10T00:00:00.000Z',
      publishedAt: '2026-07-17T08:47:31.000Z',
    })
    expect(pages.docs.find(({ legacySource }) => legacySource?.legacyId === 1898)?.pageType).toBe(
      'homepage',
    )
    const cookiePolicy = documentByLegacyID(pages.docs, 7589)
    expect(cookiePolicy).toMatchObject({
      pageType: 'legal',
      path: '/legal/cookie-policy/',
      title: 'Cookie and Privacy Policy',
    })
    expect(JSON.stringify(cookiePolicy.layout)).toContain('WHAT ARE COOKIES?')

    const power = documentByLegacyID(assetClasses.docs, 21)
    const gas = documentByLegacyID(assetClasses.docs, 22)
    const marketsMapPage = documentByLegacyID(pages.docs, 5920)
    expect(marketsMapPage).toMatchObject({
      path: '/resources/markets-map/',
      title: 'Markets Map',
    })
    const marketsMap = pageComponents(marketsMapPage).find(
      (component): component is MarketCoverageComponent =>
        component.blockType === 'marketCoverage' && component.mode === 'regionalConnectivity',
    )
    expect(marketsMap).toMatchObject({
      dataDisplay: 'always',
      height: 650,
      mode: 'regionalConnectivity',
      presentation: 'mapOnly',
      showMarketData: true,
      showSidebar: true,
    })
    expect(relationshipID(marketsMap!.defaultAssetClass!)).toBe(power.id)

    const europe = documentByLegacyID(pages.docs, 5981)
    const europeMap = pageComponents(europe).find(
      (component): component is MarketCoverageComponent =>
        component.blockType === 'marketCoverage' && component.mode === 'regionalConnectivity',
    )
    expect(relationshipID(europeMap!.defaultAssetClass!)).toBe(gas.id)

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

  it('loads all four WordPress banners and preserves the currently active Page targeting', async () => {
    const banners = await payload.find({
      collection: 'banners',
      depth: 1,
      limit: 10,
      overrideAccess: true,
      pagination: false,
      sort: 'priority',
      where: wordpressWhere,
    })

    expect(banners.docs).toHaveLength(4)
    expect(banners.docs.map(({ legacySource }) => legacySource?.legacyId)).toEqual([
      11602, 7597, 4363, 4362,
    ])
    const active = documentByLegacyID(banners.docs, 11602)
    expect(active).toMatchObject({
      _status: 'published',
      endAt: '2026-12-31T17:00:00.000Z',
      layout: 'small',
      position: 'first',
      startAt: '2026-07-20T00:00:00.000Z',
      targetMode: 'specific',
      tone: 'cyan',
    })
    const targetPageIDs = (active.targetPages || []).map(relationshipID)
    const targetPages = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 2,
      overrideAccess: true,
      pagination: false,
      where: { id: { in: targetPageIDs } },
    })
    expect(targetPages.docs.map(({ legacySource }) => legacySource?.legacyId).sort()).toEqual([
      1940, 6773,
    ])
    expect(active.migratedRecipientEmails).toEqual([
      expect.objectContaining({ email: 'sophie.inghamclark@trayport.com' }),
    ])
    expect(active.notifyUsers).toEqual([])
  })

  it('imports the active Home and Joule presentation semantics into typed fields', async () => {
    const pages = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      pagination: false,
      where: wordpressWhere,
    })
    const home = documentByLegacyID(pages.docs, 1898)
    const joule = documentByLegacyID(pages.docs, 1924)
    const homeHero = home.layout.find(({ blockType }) => blockType === 'trayportHero')
    const jouleHero = joule.layout.find(({ blockType }) => blockType === 'trayportHero')
    if (!homeHero || homeHero.blockType !== 'trayportHero') {
      throw new Error('Missing imported Home hero')
    }
    if (!jouleHero || jouleHero.blockType !== 'trayportHero') {
      throw new Error('Missing imported Joule hero')
    }

    expect(homeHero).toMatchObject({
      mediaAspect: 'twoToOne',
      actions: [
        {
          icon: 'chart',
          label: 'See Joule Energy Trading Solution',
          style: 'link',
        },
        {
          icon: 'forward',
          label: 'Book A Demo and Learn More',
          style: 'link',
        },
      ],
    })
    expect(homeHero.actions).toHaveLength(2)
    expect(JSON.stringify(homeHero)).not.toContain('See The Markets We Serve')

    expect(jouleHero).toMatchObject({
      badgeIcon: 'tradingScreen',
      badgeLabel: 'Trayport Joule',
      badgeTone: 'info',
      mediaAspect: 'twoToOne',
      actions: [
        { label: 'Learn About Joule', style: 'secondary' },
        { label: 'Request A Demo', style: 'info' },
      ],
    })
    expect(jouleHero.actions).toHaveLength(2)

    const marketOverview = home.layout.find(
      (block) =>
        block.blockType === 'contentSection' &&
        block.columns.some(({ components }) =>
          components.some(
            (component) =>
              component.blockType === 'heading' && component.text === 'Market Overview',
          ),
        ),
    )
    expect(marketOverview).toMatchObject({
      columnGap: 'tight',
      spacingBottom: 'regular',
      spacingTop: 'regular',
      surfacePadding: 'none',
      surfaceRadius: 'default',
      surfaceTone: 'none',
      wrapperTheme: 'none',
    })
    if (!marketOverview || marketOverview.blockType !== 'contentSection') {
      throw new Error('Missing imported Home market overview section')
    }
    expect(
      marketOverview.columns
        .filter(({ surface }) => surface === 'muted')
        .map(
          ({
            backgroundMedia,
            backgroundOpacity,
            componentGap,
            horizontalAlign,
            padding,
            radius,
            verticalAlign,
          }) => ({
            backgroundMedia: Boolean(backgroundMedia),
            backgroundOpacity,
            componentGap,
            horizontalAlign,
            padding,
            radius,
            verticalAlign,
          }),
        ),
    ).toEqual([
      {
        backgroundMedia: true,
        backgroundOpacity: '10',
        componentGap: 'none',
        horizontalAlign: 'center',
        padding: 'medium',
        radius: 'xl',
        verticalAlign: 'center',
      },
      {
        backgroundMedia: true,
        backgroundOpacity: '10',
        componentGap: 'none',
        horizontalAlign: 'center',
        padding: 'medium',
        radius: 'xl',
        verticalAlign: 'center',
      },
      {
        backgroundMedia: true,
        backgroundOpacity: '10',
        componentGap: 'none',
        horizontalAlign: 'center',
        padding: 'medium',
        radius: 'xl',
        verticalAlign: 'center',
      },
    ])

    const jouleMobile = joule.layout.find(
      (block) => block.blockType === 'contentSection' && block.anchor === 'joule-mobile',
    )
    expect(jouleMobile).toMatchObject({
      spacingBottom: 'large',
      spacingTop: 'regular',
      surfacePadding: 'medium',
      surfaceRadius: 'xl',
      surfaceTone: 'dark',
      wrapperTheme: 'none',
    })

    const homeHeadingTexts = home.layout
      .filter((block) => block.blockType === 'contentSection')
      .flatMap(({ columns }) => columns)
      .flatMap(({ components }) => components)
      .filter((component) => component.blockType === 'heading')
      .map(({ text }) => text)
    expect(homeHeadingTexts).not.toContain('Why Trayport?')
    expect(homeHeadingTexts).not.toContain('Who we serve')

    const homeCoverage = pageComponents(home).find(
      (component): component is MarketCoverageComponent => component.blockType === 'marketCoverage',
    )
    expect(homeCoverage).toMatchObject({
      height: 350,
      lineColor: '#009cde',
      lineOpacity: 0.5,
      lineWidth: 0.2,
      markerSize: 3,
      presentation: 'mapOnly',
      showLines: true,
      title: 'Explore our connectivity',
    })

    const featureContaining = (page: Page, title: string): FeatureListComponent => {
      const feature = featureListComponents(page).find(({ items }) =>
        items.some((item) => item.title === title),
      )
      if (!feature) throw new Error(`Missing imported feature list containing ${title}`)
      return feature
    }
    const homeProducts = featureContaining(home, 'Joule')
    expect(homeProducts.presentation).toBe('leadCarousel')
    expect(homeProducts.items).toHaveLength(8)
    expect(
      homeProducts.items.every(({ display, showAction }) => display === 'image' && showAction),
    ).toBe(true)
    expect(homeProducts.items[0]).toMatchObject({ actionStyle: 'accent', title: 'Joule' })
    expect(
      pageComponents(home)
        .filter(
          (component): component is StandaloneIconComponent =>
            component.blockType === 'standaloneIcon',
        )
        .map(({ icon }) => icon),
    ).toEqual(['gas', 'power', 'emissions'])

    expect(featureContaining(joule, 'Complete Market View')).toMatchObject({
      presentation: 'carousel',
    })
    expect(featureContaining(joule, 'Faster & Safer Login Using Biometrics')).toMatchObject({
      presentation: 'carousel',
    })
    const relatedProducts = featureContaining(joule, 'Automated Trading')
    expect(relatedProducts.presentation).toBe('grid')
    expect(relatedProducts.items).toHaveLength(3)
    expect(
      relatedProducts.items.every(({ display, showAction }) => display === 'image' && showAction),
    ).toBe(true)
    expect(relatedProducts.items.map(({ actionIcon }) => actionIcon)).toEqual([
      'forward',
      'forward',
      'people',
    ])
  })

  it('imports the six active chart signatures and managed hub filters exactly', async () => {
    const [pages, hubs] = await Promise.all([
      payload.find({
        collection: 'pages',
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
    const hubLegacyIDByID = new Map(
      hubs.docs.map((hub) => [String(hub.id), hub.legacySource?.legacyId]),
    )
    const evidence = [
      documentByLegacyID(pages.docs, 1898),
      documentByLegacyID(pages.docs, 5983),
      documentByLegacyID(pages.docs, 5981),
    ].flatMap((page) =>
      dataChartComponents(page).map((chart) => ({
        assetClassLegacyId: chart.assetClassLegacyId,
        chartType: chart.chartType,
        dataType: chart.dataType,
        displayInterval: chart.displayInterval,
        excludedHubLegacyIds: (chart.excludedHubs || []).map((hub) =>
          hubLegacyIDByID.get(String(relationshipID(hub))),
        ),
        includedHubLegacyIds: (chart.includedHubs || []).map((hub) =>
          hubLegacyIDByID.get(String(relationshipID(hub))),
        ),
        seriesDimension: chart.seriesDimension,
        title: chart.title,
      })),
    )

    expect(evidence).toEqual([
      {
        assetClassLegacyId: 22,
        chartType: 'stackedColumn',
        dataType: 'volume',
        displayInterval: 'quarter',
        excludedHubLegacyIds: [],
        includedHubLegacyIds: [],
        seriesDimension: 'executionType',
        title: 'Traded Gas Volumes by Execution (Quarterly)',
      },
      {
        assetClassLegacyId: 21,
        chartType: 'stackedColumn',
        dataType: 'volume',
        displayInterval: 'quarter',
        excludedHubLegacyIds: [],
        includedHubLegacyIds: [],
        seriesDimension: 'executionType',
        title: 'Traded Power Volumes by Execution (Quarterly)',
      },
      {
        assetClassLegacyId: 21,
        chartType: 'column',
        dataType: 'volume',
        displayInterval: 'month',
        excludedHubLegacyIds: [],
        includedHubLegacyIds: [2500],
        seriesDimension: 'hub',
        title: 'Japan Power Market by Volume',
      },
      {
        assetClassLegacyId: 21,
        chartType: 'column',
        dataType: 'volume',
        displayInterval: 'year',
        excludedHubLegacyIds: [2511, 2496, 2500],
        includedHubLegacyIds: [],
        seriesDimension: 'hub',
        title: 'Power Volumes by Hub',
      },
      {
        assetClassLegacyId: 21,
        chartType: 'line',
        dataType: 'price',
        displayInterval: 'month',
        excludedHubLegacyIds: [],
        includedHubLegacyIds: [2513, 2495, 2494, 2499, 2502],
        seriesDimension: 'hub',
        title: 'Power Prices from Commodities Report (front month = Jan 2025)',
      },
      {
        assetClassLegacyId: 22,
        chartType: 'column',
        dataType: 'volume',
        displayInterval: 'quarter',
        excludedHubLegacyIds: [],
        includedHubLegacyIds: [3315, 3316, 3320, 2488],
        seriesDimension: 'hub',
        title: 'Gas Volumes by Hub',
      },
    ])
  })

  it('loads the Market Matrix control and Contact details without deferred form copy', async () => {
    const [pages, offices] = await Promise.all([
      payload.find({
        collection: 'pages',
        depth: 0,
        limit: 25,
        overrideAccess: true,
        pagination: false,
        where: wordpressWhere,
      }),
      payload.find({
        collection: 'offices',
        depth: 0,
        limit: 10,
        overrideAccess: true,
        pagination: false,
        where: wordpressWhere,
      }),
    ])

    const matrixPage = documentByLegacyID(pages.docs, 2231)
    const matrixComponents = pageComponents(matrixPage).filter(
      (component) => component.blockType === 'marketMatrix',
    )
    expect(matrixComponents).toHaveLength(1)
    expect(matrixComponents[0]).toMatchObject({
      assetClasses: [],
      caption: 'Trayport venue connectivity by market hub',
      defaultView: 'joule',
      regions: [],
      showDownload: true,
      showFilters: true,
      venueTypes: [],
    })

    const contactPage = documentByLegacyID(pages.docs, 34)
    const serializedContact = JSON.stringify(contactPage.layout)
    expect(serializedContact).toContain('support@trayport.com')
    expect(serializedContact).toContain('+44 (0)20 7960 5555')
    expect(serializedContact).toContain('+44 (0)20 7960 5530')
    expect(serializedContact).toContain('+44 (0)20 7960 5511')
    expect(serializedContact).not.toMatch(/complete\s+the\s+form|form\s+below|hubspot/i)
    expect(
      pageComponents(contactPage)
        .filter((component) => component.blockType === 'office')
        .map(({ office }) => relationshipID(office))
        .sort((left, right) => left - right),
    ).toEqual(offices.docs.map(({ id }) => id).sort((left, right) => left - right))
  })

  it('loads the Office Locations route and its four ordered office records', async () => {
    const [pages, offices] = await Promise.all([
      payload.find({
        collection: 'pages',
        depth: 0,
        limit: 100,
        overrideAccess: true,
        pagination: false,
        where: wordpressWhere,
      }),
      payload.find({
        collection: 'offices',
        depth: 0,
        limit: 100,
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
      limit: 100,
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
        limit: 100,
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
        limit: 100,
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

  it('owns Request A Demo as a temporary 302 redirect to managed Contact details', async () => {
    const sourcePath = '/request-a-demo/'
    const targetPath = '/contact/'
    const [pages, redirects, claims] = await Promise.all([
      payload.find({
        collection: 'pages',
        depth: 0,
        limit: 25,
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
        where: { from: { equals: sourcePath } },
      }),
      payload.find({
        collection: 'route-registry',
        depth: 0,
        limit: 10,
        overrideAccess: true,
        pagination: false,
        where: { path: { in: [sourcePath, targetPath] } },
      }),
    ])

    const contact = documentByLegacyID(pages.docs, 34)
    expect(pages.docs.some(({ legacySource }) => legacySource?.legacyId === 4031)).toBe(false)
    expect(redirects.docs).toHaveLength(1)
    const redirect = redirects.docs[0]
    expect(redirect).toMatchObject({ from: sourcePath, type: '302' })
    expect(redirect?.to?.type).toBe('reference')
    expect(redirect?.to?.reference?.relationTo).toBe('pages')
    expect(relationshipID(redirect!.to!.reference!.value)).toBe(contact.id)
    expect(claims.docs.find(({ path }) => path === sourcePath)).toMatchObject({
      archetype: 'redirect',
      ownerCollection: 'redirects',
      ownerDocumentId: String(redirect?.id),
      ownerKind: 'redirect',
      state: 'published',
    })
  })

  it('loads all Market Matrix venue connections with the legacy duplicate merge rule', async () => {
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
    const hubLegacyByID = new Map(
      hubs.docs.map(({ id, legacySource }) => [id, legacySource?.legacyId] as const),
    )
    const loadedConnections = venues.docs.flatMap((venue) =>
      (venue.marketConnections || []).map(({ connectionType, hub }) => ({
        connectionType,
        hubLegacyId: hubLegacyByID.get(relationshipID(hub)),
        venueLegacyId: venue.legacySource?.legacyId,
      })),
    )

    expect(venues.docs).toHaveLength(66)
    const venueWebsites = venues.docs.flatMap(({ website }) => (website ? [new URL(website)] : []))
    expect(
      venueWebsites.every(
        ({ password, protocol, username }) =>
          protocol === 'https:' && username === '' && password === '',
      ),
    ).toBe(true)
    expect(documentByLegacyID(venues.docs, 2525).website).toBe('https://www.gfigroup.co.uk/')
    expect(loadedConnections).toHaveLength(655)
    expect(
      new Set(
        loadedConnections.map(
          ({ hubLegacyId, venueLegacyId }) => `${venueLegacyId}:${hubLegacyId}`,
        ),
      ),
    ).toHaveLength(655)
    expect(countValues(loadedConnections, ({ connectionType }) => connectionType)).toEqual({
      a: 20,
      b: 218,
      d: 417,
    })
    expect(
      venues.docs.filter(({ marketConnections }) => (marketConnections || []).length > 0),
    ).toHaveLength(64)
    expect(
      loadedConnections.filter(
        ({ hubLegacyId, venueLegacyId }) => venueLegacyId === 3373 && hubLegacyId === 2490,
      ),
    ).toEqual([{ connectionType: 'd', hubLegacyId: 2490, venueLegacyId: 3373 }])
    expect(
      loadedConnections.filter(
        ({ hubLegacyId, venueLegacyId }) => venueLegacyId === 3363 && hubLegacyId === 2493,
      ),
    ).toEqual([{ connectionType: 'b', hubLegacyId: 2493, venueLegacyId: 3363 }])

    expect(eex).toMatchObject({
      contentMode: 'page',
      description: null,
      path: '/venue/eex/',
      summary: null,
      title: 'EEX',
    })
    expect(eex.meta?.description).toBe(
      'Discover EEX on Trayport: access real-time trading, market insights, and exchange opportunities for efficient commodity trading.',
    )
    expect(connectionHubIDs).toHaveLength(37)
    expect(new Set(connectionHubIDs)).toHaveLength(37)
    expect(connectionHubIDs.every((id) => hubIDs.has(id))).toBe(true)
    expect(connectionHubIDs.map((id) => hubLegacyByID.get(id))).toEqual([
      2472, 2519, 2493, 2497, 2494, 2495, 2496, 2498, 8670, 2499, 2500, 2502, 2503, 2505, 2506,
      2508, 2509, 2510, 2511, 2513, 3318, 3321, 3329, 4071, 4522, 2488, 3315, 3320, 3323, 3316,
      2471, 3314, 3332, 3333, 3336, 2490, 6776,
    ])
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

  it('loads 72 hubs, 62 markers, and German Power relationship totals', async () => {
    const [hubs, media, venues] = await Promise.all([
      payload.find({
        collection: 'hubs',
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
      payload.find({
        collection: 'venues',
        depth: 0,
        limit: 100,
        overrideAccess: true,
        pagination: false,
        where: wordpressWhere,
      }),
    ])
    expect(hubs.docs).toHaveLength(72)
    expect(hubs.docs.flatMap(({ map }) => map?.markers || [])).toHaveLength(62)

    const german = hubs.docs.find(({ legacySource }) => legacySource?.legacyId === 2495)
    expect(german).toBeDefined()
    expect(german?.path).toBe('/market-coverage/german-power/')
    const germanHeaderMedia = media.docs.find(({ legacySource }) => legacySource?.legacyId === 9727)
    expect(relationshipID(german!.heroMedia!)).toBe(germanHeaderMedia?.id)
    expect(german?.connections).toHaveLength(21)
    const venueLegacyByID = new Map(
      venues.docs.map(({ id, legacySource }) => [id, legacySource?.legacyId] as const),
    )
    expect(
      (german?.connections || []).map(({ venue }) => venueLegacyByID.get(relationshipID(venue))),
    ).toEqual([
      1394, 2516, 2518, 2525, 2528, 2529, 2531, 2535, 2540, 2542, 3356, 3363, 3364, 3365, 3368,
      3373, 3374, 3376, 4381, 4382, 9263,
    ])
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

  it('loads every accepted media identity and retains each unavailable-media review item', async () => {
    const media = await payload.find({
      collection: 'media',
      depth: 1,
      limit: 200,
      overrideAccess: true,
      pagination: false,
      where: wordpressWhere,
    })
    const transformed = readRunReport<AcceptanceReport>(runDirectory, 'acceptance-transform.json')
    expect(media.docs).toHaveLength(Number(transformed.checks.media))
    expect(
      media.docs.filter(({ sourceFileHash }) => /^[a-f0-9]{64}$/.test(sourceFileHash || '')),
    ).toHaveLength(Number(transformed.checks.fingerprintedMedia))
    const jouleVideo = documentByLegacyID(media.docs, 7666)
    expect(jouleVideo.poster && typeof jouleVideo.poster === 'object').toBe(true)
    expect(
      jouleVideo.poster && typeof jouleVideo.poster === 'object'
        ? jouleVideo.poster.legacySource?.legacyId
        : null,
    ).toBe(8519)

    const review = readRunReport<ContentReviewReport>(runDirectory, 'content-review.json')
    expect(review.missingMedia).toHaveLength(
      Number(transformed.checks.media) - Number(transformed.checks.fingerprintedMedia),
    )
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
    expect(navigation.utilityItems?.map(({ link }) => link.label)).toEqual([
      'See Joule',
      'Request A Demo',
      'Contact Us',
    ])
    expect(navigation).not.toHaveProperty('primaryAction')
    expect(JSON.stringify(navigation)).not.toMatch(/commodities report/i)
    expect(footer.columns).toHaveLength(3)
    expect(
      footer.columns?.reduce(
        (count, column) => count + (column.links?.length || 0) + (column.titleLink?.type ? 1 : 0),
        0,
      ),
    ).toBe(13)
    expect(footer.columns?.[2]).toMatchObject({
      title: 'Legal',
      titleLink: { type: 'custom', url: '/legal/' },
    })
    expect(footer.companyRegistrationText).toContain('Registered No. 02769279')
    expect(footer.parentCompanyText).toBe(
      'Trayport Holdings Limited is a wholly-owned subsidiary of TMX Group Limited (TMX Group).',
    )
    const ownedInternalPaths = new Set([
      ...representativeRoutes.map(({ path }) => path),
      ...managedRedirectRoutes.map(({ path }) => path),
      '/market-coverage/',
      '/venue/',
    ])
    const shellURLs: string[] = []
    collectURLs(navigation, shellURLs)
    collectURLs(footer, shellURLs)
    const liveFallbacks: string[] = []
    for (const url of shellURLs) {
      if (url.startsWith('/')) {
        expect(ownedInternalPaths, `Unmatched internal shell link ${url}`).toContain(
          new URL(url, 'http://trayport.test').pathname,
        )
      } else {
        const parsed = new URL(url)
        expect(parsed.protocol).toBe('https:')
        expect(parsed.hostname).toBe('www.trayport.com')
        liveFallbacks.push(url)
      }
    }
    const transformed = readRunReport<AcceptanceReport>(runDirectory, 'acceptance-transform.json')
    expect(new Set(liveFallbacks.map((url) => new URL(url).pathname))).toHaveLength(
      Number(transformed.checks.navigationFooterLiveFallbacks),
    )
    expect(settings.siteName).toBe('Trayport')
    expect(settings.socialLinks).toHaveLength(2)
    expect(settings.cookieNotice).toMatchObject({
      acceptLabel: 'Accept All',
      enabled: true,
      policyLinkLabel: 'Cookie Policy',
      policyPage: {
        path: '/legal/cookie-policy/',
      },
      policyURL: '/legal/cookie-policy/',
      rejectLabel: 'Reject All',
      title: 'Trayport Cookie Consent',
    })
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
