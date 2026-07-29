import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { migrationConfig } from '../lib/config'
import { run } from '../lib/process'
import { productionScope } from '../scopes/production'
import { runtimeInventorySnapshotSchema } from './contracts'
import { discoverProductionInventory } from './discover'
import { buildInventoryArtifacts } from './report'

const safeRunId = (value: string): string => {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value)) {
    throw new Error('Run ID may contain only letters, numbers, dots, underscores, and hyphens.')
  }
  return value
}

const defaultRunId = (): string => new Date().toISOString().replace(/[:.]/g, '-')

const sha256 = (value: string): string => crypto.createHash('sha256').update(value).digest('hex')

const readRuntimeSnapshot = (): unknown => {
  const running = run('docker', [
    'inspect',
    '--format',
    '{{.State.Running}}',
    migrationConfig.source.container,
  ]).stdout.trim()
  if (running !== 'true') {
    throw new Error(
      `WordPress source container is not running: ${migrationConfig.source.container}`,
    )
  }

  const localExporter = path.resolve(migrationConfig.projectRoot, 'migration/inventory/export.php')
  const containerExporter = `/tmp/trayport-production-inventory-${process.pid}.php`
  run('docker', ['cp', localExporter, `${migrationConfig.source.container}:${containerExporter}`])

  try {
    const stdout = run('docker', [
      'exec',
      '-w',
      migrationConfig.source.root,
      '-e',
      `TP_INVENTORY_NAVIGATION_FIELD=${productionScope.optionFields.navigation}`,
      '-e',
      `TP_INVENTORY_FOOTER_FIELD=${productionScope.optionFields.footer}`,
      '-e',
      `TP_INVENTORY_STATUSES=${productionScope.candidateStatuses.join(',')}`,
      '-e',
      `TP_INVENTORY_EXCLUDED_POST_TYPES=${productionScope.excludedPostTypes.join(',')}`,
      migrationConfig.source.container,
      'wp',
      '--allow-root',
      'eval-file',
      containerExporter,
    ]).stdout

    const lines = stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith('{'))
    if (lines.length !== 1) {
      throw new Error(
        `Expected one production inventory snapshot from WordPress, received ${lines.length}.`,
      )
    }
    return JSON.parse(lines[0])
  } finally {
    run('docker', ['exec', migrationConfig.source.container, 'rm', '-f', containerExporter], {
      quiet: true,
    })
  }
}

export type ProductionInventoryResult = {
  runId: string
  reportDir: string
  summary: ReturnType<typeof discoverProductionInventory>['summary']
  hashes: ReturnType<typeof buildInventoryArtifacts>['hashes']
}

export const inventoryProduction = (requestedRunId?: string): ProductionInventoryResult => {
  const runId = safeRunId(requestedRunId || defaultRunId())
  const inventoryWorkDir = path.resolve(migrationConfig.workDir, 'inventory')
  const reportDir = path.resolve(inventoryWorkDir, runId)
  if (!reportDir.startsWith(`${inventoryWorkDir}${path.sep}`)) {
    throw new Error('Refusing to write inventory output outside the inventory work directory.')
  }

  const snapshot = runtimeInventorySnapshotSchema.parse(readRuntimeSnapshot())
  const expectedHome = migrationConfig.source.expectedSiteURL.replace(/\/$/, '')
  if (snapshot.source.home.replace(/\/$/, '') !== expectedHome) {
    throw new Error(
      `Unexpected WordPress source: expected ${expectedHome}, received ${snapshot.source.home}`,
    )
  }

  const snapshotText = `${JSON.stringify(snapshot, null, 2)}\n`
  const snapshotHash = sha256(snapshotText)
  const inventory = discoverProductionInventory(snapshot, productionScope)
  const artifacts = buildInventoryArtifacts(inventory, snapshot, productionScope, snapshotHash)

  fs.mkdirSync(reportDir, { recursive: true })
  fs.writeFileSync(path.join(reportDir, 'source-snapshot.json'), snapshotText)
  fs.writeFileSync(path.join(reportDir, 'production-inventory.json'), artifacts.inventoryText)
  fs.writeFileSync(path.join(reportDir, 'production-inventory.ndjson'), artifacts.ndjsonText)
  fs.writeFileSync(path.join(reportDir, 'route-manifest.csv'), artifacts.routeManifestCSV)
  fs.writeFileSync(path.join(reportDir, 'layout-coverage.json'), artifacts.layoutCoverageText)
  fs.writeFileSync(path.join(reportDir, 'verification.json'), artifacts.verificationText)
  fs.writeFileSync(path.join(reportDir, 'summary.json'), artifacts.summaryText)
  fs.mkdirSync(inventoryWorkDir, { recursive: true })
  fs.writeFileSync(path.join(inventoryWorkDir, 'latest-run.txt'), `${runId}\n`)

  const result = {
    runId,
    reportDir,
    summary: inventory.summary,
    hashes: artifacts.hashes,
  }
  if (artifacts.verification.status !== 'passed') {
    throw new Error(
      [
        `Production inventory validation failed. Diagnostic reports were written to ${reportDir}.`,
        ...artifacts.verification.failures,
      ].join('\n'),
    )
  }
  process.stdout.write(`${JSON.stringify({ ok: true, scope: 'production', ...result }, null, 2)}\n`)
  return result
}
