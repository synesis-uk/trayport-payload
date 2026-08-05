import { createHash } from 'node:crypto'

import { normalizeContentPath } from '@/fields/contentPath'

export const CONTENT_SITEMAP_CACHE_TAG = 'content-sitemap'
export const REDIRECTS_CACHE_TAG = 'redirects'
export const ROUTE_REGISTRY_CACHE_TAG = 'route-registry'
export const LEARNING_VIDEO_LISTING_CACHE_TAG = 'listing:learning-videos'
export const VENUE_INDEX_CACHE_TAG = 'content-index:venues'
export const MARKET_COVERAGE_INDEX_CACHE_TAG = 'content-index:market-coverage'

// Route ownership and redirect mutations must be visible on the next request. The `max` profile
// intentionally permits a stale-while-revalidate response and is reserved for non-routing
// projections such as listings and populated content dependencies.
export const IMMEDIATE_CACHE_TAG_EXPIRY = { expire: 0 } as const

export const cacheDependencyCollections = [
  'article-categories',
  'articles',
  'asset-classes',
  'hubs',
  'learning-video-categories',
  'learning-videos',
  'lifecycle-items',
  'media',
  'offices',
  'pages',
  'people',
  'regions',
  'venue-types',
  'venues',
] as const

export type CacheDependencyCollection = (typeof cacheDependencyCollections)[number]

export const cacheDependencyTag = (collection: CacheDependencyCollection, id: number | string) =>
  `content-dependency:${collection}:${String(id)}`

export const cacheDependencyCollectionTag = (collection: CacheDependencyCollection) =>
  `content-dependency-collection:${collection}`

// Next permits at most 128 tags on one cache entry. Most public projections own one primary tag,
// leaving this default budget for populated-document dependencies; projections with more primary
// owners reserve them explicitly when collecting their complete dependency set.
export const CACHE_TAG_MAX_LENGTH = 256
export const CACHE_TAG_ITEM_LIMIT = 128
export const CACHE_DEPENDENCY_TAG_BUDGET = CACHE_TAG_ITEM_LIMIT - 1

/**
 * Canonical public paths are external/editorial input and may exceed Next's 256-character cache
 * tag limit. Hash the normalized value so cache reads and mutation hooks share one deterministic,
 * bounded key without imposing an unrelated URL-length restriction on editors.
 */
export const contentRouteCacheTag = (path: string): string => {
  const normalized = normalizeContentPath(path)
  if (typeof normalized !== 'string') {
    throw new TypeError('A string content path is required to build its cache tag.')
  }

  const digest = createHash('sha256').update(normalized).digest('hex')
  return `content-route:v1:${digest}`
}

export const articleListingCacheTag = (family: string) => `listing:articles:${family}`

export const articleListingFamiliesForType = (
  articleType: unknown,
): Array<'all' | 'events' | 'insights' | 'news'> => {
  if (articleType === 'news') return ['all', 'news']
  if (articleType === 'event') return ['all', 'events']
  if (['insight', 'webinar', 'video', 'case-study'].includes(String(articleType))) {
    return ['all', 'insights']
  }
  return ['all']
}
