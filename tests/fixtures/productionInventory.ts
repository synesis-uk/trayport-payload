import type {
  RuntimeInventoryNode,
  RuntimeInventorySeed,
  RuntimeInventorySnapshot,
} from '../../migration/inventory/contracts'

export const inventoryNode = (
  legacyId: number,
  postType: string,
  path: string | null,
  overrides: Partial<RuntimeInventoryNode> = {},
): RuntimeInventoryNode => ({
  legacyId,
  postType,
  postTypePublic: postType !== 'redirect',
  status: 'publish',
  title: `${postType} ${legacyId}`,
  slug: path?.split('/').filter(Boolean).at(-1) || `${postType}-${legacyId}`,
  path,
  template: '',
  authoritativeField: postType === 'post' ? 'sections' : 'all-acf-fields',
  references: [],
  listingSelectors: [],
  componentLayouts: [],
  redirect: null,
  ...overrides,
})

export const inventorySeed = (
  origin: RuntimeInventorySeed['origin'],
  sourcePath: string,
  url: string,
  postId: number | null,
  overrides: Partial<RuntimeInventorySeed> = {},
): RuntimeInventorySeed => ({
  origin,
  kind: 'link',
  sourcePath,
  label: url,
  url,
  target: '',
  postId,
  menuBlockCount: null,
  ...overrides,
})

const managedTerms = [
  ...[91, 92, 93].map((legacyId, index) => ({
    legacyId,
    taxonomy: 'category',
    name: `Category ${index + 1}`,
    slug: `category-${index + 1}`,
  })),
  ...[21, 22, 23, 24, 25, 26, 27, 28, 32, 33, 34, 35].map((legacyId, index) => ({
    legacyId,
    taxonomy: 'asset-class',
    name: `Asset class ${index + 1}`,
    slug: `asset-class-${index + 1}`,
  })),
  ...[29, 30, 31, 133].map((legacyId, index) => ({
    legacyId,
    taxonomy: 'region',
    name: `Region ${index + 1}`,
    slug: `region-${index + 1}`,
  })),
  ...[41, 42, 43].map((legacyId, index) => ({
    legacyId,
    taxonomy: 'venue-type',
    name: `Venue type ${index + 1}`,
    slug: `venue-type-${index + 1}`,
  })),
  ...[85, 86, 121, 122, 123, 124, 125, 127, 128, 131, 132].map((legacyId, index) => ({
    legacyId,
    taxonomy: 'lh-category',
    name: `Learning video category ${index + 1}`,
    slug: `learning-video-category-${index + 1}`,
  })),
]

