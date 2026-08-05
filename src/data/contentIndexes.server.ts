import 'server-only'

import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'

import type { Hub, Venue } from '@/payload-types'

import { collectCacheDependencyTags } from './cacheDependencies'
import { MARKET_COVERAGE_INDEX_CACHE_TAG, VENUE_INDEX_CACHE_TAG } from './cacheTags'

export const CONTENT_INDEX_CACHE_REVALIDATE_SECONDS = 300
export const CONTENT_INDEX_CACHE_LIFE = {
  expire: 3600,
  revalidate: CONTENT_INDEX_CACHE_REVALIDATE_SECONDS,
  stale: CONTENT_INDEX_CACHE_REVALIDATE_SECONDS,
} as const

export const venueIndexSelect = {
  displayOrder: true,
  logo: true,
  path: true,
  regions: true,
  summary: true,
  title: true,
  venueTypes: true,
} as const

export const marketCoverageIndexSelect = {
  assetClasses: true,
  code: true,
  contentMode: true,
  map: {
    markers: {
      label: true,
      location: {
        latitude: true,
        longitude: true,
      },
    },
  },
  path: true,
  regions: true,
  showOnMap: true,
  summary: true,
  title: true,
} as const

const indexMediaSelect = {
  alt: true,
  externalURL: true,
  filename: true,
  height: true,
  mimeType: true,
  title: true,
  updatedAt: true,
  url: true,
  width: true,
} as const

const titledRelationshipSelect = {
  title: true,
} as const

const orderedRelationshipSelect = {
  displayOrder: true,
  mapAppearance: {
    color: true,
  },
  slug: true,
  title: true,
} as const

export const venueIndexPopulate = {
  media: indexMediaSelect,
  regions: titledRelationshipSelect,
  'venue-types': titledRelationshipSelect,
} as const

export const marketCoverageIndexPopulate = {
  'asset-classes': orderedRelationshipSelect,
  regions: titledRelationshipSelect,
} as const

type TitledRelationship = number | { title?: string | null } | null

const titlesFromRelationships = (values?: TitledRelationship[] | null): string[] =>
  (values || []).flatMap((value) =>
    value && typeof value === 'object' && value.title ? [value.title] : [],
  )

export interface VenueIndexItemViewModel {
  displayOrder: number
  id: Venue['id']
  logo: Venue['logo']
  path: string
  regions: string[]
  summary: string | null
  title: string
  venueTypes: string[]
}

export interface MarketCoverageHubViewModel {
  assetClasses: string[]
  code: string | null
  id: Hub['id']
  path: string
  regions: string[]
  summary: string | null
  title: string
}

export interface MarketCoverageMarkerViewModel {
  assetClasses: Array<{
    displayOrder: number
    color?: string
    id: number
    slug: string
    title: string
  }>
  hubId: Hub['id']
  label: string
  latitude: number
  longitude: number
  regions: Array<{
    id: number
    title: string
  }>
}

export interface MarketCoverageIndexViewModel {
  allMarkers: MarketCoverageMarkerViewModel[]
  hubCount: number
  hubs: MarketCoverageHubViewModel[]
  markers: MarketCoverageMarkerViewModel[]
}

export interface ContentIndexLoadOptions {
  draft?: boolean
}

const queryVenueIndex = async (
  draft: boolean,
): Promise<{ dependencyTags: string[]; value: VenueIndexItemViewModel[] }> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'venues',
    depth: 1,
    draft,
    overrideAccess: draft,
    pagination: false,
    populate: venueIndexPopulate,
    select: venueIndexSelect,
    where: draft
      ? { contentMode: { equals: 'page' } }
      : {
          and: [{ _status: { equals: 'published' } }, { contentMode: { equals: 'page' } }],
        },
  })

  return {
    dependencyTags: collectCacheDependencyTags(result.docs, 'venues'),
    value: result.docs
      .flatMap((venue) =>
        venue.path
          ? [
              {
                displayOrder: venue.displayOrder || 0,
                id: venue.id,
                logo: venue.logo || null,
                path: venue.path,
                regions: titlesFromRelationships(venue.regions),
                summary: venue.summary || null,
                title: venue.title,
                venueTypes: titlesFromRelationships(venue.venueTypes),
              },
            ]
          : [],
      )
      .sort(
        (left, right) =>
          left.displayOrder - right.displayOrder || left.title.localeCompare(right.title),
      ),
  }
}

