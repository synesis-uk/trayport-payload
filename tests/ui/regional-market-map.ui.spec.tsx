import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { DynamicRegionalMarketMap } from '@/components/blocks/DynamicRegionalMarketMap.client'
import type { RegionalMarketMapPresentationModel } from '@/components/blocks/RegionalMarketMapPresentation'

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const model: RegionalMarketMapPresentationModel = {
  dataDisplay: 'always',
  defaultAssetClassID: 'power',
  height: 560,
  index: {
    assetClasses: [
      {
        color: '#ff671f',
        displayOrder: 1,
        id: 'power',
        legacyID: 21,
        marketDataKey: 'power',
        slug: 'power',
        title: 'Power',
        volumeLabel: 'GWh',
      },
      {
        color: '#f7ea48',
        displayOrder: 2,
        id: 'gas',
        legacyID: 22,
        marketDataKey: 'natural-gas',
        slug: 'natural-gas',
        title: 'Natural Gas',
        volumeLabel: 'TWh',
      },
    ],
    connections: [],
    hubs: [
      {
        assetClassIDs: ['power'],
        countryCodes: ['DEU'],
        destination: '/market-coverage/german-power/',
        hubType: 'phub',
        id: 'de-power',
        legacyID: 4101,
        marketDataKey: 'de-power',
        points: [{ id: 'de', label: 'Germany', location: [10.4, 51.1] }],
        regionIDs: ['europe'],
        title: 'German Power',
        venueTypeIDs: ['exchange'],
      },
      {
        assetClassIDs: ['power'],
        countryCodes: ['JPN'],
        destination: '/market-coverage/japan-power/',
        hubType: 'rhub',
        id: 'jp-power',
        legacyID: null,
        marketDataKey: 'japan-power',
        points: [{ id: 'jp', label: 'Japan', location: [139.7, 35.7] }],
        regionIDs: ['asia-pacific'],
        title: 'Japan Power',
        venueTypeIDs: ['exchange'],
      },
      {
        assetClassIDs: ['gas'],
        countryCodes: ['NLD'],
        destination: '/market-coverage/ttf/',
        hubType: 'vhub',
        id: 'ttf',
        legacyID: null,
        marketDataKey: 'ttf',
        points: [{ id: 'ttf-point', label: 'TTF', location: [5.1, 52.1] }],
        regionIDs: ['europe'],
        title: 'TTF',
        venueTypeIDs: ['broker'],
      },
    ],
    regions: [
      {
        boundary: null,
        centre: [140, 35],
        id: 'asia-pacific',
        label: 'Asia Pacific',
        pointsOfInterest: [],
        title: 'Asia Pacific',
        zoom: 3,
      },
      {
        boundary: null,
        centre: [9, 52],
        id: 'europe',
        label: 'Europe',
        pointsOfInterest: [],
        title: 'Europe',
        zoom: 4,
      },
    ],
    venueTypes: [
      {
        displayOrder: 1,
        id: 'venue',
        label: 'Trading venues',
        parentID: null,
        title: 'Venue',
      },
      {
        displayOrder: 2,
        id: 'exchange',
        label: 'Exchanges',
        parentID: 'venue',
        title: 'Exchange',
      },
      {
        displayOrder: 3,
        id: 'broker',
        label: 'Brokers',
        parentID: null,
        title: 'Broker',
      },
    ],
    venues: [
      {
        connections: [
          { hubID: 'de-power', type: 'b' },
          { hubID: 'jp-power', type: 'd' },
        ],
        destination: '/venues/eex/',
        id: 'eex',
        title: 'EEX',
        venueTypeIDs: ['exchange'],
      },
      {
        connections: [{ hubID: 'de-power', type: 'a' }],
        destination: 'https://broker.example.com/',
        id: 'broker-one',
        title: 'Broker One',
        venueTypeIDs: ['broker'],
      },
      {
        connections: [{ hubID: 'ttf', type: 'd' }],
        destination: null,
        id: 'gas-venue',
        title: 'Gas Venue',
        venueTypeIDs: ['exchange'],
      },
    ],
  },
  lineColor: '#ff671f',
  lineOpacity: 0.75,
  lineWidth: 3,
  mapStyle: 'dark',
  markerRadius: 6,
  showAssetClassFilter: true,
  showLines: true,
  showMarketData: false,
  showSidebar: true,
  title: 'Regional market connectivity',
  zoomTo: 'markers',
}

