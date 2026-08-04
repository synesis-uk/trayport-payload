import 'server-only'

import { Pool } from 'pg'

import deploymentSchema from '../../../../scripts/deployment-schema.json'

const expectedPayloadMigrations = deploymentSchema.payloadMigrations as readonly string[]

type CheckStatus = 'failed' | 'ok' | 'unknown'

export type ReadinessResult = {
  checks: {
    database: CheckStatus
    migrations: CheckStatus
  }
  status: 'ready' | 'unavailable'
}

export type ReadinessDatabaseClient = {
  query: (text: string) => Promise<{ rows: Array<Record<string, unknown>> }>
  release: (destroy?: boolean) => void
}

type ReadinessDependencies = {
  acquireClient?: () => Promise<ReadinessDatabaseClient>
  databaseURL?: string
}

let readinessPool: Pool | undefined

const getReadinessPool = (databaseURL: string): Pool => {
  if (readinessPool) return readinessPool

  readinessPool = new Pool({
    application_name: 'trayport-web-readiness',
    connectionString: databaseURL,
    connectionTimeoutMillis: 1_500,
    idleTimeoutMillis: 10_000,
    max: 2,
    query_timeout: 1_500,
    statement_timeout: 1_500,
  })
  readinessPool.on('error', () => undefined)

  return readinessPool
}

const acquireReadinessClient = async (databaseURL: string): Promise<ReadinessDatabaseClient> => {
  const client = await getReadinessPool(databaseURL).connect()

  return {
    query: async (text) => {
      const result = await client.query(text)
      return { rows: result.rows }
    },
    release: (destroy) => client.release(destroy),
  }
}

export const matchesExpectedPayloadMigrations = (appliedMigrations: readonly string[]): boolean =>
  appliedMigrations.length === expectedPayloadMigrations.length &&
  appliedMigrations.every((name, index) => name === expectedPayloadMigrations[index])

export const checkReadiness = async (
  dependencies: ReadinessDependencies = {},
): Promise<ReadinessResult> => {
  const databaseURL = dependencies.databaseURL ?? process.env.DATABASE_URL?.trim()
  if (!databaseURL && !dependencies.acquireClient) {
    return {
      checks: { database: 'failed', migrations: 'unknown' },
      status: 'unavailable',
    }
  }

  let client: ReadinessDatabaseClient | undefined
  let databaseStatus: CheckStatus = 'failed'
  let destroyClient = false

  try {
    client = dependencies.acquireClient
      ? await dependencies.acquireClient()
      : await acquireReadinessClient(databaseURL!)

    const heartbeat = await client.query(
      'SELECT 1 AS "alive", to_regclass(\'public.payload_migrations\')::text AS "migrationTable"',
    )
    databaseStatus = 'ok'

    if (typeof heartbeat.rows[0]?.migrationTable !== 'string') {
      return {
        checks: { database: 'ok', migrations: 'failed' },
        status: 'unavailable',
      }
    }

    const migrationResult = await client.query(
      'SELECT "name" FROM "payload_migrations" WHERE "name" IS NOT NULL ORDER BY "id" ASC',
    )
    const appliedMigrations = migrationResult.rows.flatMap(({ name }) =>
      typeof name === 'string' ? [name] : [],
    )

    if (!matchesExpectedPayloadMigrations(appliedMigrations)) {
      return {
        checks: { database: 'ok', migrations: 'failed' },
        status: 'unavailable',
      }
    }

    return {
      checks: { database: 'ok', migrations: 'ok' },
      status: 'ready',
    }
  } catch {
    destroyClient = true
    return {
      checks: {
        database: databaseStatus,
        migrations: databaseStatus === 'ok' ? 'failed' : 'unknown',
      },
      status: 'unavailable',
    }
  } finally {
    client?.release(destroyClient)
  }
}
