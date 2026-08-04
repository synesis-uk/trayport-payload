import type {
  DataChartComponent,
  DividerComponent,
  EmbedComponent,
  MarketCoverageComponent,
  OfficeComponent,
} from '@/payload-types'
import { connectionsMapMarkerColor } from '@/config/connectionsMap'
import type { MarketDataResult } from '@/data/market-data/types'
import { safeExternalHTTPSURL } from '@/routing/urlPolicy'

import { normalizeActions } from './normalizers'
import type {
  CoveragePoint,
  DataChartPresentationModel,
  DividerPresentationModel,
  EmbedPresentationModel,
  MarketCoveragePresentationModel,
  OfficePresentationModel,
} from './specialistPresentation'

export const normalizeDividerComponent = (
  component: DividerComponent,
): DividerPresentationModel => ({
  style: component.style === 'space' ? 'space' : 'line',
})

export const normalizeEmbedComponent = (component: EmbedComponent): EmbedPresentationModel => ({
  title: component.title || 'View media',
  url: safeExternalHTTPSURL(component.url) || undefined,
})

export interface MarketCoverageSourceMarker {
  assetClasses: Array<{
    displayOrder: number
    id: number
    slug: string
    title: string
  }>
  hubId: number
  label: string
  latitude: number
  longitude: number
  regions: Array<{
    id: number
    title: string
  }>
}

export interface MarketCoveragePresentationSlots {
  background?: MarketCoveragePresentationModel['background']
  body?: MarketCoveragePresentationModel['body']
  hubCount: number
  markers: readonly MarketCoverageSourceMarker[]
}

const relationshipIDs = (
  values: MarketCoverageComponent['assetClasses'] | MarketCoverageComponent['regions'],
): Set<number> =>
  new Set(
    (values || []).flatMap((value) => {
      const id = typeof value === 'object' ? value.id : value
      return typeof id === 'number' ? [id] : []
    }),
  )

const groupedCoverageMarkers = (
  component: MarketCoverageComponent,
  markers: readonly MarketCoverageSourceMarker[],
): MarketCoveragePresentationModel['markerGroups'] => {
  const selectedAssetClassIDs = relationshipIDs(component.assetClasses)
  const selectedRegionIDs = relationshipIDs(component.regions)
  const groups = new Map<
    number,
    MarketCoveragePresentationModel['markerGroups'][number] & { displayOrder: number }
  >()

  for (const marker of markers) {
    const isInSelectedRegion =
      selectedRegionIDs.size === 0 ||
      marker.regions.some(
        (region) => selectedRegionIDs.has(region.id) || region.title.trim().toLowerCase() === 'all',
      )
    if (!isInSelectedRegion) continue

    for (const assetClass of marker.assetClasses) {
      if (selectedAssetClassIDs.size && !selectedAssetClassIDs.has(assetClass.id)) continue

      const existing = groups.get(assetClass.id)
      const point = {
        key: `${marker.hubId}:${assetClass.id}:${marker.label}:${marker.latitude}:${marker.longitude}`,
        latitude: marker.latitude,
        longitude: marker.longitude,
        title: marker.label,
      }

      groups.set(assetClass.id, {
        color: connectionsMapMarkerColor(assetClass.slug),
        displayOrder: assetClass.displayOrder,
        key: String(assetClass.id),
        points: [...(existing?.points || []), point],
        slug: assetClass.slug,
        title: assetClass.title,
      })
    }
  }

  return [...groups.values()]
    .sort(
      (left, right) =>
        left.displayOrder - right.displayOrder || left.title.localeCompare(right.title),
    )
    .map(({ displayOrder: _displayOrder, ...group }) => group)
}

const regionCoordinates = (title: string) => {
  const normalized = title.toLowerCase()

  if (normalized.includes('north america')) return { latitude: 42, longitude: -101 }
  if (normalized.includes('asia')) return { latitude: 30, longitude: 113 }
  if (normalized.includes('europe')) return { latitude: 50, longitude: 10 }

  return null
}

