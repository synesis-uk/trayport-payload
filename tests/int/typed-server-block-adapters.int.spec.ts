// @vitest-environment node

import { isValidElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  DataChartPresentationModel,
  MarketCoveragePresentationModel,
} from '@/components/blocks/specialistPresentation'
import type { MarketMatrixPresentationModel } from '@/components/blocks/marketMatrixModel'
import type {
  DataChartComponent,
  MarketCoverageComponent,
  MarketMatrixComponent,
} from '@/payload-types'

const harness = vi.hoisted(() => ({
  getConnectionsMapRuntimeConfig: vi.fn(),
  loadDataChartMarketData: vi.fn(),
  loadMarketCoverageIndex: vi.fn(),
  loadMarketMatrixIndex: vi.fn(),
}))

vi.mock('@/config/connectionsMap.server', () => ({
  getConnectionsMapRuntimeConfig: harness.getConnectionsMapRuntimeConfig,
}))

vi.mock('@/data/contentIndexes.server', () => ({
  loadMarketCoverageIndex: harness.loadMarketCoverageIndex,
}))

vi.mock('@/data/marketMatrix.server', () => ({
  loadMarketMatrixIndex: harness.loadMarketMatrixIndex,
}))

vi.mock('@/components/RichText', () => ({
  default: () => null,
}))

vi.mock('@/components/blocks/dataChartData.server', () => ({
  loadDataChartMarketData: harness.loadDataChartMarketData,
}))

vi.mock('@/components/Trayport/TrayportMedia', () => ({
  TrayportMedia: () => null,
}))

vi.mock('@/components/blocks/specialistPresentation', () => ({
  DataChartPresentation: () => null,
  MarketCoveragePresentation: () => null,
}))

vi.mock('@/components/blocks/DynamicMarketMatrixPresentation.client', () => ({
  DynamicMarketMatrixPresentation: () => null,
}))

import {
  DataChartComponentAdapter,
  MarketCoverageComponentAdapter,
  MarketMatrixComponentAdapter,
} from '@/components/blocks/serverAdapters'

const coverageBlock = {
  backgroundMedia: 42,
  blockType: 'marketCoverage',
  height: 320,
  lineColor: '#009cde',
  lineOpacity: 0.5,
  lineWidth: 0.5,
  markerSize: 5,
  presentation: 'summary',
  regions: [],
  showLines: true,
  style: 'dark',
} satisfies MarketCoverageComponent

const chartBlock = {
  assetClass: {
    createdAt: '2026-08-04T00:00:00.000Z',
    displayOrder: 1,
    id: 7,
    legacySource: { legacyId: 17, source: 'wordpress' },
    slug: 'natural-gas',
    title: 'Natural Gas',
    updatedAt: '2026-08-04T00:00:00.000Z',
  },
  assetClassLegacyId: 999,
  blockType: 'dataChart',
  chartType: 'stackedColumn',
  dataType: 'volume',
  displayInterval: 'quarter',
  fromQuarter: 2,
  fromYear: 2024,
  scalePower: 2,
  seriesDimension: 'executionType',
  showDataTable: true,
  title: 'Gas volume',
  toQuarter: 4,
  toYear: 2025,
} satisfies DataChartComponent

const matrixBlock = {
  blockType: 'marketMatrix',
  caption: 'Managed connectivity',
  defaultView: 'combined',
  showDownload: true,
  showFilters: true,
} satisfies MarketMatrixComponent

beforeEach(() => {
  harness.getConnectionsMapRuntimeConfig.mockReset()
  harness.loadDataChartMarketData.mockReset()
  harness.loadMarketCoverageIndex.mockReset()
  harness.loadMarketMatrixIndex.mockReset()
})

