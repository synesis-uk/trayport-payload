// @vitest-environment node

import {
  type RuntimeInventoryNode,
  type RuntimeInventorySeed,
  type RuntimeInventorySnapshot,
} from '../../migration/inventory/contracts'
import { discoverProductionInventory } from '../../migration/inventory/discover'
import { buildInventoryArtifacts, buildLayoutCoverage } from '../../migration/inventory/report'
import { contentArchitectureContract } from '../../migration/mappings/contentArchitecture'
import { productionScope } from '../../migration/scopes/production'
import { describe, expect, it } from 'vitest'

const node = (
  legacyId: number,
  postType: string,
  path: string | null,
  overrides: Partial<RuntimeInventoryNode> = {},
): RuntimeInventoryNode => ({
  legacyId,
  postType,
  postTypePublic: !['redirect'].includes(postType),
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

const seed = (
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

const productionFixture = (): RuntimeInventorySnapshot => {
  const explicitPages = [
    node(1898, 'page', '/', {
      authoritativeField: 'sections_new',
      template: 'layouts/default-new.blade.php',
    }),
    node(1924, 'page', '/products/joule/', {
      authoritativeField: 'sections_new',
      template: 'layouts/default-new.blade.php',
    }),
    node(4031, 'page', '/request-a-demo/', {
      authoritativeField: 'sections_new',
      template: 'layouts/default-new.blade.php',
    }),
    node(34, 'page', '/contact/', {
      authoritativeField: 'sections_new',
      template: 'layouts/default-new.blade.php',
    }),
    node(7609, 'page', '/resources/faqs/', {
      authoritativeField: 'sections_new',
      template: 'layouts/default-new.blade.php',
    }),
  ]
  const additionalPageIDs = [10140, ...Array.from({ length: 45 }, (_, index) => 3001 + index)]
  const additionalPages = additionalPageIDs.map((legacyId, index) =>
    node(
      legacyId,
      'page',
      legacyId === 10140
        ? '/products/eod-file/'
        : index === 10
          ? '/privacy/'
          : `/page-${index + 1}/`,
      {
        authoritativeField: 'sections_new',
        template:
          index === 1
            ? 'layouts/articles-list.blade.php'
            : index === 2
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
    {
      kind: 'term',
      intent: 'dependency',
      legacyId: 91,
      taxonomy: 'category',
      url: null,
      sourcePath: `posts.${referenceOwner.legacyId}.taxonomies.category`,
    },
  ]

  const pages = [...explicitPages, ...additionalPages]
  const pageSeeds = additionalPages.map((page, index) =>
    seed(
      index % 2 ? 'footer' : 'navigation',
      `options.${index % 2 ? 'footer_new' : 'dropdown'}[${index}]`,
      page.legacyId === 10140 ? '/products/end-of-day-eod-file/' : page.path || '/',
      page.legacyId === 10140 ? null : page.legacyId,
    ),
  )
  const posts = Array.from({ length: 90 }, (_, index) =>
    node(20_000 + index, 'post', `/insights/article-${index + 1}/`, {
      authoritativeField: 'sections',
      componentLayouts: [
        {
          layout: 'paragraph',
          scope: 'article-top-level',
          sourcePath: `posts.${20_000 + index}.acf.sections[0]`,
        },
      ],
    }),
  )
  const venues = Array.from({ length: 66 }, (_, index) =>
    node(30_000 + index, 'venue', `/venue/venue-${index + 1}/`),
  )
  const hubs = Array.from({ length: 72 }, (_, index) =>
    node(40_000 + index, 'hub', `/market-coverage/hub-${index + 1}/`),
  )
  const learningVideos = Array.from({ length: 15 }, (_, index) =>
    node(50_000 + index, 'learning-hub-video', `/resources/learning-hub/video-${index + 1}/`),
  )
  const redirects = Array.from({ length: 50 }, (_, index) =>
    node(60_000 + index, 'redirect', null, {
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
      seed('navigation', 'options.dropdown.venue', '/venue/', null),
      seed('navigation', 'options.dropdown.marketCoverage', '/market-coverage/', null),
      seed('navigation', 'options.dropdown.commodities', '/resources/commodities-report/', 2233),
      seed('navigation', 'options.dropdown.ignored.for_page', '/ignored-parent/', 8888, {
        kind: 'dropdown-root',
        menuBlockCount: 2,
      }),
    ],
    footerCandidates: [
      ...pageSeeds.filter(({ origin }) => origin === 'footer'),
      seed('footer', 'options.footer_new.careers', '/?page_id=2207', 2207),
    ],
    nodes: [
      ...pages,
      ...posts,
      ...venues,
      ...hubs,
      ...learningVideos,
      ...redirects,
      node(2233, 'page', '/resources/commodities-report/'),
      node(2207, 'page', '/', { status: 'private' }),
      node(8888, 'page', '/ignored-parent/'),
      node(9999, 'page', '/reference-only/', {
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
      node(9998, 'page', '/reference-child/'),
      node(9997, 'clients', null, {
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
    terms: [
      {
        legacyId: 91,
        taxonomy: 'category',
        name: 'News',
        slug: 'news',
      },
    ],
  }
}

describe('production WordPress inventory', () => {
  it('discovers the approved route closure and keeps non-route links terminal', () => {
    const snapshot = productionFixture()
    const inventory = discoverProductionInventory(snapshot, productionScope)

    expect(inventory.summary).toMatchObject({
      directAuthoredRouteStrings: 54,
      directPublicRoutes: 53,
      listingRoutes: 243,
      routes: 296,
      redirects: 50,
      exclusions: 1,
      unknownArchetypes: 0,
    })
    expect(inventory.routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          legacyId: null,
          canonicalPath: '/venue/',
          archetype: 'index.venue',
          targetOwner: 'venues',
        }),
        expect.objectContaining({
          legacyId: null,
          canonicalPath: '/market-coverage/',
          archetype: 'index.market-coverage',
          targetOwner: 'hubs',
        }),
        expect.objectContaining({
          legacyId: 10140,
          path: '/products/end-of-day-eod-file/',
          canonicalPath: '/products/eod-file/',
        }),
        expect.objectContaining({
          canonicalPath: '/privacy/',
          archetype: 'page.legal',
        }),
      ]),
    )
    expect(inventory.routes.some(({ legacyId }) => legacyId === 8888)).toBe(false)
    expect(inventory.exclusions).toEqual([
      expect.objectContaining({ legacyId: 2233, path: '/resources/commodities-report/' }),
    ])
    expect(inventory.issues.some(({ code }) => code === 'duplicate-canonical-path')).toBe(false)

    const referenceOnly = inventory.dependencies.find(({ legacyId }) => legacyId === 9999)
    expect(referenceOnly?.roles).toEqual(['reference-only'])
    expect(inventory.dependencies.some(({ legacyId }) => legacyId === 9998)).toBe(false)
    expect(inventory.dependencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ legacyId: 9997, roles: ['post-reference'] }),
        expect.objectContaining({ legacyId: 777, kind: 'media' }),
      ]),
    )

    const coverage = buildLayoutCoverage(inventory, snapshot, productionScope)
    expect(coverage.unknownLayouts).toEqual([])
    expect(coverage.layouts.some(({ layout }) => layout === 'must-not-reach-coverage')).toBe(false)
    expect(coverage.unknownTaxonomies).toEqual([])
    expect(coverage.taxonomies).toEqual([
      expect.objectContaining({
        taxonomy: 'category',
        classification: 'contract-disposition',
        disposition: 'map',
        targets: ['article-categories'],
        terms: 1,
        occurrences: 1,
      }),
    ])
  })

  it('emits byte-for-byte deterministic reports and passes the production drift gate', () => {
    const snapshot = productionFixture()
    const inventory = discoverProductionInventory(snapshot, productionScope)
    const first = buildInventoryArtifacts(inventory, snapshot, productionScope, 'snapshot-hash')
    const second = buildInventoryArtifacts(inventory, snapshot, productionScope, 'snapshot-hash')

    expect(first).toEqual(second)
    expect(first.verification.status).toBe('passed')
    expect(first.verification.failures).toEqual([])
    expect(
      first.verification.assertions
        .filter(({ id }) => id.startsWith('route-owner:'))
        .map(({ id }) => id),
    ).toEqual(
      contentArchitectureContract.approvedProductionScope.routeOwners.map(
        ({ id }) => `route-owner:${id}`,
      ),
    )
    expect(first.routeManifestCSV.split('\n')[0]).toBe(
      'path,canonicalPath,wpId,wpType,wpStatus,template,authoritativeField,scopeRoles,sources,archetype,targetOwner,disposition,dependencyCount',
    )
  })

  it('treats unresolved global routes and non-contract archetypes as release drift', () => {
    const snapshot = productionFixture()
    snapshot.navigationCandidates.push(
      seed('navigation', 'options.dropdown.unresolved', '/missing-navigation-destination/', null),
    )
    const typoScope = {
      ...productionScope,
      virtualRoutes: productionScope.virtualRoutes.map((route) =>
        route.path === '/venue/' ? { ...route, archetype: 'index.venue-typo' } : route,
      ),
    } as unknown as typeof productionScope
    const inventory = discoverProductionInventory(snapshot, typoScope)

    expect(inventory.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'unresolved-internal-url',
          severity: 'error',
          target: '/missing-navigation-destination/',
        }),
      ]),
    )
    expect(inventory.summary.unknownArchetypes).toBe(1)
    expect(
      buildInventoryArtifacts(inventory, snapshot, typoScope, 'snapshot-hash').verification.status,
    ).toBe('failed')
  })

  it('rejects compensating route-owner drift even when aggregate counts still pass', () => {
    const snapshot = productionFixture()
    const reclassified = snapshot.nodes.find(({ legacyId }) => legacyId === 20_000)
    expect(reclassified).toBeDefined()
    if (!reclassified) return
    reclassified.postType = 'hub'
    reclassified.authoritativeField = 'all-acf-fields'
    reclassified.componentLayouts = []

    const inventory = discoverProductionInventory(snapshot, productionScope)
    const verification = buildInventoryArtifacts(
      inventory,
      snapshot,
      productionScope,
      'snapshot-hash',
    ).verification

    expect(inventory.summary).toMatchObject({
      listingRoutes: 243,
      routes: 296,
      unknownArchetypes: 0,
    })
    expect(verification.status).toBe('failed')
    expect(verification.failures).toEqual(
      expect.arrayContaining([
        'route-owner:editorial-posts: expected 90, received 89',
        'route-owner:hub-details: expected 72, received 73',
      ]),
    )
  })

  it('rejects reachable taxonomies without a contract disposition', () => {
    const snapshot = productionFixture()
    const owner = snapshot.nodes.find(({ legacyId }) => legacyId === 1898)
    expect(owner).toBeDefined()
    if (!owner) return
    owner.references.push({
      kind: 'term',
      intent: 'dependency',
      legacyId: 92,
      taxonomy: 'unmapped-taxonomy',
      url: null,
      sourcePath: 'posts.1898.taxonomies.unmapped-taxonomy',
    })
    snapshot.terms.push({
      legacyId: 92,
      taxonomy: 'unmapped-taxonomy',
      name: 'Unmapped',
      slug: 'unmapped',
    })

    const inventory = discoverProductionInventory(snapshot, productionScope)
    const artifacts = buildInventoryArtifacts(inventory, snapshot, productionScope, 'snapshot-hash')
    const coverage = JSON.parse(artifacts.layoutCoverageText) as {
      unknownTaxonomies: string[]
    }

    expect(coverage.unknownTaxonomies).toEqual(['unmapped-taxonomy'])
    expect(artifacts.verification.status).toBe('failed')
    expect(artifacts.verification.failures).toContain('unknownTaxonomies: expected 0, received 1')
  })
})
