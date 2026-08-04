// @vitest-environment node

import { describe, expect, it } from 'vitest'

import {
  buildPairwiseConnectionFeatures,
  connectionsMapLineCount,
  pairwiseConnectionCount,
} from '@/components/blocks/connectionsMapData'
import { normalizeMarketCoverageComponent } from '@/components/blocks/specialistNormalizers'
import type { MarketCoverageComponent } from '@/payload-types'

const coverageBlock = {
  assetClasses: [21, 22],
  blockType: 'marketCoverage',
  height: 350,
  lineColor: '#009cde',
  lineOpacity: 0.5,
  lineWidth: 0.2,
  markerSize: 3,
  presentation: 'mapOnly',
  regions: [31],
  showLines: true,
  style: 'dark',
} satisfies MarketCoverageComponent

const markers = [
  ...Array.from({ length: 33 }, (_, index) => ({
    assetClasses: [{ displayOrder: 1, id: 21, slug: 'power', title: 'Power' }],
    hubId: index + 1,
    label: `Power ${index + 1}`,
    latitude: 35 + index / 10,
    longitude: -10 + index,
    regions: [{ id: 31, title: 'Europe' }],
  })),
  ...Array.from({ length: 22 }, (_, index) => ({
    assetClasses: [{ displayOrder: 2, id: 22, slug: 'gas', title: 'Gas' }],
    hubId: index + 101,
    label: `Gas ${index + 1}`,
    latitude: 45 + index / 10,
    longitude: -5 + index,
    regions: [{ id: 31, title: 'Europe' }],
  })),
  {
    assetClasses: [{ displayOrder: 3, id: 23, slug: 'coal', title: 'Coal' }],
    hubId: 999,
    label: 'Unselected asset class',
    latitude: 1,
    longitude: 1,
    regions: [{ id: 31, title: 'Europe' }],
  },
  {
    assetClasses: [{ displayOrder: 1, id: 21, slug: 'power', title: 'Power' }],
    hubId: 1000,
    label: 'Unselected region',
    latitude: 2,
    longitude: 2,
    regions: [{ id: 99, title: 'Elsewhere' }],
  },
]

describe('Home connections map model', () => {
  it('groups selected marker relationships and preserves the reference topology invariant', () => {
    const model = normalizeMarketCoverageComponent(coverageBlock, {
      hubCount: 57,
      markers,
    })

    expect(
      model.markerGroups.map(({ color, points, slug }) => ({
        color,
        pointCount: points.length,
        slug,
      })),
    ).toEqual([
      { color: '#ff671f', pointCount: 33, slug: 'power' },
      { color: '#f7ea48', pointCount: 22, slug: 'gas' },
    ])
    expect(pairwiseConnectionCount(33)).toBe(528)
    expect(pairwiseConnectionCount(22)).toBe(231)
    expect(connectionsMapLineCount(model.markerGroups)).toBe(759)
    expect(buildPairwiseConnectionFeatures(model.markerGroups[0]?.points || [])).toHaveLength(528)
    expect(model.runtimeLineWidth).toBe(0.2)
  })

  it('does not emit line topology when the managed line control is disabled', () => {
    const model = normalizeMarketCoverageComponent(
      { ...coverageBlock, showLines: false },
      { hubCount: 57, markers },
    )

    expect(model.showLines).toBe(false)
    expect(model.markerGroups.map(({ points }) => points.length)).toEqual([33, 22])
  })
})
