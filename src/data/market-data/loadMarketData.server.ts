import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import { Pool } from 'pg'

import type { MarketDataDisplayInterval, MarketDataQuery, MarketDataResult } from './types'

export type {
  MarketDataDisplayInterval,
  MarketDataQuery,
  MarketDataResult,
  MarketDataSeries,
  MarketDataSeriesDimension,
  MarketDataType,
} from './types'

export const MARKET_DATA_CACHE_TAG = 'market-volume'
export const MARKET_DATA_CACHE_REVALIDATE_SECONDS = 300
export const MARKET_DATA_CACHE_LIFE = {
  expire: 3600,
  revalidate: MARKET_DATA_CACHE_REVALIDATE_SECONDS,
  stale: MARKET_DATA_CACHE_REVALIDATE_SECONDS,
} as const
export const MARKET_DATA_POOL_TIMEOUTS = {
  connectionTimeoutMillis: 3_000,
  query_timeout: 5_000,
  statement_timeout: 4_000,
} as const

type MarketDataDatabaseRow = {
  exchange_traded?: number | string | null
  hub_legacy_id?: number | string | null
  otc_bilateral?: number | string | null
  otc_cleared?: number | string | null
  period_key: number | string
  value?: number | string | null
}

type NormalizedMarketDataQuery = Omit<
  MarketDataQuery,
  | 'excludedHubLegacyIDs'
  | 'fromQuarter'
  | 'fromYear'
  | 'includedHubLegacyIDs'
  | 'limit'
  | 'toQuarter'
  | 'toYear'
> & {
  excludedHubLegacyIDs: number[]
  fromPeriod: number
  includedHubLegacyIDs: number[]
  limit: number
  toPeriod: number
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const PERIOD_EXPRESSIONS = {
  month: '(year::int * 100 + month::int)',
  quarter: '(year::int * 10 + ceil(month / 3.0)::int)',
  year: 'year::int',
} as const satisfies Record<MarketDataDisplayInterval, string>

const EXECUTION_SERIES = [
  { column: 'otc_bilateral', key: 'otcBilateral', label: 'OTC bilateral' },
  { column: 'otc_cleared', key: 'otcCleared', label: 'OTC cleared' },
  { column: 'exchange_traded', key: 'exchangeTraded', label: 'Exchange traded' },
] as const

const globalWithMarketPool = globalThis as typeof globalThis & {
  trayportMarketPool?: Pool
}

const marketPool = () => {
  if (!process.env.DATABASE_URL) return null
  if (!globalWithMarketPool.trayportMarketPool) {
    globalWithMarketPool.trayportMarketPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 4,
      ...MARKET_DATA_POOL_TIMEOUTS,
    })
  }
  return globalWithMarketPool.trayportMarketPool
}

const normalizedLegacyIDs = (
  values: readonly number[] | null | undefined,
  sort = false,
): number[] => {
  const normalized = [
    ...new Set(
      (values || []).filter(
        (value): value is number => Number.isInteger(value) && Number(value) > 0,
      ),
    ),
  ]
  return sort ? normalized.sort((left, right) => left - right) : normalized
}

const normalizedQuarter = (value: number | null | undefined, fallback: number): number =>
  Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 4 ? Number(value) : fallback

const normalizedYear = (value: number | null | undefined): number | null =>
  Number.isInteger(value) && Number(value) > 0 ? Number(value) : null

const normalizeMarketDataQuery = (query: MarketDataQuery): NormalizedMarketDataQuery => {
  const fromYear = normalizedYear(query.fromYear)
  const toYear = normalizedYear(query.toYear)

  return {
    assetClassLegacyID: Number(query.assetClassLegacyID),
    dataType: query.dataType,
    displayInterval: query.displayInterval,
    excludedHubLegacyIDs: normalizedLegacyIDs(query.excludedHubLegacyIDs, true),
    fromPeriod: fromYear ? fromYear * 4 + normalizedQuarter(query.fromQuarter, 1) : 0,
    includedHubLegacyIDs: normalizedLegacyIDs(query.includedHubLegacyIDs),
    limit: Math.min(Math.max(Number(query.limit) || 40, 1), 40),
    seriesDimension: query.seriesDimension,
    toPeriod: toYear ? toYear * 4 + normalizedQuarter(query.toQuarter, 4) : 99999,
  }
}

