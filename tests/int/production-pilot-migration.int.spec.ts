// @vitest-environment node

import { Client } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { up as initialSchemaUp } from '../../src/database/migrations/20260728_201453_initial_schema'
import { up as foundationUp } from '../../src/database/migrations/20260730_002734_routable_content_foundation'
import { up as redirectStatusUp } from '../../src/database/migrations/20260730_015904_redirect_status'
import {
  down as productionPilotDown,
  up as productionPilotUp,
} from '../../src/database/migrations/20260803_175438_production_pilot_content'
import {
  down as optionalManagedLinksDown,
  up as optionalManagedLinksUp,
} from '../../src/database/migrations/20260803_181505_optional_managed_links'
import {
  down as productionPilotSafetyDown,
  up as productionPilotSafetyUp,
} from '../../src/database/migrations/20260803_184425_production_pilot_safety'

type Migration = (args: never) => Promise<void>
type SQLChunk = {
  value?: string[]
}
type SQLQuery = {
  queryChunks?: SQLChunk[]
}

const sqlText = (query: unknown): string => {
  const chunks = (query as SQLQuery).queryChunks
  if (!chunks?.length || chunks.some(({ value }) => !Array.isArray(value))) {
    throw new Error('Migration test only supports static Drizzle SQL chunks.')
  }
  return chunks.flatMap(({ value }) => value || []).join('')
}

const executeMigration = async (client: Client, migration: Migration): Promise<void> => {
  await migration({
    db: {
      execute: async (query: unknown) => {
        await client.query(sqlText(query))
      },
    },
  } as never)
}

const expectMigrationLockWait = async (client: Client, migration: Migration): Promise<void> => {
  await client.query(`SET lock_timeout = '250ms'`)
  await expect(executeMigration(client, migration)).rejects.toThrow(/lock timeout/i)
  await client.query(`SET lock_timeout = 0`)
}

