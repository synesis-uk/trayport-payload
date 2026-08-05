import type { Cell, Workbook } from 'exceljs'

import type { MarketMatrixConnectionType } from '@/data/marketMatrix'

import type { MarketMatrixView } from './marketMatrixModel'

export interface MarketMatrixExportHub {
  id: string
  title: string
}

export interface MarketMatrixExportGroup {
  hubs: MarketMatrixExportHub[]
  id: string
  title: string
}

export interface MarketMatrixExportVenue {
  connections: Record<string, MarketMatrixConnectionType>
  id: string
  title: string
  venueType: {
    id: string
    title: string
  }
}

export interface MarketMatrixExportData {
  caption: string
  filters: {
    assetClasses: string[]
    hubs: string[]
    venueTypes: string[]
  }
  groups: MarketMatrixExportGroup[]
  venues: MarketMatrixExportVenue[]
  view: MarketMatrixView
}

type WorkbookConstructor = new () => Workbook

const workbookColors = {
  autoTrader: 'FFE7FFC9',
  border: 'FFD4D8E0',
  combined: 'FFFFE0B2',
  deep: 'FF1F2A44',
  joule: 'FFCCF1FF',
  muted: 'FFF2F4F7',
  white: 'FFFFFFFF',
} as const

const viewLabels: Record<MarketMatrixView, string> = {
  autoTrader: 'autoTRADER',
  combined: 'Joule and autoTRADER',
  joule: 'Joule',
}

export const marketMatrixConnectionVisible = (
  connection: MarketMatrixConnectionType | undefined,
  view: MarketMatrixView,
): boolean => {
  if (!connection) return false
  if (view === 'combined') return true
  if (view === 'joule') return connection === 'd' || connection === 'b'
  return connection === 'a' || connection === 'b'
}

export const marketMatrixConnectionLabel = (
  connection: MarketMatrixConnectionType,
  view: MarketMatrixView,
): string => {
  if (view === 'joule') return 'Joule'
  if (view === 'autoTrader') return 'autoTRADER'
  if (connection === 'd') return 'Joule'
  if (connection === 'a') return 'autoTRADER'
  return 'Joule and autoTRADER'
}

/**
 * User-managed labels must never become executable spreadsheet formulas. XLSX
 * string cells are explicit, but the same neutral form is used in both export
 * formats so opening or converting a workbook cannot change that boundary.
 */
export const marketMatrixSpreadsheetText = (value: string): string =>
  /^\s*[=+\-@]/u.test(value) ? `'${value}` : value

export const marketMatrixCSVCell = (value: string): string =>
  `"${marketMatrixSpreadsheetText(value).replaceAll('"', '""')}"`

const flattenedHubs = (data: MarketMatrixExportData): MarketMatrixExportHub[] =>
  data.groups.flatMap(({ hubs }) => hubs)

const connectionValue = (
  venue: MarketMatrixExportVenue,
  hub: MarketMatrixExportHub,
  view: MarketMatrixView,
): string => {
  const connection = venue.connections[hub.id]
  return connection && marketMatrixConnectionVisible(connection, view)
    ? marketMatrixConnectionLabel(connection, view)
    : ''
}

export const createMarketMatrixCSV = (data: MarketMatrixExportData): string => {
  const hubs = flattenedHubs(data)
  const header = ['Venue type', 'Venue', ...hubs.map(({ title }) => title)]
  const rows = data.venues.map((venue) => [
    venue.venueType.title,
    venue.title,
    ...hubs.map((hub) => connectionValue(venue, hub, data.view)),
  ])

  return [header, ...rows].map((row) => row.map(marketMatrixCSVCell).join(',')).join('\r\n')
}

const triggerBrowserDownload = (blob: Blob, filename: string): void => {
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.download = filename
  anchor.href = href
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(href), 0)
}

export const downloadMarketMatrixCSV = (data: MarketMatrixExportData): void => {
  triggerBrowserDownload(
    new Blob([createMarketMatrixCSV(data)], { type: 'text/csv;charset=utf-8' }),
    'trayport-market-matrix.csv',
  )
}

const dateStamp = (date: Date): string =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((value, index) => String(value).padStart(index === 0 ? 4 : 2, '0'))
    .join('')

export const marketMatrixXLSXFilename = (
  view: MarketMatrixView,
  generatedAt = new Date(),
): string => {
  const viewLabel =
    view === 'autoTrader' ? 'autoTRADER' : view === 'combined' ? 'Combined' : 'Joule'
  return `Trayport-MarketMatrix-${dateStamp(generatedAt)}-${viewLabel}.xlsx`
}