describe('typed server block adapters', () => {
  it('loads public hub markers at the server boundary before normalizing coverage', async () => {
    harness.loadMarketCoverageIndex.mockResolvedValue({
      allMarkers: [
        {
          assetClasses: [{ displayOrder: 1, id: 21, slug: 'power', title: 'Power' }],
          hubId: 1,
          label: 'European Hub',
          latitude: 50.1,
          longitude: 8.6,
          regions: [],
        },
      ],
      hubCount: 1,
      hubs: [],
      markers: [],
    })

    const element = await MarketCoverageComponentAdapter({
      block: coverageBlock,
      draft: false,
      index: 0,
    })

    expect(harness.loadMarketCoverageIndex).toHaveBeenCalledWith({ draft: false })
    expect(isValidElement<{ model: MarketCoveragePresentationModel }>(element)).toBe(true)
    if (!isValidElement<{ model: MarketCoveragePresentationModel }>(element)) return

    expect(element.props.model).toMatchObject({
      hubCount: 1,
      importedLocationCount: 1,
      markers: [
        {
          latitude: 50.1,
          longitude: 8.6,
          title: 'European Hub',
        },
      ],
      markerGroups: [
        {
          color: '#ff671f',
          key: '21',
          points: [
            {
              latitude: 50.1,
              longitude: 8.6,
              title: 'European Hub',
            },
          ],
          slug: 'power',
          title: 'Power',
        },
      ],
    })
    expect(isValidElement<{ composition?: string }>(element.props.model.background)).toBe(true)
    if (isValidElement<{ composition?: string }>(element.props.model.background)) {
      expect(element.props.model.background.props.composition).toBe('content')
    }
  })

  it('enables the application-owned runtime only for the Home dark map-only presentation', async () => {
    const runtime = {
      accessToken: 'pk.valid-example',
      provider: 'mapbox' as const,
      styleURL: 'mapbox://styles/example/reference',
    }
    harness.getConnectionsMapRuntimeConfig.mockReturnValue(runtime)
    harness.loadMarketCoverageIndex.mockResolvedValue({
      allMarkers: [],
      hubCount: 0,
      hubs: [],
      markers: [],
    })

    const darkMap = await MarketCoverageComponentAdapter({
      block: { ...coverageBlock, presentation: 'mapOnly', style: 'dark' },
      draft: false,
      index: 0,
    })
    const lightMap = await MarketCoverageComponentAdapter({
      block: { ...coverageBlock, presentation: 'mapOnly', style: 'light' },
      draft: false,
      index: 1,
    })
    const darkSummary = await MarketCoverageComponentAdapter({
      block: { ...coverageBlock, presentation: 'summary', style: 'dark' },
      draft: false,
      index: 2,
    })

    expect(isValidElement<{ mapRuntime?: unknown }>(darkMap)).toBe(true)
    expect(isValidElement<{ mapRuntime?: unknown }>(lightMap)).toBe(true)
    expect(isValidElement<{ mapRuntime?: unknown }>(darkSummary)).toBe(true)
    if (
      !isValidElement<{ mapRuntime?: unknown }>(darkMap) ||
      !isValidElement<{ mapRuntime?: unknown }>(lightMap) ||
      !isValidElement<{ mapRuntime?: unknown }>(darkSummary)
    ) {
      return
    }

    expect(darkMap.props.mapRuntime).toEqual(runtime)
    expect(lightMap.props.mapRuntime).toBeNull()
    expect(darkSummary.props.mapRuntime).toBeNull()
    expect(harness.getConnectionsMapRuntimeConfig).toHaveBeenCalledOnce()
  })

  it('queries bounded application data before scaling the chart presentation model', async () => {
    harness.loadDataChartMarketData.mockResolvedValue({
      categories: ['2024 Q2'],
      dataType: 'volume',
      displayInterval: 'quarter',
      series: [
        {
          key: 'otcBilateral',
          label: 'OTC bilateral',
          values: [100],
        },
        { key: 'otcCleared', label: 'OTC cleared', values: [200] },
        { key: 'exchangeTraded', label: 'Exchange traded', values: [300] },
      ],
      seriesDimension: 'executionType',
      status: 'available',
    })

    const element = await DataChartComponentAdapter({
      block: chartBlock,
      index: 0,
    })

    expect(harness.loadDataChartMarketData).toHaveBeenCalledWith({
      assetClassLegacyID: 17,
      dataType: 'volume',
      displayInterval: 'quarter',
      excludedHubLegacyIDs: [],
      fromQuarter: 2,
      fromYear: 2024,
      includedHubLegacyIDs: [],
      limit: 40,
      seriesDimension: 'executionType',
      toQuarter: 4,
      toYear: 2025,
    })
    expect(isValidElement<{ model: DataChartPresentationModel }>(element)).toBe(true)
    if (!isValidElement<{ model: DataChartPresentationModel }>(element)) return

    expect(element.props.model.series).toEqual([
      { key: 'otcBilateral', label: 'OTC bilateral', values: [1] },
      { key: 'otcCleared', label: 'OTC cleared', values: [2] },
      { key: 'exchangeTraded', label: 'Exchange traded', values: [3] },
    ])
    expect(element.props.model.dataStatus).toBe('available')
  })

  it('preserves market-data outages as a distinct presentation state', async () => {
    harness.loadDataChartMarketData.mockResolvedValue({
      categories: [],
      dataType: 'volume',
      displayInterval: 'quarter',
      series: [],
      seriesDimension: 'executionType',
      status: 'unavailable',
    })

    const element = await DataChartComponentAdapter({ block: chartBlock, index: 0 })

    expect(isValidElement<{ model: DataChartPresentationModel }>(element)).toBe(true)
    if (!isValidElement<{ model: DataChartPresentationModel }>(element)) return
    expect(element.props.model).toMatchObject({
      categories: [],
      dataStatus: 'unavailable',
      series: [],
    })
  })

  it('passes hydrated managed hub keys to the bounded loader in authored order', async () => {
    harness.loadDataChartMarketData.mockResolvedValue({
      categories: ['2025 Q1'],
      dataType: 'volume',
      displayInterval: 'quarter',
      series: [
        { key: 'hub:3315', label: 'PEG (French)', values: [10] },
        { key: 'hub:2488', label: 'NBP (UK)', values: [20] },
      ],
      seriesDimension: 'hub',
      status: 'available',
    })
    const hydratedHub = (id: number, legacyID: number, title: string) =>
      ({
        id,
        legacySource: { legacyId: legacyID, source: 'wordpress' },
        title,
      }) as NonNullable<DataChartComponent['includedHubs']>[number]

    await DataChartComponentAdapter({
      block: {
        ...chartBlock,
        chartType: 'column',
        excludedHubs: [hydratedHub(83, 2496, 'Greek Power')],
        includedHubs: [hydratedHub(81, 3315, 'PEG (French)'), hydratedHub(82, 2488, 'NBP (UK)')],
        seriesDimension: 'hub',
      },
      index: 0,
    })

    expect(harness.loadDataChartMarketData).toHaveBeenCalledWith(
      expect.objectContaining({
        excludedHubLegacyIDs: [2496],
        includedHubLegacyIDs: [3315, 2488],
        seriesDimension: 'hub',
      }),
    )
  })

  it.each([
    { chartType: 'column' as const, dataType: 'volume' as const },
    { chartType: 'line' as const, dataType: 'price' as const },
  ])(
    'fails closed before querying when the $chartType/$dataType presentation is not implemented',
    async ({ chartType, dataType }) => {
      const element = await DataChartComponentAdapter({
        block: { ...chartBlock, chartType, dataType },
        index: 0,
      })

      expect(harness.loadDataChartMarketData).not.toHaveBeenCalled()
      expect(isValidElement<{ model: DataChartPresentationModel }>(element)).toBe(true)
      if (!isValidElement<{ model: DataChartPresentationModel }>(element)) return
      expect(element.props.model).toMatchObject({
        categories: [],
        dataStatus: 'unsupported',
        series: [],
      })
    },
  )

  it('loads the authoritative managed matrix projection at the server boundary', async () => {
    harness.loadMarketMatrixIndex.mockResolvedValue({
      assetClasses: [{ displayOrder: 1, id: 'power', title: 'Power' }],
      hubs: [
        {
          assetClassIDs: ['power'],
          destination: null,
          id: 'german-power',
          regionIDs: ['europe'],
          title: 'German Power',
        },
      ],
      venueTypes: [{ displayOrder: 1, id: 'exchange', title: 'Exchange' }],
      venues: [
        {
          connections: { 'german-power': 'b' },
          destination: '/venue/eex/',
          displayOrder: 1,
          id: 'eex',
          title: 'EEX',
          venueType: { displayOrder: 1, id: 'exchange', title: 'Exchange' },
        },
      ],
    })

    const element = await MarketMatrixComponentAdapter({
      block: matrixBlock,
      draft: true,
      index: 0,
    })

    expect(harness.loadMarketMatrixIndex).toHaveBeenCalledWith({ draft: true })
    expect(isValidElement<{ model: MarketMatrixPresentationModel }>(element)).toBe(true)
    if (!isValidElement<{ model: MarketMatrixPresentationModel }>(element)) return
    expect(element.props.model).toMatchObject({
      defaultView: 'combined',
      groups: [
        {
          hubs: [expect.objectContaining({ id: 'german-power' })],
          title: 'Power',
        },
      ],
      venues: [expect.objectContaining({ title: 'EEX' })],
    })
  })
})
