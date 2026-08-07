import { productionRoots } from './productionRoots'

export const pilotScope = {
  name: 'pilot',
  /**
   * The full public-route corpus, generated from the verified production target plan. This was a
   * hand-authored 26-entry pilot slice; every stage of the pipeline reads it, so widening it here
   * promotes the reduced-mode records and imports the missing Pages in one place rather than
   * re-plumbing extract, transform, url and validate independently.
   */
  roots: productionRoots,
  acceptedRouteDependencies: [
    {
      legacyId: 1930,
      postType: 'page',
      path: '/products/data-analytics/',
      purpose: 'Published banner target Page',
      archetype: 'page.product',
      targetOwner: 'pages',
    },
    {
      legacyId: 1940,
      postType: 'page',
      path: '/products/exchange-trading-system/',
      purpose: 'Published banner target Page',
      archetype: 'page.product',
      targetOwner: 'pages',
    },
    {
      legacyId: 4028,
      postType: 'page',
      path: '/resources/lifecycle-information/',
      purpose: 'Published banner target Page',
      archetype: 'page.standard',
      targetOwner: 'pages',
    },
    {
      legacyId: 6773,
      postType: 'page',
      path: '/products/exchange-connectivity/',
      purpose: 'Published banner target Page',
      archetype: 'page.product',
      targetOwner: 'pages',
    },
    {
      legacyId: 11299,
      postType: 'page',
      path: '/eex-news/',
      purpose: 'Published banner CTA Page',
      archetype: 'page.standard',
      targetOwner: 'pages',
    },
  ],
} as const

export type PilotRoot = (typeof pilotScope.roots)[number]
export type AcceptedRouteDependency = (typeof pilotScope.acceptedRouteDependencies)[number]
