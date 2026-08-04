import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  DividerComponentAdapter,
  EmbedComponentAdapter,
  OfficeComponentAdapter,
} from '@/components/blocks/adapters'
import {
  normalizeDataChartComponent,
  normalizeMarketCoverageComponent,
  normalizeUnsupportedDataChartComponent,
} from '@/components/blocks/specialistNormalizers'
import {
  DataChartPresentation,
  MarketCoveragePresentation,
} from '@/components/blocks/specialistPresentation'
import type { MarketDataResult } from '@/data/market-data/types'
import type {
  DataChartComponent,
  DividerComponent,
  EmbedComponent,
  MarketCoverageComponent,
  OfficeComponent,
  Region,
} from '@/payload-types'

vi.mock('@/components/Trayport/MarketVolumeChart.client', () => ({
  MarketVolumeChart: ({
    categories,
    dataType,
    displayInterval,
    height,
    series,
    seriesDimension,
    showAxes,
    showDataTable,
    showLegend,
    showValues,
  }: {
    categories: string[]
    dataType: string
    displayInterval: string
    height: number
    series: unknown[]
    seriesDimension: string
    showAxes: boolean
    showDataTable: boolean
    showLegend: boolean
    showValues: boolean
  }) => (
    <div
      data-height={height}
      data-category-count={categories.length}
      data-data-type={dataType}
      data-display-interval={displayInterval}
      data-series-count={series.length}
      data-series-dimension={seriesDimension}
      data-show-axes={String(showAxes)}
      data-show-data-table={String(showDataTable)}
      data-show-legend={String(showLegend)}
      data-show-values={String(showValues)}
      data-testid="market-volume-chart"
    />
  ),
}))

const region = (id: number, title: string): Region => ({
  createdAt: '2026-01-01T00:00:00.000Z',
  id,
  slug: title.toLowerCase().replaceAll(' ', '-'),
  title,
  updatedAt: '2026-01-01T00:00:00.000Z',
})

const dividerBlock = {
  blockType: 'divider',
  style: 'space',
} satisfies DividerComponent

const embedBlock = {
  blockType: 'embed',
  url: 'https://example.com/report',
} satisfies EmbedComponent

