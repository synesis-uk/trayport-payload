import { parse } from 'csv-parse/sync'

import {
  MARKET_DATA_IMPORT_MAX_CELLS,
  MARKET_DATA_IMPORT_MAX_COLUMNS,
  MARKET_DATA_IMPORT_MAX_ISSUES,
  MARKET_DATA_IMPORT_MAX_ROWS,
  MARKET_DATA_IMPORT_PREVIEW_ROWS,
} from './constants'
import type {
  ManagedMarketAssetClass,
  ManagedMarketDataCatalog,
  ManagedMarketHub,
  MarketDataImportReport,
  MarketDataImportRow,
  MarketDataImportStats,
  ParseMarketDataImportOptions,
} from './types'

type CSVRows = string[][]
type ResolvedEntity<T> =
  { entity: T; state: 'resolved' } | { candidates: T[]; state: 'ambiguous' } | { state: 'missing' }

type ResolutionIndex<T> = Map<string, T[]>

const MONTHS = new Map(
  ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map(
    (month, index) => [month, index + 1],
  ),
)

const emptyStats = (): MarketDataImportStats => ({
  assetClasses: [],
  columns: 0,
  ignoredEmptyOrDash: 0,
  ignoredUnknownTradeTypeColumns: 0,
  matchedHubs: [],
  missingExpectedHubs: [],
  numericCells: 0,
  periodEnd: null,
  periodStart: null,
  rowsData: 0,
  rowsTotal: 0,
  rowWidthMismatches: 0,
  unknownTradeTypes: [],
  years: [],
})

const normalizeSourceLabel = (value: unknown): string =>
  String(value ?? '')
    .replace(/^\uFEFF/u, '')
    .replace(/\u00A0/gu, ' ')
    .trim()
    .toLocaleLowerCase('en-GB')
    .replace(/\s+/gu, ' ')

const appendIssue = (issues: string[], message: string): void => {
  if (issues.length < MARKET_DATA_IMPORT_MAX_ISSUES && !issues.includes(message)) {
    issues.push(message)
  }
}

const buildResolutionIndex = <T extends { aliases: string[]; key: string; title: string }>(
  entities: T[],
): ResolutionIndex<T> => {
  const index: ResolutionIndex<T> = new Map()
  for (const entity of entities) {
    const labels = new Set([entity.key, entity.title, ...entity.aliases])
    for (const label of labels) {
      const normalized = normalizeSourceLabel(label)
      if (!normalized) continue
      const matches = index.get(normalized) || []
      if (!matches.some(({ key }) => key === entity.key)) matches.push(entity)
      index.set(normalized, matches)
    }
  }
  return index
}

const resolveEntity = <T>(value: unknown, index: ResolutionIndex<T>): ResolvedEntity<T> => {
  const matches = index.get(normalizeSourceLabel(value)) || []
  if (!matches.length) return { state: 'missing' }
  if (matches.length > 1) return { candidates: matches, state: 'ambiguous' }
  return { entity: matches[0]!, state: 'resolved' }
}

const ambiguousCatalogIssues = (catalog: ManagedMarketDataCatalog, errors: string[]): void => {
  const inspect = <T extends { aliases: string[]; key: string; title: string }>(
    label: string,
    entities: T[],
  ) => {
    for (const [sourceLabel, matches] of buildResolutionIndex(entities)) {
      if (matches.length < 2) continue
      appendIssue(
        errors,
        `The managed ${label} alias "${sourceLabel}" is ambiguous: ${matches
          .map(({ title }) => title)
          .sort((left, right) => left.localeCompare(right))
          .join(', ')}.`,
      )
    }
  }

  inspect('asset-class', catalog.assetClasses)
  inspect('hub', catalog.hubs)
}

