'use client'

import mapboxgl, { type ErrorEvent as MapboxErrorEvent, type MapLayerMouseEvent } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useRef, useState } from 'react'

import type { ConnectionsMapRuntimeConfig } from '@/config/connectionsMap'
import type { RegionalMarketMapIndex } from '@/data/regionalMarketMap'
import {
  geoJSONFeatures,
  geoJSONPositions,
  type TrayportGeoJSON,
  type TrayportPosition,
} from '@/maps/geoJSON'

import './regional-market-map-runtime.css'

type MarketSummary = {
  changeLabel?: 'MoM' | 'QoQ' | 'YoY'
  changePercent: number | null
  label: string
  value: number | null
}

export interface RegionalMarketMapRuntimeProps {
  activeAssetClassID: string
  activeRegionID: string
  dataDisplay: 'always' | 'hover'
  index: RegionalMarketMapIndex
  lineColor: string
  lineOpacity: number
  lineWidth: number
  markerRadius: number
  onCountrySelect: (countryCode: string) => void
  onError: () => void
  onHubSelect: (hubID: string) => void
  onRegionSelect: (regionID: string) => void
  onReady: () => void
  runtime: ConnectionsMapRuntimeConfig
  selectedHubIDs: string[]
  showSidebar: boolean
  showLines: boolean
  summaries: Record<string, MarketSummary>
  visibleHubIDs: string[]
  zoomTo: 'markers' | 'region'
}

type SourceData = {
  features: Array<{
    geometry: unknown
    properties: Record<string, unknown>
    type: 'Feature'
  }>
  type: 'FeatureCollection'
}

// Route styling is hardcoded in the live theme and never varies by block setting
// (markets-map.blade.php:120-123). HOVER_LINE_COLOR/HOVER_LINE_WIDTH there are deliberately
// identical to the defaults, so hovering a route changes only the cursor. The block's migrated
// line colour/opacity/width fields are authored in WordPress but never read by the live map.
const ROUTE_LINE_COLOR = '#F56A00'
const ROUTE_LINE_WIDTH = 2
// markets-map.blade.php:142-143 — DEFAULT_LINE_MARKER_SIZE / ZOOMED_LINE_MARKER_SIZE, in CSS px.
const ROUTE_MARKER_SIZE = 32
const ROUTE_MARKER_ZOOMED_SIZE = 40
const ROUTE_MARKER_IMAGE = 'trayport-route-marker'
const ROUTE_MARKER_IMAGE_SIZE = 64
const ROUTE_MARKER_IMAGE_PIXEL_RATIO = 2

// The live theme stores a Font Awesome 6.7.2 `ship` glyph per connection in the ACF `marker_svg`
// field and renders it as <svg viewBox="0 0 576 512" width=32 fill={asset class colour}>
// (markets-map.blade.php:1127, 1145-1147). This is that stored artwork verbatim, inlined rather
// than imported from the icon kit because eslint.config.mjs restricts '@awesome.me/**' to the
// icon registry, and because frontend-system.md names specialist map geometry as an explicit
// exception to that registry. The square raster reproduces the browser's default xMidYMid
// letterboxing of a 576x512 viewBox inside a 32x32 element.
const ROUTE_MARKER_VIEWBOX = [576, 512] as const
const ROUTE_MARKER_PATH =
  'M192 32c0-17.7 14.3-32 32-32L352 0c17.7 0 32 14.3 32 32l0 32 48 0c26.5 0 48 21.5 48 48l0 128 44.4 14.8c23.1 7.7 29.5 37.5 11.5 53.9l-101 92.6c-16.2 9.4-34.7 15.1-50.9 15.1c-19.6 0-40.8-7.7-59.2-20.3c-22.1-15.5-51.6-15.5-73.7 0c-17.1 11.8-38 20.3-59.2 20.3c-16.2 0-34.7-5.7-50.9-15.1l-101-92.6c-18-16.5-11.6-46.2 11.5-53.9L96 240l0-128c0-26.5 21.5-48 48-48l48 0 0-32zM160 218.7l107.8-35.9c13.1-4.4 27.3-4.4 40.5 0L416 218.7l0-90.7-256 0 0 90.7zM306.5 421.9C329 437.4 356.5 448 384 448c26.9 0 55.4-10.8 77.4-26.1c0 0 0 0 0 0c11.9-8.5 28.1-7.8 39.2 1.7c14.4 11.9 32.5 21 50.6 25.2c17.2 4 27.9 21.2 23.9 38.4s-21.2 27.9-38.4 23.9c-24.5-5.7-44.9-16.5-58.2-25C449.5 501.7 417 512 384 512c-31.9 0-60.6-9.9-80.4-18.9c-5.8-2.7-11.1-5.3-15.6-7.7c-4.5 2.4-9.7 5.1-15.6 7.7c-19.8 9-48.5 18.9-80.4 18.9c-33 0-65.5-10.3-94.5-25.8c-13.4 8.4-33.7 19.3-58.2 25c-17.2 4-34.4-6.7-38.4-23.9s6.7-34.4 23.9-38.4c18.1-4.2 36.2-13.3 50.6-25.2c11.1-9.4 27.3-10.1 39.2-1.7c0 0 0 0 0 0C136.7 437.2 165.1 448 192 448c27.5 0 55-10.6 77.5-26.1c11.1-7.9 25.9-7.9 37 0z'

