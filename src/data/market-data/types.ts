export type MarketDataType = 'price' | 'volume'

export type MarketDataSeriesDimension = 'executionType' | 'hub'

export type MarketDataDisplayInterval = 'month' | 'quarter' | 'year'

export type MarketDataSeries = {
  key: string
  label?: string
  values: Array<number | null>
}

export type MarketDataResult = {
  categories: string[]
  dataType: MarketDataType
  displayInterval: MarketDataDisplayInterval
  series: MarketDataSeries[]
  seriesDimension: MarketDataSeriesDimension
  status: 'available' | 'empty' | 'unavailable'
}

export type MarketDataQuery = {
  assetClassLegacyID: number
  dataType: MarketDataType
  displayInterval: MarketDataDisplayInterval
  excludedHubLegacyIDs?: readonly number[] | null
  fromQuarter?: number | null
  fromYear?: number | null
  includedHubLegacyIDs?: readonly number[] | null
  limit?: number
  seriesDimension: MarketDataSeriesDimension
  toQuarter?: number | null
  toYear?: number | null
}
