// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'

const marketHarness = vi.hoisted(() => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  poolConstruct: vi.fn(),
  query: vi.fn(),
}))

vi.mock('next/cache', () => ({
  cacheLife: marketHarness.cacheLife,
  cacheTag: marketHarness.cacheTag,
}))

vi.mock('pg', () => ({
  Pool: class MockPool {
    constructor(options: unknown) {
      marketHarness.poolConstruct(options)
    }

    query(...args: unknown[]) {
      return marketHarness.query(...args)
    }
  },
}))

import {
  loadMarketData,
  MARKET_DATA_CACHE_LIFE,
  MARKET_DATA_CACHE_TAG,
  marketDataLoaderContract,
  type MarketDataQuery,
} from '@/data/market-data/loadMarketData.server'

const executionQuery = (overrides: Partial<MarketDataQuery> = {}): MarketDataQuery => ({
  assetClassLegacyID: 22,
  dataType: 'volume',
  displayInterval: 'quarter',
  fromQuarter: 1,
  fromYear: 2021,
  seriesDimension: 'executionType',
  toQuarter: 4,
  toYear: 2025,
  ...overrides,
})

const monthKeys = (fromYear: number, fromMonth: number, toYear: number, toMonth: number) => {
  const values: number[] = []
  for (let year = fromYear; year <= toYear; year += 1) {
    const firstMonth = year === fromYear ? fromMonth : 1
    const lastMonth = year === toYear ? toMonth : 12
    for (let month = firstMonth; month <= lastMonth; month += 1) values.push(year * 100 + month)
  }
  return values
}

beforeEach(() => {
  marketHarness.cacheLife.mockReset()
  marketHarness.cacheTag.mockReset()
  marketHarness.poolConstruct.mockReset()
  marketHarness.query.mockReset()
  vi.stubEnv('DATABASE_URL', 'postgres://market-data.test/database')
  delete (globalThis as typeof globalThis & { trayportMarketPool?: unknown }).trayportMarketPool
})