const routeMarkerImage = (color: string): ImageData | null => {
  const size = ROUTE_MARKER_IMAGE_SIZE * ROUTE_MARKER_IMAGE_PIXEL_RATIO
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return null
  const [viewBoxWidth, viewBoxHeight] = ROUTE_MARKER_VIEWBOX
  const scale = size / Math.max(viewBoxWidth, viewBoxHeight)
  context.translate((size - viewBoxWidth * scale) / 2, (size - viewBoxHeight * scale) / 2)
  context.scale(scale, scale)
  context.fillStyle = color
  context.fill(new Path2D(ROUTE_MARKER_PATH))
  return context.getImageData(0, 0, size, size)
}

// Layers painted above the country and region fills, in paint order. The hub label layer is
// part of this set because once a region is selected the live map replaces the hub dot with the
// label chip entirely, so the chip — not the circle — is what the pointer actually hits.
const MARKER_LAYERS = [
  'trayport-hubs',
  'trayport-hub-labels',
  'trayport-routes',
  'trayport-route-markers',
]

const featureCollection = (features: SourceData['features']): SourceData => ({
  features,
  type: 'FeatureCollection',
})

const HUB_CHIP_IMAGE_ID = 'trayport-hub-chip'

// The live map draws every hub label as a DOM chip — `bg-black/50 rounded p-1`, i.e.
// rgba(0, 0, 0, 0.5) behind 12px white text on a 4px radius with 4px of padding
// (markets-map.blade.php:1098-1101 and :1140). A symbol layer can only reproduce that with a
// stretchable icon behind the text, so the chip is rasterised once at 2x and stretched to fit.
const addHubChipImage = (map: mapboxgl.Map) => {
  if (map.hasImage(HUB_CHIP_IMAGE_ID)) return
  const scale = 2
  const size = 24 * scale
  const radius = 4 * scale
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return
  context.fillStyle = 'rgba(0, 0, 0, 0.5)'
  context.beginPath()
  context.roundRect(0, 0, size, size, radius)
  context.fill()
  map.addImage(
    HUB_CHIP_IMAGE_ID,
    {
      data: new Uint8Array(context.getImageData(0, 0, size, size).data),
      height: size,
      width: size,
    },
    {
      content: [radius, radius, size - radius, size - radius],
      pixelRatio: scale,
      stretchX: [[radius, size - radius]],
      stretchY: [[radius, size - radius]],
    },
  )
}

const REGION_CHIP_IMAGE_ID = 'trayport-region-chip'

// The live map labels each region with a permanent popup styled `bg-white/10 py-1 rounded-md`
// over 14px/16px centred white text (trayport.css:902-908). Same stretchable-icon technique as
// the hub chip, with the reference's own radius and translucency.
const addRegionChipImage = (map: mapboxgl.Map) => {
  if (map.hasImage(REGION_CHIP_IMAGE_ID)) return
  const scale = 2
  const size = 24 * scale
  const radius = 6 * scale
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return
  context.fillStyle = 'rgba(255, 255, 255, 0.1)'
  context.beginPath()
  context.roundRect(0, 0, size, size, radius)
  context.fill()
  map.addImage(
    REGION_CHIP_IMAGE_ID,
    {
      data: new Uint8Array(context.getImageData(0, 0, size, size).data),
      height: size,
      width: size,
    },
    {
      content: [radius, radius, size - radius, size - radius],
      pixelRatio: scale,
      stretchX: [[radius, size - radius]],
      stretchY: [[radius, size - radius]],
    },
  )
}

// One point per region that has both a centre and a label. The live map draws these while no
// region is selected and removes them on selection (markets-map.blade.php:284-286).
const regionLabelFeatures = (index: RegionalMarketMapIndex): SourceData =>
  featureCollection(
    index.regions.flatMap((region) =>
      region.centre && region.label
        ? [
            {
              geometry: { coordinates: region.centre, type: 'Point' },
              properties: { regionID: region.id, title: region.label },
              type: 'Feature' as const,
            },
          ]
        : [],
    ),
  )

const marketNumber = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 })

const marketSummaryText = (
  summary: MarketSummary | undefined,
  volumeLabel: string,
): { detail: string; display: string; tone: 'negative' | 'neutral' | 'positive' } => {
  if (summary?.value === null || summary?.value === undefined) {
    return { detail: '', display: '', tone: 'neutral' }
  }

  const value = `${marketNumber.format(summary.value)}${volumeLabel ? ` ${volumeLabel}` : ''}`
  const change =
    summary.changePercent === null
      ? ''
      : `${summary.changePercent >= 0 ? '+' : ''}${summary.changePercent.toFixed(1)}%${summary.changeLabel ? ` ${summary.changeLabel}` : ''}`

  return {
    detail: `${summary.label ? `${summary.label}: ` : ''}${value}${change ? ` (${change})` : ''}`,
    display: `${value}${change ? `\n${change}` : ''}`,
    tone:
      summary.changePercent === null || summary.changePercent === 0
        ? 'neutral'
        : summary.changePercent > 0
          ? 'positive'
          : 'negative',
  }
}

