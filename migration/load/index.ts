import fs from 'node:fs'
import path from 'node:path'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { migrationConfig } from '../lib/config'
import type { LegacyReference, TargetCollection, TargetRecord } from '../transform/types'
import { loadMarketData } from './marketData'

type PayloadDocument = {
  id: number | string
  [key: string]: unknown
  legacySource?: {
    contentHash?: string | null
  } | null
}

type SystemPayload = {
  create(args: Record<string, unknown>): Promise<PayloadDocument>
  destroy(): Promise<void>
  find(args: Record<string, unknown>): Promise<{ docs: PayloadDocument[] }>
  findGlobal(args: Record<string, unknown>): Promise<Record<string, unknown>>
  update(args: Record<string, unknown>): Promise<PayloadDocument>
  updateGlobal(args: Record<string, unknown>): Promise<unknown>
}

type LoadOptions = {
  dryRun?: boolean
  publish?: boolean
  runId?: string
}

const referenceKindForTarget: Partial<Record<TargetCollection, LegacyReference['$legacyRef']>> = {
  media: 'media',
  venues: 'venue',
  'article-categories': 'article-category',
  'learning-video-categories': 'learning-video-category',
  'asset-classes': 'asset-class',
  'venue-types': 'venue-type',
  regions: 'region',
}

const loadPriority: Record<TargetRecord['target'], number> = {
  'article-categories': 10,
  'learning-video-categories': 10,
  'asset-classes': 10,
  'venue-types': 10,
  regions: 10,
  media: 20,
  venues: 30,
  pages: 40,
  articles: 40,
  hubs: 40,
  'learning-videos': 40,
  global: 50,
}

const resolveRunId = (requested?: string): string => {
  if (requested) return requested
  return fs.readFileSync(path.join(migrationConfig.workDir, 'latest-run.txt'), 'utf8').trim()
}

const readTargets = (runDir: string): TargetRecord[] =>
  fs
    .readFileSync(path.join(runDir, 'transformed.ndjson'), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      const value = JSON.parse(line) as TargetRecord
      if (!value.target || !value.data || !value.legacy) {
        throw new Error(`Invalid transformed record on line ${index + 1}`)
      }
      return value
    })

const tokenKey = (kind: LegacyReference['$legacyRef'], legacyId: number): string =>
  `${kind}:${legacyId}`

const isToken = (value: unknown): value is LegacyReference => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const object = value as Record<string, unknown>
  return typeof object.$legacyRef === 'string' && typeof object.legacyId === 'number'
}

const resolveTokens = (
  value: unknown,
  ids: Map<string, number | string>,
  unresolved: Set<string>,
): unknown => {
  if (isToken(value)) {
    const key = tokenKey(value.$legacyRef, value.legacyId)
    const resolved = ids.get(key)
    if (resolved === undefined) {
      unresolved.add(key)
      return undefined
    }
    return resolved
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => resolveTokens(item, ids, unresolved))
      .filter((item) => item !== undefined)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, child]) => [key, resolveTokens(child, ids, unresolved)] as const)
        .filter(([, child]) => child !== undefined),
    )
  }

  return value
}

const isoInstantPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/

const resolvePayloadData = (
  record: TargetRecord,
  ids: Map<string, number | string>,
  unresolved: Set<string>,
): Record<string, unknown> => {
  const data = resolveTokens(record.data, ids, unresolved) as Record<string, unknown>

  // These fields are migration transport/evidence, not Payload schema fields.
  // Keep accepting older transformed runs while ensuring ignored input cannot
  // make every idempotency check look changed forever.
  if (record.target === 'media') delete data.source
  if (record.target === 'regions') delete data.displayOrder

  return data
}

const comparableScalar = (current: unknown, desired: unknown): unknown => {
  if (
    typeof current === 'string' &&
    typeof desired === 'string' &&
    isoInstantPattern.test(current) &&
    isoInstantPattern.test(desired) &&
    Date.parse(current) === Date.parse(desired)
  ) {
    return desired
  }

  return current
}

