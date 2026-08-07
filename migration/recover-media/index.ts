import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import sharp from 'sharp'

import { sourceRecordSchema, type SourceRecord } from '../contracts/v1'
import { assertRunNotAccepted, atomicWriteText } from '../lib/acceptedRun'
import { migrationConfig } from '../lib/config'
import {
  assertMediaRecoveryEvidenceMatchesSource,
  parseMediaRecoveryEvidence,
  recoveryEvidenceForMedia,
  type MediaRecoveryEvidenceRecord,
} from '../lib/mediaRecoveryEvidence'
import { validateSource } from '../validate'

type SourceMedia = Extract<SourceRecord, { entity: 'media' }>

type FetchMedia = (input: string | URL, init?: RequestInit) => Promise<Response>

export type RecoverMediaOptions = {
  fetchImpl?: FetchMedia
  legacyIds: number[]
  origin: string
  runId?: string
}

export type RecoveredMedia = MediaRecoveryEvidenceRecord

export type RecoverMediaResult = {
  origin: string
  recovered: RecoveredMedia[]
  runDir: string
  runId: string
}

const maximumRecoveryBytes = 64 * 1024 * 1024
const recoveryTimeoutMilliseconds = 30_000

const mimeTypeBySharpFormat: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  heif: 'image/heif',
  jpeg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  tiff: 'image/tiff',
  webp: 'image/webp',
}

const resolveRunId = (requested?: string): string => {
  if (requested) return requested
  const latest = path.join(migrationConfig.workDir, 'latest-run.txt')
  if (!fs.existsSync(latest)) {
    throw new Error('No migration run supplied and migration/work/latest-run.txt does not exist.')
  }
  return fs.readFileSync(latest, 'utf8').trim()
}

export const normalizeMediaRecoveryOrigin = (value: string): string => {
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new Error('Media recovery origin must be an absolute HTTPS origin.')
  }

  if (
    parsed.protocol !== 'https:' ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== '/' ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(
      'Media recovery origin must be HTTPS and must not contain credentials, a path, query, or fragment.',
    )
  }

  return parsed.origin
}

const safeRelativePath = (value: string | null, legacyId: number): string => {
  if (
    !value ||
    value.includes('\\') ||
    path.posix.isAbsolute(value) ||
    path.posix.normalize(value) !== value ||
    value.split('/').some((segment) => !segment || segment === '.' || segment === '..')
  ) {
    throw new Error(`Unsafe recovery path for WordPress attachment ${legacyId}.`)
  }
  return value
}

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const recoveryURLFor = (record: SourceMedia, origin: string, relativePath: string): string => {
  if (!record.url) {
    throw new Error(`WordPress attachment ${record.legacyId} has no original media URL.`)
  }

  const original = new URL(record.url)
  let decodedPath: string
  try {
    decodedPath = decodeURIComponent(original.pathname)
  } catch {
    throw new Error(`WordPress attachment ${record.legacyId} has an invalid encoded media path.`)
  }

  // The recorded URL must identify the same uploads file the record claims, so recovery can never
  // be pointed at arbitrary content. Records served from the CDN carry an extra upload-timestamp
  // directory — /app/uploads/2026/07/06152303/name.png for 2026/07/name.png — so the year/month
  // prefix and the filename must both match while that segment is allowed between them.
  const expectedPath = `/app/uploads/${relativePath}`
  const segments = relativePath.split('/')
  const timestampedPath = new RegExp(
    `^/app/uploads/${segments.slice(0, -1).map(escapeRegExp).join('/')}/\\d+/${escapeRegExp(
      segments[segments.length - 1] || '',
    )}$`,
  )
  if (
    (decodedPath !== expectedPath && !timestampedPath.test(decodedPath)) ||
    original.search ||
    original.hash
  ) {
    throw new Error(
      `WordPress attachment ${record.legacyId} URL does not match its uploads-relative path.`,
    )
  }

  const encodedPath = `/app/uploads/${relativePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`
  return new URL(encodedPath, `${origin}/`).toString()
}