const hubFeatures = (
  index: RegionalMarketMapIndex,
  visibleHubIDs: Set<string>,
  summaries: Record<string, MarketSummary>,
  activeAssetClassID: string,
  // The live map keeps one global `zoomed` flag: it flips true the moment any region is selected
  // (markets-map.blade.php:335) and is true from first paint on single-region maps
  // (markets-map.blade.php:1268). Every marker is rebuilt from it on each `moveend`
  // (markets-map.blade.php:193), so it has to reach the features — the layer specs below are
  // only ever built once, in the `load` handler.
  zoomed: boolean,
): SourceData =>
  featureCollection(
    index.hubs
      .filter(({ id }) => visibleHubIDs.has(id))
      .flatMap((hub) => {
        const assetClass =
          index.assetClasses.find(
            ({ id }) => id === activeAssetClassID && hub.assetClassIDs.includes(id),
          ) || index.assetClasses.find(({ id }) => hub.assetClassIDs.includes(id))
        const summary = hub.marketDataKey ? summaries[hub.marketDataKey] : undefined
        const market = marketSummaryText(summary, assetClass?.volumeLabel || '')
        return hub.points.map((point, pointIndex) => {
          const showMarketLabel = pointIndex === 0
          return {
            geometry: { coordinates: point.location, type: 'Point' },
            properties: {
              // `hub.class == 108` at markets-map.blade.php:1130 — the Bulk asset class, whose
              // hubs are labelled at world zoom instead of being drawn as 7px dots.
              alwaysLabel: assetClass?.legacyID === 108 || assetClass?.slug === 'bulk',
              color: assetClass?.color || '#00c1d5',
              countryCodes: hub.countryCodes.join(','),
              hubID: hub.id,
              label: point.label,
              mapLabel: point.label || hub.title,
              marketDetail: showMarketLabel ? market.detail : '',
              marketDisplay: showMarketLabel ? market.display : '',
              marketTone: market.tone,
              title: hub.title,
              type: hub.hubType,
              zoomed,
            },
            type: 'Feature' as const,
          }
        })
      }),
  )

const routeSegments = (route: TrayportGeoJSON | null): TrayportPosition[][] =>
  geoJSONFeatures(route).flatMap(({ geometry }) => {
    if (geometry.type === 'LineString') {
      return [geoJSONPositions(geometry)]
    }
    if (geometry.type !== 'MultiLineString' || !Array.isArray(geometry.coordinates)) return []
    return geometry.coordinates.flatMap((coordinates) => {
      const positions = geoJSONPositions({ coordinates, type: 'LineString' })
      return positions.length ? [positions] : []
    })
  })

// markets-map.blade.php:1204-1205 places the glyph with turf.along(feat, turf.length(feat) / 2),
// which measures great-circle kilometres. Measuring a planar hypot over raw degrees instead moves
// the glyph 565 km on the LNG Europe -> LNG Asia route (planar 61.4305,12.1500 vs live 64.75,8.1948)
// and 462 km on LNG Europe -> Henry Hub (planar -52.9745,33.0868 vs live -57.00,30.6474).
const EARTH_RADIUS_KM = 6371.0088

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

const greatCircleDistance = (start: TrayportPosition, end: TrayportPosition): number => {
  const deltaLatitude = toRadians(end[1] - start[1])
  const deltaLongitude = toRadians(end[0] - start[0])
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.sin(deltaLongitude / 2) ** 2 * Math.cos(toRadians(start[1])) * Math.cos(toRadians(end[1]))
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine))
}

const segmentMidpoint = (segments: TrayportPosition[][]): TrayportPosition | null => {
  const distances = segments.flatMap((positions) =>
    positions.slice(1).flatMap((end, index) => {
      const start = positions[index]
      if (!start) return []
      const distance = greatCircleDistance(start, end)
      return distance ? [{ distance, end, start }] : []
    }),
  )
  const totalDistance = distances.reduce((total, { distance }) => total + distance, 0)
  if (!totalDistance) return null

  const targetDistance = totalDistance / 2
  let travelled = 0
  for (const segment of distances) {
    if (travelled + segment.distance < targetDistance) {
      travelled += segment.distance
      continue
    }
    const progress = (targetDistance - travelled) / segment.distance
    return [
      segment.start[0] + (segment.end[0] - segment.start[0]) * progress,
      segment.start[1] + (segment.end[1] - segment.start[1]) * progress,
    ]
  }

  return distances.at(-1)?.end || null
}

const routeMarkerFeatures = (
  index: RegionalMarketMapIndex,
  visibleHubIDs: Set<string>,
): SourceData =>
  featureCollection(
    index.connections.flatMap((connection) => {
      if (
        !connection.showLineMarker ||
        (!visibleHubIDs.has(connection.sourceHubID) && !visibleHubIDs.has(connection.targetHubID))
      ) {
        return []
      }
      const sourcePoint = index.hubs.find(({ id }) => id === connection.sourceHubID)?.points[0]
      const targetPoint = index.hubs.find(({ id }) => id === connection.targetHubID)?.points[0]
      const routeMidpoint = segmentMidpoint(routeSegments(connection.route))
      const midpoint =
        routeMidpoint ||
        (sourcePoint && targetPoint
          ? ([
              (sourcePoint.location[0] + targetPoint.location[0]) / 2,
              (sourcePoint.location[1] + targetPoint.location[1]) / 2,
            ] satisfies TrayportPosition)
          : null)
      if (!midpoint) return []

      return [
        {
          geometry: { coordinates: midpoint, type: 'Point' },
          properties: {
            connectionID: connection.id,
            label: connection.title,
            selectHubID: visibleHubIDs.has(connection.sourceHubID)
              ? connection.targetHubID
              : connection.sourceHubID,
            sourceHubID: connection.sourceHubID,
            targetHubID: connection.targetHubID,
          },
          type: 'Feature' as const,
        },
      ]
    }),
  )

