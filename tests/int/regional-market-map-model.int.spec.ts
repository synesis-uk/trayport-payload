// @vitest-environment node

import { describe, expect, it } from 'vitest'

import {
  buildRegionalMarketMapIndex,
  filterRegionalMarketMapIndex,
  regionalMapBounds,
} from '@/data/regionalMarketMap'

const europeBoundary = {
  geometry: {
    coordinates: [
      [
        [-12, 35],
        [30, 35],
        [30, 72],
        [-12, 72],
        [-12, 35],
      ],
    ],
    type: 'Polygon',
  },
  properties: { source: 'payload' },
  type: 'Feature',
} as const

const documents = {
  assetClasses: [
    {
      displayOrder: 2,
      id: 22,
      legacySource: { legacyId: 22 },
      mapAppearance: { color: '#f7ea48', volumeLabel: 'TWh' },
      marketDataKey: 'natural-gas',
      slug: 'natural-gas',
      title: 'Natural Gas',
    },
    {
      displayOrder: 1,
      id: 21,
      legacySource: { legacyId: 21 },
      mapAppearance: { color: '#ff671f', volumeLabel: 'GWh' },
      marketDataKey: 'power',
      slug: 'power',
      title: 'Power',
    },
    null,
  ],
  hubs: [
    {
      assetClasses: [{ id: 21 }, 21],
      connectedCountryCodes: [{ code: 'FRA' }, { code: 'GB' }, { code: 'DEU' }],
      countryCode: 'deu',
      hubType: 'phub',
      id: 101,
      legacySource: { legacyId: 4101 },
      map: {
        centre: { latitude: 51.1, longitude: 10.4 },
        connections: [
          {
            hub: { id: 102 },
            lineMarkerLabel: 'Power to gas',
            route: {
              coordinates: [
                [13.4, 52.5],
                [5.1, 52.1],
              ],
              type: 'LineString',
            },
            showLineMarker: true,
          },
          {
            hub: { id: 103 },
            lineMarkerLabel: 'Europe to Japan power',
            route: {
              coordinates: [
                [13.4, 52.5],
                [139.7, 35.7],
              ],
              type: 'LineString',
            },
            showLineMarker: true,
          },
        ],
        markers: [
          {
            id: 'berlin',
            label: 'Berlin marker',
            location: { latitude: 52.5, longitude: 13.4 },
          },
          {
            id: 'invalid',
            label: 'Invalid marker',
            location: { latitude: 95, longitude: 13 },
          },
        ],
      },
      marketDataKey: 'de-power',
      path: '/market-coverage/german-power/',
      regions: [{ id: 31 }],
      showOnMap: true,
      title: 'German Power',
      // The legacy inverse is sparse; the connected EEX venue owns this type.
      venueTypes: [],
    },
    {
      assetClasses: [22],
      countryCode: 'NLD',
      externalDestination: 'https://example.com/ttf',
      hubType: 'unexpected',
      id: 102,
      map: {
        centre: { latitude: 52.1, longitude: 5.1 },
        locationLabel: 'TTF marker',
      },
      marketDataKey: 'ttf',
      regions: [31],
      relatedHubs: [{ id: 101 }],
      title: 'TTF',
      venueTypes: [303],
    },
    {
      assetClasses: [21],
      countryCode: 'JPN',
      hubType: 'rhub',
      id: 103,
      map: { centre: { latitude: 35.7, longitude: 139.7 } },
      marketDataKey: 'japan-power',
      regions: ['32'],
      title: 'Japan Power',
      venueTypes: [302],
      website: 'https://example.com/japan-power',
    },
    {
      assetClasses: [21],
      id: 104,
      map: { centre: { latitude: 50, longitude: 8 } },
      regions: [31],
      showOnMap: false,
      title: 'Hidden hub',
    },
    {
      assetClasses: [21],
      id: 105,
      map: { centre: { latitude: 120, longitude: 8 } },
      regions: [31],
      title: 'Invalid location hub',
    },
  ],
  regions: [
    {
      code: 'EUR',
      id: 31,
      map: {
        boundary: JSON.stringify(europeBoundary),
        centre: { latitude: 52, longitude: 9 },
        label: 'European markets',
        pointsOfInterest: [
          {
            id: 'london',
            label: 'London',
            location: { latitude: 51.5, longitude: -0.1 },
            popupText: 'Trayport office',
          },
          {
            id: 'invalid',
            label: 'Outside the world',
            location: { latitude: 91, longitude: 0 },
          },
        ],
        zoom: 30,
      },
      title: 'Europe',
    },
    {
      code: 'APC',
      id: '32',
      map: {
        boundary: {
          coordinates: [
            [
              [181, 30],
              [182, 30],
              [182, 40],
              [181, 30],
            ],
          ],
          type: 'Polygon',
        },
        centre: { latitude: 35, longitude: 140 },
        zoom: -2,
      },
      title: 'Asia Pacific',
    },
  ],
  venueTypes: [
    {
      displayOrder: 2,
      id: 301,
      mapLabel: 'Trading venues',
      title: 'Venue',
    },
    {
      displayOrder: 1,
      id: 302,
      parentVenueType: { id: 301 },
      title: 'Exchange',
    },
    {
      displayOrder: 3,
      id: 303,
      mapLabel: 'Brokers',
      title: 'Broker',
    },
  ],
  venues: [
    {
      id: 201,
      marketConnections: [
        { connectionType: 'b', hub: { id: 101 } },
        { connectionType: 'd', hub: { id: 999 } },
        { connectionType: 'invalid', hub: { id: 102 } },
      ],
      path: '/venues/eex/',
      title: 'EEX',
      venueTypes: [{ id: 302 }],
    },
    {
      id: 202,
      marketConnections: [{ connectionType: 'a', hub: 102 }],
      title: 'Broker One',
      venueTypes: [303],
      website: 'https://broker.example.com/',
    },
    {
      id: 203,
      marketConnections: [{ connectionType: 'd', hub: 103 }],
      path: '/venues/asia-exchange/',
      title: 'Asia Exchange',
      venueTypes: [302],
    },
    {
      id: 204,
      marketConnections: [{ connectionType: 'd', hub: 104 }],
      title: 'Hidden-only venue',
      venueTypes: [302],
    },
  ],
} as const

