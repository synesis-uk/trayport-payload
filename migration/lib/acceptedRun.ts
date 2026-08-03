import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { migrationConfig } from './config'

export const acceptedRunArtifactPaths = [
  'source.ndjson',
  'source-manifest.json',
  'transformed.ndjson',
  'market-volume.ndjson',
  'reports/acceptance-source.json',
  'reports/acceptance-transform.json',
  'reports/content-review.json',
  'reports/transform-coverage.json',
] as const

export const acceptedRunSupportArtifactPaths = [
  'migration/assets/missing-media.svg',
  'migration/sql/001_market_volume_monthly.sql',
] as const

export const acceptedRunMarkerName = 'accepted-run.json'
const acceptedRunSchemaVersion = 3 as const

type AcceptedRunArtifactPath = (typeof acceptedRunArtifactPaths)[number]
type AcceptedRunSupportArtifactPath = (typeof acceptedRunSupportArtifactPaths)[number]

export type AcceptedRunMarker = {
  acceptanceHash: string
  artifacts: Record<AcceptedRunArtifactPath, string>
  runId: string
  schemaVersion: typeof acceptedRunSchemaVersion
  supportArtifacts: Record<AcceptedRunSupportArtifactPath, string>
}

const sha256 = (value: string | Buffer): string =>
  crypto.createHash('sha256').update(value).digest('hex')

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const readJSON = (filePath: string): Record<string, unknown> => {
  const value = JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown
  if (!isRecord(value)) throw new Error(`Expected a JSON object in ${filePath}`)
  return value
}

const assertRunDirectory = (runId: string, runDir: string): void => {
  const expected = path.resolve(migrationConfig.workDir, runId)
  const resolved = path.resolve(runDir)
  if (
    resolved !== expected ||
    !resolved.startsWith(`${path.resolve(migrationConfig.workDir)}${path.sep}`)
  ) {
    throw new Error(`Unsafe migration run directory for ${runId}: ${runDir}`)
  }
}

const markerPath = (runDir: string): string => path.join(runDir, 'reports', acceptedRunMarkerName)

export const atomicWriteText = (filePath: string, value: string): void => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const temporaryPath = `${filePath}.${process.pid}.${crypto.randomUUID()}.tmp`

  try {
    fs.writeFileSync(temporaryPath, value, { flag: 'wx' })
    fs.renameSync(temporaryPath, filePath)
  } finally {
    fs.rmSync(temporaryPath, { force: true })
  }
}

const assertAcceptedEvidence = (runId: string, runDir: string): void => {
  for (const reportName of ['acceptance-source.json', 'acceptance-transform.json'] as const) {
    const report = readJSON(path.join(runDir, 'reports', reportName))
    if (report.ok !== true || report.runId !== runId) {
      throw new Error(
        `Migration run ${runId} does not have matching passing evidence in reports/${reportName}.`,
      )
    }
  }

  for (const reportName of ['content-review.json', 'transform-coverage.json'] as const) {
    const report = readJSON(path.join(runDir, 'reports', reportName))
    if (report.runId !== runId) {
      throw new Error(`Migration run ${runId} has mismatched evidence in reports/${reportName}.`)
    }
  }

  const sourcePath = path.join(runDir, 'source.ndjson')
  const manifest = readJSON(path.join(runDir, 'source-manifest.json'))
  const sourceHash = sha256(fs.readFileSync(sourcePath))
  if (manifest.runId !== runId || manifest.sourceHash !== sourceHash) {
    throw new Error(`Migration run ${runId} source manifest does not match source.ndjson.`)
  }
}

const artifactHashes = (runDir: string): AcceptedRunMarker['artifacts'] =>
  Object.fromEntries(
    acceptedRunArtifactPaths.map((artifactPath) => {
      const filePath = path.join(runDir, artifactPath)
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        throw new Error(`Accepted migration evidence is missing ${artifactPath}.`)
      }
      return [artifactPath, sha256(fs.readFileSync(filePath))]
    }),
  ) as AcceptedRunMarker['artifacts']

const supportArtifactHashes = (): AcceptedRunMarker['supportArtifacts'] =>
  Object.fromEntries(
    acceptedRunSupportArtifactPaths.map((artifactPath) => {
      const filePath = path.resolve(migrationConfig.projectRoot, artifactPath)
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        throw new Error(`Accepted migration support artifact is missing ${artifactPath}.`)
      }
      return [artifactPath, sha256(fs.readFileSync(filePath))]
    }),
  ) as AcceptedRunMarker['supportArtifacts']

const acceptanceHashFor = (
  runId: string,
  artifacts: AcceptedRunMarker['artifacts'],
  supportArtifacts: AcceptedRunMarker['supportArtifacts'],
): string =>
  sha256(
    JSON.stringify({
      artifacts,
      runId,
      schemaVersion: acceptedRunSchemaVersion,
      supportArtifacts,
    }),
  )