const routeFeatures = (index: RegionalMarketMapIndex, visibleHubIDs: Set<string>): SourceData =>
  featureCollection(
    index.connections.flatMap((connection) => {
      if (
        !visibleHubIDs.has(connection.sourceHubID) &&
        !visibleHubIDs.has(connection.targetHubID)
      ) {
        return []
      }
      const properties = {
        connectionID: connection.id,
        selectHubID: visibleHubIDs.has(connection.sourceHubID)
          ? connection.targetHubID
          : connection.sourceHubID,
        sourceHubID: connection.sourceHubID,
        targetHubID: connection.targetHubID,
        title: connection.title,
      }
      const route = geoJSONFeatures(connection.route).map((item) => ({
        geometry: item.geometry,
        properties: { ...item.properties, ...properties },
        type: 'Feature' as const,
      }))
      if (route.length) return route
      const source = index.hubs.find(({ id }) => id === connection.sourceHubID)?.points[0]
      const target = index.hubs.find(({ id }) => id === connection.targetHubID)?.points[0]
      return source && target
        ? [
            {
              geometry: {
                coordinates: [source.location, target.location],
                type: 'LineString' as const,
              },
              properties,
              type: 'Feature' as const,
            },
          ]
        : []
    }),
  )

const regionFeatures = (index: RegionalMarketMapIndex): SourceData =>
  featureCollection(
    index.regions.flatMap((region) =>
      geoJSONFeatures(region.boundary).map((item) => ({
        geometry: item.geometry,
        properties: { ...item.properties, regionID: region.id, title: region.title },
        type: 'Feature' as const,
      })),
    ),
  )

const pointOfInterestFeatures = (
  index: RegionalMarketMapIndex,
  activeRegionID: string,
): SourceData =>
  featureCollection(
    index.regions
      .filter(({ id }) => !activeRegionID || id === activeRegionID)
      .flatMap((region) =>
        region.pointsOfInterest.map((point) => ({
          geometry: { coordinates: point.location, type: 'Point' },
          properties: {
            label: point.label,
            popupText: point.popupText,
            regionID: region.id,
          },
          type: 'Feature' as const,
        })),
      ),
  )

const source = (map: mapboxgl.Map, id: string): mapboxgl.GeoJSONSource | null => {
  const existing = map.getSource(id)
  return existing?.type === 'geojson' ? (existing as mapboxgl.GeoJSONSource) : null
}

const popupContent = (title: string, detail?: string): HTMLElement => {
  const container = document.createElement('div')
  const heading = document.createElement('strong')
  heading.textContent = title
  container.append(heading)
  if (detail) {
    const body = document.createElement('div')
    body.textContent = detail
    container.append(body)
  }
  return container
}

const stringProperty = (event: MapLayerMouseEvent, name: string): string => {
  const value = event.features?.[0]?.properties?.[name]
  return typeof value === 'string' ? value : ''
}