const assertImageMetadata = async (record: SourceMedia, body: Buffer): Promise<void> => {
  if (!record.mimeType.startsWith('image/')) {
    throw new Error(
      `WordPress attachment ${record.legacyId} is ${record.mimeType}; recovery currently accepts reviewed image binaries only.`,
    )
  }

  const metadata = await sharp(body, { failOn: 'error' }).metadata()
  const detectedMimeType = metadata.format ? mimeTypeBySharpFormat[metadata.format] : undefined
  if (!detectedMimeType || detectedMimeType !== record.mimeType) {
    throw new Error(
      `Recovered media ${record.legacyId} content is ${detectedMimeType || 'unknown'}, expected ${record.mimeType}.`,
    )
  }
  if (record.width && metadata.width !== record.width) {
    throw new Error(
      `Recovered media ${record.legacyId} width is ${metadata.width || 'unknown'}, expected ${record.width}.`,
    )
  }
  if (record.height && metadata.height !== record.height) {
    throw new Error(
      `Recovered media ${record.legacyId} height is ${metadata.height || 'unknown'}, expected ${record.height}.`,
    )
  }
}

const writeRecoveredBinary = (filePath: string, body: Buffer, fileHash: string): void => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  if (fs.existsSync(filePath)) {
    const existingHash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
    if (existingHash !== fileHash) {
      throw new Error(`Recovered media path already exists with different content: ${filePath}`)
    }
    return
  }

  const temporaryPath = `${filePath}.${process.pid}.${crypto.randomUUID()}.tmp`
  try {
    fs.writeFileSync(temporaryPath, body, { flag: 'wx' })
    fs.renameSync(temporaryPath, filePath)
  } finally {
    fs.rmSync(temporaryPath, { force: true })
  }
}

export const readRecoveryResponseBody = async (
  response: Response,
  legacyId: number,
  maximumBytes = maximumRecoveryBytes,
): Promise<Buffer> => {
  const reader = response.body?.getReader()
  if (!reader) throw new Error(`Recovered media ${legacyId} response has no body.`)

  const chunks: Buffer[] = []
  let totalBytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value?.byteLength) continue

    totalBytes += value.byteLength
    if (totalBytes > maximumBytes) {
      await reader.cancel().catch(() => undefined)
      throw new Error(`Recovered media ${legacyId} exceeds the configured recovery byte limit.`)
    }
    chunks.push(Buffer.from(value))
  }

  if (!totalBytes) throw new Error(`Recovered media ${legacyId} has an empty body.`)
  return Buffer.concat(chunks, totalBytes)
}

export const verifiedRecoveryResult = (
  record: SourceMedia,
  origin: string,
  recoveryRoot: string,
): RecoveredMedia => {
  const evidence = recoveryEvidenceForMedia(record)
  const relativePath = safeRelativePath(evidence.relativePath, record.legacyId)
  if (recoveryURLFor(record, origin, relativePath) !== evidence.recoveryURL) {
    throw new Error(
      `Recovered WordPress attachment ${record.legacyId} does not match the requested origin and path.`,
    )
  }

  const filePath = path.resolve(recoveryRoot, relativePath)
  if (
    !filePath.startsWith(`${recoveryRoot}${path.sep}`) ||
    !fs.existsSync(filePath) ||
    !fs.statSync(filePath).isFile()
  ) {
    throw new Error(
      `Recovered media binary is missing for WordPress attachment ${record.legacyId}.`,
    )
  }
  const body = fs.readFileSync(filePath)
  const fileHash = crypto.createHash('sha256').update(body).digest('hex')
  if (body.length !== evidence.fileSize || fileHash !== evidence.fileHash) {
    throw new Error(
      `Recovered media binary does not match its evidence for WordPress attachment ${record.legacyId}.`,
    )
  }
  return evidence
}

