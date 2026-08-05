// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'

const harness = vi.hoisted(() => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  find: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('payload', () => ({ getPayload: async () => ({ find: harness.find }) }))
vi.mock('next/cache', () => ({ cacheLife: harness.cacheLife, cacheTag: harness.cacheTag }))

import {
  cacheDependencyTag,
  MARKET_COVERAGE_INDEX_CACHE_TAG,
  VENUE_INDEX_CACHE_TAG,
} from '@/data/cacheTags'
import {
  loadMarketMatrixIndex,
  MARKET_MATRIX_CACHE_LIFE,
  marketMatrixHubSelect,
  marketMatrixLoaderContract,
  marketMatrixPopulate,
  marketMatrixVenueSelect,
} from '@/data/marketMatrix.server'

const hub = {
  assetClasses: [{ displayOrder: 1, id: 1, title: 'Power' }],
  id: 10,
  path: '/market-coverage/german-power/',
  regions: [{ id: 2, title: 'Europe' }],
  title: 'German Power',
}

const venue = {
  displayOrder: 1,
  id: 20,
  marketConnections: [{ connectionType: 'b', hub: { id: 10, title: 'German Power' } }],
  path: '/venue/eex/',
  title: 'EEX',
  venueTypes: [{ displayOrder: 1, id: 3, title: 'Exchange' }],
  website: 'https://www.eex.com',
}

beforeEach(() => {
  harness.cacheLife.mockReset()
  harness.cacheTag.mockReset()
  harness.find.mockReset()
  harness.find.mockImplementation(({ collection }: { collection: string }) =>
    Promise.resolve({ docs: collection === 'hubs' ? [hub] : [venue] }),
  )
})

describe('market-matrix server loader', () => {
  it('loads both complete public owners through one bounded tagged projection', async () => {
    await expect(loadMarketMatrixIndex()).resolves.toMatchObject({
      assetClasses: [{ id: '1', title: 'Power' }],
      hubs: [{ id: '10', title: 'German Power' }],
      venueTypes: [{ id: '3', title: 'Exchange' }],
      venues: [
        {
          connections: { '10': 'b' },
          destination: '/venue/eex/',
          id: '20',
          title: 'EEX',
        },
      ],
    })

    expect(harness.cacheLife).toHaveBeenCalledWith(MARKET_MATRIX_CACHE_LIFE)
    for (const tag of [
      MARKET_COVERAGE_INDEX_CACHE_TAG,
      VENUE_INDEX_CACHE_TAG,
      cacheDependencyTag('asset-classes', 1),
      cacheDependencyTag('regions', 2),
      cacheDependencyTag('hubs', 10),
      cacheDependencyTag('venue-types', 3),
    ]) {
      expect(harness.cacheTag).toHaveBeenCalledWith(tag)
    }
    expect(harness.find).toHaveBeenCalledWith({
      collection: 'hubs',
      depth: 1,
      draft: false,
      overrideAccess: false,
      pagination: false,
      populate: marketMatrixPopulate,
      select: marketMatrixHubSelect,
      sort: 'title',
      where: { _status: { equals: 'published' } },
    })
    expect(harness.find).toHaveBeenCalledWith({
      collection: 'venues',
      depth: 1,
      draft: false,
      overrideAccess: false,
      pagination: false,
      populate: marketMatrixPopulate,
      select: marketMatrixVenueSelect,
      sort: 'displayOrder',
      where: { _status: { equals: 'published' } },
    })
    expect(marketMatrixLoaderContract).toMatchObject({
      cacheTags: [MARKET_COVERAGE_INDEX_CACHE_TAG, VENUE_INDEX_CACHE_TAG],
      collections: ['hubs', 'venues'],
      draftCached: false,
      publishedCached: true,
      routePath: '/resources/market-matrix/',
    })
    expect(marketMatrixVenueSelect.website).toBe(true)
  })

  it('keeps authenticated draft relationship data outside the public cache', async () => {
    await expect(loadMarketMatrixIndex({ draft: true })).resolves.toMatchObject({
      hubs: [{ id: '10' }],
      venues: [{ id: '20' }],
    })

    expect(harness.cacheLife).not.toHaveBeenCalled()
    expect(harness.cacheTag).not.toHaveBeenCalled()
    expect(harness.find).toHaveBeenCalledWith(
      expect.objectContaining({ draft: true, overrideAccess: true, where: undefined }),
    )
  })
})
