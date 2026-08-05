// @vitest-environment node

import { discoverProductionInventory } from '../../migration/inventory/discover'
import { buildInventoryArtifacts, buildLayoutCoverage } from '../../migration/inventory/report'
import { contentArchitectureContract } from '../../migration/mappings/contentArchitecture'
import { productionScope } from '../../migration/scopes/production'
import { inventorySeed, productionFixture } from '../fixtures/productionInventory'
import { describe, expect, it } from 'vitest'

describe('production WordPress inventory', () => {
  it('discovers the approved route closure and keeps non-route links terminal', () => {
    const snapshot = productionFixture()
    const inventory = discoverProductionInventory(snapshot, productionScope)

    expect(inventory.summary).toMatchObject({
      directAuthoredRouteStrings: 55,
      directPublicRoutes: 54,
      listingRoutes: 263,
      routes: 317,
      redirects: 53,
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
          canonicalPath: '/legal/cookie-policy/',
          legacyId: 7589,
          archetype: 'page.legal',
        }),
        expect.objectContaining({
          legacyId: 11233,
          canonicalPath: '/people/nicole-rosenberg/',
          archetype: 'person.public-profile',
          targetOwner: 'people',
        }),
        expect.objectContaining({
          legacyId: 2461,
          canonicalPath: '/event/eworld-2025/',
          archetype: 'article.full',
          targetOwner: 'articles',
        }),
        expect.objectContaining({
          legacyId: 11299,
          canonicalPath: '/eex-news/',
          roles: ['banner'],
          sources: ['posts.11602.acf.all-acf-fields.link'],
          archetype: 'page.standard',
          targetOwner: 'pages',
        }),
      ]),
    )
    expect(inventory.routes.some(({ postType }) => postType === 'banner')).toBe(false)
    expect(inventory.edges).toContainEqual({
      from: 'post:11602',
      to: 'post:11299',
      kind: 'banner',
      sourcePath: 'posts.11602.acf.all-acf-fields.link',
    })
    expect(inventory.routes.some(({ legacyId }) => legacyId === 8888)).toBe(false)
    expect(inventory.exclusions).toEqual([
      expect.objectContaining({ legacyId: 2233, path: '/resources/commodities-report/' }),
    ])
    expect(inventory.issues.some(({ code }) => code === 'duplicate-canonical-path')).toBe(false)
    expect(inventory.redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from: '/events/e-world-2026/',
          to: '/event/e-world-2026/',
          type: '301',
        }),
        expect.objectContaining({
          from: '/events/eworld-2025/',
          to: '/event/eworld-2025/',
          type: '301',
        }),
      ]),
    )

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
    expect(coverage.taxonomies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          taxonomy: 'category',
          classification: 'contract-disposition',
          disposition: 'map',
          targets: ['article-categories'],
          terms: 3,
          occurrences: 3,
        }),
        expect.objectContaining({
          taxonomy: 'lh-category',
          classification: 'contract-disposition',
          disposition: 'consolidate',
          terms: 11,
          occurrences: 11,
        }),
      ]),
    )
  })

  it('lets every published banner add managed Page reachability without using active dates', () => {
    const snapshot = productionFixture()
    const inventory = discoverProductionInventory(snapshot, productionScope)

    expect(
      inventory.routes
        .filter(({ roles }) => roles.includes('banner'))
        .map(({ legacyId }) => legacyId)
        .sort((left, right) => (left || 0) - (right || 0)),
    ).toEqual([1898, 1924, 1930, 1940, 4028, 6773, 11299])

    const eexBanner = snapshot.nodes.find(({ legacyId }) => legacyId === 11602)
    expect(eexBanner).toBeDefined()
    if (!eexBanner) return
    eexBanner.status = 'future'

    const withoutFutureBanner = discoverProductionInventory(snapshot, productionScope)
    expect(withoutFutureBanner.routes.some(({ legacyId }) => legacyId === 11299)).toBe(false)
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
      inventorySeed(
        'navigation',
        'options.dropdown.unresolved',
        '/missing-navigation-destination/',
        null,
      ),
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
      listingRoutes: 263,
      routes: 317,
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