export const mediaRecordFromEvidence = (
  record: SourceMedia,
  evidence: RecoveredMedia,
  origin: string,
): SourceMedia => {
  if (record.availability === 'local') {
    throw new Error(
      `Source manifest recovery evidence conflicts with local WordPress attachment ${record.legacyId}.`,
    )
  }
  const relativePath = safeRelativePath(record.relativePath, record.legacyId)
  if (
    evidence.legacyId !== record.legacyId ||
    evidence.relativePath !== relativePath ||
    evidence.recoveryURL !== recoveryURLFor(record, origin, relativePath)
  ) {
    throw new Error(
      `Source manifest recovery evidence does not match WordPress attachment ${record.legacyId}.`,
    )
  }

  const recoveredRecord: SourceMedia = {
    ...record,
    availability: 'recovered',
    availabilityReason: null,
    fileHash: evidence.fileHash,
    fileSize: evidence.fileSize,
    recoveryURL: evidence.recoveryURL,
  }
  if (
    record.availability === 'recovered' &&
    JSON.stringify(recoveryEvidenceForMedia(record)) !== JSON.stringify(evidence)
  ) {
    throw new Error(
      `Source and manifest recovery evidence differ for WordPress attachment ${record.legacyId}.`,
    )
  }
  return recoveredRecord
}

export const recoverMediaRecord = async (
  record: SourceMedia,
  origin: string,
  recoveryRoot: string,
  fetchImpl: FetchMedia,
): Promise<{ record: SourceMedia; result: RecoveredMedia }> => {
  if (record.availability !== 'unavailable') {
    throw new Error(
      `WordPress attachment ${record.legacyId} is already ${record.availability}; only unavailable media may be recovered.`,
    )
  }

  const relativePath = safeRelativePath(record.relativePath, record.legacyId)
  const recoveryURL = recoveryURLFor(record, origin, relativePath)
  const controller = new AbortController()
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      controller.abort()
      reject(
        new Error(
          `Media recovery timed out for WordPress attachment ${record.legacyId} after 30 seconds.`,
        ),
      )
    }, recoveryTimeoutMilliseconds)
  })

  let body: Buffer
  let declaredLength: number | null
  try {
    const download = async (): Promise<{ body: Buffer; declaredLength: number | null }> => {
      const response = await fetchImpl(recoveryURL, {
        headers: { Accept: record.mimeType },
        redirect: 'error',
        signal: controller.signal,
      })
      if (!response.ok) {
        throw new Error(
          `Media recovery failed for WordPress attachment ${record.legacyId}: HTTP ${response.status}.`,
        )
      }
      if (response.url && new URL(response.url).origin !== origin) {
        throw new Error(
          `Media recovery for WordPress attachment ${record.legacyId} changed origin.`,
        )
      }

      const responseMimeType = response.headers.get('content-type')?.split(';', 1)[0]?.trim()
      if (responseMimeType !== record.mimeType) {
        throw new Error(
          `Recovered media ${record.legacyId} response is ${responseMimeType || 'missing a MIME type'}, expected ${record.mimeType}.`,
        )
      }
      const contentLength = response.headers.get('content-length')
      const parsedLength = contentLength === null ? null : Number(contentLength)
      if (parsedLength !== null && (!Number.isFinite(parsedLength) || parsedLength < 0)) {
        throw new Error(`Recovered media ${record.legacyId} has an invalid response length.`)
      }
      if (parsedLength !== null && parsedLength > maximumRecoveryBytes) {
        throw new Error(`Recovered media ${record.legacyId} exceeds the 64 MiB recovery limit.`)
      }

      return {
        body: await readRecoveryResponseBody(response, record.legacyId),
        declaredLength: parsedLength,
      }
    }

    ;({ body, declaredLength } = await Promise.race([download(), timeout]))
  } catch (error) {
    controller.abort()
    throw error
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle)
  }

  if (record.fileSize && body.length !== record.fileSize) {
    throw new Error(
      `Recovered media ${record.legacyId} is ${body.length} bytes, expected ${record.fileSize}.`,
    )
  }
  if (declaredLength !== null && declaredLength > 0 && body.length !== declaredLength) {
    throw new Error(
      `Recovered media ${record.legacyId} body length does not match its response header.`,
    )
  }
  await assertImageMetadata(record, body)

  const fileHash = crypto.createHash('sha256').update(body).digest('hex')
  const filePath = path.resolve(recoveryRoot, relativePath)
  if (!filePath.startsWith(`${recoveryRoot}${path.sep}`)) {
    throw new Error(`Unsafe recovery destination for WordPress attachment ${record.legacyId}.`)
  }
  writeRecoveredBinary(filePath, body, fileHash)

  const recoveredRecord: SourceMedia = {
    ...record,
    availability: 'recovered',
    availabilityReason: null,
    fileHash,
    fileSize: body.length,
    recoveryURL,
  }
  return {
    record: recoveredRecord,
    result: {
      fileHash,
      fileSize: body.length,
      legacyId: record.legacyId,
      recoveryURL,
      relativePath,
    },
  }
}

