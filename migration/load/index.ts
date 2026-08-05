import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { migrationConfig } from '../lib/config'
import { verifyAcceptedRun } from '../lib/acceptedRun'
import type { LegacyReference, TargetCollection, TargetRecord } from '../transform/types'
import { loadMarketData } from './marketData'

type PayloadDocument = {
  id: number | string
  [key: string]: unknown
  sourceFileHash?: string | null
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
  pages: 'page',
  articles: 'article',
  hubs: 'hub',
  venues: 'venue',
  'learning-videos': 'learning-video',
  'lifecycle-items': 'lifecycle-item',
  offices: 'office',
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
  'lifecycle-items': 25,
  offices: 25,
  venues: 30,
  pages: 40,
  articles: 40,
  hubs: 40,
  'learning-videos': 40,
  banners: 45,
  redirects: 45,
  global: 50,
}

const relationshipOwnerTargets = new Set<TargetRecord['target']>([
  'pages',
  'articles',
  'hubs',
  'venues',
  'learning-videos',
])

const draftSkeletonData = (record: TargetRecord): Record<string, unknown> => {
  const title =
    typeof record.data.title === 'string' && record.data.title.trim()
      ? record.data.title
      : `Imported ${record.target} ${record.legacy.legacyId}`
  const slug = typeof record.data.slug === 'string' ? record.data.slug : undefined
  const base = {
    _status: 'draft',
    legacySource: {
      ...record.legacy,
      // A skeleton must always be replaced by the complete accepted record.
      contentHash: null,
    },
    ...(slug ? { slug } : {}),
    title,
  }

  switch (record.target) {
    case 'pages':
      return {
        ...base,
        layout: [
          {
            actions: [],
            appearance: 'dark',
            blockType: 'trayportHero',
            heading: title,
          },
        ],
        pageType: 'standard',
      }
    case 'articles':
      return {
        ...base,
        articleType: 'insight',
        contentMode: 'listing',
      }
    case 'hubs':
      return {
        ...base,
        contentMode: 'map-only',
      }
    case 'venues':
      return {
        ...base,
        contentMode: 'relationship-only',
      }
    case 'learning-videos':
      return {
        ...base,
        accessMode: 'public',
        contentMode: 'listing',
        displayOrder: 0,
      }
    default:
      throw new Error(`Cannot create a relationship skeleton for ${record.target}.`)
  }
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

type ResolvedTokenValue = {
  containsUnresolved: boolean
  value: unknown
}

const resolveTokenValue = (
  value: unknown,
  ids: Map<string, number | string>,
  unresolved: Set<string>,
): ResolvedTokenValue => {
  if (isToken(value)) {
    const key = tokenKey(value.$legacyRef, value.legacyId)
    const resolved = ids.get(key)
    if (resolved === undefined) {
      unresolved.add(key)
      return { containsUnresolved: true, value: undefined }
    }
    return { containsUnresolved: false, value: resolved }
  }

  if (Array.isArray(value)) {
    const resolvedItems = value
      .map((item) => resolveTokenValue(item, ids, unresolved))
      // Relationship arrays may contain objects whose required relationship is not
      // available until a later pass. Drop that whole item instead of retaining an
      // invalid shell such as { connectionType: 'd' } without its required hub.
      .filter(({ containsUnresolved, value: child }) => !containsUnresolved && child !== undefined)
      .map(({ value: child }) => child)

    // An array is the ownership boundary for an item. Any unresolved child was
    // safely removed, so parent objects and layout blocks can remain as a skeleton.
    return { containsUnresolved: false, value: resolvedItems }
  }

  if (value && typeof value === 'object') {
    let containsUnresolved = false
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, child]) => {
        const resolved = resolveTokenValue(child, ids, unresolved)
        if (resolved.containsUnresolved) containsUnresolved = true
        return [key, resolved] as const
      })
      .filter(([, resolved]) => !resolved.containsUnresolved && resolved.value !== undefined)
      .map(([key, resolved]) => [key, resolved.value] as const)

    return {
      containsUnresolved,
      value: Object.fromEntries(entries),
    }
  }

  return { containsUnresolved: false, value }
}

const resolveTokens = (
  value: unknown,
  ids: Map<string, number | string>,
  unresolved: Set<string>,
): unknown => resolveTokenValue(value, ids, unresolved).value

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