describe('market data loader', () => {
  it('declares a bounded cached contract over the application table', () => {
    expect(marketDataLoaderContract).toEqual({
      cacheKeyStrategy: 'use-cache-function-with-bounded-query',
      cacheLife: MARKET_DATA_CACHE_LIFE,
      cacheTag: MARKET_DATA_CACHE_TAG,
      failureMode: 'unavailable-result',
      maxPeriodCount: 40,
      poolTimeouts: {
        connectionTimeoutMillis: 3_000,
        query_timeout: 5_000,
        statement_timeout: 4_000,
      },
      source: 'app.market_volume_monthly',
      supportedDataTypes: ['volume', 'price'],
      supportedDisplayIntervals: ['month', 'quarter', 'year'],
      supportedSeriesDimensions: ['executionType', 'hub'],
    })
  })

  it('returns the Home execution-volume shape as 20 ordered quarters by three series', async () => {
    const periodKeys = Array.from({ length: 20 }, (_, index) => {
      const year = 2021 + Math.floor(index / 4)
      return year * 10 + (index % 4) + 1
    })
    marketHarness.query.mockResolvedValueOnce({
      rows: periodKeys.map((periodKey, index) => ({
        exchange_traded: String(index + 300),
        otc_bilateral: String(index + 100),
        otc_cleared: String(index + 200),
        period_key: periodKey,
      })),
    })

    const result = await loadMarketData(executionQuery())

    expect(result).toMatchObject({
      categories: expect.arrayContaining(['2021 Q1', '2025 Q4']),
      dataType: 'volume',
      displayInterval: 'quarter',
      seriesDimension: 'executionType',
      status: 'available',
    })
    expect(result.categories).toHaveLength(20)
    expect(result.categories.at(0)).toBe('2021 Q1')
    expect(result.categories.at(-1)).toBe('2025 Q4')
    expect(result.series.map(({ key }) => key)).toEqual([
      'otcBilateral',
      'otcCleared',
      'exchangeTraded',
    ])
    expect(result.series.every(({ values }) => values.length === 20)).toBe(true)
    expect(marketHarness.query.mock.calls[0]?.[1]).toEqual([22, 8085, 8104, [], [], 40])
  })

  it('returns Asia Pacific as 30 months by one explicitly included hub', async () => {
    const periods = monthKeys(2023, 7, 2025, 12)
    marketHarness.query.mockResolvedValueOnce({
      rows: periods.map((periodKey, index) => ({
        hub_legacy_id: 2500,
        period_key: periodKey,
        value: index + 1,
      })),
    })

    const result = await loadMarketData({
      assetClassLegacyID: 21,
      dataType: 'volume',
      displayInterval: 'month',
      fromQuarter: 3,
      fromYear: 2023,
      includedHubLegacyIDs: [2500],
      seriesDimension: 'hub',
      toQuarter: 1,
      toYear: 2026,
    })

    expect(result.categories).toHaveLength(30)
    expect(result.categories.at(0)).toBe('Jul 2023')
    expect(result.categories.at(-1)).toBe('Dec 2025')
    expect(result.series).toEqual([
      { key: 'hub:2500', values: Array.from({ length: 30 }, (_, index) => index + 1) },
    ])
    expect(marketHarness.query.mock.calls[0]?.[1]).toEqual([21, 8095, 8105, [2500], [], 40])
    expect(String(marketHarness.query.mock.calls[0]?.[0])).toContain(
      '(year::int * 100 + month::int)',
    )
  })

  it('returns Europe Power as one annual category by nine deterministic non-excluded hubs', async () => {
    const hubLegacyIDs = [2494, 2495, 2497, 2499, 2502, 2510, 2513, 2519, 10565]
    marketHarness.query.mockResolvedValueOnce({
      rows: [...hubLegacyIDs]
        .reverse()
        .map((hubLegacyID) => ({ hub_legacy_id: hubLegacyID, period_key: 2025, value: 1 })),
    })

    const result = await loadMarketData({
      assetClassLegacyID: 21,
      dataType: 'volume',
      displayInterval: 'year',
      excludedHubLegacyIDs: [2511, 2496, 2500],
      fromYear: 2025,
      seriesDimension: 'hub',
      toYear: 2025,
    })

    expect(result.categories).toEqual(['2025'])
    expect(result.series).toHaveLength(9)
    expect(result.series.map(({ key }) => key)).toEqual(
      hubLegacyIDs.map((legacyID) => `hub:${legacyID}`),
    )
    expect(result.series.every(({ values }) => values.length === 1)).toBe(true)
    expect(marketHarness.query.mock.calls[0]?.[1]).toEqual([
      21,
      8101,
      8104,
      [],
      [2496, 2500, 2511],
      40,
    ])
  })

  it('returns Europe price as 12 months by five hubs in authored selection order', async () => {
    const includedHubLegacyIDs = [2513, 2495, 2494, 2499, 2502]
    const periods = monthKeys(2025, 1, 2025, 12)
    marketHarness.query.mockResolvedValueOnce({
      rows: periods.flatMap((periodKey) =>
        [...includedHubLegacyIDs]
          .sort((left, right) => left - right)
          .map((hubLegacyID) => ({
            hub_legacy_id: hubLegacyID,
            period_key: periodKey,
            value: `${periodKey}.${hubLegacyID}`,
          })),
      ),
    })

    const result = await loadMarketData({
      assetClassLegacyID: 21,
      dataType: 'price',
      displayInterval: 'month',
      fromYear: 2025,
      includedHubLegacyIDs,
      seriesDimension: 'hub',
      toYear: 2025,
    })

    expect(result.categories).toHaveLength(12)
    expect(result.categories.at(0)).toBe('Jan 2025')
    expect(result.categories.at(-1)).toBe('Dec 2025')
    expect(result.series.map(({ key }) => key)).toEqual(
      includedHubLegacyIDs.map((legacyID) => `hub:${legacyID}`),
    )
    expect(result.series.every(({ values }) => values.length === 12)).toBe(true)
    expect(String(marketHarness.query.mock.calls[0]?.[0])).toMatch(
      /price IS NOT NULL[\s\S]*avg\(filtered\.price\)::float8/u,
    )
    expect(marketHarness.query.mock.calls[0]?.[1]).toEqual([
      21,
      8101,
      8104,
      includedHubLegacyIDs,
      [],
      40,
    ])
  })

  it('returns Europe gas as four quarters by four hubs in authored selection order', async () => {
    const includedHubLegacyIDs = [3315, 3316, 3320, 2488]
    marketHarness.query.mockResolvedValueOnce({
      rows: [20251, 20252, 20253, 20254].flatMap((periodKey) =>
        includedHubLegacyIDs.map((hubLegacyID) => ({
          hub_legacy_id: hubLegacyID,
          period_key: periodKey,
          value: periodKey + hubLegacyID,
        })),
      ),
    })

    const result = await loadMarketData({
      assetClassLegacyID: 22,
      dataType: 'volume',
      displayInterval: 'quarter',
      fromYear: 2025,
      includedHubLegacyIDs,
      seriesDimension: 'hub',
      toYear: 2025,
    })

    expect(result.categories).toEqual(['2025 Q1', '2025 Q2', '2025 Q3', '2025 Q4'])
    expect(result.series.map(({ key }) => key)).toEqual(
      includedHubLegacyIDs.map((legacyID) => `hub:${legacyID}`),
    )
    expect(result.series.every(({ values }) => values.length === 4)).toBe(true)
  })

  it('rejects invalid or unsupported query shapes before opening a database pool', async () => {
    await expect(
      loadMarketData({
        ...executionQuery(),
        dataType: 'price',
      }),
    ).resolves.toMatchObject({ categories: [], series: [], status: 'empty' })

    expect(marketHarness.poolConstruct).not.toHaveBeenCalled()
    expect(marketHarness.cacheLife).not.toHaveBeenCalled()
    expect(marketHarness.cacheTag).not.toHaveBeenCalled()
  })

  it('fails soft without caching a synthesized empty result when Postgres is unavailable', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    marketHarness.query.mockRejectedValueOnce({ code: 'ECONNREFUSED' })

    await expect(loadMarketData(executionQuery())).resolves.toMatchObject({
      categories: [],
      series: [],
      status: 'unavailable',
    })

    expect(warning).toHaveBeenCalledWith('Market data query unavailable.', {
      assetClassLegacyID: 22,
      code: 'ECONNREFUSED',
      dataType: 'volume',
      displayInterval: 'quarter',
      seriesDimension: 'executionType',
      source: 'app.market_volume_monthly',
    })
    warning.mockRestore()
  })

  it('distinguishes a valid query with no rows from an unavailable database', async () => {
    marketHarness.query.mockResolvedValueOnce({ rows: [] })

    await expect(loadMarketData(executionQuery())).resolves.toMatchObject({
      categories: [],
      series: [],
      status: 'empty',
    })
  })
})
