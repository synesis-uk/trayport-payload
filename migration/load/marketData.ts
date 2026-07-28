import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import 'dotenv/config'
import { Pool } from 'pg'

type MarketRow = {
  assetClassLegacyId: number
  exchangeTraded: string | null
  hubLegacyId: number
  month: number
  otcBilateral: string | null
  otcCleared: string | null
  price: string | null
  sourceFingerprint: string
  sourcePostLegacyId: number
  year: number
}

type MarketLoadReport = {
  importedRows: number
  inserted: number
  scopeRowsAfterLoad: number
  unchanged: number
  updated: number
}

const readRows = (runDir: string): MarketRow[] => {
  const sourcePath = path.join(runDir, 'market-volume.ndjson')
  const rows = fs
    .readFileSync(sourcePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as MarketRow)

  assert.equal(rows.length, 1194, 'Expected exactly 1,194 market-volume rows')
  assert.equal(
    new Set(
      rows.map(
        ({ assetClassLegacyId, hubLegacyId, year, month }) =>
          `${assetClassLegacyId}:${hubLegacyId}:${year}:${month}`,
      ),
    ).size,
    rows.length,
    'Market-volume intermediate file has duplicate composite keys',
  )
  return rows
}

const databaseURL = (): string => {
  const value = process.env.DATABASE_URL
  if (!value) throw new Error('DATABASE_URL is required to load market data.')
  return value
}

