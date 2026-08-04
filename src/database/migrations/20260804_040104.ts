import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "prefix" varchar;
  CREATE TYPE "public"."enum_pages_blocks_feature_list_items_display" AS ENUM('plain', 'image', 'icon');
  CREATE TYPE "public"."enum_pages_blocks_feature_list_items_action_style" AS ENUM('primary', 'secondary', 'accent', 'info', 'link');
  CREATE TYPE "public"."enum_pages_blocks_feature_list_items_action_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_pages_blocks_feature_list_presentation" AS ENUM('grid', 'carousel', 'leadCarousel');
  CREATE TYPE "public"."enum_pages_blocks_standalone_icon_icon" AS ENUM('gas', 'power', 'emissions');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_list_items_display" AS ENUM('plain', 'image', 'icon');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_list_items_action_style" AS ENUM('primary', 'secondary', 'accent', 'info', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_list_items_action_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_list_presentation" AS ENUM('grid', 'carousel', 'leadCarousel');
  CREATE TYPE "public"."enum__pages_v_blocks_standalone_icon_icon" AS ENUM('gas', 'power', 'emissions');
  CREATE TYPE "public"."enum_articles_blocks_feature_list_items_display" AS ENUM('plain', 'image', 'icon');
  CREATE TYPE "public"."enum_articles_blocks_feature_list_items_action_style" AS ENUM('primary', 'secondary', 'accent', 'info', 'link');
  CREATE TYPE "public"."enum_articles_blocks_feature_list_items_action_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_articles_blocks_feature_list_presentation" AS ENUM('grid', 'carousel', 'leadCarousel');
  CREATE TYPE "public"."enum_articles_blocks_standalone_icon_icon" AS ENUM('gas', 'power', 'emissions');
  CREATE TYPE "public"."enum__articles_v_blocks_feature_list_items_display" AS ENUM('plain', 'image', 'icon');
  CREATE TYPE "public"."enum__articles_v_blocks_feature_list_items_action_style" AS ENUM('primary', 'secondary', 'accent', 'info', 'link');
  CREATE TYPE "public"."enum__articles_v_blocks_feature_list_items_action_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__articles_v_blocks_feature_list_presentation" AS ENUM('grid', 'carousel', 'leadCarousel');
  CREATE TYPE "public"."enum__articles_v_blocks_standalone_icon_icon" AS ENUM('gas', 'power', 'emissions');
  CREATE TYPE "public"."enum_hubs_blocks_feature_list_items_display" AS ENUM('plain', 'image', 'icon');
  CREATE TYPE "public"."enum_hubs_blocks_feature_list_items_action_style" AS ENUM('primary', 'secondary', 'accent', 'info', 'link');
  CREATE TYPE "public"."enum_hubs_blocks_feature_list_items_action_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_hubs_blocks_feature_list_presentation" AS ENUM('grid', 'carousel', 'leadCarousel');
  CREATE TYPE "public"."enum_hubs_blocks_standalone_icon_icon" AS ENUM('gas', 'power', 'emissions');
  CREATE TYPE "public"."enum__hubs_v_blocks_feature_list_items_display" AS ENUM('plain', 'image', 'icon');
  CREATE TYPE "public"."enum__hubs_v_blocks_feature_list_items_action_style" AS ENUM('primary', 'secondary', 'accent', 'info', 'link');
  CREATE TYPE "public"."enum__hubs_v_blocks_feature_list_items_action_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__hubs_v_blocks_feature_list_presentation" AS ENUM('grid', 'carousel', 'leadCarousel');
  CREATE TYPE "public"."enum__hubs_v_blocks_standalone_icon_icon" AS ENUM('gas', 'power', 'emissions');
  CREATE TYPE "public"."enum_venues_blocks_feature_list_items_display" AS ENUM('plain', 'image', 'icon');
  CREATE TYPE "public"."enum_venues_blocks_feature_list_items_action_style" AS ENUM('primary', 'secondary', 'accent', 'info', 'link');
  CREATE TYPE "public"."enum_venues_blocks_feature_list_items_action_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_venues_blocks_feature_list_presentation" AS ENUM('grid', 'carousel', 'leadCarousel');
  CREATE TYPE "public"."enum_venues_blocks_standalone_icon_icon" AS ENUM('gas', 'power', 'emissions');
  CREATE TYPE "public"."enum__venues_v_blocks_feature_list_items_display" AS ENUM('plain', 'image', 'icon');
  CREATE TYPE "public"."enum__venues_v_blocks_feature_list_items_action_style" AS ENUM('primary', 'secondary', 'accent', 'info', 'link');
  CREATE TYPE "public"."enum__venues_v_blocks_feature_list_items_action_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__venues_v_blocks_feature_list_presentation" AS ENUM('grid', 'carousel', 'leadCarousel');
  CREATE TYPE "public"."enum__venues_v_blocks_standalone_icon_icon" AS ENUM('gas', 'power', 'emissions');
  CREATE TYPE "public"."enum_learning_videos_blocks_feature_list_items_display" AS ENUM('plain', 'image', 'icon');
  CREATE TYPE "public"."enum_learning_videos_blocks_feature_list_items_action_style" AS ENUM('primary', 'secondary', 'accent', 'info', 'link');
  CREATE TYPE "public"."enum_learning_videos_blocks_feature_list_items_action_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_learning_videos_blocks_feature_list_presentation" AS ENUM('grid', 'carousel', 'leadCarousel');
  CREATE TYPE "public"."enum_learning_videos_blocks_standalone_icon_icon" AS ENUM('gas', 'power', 'emissions');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_feature_list_items_display" AS ENUM('plain', 'image', 'icon');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_feature_list_items_action_style" AS ENUM('primary', 'secondary', 'accent', 'info', 'link');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_feature_list_items_action_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_feature_list_presentation" AS ENUM('grid', 'carousel', 'leadCarousel');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_standalone_icon_icon" AS ENUM('gas', 'power', 'emissions');
  CREATE TABLE "pages_blocks_standalone_icon" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_standalone_icon_icon",
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_standalone_icon" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_standalone_icon_icon",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_standalone_icon" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_articles_blocks_standalone_icon_icon",
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_standalone_icon" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__articles_v_blocks_standalone_icon_icon",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "hubs_blocks_standalone_icon" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_hubs_blocks_standalone_icon_icon",
  	"block_name" varchar
  );
  
  CREATE TABLE "_hubs_v_blocks_standalone_icon" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__hubs_v_blocks_standalone_icon_icon",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "venues_blocks_standalone_icon" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_venues_blocks_standalone_icon_icon",
  	"block_name" varchar
  );
  
  CREATE TABLE "_venues_v_blocks_standalone_icon" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__venues_v_blocks_standalone_icon_icon",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "learning_videos_blocks_standalone_icon" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_learning_videos_blocks_standalone_icon_icon",
  	"block_name" varchar
  );
  
  CREATE TABLE "_learning_videos_v_blocks_standalone_icon" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__learning_videos_v_blocks_standalone_icon_icon",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_feature_list_items" ADD COLUMN "display" "enum_pages_blocks_feature_list_items_display" DEFAULT 'plain';
  ALTER TABLE "pages_blocks_feature_list_items" ADD COLUMN "show_action" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_feature_list_items" ADD COLUMN "action_style" "enum_pages_blocks_feature_list_items_action_style" DEFAULT 'link';
  ALTER TABLE "pages_blocks_feature_list_items" ADD COLUMN "action_icon" "enum_pages_blocks_feature_list_items_action_icon";
  ALTER TABLE "pages_blocks_feature_list" ADD COLUMN "presentation" "enum_pages_blocks_feature_list_presentation" DEFAULT 'grid';
  ALTER TABLE "_pages_v_blocks_feature_list_items" ADD COLUMN "display" "enum__pages_v_blocks_feature_list_items_display" DEFAULT 'plain';
  ALTER TABLE "_pages_v_blocks_feature_list_items" ADD COLUMN "show_action" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_feature_list_items" ADD COLUMN "action_style" "enum__pages_v_blocks_feature_list_items_action_style" DEFAULT 'link';
  ALTER TABLE "_pages_v_blocks_feature_list_items" ADD COLUMN "action_icon" "enum__pages_v_blocks_feature_list_items_action_icon";
  ALTER TABLE "_pages_v_blocks_feature_list" ADD COLUMN "presentation" "enum__pages_v_blocks_feature_list_presentation" DEFAULT 'grid';
  ALTER TABLE "articles_blocks_feature_list_items" ADD COLUMN "display" "enum_articles_blocks_feature_list_items_display" DEFAULT 'plain';
  ALTER TABLE "articles_blocks_feature_list_items" ADD COLUMN "show_action" boolean DEFAULT false;
  ALTER TABLE "articles_blocks_feature_list_items" ADD COLUMN "action_style" "enum_articles_blocks_feature_list_items_action_style" DEFAULT 'link';
  ALTER TABLE "articles_blocks_feature_list_items" ADD COLUMN "action_icon" "enum_articles_blocks_feature_list_items_action_icon";
  ALTER TABLE "articles_blocks_feature_list" ADD COLUMN "presentation" "enum_articles_blocks_feature_list_presentation" DEFAULT 'grid';
  ALTER TABLE "_articles_v_blocks_feature_list_items" ADD COLUMN "display" "enum__articles_v_blocks_feature_list_items_display" DEFAULT 'plain';
  ALTER TABLE "_articles_v_blocks_feature_list_items" ADD COLUMN "show_action" boolean DEFAULT false;
  ALTER TABLE "_articles_v_blocks_feature_list_items" ADD COLUMN "action_style" "enum__articles_v_blocks_feature_list_items_action_style" DEFAULT 'link';
  ALTER TABLE "_articles_v_blocks_feature_list_items" ADD COLUMN "action_icon" "enum__articles_v_blocks_feature_list_items_action_icon";
  ALTER TABLE "_articles_v_blocks_feature_list" ADD COLUMN "presentation" "enum__articles_v_blocks_feature_list_presentation" DEFAULT 'grid';
  ALTER TABLE "hubs_blocks_feature_list_items" ADD COLUMN "display" "enum_hubs_blocks_feature_list_items_display" DEFAULT 'plain';
  ALTER TABLE "hubs_blocks_feature_list_items" ADD COLUMN "show_action" boolean DEFAULT false;
  ALTER TABLE "hubs_blocks_feature_list_items" ADD COLUMN "action_style" "enum_hubs_blocks_feature_list_items_action_style" DEFAULT 'link';
  ALTER TABLE "hubs_blocks_feature_list_items" ADD COLUMN "action_icon" "enum_hubs_blocks_feature_list_items_action_icon";
  ALTER TABLE "hubs_blocks_feature_list" ADD COLUMN "presentation" "enum_hubs_blocks_feature_list_presentation" DEFAULT 'grid';
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ADD COLUMN "display" "enum__hubs_v_blocks_feature_list_items_display" DEFAULT 'plain';
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ADD COLUMN "show_action" boolean DEFAULT false;
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ADD COLUMN "action_style" "enum__hubs_v_blocks_feature_list_items_action_style" DEFAULT 'link';
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ADD COLUMN "action_icon" "enum__hubs_v_blocks_feature_list_items_action_icon";
  ALTER TABLE "_hubs_v_blocks_feature_list" ADD COLUMN "presentation" "enum__hubs_v_blocks_feature_list_presentation" DEFAULT 'grid';
  ALTER TABLE "venues_blocks_feature_list_items" ADD COLUMN "display" "enum_venues_blocks_feature_list_items_display" DEFAULT 'plain';
  ALTER TABLE "venues_blocks_feature_list_items" ADD COLUMN "show_action" boolean DEFAULT false;
  ALTER TABLE "venues_blocks_feature_list_items" ADD COLUMN "action_style" "enum_venues_blocks_feature_list_items_action_style" DEFAULT 'link';
  ALTER TABLE "venues_blocks_feature_list_items" ADD COLUMN "action_icon" "enum_venues_blocks_feature_list_items_action_icon";
  ALTER TABLE "venues_blocks_feature_list" ADD COLUMN "presentation" "enum_venues_blocks_feature_list_presentation" DEFAULT 'grid';
  ALTER TABLE "_venues_v_blocks_feature_list_items" ADD COLUMN "display" "enum__venues_v_blocks_feature_list_items_display" DEFAULT 'plain';
  ALTER TABLE "_venues_v_blocks_feature_list_items" ADD COLUMN "show_action" boolean DEFAULT false;
  ALTER TABLE "_venues_v_blocks_feature_list_items" ADD COLUMN "action_style" "enum__venues_v_blocks_feature_list_items_action_style" DEFAULT 'link';
  ALTER TABLE "_venues_v_blocks_feature_list_items" ADD COLUMN "action_icon" "enum__venues_v_blocks_feature_list_items_action_icon";
  ALTER TABLE "_venues_v_blocks_feature_list" ADD COLUMN "presentation" "enum__venues_v_blocks_feature_list_presentation" DEFAULT 'grid';
  ALTER TABLE "learning_videos_blocks_feature_list_items" ADD COLUMN "display" "enum_learning_videos_blocks_feature_list_items_display" DEFAULT 'plain';
  ALTER TABLE "learning_videos_blocks_feature_list_items" ADD COLUMN "show_action" boolean DEFAULT false;
  ALTER TABLE "learning_videos_blocks_feature_list_items" ADD COLUMN "action_style" "enum_learning_videos_blocks_feature_list_items_action_style" DEFAULT 'link';
  ALTER TABLE "learning_videos_blocks_feature_list_items" ADD COLUMN "action_icon" "enum_learning_videos_blocks_feature_list_items_action_icon";
  ALTER TABLE "learning_videos_blocks_feature_list" ADD COLUMN "presentation" "enum_learning_videos_blocks_feature_list_presentation" DEFAULT 'grid';
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ADD COLUMN "display" "enum__learning_videos_v_blocks_feature_list_items_display" DEFAULT 'plain';
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ADD COLUMN "show_action" boolean DEFAULT false;
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ADD COLUMN "action_style" "enum__learning_videos_v_blocks_feature_list_items_action_style" DEFAULT 'link';
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ADD COLUMN "action_icon" "enum__learning_videos_v_blocks_feature_list_items_action_icon";
  ALTER TABLE "_learning_videos_v_blocks_feature_list" ADD COLUMN "presentation" "enum__learning_videos_v_blocks_feature_list_presentation" DEFAULT 'grid';
  ALTER TABLE "pages_blocks_standalone_icon" ADD CONSTRAINT "pages_blocks_standalone_icon_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_standalone_icon" ADD CONSTRAINT "_pages_v_blocks_standalone_icon_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_standalone_icon" ADD CONSTRAINT "articles_blocks_standalone_icon_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_standalone_icon" ADD CONSTRAINT "_articles_v_blocks_standalone_icon_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_standalone_icon" ADD CONSTRAINT "hubs_blocks_standalone_icon_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_standalone_icon" ADD CONSTRAINT "_hubs_v_blocks_standalone_icon_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_standalone_icon" ADD CONSTRAINT "venues_blocks_standalone_icon_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_standalone_icon" ADD CONSTRAINT "_venues_v_blocks_standalone_icon_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_standalone_icon" ADD CONSTRAINT "learning_videos_blocks_standalone_icon_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_standalone_icon" ADD CONSTRAINT "_learning_videos_v_blocks_standalone_icon_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_standalone_icon_order_idx" ON "pages_blocks_standalone_icon" USING btree ("_order");
  CREATE INDEX "pages_blocks_standalone_icon_parent_id_idx" ON "pages_blocks_standalone_icon" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_standalone_icon_path_idx" ON "pages_blocks_standalone_icon" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_standalone_icon_order_idx" ON "_pages_v_blocks_standalone_icon" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_standalone_icon_parent_id_idx" ON "_pages_v_blocks_standalone_icon" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_standalone_icon_path_idx" ON "_pages_v_blocks_standalone_icon" USING btree ("_path");
  CREATE INDEX "articles_blocks_standalone_icon_order_idx" ON "articles_blocks_standalone_icon" USING btree ("_order");
  CREATE INDEX "articles_blocks_standalone_icon_parent_id_idx" ON "articles_blocks_standalone_icon" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_standalone_icon_path_idx" ON "articles_blocks_standalone_icon" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_standalone_icon_order_idx" ON "_articles_v_blocks_standalone_icon" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_standalone_icon_parent_id_idx" ON "_articles_v_blocks_standalone_icon" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_standalone_icon_path_idx" ON "_articles_v_blocks_standalone_icon" USING btree ("_path");
  CREATE INDEX "hubs_blocks_standalone_icon_order_idx" ON "hubs_blocks_standalone_icon" USING btree ("_order");
  CREATE INDEX "hubs_blocks_standalone_icon_parent_id_idx" ON "hubs_blocks_standalone_icon" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_standalone_icon_path_idx" ON "hubs_blocks_standalone_icon" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_standalone_icon_order_idx" ON "_hubs_v_blocks_standalone_icon" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_standalone_icon_parent_id_idx" ON "_hubs_v_blocks_standalone_icon" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_standalone_icon_path_idx" ON "_hubs_v_blocks_standalone_icon" USING btree ("_path");
  CREATE INDEX "venues_blocks_standalone_icon_order_idx" ON "venues_blocks_standalone_icon" USING btree ("_order");
  CREATE INDEX "venues_blocks_standalone_icon_parent_id_idx" ON "venues_blocks_standalone_icon" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_standalone_icon_path_idx" ON "venues_blocks_standalone_icon" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_standalone_icon_order_idx" ON "_venues_v_blocks_standalone_icon" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_standalone_icon_parent_id_idx" ON "_venues_v_blocks_standalone_icon" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_standalone_icon_path_idx" ON "_venues_v_blocks_standalone_icon" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_standalone_icon_order_idx" ON "learning_videos_blocks_standalone_icon" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_standalone_icon_parent_id_idx" ON "learning_videos_blocks_standalone_icon" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_standalone_icon_path_idx" ON "learning_videos_blocks_standalone_icon" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_standalone_icon_order_idx" ON "_learning_videos_v_blocks_standalone_icon" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_standalone_icon_parent_id_idx" ON "_learning_videos_v_blocks_standalone_icon" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_standalone_icon_path_idx" ON "_learning_videos_v_blocks_standalone_icon" USING btree ("_path");
  UPDATE "pages_blocks_feature_list" SET "presentation" = CASE WHEN "layout"::text = 'stacked' THEN 'carousel' ELSE 'grid' END::"enum_pages_blocks_feature_list_presentation";
  UPDATE "_pages_v_blocks_feature_list" SET "presentation" = CASE WHEN "layout"::text = 'stacked' THEN 'carousel' ELSE 'grid' END::"enum__pages_v_blocks_feature_list_presentation";
  UPDATE "articles_blocks_feature_list" SET "presentation" = CASE WHEN "layout"::text = 'stacked' THEN 'carousel' ELSE 'grid' END::"enum_articles_blocks_feature_list_presentation";
  UPDATE "_articles_v_blocks_feature_list" SET "presentation" = CASE WHEN "layout"::text = 'stacked' THEN 'carousel' ELSE 'grid' END::"enum__articles_v_blocks_feature_list_presentation";
  UPDATE "hubs_blocks_feature_list" SET "presentation" = CASE WHEN "layout"::text = 'stacked' THEN 'carousel' ELSE 'grid' END::"enum_hubs_blocks_feature_list_presentation";
  UPDATE "_hubs_v_blocks_feature_list" SET "presentation" = CASE WHEN "layout"::text = 'stacked' THEN 'carousel' ELSE 'grid' END::"enum__hubs_v_blocks_feature_list_presentation";
  UPDATE "venues_blocks_feature_list" SET "presentation" = CASE WHEN "layout"::text = 'stacked' THEN 'carousel' ELSE 'grid' END::"enum_venues_blocks_feature_list_presentation";
  UPDATE "_venues_v_blocks_feature_list" SET "presentation" = CASE WHEN "layout"::text = 'stacked' THEN 'carousel' ELSE 'grid' END::"enum__venues_v_blocks_feature_list_presentation";
  UPDATE "learning_videos_blocks_feature_list" SET "presentation" = CASE WHEN "layout"::text = 'stacked' THEN 'carousel' ELSE 'grid' END::"enum_learning_videos_blocks_feature_list_presentation";
  UPDATE "_learning_videos_v_blocks_feature_list" SET "presentation" = CASE WHEN "layout"::text = 'stacked' THEN 'carousel' ELSE 'grid' END::"enum__learning_videos_v_blocks_feature_list_presentation";
  ALTER TABLE "pages_blocks_feature_list" DROP COLUMN "layout";
  ALTER TABLE "_pages_v_blocks_feature_list" DROP COLUMN "layout";
  ALTER TABLE "articles_blocks_feature_list" DROP COLUMN "layout";
  ALTER TABLE "_articles_v_blocks_feature_list" DROP COLUMN "layout";
  ALTER TABLE "hubs_blocks_feature_list" DROP COLUMN "layout";
  ALTER TABLE "_hubs_v_blocks_feature_list" DROP COLUMN "layout";
  ALTER TABLE "venues_blocks_feature_list" DROP COLUMN "layout";
  ALTER TABLE "_venues_v_blocks_feature_list" DROP COLUMN "layout";
  ALTER TABLE "learning_videos_blocks_feature_list" DROP COLUMN "layout";
  ALTER TABLE "_learning_videos_v_blocks_feature_list" DROP COLUMN "layout";
  DROP TYPE "public"."enum_pages_blocks_feature_list_layout";
  DROP TYPE "public"."enum__pages_v_blocks_feature_list_layout";
  DROP TYPE "public"."enum_articles_blocks_feature_list_layout";
  DROP TYPE "public"."enum__articles_v_blocks_feature_list_layout";
  DROP TYPE "public"."enum_hubs_blocks_feature_list_layout";
  DROP TYPE "public"."enum__hubs_v_blocks_feature_list_layout";
  DROP TYPE "public"."enum_venues_blocks_feature_list_layout";
  DROP TYPE "public"."enum__venues_v_blocks_feature_list_layout";
  DROP TYPE "public"."enum_learning_videos_blocks_feature_list_layout";
  DROP TYPE "public"."enum__learning_videos_v_blocks_feature_list_layout";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum_articles_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum__articles_v_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum_hubs_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum__hubs_v_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum_venues_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum__venues_v_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum_learning_videos_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  DROP TABLE "pages_blocks_standalone_icon" CASCADE;
  DROP TABLE "_pages_v_blocks_standalone_icon" CASCADE;
  DROP TABLE "articles_blocks_standalone_icon" CASCADE;
  DROP TABLE "_articles_v_blocks_standalone_icon" CASCADE;
  DROP TABLE "hubs_blocks_standalone_icon" CASCADE;
  DROP TABLE "_hubs_v_blocks_standalone_icon" CASCADE;
  DROP TABLE "venues_blocks_standalone_icon" CASCADE;
  DROP TABLE "_venues_v_blocks_standalone_icon" CASCADE;
  DROP TABLE "learning_videos_blocks_standalone_icon" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_standalone_icon" CASCADE;
  ALTER TABLE "pages_blocks_feature_list" ADD COLUMN "layout" "enum_pages_blocks_feature_list_layout" DEFAULT 'grid';
  ALTER TABLE "_pages_v_blocks_feature_list" ADD COLUMN "layout" "enum__pages_v_blocks_feature_list_layout" DEFAULT 'grid';
  ALTER TABLE "articles_blocks_feature_list" ADD COLUMN "layout" "enum_articles_blocks_feature_list_layout" DEFAULT 'grid';
  ALTER TABLE "_articles_v_blocks_feature_list" ADD COLUMN "layout" "enum__articles_v_blocks_feature_list_layout" DEFAULT 'grid';
  ALTER TABLE "hubs_blocks_feature_list" ADD COLUMN "layout" "enum_hubs_blocks_feature_list_layout" DEFAULT 'grid';
  ALTER TABLE "_hubs_v_blocks_feature_list" ADD COLUMN "layout" "enum__hubs_v_blocks_feature_list_layout" DEFAULT 'grid';
  ALTER TABLE "venues_blocks_feature_list" ADD COLUMN "layout" "enum_venues_blocks_feature_list_layout" DEFAULT 'grid';
  ALTER TABLE "_venues_v_blocks_feature_list" ADD COLUMN "layout" "enum__venues_v_blocks_feature_list_layout" DEFAULT 'grid';
  ALTER TABLE "learning_videos_blocks_feature_list" ADD COLUMN "layout" "enum_learning_videos_blocks_feature_list_layout" DEFAULT 'grid';
  ALTER TABLE "_learning_videos_v_blocks_feature_list" ADD COLUMN "layout" "enum__learning_videos_v_blocks_feature_list_layout" DEFAULT 'grid';
  UPDATE "pages_blocks_feature_list" SET "layout" = CASE WHEN "presentation"::text = 'grid' THEN 'grid' ELSE 'stacked' END::"enum_pages_blocks_feature_list_layout";
  UPDATE "_pages_v_blocks_feature_list" SET "layout" = CASE WHEN "presentation"::text = 'grid' THEN 'grid' ELSE 'stacked' END::"enum__pages_v_blocks_feature_list_layout";
  UPDATE "articles_blocks_feature_list" SET "layout" = CASE WHEN "presentation"::text = 'grid' THEN 'grid' ELSE 'stacked' END::"enum_articles_blocks_feature_list_layout";
  UPDATE "_articles_v_blocks_feature_list" SET "layout" = CASE WHEN "presentation"::text = 'grid' THEN 'grid' ELSE 'stacked' END::"enum__articles_v_blocks_feature_list_layout";
  UPDATE "hubs_blocks_feature_list" SET "layout" = CASE WHEN "presentation"::text = 'grid' THEN 'grid' ELSE 'stacked' END::"enum_hubs_blocks_feature_list_layout";
  UPDATE "_hubs_v_blocks_feature_list" SET "layout" = CASE WHEN "presentation"::text = 'grid' THEN 'grid' ELSE 'stacked' END::"enum__hubs_v_blocks_feature_list_layout";
  UPDATE "venues_blocks_feature_list" SET "layout" = CASE WHEN "presentation"::text = 'grid' THEN 'grid' ELSE 'stacked' END::"enum_venues_blocks_feature_list_layout";
  UPDATE "_venues_v_blocks_feature_list" SET "layout" = CASE WHEN "presentation"::text = 'grid' THEN 'grid' ELSE 'stacked' END::"enum__venues_v_blocks_feature_list_layout";
  UPDATE "learning_videos_blocks_feature_list" SET "layout" = CASE WHEN "presentation"::text = 'grid' THEN 'grid' ELSE 'stacked' END::"enum_learning_videos_blocks_feature_list_layout";
  UPDATE "_learning_videos_v_blocks_feature_list" SET "layout" = CASE WHEN "presentation"::text = 'grid' THEN 'grid' ELSE 'stacked' END::"enum__learning_videos_v_blocks_feature_list_layout";
  ALTER TABLE "pages_blocks_feature_list_items" DROP COLUMN "display";
  ALTER TABLE "pages_blocks_feature_list_items" DROP COLUMN "show_action";
  ALTER TABLE "pages_blocks_feature_list_items" DROP COLUMN "action_style";
  ALTER TABLE "pages_blocks_feature_list_items" DROP COLUMN "action_icon";
  ALTER TABLE "pages_blocks_feature_list" DROP COLUMN "presentation";
  ALTER TABLE "_pages_v_blocks_feature_list_items" DROP COLUMN "display";
  ALTER TABLE "_pages_v_blocks_feature_list_items" DROP COLUMN "show_action";
  ALTER TABLE "_pages_v_blocks_feature_list_items" DROP COLUMN "action_style";
  ALTER TABLE "_pages_v_blocks_feature_list_items" DROP COLUMN "action_icon";
  ALTER TABLE "_pages_v_blocks_feature_list" DROP COLUMN "presentation";
  ALTER TABLE "articles_blocks_feature_list_items" DROP COLUMN "display";
  ALTER TABLE "articles_blocks_feature_list_items" DROP COLUMN "show_action";
  ALTER TABLE "articles_blocks_feature_list_items" DROP COLUMN "action_style";
  ALTER TABLE "articles_blocks_feature_list_items" DROP COLUMN "action_icon";
  ALTER TABLE "articles_blocks_feature_list" DROP COLUMN "presentation";
  ALTER TABLE "_articles_v_blocks_feature_list_items" DROP COLUMN "display";
  ALTER TABLE "_articles_v_blocks_feature_list_items" DROP COLUMN "show_action";
  ALTER TABLE "_articles_v_blocks_feature_list_items" DROP COLUMN "action_style";
  ALTER TABLE "_articles_v_blocks_feature_list_items" DROP COLUMN "action_icon";
  ALTER TABLE "_articles_v_blocks_feature_list" DROP COLUMN "presentation";
  ALTER TABLE "hubs_blocks_feature_list_items" DROP COLUMN "display";
  ALTER TABLE "hubs_blocks_feature_list_items" DROP COLUMN "show_action";
  ALTER TABLE "hubs_blocks_feature_list_items" DROP COLUMN "action_style";
  ALTER TABLE "hubs_blocks_feature_list_items" DROP COLUMN "action_icon";
  ALTER TABLE "hubs_blocks_feature_list" DROP COLUMN "presentation";
  ALTER TABLE "_hubs_v_blocks_feature_list_items" DROP COLUMN "display";
  ALTER TABLE "_hubs_v_blocks_feature_list_items" DROP COLUMN "show_action";
  ALTER TABLE "_hubs_v_blocks_feature_list_items" DROP COLUMN "action_style";
  ALTER TABLE "_hubs_v_blocks_feature_list_items" DROP COLUMN "action_icon";
  ALTER TABLE "_hubs_v_blocks_feature_list" DROP COLUMN "presentation";
  ALTER TABLE "venues_blocks_feature_list_items" DROP COLUMN "display";
  ALTER TABLE "venues_blocks_feature_list_items" DROP COLUMN "show_action";
  ALTER TABLE "venues_blocks_feature_list_items" DROP COLUMN "action_style";
  ALTER TABLE "venues_blocks_feature_list_items" DROP COLUMN "action_icon";
  ALTER TABLE "venues_blocks_feature_list" DROP COLUMN "presentation";
  ALTER TABLE "_venues_v_blocks_feature_list_items" DROP COLUMN "display";
  ALTER TABLE "_venues_v_blocks_feature_list_items" DROP COLUMN "show_action";
  ALTER TABLE "_venues_v_blocks_feature_list_items" DROP COLUMN "action_style";
  ALTER TABLE "_venues_v_blocks_feature_list_items" DROP COLUMN "action_icon";
  ALTER TABLE "_venues_v_blocks_feature_list" DROP COLUMN "presentation";
  ALTER TABLE "learning_videos_blocks_feature_list_items" DROP COLUMN "display";
  ALTER TABLE "learning_videos_blocks_feature_list_items" DROP COLUMN "show_action";
  ALTER TABLE "learning_videos_blocks_feature_list_items" DROP COLUMN "action_style";
  ALTER TABLE "learning_videos_blocks_feature_list_items" DROP COLUMN "action_icon";
  ALTER TABLE "learning_videos_blocks_feature_list" DROP COLUMN "presentation";
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" DROP COLUMN "display";
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" DROP COLUMN "show_action";
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" DROP COLUMN "action_style";
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" DROP COLUMN "action_icon";
  ALTER TABLE "_learning_videos_v_blocks_feature_list" DROP COLUMN "presentation";
  DROP TYPE "public"."enum_pages_blocks_feature_list_items_display";
  DROP TYPE "public"."enum_pages_blocks_feature_list_items_action_style";
  DROP TYPE "public"."enum_pages_blocks_feature_list_items_action_icon";
  DROP TYPE "public"."enum_pages_blocks_feature_list_presentation";
  DROP TYPE "public"."enum_pages_blocks_standalone_icon_icon";
  DROP TYPE "public"."enum__pages_v_blocks_feature_list_items_display";
  DROP TYPE "public"."enum__pages_v_blocks_feature_list_items_action_style";
  DROP TYPE "public"."enum__pages_v_blocks_feature_list_items_action_icon";
  DROP TYPE "public"."enum__pages_v_blocks_feature_list_presentation";
  DROP TYPE "public"."enum__pages_v_blocks_standalone_icon_icon";
  DROP TYPE "public"."enum_articles_blocks_feature_list_items_display";
  DROP TYPE "public"."enum_articles_blocks_feature_list_items_action_style";
  DROP TYPE "public"."enum_articles_blocks_feature_list_items_action_icon";
  DROP TYPE "public"."enum_articles_blocks_feature_list_presentation";
  DROP TYPE "public"."enum_articles_blocks_standalone_icon_icon";
  DROP TYPE "public"."enum__articles_v_blocks_feature_list_items_display";
  DROP TYPE "public"."enum__articles_v_blocks_feature_list_items_action_style";
  DROP TYPE "public"."enum__articles_v_blocks_feature_list_items_action_icon";
  DROP TYPE "public"."enum__articles_v_blocks_feature_list_presentation";
  DROP TYPE "public"."enum__articles_v_blocks_standalone_icon_icon";
  DROP TYPE "public"."enum_hubs_blocks_feature_list_items_display";
  DROP TYPE "public"."enum_hubs_blocks_feature_list_items_action_style";
  DROP TYPE "public"."enum_hubs_blocks_feature_list_items_action_icon";
  DROP TYPE "public"."enum_hubs_blocks_feature_list_presentation";
  DROP TYPE "public"."enum_hubs_blocks_standalone_icon_icon";
  DROP TYPE "public"."enum__hubs_v_blocks_feature_list_items_display";
  DROP TYPE "public"."enum__hubs_v_blocks_feature_list_items_action_style";
  DROP TYPE "public"."enum__hubs_v_blocks_feature_list_items_action_icon";
  DROP TYPE "public"."enum__hubs_v_blocks_feature_list_presentation";
  DROP TYPE "public"."enum__hubs_v_blocks_standalone_icon_icon";
  DROP TYPE "public"."enum_venues_blocks_feature_list_items_display";
  DROP TYPE "public"."enum_venues_blocks_feature_list_items_action_style";
  DROP TYPE "public"."enum_venues_blocks_feature_list_items_action_icon";
  DROP TYPE "public"."enum_venues_blocks_feature_list_presentation";
  DROP TYPE "public"."enum_venues_blocks_standalone_icon_icon";
  DROP TYPE "public"."enum__venues_v_blocks_feature_list_items_display";
  DROP TYPE "public"."enum__venues_v_blocks_feature_list_items_action_style";
  DROP TYPE "public"."enum__venues_v_blocks_feature_list_items_action_icon";
  DROP TYPE "public"."enum__venues_v_blocks_feature_list_presentation";
  DROP TYPE "public"."enum__venues_v_blocks_standalone_icon_icon";
  DROP TYPE "public"."enum_learning_videos_blocks_feature_list_items_display";
  DROP TYPE "public"."enum_learning_videos_blocks_feature_list_items_action_style";
  DROP TYPE "public"."enum_learning_videos_blocks_feature_list_items_action_icon";
  DROP TYPE "public"."enum_learning_videos_blocks_feature_list_presentation";
  DROP TYPE "public"."enum_learning_videos_blocks_standalone_icon_icon";
  DROP TYPE "public"."enum__learning_videos_v_blocks_feature_list_items_display";
  DROP TYPE "public"."enum__learning_videos_v_blocks_feature_list_items_action_style";
  DROP TYPE "public"."enum__learning_videos_v_blocks_feature_list_items_action_icon";
  DROP TYPE "public"."enum__learning_videos_v_blocks_feature_list_presentation";
  DROP TYPE "public"."enum__learning_videos_v_blocks_standalone_icon_icon";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "prefix";`)
}