const chooseOption = async (label: string, option: string) => {
  const trigger = screen.getByRole('combobox', { name: label })
  fireEvent.keyDown(trigger, { code: 'ArrowDown', key: 'ArrowDown' })
  const listbox = await screen.findByRole('listbox')
  fireEvent.click(within(listbox).getByRole('option', { name: option }))
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
}

describe('regional market map fallback and interactions', () => {
  it('uses the managed map background beneath the deterministic SVG fallback', () => {
    const { container } = render(
      <DynamicRegionalMarketMap
        fallbackBackground={<span data-managed-map-background />}
        model={model}
        runtime={null}
      />,
    )

    expect(container.querySelector('[data-managed-map-background]')).toBeTruthy()
    expect(container.querySelector('svg rect')?.getAttribute('fill')).toBe('transparent')
  })

  it('keeps the no-Mapbox fallback useful and filters the accessible projection', async () => {
    const { container } = render(<DynamicRegionalMarketMap model={model} runtime={null} />)

    expect(screen.getByRole('region', { name: 'Regional market connectivity' })).toBeTruthy()
    const mapShell = container.querySelector('[data-map-provider="fallback"]')
    expect(mapShell?.getAttribute('data-map-ready')).toBe('false')
    expect(mapShell?.querySelector('svg[aria-hidden="true"]')).toBeTruthy()
    expect(mapShell?.querySelectorAll('circle')).toHaveLength(2)
    expect(screen.getByText('Showing 2 hubs for Power across all regions.')).toBeTruthy()

    fireEvent.click(screen.getByText('Accessible market-hub and venue list'))
    expect(screen.getByRole('heading', { level: 4, name: 'German Power' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 4, name: 'Japan Power' })).toBeTruthy()

    await chooseOption('Region', 'Europe')
    expect(screen.getByText('Showing 1 hub for Power in Europe.')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 4, name: 'German Power' })).toBeTruthy()
    expect(screen.queryByRole('heading', { level: 4, name: 'Japan Power' })).toBeNull()
    expect(mapShell?.querySelectorAll('circle')).toHaveLength(1)

    await chooseOption('Asset class', 'Natural Gas')
    expect(screen.getByText('Showing 1 hub for Natural Gas in Europe.')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 4, name: 'TTF' })).toBeTruthy()
    expect(screen.queryByRole('heading', { level: 4, name: 'German Power' })).toBeNull()
  })

  it('opens linked hub and venue details from the accessible list and closes them', async () => {
    render(<DynamicRegionalMarketMap model={model} runtime={null} />)

    fireEvent.click(screen.getByText('Accessible market-hub and venue list'))
    const germanPower = screen
      .getByRole('heading', { level: 4, name: 'German Power' })
      .closest('article')
    expect(germanPower).toBeTruthy()
    fireEvent.click(within(germanPower!).getByRole('button', { name: 'Show connections' }))

    const sidebar = await screen.findByRole('complementary', {
      name: 'German Power connectivity',
    })
    expect(
      within(sidebar).getByRole('link', { name: 'German Power' }).getAttribute('href'),
    ).toMatch(/^\/market-coverage\/german-power\/?$/u)
    expect(within(sidebar).getByRole('link', { name: 'EEX' }).getAttribute('href')).toMatch(
      /^\/venues\/eex\/?$/u,
    )
    expect(within(sidebar).getByRole('link', { name: 'Broker One' }).getAttribute('href')).toBe(
      'https://broker.example.com/',
    )
    expect(within(sidebar).getByText('Joule and autoTRADER')).toBeTruthy()
    expect(within(sidebar).getByText('autoTRADER')).toBeTruthy()

    fireEvent.click(within(sidebar).getByRole('button', { name: 'Close hub details' }))
    expect(screen.queryByRole('complementary', { name: 'German Power connectivity' })).toBeNull()
  })

  it('dismisses stale hub details when a visitor changes to an excluding region', async () => {
    render(<DynamicRegionalMarketMap model={model} runtime={null} />)

    fireEvent.click(screen.getByText('Accessible market-hub and venue list'))
    const germanPower = screen
      .getByRole('heading', { level: 4, name: 'German Power' })
      .closest('article')
    fireEvent.click(within(germanPower!).getByRole('button', { name: 'Show connections' }))
    expect(
      await screen.findByRole('complementary', { name: 'German Power connectivity' }),
    ).toBeTruthy()

    await chooseOption('Region', 'Asia Pacific')

    await waitFor(() =>
      expect(screen.queryByRole('complementary', { name: 'German Power connectivity' })).toBeNull(),
    )
    expect(screen.getByText('Showing 1 hub for Power in Asia Pacific.')).toBeTruthy()
  })

  it('keeps venue links available inline when the editor disables the visual sidebar', () => {
    render(<DynamicRegionalMarketMap model={{ ...model, showSidebar: false }} runtime={null} />)

    fireEvent.click(screen.getByText('Accessible market-hub and venue list'))
    const germanPower = screen
      .getByRole('heading', { level: 4, name: 'German Power' })
      .closest('article')
    expect(germanPower).toBeTruthy()
    expect(within(germanPower!).queryByRole('button', { name: 'Show connections' })).toBeNull()

    fireEvent.click(within(germanPower!).getByText('2 connected venues'))
    expect(within(germanPower!).getByRole('link', { name: 'EEX' }).getAttribute('href')).toMatch(
      /^\/venues\/eex\/?$/u,
    )
    expect(
      within(germanPower!).getByRole('link', { name: 'Broker One' }).getAttribute('href'),
    ).toBe('https://broker.example.com/')
  })

  it('opens every matching hub for a country and groups common and hub-specific venues', async () => {
    const multiHubModel: RegionalMarketMapPresentationModel = {
      ...model,
      index: {
        ...model.index,
        hubs: [
          ...model.index.hubs,
          {
            assetClassIDs: ['power'],
            countryCodes: ['DEU'],
            destination: '/market-coverage/german-power-two/',
            hubType: 'phub',
            id: 'de-power-two',
            legacyID: null,
            marketDataKey: 'de-power-two',
            points: [{ id: 'de-two', label: 'Germany two', location: [11.4, 50.1] }],
            regionIDs: ['europe'],
            title: 'German Power Two',
            venueTypeIDs: ['exchange'],
          },
        ],
        venues: [
          {
            ...model.index.venues[0]!,
            connections: [
              ...model.index.venues[0]!.connections,
              { hubID: 'de-power-two', type: 'd' },
            ],
          },
          ...model.index.venues.slice(1),
          {
            connections: [{ hubID: 'de-power-two', type: 'a' }],
            destination: '/venues/second-broker/',
            id: 'second-broker',
            title: 'Second Broker',
            venueTypeIDs: ['broker'],
          },
        ],
      },
    }

    render(<DynamicRegionalMarketMap model={multiHubModel} runtime={null} />)
    fireEvent.click(screen.getByText('Accessible market-hub and venue list'))
    fireEvent.click(screen.getByRole('button', { name: 'DEU: 2 hubs' }))

    const sidebar = await screen.findByRole('complementary', {
      name: 'German Power, German Power Two connectivity',
    })
    expect(within(sidebar).getByRole('heading', { level: 4 }).textContent).toBe('2 connected hubs')
    expect(within(sidebar).getAllByRole('link', { name: 'EEX' })).toHaveLength(1)
    expect(within(sidebar).getAllByText('Joule and autoTRADER')).toHaveLength(1)
    expect(within(sidebar).getAllByText('German Power Two')).toHaveLength(2)
    expect(within(sidebar).getByRole('link', { name: 'Second Broker' })).toBeTruthy()
  })

  it('selects a single configured region statically and defaults market data to the latest quarter', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          assetClassKey: 'power',
          interval: 'quarter',
          period: '20262',
          periods: [{ key: '20262', label: '2026 Q2' }],
          status: 'available',
          summaries: {
            'de-power': {
              changeLabel: 'QoQ',
              changePercent: 2.5,
              label: '2026 Q2',
              value: 69.407322,
            },
          },
        }),
        ok: true,
      }),
    )
    const singleRegionModel: RegionalMarketMapPresentationModel = {
      ...model,
      index: {
        ...model.index,
        hubs: model.index.hubs.filter(({ regionIDs }) => regionIDs.includes('europe')),
        regions: model.index.regions.filter(({ id }) => id === 'europe'),
      },
      showMarketData: true,
    }

    render(<DynamicRegionalMarketMap model={singleRegionModel} runtime={null} />)

    expect(screen.queryByRole('combobox', { name: 'Region' })).toBeNull()
    expect(screen.getByText('Showing 1 hub for Power in Europe.')).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Data interval' }).textContent).toContain('Quarter')
    expect(await screen.findByText('2026 Q2: 69.41 GWh (+2.5% QoQ)')).toBeTruthy()
  })
})