const emptyMarketDataResult = (
  query: Pick<MarketDataQuery, 'dataType' | 'displayInterval' | 'seriesDimension'>,
  status: MarketDataResult['status'] = 'empty',
): MarketDataResult => ({
  categories: [],
  dataType: query.dataType,
  displayInterval: query.displayInterval,
  series: [],
  seriesDimension: query.seriesDimension,
  status,
})

const queryMarketData = async (
  query: NormalizedMarketDataQuery,
): Promise<MarketDataDatabaseRow[]> => {
  const pool = marketPool()
  if (!pool) {
    throw Object.assign(new Error('Market data database is not configured.'), {
      code: 'MARKET_DATABASE_UNCONFIGURED',
    })
  }

  const periodExpression = PERIOD_EXPRESSIONS[query.displayInterval]
  const metricPredicate = query.dataType === 'price' ? 'AND price IS NOT NULL' : ''
  const parameters = [
    query.assetClassLegacyID,
    query.fromPeriod,
    query.toPeriod,
    query.includedHubLegacyIDs,
    query.excludedHubLegacyIDs,
    query.limit,
  ]
  const filteredRows = `
      WITH filtered AS (
        SELECT
          hub_legacy_id::int AS hub_legacy_id,
          ${periodExpression} AS period_key,
          otc_bilateral,
          otc_cleared,
          exchange_traded,
          price
        FROM app.market_volume_monthly
        WHERE asset_class_legacy_id = $1
          AND (year::int * 4 + ceil(month / 3.0)::int) BETWEEN $2 AND $3
          AND (cardinality($4::int[]) = 0 OR hub_legacy_id = ANY($4::int[]))
          AND (cardinality($5::int[]) = 0 OR NOT (hub_legacy_id = ANY($5::int[])))
          ${metricPredicate}
      ),
      selected_periods AS (
        SELECT period_key
        FROM filtered
        GROUP BY period_key
        ORDER BY period_key DESC
        LIMIT $6
      )
  `

  if (query.seriesDimension === 'executionType') {
    const result = await pool.query<MarketDataDatabaseRow>(
      `${filteredRows}
        SELECT
          filtered.period_key::int AS period_key,
          coalesce(sum(filtered.otc_bilateral), 0)::float8 AS otc_bilateral,
          coalesce(sum(filtered.otc_cleared), 0)::float8 AS otc_cleared,
          coalesce(sum(filtered.exchange_traded), 0)::float8 AS exchange_traded
        FROM filtered
        INNER JOIN selected_periods USING (period_key)
        GROUP BY filtered.period_key
        ORDER BY filtered.period_key ASC
      `,
      parameters,
    )
    return result.rows
  }

  const valueExpression =
    query.dataType === 'price'
      ? 'avg(filtered.price)::float8'
      : `coalesce(
          sum(
            coalesce(filtered.otc_bilateral, 0)
            + coalesce(filtered.otc_cleared, 0)
            + coalesce(filtered.exchange_traded, 0)
          ),
          0
        )::float8`
  const result = await pool.query<MarketDataDatabaseRow>(
    `${filteredRows}
      SELECT
        filtered.period_key::int AS period_key,
        filtered.hub_legacy_id::int AS hub_legacy_id,
        ${valueExpression} AS value
      FROM filtered
      INNER JOIN selected_periods USING (period_key)
      GROUP BY filtered.period_key, filtered.hub_legacy_id
      ORDER BY filtered.period_key ASC, filtered.hub_legacy_id ASC
    `,
    parameters,
  )
  return result.rows
}

const getCachedMarketData = async (query: NormalizedMarketDataQuery) => {
  'use cache'

  cacheLife(MARKET_DATA_CACHE_LIFE)
  cacheTag(MARKET_DATA_CACHE_TAG, `${MARKET_DATA_CACHE_TAG}:${query.assetClassLegacyID}`)
  return queryMarketData(query)
}