const applyHeaderCell = (cell: Cell) => {
  cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  cell.border = {
    bottom: { color: { argb: workbookColors.border }, style: 'thin' },
    left: { color: { argb: workbookColors.border }, style: 'thin' },
    right: { color: { argb: workbookColors.border }, style: 'thin' },
    top: { color: { argb: workbookColors.border }, style: 'thin' },
  }
  cell.fill = { fgColor: { argb: workbookColors.deep }, pattern: 'solid', type: 'pattern' }
  cell.font = { bold: true, color: { argb: workbookColors.white } }
}

const applyDataCell = (cell: Cell) => {
  cell.border = {
    bottom: { color: { argb: workbookColors.border }, style: 'thin' },
    left: { color: { argb: workbookColors.border }, style: 'thin' },
    right: { color: { argb: workbookColors.border }, style: 'thin' },
    top: { color: { argb: workbookColors.border }, style: 'thin' },
  }
  cell.alignment = { vertical: 'middle', wrapText: true }
}

const connectionFill = (connection: MarketMatrixConnectionType, view: MarketMatrixView): string => {
  if (view === 'joule' || connection === 'd') return workbookColors.joule
  if (view === 'autoTrader' || connection === 'a') return workbookColors.autoTrader
  return workbookColors.combined
}

const filterSummary = (values: string[]): string =>
  values.length ? values.map(marketMatrixSpreadsheetText).join(', ') : 'None selected'

