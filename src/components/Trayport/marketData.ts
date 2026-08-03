import { Pool } from 'pg'

export type MarketQuarter = {
  exchangeTraded: number
  otcBilateral: number
  otcCleared: number
  quarter: number
  year: number
}

export type MarketQuarterRange = {
  fromQuarter?: number | null
  fromYear?: number | null
  limit?: number
  toQuarter?: number | null
  toYear?: number | null
}

type MarketQuarterRow = {
  exchange_traded: number | string
  otc_bilateral: number | string
  otc_cleared: number | string
  quarter: number | string
  year: number | string
}

const globalWithMarketPool = globalThis as typeof globalThis & {
  trayportMarketPool?: Pool
}

const marketPool = () => {
  if (!process.env.DATABASE_URL) return null
  if (!globalWithMarketPool.trayportMarketPool) {
    globalWithMarketPool.trayportMarketPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 4,
    })
  }
  return globalWithMarketPool.trayportMarketPool
}

export const getMarketVolumeQuarterly = async (
  assetClassLegacyID: number,
  rangeOrLimit: MarketQuarterRange | number = 10,
): Promise<MarketQuarter[]> => {
  const pool = marketPool()
  if (!pool || !Number.isFinite(assetClassLegacyID)) return []

  const range = typeof rangeOrLimit === 'number' ? { limit: rangeOrLimit } : rangeOrLimit
  const limit = Math.min(Math.max(range.limit || 40, 1), 40)
  const fromPeriod =
    range.fromYear && range.fromQuarter ? range.fromYear * 4 + range.fromQuarter : 0
  const toPeriod = range.toYear && range.toQuarter ? range.toYear * 4 + range.toQuarter : 99999

  try {
    const result = await pool.query<MarketQuarterRow>(
      `
        SELECT
          year::int AS year,
          ceil(month / 3.0)::int AS quarter,
          coalesce(sum(otc_bilateral), 0)::float8 AS otc_bilateral,
          coalesce(sum(otc_cleared), 0)::float8 AS otc_cleared,
          coalesce(sum(exchange_traded), 0)::float8 AS exchange_traded
        FROM app.market_volume_monthly
        WHERE asset_class_legacy_id = $1
          AND (year::int * 4 + ceil(month / 3.0)::int) BETWEEN $2 AND $3
        GROUP BY year, ceil(month / 3.0)
        ORDER BY year DESC, quarter DESC
        LIMIT $4
      `,
      [assetClassLegacyID, fromPeriod, toPeriod, limit],
    )

    return result.rows
      .map((row) => ({
        exchangeTraded: Number(row.exchange_traded),
        otcBilateral: Number(row.otc_bilateral),
        otcCleared: Number(row.otc_cleared),
        quarter: Number(row.quarter),
        year: Number(row.year),
      }))
      .reverse()
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unknown'
    console.warn(`Market volume query unavailable (${code}).`)
    return []
  }
}