const periodLabel = (periodKey: number, interval: MarketDataDisplayInterval): string => {
  if (interval === 'month') {
    const year = Math.floor(periodKey / 100)
    const month = periodKey % 100
    return month >= 1 && month <= 12 ? `${MONTH_LABELS[month - 1]} ${year}` : String(periodKey)
  }
  if (interval === 'quarter') {
    return `${Math.floor(periodKey / 10)} Q${periodKey % 10}`
  }
  return String(periodKey)
}

const numericValue = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : null
}

const marketDataResultFromRows = (
  query: NormalizedMarketDataQuery,
  rows: MarketDataDatabaseRow[],
): MarketDataResult => {
  const periodKeys = [...new Set(rows.map(({ period_key }) => Number(period_key)))].filter(
    Number.isFinite,
  )
  periodKeys.sort((left, right) => left - right)
  if (!periodKeys.length) return emptyMarketDataResult(query)

  const categories = periodKeys.map((key) => periodLabel(key, query.displayInterval))
  if (query.seriesDimension === 'executionType') {
    const rowsByPeriod = new Map(rows.map((row) => [Number(row.period_key), row]))
    return {
      categories,
      dataType: query.dataType,
      displayInterval: query.displayInterval,
      series: EXECUTION_SERIES.map(({ column, key, label }) => ({
        key,
        label,
        values: periodKeys.map(
          (periodKey) => numericValue(rowsByPeriod.get(periodKey)?.[column]) || 0,
        ),
      })),
      seriesDimension: query.seriesDimension,
      status: 'available',
    }
  }

  const availableHubLegacyIDs = [
    ...new Set(
      rows
        .map(({ hub_legacy_id }) => Number(hub_legacy_id))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  ]
  const hubLegacyIDs = query.includedHubLegacyIDs.length
    ? query.includedHubLegacyIDs.filter((legacyID) => availableHubLegacyIDs.includes(legacyID))
    : availableHubLegacyIDs.sort((left, right) => left - right)
  const valuesByHubAndPeriod = new Map(
    rows.map((row) => [
      `${Number(row.hub_legacy_id)}:${Number(row.period_key)}`,
      numericValue(row.value),
    ]),
  )

  return {
    categories,
    dataType: query.dataType,
    displayInterval: query.displayInterval,
    series: hubLegacyIDs.map((hubLegacyID) => ({
      key: `hub:${hubLegacyID}`,
      values: periodKeys.map(
        (periodKey) =>
          valuesByHubAndPeriod.get(`${hubLegacyID}:${periodKey}`) ??
          (query.dataType === 'volume' ? 0 : null),
      ),
    })),
    seriesDimension: query.seriesDimension,
    status: hubLegacyIDs.length ? 'available' : 'empty',
  }
}

export const loadMarketData = async (input: MarketDataQuery): Promise<MarketDataResult> => {
  const query = normalizeMarketDataQuery(input)
  if (
    !Number.isInteger(query.assetClassLegacyID) ||
    query.assetClassLegacyID <= 0 ||
    query.fromPeriod > query.toPeriod ||
    (query.seriesDimension === 'executionType' && query.dataType !== 'volume')
  ) {
    return emptyMarketDataResult(query)
  }

  try {
    return marketDataResultFromRows(query, await getCachedMarketData(query))
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unknown'
    console.warn('Market data query unavailable.', {
      assetClassLegacyID: query.assetClassLegacyID,
      code,
      dataType: query.dataType,
      displayInterval: query.displayInterval,
      seriesDimension: query.seriesDimension,
      source: 'app.market_volume_monthly',
    })
    return emptyMarketDataResult(query, 'unavailable')
  }
}

export const marketDataLoaderContract = {
  cacheKeyStrategy: 'use-cache-function-with-bounded-query',
  cacheLife: MARKET_DATA_CACHE_LIFE,
  cacheTag: MARKET_DATA_CACHE_TAG,
  failureMode: 'unavailable-result',
  maxPeriodCount: 40,
  poolTimeouts: MARKET_DATA_POOL_TIMEOUTS,
  source: 'app.market_volume_monthly',
  supportedDataTypes: ['volume', 'price'],
  supportedDisplayIntervals: ['month', 'quarter', 'year'],
  supportedSeriesDimensions: ['executionType', 'hub'],
} as const