export const normalizeMarketCoverageComponent = (
  component: MarketCoverageComponent,
  slots: MarketCoveragePresentationSlots,
): MarketCoveragePresentationModel => {
  const regions = (component.regions || []).map((region, index) => {
    const title = typeof region === 'object' ? region.title : ''

    return {
      coordinates: regionCoordinates(title),
      key: typeof region === 'object' ? String(region.id) : `region-${region}-${index}`,
      label: title || 'Global market',
      title,
    }
  })
  const regionAnchors = regions.flatMap<CoveragePoint>((region) =>
    region.coordinates
      ? [
          {
            ...region.coordinates,
            key: region.key,
            title: region.title,
          },
        ]
      : [],
  )
  const markers: CoveragePoint[] = regionAnchors.length
    ? regionAnchors
    : slots.markers.slice(0, 12).map((marker, index) => ({
        key: `${marker.label}-${index}`,
        latitude: marker.latitude,
        longitude: marker.longitude,
        title: marker.label,
      }))
  const lineWidth = Math.min(Math.max(Number(component.lineWidth) || 0.5, 0), 1)

  return {
    actions: normalizeActions(component.actions),
    background: slots.background,
    body: slots.body,
    hubCount: slots.hubCount,
    importedLocationCount: slots.markers.length,
    lineColor: component.lineColor || '#009cde',
    lineOpacity: Math.min(Math.max(Number(component.lineOpacity) || 0.5, 0), 1),
    lineWidth: Math.max(lineWidth * 8, 1),
    mapHeight: Math.min(Math.max(Number(component.height) || 300, 100), 600),
    mapStyle: component.style || 'dark',
    markerGroups: groupedCoverageMarkers(component, slots.markers),
    markerRadius: Math.min(Math.max(Number(component.markerSize) || 5, 3), 9),
    markers,
    presentation: component.presentation === 'mapOnly' ? 'mapOnly' : 'summary',
    regionAnchors,
    regions: regions.map(({ key, label }) => ({ key, label })),
    runtimeLineWidth: lineWidth,
    showLines: component.showLines !== false,
    title: component.title || 'Explore our connectivity',
  }
}

const dataChartAssetClassLegacyID = (component: DataChartComponent): number => {
  const managedLegacyID =
    typeof component.assetClass === 'object'
      ? Number(component.assetClass.legacySource?.legacyId)
      : Number.NaN
  if (Number.isInteger(managedLegacyID) && managedLegacyID > 0) return managedLegacyID

  const fallbackLegacyID = Number(component.assetClassLegacyId)
  return Number.isInteger(fallbackLegacyID) && fallbackLegacyID > 0 ? fallbackLegacyID : 0
}

const dataChartPresentationSettings = (component: DataChartComponent) => ({
  accessibleSummary: component.accessibleSummary || undefined,
  assetClassLegacyID: dataChartAssetClassLegacyID(component),
  axisLabel: component.axisLabel || '',
  height: Number(component.height) || 350,
  showAxes: component.showAxes !== false,
  showDataTable: component.showDataTable !== false,
  showLegend: component.showLegend !== false,
  showValues: component.showValues === true,
  title: component.title,
  unit: component.unit || '',
})

export const normalizeDataChartComponent = (
  component: DataChartComponent,
  result: MarketDataResult,
): DataChartPresentationModel => {
  const scale = 10 ** Math.min(Math.max(Number(component.scalePower) || 0, 0), 12)
  const hasChartData = result.categories.length > 0 && result.series.length > 0

  return {
    ...dataChartPresentationSettings(component),
    categories: [...result.categories],
    dataStatus: result.status === 'available' && !hasChartData ? 'empty' : result.status,
    dataType: result.dataType,
    displayInterval: result.displayInterval,
    series: result.series.map((item, seriesIndex) => ({
      key: item.key || `series-${seriesIndex + 1}`,
      label: item.label?.trim() || item.key || `Series ${seriesIndex + 1}`,
      values: result.categories.map((_, index) => {
        const value = item.values[index]
        return typeof value === 'number' && Number.isFinite(value) ? value / scale : null
      }),
    })),
    seriesDimension: result.seriesDimension,
  }
}

export const normalizeUnsupportedDataChartComponent = (
  component: DataChartComponent,
): DataChartPresentationModel => ({
  ...dataChartPresentationSettings(component),
  categories: [],
  dataStatus: 'unsupported',
  dataType: component.dataType === 'price' ? 'price' : 'volume',
  displayInterval:
    component.displayInterval === 'month' || component.displayInterval === 'year'
      ? component.displayInterval
      : 'quarter',
  series: [],
  seriesDimension: component.seriesDimension === 'hub' ? 'hub' : 'executionType',
})

export const normalizeOfficeComponent = (
  component: OfficeComponent,
): OfficePresentationModel | null => {
  if (typeof component.office !== 'object') return null

  const office = component.office
  const legalName = office.legalName || office.title
  if (!legalName) return null

  const latitude = office.coordinates?.latitude
  const longitude = office.coordinates?.longitude
  const hasCoordinates =
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude)
  const mapURL = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}`
    : undefined

  return {
    address: office.address,
    addressPrefix: office.addressPrefix || undefined,
    appearance: component.appearance || 'standard',
    email: office.email || undefined,
    legalName,
    mapURL,
    phone: office.phone || undefined,
    phoneURL: office.phone ? `tel:${office.phone.replace(/[^+\d]/g, '')}` : undefined,
    title: office.title,
  }
}