export default function RegionalMarketMapRuntime({
  activeAssetClassID,
  activeRegionID,
  dataDisplay,
  index,
  lineColor,
  lineOpacity,
  lineWidth,
  markerRadius,
  onCountrySelect,
  onError,
  onHubSelect,
  onRegionSelect,
  onReady,
  runtime,
  selectedHubIDs,
  showSidebar,
  showLines,
  summaries,
  visibleHubIDs,
  zoomTo,
}: RegionalMarketMapRuntimeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const [styleReady, setStyleReady] = useState(false)
  const callbacksRef = useRef({ onCountrySelect, onError, onHubSelect, onReady, onRegionSelect })
  // The click handlers are registered once, in an effect that does not depend on the active
  // region, so they must read it through a ref or they capture its mount-time value forever.
  const activeRegionRef = useRef(activeRegionID)
  // The route-marker image is registered once inside the style effect, so it has to read the active
  // asset class through a ref to pick its first colour; the data effect re-tints it afterwards.
  const activeAssetClassIDRef = useRef(activeAssetClassID)

  useEffect(() => {
    callbacksRef.current = { onCountrySelect, onError, onHubSelect, onReady, onRegionSelect }
  }, [onCountrySelect, onError, onHubSelect, onReady, onRegionSelect])

  useEffect(() => {
    activeRegionRef.current = activeRegionID
  }, [activeRegionID])

  useEffect(() => {
    activeAssetClassIDRef.current = activeAssetClassID
  }, [activeAssetClassID])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let failed = false
    let ready = false
    let map: mapboxgl.Map | null = null
    const listeners: Array<{
      event: 'click' | 'mouseenter' | 'mouseleave'
      handler: (event: MapLayerMouseEvent) => void
      layer: string
    }> = []

    try {
      mapboxgl.accessToken = runtime.accessToken
      map = new mapboxgl.Map({
        attributionControl: true,
        center: [15, 30],
        container,
        interactive: false,
        logoPosition: 'bottom-left',
        maxZoom: 8,
        minZoom: 0.8,
        renderWorldCopies: false,
        style: runtime.styleURL,
        zoom: 1.35,
      })
      mapRef.current = map

      const handleError = (_event: MapboxErrorEvent) => {
        if (ready) return
        failed = true
        callbacksRef.current.onError()
      }
      const handleLoad = () => {
        if (!map) return
        const firstSymbol = map.getStyle().layers?.find(({ type }) => type === 'symbol')?.id
        map.addSource('trayport-regions', { data: regionFeatures(index) as never, type: 'geojson' })
        map.addSource('trayport-region-labels', {
          data: regionLabelFeatures(index) as never,
          type: 'geojson',
        })
        map.addSource('trayport-hubs', {
          data: featureCollection([]) as never,
          type: 'geojson',
        })
        map.addSource('trayport-routes', {
          data: featureCollection([]) as never,
          type: 'geojson',
        })
        map.addSource('trayport-route-markers', {
          data: featureCollection([]) as never,
          type: 'geojson',
        })
        map.addSource('trayport-pois', {
          data: featureCollection([]) as never,
          type: 'geojson',
        })
        map.addSource('country-boundaries', {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1',
        })
        map.addLayer(
          {
            // A fill layer with no filter renders every country in the tileset, so the layer must
            // start empty and be narrowed by the data effect rather than fail open while it waits.
            filter: ['in', ['get', 'iso_3166_1_alpha_3'], ['literal', []]],
            id: 'trayport-populated-countries',
            paint: {
              'fill-color': '#009cde',
              'fill-opacity': 1,
              'fill-outline-color': '#0057b8',
            },
            source: 'country-boundaries',
            'source-layer': 'country_boundaries',
            type: 'fill',
          },
          firstSymbol,
        )
        map.addLayer(
          {
            filter: ['in', ['get', 'iso_3166_1_alpha_3'], ['literal', []]],
            id: 'trayport-selected-countries',
            paint: {
              'fill-color': '#f7ea48',
              'fill-opacity': 1,
            },
            source: 'country-boundaries',
            'source-layer': 'country_boundaries',
            type: 'fill',
          },
          firstSymbol,
        )
        map.addLayer(
          {
            id: 'trayport-region-fill',
            // The reference draws region boundaries invisibly — they exist only as click targets,
            // and a zero-opacity fill still hit-tests in Mapbox.
            paint: { 'fill-color': '#ffffff', 'fill-opacity': 0 },
            source: 'trayport-regions',
            type: 'fill',
          },
          firstSymbol,
        )
        map.addLayer(
          {
            id: 'trayport-region-outline',
            paint: { 'line-color': '#f7ea48', 'line-width': 0 },
            source: 'trayport-regions',
            type: 'line',
          },
          firstSymbol,
        )
        map.addLayer(
          {
            id: 'trayport-routes',
            paint: {
              'line-color': ROUTE_LINE_COLOR,
              'line-opacity': 1,
              'line-width': ROUTE_LINE_WIDTH,
            },
            source: 'trayport-routes',
            type: 'line',
          },
          firstSymbol,
        )
        map.addLayer({
          id: 'trayport-hubs',
          paint: {
            'circle-color': ['get', 'color'],
            // ohub and rhub keep a filled disc at every zoom. Every other hub type is drawn by
            // its label chip once a region is selected — or always, for the Bulk class — and the
            // live code emits no circle at all in that state (markets-map.blade.php:1129-1135),
            // so the circle survives only as an invisible hit target.
            'circle-opacity': [
              'case',
              ['match', ['get', 'type'], ['ohub', 'rhub'], true, false],
              1,
              ['any', ['==', ['get', 'zoomed'], true], ['==', ['get', 'alwaysLabel'], true]],
              0,
              1,
            ],
            // Live sizes are SVG width/height, i.e. diameters: ohub 30 -> 100 when zoomed
            // (markets-map.blade.php:1084), rhub a constant 100 (markets-map.blade.php:111-1112),
            // everything else 7 (markets-map.blade.php:1134). Halved here for circle-radius.
            'circle-radius': [
              'case',
              ['==', ['get', 'type'], 'ohub'],
              ['case', ['==', ['get', 'zoomed'], true], 50, 15],
              ['==', ['get', 'type'], 'rhub'],
              50,
              ['any', ['==', ['get', 'zoomed'], true], ['==', ['get', 'alwaysLabel'], true]],
              10,
              3.5,
            ],
            // No live hub marker has a stroke.
            'circle-stroke-width': 0,
          },
          source: 'trayport-hubs',
          type: 'circle',
        })
        addRegionChipImage(map)
        map.addLayer({
          id: 'trayport-region-labels',
          layout: {
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-image': REGION_CHIP_IMAGE_ID,
            'icon-text-fit': 'both',
            'text-allow-overlap': true,
            'text-anchor': 'center',
            'text-field': ['get', 'title'],
            'text-ignore-placement': true,
            'text-line-height': 1.14,
            'text-size': 14,
          },
          paint: { 'text-color': '#ffffff' },
          source: 'trayport-region-labels',
          type: 'symbol',
        })
        addHubChipImage(map)
        map.addLayer({
          // ohub and rhub carry a permanent label centred inside their disc
          // (markets-map.blade.php:1096-1102 and :1117-1123). Every other hub type is labelled
          // only once a region is selected, or unconditionally when its asset class is Bulk
          // (markets-map.blade.php:1130).
          filter: [
            'all',
            ['!=', ['get', 'mapLabel'], ''],
            [
              'any',
              ['match', ['get', 'type'], ['ohub', 'rhub'], true, false],
              ['==', ['get', 'zoomed'], true],
              ['==', ['get', 'alwaysLabel'], true],
            ],
          ],
          id: 'trayport-hub-labels',
          layout: {
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-image': HUB_CHIP_IMAGE_ID,
            'icon-text-fit': 'both',
            // Live labels are DOM markers, so they never collide-avoid and are never dropped.
            'text-allow-overlap': true,
            // The chip is centred on the hub coordinate in every case: for ohub/rhub it is
            // absolutely centred inside the disc, for the rest the chip IS the marker element
            // and mapboxgl.Marker anchors 'center' by default.
            'text-anchor': 'center',
            'text-field': ['get', 'mapLabel'],
            'text-ignore-placement': true,
            'text-line-height': 1,
            'text-offset': [0, 0],
            'text-size': 12,
          },
          paint: {
            // No halo — the chip behind the text is the contrast treatment.
            'text-color': '#ffffff',
          },
          source: 'trayport-hubs',
          type: 'symbol',
        })
        const initialRouteMarkerImage = routeMarkerImage(
          index.assetClasses.find(({ id }) => id === activeAssetClassIDRef.current)?.color ||
            '#f7ea48',
        )
        if (initialRouteMarkerImage && !map.hasImage(ROUTE_MARKER_IMAGE)) {
          map.addImage(ROUTE_MARKER_IMAGE, initialRouteMarkerImage, {
            pixelRatio: ROUTE_MARKER_IMAGE_PIXEL_RATIO,
          })
        }
        map.addLayer({
          id: 'trayport-route-markers',
          layout: {
            // markets-map.blade.php:1207 anchors the DOM marker at 'center' and never lets Mapbox
            // collide-hide it, since it is a Marker rather than a symbol.
            'icon-allow-overlap': true,
            'icon-anchor': 'center',
            'icon-ignore-placement': true,
            'icon-image': ROUTE_MARKER_IMAGE,
            'icon-size': ROUTE_MARKER_SIZE / ROUTE_MARKER_IMAGE_SIZE,
          },
          source: 'trayport-route-markers',
          type: 'symbol',
        })
        map.addLayer({
          filter: ['!=', ['get', 'marketDisplay'], ''],
          id: 'trayport-hub-values',
          layout: {
            'text-allow-overlap': true,
            'text-anchor': 'top',
            'text-field': ['get', 'marketDisplay'],
            'text-line-height': 1.1,
            'text-offset': [0, 1.3],
            'text-size': 11,
            visibility: dataDisplay === 'always' ? 'visible' : 'none',
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-blur': 0.35,
            'text-halo-color': [
              'match',
              ['get', 'marketTone'],
              'positive',
              '#237a3e',
              'negative',
              '#b42318',
              '#002d72',
            ],
            'text-halo-width': 2.5,
          },
          source: 'trayport-hubs',
          type: 'symbol',
        })
        map.addLayer({
          id: 'trayport-pois',
          paint: {
            'circle-color': '#ffffff',
            'circle-radius': 4,
            'circle-stroke-color': '#002d72',
            'circle-stroke-width': 2,
          },
          source: 'trayport-pois',
          type: 'circle',
        })

        popupRef.current = new mapboxgl.Popup({
          className: 'popup-connections',
          closeButton: false,
          closeOnClick: false,
          offset: [0, -10],
        })

        const register = (
          event: 'click' | 'mouseenter' | 'mouseleave',
          layer: string,
          handler: (event: MapLayerMouseEvent) => void,
        ) => {
          map?.on(event, layer, handler)
          listeners.push({ event, handler, layer })
        }
        // Mapbox runs every matching layer handler for a single click, in registration order, and
        // offers no way to stop the chain. Without these guards the region handler always ran last
        // and cleared the hub selection the foreground handler had just made, so no map click ever
        // reached the sidebar. Each handler therefore defers to the layers painted above it, which
        // is the declarative equivalent of the live site's `stopPropagation()`.
        const hitsLayers = (event: MapLayerMouseEvent, layers: string[]) =>
          Boolean(map?.queryRenderedFeatures(event.point, { layers }).length)
        register('click', 'trayport-hubs', (event) => {
          const hubID = stringProperty(event, 'hubID')
          if (hubID) callbacksRef.current.onHubSelect(hubID)
        })
        // Once a region is selected the live marker element IS the chip and it carries
        // `cursor-pointer` plus the click handler (markets-map.blade.php:1140, :481-484), so the
        // symbol layer has to answer clicks — the circle underneath it is fully transparent.
        register('click', 'trayport-hub-labels', (event) => {
          const hubID = stringProperty(event, 'hubID')
          if (hubID) callbacksRef.current.onHubSelect(hubID)
        })
        register('click', 'trayport-routes', (event) => {
          if (hitsLayers(event, ['trayport-hubs', 'trayport-hub-labels'])) return
          const hubID = stringProperty(event, 'selectHubID')
          if (hubID) callbacksRef.current.onHubSelect(hubID)
        })
        register('click', 'trayport-route-markers', (event) => {
          if (hitsLayers(event, ['trayport-hubs', 'trayport-hub-labels', 'trayport-routes'])) return
          const hubID = stringProperty(event, 'selectHubID')
          if (hubID) callbacksRef.current.onHubSelect(hubID)
        })
        register('click', 'trayport-populated-countries', (event) => {
          // The live site only opens a country's merged sidebar once a region is selected.
          if (!activeRegionRef.current) return
          if (hitsLayers(event, MARKER_LAYERS)) return
          const code = stringProperty(event, 'iso_3166_1_alpha_3')
          if (code) callbacksRef.current.onCountrySelect(code)
        })
        register('click', 'trayport-region-fill', (event) => {
          // ...and conversely only zooms into a region while none is selected.
          if (activeRegionRef.current) return
          if (hitsLayers(event, [...MARKER_LAYERS, 'trayport-populated-countries'])) return
          const regionID = stringProperty(event, 'regionID')
          if (regionID) callbacksRef.current.onRegionSelect(regionID)
        })
        register('mouseenter', 'trayport-region-fill', (event) => {
          if (!map) return
          map.getCanvas().style.cursor = 'pointer'
          const title = stringProperty(event, 'title')
          if (title) {
            popupRef.current?.setLngLat(event.lngLat).setDOMContent(popupContent(title)).addTo(map)
          }
        })
        register('mouseleave', 'trayport-region-fill', () => {
          if (map) map.getCanvas().style.cursor = ''
          popupRef.current?.remove()
        })
        // markets-map.blade.php:1180-1189 — the live route hover sets the pointer cursor and then
        // repaints line-color/line-width with HOVER_LINE_COLOR '#F56A00' and HOVER_LINE_WIDTH 2,
        // which are the SAME values as DEFAULT_LINE_COLOR/DEFAULT_LINE_WIDTH
        // (markets-map.blade.php:120-123). Hovering a route therefore produces no colour or width
        // change on the live site, and neither does the region-hover path that reuses the same
        // constants (markets-map.blade.php:410-411, 418-419). Parity requires no setPaintProperty
        // here; adding one would be a deviation, not a restoration.
        register('mouseenter', 'trayport-routes', (event) => {
          if (!map) return
          map.getCanvas().style.cursor = 'pointer'
          const title = stringProperty(event, 'title')
          if (title) {
            popupRef.current?.setLngLat(event.lngLat).setDOMContent(popupContent(title)).addTo(map)
          }
        })
        register('mouseleave', 'trayport-routes', () => {
          if (map) map.getCanvas().style.cursor = ''
          popupRef.current?.remove()
        })
        register('mouseenter', 'trayport-hubs', (event) => {
          const feature = event.features?.[0]
          if (!map || feature?.geometry.type !== 'Point') return
          map.getCanvas().style.cursor = 'pointer'
          if (dataDisplay !== 'hover') return
          popupRef.current
            ?.setLngLat(feature.geometry.coordinates as [number, number])
            .setDOMContent(
              popupContent(stringProperty(event, 'title'), stringProperty(event, 'marketDetail')),
            )
            .addTo(map)
        })
        register('mouseleave', 'trayport-hubs', () => {
          if (map) map.getCanvas().style.cursor = ''
          popupRef.current?.remove()
        })
        register('mouseenter', 'trayport-hub-labels', (event) => {
          const feature = event.features?.[0]
          if (!map || feature?.geometry.type !== 'Point') return
          map.getCanvas().style.cursor = 'pointer'
          if (dataDisplay !== 'hover') return
          popupRef.current
            ?.setLngLat(feature.geometry.coordinates as [number, number])
            .setDOMContent(
              popupContent(stringProperty(event, 'title'), stringProperty(event, 'marketDetail')),
            )
            .addTo(map)
        })
        register('mouseleave', 'trayport-hub-labels', () => {
          if (map) map.getCanvas().style.cursor = ''
          popupRef.current?.remove()
        })
        register('mouseenter', 'trayport-route-markers', (event) => {
          const feature = event.features?.[0]
          if (!map || feature?.geometry.type !== 'Point') return
          map.getCanvas().style.cursor = 'pointer'
          popupRef.current
            ?.setLngLat(feature.geometry.coordinates as [number, number])
            .setDOMContent(popupContent(stringProperty(event, 'label')))
            .addTo(map)
        })
        register('mouseleave', 'trayport-route-markers', () => {
          if (map) map.getCanvas().style.cursor = ''
          popupRef.current?.remove()
        })
        register('mouseenter', 'trayport-pois', (event) => {
          const feature = event.features?.[0]
          if (!map || feature?.geometry.type !== 'Point') return
          popupRef.current
            ?.setLngLat(feature.geometry.coordinates as [number, number])
            .setDOMContent(
              popupContent(stringProperty(event, 'label'), stringProperty(event, 'popupText')),
            )
            .addTo(map)
        })
        register('mouseleave', 'trayport-pois', () => popupRef.current?.remove())

        setStyleReady(true)

        map.once('idle', () => {
          if (failed) return
          ready = true
          callbacksRef.current.onReady()
        })
      }

      map.on('error', handleError)
      map.on('load', handleLoad)

      return () => {
        for (const listener of listeners) {
          map?.off(listener.event, listener.layer, listener.handler)
        }
        map?.off('error', handleError)
        map?.off('load', handleLoad)
        popupRef.current?.remove()
        popupRef.current = null
        map?.remove()
        mapRef.current = null
        setStyleReady(false)
      }
    } catch {
      map?.remove()
      callbacksRef.current.onError()
    }
  }, [
    dataDisplay,
    index,
    lineColor,
    lineOpacity,
    lineWidth,
    markerRadius,
    runtime.accessToken,
    runtime.styleURL,
  ])

  useEffect(() => {
    const map = mapRef.current
    // `isStyleLoaded()` is still false in the `load` handler that flips `styleReady`, because the
    // country-boundaries vector source has not resolved its TileJSON yet. Gating on it therefore
    // dropped the only run this effect ever got, leaving every source empty and both country
    // layers unfiltered. `styleReady` is set once the style exists and is already a dependency.
    if (!map || !styleReady) return
    const visible = new Set(visibleHubIDs)
    source(map, 'trayport-hubs')?.setData(
      hubFeatures(index, visible, summaries, activeAssetClassID, Boolean(activeRegionID)) as never,
    )
    source(map, 'trayport-routes')?.setData(
      (showLines ? routeFeatures(index, visible) : featureCollection([])) as never,
    )
    source(map, 'trayport-route-markers')?.setData(
      (showLines ? routeMarkerFeatures(index, visible) : featureCollection([])) as never,
    )
    // markets-map.blade.php:1137/1147 tint the glyph with the ACTIVE asset class colour
    // (updateAllMarkerIcons, markets-map.blade.php:911-921), and 1128 grows it from 32 to 40 once a
    // region has been zoomed into (`zoomed`, set at markets-map.blade.php:335, cleared at 364).
    const routeMarkerFill =
      index.assetClasses.find(({ id }) => id === activeAssetClassID)?.color || '#f7ea48'
    const nextRouteMarkerImage = routeMarkerImage(routeMarkerFill)
    if (nextRouteMarkerImage && map.hasImage(ROUTE_MARKER_IMAGE)) {
      map.updateImage(ROUTE_MARKER_IMAGE, nextRouteMarkerImage)
    }
    map.setLayoutProperty(
      'trayport-route-markers',
      'icon-size',
      (activeRegionID ? ROUTE_MARKER_ZOOMED_SIZE : ROUTE_MARKER_SIZE) / ROUTE_MARKER_IMAGE_SIZE,
    )
    source(map, 'trayport-pois')?.setData(pointOfInterestFeatures(index, activeRegionID) as never)
    const countries = [
      ...new Set(
        index.hubs
          .filter(({ hubType, id }) => hubType !== 'ohub' && visible.has(id))
          .flatMap(({ countryCodes }) => countryCodes),
      ),
    ]
    const selected = new Set(selectedHubIDs)
    const selectedCountries = [
      ...new Set(
        index.hubs.filter(({ id }) => selected.has(id)).flatMap(({ countryCodes }) => countryCodes),
      ),
    ]
    map.setFilter('trayport-populated-countries', [
      'in',
      ['get', 'iso_3166_1_alpha_3'],
      ['literal', countries],
    ])
    map.setFilter('trayport-selected-countries', [
      'in',
      ['get', 'iso_3166_1_alpha_3'],
      ['literal', selectedCountries],
    ])
    const regionFilter = activeRegionID
      ? (['==', ['get', 'regionID'], activeRegionID] as mapboxgl.FilterSpecification)
      : null
    map.setFilter('trayport-region-fill', regionFilter)
    map.setFilter('trayport-region-outline', regionFilter)
    // The reference removes the permanent region names once a region is selected and restores
    // them on reset (markets-map.blade.php:284-286).
    map.setLayoutProperty(
      'trayport-region-labels',
      'visibility',
      activeRegionID ? 'none' : 'visible',
    )

    const selectedRegion = index.regions.find(({ id }) => id === activeRegionID)
    const regionPositions = selectedRegion ? geoJSONPositions(selectedRegion.boundary) : []
    const markerPositions = index.hubs
      .filter(({ id }) => visible.has(id))
      .flatMap(({ points }) => points.map(({ location }) => location))
    // Live fit constants, markets-map.blade.php:132-135 — MAX_ZOOM 5, ZOOM_DURATION 500,
    // MARKER_ZOOM_PADDING 100 (uniform), REGION_ZOOM_PADDING 1.
    const usingRegionBounds = zoomTo === 'region' && regionPositions.length > 0
    const positions = usingRegionBounds
      ? regionPositions
      : markerPositions.length
        ? markerPositions
        : regionPositions
    if (positions.length) {
      const bounds = new mapboxgl.LngLatBounds()
      positions.forEach((position) => bounds.extend(position))
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      // markets-map.blade.php:355 fits markers at 100; :331/:357/:1271 fit the region bbox at 1.
      const fitPadding = usingRegionBounds || markerPositions.length === 0 ? 1 : 100
      map.fitBounds(bounds, {
        duration: reducedMotion ? 0 : 500,
        maxZoom: 5,
        padding: {
          bottom: fitPadding,
          left: fitPadding,
          // markets-map.blade.php:931 eases camera padding to right 300 for a 288px sidebar.
          // This sidebar is 320px at an 8px inset, so 340 is the equivalent clearance; the
          // literal 300 would fit markers 28px underneath the panel.
          right: showSidebar && selectedHubIDs.length ? 340 : fitPadding,
          top: fitPadding,
        },
      })
    }
  }, [
    activeAssetClassID,
    activeRegionID,
    index,
    selectedHubIDs,
    showSidebar,
    showLines,
    styleReady,
    summaries,
    visibleHubIDs,
    zoomTo,
  ])

  return <div aria-hidden className="trayport-regional-market-map__canvas" ref={containerRef} />
}