const parseCSV = (csv: Buffer | string): CSVRows => {
  const rows = parse(csv, {
    bom: true,
    relax_column_count: true,
    skip_empty_lines: false,
  }) as unknown[][]

  if (rows.length > MARKET_DATA_IMPORT_MAX_ROWS) {
    throw new Error(`CSV exceeds the ${MARKET_DATA_IMPORT_MAX_ROWS.toLocaleString()} row limit.`)
  }

  const normalized = rows.map((row) => row.map((cell) => String(cell ?? '')))
  const columns = normalized.reduce((maximum, row) => Math.max(maximum, row.length), 0)
  const cells = normalized.reduce((total, row) => total + row.length, 0)
  if (columns > MARKET_DATA_IMPORT_MAX_COLUMNS) {
    throw new Error(`CSV exceeds the ${MARKET_DATA_IMPORT_MAX_COLUMNS} column limit.`)
  }
  if (cells > MARKET_DATA_IMPORT_MAX_CELLS) {
    throw new Error(`CSV exceeds the ${MARKET_DATA_IMPORT_MAX_CELLS.toLocaleString()} cell limit.`)
  }
  return normalized
}

const parseNumber = (rawValue: unknown): number | null | 'invalid' => {
  const source = String(rawValue ?? '')
    .replace(/\u00A0/gu, ' ')
    .trim()
  if (!source || /^[\-–—]\s*$/u.test(source)) return null
  const normalized = source.replace(/[\s,]/gu, '')
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/u.test(normalized)) return 'invalid'
  const value = Number(normalized)
  return Number.isFinite(value) ? value : 'invalid'
}

const parseMonthYear = (rawValue: unknown): { month: number; year: number } | null => {
  const value = String(rawValue ?? '')
    .replace(/^\uFEFF/u, '')
    .trim()
  const match = /^([A-Za-z]{3})-(\d{2}|\d{4})$/u.exec(value)
  if (!match) return null
  const month = MONTHS.get(match[1]!.toLocaleLowerCase('en-GB'))
  if (!month) return null
  const rawYear = Number(match[2])
  const year = match[2]!.length === 2 ? 2000 + rawYear : rawYear
  return year >= 2000 && year <= 2100 ? { month, year } : null
}

const parsePriceDate = (rawValue: unknown): { month: number; year: number } | null => {
  const monthYear = parseMonthYear(rawValue)
  if (monthYear) return monthYear

  const value = String(rawValue ?? '')
    .replace(/^\uFEFF/u, '')
    .trim()
  let match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/u.exec(value)
  if (match) {
    const month = Number(match[2])
    const year = Number(match[3])
    return month >= 1 && month <= 12 && year >= 2000 && year <= 2100 ? { month, year } : null
  }

  match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/u.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  return month >= 1 && month <= 12 && year >= 2000 && year <= 2100 ? { month, year } : null
}

const periodKey = ({ month, year }: Pick<MarketDataImportRow, 'month' | 'year'>): string =>
  `${year}-${String(month).padStart(2, '0')}`

const sortedUnique = <T extends number | string>(values: Iterable<T>): T[] =>
  [...new Set(values)].sort((left, right) =>
    typeof left === 'number' && typeof right === 'number'
      ? left - right
      : String(left).localeCompare(String(right)),
  )

const reportFrom = ({
  errors,
  forceableMissingCoverage,
  importType,
  rows,
  stats,
  warnings,
}: {
  errors: string[]
  forceableMissingCoverage: boolean
  importType: MarketDataImportReport['importType']
  rows: MarketDataImportRow[]
  stats: MarketDataImportStats
  warnings: string[]
}): MarketDataImportReport => ({
  canForceMissingHubs: forceableMissingCoverage && errors.length === 1,
  errors,
  importType,
  preview: rows.slice(0, MARKET_DATA_IMPORT_PREVIEW_ROWS),
  rows,
  stats,
  valid: errors.length === 0,
  warnings,
})

const selectedAssetClass = (
  catalog: ManagedMarketDataCatalog,
  id: number | string | null | undefined,
): ManagedMarketAssetClass | null =>
  id === null || id === undefined
    ? null
    : catalog.assetClasses.find((item) => String(item.id) === String(id)) || null

const expectedHubs = (
  catalog: ManagedMarketDataCatalog,
  assetClassKey: string,
): ManagedMarketHub[] =>
  catalog.hubs.filter(({ assetClassKeys }) => assetClassKeys.includes(assetClassKey))

type VolumeMetric = 'exchangeTraded' | 'otcBilateral' | 'otcCleared'

