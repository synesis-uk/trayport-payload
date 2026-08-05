import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

import { sql } from '@payloadcms/db-postgres'
import { revalidateTag } from 'next/cache'
import type { CollectionSlug, PayloadRequest } from 'payload'

import { MARKET_DATA_CACHE_TAG } from '../constants'
import {
  MARKET_DATA_IMPORT_COLLECTION,
  MARKET_DATA_IMPORT_MAX_BYTES,
  MARKET_DATA_IMPORT_PARSER_VERSION,
  MARKET_DATA_IMPORT_STATIC_DIR,
} from './constants'
import { parseMarketDataImport } from './parser'
import type {
  ManagedMarketAssetClass,
  ManagedMarketDataCatalog,
  ManagedMarketHub,
  MarketDataImportReport,
  MarketDataImportResult,
  MarketDataImportRow,
  MarketDataImportStatus,
} from './types'

const importCollectionSlug = MARKET_DATA_IMPORT_COLLECTION as CollectionSlug

type StoredMarketDataImport = {
  assetClass?: { id?: number | string } | number | string | null
  createdAt?: string
  failureCode?: string | null
  failureMessage?: string | null
  fileHash?: string | null
  filename?: string | null
  forceMissingHubs?: boolean | null
  forceReason?: string | null
  id: number | string
  importType?: 'price' | 'volume' | null
  importedAt?: string | null
  importedBy?: { id?: number | string } | number | string | null
  mimeType?: string | null
  parserVersion?: string | null
  preview?: unknown
  result?: unknown
  size?: number | null
  stagingFingerprint?: string | null
  status?: MarketDataImportStatus | null
  validatedAt?: string | null
  validatedBy?: { id?: number | string } | number | string | null
  validation?: unknown
}

type ManagedMarketDocument = {
  _status?: unknown
  assetClasses?: unknown
  id?: unknown
  marketDataAliases?: unknown
  marketDataKey?: unknown
  title?: unknown
}

type SQLExecutor = {
  execute: (query: unknown) => Promise<unknown>
}

type SQLResult = {
  rows?: unknown[]
}

type ImportTransaction = {
  db: SQLExecutor
  transactionID: number | string
}

type ValidationView = {
  fileHash: string
  forced: boolean
  importID: number | string
  parserVersion: string
  report: Omit<MarketDataImportReport, 'rows'>
  stagingFingerprint: string
  status: 'invalid' | 'validated'
}

type PreviewView = {
  failureCode: string | null
  failureMessage: string | null
  fileHash: string | null
  importID: number | string
  importType: 'price' | 'volume' | null
  importedAt: string | null
  parserVersion: string | null
  preview: unknown
  result: unknown
  status: MarketDataImportStatus
  validatedAt: string | null
  validation: unknown
}

export class MarketDataImportError extends Error {
  code: string
  status: number

  constructor(message: string, { code, status = 400 }: { code: string; status?: number }) {
    super(message)
    this.name = 'MarketDataImportError'
    this.code = code
    this.status = status
  }
}

const relationshipID = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (!value || typeof value !== 'object' || !('id' in value)) return null
  const id = (value as { id?: unknown }).id
  return typeof id === 'number' || typeof id === 'string' ? id : null
}

const userID = (req: PayloadRequest): number | string | null => relationshipID(req.user)

const arrayRelationships = (value: unknown): Array<number | string> =>
  Array.isArray(value)
    ? value.map(relationshipID).filter((id): id is number | string => id !== null)
    : []

const aliasesFromDocument = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (typeof item === 'string' && item.trim()) return [item.trim()]
    if (!item || typeof item !== 'object' || !('value' in item)) return []
    const alias = (item as { value?: unknown }).value
    return typeof alias === 'string' && alias.trim() ? [alias.trim()] : []
  })
}

const managedIdentity = (
  document: ManagedMarketDocument,
  collection: 'asset class' | 'hub',
): { id: number | string; key: string; title: string } => {
  const id = relationshipID(document.id)
  const key = typeof document.marketDataKey === 'string' ? document.marketDataKey.trim() : ''
  const title = typeof document.title === 'string' ? document.title.trim() : ''
  if (id === null || !key || !title) {
    throw new MarketDataImportError(
      `A managed ${collection} is missing its stable market-data key or title.`,
      { code: 'incomplete_managed_catalog', status: 409 },
    )
  }
  return { id, key, title }
}

