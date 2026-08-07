// @vitest-environment node

import { discoverProductionInventory } from '../../migration/inventory/discover'
import { architectureContractHash, buildProductionTargetPlan } from '../../migration/plan/build'
import { buildTargetPlanArtifacts } from '../../migration/plan/report'
import { pilotScope } from '../../migration/scopes/pilot'
import { productionScope } from '../../migration/scopes/production'
import { productionFixture } from '../fixtures/productionInventory'
import { describe, expect, it } from 'vitest'

/**
 * The fixture is a synthetic corpus whose paths differ from the real ones (node 10140 is
 * `/products/eod-file/` where the real route is `/products/end-of-day-eod-file/`), so roots
 * generated from the real plan can never match it. These cases therefore exercise the plan's own
 * accepted-corpus rules with no external root set. Drift between the generated corpus and a
 * regenerated plan is checked on real inventory runs, where `buildProductionTargetPlan` falls
 * back to the generated corpus by default.
 */
const fixtureAcceptedRoots: never[] = []

const evidence = {
  sourceSnapshotHash: 'source-snapshot-hash',
  productionInventoryHash: 'production-inventory-hash',
  architectureContractHash: architectureContractHash(),
}

describe('production target plan', () => {
  it('turns the verified 317-route inventory into the explicit implementation plan', () => {
    const snapshot = productionFixture()
    const inventory = discoverProductionInventory(snapshot, productionScope)
    const { plan, verification } = buildProductionTargetPlan(inventory, snapshot, evidence, {
      acceptedRoots: fixtureAcceptedRoots,
    })

    expect(verification.status).toBe('passed')
    expect(verification.failures).toEqual([])
    expect(plan.summary).toEqual({
      routes: 317,
      payloadDocuments: 315,
      virtualIndexes: 2,
      // With no external accepted-root set these are the plan's own accepted-corpus rules
      // (People, legacy Events and /event/ posts) rather than the pilot slice's 71/244.
      pocReadyDocuments: 45,
      planOnlyDocuments: 270,
      systemReadyRoutes: 2,
      managedTaxonomies: 33,
      learningVideoCategories: 11,
      redirectCandidates: 53,
      activeRedirects: 5,
      inactiveRedirects: 48,
    })
    // With no external accepted-root set, poc-ready is exactly the plan's own accepted corpus:
    // People, legacy Events, posts published under /event/, and the hand-authored banner-target
    // dependencies. Asserting the rule rather than a literal id list keeps this meaningful as the
    // corpus grows.
    const acceptedDependencyIDs = new Set<number>(
      pilotScope.acceptedRouteDependencies.map(({ legacyId }) => legacyId),
    )
    const pocReady = plan.routes.filter(({ contentState }) => contentState === 'poc-ready')
    expect(pocReady.length).toBe(45)
    expect(
      pocReady.every(
        ({ canonicalPath, legacyId, sourcePostType }) =>
          sourcePostType === 'people' ||
          sourcePostType === 'events' ||
          (sourcePostType === 'post' && canonicalPath.startsWith('/event/')) ||
          (legacyId !== null && acceptedDependencyIDs.has(legacyId)),
      ),
    ).toBe(true)
    expect(plan.routes.find(({ legacyId }) => legacyId === 11299)).toMatchObject({
      canonicalPath: '/eex-news/',
      contentState: 'poc-ready',
      roles: ['banner'],
      sources: ['posts.11602.acf.all-acf-fields.link'],
    })
    expect(
      plan.routes
        .filter(({ ownerKind }) => ownerKind === 'virtual-index')
        .map(({ canonicalPath, configFieldPath, configGlobal }) => ({
          canonicalPath,
          configGlobal,
          configFieldPath,
        })),
    ).toEqual([
      {
        canonicalPath: '/market-coverage/',
        configGlobal: 'route-indexes',
        configFieldPath: 'marketCoverageIndex',
      },
      {
        canonicalPath: '/venue/',
        configGlobal: 'route-indexes',
        configFieldPath: 'venueIndex',
      },
    ])
    expect(
      plan.routes
        .filter(({ ownerKind }) => ownerKind === 'payload-document')
        .every(
          ({ configFieldPath, configGlobal }) => configGlobal === null && configFieldPath === null,
        ),
    ).toBe(true)
    expect(
      plan.routes.every(
        ({ archetype, discriminator, routePolicy }) =>
          Boolean(archetype) &&
          routePolicy === 'required' &&
          (discriminator === null ||
            (Boolean(discriminator.field) && Boolean(discriminator.value))),
      ),
    ).toBe(true)

    const taxonomyCounts = Object.fromEntries(
      [
        'article-categories',
        'asset-classes',
        'learning-video-categories',
        'regions',
        'venue-types',
      ].map((targetCollection) => [
        targetCollection,
        plan.taxonomies.filter((taxonomy) => taxonomy.targetCollection === targetCollection).length,
      ]),
    )
    expect(taxonomyCounts).toEqual({
      'article-categories': 3,
      'asset-classes': 12,
      'learning-video-categories': 11,
      regions: 4,
      'venue-types': 3,
    })
  })

  it('preserves every redirect candidate and records deterministic review decisions', () => {
    const snapshot = productionFixture()
    const redirects = snapshot.nodes.filter(({ postType }) => postType === 'redirect')
    if (!redirects[0]?.redirect || !redirects[1]?.redirect || !redirects[2]?.redirect) {
      throw new Error('Fixture redirects are missing.')
    }
    if (
      !redirects[3]?.redirect ||
      !redirects[4]?.redirect ||
      !redirects[5]?.redirect ||
      !redirects[6]?.redirect ||
      !redirects[7]?.redirect ||
      !redirects[8]?.redirect
    ) {
      throw new Error('Fixture redirects are missing.')
    }
    redirects[2].redirect = {
      from: '/legacy-joule/',
      to: '/company/about-us/',
      type: '301',
    }
    redirects[3].redirect = {
      from: '/duplicate/',
      to: '/company/about-us/',
      type: '301',
    }
    redirects[4].redirect = {
      from: '/duplicate/',
      to: '/company/about-us/',
      type: '302',
    }
    redirects[5].redirect = {
      from: '/products/joule/',
      to: '/contact/',
      type: '301',
    }
    redirects[6].redirect = {
      from: '/legacy-external/',
      to: 'https://example.com/resource',
      type: '302',
    }
    redirects[7].redirect = {
      from: '/resource/',
      to: '/company/about-us/',
      type: '301',
    }
    redirects[8].redirect = {
      from: '/legacy-ftp/',
      to: 'ftp://example.com/resource',
      type: '301',
    }

    const inventory = discoverProductionInventory(snapshot, productionScope)
    const first = buildProductionTargetPlan(inventory, snapshot, evidence, {
      acceptedRoots: fixtureAcceptedRoots,
    })
    const second = buildProductionTargetPlan(inventory, snapshot, evidence, {
      acceptedRoots: fixtureAcceptedRoots,
    })
    const firstArtifacts = buildTargetPlanArtifacts(first.plan, first.verification)
    const secondArtifacts = buildTargetPlanArtifacts(second.plan, second.verification)

    expect(first).toEqual(second)
    expect(firstArtifacts).toEqual(secondArtifacts)
    expect(first.verification.status).toBe('passed')
    expect(first.plan.redirects).toHaveLength(53)
    expect(first.plan.summary).toMatchObject({
      activeRedirects: 8,
      inactiveRedirects: 45,
    })
    expect(first.plan.redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from: '/legacy-joule/',
          decision: 'active',
          reviewReasons: ['validated-one-hop-target'],
        }),
        expect.objectContaining({
          from: '/legacy-external/',
          decision: 'active',
          reviewReasons: ['validated-external-target'],
        }),
        expect.objectContaining({
          from: '/legacy-ftp/',
          decision: 'inactive-review',
          reviewReasons: ['invalid-target'],
        }),
        expect.objectContaining({
          from: '/resource/',
          decision: 'active',
          reviewReasons: ['validated-one-hop-target'],
        }),
        expect.objectContaining({
          from: '/duplicate/',
          decision: 'inactive-review',
          reviewReasons: ['duplicate-source'],
        }),
        expect.objectContaining({
          from: '/products/joule/',
          decision: 'inactive-review',
          reviewReasons: ['source-shadows-route'],
        }),
      ]),
    )
  })

  it('fails the target-plan gate when a reachable managed term has no source record', () => {
    const snapshot = productionFixture()
    const inventory = discoverProductionInventory(snapshot, productionScope)
    snapshot.terms = snapshot.terms.filter(
      ({ legacyId, taxonomy }) => legacyId !== 85 || taxonomy !== 'lh-category',
    )

    const { plan, verification } = buildProductionTargetPlan(inventory, snapshot, evidence, {
      acceptedRoots: fixtureAcceptedRoots,
    })

    expect(plan.summary.managedTaxonomies).toBe(32)
    expect(plan.summary.learningVideoCategories).toBe(10)
    expect(verification.status).toBe('failed')
    expect(verification.failures).toEqual(
      expect.arrayContaining([
        'managed-taxonomies: expected 33, received 32',
        'learning-video-categories: expected 11, received 10',
        'missing-managed-taxonomy-terms: expected 0, received 1',
        'Missing managed taxonomy source term: term:lh-category:85',
      ]),
    )
  })

  it('only marks a pilot root ready when its complete scoped identity still matches', () => {
    const snapshot = productionFixture()
    const inventory = discoverProductionInventory(snapshot, productionScope)
    const joule = inventory.routes.find(({ legacyId }) => legacyId === 1924)
    expect(joule).toBeDefined()
    if (!joule) return
    joule.path = '/products/joule-renamed/'
    joule.canonicalPath = '/products/joule-renamed/'

    // This case is the drift check itself, so it needs a real accepted root to detect drift
    // against: Joule at its original identity, which the renamed route can no longer satisfy.
    const { plan, verification } = buildProductionTargetPlan(inventory, snapshot, evidence, {
      acceptedRoots: [
        {
          legacyId: 1924,
          postType: 'page',
          path: '/products/joule/',
          archetype: 'page.product',
          targetOwner: 'pages',
        },
      ] as never,
    })
    const plannedJoule = plan.routes.find(({ legacyId }) => legacyId === 1924)

    expect(plannedJoule).toMatchObject({
      archetype: 'page.product',
      authoredPath: '/products/joule-renamed/',
      contentState: 'plan-only',
    })
    expect(verification.status).toBe('failed')
    expect(verification.failures).toEqual(
      expect.arrayContaining(['poc-root:1924: expected 1, received 0']),
    )
  })

  it('fails per-taxonomy drift even when aggregate managed-term totals compensate', () => {
    const snapshot = productionFixture()
    const categoryReference = snapshot.nodes
      .flatMap(({ references }) => references)
      .find(
        ({ kind, legacyId, taxonomy }) =>
          kind === 'term' && taxonomy === 'category' && legacyId === 93,
      )
    expect(categoryReference).toBeDefined()
    if (!categoryReference) return
    categoryReference.legacyId = 36
    categoryReference.taxonomy = 'asset-class'
    snapshot.terms.push({
      legacyId: 36,
      taxonomy: 'asset-class',
      name: 'Compensating asset class',
      slug: 'compensating-asset-class',
    })

    const inventory = discoverProductionInventory(snapshot, productionScope)
    const { plan, verification } = buildProductionTargetPlan(inventory, snapshot, evidence, {
      acceptedRoots: fixtureAcceptedRoots,
    })

    expect(plan.summary.managedTaxonomies).toBe(33)
    expect(plan.summary.learningVideoCategories).toBe(11)
    expect(verification.status).toBe('failed')
    expect(verification.failures).toEqual(
      expect.arrayContaining([
        'managed-taxonomy:asset-class: expected 12, received 13',
        'managed-taxonomy-target:asset-class:asset-classes: expected 12, received 13',
        'managed-taxonomy:category: expected 3, received 2',
        'managed-taxonomy-target:category:article-categories: expected 3, received 2',
      ]),
    )
  })
})
