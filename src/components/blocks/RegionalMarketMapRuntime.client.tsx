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

// Layers painted above the country and region fills, in paint order.
const MARKER_LAYERS = ['trayport-hubs', 'trayport-routes', 'trayport-route-markers']

const featureCollection = (features: SourceData['features']): SourceData => ({
  features,
  type: 'FeatureCollection',
})

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

const segmentMidpoint = (segments: TrayportPosition[][]): TrayportPosition | null => {
  const distances = segments.flatMap((positions) =>
    positions.slice(1).flatMap((end, index) => {
      const start = positions[index]
      if (!start) return []
      const distance = Math.hypot(end[0] - start[0], end[1] - start[1])
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

  useEffect(() => {
    callbacksRef.current = { onCountrySelect, onError, onHubSelect, onReady, onRegionSelect }
  }, [onCountrySelect, onError, onHubSelect, onReady, onRegionSelect])

  useEffect(() => {
    activeRegionRef.current = activeRegionID
  }, [activeRegionID])

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
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': lineColor,
              'line-opacity': lineOpacity,
              'line-width': lineWidth,
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
            'circle-opacity': 1,
            'circle-radius': [
              'case',
              ['==', ['get', 'type'], 'ohub'],
              markerRadius + 3,
              ['==', ['get', 'type'], 'rhub'],
              markerRadius + 2,
              markerRadius,
            ],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 1.5,
          },
          source: 'trayport-hubs',
          type: 'circle',
        })
        map.addLayer({
          filter: ['!=', ['get', 'mapLabel'], ''],
          id: 'trayport-hub-labels',
          layout: {
            'text-anchor': 'bottom',
            'text-field': ['get', 'mapLabel'],
            'text-offset': [0, -0.9],
            'text-size': 11,
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-blur': 0.3,
            'text-halo-color': '#002d72',
            'text-halo-width': 2,
          },
          source: 'trayport-hubs',
          type: 'symbol',
        })
        map.addLayer({
          id: 'trayport-route-markers',
          paint: {
            'circle-color': '#ff671f',
            'circle-opacity': 1,
            'circle-radius': 7,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
          },
          source: 'trayport-route-markers',
          type: 'circle',
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
        register('click', 'trayport-routes', (event) => {
          if (hitsLayers(event, ['trayport-hubs'])) return
          const hubID = stringProperty(event, 'selectHubID')
          if (hubID) callbacksRef.current.onHubSelect(hubID)
        })
        register('click', 'trayport-route-markers', (event) => {
          if (hitsLayers(event, ['trayport-hubs', 'trayport-routes'])) return
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
      hubFeatures(index, visible, summaries, activeAssetClassID) as never,
    )
    source(map, 'trayport-routes')?.setData(
      (showLines ? routeFeatures(index, visible) : featureCollection([])) as never,
    )
    source(map, 'trayport-route-markers')?.setData(
      (showLines ? routeMarkerFeatures(index, visible) : featureCollection([])) as never,
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

    const selectedRegion = index.regions.find(({ id }) => id === activeRegionID)
    const regionPositions = selectedRegion ? geoJSONPositions(selectedRegion.boundary) : []
    const markerPositions = index.hubs
      .filter(({ id }) => visible.has(id))
      .flatMap(({ points }) => points.map(({ location }) => location))
    const positions =
      zoomTo === 'region' && regionPositions.length ? regionPositions : markerPositions
    if (positions.length) {
      const bounds = new mapboxgl.LngLatBounds()
      positions.forEach((position) => bounds.extend(position))
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      map.fitBounds(bounds, {
        duration: reducedMotion ? 0 : 450,
        maxZoom: 5,
        padding: {
          bottom: 52,
          left: 48,
          right: showSidebar && selectedHubIDs.length ? 340 : 48,
          top: 52,
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