type MediaSourceTransport = {
  availability?: string
  fileHash?: string | null
  mimeType?: string
  relativePath?: string | null
}

const hashFile = (filePath: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(hash.digest('hex')))
  })

export const safeSourceFile = async (
  record: TargetRecord,
  runDir: string,
): Promise<string | undefined> => {
  if (record.target !== 'media') return undefined
  const source = record.data.source as MediaSourceTransport | undefined
  if (source?.availability === 'unavailable') {
    const placeholder = path.resolve(
      migrationConfig.projectRoot,
      'migration/assets/missing-media.svg',
    )
    if (!fs.existsSync(placeholder)) {
      throw new Error(`Missing unavailable-media placeholder for ${record.legacy.legacyId}`)
    }
    return placeholder
  }
  if (!source?.relativePath) {
    return undefined
  }

  const sourceRoot =
    source?.availability === 'recovered'
      ? path.resolve(runDir, 'recovered-media')
      : migrationConfig.source.uploads
  if (!fs.existsSync(sourceRoot)) {
    throw new Error(
      `Missing ${source?.availability === 'recovered' ? 'recovered' : 'local'} media root for WordPress attachment ${record.legacy.legacyId}: ${sourceRoot}`,
    )
  }
  const root = fs.realpathSync(sourceRoot)
  const candidate = path.resolve(root, source.relativePath)
  if (!candidate.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Unsafe media source path for WordPress attachment ${record.legacy.legacyId}`)
  }
  if (!fs.existsSync(candidate)) {
    throw new Error(
      `Missing media source for WordPress attachment ${record.legacy.legacyId}: ${candidate}`,
    )
  }
  const resolvedCandidate = fs.realpathSync(candidate)
  if (!resolvedCandidate.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Unsafe media source path for WordPress attachment ${record.legacy.legacyId}`)
  }
  if (!fs.statSync(resolvedCandidate).isFile()) {
    throw new Error(
      `Media source is not a regular file for WordPress attachment ${record.legacy.legacyId}`,
    )
  }
  if (!source.fileHash) {
    throw new Error(`Missing media fingerprint for WordPress attachment ${record.legacy.legacyId}`)
  }
  const actualHash = await hashFile(resolvedCandidate)
  if (actualHash !== source.fileHash) {
    throw new Error(
      `Media source changed after extraction for WordPress attachment ${record.legacy.legacyId}`,
    )
  }
  return resolvedCandidate
}

const storedMediaMatchesSource = (record: TargetRecord, existing?: PayloadDocument): boolean => {
  if (record.target !== 'media') return true
  if (!existing) return false

  const source = record.data.source as MediaSourceTransport | undefined
  const hasStoredFile =
    typeof existing.filename === 'string' &&
    existing.filename.length > 0 &&
    typeof existing.url === 'string' &&
    existing.url.length > 0
  if (!hasStoredFile) return false
  if (source?.availability === 'unavailable') return true

  return (
    typeof source?.fileHash === 'string' &&
    existing.sourceFileHash === source.fileHash &&
    typeof existing.mimeType === 'string' &&
    existing.mimeType === source.mimeType
  )
}

const sourceFileForOperation = async (
  record: TargetRecord,
  runDir: string,
  existing?: PayloadDocument,
): Promise<string | undefined> => {
  const sourceFile = await safeSourceFile(record, runDir)
  if (!existing || record.target !== 'media' || !sourceFile) return sourceFile

  // Metadata-only changes must not upload another object. Unavailable sources retain
  // their existing placeholder; local files are reused only when both their source
  // fingerprint and MIME type match the already imported object.
  if (storedMediaMatchesSource(record, existing)) return undefined

  return sourceFile
}

const recordLoadError = (
  phase: 'skeleton pass' | 'first pass' | 'relationship pass',
  record: TargetRecord,
  error: unknown,
): Error =>
  new Error(
    `Migration ${phase} failed for ${record.target}:${record.legacy.legacyId}: ${
      error instanceof Error ? error.message : String(error)
    }`,
    { cause: error },
  )

