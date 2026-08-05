import 'server-only'

import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'

import { collectProjectionCacheDependencyTags } from './cacheDependencies'
import { MARKET_COVERAGE_INDEX_CACHE_TAG, VENUE_INDEX_CACHE_TAG } from './cacheTags'
import { buildRegionalMarketMapIndex, type RegionalMarketMapIndex } from './regionalMarketMap'

export const REGIONAL_MARKET_MAP_CACHE_LIFE = {
  expire: 3600,
  revalidate: 300,
  stale: 300,
} as const

export const regionalMapAssetClassSelect = {
  displayOrder: true,
  legacySource: true,
  mapAppearance: true,
  marketDataKey: true,
  slug: true,
  title: true,
} as const

export const regionalMapRegionSelect = {
  code: true,
  map: true,
  title: true,
} as const

export const regionalMapVenueTypeSelect = {
  displayOrder: true,
  mapLabel: true,
  parentVenueType: true,
  title: true,
} as const

export const regionalMapHubSelect = {
  assetClasses: true,
  connectedCountryCodes: true,
  countryCode: true,
  externalDestination: true,
  hubType: true,
  legacySource: true,
  map: true,
  marketDataKey: true,
  path: true,
  regions: true,
  relatedHubs: true,
  showOnMap: true,
  title: true,
  venueTypes: true,
} as const

export const regionalMapVenueSelect = {
  marketConnections: true,
  path: true,
  title: true,
  venueTypes: true,
  website: true,
} as const

const relationshipTitleSelect = { title: true } as const

export const regionalMapPopulate = {
  'asset-classes': regionalMapAssetClassSelect,
  hubs: relationshipTitleSelect,
  regions: regionalMapRegionSelect,
  'venue-types': regionalMapVenueTypeSelect,
} as const

const queryRegionalMarketMap = async (
  draft: boolean,
): Promise<{ dependencyTags: string[]; value: RegionalMarketMapIndex }> => {
  const payload = await getPayload({ config: configPromise })
  const publishedWhere = draft ? undefined : { _status: { equals: 'published' as const } }
  const [assetClassResult, regionResult, venueTypeResult, hubResult, venueResult] =
    await Promise.all([
      payload.find({
        collection: 'asset-classes',
        depth: 0,
        overrideAccess: draft,
        pagination: false,
        select: regionalMapAssetClassSelect,
        sort: 'displayOrder',
      }),
      payload.find({
        collection: 'regions',
        depth: 0,
        overrideAccess: draft,
        pagination: false,
        select: regionalMapRegionSelect,
        sort: 'title',
      }),
      payload.find({
        collection: 'venue-types',
        depth: 1,
        overrideAccess: draft,
        pagination: false,
        populate: regionalMapPopulate,
        select: regionalMapVenueTypeSelect,
        sort: 'displayOrder',
      }),
      payload.find({
        collection: 'hubs',
        depth: 1,
        draft,
        overrideAccess: draft,
        pagination: false,
        populate: regionalMapPopulate,
        select: regionalMapHubSelect,
        sort: 'title',
        where: publishedWhere,
      }),
      payload.find({
        collection: 'venues',
        depth: 1,
        draft,
        overrideAccess: draft,
        pagination: false,
        populate: regionalMapPopulate,
        select: regionalMapVenueSelect,
        sort: 'title',
        where: publishedWhere,
      }),
    ])

  const documents = {
    assetClasses: assetClassResult.docs,
    hubs: hubResult.docs,
    regions: regionResult.docs,
    venueTypes: venueTypeResult.docs,
    venues: venueResult.docs,
  }

  return {
    dependencyTags: collectProjectionCacheDependencyTags(
      [
        { source: 'asset-classes', value: assetClassResult.docs },
        { source: 'regions', value: regionResult.docs },
        { source: 'venue-types', value: venueTypeResult.docs },
        { source: 'hubs', value: hubResult.docs },
        { source: 'venues', value: venueResult.docs },
      ],
      { reservedTagCount: 2 },
    ),
    value: buildRegionalMarketMapIndex(documents),
  }
}

const getCachedPublishedRegionalMarketMap = async (): Promise<RegionalMarketMapIndex> => {
  'use cache'

  cacheLife(REGIONAL_MARKET_MAP_CACHE_LIFE)
  cacheTag(MARKET_COVERAGE_INDEX_CACHE_TAG)
  cacheTag(VENUE_INDEX_CACHE_TAG)
  const projection = await queryRegionalMarketMap(false)
  for (const tag of projection.dependencyTags) cacheTag(tag)
  return projection.value
}

export interface RegionalMarketMapLoadOptions {
  draft?: boolean
}

export const loadRegionalMarketMapIndex = ({ draft = false }: RegionalMarketMapLoadOptions = {}) =>
  draft
    ? queryRegionalMarketMap(true).then(({ value }) => value)
    : getCachedPublishedRegionalMarketMap()

export const regionalMarketMapLoaderContract = {
  cacheLife: REGIONAL_MARKET_MAP_CACHE_LIFE,
  cacheTags: [MARKET_COVERAGE_INDEX_CACHE_TAG, VENUE_INDEX_CACHE_TAG],
  collections: ['asset-classes', 'regions', 'venue-types', 'hubs', 'venues'],
  draftCached: false,
  publishedCached: true,
  providerCredentialsInPayload: false,
} as const
