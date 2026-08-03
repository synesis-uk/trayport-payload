import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."content_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_feature_list_items_icon" AS ENUM('lightbulb', 'trend', 'clock', 'chart', 'scan');
  CREATE TYPE "public"."enum_pages_blocks_office_appearance" AS ENUM('standard', 'featured');
  CREATE TYPE "public"."enum_pages_blocks_article_listing_family" AS ENUM('insights', 'news', 'events', 'all');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_list_items_icon" AS ENUM('lightbulb', 'trend', 'clock', 'chart', 'scan');
  CREATE TYPE "public"."enum__pages_v_blocks_office_appearance" AS ENUM('standard', 'featured');
  CREATE TYPE "public"."enum__pages_v_blocks_article_listing_family" AS ENUM('insights', 'news', 'events', 'all');
  CREATE TYPE "public"."enum_articles_blocks_feature_list_items_icon" AS ENUM('lightbulb', 'trend', 'clock', 'chart', 'scan');
  CREATE TYPE "public"."enum_articles_blocks_office_appearance" AS ENUM('standard', 'featured');
  CREATE TYPE "public"."enum_articles_blocks_article_listing_family" AS ENUM('insights', 'news', 'events', 'all');
  CREATE TYPE "public"."enum__articles_v_blocks_feature_list_items_icon" AS ENUM('lightbulb', 'trend', 'clock', 'chart', 'scan');
  CREATE TYPE "public"."enum__articles_v_blocks_office_appearance" AS ENUM('standard', 'featured');
  CREATE TYPE "public"."enum__articles_v_blocks_article_listing_family" AS ENUM('insights', 'news', 'events', 'all');
  CREATE TYPE "public"."enum_hubs_blocks_feature_list_items_icon" AS ENUM('lightbulb', 'trend', 'clock', 'chart', 'scan');
  CREATE TYPE "public"."enum_hubs_blocks_office_appearance" AS ENUM('standard', 'featured');
  CREATE TYPE "public"."enum_hubs_blocks_article_listing_family" AS ENUM('insights', 'news', 'events', 'all');
  CREATE TYPE "public"."enum__hubs_v_blocks_feature_list_items_icon" AS ENUM('lightbulb', 'trend', 'clock', 'chart', 'scan');
  CREATE TYPE "public"."enum__hubs_v_blocks_office_appearance" AS ENUM('standard', 'featured');
  CREATE TYPE "public"."enum__hubs_v_blocks_article_listing_family" AS ENUM('insights', 'news', 'events', 'all');
  CREATE TYPE "public"."enum_venues_blocks_feature_list_items_icon" AS ENUM('lightbulb', 'trend', 'clock', 'chart', 'scan');
  CREATE TYPE "public"."enum_venues_blocks_office_appearance" AS ENUM('standard', 'featured');
  CREATE TYPE "public"."enum_venues_blocks_article_listing_family" AS ENUM('insights', 'news', 'events', 'all');
  CREATE TYPE "public"."enum_venues_market_connections_connection_type" AS ENUM('d', 'a', 'b');
  CREATE TYPE "public"."enum__venues_v_blocks_feature_list_items_icon" AS ENUM('lightbulb', 'trend', 'clock', 'chart', 'scan');
  CREATE TYPE "public"."enum__venues_v_blocks_office_appearance" AS ENUM('standard', 'featured');
  CREATE TYPE "public"."enum__venues_v_blocks_article_listing_family" AS ENUM('insights', 'news', 'events', 'all');
  CREATE TYPE "public"."enum__venues_v_version_market_connections_connection_type" AS ENUM('d', 'a', 'b');
  CREATE TYPE "public"."enum_learning_videos_blocks_feature_list_items_icon" AS ENUM('lightbulb', 'trend', 'clock', 'chart', 'scan');
  CREATE TYPE "public"."enum_learning_videos_blocks_office_appearance" AS ENUM('standard', 'featured');
  CREATE TYPE "public"."enum_learning_videos_blocks_article_listing_family" AS ENUM('insights', 'news', 'events', 'all');
  CREATE TYPE "public"."enum_learning_videos_content_mode" AS ENUM('listing', 'full');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_feature_list_items_icon" AS ENUM('lightbulb', 'trend', 'clock', 'chart', 'scan');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_office_appearance" AS ENUM('standard', 'featured');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_article_listing_family" AS ENUM('insights', 'news', 'events', 'all');
  CREATE TYPE "public"."enum__learning_videos_v_version_content_mode" AS ENUM('listing', 'full');
  CREATE TYPE "public"."enum_offices_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offices_v_version_status" AS ENUM('draft', 'published');
  ALTER TYPE "public"."enum_articles_article_type" ADD VALUE 'event';
  ALTER TYPE "public"."enum__articles_v_version_article_type" ADD VALUE 'event';
  ALTER TYPE "public"."enum_route_registry_archetype" ADD VALUE 'learning-video.listing-metadata' BEFORE 'hub.public-page';
  CREATE TABLE "pages_blocks_office" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "office_id" integer,
    "appearance" "enum_pages_blocks_office_appearance" DEFAULT 'standard',
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_learning_video_listing" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar DEFAULT 'Explore the Learning Hub',
    "intro" jsonb,
    "page_size" numeric DEFAULT 15,
    "show_product_filter" boolean DEFAULT true,
    "show_category_filter" boolean DEFAULT true,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_office" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "office_id" integer,
    "appearance" "enum__pages_v_blocks_office_appearance" DEFAULT 'standard',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_learning_video_listing" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "heading" varchar DEFAULT 'Explore the Learning Hub',
    "intro" jsonb,
    "page_size" numeric DEFAULT 15,
    "show_product_filter" boolean DEFAULT true,
    "show_category_filter" boolean DEFAULT true,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_office" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "office_id" integer,
    "appearance" "enum_articles_blocks_office_appearance" DEFAULT 'standard',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_learning_video_listing" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar DEFAULT 'Explore the Learning Hub',
    "intro" jsonb,
    "page_size" numeric DEFAULT 15,
    "show_product_filter" boolean DEFAULT true,
    "show_category_filter" boolean DEFAULT true,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_office" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "office_id" integer,
    "appearance" "enum__articles_v_blocks_office_appearance" DEFAULT 'standard',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_learning_video_listing" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "heading" varchar DEFAULT 'Explore the Learning Hub',
    "intro" jsonb,
    "page_size" numeric DEFAULT 15,
    "show_product_filter" boolean DEFAULT true,
    "show_category_filter" boolean DEFAULT true,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_office" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "office_id" integer,
    "appearance" "enum_hubs_blocks_office_appearance" DEFAULT 'standard',
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_learning_video_listing" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar DEFAULT 'Explore the Learning Hub',
    "intro" jsonb,
    "page_size" numeric DEFAULT 15,
    "show_product_filter" boolean DEFAULT true,
    "show_category_filter" boolean DEFAULT true,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_office" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "office_id" integer,
    "appearance" "enum__hubs_v_blocks_office_appearance" DEFAULT 'standard',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_learning_video_listing" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "heading" varchar DEFAULT 'Explore the Learning Hub',
    "intro" jsonb,
    "page_size" numeric DEFAULT 15,
    "show_product_filter" boolean DEFAULT true,
    "show_category_filter" boolean DEFAULT true,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_office" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "office_id" integer,
    "appearance" "enum_venues_blocks_office_appearance" DEFAULT 'standard',
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_learning_video_listing" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar DEFAULT 'Explore the Learning Hub',
    "intro" jsonb,
    "page_size" numeric DEFAULT 15,
    "show_product_filter" boolean DEFAULT true,
    "show_category_filter" boolean DEFAULT true,
    "block_name" varchar
  );

  CREATE TABLE "venues_market_connections" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "hub_id" integer,
    "connection_type" "enum_venues_market_connections_connection_type"
  );

  CREATE TABLE "_venues_v_blocks_office" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "office_id" integer,
    "appearance" "enum__venues_v_blocks_office_appearance" DEFAULT 'standard',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_learning_video_listing" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "heading" varchar DEFAULT 'Explore the Learning Hub',
    "intro" jsonb,
    "page_size" numeric DEFAULT 15,
    "show_product_filter" boolean DEFAULT true,
    "show_category_filter" boolean DEFAULT true,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_version_market_connections" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "hub_id" integer,
    "connection_type" "enum__venues_v_version_market_connections_connection_type",
    "_uuid" varchar
  );

  CREATE TABLE "learning_videos_tags" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar
  );

  CREATE TABLE "learning_videos_blocks_office" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "office_id" integer,
    "appearance" "enum_learning_videos_blocks_office_appearance" DEFAULT 'standard',
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_learning_video_listing" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar DEFAULT 'Explore the Learning Hub',
    "intro" jsonb,
    "page_size" numeric DEFAULT 15,
    "show_product_filter" boolean DEFAULT true,
    "show_category_filter" boolean DEFAULT true,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_version_tags" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_office" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "office_id" integer,
    "appearance" "enum__learning_videos_v_blocks_office_appearance" DEFAULT 'standard',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_learning_video_listing" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "heading" varchar DEFAULT 'Explore the Learning Hub',
    "intro" jsonb,
    "page_size" numeric DEFAULT 15,
    "show_product_filter" boolean DEFAULT true,
    "show_category_filter" boolean DEFAULT true,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "offices" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "legal_name" varchar,
    "address_prefix" varchar,
    "address" varchar,
    "city" varchar,
    "postcode" varchar,
    "country" varchar,
    "country_code" varchar,
    "coordinates_latitude" numeric,
    "coordinates_longitude" numeric,
    "phone" varchar,
    "email" varchar,
    "display_order" numeric DEFAULT 0,
    "legacy_source_key" varchar,
    "legacy_source_source" varchar,
    "legacy_source_legacy_id" numeric,
    "legacy_source_original_url" varchar,
    "legacy_source_modified_gmt" timestamp(3) with time zone,
    "legacy_source_content_hash" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_offices_status" DEFAULT 'draft'
  );

  CREATE TABLE "_offices_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_legal_name" varchar,
    "version_address_prefix" varchar,
    "version_address" varchar,
    "version_city" varchar,
    "version_postcode" varchar,
    "version_country" varchar,
    "version_country_code" varchar,
    "version_coordinates_latitude" numeric,
    "version_coordinates_longitude" numeric,
    "version_phone" varchar,
    "version_email" varchar,
    "version_display_order" numeric DEFAULT 0,
    "version_legacy_source_key" varchar,
    "version_legacy_source_source" varchar,
    "version_legacy_source_legacy_id" numeric,
    "version_legacy_source_original_url" varchar,
    "version_legacy_source_modified_gmt" timestamp(3) with time zone,
    "version_legacy_source_content_hash" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__offices_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean
  );

  DO $migration$
  DECLARE
    table_name text;
  BEGIN
    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_feature_list_items',
      '_pages_v_blocks_feature_list_items',
      'articles_blocks_feature_list_items',
      '_articles_v_blocks_feature_list_items',
      'hubs_blocks_feature_list_items',
      '_hubs_v_blocks_feature_list_items',
      'venues_blocks_feature_list_items',
      '_venues_v_blocks_feature_list_items',
      'learning_videos_blocks_feature_list_items',
      '_learning_videos_v_blocks_feature_list_items'
    ]
    LOOP
      EXECUTE format(
        'UPDATE %I SET icon = CASE WHEN icon = ''arrow-trend-up'' THEN ''trend'' WHEN icon IN (''lightbulb'', ''trend'', ''clock'', ''chart'', ''scan'') THEN icon ELSE NULL END',
        table_name
      );
    END LOOP;
  END
  $migration$;

  ALTER TABLE "pages_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_pages_blocks_feature_list_items_icon" USING "icon"::"public"."enum_pages_blocks_feature_list_items_icon";
  ALTER TABLE "_pages_v_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum__pages_v_blocks_feature_list_items_icon" USING "icon"::"public"."enum__pages_v_blocks_feature_list_items_icon";
  ALTER TABLE "articles_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_articles_blocks_feature_list_items_icon" USING "icon"::"public"."enum_articles_blocks_feature_list_items_icon";
  ALTER TABLE "_articles_v_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum__articles_v_blocks_feature_list_items_icon" USING "icon"::"public"."enum__articles_v_blocks_feature_list_items_icon";
  ALTER TABLE "hubs_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_hubs_blocks_feature_list_items_icon" USING "icon"::"public"."enum_hubs_blocks_feature_list_items_icon";
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum__hubs_v_blocks_feature_list_items_icon" USING "icon"::"public"."enum__hubs_v_blocks_feature_list_items_icon";
  ALTER TABLE "venues_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_venues_blocks_feature_list_items_icon" USING "icon"::"public"."enum_venues_blocks_feature_list_items_icon";
  ALTER TABLE "_venues_v_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum__venues_v_blocks_feature_list_items_icon" USING "icon"::"public"."enum__venues_v_blocks_feature_list_items_icon";
  ALTER TABLE "learning_videos_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_learning_videos_blocks_feature_list_items_icon" USING "icon"::"public"."enum_learning_videos_blocks_feature_list_items_icon";
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum__learning_videos_v_blocks_feature_list_items_icon" USING "icon"::"public"."enum__learning_videos_v_blocks_feature_list_items_icon";
  ALTER TABLE "pages_blocks_trayport_hero_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "pages_blocks_trayport_hero_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "pages_blocks_trayport_hero_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_actions_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "pages_blocks_actions_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "pages_blocks_actions_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_feature_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "pages_blocks_feature_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "pages_blocks_feature_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_faq_items" ADD COLUMN "media_id" integer;
  ALTER TABLE "pages_blocks_entity_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "pages_blocks_entity_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "pages_blocks_entity_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_market_coverage_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "pages_blocks_market_coverage_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "pages_blocks_market_coverage_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_article_listing" ADD COLUMN "family" "enum_pages_blocks_article_listing_family" DEFAULT 'insights';
  ALTER TABLE "pages_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "hubs_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_actions_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_pages_v_blocks_actions_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_pages_v_blocks_actions_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_feature_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_pages_v_blocks_feature_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_pages_v_blocks_feature_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD COLUMN "media_id" integer;
  ALTER TABLE "_pages_v_blocks_entity_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_pages_v_blocks_entity_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_pages_v_blocks_entity_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_article_listing" ADD COLUMN "family" "enum__pages_v_blocks_article_listing_family" DEFAULT 'insights';
  ALTER TABLE "_pages_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "hubs_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "articles_blocks_trayport_hero_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "articles_blocks_trayport_hero_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "articles_blocks_trayport_hero_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "articles_blocks_actions_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "articles_blocks_actions_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "articles_blocks_actions_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "articles_blocks_feature_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "articles_blocks_feature_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "articles_blocks_feature_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "articles_blocks_faq_items" ADD COLUMN "media_id" integer;
  ALTER TABLE "articles_blocks_entity_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "articles_blocks_entity_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "articles_blocks_entity_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "articles_blocks_market_coverage_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "articles_blocks_market_coverage_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "articles_blocks_market_coverage_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "articles_blocks_article_listing" ADD COLUMN "family" "enum_articles_blocks_article_listing_family" DEFAULT 'insights';
  ALTER TABLE "articles_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "articles_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "articles_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_articles_v_blocks_actions_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_articles_v_blocks_actions_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_articles_v_blocks_actions_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_articles_v_blocks_feature_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_articles_v_blocks_feature_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_articles_v_blocks_feature_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_articles_v_blocks_faq_items" ADD COLUMN "media_id" integer;
  ALTER TABLE "_articles_v_blocks_entity_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_articles_v_blocks_entity_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_articles_v_blocks_entity_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_articles_v_blocks_article_listing" ADD COLUMN "family" "enum__articles_v_blocks_article_listing_family" DEFAULT 'insights';
  ALTER TABLE "_articles_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_articles_v_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "_articles_v_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "hubs_blocks_trayport_hero_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "hubs_blocks_trayport_hero_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "hubs_blocks_trayport_hero_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "hubs_blocks_actions_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "hubs_blocks_actions_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "hubs_blocks_actions_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "hubs_blocks_feature_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "hubs_blocks_feature_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "hubs_blocks_feature_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "hubs_blocks_faq_items" ADD COLUMN "media_id" integer;
  ALTER TABLE "hubs_blocks_entity_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "hubs_blocks_entity_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "hubs_blocks_entity_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "hubs_blocks_market_coverage_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "hubs_blocks_market_coverage_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "hubs_blocks_market_coverage_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "hubs_blocks_article_listing" ADD COLUMN "family" "enum_hubs_blocks_article_listing_family" DEFAULT 'insights';
  ALTER TABLE "hubs" ADD COLUMN "external_destination" varchar;
  ALTER TABLE "hubs_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "hubs_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "hubs_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "hubs_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_hubs_v_blocks_actions_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_hubs_v_blocks_actions_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_hubs_v_blocks_actions_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_hubs_v_blocks_faq_items" ADD COLUMN "media_id" integer;
  ALTER TABLE "_hubs_v_blocks_entity_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_hubs_v_blocks_entity_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_hubs_v_blocks_entity_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_hubs_v_blocks_article_listing" ADD COLUMN "family" "enum__hubs_v_blocks_article_listing_family" DEFAULT 'insights';
  ALTER TABLE "_hubs_v" ADD COLUMN "version_external_destination" varchar;
  ALTER TABLE "_hubs_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_hubs_v_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "_hubs_v_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "_hubs_v_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "venues_blocks_trayport_hero_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "venues_blocks_trayport_hero_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "venues_blocks_trayport_hero_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "venues_blocks_actions_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "venues_blocks_actions_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "venues_blocks_actions_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "venues_blocks_feature_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "venues_blocks_feature_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "venues_blocks_feature_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "venues_blocks_faq_items" ADD COLUMN "media_id" integer;
  ALTER TABLE "venues_blocks_entity_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "venues_blocks_entity_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "venues_blocks_entity_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "venues_blocks_market_coverage_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "venues_blocks_market_coverage_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "venues_blocks_market_coverage_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "venues_blocks_article_listing" ADD COLUMN "family" "enum_venues_blocks_article_listing_family" DEFAULT 'insights';
  ALTER TABLE "venues_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "venues_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "venues_rels" ADD COLUMN "hubs_id" integer;
  ALTER TABLE "venues_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "venues_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_venues_v_blocks_actions_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_venues_v_blocks_actions_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_venues_v_blocks_actions_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_venues_v_blocks_feature_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_venues_v_blocks_feature_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_venues_v_blocks_feature_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_venues_v_blocks_faq_items" ADD COLUMN "media_id" integer;
  ALTER TABLE "_venues_v_blocks_entity_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_venues_v_blocks_entity_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_venues_v_blocks_entity_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_venues_v_blocks_article_listing" ADD COLUMN "family" "enum__venues_v_blocks_article_listing_family" DEFAULT 'insights';
  ALTER TABLE "_venues_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_venues_v_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "_venues_v_rels" ADD COLUMN "hubs_id" integer;
  ALTER TABLE "_venues_v_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "_venues_v_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "learning_videos_blocks_actions_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "learning_videos_blocks_actions_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "learning_videos_blocks_actions_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "learning_videos_blocks_feature_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "learning_videos_blocks_feature_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "learning_videos_blocks_feature_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "learning_videos_blocks_faq_items" ADD COLUMN "media_id" integer;
  ALTER TABLE "learning_videos_blocks_entity_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "learning_videos_blocks_entity_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "learning_videos_blocks_entity_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "learning_videos_blocks_article_listing" ADD COLUMN "family" "enum_learning_videos_blocks_article_listing_family" DEFAULT 'insights';
  ALTER TABLE "learning_videos" ADD COLUMN "description" jsonb;
  ALTER TABLE "learning_videos" ADD COLUMN "content_mode" "enum_learning_videos_content_mode" DEFAULT 'listing';
  ALTER TABLE "learning_videos" ADD COLUMN "external_destination" varchar;
  ALTER TABLE "learning_videos" ADD COLUMN "poster_id" integer;
  ALTER TABLE "learning_videos" ADD COLUMN "product" varchar;
  ALTER TABLE "learning_videos" ADD COLUMN "display_order" numeric DEFAULT 0;
  ALTER TABLE "learning_videos_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "learning_videos_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "learning_videos_rels" ADD COLUMN "hubs_id" integer;
  ALTER TABLE "learning_videos_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "learning_videos_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_learning_videos_v_blocks_faq_items" ADD COLUMN "media_id" integer;
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" ADD COLUMN "link_type" "content_link_type" DEFAULT 'reference';
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_learning_videos_v_blocks_article_listing" ADD COLUMN "family" "enum__learning_videos_v_blocks_article_listing_family" DEFAULT 'insights';
  ALTER TABLE "_learning_videos_v" ADD COLUMN "version_description" jsonb;
  ALTER TABLE "_learning_videos_v" ADD COLUMN "version_content_mode" "enum__learning_videos_v_version_content_mode" DEFAULT 'listing';
  ALTER TABLE "_learning_videos_v" ADD COLUMN "version_external_destination" varchar;
  ALTER TABLE "_learning_videos_v" ADD COLUMN "version_poster_id" integer;
  ALTER TABLE "_learning_videos_v" ADD COLUMN "version_product" varchar;
  ALTER TABLE "_learning_videos_v" ADD COLUMN "version_display_order" numeric DEFAULT 0;
  ALTER TABLE "_learning_videos_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_learning_videos_v_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "_learning_videos_v_rels" ADD COLUMN "hubs_id" integer;
  ALTER TABLE "_learning_videos_v_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "_learning_videos_v_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "offices_id" integer;
  ALTER TABLE "navigation_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "navigation_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "_navigation_v_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "_navigation_v_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "footer_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "footer_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "_footer_v_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "_footer_v_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "site_settings_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "site_settings_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "_site_settings_v_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "_site_settings_v_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "pages_blocks_office" ADD CONSTRAINT "pages_blocks_office_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_office" ADD CONSTRAINT "pages_blocks_office_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_learning_video_listing" ADD CONSTRAINT "pages_blocks_learning_video_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_office" ADD CONSTRAINT "_pages_v_blocks_office_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_office" ADD CONSTRAINT "_pages_v_blocks_office_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_learning_video_listing" ADD CONSTRAINT "_pages_v_blocks_learning_video_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_office" ADD CONSTRAINT "articles_blocks_office_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_office" ADD CONSTRAINT "articles_blocks_office_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_learning_video_listing" ADD CONSTRAINT "articles_blocks_learning_video_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_office" ADD CONSTRAINT "_articles_v_blocks_office_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_office" ADD CONSTRAINT "_articles_v_blocks_office_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_learning_video_listing" ADD CONSTRAINT "_articles_v_blocks_learning_video_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_office" ADD CONSTRAINT "hubs_blocks_office_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_blocks_office" ADD CONSTRAINT "hubs_blocks_office_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_learning_video_listing" ADD CONSTRAINT "hubs_blocks_learning_video_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_office" ADD CONSTRAINT "_hubs_v_blocks_office_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_office" ADD CONSTRAINT "_hubs_v_blocks_office_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_learning_video_listing" ADD CONSTRAINT "_hubs_v_blocks_learning_video_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_office" ADD CONSTRAINT "venues_blocks_office_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_blocks_office" ADD CONSTRAINT "venues_blocks_office_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_learning_video_listing" ADD CONSTRAINT "venues_blocks_learning_video_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_market_connections" ADD CONSTRAINT "venues_market_connections_hub_id_hubs_id_fk" FOREIGN KEY ("hub_id") REFERENCES "public"."hubs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_market_connections" ADD CONSTRAINT "venues_market_connections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_office" ADD CONSTRAINT "_venues_v_blocks_office_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_office" ADD CONSTRAINT "_venues_v_blocks_office_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_learning_video_listing" ADD CONSTRAINT "_venues_v_blocks_learning_video_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_version_market_connections" ADD CONSTRAINT "_venues_v_version_market_connections_hub_id_hubs_id_fk" FOREIGN KEY ("hub_id") REFERENCES "public"."hubs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_version_market_connections" ADD CONSTRAINT "_venues_v_version_market_connections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_tags" ADD CONSTRAINT "learning_videos_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_office" ADD CONSTRAINT "learning_videos_blocks_office_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_office" ADD CONSTRAINT "learning_videos_blocks_office_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_learning_video_listing" ADD CONSTRAINT "learning_videos_blocks_learning_video_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_version_tags" ADD CONSTRAINT "_learning_videos_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_office" ADD CONSTRAINT "_learning_videos_v_blocks_office_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_office" ADD CONSTRAINT "_learning_videos_v_blocks_office_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_learning_video_listing" ADD CONSTRAINT "_learning_videos_v_blocks_learning_video_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offices_v" ADD CONSTRAINT "_offices_v_parent_id_offices_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_office_order_idx" ON "pages_blocks_office" USING btree ("_order");
  CREATE INDEX "pages_blocks_office_parent_id_idx" ON "pages_blocks_office" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_office_path_idx" ON "pages_blocks_office" USING btree ("_path");
  CREATE INDEX "pages_blocks_office_office_idx" ON "pages_blocks_office" USING btree ("office_id");
  CREATE INDEX "pages_blocks_learning_video_listing_order_idx" ON "pages_blocks_learning_video_listing" USING btree ("_order");
  CREATE INDEX "pages_blocks_learning_video_listing_parent_id_idx" ON "pages_blocks_learning_video_listing" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_learning_video_listing_path_idx" ON "pages_blocks_learning_video_listing" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_office_order_idx" ON "_pages_v_blocks_office" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_office_parent_id_idx" ON "_pages_v_blocks_office" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_office_path_idx" ON "_pages_v_blocks_office" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_office_office_idx" ON "_pages_v_blocks_office" USING btree ("office_id");
  CREATE INDEX "_pages_v_blocks_learning_video_listing_order_idx" ON "_pages_v_blocks_learning_video_listing" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_learning_video_listing_parent_id_idx" ON "_pages_v_blocks_learning_video_listing" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_learning_video_listing_path_idx" ON "_pages_v_blocks_learning_video_listing" USING btree ("_path");
  CREATE INDEX "articles_blocks_office_order_idx" ON "articles_blocks_office" USING btree ("_order");
  CREATE INDEX "articles_blocks_office_parent_id_idx" ON "articles_blocks_office" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_office_path_idx" ON "articles_blocks_office" USING btree ("_path");
  CREATE INDEX "articles_blocks_office_office_idx" ON "articles_blocks_office" USING btree ("office_id");
  CREATE INDEX "articles_blocks_learning_video_listing_order_idx" ON "articles_blocks_learning_video_listing" USING btree ("_order");
  CREATE INDEX "articles_blocks_learning_video_listing_parent_id_idx" ON "articles_blocks_learning_video_listing" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_learning_video_listing_path_idx" ON "articles_blocks_learning_video_listing" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_office_order_idx" ON "_articles_v_blocks_office" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_office_parent_id_idx" ON "_articles_v_blocks_office" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_office_path_idx" ON "_articles_v_blocks_office" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_office_office_idx" ON "_articles_v_blocks_office" USING btree ("office_id");
  CREATE INDEX "_articles_v_blocks_learning_video_listing_order_idx" ON "_articles_v_blocks_learning_video_listing" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_learning_video_listing_parent_id_idx" ON "_articles_v_blocks_learning_video_listing" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_learning_video_listing_path_idx" ON "_articles_v_blocks_learning_video_listing" USING btree ("_path");
  CREATE INDEX "hubs_blocks_office_order_idx" ON "hubs_blocks_office" USING btree ("_order");
  CREATE INDEX "hubs_blocks_office_parent_id_idx" ON "hubs_blocks_office" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_office_path_idx" ON "hubs_blocks_office" USING btree ("_path");
  CREATE INDEX "hubs_blocks_office_office_idx" ON "hubs_blocks_office" USING btree ("office_id");
  CREATE INDEX "hubs_blocks_learning_video_listing_order_idx" ON "hubs_blocks_learning_video_listing" USING btree ("_order");
  CREATE INDEX "hubs_blocks_learning_video_listing_parent_id_idx" ON "hubs_blocks_learning_video_listing" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_learning_video_listing_path_idx" ON "hubs_blocks_learning_video_listing" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_office_order_idx" ON "_hubs_v_blocks_office" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_office_parent_id_idx" ON "_hubs_v_blocks_office" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_office_path_idx" ON "_hubs_v_blocks_office" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_office_office_idx" ON "_hubs_v_blocks_office" USING btree ("office_id");
  CREATE INDEX "_hubs_v_blocks_learning_video_listing_order_idx" ON "_hubs_v_blocks_learning_video_listing" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_learning_video_listing_parent_id_idx" ON "_hubs_v_blocks_learning_video_listing" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_learning_video_listing_path_idx" ON "_hubs_v_blocks_learning_video_listing" USING btree ("_path");
  CREATE INDEX "venues_blocks_office_order_idx" ON "venues_blocks_office" USING btree ("_order");
  CREATE INDEX "venues_blocks_office_parent_id_idx" ON "venues_blocks_office" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_office_path_idx" ON "venues_blocks_office" USING btree ("_path");
  CREATE INDEX "venues_blocks_office_office_idx" ON "venues_blocks_office" USING btree ("office_id");
  CREATE INDEX "venues_blocks_learning_video_listing_order_idx" ON "venues_blocks_learning_video_listing" USING btree ("_order");
  CREATE INDEX "venues_blocks_learning_video_listing_parent_id_idx" ON "venues_blocks_learning_video_listing" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_learning_video_listing_path_idx" ON "venues_blocks_learning_video_listing" USING btree ("_path");
  CREATE INDEX "venues_market_connections_order_idx" ON "venues_market_connections" USING btree ("_order");
  CREATE INDEX "venues_market_connections_parent_id_idx" ON "venues_market_connections" USING btree ("_parent_id");
  CREATE INDEX "venues_market_connections_hub_idx" ON "venues_market_connections" USING btree ("hub_id");
  CREATE INDEX "_venues_v_blocks_office_order_idx" ON "_venues_v_blocks_office" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_office_parent_id_idx" ON "_venues_v_blocks_office" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_office_path_idx" ON "_venues_v_blocks_office" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_office_office_idx" ON "_venues_v_blocks_office" USING btree ("office_id");
  CREATE INDEX "_venues_v_blocks_learning_video_listing_order_idx" ON "_venues_v_blocks_learning_video_listing" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_learning_video_listing_parent_id_idx" ON "_venues_v_blocks_learning_video_listing" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_learning_video_listing_path_idx" ON "_venues_v_blocks_learning_video_listing" USING btree ("_path");
  CREATE INDEX "_venues_v_version_market_connections_order_idx" ON "_venues_v_version_market_connections" USING btree ("_order");
  CREATE INDEX "_venues_v_version_market_connections_parent_id_idx" ON "_venues_v_version_market_connections" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_version_market_connections_hub_idx" ON "_venues_v_version_market_connections" USING btree ("hub_id");
  CREATE INDEX "learning_videos_tags_order_idx" ON "learning_videos_tags" USING btree ("_order");
  CREATE INDEX "learning_videos_tags_parent_id_idx" ON "learning_videos_tags" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_office_order_idx" ON "learning_videos_blocks_office" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_office_parent_id_idx" ON "learning_videos_blocks_office" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_office_path_idx" ON "learning_videos_blocks_office" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_office_office_idx" ON "learning_videos_blocks_office" USING btree ("office_id");
  CREATE INDEX "learning_videos_blocks_learning_video_listing_order_idx" ON "learning_videos_blocks_learning_video_listing" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_learning_video_listing_parent_id_idx" ON "learning_videos_blocks_learning_video_listing" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_learning_video_listing_path_idx" ON "learning_videos_blocks_learning_video_listing" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_version_tags_order_idx" ON "_learning_videos_v_version_tags" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_version_tags_parent_id_idx" ON "_learning_videos_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_office_order_idx" ON "_learning_videos_v_blocks_office" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_office_parent_id_idx" ON "_learning_videos_v_blocks_office" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_office_path_idx" ON "_learning_videos_v_blocks_office" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_office_office_idx" ON "_learning_videos_v_blocks_office" USING btree ("office_id");
  CREATE INDEX "_learning_videos_v_blocks_learning_video_listing_order_idx" ON "_learning_videos_v_blocks_learning_video_listing" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_learning_video_listing_parent_id_idx" ON "_learning_videos_v_blocks_learning_video_listing" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_learning_video_listing_path_idx" ON "_learning_videos_v_blocks_learning_video_listing" USING btree ("_path");
  CREATE INDEX "offices_title_idx" ON "offices" USING btree ("title");
  CREATE INDEX "offices_display_order_idx" ON "offices" USING btree ("display_order");
  CREATE UNIQUE INDEX "offices_legacy_source_legacy_source_key_idx" ON "offices" USING btree ("legacy_source_key");
  CREATE INDEX "offices_legacy_source_legacy_source_source_idx" ON "offices" USING btree ("legacy_source_source");
  CREATE INDEX "offices_legacy_source_legacy_source_legacy_id_idx" ON "offices" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "offices_legacy_source_legacy_source_content_hash_idx" ON "offices" USING btree ("legacy_source_content_hash");
  CREATE INDEX "offices_updated_at_idx" ON "offices" USING btree ("updated_at");
  CREATE INDEX "offices_created_at_idx" ON "offices" USING btree ("created_at");
  CREATE INDEX "offices__status_idx" ON "offices" USING btree ("_status");
  CREATE INDEX "_offices_v_parent_idx" ON "_offices_v" USING btree ("parent_id");
  CREATE INDEX "_offices_v_version_version_title_idx" ON "_offices_v" USING btree ("version_title");
  CREATE INDEX "_offices_v_version_version_display_order_idx" ON "_offices_v" USING btree ("version_display_order");
  CREATE INDEX "_offices_v_version_legacy_source_version_legacy_source_k_idx" ON "_offices_v" USING btree ("version_legacy_source_key");
  CREATE INDEX "_offices_v_version_legacy_source_version_legacy_source_s_idx" ON "_offices_v" USING btree ("version_legacy_source_source");
  CREATE INDEX "_offices_v_version_legacy_source_version_legacy_source_l_idx" ON "_offices_v" USING btree ("version_legacy_source_legacy_id");
  CREATE INDEX "_offices_v_version_legacy_source_version_legacy_source_c_idx" ON "_offices_v" USING btree ("version_legacy_source_content_hash");
  CREATE INDEX "_offices_v_version_version_updated_at_idx" ON "_offices_v" USING btree ("version_updated_at");
  CREATE INDEX "_offices_v_version_version_created_at_idx" ON "_offices_v" USING btree ("version_created_at");
  CREATE INDEX "_offices_v_version_version__status_idx" ON "_offices_v" USING btree ("version__status");
  CREATE INDEX "_offices_v_created_at_idx" ON "_offices_v" USING btree ("created_at");
  CREATE INDEX "_offices_v_updated_at_idx" ON "_offices_v" USING btree ("updated_at");
  CREATE INDEX "_offices_v_latest_idx" ON "_offices_v" USING btree ("latest");
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_faq_items" ADD CONSTRAINT "articles_blocks_faq_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_faq_items" ADD CONSTRAINT "_articles_v_blocks_faq_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_faq_items" ADD CONSTRAINT "hubs_blocks_faq_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_rels" ADD CONSTRAINT "hubs_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_rels" ADD CONSTRAINT "hubs_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_rels" ADD CONSTRAINT "hubs_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_rels" ADD CONSTRAINT "hubs_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_faq_items" ADD CONSTRAINT "_hubs_v_blocks_faq_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_rels" ADD CONSTRAINT "_hubs_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_rels" ADD CONSTRAINT "_hubs_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_rels" ADD CONSTRAINT "_hubs_v_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_rels" ADD CONSTRAINT "_hubs_v_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_faq_items" ADD CONSTRAINT "venues_blocks_faq_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_faq_items" ADD CONSTRAINT "_venues_v_blocks_faq_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_rels" ADD CONSTRAINT "_venues_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_rels" ADD CONSTRAINT "_venues_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_rels" ADD CONSTRAINT "_venues_v_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_rels" ADD CONSTRAINT "_venues_v_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_rels" ADD CONSTRAINT "_venues_v_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_faq_items" ADD CONSTRAINT "learning_videos_blocks_faq_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos" ADD CONSTRAINT "learning_videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_rels" ADD CONSTRAINT "learning_videos_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_rels" ADD CONSTRAINT "learning_videos_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_rels" ADD CONSTRAINT "learning_videos_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_rels" ADD CONSTRAINT "learning_videos_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_rels" ADD CONSTRAINT "learning_videos_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_faq_items" ADD CONSTRAINT "_learning_videos_v_blocks_faq_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v" ADD CONSTRAINT "_learning_videos_v_version_poster_id_media_id_fk" FOREIGN KEY ("version_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_rels" ADD CONSTRAINT "_learning_videos_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_rels" ADD CONSTRAINT "_learning_videos_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_rels" ADD CONSTRAINT "_learning_videos_v_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_rels" ADD CONSTRAINT "_learning_videos_v_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_rels" ADD CONSTRAINT "_learning_videos_v_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offices_fk" FOREIGN KEY ("offices_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_rels" ADD CONSTRAINT "_navigation_v_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_rels" ADD CONSTRAINT "_navigation_v_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_rels" ADD CONSTRAINT "_footer_v_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_rels" ADD CONSTRAINT "_footer_v_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_faq_items_media_idx" ON "pages_blocks_faq_items" USING btree ("media_id");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_articles_id_idx" ON "pages_rels" USING btree ("articles_id");
  CREATE INDEX "pages_rels_hubs_id_idx" ON "pages_rels" USING btree ("hubs_id");
  CREATE INDEX "pages_rels_venues_id_idx" ON "pages_rels" USING btree ("venues_id");
  CREATE INDEX "pages_rels_learning_videos_id_idx" ON "pages_rels" USING btree ("learning_videos_id");
  CREATE INDEX "_pages_v_blocks_faq_items_media_idx" ON "_pages_v_blocks_faq_items" USING btree ("media_id");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_articles_id_idx" ON "_pages_v_rels" USING btree ("articles_id");
  CREATE INDEX "_pages_v_rels_hubs_id_idx" ON "_pages_v_rels" USING btree ("hubs_id");
  CREATE INDEX "_pages_v_rels_venues_id_idx" ON "_pages_v_rels" USING btree ("venues_id");
  CREATE INDEX "_pages_v_rels_learning_videos_id_idx" ON "_pages_v_rels" USING btree ("learning_videos_id");
  CREATE INDEX "articles_blocks_faq_items_media_idx" ON "articles_blocks_faq_items" USING btree ("media_id");
  CREATE INDEX "articles_rels_pages_id_idx" ON "articles_rels" USING btree ("pages_id");
  CREATE INDEX "articles_rels_venues_id_idx" ON "articles_rels" USING btree ("venues_id");
  CREATE INDEX "articles_rels_learning_videos_id_idx" ON "articles_rels" USING btree ("learning_videos_id");
  CREATE INDEX "_articles_v_blocks_faq_items_media_idx" ON "_articles_v_blocks_faq_items" USING btree ("media_id");
  CREATE INDEX "_articles_v_rels_pages_id_idx" ON "_articles_v_rels" USING btree ("pages_id");
  CREATE INDEX "_articles_v_rels_venues_id_idx" ON "_articles_v_rels" USING btree ("venues_id");
  CREATE INDEX "_articles_v_rels_learning_videos_id_idx" ON "_articles_v_rels" USING btree ("learning_videos_id");
  CREATE INDEX "hubs_blocks_faq_items_media_idx" ON "hubs_blocks_faq_items" USING btree ("media_id");
  CREATE INDEX "hubs_rels_pages_id_idx" ON "hubs_rels" USING btree ("pages_id");
  CREATE INDEX "hubs_rels_articles_id_idx" ON "hubs_rels" USING btree ("articles_id");
  CREATE INDEX "hubs_rels_venues_id_idx" ON "hubs_rels" USING btree ("venues_id");
  CREATE INDEX "hubs_rels_learning_videos_id_idx" ON "hubs_rels" USING btree ("learning_videos_id");
  CREATE INDEX "_hubs_v_blocks_faq_items_media_idx" ON "_hubs_v_blocks_faq_items" USING btree ("media_id");
  CREATE INDEX "_hubs_v_rels_pages_id_idx" ON "_hubs_v_rels" USING btree ("pages_id");
  CREATE INDEX "_hubs_v_rels_articles_id_idx" ON "_hubs_v_rels" USING btree ("articles_id");
  CREATE INDEX "_hubs_v_rels_venues_id_idx" ON "_hubs_v_rels" USING btree ("venues_id");
  CREATE INDEX "_hubs_v_rels_learning_videos_id_idx" ON "_hubs_v_rels" USING btree ("learning_videos_id");
  CREATE INDEX "venues_blocks_faq_items_media_idx" ON "venues_blocks_faq_items" USING btree ("media_id");
  CREATE INDEX "venues_rels_pages_id_idx" ON "venues_rels" USING btree ("pages_id");
  CREATE INDEX "venues_rels_articles_id_idx" ON "venues_rels" USING btree ("articles_id");
  CREATE INDEX "venues_rels_hubs_id_idx" ON "venues_rels" USING btree ("hubs_id");
  CREATE INDEX "venues_rels_venues_id_idx" ON "venues_rels" USING btree ("venues_id");
  CREATE INDEX "venues_rels_learning_videos_id_idx" ON "venues_rels" USING btree ("learning_videos_id");
  CREATE INDEX "_venues_v_blocks_faq_items_media_idx" ON "_venues_v_blocks_faq_items" USING btree ("media_id");
  CREATE INDEX "_venues_v_rels_pages_id_idx" ON "_venues_v_rels" USING btree ("pages_id");
  CREATE INDEX "_venues_v_rels_articles_id_idx" ON "_venues_v_rels" USING btree ("articles_id");
  CREATE INDEX "_venues_v_rels_hubs_id_idx" ON "_venues_v_rels" USING btree ("hubs_id");
  CREATE INDEX "_venues_v_rels_venues_id_idx" ON "_venues_v_rels" USING btree ("venues_id");
  CREATE INDEX "_venues_v_rels_learning_videos_id_idx" ON "_venues_v_rels" USING btree ("learning_videos_id");
  CREATE INDEX "learning_videos_blocks_faq_items_media_idx" ON "learning_videos_blocks_faq_items" USING btree ("media_id");
  CREATE INDEX "learning_videos_poster_idx" ON "learning_videos" USING btree ("poster_id");
  CREATE INDEX "learning_videos_product_idx" ON "learning_videos" USING btree ("product");
  CREATE INDEX "learning_videos_display_order_idx" ON "learning_videos" USING btree ("display_order");
  CREATE INDEX "learning_videos_rels_pages_id_idx" ON "learning_videos_rels" USING btree ("pages_id");
  CREATE INDEX "learning_videos_rels_articles_id_idx" ON "learning_videos_rels" USING btree ("articles_id");
  CREATE INDEX "learning_videos_rels_hubs_id_idx" ON "learning_videos_rels" USING btree ("hubs_id");
  CREATE INDEX "learning_videos_rels_venues_id_idx" ON "learning_videos_rels" USING btree ("venues_id");
  CREATE INDEX "learning_videos_rels_learning_videos_id_idx" ON "learning_videos_rels" USING btree ("learning_videos_id");
  CREATE INDEX "_learning_videos_v_blocks_faq_items_media_idx" ON "_learning_videos_v_blocks_faq_items" USING btree ("media_id");
  CREATE INDEX "_learning_videos_v_version_version_poster_idx" ON "_learning_videos_v" USING btree ("version_poster_id");
  CREATE INDEX "_learning_videos_v_version_version_product_idx" ON "_learning_videos_v" USING btree ("version_product");
  CREATE INDEX "_learning_videos_v_version_version_display_order_idx" ON "_learning_videos_v" USING btree ("version_display_order");
  CREATE INDEX "_learning_videos_v_rels_pages_id_idx" ON "_learning_videos_v_rels" USING btree ("pages_id");
  CREATE INDEX "_learning_videos_v_rels_articles_id_idx" ON "_learning_videos_v_rels" USING btree ("articles_id");
  CREATE INDEX "_learning_videos_v_rels_hubs_id_idx" ON "_learning_videos_v_rels" USING btree ("hubs_id");
  CREATE INDEX "_learning_videos_v_rels_venues_id_idx" ON "_learning_videos_v_rels" USING btree ("venues_id");
  CREATE INDEX "_learning_videos_v_rels_learning_videos_id_idx" ON "_learning_videos_v_rels" USING btree ("learning_videos_id");
  CREATE INDEX "payload_locked_documents_rels_offices_id_idx" ON "payload_locked_documents_rels" USING btree ("offices_id");
  CREATE INDEX "navigation_rels_venues_id_idx" ON "navigation_rels" USING btree ("venues_id");
  CREATE INDEX "navigation_rels_learning_videos_id_idx" ON "navigation_rels" USING btree ("learning_videos_id");
  CREATE INDEX "_navigation_v_rels_venues_id_idx" ON "_navigation_v_rels" USING btree ("venues_id");
  CREATE INDEX "_navigation_v_rels_learning_videos_id_idx" ON "_navigation_v_rels" USING btree ("learning_videos_id");
  CREATE INDEX "footer_rels_venues_id_idx" ON "footer_rels" USING btree ("venues_id");
  CREATE INDEX "footer_rels_learning_videos_id_idx" ON "footer_rels" USING btree ("learning_videos_id");
  CREATE INDEX "_footer_v_rels_venues_id_idx" ON "_footer_v_rels" USING btree ("venues_id");
  CREATE INDEX "_footer_v_rels_learning_videos_id_idx" ON "_footer_v_rels" USING btree ("learning_videos_id");
  CREATE INDEX "site_settings_rels_venues_id_idx" ON "site_settings_rels" USING btree ("venues_id");
  CREATE INDEX "site_settings_rels_learning_videos_id_idx" ON "site_settings_rels" USING btree ("learning_videos_id");
  CREATE INDEX "_site_settings_v_rels_venues_id_idx" ON "_site_settings_v_rels" USING btree ("venues_id");
  CREATE INDEX "_site_settings_v_rels_learning_videos_id_idx" ON "_site_settings_v_rels" USING btree ("learning_videos_id");

  DO $migration$
  DECLARE
    table_name text;
  BEGIN
    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_trayport_hero_actions',
      'pages_blocks_actions_actions',
      'pages_blocks_market_coverage_actions',
      '_pages_v_blocks_trayport_hero_actions',
      '_pages_v_blocks_actions_actions',
      '_pages_v_blocks_market_coverage_actions',
      'articles_blocks_trayport_hero_actions',
      'articles_blocks_actions_actions',
      'articles_blocks_market_coverage_actions',
      '_articles_v_blocks_trayport_hero_actions',
      '_articles_v_blocks_actions_actions',
      '_articles_v_blocks_market_coverage_actions',
      'hubs_blocks_trayport_hero_actions',
      'hubs_blocks_actions_actions',
      'hubs_blocks_market_coverage_actions',
      '_hubs_v_blocks_trayport_hero_actions',
      '_hubs_v_blocks_actions_actions',
      '_hubs_v_blocks_market_coverage_actions',
      'venues_blocks_trayport_hero_actions',
      'venues_blocks_actions_actions',
      'venues_blocks_market_coverage_actions',
      '_venues_v_blocks_trayport_hero_actions',
      '_venues_v_blocks_actions_actions',
      '_venues_v_blocks_market_coverage_actions',
      'learning_videos_blocks_trayport_hero_actions',
      'learning_videos_blocks_actions_actions',
      'learning_videos_blocks_market_coverage_actions',
      '_learning_videos_v_blocks_trayport_hero_actions',
      '_learning_videos_v_blocks_actions_actions',
      '_learning_videos_v_blocks_market_coverage_actions'
    ]
    LOOP
      EXECUTE format(
        'UPDATE %I SET link_type = ''custom'', link_url = url, link_new_tab = COALESCE(new_tab, false) WHERE NULLIF(BTRIM(url), '''') IS NOT NULL',
        table_name
      );
    END LOOP;

    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_feature_list_items',
      'pages_blocks_entity_list_items',
      '_pages_v_blocks_feature_list_items',
      '_pages_v_blocks_entity_list_items',
      'articles_blocks_feature_list_items',
      'articles_blocks_entity_list_items',
      '_articles_v_blocks_feature_list_items',
      '_articles_v_blocks_entity_list_items',
      'hubs_blocks_feature_list_items',
      'hubs_blocks_entity_list_items',
      '_hubs_v_blocks_feature_list_items',
      '_hubs_v_blocks_entity_list_items',
      'venues_blocks_feature_list_items',
      'venues_blocks_entity_list_items',
      '_venues_v_blocks_feature_list_items',
      '_venues_v_blocks_entity_list_items',
      'learning_videos_blocks_feature_list_items',
      'learning_videos_blocks_entity_list_items',
      '_learning_videos_v_blocks_feature_list_items',
      '_learning_videos_v_blocks_entity_list_items'
    ]
    LOOP
      EXECUTE format(
        'UPDATE %I SET link_type = ''custom'', link_url = url WHERE NULLIF(BTRIM(url), '''') IS NOT NULL',
        table_name
      );
    END LOOP;
  END
  $migration$;

  ALTER TABLE "pages_blocks_trayport_hero_actions" DROP COLUMN "url";
  ALTER TABLE "pages_blocks_trayport_hero_actions" DROP COLUMN "new_tab";
  ALTER TABLE "pages_blocks_actions_actions" DROP COLUMN "url";
  ALTER TABLE "pages_blocks_actions_actions" DROP COLUMN "new_tab";
  ALTER TABLE "pages_blocks_feature_list_items" DROP COLUMN "url";
  ALTER TABLE "pages_blocks_entity_list_items" DROP COLUMN "url";
  ALTER TABLE "pages_blocks_market_coverage_actions" DROP COLUMN "url";
  ALTER TABLE "pages_blocks_market_coverage_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" DROP COLUMN "url";
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_pages_v_blocks_actions_actions" DROP COLUMN "url";
  ALTER TABLE "_pages_v_blocks_actions_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_pages_v_blocks_feature_list_items" DROP COLUMN "url";
  ALTER TABLE "_pages_v_blocks_entity_list_items" DROP COLUMN "url";
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" DROP COLUMN "url";
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" DROP COLUMN "new_tab";
  ALTER TABLE "articles_blocks_trayport_hero_actions" DROP COLUMN "url";
  ALTER TABLE "articles_blocks_trayport_hero_actions" DROP COLUMN "new_tab";
  ALTER TABLE "articles_blocks_actions_actions" DROP COLUMN "url";
  ALTER TABLE "articles_blocks_actions_actions" DROP COLUMN "new_tab";
  ALTER TABLE "articles_blocks_feature_list_items" DROP COLUMN "url";
  ALTER TABLE "articles_blocks_entity_list_items" DROP COLUMN "url";
  ALTER TABLE "articles_blocks_market_coverage_actions" DROP COLUMN "url";
  ALTER TABLE "articles_blocks_market_coverage_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" DROP COLUMN "url";
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_articles_v_blocks_actions_actions" DROP COLUMN "url";
  ALTER TABLE "_articles_v_blocks_actions_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_articles_v_blocks_feature_list_items" DROP COLUMN "url";
  ALTER TABLE "_articles_v_blocks_entity_list_items" DROP COLUMN "url";
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" DROP COLUMN "url";
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" DROP COLUMN "new_tab";
  ALTER TABLE "hubs_blocks_trayport_hero_actions" DROP COLUMN "url";
  ALTER TABLE "hubs_blocks_trayport_hero_actions" DROP COLUMN "new_tab";
  ALTER TABLE "hubs_blocks_actions_actions" DROP COLUMN "url";
  ALTER TABLE "hubs_blocks_actions_actions" DROP COLUMN "new_tab";
  ALTER TABLE "hubs_blocks_feature_list_items" DROP COLUMN "url";
  ALTER TABLE "hubs_blocks_entity_list_items" DROP COLUMN "url";
  ALTER TABLE "hubs_blocks_market_coverage_actions" DROP COLUMN "url";
  ALTER TABLE "hubs_blocks_market_coverage_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" DROP COLUMN "url";
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_hubs_v_blocks_actions_actions" DROP COLUMN "url";
  ALTER TABLE "_hubs_v_blocks_actions_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_hubs_v_blocks_feature_list_items" DROP COLUMN "url";
  ALTER TABLE "_hubs_v_blocks_entity_list_items" DROP COLUMN "url";
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" DROP COLUMN "url";
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" DROP COLUMN "new_tab";
  ALTER TABLE "venues_blocks_trayport_hero_actions" DROP COLUMN "url";
  ALTER TABLE "venues_blocks_trayport_hero_actions" DROP COLUMN "new_tab";
  ALTER TABLE "venues_blocks_actions_actions" DROP COLUMN "url";
  ALTER TABLE "venues_blocks_actions_actions" DROP COLUMN "new_tab";
  ALTER TABLE "venues_blocks_feature_list_items" DROP COLUMN "url";
  ALTER TABLE "venues_blocks_entity_list_items" DROP COLUMN "url";
  ALTER TABLE "venues_blocks_market_coverage_actions" DROP COLUMN "url";
  ALTER TABLE "venues_blocks_market_coverage_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" DROP COLUMN "url";
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_venues_v_blocks_actions_actions" DROP COLUMN "url";
  ALTER TABLE "_venues_v_blocks_actions_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_venues_v_blocks_feature_list_items" DROP COLUMN "url";
  ALTER TABLE "_venues_v_blocks_entity_list_items" DROP COLUMN "url";
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" DROP COLUMN "url";
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" DROP COLUMN "new_tab";
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" DROP COLUMN "url";
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" DROP COLUMN "new_tab";
  ALTER TABLE "learning_videos_blocks_actions_actions" DROP COLUMN "url";
  ALTER TABLE "learning_videos_blocks_actions_actions" DROP COLUMN "new_tab";
  ALTER TABLE "learning_videos_blocks_feature_list_items" DROP COLUMN "url";
  ALTER TABLE "learning_videos_blocks_entity_list_items" DROP COLUMN "url";
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" DROP COLUMN "url";
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" DROP COLUMN "url";
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" DROP COLUMN "url";
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" DROP COLUMN "new_tab";
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" DROP COLUMN "url";
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" DROP COLUMN "url";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" DROP COLUMN "url";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" DROP COLUMN "new_tab";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  -- Match the application write direction by locking parent resources before
  -- their nested blocks and relationship rows. These locks remain held while
  -- the rollback guard and destructive DDL execute in this migration query.
  LOCK TABLE
    "pages",
    "_pages_v",
    "articles",
    "_articles_v",
    "hubs",
    "_hubs_v",
    "venues",
    "_venues_v",
    "learning_videos",
    "_learning_videos_v",
    "offices",
    "_offices_v",
    "navigation",
    "_navigation_v",
    "footer",
    "_footer_v",
    "site_settings",
    "_site_settings_v",
    "payload_locked_documents"
  IN SHARE ROW EXCLUSIVE MODE;

  DO $locks$
  DECLARE
    lock_targets text;
  BEGIN
    SELECT string_agg(
      format('%I.%I', "schemaname", "tablename"),
      ', ' ORDER BY "schemaname", "tablename"
    )
    INTO lock_targets
    FROM "pg_catalog"."pg_tables"
    WHERE
      "schemaname" = current_schema()
      AND (
        "tablename" ~ '^(pages|articles|hubs|venues|learning_videos)_blocks_'
        OR "tablename" ~ '^_(pages|articles|hubs|venues|learning_videos)_v_blocks_'
        OR "tablename" IN (
          'pages_rels',
          '_pages_v_rels',
          'articles_rels',
          '_articles_v_rels',
          'hubs_rels',
          '_hubs_v_rels',
          'venues_rels',
          '_venues_v_rels',
          'learning_videos_rels',
          '_learning_videos_v_rels',
          'navigation_rels',
          '_navigation_v_rels',
          'footer_rels',
          '_footer_v_rels',
          'site_settings_rels',
          '_site_settings_v_rels',
          'payload_locked_documents_rels',
          'venues_market_connections',
          '_venues_v_version_market_connections',
          'learning_videos_tags',
          '_learning_videos_v_version_tags'
        )
      );

    IF lock_targets IS NULL THEN
      RAISE EXCEPTION 'Unsafe rollback: no production-pilot child tables were found to lock.';
    END IF;

    EXECUTE 'LOCK TABLE ' || lock_targets || ' IN SHARE ROW EXCLUSIVE MODE';
  END
  $locks$;

  -- Route synchronization writes its owner first and registry claim last.
  LOCK TABLE "route_registry" IN SHARE ROW EXCLUSIVE MODE;

  -- The former schema can represent custom URLs, but none of the new records,
  -- blocks, structured fields, or relationship-backed destinations below.
  DO $rollback$
  DECLARE
    table_has_data boolean;
    table_name text;
    rollback_hint constant text :=
      'Restore the verified pre-pilot database backup with the prior application release. Do not force this migration down.';
  BEGIN
    IF EXISTS (
      SELECT 1 FROM "offices"
      UNION ALL
      SELECT 1 FROM "_offices_v"
    ) THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe rollback: office content or versions would be deleted.',
        HINT = rollback_hint;
    END IF;

    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_office',
      'pages_blocks_learning_video_listing',
      '_pages_v_blocks_office',
      '_pages_v_blocks_learning_video_listing',
      'articles_blocks_office',
      'articles_blocks_learning_video_listing',
      '_articles_v_blocks_office',
      '_articles_v_blocks_learning_video_listing',
      'hubs_blocks_office',
      'hubs_blocks_learning_video_listing',
      '_hubs_v_blocks_office',
      '_hubs_v_blocks_learning_video_listing',
      'venues_blocks_office',
      'venues_blocks_learning_video_listing',
      '_venues_v_blocks_office',
      '_venues_v_blocks_learning_video_listing',
      'learning_videos_blocks_office',
      'learning_videos_blocks_learning_video_listing',
      '_learning_videos_v_blocks_office',
      '_learning_videos_v_blocks_learning_video_listing'
    ]
    LOOP
      EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I)', table_name) INTO table_has_data;
      IF table_has_data THEN
        RAISE EXCEPTION USING
          MESSAGE = format('Unsafe rollback: pilot-only block content in %I would be deleted.', table_name),
          HINT = rollback_hint;
      END IF;
    END LOOP;

    IF EXISTS (
      SELECT 1 FROM "venues_market_connections"
      UNION ALL
      SELECT 1 FROM "_venues_v_version_market_connections"
    ) THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe rollback: venue market connections would be deleted.',
        HINT = rollback_hint;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM "learning_videos"
      WHERE
        "description" IS NOT NULL
        OR "content_mode"::text IS DISTINCT FROM 'listing'
        OR "external_destination" IS NOT NULL
        OR "poster_id" IS NOT NULL
        OR "product" IS NOT NULL
        OR "display_order" IS DISTINCT FROM 0
      UNION ALL
      SELECT 1
      FROM "_learning_videos_v"
      WHERE
        "version_description" IS NOT NULL
        OR "version_content_mode"::text IS DISTINCT FROM 'listing'
        OR "version_external_destination" IS NOT NULL
        OR "version_poster_id" IS NOT NULL
        OR "version_product" IS NOT NULL
        OR "version_display_order" IS DISTINCT FROM 0
      UNION ALL
      SELECT 1 FROM "learning_videos_tags"
      UNION ALL
      SELECT 1 FROM "_learning_videos_v_version_tags"
    ) THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe rollback: learning-video pilot fields or tags would be deleted.',
        HINT = rollback_hint;
    END IF;

    IF EXISTS (
      SELECT 1 FROM "articles" WHERE "article_type"::text = 'event'
      UNION ALL
      SELECT 1 FROM "_articles_v" WHERE "version_article_type"::text = 'event'
      UNION ALL
      SELECT 1 FROM "hubs" WHERE "external_destination" IS NOT NULL
      UNION ALL
      SELECT 1 FROM "_hubs_v" WHERE "version_external_destination" IS NOT NULL
      UNION ALL
      SELECT 1 FROM "route_registry" WHERE "archetype"::text = 'learning-video.listing-metadata'
    ) THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe rollback: pilot article, hub, or route metadata would be deleted.',
        HINT = rollback_hint;
    END IF;

    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_faq_items',
      '_pages_v_blocks_faq_items',
      'articles_blocks_faq_items',
      '_articles_v_blocks_faq_items',
      'hubs_blocks_faq_items',
      '_hubs_v_blocks_faq_items',
      'venues_blocks_faq_items',
      '_venues_v_blocks_faq_items',
      'learning_videos_blocks_faq_items',
      '_learning_videos_v_blocks_faq_items'
    ]
    LOOP
      EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I WHERE media_id IS NOT NULL)', table_name)
        INTO table_has_data;
      IF table_has_data THEN
        RAISE EXCEPTION USING
          MESSAGE = format('Unsafe rollback: pilot FAQ media in %I would be deleted.', table_name),
          HINT = rollback_hint;
      END IF;
    END LOOP;

    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_article_listing',
      '_pages_v_blocks_article_listing',
      'articles_blocks_article_listing',
      '_articles_v_blocks_article_listing',
      'hubs_blocks_article_listing',
      '_hubs_v_blocks_article_listing',
      'venues_blocks_article_listing',
      '_venues_v_blocks_article_listing',
      'learning_videos_blocks_article_listing',
      '_learning_videos_v_blocks_article_listing'
    ]
    LOOP
      EXECUTE format(
        'SELECT EXISTS (SELECT 1 FROM %I WHERE family::text IS DISTINCT FROM ''insights'')',
        table_name
      ) INTO table_has_data;
      IF table_has_data THEN
        RAISE EXCEPTION USING
          MESSAGE = format('Unsafe rollback: pilot article-listing filters in %I would be deleted.', table_name),
          HINT = rollback_hint;
      END IF;
    END LOOP;

    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_feature_list_items',
      'pages_blocks_entity_list_items',
      '_pages_v_blocks_feature_list_items',
      '_pages_v_blocks_entity_list_items',
      'articles_blocks_feature_list_items',
      'articles_blocks_entity_list_items',
      '_articles_v_blocks_feature_list_items',
      '_articles_v_blocks_entity_list_items',
      'hubs_blocks_feature_list_items',
      'hubs_blocks_entity_list_items',
      '_hubs_v_blocks_feature_list_items',
      '_hubs_v_blocks_entity_list_items',
      'venues_blocks_feature_list_items',
      'venues_blocks_entity_list_items',
      '_venues_v_blocks_feature_list_items',
      '_venues_v_blocks_entity_list_items',
      'learning_videos_blocks_feature_list_items',
      'learning_videos_blocks_entity_list_items',
      '_learning_videos_v_blocks_feature_list_items',
      '_learning_videos_v_blocks_entity_list_items'
    ]
    LOOP
      EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I WHERE link_new_tab IS TRUE)', table_name)
        INTO table_has_data;
      IF table_has_data THEN
        RAISE EXCEPTION USING
          MESSAGE = format('Unsafe rollback: pilot-only link options in %I would be deleted.', table_name),
          HINT = rollback_hint;
      END IF;
    END LOOP;

    IF EXISTS (
      SELECT 1
      FROM "pages_rels"
      WHERE
        "path" LIKE '%link.reference%'
        OR "pages_id" IS NOT NULL
        OR "articles_id" IS NOT NULL
        OR "hubs_id" IS NOT NULL
        OR "venues_id" IS NOT NULL
        OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1
      FROM "_pages_v_rels"
      WHERE
        "path" LIKE '%link.reference%'
        OR "pages_id" IS NOT NULL
        OR "articles_id" IS NOT NULL
        OR "hubs_id" IS NOT NULL
        OR "venues_id" IS NOT NULL
        OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1
      FROM "articles_rels"
      WHERE
        "path" LIKE '%link.reference%'
        OR "pages_id" IS NOT NULL
        OR "venues_id" IS NOT NULL
        OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1
      FROM "_articles_v_rels"
      WHERE
        "path" LIKE '%link.reference%'
        OR "pages_id" IS NOT NULL
        OR "venues_id" IS NOT NULL
        OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1
      FROM "hubs_rels"
      WHERE
        "path" LIKE '%link.reference%'
        OR "pages_id" IS NOT NULL
        OR "articles_id" IS NOT NULL
        OR "venues_id" IS NOT NULL
        OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1
      FROM "_hubs_v_rels"
      WHERE
        "path" LIKE '%link.reference%'
        OR "pages_id" IS NOT NULL
        OR "articles_id" IS NOT NULL
        OR "venues_id" IS NOT NULL
        OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1
      FROM "venues_rels"
      WHERE
        "path" LIKE '%link.reference%'
        OR "pages_id" IS NOT NULL
        OR "articles_id" IS NOT NULL
        OR "hubs_id" IS NOT NULL
        OR "venues_id" IS NOT NULL
        OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1
      FROM "_venues_v_rels"
      WHERE
        "path" LIKE '%link.reference%'
        OR "pages_id" IS NOT NULL
        OR "articles_id" IS NOT NULL
        OR "hubs_id" IS NOT NULL
        OR "venues_id" IS NOT NULL
        OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1
      FROM "learning_videos_rels"
      WHERE
        "path" LIKE '%link.reference%'
        OR "pages_id" IS NOT NULL
        OR "articles_id" IS NOT NULL
        OR "hubs_id" IS NOT NULL
        OR "venues_id" IS NOT NULL
        OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1
      FROM "_learning_videos_v_rels"
      WHERE
        "path" LIKE '%link.reference%'
        OR "pages_id" IS NOT NULL
        OR "articles_id" IS NOT NULL
        OR "hubs_id" IS NOT NULL
        OR "venues_id" IS NOT NULL
        OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1 FROM "navigation_rels" WHERE "venues_id" IS NOT NULL OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1 FROM "_navigation_v_rels" WHERE "venues_id" IS NOT NULL OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1 FROM "footer_rels" WHERE "venues_id" IS NOT NULL OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1 FROM "_footer_v_rels" WHERE "venues_id" IS NOT NULL OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1 FROM "site_settings_rels" WHERE "venues_id" IS NOT NULL OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1 FROM "_site_settings_v_rels" WHERE "venues_id" IS NOT NULL OR "learning_videos_id" IS NOT NULL
      UNION ALL
      SELECT 1 FROM "payload_locked_documents_rels" WHERE "offices_id" IS NOT NULL
    ) THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe rollback: managed reference links would lose their destinations.',
        HINT = rollback_hint;
    END IF;
  END
  $rollback$;

   ALTER TABLE "pages_blocks_office" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_learning_video_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_office" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_learning_video_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_office" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_learning_video_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_office" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_learning_video_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hubs_blocks_office" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hubs_blocks_learning_video_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hubs_v_blocks_office" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hubs_v_blocks_learning_video_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_office" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_learning_video_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_market_connections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_office" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_learning_video_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_version_market_connections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_office" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_learning_video_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_version_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_office" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_learning_video_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "offices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_offices_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_office" CASCADE;
  DROP TABLE "pages_blocks_learning_video_listing" CASCADE;
  DROP TABLE "_pages_v_blocks_office" CASCADE;
  DROP TABLE "_pages_v_blocks_learning_video_listing" CASCADE;
  DROP TABLE "articles_blocks_office" CASCADE;
  DROP TABLE "articles_blocks_learning_video_listing" CASCADE;
  DROP TABLE "_articles_v_blocks_office" CASCADE;
  DROP TABLE "_articles_v_blocks_learning_video_listing" CASCADE;
  DROP TABLE "hubs_blocks_office" CASCADE;
  DROP TABLE "hubs_blocks_learning_video_listing" CASCADE;
  DROP TABLE "_hubs_v_blocks_office" CASCADE;
  DROP TABLE "_hubs_v_blocks_learning_video_listing" CASCADE;
  DROP TABLE "venues_blocks_office" CASCADE;
  DROP TABLE "venues_blocks_learning_video_listing" CASCADE;
  DROP TABLE "venues_market_connections" CASCADE;
  DROP TABLE "_venues_v_blocks_office" CASCADE;
  DROP TABLE "_venues_v_blocks_learning_video_listing" CASCADE;
  DROP TABLE "_venues_v_version_market_connections" CASCADE;
  DROP TABLE "learning_videos_tags" CASCADE;
  DROP TABLE "learning_videos_blocks_office" CASCADE;
  DROP TABLE "learning_videos_blocks_learning_video_listing" CASCADE;
  DROP TABLE "_learning_videos_v_version_tags" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_office" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_learning_video_listing" CASCADE;
  DROP TABLE "offices" CASCADE;
  DROP TABLE "_offices_v" CASCADE;
  ALTER TABLE "pages_blocks_faq_items" DROP CONSTRAINT "pages_blocks_faq_items_media_id_media_id_fk";

  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_pages_fk";

  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_articles_fk";

  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_hubs_fk";

  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_venues_fk";

  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_learning_videos_fk";

  ALTER TABLE "_pages_v_blocks_faq_items" DROP CONSTRAINT "_pages_v_blocks_faq_items_media_id_media_id_fk";

  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_pages_fk";

  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_articles_fk";

  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_hubs_fk";

  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_venues_fk";

  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_learning_videos_fk";

  ALTER TABLE "articles_blocks_faq_items" DROP CONSTRAINT "articles_blocks_faq_items_media_id_media_id_fk";

  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_pages_fk";

  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_venues_fk";

  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_learning_videos_fk";

  ALTER TABLE "_articles_v_blocks_faq_items" DROP CONSTRAINT "_articles_v_blocks_faq_items_media_id_media_id_fk";

  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_pages_fk";

  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_venues_fk";

  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_learning_videos_fk";

  ALTER TABLE "hubs_blocks_faq_items" DROP CONSTRAINT "hubs_blocks_faq_items_media_id_media_id_fk";

  ALTER TABLE "hubs_rels" DROP CONSTRAINT "hubs_rels_pages_fk";

  ALTER TABLE "hubs_rels" DROP CONSTRAINT "hubs_rels_articles_fk";

  ALTER TABLE "hubs_rels" DROP CONSTRAINT "hubs_rels_venues_fk";

  ALTER TABLE "hubs_rels" DROP CONSTRAINT "hubs_rels_learning_videos_fk";

  ALTER TABLE "_hubs_v_blocks_faq_items" DROP CONSTRAINT "_hubs_v_blocks_faq_items_media_id_media_id_fk";

  ALTER TABLE "_hubs_v_rels" DROP CONSTRAINT "_hubs_v_rels_pages_fk";

  ALTER TABLE "_hubs_v_rels" DROP CONSTRAINT "_hubs_v_rels_articles_fk";

  ALTER TABLE "_hubs_v_rels" DROP CONSTRAINT "_hubs_v_rels_venues_fk";

  ALTER TABLE "_hubs_v_rels" DROP CONSTRAINT "_hubs_v_rels_learning_videos_fk";

  ALTER TABLE "venues_blocks_faq_items" DROP CONSTRAINT "venues_blocks_faq_items_media_id_media_id_fk";

  ALTER TABLE "venues_rels" DROP CONSTRAINT "venues_rels_pages_fk";

  ALTER TABLE "venues_rels" DROP CONSTRAINT "venues_rels_articles_fk";

  ALTER TABLE "venues_rels" DROP CONSTRAINT "venues_rels_hubs_fk";

  ALTER TABLE "venues_rels" DROP CONSTRAINT "venues_rels_venues_fk";

  ALTER TABLE "venues_rels" DROP CONSTRAINT "venues_rels_learning_videos_fk";

  ALTER TABLE "_venues_v_blocks_faq_items" DROP CONSTRAINT "_venues_v_blocks_faq_items_media_id_media_id_fk";

  ALTER TABLE "_venues_v_rels" DROP CONSTRAINT "_venues_v_rels_pages_fk";

  ALTER TABLE "_venues_v_rels" DROP CONSTRAINT "_venues_v_rels_articles_fk";

  ALTER TABLE "_venues_v_rels" DROP CONSTRAINT "_venues_v_rels_hubs_fk";

  ALTER TABLE "_venues_v_rels" DROP CONSTRAINT "_venues_v_rels_venues_fk";

  ALTER TABLE "_venues_v_rels" DROP CONSTRAINT "_venues_v_rels_learning_videos_fk";

  ALTER TABLE "learning_videos_blocks_faq_items" DROP CONSTRAINT "learning_videos_blocks_faq_items_media_id_media_id_fk";

  ALTER TABLE "learning_videos" DROP CONSTRAINT "learning_videos_poster_id_media_id_fk";

  ALTER TABLE "learning_videos_rels" DROP CONSTRAINT "learning_videos_rels_pages_fk";

  ALTER TABLE "learning_videos_rels" DROP CONSTRAINT "learning_videos_rels_articles_fk";

  ALTER TABLE "learning_videos_rels" DROP CONSTRAINT "learning_videos_rels_hubs_fk";

  ALTER TABLE "learning_videos_rels" DROP CONSTRAINT "learning_videos_rels_venues_fk";

  ALTER TABLE "learning_videos_rels" DROP CONSTRAINT "learning_videos_rels_learning_videos_fk";

  ALTER TABLE "_learning_videos_v_blocks_faq_items" DROP CONSTRAINT "_learning_videos_v_blocks_faq_items_media_id_media_id_fk";

  ALTER TABLE "_learning_videos_v" DROP CONSTRAINT "_learning_videos_v_version_poster_id_media_id_fk";

  ALTER TABLE "_learning_videos_v_rels" DROP CONSTRAINT "_learning_videos_v_rels_pages_fk";

  ALTER TABLE "_learning_videos_v_rels" DROP CONSTRAINT "_learning_videos_v_rels_articles_fk";

  ALTER TABLE "_learning_videos_v_rels" DROP CONSTRAINT "_learning_videos_v_rels_hubs_fk";

  ALTER TABLE "_learning_videos_v_rels" DROP CONSTRAINT "_learning_videos_v_rels_venues_fk";

  ALTER TABLE "_learning_videos_v_rels" DROP CONSTRAINT "_learning_videos_v_rels_learning_videos_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_offices_fk";

  ALTER TABLE "navigation_rels" DROP CONSTRAINT "navigation_rels_venues_fk";

  ALTER TABLE "navigation_rels" DROP CONSTRAINT "navigation_rels_learning_videos_fk";

  ALTER TABLE "_navigation_v_rels" DROP CONSTRAINT "_navigation_v_rels_venues_fk";

  ALTER TABLE "_navigation_v_rels" DROP CONSTRAINT "_navigation_v_rels_learning_videos_fk";

  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_venues_fk";

  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_learning_videos_fk";

  ALTER TABLE "_footer_v_rels" DROP CONSTRAINT "_footer_v_rels_venues_fk";

  ALTER TABLE "_footer_v_rels" DROP CONSTRAINT "_footer_v_rels_learning_videos_fk";

  ALTER TABLE "site_settings_rels" DROP CONSTRAINT "site_settings_rels_venues_fk";

  ALTER TABLE "site_settings_rels" DROP CONSTRAINT "site_settings_rels_learning_videos_fk";

  ALTER TABLE "_site_settings_v_rels" DROP CONSTRAINT "_site_settings_v_rels_venues_fk";

  ALTER TABLE "_site_settings_v_rels" DROP CONSTRAINT "_site_settings_v_rels_learning_videos_fk";

  ALTER TABLE "articles" ALTER COLUMN "article_type" SET DATA TYPE text;
  ALTER TABLE "articles" ALTER COLUMN "article_type" SET DEFAULT 'insight'::text;
  DROP TYPE "public"."enum_articles_article_type";
  CREATE TYPE "public"."enum_articles_article_type" AS ENUM('insight', 'webinar', 'video', 'case-study', 'news');
  ALTER TABLE "articles" ALTER COLUMN "article_type" SET DEFAULT 'insight'::"public"."enum_articles_article_type";
  ALTER TABLE "articles" ALTER COLUMN "article_type" SET DATA TYPE "public"."enum_articles_article_type" USING "article_type"::"public"."enum_articles_article_type";
  ALTER TABLE "_articles_v" ALTER COLUMN "version_article_type" SET DATA TYPE text;
  ALTER TABLE "_articles_v" ALTER COLUMN "version_article_type" SET DEFAULT 'insight'::text;
  DROP TYPE "public"."enum__articles_v_version_article_type";
  CREATE TYPE "public"."enum__articles_v_version_article_type" AS ENUM('insight', 'webinar', 'video', 'case-study', 'news');
  ALTER TABLE "_articles_v" ALTER COLUMN "version_article_type" SET DEFAULT 'insight'::"public"."enum__articles_v_version_article_type";
  ALTER TABLE "_articles_v" ALTER COLUMN "version_article_type" SET DATA TYPE "public"."enum__articles_v_version_article_type" USING "version_article_type"::"public"."enum__articles_v_version_article_type";
  ALTER TABLE "route_registry" ALTER COLUMN "archetype" SET DATA TYPE text;
  DROP TYPE "public"."enum_route_registry_archetype";
  CREATE TYPE "public"."enum_route_registry_archetype" AS ENUM('page.homepage', 'page.standard', 'page.product', 'page.landing', 'page.legal', 'page.conversion', 'page.interactive-market-matrix', 'page.content-index', 'article.full', 'article.listing-metadata', 'learning-video.public-detail', 'hub.public-page', 'hub.map-only', 'venue.structured-record', 'venue.public-detail', 'index.venue', 'index.market-coverage', 'redirect');
  ALTER TABLE "route_registry" ALTER COLUMN "archetype" SET DATA TYPE "public"."enum_route_registry_archetype" USING "archetype"::"public"."enum_route_registry_archetype";
  DROP INDEX "pages_blocks_faq_items_media_idx";
  DROP INDEX "pages_rels_pages_id_idx";
  DROP INDEX "pages_rels_articles_id_idx";
  DROP INDEX "pages_rels_hubs_id_idx";
  DROP INDEX "pages_rels_venues_id_idx";
  DROP INDEX "pages_rels_learning_videos_id_idx";
  DROP INDEX "_pages_v_blocks_faq_items_media_idx";
  DROP INDEX "_pages_v_rels_pages_id_idx";
  DROP INDEX "_pages_v_rels_articles_id_idx";
  DROP INDEX "_pages_v_rels_hubs_id_idx";
  DROP INDEX "_pages_v_rels_venues_id_idx";
  DROP INDEX "_pages_v_rels_learning_videos_id_idx";
  DROP INDEX "articles_blocks_faq_items_media_idx";
  DROP INDEX "articles_rels_pages_id_idx";
  DROP INDEX "articles_rels_venues_id_idx";
  DROP INDEX "articles_rels_learning_videos_id_idx";
  DROP INDEX "_articles_v_blocks_faq_items_media_idx";
  DROP INDEX "_articles_v_rels_pages_id_idx";
  DROP INDEX "_articles_v_rels_venues_id_idx";
  DROP INDEX "_articles_v_rels_learning_videos_id_idx";
  DROP INDEX "hubs_blocks_faq_items_media_idx";
  DROP INDEX "hubs_rels_pages_id_idx";
  DROP INDEX "hubs_rels_articles_id_idx";
  DROP INDEX "hubs_rels_venues_id_idx";
  DROP INDEX "hubs_rels_learning_videos_id_idx";
  DROP INDEX "_hubs_v_blocks_faq_items_media_idx";
  DROP INDEX "_hubs_v_rels_pages_id_idx";
  DROP INDEX "_hubs_v_rels_articles_id_idx";
  DROP INDEX "_hubs_v_rels_venues_id_idx";
  DROP INDEX "_hubs_v_rels_learning_videos_id_idx";
  DROP INDEX "venues_blocks_faq_items_media_idx";
  DROP INDEX "venues_rels_pages_id_idx";
  DROP INDEX "venues_rels_articles_id_idx";
  DROP INDEX "venues_rels_hubs_id_idx";
  DROP INDEX "venues_rels_venues_id_idx";
  DROP INDEX "venues_rels_learning_videos_id_idx";
  DROP INDEX "_venues_v_blocks_faq_items_media_idx";
  DROP INDEX "_venues_v_rels_pages_id_idx";
  DROP INDEX "_venues_v_rels_articles_id_idx";
  DROP INDEX "_venues_v_rels_hubs_id_idx";
  DROP INDEX "_venues_v_rels_venues_id_idx";
  DROP INDEX "_venues_v_rels_learning_videos_id_idx";
  DROP INDEX "learning_videos_blocks_faq_items_media_idx";
  DROP INDEX "learning_videos_poster_idx";
  DROP INDEX "learning_videos_product_idx";
  DROP INDEX "learning_videos_display_order_idx";
  DROP INDEX "learning_videos_rels_pages_id_idx";
  DROP INDEX "learning_videos_rels_articles_id_idx";
  DROP INDEX "learning_videos_rels_hubs_id_idx";
  DROP INDEX "learning_videos_rels_venues_id_idx";
  DROP INDEX "learning_videos_rels_learning_videos_id_idx";
  DROP INDEX "_learning_videos_v_blocks_faq_items_media_idx";
  DROP INDEX "_learning_videos_v_version_version_poster_idx";
  DROP INDEX "_learning_videos_v_version_version_product_idx";
  DROP INDEX "_learning_videos_v_version_version_display_order_idx";
  DROP INDEX "_learning_videos_v_rels_pages_id_idx";
  DROP INDEX "_learning_videos_v_rels_articles_id_idx";
  DROP INDEX "_learning_videos_v_rels_hubs_id_idx";
  DROP INDEX "_learning_videos_v_rels_venues_id_idx";
  DROP INDEX "_learning_videos_v_rels_learning_videos_id_idx";
  DROP INDEX "payload_locked_documents_rels_offices_id_idx";
  DROP INDEX "navigation_rels_venues_id_idx";
  DROP INDEX "navigation_rels_learning_videos_id_idx";
  DROP INDEX "_navigation_v_rels_venues_id_idx";
  DROP INDEX "_navigation_v_rels_learning_videos_id_idx";
  DROP INDEX "footer_rels_venues_id_idx";
  DROP INDEX "footer_rels_learning_videos_id_idx";
  DROP INDEX "_footer_v_rels_venues_id_idx";
  DROP INDEX "_footer_v_rels_learning_videos_id_idx";
  DROP INDEX "site_settings_rels_venues_id_idx";
  DROP INDEX "site_settings_rels_learning_videos_id_idx";
  DROP INDEX "_site_settings_v_rels_venues_id_idx";
  DROP INDEX "_site_settings_v_rels_learning_videos_id_idx";
  ALTER TABLE "pages_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "_pages_v_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "articles_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "_articles_v_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "hubs_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "venues_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "_venues_v_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "learning_videos_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "pages_blocks_trayport_hero_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "pages_blocks_trayport_hero_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_actions_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "pages_blocks_actions_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_feature_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "pages_blocks_entity_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "pages_blocks_market_coverage_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "pages_blocks_market_coverage_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_actions_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_pages_v_blocks_actions_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_feature_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "_pages_v_blocks_entity_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "articles_blocks_trayport_hero_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "articles_blocks_trayport_hero_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "articles_blocks_actions_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "articles_blocks_actions_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "articles_blocks_feature_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "articles_blocks_entity_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "articles_blocks_market_coverage_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "articles_blocks_market_coverage_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_articles_v_blocks_actions_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_articles_v_blocks_actions_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_articles_v_blocks_feature_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "_articles_v_blocks_entity_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "hubs_blocks_trayport_hero_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "hubs_blocks_trayport_hero_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "hubs_blocks_actions_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "hubs_blocks_actions_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "hubs_blocks_feature_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "hubs_blocks_entity_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "hubs_blocks_market_coverage_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "hubs_blocks_market_coverage_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_hubs_v_blocks_actions_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_hubs_v_blocks_actions_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "_hubs_v_blocks_entity_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "venues_blocks_trayport_hero_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "venues_blocks_trayport_hero_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "venues_blocks_actions_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "venues_blocks_actions_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "venues_blocks_feature_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "venues_blocks_entity_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "venues_blocks_market_coverage_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "venues_blocks_market_coverage_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_venues_v_blocks_actions_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_venues_v_blocks_actions_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_venues_v_blocks_feature_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "_venues_v_blocks_entity_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "learning_videos_blocks_actions_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "learning_videos_blocks_actions_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "learning_videos_blocks_feature_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "learning_videos_blocks_entity_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" ADD COLUMN "url" varchar;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" ADD COLUMN "url" varchar;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" ADD COLUMN "new_tab" boolean DEFAULT false;

  DO $migration$
  DECLARE
    table_name text;
  BEGIN
    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_trayport_hero_actions',
      'pages_blocks_actions_actions',
      'pages_blocks_market_coverage_actions',
      '_pages_v_blocks_trayport_hero_actions',
      '_pages_v_blocks_actions_actions',
      '_pages_v_blocks_market_coverage_actions',
      'articles_blocks_trayport_hero_actions',
      'articles_blocks_actions_actions',
      'articles_blocks_market_coverage_actions',
      '_articles_v_blocks_trayport_hero_actions',
      '_articles_v_blocks_actions_actions',
      '_articles_v_blocks_market_coverage_actions',
      'hubs_blocks_trayport_hero_actions',
      'hubs_blocks_actions_actions',
      'hubs_blocks_market_coverage_actions',
      '_hubs_v_blocks_trayport_hero_actions',
      '_hubs_v_blocks_actions_actions',
      '_hubs_v_blocks_market_coverage_actions',
      'venues_blocks_trayport_hero_actions',
      'venues_blocks_actions_actions',
      'venues_blocks_market_coverage_actions',
      '_venues_v_blocks_trayport_hero_actions',
      '_venues_v_blocks_actions_actions',
      '_venues_v_blocks_market_coverage_actions',
      'learning_videos_blocks_trayport_hero_actions',
      'learning_videos_blocks_actions_actions',
      'learning_videos_blocks_market_coverage_actions',
      '_learning_videos_v_blocks_trayport_hero_actions',
      '_learning_videos_v_blocks_actions_actions',
      '_learning_videos_v_blocks_market_coverage_actions'
    ]
    LOOP
      EXECUTE format(
        'UPDATE %I SET url = link_url, new_tab = COALESCE(link_new_tab, false) WHERE link_type = ''custom''',
        table_name
      );
    END LOOP;

    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_feature_list_items',
      'pages_blocks_entity_list_items',
      '_pages_v_blocks_feature_list_items',
      '_pages_v_blocks_entity_list_items',
      'articles_blocks_feature_list_items',
      'articles_blocks_entity_list_items',
      '_articles_v_blocks_feature_list_items',
      '_articles_v_blocks_entity_list_items',
      'hubs_blocks_feature_list_items',
      'hubs_blocks_entity_list_items',
      '_hubs_v_blocks_feature_list_items',
      '_hubs_v_blocks_entity_list_items',
      'venues_blocks_feature_list_items',
      'venues_blocks_entity_list_items',
      '_venues_v_blocks_feature_list_items',
      '_venues_v_blocks_entity_list_items',
      'learning_videos_blocks_feature_list_items',
      'learning_videos_blocks_entity_list_items',
      '_learning_videos_v_blocks_feature_list_items',
      '_learning_videos_v_blocks_entity_list_items'
    ]
    LOOP
      EXECUTE format(
        'UPDATE %I SET url = link_url WHERE link_type = ''custom''',
        table_name
      );
    END LOOP;
  END
  $migration$;

  ALTER TABLE "pages_blocks_trayport_hero_actions" DROP COLUMN "link_type";
  ALTER TABLE "pages_blocks_trayport_hero_actions" DROP COLUMN "link_url";
  ALTER TABLE "pages_blocks_trayport_hero_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "pages_blocks_actions_actions" DROP COLUMN "link_type";
  ALTER TABLE "pages_blocks_actions_actions" DROP COLUMN "link_url";
  ALTER TABLE "pages_blocks_actions_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "pages_blocks_feature_list_items" DROP COLUMN "link_type";
  ALTER TABLE "pages_blocks_feature_list_items" DROP COLUMN "link_url";
  ALTER TABLE "pages_blocks_feature_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "pages_blocks_faq_items" DROP COLUMN "media_id";
  ALTER TABLE "pages_blocks_entity_list_items" DROP COLUMN "link_type";
  ALTER TABLE "pages_blocks_entity_list_items" DROP COLUMN "link_url";
  ALTER TABLE "pages_blocks_entity_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "pages_blocks_market_coverage_actions" DROP COLUMN "link_type";
  ALTER TABLE "pages_blocks_market_coverage_actions" DROP COLUMN "link_url";
  ALTER TABLE "pages_blocks_market_coverage_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "pages_blocks_article_listing" DROP COLUMN "family";
  ALTER TABLE "pages_rels" DROP COLUMN "pages_id";
  ALTER TABLE "pages_rels" DROP COLUMN "articles_id";
  ALTER TABLE "pages_rels" DROP COLUMN "hubs_id";
  ALTER TABLE "pages_rels" DROP COLUMN "venues_id";
  ALTER TABLE "pages_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" DROP COLUMN "link_type";
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" DROP COLUMN "link_url";
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_pages_v_blocks_actions_actions" DROP COLUMN "link_type";
  ALTER TABLE "_pages_v_blocks_actions_actions" DROP COLUMN "link_url";
  ALTER TABLE "_pages_v_blocks_actions_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_pages_v_blocks_feature_list_items" DROP COLUMN "link_type";
  ALTER TABLE "_pages_v_blocks_feature_list_items" DROP COLUMN "link_url";
  ALTER TABLE "_pages_v_blocks_feature_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "_pages_v_blocks_faq_items" DROP COLUMN "media_id";
  ALTER TABLE "_pages_v_blocks_entity_list_items" DROP COLUMN "link_type";
  ALTER TABLE "_pages_v_blocks_entity_list_items" DROP COLUMN "link_url";
  ALTER TABLE "_pages_v_blocks_entity_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" DROP COLUMN "link_type";
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" DROP COLUMN "link_url";
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_pages_v_blocks_article_listing" DROP COLUMN "family";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "articles_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "hubs_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "venues_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "articles_blocks_trayport_hero_actions" DROP COLUMN "link_type";
  ALTER TABLE "articles_blocks_trayport_hero_actions" DROP COLUMN "link_url";
  ALTER TABLE "articles_blocks_trayport_hero_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "articles_blocks_actions_actions" DROP COLUMN "link_type";
  ALTER TABLE "articles_blocks_actions_actions" DROP COLUMN "link_url";
  ALTER TABLE "articles_blocks_actions_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "articles_blocks_feature_list_items" DROP COLUMN "link_type";
  ALTER TABLE "articles_blocks_feature_list_items" DROP COLUMN "link_url";
  ALTER TABLE "articles_blocks_feature_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "articles_blocks_faq_items" DROP COLUMN "media_id";
  ALTER TABLE "articles_blocks_entity_list_items" DROP COLUMN "link_type";
  ALTER TABLE "articles_blocks_entity_list_items" DROP COLUMN "link_url";
  ALTER TABLE "articles_blocks_entity_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "articles_blocks_market_coverage_actions" DROP COLUMN "link_type";
  ALTER TABLE "articles_blocks_market_coverage_actions" DROP COLUMN "link_url";
  ALTER TABLE "articles_blocks_market_coverage_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "articles_blocks_article_listing" DROP COLUMN "family";
  ALTER TABLE "articles_rels" DROP COLUMN "pages_id";
  ALTER TABLE "articles_rels" DROP COLUMN "venues_id";
  ALTER TABLE "articles_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" DROP COLUMN "link_type";
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" DROP COLUMN "link_url";
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_articles_v_blocks_actions_actions" DROP COLUMN "link_type";
  ALTER TABLE "_articles_v_blocks_actions_actions" DROP COLUMN "link_url";
  ALTER TABLE "_articles_v_blocks_actions_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_articles_v_blocks_feature_list_items" DROP COLUMN "link_type";
  ALTER TABLE "_articles_v_blocks_feature_list_items" DROP COLUMN "link_url";
  ALTER TABLE "_articles_v_blocks_feature_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "_articles_v_blocks_faq_items" DROP COLUMN "media_id";
  ALTER TABLE "_articles_v_blocks_entity_list_items" DROP COLUMN "link_type";
  ALTER TABLE "_articles_v_blocks_entity_list_items" DROP COLUMN "link_url";
  ALTER TABLE "_articles_v_blocks_entity_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" DROP COLUMN "link_type";
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" DROP COLUMN "link_url";
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_articles_v_blocks_article_listing" DROP COLUMN "family";
  ALTER TABLE "_articles_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_articles_v_rels" DROP COLUMN "venues_id";
  ALTER TABLE "_articles_v_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "hubs_blocks_trayport_hero_actions" DROP COLUMN "link_type";
  ALTER TABLE "hubs_blocks_trayport_hero_actions" DROP COLUMN "link_url";
  ALTER TABLE "hubs_blocks_trayport_hero_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "hubs_blocks_actions_actions" DROP COLUMN "link_type";
  ALTER TABLE "hubs_blocks_actions_actions" DROP COLUMN "link_url";
  ALTER TABLE "hubs_blocks_actions_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "hubs_blocks_feature_list_items" DROP COLUMN "link_type";
  ALTER TABLE "hubs_blocks_feature_list_items" DROP COLUMN "link_url";
  ALTER TABLE "hubs_blocks_feature_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "hubs_blocks_faq_items" DROP COLUMN "media_id";
  ALTER TABLE "hubs_blocks_entity_list_items" DROP COLUMN "link_type";
  ALTER TABLE "hubs_blocks_entity_list_items" DROP COLUMN "link_url";
  ALTER TABLE "hubs_blocks_entity_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "hubs_blocks_market_coverage_actions" DROP COLUMN "link_type";
  ALTER TABLE "hubs_blocks_market_coverage_actions" DROP COLUMN "link_url";
  ALTER TABLE "hubs_blocks_market_coverage_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "hubs_blocks_article_listing" DROP COLUMN "family";
  ALTER TABLE "hubs" DROP COLUMN "external_destination";
  ALTER TABLE "hubs_rels" DROP COLUMN "pages_id";
  ALTER TABLE "hubs_rels" DROP COLUMN "articles_id";
  ALTER TABLE "hubs_rels" DROP COLUMN "venues_id";
  ALTER TABLE "hubs_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" DROP COLUMN "link_type";
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" DROP COLUMN "link_url";
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_hubs_v_blocks_actions_actions" DROP COLUMN "link_type";
  ALTER TABLE "_hubs_v_blocks_actions_actions" DROP COLUMN "link_url";
  ALTER TABLE "_hubs_v_blocks_actions_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_hubs_v_blocks_feature_list_items" DROP COLUMN "link_type";
  ALTER TABLE "_hubs_v_blocks_feature_list_items" DROP COLUMN "link_url";
  ALTER TABLE "_hubs_v_blocks_feature_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "_hubs_v_blocks_faq_items" DROP COLUMN "media_id";
  ALTER TABLE "_hubs_v_blocks_entity_list_items" DROP COLUMN "link_type";
  ALTER TABLE "_hubs_v_blocks_entity_list_items" DROP COLUMN "link_url";
  ALTER TABLE "_hubs_v_blocks_entity_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" DROP COLUMN "link_type";
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" DROP COLUMN "link_url";
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_hubs_v_blocks_article_listing" DROP COLUMN "family";
  ALTER TABLE "_hubs_v" DROP COLUMN "version_external_destination";
  ALTER TABLE "_hubs_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_hubs_v_rels" DROP COLUMN "articles_id";
  ALTER TABLE "_hubs_v_rels" DROP COLUMN "venues_id";
  ALTER TABLE "_hubs_v_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "venues_blocks_trayport_hero_actions" DROP COLUMN "link_type";
  ALTER TABLE "venues_blocks_trayport_hero_actions" DROP COLUMN "link_url";
  ALTER TABLE "venues_blocks_trayport_hero_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "venues_blocks_actions_actions" DROP COLUMN "link_type";
  ALTER TABLE "venues_blocks_actions_actions" DROP COLUMN "link_url";
  ALTER TABLE "venues_blocks_actions_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "venues_blocks_feature_list_items" DROP COLUMN "link_type";
  ALTER TABLE "venues_blocks_feature_list_items" DROP COLUMN "link_url";
  ALTER TABLE "venues_blocks_feature_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "venues_blocks_faq_items" DROP COLUMN "media_id";
  ALTER TABLE "venues_blocks_entity_list_items" DROP COLUMN "link_type";
  ALTER TABLE "venues_blocks_entity_list_items" DROP COLUMN "link_url";
  ALTER TABLE "venues_blocks_entity_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "venues_blocks_market_coverage_actions" DROP COLUMN "link_type";
  ALTER TABLE "venues_blocks_market_coverage_actions" DROP COLUMN "link_url";
  ALTER TABLE "venues_blocks_market_coverage_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "venues_blocks_article_listing" DROP COLUMN "family";
  ALTER TABLE "venues_rels" DROP COLUMN "pages_id";
  ALTER TABLE "venues_rels" DROP COLUMN "articles_id";
  ALTER TABLE "venues_rels" DROP COLUMN "hubs_id";
  ALTER TABLE "venues_rels" DROP COLUMN "venues_id";
  ALTER TABLE "venues_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" DROP COLUMN "link_type";
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" DROP COLUMN "link_url";
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_venues_v_blocks_actions_actions" DROP COLUMN "link_type";
  ALTER TABLE "_venues_v_blocks_actions_actions" DROP COLUMN "link_url";
  ALTER TABLE "_venues_v_blocks_actions_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_venues_v_blocks_feature_list_items" DROP COLUMN "link_type";
  ALTER TABLE "_venues_v_blocks_feature_list_items" DROP COLUMN "link_url";
  ALTER TABLE "_venues_v_blocks_feature_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "_venues_v_blocks_faq_items" DROP COLUMN "media_id";
  ALTER TABLE "_venues_v_blocks_entity_list_items" DROP COLUMN "link_type";
  ALTER TABLE "_venues_v_blocks_entity_list_items" DROP COLUMN "link_url";
  ALTER TABLE "_venues_v_blocks_entity_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" DROP COLUMN "link_type";
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" DROP COLUMN "link_url";
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_venues_v_blocks_article_listing" DROP COLUMN "family";
  ALTER TABLE "_venues_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_venues_v_rels" DROP COLUMN "articles_id";
  ALTER TABLE "_venues_v_rels" DROP COLUMN "hubs_id";
  ALTER TABLE "_venues_v_rels" DROP COLUMN "venues_id";
  ALTER TABLE "_venues_v_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" DROP COLUMN "link_type";
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" DROP COLUMN "link_url";
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "learning_videos_blocks_actions_actions" DROP COLUMN "link_type";
  ALTER TABLE "learning_videos_blocks_actions_actions" DROP COLUMN "link_url";
  ALTER TABLE "learning_videos_blocks_actions_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "learning_videos_blocks_feature_list_items" DROP COLUMN "link_type";
  ALTER TABLE "learning_videos_blocks_feature_list_items" DROP COLUMN "link_url";
  ALTER TABLE "learning_videos_blocks_feature_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "learning_videos_blocks_faq_items" DROP COLUMN "media_id";
  ALTER TABLE "learning_videos_blocks_entity_list_items" DROP COLUMN "link_type";
  ALTER TABLE "learning_videos_blocks_entity_list_items" DROP COLUMN "link_url";
  ALTER TABLE "learning_videos_blocks_entity_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" DROP COLUMN "link_type";
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" DROP COLUMN "link_url";
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "learning_videos_blocks_article_listing" DROP COLUMN "family";
  ALTER TABLE "learning_videos" DROP COLUMN "description";
  ALTER TABLE "learning_videos" DROP COLUMN "content_mode";
  ALTER TABLE "learning_videos" DROP COLUMN "external_destination";
  ALTER TABLE "learning_videos" DROP COLUMN "poster_id";
  ALTER TABLE "learning_videos" DROP COLUMN "product";
  ALTER TABLE "learning_videos" DROP COLUMN "display_order";
  ALTER TABLE "learning_videos_rels" DROP COLUMN "pages_id";
  ALTER TABLE "learning_videos_rels" DROP COLUMN "articles_id";
  ALTER TABLE "learning_videos_rels" DROP COLUMN "hubs_id";
  ALTER TABLE "learning_videos_rels" DROP COLUMN "venues_id";
  ALTER TABLE "learning_videos_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" DROP COLUMN "link_type";
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" DROP COLUMN "link_url";
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" DROP COLUMN "link_type";
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" DROP COLUMN "link_url";
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" DROP COLUMN "link_type";
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" DROP COLUMN "link_url";
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "_learning_videos_v_blocks_faq_items" DROP COLUMN "media_id";
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" DROP COLUMN "link_type";
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" DROP COLUMN "link_url";
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" DROP COLUMN "link_type";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" DROP COLUMN "link_url";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" DROP COLUMN "link_new_tab";
  ALTER TABLE "_learning_videos_v_blocks_article_listing" DROP COLUMN "family";
  ALTER TABLE "_learning_videos_v" DROP COLUMN "version_description";
  ALTER TABLE "_learning_videos_v" DROP COLUMN "version_content_mode";
  ALTER TABLE "_learning_videos_v" DROP COLUMN "version_external_destination";
  ALTER TABLE "_learning_videos_v" DROP COLUMN "version_poster_id";
  ALTER TABLE "_learning_videos_v" DROP COLUMN "version_product";
  ALTER TABLE "_learning_videos_v" DROP COLUMN "version_display_order";
  ALTER TABLE "_learning_videos_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_learning_videos_v_rels" DROP COLUMN "articles_id";
  ALTER TABLE "_learning_videos_v_rels" DROP COLUMN "hubs_id";
  ALTER TABLE "_learning_videos_v_rels" DROP COLUMN "venues_id";
  ALTER TABLE "_learning_videos_v_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "offices_id";
  ALTER TABLE "navigation_rels" DROP COLUMN "venues_id";
  ALTER TABLE "navigation_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "_navigation_v_rels" DROP COLUMN "venues_id";
  ALTER TABLE "_navigation_v_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "footer_rels" DROP COLUMN "venues_id";
  ALTER TABLE "footer_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "_footer_v_rels" DROP COLUMN "venues_id";
  ALTER TABLE "_footer_v_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "site_settings_rels" DROP COLUMN "venues_id";
  ALTER TABLE "site_settings_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "_site_settings_v_rels" DROP COLUMN "venues_id";
  ALTER TABLE "_site_settings_v_rels" DROP COLUMN "learning_videos_id";
  DROP TYPE "public"."content_link_type";
  DROP TYPE "public"."enum_pages_blocks_feature_list_items_icon";
  DROP TYPE "public"."enum_pages_blocks_office_appearance";
  DROP TYPE "public"."enum_pages_blocks_article_listing_family";
  DROP TYPE "public"."enum__pages_v_blocks_feature_list_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_office_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_article_listing_family";
  DROP TYPE "public"."enum_articles_blocks_feature_list_items_icon";
  DROP TYPE "public"."enum_articles_blocks_office_appearance";
  DROP TYPE "public"."enum_articles_blocks_article_listing_family";
  DROP TYPE "public"."enum__articles_v_blocks_feature_list_items_icon";
  DROP TYPE "public"."enum__articles_v_blocks_office_appearance";
  DROP TYPE "public"."enum__articles_v_blocks_article_listing_family";
  DROP TYPE "public"."enum_hubs_blocks_feature_list_items_icon";
  DROP TYPE "public"."enum_hubs_blocks_office_appearance";
  DROP TYPE "public"."enum_hubs_blocks_article_listing_family";
  DROP TYPE "public"."enum__hubs_v_blocks_feature_list_items_icon";
  DROP TYPE "public"."enum__hubs_v_blocks_office_appearance";
  DROP TYPE "public"."enum__hubs_v_blocks_article_listing_family";
  DROP TYPE "public"."enum_venues_blocks_feature_list_items_icon";
  DROP TYPE "public"."enum_venues_blocks_office_appearance";
  DROP TYPE "public"."enum_venues_blocks_article_listing_family";
  DROP TYPE "public"."enum_venues_market_connections_connection_type";
  DROP TYPE "public"."enum__venues_v_blocks_feature_list_items_icon";
  DROP TYPE "public"."enum__venues_v_blocks_office_appearance";
  DROP TYPE "public"."enum__venues_v_blocks_article_listing_family";
  DROP TYPE "public"."enum__venues_v_version_market_connections_connection_type";
  DROP TYPE "public"."enum_learning_videos_blocks_feature_list_items_icon";
  DROP TYPE "public"."enum_learning_videos_blocks_office_appearance";
  DROP TYPE "public"."enum_learning_videos_blocks_article_listing_family";
  DROP TYPE "public"."enum_learning_videos_content_mode";
  DROP TYPE "public"."enum__learning_videos_v_blocks_feature_list_items_icon";
  DROP TYPE "public"."enum__learning_videos_v_blocks_office_appearance";
  DROP TYPE "public"."enum__learning_videos_v_blocks_article_listing_family";
  DROP TYPE "public"."enum__learning_videos_v_version_content_mode";
  DROP TYPE "public"."enum_offices_status";
  DROP TYPE "public"."enum__offices_v_version_status";`)
}
