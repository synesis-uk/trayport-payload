export type ProductionExplicitInclude = {
  legacyId: number
  path: string
  provenance: 'public-navigation-override' | 'site-home' | 'theme-hardcoded'
  reason: string
}

export type ProductionCanonicalRouteOverride = {
  legacyId: number
  sourcePath: string
  reason: string
}

export type ProductionListingRule = {
  id: string
  postTypes: string[]
  templates: string[]
}

export type ProductionVirtualRoute = {
  path: string
  title: string
  archetype: string
  targetOwner: string
  reason: string
}

/**
 * Production inventory is deliberately discovery-led. The explicit entries below
 * only cover routes rendered outside the ACF option data, a known public/local
 * navigation difference, and canonical resolution for legacy raw URLs.
 */
export const productionScope = {
  name: 'production',
  optionFields: {
    navigation: 'dropdown',
    footer: 'footer_new',
  },
  candidateStatuses: ['publish', 'private', 'draft'],
  excludedPostTypes: [
    'acf-field',
    'acf-field-group',
    'acf-post-type',
    'acf-taxonomy',
    'acf-ui-options-page',
    'acfe-dbt',
    'acfe-dop',
    'acfe-dpt',
    'acfe-dt',
    'acfe-form',
    'acfe-template',
    'attachment',
    'custom_css',
    'customize_changeset',
    'nav_menu_item',
    'oembed_cache',
    'revision',
    'ta_autologin',
    'user_request',
    'wp_block',
    'wp_font_face',
    'wp_font_family',
    'wp_global_styles',
    'wp_navigation',
    'wp_template',
    'wp_template_part',
  ],
  explicitIncludes: [
    {
      legacyId: 1898,
      path: '/',
      provenance: 'site-home',
      reason: 'The global logo links to the configured front page.',
    },
    {
      legacyId: 1924,
      path: '/products/joule/',
      provenance: 'theme-hardcoded',
      reason: 'Hard-coded menu-bottom link in the active desktop and mobile navigation.',
    },
    {
      legacyId: 4031,
      path: '/request-a-demo/',
      provenance: 'theme-hardcoded',
      reason: 'Hard-coded menu-bottom link in the active desktop and mobile navigation.',
    },
    {
      legacyId: 34,
      path: '/contact/',
      provenance: 'theme-hardcoded',
      reason: 'Hard-coded menu-bottom link in the active desktop and mobile navigation.',
    },
    {
      legacyId: 7609,
      path: '/resources/faqs/',
      provenance: 'public-navigation-override',
      reason:
        'The public navigation exposes FAQs although the local ACF navigation snapshot omits it.',
    },
  ] satisfies ProductionExplicitInclude[],
  canonicalRouteOverrides: [
    {
      sourcePath: '/products/end-of-day-eod-file/',
      legacyId: 10140,
      reason: 'Resolve the raw URL-style ACF link to its canonical WordPress page.',
    },
    {
      sourcePath: '/products/surveillance-file/',
      legacyId: 10125,
      reason: 'Resolve the raw URL-style ACF link to its canonical WordPress page.',
    },
    {
      sourcePath: '/products/energy-market-access/',
      legacyId: 1934,
      reason: 'Resolve the raw URL-style ACF link to its canonical WordPress page.',
    },
    {
      sourcePath: '/products/request-for-quote/',
      legacyId: 9786,
      reason: 'Resolve the raw URL-style ACF link to its canonical WordPress page.',
    },
    {
      sourcePath: '/home/enterprise-security/',
      legacyId: 9852,
      reason: 'Map the stale navigation path to the current canonical product page.',
    },
  ] satisfies ProductionCanonicalRouteOverride[],
  virtualRoutes: [
    {
      path: '/venue/',
      title: 'Venues',
      archetype: 'index.venue',
      targetOwner: 'venues',
      reason: 'Public virtual archive rendered by the WordPress venue route.',
    },
    {
      path: '/market-coverage/',
      title: 'Market Coverage',
      archetype: 'index.market-coverage',
      targetOwner: 'hubs',
      reason: 'Public virtual archive rendered by the WordPress market coverage route.',
    },
  ] satisfies ProductionVirtualRoute[],
  exclusions: [
    {
      legacyId: 2233,
      path: '/resources/commodities-report/',
      reason:
        'Commodities Report is linked in legacy navigation but remains outside the production migration scope.',
    },
  ],
  listingRules: [
    {
      id: 'editorial-list-template',
      templates: ['layouts/articles-list.blade.php'],
      postTypes: ['post'],
    },
    {
      id: 'learning-hub-template',
      templates: ['layouts/learning-hub-home.blade.php'],
      postTypes: ['learning-hub-video'],
    },
    {
      id: 'market-matrix-template',
      templates: ['layouts/market-matrix.blade.php'],
      postTypes: ['hub', 'venue'],
    },
  ] satisfies ProductionListingRule[],
  componentListingPostTypes: {
    clients: ['clients'],
    connections: ['hub', 'venue', 'region'],
    lifecycle: ['lifecycle'],
    people: ['people'],
    products: ['product'],
    videos: ['videos'],
  } as Record<string, string[]>,
  expectedInventory: {
    directPublicRoutes: 53,
    listingRoutes: 243,
    routes: 296,
    redirects: 50,
    exclusions: 1,
    unknownArchetypes: 0,
    unknownLayouts: 0,
    unknownTaxonomies: 0,
    errorIssues: 0,
    duplicateCanonicalOwners: 0,
  },
} as const

export type ProductionScope = typeof productionScope
