// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'

const loaderHarness = vi.hoisted(() => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  find: vi.fn(),
}))

vi.mock('@payload-config', () => ({
  default: Promise.resolve({}),
}))

vi.mock('payload', () => ({
  getPayload: async () => ({ find: loaderHarness.find }),
}))

vi.mock('next/cache', () => ({
  cacheLife: loaderHarness.cacheLife,
  cacheTag: loaderHarness.cacheTag,
}))

import { contentViewOwnership } from '@/components/content/ownership'
import {
  articleListingCacheTag,
  cacheDependencyTag,
  LEARNING_VIDEO_LISTING_CACHE_TAG,
  MARKET_COVERAGE_INDEX_CACHE_TAG,
  VENUE_INDEX_CACHE_TAG,
} from '@/data/cacheTags'
import {
  CONTENT_INDEX_CACHE_LIFE,
  CONTENT_INDEX_CACHE_REVALIDATE_SECONDS,
  contentIndexLoaderContract,
  loadMarketCoverageIndex,
  loadVenueIndex,
  marketCoverageIndexPopulate,
  marketCoverageIndexSelect,
  venueIndexPopulate,
  venueIndexSelect,
} from '@/data/contentIndexes.server'
import {
  articleListingSelect,
  learningVideoListingSelect,
  listingContentPopulate,
} from '@/data/listingContent'
import {
  LISTING_CONTENT_CACHE_LIFE,
  listingContentLoaderContract,
  loadArticleListing,
  loadLearningVideoListing,
} from '@/data/listingContent.server'

beforeEach(() => {
  loaderHarness.cacheLife.mockReset()
  loaderHarness.cacheTag.mockReset()
  loaderHarness.find.mockReset()
})

describe('content view module boundary', () => {
  it('keeps one explicit ownership map for the public content views', () => {
    expect(contentViewOwnership).toEqual({
      ArticleView: 'page-article',
      HubView: 'hub',
      LearningVideoView: 'learning-video',
      MarketCoverageIndexView: 'indexes',
      PageView: 'page-article',
      VenueIndexView: 'indexes',
      VenueView: 'venue',
      splitLeadingHero: 'shared',
    })
  })
})

