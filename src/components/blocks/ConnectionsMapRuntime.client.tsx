'use client'

import mapboxgl, { type ErrorEvent as MapboxErrorEvent, type MapLayerMouseEvent } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useRef } from 'react'

import type { ConnectionsMapGroup } from './connectionsMapData'
import { buildPairwiseConnectionFeatures } from './connectionsMapData'
import './connections-map-runtime.css'

export interface ConnectionsMapRuntimeProps {
  accessToken: string
  groups: ConnectionsMapGroup[]
  lineColor: string
  lineOpacity: number
  lineWidth: number
  markerRadius: number
  onError: () => void
  onReady: () => void
  showLines: boolean
  styleURL: string
}

const layerFragment = (group: ConnectionsMapGroup): string =>
  `${group.slug}-${group.key}`.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'market'

export default function ConnectionsMapRuntime({
  accessToken,
  groups,
  lineColor,
  lineOpacity,
  lineWidth,
  markerRadius,
  onError,
  onReady,
  showLines,
  styleURL,
}: ConnectionsMapRuntimeProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let failed = false
    let ready = false
    let map: mapboxgl.Map | null = null
    let popup: mapboxgl.Popup | null = null
    const layerListeners: Array<{
      layerID: string
      mouseenter: (event: MapLayerMouseEvent) => void
      mouseleave: () => void
    }> = []

    try {
      mapboxgl.accessToken = accessToken
      map = new mapboxgl.Map({
        attributionControl: true,
        center: [0, 0],
        container,
        interactive: false,
        logoPosition: 'bottom-left',
        style: styleURL,
        zoom: 1,
      })

      const bounds = new mapboxgl.LngLatBounds()
      const fitToContent = () => {
        if (!map || bounds.isEmpty()) return
        map.fitBounds(bounds, { duration: 500, padding: 50 })
      }
      const handleRuntimeError = (_event: MapboxErrorEvent) => {
        if (ready) return
        failed = true
        onError()
      }
      const handleIdle = () => {
        if (failed) return
        ready = true
        onReady()
      }
      const handleResize = () => fitToContent()
      const handleLoad = () => {
        if (!map) return

        popup = new mapboxgl.Popup({
          className: 'popup-connections',
          closeButton: false,
          closeOnClick: false,
          offset: [0, -10],
        })

        for (const group of groups) {
          for (const point of group.points) bounds.extend([point.longitude, point.latitude])
        }

        // Match the reference stack explicitly: every connection line sits below every marker,
        // including markers from asset classes declared before a later line group.
        for (const group of groups) {
          const fragment = layerFragment(group)
          const lineSourceID = `connections-lines-${fragment}`
          const lineLayerID = `connections-lines-${fragment}`

          if (showLines && group.points.length > 1) {
            map.addSource(lineSourceID, {
              data: {
                features: buildPairwiseConnectionFeatures(group.points),
                type: 'FeatureCollection',
              },
              type: 'geojson',
            })
            map.addLayer({
              id: lineLayerID,
              paint: {
                'line-color': lineColor,
                'line-opacity': lineOpacity,
                'line-width': lineWidth,
              },
              source: lineSourceID,
              type: 'line',
            })
          }
        }

        for (const group of groups) {
          const fragment = layerFragment(group)
          const circleSourceID = `connections-points-${fragment}`
          const circleLayerID = `connections-points-${fragment}`

          map.addSource(circleSourceID, {
            data: {
              features: group.points.map((point) => ({
                geometry: {
                  coordinates: [point.longitude, point.latitude],
                  type: 'Point' as const,
                },
                properties: { title: point.title },
                type: 'Feature' as const,
              })),
              type: 'FeatureCollection',
            },
            type: 'geojson',
          })
          map.addLayer({
            id: circleLayerID,
            paint: {
              'circle-color': group.color,
              'circle-opacity': 1,
              'circle-radius': markerRadius,
              'circle-stroke-color': '#000',
              'circle-stroke-width': 0.5,
            },
            source: circleSourceID,
            type: 'circle',
          })

          const mouseenter = (event: MapLayerMouseEvent) => {
            const feature = event.features?.[0]
            if (!map || !popup || feature?.geometry.type !== 'Point') return
            const coordinates = feature.geometry.coordinates
            const title = feature.properties?.title
            if (!Array.isArray(coordinates) || typeof title !== 'string') return

            map.getCanvas().style.cursor = 'pointer'
            popup
              .setLngLat([Number(coordinates[0]), Number(coordinates[1])])
              .setText(title)
              .addTo(map)
          }
          const mouseleave = () => {
            if (map) map.getCanvas().style.cursor = ''
            popup?.remove()
          }

          map.on('mouseenter', circleLayerID, mouseenter)
          map.on('mouseleave', circleLayerID, mouseleave)
          layerListeners.push({ layerID: circleLayerID, mouseenter, mouseleave })
        }

        fitToContent()
        map.once('idle', handleIdle)
      }

      map.on('error', handleRuntimeError)
      map.on('load', handleLoad)
      map.on('resize', handleResize)

      return () => {
        for (const listener of layerListeners) {
          map?.off('mouseenter', listener.layerID, listener.mouseenter)
          map?.off('mouseleave', listener.layerID, listener.mouseleave)
        }
        map?.off('error', handleRuntimeError)
        map?.off('idle', handleIdle)
        map?.off('load', handleLoad)
        map?.off('resize', handleResize)
        popup?.remove()
        map?.remove()
      }
    } catch {
      map?.remove()
      onError()
    }
  }, [
    accessToken,
    groups,
    lineColor,
    lineOpacity,
    lineWidth,
    markerRadius,
    onError,
    onReady,
    showLines,
    styleURL,
  ])

  return <div className="trayport-coverage-map__canvas" ref={containerRef} />
}
