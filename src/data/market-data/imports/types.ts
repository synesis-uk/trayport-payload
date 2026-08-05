import type { MarketDataType } from '../types'

export type MarketDataImportStatus =
  'uploaded' | 'validating' | 'invalid' | 'validated' | 'importing' | 'imported' | 'failed'

export type MarketDataImportMetric = 'exchangeTraded' | 'otcBilateral' | 'otcCleared' | 'price'

export type MarketDataImportRow = {
  assetClassKey: string
  exchangeTraded?: number
  hubKey: string
  month: number
  otcBilateral?: number
  otcCleared?: number
  price?: number
  sourceLine: number
  year: number
}

export type ManagedMarketAssetClass = {
  aliases: string[]
  id: number | string
  key: string
  title: string
}

export type ManagedMarketHub = {
  aliases: string[]
  assetClassKeys: string[]
  id: number | string
  key: string
  title: string
}

export type ManagedMarketDataCatalog = {
  assetClasses: ManagedMarketAssetClass[]
  hubs: ManagedMarketHub[]
}

export type MarketDataImportStats = {
  assetClasses: string[]
  columns: number
  ignoredEmptyOrDash: number
  ignoredUnknownTradeTypeColumns: number
  matchedHubs: string[]
  missingExpectedHubs: string[]
  numericCells: number
  periodEnd: string | null
  periodStart: string | null
  rowsData: number
  rowsTotal: number
  rowWidthMismatches: number
  unknownTradeTypes: string[]
  years: number[]
}

export type MarketDataImportReport = {
  canForceMissingHubs: boolean
  errors: string[]
  importType: MarketDataType
  preview: MarketDataImportRow[]
  rows: MarketDataImportRow[]
  stats: MarketDataImportStats
  valid: boolean
  warnings: string[]
}

export type ParseMarketDataImportOptions = {
  catalog: ManagedMarketDataCatalog
  csv: Buffer | string
  importType: MarketDataType
  selectedAssetClassID?: number | string | null
}

export type MarketDataImportResult = {
  created: number
  importedRows: number
  unchanged: number
  updated: number
}