describe('content index loader boundary', () => {
  it('selects the filename required for storage adapters to derive compact media URLs', () => {
    expect(venueIndexPopulate.media).toMatchObject({
      filename: true,
      url: true,
    })
    expect(listingContentPopulate.media).toMatchObject({
      filename: true,
      url: true,
    })
  })

  it('defines explicit use-cache lifetimes using the existing content invalidation tag', () => {
    expect(contentIndexLoaderContract).toEqual({
      marketCoverage: {
        cacheKeyStrategy: 'use-cache-function',
        cacheLife: CONTENT_INDEX_CACHE_LIFE,
        cacheTag: MARKET_COVERAGE_INDEX_CACHE_TAG,
        collection: 'hubs',
        draftCached: false,
        publishedCached: true,
        routePath: '/market-coverage/',
        select: marketCoverageIndexSelect,
      },
      venues: {
        cacheKeyStrategy: 'use-cache-function',
        cacheLife: CONTENT_INDEX_CACHE_LIFE,
        cacheTag: VENUE_INDEX_CACHE_TAG,
        collection: 'venues',
        draftCached: false,
        publishedCached: true,
        routePath: '/venue/',
        select: venueIndexSelect,
      },
    })
    expect(CONTENT_INDEX_CACHE_LIFE).toEqual({
      expire: 3600,
      revalidate: CONTENT_INDEX_CACHE_REVALIDATE_SECONDS,
      stale: CONTENT_INDEX_CACHE_REVALIDATE_SECONDS,
    })
  })

  it('loads a compact, sorted published venue model through the cache boundary', async () => {
    loaderHarness.find.mockResolvedValueOnce({
      docs: [
        {
          displayOrder: 20,
          id: 20,
          logo: null,
          path: '/venue/zeta/',
          regions: [{ id: 1, title: 'Europe' }],
          summary: 'Zeta summary',
          title: 'Zeta',
          venueTypes: [{ id: 11, title: 'Exchange' }],
        },
        {
          displayOrder: 10,
          id: 10,
          logo: { alt: 'Alpha logo', id: 101, url: '/media/alpha.svg' },
          path: '/venue/alpha/',
          regions: [9, { id: 2, title: 'Global' }],
          summary: null,
          title: 'Alpha',
          venueTypes: [{ id: 12, title: 'Broker' }],
        },
        {
          displayOrder: 0,
          id: 30,
          path: null,
          title: 'Not routable',
        },
      ],
    })

    await expect(loadVenueIndex()).resolves.toEqual([
      {
        displayOrder: 10,
        id: 10,
        logo: { alt: 'Alpha logo', id: 101, url: '/media/alpha.svg' },
        path: '/venue/alpha/',
        regions: ['Global'],
        summary: null,
        title: 'Alpha',
        venueTypes: ['Broker'],
      },
      {
        displayOrder: 20,
        id: 20,
        logo: null,
        path: '/venue/zeta/',
        regions: ['Europe'],
        summary: 'Zeta summary',
        title: 'Zeta',
        venueTypes: ['Exchange'],
      },
    ])
    expect(loaderHarness.cacheLife).toHaveBeenCalledWith(CONTENT_INDEX_CACHE_LIFE)
    expect(loaderHarness.cacheTag).toHaveBeenCalledWith(VENUE_INDEX_CACHE_TAG)
    for (const tag of [
      cacheDependencyTag('media', 101),
      cacheDependencyTag('regions', 1),
      cacheDependencyTag('regions', 2),
      cacheDependencyTag('regions', 9),
      cacheDependencyTag('venue-types', 11),
      cacheDependencyTag('venue-types', 12),
    ]) {
      expect(loaderHarness.cacheTag).toHaveBeenCalledWith(tag)
    }
    expect(loaderHarness.find).toHaveBeenCalledWith({
      collection: 'venues',
      depth: 1,
      draft: false,
      overrideAccess: false,
      pagination: false,
      populate: venueIndexPopulate,
      select: venueIndexSelect,
      where: {
        and: [{ _status: { equals: 'published' } }, { contentMode: { equals: 'page' } }],
      },
    })
  })

  it('never enters the published venue cache for authenticated draft reads', async () => {
    loaderHarness.find.mockResolvedValueOnce({ docs: [] })

    await expect(loadVenueIndex({ draft: true })).resolves.toEqual([])
    expect(loaderHarness.cacheLife).not.toHaveBeenCalled()
    expect(loaderHarness.cacheTag).not.toHaveBeenCalled()
    expect(loaderHarness.find).toHaveBeenCalledWith({
      collection: 'venues',
      depth: 1,
      draft: true,
      overrideAccess: true,
      pagination: false,
      populate: venueIndexPopulate,
      select: venueIndexSelect,
      where: { contentMode: { equals: 'page' } },
    })
  })

  it('loads compact published market cards and map points through the cache boundary', async () => {
    loaderHarness.find.mockResolvedValueOnce({
      docs: [
        {
          assetClasses: [{ displayOrder: 1, id: 21, slug: 'power', title: 'Power' }],
          code: 'GB',
          contentMode: 'page',
          id: 1,
          map: {
            markers: [
              { label: 'London', location: { latitude: 51.5072, longitude: -0.1276 } },
              { label: 'Incomplete', location: { latitude: null, longitude: -0.1276 } },
            ],
          },
          path: '/market-coverage/gb/',
          regions: [{ id: 1, title: 'Europe' }],
          showOnMap: true,
          summary: 'Great Britain market',
          title: 'Great Britain',
        },
        {
          assetClasses: [],
          code: null,
          contentMode: 'external',
          id: 2,
          map: {
            markers: [{ label: null, location: { latitude: 40, longitude: -74 } }],
          },
          path: null,
          regions: [],
          showOnMap: true,
          summary: null,
          title: 'External market',
        },
      ],
    })

    await expect(loadMarketCoverageIndex()).resolves.toEqual({
      allMarkers: [
        {
          assetClasses: [{ displayOrder: 1, id: 21, slug: 'power', title: 'Power' }],
          hubId: 1,
          label: 'London',
          latitude: 51.5072,
          longitude: -0.1276,
          regions: [{ id: 1, title: 'Europe' }],
        },
        {
          assetClasses: [],
          hubId: 2,
          label: 'External market',
          latitude: 40,
          longitude: -74,
          regions: [],
        },
      ],
      hubCount: 2,
      hubs: [
        {
          assetClasses: ['Power'],
          code: 'GB',
          id: 1,
          path: '/market-coverage/gb/',
          regions: ['Europe'],
          summary: 'Great Britain market',
          title: 'Great Britain',
        },
      ],
      markers: [
        {
          assetClasses: [{ displayOrder: 1, id: 21, slug: 'power', title: 'Power' }],
          hubId: 1,
          label: 'London',
          latitude: 51.5072,
          longitude: -0.1276,
          regions: [{ id: 1, title: 'Europe' }],
        },
        {
          assetClasses: [],
          hubId: 2,
          label: 'External market',
          latitude: 40,
          longitude: -74,
          regions: [],
        },
      ],
    })
    expect(loaderHarness.cacheLife).toHaveBeenCalledWith(CONTENT_INDEX_CACHE_LIFE)
    expect(loaderHarness.cacheTag).toHaveBeenCalledWith(MARKET_COVERAGE_INDEX_CACHE_TAG)
    expect(loaderHarness.cacheTag).toHaveBeenCalledWith(cacheDependencyTag('asset-classes', 21))
    expect(loaderHarness.cacheTag).toHaveBeenCalledWith(cacheDependencyTag('regions', 1))
    expect(loaderHarness.find).toHaveBeenCalledWith({
      collection: 'hubs',
      depth: 1,
      draft: false,
      overrideAccess: false,
      pagination: false,
      populate: marketCoverageIndexPopulate,
      select: marketCoverageIndexSelect,
      sort: 'title',
      where: { _status: { equals: 'published' } },
    })
  })

  it('never enters the published market cache for authenticated draft reads', async () => {
    loaderHarness.find.mockResolvedValueOnce({ docs: [] })

    await expect(loadMarketCoverageIndex({ draft: true })).resolves.toEqual({
      allMarkers: [],
      hubCount: 0,
      hubs: [],
      markers: [],
    })
    expect(loaderHarness.cacheLife).not.toHaveBeenCalled()
    expect(loaderHarness.cacheTag).not.toHaveBeenCalled()
    expect(loaderHarness.find).toHaveBeenCalledWith({
      collection: 'hubs',
      depth: 1,
      draft: true,
      overrideAccess: true,
      pagination: false,
      populate: marketCoverageIndexPopulate,
      select: marketCoverageIndexSelect,
      sort: 'title',
      where: undefined,
    })
  })
})

