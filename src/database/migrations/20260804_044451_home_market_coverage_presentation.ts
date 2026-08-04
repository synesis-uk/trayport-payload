import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_market_coverage_presentation" AS ENUM('mapOnly', 'summary');
  CREATE TYPE "public"."enum__pages_v_blocks_market_coverage_presentation" AS ENUM('mapOnly', 'summary');
  CREATE TYPE "public"."enum_articles_blocks_market_coverage_presentation" AS ENUM('mapOnly', 'summary');
  CREATE TYPE "public"."enum__articles_v_blocks_market_coverage_presentation" AS ENUM('mapOnly', 'summary');
  CREATE TYPE "public"."enum_hubs_blocks_market_coverage_presentation" AS ENUM('mapOnly', 'summary');
  CREATE TYPE "public"."enum__hubs_v_blocks_market_coverage_presentation" AS ENUM('mapOnly', 'summary');
  CREATE TYPE "public"."enum_venues_blocks_market_coverage_presentation" AS ENUM('mapOnly', 'summary');
  CREATE TYPE "public"."enum__venues_v_blocks_market_coverage_presentation" AS ENUM('mapOnly', 'summary');
  CREATE TYPE "public"."enum_learning_videos_blocks_market_coverage_presentation" AS ENUM('mapOnly', 'summary');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_market_coverage_presentation" AS ENUM('mapOnly', 'summary');
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "presentation" "enum_pages_blocks_market_coverage_presentation" DEFAULT 'summary';
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "presentation" "enum__pages_v_blocks_market_coverage_presentation" DEFAULT 'summary';
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "presentation" "enum_articles_blocks_market_coverage_presentation" DEFAULT 'summary';
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "presentation" "enum__articles_v_blocks_market_coverage_presentation" DEFAULT 'summary';
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "presentation" "enum_hubs_blocks_market_coverage_presentation" DEFAULT 'summary';
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "presentation" "enum__hubs_v_blocks_market_coverage_presentation" DEFAULT 'summary';
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "presentation" "enum_venues_blocks_market_coverage_presentation" DEFAULT 'summary';
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "presentation" "enum__venues_v_blocks_market_coverage_presentation" DEFAULT 'summary';
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "presentation" "enum_learning_videos_blocks_market_coverage_presentation" DEFAULT 'summary';
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "presentation" "enum__learning_videos_v_blocks_market_coverage_presentation" DEFAULT 'summary';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "presentation";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "presentation";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "presentation";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "presentation";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "presentation";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "presentation";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "presentation";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "presentation";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "presentation";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "presentation";
  DROP TYPE "public"."enum_pages_blocks_market_coverage_presentation";
  DROP TYPE "public"."enum__pages_v_blocks_market_coverage_presentation";
  DROP TYPE "public"."enum_articles_blocks_market_coverage_presentation";
  DROP TYPE "public"."enum__articles_v_blocks_market_coverage_presentation";
  DROP TYPE "public"."enum_hubs_blocks_market_coverage_presentation";
  DROP TYPE "public"."enum__hubs_v_blocks_market_coverage_presentation";
  DROP TYPE "public"."enum_venues_blocks_market_coverage_presentation";
  DROP TYPE "public"."enum__venues_v_blocks_market_coverage_presentation";
  DROP TYPE "public"."enum_learning_videos_blocks_market_coverage_presentation";
  DROP TYPE "public"."enum__learning_videos_v_blocks_market_coverage_presentation";`)
}