const comparableProjection = (current: unknown, desired: unknown): unknown => {
  if (Array.isArray(desired)) {
    if (!Array.isArray(current)) return current
    return desired.map((child, index) => comparableProjection(current[index], child))
  }

  if (desired && typeof desired === 'object') {
    const currentObject =
      current && typeof current === 'object' && !Array.isArray(current)
        ? (current as Record<string, unknown>)
        : {}
    return Object.fromEntries(
      Object.entries(desired as Record<string, unknown>).map(([key, child]) => [
        key,
        comparableProjection(currentObject[key], child),
      ]),
    )
  }

  return comparableScalar(current, desired)
}

export const isEquivalentPayloadData = (current: unknown, desired: unknown): boolean =>
  JSON.stringify(comparableProjection(current, desired)) === JSON.stringify(desired)

const safeSourceFile = (record: TargetRecord): string | undefined => {
  if (record.target !== 'media') return undefined
  const source = record.data.source as
    { availability?: string; mimeType?: string; relativePath?: string | null } | undefined
  if (source?.availability === 'unavailable') {
    return path.resolve(migrationConfig.projectRoot, 'migration/assets/missing-media.svg')
  }
  if (!source?.relativePath) {
    return undefined
  }

  const root = fs.realpathSync(migrationConfig.source.uploads)
  const candidate = path.resolve(root, source.relativePath)
  if (!candidate.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Unsafe media source path for WordPress attachment ${record.legacy.legacyId}`)
  }
  if (!fs.existsSync(candidate)) {
    throw new Error(
      `Missing media source for WordPress attachment ${record.legacy.legacyId}: ${candidate}`,
    )
  }
  return candidate
}

const sourceFileForOperation = (
  record: TargetRecord,
  existing?: PayloadDocument,
): string | undefined => {
  const sourceFile = safeSourceFile(record)
  if (!existing || record.target !== 'media' || !sourceFile) return sourceFile

  const source = record.data.source as { availability?: string; mimeType?: string } | undefined
  const hasStoredFile =
    typeof existing.filename === 'string' &&
    existing.filename.length > 0 &&
    typeof existing.url === 'string' &&
    existing.url.length > 0
  if (!hasStoredFile) return sourceFile

  // Metadata-only changes must not upload another object. Unavailable sources retain
  // their existing placeholder; local sources are replaced only when their MIME type
  // no longer matches the stored object. Binary checksums are not present in WordPress.
  if (
    source?.availability === 'unavailable' ||
    (typeof existing.mimeType === 'string' && existing.mimeType === source?.mimeType)
  ) {
    return undefined
  }

  return sourceFile
}

const findExisting = async (
  payload: SystemPayload,
  record: TargetRecord,
): Promise<PayloadDocument | undefined> => {
  if (record.target === 'global') return undefined

  const result = await payload.find({
    collection: record.target,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { 'legacySource.source': { equals: record.legacy.source } },
        { 'legacySource.legacyId': { equals: record.legacy.legacyId } },
      ],
    },
  })
  return result.docs[0]
}

export const load = async (options: LoadOptions = {}): Promise<void> => {
  const runId = resolveRunId(options.runId)
  const runDir = path.resolve(migrationConfig.workDir, runId)
  const targets = readTargets(runDir).sort(
    (left, right) =>
      loadPriority[left.target] - loadPriority[right.target] ||
      left.legacy.legacyId - right.legacy.legacyId,
  )
  if (options.dryRun) {
    const marketReport = await loadMarketData(runDir, { dryRun: true })
    const mediaFiles = targets
      .filter((record) => record.target === 'media')
      .map((record) => safeSourceFile(record))
      .filter(Boolean)

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          dryRun: true,
          runId,
          targetCount: targets.length,
          mediaFiles: mediaFiles.length,
          marketData: marketReport,
        },
        null,
        2,
      )}\n`,
    )
    return
  }

  const payload = (await getPayload({ config: configPromise })) as unknown as SystemPayload
  try {
    // Payload may reconcile its own schema during local startup. Load application-owned
    // market facts only after that step, but before any CMS content writes.
    const marketReport = await loadMarketData(runDir)
    const ids = new Map<string, number | string>()
    const changedRecords = new Set<string>()
    const report = {
      inserted: 0,
      updated: 0,
      unchanged: 0,
      globalsUpdated: 0,
      globalsUnchanged: 0,
      unresolved: [] as string[],
      marketData: marketReport,
    }

    // First pass: create stable target IDs without relationships.
    for (const record of targets) {
      if (record.target === 'global') continue

      const existing = await findExisting(payload, record)
      const kind = referenceKindForTarget[record.target as TargetCollection]
      if (existing && kind) {
        ids.set(tokenKey(kind, record.legacy.legacyId), existing.id)
      }

      const desiredStatus =
        '_status' in record.data ? (options.publish ? record.data._status : 'draft') : undefined
      const statusMatches =
        desiredStatus === undefined || (existing && existing._status === desiredStatus)
      if (existing?.legacySource?.contentHash === record.legacy.contentHash && statusMatches) {
        report.unchanged += 1
        continue
      }

      const unresolved = new Set<string>()
      const data = resolvePayloadData(record, ids, unresolved)
      data.legacySource = record.legacy
      if ('_status' in data && !options.publish) {
        data._status = 'draft'
      }

      const filePath = sourceFileForOperation(record, existing)
      const operation = existing
        ? payload.update({
            collection: record.target,
            id: existing.id,
            data,
            context: { disableRevalidate: true, migration: true },
            draft: data._status === 'draft',
            ...(filePath ? { filePath } : {}),
            overrideAccess: true,
          })
        : payload.create({
            collection: record.target,
            data,
            context: { disableRevalidate: true, migration: true },
            draft: data._status === 'draft',
            ...(filePath ? { filePath } : {}),
            overrideAccess: true,
          })

      const saved = await operation
      changedRecords.add(`${record.target}:${record.legacy.legacyId}`)
      if (kind) {
        ids.set(tokenKey(kind, record.legacy.legacyId), saved.id)
      }
      if (existing) report.updated += 1
      else report.inserted += 1
    }

    // Second pass: every selected relationship must now resolve.
    for (const record of targets) {
      const unresolved = new Set<string>()
      const data = resolvePayloadData(record, ids, unresolved)
      if (unresolved.size) {
        report.unresolved.push(...unresolved)
        continue
      }

      if (record.target === 'global') {
        const globalData: Record<string, unknown> =
          record.globalSlug === 'navigation' || record.globalSlug === 'footer'
            ? { ...data, legacySource: record.legacy }
            : { ...data }
        const desiredStatus = options.publish ? 'published' : 'draft'
        globalData._status = desiredStatus
        const current = await payload.findGlobal({
          slug: record.globalSlug,
          depth: 0,
          draft: true,
          overrideAccess: true,
        })
        if (current._status === desiredStatus && isEquivalentPayloadData(current, globalData)) {
          report.globalsUnchanged += 1
          continue
        }
        await payload.updateGlobal({
          slug: record.globalSlug,
          data: globalData,
          context: { disableRevalidate: true, migration: true },
          draft: desiredStatus === 'draft',
          overrideAccess: true,
        })
        report.globalsUpdated += 1
        continue
      }

      const existing = await findExisting(payload, record)
      if (!existing) {
        report.unresolved.push(`${record.target}:${record.legacy.legacyId}`)
        continue
      }
      data.legacySource = record.legacy
      if ('_status' in data && !options.publish) {
        data._status = 'draft'
      }
      const desiredStatus = '_status' in data ? data._status : undefined
      const statusMatches = desiredStatus === undefined || existing._status === desiredStatus
      if (statusMatches && isEquivalentPayloadData(existing, data)) {
        continue
      }

      await payload.update({
        collection: record.target,
        id: existing.id,
        data,
        context: { disableRevalidate: true, migration: true },
        draft: data._status === 'draft',
        overrideAccess: true,
      })
      const recordKey = `${record.target}:${record.legacy.legacyId}`
      if (!changedRecords.has(recordKey)) {
        report.unchanged -= 1
        report.updated += 1
        changedRecords.add(recordKey)
      }
    }

    report.unresolved = [...new Set(report.unresolved)].sort()
    fs.writeFileSync(
      path.join(runDir, 'reports', 'load.json'),
      `${JSON.stringify({ runId, ...report }, null, 2)}\n`,
    )

    if (report.unresolved.length) {
      throw new Error(`Unresolved migration relationships: ${report.unresolved.join(', ')}`)
    }

    process.stdout.write(`${JSON.stringify({ ok: true, runId, ...report }, null, 2)}\n`)
  } finally {
    await payload.destroy()
  }
}
