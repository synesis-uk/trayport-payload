import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "learning_videos" ALTER COLUMN "access_mode" SET DEFAULT 'subscriber';
  ALTER TABLE "_learning_videos_v" ALTER COLUMN "version_access_mode" SET DEFAULT 'subscriber';
  ALTER TABLE "media" ADD COLUMN "source_file_hash" varchar;
  CREATE INDEX "media_source_file_hash_idx" ON "media" USING btree ("source_file_hash");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  LOCK TABLE "media" IN SHARE ROW EXCLUSIVE MODE;

  DO $guard$
  BEGIN
    IF EXISTS (SELECT 1 FROM "media" WHERE "source_file_hash" IS NOT NULL) THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Refusing production-pilot safety rollback: imported media fingerprints would be deleted.',
        HINT = 'Restore from a verified backup or clear only reproducible fingerprints before retrying the rollback.';
    END IF;
  END
  $guard$;

  DROP INDEX "media_source_file_hash_idx";
  ALTER TABLE "learning_videos" ALTER COLUMN "access_mode" SET DEFAULT 'public';
  ALTER TABLE "_learning_videos_v" ALTER COLUMN "version_access_mode" SET DEFAULT 'public';
  ALTER TABLE "media" DROP COLUMN "source_file_hash";`)
}
