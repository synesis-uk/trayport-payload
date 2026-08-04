// @vitest-environment node

import { describe, expect, it } from 'vitest'

import {
  buildMarketMatrixIndex,
  mergeMarketMatrixConnection,
  type MarketMatrixConnectionType,
} from '@/data/marketMatrix'

const buildAuditedSource = () => {
  const assetClasses = Array.from({ length: 12 }, (_, index) => ({
    displayOrder: index,
    id: index + 1,
    title: `Asset ${index + 1}`,
  }))
  const hubs = Array.from({ length: 72 }, (_, index) => ({
    assetClasses: [assetClasses[index % assetClasses.length]],
    id: index + 1,
    regions: [{ id: (index % 3) + 1, title: `Region ${(index % 3) + 1}` }],
    title: `Hub ${String(index + 1).padStart(2, '0')}`,
  }))
  const venueTypes = Array.from({ length: 3 }, (_, index) => ({
    displayOrder: index,
    id: index + 1,
    title: `Venue type ${index + 1}`,
  }))
  const pairs: Array<{ hub: (typeof hubs)[number]; venueIndex: number }> = []
  const seen = new Set<string>()

  for (let index = 0; index < hubs.length; index += 1) {
    const venueIndex = index % 64
    pairs.push({ hub: hubs[index], venueIndex })
    seen.add(`${venueIndex}:${index}`)
  }
  for (let venueIndex = 0; venueIndex < 64 && pairs.length < 655; venueIndex += 1) {
    for (let hubIndex = 0; hubIndex < hubs.length && pairs.length < 655; hubIndex += 1) {
      const key = `${venueIndex}:${hubIndex}`
      if (seen.has(key)) continue
      seen.add(key)
      pairs.push({ hub: hubs[hubIndex], venueIndex })
    }
  }

  const connectionTypes: MarketMatrixConnectionType[] = [
    ...Array.from({ length: 417 }, () => 'd' as const),
    ...Array.from({ length: 20 }, () => 'a' as const),
    ...Array.from({ length: 218 }, () => 'b' as const),
  ]
  const venues = Array.from({ length: 66 }, (_, index) => ({
    displayOrder: index,
    id: index + 100,
    marketConnections: pairs.flatMap((pair, pairIndex) =>
      pair.venueIndex === index
        ? [{ connectionType: connectionTypes[pairIndex], hub: pair.hub }]
        : [],
    ),
    title: `Venue ${String(index + 1).padStart(2, '0')}`,
    venueTypes: [venueTypes[index % venueTypes.length]],
  }))

  const firstDPair = pairs[0]
  const firstBPairIndex = connectionTypes.indexOf('b')
  const firstBPair = pairs[firstBPairIndex]
  venues[firstDPair.venueIndex].marketConnections.push({ connectionType: 'd', hub: firstDPair.hub })
  venues[firstBPair.venueIndex].marketConnections.push({ connectionType: 'd', hub: firstBPair.hub })

  return { hubs, venues }
}

describe('managed market-matrix projection', () => {
  it('normalizes the audited full source cardinality and legacy duplicate semantics', () => {
    const source = buildAuditedSource()
    const sourceConnections = source.venues.flatMap(({ marketConnections }) => marketConnections)
    const index = buildMarketMatrixIndex(source.hubs, source.venues)
    const normalizedConnections = index.venues.flatMap(({ connections }) =>
      Object.values(connections),
    )
    const count = (connections: MarketMatrixConnectionType[], type: MarketMatrixConnectionType) =>
      connections.filter((connection) => connection === type).length

    expect(source.hubs).toHaveLength(72)
    expect(source.venues).toHaveLength(66)
    expect(sourceConnections).toHaveLength(657)
    expect(
      count(
        sourceConnections.map(({ connectionType }) => connectionType),
        'd',
      ),
    ).toBe(419)
    expect(
      count(
        sourceConnections.map(({ connectionType }) => connectionType),
        'a',
      ),
    ).toBe(20)
    expect(
      count(
        sourceConnections.map(({ connectionType }) => connectionType),
        'b',
      ),
    ).toBe(218)

    expect(index.assetClasses).toHaveLength(12)
    expect(index.hubs).toHaveLength(72)
    expect(index.venueTypes).toHaveLength(3)
    expect(index.venues).toHaveLength(64)
    expect(normalizedConnections).toHaveLength(655)
    expect(count(normalizedConnections, 'd')).toBe(417)
    expect(count(normalizedConnections, 'a')).toBe(20)
    expect(count(normalizedConnections, 'b')).toBe(218)
  })

  it('keeps venue-owned b connectivity when a repeated legacy row is less capable', () => {
    expect(mergeMarketMatrixConnection('d', 'd')).toBe('d')
    expect(mergeMarketMatrixConnection('d', 'a')).toBe('b')
    expect(mergeMarketMatrixConnection('b', 'd')).toBe('b')
  })
})
