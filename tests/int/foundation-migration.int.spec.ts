// @vitest-environment node

import { Client } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { up as initialSchemaUp } from '../../src/database/migrations/20260728_201453_initial_schema'
import {
  down as foundationDown,
  up as foundationUp,
} from '../../src/database/migrations/20260730_002734_routable_content_foundation'

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

describe('routable-content foundation database migration', () => {
  const sourceURL = process.env.DATABASE_URL
  const databaseName =
    `trayport_foundation_test_${process.pid}_${Math.random().toString(36).slice(2, 8)}`.toLowerCase()
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
  }, 60_000)

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

  it('rejects unsafe backfills and rollbacks while preserving a lossless locked path', async () => {
    await database.query(
      `INSERT INTO "pages" ("title", "path") VALUES ('Malformed route', '/bad//path/')`,
    )
    await expect(executeMigration(database, foundationUp)).rejects.toThrow(
      /legacy paths are not canonical/i,
    )
    await expect(
      database.query(`SELECT "external_destination" FROM "articles" WHERE false`),
    ).rejects.toThrow(/external_destination/)
    await database.query(`DELETE FROM "pages" WHERE "title" = 'Malformed route'`)

    await database.query(
      `INSERT INTO "pages" ("title", "path") VALUES
        ('Scheme-like route', '/https:/invalid/'),
        ('Unicode whitespace route', $1)`,
      [`/invalid\u00a0route/`],
    )
    await expect(executeMigration(database, foundationUp)).rejects.toThrow(
      /legacy paths are not canonical/i,
    )
    await database.query(
      `DELETE FROM "pages" WHERE "title" IN ('Scheme-like route', 'Unicode whitespace route')`,
    )

    await database.query(
      `INSERT INTO "pages" ("title", "path") VALUES ('Duplicate page', '/duplicate-owner/')`,
    )
    await database.query(
      `INSERT INTO "articles" ("title", "content_mode", "path")
       VALUES ('Duplicate article', 'full', '/duplicate-owner/')`,
    )
    await expect(executeMigration(database, foundationUp)).rejects.toThrow(
      /multiple owners claim the same canonical path/i,
    )
    await database.query(`DELETE FROM "pages" WHERE "title" = 'Duplicate page'`)
    await database.query(`DELETE FROM "articles" WHERE "title" = 'Duplicate article'`)

    const publishedWithDraft = await database.query<{ id: number }>(
      `INSERT INTO "pages" ("title", "path", "_status")
       VALUES ('Published with pending route', '/published-route/', 'published')
       RETURNING "id"`,
    )
    const publishedWithDraftID = publishedWithDraft.rows[0]?.id
    await database.query(
      `INSERT INTO "_pages_v" (
         "parent_id",
         "version_title",
         "version_page_type",
         "version_path",
         "version__status",
         "latest"
       ) VALUES ($1, 'Pending route draft', 'standard', '/pending-route/', 'draft', true)`,
      [publishedWithDraftID],
    )
    await expect(executeMigration(database, foundationUp)).rejects.toThrow(
      /pending route-changing drafts/i,
    )
    await database.query(`DELETE FROM "_pages_v" WHERE "parent_id" = $1`, [publishedWithDraftID])
    await database.query(`DELETE FROM "pages" WHERE "id" = $1`, [publishedWithDraftID])

    writer = new Client({ connectionString: databaseURL })
    await writer.connect()
    await writer.query('BEGIN')
    await writer.query(
      `INSERT INTO "redirects" ("from", "to_type", "to_url")
       VALUES ('/arrived-during-up/', 'custom', 'https://example.com/')`,
    )

    await expectMigrationLockWait(database, foundationUp)
    await writer.query('COMMIT')
    await executeMigration(database, foundationUp)
    await writer.end()
    writer = null

    const claims = await database.query(
      `SELECT "path", "owner_kind"
       FROM "route_registry"
       WHERE "path" IN ('/arrived-during-up/', '/market-coverage/', '/venue/')
       ORDER BY "path"`,
    )
    expect(claims.rows).toEqual([
      { path: '/arrived-during-up/', owner_kind: 'redirect' },
      { path: '/market-coverage/', owner_kind: 'virtual' },
      { path: '/venue/', owner_kind: 'virtual' },
    ])

    await database.query(
      `INSERT INTO "learning_video_categories" ("title", "slug")
       VALUES ('Rollback guard', 'rollback-guard')`,
    )
    await expect(executeMigration(database, foundationDown)).rejects.toThrow(
      /learning-video or learning-category content would be deleted/i,
    )
    await database.query(`DELETE FROM "learning_video_categories" WHERE "slug" = 'rollback-guard'`)

    await database.query(
      `INSERT INTO "pages" ("title", "page_type", "path")
       VALUES ('Foundation legal page', 'legal', '/legal/foundation/')`,
    )
    await expect(executeMigration(database, foundationDown)).rejects.toThrow(
      /foundation-only archetype/i,
    )
    await database.query(`DELETE FROM "pages" WHERE "title" = 'Foundation legal page'`)

    await database.query(
      `INSERT INTO "venues" ("title", "content_mode", "path")
       VALUES ('Foundation venue', 'page', '/venue/foundation/')`,
    )
    await expect(executeMigration(database, foundationDown)).rejects.toThrow(
      /public venue route or SEO content would be deleted/i,
    )
    await database.query(`DELETE FROM "venues" WHERE "title" = 'Foundation venue'`)

    await database.query(`UPDATE "route_indexes" SET "venue_index_title" = 'Edited venues'`)
    await expect(executeMigration(database, foundationDown)).rejects.toThrow(
      /collection-index configuration or versions would be deleted/i,
    )
    await database.query(`UPDATE "route_indexes" SET "venue_index_title" = 'Venues'`)

    const listing = await database.query<{ id: number }>(
      `INSERT INTO "articles" ("title", "content_mode")
       VALUES ('Native pathless listing', 'listing')
       RETURNING "id"`,
    )
    const listingID = listing.rows[0]?.id
    expect(listingID).toBeTypeOf('number')

    await expect(executeMigration(database, foundationDown)).rejects.toThrow(
      /cannot be losslessly restored/i,
    )
    await database.query(
      `UPDATE "articles"
       SET "external_destination" = 'https://trayport.com/native-listing/?preview=1'
       WHERE "id" = $1`,
      [listingID],
    )
    await expect(executeMigration(database, foundationDown)).rejects.toThrow(
      /cannot be losslessly restored/i,
    )

    await database.query(
      `UPDATE "articles"
       SET "external_destination" = 'https://trayport.com/https:/invalid/'
       WHERE "id" = $1`,
      [listingID],
    )
    await expect(executeMigration(database, foundationDown)).rejects.toThrow(
      /cannot be losslessly restored/i,
    )
    await database.query(
      `UPDATE "articles"
       SET "external_destination" = $2
       WHERE "id" = $1`,
      [listingID, `https://trayport.com/invalid\u00a0path/`],
    )
    await expect(executeMigration(database, foundationDown)).rejects.toThrow(
      /cannot be losslessly restored/i,
    )

    await database.query(
      `UPDATE "articles"
       SET "external_destination" = 'https://www.trayport.com/native-listing/'
       WHERE "id" = $1`,
      [listingID],
    )
    await database.query(
      `INSERT INTO "articles" ("title", "content_mode", "path")
       VALUES ('Colliding full article', 'full', '/native-listing/')`,
    )
    await expect(executeMigration(database, foundationDown)).rejects.toThrow(
      /restored article paths would violate/i,
    )
    await database.query(`DELETE FROM "articles" WHERE "title" = 'Colliding full article'`)

    writer = new Client({ connectionString: databaseURL })
    await writer.connect()
    await writer.query('BEGIN')
    await writer.query(
      `INSERT INTO "pages" ("title", "page_type", "path")
       VALUES ('Arrived during down', 'standard', '/arrived-during-down/')`,
    )

    await expectMigrationLockWait(database, foundationDown)
    await writer.query('COMMIT')
    await executeMigration(database, foundationDown)
    await writer.end()
    writer = null

    const restored = await database.query(`SELECT "path" FROM "articles" WHERE "id" = $1`, [
      listingID,
    ])
    expect(restored.rows[0]?.path).toBe('/native-listing/')
    const concurrentPage = await database.query(
      `SELECT "path" FROM "pages" WHERE "title" = 'Arrived during down'`,
    )
    expect(concurrentPage.rows).toEqual([{ path: '/arrived-during-down/' }])

    const removedFoundation = await database.query(
      `SELECT
         to_regclass('public.route_registry') AS registry,
         EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_schema = 'public'
             AND table_name = 'articles'
             AND column_name = 'external_destination'
         ) AS external_destination_exists`,
    )
    expect(removedFoundation.rows[0]).toEqual({
      registry: null,
      external_destination_exists: false,
    })
  }, 60_000)
})