export const loadManagedMarketDataCatalog = async (
  req: PayloadRequest,
): Promise<ManagedMarketDataCatalog> => {
  const [assetClassResult, hubResult] = await Promise.all([
    req.payload.find({
      collection: 'asset-classes',
      depth: 0,
      limit: 1_000,
      overrideAccess: true,
      pagination: false,
    }),
    req.payload.find({
      collection: 'hubs',
      depth: 0,
      draft: false,
      limit: 5_000,
      overrideAccess: true,
      pagination: false,
      where: { _status: { equals: 'published' } },
    }),
  ])

  const assetClassKeysByID = new Map<string, string>()
  const assetClasses = assetClassResult.docs.map((rawDocument): ManagedMarketAssetClass => {
    const document = rawDocument as unknown as ManagedMarketDocument
    const identity = managedIdentity(document, 'asset class')
    assetClassKeysByID.set(String(identity.id), identity.key)
    return {
      ...identity,
      aliases: aliasesFromDocument(document.marketDataAliases),
    }
  })

  const hubs = hubResult.docs.map((rawDocument): ManagedMarketHub => {
    const document = rawDocument as unknown as ManagedMarketDocument
    const identity = managedIdentity(document, 'hub')
    return {
      ...identity,
      aliases: aliasesFromDocument(document.marketDataAliases),
      assetClassKeys: arrayRelationships(document.assetClasses).flatMap((id) => {
        const key = assetClassKeysByID.get(String(id))
        return key ? [key] : []
      }),
    }
  })

  return { assetClasses, hubs }
}

const importID = (id: number | string): number => {
  const normalized = Number(id)
  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw new MarketDataImportError('Invalid import identifier.', {
      code: 'invalid_import_id',
      status: 400,
    })
  }
  return normalized
}

const findImport = async (
  req: PayloadRequest,
  id: number | string,
): Promise<StoredMarketDataImport> => {
  try {
    const document = await req.payload.findByID({
      collection: importCollectionSlug,
      depth: 0,
      id,
      overrideAccess: true,
      req,
    })
    return document as unknown as StoredMarketDataImport
  } catch {
    throw new MarketDataImportError('Market-data import was not found.', {
      code: 'import_not_found',
      status: 404,
    })
  }
}

const updateImport = async (
  req: PayloadRequest,
  id: number | string,
  data: Record<string, unknown>,
): Promise<StoredMarketDataImport> => {
  const document = await req.payload.update({
    collection: importCollectionSlug,
    data: data as never,
    depth: 0,
    id,
    overrideAccess: true,
    req,
  })
  return document as unknown as StoredMarketDataImport
}

const safeImportFilePath = (filename: string): string => {
  const normalizedFilename = path.basename(filename)
  if (!normalizedFilename || normalizedFilename !== filename) {
    throw new MarketDataImportError('The stored import filename is invalid.', {
      code: 'invalid_import_file',
      status: 409,
    })
  }
  const filePath = path.resolve(MARKET_DATA_IMPORT_STATIC_DIR, normalizedFilename)
  if (!filePath.startsWith(`${MARKET_DATA_IMPORT_STATIC_DIR}${path.sep}`)) {
    throw new MarketDataImportError('The stored import filename is invalid.', {
      code: 'invalid_import_file',
      status: 409,
    })
  }
  return filePath
}

const readImportFile = async (document: StoredMarketDataImport): Promise<Buffer> => {
  if (!document.filename) {
    throw new MarketDataImportError('Upload a CSV file before validation.', {
      code: 'missing_import_file',
      status: 409,
    })
  }
  const filePath = safeImportFilePath(document.filename)
  let fileStats
  try {
    fileStats = await stat(filePath)
  } catch {
    throw new MarketDataImportError('The uploaded CSV file is unavailable.', {
      code: 'missing_import_file',
      status: 409,
    })
  }
  if (!fileStats.isFile() || fileStats.size <= 0 || fileStats.size > MARKET_DATA_IMPORT_MAX_BYTES) {
    throw new MarketDataImportError(
      `CSV files must be between 1 byte and ${MARKET_DATA_IMPORT_MAX_BYTES / 1024 / 1024} MB.`,
      { code: 'invalid_import_file_size', status: 413 },
    )
  }
  return readFile(filePath)
}

const sha256 = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')

