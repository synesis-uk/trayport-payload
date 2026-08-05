// @vitest-environment node

import { describe, expect, it } from 'vitest'

import {
  marketDataImportParserContract,
  parseMarketDataImport,
} from '@/data/market-data/imports/parser'
import type { ManagedMarketDataCatalog } from '@/data/market-data/imports/types'

const catalog: ManagedMarketDataCatalog = {
  assetClasses: [
    { aliases: ['Electricity'], id: 21, key: 'asset-class:power', title: 'Power' },
    { aliases: [], id: 22, key: 'asset-class:gas', title: 'Gas' },
  ],
  hubs: [
    {
      aliases: ['DE Power'],
      assetClassKeys: ['asset-class:power'],
      id: 101,
      key: 'hub:german-power',
      title: 'German Power',
    },
    {
      aliases: ['GB Power'],
      assetClassKeys: ['asset-class:power'],
      id: 102,
      key: 'hub:uk-power',
      title: 'UK Power',
    },
    {
      aliases: ['NBP'],
      assetClassKeys: ['asset-class:gas'],
      id: 103,
      key: 'hub:nbp-uk',
      title: 'NBP (UK)',
    },
  ],
}

describe('market-data CSV parser', () => {
  it('publishes the bounded, stable-alias parser contract', () => {
    expect(marketDataImportParserContract).toEqual({
      formats: ['legacy-volume-two-row-header', 'legacy-price-blocks'],
      maxCells: 250_000,
      maxColumns: 500,
      maxIssuesPerKind: 100,
      maxRows: 10_000,
      negativePrices: true,
      omittedCellsPreserveExistingMetrics: true,
      previewRows: 25,
      resolution: 'payload-managed-keys-titles-and-aliases',
    })
  })

  it('parses quoted legacy volume files through managed aliases and ignores only dash placeholders', () => {
    const report = parseMarketDataImport({
      catalog,
      csv: [
        ',DE Power,DE Power,DE Power,DE Power,,GB Power,GB Power,GB Power,GB Power',
        'Period,OTC bilateral,OTC cleared,Exchange traded,Total,Period,OTC bilateral,OTC cleared,Exchange traded,Total',
        'Jan-25,"1,200",-,300,"1,500",Jan-25,400,50,25,475',
        'Feb-25,-10,20,30,40,Feb-25,-,60,70,130',
      ].join('\n'),
      importType: 'volume',
      selectedAssetClassID: 21,
    })

    expect(report).toMatchObject({
      canForceMissingHubs: false,
      errors: [],
      importType: 'volume',
      valid: true,
      warnings: [],
    })
    expect(report.rows).toEqual([
      {
        assetClassKey: 'asset-class:power',
        exchangeTraded: 300,
        hubKey: 'hub:german-power',
        month: 1,
        otcBilateral: 1200,
        sourceLine: 3,
        year: 2025,
      },
      {
        assetClassKey: 'asset-class:power',
        exchangeTraded: 25,
        hubKey: 'hub:uk-power',
        month: 1,
        otcBilateral: 400,
        otcCleared: 50,
        sourceLine: 3,
        year: 2025,
      },
      {
        assetClassKey: 'asset-class:power',
        exchangeTraded: 30,
        hubKey: 'hub:german-power',
        month: 2,
        otcBilateral: -10,
        otcCleared: 20,
        sourceLine: 4,
        year: 2025,
      },
      {
        assetClassKey: 'asset-class:power',
        exchangeTraded: 70,
        hubKey: 'hub:uk-power',
        month: 2,
        otcCleared: 60,
        sourceLine: 4,
        year: 2025,
      },
    ])
    expect(report.stats).toMatchObject({
      ignoredEmptyOrDash: 2,
      matchedHubs: ['German Power', 'UK Power'],
      numericCells: 10,
      periodEnd: '2025-02',
      periodStart: '2025-01',
      years: [2025],
    })
  })

  it('makes missing volume coverage the only forceable validation failure', () => {
    const report = parseMarketDataImport({
      catalog,
      csv: [
        ',German Power,German Power,German Power',
        'Period,OTC bilateral,OTC cleared,Exchange traded',
        'Jan-25,100,20,30',
      ].join('\n'),
      importType: 'volume',
      selectedAssetClassID: 21,
    })

    expect(report.valid).toBe(false)
    expect(report.canForceMissingHubs).toBe(true)
    expect(report.errors).toEqual(['CSV is missing hub columns for Power: UK Power.'])
  })

  it('parses multi-block prices, preserves decimals, and accepts negative prices', () => {
    const report = parseMarketDataImport({
      catalog,
      csv: [
        'Power',
        'Prices,Jan-25,15/02/2025',
        'German Power,78.835,-2.25',
        'UK Power,68.1,60.55',
        '',
        'Gas',
        'Prices,2025-01-01',
        'NBP,-0.125',
      ].join('\n'),
      importType: 'price',
    })

    expect(report.errors).toEqual([])
    expect(report.valid).toBe(true)
    expect(report.rows).toEqual([
      {
        assetClassKey: 'asset-class:gas',
        hubKey: 'hub:nbp-uk',
        month: 1,
        price: -0.125,
        sourceLine: 8,
        year: 2025,
      },
      {
        assetClassKey: 'asset-class:power',
        hubKey: 'hub:german-power',
        month: 1,
        price: 78.835,
        sourceLine: 3,
        year: 2025,
      },
      {
        assetClassKey: 'asset-class:power',
        hubKey: 'hub:uk-power',
        month: 1,
        price: 68.1,
        sourceLine: 4,
        year: 2025,
      },
      {
        assetClassKey: 'asset-class:power',
        hubKey: 'hub:german-power',
        month: 2,
        price: -2.25,
        sourceLine: 3,
        year: 2025,
      },
      {
        assetClassKey: 'asset-class:power',
        hubKey: 'hub:uk-power',
        month: 2,
        price: 60.55,
        sourceLine: 4,
        year: 2025,
      },
    ])
  })

  it('rejects ambiguous Payload aliases instead of guessing a hub', () => {
    const ambiguousCatalog: ManagedMarketDataCatalog = {
      ...catalog,
      hubs: [
        ...catalog.hubs,
        {
          aliases: ['DE Power'],
          assetClassKeys: ['asset-class:power'],
          id: 104,
          key: 'hub:other-power',
          title: 'Other Power',
        },
      ],
    }
    const report = parseMarketDataImport({
      catalog: ambiguousCatalog,
      csv: [
        ',DE Power,DE Power,DE Power',
        'Period,OTC bilateral,OTC cleared,Exchange traded',
        'Jan-25,100,20,30',
      ].join('\n'),
      importType: 'volume',
      selectedAssetClassID: 21,
    })

    expect(report.valid).toBe(false)
    expect(report.canForceMissingHubs).toBe(false)
    expect(report.errors).toContain(
      'The managed hub alias "de power" is ambiguous: German Power, Other Power.',
    )
  })
})
