import type { SourceMedia, SourceRecord } from '../contracts/v1'

export type MediaRecoveryEvidenceRecord = {
  fileHash: string
  fileSize: number
  legacyId: number
  recoveryURL: string
  relativePath: string
}

export type MediaRecoveryEvidence = {
  origin: string
  records: MediaRecoveryEvidenceRecord[]
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const normalizedHTTPSOrigin = (value: unknown): string => {
  if (typeof value !== 'string') throw new Error('Media recovery evidence is missing its origin.')

  const parsed = new URL(value)
  if (
    parsed.protocol !== 'https:' ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== '/' ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error('Media recovery evidence must use one credential-free HTTPS origin.')
  }
  return parsed.origin
}

const parseEvidenceRecord = (value: unknown): MediaRecoveryEvidenceRecord => {
  if (!isObject(value)) throw new Error('Media recovery evidence contains an invalid record.')

  const record = value as Partial<MediaRecoveryEvidenceRecord>
  if (
    !Number.isInteger(record.legacyId) ||
    Number(record.legacyId) <= 0 ||
    typeof record.fileHash !== 'string' ||
    !/^[a-f0-9]{64}$/.test(record.fileHash) ||
    !Number.isInteger(record.fileSize) ||
    Number(record.fileSize) <= 0 ||
    typeof record.relativePath !== 'string' ||
    !record.relativePath ||
    typeof record.recoveryURL !== 'string'
  ) {
    throw new Error('Media recovery evidence contains an invalid record.')
  }

  return record as MediaRecoveryEvidenceRecord
}

export const parseMediaRecoveryEvidence = (
  manifest: Record<string, unknown>,
): MediaRecoveryEvidence | null => {
  if (manifest.mediaRecovery === undefined) return null
  if (!isObject(manifest.mediaRecovery)) {
    throw new Error('Source manifest media recovery evidence is invalid.')
  }

  const origin = normalizedHTTPSOrigin(manifest.mediaRecovery.origin)
  if (!Array.isArray(manifest.mediaRecovery.records)) {
    throw new Error('Source manifest media recovery evidence is missing its records.')
  }

  const records = manifest.mediaRecovery.records.map(parseEvidenceRecord)
  const legacyIds = records.map(({ legacyId }) => legacyId)
  if (
    new Set(legacyIds).size !== legacyIds.length ||
    legacyIds.some((legacyId, index) => index > 0 && legacyIds[index - 1]! >= legacyId)
  ) {
    throw new Error('Media recovery evidence must have unique records sorted by legacy ID.')
  }

  for (const record of records) {
    const recoveryURL = new URL(record.recoveryURL)
    if (recoveryURL.protocol !== 'https:' || recoveryURL.origin !== origin) {
      throw new Error(
        `Media recovery evidence for WordPress attachment ${record.legacyId} changed origin.`,
      )
    }
  }

  return { origin, records }
}

export const recoveryEvidenceForMedia = (record: SourceMedia): MediaRecoveryEvidenceRecord => {
  if (
    record.availability !== 'recovered' ||
    !record.relativePath ||
    !record.recoveryURL ||
    !record.fileHash ||
    !record.fileSize
  ) {
    throw new Error(
      `Recovered WordPress attachment ${record.legacyId} is missing recovery evidence.`,
    )
  }

  return {
    fileHash: record.fileHash,
    fileSize: record.fileSize,
    legacyId: record.legacyId,
    recoveryURL: record.recoveryURL,
    relativePath: record.relativePath,
  }
}

export const assertMediaRecoveryEvidenceMatchesSource = (
  records: SourceRecord[],
  manifest: Record<string, unknown>,
): void => {
  const recovered = records
    .filter(
      (record): record is SourceMedia =>
        record.entity === 'media' && record.availability === 'recovered',
    )
    .map(recoveryEvidenceForMedia)
    .sort((left, right) => left.legacyId - right.legacyId)
  const evidence = parseMediaRecoveryEvidence(manifest)

  if (!recovered.length) {
    if (evidence?.records.length) {
      throw new Error('Source manifest claims recovered media that source.ndjson does not contain.')
    }
    return
  }
  if (!evidence) {
    throw new Error('Recovered source media is missing source-manifest provenance evidence.')
  }

  for (const record of recovered) {
    if (new URL(record.recoveryURL).origin !== evidence.origin) {
      throw new Error(
        `Recovered WordPress attachment ${record.legacyId} does not match the manifest origin.`,
      )
    }
  }
  if (JSON.stringify(evidence.records) !== JSON.stringify(recovered)) {
    throw new Error('Source manifest media recovery evidence does not match source.ndjson.')
  }
}
