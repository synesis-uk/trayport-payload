import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import pg from 'pg'

const { Client } = pg
const buildOnlySecret = 'build-only-payload-secret-do-not-use-at-runtime'
const projectRoot = fileURLToPath(new URL('../', import.meta.url))

class DeploymentError extends Error {}

const requireDeploymentEnvironment = () => {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new DeploymentError('The deployment migrator requires DATABASE_URL.')
  }

  const payloadSecret = process.env.PAYLOAD_SECRET?.trim()
  if (!payloadSecret || payloadSecret === buildOnlySecret) {
    throw new DeploymentError('The deployment migrator requires the real PAYLOAD_SECRET.')
  }

  if (process.env.PAYLOAD_DB_PUSH !== 'false') {
    throw new DeploymentError('The deployment migrator requires PAYLOAD_DB_PUSH=false.')
  }
}

const readExpectedMigrations = async () => {
  const manifestURL = new URL('./deployment-schema.json', import.meta.url)
  const manifest = JSON.parse(await readFile(manifestURL, 'utf8'))

  if (
    !Array.isArray(manifest.payloadMigrations) ||
    manifest.payloadMigrations.length === 0 ||
    manifest.payloadMigrations.some((name) => typeof name !== 'string' || !name)
  ) {
    throw new DeploymentError('The deployment schema manifest is invalid.')
  }

  return manifest.payloadMigrations
}

const runPayloadMigrations = () =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['node_modules/payload/bin.js', 'migrate'], {
      cwd: projectRoot,
      env: {
        ...process.env,
        NODE_OPTIONS: [process.env.NODE_OPTIONS, '--no-deprecation'].filter(Boolean).join(' '),
      },
      stdio: 'inherit',
    })

    const forwardedSignals = ['SIGINT', 'SIGTERM']
    const signalHandlers = new Map(
      forwardedSignals.map((signal) => [signal, () => child.kill(signal)]),
    )
    const cleanup = () => {
      for (const [signal, handler] of signalHandlers) process.off(signal, handler)
    }

    for (const [signal, handler] of signalHandlers) process.on(signal, handler)

    child.once('error', () => {
      cleanup()
      reject(new DeploymentError('The Payload migration process could not be started.'))
    })
    child.once('exit', (code, signal) => {
      cleanup()
      if (code === 0) {
        resolve()
        return
      }

      const outcome = signal ? `signal ${signal}` : `exit code ${code ?? 'unknown'}`
      reject(new DeploymentError(`Payload migrations failed with ${outcome}.`))
    })
  })

const verifyAppliedMigrations = async (expectedMigrations) => {
  const client = new Client({
    application_name: 'trayport-web-deployment-migrator',
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5_000,
    query_timeout: 5_000,
    statement_timeout: 5_000,
  })

  try {
    await client.connect()
    const { rows } = await client.query(
      'SELECT "name" FROM "payload_migrations" WHERE "name" IS NOT NULL ORDER BY "id" ASC',
    )
    const appliedMigrations = rows.map(({ name }) => name)

    if (
      appliedMigrations.length !== expectedMigrations.length ||
      appliedMigrations.some((name, index) => name !== expectedMigrations[index])
    ) {
      throw new DeploymentError(
        'The database does not match the committed deployment schema manifest.',
      )
    }
  } finally {
    await client.end().catch(() => undefined)
  }
}

try {
  requireDeploymentEnvironment()
  const expectedMigrations = await readExpectedMigrations()
  await runPayloadMigrations()
  await verifyAppliedMigrations(expectedMigrations)
  console.log(`Verified ${expectedMigrations.length} committed Payload migrations.`)
} catch (error) {
  const message =
    error instanceof DeploymentError ? error.message : 'The deployment migration step failed.'
  console.error(message)
  process.exitCode = 1
}