export const loadMarketData = async (
  runDir: string,
  options: { dryRun?: boolean } = {},
): Promise<MarketLoadReport> => {
  const rows = readRows(runDir)
  const pool = new Pool({ connectionString: databaseURL(), max: 1 })
  const client = await pool.connect()

  try {
    await client.query('begin')
    await client.query(
      fs.readFileSync(
        path.resolve(process.cwd(), 'migration/sql/001_market_volume_monthly.sql'),
        'utf8',
      ),
    )
    await client.query(`
      create temporary table import_market_volume_monthly (
        asset_class_legacy_id integer not null,
        hub_legacy_id integer not null,
        year smallint not null,
        month smallint not null,
        otc_bilateral numeric,
        otc_cleared numeric,
        exchange_traded numeric,
        price numeric,
        source_post_legacy_id integer not null,
        source_fingerprint text not null,
        primary key (asset_class_legacy_id, hub_legacy_id, year, month)
      ) on commit drop
    `)

    const jsonRows = rows.map((row) => ({
      asset_class_legacy_id: row.assetClassLegacyId,
      exchange_traded: row.exchangeTraded,
      hub_legacy_id: row.hubLegacyId,
      month: row.month,
      otc_bilateral: row.otcBilateral,
      otc_cleared: row.otcCleared,
      price: row.price,
      source_fingerprint: row.sourceFingerprint,
      source_post_legacy_id: row.sourcePostLegacyId,
      year: row.year,
    }))
    await client.query(
      `
        insert into import_market_volume_monthly (
          asset_class_legacy_id,
          hub_legacy_id,
          year,
          month,
          otc_bilateral,
          otc_cleared,
          exchange_traded,
          price,
          source_post_legacy_id,
          source_fingerprint
        )
        select
          asset_class_legacy_id,
          hub_legacy_id,
          year,
          month,
          otc_bilateral,
          otc_cleared,
          exchange_traded,
          price,
          source_post_legacy_id,
          source_fingerprint
        from jsonb_to_recordset($1::jsonb) as source (
          asset_class_legacy_id integer,
          hub_legacy_id integer,
          year smallint,
          month smallint,
          otc_bilateral numeric,
          otc_cleared numeric,
          exchange_traded numeric,
          price numeric,
          source_post_legacy_id integer,
          source_fingerprint text
        )
      `,
      [JSON.stringify(jsonRows)],
    )

    const comparison = await client.query<{
      inserted: string
      unchanged: string
      updated: string
    }>(`
      select
        count(*) filter (where target.id is null)::text as inserted,
        count(*) filter (
          where target.id is not null
            and (
              target.otc_bilateral,
              target.otc_cleared,
              target.exchange_traded,
              target.price,
              target.source_post_legacy_id,
              target.source_fingerprint
            ) is not distinct from (
              source.otc_bilateral,
              source.otc_cleared,
              source.exchange_traded,
              source.price,
              source.source_post_legacy_id,
              source.source_fingerprint
            )
        )::text as unchanged,
        count(*) filter (
          where target.id is not null
            and (
              target.otc_bilateral,
              target.otc_cleared,
              target.exchange_traded,
              target.price,
              target.source_post_legacy_id,
              target.source_fingerprint
            ) is distinct from (
              source.otc_bilateral,
              source.otc_cleared,
              source.exchange_traded,
              source.price,
              source.source_post_legacy_id,
              source.source_fingerprint
            )
        )::text as updated
      from import_market_volume_monthly source
      left join app.market_volume_monthly target using (
        asset_class_legacy_id,
        hub_legacy_id,
        year,
        month
      )
    `)
    const existingScope = await client.query<{ count: string }>(`
      select count(*)::text as count
      from app.market_volume_monthly target
      inner join import_market_volume_monthly source using (
        asset_class_legacy_id,
        hub_legacy_id,
        year,
        month
      )
    `)
    const comparisonRow = comparison.rows[0]
    const predictedReport: MarketLoadReport = {
      importedRows: rows.length,
      inserted: Number(comparisonRow.inserted),
      scopeRowsAfterLoad: Number(existingScope.rows[0].count),
      unchanged: Number(comparisonRow.unchanged),
      updated: Number(comparisonRow.updated),
    }
    assert.equal(
      predictedReport.inserted + predictedReport.updated + predictedReport.unchanged,
      1194,
    )

    if (options.dryRun) {
      await client.query('rollback')
      fs.writeFileSync(
        path.join(runDir, 'reports', 'market-load.json'),
        `${JSON.stringify({ dryRun: true, ...predictedReport }, null, 2)}\n`,
      )
      return predictedReport
    }

    await client.query(`
      insert into app.market_volume_monthly (
        asset_class_legacy_id,
        hub_legacy_id,
        year,
        month,
        otc_bilateral,
        otc_cleared,
        exchange_traded,
        price,
        source_post_legacy_id,
        source_fingerprint
      )
      select
        asset_class_legacy_id,
        hub_legacy_id,
        year,
        month,
        otc_bilateral,
        otc_cleared,
        exchange_traded,
        price,
        source_post_legacy_id,
        source_fingerprint
      from import_market_volume_monthly
      on conflict (asset_class_legacy_id, hub_legacy_id, year, month)
      do update set
        otc_bilateral = excluded.otc_bilateral,
        otc_cleared = excluded.otc_cleared,
        exchange_traded = excluded.exchange_traded,
        price = excluded.price,
        source_post_legacy_id = excluded.source_post_legacy_id,
        source_fingerprint = excluded.source_fingerprint,
        imported_at = now()
      where (
        app.market_volume_monthly.otc_bilateral,
        app.market_volume_monthly.otc_cleared,
        app.market_volume_monthly.exchange_traded,
        app.market_volume_monthly.price,
        app.market_volume_monthly.source_post_legacy_id,
        app.market_volume_monthly.source_fingerprint
      ) is distinct from (
        excluded.otc_bilateral,
        excluded.otc_cleared,
        excluded.exchange_traded,
        excluded.price,
        excluded.source_post_legacy_id,
        excluded.source_fingerprint
      )
    `)

    const countResult = await client.query<{ count: string }>(`
      select count(*)::text as count
      from app.market_volume_monthly target
      inner join import_market_volume_monthly source using (
        asset_class_legacy_id,
        hub_legacy_id,
        year,
        month
      )
    `)
    const report: MarketLoadReport = {
      importedRows: rows.length,
      inserted: Number(comparisonRow.inserted),
      scopeRowsAfterLoad: Number(countResult.rows[0].count),
      unchanged: Number(comparisonRow.unchanged),
      updated: Number(comparisonRow.updated),
    }
    assert.equal(report.scopeRowsAfterLoad, 1194)
    assert.equal(report.inserted + report.updated + report.unchanged, 1194)

    await client.query('commit')
    fs.writeFileSync(
      path.join(runDir, 'reports', 'market-load.json'),
      `${JSON.stringify({ dryRun: false, ...report }, null, 2)}\n`,
    )
    return report
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}
