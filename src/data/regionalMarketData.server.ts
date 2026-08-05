import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import { Pool } from 'pg'

import { MARKET_DATA_CACHE_LIFE, MARKET_DATA_CACHE_TAG } from './market-data/loadMarketData.server'

export type RegionalMarketDataInterval = 'month' | 'quarter' | 'year'

export interface RegionalMarketDataResult {
  assetClassKey: string
  interval: RegionalMarketDataInterval
  period: string
  periods: Array<{ key: string; label: string }>
  status: 'available' | 'empty' | 'unavailable'
  summaries: Record<
    string,
    {
      changeLabel: 'MoM' | 'QoQ' | 'YoY'
      changePercent: number | null
      label: string
      value: number | null
    }
  >
}

export const REGIONAL_MARKET_VOLUME_DIVISOR = 1_000_000

export const regionalMarketVolumeInDisplayUnits = (
  value: number | string | null,
): number | null => {
  if (value === null) return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric / REGIONAL_MARKET_VOLUME_DIVISOR : null
}

const PERIOD_EXPRESSIONS = {
  month: '(year::int * 100 + month::int)',
  quarter: '(year::int * 10 + ceil(month / 3.0)::int)',
  year: 'year::int',
} as const satisfies Record<RegionalMarketDataInterval, string>

const globalWithRegionalMarketPool = globalThis as typeof globalThis & {
  trayportRegionalMarketPool?: Pool
}

const regionalMarketPool = () => {
  if (!process.env.DATABASE_URL) return null
  if (!globalWithRegionalMarketPool.trayportRegionalMarketPool) {
    globalWithRegionalMarketPool.trayportRegionalMarketPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 3_000,
      max: 3,
      query_timeout: 5_000,
      statement_timeout: 4_000,
    })
  }
  return globalWithRegionalMarketPool.trayportRegionalMarketPool
}

const periodLabel = (key: number, interval: RegionalMarketDataInterval): string => {
  if (interval === 'year') return String(key)
  if (interval === 'quarter') return `${Math.floor(key / 10)} Q${key % 10}`
  const year = Math.floor(key / 100)
  const month = key % 100
  const label = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2020, Math.max(month - 1, 0), 1)),
  )
  return `${label} ${year}`
}

const previousPeriod = (key: number, interval: RegionalMarketDataInterval): number => {
  if (interval === 'year') return key - 1
  if (interval === 'quarter') {
    const year = Math.floor(key / 10)
    const quarter = key % 10
    return quarter > 1 ? year * 10 + quarter - 1 : (year - 1) * 10 + 4
  }
  const year = Math.floor(key / 100)
  const month = key % 100
  return month > 1 ? year * 100 + month - 1 : (year - 1) * 100 + 12
}

const emptyResult = (
  assetClassKey: string,
  interval: RegionalMarketDataInterval,
  status: RegionalMarketDataResult['status'],
): RegionalMarketDataResult => ({
  assetClassKey,
  interval,
  period: '',
  periods: [],
  status,
  summaries: {},
})

const queryRegionalMarketData = async (
  assetClassKey: string,
  interval: RegionalMarketDataInterval,
  requestedPeriod: string,
): Promise<RegionalMarketDataResult> => {
  const pool = regionalMarketPool()
  if (!pool) return emptyResult(assetClassKey, interval, 'unavailable')
  const expression = PERIOD_EXPRESSIONS[interval]
  const periodRows = await pool.query<{ period_key: number | string }>(
    `
      select distinct ${expression} as period_key
      from app.market_volume_monthly
      where asset_class_key = $1
        and (otc_bilateral is not null or otc_cleared is not null or exchange_traded is not null)
      order by period_key desc
      limit 80
    `,
    [assetClassKey],
  )
  const periodKeys = periodRows.rows
    .map(({ period_key }) => Number(period_key))
    .filter(Number.isFinite)
  if (!periodKeys.length) return emptyResult(assetClassKey, interval, 'empty')
  const requested = Number(requestedPeriod)
  const selectedPeriod = periodKeys.includes(requested) ? requested : periodKeys[0]
  const previous = previousPeriod(selectedPeriod, interval)
  const dataRows = await pool.query<{
    current_value: number | string | null
    hub_key: string
    previous_value: number | string | null
  }>(
    `
      with aggregated as (
        select
          hub_key,
          ${expression} as period_key,
          sum(
            coalesce(otc_bilateral, 0)
            + coalesce(otc_cleared, 0)
            + coalesce(exchange_traded, 0)
          )::float8 as value
        from app.market_volume_monthly
        where asset_class_key = $1
          and ${expression} in ($2, $3)
        group by hub_key, period_key
      )
      select
        hub_key,
        max(value) filter (where period_key = $2)::float8 as current_value,
        max(value) filter (where period_key = $3)::float8 as previous_value
      from aggregated
      group by hub_key
      order by hub_key
    `,
    [assetClassKey, selectedPeriod, previous],
  )
  const label = periodLabel(selectedPeriod, interval)
  const changeLabel: 'MoM' | 'QoQ' | 'YoY' =
    interval === 'month' ? 'MoM' : interval === 'quarter' ? 'QoQ' : 'YoY'
  const summaries = Object.fromEntries(
    dataRows.rows.map((row) => {
      const value = regionalMarketVolumeInDisplayUnits(row.current_value)
      const previousValue = regionalMarketVolumeInDisplayUnits(row.previous_value)
      const changePercent =
        value !== null && previousValue !== null && previousValue !== 0
          ? ((value - previousValue) / Math.abs(previousValue)) * 100
          : null
      return [
        row.hub_key,
        {
          changeLabel,
          changePercent,
          label,
          value,
        },
      ]
    }),
  )

  return {
    assetClassKey,
    interval,
    period: String(selectedPeriod),
    periods: periodKeys.map((key) => ({ key: String(key), label: periodLabel(key, interval) })),
    status: Object.keys(summaries).length ? 'available' : 'empty',
    summaries,
  }
}

const getCachedRegionalMarketData = async (
  assetClassKey: string,
  interval: RegionalMarketDataInterval,
  period: string,
) => {
  'use cache'

  cacheLife(MARKET_DATA_CACHE_LIFE)
  cacheTag(MARKET_DATA_CACHE_TAG, `${MARKET_DATA_CACHE_TAG}:${assetClassKey}`)
  return queryRegionalMarketData(assetClassKey, interval, period)
}

export const loadRegionalMarketData = async (
  assetClassKey: string,
  interval: RegionalMarketDataInterval,
  period = '',
): Promise<RegionalMarketDataResult> => {
  if (!/^[a-z0-9]+(?:[._:-][a-z0-9]+)*$/u.test(assetClassKey)) {
    return emptyResult(assetClassKey, interval, 'empty')
  }
  try {
    return await getCachedRegionalMarketData(assetClassKey, interval, period)
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unknown'
    console.warn('Regional market data query unavailable.', {
      assetClassKey,
      code,
      interval,
    })
    return emptyResult(assetClassKey, interval, 'unavailable')
  }
}
