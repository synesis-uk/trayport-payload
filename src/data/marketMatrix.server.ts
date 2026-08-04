import 'server-only'

import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'

import { collectProjectionCacheDependencyTags } from './cacheDependencies'
import { MARKET_COVERAGE_INDEX_CACHE_TAG, VENUE_INDEX_CACHE_TAG } from './cacheTags'
import { buildMarketMatrixIndex, type MarketMatrixIndex } from './marketMatrix'

export const MARKET_MATRIX_CACHE_LIFE = {
  expire: 3600,
  revalidate: 300,
  stale: 300,
} as const

export const marketMatrixHubSelect = {
  assetClasses: true,
  externalDestination: true,
  path: true,
  regions: true,
  title: true,
} as const

export const marketMatrixVenueSelect = {
  displayOrder: true,
  marketConnections: {
    connectionType: true,
    hub: true,
  },
  path: true,
  title: true,
  venueTypes: true,
} as const

const orderedTitleSelect = {
  displayOrder: true,
  title: true,
} as const

const titledSelect = {
  title: true,
} as const

export const marketMatrixPopulate = {
  'asset-classes': orderedTitleSelect,
  hubs: titledSelect,
  regions: titledSelect,
  'venue-types': orderedTitleSelect,
} as const

const queryMarketMatrixIndex = async (
  draft: boolean,
): Promise<{ dependencyTags: string[]; value: MarketMatrixIndex }> => {
  const payload = await getPayload({ config: configPromise })
  const where = draft ? undefined : { _status: { equals: 'published' as const } }
  const [hubResult, venueResult] = await Promise.all([
    payload.find({
      collection: 'hubs',
      depth: 1,
      draft,
      overrideAccess: draft,
      pagination: false,
      populate: marketMatrixPopulate,
      select: marketMatrixHubSelect,
      sort: 'title',
      where,
    }),
    payload.find({
      collection: 'venues',
      depth: 1,
      draft,
      overrideAccess: draft,
      pagination: false,
      populate: marketMatrixPopulate,
      select: marketMatrixVenueSelect,
      sort: 'displayOrder',
      where,
    }),
  ])

  return {
    dependencyTags: collectProjectionCacheDependencyTags(
      [
        { source: 'hubs', value: hubResult.docs },
        { source: 'venues', value: venueResult.docs },
      ],
      { reservedTagCount: 2 },
    ),
    value: buildMarketMatrixIndex(hubResult.docs, venueResult.docs),
  }
}

const getCachedPublishedMarketMatrixIndex = async (): Promise<MarketMatrixIndex> => {
  'use cache'

  cacheLife(MARKET_MATRIX_CACHE_LIFE)
  cacheTag(MARKET_COVERAGE_INDEX_CACHE_TAG)
  cacheTag(VENUE_INDEX_CACHE_TAG)
  const projection = await queryMarketMatrixIndex(false)
  for (const tag of projection.dependencyTags) cacheTag(tag)
  return projection.value
}

export interface MarketMatrixLoadOptions {
  draft?: boolean
}

/** Draft previews branch before `use cache`; public matrix data is tagged by both owners. */
export const loadMarketMatrixIndex = ({ draft = false }: MarketMatrixLoadOptions = {}) =>
  draft
    ? queryMarketMatrixIndex(true).then(({ value }) => value)
    : getCachedPublishedMarketMatrixIndex()

export const marketMatrixLoaderContract = {
  cacheKeyStrategy: 'use-cache-function',
  cacheLife: MARKET_MATRIX_CACHE_LIFE,
  cacheTags: [MARKET_COVERAGE_INDEX_CACHE_TAG, VENUE_INDEX_CACHE_TAG],
  collections: ['hubs', 'venues'],
  draftCached: false,
  publishedCached: true,
  routePath: '/resources/market-matrix/',
  select: {
    hubs: marketMatrixHubSelect,
    venues: marketMatrixVenueSelect,
  },
} as const
