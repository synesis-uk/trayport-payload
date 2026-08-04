import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles" ADD COLUMN "display_date" timestamp(3) with time zone;
  ALTER TABLE "_articles_v" ADD COLUMN "version_display_date" timestamp(3) with time zone;

  UPDATE "articles"
  SET "display_date" = "published_at"
  WHERE "display_date" IS NULL;

  UPDATE "_articles_v"
  SET "version_display_date" = "version_published_at"
  WHERE "version_display_date" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "articles"
  SET "published_at" = "display_date"
  WHERE "display_date" IS NOT NULL;

  UPDATE "_articles_v"
  SET "version_published_at" = "version_display_date"
  WHERE "version_display_date" IS NOT NULL;

   ALTER TABLE "articles" DROP COLUMN "display_date";
  ALTER TABLE "_articles_v" DROP COLUMN "version_display_date";`)
}