const canonicalRow = (row: MarketDataImportRow): string =>
  JSON.stringify({
    assetClassKey: row.assetClassKey,
    exchangeTraded: row.exchangeTraded ?? null,
    hubKey: row.hubKey,
    month: row.month,
    otcBilateral: row.otcBilateral ?? null,
    otcCleared: row.otcCleared ?? null,
    price: row.price ?? null,
    sourceLine: row.sourceLine,
    year: row.year,
  })

const rowHashes = (rows: MarketDataImportRow[]): string[] =>
  rows.map((row) => sha256(canonicalRow(row)))

const stagingFingerprint = (hashes: string[]): string => sha256(hashes.join('\n'))

const stagingFingerprintForRows = (rows: MarketDataImportRow[], hashes: string[]): string =>
  stagingFingerprint(
    rows
      .map((row, index) => ({
        hash: hashes[index] || '',
        key: `${row.assetClassKey}\u0000${row.hubKey}\u0000${String(row.year).padStart(4, '0')}\u0000${String(row.month).padStart(2, '0')}`,
      }))
      .sort((left, right) => left.key.localeCompare(right.key))
      .map(({ hash }) => hash),
  )

const rowsFromSQLResult = <T>(result: unknown): T[] => {
  if (!result || typeof result !== 'object') return []
  const rows = (result as SQLResult).rows
  return Array.isArray(rows) ? (rows as T[]) : []
}

const beginImportTransaction = async (req: PayloadRequest): Promise<ImportTransaction> => {
  const transactionID = await req.payload.db.beginTransaction()
  if (transactionID === null || transactionID === undefined || transactionID === '') {
    throw new MarketDataImportError('A database transaction could not be started.', {
      code: 'transaction_unavailable',
      status: 503,
    })
  }
  const session = req.payload.db.sessions?.[String(transactionID)]
  const db = session?.db as SQLExecutor | undefined
  if (!db || typeof db.execute !== 'function') {
    await req.payload.db.rollbackTransaction(transactionID)
    throw new MarketDataImportError('A database transaction could not be started.', {
      code: 'transaction_unavailable',
      status: 503,
    })
  }
  req.transactionID = transactionID
  return { db, transactionID }
}

const endImportTransaction = async (
  req: PayloadRequest,
  transaction: ImportTransaction,
  action: 'commit' | 'rollback',
): Promise<void> => {
  try {
    if (action === 'commit') {
      await req.payload.db.commitTransaction(transaction.transactionID)
    } else {
      await req.payload.db.rollbackTransaction(transaction.transactionID)
    }
  } finally {
    delete req.transactionID
  }
}

