import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $migration$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'market_volume_monthly_scope_unique'
          AND conrelid = 'app.market_volume_monthly'::regclass
      ) THEN
        ALTER TABLE app.market_volume_monthly
          ADD CONSTRAINT market_volume_monthly_scope_unique
          UNIQUE (asset_class_legacy_id, hub_legacy_id, year, month);
      END IF;
    END
    $migration$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE app.market_volume_monthly
      DROP CONSTRAINT IF EXISTS market_volume_monthly_scope_unique;
  `)
}
