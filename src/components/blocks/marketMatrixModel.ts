import type { MarketMatrixComponent } from '@/payload-types'
import type { MarketMatrixConnectionType, MarketMatrixIndex } from '@/data/marketMatrix'

export type MarketMatrixView = 'autoTrader' | 'combined' | 'joule'

export interface MarketMatrixPresentationHub {
  destination: string | null
  id: string
  title: string
}

export interface MarketMatrixPresentationGroup {
  hubs: MarketMatrixPresentationHub[]
  id: string
  title: string
}

export interface MarketMatrixPresentationVenueType {
  id: string
  title: string
}

export interface MarketMatrixPresentationVenue {
  connections: Record<string, MarketMatrixConnectionType>
  destination: string | null
  id: string
  title: string
  venueType: MarketMatrixPresentationVenueType
}

export interface MarketMatrixPresentationModel {
  assetClasses: Array<{ id: string; title: string }>
  caption: string
  defaultView: MarketMatrixView
  groups: MarketMatrixPresentationGroup[]
  showDownload: boolean
  showFilters: boolean
  venueTypes: MarketMatrixPresentationVenueType[]
  venues: MarketMatrixPresentationVenue[]
}

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const id = (value as { id?: unknown }).id
  return typeof id === 'number' || typeof id === 'string' ? String(id) : null
}

const selectedIDs = (value: unknown): Set<string> =>
  new Set((Array.isArray(value) ? value : []).flatMap((item) => relationshipID(item) || []))

export const normalizeMarketMatrixComponent = (
  component: MarketMatrixComponent,
  index: MarketMatrixIndex,
): MarketMatrixPresentationModel => {
  const selectedAssetClasses = selectedIDs(component.assetClasses)
  const selectedVenueTypes = selectedIDs(component.venueTypes)
  const selectedRegions = selectedIDs(component.regions)
  const hubs = index.hubs.filter(
    (hub) =>
      (!selectedAssetClasses.size ||
        hub.assetClassIDs.some((assetClassID) => selectedAssetClasses.has(assetClassID))) &&
      (!selectedRegions.size || hub.regionIDs.some((regionID) => selectedRegions.has(regionID))),
  )
  const hubIDs = new Set(hubs.map(({ id }) => id))
  const groups = index.assetClasses.flatMap<MarketMatrixPresentationGroup>((assetClass) => {
    if (selectedAssetClasses.size && !selectedAssetClasses.has(assetClass.id)) return []
    const groupedHubs = hubs
      .filter((hub) => hub.assetClassIDs.includes(assetClass.id))
      .map(({ destination, id, title }) => ({ destination, id, title }))
    return groupedHubs.length
      ? [
          {
            hubs: groupedHubs,
            id: assetClass.id,
            title: assetClass.title,
          },
        ]
      : []
  })
  const groupedHubIDs = new Set(groups.flatMap((group) => group.hubs.map(({ id }) => id)))
  const venues = index.venues
    .filter(
      (venue) =>
        (!selectedVenueTypes.size || selectedVenueTypes.has(venue.venueType.id)) &&
        Object.keys(venue.connections).some(
          (hubID) => hubIDs.has(hubID) && groupedHubIDs.has(hubID),
        ),
    )
    .map(({ connections, destination, id, title, venueType }) => ({
      connections,
      destination,
      id,
      title,
      venueType: { id: venueType.id, title: venueType.title },
    }))
  const visibleVenueTypeIDs = new Set(venues.map(({ venueType }) => venueType.id))

  return {
    assetClasses: groups.map(({ id, title }) => ({ id, title })),
    caption: component.caption || 'Trayport venue connectivity by market hub',
    defaultView:
      component.defaultView === 'autoTrader' || component.defaultView === 'combined'
        ? component.defaultView
        : 'joule',
    groups,
    showDownload: component.showDownload !== false,
    showFilters: component.showFilters !== false,
    venueTypes: index.venueTypes
      .filter(({ id }) => visibleVenueTypeIDs.has(id))
      .map(({ id, title }) => ({ id, title })),
    venues,
  }
}