const buildMarker = (runId: string, runDir: string): AcceptedRunMarker => {
  assertAcceptedEvidence(runId, runDir)
  const artifacts = artifactHashes(runDir)
  const supportArtifacts = supportArtifactHashes()
  return {
    acceptanceHash: acceptanceHashFor(runId, artifacts, supportArtifacts),
    artifacts,
    runId,
    schemaVersion: acceptedRunSchemaVersion,
    supportArtifacts,
  }
}

const parseMarker = (value: unknown): AcceptedRunMarker => {
  if (
    !isRecord(value) ||
    value.schemaVersion !== acceptedRunSchemaVersion ||
    typeof value.runId !== 'string'
  ) {
    throw new Error('Accepted migration marker has an invalid schema.')
  }
  if (
    typeof value.acceptanceHash !== 'string' ||
    !isRecord(value.artifacts) ||
    !isRecord(value.supportArtifacts)
  ) {
    throw new Error('Accepted migration marker is missing its artifact hashes.')
  }

  const artifactKeys = Object.keys(value.artifacts)
  if (
    artifactKeys.length !== acceptedRunArtifactPaths.length ||
    acceptedRunArtifactPaths.some((artifactPath) => !artifactKeys.includes(artifactPath))
  ) {
    throw new Error('Accepted migration marker does not cover the complete artifact set.')
  }
  for (const artifactPath of acceptedRunArtifactPaths) {
    if (!/^[a-f\d]{64}$/.test(value.artifacts[artifactPath] as string)) {
      throw new Error(`Accepted migration marker has an invalid hash for ${artifactPath}.`)
    }
  }

  const supportArtifactKeys = Object.keys(value.supportArtifacts)
  if (
    supportArtifactKeys.length !== acceptedRunSupportArtifactPaths.length ||
    acceptedRunSupportArtifactPaths.some(
      (artifactPath) => !supportArtifactKeys.includes(artifactPath),
    )
  ) {
    throw new Error('Accepted migration marker does not cover the complete support artifact set.')
  }
  for (const artifactPath of acceptedRunSupportArtifactPaths) {
    if (!/^[a-f\d]{64}$/.test(value.supportArtifacts[artifactPath] as string)) {
      throw new Error(`Accepted migration marker has an invalid hash for ${artifactPath}.`)
    }
  }

  const artifacts = value.artifacts as AcceptedRunMarker['artifacts']
  const supportArtifacts = value.supportArtifacts as AcceptedRunMarker['supportArtifacts']
  if (value.acceptanceHash !== acceptanceHashFor(value.runId, artifacts, supportArtifacts)) {
    throw new Error('Accepted migration marker has an invalid acceptance hash.')
  }

  return value as AcceptedRunMarker
}

const readMarker = (runDir: string): AcceptedRunMarker =>
  parseMarker(JSON.parse(fs.readFileSync(markerPath(runDir), 'utf8')) as unknown)

export const assertRunNotAccepted = (runId: string, runDir: string): void => {
  assertRunDirectory(runId, runDir)
  if (fs.existsSync(markerPath(runDir))) {
    throw new Error(
      `Migration run ${runId} is already accepted and immutable; extract or transform into a new run.`,
    )
  }
}

export const sealAcceptedRun = (runId: string, runDir: string): AcceptedRunMarker => {
  assertRunDirectory(runId, runDir)
  const expected = buildMarker(runId, runDir)
  const acceptedPath = markerPath(runDir)

  if (fs.existsSync(acceptedPath)) {
    const existing = readMarker(runDir)
    if (JSON.stringify(existing) !== JSON.stringify(expected)) {
      throw new Error(
        `Migration run ${runId} is already accepted and its artifacts are immutable; use a new run ID.`,
      )
    }
    return existing
  }

  atomicWriteText(acceptedPath, `${JSON.stringify(expected, null, 2)}\n`)
  return expected
}

export const verifyAcceptedRun = (runId: string, runDir: string): AcceptedRunMarker => {
  assertRunDirectory(runId, runDir)
  const acceptedPath = markerPath(runDir)
  if (!fs.existsSync(acceptedPath)) {
    throw new Error(
      `Migration run ${runId} is not accepted. Run the source and transformed validation before loading.`,
    )
  }

  const marker = readMarker(runDir)
  if (marker.runId !== runId) {
    throw new Error(`Accepted migration marker belongs to ${marker.runId}, not ${runId}.`)
  }

  const current = buildMarker(runId, runDir)
  for (const artifactPath of acceptedRunArtifactPaths) {
    if (marker.artifacts[artifactPath] !== current.artifacts[artifactPath]) {
      throw new Error(
        `Accepted migration artifact changed after validation: ${artifactPath}. Use a new run ID.`,
      )
    }
  }
  for (const artifactPath of acceptedRunSupportArtifactPaths) {
    if (marker.supportArtifacts[artifactPath] !== current.supportArtifacts[artifactPath]) {
      throw new Error(
        `Accepted migration support artifact changed after validation: ${artifactPath}. Use a new run ID.`,
      )
    }
  }
  if (marker.acceptanceHash !== current.acceptanceHash) {
    throw new Error(`Migration run ${runId} no longer matches its accepted artifact hash.`)
  }

  return marker
}
