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
  const expandedPilotPageFixtures = new Map<
    number,
    { authoritativeField: string; path: string; template: string }
  >([
    [
      1930,
      {
        authoritativeField: 'sections_new',
        path: '/products/data-analytics/',
        template: 'layouts/default-new.blade.php',
      },
    ],
    [
      1940,
      {
        authoritativeField: 'sections_new',
        path: '/products/exchange-trading-system/',
        template: 'layouts/default-new.blade.php',
      },
    ],
    [
      4028,
      {
        authoritativeField: 'sections_new',
        path: '/resources/lifecycle-information/',
        template: 'layouts/default-new.blade.php',
      },
    ],
    [
      6773,
      {
        authoritativeField: 'sections_new',
        path: '/products/exchange-connectivity/',
        template: 'layouts/default-new.blade.php',
      },
    ],
    [
      2231,
      {
        authoritativeField: 'sections_new',
        path: '/resources/market-matrix/',
        template: 'layouts/market-matrix.blade.php',
      },
    ],
    [
      5920,
      {
        authoritativeField: 'sections_new',
        path: '/resources/markets-map/',
        template: 'layouts/default-new.blade.php',
      },
    ],
    [
      4737,
      {
        authoritativeField: 'sections_new',
        path: '/legal/',
        template: 'layouts/default-new.blade.php',
      },
    ],
    [
      7589,
      {
        authoritativeField: 'sections_new',
        path: '/legal/cookie-policy/',
        template: 'layouts/cookie-consent.blade.php',
      },
    ],
    [
      7585,
      {
        authoritativeField: 'sections_new',
        path: '/terms-of-use-disclaimer/',
        template: 'layouts/default-new.blade.php',
      },
    ],
    [
      4803,
      {
        authoritativeField: 'sections',
        path: '/legal/legal-notice/',
        template: 'layouts/article.blade.php',
      },
    ],
    [
      7573,
      {
        authoritativeField: 'sections',
        path: '/legal/modern-slavery/',
        template: 'layouts/article.blade.php',
      },
    ],
    [
      5983,
      {
        authoritativeField: 'sections_new',
        path: '/regions/asia-pacific/',
        template: 'layouts/default-new.blade.php',
      },
    ],
    [
      2221,
      {
        authoritativeField: 'sections_new',
        path: '/regions/north-america/',
        template: 'layouts/default-new.blade.php',
      },
    ],
    [
      11475,
      {
        authoritativeField: 'sections_new',
        path: '/company/careers/',
        template: 'layouts/default-new.blade.php',
      },
    ],
    [
      5981,
      {
        authoritativeField: 'sections_new',
        path: '/regions/europe/',
        template: 'layouts/default-new.blade.php',
      },
    ],
  ])
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
    1930,
    2205,
    1926,
    9244,
    1940,
    4028,
    6773,
    ...Array.from(
      { length: 35 },
      (_, index) =>
        [2231, 5920, 4737, 7589, 7585, 4803, 7573, 5983, 2221, 11475, 5981][index] || 3007 + index,
    ),
    2203,
  ]
  const additionalPages = additionalPageIDs.map((legacyId, index) => {
    const expandedPilotPage = expandedPilotPageFixtures.get(legacyId)

    return inventoryNode(
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
                    : expandedPilotPage?.path || `/page-${index + 1}/`,
      {
        authoritativeField: expandedPilotPage?.authoritativeField || 'sections_new',
        template:
          legacyId === 9248 || legacyId === 9244
            ? 'layouts/articles-list.blade.php'
            : legacyId === 3311
              ? 'layouts/learning-hub-home.blade.php'
              : expandedPilotPage?.template || 'layouts/default-new.blade.php',
        componentLayouts: [
          {
            layout: expandedPilotPage?.authoritativeField === 'sections' ? 'paragraph' : 'hero',
            scope:
              expandedPilotPage?.authoritativeField === 'sections'
                ? 'article-top-level'
                : 'page-top-level',
            sourcePath: `posts.${legacyId}.acf.${expandedPilotPage?.authoritativeField || 'sections_new'}[0]`,
          },
        ],
      },
    )
  })
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
  const eventPosts = [
    [8213, 'back-at-e-world-trayport-showcases-the-future-of-energy-trading-in-2025'],
    [8796, 'celebrating-with-our-clients-at-trayports-inaugural-spring-party-2025'],
    [10030, 'e-world-2026'],
    [10070, 'devex-meetup-improving-developer-experience-from-the-trenches'],
    [10077, 'etcsee-2024'],
    [10080, 'x-energy-exchanges-2024'],
    [10093, 'flame-conference-2024'],
    [10098, 'rec-market-meeting-2024'],
    [10103, 'north-american-carbon-world'],
    [10105, 'ippsa-30th-annual-conference'],
    [10118, 'e-world-2024'],
    [10439, 'e-world-the-heartbeat-of-global-commodity-markets'],
    [10960, 'trayport-spring-party-2026'],
    [10968, 'x-energy-exchanges-2026'],
    [10974, 'commodity-trading-week-2026'],
    [11026, 'energy-trading-leaders-summit-2026'],
    [11041, 'etcsee-2026'],
    [11051, 'nordic-energy-day-2026'],
    [11078, 'energy-trading-week-2026'],
    [11465, 'connect-with-trayport-in-madrid'],
  ] as const
  const posts = [
    inventoryNode(9351, 'post', '/insights/on-demand-webinar-data-analytics-for-energy-traders/', {
      authoritativeField: 'sections',
    }),
    ...eventPosts.map(([legacyId, slug]) =>
      inventoryNode(legacyId, 'post', `/event/${slug}/`, {
        authoritativeField: 'sections',
        componentLayouts: [
          {
            layout: 'paragraph',
            scope: 'article-top-level',
            sourcePath: `posts.${legacyId}.acf.sections[0]`,
          },
        ],
      }),
    ),
    ...Array.from({ length: 69 }, (_, index) =>
      inventoryNode(20_000 + index, 'post', `/insights/article-${index + 1}/`, {
        authoritativeField: 'sections',
        componentLayouts: [
          {
            layout: 'paragraph',
            scope: 'article-top-level',
            sourcePath: `posts.${20_000 + index}.acf.sections[0]`,
          },
        ],
      }),
    ),
  ]
  const people = [
    [2561, 'peter-conroy'],
    [2563, 'stephen-marcantonio'],
    [2570, 'bobbie-lambert'],
    [2571, 'elliott-pickard'],
    [2667, 'damien-oconnor'],
    [2668, 'sean-beck'],
    [2670, 'andreas-hoff'],
    [4145, 'someone-in-careers-02'],
    [4146, 'someone-in-careers-03'],
    [4837, 'daniel-masters'],
    [4839, 'fuad-arohunfara'],
    [4841, 'roshni-mistry'],
    [4843, 'toby-smith'],
    [9253, 'tmx'],
    [10395, 'david-robinette'],
    [11232, 'matthew-brief'],
    [11233, 'nicole-rosenberg'],
  ].map(([legacyId, slug]) => inventoryNode(Number(legacyId), 'people', `/people/${slug}/`))
  const legacyEvents = [
    [2461, 'eworld-2025'],
    [2463, 'women-of-silicon-roundabout-2024'],
    [2464, 'fia-expo-2024'],
    [8850, 'e-world-2026'],
    [10476, 'trayport-spring-party-2026'],
  ].map(([legacyId, slug]) => inventoryNode(Number(legacyId), 'events', `/events/${slug}/`))
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
    inventoryNode(index === 0 ? 10233 : index === 1 ? 10967 : 60_000 + index, 'redirect', null, {
      redirect: {
        from:
          index === 0
            ? '/event/e-world-2026/'
            : index === 1
              ? '/event/trayport-spring-party-2026/'
              : `/old-${index + 1}/`,
        to:
          index === 0
            ? '/events/e-world-2026/'
            : index === 1
              ? '/events/trayport-spring-party-2026/'
              : `/new-${index + 1}/`,
        type: '301',
      },
    }),
  )
  const eexNews = inventoryNode(11299, 'page', '/eex-news/', {
    authoritativeField: 'sections_new',
    template: 'layouts/default-new.blade.php',
  })
  const banners = [
    inventoryNode(4362, 'banner', '/banner/joule/', {
      references: [
        {
          kind: 'post',
          intent: 'link',
          legacyId: 1924,
          taxonomy: null,
          url: '/products/joule/',
          sourcePath: 'posts.4362.acf.all-acf-fields.link',
        },
      ],
    }),
    inventoryNode(4363, 'banner', '/banner/home/', {
      references: [
        {
          kind: 'post',
          intent: 'dependency',
          legacyId: 1898,
          taxonomy: null,
          url: '/',
          sourcePath: 'posts.4363.acf.all-acf-fields.pages[0]',
        },
      ],
    }),
    inventoryNode(7597, 'banner', '/banner/product-resources/', {
      references: [1930, 4028].map((legacyId, index) => ({
        kind: 'post' as const,
        intent: 'dependency' as const,
        legacyId,
        taxonomy: null,
        url: null,
        sourcePath: `posts.7597.acf.all-acf-fields.pages[${index}]`,
      })),
    }),
    inventoryNode(11602, 'banner', '/banner/eex-news/', {
      references: [
        ...[1940, 6773].map((legacyId, index) => ({
          kind: 'post' as const,
          intent: 'dependency' as const,
          legacyId,
          taxonomy: null,
          url: null,
          sourcePath: `posts.11602.acf.all-acf-fields.pages[${index}]`,
        })),
        {
          kind: 'post',
          intent: 'link',
          legacyId: 11299,
          taxonomy: null,
          url: '/eex-news/',
          sourcePath: 'posts.11602.acf.all-acf-fields.link',
        },
      ],
    }),
  ]

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
      ...people,
      ...legacyEvents,
      ...venues,
      ...hubs,
      ...learningVideos,
      ...redirects,
      eexNews,
      ...banners,
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
