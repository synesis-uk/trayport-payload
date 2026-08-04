import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ConnectionsMapGroup } from '@/components/blocks/connectionsMapData'

interface MockGeoJSONSource {
  data: {
    features: unknown[]
  }
}

const mapboxHarness = vi.hoisted(() => ({
  layers: [] as Array<Record<string, unknown>>,
  maps: [] as Array<{
    fitBounds: ReturnType<typeof vi.fn>
    handlers: Map<string, Set<(event?: unknown) => void>>
    options: Record<string, unknown>
    remove: ReturnType<typeof vi.fn>
    sources: Map<string, unknown>
  }>,
  popups: [] as Array<{
    addTo: ReturnType<typeof vi.fn>
    remove: ReturnType<typeof vi.fn>
    setLngLat: ReturnType<typeof vi.fn>
    setText: ReturnType<typeof vi.fn>
  }>,
}))

vi.mock('mapbox-gl', () => {
  class MockBounds {
    points: Array<[number, number]> = []

    extend(point: [number, number]) {
      this.points.push(point)
      return this
    }

    isEmpty() {
      return this.points.length === 0
    }
  }

  class MockMap {
    fitBounds = vi.fn()
    handlers = new Map<string, Set<(event?: unknown) => void>>()
    options: Record<string, unknown>
    remove = vi.fn()
    sources = new Map<string, unknown>()

    constructor(options: Record<string, unknown>) {
      this.options = options
      mapboxHarness.maps.push(this)
    }

    addLayer(layer: Record<string, unknown>) {
      mapboxHarness.layers.push(layer)
    }

    addSource(id: string, source: unknown) {
      this.sources.set(id, source)
    }

    getCanvas() {
      return { style: { cursor: '' } }
    }

    off(
      event: string,
      layerOrHandler: string | ((event?: unknown) => void),
      handler?: (event?: unknown) => void,
    ) {
      const key = typeof layerOrHandler === 'string' ? `${event}:${layerOrHandler}` : event
      this.handlers
        .get(key)
        ?.delete(typeof layerOrHandler === 'function' ? layerOrHandler : handler!)
    }

    on(
      event: string,
      layerOrHandler: string | ((event?: unknown) => void),
      handler?: (event?: unknown) => void,
    ) {
      const key = typeof layerOrHandler === 'string' ? `${event}:${layerOrHandler}` : event
      const listener = typeof layerOrHandler === 'function' ? layerOrHandler : handler!
      const handlers = this.handlers.get(key) || new Set()
      handlers.add(listener)
      this.handlers.set(key, handlers)
      return this
    }

    once(event: string, handler: (event?: unknown) => void) {
      this.on(event, handler)
      return this
    }
  }

  class MockPopup {
    addTo = vi.fn(() => this)
    remove = vi.fn(() => this)
    setLngLat = vi.fn(() => this)
    setText = vi.fn(() => this)

    constructor(_options: Record<string, unknown>) {
      mapboxHarness.popups.push(this)
    }
  }

  return {
    default: {
      accessToken: '',
      LngLatBounds: MockBounds,
      Map: MockMap,
      Popup: MockPopup,
    },
  }
})

import ConnectionsMapRuntime from '@/components/blocks/ConnectionsMapRuntime.client'

const groups: ConnectionsMapGroup[] = [
  {
    color: '#ff671f',
    key: '21',
    points: Array.from({ length: 33 }, (_, index) => ({
      key: `power-${index}`,
      latitude: 40 + index / 10,
      longitude: -10 + index,
      title: `Power ${index + 1}`,
    })),
    slug: 'power',
    title: 'Power',
  },
  {
    color: '#f7ea48',
    key: '22',
    points: Array.from({ length: 22 }, (_, index) => ({
      key: `gas-${index}`,
      latitude: 50 + index / 10,
      longitude: -5 + index,
      title: `Gas ${index + 1}`,
    })),
    slug: 'gas',
    title: 'Gas',
  },
]

const trigger = (event: string, payload?: unknown) => {
  const map = mapboxHarness.maps[0]
  for (const handler of map?.handlers.get(event) || []) handler(payload)
}

