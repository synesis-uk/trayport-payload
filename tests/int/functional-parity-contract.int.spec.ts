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

  it('rejects duplicate features, false completion, and compensating route-progress drift', () => {
    const duplicateFeature = structuredClone(rawContract)
    duplicateFeature.features[1].id = duplicateFeature.features[0].id
    expect(functionalParityContractSchema.safeParse(duplicateFeature).success).toBe(false)

    const falseCompletion = structuredClone(rawContract)
    const captions = falseCompletion.features.find(({ id }) => id === 'video-captions')
    if (!captions) throw new Error('Missing video-captions fixture')
    captions.status = 'complete'
    expect(functionalParityContractSchema.safeParse(falseCompletion).success).toBe(false)

    const compensatingDrift = structuredClone(rawContract)
    compensatingDrift.routeProgress.acceptedBreakdown.renderedPayloadDocuments += 1
    compensatingDrift.routeProgress.acceptedBreakdown.virtualIndexRouteOwners -= 1
    expect(functionalParityContractSchema.safeParse(compensatingDrift).success).toBe(false)
  })

  it('pins the proven accepted 73 of 317 route-owner authority', () => {
    const progress = functionalParityContract.routeProgress

    expect(progress).toMatchObject({
      approvedRouteOwners: 317,
      acceptedRouteOwners: 73,
      acceptedPercent: 23,
      planOnlyRouteOwners: 244,
      acceptedBreakdown: {
        renderedPayloadDocuments: 70,
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
    expect(
      progress.acceptedBreakdown.renderedPayloadDocuments +
        progress.acceptedBreakdown.managedRedirectRouteOwners,
    ).toBe(71)
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
    expect(feature('production-route-corpus').dimensions.source.summary).toContain(
      'people-events-inventory-20260805-1400',
    )
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
      'site-search': 'partial',
      redirects: 'partial',
      'video-captions': 'missing',
      'publishing-lifecycle': 'partial',
      analytics: 'missing',
      'people-details': 'partial',
      'event-content-routing': 'partial',
      'commodities-report': 'excluded',
    })

    expect(feature('redirects').boundary).toContain('Fifty published WordPress rules')
    expect(feature('video-captions').dimensions.source.summary).toContain('32 MP4')
    expect(feature('analytics').boundary).toContain('GTM-P8HWX2S')
    expect(feature('scheduled-page-banners').dimensions.migration.summary).toContain(
      'Sophie Ingham-Clark',
    )
    expect(feature('hubspot-forms').dimensions.schema.status).toBe('complete')
    expect(feature('hubspot-forms').dimensions.runtime.status).toBe('partial')
    expect(feature('site-search').targetOwner).toContain('whole-site search')
    expect(feature('people-details').boundary).toContain('all 17 published People detail routes')
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

  it('records the approved search, People, and Event directions without unresolved questions', () => {
    for (const id of ['site-search', 'people-details', 'event-content-routing']) {
      const item = feature(id)
      expect(item.status).toBe('partial')
      expect(item.launchPolicy).toBe('required')
      expect(item.decisionRequired).toBeNull()
      expect(item.nextAction).toBeTruthy()
    }

    const decisions = functionalParityContract.features.filter(
      ({ status }) => status === 'decision',
    )

    expect(decisions).toEqual([])
    expect(feature('people-details').nextAction).toContain('all 17 retained profiles')
    expect(feature('people-details').acceptance.join(' ')).toContain(
      'Matthew Brief and Nicole Rosenberg retain the source ceo team classification',
    )
    expect(feature('event-content-routing').acceptance.join(' ')).toContain('23 unique')
    expect(feature('event-content-routing').acceptance.join(' ')).toContain(
      '/event/commodity-trading-week-2026/',
    )
  })

  it('pins the mechanically recalculated feature and dimension scorecards', () => {
    const count = (values: string[]) =>
      Object.fromEntries(
        [...new Set(values)]
          .sort()
          .map((status) => [status, values.filter((candidate) => candidate === status).length]),
      )

    expect(count(functionalParityContract.features.map(({ status }) => status))).toEqual({
      complete: 3,
      deferred: 3,
      excluded: 1,
      missing: 2,
      partial: 11,
    })

    expect(
      Object.fromEntries(
        ['source', 'schema', 'editor', 'runtime', 'migration', 'verification'].map((dimension) => [
          dimension,
          count(
            functionalParityContract.features.map(
              ({ dimensions }) => dimensions[dimension as keyof typeof dimensions].status,
            ),
          ),
        ]),
      ),
    ).toEqual({
      source: { complete: 19, partial: 1 },
      schema: { complete: 16, decision: 1, excluded: 1, missing: 1, partial: 1 },
      editor: { complete: 15, excluded: 2, missing: 1, partial: 2 },
      runtime: { complete: 10, deferred: 2, excluded: 1, missing: 2, partial: 5 },
      migration: { complete: 6, deferred: 1, excluded: 2, missing: 1, partial: 10 },
      verification: { complete: 4, deferred: 2, missing: 2, partial: 12 },
    })
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