const lockImport = async (db: SQLExecutor, id: number): Promise<void> => {
  await db.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`market-data-import:${id}`}))`)
}

const stagingRows = (rows: MarketDataImportRow[], hashes: string[]) =>
  rows.map((row, index) => ({
    asset_class_key: row.assetClassKey,
    exchange_traded: row.exchangeTraded ?? null,
    hub_key: row.hubKey,
    month: row.month,
    otc_bilateral: row.otcBilateral ?? null,
    otc_cleared: row.otcCleared ?? null,
    price: row.price ?? null,
    row_hash: hashes[index],
    source_line: row.sourceLine,
    year: row.year,
  }))

const replaceStagingRows = async (
  db: SQLExecutor,
  id: number,
  report: MarketDataImportReport,
  hashes: string[],
): Promise<void> => {
  await db.execute(sql`DELETE FROM app.market_data_import_staging WHERE import_id = ${id}`)
  if (!report.rows.length) return
  const serialized = JSON.stringify(stagingRows(report.rows, hashes))
  await db.execute(sql`
    INSERT INTO app.market_data_import_staging (
      import_id,
      import_type,
      asset_class_key,
      hub_key,
      year,
      month,
      otc_bilateral,
      otc_cleared,
      exchange_traded,
      price,
      source_line,
      row_hash
    )
    SELECT
      ${id},
      ${report.importType},
      staged.asset_class_key,
      staged.hub_key,
      staged.year,
      staged.month,
      staged.otc_bilateral,
      staged.otc_cleared,
      staged.exchange_traded,
      staged.price,
      staged.source_line,
      staged.row_hash
    FROM jsonb_to_recordset(${serialized}::jsonb) AS staged(
      asset_class_key text,
      hub_key text,
      year smallint,
      month smallint,
      otc_bilateral numeric,
      otc_cleared numeric,
      exchange_traded numeric,
      price numeric,
      source_line integer,
      row_hash text
    )
  `)
}

const reportWithoutRows = (
  report: MarketDataImportReport,
): Omit<MarketDataImportReport, 'rows'> => {
  const { rows: _rows, ...view } = report
  return view
}

const safeFailure = async (
  req: PayloadRequest,
  id: number | string,
  error: unknown,
): Promise<void> => {
  const code = error instanceof MarketDataImportError ? error.code : 'market_data_import_failed'
  try {
    const current = await findImport(req, id)
    if (current.status === 'imported') return
    await updateImport(req, id, {
      failureCode: code,
      failureMessage: 'The import could not be completed. Review the file and try again.',
      status: 'failed',
    })
  } catch {
    req.payload.logger.error({ code, importID: id, msg: 'Unable to record market-data failure.' })
  }
}

export const validateMarketDataImport = async (
  req: PayloadRequest,
  idValue: number | string,
): Promise<ValidationView> => {
  const id = importID(idValue)
  let document = await findImport(req, id)
  if (document.status === 'importing' || document.status === 'imported') {
    throw new MarketDataImportError('Committed imports cannot be validated again.', {
      code: 'import_already_committed',
      status: 409,
    })
  }
  if (document.importType !== 'price' && document.importType !== 'volume') {
    throw new MarketDataImportError('Choose a volume or price import type.', {
      code: 'missing_import_type',
      status: 409,
    })
  }
  const importType = document.importType

  document = await updateImport(req, id, {
    failureCode: null,
    failureMessage: null,
    status: 'validating',
  })

  try {
    const [file, catalog] = await Promise.all([
      readImportFile(document),
      loadManagedMarketDataCatalog(req),
    ])
    const fileHash = sha256(file)
    const report = parseMarketDataImport({
      catalog,
      csv: file,
      importType,
      selectedAssetClassID: relationshipID(document.assetClass),
    })
    const forced = Boolean(
      !report.valid &&
      report.canForceMissingHubs &&
      document.forceMissingHubs &&
      document.forceReason?.trim(),
    )
    const effectiveValid = report.valid || forced
    if (document.forceMissingHubs && !forced && !report.valid) {
      report.warnings.push(
        'The force option applies only when missing volume hub coverage is the sole validation error.',
      )
    }
    if (forced) {
      report.warnings.push(`Missing hub coverage accepted: ${document.forceReason!.trim()}`)
    }
    const hashes = rowHashes(report.rows)
    const fingerprint = stagingFingerprintForRows(report.rows, hashes)
    const now = new Date().toISOString()
    const transaction = await beginImportTransaction(req)
    try {
      await lockImport(transaction.db, id)
      const latest = await findImport(req, id)
      if (latest.status === 'imported' || latest.status === 'importing') {
        throw new MarketDataImportError('Import state changed during validation.', {
          code: 'import_state_changed',
          status: 409,
        })
      }
      await replaceStagingRows(transaction.db, id, report, hashes)
      await updateImport(req, id, {
        fileHash,
        parserVersion: MARKET_DATA_IMPORT_PARSER_VERSION,
        preview: report.preview,
        stagingFingerprint: fingerprint,
        status: effectiveValid ? 'validated' : 'invalid',
        validatedAt: now,
        validatedBy: userID(req),
        validation: {
          ...reportWithoutRows(report),
          forced,
          valid: effectiveValid,
        },
      })
      await endImportTransaction(req, transaction, 'commit')
    } catch (error) {
      await endImportTransaction(req, transaction, 'rollback')
      throw error
    }

    return {
      fileHash,
      forced,
      importID: id,
      parserVersion: MARKET_DATA_IMPORT_PARSER_VERSION,
      report: { ...reportWithoutRows(report), valid: effectiveValid },
      stagingFingerprint: fingerprint,
      status: effectiveValid ? 'validated' : 'invalid',
    }
  } catch (error) {
    await safeFailure(req, id, error)
    throw error
  }
}

const stagedFingerprint = async (db: SQLExecutor, id: number): Promise<string> => {
  const result = await db.execute(sql`
    SELECT row_hash
    FROM app.market_data_import_staging
    WHERE import_id = ${id}
    ORDER BY asset_class_key, hub_key, year, month
  `)
  const hashes = rowsFromSQLResult<{ row_hash?: unknown }>(result).flatMap(({ row_hash }) =>
    typeof row_hash === 'string' ? [row_hash] : [],
  )
  return stagingFingerprint(hashes)
}

type ExistingRowCounts = {
  created?: number | string
  unchanged?: number | string
  updated?: number | string
}

const existingRowCounts = async (
  db: SQLExecutor,
  id: number,
  importType: 'price' | 'volume',
): Promise<MarketDataImportResult> => {
  const metricChanged =
    importType === 'price'
      ? sql`target.price IS DISTINCT FROM staged.price`
      : sql`(
          target.otc_bilateral IS DISTINCT FROM coalesce(staged.otc_bilateral, target.otc_bilateral)
          OR target.otc_cleared IS DISTINCT FROM coalesce(staged.otc_cleared, target.otc_cleared)
          OR target.exchange_traded IS DISTINCT FROM coalesce(staged.exchange_traded, target.exchange_traded)
        )`
  const result = await db.execute(sql`
    SELECT
      count(*) FILTER (WHERE target.id IS NULL)::int AS created,
      count(*) FILTER (WHERE target.id IS NOT NULL AND (${metricChanged}))::int AS updated,
      count(*) FILTER (WHERE target.id IS NOT NULL AND NOT (${metricChanged}))::int AS unchanged
    FROM app.market_data_import_staging staged
    LEFT JOIN app.market_volume_monthly target
      ON target.asset_class_key = staged.asset_class_key
      AND target.hub_key = staged.hub_key
      AND target.year = staged.year
      AND target.month = staged.month
    WHERE staged.import_id = ${id}
  `)
  const counts = rowsFromSQLResult<ExistingRowCounts>(result)[0] || {}
  const created = Number(counts.created) || 0
  const updated = Number(counts.updated) || 0
  const unchanged = Number(counts.unchanged) || 0
  return { created, importedRows: created + updated + unchanged, unchanged, updated }
}

const upsertStagedRows = async (
  db: SQLExecutor,
  { fileHash, id, importType }: { fileHash: string; id: number; importType: 'price' | 'volume' },
): Promise<void> => {
  if (importType === 'price') {
    await db.execute(sql`
      INSERT INTO app.market_volume_monthly (
        asset_class_key,
        hub_key,
        year,
        month,
        price,
        source_import_id,
        source_fingerprint
      )
      SELECT
        asset_class_key,
        hub_key,
        year,
        month,
        price,
        ${id},
        ${fileHash}
      FROM app.market_data_import_staging
      WHERE import_id = ${id}
      ON CONFLICT (asset_class_key, hub_key, year, month)
      DO UPDATE SET
        price = excluded.price,
        source_import_id = excluded.source_import_id,
        source_fingerprint = excluded.source_fingerprint,
        imported_at = now()
      WHERE app.market_volume_monthly.price IS DISTINCT FROM excluded.price
    `)
    return
  }

  await db.execute(sql`
    INSERT INTO app.market_volume_monthly (
      asset_class_key,
      hub_key,
      year,
      month,
      otc_bilateral,
      otc_cleared,
      exchange_traded,
      source_import_id,
      source_fingerprint
    )
    SELECT
      asset_class_key,
      hub_key,
      year,
      month,
      otc_bilateral,
      otc_cleared,
      exchange_traded,
      ${id},
      ${fileHash}
    FROM app.market_data_import_staging
    WHERE import_id = ${id}
    ON CONFLICT (asset_class_key, hub_key, year, month)
    DO UPDATE SET
      otc_bilateral = coalesce(excluded.otc_bilateral, app.market_volume_monthly.otc_bilateral),
      otc_cleared = coalesce(excluded.otc_cleared, app.market_volume_monthly.otc_cleared),
      exchange_traded = coalesce(
        excluded.exchange_traded,
        app.market_volume_monthly.exchange_traded
      ),
      source_import_id = excluded.source_import_id,
      source_fingerprint = excluded.source_fingerprint,
      imported_at = now()
    WHERE (
      app.market_volume_monthly.otc_bilateral,
      app.market_volume_monthly.otc_cleared,
      app.market_volume_monthly.exchange_traded
    ) IS DISTINCT FROM (
      coalesce(excluded.otc_bilateral, app.market_volume_monthly.otc_bilateral),
      coalesce(excluded.otc_cleared, app.market_volume_monthly.otc_cleared),
      coalesce(excluded.exchange_traded, app.market_volume_monthly.exchange_traded)
    )
  `)
}

export const commitMarketDataImport = async (
  req: PayloadRequest,
  idValue: number | string,
): Promise<MarketDataImportResult & { importID: number; status: 'imported' }> => {
  const id = importID(idValue)
  let document = await findImport(req, id)
  if (document.status === 'imported') {
    throw new MarketDataImportError('This import has already been committed.', {
      code: 'import_already_committed',
      status: 409,
    })
  }
  if (document.status !== 'validated') {
    throw new MarketDataImportError('Validate the import successfully before committing it.', {
      code: 'import_not_validated',
      status: 409,
    })
  }
  if (
    !document.fileHash ||
    !document.stagingFingerprint ||
    document.parserVersion !== MARKET_DATA_IMPORT_PARSER_VERSION ||
    (document.importType !== 'price' && document.importType !== 'volume')
  ) {
    throw new MarketDataImportError(
      'The validation record is incomplete; validate the file again.',
      {
        code: 'incomplete_validation_record',
        status: 409,
      },
    )
  }

  const currentFileHash = sha256(await readImportFile(document))
  if (currentFileHash !== document.fileHash) {
    throw new MarketDataImportError(
      'The uploaded file changed after validation; validate it again.',
      {
        code: 'import_file_changed',
        status: 409,
      },
    )
  }

  const transaction = await beginImportTransaction(req)
  let committed = false
  try {
    await lockImport(transaction.db, id)
    document = await findImport(req, id)
    if (document.status !== 'validated') {
      throw new MarketDataImportError('Import state changed before commit.', {
        code: 'import_state_changed',
        status: 409,
      })
    }
    if (
      document.fileHash !== currentFileHash ||
      document.parserVersion !== MARKET_DATA_IMPORT_PARSER_VERSION ||
      !document.stagingFingerprint ||
      (document.importType !== 'price' && document.importType !== 'volume')
    ) {
      throw new MarketDataImportError('The validation record changed; validate the file again.', {
        code: 'validation_record_changed',
        status: 409,
      })
    }
    if ((await stagedFingerprint(transaction.db, id)) !== document.stagingFingerprint) {
      throw new MarketDataImportError('Validated staging data changed; validate the file again.', {
        code: 'staging_data_changed',
        status: 409,
      })
    }

    await updateImport(req, id, { status: 'importing' })
    const result = await existingRowCounts(transaction.db, id, document.importType)
    if (!result.importedRows) {
      throw new MarketDataImportError('There are no validated rows to commit.', {
        code: 'empty_staging_data',
        status: 409,
      })
    }
    await upsertStagedRows(transaction.db, {
      fileHash: currentFileHash,
      id,
      importType: document.importType,
    })
    await updateImport(req, id, {
      importedAt: new Date().toISOString(),
      importedBy: userID(req),
      result,
      status: 'imported',
    })
    await endImportTransaction(req, transaction, 'commit')
    committed = true

    revalidateTag(MARKET_DATA_CACHE_TAG, 'max')
    return { ...result, importID: id, status: 'imported' }
  } catch (error) {
    if (!committed) await endImportTransaction(req, transaction, 'rollback')
    if (!committed) await safeFailure(req, id, error)
    throw error
  }
}

export const getMarketDataImportPreview = async (
  req: PayloadRequest,
  idValue: number | string,
): Promise<PreviewView> => {
  const document = await findImport(req, importID(idValue))
  return {
    failureCode: document.failureCode || null,
    failureMessage: document.failureMessage || null,
    fileHash: document.fileHash || null,
    importID: document.id,
    importType: document.importType || null,
    importedAt: document.importedAt || null,
    parserVersion: document.parserVersion || null,
    preview: document.preview || [],
    result: document.result || null,
    status: document.status || 'uploaded',
    validatedAt: document.validatedAt || null,
    validation: document.validation || null,
  }
}

export const marketDataImportServiceContract = {
  cacheInvalidation: 'after-transaction-commit',
  commit: 'explicit-admin-endpoint',
  concurrency: 'transaction-scoped-advisory-lock',
  facts: 'app.market_volume_monthly',
  idempotency: 'metric-diff-upsert',
  metricMerge: {
    price: 'preserve-volume',
    volume: 'preserve-price-and-omitted-volume-cells',
  },
  staging: 'app.market_data_import_staging',
  validation: 'file-hash-parser-version-staging-fingerprint',
} as const