const queryMarketCoverageIndex = async (
  draft: boolean,
): Promise<{ dependencyTags: string[]; value: MarketCoverageIndexViewModel }> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'hubs',
    depth: 1,
    draft,
    overrideAccess: draft,
    pagination: false,
    populate: marketCoverageIndexPopulate,
    select: marketCoverageIndexSelect,
    sort: 'title',
    where: draft ? undefined : { _status: { equals: 'published' } },
  })

  const hubs = result.docs.flatMap((hub) =>
    hub.contentMode === 'page' && hub.path
      ? [
          {
            assetClasses: titlesFromRelationships(hub.assetClasses),
            code: hub.code || null,
            id: hub.id,
            path: hub.path,
            regions: titlesFromRelationships(hub.regions),
            summary: hub.summary || null,
            title: hub.title,
          },
        ]
      : [],
  )
  const markersForHub = (hub: (typeof result.docs)[number]): MarketCoverageMarkerViewModel[] =>
    (hub.map?.markers || []).flatMap((marker) => {
      const { latitude, longitude } = marker.location
      return typeof latitude === 'number' && typeof longitude === 'number'
        ? [
            {
              assetClasses: (hub.assetClasses || []).flatMap((assetClass) =>
                assetClass && typeof assetClass === 'object'
                  ? [
                      {
                        displayOrder: assetClass.displayOrder || 0,
                        ...(assetClass.mapAppearance?.color
                          ? { color: assetClass.mapAppearance.color }
                          : {}),
                        id: assetClass.id,
                        slug: assetClass.slug,
                        title: assetClass.title,
                      },
                    ]
                  : [],
              ),
              hubId: hub.id,
              label: marker.label || hub.title,
              latitude,
              longitude,
              regions: (hub.regions || []).flatMap((region) =>
                region && typeof region === 'object'
                  ? [{ id: region.id, title: region.title }]
                  : [],
              ),
            },
          ]
        : []
    })
  const allMarkers = result.docs.flatMap(markersForHub)
  const markers = result.docs.filter((hub) => hub.showOnMap).flatMap(markersForHub)

  return {
    dependencyTags: collectCacheDependencyTags(result.docs, 'hubs'),
    value: { allMarkers, hubCount: result.docs.length, hubs, markers },
  }
}

const getCachedPublishedVenueIndex = async (): Promise<VenueIndexItemViewModel[]> => {
  'use cache'

  cacheLife(CONTENT_INDEX_CACHE_LIFE)
  cacheTag(VENUE_INDEX_CACHE_TAG)
  const projection = await queryVenueIndex(false)
  for (const tag of projection.dependencyTags) cacheTag(tag)
  return projection.value
}

const getCachedPublishedMarketCoverageIndex = async (): Promise<MarketCoverageIndexViewModel> => {
  'use cache'

  cacheLife(CONTENT_INDEX_CACHE_LIFE)
  cacheTag(MARKET_COVERAGE_INDEX_CACHE_TAG)
  const projection = await queryMarketCoverageIndex(false)
  for (const tag of projection.dependencyTags) cacheTag(tag)
  return projection.value
}

/**
 * Draft callers must already have passed the authenticated draft-mode gate.
 * The branch occurs outside `use cache` so draft documents are never persisted.
 */
export const loadVenueIndex = ({ draft = false }: ContentIndexLoadOptions = {}) =>
  draft ? queryVenueIndex(true).then(({ value }) => value) : getCachedPublishedVenueIndex()

/**
 * Draft callers must already have passed the authenticated draft-mode gate.
 * The branch occurs outside `use cache` so draft documents are never persisted.
 */
export const loadMarketCoverageIndex = ({ draft = false }: ContentIndexLoadOptions = {}) =>
  draft
    ? queryMarketCoverageIndex(true).then(({ value }) => value)
    : getCachedPublishedMarketCoverageIndex()

export const contentIndexLoaderContract = {
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
} as const