describe('production-pilot database migrations', () => {
  const sourceURL = process.env.DATABASE_URL
  const databaseName =
    `trayport_pilot_test_${process.pid}_${Math.random().toString(36).slice(2, 8)}`.toLowerCase()
  let admin: Client
  let database: Client
  let databaseURL: string
  let writer: Client | null = null

  beforeAll(async () => {
    if (!sourceURL) throw new Error('DATABASE_URL is required for migration integration tests.')

    const adminURL = new URL(sourceURL)
    adminURL.pathname = '/postgres'
    const isolatedURL = new URL(sourceURL)
    isolatedURL.pathname = `/${databaseName}`
    databaseURL = isolatedURL.toString()

    admin = new Client({ connectionString: adminURL.toString() })
    await admin.connect()
    await admin.query(`CREATE DATABASE "${databaseName}" TEMPLATE template0`)

    database = new Client({ connectionString: databaseURL })
    await database.connect()
    await executeMigration(database, initialSchemaUp)
    await executeMigration(database, foundationUp)
    await executeMigration(database, redirectStatusUp)
    await executeMigration(database, productionPilotUp)
    await executeMigration(database, optionalManagedLinksUp)
    await executeMigration(database, productionPilotSafetyUp)
  }, 120_000)

  afterAll(async () => {
    if (writer) {
      await writer.end().catch(() => undefined)
      writer = null
    }
    if (database) await database.end().catch(() => undefined)
    if (admin) {
      await admin
        .query(`DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`)
        .catch(() => undefined)
      await admin.end().catch(() => undefined)
    }
  })

  it('blocks destructive rollback while restoring lossless custom URLs', async () => {
    await database.query(
      `INSERT INTO "media" ("title", "source_file_hash")
       VALUES ('Fingerprint rollback guard', $1)`,
      ['a'.repeat(64)],
    )
    await expect(executeMigration(database, productionPilotSafetyDown)).rejects.toThrow(
      /imported media fingerprints would be deleted/i,
    )
    await database.query(`DELETE FROM "media" WHERE "title" = 'Fingerprint rollback guard'`)
    await executeMigration(database, productionPilotSafetyDown)
    await executeMigration(database, optionalManagedLinksDown)

    await database.query(`INSERT INTO "offices" ("title") VALUES ('Pilot office')`)
    await expect(executeMigration(database, productionPilotDown)).rejects.toThrow(
      /office content or versions would be deleted/i,
    )
    await database.query(`DELETE FROM "offices" WHERE "title" = 'Pilot office'`)

    const page = await database.query<{ id: number }>(
      `INSERT INTO "pages" ("title", "page_type", "path")
       VALUES ('Pilot rollback page', 'standard', '/pilot-rollback/')
       RETURNING "id"`,
    )
    const pageID = page.rows[0]?.id
    expect(pageID).toBeTypeOf('number')

    await database.query(
      `INSERT INTO "pages_blocks_learning_video_listing" (
         "_order",
         "_parent_id",
         "_path",
         "id"
       ) VALUES (0, $1, 'layout', 'pilot-learning-listing')`,
      [pageID],
    )
    await expect(executeMigration(database, productionPilotDown)).rejects.toThrow(
      /pilot-only block content/i,
    )
    await database.query(
      `DELETE FROM "pages_blocks_learning_video_listing" WHERE "id" = 'pilot-learning-listing'`,
    )

    const venue = await database.query<{ id: number }>(
      `INSERT INTO "venues" ("title") VALUES ('Pilot venue') RETURNING "id"`,
    )
    const hub = await database.query<{ id: number }>(
      `INSERT INTO "hubs" ("title") VALUES ('Pilot hub') RETURNING "id"`,
    )
    await database.query(
      `INSERT INTO "venues_market_connections" (
         "_order",
         "_parent_id",
         "id",
         "hub_id",
         "connection_type"
       ) VALUES (0, $1, 'pilot-venue-connection', $2, 'd')`,
      [venue.rows[0]?.id, hub.rows[0]?.id],
    )
    await expect(executeMigration(database, productionPilotDown)).rejects.toThrow(
      /venue market connections would be deleted/i,
    )
    await database.query(
      `DELETE FROM "venues_market_connections" WHERE "id" = 'pilot-venue-connection'`,
    )

    const learningVideo = await database.query<{ id: number }>(
      `INSERT INTO "learning_videos" (
         "title",
         "description",
         "content_mode",
         "external_destination",
         "display_order"
       ) VALUES ('Pilot learning video', '{}'::jsonb, 'full', '/learning-hub-video/pilot/', 1)
       RETURNING "id"`,
    )
    await expect(executeMigration(database, productionPilotDown)).rejects.toThrow(
      /learning-video pilot fields or tags would be deleted/i,
    )
    await database.query(
      `UPDATE "learning_videos"
       SET
         "description" = NULL,
         "content_mode" = 'listing',
         "external_destination" = NULL,
         "poster_id" = NULL,
         "product" = NULL,
         "display_order" = 0
       WHERE "id" = $1`,
      [learningVideo.rows[0]?.id],
    )

    await database.query(
      `INSERT INTO "pages_blocks_actions" ("_order", "_parent_id", "_path", "id")
       VALUES (0, $1, 'layout', 'pilot-actions')`,
      [pageID],
    )
    await database.query(
      `INSERT INTO "pages_blocks_actions_actions" (
         "_order",
         "_parent_id",
         "id",
         "label",
         "link_type"
       ) VALUES (0, 'pilot-actions', 'pilot-action', 'Pilot action', 'reference')`,
    )
    await database.query(
      `INSERT INTO "pages_rels" ("parent_id", "path", "pages_id")
       VALUES ($1, 'layout.0.actions.0.link.reference', $1)`,
      [pageID],
    )
    await expect(executeMigration(database, productionPilotDown)).rejects.toThrow(
      /managed reference links would lose their destinations/i,
    )
    await database.query(
      `DELETE FROM "pages_rels"
       WHERE "parent_id" = $1 AND "path" = 'layout.0.actions.0.link.reference'`,
      [pageID],
    )

    writer = new Client({ connectionString: databaseURL })
    await writer.connect()
    await writer.query('BEGIN')
    await writer.query(`INSERT INTO "offices" ("title") VALUES ('Concurrent pilot office')`)
    await expectMigrationLockWait(database, productionPilotDown)
    await writer.query('ROLLBACK')
    await writer.end()
    writer = null

    await database.query(
      `UPDATE "pages_blocks_actions_actions"
       SET
         "link_type" = 'custom',
         "link_url" = 'https://example.com/pilot?view=full#details',
         "link_new_tab" = true
       WHERE "id" = 'pilot-action'`,
    )
    await database.query(
      `INSERT INTO "pages_blocks_feature_list" ("_order", "_parent_id", "_path", "id")
       VALUES (1, $1, 'layout', 'pilot-features')`,
      [pageID],
    )
    await database.query(
      `INSERT INTO "pages_blocks_feature_list_items" (
         "_order",
         "_parent_id",
         "id",
         "title",
         "link_type",
         "link_url",
         "link_label",
         "link_new_tab"
       ) VALUES (
         0,
         'pilot-features',
         'pilot-feature',
         'Pilot feature',
         'custom',
         '/pilot-feature/',
         'Read more',
         false
       )`,
    )

    await executeMigration(database, productionPilotDown)

    const restoredAction = await database.query(
      `SELECT "url", "new_tab"
       FROM "pages_blocks_actions_actions"
       WHERE "id" = 'pilot-action'`,
    )
    expect(restoredAction.rows).toEqual([
      {
        url: 'https://example.com/pilot?view=full#details',
        new_tab: true,
      },
    ])
    const restoredFeature = await database.query(
      `SELECT "url", "link_label"
       FROM "pages_blocks_feature_list_items"
       WHERE "id" = 'pilot-feature'`,
    )
    expect(restoredFeature.rows).toEqual([
      {
        url: '/pilot-feature/',
        link_label: 'Read more',
      },
    ])

    const rollbackState = await database.query(
      `SELECT
         to_regclass('public.offices') AS offices,
         EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_schema = current_schema()
             AND table_name = 'pages_blocks_actions_actions'
             AND column_name = 'link_type'
         ) AS managed_link_exists,
         EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_schema = current_schema()
             AND table_name = 'learning_videos'
             AND column_name = 'content_mode'
         ) AS learning_content_mode_exists,
         EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_schema = current_schema()
             AND table_name = 'media'
             AND column_name = 'source_file_hash'
         ) AS source_file_hash_exists`,
    )
    expect(rollbackState.rows[0]).toEqual({
      offices: null,
      managed_link_exists: false,
      learning_content_mode_exists: false,
      source_file_hash_exists: false,
    })
  }, 120_000)
})