describe('Payload-owned regional market map model', () => {
  it('normalizes managed regions, asset classes, hubs, routes, venues, and hierarchy', () => {
    const index = buildRegionalMarketMapIndex(documents)

    expect(index.assetClasses).toEqual([
      {
        color: '#ff671f',
        displayOrder: 1,
        id: '21',
        legacyID: 21,
        marketDataKey: 'power',
        slug: 'power',
        title: 'Power',
        volumeLabel: 'GWh',
      },
      {
        color: '#f7ea48',
        displayOrder: 2,
        id: '22',
        legacyID: 22,
        marketDataKey: 'natural-gas',
        slug: 'natural-gas',
        title: 'Natural Gas',
        volumeLabel: 'TWh',
      },
    ])

    const europe = index.regions.find(({ id }) => id === '31')
    expect(europe).toMatchObject({
      centre: [9, 52],
      label: 'European markets',
      title: 'Europe',
      zoom: 20,
    })
    expect(europe?.boundary?.type).toBe('Feature')
    expect(europe?.pointsOfInterest).toEqual([
      {
        id: '31:poi:london',
        label: 'London',
        location: [-0.1, 51.5],
        popupText: 'Trayport office',
      },
    ])
    expect(index.regions.find(({ id }) => id === '32')).toMatchObject({
      boundary: null,
      centre: [140, 35],
      label: 'APC',
      zoom: 1,
    })

    expect(index.hubs.map(({ id, title }) => ({ id, title }))).toEqual([
      { id: '101', title: 'German Power' },
      { id: '103', title: 'Japan Power' },
      { id: '102', title: 'TTF' },
    ])
    expect(index.hubs.find(({ id }) => id === '101')).toMatchObject({
      assetClassIDs: ['21'],
      countryCodes: ['DEU', 'FRA'],
      destination: '/market-coverage/german-power/',
      hubType: 'phub',
      legacyID: 4101,
      points: [{ id: '101:marker:berlin', label: 'Berlin marker', location: [13.4, 52.5] }],
      regionIDs: ['31'],
      venueTypeIDs: [],
    })
    expect(index.hubs.find(({ id }) => id === '102')).toMatchObject({
      destination: 'https://example.com/ttf',
      hubType: 'vhub',
      points: [{ id: '102:centre', label: 'TTF marker', location: [5.1, 52.1] }],
    })

    expect(index.connections).toHaveLength(2)
    expect(index.connections.find(({ id }) => id === '101:102')).toMatchObject({
      id: '101:102',
      route: { type: 'LineString' },
      showLineMarker: true,
      title: 'Power to gas',
    })
    expect(index.connections.find(({ id }) => id === '101:103')).toMatchObject({
      route: { type: 'LineString' },
      showLineMarker: true,
      title: 'Europe to Japan power',
    })

    expect(index.venueTypes).toEqual([
      {
        displayOrder: 1,
        id: '302',
        label: 'Exchange',
        parentID: '301',
        title: 'Exchange',
      },
      {
        displayOrder: 2,
        id: '301',
        label: 'Trading venues',
        parentID: null,
        title: 'Venue',
      },
      {
        displayOrder: 3,
        id: '303',
        label: 'Brokers',
        parentID: null,
        title: 'Broker',
      },
    ])
    expect(index.venues.map(({ destination, id, title }) => ({ destination, id, title }))).toEqual([
      { destination: '/venues/asia-exchange/', id: '203', title: 'Asia Exchange' },
      { destination: 'https://broker.example.com/', id: '202', title: 'Broker One' },
      { destination: '/venues/eex/', id: '201', title: 'EEX' },
    ])
    expect(index.venues.find(({ id }) => id === '201')?.connections).toEqual([
      { hubID: '101', type: 'b' },
    ])
  })

  it('filters every dependent projection and retains a selected child venue type parent', () => {
    const full = buildRegionalMarketMapIndex(documents)
    const filtered = filterRegionalMarketMapIndex(full, {
      assetClassIDs: ['21'],
      regionIDs: ['31'],
      venueTypeIDs: ['302'],
    })

    expect(filtered.hubs.map(({ id }) => id)).toEqual(['101', '103'])
    expect(filtered.assetClasses.map(({ id }) => id)).toEqual(['21'])
    expect(filtered.regions.map(({ id }) => id)).toEqual(['31'])
    expect(filtered.connections).toEqual([
      expect.objectContaining({ id: '101:103', sourceHubID: '101', targetHubID: '103' }),
    ])
    expect(filtered.venues.map(({ id, connections }) => ({ connections, id }))).toEqual([
      { connections: [{ hubID: '103', type: 'd' }], id: '203' },
      { connections: [{ hubID: '101', type: 'b' }], id: '201' },
    ])
    expect(filtered.venueTypes.map(({ id }) => id)).toEqual(['302', '301'])

    expect(full.hubs).toHaveLength(3)
    expect(full.venues.find(({ id }) => id === '201')?.connections).toHaveLength(1)
  })

  it('does not leak a multi-class or multi-region hub outside the configured projection', () => {
    const built = buildRegionalMarketMapIndex(documents)
    const full = {
      ...built,
      hubs: built.hubs.map((hub) =>
        hub.id === '101' ? { ...hub, assetClassIDs: ['21', '22'], regionIDs: ['31', '32'] } : hub,
      ),
    }
    const filtered = filterRegionalMarketMapIndex(full, {
      assetClassIDs: ['22'],
      regionIDs: ['31'],
    })

    expect(filtered.assetClasses.map(({ id }) => id)).toEqual(['22'])
    expect(filtered.regions.map(({ id }) => id)).toEqual(['31'])
    expect(filtered.hubs.map(({ id }) => id)).toEqual(['101', '102'])
  })

  it('uses bounded region geometry first and marker positions as a safe fallback', () => {
    const index = buildRegionalMarketMapIndex(documents)

    expect(regionalMapBounds(index, '31')).toEqual([
      [-12, 35],
      [30, 35],
      [30, 72],
      [-12, 72],
      [-12, 35],
    ])
    expect(regionalMapBounds(index, '32')).toEqual([[139.7, 35.7]])
    expect(regionalMapBounds(index, 'missing')).toEqual([])
    expect(regionalMapBounds(index)).toEqual([
      [13.4, 52.5],
      [139.7, 35.7],
      [5.1, 52.1],
    ])
  })
})
