// @vitest-environment node

import fs from 'node:fs'
import path from 'node:path'

import {
  functionalParityContract,
  functionalParityContractSchema,
} from '../../migration/mappings/functionalParity'
import contentArchitecture from '../../migration/mappings/content-architecture.v1.json'
import rawContract from '../../migration/mappings/functional-parity.v1.json'
import inventorySummary from '../../docs/content-architecture/inventory-summary.json'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

const feature = (id: string) => {
  const match = functionalParityContract.features.find((candidate) => candidate.id === id)
  if (!match) throw new Error(`Missing functional-parity feature: ${id}`)
  return match
}

describe('WordPress to Payload functional-parity contract', () => {
  it('parses the versioned catalogue and remains separate from route inventory authority', () => {
    expect(() => functionalParityContractSchema.parse(rawContract)).not.toThrow()
    expect(functionalParityContract.authority.routeInventory).toBe(
      'docs/content-architecture/inventory-summary.json',
    )
    expect(functionalParityContract.authority.routeContract).toBe(
      'migration/mappings/content-architecture.v1.json',
    )
    expect(functionalParityContract.purpose).toContain('does not replace')
  })

  it('rejects duplicate features, unowned decisions, and compensating route-progress drift', () => {
    const duplicateFeature = structuredClone(rawContract)
    duplicateFeature.features[1].id = duplicateFeature.features[0].id
    expect(functionalParityContractSchema.safeParse(duplicateFeature).success).toBe(false)

    const unownedDecision = structuredClone(rawContract)
    const search = unownedDecision.features.find(({ id }) => id === 'site-search')
    if (!search) throw new Error('Missing site-search fixture')
    search.decisionRequired = null
    expect(functionalParityContractSchema.safeParse(unownedDecision).success).toBe(false)

    const compensatingDrift = structuredClone(rawContract)
    compensatingDrift.routeProgress.acceptedBreakdown.renderedPayloadDocuments += 1
    compensatingDrift.routeProgress.acceptedBreakdown.virtualIndexRouteOwners -= 1
    expect(functionalParityContractSchema.safeParse(compensatingDrift).success).toBe(false)
  })

  it('pins the accepted 34 of 297 route-owner position without redefining the corpus', () => {
    const progress = functionalParityContract.routeProgress

    expect(progress).toMatchObject({
      approvedRouteOwners: 297,
      acceptedRouteOwners: 34,
      acceptedPercent: 11.4,
      planOnlyRouteOwners: 263,
      acceptedBreakdown: {
        renderedPayloadDocuments: 31,
        managedRedirectRouteOwners: 1,
        virtualIndexRouteOwners: 2,
      },
    })
    expect(
      Object.values(progress.acceptedBreakdown).reduce((total, count) => total + count, 0),
    ).toBe(progress.acceptedRouteOwners)
    expect(progress.acceptedRouteOwners + progress.planOnlyRouteOwners).toBe(
      progress.approvedRouteOwners,
    )
    expect(inventorySummary.counts.routes).toBe(progress.approvedRouteOwners)
    expect(contentArchitecture.approvedProductionScope.publicRouteTotal).toBe(
      progress.approvedRouteOwners,
    )
    expect(
      contentArchitecture.approvedProductionScope.routeOwners.reduce(
        (total, owner) => total + owner.count,
        0,
      ),
    ).toBe(progress.approvedRouteOwners)
  })

  it('records the audited custom-feature status and launch dispositions', () => {
    expect(
      Object.fromEntries(
        [
          'scheduled-page-banners',
          'hubspot-forms',
          'cookieyes-consent',
          'tim-customer-access',
          'site-search',
          'redirects',
          'video-captions',
          'publishing-lifecycle',
          'analytics',
          'people-details',
          'event-content-routing',
          'commodities-report',
        ].map((id) => [id, feature(id).status]),
      ),
    ).toEqual({
      'scheduled-page-banners': 'partial',
      'hubspot-forms': 'deferred',
      'cookieyes-consent': 'deferred',
      'tim-customer-access': 'deferred',
      'site-search': 'decision',
      redirects: 'partial',
      'video-captions': 'missing',
      'publishing-lifecycle': 'partial',
      analytics: 'missing',
      'people-details': 'decision',
      'event-content-routing': 'decision',
      'commodities-report': 'excluded',
    })

    expect(feature('redirects').boundary).toContain('Fifty published WordPress rules')
    expect(feature('video-captions').dimensions.source.summary).toContain('32 MP4')
    expect(feature('analytics').boundary).toContain('GTM-P8HWX2S')
    expect(feature('people-details').boundary).toContain('Nine live people detail links')
    expect(feature('event-content-routing').boundary).toContain('/event/')
    expect(feature('event-content-routing').boundary).toContain('/events/')
  })

  it('keeps completed local specialist slices honest across all six dimensions', () => {
    for (const id of ['regional-market-maps', 'market-matrix', 'charts-market-data']) {
      const item = feature(id)
      expect(item.status).toBe('complete')
      expect(Object.values(item.dimensions).map(({ status }) => status)).toEqual([
        'complete',
        'complete',
        'complete',
        'complete',
        'complete',
        'complete',
      ])
      expect(item.boundary).toContain('approved local slice')
    }
  })

  it('requires an explicit question and next action for every unresolved decision', () => {
    const decisions = functionalParityContract.features.filter(
      ({ status }) => status === 'decision',
    )

    expect(decisions.map(({ id }) => id).sort()).toEqual([
      'event-content-routing',
      'people-details',
      'site-search',
    ])
    for (const item of decisions) {
      expect(item.launchPolicy).toBe('decision-required')
      expect(item.decisionRequired).toBeTruthy()
      expect(item.nextAction).toBeTruthy()
    }
  })

  it('retains evidence for every feature dimension and resolves repository evidence paths', () => {
    for (const item of functionalParityContract.features) {
      expect(Object.keys(item.dimensions)).toEqual([
        'source',
        'schema',
        'editor',
        'runtime',
        'migration',
        'verification',
      ])

      for (const dimension of Object.values(item.dimensions)) {
        expect(dimension.evidence.length).toBeGreaterThan(0)
        for (const reference of dimension.evidence) {
          const [kind, ...parts] = reference.split(':')
          if (!['code', 'document', 'inventory', 'migration', 'test'].includes(kind)) continue

          const relativePath = parts.join(':')
          expect(
            fs.existsSync(path.resolve(root, relativePath)),
            `Missing ${kind} evidence for ${item.id}: ${relativePath}`,
          ).toBe(true)
        }
      }
    }
  })

  it('keeps launch readiness blocked by required missing and deferred capabilities', () => {
    const openLaunchFeatures = functionalParityContract.features.filter(
      ({ launchPolicy, status }) =>
        launchPolicy !== 'excluded' && status !== 'complete' && status !== 'excluded',
    )

    expect(functionalParityContract.catalogueStatus).toBe('partial')
    expect(functionalParityContract.launchReadiness).toBe('missing')
    expect(openLaunchFeatures.map(({ id }) => id)).toContain('production-route-corpus')
    expect(openLaunchFeatures.map(({ id }) => id)).toContain('hubspot-forms')
    expect(openLaunchFeatures.map(({ id }) => id)).toContain('cookieyes-consent')
    expect(openLaunchFeatures.map(({ id }) => id)).toContain('tim-customer-access')
    expect(openLaunchFeatures.map(({ id }) => id)).toContain('analytics')
  })
})
