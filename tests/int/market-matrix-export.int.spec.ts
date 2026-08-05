// @vitest-environment node

import { Workbook } from 'exceljs'
import { describe, expect, it } from 'vitest'

import {
  createMarketMatrixCSV,
  createMarketMatrixWorkbook,
  marketMatrixXLSXFilename,
  type MarketMatrixExportData,
} from '@/components/blocks/marketMatrixExport'

const generatedAt = new Date('2026-08-04T10:30:00.000Z')

const exportData: MarketMatrixExportData = {
  caption: 'Managed venue connectivity',
  filters: {
    assetClasses: ['Power', 'Gas'],
    hubs: ['German Power (Power)', 'French Power (Power)', 'TTF (Gas)'],
    venueTypes: ['Exchange', 'Broker'],
  },
  groups: [
    {
      hubs: [
        { id: 'de-power', title: '=German Power' },
        { id: 'fr-power', title: 'French Power' },
      ],
      id: 'power',
      title: 'Power',
    },
    {
      hubs: [{ id: 'ttf', title: 'TTF' }],
      id: 'gas',
      title: 'Gas',
    },
  ],
  venues: [
    {
      connections: { 'de-power': 'b', 'fr-power': 'a', ttf: 'd' },
      id: 'eex',
      title: '=HYPERLINK("https://example.com")',
      venueType: { id: 'exchange', title: 'Exchange' },
    },
    {
      connections: { 'de-power': 'd' },
      id: 'broker-one',
      title: 'Broker One',
      venueType: { id: 'broker', title: 'Broker' },
    },
  ],
  view: 'combined',
}

describe('market-matrix exports', () => {
  it('creates a stable, formula-neutralized CSV for the current filtered data', () => {
    const lines = createMarketMatrixCSV(exportData).split('\r\n')

    expect(lines).toEqual([
      '"Venue type","Venue","\'=German Power","French Power","TTF"',
      '"Exchange","\'=HYPERLINK(""https://example.com"")","Joule and autoTRADER","autoTRADER","Joule"',
      '"Broker","Broker One","Joule","",""',
    ])
  })

  it('creates a styled, serializable workbook with frozen grouped headers and export context', async () => {
    const workbook = createMarketMatrixWorkbook(Workbook, exportData, generatedAt)
    const bytes = await workbook.xlsx.writeBuffer()
    const reloaded = new Workbook()
    await reloaded.xlsx.load(bytes)

    const sheet = reloaded.getWorksheet('Market Matrix')
    expect(sheet).toBeDefined()
    expect(sheet?.views[0]).toMatchObject({ state: 'frozen', xSplit: 2, ySplit: 6 })
    expect(sheet?.getCell('C5').value).toBe('Power')
    expect(sheet?.getCell('C6').value).toBe("'=German Power")
    expect(sheet?.getCell('B7').value).toBe('\'=HYPERLINK("https://example.com")')
    expect(sheet?.getCell('C7').value).toBe('Joule and autoTRADER')
    expect(sheet?.getCell('D7').value).toBe('autoTRADER')
    expect(sheet?.getCell('E7').value).toBe('Joule')
    expect(sheet?.getCell('C7').fill).toMatchObject({
      fgColor: { argb: 'FFFFE0B2' },
      pattern: 'solid',
      type: 'pattern',
    })
    expect(sheet?.autoFilter).toEqual('A6:E6')

    const about = reloaded.getWorksheet('About')
    expect(about?.getCell('B3').value).toBe('Joule and autoTRADER')
    expect(about?.getCell('B4').value).toBe(generatedAt.toISOString())
    expect(about?.getCell('B16').value).toMatch(/filters selected/iu)
  })

  it('uses a deterministic dated filename for each selected view', () => {
    expect(marketMatrixXLSXFilename('combined', generatedAt)).toBe(
      'Trayport-MarketMatrix-20260804-Combined.xlsx',
    )
    expect(marketMatrixXLSXFilename('autoTrader', generatedAt)).toBe(
      'Trayport-MarketMatrix-20260804-autoTRADER.xlsx',
    )
  })
})
