import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_market_matrix_default_view" AS ENUM('joule', 'autoTrader', 'combined');
  CREATE TYPE "public"."enum__pages_v_blocks_market_matrix_default_view" AS ENUM('joule', 'autoTrader', 'combined');
  CREATE TYPE "public"."enum_articles_blocks_market_matrix_default_view" AS ENUM('joule', 'autoTrader', 'combined');
  CREATE TYPE "public"."enum__articles_v_blocks_market_matrix_default_view" AS ENUM('joule', 'autoTrader', 'combined');
  CREATE TYPE "public"."enum_hubs_blocks_market_matrix_default_view" AS ENUM('joule', 'autoTrader', 'combined');
  CREATE TYPE "public"."enum__hubs_v_blocks_market_matrix_default_view" AS ENUM('joule', 'autoTrader', 'combined');
  CREATE TYPE "public"."enum_venues_blocks_market_matrix_default_view" AS ENUM('joule', 'autoTrader', 'combined');
  CREATE TYPE "public"."enum__venues_v_blocks_market_matrix_default_view" AS ENUM('joule', 'autoTrader', 'combined');
  CREATE TYPE "public"."enum_learning_videos_blocks_market_matrix_default_view" AS ENUM('joule', 'autoTrader', 'combined');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_market_matrix_default_view" AS ENUM('joule', 'autoTrader', 'combined');
  CREATE TABLE "pages_blocks_market_matrix" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Trayport venue connectivity by market hub',
  	"default_view" "enum_pages_blocks_market_matrix_default_view" DEFAULT 'joule',
  	"show_filters" boolean DEFAULT true,
  	"show_download" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_market_matrix" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Trayport venue connectivity by market hub',
  	"default_view" "enum__pages_v_blocks_market_matrix_default_view" DEFAULT 'joule',
  	"show_filters" boolean DEFAULT true,
  	"show_download" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_market_matrix" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Trayport venue connectivity by market hub',
  	"default_view" "enum_articles_blocks_market_matrix_default_view" DEFAULT 'joule',
  	"show_filters" boolean DEFAULT true,
  	"show_download" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_market_matrix" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Trayport venue connectivity by market hub',
  	"default_view" "enum__articles_v_blocks_market_matrix_default_view" DEFAULT 'joule',
  	"show_filters" boolean DEFAULT true,
  	"show_download" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "hubs_blocks_market_matrix" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Trayport venue connectivity by market hub',
  	"default_view" "enum_hubs_blocks_market_matrix_default_view" DEFAULT 'joule',
  	"show_filters" boolean DEFAULT true,
  	"show_download" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_hubs_v_blocks_market_matrix" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Trayport venue connectivity by market hub',
  	"default_view" "enum__hubs_v_blocks_market_matrix_default_view" DEFAULT 'joule',
  	"show_filters" boolean DEFAULT true,
  	"show_download" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "venues_blocks_market_matrix" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Trayport venue connectivity by market hub',
  	"default_view" "enum_venues_blocks_market_matrix_default_view" DEFAULT 'joule',
  	"show_filters" boolean DEFAULT true,
  	"show_download" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_venues_v_blocks_market_matrix" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Trayport venue connectivity by market hub',
  	"default_view" "enum__venues_v_blocks_market_matrix_default_view" DEFAULT 'joule',
  	"show_filters" boolean DEFAULT true,
  	"show_download" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "learning_videos_blocks_market_matrix" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Trayport venue connectivity by market hub',
  	"default_view" "enum_learning_videos_blocks_market_matrix_default_view" DEFAULT 'joule',
  	"show_filters" boolean DEFAULT true,
  	"show_download" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_learning_videos_v_blocks_market_matrix" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Trayport venue connectivity by market hub',
  	"default_view" "enum__learning_videos_v_blocks_market_matrix_default_view" DEFAULT 'joule',
  	"show_filters" boolean DEFAULT true,
  	"show_download" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_market_matrix" ADD CONSTRAINT "pages_blocks_market_matrix_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_market_matrix" ADD CONSTRAINT "_pages_v_blocks_market_matrix_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_market_matrix" ADD CONSTRAINT "articles_blocks_market_matrix_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_market_matrix" ADD CONSTRAINT "_articles_v_blocks_market_matrix_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_market_matrix" ADD CONSTRAINT "hubs_blocks_market_matrix_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_market_matrix" ADD CONSTRAINT "_hubs_v_blocks_market_matrix_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_market_matrix" ADD CONSTRAINT "venues_blocks_market_matrix_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_market_matrix" ADD CONSTRAINT "_venues_v_blocks_market_matrix_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_market_matrix" ADD CONSTRAINT "learning_videos_blocks_market_matrix_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_market_matrix" ADD CONSTRAINT "_learning_videos_v_blocks_market_matrix_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_market_matrix_order_idx" ON "pages_blocks_market_matrix" USING btree ("_order");
  CREATE INDEX "pages_blocks_market_matrix_parent_id_idx" ON "pages_blocks_market_matrix" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_market_matrix_path_idx" ON "pages_blocks_market_matrix" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_market_matrix_order_idx" ON "_pages_v_blocks_market_matrix" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_market_matrix_parent_id_idx" ON "_pages_v_blocks_market_matrix" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_market_matrix_path_idx" ON "_pages_v_blocks_market_matrix" USING btree ("_path");
  CREATE INDEX "articles_blocks_market_matrix_order_idx" ON "articles_blocks_market_matrix" USING btree ("_order");
  CREATE INDEX "articles_blocks_market_matrix_parent_id_idx" ON "articles_blocks_market_matrix" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_market_matrix_path_idx" ON "articles_blocks_market_matrix" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_market_matrix_order_idx" ON "_articles_v_blocks_market_matrix" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_market_matrix_parent_id_idx" ON "_articles_v_blocks_market_matrix" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_market_matrix_path_idx" ON "_articles_v_blocks_market_matrix" USING btree ("_path");
  CREATE INDEX "hubs_blocks_market_matrix_order_idx" ON "hubs_blocks_market_matrix" USING btree ("_order");
  CREATE INDEX "hubs_blocks_market_matrix_parent_id_idx" ON "hubs_blocks_market_matrix" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_market_matrix_path_idx" ON "hubs_blocks_market_matrix" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_market_matrix_order_idx" ON "_hubs_v_blocks_market_matrix" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_market_matrix_parent_id_idx" ON "_hubs_v_blocks_market_matrix" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_market_matrix_path_idx" ON "_hubs_v_blocks_market_matrix" USING btree ("_path");
  CREATE INDEX "venues_blocks_market_matrix_order_idx" ON "venues_blocks_market_matrix" USING btree ("_order");
  CREATE INDEX "venues_blocks_market_matrix_parent_id_idx" ON "venues_blocks_market_matrix" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_market_matrix_path_idx" ON "venues_blocks_market_matrix" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_market_matrix_order_idx" ON "_venues_v_blocks_market_matrix" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_market_matrix_parent_id_idx" ON "_venues_v_blocks_market_matrix" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_market_matrix_path_idx" ON "_venues_v_blocks_market_matrix" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_market_matrix_order_idx" ON "learning_videos_blocks_market_matrix" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_market_matrix_parent_id_idx" ON "learning_videos_blocks_market_matrix" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_market_matrix_path_idx" ON "learning_videos_blocks_market_matrix" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_market_matrix_order_idx" ON "_learning_videos_v_blocks_market_matrix" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_market_matrix_parent_id_idx" ON "_learning_videos_v_blocks_market_matrix" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_market_matrix_path_idx" ON "_learning_videos_v_blocks_market_matrix" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_market_matrix" CASCADE;
  DROP TABLE "_pages_v_blocks_market_matrix" CASCADE;
  DROP TABLE "articles_blocks_market_matrix" CASCADE;
  DROP TABLE "_articles_v_blocks_market_matrix" CASCADE;
  DROP TABLE "hubs_blocks_market_matrix" CASCADE;
  DROP TABLE "_hubs_v_blocks_market_matrix" CASCADE;
  DROP TABLE "venues_blocks_market_matrix" CASCADE;
  DROP TABLE "_venues_v_blocks_market_matrix" CASCADE;
  DROP TABLE "learning_videos_blocks_market_matrix" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_market_matrix" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_market_matrix_default_view";
  DROP TYPE "public"."enum__pages_v_blocks_market_matrix_default_view";
  DROP TYPE "public"."enum_articles_blocks_market_matrix_default_view";
  DROP TYPE "public"."enum__articles_v_blocks_market_matrix_default_view";
  DROP TYPE "public"."enum_hubs_blocks_market_matrix_default_view";
  DROP TYPE "public"."enum__hubs_v_blocks_market_matrix_default_view";
  DROP TYPE "public"."enum_venues_blocks_market_matrix_default_view";
  DROP TYPE "public"."enum__venues_v_blocks_market_matrix_default_view";
  DROP TYPE "public"."enum_learning_videos_blocks_market_matrix_default_view";
  DROP TYPE "public"."enum__learning_videos_v_blocks_market_matrix_default_view";`)
}
