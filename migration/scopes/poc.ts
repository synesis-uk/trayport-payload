export const pocScope = {
  name: 'poc',
  roots: [
    {
      legacyId: 1898,
      postType: 'page',
      path: '/',
      purpose: 'Homepage',
      archetype: 'page.homepage',
      targetOwner: 'pages',
    },
    {
      legacyId: 2203,
      postType: 'page',
      path: '/company/about-us/',
      purpose: 'Composed marketing page',
      archetype: 'page.standard',
      targetOwner: 'pages',
    },
    {
      legacyId: 1924,
      postType: 'page',
      path: '/products/joule/',
      purpose: 'Product marketing page',
      archetype: 'page.product',
      targetOwner: 'pages',
    },
    {
      legacyId: 9248,
      postType: 'page',
      path: '/resources/insights/',
      purpose: 'Article listing',
      archetype: 'page.content-index',
      targetOwner: 'pages',
    },
    {
      legacyId: 9351,
      postType: 'post',
      path: '/insights/on-demand-webinar-data-analytics-for-energy-traders/',
      purpose: 'Article detail',
      archetype: 'article.full',
      targetOwner: 'articles',
    },
    {
      legacyId: 2495,
      postType: 'hub',
      path: '/market-coverage/german-power/',
      purpose: 'Hub and venue relationships',
      archetype: 'hub.public-page',
      targetOwner: 'hubs',
    },
  ],
} as const

export type PocRoot = (typeof pocScope.roots)[number]
