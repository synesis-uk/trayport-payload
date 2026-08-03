import { pocScope } from './poc'

export const pilotScope = {
  name: 'pilot',
  roots: [
    ...pocScope.roots,
    {
      legacyId: 2205,
      postType: 'page',
      path: '/company/offices/',
      purpose: 'Office directory',
      archetype: 'page.standard',
      targetOwner: 'pages',
    },
    {
      legacyId: 1926,
      postType: 'page',
      path: '/products/tradesignal/',
      purpose: 'Second product marketing page',
      archetype: 'page.product',
      targetOwner: 'pages',
    },
    {
      legacyId: 7609,
      postType: 'page',
      path: '/resources/faqs/',
      purpose: 'Support FAQ page',
      archetype: 'page.standard',
      targetOwner: 'pages',
    },
    {
      legacyId: 9244,
      postType: 'page',
      path: '/resources/news/',
      purpose: 'News listing',
      archetype: 'page.content-index',
      targetOwner: 'pages',
    },
    {
      legacyId: 10030,
      postType: 'post',
      path: '/event/e-world-2026/',
      purpose: 'Event detail',
      archetype: 'article.full',
      targetOwner: 'articles',
    },
    {
      legacyId: 3311,
      postType: 'page',
      path: '/learning-hub/',
      purpose: 'Learning-video listing',
      archetype: 'page.content-index',
      targetOwner: 'pages',
    },
    {
      legacyId: 8454,
      postType: 'learning-hub-video',
      path: '/learning-hub-video/trading-in-joule/',
      purpose: 'Protected learning-video detail',
      archetype: 'learning-video.public-detail',
      targetOwner: 'learning-videos',
    },
    {
      legacyId: 3363,
      postType: 'venue',
      path: '/venue/eex/',
      purpose: 'Public venue detail',
      archetype: 'venue.public-detail',
      targetOwner: 'venues',
    },
  ],
} as const

export type PilotRoot = (typeof pilotScope.roots)[number]