const normalizeTradeType = (value: unknown): VolumeMetric | 'period' | 'total' | 'unknown' => {
  const normalized = normalizeSourceLabel(value).replace(/[ _-]+/gu, '')
  if (!normalized || normalized === 'period') return 'period'
  if (normalized === 'total') return 'total'
  if (normalized === 'otcbilateral') return 'otcBilateral'
  if (normalized === 'otccleared') return 'otcCleared'
  if (normalized === 'exchangetraded') return 'exchangeTraded'
  return 'unknown'
}

const parseVolumeCSV = (
  rows: CSVRows,
  catalog: ManagedMarketDataCatalog,
  selectedAssetClassID: number | string | null | undefined,
): MarketDataImportReport => {
  const errors: string[] = []
  const warnings: string[] = []
  ambiguousCatalogIssues(catalog, errors)
  const stats = emptyStats()
  stats.rowsTotal = rows.length
  stats.columns = rows.reduce((maximum, row) => Math.max(maximum, row.length), 0)

  const assetClass = selectedAssetClass(catalog, selectedAssetClassID)
  if (!assetClass) {
    appendIssue(errors, 'Select a managed asset class before validating a volume CSV.')
  }
  if (rows.length < 3) appendIssue(errors, 'Volume CSV must contain two header rows and data.')
  if (!assetClass || rows.length < 2) {
    return reportFrom({
      errors,
      forceableMissingCoverage: false,
      importType: 'volume',
      rows: [],
      stats,
      warnings,
    })
  }

  const hubIndex = buildResolutionIndex(catalog.hubs)
  const hubNames = rows[0] || []
  const tradeTypes = rows[1] || []
  const headerColumns = Math.max(hubNames.length, tradeTypes.length)
  const columnMap = new Map<number, { hub: ManagedMarketHub; metric: VolumeMetric }>()
  const mappedMetrics = new Set<string>()
  const matchedHubs = new Map<string, ManagedMarketHub>()
  const unmatchedHubs = new Set<string>()
  const unknownTradeTypes = new Set<string>()

  for (let column = 1; column < headerColumns; column += 1) {
    const rawTradeType = tradeTypes[column] || ''
    const metric = normalizeTradeType(rawTradeType)
    if (metric === 'period' || metric === 'total') continue
    if (metric === 'unknown') {
      const label = normalizeSourceLabel(rawTradeType) || '(blank)'
      unknownTradeTypes.add(label)
      stats.ignoredUnknownTradeTypeColumns += 1
      continue
    }

    const rawHub = hubNames[column] || ''
    const resolution = resolveEntity(rawHub, hubIndex)
    if (resolution.state === 'missing') {
      unmatchedHubs.add(rawHub.trim() || `(column ${column + 1})`)
      continue
    }
    if (resolution.state === 'ambiguous') {
      appendIssue(
        errors,
        `Column ${column + 1}: hub "${rawHub}" matches more than one managed hub.`,
      )
      continue
    }
    if (!resolution.entity.assetClassKeys.includes(assetClass.key)) {
      appendIssue(
        errors,
        `Column ${column + 1}: ${resolution.entity.title} is not assigned to ${assetClass.title}.`,
      )
      continue
    }

    const mappingKey = `${resolution.entity.key}:${metric}`
    if (mappedMetrics.has(mappingKey)) {
      appendIssue(
        errors,
        `The CSV maps more than one ${metric} column to ${resolution.entity.title}.`,
      )
      continue
    }
    mappedMetrics.add(mappingKey)
    matchedHubs.set(resolution.entity.key, resolution.entity)
    columnMap.set(column, { hub: resolution.entity, metric })
  }

  if (unmatchedHubs.size) {
    appendIssue(
      errors,
      `These hub labels are not managed in Payload: ${sortedUnique(unmatchedHubs).join(', ')}.`,
    )
  }
  if (unknownTradeTypes.size) {
    appendIssue(
      warnings,
      `Unknown trade type columns were ignored: ${sortedUnique(unknownTradeTypes).join(', ')}.`,
    )
  }

  const missingHubs = expectedHubs(catalog, assetClass.key).filter(
    ({ key }) => !matchedHubs.has(key),
  )
  const missingCoverageMessage = missingHubs.length
    ? `CSV is missing hub columns for ${assetClass.title}: ${missingHubs
        .map(({ title }) => title)
        .sort((left, right) => left.localeCompare(right))
        .join(', ')}.`
    : null
  if (missingCoverageMessage) appendIssue(errors, missingCoverageMessage)

  const parsedRows = new Map<string, MarketDataImportRow>()
  for (let rowIndex = 2; rowIndex < rows.length; rowIndex += 1) {
    const csvRow = rows[rowIndex] || []
    if (csvRow.every((value) => !String(value).trim())) continue
    stats.rowsData += 1
    if (csvRow.length !== headerColumns) stats.rowWidthMismatches += 1
    const date = parseMonthYear(csvRow[0])
    if (!date) {
      appendIssue(
        errors,
        `Line ${rowIndex + 1}: invalid month "${String(csvRow[0] ?? '').trim()}"; use Jan-25.`,
      )
      continue
    }

    for (const [column, mapping] of columnMap) {
      const value = parseNumber(csvRow[column])
      if (value === null) {
        stats.ignoredEmptyOrDash += 1
        continue
      }
      if (value === 'invalid') {
        appendIssue(
          errors,
          `Line ${rowIndex + 1}: "${String(csvRow[column] ?? '').trim()}" is not numeric for ${mapping.hub.title} (${mapping.metric}).`,
        )
        continue
      }

      const key = `${assetClass.key}\u0000${mapping.hub.key}\u0000${date.year}\u0000${date.month}`
      const parsed = parsedRows.get(key) || {
        assetClassKey: assetClass.key,
        hubKey: mapping.hub.key,
        month: date.month,
        sourceLine: rowIndex + 1,
        year: date.year,
      }
      if (parsed[mapping.metric] !== undefined) {
        appendIssue(
          errors,
          `Line ${rowIndex + 1}: duplicate ${mapping.metric} value for ${mapping.hub.title} in ${periodKey(date)}.`,
        )
        continue
      }
      parsed[mapping.metric] = value
      parsedRows.set(key, parsed)
      stats.numericCells += 1
    }
  }

  const importedRows = [...parsedRows.values()].sort(
    (left, right) =>
      left.year - right.year || left.month - right.month || left.hubKey.localeCompare(right.hubKey),
  )
  if (!stats.numericCells) appendIssue(errors, 'No importable numeric volume values were found.')
  if (stats.rowWidthMismatches) {
    appendIssue(
      warnings,
      `${stats.rowWidthMismatches} data row(s) had a different column count than the header.`,
    )
  }

  const periods = sortedUnique(importedRows.map(periodKey))
  stats.assetClasses = [assetClass.title]
  stats.matchedHubs = sortedUnique([...matchedHubs.values()].map(({ title }) => title))
  stats.missingExpectedHubs = missingHubs
    .map(({ title }) => title)
    .sort((left, right) => left.localeCompare(right))
  stats.unknownTradeTypes = sortedUnique(unknownTradeTypes)
  stats.years = sortedUnique(importedRows.map(({ year }) => year))
  stats.periodStart = periods[0] || null
  stats.periodEnd = periods.at(-1) || null

  return reportFrom({
    errors,
    forceableMissingCoverage: Boolean(
      missingCoverageMessage && errors.length === 1 && errors[0] === missingCoverageMessage,
    ),
    importType: 'volume',
    rows: importedRows,
    stats,
    warnings,
  })
}

