// @vitest-environment node

import fs from 'node:fs'
import path from 'node:path'

import { loadMarketData } from '../../migration/load/marketData'
import { migrationConfig } from '../../migration/lib/config'
import { expect, it } from 'vitest'

it('rejects direct market-data loading from an unaccepted run before database access', async () => {
  const runId = `unaccepted-market-load-${process.pid}-${Date.now()}`
  const runDirectory = path.join(migrationConfig.workDir, runId)
  fs.mkdirSync(runDirectory, { recursive: true })

  try {
    await expect(loadMarketData(runDirectory, { dryRun: true })).rejects.toThrow(
      `Migration run ${runId} is not accepted`,
    )
  } finally {
    fs.rmSync(runDirectory, { force: true, recursive: true })
  }
})
