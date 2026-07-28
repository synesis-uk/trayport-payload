import { Pool } from 'pg'

export type MarketQuarter = {
  exchangeTraded: number
  otcBilateral: number
  otcCleared: number
  quarter: number
  year: number
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
  limit = 10,
): Promise<MarketQuarter[]> => {
  const pool = marketPool()
  if (!pool || !Number.isFinite(assetClassLegacyID)) return []

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
        GROUP BY year, ceil(month / 3.0)
        ORDER BY year DESC, quarter DESC
        LIMIT $2
      `,
      [assetClassLegacyID, Math.min(Math.max(limit, 1), 12)],
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