beforeEach(() => {
  mapboxHarness.layers.length = 0
  mapboxHarness.maps.length = 0
  mapboxHarness.popups.length = 0
})

describe('connections Mapbox lifecycle', () => {
  it('builds 759 pairwise lines, fits, waits for idle readiness, and cleans up', () => {
    const onError = vi.fn()
    const onReady = vi.fn()
    const { unmount } = render(
      <ConnectionsMapRuntime
        accessToken="pk.test-token"
        groups={groups}
        lineColor="#009cde"
        lineOpacity={0.5}
        lineWidth={0.2}
        markerRadius={3}
        onError={onError}
        onReady={onReady}
        showLines
        styleURL="mapbox://styles/example/reference"
      />,
    )

    const map = mapboxHarness.maps[0]
    expect(map?.options).toMatchObject({
      attributionControl: true,
      interactive: false,
      logoPosition: 'bottom-left',
      style: 'mapbox://styles/example/reference',
    })

    act(() => trigger('load'))

    const lineSources = [...(map?.sources.entries() || [])].filter(([id]) =>
      id.startsWith('connections-lines-'),
    )
    expect([...(map?.sources.keys() || [])]).toEqual([
      'connections-lines-power-21',
      'connections-lines-gas-22',
      'connections-points-power-21',
      'connections-points-gas-22',
    ])
    expect(
      lineSources.map(([, source]) => (source as MockGeoJSONSource).data.features.length),
    ).toEqual([528, 231])
    expect(
      lineSources.reduce(
        (total, [, source]) => total + (source as MockGeoJSONSource).data.features.length,
        0,
      ),
    ).toBe(759)
    expect(mapboxHarness.layers.map((layer) => layer.id)).toEqual([
      'connections-lines-power-21',
      'connections-lines-gas-22',
      'connections-points-power-21',
      'connections-points-gas-22',
    ])
    expect(map?.fitBounds).toHaveBeenCalledWith(expect.anything(), { duration: 500, padding: 50 })
    expect(onReady).not.toHaveBeenCalled()

    act(() => trigger('idle'))
    expect(onReady).toHaveBeenCalledOnce()
    expect(onError).not.toHaveBeenCalled()

    const powerLayer = mapboxHarness.layers.find(
      (layer) => layer.id === 'connections-points-power-21',
    )
    expect(powerLayer?.paint).toMatchObject({
      'circle-color': '#ff671f',
      'circle-radius': 3,
    })

    act(() =>
      trigger('mouseenter:connections-points-power-21', {
        features: [
          {
            geometry: { coordinates: [12.5, 48.1], type: 'Point' },
            properties: { title: 'Austrian Power' },
          },
        ],
      }),
    )
    expect(mapboxHarness.popups[0]?.setLngLat).toHaveBeenCalledWith([12.5, 48.1])
    expect(mapboxHarness.popups[0]?.setText).toHaveBeenCalledWith('Austrian Power')
    expect(mapboxHarness.popups[0]?.addTo).toHaveBeenCalledWith(map)
    act(() => trigger('mouseleave:connections-points-power-21'))
    expect(mapboxHarness.popups[0]?.remove).toHaveBeenCalled()

    unmount()
    expect(map?.remove).toHaveBeenCalledOnce()
    expect(mapboxHarness.popups[0]?.remove).toHaveBeenCalled()
  })

  it('reports a pre-ready provider error so the static fallback remains active', () => {
    const onError = vi.fn()
    const onReady = vi.fn()
    render(
      <ConnectionsMapRuntime
        accessToken="pk.test-token"
        groups={groups}
        lineColor="#009cde"
        lineOpacity={0.5}
        lineWidth={0.2}
        markerRadius={3}
        onError={onError}
        onReady={onReady}
        showLines
        styleURL="mapbox://styles/example/reference"
      />,
    )

    act(() => trigger('error', { error: new Error('provider failure') }))
    act(() => trigger('idle'))

    expect(onError).toHaveBeenCalledOnce()
    expect(onReady).not.toHaveBeenCalled()
  })
})
