// @vitest-environment node

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const routeHarness = vi.hoisted(() => ({
  loadRegionalMarketData: vi.fn(),
}))

vi.mock('@/data/regionalMarketData.server', () => ({
  loadRegionalMarketData: routeHarness.loadRegionalMarketData,
}))

import { GET } from '@/app/api/market-map-data/route'

const result = (status: 'available' | 'empty' | 'unavailable') => ({
  assetClassKey: 'power',
  interval: 'quarter' as const,
  period: '20262',
  periods: [{ key: '20262', label: '2026 Q2' }],
  status,
  summaries: {},
})

beforeEach(() => {
  routeHarness.loadRegionalMarketData.mockReset()
})

describe('market-map data route boundary', () => {
  it('trims bounded query inputs, preserves supported intervals, and emits public cache headers', async () => {
    routeHarness.loadRegionalMarketData.mockResolvedValue(result('available'))

    const response = await GET(
      new NextRequest(
        'http://localhost/api/market-map-data/?assetClassKey=%20power.main%20&interval=quarter&period=%2020262%20',
      ),
    )

    expect(routeHarness.loadRegionalMarketData).toHaveBeenCalledWith(
      'power.main',
      'quarter',
      '20262',
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe(
      'public, max-age=60, s-maxage=300, stale-while-revalidate=300',
    )
    expect(response.headers.get('content-type')).toContain('application/json')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    expect(await response.json()).toEqual(result('available'))
  })

  it('defaults unknown intervals and maps upstream unavailability to a retryable response', async () => {
    routeHarness.loadRegionalMarketData.mockResolvedValue({
      ...result('unavailable'),
      interval: 'year',
    })

    const response = await GET(
      new NextRequest(
        'http://localhost/api/market-map-data/?assetClassKey=power&interval=week&period=latest',
      ),
    )

    expect(routeHarness.loadRegionalMarketData).toHaveBeenCalledWith('power', 'year', 'latest')
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ interval: 'year', status: 'unavailable' })
  })
})