describe('content listing loader boundary', () => {
  it('declares complete, compact published listing caches without document caps', () => {
    expect(listingContentLoaderContract).toEqual({
      articles: {
        cacheKeyStrategy: 'use-cache-function-with-family',
        cacheLife: LISTING_CONTENT_CACHE_LIFE,
        cacheTagStrategy: 'listing:articles:<family>',
        collection: 'articles',
        draftCached: false,
        pagination: false,
        publishedCached: true,
        select: articleListingSelect,
      },
      learningVideos: {
        cacheKeyStrategy: 'use-cache-function',
        cacheLife: LISTING_CONTENT_CACHE_LIFE,
        cacheTag: LEARNING_VIDEO_LISTING_CACHE_TAG,
        collection: 'learning-videos',
        draftCached: false,
        pagination: false,
        publishedCached: true,
        select: learningVideoListingSelect,
      },
    })
  })

  it('loads every published article in the requested family through the tagged cache', async () => {
    const docs = [
      {
        categories: [{ id: 31, title: 'News' }],
        heroMedia: { id: 41 },
        id: 1,
        title: 'Published news',
      },
    ]
    loaderHarness.find.mockResolvedValueOnce({ docs })

    await expect(loadArticleListing('news')).resolves.toEqual(docs)

    expect(loaderHarness.cacheLife).toHaveBeenCalledWith(LISTING_CONTENT_CACHE_LIFE)
    expect(loaderHarness.cacheTag).toHaveBeenCalledWith(articleListingCacheTag('news'))
    expect(loaderHarness.cacheTag).toHaveBeenCalledWith(
      cacheDependencyTag('article-categories', 31),
    )
    expect(loaderHarness.cacheTag).toHaveBeenCalledWith(cacheDependencyTag('media', 41))
    expect(loaderHarness.find).toHaveBeenCalledWith({
      collection: 'articles',
      depth: 2,
      draft: false,
      overrideAccess: false,
      pagination: false,
      populate: listingContentPopulate,
      select: articleListingSelect,
      sort: '-publishedAt',
      where: {
        and: [{ _status: { equals: 'published' } }, { articleType: { in: ['news'] } }],
      },
    })
  })

  it('bypasses the article cache for authenticated draft listings', async () => {
    loaderHarness.find.mockResolvedValueOnce({ docs: [] })

    await expect(loadArticleListing('events', { draft: true })).resolves.toEqual([])

    expect(loaderHarness.cacheLife).not.toHaveBeenCalled()
    expect(loaderHarness.cacheTag).not.toHaveBeenCalled()
    expect(loaderHarness.find).toHaveBeenCalledWith({
      collection: 'articles',
      depth: 2,
      draft: true,
      overrideAccess: true,
      pagination: false,
      populate: listingContentPopulate,
      select: articleListingSelect,
      sort: '-publishedAt',
      where: { articleType: { in: ['event'] } },
    })
  })

  it('loads every published learning video through the tagged cache', async () => {
    const docs = [
      {
        categories: [{ id: 32, title: 'Training' }],
        id: 2,
        poster: { id: 42 },
        title: 'Published video',
      },
    ]
    loaderHarness.find.mockResolvedValueOnce({ docs })

    await expect(loadLearningVideoListing()).resolves.toEqual(docs)

    expect(loaderHarness.cacheLife).toHaveBeenCalledWith(LISTING_CONTENT_CACHE_LIFE)
    expect(loaderHarness.cacheTag).toHaveBeenCalledWith(LEARNING_VIDEO_LISTING_CACHE_TAG)
    expect(loaderHarness.cacheTag).toHaveBeenCalledWith(
      cacheDependencyTag('learning-video-categories', 32),
    )
    expect(loaderHarness.cacheTag).toHaveBeenCalledWith(cacheDependencyTag('media', 42))
    expect(loaderHarness.find).toHaveBeenCalledWith({
      collection: 'learning-videos',
      depth: 2,
      draft: false,
      overrideAccess: false,
      pagination: false,
      populate: listingContentPopulate,
      select: learningVideoListingSelect,
      sort: 'displayOrder',
      where: { _status: { equals: 'published' } },
    })
  })

  it('bypasses the learning-video cache for authenticated draft listings', async () => {
    loaderHarness.find.mockResolvedValueOnce({ docs: [] })

    await expect(loadLearningVideoListing({ draft: true })).resolves.toEqual([])

    expect(loaderHarness.cacheLife).not.toHaveBeenCalled()
    expect(loaderHarness.cacheTag).not.toHaveBeenCalled()
    expect(loaderHarness.find).toHaveBeenCalledWith({
      collection: 'learning-videos',
      depth: 2,
      draft: true,
      overrideAccess: true,
      pagination: false,
      populate: listingContentPopulate,
      select: learningVideoListingSelect,
      sort: 'displayOrder',
      where: undefined,
    })
  })
})