export const createMarketMatrixWorkbook = (
  WorkbookClass: WorkbookConstructor,
  data: MarketMatrixExportData,
  generatedAt = new Date(),
): Workbook => {
  const workbook = new WorkbookClass()
  workbook.creator = 'Trayport'
  workbook.created = generatedAt
  workbook.modified = generatedAt
  workbook.lastModifiedBy = 'Trayport'

  const worksheet = workbook.addWorksheet('Market Matrix', {
    properties: { defaultRowHeight: 20 },
    views: [{ state: 'frozen', xSplit: 2, ySplit: 6, topLeftCell: 'C7' }],
  })
  const hubs = flattenedHubs(data)
  const lastColumn = Math.max(hubs.length + 2, 2)

  worksheet.mergeCells(1, 1, 1, lastColumn)
  const titleCell = worksheet.getCell(1, 1)
  titleCell.value = marketMatrixSpreadsheetText(data.caption)
  titleCell.alignment = { horizontal: 'left', vertical: 'middle' }
  titleCell.fill = { fgColor: { argb: workbookColors.deep }, pattern: 'solid', type: 'pattern' }
  titleCell.font = { bold: true, color: { argb: workbookColors.white }, size: 16 }
  worksheet.getRow(1).height = 28

  worksheet.mergeCells(2, 1, 2, lastColumn)
  const contextCell = worksheet.getCell(2, 1)
  contextCell.value = `${viewLabels[data.view]} · ${data.venues.length} venues · ${hubs.length} hub columns`
  contextCell.fill = { fgColor: { argb: workbookColors.muted }, pattern: 'solid', type: 'pattern' }
  contextCell.font = { bold: true, color: { argb: workbookColors.deep } }

  worksheet.mergeCells(3, 1, 3, lastColumn)
  worksheet.getCell(3, 1).value =
    `Asset classes: ${filterSummary(data.filters.assetClasses)} | Venue types: ${filterSummary(data.filters.venueTypes)} | Hubs: ${filterSummary(data.filters.hubs)}`
  worksheet.getCell(3, 1).alignment = { vertical: 'middle', wrapText: true }
  worksheet.getCell(3, 1).font = { color: { argb: workbookColors.deep }, italic: true }
  worksheet.getRow(3).height = 30

  let hubColumn = 3
  for (const group of data.groups) {
    if (!group.hubs.length) continue
    const startColumn = hubColumn
    const endColumn = startColumn + group.hubs.length - 1
    if (startColumn !== endColumn) worksheet.mergeCells(5, startColumn, 5, endColumn)
    const groupCell = worksheet.getCell(5, startColumn)
    groupCell.value = marketMatrixSpreadsheetText(group.title)
    applyHeaderCell(groupCell)

    for (const hub of group.hubs) {
      const hubCell = worksheet.getCell(6, hubColumn)
      hubCell.value = marketMatrixSpreadsheetText(hub.title)
      applyHeaderCell(hubCell)
      hubCell.alignment = {
        horizontal: 'center',
        textRotation: 90,
        vertical: 'bottom',
        wrapText: true,
      }
      worksheet.getColumn(hubColumn).width = 8
      hubColumn += 1
    }
  }

  for (const [column, label] of [
    [1, 'Venue type'],
    [2, 'Venue'],
  ] as const) {
    const cell = worksheet.getCell(6, column)
    cell.value = label
    applyHeaderCell(cell)
  }
  worksheet.getColumn(1).width = 22
  worksheet.getColumn(2).width = 30
  worksheet.getRow(5).height = 24
  worksheet.getRow(6).height = 110

  const dataStartRow = 7
  data.venues.forEach((venue, venueIndex) => {
    const row = worksheet.getRow(dataStartRow + venueIndex)
    row.getCell(1).value = marketMatrixSpreadsheetText(venue.venueType.title)
    row.getCell(2).value = marketMatrixSpreadsheetText(venue.title)
    applyDataCell(row.getCell(1))
    applyDataCell(row.getCell(2))
    row.getCell(1).font = { bold: true, color: { argb: workbookColors.deep } }

    hubs.forEach((hub, hubIndex) => {
      const cell = row.getCell(hubIndex + 3)
      const connection = venue.connections[hub.id]
      applyDataCell(cell)
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }

      if (connection && marketMatrixConnectionVisible(connection, data.view)) {
        cell.value = marketMatrixConnectionLabel(connection, data.view)
        cell.fill = {
          fgColor: { argb: connectionFill(connection, data.view) },
          pattern: 'solid',
          type: 'pattern',
        }
      } else {
        cell.value = ''
      }
    })
  })

  worksheet.autoFilter = {
    from: { column: 1, row: 6 },
    to: { column: lastColumn, row: 6 },
  }
  worksheet.pageSetup = {
    fitToHeight: 0,
    fitToPage: true,
    fitToWidth: 1,
    orientation: 'landscape',
  }

  const about = workbook.addWorksheet('About')
  about.columns = [{ width: 25 }, { width: 70 }]
  about.mergeCells('A1:B1')
  about.getCell('A1').value = 'Trayport Market Matrix export'
  about.getCell('A1').fill = {
    fgColor: { argb: workbookColors.deep },
    pattern: 'solid',
    type: 'pattern',
  }
  about.getCell('A1').font = { bold: true, color: { argb: workbookColors.white }, size: 16 }
  about.getRow(1).height = 28

  const metadata = [
    ['Connectivity view', viewLabels[data.view]],
    ['Generated', generatedAt.toISOString()],
    ['Asset classes', filterSummary(data.filters.assetClasses)],
    ['Venue types', filterSummary(data.filters.venueTypes)],
    ['Hubs', filterSummary(data.filters.hubs)],
  ]
  metadata.forEach(([label, value], index) => {
    const row = about.getRow(index + 3)
    row.getCell(1).value = label
    row.getCell(1).font = { bold: true, color: { argb: workbookColors.deep } }
    row.getCell(2).value = marketMatrixSpreadsheetText(value || '')
  })

  about.getCell('A10').value = 'Legend'
  about.getCell('A10').font = { bold: true, color: { argb: workbookColors.deep }, size: 13 }
  const legend: Array<[string, string, string]> = [
    ['Joule', 'Available through Joule', workbookColors.joule],
    ['autoTRADER', 'Available through autoTRADER', workbookColors.autoTrader],
    ['Joule and autoTRADER', 'Available through both products', workbookColors.combined],
  ]
  legend.forEach(([label, meaning, fill], index) => {
    const row = about.getRow(index + 11)
    row.getCell(1).value = label
    row.getCell(1).fill = { fgColor: { argb: fill }, pattern: 'solid', type: 'pattern' }
    row.getCell(2).value = meaning
    applyDataCell(row.getCell(1))
    applyDataCell(row.getCell(2))
  })
  about.getCell('A16').value = 'Export scope'
  about.getCell('A16').font = { bold: true, color: { argb: workbookColors.deep } }
  about.getCell('B16').value =
    'This workbook contains the connectivity view and filters selected when it was downloaded.'
  about.getCell('B16').alignment = { wrapText: true }

  return workbook
}

export const downloadMarketMatrixXLSX = async (
  data: MarketMatrixExportData,
  generatedAt = new Date(),
): Promise<void> => {
  const { Workbook } = await import('exceljs')
  const workbook = createMarketMatrixWorkbook(Workbook, data, generatedAt)
  const buffer = await workbook.xlsx.writeBuffer()
  const bytes = new Uint8Array(buffer)

  triggerBrowserDownload(
    new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    marketMatrixXLSXFilename(data.view, generatedAt),
  )
}