const officeBlock = {
  appearance: 'featured',
  blockType: 'office',
  office: {
    address: '7th Floor, 1 Angel Court',
    addressPrefix: 'London office',
    country: 'United Kingdom',
    coordinates: { latitude: 51.515, longitude: -0.087 },
    createdAt: '2026-01-01T00:00:00.000Z',
    displayOrder: 1,
    email: 'london@example.com',
    id: 1,
    legalName: 'Trayport Limited',
    phone: '+44 (0)20 7960 5500',
    title: 'London',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
} satisfies OfficeComponent

const coverageBlock = {
  actions: [
    {
      label: 'Coverage details',
      link: { newTab: true, type: 'custom', url: 'https://example.com/coverage' },
      style: 'link',
    },
  ],
  backgroundMedia: 61,
  blockType: 'marketCoverage',
  height: 700,
  lineColor: '#009cde',
  lineOpacity: 0.4,
  lineWidth: 0.5,
  markerSize: 12,
  presentation: 'summary',
  regions: [region(1, 'Europe'), region(2, 'Asia Pacific'), region(3, 'North America'), 999],
  showLines: true,
  style: 'dark',
  title: 'Global connectivity',
} satisfies MarketCoverageComponent

const chartBlock = {
  assetClass: 7,
  accessibleSummary: 'Quarterly traded volume split by execution type.',
  assetClassLegacyId: 7,
  axisLabel: 'Volume',
  blockType: 'dataChart',
  chartType: 'stackedColumn',
  dataType: 'volume',
  displayInterval: 'quarter',
  height: 420,
  scalePower: 3,
  showAxes: false,
  showDataTable: true,
  showLegend: true,
  showValues: true,
  seriesDimension: 'executionType',
  title: 'European power volume',
  unit: 'GWh',
} satisfies DataChartComponent

const emptyChartResult = {
  categories: [],
  dataType: 'volume',
  displayInterval: 'quarter',
  series: [],
  seriesDimension: 'executionType',
  status: 'empty',
} satisfies MarketDataResult

describe('typed specialist block adapters', () => {
  it('preserves divider variants and embed fallback copy', () => {
    const { rerender } = render(<DividerComponentAdapter block={dividerBlock} index={0} />)

    const spacer = document.querySelector('.trayport-spacer')
    expect(spacer?.tagName).toBe('DIV')
    expect(spacer?.getAttribute('aria-hidden')).toBe('true')

    rerender(<DividerComponentAdapter block={{ blockType: 'divider', style: 'line' }} index={0} />)
    expect(document.querySelector('hr.trayport-divider')).toBeTruthy()

    rerender(<EmbedComponentAdapter block={embedBlock} index={0} />)
    const embed = screen.getByRole('link', { name: 'View media' })
    expect(embed.getAttribute('href')).toBe(embedBlock.url)
    expect(embed.className).toContain('trayport-embed')
    expect(embed.querySelector('svg')?.getAttribute('data-icon')).toBe('arrow-right')
    expect(embed.querySelector('svg')?.classList.contains('size-[18px]')).toBe(true)
  })

  it('normalizes hydrated offices while leaving numeric relationships unresolved', () => {
    const { rerender } = render(<OfficeComponentAdapter block={officeBlock} index={0} />)

    const office = screen
      .getByRole('heading', { level: 3, name: 'Trayport Limited' })
      .closest('article')
    expect(office?.className).toContain('trayport-office--featured')
    expect(within(office as HTMLElement).getByText('London office')).toBeTruthy()
    expect(
      within(office as HTMLElement)
        .getByRole('link', { name: /\+44/ })
        .getAttribute('href'),
    ).toBe('tel:+4402079605500')
    expect(
      within(office as HTMLElement)
        .getByRole('link', { name: 'london@example.com' })
        .getAttribute('href'),
    ).toBe('mailto:london@example.com')
    const map = within(office as HTMLElement).getByRole('link', { name: 'View map' })
    expect(map.getAttribute('target')).toBe('_blank')
    expect(map.getAttribute('href')).toContain('mlat=51.515&mlon=-0.087')

    rerender(
      <OfficeComponentAdapter
        block={{
          ...officeBlock,
          office: { ...officeBlock.office, coordinates: { latitude: 51.515 } },
        }}
        index={0}
      />,
    )
    expect(screen.queryByRole('link', { name: 'View map' })).toBeNull()

    rerender(
      <OfficeComponentAdapter
        block={{ appearance: 'standard', blockType: 'office', office: 1 }}
        index={0}
      />,
    )
    expect(document.querySelector('.trayport-office')).toBeNull()
  })

  it('retains bounded map geometry, managed regions, actions, and SVG descriptions', () => {
    const model = normalizeMarketCoverageComponent(coverageBlock, {
      background: <span data-testid="coverage-background" />,
      body: <div className="trayport-richtext">Managed introduction</div>,
      hubCount: 4,
      markers: [
        {
          assetClasses: [],
          hubId: 1,
          label: 'Fallback one',
          latitude: 1,
          longitude: 2,
          regions: [],
        },
        {
          assetClasses: [],
          hubId: 2,
          label: 'Fallback two',
          latitude: 3,
          longitude: 4,
          regions: [],
        },
      ],
    })
    render(<MarketCoveragePresentation model={model} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Global connectivity' })).toBeTruthy()
    expect(screen.getByText(/4 market hubs and 2 imported locations/)).toBeTruthy()
    expect(screen.getByText('Global market')).toBeTruthy()
    expect(
      screen.getByTestId('coverage-background').parentElement?.getAttribute('aria-hidden'),
    ).toBe('true')

    const map = document.querySelector('figure.trayport-coverage-map') as HTMLElement
    expect(map.dataset.mapStyle).toBe('dark')
    expect(map.style.getPropertyValue('--trayport-map-height')).toBe('600px')
    expect(map.style.getPropertyValue('--trayport-map-line-width')).toBe('4')
    expect(map.querySelectorAll('circle.trayport-coverage-map__marker')).toHaveLength(3)
    expect(map.querySelectorAll('path.trayport-coverage-map__route')).toHaveLength(2)
    expect(
      within(map).getByRole('img', { name: /Trayport market connectivity locations/ }),
    ).toBeTruthy()
    expect(map.querySelector('desc')?.textContent).toContain('Europe, Asia Pacific, North America')
    expect(within(map).getByText('3 connected regions shown from managed content.')).toBeTruthy()

    const action = screen.getByRole('link', {
      name: 'Coverage details (opens in a new tab)',
    })
    expect(action.querySelector('svg')?.getAttribute('data-icon')).toBe('chevron-right')
  })

  it('renders the map-only composition without repeated visible summary content', () => {
    const model = normalizeMarketCoverageComponent(
      { ...coverageBlock, presentation: 'mapOnly' },
      {
        background: <span data-testid="map-only-background" />,
        body: <div>Repeated introduction</div>,
        hubCount: 4,
        markers: [],
      },
    )
    render(<MarketCoveragePresentation model={model} />)

    expect(document.querySelector('.trayport-market-coverage--map-only')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Global connectivity' })).toBeNull()
    expect(screen.queryByText('Repeated introduction')).toBeNull()
    expect(screen.queryByText(/market hubs/)).toBeNull()
    expect(screen.queryByRole('link', { name: 'Coverage details' })).toBeNull()
    expect(screen.getByText('3 connected regions shown from managed content.').className).toContain(
      'sr-only',
    )
    expect(screen.getByTestId('map-only-background')).toBeTruthy()
  })

  it('gives repeated map and chart instances unique accessibility relationships', () => {
    const coverageModel = normalizeMarketCoverageComponent(coverageBlock, {
      background: null,
      body: null,
      hubCount: 0,
      markers: [],
    })
    const chartModel = normalizeDataChartComponent(chartBlock, emptyChartResult)

    render(
      <>
        <MarketCoveragePresentation model={coverageModel} />
        <MarketCoveragePresentation model={coverageModel} />
        <DataChartPresentation model={chartModel} />
        <DataChartPresentation model={chartModel} />
      </>,
    )

    const labelledByValues = [
      ...Array.from(document.querySelectorAll('svg[aria-labelledby]')).map((element) =>
        element.getAttribute('aria-labelledby'),
      ),
      ...Array.from(document.querySelectorAll('section.trayport-chart')).map((element) =>
        element.getAttribute('aria-labelledby'),
      ),
    ].filter((value): value is string => Boolean(value))
    const referencedIDs = labelledByValues.flatMap((value) => value.split(' '))

    expect(labelledByValues).toHaveLength(4)
    expect(new Set(referencedIDs).size).toBe(referencedIDs.length)
    for (const id of referencedIDs) {
      expect(document.getElementById(id)).not.toBeNull()
    }
  })

  it('scales chart rows and retains the accessible chart data-table enhancement', () => {
    const model = normalizeDataChartComponent(chartBlock, {
      categories: ['2026 Q1'],
      dataType: 'volume',
      displayInterval: 'quarter',
      series: [
        { key: 'otcBilateral', label: 'OTC bilateral', values: [1000] },
        { key: 'otcCleared', label: 'OTC cleared', values: [2000] },
        { key: 'exchangeTraded', label: 'Exchange traded', values: [3000] },
      ],
      seriesDimension: 'executionType',
      status: 'available',
    })
    const { rerender } = render(<DataChartPresentation model={model} />)

    const chart = screen.getByTestId('market-volume-chart')
    expect(document.querySelector('.trayport-chart')?.getAttribute('data-market-data-status')).toBe(
      'available',
    )
    expect(chart.dataset.height).toBe('420')
    expect(chart.dataset.categoryCount).toBe('1')
    expect(chart.dataset.seriesCount).toBe('3')
    expect(chart.dataset.dataType).toBe('volume')
    expect(chart.dataset.displayInterval).toBe('quarter')
    expect(chart.dataset.seriesDimension).toBe('executionType')
    expect(chart.dataset.showAxes).toBe('false')
    expect(chart.dataset.showLegend).toBe('true')
    expect(chart.dataset.showValues).toBe('true')
    expect(screen.getByText(chartBlock.accessibleSummary).className).toContain('sr-only')

    const tableRegion = screen.getByRole('region', { name: 'European power volume data table' })
    expect(within(tableRegion).getByRole('rowheader', { name: '2026 Q1' })).toBeTruthy()
    expect(
      within(tableRegion)
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    ).toEqual(['1', '2', '3'])
    expect(within(tableRegion).getByRole('columnheader', { name: 'Period' })).toBeTruthy()
    expect(
      within(tableRegion).getByRole('columnheader', { name: 'Exchange traded (GWh)' }),
    ).toBeTruthy()

    rerender(
      <DataChartPresentation
        model={{ ...model, categories: [], dataStatus: 'empty', series: [] }}
      />,
    )
    expect(screen.getByText(/No imported market-data values/)).toBeTruthy()
    expect(screen.queryByTestId('market-volume-chart')).toBeNull()

    rerender(
      <DataChartPresentation
        model={{ ...model, categories: [], dataStatus: 'unavailable', series: [] }}
      />,
    )
    expect(screen.getByText(/temporarily unavailable/)).toBeTruthy()
    expect(document.querySelector('.trayport-chart')?.getAttribute('data-market-data-status')).toBe(
      'unavailable',
    )

    rerender(
      <DataChartPresentation
        model={{ ...model, categories: [], dataStatus: 'unsupported', series: [] }}
      />,
    )
    expect(screen.getByText(/chart configuration is not supported/)).toBeTruthy()
    expect(document.querySelector('.trayport-chart')?.getAttribute('data-market-data-status')).toBe(
      'unsupported',
    )
  })

  it('renders an arbitrary hub series as a generic period table with explicit missing values', () => {
    const model = normalizeDataChartComponent(
      {
        ...chartBlock,
        chartType: 'line',
        dataType: 'price',
        displayInterval: 'month',
        scalePower: 0,
        seriesDimension: 'hub',
        title: 'Power prices by hub',
        unit: 'EUR/MWh',
      },
      {
        categories: ['Jan 2025', 'Feb 2025'],
        dataType: 'price',
        displayInterval: 'month',
        series: [
          { key: 'hub:2495', label: 'EEX German Power', values: [42.12, null] },
          { key: 'hub:2499', label: 'Nord Pool', values: [38.5, 39.25] },
        ],
        seriesDimension: 'hub',
        status: 'available',
      },
    )

    render(<DataChartPresentation model={model} />)

    const table = screen.getByRole('table')
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent),
    ).toEqual(['Period', 'EEX German Power (EUR/MWh)', 'Nord Pool (EUR/MWh)'])
    expect(
      within(table)
        .getAllByRole('rowheader')
        .map((header) => header.textContent),
    ).toEqual(['Jan 2025', 'Feb 2025'])
    expect(within(table).getByText('Not available').className).toContain('sr-only')
    expect(within(table).queryByRole('columnheader', { name: /Total/ })).toBeNull()
  })

  it('distinguishes unsupported chart signatures from valid empty data', () => {
    const model = normalizeUnsupportedDataChartComponent({
      ...chartBlock,
      chartType: 'line',
      dataType: 'price',
      seriesDimension: 'executionType',
    })

    render(<DataChartPresentation model={model} />)

    expect(model.dataStatus).toBe('unsupported')
    expect(screen.getByText('This chart configuration is not supported.')).toBeTruthy()
    expect(screen.queryByTestId('market-volume-chart')).toBeNull()
  })

  it('prefers the hydrated managed asset-class data key with a legacy-field fallback', () => {
    const hydrated = normalizeDataChartComponent(
      {
        ...chartBlock,
        assetClass: {
          createdAt: '2026-01-01T00:00:00.000Z',
          id: 70,
          legacySource: { legacyId: 22, source: 'wordpress' },
          slug: 'power',
          title: 'Power',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      },
      emptyChartResult,
    )

    expect(hydrated.assetClassLegacyID).toBe(22)
    expect(normalizeDataChartComponent(chartBlock, emptyChartResult).assetClassLegacyID).toBe(7)
  })
})
