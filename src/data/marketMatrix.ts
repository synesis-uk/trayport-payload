export type MarketMatrixConnectionType = 'a' | 'b' | 'd'

export interface MarketMatrixAssetClass {
  displayOrder: number
  id: string
  title: string
}

export interface MarketMatrixHub {
  assetClassIDs: string[]
  destination: string | null
  id: string
  regionIDs: string[]
  title: string
}

export interface MarketMatrixVenueType {
  displayOrder: number
  id: string
  title: string
}

export interface MarketMatrixVenue {
  connections: Record<string, MarketMatrixConnectionType>
  destination: string | null
  displayOrder: number
  id: string
  title: string
  venueType: MarketMatrixVenueType
}

export interface MarketMatrixIndex {
  assetClasses: MarketMatrixAssetClass[]
  hubs: MarketMatrixHub[]
  venueTypes: MarketMatrixVenueType[]
  venues: MarketMatrixVenue[]
}

type UnknownRecord = Record<string, unknown>

const record = (value: unknown): UnknownRecord | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : null

const values = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

const numericOrder = (value: unknown): number => {
  const order = Number(value)
  return Number.isFinite(order) && order >= 0 ? order : 0
}

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  const related = record(value)
  return related && (typeof related.id === 'number' || typeof related.id === 'string')
    ? String(related.id)
    : null
}

const destination = (
  source: UnknownRecord,
  externalField: 'externalDestination' | 'website',
): string | null => {
  const path = text(source.path)
  if (path.startsWith('/')) return path

  const external = text(source[externalField])
  return /^https:\/\//iu.test(external) ? external : null
}

const asOrderedEntity = (value: unknown, fallbackTitle: string): MarketMatrixAssetClass | null => {
  const id = relationshipID(value)
  if (!id) return null
  const related = record(value)

  return {
    displayOrder: numericOrder(related?.displayOrder),
    id,
    title: text(related?.title) || fallbackTitle,
  }
}

const compareOrderedTitle = (
  left: { displayOrder: number; title: string },
  right: { displayOrder: number; title: string },
): number => left.displayOrder - right.displayOrder || left.title.localeCompare(right.title)

const connectionType = (value: unknown): MarketMatrixConnectionType | null =>
  value === 'a' || value === 'b' || value === 'd' ? value : null

export const mergeMarketMatrixConnection = (
  current: MarketMatrixConnectionType | undefined,
  next: MarketMatrixConnectionType,
): MarketMatrixConnectionType => {
  if (!current || current === next) return next
  if (current === 'b' || next === 'b') return 'b'
  return 'b'
}

const fallbackVenueType: MarketMatrixVenueType = {
  displayOrder: Number.MAX_SAFE_INTEGER,
  id: 'other',
  title: 'Other',
}

/** Builds the matrix from the authoritative venue-to-hub relationship. */
export const buildMarketMatrixIndex = (
  hubDocuments: readonly unknown[],
  venueDocuments: readonly unknown[],
): MarketMatrixIndex => {
  const assetClasses = new Map<string, MarketMatrixAssetClass>()
  const venueTypes = new Map<string, MarketMatrixVenueType>()
  const hubs = new Map<string, MarketMatrixHub>()
  const venues = new Map<string, MarketMatrixVenue>()

  for (const value of hubDocuments) {
    const hub = record(value)
    const id = relationshipID(hub)
    if (!hub || !id) continue

    const hubAssetClasses = values(hub.assetClasses).flatMap((assetClass) => {
      const normalized = asOrderedEntity(assetClass, 'Other')
      if (!normalized) return []
      assetClasses.set(normalized.id, normalized)
      return [normalized.id]
    })

    hubs.set(id, {
      assetClassIDs: [...new Set(hubAssetClasses)],
      destination: destination(hub, 'externalDestination'),
      id,
      regionIDs: [
        ...new Set(values(hub.regions).flatMap((region) => relationshipID(region) || [])),
      ],
      title: text(hub.title) || 'Untitled market hub',
    })
  }

  for (const value of venueDocuments) {
    const venue = record(value)
    const id = relationshipID(venue)
    if (!venue || !id) continue

    const types = values(venue.venueTypes)
      .flatMap((venueType) => {
        const normalized = asOrderedEntity(venueType, 'Other')
        if (!normalized) return []
        venueTypes.set(normalized.id, normalized)
        return [normalized]
      })
      .sort(compareOrderedTitle)
    const primaryType = types[0] || fallbackVenueType
    if (!types.length) venueTypes.set(fallbackVenueType.id, fallbackVenueType)
    const connections: Record<string, MarketMatrixConnectionType> = {}

    for (const value of values(venue.marketConnections)) {
      const connection = record(value)
      const hubID = relationshipID(connection?.hub)
      const type = connectionType(connection?.connectionType)
      if (!hubID || !type) continue
      connections[hubID] = mergeMarketMatrixConnection(connections[hubID], type)
    }

    venues.set(id, {
      connections,
      destination: destination(venue, 'website'),
      displayOrder: numericOrder(venue.displayOrder),
      id,
      title: text(venue.title) || 'Untitled venue',
      venueType: primaryType,
    })
  }

  return {
    assetClasses: [...assetClasses.values()].sort(compareOrderedTitle),
    hubs: [...hubs.values()].sort((left, right) => left.title.localeCompare(right.title)),
    venueTypes: [...venueTypes.values()].sort(compareOrderedTitle),
    venues: [...venues.values()]
      .filter((venue) => Object.keys(venue.connections).some((hubID) => hubs.has(hubID)))
      .sort(
        (left, right) =>
          compareOrderedTitle(left.venueType, right.venueType) ||
          left.displayOrder - right.displayOrder ||
          left.title.localeCompare(right.title),
      ),
  }
}
