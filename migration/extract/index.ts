import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { sourceRecordSchema, type SourceRecord } from '../contracts/v1'
import { atomicWriteText } from '../lib/acceptedRun'
import { migrationConfig } from '../lib/config'
import { run } from '../lib/process'
import { pilotScope } from '../scopes/pilot'
import { validateSource } from '../validate'

const safeRunId = (value: string): string => {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value)) {
    throw new Error('Run ID may contain only letters, numbers, dots, underscores, and hyphens.')
  }
  return value
}

const defaultRunId = (): string => new Date().toISOString().replace(/[:.]/g, '-')

export type ExtractionResult = {
  runId: string
  runDir: string
  records: SourceRecord[]
}

export const extract = (requestedRunId?: string): ExtractionResult => {
  const runId = safeRunId(requestedRunId || defaultRunId())
  const runDir = path.resolve(migrationConfig.workDir, runId)

  if (!runDir.startsWith(`${migrationConfig.workDir}${path.sep}`)) {
    throw new Error('Refusing to write migration output outside the configured work directory.')
  }
  if (fs.existsSync(runDir)) {
    throw new Error(`Migration run ${runId} already exists; extract into a new run ID.`)
  }

  fs.mkdirSync(path.join(runDir, 'reports'), { recursive: true })

  const containerExporter = `/tmp/trayport-pilot-export-${process.pid}.php`
  run('docker', [
    'cp',
    migrationConfig.exporterPath,
    `${migrationConfig.source.container}:${containerExporter}`,
  ])

  let stdout = ''
  try {
    stdout = run('docker', [
      'exec',
      '-w',
      migrationConfig.source.root,
      '-e',
      `TP_PILOT_ROOT_IDS=${pilotScope.roots.map(({ legacyId }) => legacyId).join(',')}`,
      '-e',
      'TP_POC_HUB_ID=2495',
      migrationConfig.source.container,
      'wp',
      '--allow-root',
      'eval-file',
      containerExporter,
    ]).stdout
  } finally {
    run('docker', ['exec', migrationConfig.source.container, 'rm', '-f', containerExporter], {
      quiet: true,
    })
  }

  const records = stdout
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith('{'))
    .map((line, index) => {
      try {
        return sourceRecordSchema.parse(JSON.parse(line))
      } catch (error) {
        throw new Error(`Invalid source record on exporter line ${index + 1}: ${String(error)}`)
      }
    })

  const sourceText = `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
  const sourceHash = crypto.createHash('sha256').update(sourceText).digest('hex')
  const counts = Object.fromEntries(
    [...new Set(records.map(({ entity }) => entity))]
      .sort()
      .map((entity) => [entity, records.filter((record) => record.entity === entity).length]),
  )

  atomicWriteText(path.join(runDir, 'source.ndjson'), sourceText)
  atomicWriteText(
    path.join(runDir, 'source-manifest.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        runId,
        sourceHash,
        roots: pilotScope.roots,
        counts,
      },
      null,
      2,
    )}\n`,
  )
  validateSource(runId, runDir, records)
  atomicWriteText(path.join(migrationConfig.workDir, 'latest-run.txt'), `${runId}\n`)

  process.stdout.write(
    `${JSON.stringify({ ok: true, runId, runDir, sourceHash, counts }, null, 2)}\n`,
  )

  return { runId, runDir, records }
}
