export const pocScope = {
  name: 'poc',
  roots: [
    {
      legacyId: 1898,
      postType: 'page',
      path: '/',
      purpose: 'Homepage',
    },
    {
      legacyId: 2203,
      postType: 'page',
      path: '/company/about-us/',
      purpose: 'Composed marketing page',
    },
    {
      legacyId: 1924,
      postType: 'page',
      path: '/products/joule/',
      purpose: 'Product marketing page',
    },
    {
      legacyId: 9248,
      postType: 'page',
      path: '/resources/insights/',
      purpose: 'Article listing',
    },
    {
      legacyId: 9351,
      postType: 'post',
      path: '/insights/on-demand-webinar-data-analytics-for-energy-traders/',
      purpose: 'Article detail',
    },
    {
      legacyId: 2495,
      postType: 'hub',
      path: '/market-coverage/german-power/',
      purpose: 'Hub and venue relationships',
    },
  ],
} as const

export type PocRoot = (typeof pocScope.roots)[number]
