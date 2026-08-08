import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."spacing_top" ADD VALUE 'none' BEFORE 'tight';
  ALTER TYPE "public"."spacing_bottom" ADD VALUE 'none' BEFORE 'tight';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::text;
  ALTER TABLE "_pages_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::text;
  ALTER TABLE "articles_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE text;
  ALTER TABLE "articles_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::text;
  ALTER TABLE "_articles_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE text;
  ALTER TABLE "_articles_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::text;
  ALTER TABLE "hubs_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE text;
  ALTER TABLE "hubs_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::text;
  ALTER TABLE "_hubs_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE text;
  ALTER TABLE "_hubs_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::text;
  ALTER TABLE "venues_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE text;
  ALTER TABLE "venues_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::text;
  ALTER TABLE "_venues_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE text;
  ALTER TABLE "_venues_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::text;
  ALTER TABLE "learning_videos_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE text;
  ALTER TABLE "learning_videos_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::text;
  ALTER TABLE "_learning_videos_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE text;
  ALTER TABLE "_learning_videos_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::text;
  DROP TYPE "public"."spacing_top";
  CREATE TYPE "public"."spacing_top" AS ENUM('tight', 'regular', 'large');
  ALTER TABLE "pages_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::"public"."spacing_top";
  ALTER TABLE "pages_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE "public"."spacing_top" USING "spacing_top"::"public"."spacing_top";
  ALTER TABLE "_pages_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::"public"."spacing_top";
  ALTER TABLE "_pages_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE "public"."spacing_top" USING "spacing_top"::"public"."spacing_top";
  ALTER TABLE "articles_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::"public"."spacing_top";
  ALTER TABLE "articles_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE "public"."spacing_top" USING "spacing_top"::"public"."spacing_top";
  ALTER TABLE "_articles_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::"public"."spacing_top";
  ALTER TABLE "_articles_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE "public"."spacing_top" USING "spacing_top"::"public"."spacing_top";
  ALTER TABLE "hubs_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::"public"."spacing_top";
  ALTER TABLE "hubs_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE "public"."spacing_top" USING "spacing_top"::"public"."spacing_top";
  ALTER TABLE "_hubs_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::"public"."spacing_top";
  ALTER TABLE "_hubs_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE "public"."spacing_top" USING "spacing_top"::"public"."spacing_top";
  ALTER TABLE "venues_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::"public"."spacing_top";
  ALTER TABLE "venues_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE "public"."spacing_top" USING "spacing_top"::"public"."spacing_top";
  ALTER TABLE "_venues_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::"public"."spacing_top";
  ALTER TABLE "_venues_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE "public"."spacing_top" USING "spacing_top"::"public"."spacing_top";
  ALTER TABLE "learning_videos_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::"public"."spacing_top";
  ALTER TABLE "learning_videos_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE "public"."spacing_top" USING "spacing_top"::"public"."spacing_top";
  ALTER TABLE "_learning_videos_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DEFAULT 'regular'::"public"."spacing_top";
  ALTER TABLE "_learning_videos_v_blocks_content_section" ALTER COLUMN "spacing_top" SET DATA TYPE "public"."spacing_top" USING "spacing_top"::"public"."spacing_top";
  ALTER TABLE "pages_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::text;
  ALTER TABLE "_pages_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::text;
  ALTER TABLE "articles_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE text;
  ALTER TABLE "articles_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::text;
  ALTER TABLE "_articles_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE text;
  ALTER TABLE "_articles_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::text;
  ALTER TABLE "hubs_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE text;
  ALTER TABLE "hubs_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::text;
  ALTER TABLE "_hubs_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE text;
  ALTER TABLE "_hubs_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::text;
  ALTER TABLE "venues_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE text;
  ALTER TABLE "venues_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::text;
  ALTER TABLE "_venues_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE text;
  ALTER TABLE "_venues_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::text;
  ALTER TABLE "learning_videos_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE text;
  ALTER TABLE "learning_videos_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::text;
  ALTER TABLE "_learning_videos_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE text;
  ALTER TABLE "_learning_videos_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::text;
  DROP TYPE "public"."spacing_bottom";
  CREATE TYPE "public"."spacing_bottom" AS ENUM('tight', 'regular', 'large');
  ALTER TABLE "pages_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::"public"."spacing_bottom";
  ALTER TABLE "pages_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE "public"."spacing_bottom" USING "spacing_bottom"::"public"."spacing_bottom";
  ALTER TABLE "_pages_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::"public"."spacing_bottom";
  ALTER TABLE "_pages_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE "public"."spacing_bottom" USING "spacing_bottom"::"public"."spacing_bottom";
  ALTER TABLE "articles_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::"public"."spacing_bottom";
  ALTER TABLE "articles_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE "public"."spacing_bottom" USING "spacing_bottom"::"public"."spacing_bottom";
  ALTER TABLE "_articles_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::"public"."spacing_bottom";
  ALTER TABLE "_articles_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE "public"."spacing_bottom" USING "spacing_bottom"::"public"."spacing_bottom";
  ALTER TABLE "hubs_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::"public"."spacing_bottom";
  ALTER TABLE "hubs_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE "public"."spacing_bottom" USING "spacing_bottom"::"public"."spacing_bottom";
  ALTER TABLE "_hubs_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::"public"."spacing_bottom";
  ALTER TABLE "_hubs_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE "public"."spacing_bottom" USING "spacing_bottom"::"public"."spacing_bottom";
  ALTER TABLE "venues_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::"public"."spacing_bottom";
  ALTER TABLE "venues_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE "public"."spacing_bottom" USING "spacing_bottom"::"public"."spacing_bottom";
  ALTER TABLE "_venues_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::"public"."spacing_bottom";
  ALTER TABLE "_venues_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE "public"."spacing_bottom" USING "spacing_bottom"::"public"."spacing_bottom";
  ALTER TABLE "learning_videos_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::"public"."spacing_bottom";
  ALTER TABLE "learning_videos_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE "public"."spacing_bottom" USING "spacing_bottom"::"public"."spacing_bottom";
  ALTER TABLE "_learning_videos_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DEFAULT 'regular'::"public"."spacing_bottom";
  ALTER TABLE "_learning_videos_v_blocks_content_section" ALTER COLUMN "spacing_bottom" SET DATA TYPE "public"."spacing_bottom" USING "spacing_bottom"::"public"."spacing_bottom";`)
}