const nonEmptyCellCount = (row: string[]): number =>
  row.filter((value) => normalizeSourceLabel(value)).length

const parsePriceCSV = (
  rows: CSVRows,
  catalog: ManagedMarketDataCatalog,
  selectedAssetClassID: number | string | null | undefined,
): MarketDataImportReport => {
  const errors: string[] = []
  const warnings: string[] = []
  ambiguousCatalogIssues(catalog, errors)
  const stats = emptyStats()
  stats.rowsTotal = rows.length
  stats.columns = rows.reduce((maximum, row) => Math.max(maximum, row.length), 0)
  const assetClassIndex = buildResolutionIndex(catalog.assetClasses)
  const hubIndex = buildResolutionIndex(catalog.hubs)
  let currentAssetClass = selectedAssetClass(catalog, selectedAssetClassID)
  if (selectedAssetClassID !== null && selectedAssetClassID !== undefined && !currentAssetClass) {
    appendIssue(errors, 'The selected price asset class is not available in the managed catalog.')
  }
  let dateColumns = new Map<number, { month: number; year: number }>()
  const parsedRows = new Map<string, MarketDataImportRow>()
  const matchedByAssetClass = new Map<string, Set<string>>()
  const importedAssetClasses = new Map<string, ManagedMarketAssetClass>()
  const matchedHubs = new Map<string, ManagedMarketHub>()

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || []
    const count = nonEmptyCellCount(row)
    if (!count) {
      dateColumns = new Map()
      continue
    }
    const firstCell = String(row[0] ?? '')
      .replace(/^\uFEFF/u, '')
      .trim()
    const firstKey = normalizeSourceLabel(firstCell)

    if (firstKey !== 'prices' && count === 1) {
      const resolution = resolveEntity(firstCell, assetClassIndex)
      if (resolution.state === 'resolved') {
        currentAssetClass = resolution.entity
        importedAssetClasses.set(currentAssetClass.key, currentAssetClass)
        dateColumns = new Map()
      } else if (resolution.state === 'ambiguous') {
        appendIssue(errors, `Line ${rowIndex + 1}: asset class "${firstCell}" is ambiguous.`)
      } else {
        appendIssue(errors, `Line ${rowIndex + 1}: asset class "${firstCell}" is not managed.`)
      }
      continue
    }

    if (firstKey === 'prices') {
      dateColumns = new Map()
      if (!currentAssetClass) {
        appendIssue(
          errors,
          `Line ${rowIndex + 1}: price header needs a selected asset class or an asset-class block row.`,
        )
        continue
      }
      importedAssetClasses.set(currentAssetClass.key, currentAssetClass)
      for (let column = 1; column < row.length; column += 1) {
        const rawDate = String(row[column] ?? '').trim()
        if (!rawDate) continue
        const date = parsePriceDate(rawDate)
        if (!date) {
          if (dateColumns.size) continue
          appendIssue(errors, `Line ${rowIndex + 1}: invalid price date "${rawDate}".`)
          continue
        }
        const duplicate = [...dateColumns.values()].some(
          (candidate) => candidate.year === date.year && candidate.month === date.month,
        )
        if (duplicate) {
          appendIssue(errors, `Line ${rowIndex + 1}: duplicate price month ${periodKey(date)}.`)
          continue
        }
        dateColumns.set(column, date)
      }
      if (!dateColumns.size) {
        appendIssue(errors, `Line ${rowIndex + 1}: no importable price date columns were found.`)
      }
      continue
    }

    if (!dateColumns.size) {
      appendIssue(warnings, `Line ${rowIndex + 1}: ignored row before a price header.`)
      continue
    }
    if (!currentAssetClass) {
      appendIssue(errors, `Line ${rowIndex + 1}: price row has no resolved asset class.`)
      continue
    }

    stats.rowsData += 1
    const lastDateColumn = Math.max(...dateColumns.keys())
    if (row.length <= lastDateColumn) stats.rowWidthMismatches += 1
    if (!firstCell) continue
    const resolution = resolveEntity(firstCell, hubIndex)
    if (resolution.state === 'missing') {
      appendIssue(errors, `Line ${rowIndex + 1}: hub "${firstCell}" is not managed in Payload.`)
      continue
    }
    if (resolution.state === 'ambiguous') {
      appendIssue(errors, `Line ${rowIndex + 1}: hub "${firstCell}" is ambiguous.`)
      continue
    }
    if (!resolution.entity.assetClassKeys.includes(currentAssetClass.key)) {
      appendIssue(
        errors,
        `Line ${rowIndex + 1}: ${resolution.entity.title} is not assigned to ${currentAssetClass.title}.`,
      )
      continue
    }

    const matched = matchedByAssetClass.get(currentAssetClass.key) || new Set<string>()
    matched.add(resolution.entity.key)
    matchedByAssetClass.set(currentAssetClass.key, matched)
    matchedHubs.set(resolution.entity.key, resolution.entity)

    for (const [column, date] of dateColumns) {
      const value = parseNumber(row[column])
      if (value === null) {
        stats.ignoredEmptyOrDash += 1
        continue
      }
      if (value === 'invalid') {
        appendIssue(
          errors,
          `Line ${rowIndex + 1}: "${String(row[column] ?? '').trim()}" is not a numeric price for ${resolution.entity.title}.`,
        )
        continue
      }
      const key = `${currentAssetClass.key}\u0000${resolution.entity.key}\u0000${date.year}\u0000${date.month}`
      if (parsedRows.has(key)) {
        appendIssue(
          errors,
          `Line ${rowIndex + 1}: duplicate price for ${resolution.entity.title} in ${periodKey(date)}.`,
        )
        continue
      }
      parsedRows.set(key, {
        assetClassKey: currentAssetClass.key,
        hubKey: resolution.entity.key,
        month: date.month,
        price: value,
        sourceLine: rowIndex + 1,
        year: date.year,
      })
      stats.numericCells += 1
    }
  }

  const importedRows = [...parsedRows.values()].sort(
    (left, right) =>
      left.assetClassKey.localeCompare(right.assetClassKey) ||
      left.year - right.year ||
      left.month - right.month ||
      left.hubKey.localeCompare(right.hubKey),
  )
  const missingExpectedHubs: string[] = []
  for (const assetClass of importedAssetClasses.values()) {
    const matched = matchedByAssetClass.get(assetClass.key) || new Set<string>()
    for (const hub of expectedHubs(catalog, assetClass.key)) {
      if (!matched.has(hub.key)) missingExpectedHubs.push(`${assetClass.title}: ${hub.title}`)
    }
  }
  if (missingExpectedHubs.length) {
    appendIssue(
      warnings,
      `Price CSV does not include every managed hub: ${sortedUnique(missingExpectedHubs).join(', ')}.`,
    )
  }
  if (!stats.numericCells) appendIssue(errors, 'No importable numeric price values were found.')
  if (stats.rowWidthMismatches) {
    appendIssue(
      warnings,
      `${stats.rowWidthMismatches} price row(s) had fewer columns than the price header.`,
    )
  }

  const periods = sortedUnique(importedRows.map(periodKey))
  stats.assetClasses = sortedUnique([...importedAssetClasses.values()].map(({ title }) => title))
  stats.matchedHubs = sortedUnique([...matchedHubs.values()].map(({ title }) => title))
  stats.missingExpectedHubs = sortedUnique(missingExpectedHubs)
  stats.years = sortedUnique(importedRows.map(({ year }) => year))
  stats.periodStart = periods[0] || null
  stats.periodEnd = periods.at(-1) || null

  return reportFrom({
    errors,
    forceableMissingCoverage: false,
    importType: 'price',
    rows: importedRows,
    stats,
    warnings,
  })
}