export const productionFixture = (): RuntimeInventorySnapshot => {
  const explicitPages = [
    inventoryNode(1898, 'page', '/', {
      authoritativeField: 'sections_new',
      template: 'layouts/default-new.blade.php',
    }),
    inventoryNode(1924, 'page', '/products/joule/', {
      authoritativeField: 'sections_new',
      template: 'layouts/default-new.blade.php',
    }),
    inventoryNode(4031, 'page', '/request-a-demo/', {
      authoritativeField: 'sections_new',
      template: 'layouts/default-new.blade.php',
    }),
    inventoryNode(34, 'page', '/contact/', {
      authoritativeField: 'sections_new',
      template: 'layouts/default-new.blade.php',
    }),
    inventoryNode(7609, 'page', '/resources/faqs/', {
      authoritativeField: 'sections_new',
      template: 'layouts/default-new.blade.php',
    }),
  ]
  const additionalPageIDs = [
    10140,
    9248,
    3311,
    3002,
    2205,
    1926,
    9244,
    3001,
    ...Array.from({ length: 37 }, (_, index) => 3007 + index),
    2203,
  ]
  const additionalPages = additionalPageIDs.map((legacyId, index) =>
    inventoryNode(
      legacyId,
      'page',
      legacyId === 10140
        ? '/products/eod-file/'
        : legacyId === 9248
          ? '/resources/insights/'
          : legacyId === 3311
            ? '/learning-hub/'
            : legacyId === 2205
              ? '/company/offices/'
              : legacyId === 1926
                ? '/products/tradesignal/'
                : legacyId === 9244
                  ? '/resources/news/'
                  : legacyId === 2203
                    ? '/company/about-us/'
                    : index === 10
                      ? '/privacy/'
                      : `/page-${index + 1}/`,
      {
        authoritativeField: 'sections_new',
        template:
          legacyId === 9248 || legacyId === 9244
            ? 'layouts/articles-list.blade.php'
            : legacyId === 3311
              ? 'layouts/learning-hub-home.blade.php'
              : index === 3
                ? 'layouts/market-matrix.blade.php'
                : index === 10
                  ? 'layouts/cookie-consent.blade.php'
                  : 'layouts/default-new.blade.php',
        componentLayouts: [
          {
            layout: 'hero',
            scope: 'page-top-level',
            sourcePath: `posts.${legacyId}.acf.sections_new[0]`,
          },
        ],
      },
    ),
  )
  const referenceOwner = additionalPages[4]
  referenceOwner.references = [
    {
      kind: 'post',
      intent: 'link',
      legacyId: 9999,
      taxonomy: null,
      url: 'https://www.trayport.com/reference-only/',
      sourcePath: `posts.${referenceOwner.legacyId}.acf.sections_new[0].button`,
    },
    {
      kind: 'post',
      intent: 'dependency',
      legacyId: 9997,
      taxonomy: null,
      url: null,
      sourcePath: `posts.${referenceOwner.legacyId}.acf.related`,
    },
    ...managedTerms
      .filter(({ taxonomy }) => taxonomy !== 'lh-category')
      .map(({ legacyId, taxonomy }) => ({
        kind: 'term' as const,
        intent: 'dependency' as const,
        legacyId,
        taxonomy,
        url: null,
        sourcePath: `posts.${referenceOwner.legacyId}.taxonomies.${taxonomy}`,
      })),
  ]

  const pages = [...explicitPages, ...additionalPages]
  const pageSeeds = additionalPages.map((page, index) =>
    inventorySeed(
      index % 2 ? 'footer' : 'navigation',
      `options.${index % 2 ? 'footer_new' : 'dropdown'}[${index}]`,
      page.legacyId === 10140 ? '/products/end-of-day-eod-file/' : page.path || '/',
      page.legacyId === 10140 ? null : page.legacyId,
    ),
  )
  const postIDs = [9351, 10030, ...Array.from({ length: 88 }, (_, index) => 20_000 + index)]
  const posts = postIDs.map((legacyId, index) =>
    inventoryNode(
      legacyId,
      'post',
      legacyId === 9351
        ? '/insights/on-demand-webinar-data-analytics-for-energy-traders/'
        : legacyId === 10030
          ? '/event/e-world-2026/'
          : `/insights/article-${index}/`,
      {
        authoritativeField: 'sections',
        componentLayouts: [
          {
            layout: 'paragraph',
            scope: 'article-top-level',
            sourcePath: `posts.${legacyId}.acf.sections[0]`,
          },
        ],
      },
    ),
  )
  const venues = Array.from({ length: 66 }, (_, index) =>
    inventoryNode(
      index === 0 ? 3363 : 30_000 + index,
      'venue',
      index === 0 ? '/venue/eex/' : `/venue/venue-${index + 1}/`,
    ),
  )
  const hubIDs = [2495, ...Array.from({ length: 71 }, (_, index) => 40_000 + index)]
  const hubs = hubIDs.map((legacyId, index) =>
    inventoryNode(
      legacyId,
      'hub',
      legacyId === 2495 ? '/market-coverage/german-power/' : `/market-coverage/hub-${index}/`,
    ),
  )
  const learningVideos = Array.from({ length: 15 }, (_, index) =>
    inventoryNode(
      index === 0 ? 8454 : 50_000 + index,
      'learning-hub-video',
      index === 0
        ? '/learning-hub-video/trading-in-joule/'
        : `/resources/learning-hub/video-${index + 1}/`,
    ),
  )
  learningVideos[0].references = managedTerms
    .filter(({ taxonomy }) => taxonomy === 'lh-category')
    .map(({ legacyId, taxonomy }) => ({
      kind: 'term',
      intent: 'dependency',
      legacyId,
      taxonomy,
      url: null,
      sourcePath: `posts.${learningVideos[0].legacyId}.taxonomies.${taxonomy}`,
    }))
  const redirects = Array.from({ length: 50 }, (_, index) =>
    inventoryNode(60_000 + index, 'redirect', null, {
      redirect: {
        from: `/old-${index + 1}/`,
        to: `/new-${index + 1}/`,
        type: '301',
      },
    }),
  )

  return {
    schemaVersion: 1,
    source: {
      home: 'http://trayport.local/',
      site: 'http://trayport.local/',
      tablePrefix: 'wp_',
      wordpressVersion: '6.8.1',
      acfVersion: '6.4.2',
      frontPageId: 1898,
    },
    navigationCandidates: [
      ...pageSeeds.filter(({ origin }) => origin === 'navigation'),
      inventorySeed('navigation', 'options.dropdown.venue', '/venue/', null),
      inventorySeed('navigation', 'options.dropdown.marketCoverage', '/market-coverage/', null),
      inventorySeed(
        'navigation',
        'options.dropdown.commodities',
        '/resources/commodities-report/',
        2233,
      ),
      inventorySeed('navigation', 'options.dropdown.ignored.for_page', '/ignored-parent/', 8888, {
        kind: 'dropdown-root',
        menuBlockCount: 2,
      }),
    ],
    footerCandidates: [
      ...pageSeeds.filter(({ origin }) => origin === 'footer'),
      inventorySeed('footer', 'options.footer_new.careers', '/?page_id=2207', 2207),
    ],
    nodes: [
      ...pages,
      ...posts,
      ...venues,
      ...hubs,
      ...learningVideos,
      ...redirects,
      inventoryNode(2233, 'page', '/resources/commodities-report/'),
      inventoryNode(2207, 'page', '/', { status: 'private' }),
      inventoryNode(8888, 'page', '/ignored-parent/'),
      inventoryNode(9999, 'page', '/reference-only/', {
        references: [
          {
            kind: 'post',
            intent: 'dependency',
            legacyId: 9998,
            taxonomy: null,
            url: null,
            sourcePath: 'posts.9999.acf.must-not-traverse',
          },
        ],
        componentLayouts: [
          {
            layout: 'must-not-reach-coverage',
            scope: 'component',
            sourcePath: 'posts.9999.acf.must-not-reach-coverage',
          },
        ],
      }),
      inventoryNode(9998, 'page', '/reference-child/'),
      inventoryNode(9997, 'clients', null, {
        postTypePublic: false,
        references: [
          {
            kind: 'media',
            intent: 'dependency',
            legacyId: 777,
            taxonomy: null,
            url: null,
            sourcePath: 'posts.9997.acf.logo',
          },
        ],
      }),
    ],
    media: [
      {
        legacyId: 777,
        title: 'Dependency media',
        mimeType: 'image/svg+xml',
        url: 'http://trayport.local/wp-content/uploads/dependency.svg',
        relativePath: 'dependency.svg',
        available: true,
      },
    ],
    terms: managedTerms,
  }
}