const findExisting = async (
  payload: SystemPayload,
  record: TargetRecord,
): Promise<PayloadDocument | undefined> => {
  if (record.target === 'global') return undefined

  if (record.target === 'redirects') {
    const from = record.data.from
    if (typeof from !== 'string' || !from.startsWith('/')) {
      throw new Error(
        `Redirect target ${record.legacy.legacyId} is missing a canonical source path.`,
      )
    }
    const result = await payload.find({
      collection: 'redirects',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { from: { equals: from } },
    })
    return result.docs[0]
  }

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
  verifyAcceptedRun(runId, runDir)
  const targets = readTargets(runDir).sort(
    (left, right) =>
      loadPriority[left.target] - loadPriority[right.target] ||
      left.legacy.legacyId - right.legacy.legacyId,
  )
  // Verify every source binary before opening Payload or writing application-owned
  // market data. This makes a stale or missing upload a pre-write failure instead
  // of leaving a partially applied migration for the retry path to repair.
  const mediaFiles = (
    await Promise.all(
      targets
        .filter((record) => record.target === 'media')
        .map((record) => safeSourceFile(record, runDir)),
    )
  ).filter(Boolean)
  if (options.dryRun) {
    const marketReport = await loadMarketData(runDir, { dryRun: true })

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
    const skeletonInsertions = new Set<string>()
    const report = {
      inserted: 0,
      updated: 0,
      unchanged: 0,
      globalsUpdated: 0,
      globalsUnchanged: 0,
      unresolved: [] as string[],
      marketData: marketReport,
    }

    // Establish IDs for route/content owners before loading full records. Hubs and
    // venues form a legitimate relationship cycle, while pages may link forward to
    // later pages. Minimal drafts make those IDs available without weakening any
    // required nested relationship during the complete write below.
    for (const record of targets) {
      if (!relationshipOwnerTargets.has(record.target)) continue

      const kind = referenceKindForTarget[record.target as TargetCollection]
      const existing = await findExisting(payload, record)
      if (existing) {
        if (kind) ids.set(tokenKey(kind, record.legacy.legacyId), existing.id)
        continue
      }

      let saved: PayloadDocument
      try {
        saved = await payload.create({
          collection: record.target,
          data: draftSkeletonData(record),
          context: { disableRevalidate: true, migration: true },
          draft: true,
          overrideAccess: true,
        })
      } catch (error) {
        throw recordLoadError('skeleton pass', record, error)
      }

      const recordKey = `${record.target}:${record.legacy.legacyId}`
      skeletonInsertions.add(recordKey)
      if (kind) ids.set(tokenKey(kind, record.legacy.legacyId), saved.id)
    }

    // Complete pass: all content-owner IDs now exist, so relationships can resolve
    // even when the source graph contains cycles or forward links.
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
      if (
        record.target !== 'redirects' &&
        existing?.legacySource?.contentHash === record.legacy.contentHash &&
        statusMatches &&
        storedMediaMatchesSource(record, existing)
      ) {
        report.unchanged += 1
        continue
      }

      const unresolved = new Set<string>()
      const data = resolvePayloadData(record, ids, unresolved)
      if (record.target === 'redirects' && existing && isEquivalentPayloadData(existing, data)) {
        report.unchanged += 1
        continue
      }
      if (record.target !== 'redirects') data.legacySource = record.legacy
      if ('_status' in data && !options.publish) {
        data._status = 'draft'
      }

      const filePath = await sourceFileForOperation(record, runDir, existing)
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

      let saved: PayloadDocument
      try {
        saved = await operation
      } catch (error) {
        throw recordLoadError('first pass', record, error)
      }
      const recordKey = `${record.target}:${record.legacy.legacyId}`
      changedRecords.add(recordKey)
      if (kind) {
        ids.set(tokenKey(kind, record.legacy.legacyId), saved.id)
      }
      if (skeletonInsertions.has(recordKey)) report.inserted += 1
      else if (existing) report.updated += 1
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
      if (record.target !== 'redirects') data.legacySource = record.legacy
      if ('_status' in data && !options.publish) {
        data._status = 'draft'
      }
      const desiredStatus = '_status' in data ? data._status : undefined
      const statusMatches = desiredStatus === undefined || existing._status === desiredStatus
      if (statusMatches && isEquivalentPayloadData(existing, data)) {
        continue
      }

      try {
        await payload.update({
          collection: record.target,
          id: existing.id,
          data,
          context: { disableRevalidate: true, migration: true },
          draft: data._status === 'draft',
          overrideAccess: true,
        })
      } catch (error) {
        throw recordLoadError('relationship pass', record, error)
      }
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