export const parseMarketDataImport = ({
  catalog,
  csv,
  importType,
  selectedAssetClassID,
}: ParseMarketDataImportOptions): MarketDataImportReport => {
  try {
    const rows = parseCSV(csv)
    return importType === 'volume'
      ? parseVolumeCSV(rows, catalog, selectedAssetClassID)
      : parsePriceCSV(rows, catalog, selectedAssetClassID)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CSV could not be parsed.'
    return reportFrom({
      errors: [message],
      forceableMissingCoverage: false,
      importType,
      rows: [],
      stats: emptyStats(),
      warnings: [],
    })
  }
}

export const marketDataImportParserContract = {
  formats: ['legacy-volume-two-row-header', 'legacy-price-blocks'],
  maxCells: MARKET_DATA_IMPORT_MAX_CELLS,
  maxColumns: MARKET_DATA_IMPORT_MAX_COLUMNS,
  maxIssuesPerKind: MARKET_DATA_IMPORT_MAX_ISSUES,
  maxRows: MARKET_DATA_IMPORT_MAX_ROWS,
  negativePrices: true,
  omittedCellsPreserveExistingMetrics: true,
  previewRows: MARKET_DATA_IMPORT_PREVIEW_ROWS,
  resolution: 'payload-managed-keys-titles-and-aliases',
} as const