export const recoverMedia = async (options: RecoverMediaOptions): Promise<RecoverMediaResult> => {
  const origin = normalizeMediaRecoveryOrigin(options.origin)
  const legacyIds = [...new Set(options.legacyIds)].sort((left, right) => left - right)
  if (!legacyIds.length || legacyIds.some((value) => !Number.isInteger(value) || value <= 0)) {
    throw new Error('Media recovery requires one or more positive WordPress attachment IDs.')
  }

  const runId = resolveRunId(options.runId)
  const runDir = path.resolve(migrationConfig.workDir, runId)
  assertRunNotAccepted(runId, runDir)
  if (fs.existsSync(path.join(runDir, 'transformed.ndjson'))) {
    throw new Error(
      `Migration run ${runId} is already transformed; recover media in a fresh extracted run.`,
    )
  }

  const sourcePath = path.join(runDir, 'source.ndjson')
  const manifestPath = path.join(runDir, 'source-manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, unknown>
  const existingEvidence = parseMediaRecoveryEvidence(manifest)
  if (existingEvidence && existingEvidence.origin !== origin) {
    throw new Error(
      `Migration run ${runId} already uses ${existingEvidence.origin} for media recovery; use the same origin or extract a new run.`,
    )
  }

  const records = fs
    .readFileSync(sourcePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => sourceRecordSchema.parse(JSON.parse(line)))
  const mediaByLegacyId = new Map(
    records
      .filter((record): record is SourceMedia => record.entity === 'media')
      .map((record) => [record.legacyId, record] as const),
  )
  const missing = legacyIds.filter((legacyId) => !mediaByLegacyId.has(legacyId))
  if (missing.length) {
    throw new Error(
      `Media recovery IDs are outside the extracted source graph: ${missing.join(', ')}`,
    )
  }

  const recoveryRoot = path.resolve(runDir, 'recovered-media')
  const replacements = new Map<number, SourceMedia>()

  // Reconcile either side of an interrupted two-file commit. A manifest-ahead
  // record can promote its still-unavailable source record after its binary is
  // verified; a source-ahead record can reconstruct its missing manifest row.
  for (const evidence of existingEvidence?.records || []) {
    const sourceRecord = mediaByLegacyId.get(evidence.legacyId)
    if (!sourceRecord) {
      throw new Error(
        `Source manifest recovery evidence is outside the extracted graph: ${evidence.legacyId}`,
      )
    }
    const reconciled = mediaRecordFromEvidence(sourceRecord, evidence, origin)
    verifiedRecoveryResult(reconciled, origin, recoveryRoot)
    replacements.set(reconciled.legacyId, reconciled)
    mediaByLegacyId.set(reconciled.legacyId, reconciled)
  }
  for (const sourceRecord of mediaByLegacyId.values()) {
    if (sourceRecord.availability !== 'recovered') continue
    verifiedRecoveryResult(sourceRecord, origin, recoveryRoot)
    replacements.set(sourceRecord.legacyId, sourceRecord)
  }

  const fetchImpl = options.fetchImpl || fetch
  const requestedResults: RecoveredMedia[] = []
  const stagedRecoveries: Array<{ record: SourceMedia; result: RecoveredMedia }> = []
  const stagingRoot = fs.mkdtempSync(path.join(runDir, '.media-recovery-stage-'))
  try {
    // Deliberately sequential: every response has a hard cap, and the command
    // never buffers multiple 64 MiB candidates concurrently.
    for (const legacyId of legacyIds) {
      const sourceRecord = mediaByLegacyId.get(legacyId)!
      if (sourceRecord.availability === 'local') {
        throw new Error(
          `WordPress attachment ${legacyId} is already local and does not require recovery.`,
        )
      }
      if (sourceRecord.availability === 'recovered') {
        requestedResults.push(verifiedRecoveryResult(sourceRecord, origin, recoveryRoot))
        continue
      }

      const recovered = await recoverMediaRecord(sourceRecord, origin, stagingRoot, fetchImpl)
      stagedRecoveries.push(recovered)
      requestedResults.push(recovered.result)
    }

    // Publish staged binaries only after every selected download and metadata
    // check succeeds. Existing identical files make a retry idempotent.
    for (const recovered of stagedRecoveries) {
      const stagedPath = path.resolve(stagingRoot, recovered.result.relativePath)
      const finalPath = path.resolve(recoveryRoot, recovered.result.relativePath)
      if (
        !stagedPath.startsWith(`${stagingRoot}${path.sep}`) ||
        !finalPath.startsWith(`${recoveryRoot}${path.sep}`)
      ) {
        throw new Error(
          `Unsafe recovery destination for WordPress attachment ${recovered.result.legacyId}.`,
        )
      }
      writeRecoveredBinary(finalPath, fs.readFileSync(stagedPath), recovered.result.fileHash)
      replacements.set(recovered.record.legacyId, recovered.record)
      mediaByLegacyId.set(recovered.record.legacyId, recovered.record)
    }
  } finally {
    fs.rmSync(stagingRoot, { force: true, recursive: true })
  }

  const updatedRecords = records.map((record) =>
    record.entity === 'media' && replacements.has(record.legacyId)
      ? replacements.get(record.legacyId)!
      : record,
  )
  const sourceText = `${updatedRecords.map((record) => JSON.stringify(record)).join('\n')}\n`
  const sourceHash = crypto.createHash('sha256').update(sourceText).digest('hex')
  const recoveryEvidence = updatedRecords
    .filter(
      (record): record is SourceMedia =>
        record.entity === 'media' && record.availability === 'recovered',
    )
    .map(recoveryEvidenceForMedia)
    .sort((left, right) => left.legacyId - right.legacyId)
  const updatedManifest = {
    ...manifest,
    mediaRecovery: {
      origin,
      records: recoveryEvidence,
    },
    sourceHash,
  }

  assertMediaRecoveryEvidenceMatchesSource(updatedRecords, updatedManifest)
  // Manifest-first plus the reconciliation above makes a crash between these
  // two atomic renames self-healing on the next identical command invocation.
  atomicWriteText(manifestPath, `${JSON.stringify(updatedManifest, null, 2)}\n`)
  atomicWriteText(sourcePath, sourceText)
  validateSource(runId, runDir, updatedRecords)

  const result = {
    origin,
    recovered: requestedResults,
    runDir,
    runId,
  }
  process.stdout.write(`${JSON.stringify({ ok: true, ...result }, null, 2)}\n`)
  return result
}
