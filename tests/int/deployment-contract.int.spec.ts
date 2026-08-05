// @vitest-environment node

import { readFileSync } from 'node:fs'

import { describe, expect, it, vi } from 'vitest'

import packageJSON from '../../package.json'
import deploymentSchema from '../../scripts/deployment-schema.json'
import { GET as getLiveness } from '../../src/app/api/health/live/route'
import {
  checkReadiness,
  matchesExpectedPayloadMigrations,
  type ReadinessDatabaseClient,
} from '../../src/app/api/health/readiness'

const readProjectFile = (path: string): string =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

describe('deployment configuration contract', () => {
  it('installs the private Font Awesome kit through one ephemeral BuildKit secret', () => {
    const dockerfile = readProjectFile('Dockerfile')
    const npmrc = readProjectFile('.npmrc')
    const runnerStage = dockerfile.split('FROM base AS runner')[1]

    expect(dockerfile).toContain('# syntax=docker/dockerfile:1.10')
    expect(dockerfile).toContain('COPY package.json pnpm-lock.yaml .npmrc ./')
    expect(dockerfile).toContain(
      'RUN --mount=type=secret,id=FONTAWESOME_NPM_TOKEN,required=true,env=FONTAWESOME_NPM_TOKEN',
    )
    expect(dockerfile).not.toMatch(/^\s*(?:ARG|ENV)\s+FONTAWESOME_NPM_TOKEN\b/m)
    expect(runnerStage).not.toContain('FONTAWESOME_NPM_TOKEN')
    expect(runnerStage).not.toContain('.npmrc')

    expect(npmrc.split(/\r?\n/)).toEqual(
      expect.arrayContaining([
        '@awesome.me:registry=https://npm.fontawesome.com/',
        '@fortawesome:registry=https://npm.fontawesome.com/',
        '//npm.fontawesome.com/:_authToken=${FONTAWESOME_NPM_TOKEN}',
      ]),
    )
  })

  it('uses build-only media mode while producing the standalone application', () => {
    const dockerfile = readProjectFile('Dockerfile')
    const mediaCollection = readProjectFile('src/collections/Media.ts')
    const plugins = readProjectFile('src/plugins/index.ts')

    expect(dockerfile).toContain('MEDIA_STORAGE_MODE=build')
    expect(packageJSON.scripts.build).toContain('MEDIA_STORAGE_MODE=build')
    expect(mediaCollection).toContain('staticDir: mediaStorage.localPath')
    expect(plugins).toContain("enabled: mediaStorage.mode === 's3'")
  })

  it('requires an explicit non-local HTTPS origin for container builds', () => {
    const dockerfile = readProjectFile('Dockerfile')
    const originGuard = readProjectFile('scripts/assert-production-origin.mjs')

    expect(dockerfile).toContain('ARG NEXT_PUBLIC_SERVER_URL\n')
    expect(dockerfile).not.toContain('ARG NEXT_PUBLIC_SERVER_URL=http://localhost:3000')
    expect(dockerfile).toContain('node scripts/assert-production-origin.mjs')
    expect(originGuard).toContain("origin.protocol !== 'https:'")
    expect(originGuard).toContain("new Set(['localhost', '127.0.0.1', '::1'])")
  })

  it('documents the exact secret mount and explicit runtime storage modes', () => {
    const environmentExample = readProjectFile('.env.example')
    const readme = readProjectFile('README.md')

    expect(readme).toContain('--secret id=FONTAWESOME_NPM_TOKEN,env=FONTAWESOME_NPM_TOKEN')
    expect(readme).not.toContain('--build-arg FONTAWESOME_NPM_TOKEN')
    expect(readme).toContain('MEDIA_STORAGE_MODE=s3')
    expect(readme).toContain('MEDIA_STORAGE_MODE=local-persistent')
    expect(readme).toContain('MEDIA_STORAGE_MODE=local-development')
    expect(environmentExample).toContain('MEDIA_STORAGE_MODE=s3')
  })

  it('builds a dedicated migration target and a liveness-checked web target', () => {
    const dockerfile = readProjectFile('Dockerfile')
    const migrationRunner = readProjectFile('scripts/run-migrations.mjs')
    const migratorStage = dockerfile
      .split('FROM builder AS migrator')[1]
      .split('FROM base AS runner')[0]
    const runnerStage = dockerfile.split('FROM base AS runner')[1]

    expect(migratorStage).toContain('ENV PAYLOAD_DB_PUSH=false')
    expect(migratorStage).toContain('ENTRYPOINT ["node", "scripts/run-migrations.mjs"]')
    expect(runnerStage).toContain('scripts/container-healthcheck.mjs')
    expect(runnerStage).toContain('CMD ["node", "scripts/container-healthcheck.mjs"]')
    expect(packageJSON.scripts['deploy:migrate']).toBe('node scripts/run-migrations.mjs')
    expect(migrationRunner).toContain("['node_modules/payload/bin.js', 'migrate']")
    expect(migrationRunner).not.toMatch(/migrate:(?:down|fresh|refresh|reset)/)
    expect(migrationRunner).toContain('PAYLOAD_DB_PUSH=false')
    expect(migrationRunner).toContain('SELECT "name" FROM "payload_migrations"')
  })

  it('keeps the deployment schema manifest in exact migration-index order', () => {
    const migrationIndex = readProjectFile('src/database/migrations/index.ts')
    const indexedMigrations = [...migrationIndex.matchAll(/name: '([^']+)'/g)].map(
      ([, name]) => name,
    )

    expect(deploymentSchema.payloadMigrations).toEqual(indexedMigrations)
    expect(matchesExpectedPayloadMigrations(indexedMigrations)).toBe(true)
    expect(matchesExpectedPayloadMigrations(indexedMigrations.slice(0, -1))).toBe(false)
    expect(matchesExpectedPayloadMigrations([...indexedMigrations, 'unexpected_schema'])).toBe(
      false,
    )
  })

  it('adds the exact forward icon vocabulary without dropping retained navigation data', () => {
    const migration = readProjectFile(
      'src/database/migrations/20260804_082210_action_forward_icon.ts',
    )

    expect(migration.match(/ADD VALUE 'forward'/g)).toHaveLength(40)
    expect(migration).not.toContain('primary_action')
    expect(deploymentSchema.payloadMigrations).toContain('20260804_082210_action_forward_icon')
  })

  it('adds the managed matrix schema without dropping retained navigation data', () => {
    const migration = readProjectFile(
      'src/database/migrations/20260804_093914_market_matrix_component.ts',
    )

    expect(migration).toContain('pages_blocks_market_matrix')
    expect(migration).not.toContain('primary_action')
    expect(deploymentSchema.payloadMigrations).toContain('20260804_093914_market_matrix_component')
  })

  it('adds managed chart asset-class relationships without destructive up statements', () => {
    const migration = readProjectFile(
      'src/database/migrations/20260804_103936_data_chart_asset_class.ts',
    )
    const upStatements = migration.split('export async function down')[0]

    expect(upStatements.match(/ADD COLUMN "asset_class_id"/g)).toHaveLength(10)
    expect(upStatements.match(/REFERENCES "public"\."asset_classes"/g)).toHaveLength(10)
    expect(upStatements).not.toMatch(/\bDROP\b/)
    expect(deploymentSchema.payloadMigrations).toContain('20260804_103936_data_chart_asset_class')
  })

  it('backfills managed chart relationships from retained WordPress application-data keys', () => {
    const migration = readProjectFile(
      'src/database/migrations/20260804_104200_data_chart_asset_class_backfill.ts',
    )
    const upStatements = migration.split('export async function down')[0]
    const chartTables = [
      'pages_blocks_data_chart',
      '_pages_v_blocks_data_chart',
      'articles_blocks_data_chart',
      '_articles_v_blocks_data_chart',
      'hubs_blocks_data_chart',
      '_hubs_v_blocks_data_chart',
      'venues_blocks_data_chart',
      '_venues_v_blocks_data_chart',
      'learning_videos_blocks_data_chart',
      '_learning_videos_v_blocks_data_chart',
    ]

    for (const table of chartTables) expect(upStatements).toContain(`'${table}'`)
    expect(upStatements).toContain("asset_class.legacy_source_source = 'wordpress'")
    expect(upStatements).toContain(
      'asset_class.legacy_source_legacy_id = chart.asset_class_legacy_id',
    )
    expect(upStatements).toContain('chart.asset_class_id IS NULL')
    expect(upStatements).not.toMatch(/\b(?:DELETE|DROP|TRUNCATE)\b/)
    expect(deploymentSchema.payloadMigrations).toContain(
      '20260804_104200_data_chart_asset_class_backfill',
    )
  })

  it('adds bounded chart semantics without rewriting retained data-type enums', () => {
    const migration = readProjectFile(
      'src/database/migrations/20260804_113221_data_chart_semantics.ts',
    )
    const upStatements = migration.split('export async function down')[0]
    const chartTables = [
      'pages_blocks_data_chart',
      '_pages_v_blocks_data_chart',
      'articles_blocks_data_chart',
      '_articles_v_blocks_data_chart',
      'hubs_blocks_data_chart',
      '_hubs_v_blocks_data_chart',
      'venues_blocks_data_chart',
      '_venues_v_blocks_data_chart',
      'learning_videos_blocks_data_chart',
      '_learning_videos_v_blocks_data_chart',
    ]

    for (const table of chartTables) expect(upStatements).toContain(`'${table}'`)
    expect(upStatements.match(/ADD COLUMN "series_dimension"/g)).toHaveLength(10)
    expect(upStatements.match(/ADD COLUMN "display_interval"/g)).toHaveLength(10)
    expect(upStatements.match(/CREATE TYPE .*series_dimension/g)).toHaveLength(10)
    expect(upStatements.match(/CREATE TYPE .*display_interval/g)).toHaveLength(10)
    expect(upStatements).not.toMatch(/ALTER COLUMN "data_type"/)
    expect(upStatements).not.toMatch(/DROP TYPE/)
    expect(upStatements).not.toMatch(/\b(?:DELETE|DROP|TRUNCATE)\b/)
    expect(upStatements).toContain("series_dimension = ''hub''")
    expect(upStatements).toContain("display_interval = ''month''")
    expect(upStatements).toContain("display_interval = ''year''")
    expect(deploymentSchema.payloadMigrations).toContain('20260804_113221_data_chart_semantics')
  })

  it('retains the completed slice schema before the banner migration tail', () => {
    const sliceSchema = readProjectFile('src/database/migrations/20260804_224938.ts')
    const legacyCompatibility = readProjectFile(
      'src/database/migrations/20260804_225535_market_data_legacy_upsert_compat.ts',
    )
    const notificationJobs = readProjectFile(
      'src/database/migrations/20260805_105208_banner_notification_jobs.ts',
    )
    const scheduledBanners = readProjectFile(
      'src/database/migrations/20260805_104353_scheduled_page_banners.ts',
    )
    const deliveryLedger = readProjectFile(
      'src/database/migrations/20260805_111442_banner_notification_delivery_ledger.ts',
    )

    expect(deploymentSchema.payloadMigrations.slice(-7, -5)).toEqual([
      '20260804_224938',
      '20260804_225535_market_data_legacy_upsert_compat',
    ])
    expect(deploymentSchema.payloadMigrations.slice(-5, -1)).toEqual([
      '20260805_104353_scheduled_page_banners',
      '20260805_104915_banner_recipient_migration_review',
      '20260805_105208_banner_notification_jobs',
      '20260805_111442_banner_notification_delivery_ledger',
    ])
    expect(deploymentSchema.payloadMigrations.at(-1)).toBe(
      '20260805_130343_people_events_search_parity',
    )
    expect(sliceSchema).toContain('CREATE TABLE "app"."market_data_import_staging"')
    expect(sliceSchema).toContain('CREATE UNIQUE INDEX "market_volume_monthly_stable_scope_unique"')
    expect(sliceSchema).toContain('ADD CONSTRAINT "market_volume_monthly_source_import_id_fk"')
    expect(legacyCompatibility).toContain('ADD CONSTRAINT market_volume_monthly_scope_unique')
    expect(legacyCompatibility).not.toMatch(/\b(?:DELETE|TRUNCATE)\b/)
    expect(notificationJobs).toContain(
      'DELETE FROM "payload_jobs_log"\n  WHERE "task_slug" = \'processBannerNotifications\'',
    )
    expect(notificationJobs).toContain(
      'DELETE FROM "payload_jobs"\n  WHERE "task_slug" = \'processBannerNotifications\'',
    )
    const scheduledBannersDown = scheduledBanners.split('export async function down')[1]
    expect(scheduledBannersDown.indexOf('DROP CONSTRAINT')).toBeLessThan(
      scheduledBannersDown.indexOf('DROP TABLE "banners"'),
    )
    expect(deliveryLedger).toContain('CREATE TABLE "app"."banner_notification_deliveries"')
    expect(deliveryLedger).toContain('banner_notification_deliveries_schedule_unique')
    expect(deliveryLedger).toContain('banner_notification_deliveries_banner_id_fk')
    expect(deliveryLedger).toContain('DROP COLUMN "notification_state_started_sent_at"')
    expect(deliveryLedger).toContain(
      'Cannot roll back the banner notification ledger while non-sent or historical-schedule deliveries exist.',
    )
    expect(deliveryLedger).toContain('"delivery"."scheduled_at" = "banner"."start_at"')
  })

  it('returns a no-store process liveness response without runtime details', async () => {
    const response = getLiveness()

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store, max-age=0')
    expect(await response.json()).toEqual({ status: 'alive' })
  })

  it('reports ready only for a reachable database with the exact committed schema', async () => {
    const release = vi.fn()
    const query = vi
      .fn<ReadinessDatabaseClient['query']>()
      .mockResolvedValueOnce({ rows: [{ alive: 1, migrationTable: 'payload_migrations' }] })
      .mockResolvedValueOnce({
        rows: deploymentSchema.payloadMigrations.map((name) => ({ name })),
      })

    await expect(
      checkReadiness({
        acquireClient: async () => ({ query, release }),
      }),
    ).resolves.toEqual({
      checks: { database: 'ok', migrations: 'ok' },
      status: 'ready',
    })
    expect(query).toHaveBeenCalledTimes(2)
    expect(release).toHaveBeenCalledOnce()
  })

  it('fails readiness generically for a missing or unreachable migration schema', async () => {
    const missingTableClient: ReadinessDatabaseClient = {
      query: vi.fn().mockResolvedValue({ rows: [{ alive: 1, migrationTable: null }] }),
      release: vi.fn(),
    }
    await expect(
      checkReadiness({ acquireClient: async () => missingTableClient }),
    ).resolves.toEqual({
      checks: { database: 'ok', migrations: 'failed' },
      status: 'unavailable',
    })

    const secretError = 'postgresql://user:secret@example.invalid/database'
    const unavailable = await checkReadiness({
      acquireClient: async () => {
        throw new Error(secretError)
      },
    })
    expect(unavailable).toEqual({
      checks: { database: 'failed', migrations: 'unknown' },
      status: 'unavailable',
    })
    expect(JSON.stringify(unavailable)).not.toContain(secretError)

    const releaseFailedClient = vi.fn()
    const failedSchemaQuery = vi
      .fn<ReadinessDatabaseClient['query']>()
      .mockResolvedValueOnce({ rows: [{ alive: 1, migrationTable: 'payload_migrations' }] })
      .mockRejectedValueOnce(new Error(secretError))
    const failedSchema = await checkReadiness({
      acquireClient: async () => ({ query: failedSchemaQuery, release: releaseFailedClient }),
    })
    expect(failedSchema).toEqual({
      checks: { database: 'ok', migrations: 'failed' },
      status: 'unavailable',
    })
    expect(JSON.stringify(failedSchema)).not.toContain(secretError)
    expect(releaseFailedClient).toHaveBeenCalledWith(true)
  })

  it('documents a local-first review path and constrained ECS handoff with separate probes', () => {
    const deployment = readProjectFile('docs/deployment.md')

    expect(deployment).toContain('Feature delivery remains local until core product acceptance')
    expect(deployment).toContain('one EC2-hosted')
    expect(deployment).toContain('Trayport production targets ECS')
    expect(deployment).toContain('ECS desired count `1`')
    expect(deployment).toContain('replacement/stop-first strategy')
    expect(deployment).toContain('/api/health/live/')
    expect(deployment).toContain('/api/health/ready/')
    expect(deployment).toContain('shared Next.js cache handler')
    expect(deployment).toContain('cross-process tag invalidation')
  })
})
