import { connectionsMapMarkerColor } from '@/config/connectionsMap'
import {
  geoJSONPositions,
  normalizeMapRouteGeoJSON,
  normalizeGeoJSON,
  type TrayportGeoJSON,
  type TrayportPosition,
} from '@/maps/geoJSON'

type UnknownRecord = Record<string, unknown>

const record = (value: unknown): UnknownRecord | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : null

const values = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

export const regionalMapRelationshipID = (value: unknown): string | null => {
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  const related = record(value)
  return related && (typeof related.id === 'number' || typeof related.id === 'string')
    ? String(related.id)
    : null
}

const coordinates = (value: unknown): TrayportPosition | null => {
  const candidate = record(value)
  const longitude = Number(candidate?.longitude)
  const latitude = Number(candidate?.latitude)
  return Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90
    ? [longitude, latitude]
    : null
}

const managedDestination = (source: UnknownRecord): string | null => {
  const path = text(source.path)
  if (path.startsWith('/')) return path
  for (const candidate of [source.externalDestination, source.website]) {
    const destination = text(candidate)
    if (/^https:\/\//iu.test(destination)) return destination
  }
  return null
}

const unique = <Value>(items: Value[]): Value[] => [...new Set(items)]

export interface RegionalMapAssetClass {
  color: string
  displayOrder: number
  id: string
  legacyID: number | null
  marketDataKey: string
  slug: string
  title: string
  volumeLabel: string
}

export interface RegionalMapRegion {
  boundary: TrayportGeoJSON | null
  centre: TrayportPosition | null
  id: string
  label: string
  pointsOfInterest: Array<{
    id: string
    label: string
    location: TrayportPosition
    popupText: string
  }>
  title: string
  zoom: number
}

export interface RegionalMapHubConnection {
  id: string
  route: TrayportGeoJSON | null
  showLineMarker: boolean
  sourceHubID: string
  targetHubID: string
  title: string
}

export interface RegionalMapHub {
  assetClassIDs: string[]
  countryCodes: string[]
  destination: string | null
  hubType: 'ohub' | 'phub' | 'rhub' | 'vhub'
  id: string
  legacyID: number | null
  marketDataKey: string
  points: Array<{ id: string; label: string; location: TrayportPosition }>
  regionIDs: string[]
  title: string
  venueTypeIDs: string[]
}

export interface RegionalMapVenueType {
  displayOrder: number
  id: string
  label: string
  parentID: string | null
  title: string
}

export interface RegionalMapVenue {
  connections: Array<{
    hubID: string
    type: 'a' | 'b' | 'd'
  }>
  destination: string | null
  id: string
  title: string
  venueTypeIDs: string[]
}

export interface RegionalMarketMapIndex {
  assetClasses: RegionalMapAssetClass[]
  connections: RegionalMapHubConnection[]
  hubs: RegionalMapHub[]
  regions: RegionalMapRegion[]
  venueTypes: RegionalMapVenueType[]
  venues: RegionalMapVenue[]
}

export interface RegionalMarketMapDocuments {
  assetClasses: readonly unknown[]
  hubs: readonly unknown[]
  regions: readonly unknown[]
  venueTypes: readonly unknown[]
  venues: readonly unknown[]
}

const assetClassFrom = (value: unknown): RegionalMapAssetClass | null => {
  const source = record(value)
  const id = regionalMapRelationshipID(source)
  if (!source || !id) return null
  const appearance = record(source.mapAppearance)
  const legacySource = record(source.legacySource)
  const slug = text(source.slug) || id

  return {
    color: text(appearance?.color) || connectionsMapMarkerColor(slug),
    displayOrder: Math.max(Number(source.displayOrder) || 0, 0),
    id,
    legacyID:
      Number.isInteger(Number(legacySource?.legacyId)) && Number(legacySource?.legacyId) > 0
        ? Number(legacySource?.legacyId)
        : null,
    marketDataKey: text(source.marketDataKey),
    slug,
    title: text(source.title) || 'Untitled asset class',
    volumeLabel: text(appearance?.volumeLabel),
  }
}

const regionFrom = (value: unknown): RegionalMapRegion | null => {
  const source = record(value)
  const id = regionalMapRelationshipID(source)
  if (!source || !id) return null
  const map = record(source.map)

  return {
    boundary: normalizeGeoJSON(map?.boundary),
    centre: coordinates(map?.centre),
    id,
    label: text(map?.label) || text(source.code) || text(source.title),
    pointsOfInterest: values(map?.pointsOfInterest).flatMap((candidate, index) => {
      const point = record(candidate)
      const location = coordinates(point?.location)
      return point && location
        ? [
            {
              id: `${id}:poi:${regionalMapRelationshipID(point) || index}`,
              label: text(point.label) || 'Point of interest',
              location,
              popupText: text(point.popupText),
            },
          ]
        : []
    }),
    title: text(source.title) || 'Untitled region',
    zoom: Math.min(Math.max(Number(map?.zoom) || 4, 1), 20),
  }
}

const venueTypeFrom = (value: unknown): RegionalMapVenueType | null => {
  const source = record(value)
  const id = regionalMapRelationshipID(source)
  if (!source || !id) return null
  return {
    displayOrder: Math.max(Number(source.displayOrder) || 0, 0),
    id,
    label: text(source.mapLabel) || text(source.title),
    parentID: regionalMapRelationshipID(source.parentVenueType),
    title: text(source.title) || 'Other venue',
  }
}

const hubFrom = (value: unknown): RegionalMapHub | null => {
  const source = record(value)
  const id = regionalMapRelationshipID(source)
  if (!source || !id || source.showOnMap === false) return null
  const map = record(source.map)
  const legacySource = record(source.legacySource)
  const markerPoints = values(map?.markers).flatMap((candidate, index) => {
    const marker = record(candidate)
    const location = coordinates(marker?.location)
    return marker && location
      ? [
          {
            id: `${id}:marker:${regionalMapRelationshipID(marker) || index}`,
            label: text(marker.label) || text(source.title),
            location,
          },
        ]
      : []
  })
  const centre = coordinates(map?.centre)
  const points = markerPoints.length
    ? markerPoints
    : centre
      ? [
          {
            id: `${id}:centre`,
            label: text(map?.locationLabel) || text(source.title),
            location: centre,
          },
        ]
      : []
  const hubType = text(source.hubType)

  return {
    assetClassIDs: unique(
      values(source.assetClasses).flatMap((item) => regionalMapRelationshipID(item) || []),
    ),
    countryCodes: unique(
      [
        text(source.countryCode).toUpperCase(),
        ...values(source.connectedCountryCodes).map((item) =>
          text(record(item)?.code).toUpperCase(),
        ),
      ].filter((code) => /^[A-Z]{3}$/u.test(code)),
    ),
    destination: managedDestination(source),
    hubType: hubType === 'ohub' || hubType === 'phub' || hubType === 'rhub' ? hubType : 'vhub',
    id,
    legacyID:
      Number.isInteger(Number(legacySource?.legacyId)) && Number(legacySource?.legacyId) > 0
        ? Number(legacySource?.legacyId)
        : null,
    marketDataKey: text(source.marketDataKey),
    points,
    regionIDs: unique(
      values(source.regions).flatMap((item) => regionalMapRelationshipID(item) || []),
    ),
    title: text(source.title) || 'Untitled market hub',
    venueTypeIDs: unique(
      values(source.venueTypes).flatMap((item) => regionalMapRelationshipID(item) || []),
    ),
  }
}

const venueFrom = (value: unknown): RegionalMapVenue | null => {
  const source = record(value)
  const id = regionalMapRelationshipID(source)
  if (!source || !id) return null

  return {
    connections: values(source.marketConnections).flatMap((candidate) => {
      const connection = record(candidate)
      const hubID = regionalMapRelationshipID(connection?.hub)
      const type = connection?.connectionType
      return hubID && (type === 'a' || type === 'b' || type === 'd') ? [{ hubID, type }] : []
    }),
    destination: managedDestination(source),
    id,
    title: text(source.title) || 'Untitled venue',
    venueTypeIDs: unique(
      values(source.venueTypes).flatMap((item) => regionalMapRelationshipID(item) || []),
    ),
  }
}

const hubConnectionsFrom = (
  documents: readonly unknown[],
  hubsByID: Map<string, RegionalMapHub>,
): RegionalMapHubConnection[] => {
  const connections = new Map<string, RegionalMapHubConnection>()

  for (const value of documents) {
    const source = record(value)
    const sourceHubID = regionalMapRelationshipID(source)
    if (!source || !sourceHubID || !hubsByID.has(sourceHubID)) continue
    const map = record(source.map)
    const explicit = values(map?.connections)
    const candidates = explicit.length
      ? explicit
      : values(source.relatedHubs).map((hub) => ({ hub, route: null, showLineMarker: false }))

    for (const candidateValue of candidates) {
      const candidate = record(candidateValue)
      const targetHubID = regionalMapRelationshipID(candidate?.hub || candidateValue)
      if (!targetHubID || targetHubID === sourceHubID || !hubsByID.has(targetHubID)) continue
      const id = [sourceHubID, targetHubID].sort().join(':')
      const sourceTitle = hubsByID.get(sourceHubID)?.title || ''
      const targetTitle = hubsByID.get(targetHubID)?.title || ''
      const existing = connections.get(id)
      const route = normalizeMapRouteGeoJSON(candidate?.route)
      connections.set(id, {
        id,
        route: route || existing?.route || null,
        showLineMarker: candidate?.showLineMarker === true || existing?.showLineMarker === true,
        sourceHubID,
        targetHubID,
        title:
          text(candidate?.lineMarkerLabel) || existing?.title || `${sourceTitle} to ${targetTitle}`,
      })
    }
  }

  return [...connections.values()]
}

export const buildRegionalMarketMapIndex = (
  documents: RegionalMarketMapDocuments,
): RegionalMarketMapIndex => {
  const assetClasses = documents.assetClasses
    .flatMap((value) => assetClassFrom(value) || [])
    .sort(
      (left, right) =>
        left.displayOrder - right.displayOrder || left.title.localeCompare(right.title),
    )
  const regions = documents.regions
    .flatMap((value) => regionFrom(value) || [])
    .sort((left, right) => left.title.localeCompare(right.title))
  const venueTypes = documents.venueTypes
    .flatMap((value) => venueTypeFrom(value) || [])
    .sort(
      (left, right) =>
        left.displayOrder - right.displayOrder || left.title.localeCompare(right.title),
    )
  const hubs = documents.hubs
    .flatMap((value) => hubFrom(value) || [])
    .filter(({ points }) => points.length > 0)
    .sort((left, right) => left.title.localeCompare(right.title))
  const hubsByID = new Map(hubs.map((hub) => [hub.id, hub]))
  const venues = documents.venues
    .flatMap((value) => venueFrom(value) || [])
    .map((venue) => ({
      ...venue,
      connections: venue.connections.filter(({ hubID }) => hubsByID.has(hubID)),
    }))
    .filter(({ connections }) => connections.length > 0)
    .sort((left, right) => left.title.localeCompare(right.title))

  return {
    assetClasses,
    connections: hubConnectionsFrom(documents.hubs, hubsByID),
    hubs,
    regions,
    venueTypes,
    venues,
  }
}

export interface RegionalMarketMapFilter {
  assetClassIDs?: readonly string[]
  hubIDs?: readonly string[]
  regionIDs?: readonly string[]
  venueTypeIDs?: readonly string[]
}

export const filterRegionalMarketMapIndex = (
  index: RegionalMarketMapIndex,
  filter: RegionalMarketMapFilter,
): RegionalMarketMapIndex => {
  const assetClassIDs = new Set(filter.assetClassIDs || [])
  const requestedHubIDs = new Set(filter.hubIDs || [])
  const regionIDs = new Set(filter.regionIDs || [])
  const venueTypeIDs = new Set(filter.venueTypeIDs || [])
  const candidateHubs = index.hubs.filter(
    (hub) =>
      (!assetClassIDs.size || hub.assetClassIDs.some((id) => assetClassIDs.has(id))) &&
      (!requestedHubIDs.size || requestedHubIDs.has(hub.id)) &&
      (!regionIDs.size || hub.regionIDs.some((id) => regionIDs.has(id))),
  )
  const candidateHubIDs = new Set(candidateHubs.map(({ id }) => id))
  const candidateVenues = index.venues
    .map((venue) => ({
      ...venue,
      connections: venue.connections.filter(({ hubID }) => candidateHubIDs.has(hubID)),
    }))
    .filter(
      (venue) =>
        venue.connections.length > 0 &&
        (!venueTypeIDs.size || venue.venueTypeIDs.some((id) => venueTypeIDs.has(id))),
    )
  // Legacy hub venue-type inverses are intentionally sparse. Venue types own
  // this relationship, so a type filter must be derived from actual venue
  // connections instead of dropping otherwise valid market hubs.
  const connectedHubIDs = new Set(
    candidateVenues.flatMap(({ connections }) => connections.map(({ hubID }) => hubID)),
  )
  const primaryHubs = venueTypeIDs.size
    ? candidateHubs.filter(({ id }) => connectedHubIDs.has(id))
    : candidateHubs
  const primaryHubIDs = new Set(primaryHubs.map(({ id }) => id))
  const usedAssetClassIDs = new Set(
    primaryHubs.flatMap(({ assetClassIDs: ids }) =>
      ids.filter((id) => !assetClassIDs.size || assetClassIDs.has(id)),
    ),
  )
  const routeConnections = index.connections.filter((connection) => {
    if (!primaryHubIDs.has(connection.sourceHubID) && !primaryHubIDs.has(connection.targetHubID)) {
      return false
    }
    const source = index.hubs.find(({ id }) => id === connection.sourceHubID)
    const target = index.hubs.find(({ id }) => id === connection.targetHubID)
    return Boolean(
      source &&
      target &&
      source.assetClassIDs.some(
        (id) => usedAssetClassIDs.has(id) && target.assetClassIDs.includes(id),
      ),
    )
  })
  // A regional view owns its in-region hubs, but legacy connectivity lines can
  // terminate at a related hub in another region. Retain those route endpoints
  // in the projection so the client can draw and select the complete route;
  // region filtering in the presentation still keeps them out of the primary
  // hub count and accessible region list.
  const routeEndpointIDs = new Set(
    routeConnections.flatMap(({ sourceHubID, targetHubID }) => [sourceHubID, targetHubID]),
  )
  const hubs = index.hubs.filter(({ id }) => primaryHubIDs.has(id) || routeEndpointIDs.has(id))
  const hubIDs = new Set(hubs.map(({ id }) => id))
  const usedRegionIDs = new Set(
    primaryHubs.flatMap(({ regionIDs: ids }) =>
      ids.filter((id) => !regionIDs.size || regionIDs.has(id)),
    ),
  )
  const venues = index.venues
    .map((venue) => ({
      ...venue,
      connections: venue.connections.filter(({ hubID }) => hubIDs.has(hubID)),
    }))
    .filter(
      (venue) =>
        venue.connections.length > 0 &&
        (!venueTypeIDs.size || venue.venueTypeIDs.some((id) => venueTypeIDs.has(id))),
    )
  const usedVenueTypeIDs = new Set(venues.flatMap(({ venueTypeIDs: ids }) => ids))
  let addedParent = true
  while (addedParent) {
    addedParent = false
    for (const venueType of index.venueTypes) {
      if (
        venueType.parentID &&
        usedVenueTypeIDs.has(venueType.id) &&
        !usedVenueTypeIDs.has(venueType.parentID)
      ) {
        usedVenueTypeIDs.add(venueType.parentID)
        addedParent = true
      }
    }
  }

  return {
    assetClasses: index.assetClasses.filter(({ id }) => usedAssetClassIDs.has(id)),
    connections: routeConnections,
    hubs,
    regions: index.regions.filter(({ id }) => usedRegionIDs.has(id)),
    venueTypes: index.venueTypes.filter(({ id }) => usedVenueTypeIDs.has(id)),
    venues,
  }
}

export const regionalMapBounds = (
  index: Pick<RegionalMarketMapIndex, 'hubs' | 'regions'>,
  regionID?: string | null,
): TrayportPosition[] => {
  const selectedRegion = regionID ? index.regions.find(({ id }) => id === regionID) : undefined
  const regionPositions = selectedRegion ? geoJSONPositions(selectedRegion.boundary) : []
  if (regionPositions.length) return regionPositions
  return index.hubs
    .filter((hub) => !regionID || hub.regionIDs.includes(regionID))
    .flatMap(({ points }) => points.map(({ location }) => location))
}
