// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'

const harness = vi.hoisted(() => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  find: vi.fn(),
  getPayload: vi.fn(),
  loadMarketData: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))

vi.mock('next/cache', () => ({
  cacheLife: harness.cacheLife,
  cacheTag: harness.cacheTag,
}))

vi.mock('payload', () => ({
  getPayload: harness.getPayload,
}))

vi.mock('@/data/market-data/loadMarketData.server', () => ({
  loadMarketData: harness.loadMarketData,
  MARKET_DATA_CACHE_LIFE: { expire: 3600, revalidate: 300, stale: 300 },
}))

import {
  loadDataChartMarketData,
  marketDataHubLabelContract,
} from '@/components/blocks/dataChartData.server'
import type { MarketDataQuery, MarketDataResult } from '@/data/market-data/types'

const query: MarketDataQuery = {
  assetClassLegacyID: 21,
  dataType: 'price',
  displayInterval: 'month',
  includedHubLegacyIDs: [2513, 2495],
  seriesDimension: 'hub',
}

const hubResult: MarketDataResult = {
  categories: ['Jan 2025', 'Feb 2025'],
  dataType: 'price',
  displayInterval: 'month',
  series: [
    { key: 'hub:2513', values: [91, 92] },
    { key: 'hub:2495', values: [81, 82] },
  ],
  seriesDimension: 'hub',
  status: 'available',
}

beforeEach(() => {
  harness.cacheLife.mockReset()
  harness.cacheTag.mockReset()
  harness.find.mockReset()
  harness.getPayload.mockReset()
  harness.loadMarketData.mockReset()
  harness.getPayload.mockResolvedValue({ find: harness.find })
})

describe('data chart managed-label resolver', () => {
  it('declares managed Payload hubs as its cache dependency source', () => {
    expect(marketDataHubLabelContract).toEqual({
      cacheLife: { expire: 3600, revalidate: 300, stale: 300 },
      dependencyCollection: 'hubs',
      failureMode: 'unavailable-result',
      source: 'managed-payload-hubs',
    })
  })

  it('preserves series order while resolving labels only from managed published hubs', async () => {
    harness.loadMarketData.mockResolvedValue(hubResult)
    harness.find.mockResolvedValue({
      docs: [
        {
          id: 70,
          legacySource: { legacyId: 2495, source: 'wordpress' },
          title: 'German Power',
        },
        {
          id: 71,
          legacySource: { legacyId: 2513, source: 'wordpress' },
          title: 'UK Power',
        },
      ],
    })

    await expect(loadDataChartMarketData(query)).resolves.toEqual({
      ...hubResult,
      series: [
        { key: 'hub:2513', label: 'UK Power', values: [91, 92] },
        { key: 'hub:2495', label: 'German Power', values: [81, 82] },
      ],
    })

    expect(harness.loadMarketData).toHaveBeenCalledWith(query)
    expect(harness.find).toHaveBeenCalledWith({
      collection: 'hubs',
      depth: 0,
      draft: false,
      limit: 2,
      overrideAccess: false,
      pagination: false,
      select: { legacySource: true, title: true },
      where: {
        and: [
          { _status: { equals: 'published' } },
          { 'legacySource.legacyId': { in: [2513, 2495] } },
        ],
      },
    })
    expect(harness.cacheLife).toHaveBeenCalledWith({ expire: 3600, revalidate: 300, stale: 300 })
    expect(harness.cacheTag).toHaveBeenCalledWith('content-dependency-collection:hubs')
    expect(harness.cacheTag).toHaveBeenCalledWith('content-dependency:hubs:70')
    expect(harness.cacheTag).toHaveBeenCalledWith('content-dependency:hubs:71')
  })

  it('resolves new stable-key series without consulting WordPress identifiers', async () => {
    const stableResult: MarketDataResult = {
      ...hubResult,
      series: [
        { key: 'hub-key:hub%3Auk-power', values: [91, 92] },
        { key: 'hub-key:hub%3Agerman-power', values: [81, 82] },
      ],
    }
    harness.loadMarketData.mockResolvedValue(stableResult)
    harness.find.mockResolvedValue({
      docs: [
        { id: 70, marketDataKey: 'hub:german-power', title: 'German Power' },
        { id: 71, marketDataKey: 'hub:uk-power', title: 'UK Power' },
      ],
    })

    await expect(
      loadDataChartMarketData({
        ...query,
        assetClassKey: 'asset-class:power',
        includedHubKeys: ['hub:uk-power', 'hub:german-power'],
      }),
    ).resolves.toEqual({
      ...stableResult,
      series: [
        { key: 'hub-key:hub%3Auk-power', label: 'UK Power', values: [91, 92] },
        { key: 'hub-key:hub%3Agerman-power', label: 'German Power', values: [81, 82] },
      ],
    })

    expect(harness.find).toHaveBeenCalledWith({
      collection: 'hubs',
      depth: 0,
      draft: false,
      limit: 2,
      overrideAccess: false,
      pagination: false,
      select: { marketDataKey: true, title: true },
      where: {
        and: [
          { _status: { equals: 'published' } },
          { marketDataKey: { in: ['hub:uk-power', 'hub:german-power'] } },
        ],
      },
    })
  })

  it('does not query Payload for execution-type or empty data', async () => {
    const executionResult: MarketDataResult = {
      categories: ['2025 Q1'],
      dataType: 'volume',
      displayInterval: 'quarter',
      series: [{ key: 'otcBilateral', label: 'OTC bilateral', values: [1] }],
      seriesDimension: 'executionType',
      status: 'available',
    }
    harness.loadMarketData.mockResolvedValueOnce(executionResult)

    await expect(
      loadDataChartMarketData({ ...query, seriesDimension: 'executionType' }),
    ).resolves.toBe(executionResult)
    expect(harness.getPayload).not.toHaveBeenCalled()
  })

  it('fails closed when a returned hub has no managed published label', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    harness.loadMarketData.mockResolvedValue(hubResult)
    harness.find.mockResolvedValue({
      docs: [
        {
          id: 71,
          legacySource: { legacyId: 2513, source: 'wordpress' },
          title: 'UK Power',
        },
      ],
    })

    await expect(loadDataChartMarketData(query)).resolves.toMatchObject({
      categories: [],
      series: [],
      status: 'unavailable',
    })
    expect(warning).toHaveBeenCalledWith('Managed market hub labels are unavailable.', {
      missingLegacyIDs: [2495],
    })
    warning.mockRestore()
  })
})
