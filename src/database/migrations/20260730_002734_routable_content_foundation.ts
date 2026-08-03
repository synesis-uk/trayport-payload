import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  -- Freeze every legacy route owner before schema changes and registry
  -- backfill. SHARE ROW EXCLUSIVE permits reads but blocks concurrent CMS
  -- inserts/updates until this migration transaction completes.
  LOCK TABLE
    "pages",
    "_pages_v",
    "articles",
    "_articles_v",
    "hubs",
    "_hubs_v",
    "venues",
    "_venues_v",
    "redirects",
    "redirects_rels"
  IN SHARE ROW EXCLUSIVE MODE;

  CREATE TYPE "public"."enum_venues_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_venues_blocks_trayport_hero_appearance" AS ENUM('dark', 'image', 'light');
  CREATE TYPE "public"."enum_venues_blocks_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_venues_blocks_rich_text_size" AS ENUM('regular', 'large');
  CREATE TYPE "public"."enum_venues_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_venues_blocks_media_aspect" AS ENUM('landscape', 'wide', 'square', 'portrait', 'natural');
  CREATE TYPE "public"."enum_venues_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum_venues_blocks_entity_list_kind" AS ENUM('general', 'products', 'people', 'clients', 'venues');
  CREATE TYPE "public"."enum_venues_blocks_divider_style" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum_venues_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_venues_blocks_data_chart_data_type" AS ENUM('volume', 'price', 'other');
  CREATE TYPE "public"."enum_venues_blocks_content_section_columns_span" AS ENUM('4', '6', '8', '12');
  CREATE TYPE "public"."enum_venues_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum_venues_blocks_content_section_width" AS ENUM('reading', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum_venues_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum_venues_content_mode" AS ENUM('relationship-only', 'page');
  CREATE TYPE "public"."enum__venues_v_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__venues_v_blocks_trayport_hero_appearance" AS ENUM('dark', 'image', 'light');
  CREATE TYPE "public"."enum__venues_v_blocks_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__venues_v_blocks_rich_text_size" AS ENUM('regular', 'large');
  CREATE TYPE "public"."enum__venues_v_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__venues_v_blocks_media_aspect" AS ENUM('landscape', 'wide', 'square', 'portrait', 'natural');
  CREATE TYPE "public"."enum__venues_v_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum__venues_v_blocks_entity_list_kind" AS ENUM('general', 'products', 'people', 'clients', 'venues');
  CREATE TYPE "public"."enum__venues_v_blocks_divider_style" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum__venues_v_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__venues_v_blocks_data_chart_data_type" AS ENUM('volume', 'price', 'other');
  CREATE TYPE "public"."enum__venues_v_blocks_content_section_columns_span" AS ENUM('4', '6', '8', '12');
  CREATE TYPE "public"."enum__venues_v_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum__venues_v_blocks_content_section_width" AS ENUM('reading', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum__venues_v_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum__venues_v_version_content_mode" AS ENUM('relationship-only', 'page');
  CREATE TYPE "public"."enum_learning_videos_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_learning_videos_blocks_trayport_hero_appearance" AS ENUM('dark', 'image', 'light');
  CREATE TYPE "public"."enum_learning_videos_blocks_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_learning_videos_blocks_rich_text_size" AS ENUM('regular', 'large');
  CREATE TYPE "public"."enum_learning_videos_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_learning_videos_blocks_media_aspect" AS ENUM('landscape', 'wide', 'square', 'portrait', 'natural');
  CREATE TYPE "public"."enum_learning_videos_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum_learning_videos_blocks_entity_list_kind" AS ENUM('general', 'products', 'people', 'clients', 'venues');
  CREATE TYPE "public"."enum_learning_videos_blocks_divider_style" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum_learning_videos_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_learning_videos_blocks_data_chart_data_type" AS ENUM('volume', 'price', 'other');
  CREATE TYPE "public"."enum_learning_videos_blocks_content_section_columns_span" AS ENUM('4', '6', '8', '12');
  CREATE TYPE "public"."enum_learning_videos_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum_learning_videos_blocks_content_section_width" AS ENUM('reading', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum_learning_videos_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum_learning_videos_access_mode" AS ENUM('public', 'authenticated', 'subscriber');
  CREATE TYPE "public"."enum_learning_videos_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_appearance" AS ENUM('dark', 'image', 'light');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_rich_text_size" AS ENUM('regular', 'large');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_media_aspect" AS ENUM('landscape', 'wide', 'square', 'portrait', 'natural');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_entity_list_kind" AS ENUM('general', 'products', 'people', 'clients', 'venues');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_divider_style" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_data_chart_data_type" AS ENUM('volume', 'price', 'other');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_content_section_columns_span" AS ENUM('4', '6', '8', '12');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_content_section_width" AS ENUM('reading', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum__learning_videos_v_version_access_mode" AS ENUM('public', 'authenticated', 'subscriber');
  CREATE TYPE "public"."enum__learning_videos_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_route_registry_owner_kind" AS ENUM('content', 'virtual', 'redirect');
  CREATE TYPE "public"."enum_route_registry_owner_collection" AS ENUM('pages', 'articles', 'hubs', 'venues', 'learning-videos', 'redirects', 'system');
  CREATE TYPE "public"."enum_route_registry_archetype" AS ENUM('page.homepage', 'page.standard', 'page.product', 'page.landing', 'page.legal', 'page.conversion', 'page.interactive-market-matrix', 'page.content-index', 'article.full', 'article.listing-metadata', 'learning-video.public-detail', 'hub.public-page', 'hub.map-only', 'venue.structured-record', 'venue.public-detail', 'index.venue', 'index.market-coverage', 'redirect');
  CREATE TYPE "public"."enum_route_registry_state" AS ENUM('reserved', 'published');
  CREATE TYPE "public"."enum_route_registry_provenance_source" AS ENUM('native', 'wordpress', 'system', 'plugin');
  CREATE TYPE "public"."enum_route_indexes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__route_indexes_v_version_status" AS ENUM('draft', 'published');
  ALTER TABLE "pages" ALTER COLUMN "page_type" DROP DEFAULT;
  ALTER TABLE "pages" ALTER COLUMN "page_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_page_type";
  CREATE TYPE "public"."enum_pages_page_type" AS ENUM('homepage', 'standard', 'product', 'landing', 'index', 'legal', 'conversion', 'interactive');
  ALTER TABLE "pages" ALTER COLUMN "page_type" SET DATA TYPE "public"."enum_pages_page_type" USING "page_type"::"public"."enum_pages_page_type";
  ALTER TABLE "pages" ALTER COLUMN "page_type" SET DEFAULT 'standard';
  ALTER TABLE "_pages_v" ALTER COLUMN "version_page_type" DROP DEFAULT;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_page_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_version_page_type";
  CREATE TYPE "public"."enum__pages_v_version_page_type" AS ENUM('homepage', 'standard', 'product', 'landing', 'index', 'legal', 'conversion', 'interactive');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_page_type" SET DATA TYPE "public"."enum__pages_v_version_page_type" USING "version_page_type"::"public"."enum__pages_v_version_page_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_page_type" SET DEFAULT 'standard';
  CREATE TABLE "venues_blocks_trayport_hero_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_venues_blocks_trayport_hero_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "venues_blocks_trayport_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "heading" varchar,
    "body" jsonb,
    "media_id" integer,
    "external_video_u_r_l" varchar,
    "appearance" "enum_venues_blocks_trayport_hero_appearance" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_heading" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "text" varchar,
    "level" "enum_venues_blocks_heading_level" DEFAULT 'h2',
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_rich_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "body" jsonb,
    "size" "enum_venues_blocks_rich_text_size" DEFAULT 'regular',
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_actions_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_venues_blocks_actions_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "venues_blocks_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "external_u_r_l" varchar,
    "caption" varchar,
    "aspect" "enum_venues_blocks_media_aspect" DEFAULT 'landscape',
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_feature_list_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "body" jsonb,
    "icon" varchar,
    "media_id" integer,
    "url" varchar,
    "link_label" varchar
  );

  CREATE TABLE "venues_blocks_feature_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "layout" "enum_venues_blocks_feature_list_layout" DEFAULT 'grid',
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_statistics_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "description" varchar
  );

  CREATE TABLE "venues_blocks_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_faq_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" jsonb
  );

  CREATE TABLE "venues_blocks_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_entity_list_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" jsonb,
    "url" varchar,
    "media_id" integer
  );

  CREATE TABLE "venues_blocks_entity_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "kind" "enum_venues_blocks_entity_list_kind" DEFAULT 'general',
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_timeline_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "title" varchar,
    "body" jsonb
  );

  CREATE TABLE "venues_blocks_timeline" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_data_table_headers" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar
  );

  CREATE TABLE "venues_blocks_data_table_rows_cells" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar
  );

  CREATE TABLE "venues_blocks_data_table_rows" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL
  );

  CREATE TABLE "venues_blocks_data_table" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "caption" varchar,
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_gallery_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar
  );

  CREATE TABLE "venues_blocks_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_divider" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "style" "enum_venues_blocks_divider_style" DEFAULT 'line',
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_market_coverage_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_venues_blocks_market_coverage_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "venues_blocks_market_coverage" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar DEFAULT 'Explore our connectivity',
    "body" jsonb,
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_embed" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "url" varchar,
    "poster_id" integer,
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_data_chart" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "data_type" "enum_venues_blocks_data_chart_data_type" DEFAULT 'volume',
    "unit" varchar,
    "asset_class_legacy_id" numeric,
    "accessible_summary" varchar,
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_content_section_columns" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "span" "enum_venues_blocks_content_section_columns_span" DEFAULT '12'
  );

  CREATE TABLE "venues_blocks_content_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "anchor" varchar,
    "theme" "enum_venues_blocks_content_section_theme" DEFAULT 'light',
    "width" "enum_venues_blocks_content_section_width" DEFAULT 'wide',
    "spacing" "enum_venues_blocks_content_section_spacing" DEFAULT 'regular',
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_article_listing" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar DEFAULT 'Latest insights',
    "intro" jsonb,
    "page_size" numeric DEFAULT 12,
    "show_category_filter" boolean DEFAULT true,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_trayport_hero_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__venues_v_blocks_trayport_hero_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_venues_v_blocks_trayport_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "heading" varchar,
    "body" jsonb,
    "media_id" integer,
    "external_video_u_r_l" varchar,
    "appearance" "enum__venues_v_blocks_trayport_hero_appearance" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_heading" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "text" varchar,
    "level" "enum__venues_v_blocks_heading_level" DEFAULT 'h2',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_rich_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "body" jsonb,
    "size" "enum__venues_v_blocks_rich_text_size" DEFAULT 'regular',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_actions_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__venues_v_blocks_actions_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_venues_v_blocks_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "external_u_r_l" varchar,
    "caption" varchar,
    "aspect" "enum__venues_v_blocks_media_aspect" DEFAULT 'landscape',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_feature_list_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "body" jsonb,
    "icon" varchar,
    "media_id" integer,
    "url" varchar,
    "link_label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_venues_v_blocks_feature_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "layout" "enum__venues_v_blocks_feature_list_layout" DEFAULT 'grid',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_statistics_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "description" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_venues_v_blocks_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_faq_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE "_venues_v_blocks_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_entity_list_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" jsonb,
    "url" varchar,
    "media_id" integer,
    "_uuid" varchar
  );

  CREATE TABLE "_venues_v_blocks_entity_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "kind" "enum__venues_v_blocks_entity_list_kind" DEFAULT 'general',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_timeline_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "title" varchar,
    "body" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE "_venues_v_blocks_timeline" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_data_table_headers" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_venues_v_blocks_data_table_rows_cells" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_venues_v_blocks_data_table_rows" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar
  );

  CREATE TABLE "_venues_v_blocks_data_table" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "caption" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_gallery_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_venues_v_blocks_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_divider" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "style" "enum__venues_v_blocks_divider_style" DEFAULT 'line',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_market_coverage_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__venues_v_blocks_market_coverage_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_venues_v_blocks_market_coverage" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar DEFAULT 'Explore our connectivity',
    "body" jsonb,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_embed" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "url" varchar,
    "poster_id" integer,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_data_chart" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "data_type" "enum__venues_v_blocks_data_chart_data_type" DEFAULT 'volume',
    "unit" varchar,
    "asset_class_legacy_id" numeric,
    "accessible_summary" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_content_section_columns" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "span" "enum__venues_v_blocks_content_section_columns_span" DEFAULT '12',
    "_uuid" varchar
  );

  CREATE TABLE "_venues_v_blocks_content_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "anchor" varchar,
    "theme" "enum__venues_v_blocks_content_section_theme" DEFAULT 'light',
    "width" "enum__venues_v_blocks_content_section_width" DEFAULT 'wide',
    "spacing" "enum__venues_v_blocks_content_section_spacing" DEFAULT 'regular',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_article_listing" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "heading" varchar DEFAULT 'Latest insights',
    "intro" jsonb,
    "page_size" numeric DEFAULT 12,
    "show_category_filter" boolean DEFAULT true,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_trayport_hero_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_learning_videos_blocks_trayport_hero_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "learning_videos_blocks_trayport_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "heading" varchar,
    "body" jsonb,
    "media_id" integer,
    "external_video_u_r_l" varchar,
    "appearance" "enum_learning_videos_blocks_trayport_hero_appearance" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_heading" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "text" varchar,
    "level" "enum_learning_videos_blocks_heading_level" DEFAULT 'h2',
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_rich_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "body" jsonb,
    "size" "enum_learning_videos_blocks_rich_text_size" DEFAULT 'regular',
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_actions_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_learning_videos_blocks_actions_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "learning_videos_blocks_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "external_u_r_l" varchar,
    "caption" varchar,
    "aspect" "enum_learning_videos_blocks_media_aspect" DEFAULT 'landscape',
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_feature_list_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "body" jsonb,
    "icon" varchar,
    "media_id" integer,
    "url" varchar,
    "link_label" varchar
  );

  CREATE TABLE "learning_videos_blocks_feature_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "layout" "enum_learning_videos_blocks_feature_list_layout" DEFAULT 'grid',
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_statistics_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "description" varchar
  );

  CREATE TABLE "learning_videos_blocks_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_faq_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" jsonb
  );

  CREATE TABLE "learning_videos_blocks_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_entity_list_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" jsonb,
    "url" varchar,
    "media_id" integer
  );

  CREATE TABLE "learning_videos_blocks_entity_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "kind" "enum_learning_videos_blocks_entity_list_kind" DEFAULT 'general',
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_timeline_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "title" varchar,
    "body" jsonb
  );

  CREATE TABLE "learning_videos_blocks_timeline" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_data_table_headers" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar
  );

  CREATE TABLE "learning_videos_blocks_data_table_rows_cells" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar
  );

  CREATE TABLE "learning_videos_blocks_data_table_rows" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL
  );

  CREATE TABLE "learning_videos_blocks_data_table" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "caption" varchar,
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_gallery_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar
  );

  CREATE TABLE "learning_videos_blocks_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_divider" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "style" "enum_learning_videos_blocks_divider_style" DEFAULT 'line',
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_market_coverage_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_learning_videos_blocks_market_coverage_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "learning_videos_blocks_market_coverage" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar DEFAULT 'Explore our connectivity',
    "body" jsonb,
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_embed" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "url" varchar,
    "poster_id" integer,
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_data_chart" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "data_type" "enum_learning_videos_blocks_data_chart_data_type" DEFAULT 'volume',
    "unit" varchar,
    "asset_class_legacy_id" numeric,
    "accessible_summary" varchar,
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_content_section_columns" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "span" "enum_learning_videos_blocks_content_section_columns_span" DEFAULT '12'
  );

  CREATE TABLE "learning_videos_blocks_content_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "anchor" varchar,
    "theme" "enum_learning_videos_blocks_content_section_theme" DEFAULT 'light',
    "width" "enum_learning_videos_blocks_content_section_width" DEFAULT 'wide',
    "spacing" "enum_learning_videos_blocks_content_section_spacing" DEFAULT 'regular',
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_article_listing" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar DEFAULT 'Latest insights',
    "intro" jsonb,
    "page_size" numeric DEFAULT 12,
    "show_category_filter" boolean DEFAULT true,
    "block_name" varchar
  );

  CREATE TABLE "learning_videos" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "summary" varchar,
    "access_mode" "enum_learning_videos_access_mode" DEFAULT 'public',
    "video_id" integer,
    "external_video_u_r_l" varchar,
    "duration" varchar,
    "meta_title" varchar,
    "meta_description" varchar,
    "meta_image_id" integer,
    "meta_canonical_u_r_l" varchar,
    "meta_no_index" boolean DEFAULT false,
    "meta_no_follow" boolean DEFAULT false,
    "meta_structured_data" jsonb,
    "slug" varchar,
    "path" varchar,
    "published_at" timestamp(3) with time zone,
    "legacy_source_key" varchar,
    "legacy_source_source" varchar,
    "legacy_source_legacy_id" numeric,
    "legacy_source_original_url" varchar,
    "legacy_source_modified_gmt" timestamp(3) with time zone,
    "legacy_source_content_hash" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_learning_videos_status" DEFAULT 'draft'
  );

  CREATE TABLE "learning_videos_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "learning_video_categories_id" integer,
    "regions_id" integer
  );

  CREATE TABLE "_learning_videos_v_blocks_trayport_hero_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__learning_videos_v_blocks_trayport_hero_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_trayport_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "heading" varchar,
    "body" jsonb,
    "media_id" integer,
    "external_video_u_r_l" varchar,
    "appearance" "enum__learning_videos_v_blocks_trayport_hero_appearance" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_heading" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "text" varchar,
    "level" "enum__learning_videos_v_blocks_heading_level" DEFAULT 'h2',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_rich_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "body" jsonb,
    "size" "enum__learning_videos_v_blocks_rich_text_size" DEFAULT 'regular',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_actions_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__learning_videos_v_blocks_actions_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "external_u_r_l" varchar,
    "caption" varchar,
    "aspect" "enum__learning_videos_v_blocks_media_aspect" DEFAULT 'landscape',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_feature_list_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "body" jsonb,
    "icon" varchar,
    "media_id" integer,
    "url" varchar,
    "link_label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_feature_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "layout" "enum__learning_videos_v_blocks_feature_list_layout" DEFAULT 'grid',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_statistics_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "description" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_faq_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_entity_list_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" jsonb,
    "url" varchar,
    "media_id" integer,
    "_uuid" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_entity_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "kind" "enum__learning_videos_v_blocks_entity_list_kind" DEFAULT 'general',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_timeline_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "title" varchar,
    "body" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_timeline" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_data_table_headers" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_data_table_rows_cells" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_data_table_rows" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_data_table" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "caption" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_gallery_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_divider" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "style" "enum__learning_videos_v_blocks_divider_style" DEFAULT 'line',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_market_coverage_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__learning_videos_v_blocks_market_coverage_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_market_coverage" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar DEFAULT 'Explore our connectivity',
    "body" jsonb,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_embed" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "url" varchar,
    "poster_id" integer,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_data_chart" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "data_type" "enum__learning_videos_v_blocks_data_chart_data_type" DEFAULT 'volume',
    "unit" varchar,
    "asset_class_legacy_id" numeric,
    "accessible_summary" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_content_section_columns" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "span" "enum__learning_videos_v_blocks_content_section_columns_span" DEFAULT '12',
    "_uuid" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_content_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "anchor" varchar,
    "theme" "enum__learning_videos_v_blocks_content_section_theme" DEFAULT 'light',
    "width" "enum__learning_videos_v_blocks_content_section_width" DEFAULT 'wide',
    "spacing" "enum__learning_videos_v_blocks_content_section_spacing" DEFAULT 'regular',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_article_listing" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "heading" varchar DEFAULT 'Latest insights',
    "intro" jsonb,
    "page_size" numeric DEFAULT 12,
    "show_category_filter" boolean DEFAULT true,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_summary" varchar,
    "version_access_mode" "enum__learning_videos_v_version_access_mode" DEFAULT 'public',
    "version_video_id" integer,
    "version_external_video_u_r_l" varchar,
    "version_duration" varchar,
    "version_meta_title" varchar,
    "version_meta_description" varchar,
    "version_meta_image_id" integer,
    "version_meta_canonical_u_r_l" varchar,
    "version_meta_no_index" boolean DEFAULT false,
    "version_meta_no_follow" boolean DEFAULT false,
    "version_meta_structured_data" jsonb,
    "version_slug" varchar,
    "version_path" varchar,
    "version_published_at" timestamp(3) with time zone,
    "version_legacy_source_key" varchar,
    "version_legacy_source_source" varchar,
    "version_legacy_source_legacy_id" numeric,
    "version_legacy_source_original_url" varchar,
    "version_legacy_source_modified_gmt" timestamp(3) with time zone,
    "version_legacy_source_content_hash" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__learning_videos_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_learning_videos_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "learning_video_categories_id" integer,
    "regions_id" integer
  );

  CREATE TABLE "learning_video_categories" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "description" varchar,
    "display_order" numeric DEFAULT 0,
    "slug" varchar NOT NULL,
    "legacy_source_key" varchar,
    "legacy_source_source" varchar,
    "legacy_source_legacy_id" numeric,
    "legacy_source_original_url" varchar,
    "legacy_source_modified_gmt" timestamp(3) with time zone,
    "legacy_source_content_hash" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "route_registry" (
    "id" serial PRIMARY KEY NOT NULL,
    "path" varchar NOT NULL,
    "owner_kind" "enum_route_registry_owner_kind" NOT NULL,
    "owner_collection" "enum_route_registry_owner_collection" NOT NULL,
    "owner_document_id" varchar NOT NULL,
    "archetype" "enum_route_registry_archetype" NOT NULL,
    "state" "enum_route_registry_state" NOT NULL,
    "claim_key" varchar NOT NULL,
    "provenance_source" "enum_route_registry_provenance_source" NOT NULL,
    "provenance_legacy_id" numeric,
    "provenance_original_path" varchar,
    "provenance_note" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "route_indexes" (
    "id" serial PRIMARY KEY NOT NULL,
    "venue_index_eyebrow" varchar DEFAULT 'Market coverage',
    "venue_index_title" varchar DEFAULT 'Venues',
    "venue_index_intro" varchar DEFAULT 'Explore the brokers, exchanges and clearing houses connected through Trayport.',
    "venue_index_meta_title" varchar,
    "venue_index_meta_description" varchar,
    "venue_index_meta_image_id" integer,
    "venue_index_meta_canonical_u_r_l" varchar,
    "venue_index_meta_no_index" boolean DEFAULT false,
    "venue_index_meta_no_follow" boolean DEFAULT false,
    "venue_index_meta_structured_data" jsonb,
    "market_coverage_index_eyebrow" varchar DEFAULT 'Global network',
    "market_coverage_index_title" varchar DEFAULT 'Market coverage',
    "market_coverage_index_intro" varchar DEFAULT 'Explore the energy markets available through Trayport’s global trading network.',
    "market_coverage_index_meta_title" varchar,
    "market_coverage_index_meta_description" varchar,
    "market_coverage_index_meta_image_id" integer,
    "market_coverage_index_meta_canonical_u_r_l" varchar,
    "market_coverage_index_meta_no_index" boolean DEFAULT false,
    "market_coverage_index_meta_no_follow" boolean DEFAULT false,
    "market_coverage_index_meta_structured_data" jsonb,
    "_status" "enum_route_indexes_status" DEFAULT 'draft',
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "_route_indexes_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "version_venue_index_eyebrow" varchar DEFAULT 'Market coverage',
    "version_venue_index_title" varchar DEFAULT 'Venues',
    "version_venue_index_intro" varchar DEFAULT 'Explore the brokers, exchanges and clearing houses connected through Trayport.',
    "version_venue_index_meta_title" varchar,
    "version_venue_index_meta_description" varchar,
    "version_venue_index_meta_image_id" integer,
    "version_venue_index_meta_canonical_u_r_l" varchar,
    "version_venue_index_meta_no_index" boolean DEFAULT false,
    "version_venue_index_meta_no_follow" boolean DEFAULT false,
    "version_venue_index_meta_structured_data" jsonb,
    "version_market_coverage_index_eyebrow" varchar DEFAULT 'Global network',
    "version_market_coverage_index_title" varchar DEFAULT 'Market coverage',
    "version_market_coverage_index_intro" varchar DEFAULT 'Explore the energy markets available through Trayport’s global trading network.',
    "version_market_coverage_index_meta_title" varchar,
    "version_market_coverage_index_meta_description" varchar,
    "version_market_coverage_index_meta_image_id" integer,
    "version_market_coverage_index_meta_canonical_u_r_l" varchar,
    "version_market_coverage_index_meta_no_index" boolean DEFAULT false,
    "version_market_coverage_index_meta_no_follow" boolean DEFAULT false,
    "version_market_coverage_index_meta_structured_data" jsonb,
    "version__status" "enum__route_indexes_v_version_status" DEFAULT 'draft',
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  ALTER TABLE "articles" ADD COLUMN "external_destination" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_external_destination" varchar;
  ALTER TABLE "venues" ADD COLUMN "content_mode" "enum_venues_content_mode" DEFAULT 'relationship-only';
  ALTER TABLE "venues" ADD COLUMN "path" varchar;
  ALTER TABLE "venues" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "venues" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "venues" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "venues" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "venues" ADD COLUMN "meta_canonical_u_r_l" varchar;
  ALTER TABLE "venues" ADD COLUMN "meta_no_index" boolean DEFAULT false;
  ALTER TABLE "venues" ADD COLUMN "meta_no_follow" boolean DEFAULT false;
  ALTER TABLE "venues" ADD COLUMN "meta_structured_data" jsonb;
  ALTER TABLE "_venues_v" ADD COLUMN "version_content_mode" "enum__venues_v_version_content_mode" DEFAULT 'relationship-only';
  ALTER TABLE "_venues_v" ADD COLUMN "version_path" varchar;
  ALTER TABLE "_venues_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  ALTER TABLE "_venues_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_venues_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_venues_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_venues_v" ADD COLUMN "version_meta_canonical_u_r_l" varchar;
  ALTER TABLE "_venues_v" ADD COLUMN "version_meta_no_index" boolean DEFAULT false;
  ALTER TABLE "_venues_v" ADD COLUMN "version_meta_no_follow" boolean DEFAULT false;
  ALTER TABLE "_venues_v" ADD COLUMN "version_meta_structured_data" jsonb;
  ALTER TABLE "redirects_rels" ADD COLUMN "venues_id" integer;
  ALTER TABLE "redirects_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "learning_videos_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "learning_video_categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "route_registry_id" integer;
  ALTER TABLE "venues_blocks_trayport_hero_actions" ADD CONSTRAINT "venues_blocks_trayport_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_trayport_hero" ADD CONSTRAINT "venues_blocks_trayport_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_blocks_trayport_hero" ADD CONSTRAINT "venues_blocks_trayport_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_heading" ADD CONSTRAINT "venues_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_rich_text" ADD CONSTRAINT "venues_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_actions_actions" ADD CONSTRAINT "venues_blocks_actions_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_actions" ADD CONSTRAINT "venues_blocks_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_media" ADD CONSTRAINT "venues_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_blocks_media" ADD CONSTRAINT "venues_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_feature_list_items" ADD CONSTRAINT "venues_blocks_feature_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_blocks_feature_list_items" ADD CONSTRAINT "venues_blocks_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_feature_list" ADD CONSTRAINT "venues_blocks_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_statistics_items" ADD CONSTRAINT "venues_blocks_statistics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_statistics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_statistics" ADD CONSTRAINT "venues_blocks_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_faq_items" ADD CONSTRAINT "venues_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_faq" ADD CONSTRAINT "venues_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_entity_list_items" ADD CONSTRAINT "venues_blocks_entity_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_blocks_entity_list_items" ADD CONSTRAINT "venues_blocks_entity_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_entity_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_entity_list" ADD CONSTRAINT "venues_blocks_entity_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_timeline_items" ADD CONSTRAINT "venues_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_timeline" ADD CONSTRAINT "venues_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_data_table_headers" ADD CONSTRAINT "venues_blocks_data_table_headers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_data_table_rows_cells" ADD CONSTRAINT "venues_blocks_data_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_data_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_data_table_rows" ADD CONSTRAINT "venues_blocks_data_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_data_table" ADD CONSTRAINT "venues_blocks_data_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_gallery_items" ADD CONSTRAINT "venues_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_blocks_gallery_items" ADD CONSTRAINT "venues_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_gallery" ADD CONSTRAINT "venues_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_divider" ADD CONSTRAINT "venues_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_market_coverage_actions" ADD CONSTRAINT "venues_blocks_market_coverage_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_market_coverage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_market_coverage" ADD CONSTRAINT "venues_blocks_market_coverage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_embed" ADD CONSTRAINT "venues_blocks_embed_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_blocks_embed" ADD CONSTRAINT "venues_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_data_chart" ADD CONSTRAINT "venues_blocks_data_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_content_section_columns" ADD CONSTRAINT "venues_blocks_content_section_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_content_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_content_section" ADD CONSTRAINT "venues_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_article_listing" ADD CONSTRAINT "venues_blocks_article_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" ADD CONSTRAINT "_venues_v_blocks_trayport_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_trayport_hero" ADD CONSTRAINT "_venues_v_blocks_trayport_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_trayport_hero" ADD CONSTRAINT "_venues_v_blocks_trayport_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_heading" ADD CONSTRAINT "_venues_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_rich_text" ADD CONSTRAINT "_venues_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_actions_actions" ADD CONSTRAINT "_venues_v_blocks_actions_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_actions" ADD CONSTRAINT "_venues_v_blocks_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_media" ADD CONSTRAINT "_venues_v_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_media" ADD CONSTRAINT "_venues_v_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_feature_list_items" ADD CONSTRAINT "_venues_v_blocks_feature_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_feature_list_items" ADD CONSTRAINT "_venues_v_blocks_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_feature_list" ADD CONSTRAINT "_venues_v_blocks_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_statistics_items" ADD CONSTRAINT "_venues_v_blocks_statistics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_statistics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_statistics" ADD CONSTRAINT "_venues_v_blocks_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_faq_items" ADD CONSTRAINT "_venues_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_faq" ADD CONSTRAINT "_venues_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_entity_list_items" ADD CONSTRAINT "_venues_v_blocks_entity_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_entity_list_items" ADD CONSTRAINT "_venues_v_blocks_entity_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_entity_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_entity_list" ADD CONSTRAINT "_venues_v_blocks_entity_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_timeline_items" ADD CONSTRAINT "_venues_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_timeline" ADD CONSTRAINT "_venues_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_data_table_headers" ADD CONSTRAINT "_venues_v_blocks_data_table_headers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_data_table_rows_cells" ADD CONSTRAINT "_venues_v_blocks_data_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_data_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_data_table_rows" ADD CONSTRAINT "_venues_v_blocks_data_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_data_table" ADD CONSTRAINT "_venues_v_blocks_data_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_gallery_items" ADD CONSTRAINT "_venues_v_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_gallery_items" ADD CONSTRAINT "_venues_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_gallery" ADD CONSTRAINT "_venues_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_divider" ADD CONSTRAINT "_venues_v_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" ADD CONSTRAINT "_venues_v_blocks_market_coverage_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_market_coverage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD CONSTRAINT "_venues_v_blocks_market_coverage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_embed" ADD CONSTRAINT "_venues_v_blocks_embed_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_embed" ADD CONSTRAINT "_venues_v_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_data_chart" ADD CONSTRAINT "_venues_v_blocks_data_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_content_section_columns" ADD CONSTRAINT "_venues_v_blocks_content_section_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_content_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_content_section" ADD CONSTRAINT "_venues_v_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_article_listing" ADD CONSTRAINT "_venues_v_blocks_article_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" ADD CONSTRAINT "learning_videos_blocks_trayport_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_trayport_hero" ADD CONSTRAINT "learning_videos_blocks_trayport_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_trayport_hero" ADD CONSTRAINT "learning_videos_blocks_trayport_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_heading" ADD CONSTRAINT "learning_videos_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_rich_text" ADD CONSTRAINT "learning_videos_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_actions_actions" ADD CONSTRAINT "learning_videos_blocks_actions_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_actions" ADD CONSTRAINT "learning_videos_blocks_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_media" ADD CONSTRAINT "learning_videos_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_media" ADD CONSTRAINT "learning_videos_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_feature_list_items" ADD CONSTRAINT "learning_videos_blocks_feature_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_feature_list_items" ADD CONSTRAINT "learning_videos_blocks_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_feature_list" ADD CONSTRAINT "learning_videos_blocks_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_statistics_items" ADD CONSTRAINT "learning_videos_blocks_statistics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_statistics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_statistics" ADD CONSTRAINT "learning_videos_blocks_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_faq_items" ADD CONSTRAINT "learning_videos_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_faq" ADD CONSTRAINT "learning_videos_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_entity_list_items" ADD CONSTRAINT "learning_videos_blocks_entity_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_entity_list_items" ADD CONSTRAINT "learning_videos_blocks_entity_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_entity_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_entity_list" ADD CONSTRAINT "learning_videos_blocks_entity_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_timeline_items" ADD CONSTRAINT "learning_videos_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_timeline" ADD CONSTRAINT "learning_videos_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_data_table_headers" ADD CONSTRAINT "learning_videos_blocks_data_table_headers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_data_table_rows_cells" ADD CONSTRAINT "learning_videos_blocks_data_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_data_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_data_table_rows" ADD CONSTRAINT "learning_videos_blocks_data_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_data_table" ADD CONSTRAINT "learning_videos_blocks_data_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_gallery_items" ADD CONSTRAINT "learning_videos_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_gallery_items" ADD CONSTRAINT "learning_videos_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_gallery" ADD CONSTRAINT "learning_videos_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_divider" ADD CONSTRAINT "learning_videos_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" ADD CONSTRAINT "learning_videos_blocks_market_coverage_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_market_coverage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD CONSTRAINT "learning_videos_blocks_market_coverage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_embed" ADD CONSTRAINT "learning_videos_blocks_embed_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_embed" ADD CONSTRAINT "learning_videos_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_data_chart" ADD CONSTRAINT "learning_videos_blocks_data_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_content_section_columns" ADD CONSTRAINT "learning_videos_blocks_content_section_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_content_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_content_section" ADD CONSTRAINT "learning_videos_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_article_listing" ADD CONSTRAINT "learning_videos_blocks_article_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos" ADD CONSTRAINT "learning_videos_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos" ADD CONSTRAINT "learning_videos_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_rels" ADD CONSTRAINT "learning_videos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_rels" ADD CONSTRAINT "learning_videos_rels_learning_video_categories_fk" FOREIGN KEY ("learning_video_categories_id") REFERENCES "public"."learning_video_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_rels" ADD CONSTRAINT "learning_videos_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" ADD CONSTRAINT "_learning_videos_v_blocks_trayport_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero" ADD CONSTRAINT "_learning_videos_v_blocks_trayport_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero" ADD CONSTRAINT "_learning_videos_v_blocks_trayport_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_heading" ADD CONSTRAINT "_learning_videos_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_rich_text" ADD CONSTRAINT "_learning_videos_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" ADD CONSTRAINT "_learning_videos_v_blocks_actions_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_actions" ADD CONSTRAINT "_learning_videos_v_blocks_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_media" ADD CONSTRAINT "_learning_videos_v_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_media" ADD CONSTRAINT "_learning_videos_v_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ADD CONSTRAINT "_learning_videos_v_blocks_feature_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ADD CONSTRAINT "_learning_videos_v_blocks_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_feature_list" ADD CONSTRAINT "_learning_videos_v_blocks_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_statistics_items" ADD CONSTRAINT "_learning_videos_v_blocks_statistics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_statistics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_statistics" ADD CONSTRAINT "_learning_videos_v_blocks_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_faq_items" ADD CONSTRAINT "_learning_videos_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_faq" ADD CONSTRAINT "_learning_videos_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" ADD CONSTRAINT "_learning_videos_v_blocks_entity_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" ADD CONSTRAINT "_learning_videos_v_blocks_entity_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_entity_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_entity_list" ADD CONSTRAINT "_learning_videos_v_blocks_entity_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_timeline_items" ADD CONSTRAINT "_learning_videos_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_timeline" ADD CONSTRAINT "_learning_videos_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_data_table_headers" ADD CONSTRAINT "_learning_videos_v_blocks_data_table_headers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_data_table_rows_cells" ADD CONSTRAINT "_learning_videos_v_blocks_data_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_data_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_data_table_rows" ADD CONSTRAINT "_learning_videos_v_blocks_data_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_data_table" ADD CONSTRAINT "_learning_videos_v_blocks_data_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_gallery_items" ADD CONSTRAINT "_learning_videos_v_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_gallery_items" ADD CONSTRAINT "_learning_videos_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_gallery" ADD CONSTRAINT "_learning_videos_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_divider" ADD CONSTRAINT "_learning_videos_v_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" ADD CONSTRAINT "_learning_videos_v_blocks_market_coverage_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_market_coverage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD CONSTRAINT "_learning_videos_v_blocks_market_coverage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_embed" ADD CONSTRAINT "_learning_videos_v_blocks_embed_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_embed" ADD CONSTRAINT "_learning_videos_v_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD CONSTRAINT "_learning_videos_v_blocks_data_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" ADD CONSTRAINT "_learning_videos_v_blocks_content_section_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_content_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD CONSTRAINT "_learning_videos_v_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_article_listing" ADD CONSTRAINT "_learning_videos_v_blocks_article_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v" ADD CONSTRAINT "_learning_videos_v_parent_id_learning_videos_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v" ADD CONSTRAINT "_learning_videos_v_version_video_id_media_id_fk" FOREIGN KEY ("version_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v" ADD CONSTRAINT "_learning_videos_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_rels" ADD CONSTRAINT "_learning_videos_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_rels" ADD CONSTRAINT "_learning_videos_v_rels_learning_video_categories_fk" FOREIGN KEY ("learning_video_categories_id") REFERENCES "public"."learning_video_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_rels" ADD CONSTRAINT "_learning_videos_v_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "route_indexes" ADD CONSTRAINT "route_indexes_venue_index_meta_image_id_media_id_fk" FOREIGN KEY ("venue_index_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "route_indexes" ADD CONSTRAINT "route_indexes_market_coverage_index_meta_image_id_media_id_fk" FOREIGN KEY ("market_coverage_index_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_route_indexes_v" ADD CONSTRAINT "_route_indexes_v_version_venue_index_meta_image_id_media_id_fk" FOREIGN KEY ("version_venue_index_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_route_indexes_v" ADD CONSTRAINT "_route_indexes_v_version_market_coverage_index_meta_image_id_media_id_fk" FOREIGN KEY ("version_market_coverage_index_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "venues_blocks_trayport_hero_actions_order_idx" ON "venues_blocks_trayport_hero_actions" USING btree ("_order");
  CREATE INDEX "venues_blocks_trayport_hero_actions_parent_id_idx" ON "venues_blocks_trayport_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_trayport_hero_order_idx" ON "venues_blocks_trayport_hero" USING btree ("_order");
  CREATE INDEX "venues_blocks_trayport_hero_parent_id_idx" ON "venues_blocks_trayport_hero" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_trayport_hero_path_idx" ON "venues_blocks_trayport_hero" USING btree ("_path");
  CREATE INDEX "venues_blocks_trayport_hero_media_idx" ON "venues_blocks_trayport_hero" USING btree ("media_id");
  CREATE INDEX "venues_blocks_heading_order_idx" ON "venues_blocks_heading" USING btree ("_order");
  CREATE INDEX "venues_blocks_heading_parent_id_idx" ON "venues_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_heading_path_idx" ON "venues_blocks_heading" USING btree ("_path");
  CREATE INDEX "venues_blocks_rich_text_order_idx" ON "venues_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "venues_blocks_rich_text_parent_id_idx" ON "venues_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_rich_text_path_idx" ON "venues_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "venues_blocks_actions_actions_order_idx" ON "venues_blocks_actions_actions" USING btree ("_order");
  CREATE INDEX "venues_blocks_actions_actions_parent_id_idx" ON "venues_blocks_actions_actions" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_actions_order_idx" ON "venues_blocks_actions" USING btree ("_order");
  CREATE INDEX "venues_blocks_actions_parent_id_idx" ON "venues_blocks_actions" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_actions_path_idx" ON "venues_blocks_actions" USING btree ("_path");
  CREATE INDEX "venues_blocks_media_order_idx" ON "venues_blocks_media" USING btree ("_order");
  CREATE INDEX "venues_blocks_media_parent_id_idx" ON "venues_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_media_path_idx" ON "venues_blocks_media" USING btree ("_path");
  CREATE INDEX "venues_blocks_media_media_idx" ON "venues_blocks_media" USING btree ("media_id");
  CREATE INDEX "venues_blocks_feature_list_items_order_idx" ON "venues_blocks_feature_list_items" USING btree ("_order");
  CREATE INDEX "venues_blocks_feature_list_items_parent_id_idx" ON "venues_blocks_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_feature_list_items_media_idx" ON "venues_blocks_feature_list_items" USING btree ("media_id");
  CREATE INDEX "venues_blocks_feature_list_order_idx" ON "venues_blocks_feature_list" USING btree ("_order");
  CREATE INDEX "venues_blocks_feature_list_parent_id_idx" ON "venues_blocks_feature_list" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_feature_list_path_idx" ON "venues_blocks_feature_list" USING btree ("_path");
  CREATE INDEX "venues_blocks_statistics_items_order_idx" ON "venues_blocks_statistics_items" USING btree ("_order");
  CREATE INDEX "venues_blocks_statistics_items_parent_id_idx" ON "venues_blocks_statistics_items" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_statistics_order_idx" ON "venues_blocks_statistics" USING btree ("_order");
  CREATE INDEX "venues_blocks_statistics_parent_id_idx" ON "venues_blocks_statistics" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_statistics_path_idx" ON "venues_blocks_statistics" USING btree ("_path");
  CREATE INDEX "venues_blocks_faq_items_order_idx" ON "venues_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "venues_blocks_faq_items_parent_id_idx" ON "venues_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_faq_order_idx" ON "venues_blocks_faq" USING btree ("_order");
  CREATE INDEX "venues_blocks_faq_parent_id_idx" ON "venues_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_faq_path_idx" ON "venues_blocks_faq" USING btree ("_path");
  CREATE INDEX "venues_blocks_entity_list_items_order_idx" ON "venues_blocks_entity_list_items" USING btree ("_order");
  CREATE INDEX "venues_blocks_entity_list_items_parent_id_idx" ON "venues_blocks_entity_list_items" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_entity_list_items_media_idx" ON "venues_blocks_entity_list_items" USING btree ("media_id");
  CREATE INDEX "venues_blocks_entity_list_order_idx" ON "venues_blocks_entity_list" USING btree ("_order");
  CREATE INDEX "venues_blocks_entity_list_parent_id_idx" ON "venues_blocks_entity_list" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_entity_list_path_idx" ON "venues_blocks_entity_list" USING btree ("_path");
  CREATE INDEX "venues_blocks_timeline_items_order_idx" ON "venues_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "venues_blocks_timeline_items_parent_id_idx" ON "venues_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_timeline_order_idx" ON "venues_blocks_timeline" USING btree ("_order");
  CREATE INDEX "venues_blocks_timeline_parent_id_idx" ON "venues_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_timeline_path_idx" ON "venues_blocks_timeline" USING btree ("_path");
  CREATE INDEX "venues_blocks_data_table_headers_order_idx" ON "venues_blocks_data_table_headers" USING btree ("_order");
  CREATE INDEX "venues_blocks_data_table_headers_parent_id_idx" ON "venues_blocks_data_table_headers" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_data_table_rows_cells_order_idx" ON "venues_blocks_data_table_rows_cells" USING btree ("_order");
  CREATE INDEX "venues_blocks_data_table_rows_cells_parent_id_idx" ON "venues_blocks_data_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_data_table_rows_order_idx" ON "venues_blocks_data_table_rows" USING btree ("_order");
  CREATE INDEX "venues_blocks_data_table_rows_parent_id_idx" ON "venues_blocks_data_table_rows" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_data_table_order_idx" ON "venues_blocks_data_table" USING btree ("_order");
  CREATE INDEX "venues_blocks_data_table_parent_id_idx" ON "venues_blocks_data_table" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_data_table_path_idx" ON "venues_blocks_data_table" USING btree ("_path");
  CREATE INDEX "venues_blocks_gallery_items_order_idx" ON "venues_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "venues_blocks_gallery_items_parent_id_idx" ON "venues_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_gallery_items_media_idx" ON "venues_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "venues_blocks_gallery_order_idx" ON "venues_blocks_gallery" USING btree ("_order");
  CREATE INDEX "venues_blocks_gallery_parent_id_idx" ON "venues_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_gallery_path_idx" ON "venues_blocks_gallery" USING btree ("_path");
  CREATE INDEX "venues_blocks_divider_order_idx" ON "venues_blocks_divider" USING btree ("_order");
  CREATE INDEX "venues_blocks_divider_parent_id_idx" ON "venues_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_divider_path_idx" ON "venues_blocks_divider" USING btree ("_path");
  CREATE INDEX "venues_blocks_market_coverage_actions_order_idx" ON "venues_blocks_market_coverage_actions" USING btree ("_order");
  CREATE INDEX "venues_blocks_market_coverage_actions_parent_id_idx" ON "venues_blocks_market_coverage_actions" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_market_coverage_order_idx" ON "venues_blocks_market_coverage" USING btree ("_order");
  CREATE INDEX "venues_blocks_market_coverage_parent_id_idx" ON "venues_blocks_market_coverage" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_market_coverage_path_idx" ON "venues_blocks_market_coverage" USING btree ("_path");
  CREATE INDEX "venues_blocks_embed_order_idx" ON "venues_blocks_embed" USING btree ("_order");
  CREATE INDEX "venues_blocks_embed_parent_id_idx" ON "venues_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_embed_path_idx" ON "venues_blocks_embed" USING btree ("_path");
  CREATE INDEX "venues_blocks_embed_poster_idx" ON "venues_blocks_embed" USING btree ("poster_id");
  CREATE INDEX "venues_blocks_data_chart_order_idx" ON "venues_blocks_data_chart" USING btree ("_order");
  CREATE INDEX "venues_blocks_data_chart_parent_id_idx" ON "venues_blocks_data_chart" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_data_chart_path_idx" ON "venues_blocks_data_chart" USING btree ("_path");
  CREATE INDEX "venues_blocks_content_section_columns_order_idx" ON "venues_blocks_content_section_columns" USING btree ("_order");
  CREATE INDEX "venues_blocks_content_section_columns_parent_id_idx" ON "venues_blocks_content_section_columns" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_content_section_order_idx" ON "venues_blocks_content_section" USING btree ("_order");
  CREATE INDEX "venues_blocks_content_section_parent_id_idx" ON "venues_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_content_section_path_idx" ON "venues_blocks_content_section" USING btree ("_path");
  CREATE INDEX "venues_blocks_article_listing_order_idx" ON "venues_blocks_article_listing" USING btree ("_order");
  CREATE INDEX "venues_blocks_article_listing_parent_id_idx" ON "venues_blocks_article_listing" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_article_listing_path_idx" ON "venues_blocks_article_listing" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_trayport_hero_actions_order_idx" ON "_venues_v_blocks_trayport_hero_actions" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_trayport_hero_actions_parent_id_idx" ON "_venues_v_blocks_trayport_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_trayport_hero_order_idx" ON "_venues_v_blocks_trayport_hero" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_trayport_hero_parent_id_idx" ON "_venues_v_blocks_trayport_hero" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_trayport_hero_path_idx" ON "_venues_v_blocks_trayport_hero" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_trayport_hero_media_idx" ON "_venues_v_blocks_trayport_hero" USING btree ("media_id");
  CREATE INDEX "_venues_v_blocks_heading_order_idx" ON "_venues_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_heading_parent_id_idx" ON "_venues_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_heading_path_idx" ON "_venues_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_rich_text_order_idx" ON "_venues_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_rich_text_parent_id_idx" ON "_venues_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_rich_text_path_idx" ON "_venues_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_actions_actions_order_idx" ON "_venues_v_blocks_actions_actions" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_actions_actions_parent_id_idx" ON "_venues_v_blocks_actions_actions" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_actions_order_idx" ON "_venues_v_blocks_actions" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_actions_parent_id_idx" ON "_venues_v_blocks_actions" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_actions_path_idx" ON "_venues_v_blocks_actions" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_media_order_idx" ON "_venues_v_blocks_media" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_media_parent_id_idx" ON "_venues_v_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_media_path_idx" ON "_venues_v_blocks_media" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_media_media_idx" ON "_venues_v_blocks_media" USING btree ("media_id");
  CREATE INDEX "_venues_v_blocks_feature_list_items_order_idx" ON "_venues_v_blocks_feature_list_items" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_feature_list_items_parent_id_idx" ON "_venues_v_blocks_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_feature_list_items_media_idx" ON "_venues_v_blocks_feature_list_items" USING btree ("media_id");
  CREATE INDEX "_venues_v_blocks_feature_list_order_idx" ON "_venues_v_blocks_feature_list" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_feature_list_parent_id_idx" ON "_venues_v_blocks_feature_list" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_feature_list_path_idx" ON "_venues_v_blocks_feature_list" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_statistics_items_order_idx" ON "_venues_v_blocks_statistics_items" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_statistics_items_parent_id_idx" ON "_venues_v_blocks_statistics_items" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_statistics_order_idx" ON "_venues_v_blocks_statistics" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_statistics_parent_id_idx" ON "_venues_v_blocks_statistics" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_statistics_path_idx" ON "_venues_v_blocks_statistics" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_faq_items_order_idx" ON "_venues_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_faq_items_parent_id_idx" ON "_venues_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_faq_order_idx" ON "_venues_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_faq_parent_id_idx" ON "_venues_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_faq_path_idx" ON "_venues_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_entity_list_items_order_idx" ON "_venues_v_blocks_entity_list_items" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_entity_list_items_parent_id_idx" ON "_venues_v_blocks_entity_list_items" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_entity_list_items_media_idx" ON "_venues_v_blocks_entity_list_items" USING btree ("media_id");
  CREATE INDEX "_venues_v_blocks_entity_list_order_idx" ON "_venues_v_blocks_entity_list" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_entity_list_parent_id_idx" ON "_venues_v_blocks_entity_list" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_entity_list_path_idx" ON "_venues_v_blocks_entity_list" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_timeline_items_order_idx" ON "_venues_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_timeline_items_parent_id_idx" ON "_venues_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_timeline_order_idx" ON "_venues_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_timeline_parent_id_idx" ON "_venues_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_timeline_path_idx" ON "_venues_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_data_table_headers_order_idx" ON "_venues_v_blocks_data_table_headers" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_data_table_headers_parent_id_idx" ON "_venues_v_blocks_data_table_headers" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_data_table_rows_cells_order_idx" ON "_venues_v_blocks_data_table_rows_cells" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_data_table_rows_cells_parent_id_idx" ON "_venues_v_blocks_data_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_data_table_rows_order_idx" ON "_venues_v_blocks_data_table_rows" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_data_table_rows_parent_id_idx" ON "_venues_v_blocks_data_table_rows" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_data_table_order_idx" ON "_venues_v_blocks_data_table" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_data_table_parent_id_idx" ON "_venues_v_blocks_data_table" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_data_table_path_idx" ON "_venues_v_blocks_data_table" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_gallery_items_order_idx" ON "_venues_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_gallery_items_parent_id_idx" ON "_venues_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_gallery_items_media_idx" ON "_venues_v_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "_venues_v_blocks_gallery_order_idx" ON "_venues_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_gallery_parent_id_idx" ON "_venues_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_gallery_path_idx" ON "_venues_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_divider_order_idx" ON "_venues_v_blocks_divider" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_divider_parent_id_idx" ON "_venues_v_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_divider_path_idx" ON "_venues_v_blocks_divider" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_market_coverage_actions_order_idx" ON "_venues_v_blocks_market_coverage_actions" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_market_coverage_actions_parent_id_idx" ON "_venues_v_blocks_market_coverage_actions" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_market_coverage_order_idx" ON "_venues_v_blocks_market_coverage" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_market_coverage_parent_id_idx" ON "_venues_v_blocks_market_coverage" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_market_coverage_path_idx" ON "_venues_v_blocks_market_coverage" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_embed_order_idx" ON "_venues_v_blocks_embed" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_embed_parent_id_idx" ON "_venues_v_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_embed_path_idx" ON "_venues_v_blocks_embed" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_embed_poster_idx" ON "_venues_v_blocks_embed" USING btree ("poster_id");
  CREATE INDEX "_venues_v_blocks_data_chart_order_idx" ON "_venues_v_blocks_data_chart" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_data_chart_parent_id_idx" ON "_venues_v_blocks_data_chart" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_data_chart_path_idx" ON "_venues_v_blocks_data_chart" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_content_section_columns_order_idx" ON "_venues_v_blocks_content_section_columns" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_content_section_columns_parent_id_idx" ON "_venues_v_blocks_content_section_columns" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_content_section_order_idx" ON "_venues_v_blocks_content_section" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_content_section_parent_id_idx" ON "_venues_v_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_content_section_path_idx" ON "_venues_v_blocks_content_section" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_article_listing_order_idx" ON "_venues_v_blocks_article_listing" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_article_listing_parent_id_idx" ON "_venues_v_blocks_article_listing" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_article_listing_path_idx" ON "_venues_v_blocks_article_listing" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_trayport_hero_actions_order_idx" ON "learning_videos_blocks_trayport_hero_actions" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_trayport_hero_actions_parent_id_idx" ON "learning_videos_blocks_trayport_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_trayport_hero_order_idx" ON "learning_videos_blocks_trayport_hero" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_trayport_hero_parent_id_idx" ON "learning_videos_blocks_trayport_hero" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_trayport_hero_path_idx" ON "learning_videos_blocks_trayport_hero" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_trayport_hero_media_idx" ON "learning_videos_blocks_trayport_hero" USING btree ("media_id");
  CREATE INDEX "learning_videos_blocks_heading_order_idx" ON "learning_videos_blocks_heading" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_heading_parent_id_idx" ON "learning_videos_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_heading_path_idx" ON "learning_videos_blocks_heading" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_rich_text_order_idx" ON "learning_videos_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_rich_text_parent_id_idx" ON "learning_videos_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_rich_text_path_idx" ON "learning_videos_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_actions_actions_order_idx" ON "learning_videos_blocks_actions_actions" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_actions_actions_parent_id_idx" ON "learning_videos_blocks_actions_actions" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_actions_order_idx" ON "learning_videos_blocks_actions" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_actions_parent_id_idx" ON "learning_videos_blocks_actions" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_actions_path_idx" ON "learning_videos_blocks_actions" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_media_order_idx" ON "learning_videos_blocks_media" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_media_parent_id_idx" ON "learning_videos_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_media_path_idx" ON "learning_videos_blocks_media" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_media_media_idx" ON "learning_videos_blocks_media" USING btree ("media_id");
  CREATE INDEX "learning_videos_blocks_feature_list_items_order_idx" ON "learning_videos_blocks_feature_list_items" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_feature_list_items_parent_id_idx" ON "learning_videos_blocks_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_feature_list_items_media_idx" ON "learning_videos_blocks_feature_list_items" USING btree ("media_id");
  CREATE INDEX "learning_videos_blocks_feature_list_order_idx" ON "learning_videos_blocks_feature_list" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_feature_list_parent_id_idx" ON "learning_videos_blocks_feature_list" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_feature_list_path_idx" ON "learning_videos_blocks_feature_list" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_statistics_items_order_idx" ON "learning_videos_blocks_statistics_items" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_statistics_items_parent_id_idx" ON "learning_videos_blocks_statistics_items" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_statistics_order_idx" ON "learning_videos_blocks_statistics" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_statistics_parent_id_idx" ON "learning_videos_blocks_statistics" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_statistics_path_idx" ON "learning_videos_blocks_statistics" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_faq_items_order_idx" ON "learning_videos_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_faq_items_parent_id_idx" ON "learning_videos_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_faq_order_idx" ON "learning_videos_blocks_faq" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_faq_parent_id_idx" ON "learning_videos_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_faq_path_idx" ON "learning_videos_blocks_faq" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_entity_list_items_order_idx" ON "learning_videos_blocks_entity_list_items" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_entity_list_items_parent_id_idx" ON "learning_videos_blocks_entity_list_items" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_entity_list_items_media_idx" ON "learning_videos_blocks_entity_list_items" USING btree ("media_id");
  CREATE INDEX "learning_videos_blocks_entity_list_order_idx" ON "learning_videos_blocks_entity_list" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_entity_list_parent_id_idx" ON "learning_videos_blocks_entity_list" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_entity_list_path_idx" ON "learning_videos_blocks_entity_list" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_timeline_items_order_idx" ON "learning_videos_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_timeline_items_parent_id_idx" ON "learning_videos_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_timeline_order_idx" ON "learning_videos_blocks_timeline" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_timeline_parent_id_idx" ON "learning_videos_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_timeline_path_idx" ON "learning_videos_blocks_timeline" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_data_table_headers_order_idx" ON "learning_videos_blocks_data_table_headers" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_data_table_headers_parent_id_idx" ON "learning_videos_blocks_data_table_headers" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_data_table_rows_cells_order_idx" ON "learning_videos_blocks_data_table_rows_cells" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_data_table_rows_cells_parent_id_idx" ON "learning_videos_blocks_data_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_data_table_rows_order_idx" ON "learning_videos_blocks_data_table_rows" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_data_table_rows_parent_id_idx" ON "learning_videos_blocks_data_table_rows" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_data_table_order_idx" ON "learning_videos_blocks_data_table" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_data_table_parent_id_idx" ON "learning_videos_blocks_data_table" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_data_table_path_idx" ON "learning_videos_blocks_data_table" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_gallery_items_order_idx" ON "learning_videos_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_gallery_items_parent_id_idx" ON "learning_videos_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_gallery_items_media_idx" ON "learning_videos_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "learning_videos_blocks_gallery_order_idx" ON "learning_videos_blocks_gallery" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_gallery_parent_id_idx" ON "learning_videos_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_gallery_path_idx" ON "learning_videos_blocks_gallery" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_divider_order_idx" ON "learning_videos_blocks_divider" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_divider_parent_id_idx" ON "learning_videos_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_divider_path_idx" ON "learning_videos_blocks_divider" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_market_coverage_actions_order_idx" ON "learning_videos_blocks_market_coverage_actions" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_market_coverage_actions_parent_id_idx" ON "learning_videos_blocks_market_coverage_actions" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_market_coverage_order_idx" ON "learning_videos_blocks_market_coverage" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_market_coverage_parent_id_idx" ON "learning_videos_blocks_market_coverage" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_market_coverage_path_idx" ON "learning_videos_blocks_market_coverage" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_embed_order_idx" ON "learning_videos_blocks_embed" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_embed_parent_id_idx" ON "learning_videos_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_embed_path_idx" ON "learning_videos_blocks_embed" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_embed_poster_idx" ON "learning_videos_blocks_embed" USING btree ("poster_id");
  CREATE INDEX "learning_videos_blocks_data_chart_order_idx" ON "learning_videos_blocks_data_chart" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_data_chart_parent_id_idx" ON "learning_videos_blocks_data_chart" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_data_chart_path_idx" ON "learning_videos_blocks_data_chart" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_content_section_columns_order_idx" ON "learning_videos_blocks_content_section_columns" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_content_section_columns_parent_id_idx" ON "learning_videos_blocks_content_section_columns" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_content_section_order_idx" ON "learning_videos_blocks_content_section" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_content_section_parent_id_idx" ON "learning_videos_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_content_section_path_idx" ON "learning_videos_blocks_content_section" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_article_listing_order_idx" ON "learning_videos_blocks_article_listing" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_article_listing_parent_id_idx" ON "learning_videos_blocks_article_listing" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_article_listing_path_idx" ON "learning_videos_blocks_article_listing" USING btree ("_path");
  CREATE INDEX "learning_videos_title_idx" ON "learning_videos" USING btree ("title");
  CREATE INDEX "learning_videos_video_idx" ON "learning_videos" USING btree ("video_id");
  CREATE INDEX "learning_videos_meta_meta_image_idx" ON "learning_videos" USING btree ("meta_image_id");
  CREATE INDEX "learning_videos_slug_idx" ON "learning_videos" USING btree ("slug");
  CREATE UNIQUE INDEX "learning_videos_path_idx" ON "learning_videos" USING btree ("path");
  CREATE UNIQUE INDEX "learning_videos_legacy_source_legacy_source_key_idx" ON "learning_videos" USING btree ("legacy_source_key");
  CREATE INDEX "learning_videos_legacy_source_legacy_source_source_idx" ON "learning_videos" USING btree ("legacy_source_source");
  CREATE INDEX "learning_videos_legacy_source_legacy_source_legacy_id_idx" ON "learning_videos" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "learning_videos_legacy_source_legacy_source_content_hash_idx" ON "learning_videos" USING btree ("legacy_source_content_hash");
  CREATE INDEX "learning_videos_updated_at_idx" ON "learning_videos" USING btree ("updated_at");
  CREATE INDEX "learning_videos_created_at_idx" ON "learning_videos" USING btree ("created_at");
  CREATE INDEX "learning_videos__status_idx" ON "learning_videos" USING btree ("_status");
  CREATE INDEX "learning_videos_rels_order_idx" ON "learning_videos_rels" USING btree ("order");
  CREATE INDEX "learning_videos_rels_parent_idx" ON "learning_videos_rels" USING btree ("parent_id");
  CREATE INDEX "learning_videos_rels_path_idx" ON "learning_videos_rels" USING btree ("path");
  CREATE INDEX "learning_videos_rels_learning_video_categories_id_idx" ON "learning_videos_rels" USING btree ("learning_video_categories_id");
  CREATE INDEX "learning_videos_rels_regions_id_idx" ON "learning_videos_rels" USING btree ("regions_id");
  CREATE INDEX "_learning_videos_v_blocks_trayport_hero_actions_order_idx" ON "_learning_videos_v_blocks_trayport_hero_actions" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_trayport_hero_actions_parent_id_idx" ON "_learning_videos_v_blocks_trayport_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_trayport_hero_order_idx" ON "_learning_videos_v_blocks_trayport_hero" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_trayport_hero_parent_id_idx" ON "_learning_videos_v_blocks_trayport_hero" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_trayport_hero_path_idx" ON "_learning_videos_v_blocks_trayport_hero" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_trayport_hero_media_idx" ON "_learning_videos_v_blocks_trayport_hero" USING btree ("media_id");
  CREATE INDEX "_learning_videos_v_blocks_heading_order_idx" ON "_learning_videos_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_heading_parent_id_idx" ON "_learning_videos_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_heading_path_idx" ON "_learning_videos_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_rich_text_order_idx" ON "_learning_videos_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_rich_text_parent_id_idx" ON "_learning_videos_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_rich_text_path_idx" ON "_learning_videos_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_actions_actions_order_idx" ON "_learning_videos_v_blocks_actions_actions" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_actions_actions_parent_id_idx" ON "_learning_videos_v_blocks_actions_actions" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_actions_order_idx" ON "_learning_videos_v_blocks_actions" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_actions_parent_id_idx" ON "_learning_videos_v_blocks_actions" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_actions_path_idx" ON "_learning_videos_v_blocks_actions" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_media_order_idx" ON "_learning_videos_v_blocks_media" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_media_parent_id_idx" ON "_learning_videos_v_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_media_path_idx" ON "_learning_videos_v_blocks_media" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_media_media_idx" ON "_learning_videos_v_blocks_media" USING btree ("media_id");
  CREATE INDEX "_learning_videos_v_blocks_feature_list_items_order_idx" ON "_learning_videos_v_blocks_feature_list_items" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_feature_list_items_parent_id_idx" ON "_learning_videos_v_blocks_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_feature_list_items_media_idx" ON "_learning_videos_v_blocks_feature_list_items" USING btree ("media_id");
  CREATE INDEX "_learning_videos_v_blocks_feature_list_order_idx" ON "_learning_videos_v_blocks_feature_list" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_feature_list_parent_id_idx" ON "_learning_videos_v_blocks_feature_list" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_feature_list_path_idx" ON "_learning_videos_v_blocks_feature_list" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_statistics_items_order_idx" ON "_learning_videos_v_blocks_statistics_items" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_statistics_items_parent_id_idx" ON "_learning_videos_v_blocks_statistics_items" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_statistics_order_idx" ON "_learning_videos_v_blocks_statistics" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_statistics_parent_id_idx" ON "_learning_videos_v_blocks_statistics" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_statistics_path_idx" ON "_learning_videos_v_blocks_statistics" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_faq_items_order_idx" ON "_learning_videos_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_faq_items_parent_id_idx" ON "_learning_videos_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_faq_order_idx" ON "_learning_videos_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_faq_parent_id_idx" ON "_learning_videos_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_faq_path_idx" ON "_learning_videos_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_entity_list_items_order_idx" ON "_learning_videos_v_blocks_entity_list_items" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_entity_list_items_parent_id_idx" ON "_learning_videos_v_blocks_entity_list_items" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_entity_list_items_media_idx" ON "_learning_videos_v_blocks_entity_list_items" USING btree ("media_id");
  CREATE INDEX "_learning_videos_v_blocks_entity_list_order_idx" ON "_learning_videos_v_blocks_entity_list" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_entity_list_parent_id_idx" ON "_learning_videos_v_blocks_entity_list" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_entity_list_path_idx" ON "_learning_videos_v_blocks_entity_list" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_timeline_items_order_idx" ON "_learning_videos_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_timeline_items_parent_id_idx" ON "_learning_videos_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_timeline_order_idx" ON "_learning_videos_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_timeline_parent_id_idx" ON "_learning_videos_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_timeline_path_idx" ON "_learning_videos_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_data_table_headers_order_idx" ON "_learning_videos_v_blocks_data_table_headers" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_data_table_headers_parent_id_idx" ON "_learning_videos_v_blocks_data_table_headers" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_data_table_rows_cells_order_idx" ON "_learning_videos_v_blocks_data_table_rows_cells" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_data_table_rows_cells_parent_id_idx" ON "_learning_videos_v_blocks_data_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_data_table_rows_order_idx" ON "_learning_videos_v_blocks_data_table_rows" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_data_table_rows_parent_id_idx" ON "_learning_videos_v_blocks_data_table_rows" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_data_table_order_idx" ON "_learning_videos_v_blocks_data_table" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_data_table_parent_id_idx" ON "_learning_videos_v_blocks_data_table" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_data_table_path_idx" ON "_learning_videos_v_blocks_data_table" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_gallery_items_order_idx" ON "_learning_videos_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_gallery_items_parent_id_idx" ON "_learning_videos_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_gallery_items_media_idx" ON "_learning_videos_v_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "_learning_videos_v_blocks_gallery_order_idx" ON "_learning_videos_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_gallery_parent_id_idx" ON "_learning_videos_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_gallery_path_idx" ON "_learning_videos_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_divider_order_idx" ON "_learning_videos_v_blocks_divider" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_divider_parent_id_idx" ON "_learning_videos_v_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_divider_path_idx" ON "_learning_videos_v_blocks_divider" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_market_coverage_actions_order_idx" ON "_learning_videos_v_blocks_market_coverage_actions" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_market_coverage_actions_parent_id_idx" ON "_learning_videos_v_blocks_market_coverage_actions" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_market_coverage_order_idx" ON "_learning_videos_v_blocks_market_coverage" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_market_coverage_parent_id_idx" ON "_learning_videos_v_blocks_market_coverage" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_market_coverage_path_idx" ON "_learning_videos_v_blocks_market_coverage" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_embed_order_idx" ON "_learning_videos_v_blocks_embed" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_embed_parent_id_idx" ON "_learning_videos_v_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_embed_path_idx" ON "_learning_videos_v_blocks_embed" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_embed_poster_idx" ON "_learning_videos_v_blocks_embed" USING btree ("poster_id");
  CREATE INDEX "_learning_videos_v_blocks_data_chart_order_idx" ON "_learning_videos_v_blocks_data_chart" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_data_chart_parent_id_idx" ON "_learning_videos_v_blocks_data_chart" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_data_chart_path_idx" ON "_learning_videos_v_blocks_data_chart" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_content_section_columns_order_idx" ON "_learning_videos_v_blocks_content_section_columns" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_content_section_columns_parent_id_idx" ON "_learning_videos_v_blocks_content_section_columns" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_content_section_order_idx" ON "_learning_videos_v_blocks_content_section" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_content_section_parent_id_idx" ON "_learning_videos_v_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_content_section_path_idx" ON "_learning_videos_v_blocks_content_section" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_article_listing_order_idx" ON "_learning_videos_v_blocks_article_listing" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_article_listing_parent_id_idx" ON "_learning_videos_v_blocks_article_listing" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_article_listing_path_idx" ON "_learning_videos_v_blocks_article_listing" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_parent_idx" ON "_learning_videos_v" USING btree ("parent_id");
  CREATE INDEX "_learning_videos_v_version_version_title_idx" ON "_learning_videos_v" USING btree ("version_title");
  CREATE INDEX "_learning_videos_v_version_version_video_idx" ON "_learning_videos_v" USING btree ("version_video_id");
  CREATE INDEX "_learning_videos_v_version_meta_version_meta_image_idx" ON "_learning_videos_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_learning_videos_v_version_version_slug_idx" ON "_learning_videos_v" USING btree ("version_slug");
  CREATE INDEX "_learning_videos_v_version_version_path_idx" ON "_learning_videos_v" USING btree ("version_path");
  CREATE INDEX "_learning_videos_v_version_legacy_source_version_legacy__idx" ON "_learning_videos_v" USING btree ("version_legacy_source_key");
  CREATE INDEX "_learning_videos_v_version_legacy_source_version_legac_1_idx" ON "_learning_videos_v" USING btree ("version_legacy_source_source");
  CREATE INDEX "_learning_videos_v_version_legacy_source_version_legac_2_idx" ON "_learning_videos_v" USING btree ("version_legacy_source_legacy_id");
  CREATE INDEX "_learning_videos_v_version_legacy_source_version_legac_3_idx" ON "_learning_videos_v" USING btree ("version_legacy_source_content_hash");
  CREATE INDEX "_learning_videos_v_version_version_updated_at_idx" ON "_learning_videos_v" USING btree ("version_updated_at");
  CREATE INDEX "_learning_videos_v_version_version_created_at_idx" ON "_learning_videos_v" USING btree ("version_created_at");
  CREATE INDEX "_learning_videos_v_version_version__status_idx" ON "_learning_videos_v" USING btree ("version__status");
  CREATE INDEX "_learning_videos_v_created_at_idx" ON "_learning_videos_v" USING btree ("created_at");
  CREATE INDEX "_learning_videos_v_updated_at_idx" ON "_learning_videos_v" USING btree ("updated_at");
  CREATE INDEX "_learning_videos_v_latest_idx" ON "_learning_videos_v" USING btree ("latest");
  CREATE INDEX "_learning_videos_v_autosave_idx" ON "_learning_videos_v" USING btree ("autosave");
  CREATE INDEX "_learning_videos_v_rels_order_idx" ON "_learning_videos_v_rels" USING btree ("order");
  CREATE INDEX "_learning_videos_v_rels_parent_idx" ON "_learning_videos_v_rels" USING btree ("parent_id");
  CREATE INDEX "_learning_videos_v_rels_path_idx" ON "_learning_videos_v_rels" USING btree ("path");
  CREATE INDEX "_learning_videos_v_rels_learning_video_categories_id_idx" ON "_learning_videos_v_rels" USING btree ("learning_video_categories_id");
  CREATE INDEX "_learning_videos_v_rels_regions_id_idx" ON "_learning_videos_v_rels" USING btree ("regions_id");
  CREATE INDEX "learning_video_categories_title_idx" ON "learning_video_categories" USING btree ("title");
  CREATE INDEX "learning_video_categories_display_order_idx" ON "learning_video_categories" USING btree ("display_order");
  CREATE INDEX "learning_video_categories_slug_idx" ON "learning_video_categories" USING btree ("slug");
  CREATE UNIQUE INDEX "learning_video_categories_legacy_source_legacy_source_ke_idx" ON "learning_video_categories" USING btree ("legacy_source_key");
  CREATE INDEX "learning_video_categories_legacy_source_legacy_source_so_idx" ON "learning_video_categories" USING btree ("legacy_source_source");
  CREATE INDEX "learning_video_categories_legacy_source_legacy_source_le_idx" ON "learning_video_categories" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "learning_video_categories_legacy_source_legacy_source_co_idx" ON "learning_video_categories" USING btree ("legacy_source_content_hash");
  CREATE INDEX "learning_video_categories_updated_at_idx" ON "learning_video_categories" USING btree ("updated_at");
  CREATE INDEX "learning_video_categories_created_at_idx" ON "learning_video_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "route_registry_path_idx" ON "route_registry" USING btree ("path");
  CREATE INDEX "route_registry_owner_kind_idx" ON "route_registry" USING btree ("owner_kind");
  CREATE INDEX "route_registry_owner_collection_idx" ON "route_registry" USING btree ("owner_collection");
  CREATE INDEX "route_registry_owner_document_id_idx" ON "route_registry" USING btree ("owner_document_id");
  CREATE INDEX "route_registry_archetype_idx" ON "route_registry" USING btree ("archetype");
  CREATE INDEX "route_registry_state_idx" ON "route_registry" USING btree ("state");
  CREATE UNIQUE INDEX "route_registry_claim_key_idx" ON "route_registry" USING btree ("claim_key");
  CREATE INDEX "route_registry_updated_at_idx" ON "route_registry" USING btree ("updated_at");
  CREATE INDEX "route_registry_created_at_idx" ON "route_registry" USING btree ("created_at");
  CREATE INDEX "route_indexes_venue_index_meta_venue_index_meta_image_idx" ON "route_indexes" USING btree ("venue_index_meta_image_id");
  CREATE INDEX "route_indexes_market_coverage_index_meta_market_coverage_idx" ON "route_indexes" USING btree ("market_coverage_index_meta_image_id");
  CREATE INDEX "route_indexes__status_idx" ON "route_indexes" USING btree ("_status");
  CREATE INDEX "_route_indexes_v_version_venue_index_meta_version_venue__idx" ON "_route_indexes_v" USING btree ("version_venue_index_meta_image_id");
  CREATE INDEX "_route_indexes_v_version_market_coverage_index_meta_vers_idx" ON "_route_indexes_v" USING btree ("version_market_coverage_index_meta_image_id");
  CREATE INDEX "_route_indexes_v_version_version__status_idx" ON "_route_indexes_v" USING btree ("version__status");
  CREATE INDEX "_route_indexes_v_created_at_idx" ON "_route_indexes_v" USING btree ("created_at");
  CREATE INDEX "_route_indexes_v_updated_at_idx" ON "_route_indexes_v" USING btree ("updated_at");
  CREATE INDEX "_route_indexes_v_latest_idx" ON "_route_indexes_v" USING btree ("latest");
  CREATE INDEX "_route_indexes_v_autosave_idx" ON "_route_indexes_v" USING btree ("autosave");
  ALTER TABLE "venues" ADD CONSTRAINT "venues_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v" ADD CONSTRAINT "_venues_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_learning_video_categories_fk" FOREIGN KEY ("learning_video_categories_id") REFERENCES "public"."learning_video_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_route_registry_fk" FOREIGN KEY ("route_registry_id") REFERENCES "public"."route_registry"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "venues_path_idx" ON "venues" USING btree ("path");
  CREATE INDEX "venues_meta_meta_image_idx" ON "venues" USING btree ("meta_image_id");
  CREATE INDEX "_venues_v_version_version_path_idx" ON "_venues_v" USING btree ("version_path");
  CREATE INDEX "_venues_v_version_meta_version_meta_image_idx" ON "_venues_v" USING btree ("version_meta_image_id");
  CREATE INDEX "redirects_rels_venues_id_idx" ON "redirects_rels" USING btree ("venues_id");
  CREATE INDEX "redirects_rels_learning_videos_id_idx" ON "redirects_rels" USING btree ("learning_videos_id");
  CREATE INDEX "payload_locked_documents_rels_learning_videos_id_idx" ON "payload_locked_documents_rels" USING btree ("learning_videos_id");
  CREATE INDEX "payload_locked_documents_rels_learning_video_categories__idx" ON "payload_locked_documents_rels" USING btree ("learning_video_categories_id");
  CREATE INDEX "payload_locked_documents_rels_route_registry_id_idx" ON "payload_locked_documents_rels" USING btree ("route_registry_id");

  CREATE OR REPLACE FUNCTION pg_temp.foundation_is_canonical_path(candidate text)
  RETURNS boolean
  LANGUAGE sql
  IMMUTABLE
  PARALLEL SAFE
  AS $function$
    SELECT
      candidate IS NOT NULL
      AND candidate ~ '^/([^/?#]+/)*$'
      AND candidate !~* '^/+[a-z][a-z0-9+.-]*:/'
      AND candidate !~ '[[:space:][:cntrl:]]'
      AND strpos(candidate, chr(92)) = 0
      AND strpos(candidate, '%') = 0
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(ARRAY[
          160, 5760, 8192, 8193, 8194, 8195, 8196, 8197,
          8198, 8199, 8200, 8201, 8202, 8232, 8233, 8239,
          8287, 12288, 65279
        ]) AS whitespace(codepoint)
        WHERE strpos(candidate, chr(whitespace.codepoint)) > 0
      )
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(string_to_array(trim(both '/' from candidate), '/')) AS segment(value)
        WHERE segment.value IN ('.', '..')
      )
  $function$;

  -- Refuse to seed the registry from aliases that runtime validation would
  -- reject, or from a namespace that is already ambiguous. The migration does
  -- not guess at normalization because doing so could change ownership.
  DO $$
  DECLARE
    duplicate_paths text;
    invalid_paths text;
    pending_draft_routes text;
  BEGIN
    WITH pending AS (
      SELECT
        'pages:' || pages."id"::text AS owner,
        pages."path" AS live_path,
        versions."version_path" AS draft_path
      FROM "pages" AS pages
      INNER JOIN "_pages_v" AS versions ON versions."parent_id" = pages."id"
      WHERE
        pages."_status"::text = 'published'
        AND versions."latest" IS TRUE
        AND versions."version__status"::text = 'draft'
        AND (
          versions."version_path" IS DISTINCT FROM pages."path"
          OR versions."version_page_type"::text IS DISTINCT FROM pages."page_type"::text
        )
      UNION ALL
      SELECT
        'articles:' || articles."id"::text,
        articles."path",
        versions."version_path"
      FROM "articles" AS articles
      INNER JOIN "_articles_v" AS versions ON versions."parent_id" = articles."id"
      WHERE
        articles."_status"::text = 'published'
        AND versions."latest" IS TRUE
        AND versions."version__status"::text = 'draft'
        AND (
          versions."version_path" IS DISTINCT FROM articles."path"
          OR versions."version_content_mode"::text IS DISTINCT FROM articles."content_mode"::text
        )
      UNION ALL
      SELECT
        'hubs:' || hubs."id"::text,
        hubs."path",
        versions."version_path"
      FROM "hubs" AS hubs
      INNER JOIN "_hubs_v" AS versions ON versions."parent_id" = hubs."id"
      WHERE
        hubs."_status"::text = 'published'
        AND versions."latest" IS TRUE
        AND versions."version__status"::text = 'draft'
        AND (
          versions."version_path" IS DISTINCT FROM hubs."path"
          OR versions."version_content_mode"::text IS DISTINCT FROM hubs."content_mode"::text
        )
    )
    SELECT string_agg(
      format('%s live=%L draft=%L', owner, live_path, draft_path),
      '; ' ORDER BY owner
    )
    INTO pending_draft_routes
    FROM pending;

    IF pending_draft_routes IS NOT NULL THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe route-registry backfill: published documents have pending route-changing drafts.',
        DETAIL = pending_draft_routes,
        HINT = 'Publish or discard each listed route-changing draft before retrying this migration.';
    END IF;

    WITH candidates AS (
      SELECT 'pages:' || "id"::text AS owner, "path" FROM "pages" WHERE "path" IS NOT NULL
      UNION ALL
      SELECT 'articles:' || "id"::text, "path" FROM "articles" WHERE "path" IS NOT NULL
      UNION ALL
      SELECT 'hubs:' || "id"::text, "path" FROM "hubs" WHERE "path" IS NOT NULL
      UNION ALL
      SELECT 'redirects:' || "id"::text, "from" FROM "redirects"
      UNION ALL
      SELECT 'system:venue-index', '/venue/'
      UNION ALL
      SELECT 'system:market-coverage-index', '/market-coverage/'
    )
    SELECT string_agg(
      format('%s=%L', owner, "path"),
      '; ' ORDER BY owner
    )
    INTO invalid_paths
    FROM candidates
    WHERE NOT pg_temp.foundation_is_canonical_path("path");

    IF invalid_paths IS NOT NULL THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe route-registry backfill: one or more legacy paths are not canonical.',
        DETAIL = invalid_paths,
        HINT = 'Normalize the listed source paths with the application path policy before retrying this migration.';
    END IF;

    WITH candidates AS (
      SELECT 'pages:' || "id"::text AS owner, "path" FROM "pages" WHERE "path" IS NOT NULL
      UNION ALL
      SELECT 'articles:' || "id"::text, "path" FROM "articles"
        WHERE "content_mode" = 'full' AND "path" IS NOT NULL
      UNION ALL
      SELECT 'hubs:' || "id"::text, "path" FROM "hubs"
        WHERE "content_mode" = 'page' AND "path" IS NOT NULL
      UNION ALL
      SELECT 'redirects:' || "id"::text, "from" FROM "redirects"
      UNION ALL
      SELECT 'system:venue-index', '/venue/'
      UNION ALL
      SELECT 'system:market-coverage-index', '/market-coverage/'
    ),
    collisions AS (
      SELECT
        "path",
        string_agg(owner, ', ' ORDER BY owner) AS owners
      FROM candidates
      GROUP BY "path"
      HAVING count(*) > 1
    )
    SELECT string_agg(
      format('%L claimed by %s', "path", owners),
      '; ' ORDER BY "path"
    )
    INTO duplicate_paths
    FROM collisions;

    IF duplicate_paths IS NOT NULL THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe route-registry backfill: multiple owners claim the same canonical path.',
        DETAIL = duplicate_paths,
        HINT = 'Resolve every listed path owner before retrying this migration.';
    END IF;
  END
  $$;

  -- Normalize the existing PoC before any route claims are created. The 38
  -- listing-only Insights records have metadata but no authored body, so their
  -- former internal URL becomes an explicit live-site destination instead of
  -- an empty local detail route.
  UPDATE "pages"
  SET "page_type" = 'homepage'
  WHERE "path" = '/';

  UPDATE "_pages_v"
  SET "version_page_type" = 'homepage'
  WHERE "version_path" = '/';

  UPDATE "articles"
  SET
    "external_destination" = 'https://trayport.com' || "path",
    "path" = NULL
  WHERE "content_mode" = 'listing' AND "path" IS NOT NULL;

  UPDATE "_articles_v"
  SET
    "version_external_destination" = 'https://trayport.com' || "version_path",
    "version_path" = NULL
  WHERE "version_content_mode" = 'listing' AND "version_path" IS NOT NULL;

  -- The index configuration is a real published global, while its two paths
  -- remain immutable system-owned registry claims.
  INSERT INTO "route_indexes" ("_status", "updated_at", "created_at")
  VALUES ('published', now(), now());

  INSERT INTO "route_registry" (
    "path",
    "owner_kind",
    "owner_collection",
    "owner_document_id",
    "archetype",
    "state",
    "claim_key",
    "provenance_source",
    "provenance_legacy_id",
    "provenance_original_path",
    "provenance_note",
    "updated_at",
    "created_at"
  )
  SELECT
    "path",
    'content',
    'pages',
    "id"::text,
    CASE "page_type"
      WHEN 'homepage' THEN 'page.homepage'
      WHEN 'product' THEN 'page.product'
      WHEN 'landing' THEN 'page.landing'
      WHEN 'legal' THEN 'page.legal'
      WHEN 'conversion' THEN 'page.conversion'
      WHEN 'interactive' THEN 'page.interactive-market-matrix'
      WHEN 'index' THEN 'page.content-index'
      ELSE 'page.standard'
    END::"enum_route_registry_archetype",
    CASE WHEN "_status" = 'published' THEN 'published' ELSE 'reserved' END::"enum_route_registry_state",
    'content:pages:' || "id"::text || ':' ||
      CASE WHEN "_status" = 'published' THEN 'published' ELSE 'reserved' END,
    CASE WHEN "legacy_source_source" = 'wordpress' THEN 'wordpress' ELSE 'native' END::"enum_route_registry_provenance_source",
    "legacy_source_legacy_id",
    regexp_replace(coalesce("legacy_source_original_url", ''), '^https?://[^/]+', ''),
    'Backfilled by routable content foundation migration.',
    now(),
    now()
  FROM "pages"
  WHERE "path" IS NOT NULL;

  INSERT INTO "route_registry" (
    "path",
    "owner_kind",
    "owner_collection",
    "owner_document_id",
    "archetype",
    "state",
    "claim_key",
    "provenance_source",
    "provenance_legacy_id",
    "provenance_original_path",
    "provenance_note",
    "updated_at",
    "created_at"
  )
  SELECT
    "path",
    'content',
    'articles',
    "id"::text,
    'article.full',
    CASE WHEN "_status" = 'published' THEN 'published' ELSE 'reserved' END::"enum_route_registry_state",
    'content:articles:' || "id"::text || ':' ||
      CASE WHEN "_status" = 'published' THEN 'published' ELSE 'reserved' END,
    CASE WHEN "legacy_source_source" = 'wordpress' THEN 'wordpress' ELSE 'native' END::"enum_route_registry_provenance_source",
    "legacy_source_legacy_id",
    regexp_replace(coalesce("legacy_source_original_url", ''), '^https?://[^/]+', ''),
    'Backfilled by routable content foundation migration.',
    now(),
    now()
  FROM "articles"
  WHERE "content_mode" = 'full' AND "path" IS NOT NULL;

  INSERT INTO "route_registry" (
    "path",
    "owner_kind",
    "owner_collection",
    "owner_document_id",
    "archetype",
    "state",
    "claim_key",
    "provenance_source",
    "provenance_legacy_id",
    "provenance_original_path",
    "provenance_note",
    "updated_at",
    "created_at"
  )
  SELECT
    "path",
    'content',
    'hubs',
    "id"::text,
    'hub.public-page',
    CASE WHEN "_status" = 'published' THEN 'published' ELSE 'reserved' END::"enum_route_registry_state",
    'content:hubs:' || "id"::text || ':' ||
      CASE WHEN "_status" = 'published' THEN 'published' ELSE 'reserved' END,
    CASE WHEN "legacy_source_source" = 'wordpress' THEN 'wordpress' ELSE 'native' END::"enum_route_registry_provenance_source",
    "legacy_source_legacy_id",
    regexp_replace(coalesce("legacy_source_original_url", ''), '^https?://[^/]+', ''),
    'Backfilled by routable content foundation migration.',
    now(),
    now()
  FROM "hubs"
  WHERE "content_mode" = 'page' AND "path" IS NOT NULL;

  INSERT INTO "route_registry" (
    "path",
    "owner_kind",
    "owner_collection",
    "owner_document_id",
    "archetype",
    "state",
    "claim_key",
    "provenance_source",
    "provenance_legacy_id",
    "provenance_original_path",
    "provenance_note",
    "updated_at",
    "created_at"
  )
  SELECT
    "path",
    'content',
    'venues',
    "id"::text,
    'venue.public-detail',
    CASE WHEN "_status" = 'published' THEN 'published' ELSE 'reserved' END::"enum_route_registry_state",
    'content:venues:' || "id"::text || ':' ||
      CASE WHEN "_status" = 'published' THEN 'published' ELSE 'reserved' END,
    CASE WHEN "legacy_source_source" = 'wordpress' THEN 'wordpress' ELSE 'native' END::"enum_route_registry_provenance_source",
    "legacy_source_legacy_id",
    regexp_replace(coalesce("legacy_source_original_url", ''), '^https?://[^/]+', ''),
    'Backfilled by routable content foundation migration.',
    now(),
    now()
  FROM "venues"
  WHERE "content_mode" = 'page' AND "path" IS NOT NULL;

  INSERT INTO "route_registry" (
    "path",
    "owner_kind",
    "owner_collection",
    "owner_document_id",
    "archetype",
    "state",
    "claim_key",
    "provenance_source",
    "provenance_legacy_id",
    "provenance_original_path",
    "provenance_note",
    "updated_at",
    "created_at"
  )
  SELECT
    "path",
    'content',
    'learning-videos',
    "id"::text,
    'learning-video.public-detail',
    CASE WHEN "_status" = 'published' THEN 'published' ELSE 'reserved' END::"enum_route_registry_state",
    'content:learning-videos:' || "id"::text || ':' ||
      CASE WHEN "_status" = 'published' THEN 'published' ELSE 'reserved' END,
    CASE WHEN "legacy_source_source" = 'wordpress' THEN 'wordpress' ELSE 'native' END::"enum_route_registry_provenance_source",
    "legacy_source_legacy_id",
    regexp_replace(coalesce("legacy_source_original_url", ''), '^https?://[^/]+', ''),
    'Backfilled by routable content foundation migration.',
    now(),
    now()
  FROM "learning_videos"
  WHERE "path" IS NOT NULL;

  INSERT INTO "route_registry" (
    "path",
    "owner_kind",
    "owner_collection",
    "owner_document_id",
    "archetype",
    "state",
    "claim_key",
    "provenance_source",
    "provenance_note",
    "updated_at",
    "created_at"
  )
  VALUES
    (
      '/venue/',
      'virtual',
      'system',
      'venue-index',
      'index.venue',
      'published',
      'virtual:system:venue-index:published',
      'system',
      'Approved production virtual index route.',
      now(),
      now()
    ),
    (
      '/market-coverage/',
      'virtual',
      'system',
      'market-coverage-index',
      'index.market-coverage',
      'published',
      'virtual:system:market-coverage-index:published',
      'system',
      'Approved production virtual index route.',
      now(),
      now()
    );

  INSERT INTO "route_registry" (
    "path",
    "owner_kind",
    "owner_collection",
    "owner_document_id",
    "archetype",
    "state",
    "claim_key",
    "provenance_source",
    "provenance_note",
    "updated_at",
    "created_at"
  )
  SELECT
    "from",
    'redirect',
    'redirects',
    "id"::text,
    'redirect',
    'published',
    'redirect:redirects:' || "id"::text || ':published',
    'plugin',
    'Backfilled managed redirect.',
    now(),
    now()
  FROM "redirects";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  -- Lock parent resources before their version/relation/block tables, matching
  -- the application write direction and avoiding parent/child lock inversion.
  LOCK TABLE
    "pages",
    "articles",
    "hubs",
    "venues",
    "learning_videos",
    "learning_video_categories",
    "redirects",
    "route_indexes",
    "payload_locked_documents"
  IN SHARE ROW EXCLUSIVE MODE;

  -- Acquire every remaining write-blocking lock before inspecting rollback
  -- safety. The dynamic portion covers all nested venue/video block tables so
  -- no content can arrive between a guard query and its destructive DDL.
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
        "tablename" IN (
          '_articles_v',
          '_hubs_v',
          '_pages_v',
          '_route_indexes_v',
          '_venues_v',
          'payload_locked_documents_rels',
          'redirects_rels'
        )
        OR "tablename" ~ '^_learning_videos_v(_|$)'
        OR "tablename" ~ '^learning_videos_'
        OR "tablename" ~ '^(_venues_v_blocks_|venues_blocks_)'
      );

    IF lock_targets IS NULL THEN
      RAISE EXCEPTION 'Unsafe rollback: no foundation tables were found to lock.';
    END IF;

    EXECUTE 'LOCK TABLE ' || lock_targets || ' IN SHARE ROW EXCLUSIVE MODE';
  END
  $locks$;

  -- Route hooks write owner/layout rows before synchronizing their registry
  -- claim. Lock the registry last to preserve that application lock order.
  LOCK TABLE "route_registry" IN SHARE ROW EXCLUSIVE MODE;

  CREATE OR REPLACE FUNCTION pg_temp.foundation_is_canonical_path(candidate text)
  RETURNS boolean
  LANGUAGE sql
  IMMUTABLE
  PARALLEL SAFE
  AS $function$
    SELECT
      candidate IS NOT NULL
      AND candidate ~ '^/([^/?#]+/)*$'
      AND candidate !~* '^/+[a-z][a-z0-9+.-]*:/'
      AND candidate !~ '[[:space:][:cntrl:]]'
      AND strpos(candidate, chr(92)) = 0
      AND strpos(candidate, '%') = 0
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(ARRAY[
          160, 5760, 8192, 8193, 8194, 8195, 8196, 8197,
          8198, 8199, 8200, 8201, 8202, 8232, 8233, 8239,
          8287, 12288, 65279
        ]) AS whitespace(codepoint)
        WHERE strpos(candidate, chr(whitespace.codepoint)) > 0
      )
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(string_to_array(trim(both '/' from candidate), '/')) AS segment(value)
        WHERE segment.value IN ('.', '..')
      )
  $function$;

  CREATE OR REPLACE FUNCTION pg_temp.foundation_restored_article_path(candidate text)
  RETURNS text
  LANGUAGE sql
  IMMUTABLE
  PARALLEL SAFE
  AS $function$
    SELECT CASE
      WHEN
        candidate IS NOT NULL
        AND candidate ~* '^https?://(www[.])?trayport[.]com/'
        AND pg_temp.foundation_is_canonical_path(
          regexp_replace(candidate, '^https?://(www[.])?trayport[.]com', '', 'i')
        )
      THEN regexp_replace(
        candidate,
        '^https?://(www[.])?trayport[.]com',
        '',
        'i'
      )
      ELSE NULL
    END
  $function$;

  -- This rollback removes whole content models and fields. It is safe only
  -- while they still contain the exact seed/default state created by the up migration.
  -- Once editors or importers use the foundation, recovery must restore the
  -- verified pre-migration backup alongside the prior application release.
  DO $$
  DECLARE
    article_path_collisions text;
    destructive_table record;
    table_has_rows boolean;
    rollback_hint constant text :=
      'Restore the verified pre-foundation database backup with the prior application release. Do not force this migration down.';
  BEGIN
    IF EXISTS (
      SELECT 1 FROM "learning_videos"
      UNION ALL
      SELECT 1 FROM "_learning_videos_v"
      UNION ALL
      SELECT 1 FROM "learning_video_categories"
    ) THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe rollback: learning-video or learning-category content would be deleted.',
        HINT = rollback_hint;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM "pages"
      WHERE
        "page_type"::text IN ('legal', 'conversion', 'interactive')
        OR ("page_type"::text = 'homepage' AND "path" IS DISTINCT FROM '/')
      UNION ALL
      SELECT 1
      FROM "_pages_v"
      WHERE
        "version_page_type"::text IN ('legal', 'conversion', 'interactive')
        OR (
          "version_page_type"::text = 'homepage'
          AND "version_path" IS DISTINCT FROM '/'
        )
    ) THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe rollback: a page uses a foundation-only archetype that would be collapsed to standard.',
        HINT = rollback_hint;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM "articles"
      WHERE
        (
          "content_mode" = 'listing'
          AND "path" IS NULL
          AND pg_temp.foundation_restored_article_path("external_destination") IS NULL
        )
        OR (
          "external_destination" IS NOT NULL
          AND NOT (
            "content_mode" = 'listing'
            AND "path" IS NULL
            AND pg_temp.foundation_restored_article_path("external_destination") IS NOT NULL
          )
        )
      UNION ALL
      SELECT 1
      FROM "_articles_v"
      WHERE
        (
          "version_content_mode" = 'listing'
          AND "version_path" IS NULL
          AND pg_temp.foundation_restored_article_path("version_external_destination") IS NULL
        )
        OR (
          "version_external_destination" IS NOT NULL
          AND NOT (
            "version_content_mode" = 'listing'
            AND "version_path" IS NULL
            AND pg_temp.foundation_restored_article_path("version_external_destination") IS NOT NULL
          )
        )
    ) THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe rollback: an article external destination cannot be losslessly restored to the former path field.',
        HINT = rollback_hint;
    END IF;

    WITH candidate_paths AS (
      SELECT 'articles:' || "id"::text AS owner, "path"
      FROM "articles"
      WHERE "path" IS NOT NULL
      UNION ALL
      SELECT
        'articles:' || "id"::text,
        pg_temp.foundation_restored_article_path("external_destination")
      FROM "articles"
      WHERE
        "content_mode" = 'listing'
        AND "path" IS NULL
        AND pg_temp.foundation_restored_article_path("external_destination") IS NOT NULL
    ),
    collisions AS (
      SELECT
        "path",
        string_agg(owner, ', ' ORDER BY owner) AS owners
      FROM candidate_paths
      GROUP BY "path"
      HAVING count(*) > 1
    )
    SELECT string_agg(
      format('%L claimed by %s', "path", owners),
      '; ' ORDER BY "path"
    )
    INTO article_path_collisions
    FROM collisions;

    IF article_path_collisions IS NOT NULL THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe rollback: restored article paths would violate the former unique route namespace.',
        DETAIL = article_path_collisions,
        HINT = rollback_hint;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM "venues"
      WHERE
        "content_mode" = 'page'
        OR "path" IS NOT NULL
        OR "published_at" IS NOT NULL
        OR "meta_title" IS NOT NULL
        OR "meta_description" IS NOT NULL
        OR "meta_image_id" IS NOT NULL
        OR "meta_canonical_u_r_l" IS NOT NULL
        OR "meta_no_index" IS DISTINCT FROM false
        OR "meta_no_follow" IS DISTINCT FROM false
        OR "meta_structured_data" IS NOT NULL
      UNION ALL
      SELECT 1
      FROM "_venues_v"
      WHERE
        "version_content_mode" = 'page'
        OR "version_path" IS NOT NULL
        OR "version_published_at" IS NOT NULL
        OR "version_meta_title" IS NOT NULL
        OR "version_meta_description" IS NOT NULL
        OR "version_meta_image_id" IS NOT NULL
        OR "version_meta_canonical_u_r_l" IS NOT NULL
        OR "version_meta_no_index" IS DISTINCT FROM false
        OR "version_meta_no_follow" IS DISTINCT FROM false
        OR "version_meta_structured_data" IS NOT NULL
    ) THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe rollback: public venue route or SEO content would be deleted.',
        HINT = rollback_hint;
    END IF;

    FOR destructive_table IN
      SELECT "schemaname", "tablename"
      FROM "pg_catalog"."pg_tables"
      WHERE
        "schemaname" = current_schema()
        AND "tablename" ~ '^(venues_blocks_|_venues_v_blocks_)'
    LOOP
      EXECUTE format(
        'SELECT EXISTS (SELECT 1 FROM %I.%I LIMIT 1)',
        destructive_table.schemaname,
        destructive_table.tablename
      )
      INTO table_has_rows;

      IF table_has_rows THEN
        RAISE EXCEPTION USING
          MESSAGE = format(
            'Unsafe rollback: venue layout content in %I.%I would be deleted.',
            destructive_table.schemaname,
            destructive_table.tablename
          ),
          HINT = rollback_hint;
      END IF;
    END LOOP;

    IF EXISTS (
      SELECT 1 FROM "redirects_rels" WHERE "venues_id" IS NOT NULL
    ) THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe rollback: a managed redirect targets a venue and would lose its destination.',
        HINT = rollback_hint;
    END IF;

    IF
      (SELECT count(*) FROM "route_indexes") <> 1
      OR EXISTS (SELECT 1 FROM "_route_indexes_v")
      OR EXISTS (
        SELECT 1
        FROM "route_indexes"
        WHERE
          "venue_index_eyebrow" IS DISTINCT FROM 'Market coverage'
          OR "venue_index_title" IS DISTINCT FROM 'Venues'
          OR "venue_index_intro" IS DISTINCT FROM
            'Explore the brokers, exchanges and clearing houses connected through Trayport.'
          OR "venue_index_meta_title" IS NOT NULL
          OR "venue_index_meta_description" IS NOT NULL
          OR "venue_index_meta_image_id" IS NOT NULL
          OR "venue_index_meta_canonical_u_r_l" IS NOT NULL
          OR "venue_index_meta_no_index" IS DISTINCT FROM false
          OR "venue_index_meta_no_follow" IS DISTINCT FROM false
          OR "venue_index_meta_structured_data" IS NOT NULL
          OR "market_coverage_index_eyebrow" IS DISTINCT FROM 'Global network'
          OR "market_coverage_index_title" IS DISTINCT FROM 'Market coverage'
          OR "market_coverage_index_intro" IS DISTINCT FROM
            'Explore the energy markets available through Trayport’s global trading network.'
          OR "market_coverage_index_meta_title" IS NOT NULL
          OR "market_coverage_index_meta_description" IS NOT NULL
          OR "market_coverage_index_meta_image_id" IS NOT NULL
          OR "market_coverage_index_meta_canonical_u_r_l" IS NOT NULL
          OR "market_coverage_index_meta_no_index" IS DISTINCT FROM false
          OR "market_coverage_index_meta_no_follow" IS DISTINCT FROM false
          OR "market_coverage_index_meta_structured_data" IS NOT NULL
          OR "_status"::text IS DISTINCT FROM 'published'
      )
    THEN
      RAISE EXCEPTION USING
        MESSAGE = 'Unsafe rollback: collection-index configuration or versions would be deleted.',
        HINT = rollback_hint;
    END IF;
  END
  $$;

   ALTER TABLE "venues_blocks_trayport_hero_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_trayport_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_actions_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_feature_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_feature_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_statistics_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_entity_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_entity_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_data_table_headers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_data_table_rows_cells" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_data_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_data_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_divider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_market_coverage_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_market_coverage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_data_chart" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_content_section_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_content_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_article_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_trayport_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_actions_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_feature_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_feature_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_statistics_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_entity_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_entity_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_data_table_headers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_data_table_rows_cells" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_data_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_data_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_divider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_market_coverage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_data_chart" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_content_section_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_content_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_article_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_trayport_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_actions_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_feature_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_feature_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_statistics_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_entity_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_entity_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_data_table_headers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_data_table_rows_cells" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_data_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_data_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_divider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_market_coverage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_data_chart" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_content_section_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_content_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_article_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_feature_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_statistics_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_entity_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_data_table_headers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_data_table_rows_cells" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_data_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_data_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_divider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_content_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_article_listing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_video_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "route_registry" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "route_indexes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_route_indexes_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "venues_blocks_trayport_hero_actions" CASCADE;
  DROP TABLE "venues_blocks_trayport_hero" CASCADE;
  DROP TABLE "venues_blocks_heading" CASCADE;
  DROP TABLE "venues_blocks_rich_text" CASCADE;
  DROP TABLE "venues_blocks_actions_actions" CASCADE;
  DROP TABLE "venues_blocks_actions" CASCADE;
  DROP TABLE "venues_blocks_media" CASCADE;
  DROP TABLE "venues_blocks_feature_list_items" CASCADE;
  DROP TABLE "venues_blocks_feature_list" CASCADE;
  DROP TABLE "venues_blocks_statistics_items" CASCADE;
  DROP TABLE "venues_blocks_statistics" CASCADE;
  DROP TABLE "venues_blocks_faq_items" CASCADE;
  DROP TABLE "venues_blocks_faq" CASCADE;
  DROP TABLE "venues_blocks_entity_list_items" CASCADE;
  DROP TABLE "venues_blocks_entity_list" CASCADE;
  DROP TABLE "venues_blocks_timeline_items" CASCADE;
  DROP TABLE "venues_blocks_timeline" CASCADE;
  DROP TABLE "venues_blocks_data_table_headers" CASCADE;
  DROP TABLE "venues_blocks_data_table_rows_cells" CASCADE;
  DROP TABLE "venues_blocks_data_table_rows" CASCADE;
  DROP TABLE "venues_blocks_data_table" CASCADE;
  DROP TABLE "venues_blocks_gallery_items" CASCADE;
  DROP TABLE "venues_blocks_gallery" CASCADE;
  DROP TABLE "venues_blocks_divider" CASCADE;
  DROP TABLE "venues_blocks_market_coverage_actions" CASCADE;
  DROP TABLE "venues_blocks_market_coverage" CASCADE;
  DROP TABLE "venues_blocks_embed" CASCADE;
  DROP TABLE "venues_blocks_data_chart" CASCADE;
  DROP TABLE "venues_blocks_content_section_columns" CASCADE;
  DROP TABLE "venues_blocks_content_section" CASCADE;
  DROP TABLE "venues_blocks_article_listing" CASCADE;
  DROP TABLE "_venues_v_blocks_trayport_hero_actions" CASCADE;
  DROP TABLE "_venues_v_blocks_trayport_hero" CASCADE;
  DROP TABLE "_venues_v_blocks_heading" CASCADE;
  DROP TABLE "_venues_v_blocks_rich_text" CASCADE;
  DROP TABLE "_venues_v_blocks_actions_actions" CASCADE;
  DROP TABLE "_venues_v_blocks_actions" CASCADE;
  DROP TABLE "_venues_v_blocks_media" CASCADE;
  DROP TABLE "_venues_v_blocks_feature_list_items" CASCADE;
  DROP TABLE "_venues_v_blocks_feature_list" CASCADE;
  DROP TABLE "_venues_v_blocks_statistics_items" CASCADE;
  DROP TABLE "_venues_v_blocks_statistics" CASCADE;
  DROP TABLE "_venues_v_blocks_faq_items" CASCADE;
  DROP TABLE "_venues_v_blocks_faq" CASCADE;
  DROP TABLE "_venues_v_blocks_entity_list_items" CASCADE;
  DROP TABLE "_venues_v_blocks_entity_list" CASCADE;
  DROP TABLE "_venues_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_venues_v_blocks_timeline" CASCADE;
  DROP TABLE "_venues_v_blocks_data_table_headers" CASCADE;
  DROP TABLE "_venues_v_blocks_data_table_rows_cells" CASCADE;
  DROP TABLE "_venues_v_blocks_data_table_rows" CASCADE;
  DROP TABLE "_venues_v_blocks_data_table" CASCADE;
  DROP TABLE "_venues_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_venues_v_blocks_gallery" CASCADE;
  DROP TABLE "_venues_v_blocks_divider" CASCADE;
  DROP TABLE "_venues_v_blocks_market_coverage_actions" CASCADE;
  DROP TABLE "_venues_v_blocks_market_coverage" CASCADE;
  DROP TABLE "_venues_v_blocks_embed" CASCADE;
  DROP TABLE "_venues_v_blocks_data_chart" CASCADE;
  DROP TABLE "_venues_v_blocks_content_section_columns" CASCADE;
  DROP TABLE "_venues_v_blocks_content_section" CASCADE;
  DROP TABLE "_venues_v_blocks_article_listing" CASCADE;
  DROP TABLE "learning_videos_blocks_trayport_hero_actions" CASCADE;
  DROP TABLE "learning_videos_blocks_trayport_hero" CASCADE;
  DROP TABLE "learning_videos_blocks_heading" CASCADE;
  DROP TABLE "learning_videos_blocks_rich_text" CASCADE;
  DROP TABLE "learning_videos_blocks_actions_actions" CASCADE;
  DROP TABLE "learning_videos_blocks_actions" CASCADE;
  DROP TABLE "learning_videos_blocks_media" CASCADE;
  DROP TABLE "learning_videos_blocks_feature_list_items" CASCADE;
  DROP TABLE "learning_videos_blocks_feature_list" CASCADE;
  DROP TABLE "learning_videos_blocks_statistics_items" CASCADE;
  DROP TABLE "learning_videos_blocks_statistics" CASCADE;
  DROP TABLE "learning_videos_blocks_faq_items" CASCADE;
  DROP TABLE "learning_videos_blocks_faq" CASCADE;
  DROP TABLE "learning_videos_blocks_entity_list_items" CASCADE;
  DROP TABLE "learning_videos_blocks_entity_list" CASCADE;
  DROP TABLE "learning_videos_blocks_timeline_items" CASCADE;
  DROP TABLE "learning_videos_blocks_timeline" CASCADE;
  DROP TABLE "learning_videos_blocks_data_table_headers" CASCADE;
  DROP TABLE "learning_videos_blocks_data_table_rows_cells" CASCADE;
  DROP TABLE "learning_videos_blocks_data_table_rows" CASCADE;
  DROP TABLE "learning_videos_blocks_data_table" CASCADE;
  DROP TABLE "learning_videos_blocks_gallery_items" CASCADE;
  DROP TABLE "learning_videos_blocks_gallery" CASCADE;
  DROP TABLE "learning_videos_blocks_divider" CASCADE;
  DROP TABLE "learning_videos_blocks_market_coverage_actions" CASCADE;
  DROP TABLE "learning_videos_blocks_market_coverage" CASCADE;
  DROP TABLE "learning_videos_blocks_embed" CASCADE;
  DROP TABLE "learning_videos_blocks_data_chart" CASCADE;
  DROP TABLE "learning_videos_blocks_content_section_columns" CASCADE;
  DROP TABLE "learning_videos_blocks_content_section" CASCADE;
  DROP TABLE "learning_videos_blocks_article_listing" CASCADE;
  DROP TABLE "learning_videos" CASCADE;
  DROP TABLE "learning_videos_rels" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_trayport_hero_actions" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_trayport_hero" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_heading" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_rich_text" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_actions_actions" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_actions" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_media" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_feature_list_items" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_feature_list" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_statistics_items" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_statistics" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_faq_items" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_faq" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_entity_list_items" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_entity_list" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_timeline" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_data_table_headers" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_data_table_rows_cells" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_data_table_rows" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_data_table" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_gallery" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_divider" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_market_coverage_actions" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_market_coverage" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_embed" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_data_chart" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_content_section_columns" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_content_section" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_article_listing" CASCADE;
  DROP TABLE "_learning_videos_v" CASCADE;
  DROP TABLE "_learning_videos_v_rels" CASCADE;
  DROP TABLE "learning_video_categories" CASCADE;
  DROP TABLE "route_registry" CASCADE;
  DROP TABLE "route_indexes" CASCADE;
  DROP TABLE "_route_indexes_v" CASCADE;
  ALTER TABLE "venues" DROP CONSTRAINT "venues_meta_image_id_media_id_fk";

  ALTER TABLE "_venues_v" DROP CONSTRAINT "_venues_v_version_meta_image_id_media_id_fk";

  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_venues_fk";

  ALTER TABLE "redirects_rels" DROP CONSTRAINT IF EXISTS "redirects_rels_learning_videos_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_learning_videos_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_learning_video_categories_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_route_registry_fk";

  UPDATE "articles"
  SET "path" = pg_temp.foundation_restored_article_path("external_destination")
  WHERE
    "content_mode" = 'listing'
    AND "path" IS NULL
    AND pg_temp.foundation_restored_article_path("external_destination") IS NOT NULL;

  UPDATE "_articles_v"
  SET "version_path" =
    pg_temp.foundation_restored_article_path("version_external_destination")
  WHERE
    "version_content_mode" = 'listing'
    AND "version_path" IS NULL
    AND pg_temp.foundation_restored_article_path("version_external_destination") IS NOT NULL;

  UPDATE "pages"
  SET "page_type" = 'standard'
  WHERE "page_type" NOT IN ('standard', 'product', 'landing', 'index');

  UPDATE "_pages_v"
  SET "version_page_type" = 'standard'
  WHERE "version_page_type" NOT IN ('standard', 'product', 'landing', 'index');

  ALTER TABLE "pages" ALTER COLUMN "page_type" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "page_type" SET DEFAULT 'standard'::text;
  DROP TYPE "public"."enum_pages_page_type";
  CREATE TYPE "public"."enum_pages_page_type" AS ENUM('standard', 'product', 'landing', 'index');
  ALTER TABLE "pages" ALTER COLUMN "page_type" SET DEFAULT 'standard'::"public"."enum_pages_page_type";
  ALTER TABLE "pages" ALTER COLUMN "page_type" SET DATA TYPE "public"."enum_pages_page_type" USING "page_type"::"public"."enum_pages_page_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_page_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_page_type" SET DEFAULT 'standard'::text;
  DROP TYPE "public"."enum__pages_v_version_page_type";
  CREATE TYPE "public"."enum__pages_v_version_page_type" AS ENUM('standard', 'product', 'landing', 'index');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_page_type" SET DEFAULT 'standard'::"public"."enum__pages_v_version_page_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_page_type" SET DATA TYPE "public"."enum__pages_v_version_page_type" USING "version_page_type"::"public"."enum__pages_v_version_page_type";
  DROP INDEX "venues_path_idx";
  DROP INDEX "venues_meta_meta_image_idx";
  DROP INDEX "_venues_v_version_version_path_idx";
  DROP INDEX "_venues_v_version_meta_version_meta_image_idx";
  DROP INDEX "redirects_rels_venues_id_idx";
  DROP INDEX "redirects_rels_learning_videos_id_idx";
  DROP INDEX "payload_locked_documents_rels_learning_videos_id_idx";
  DROP INDEX "payload_locked_documents_rels_learning_video_categories__idx";
  DROP INDEX "payload_locked_documents_rels_route_registry_id_idx";
  ALTER TABLE "articles" DROP COLUMN "external_destination";
  ALTER TABLE "_articles_v" DROP COLUMN "version_external_destination";
  ALTER TABLE "venues" DROP COLUMN "content_mode";
  ALTER TABLE "venues" DROP COLUMN "path";
  ALTER TABLE "venues" DROP COLUMN "published_at";
  ALTER TABLE "venues" DROP COLUMN "meta_title";
  ALTER TABLE "venues" DROP COLUMN "meta_description";
  ALTER TABLE "venues" DROP COLUMN "meta_image_id";
  ALTER TABLE "venues" DROP COLUMN "meta_canonical_u_r_l";
  ALTER TABLE "venues" DROP COLUMN "meta_no_index";
  ALTER TABLE "venues" DROP COLUMN "meta_no_follow";
  ALTER TABLE "venues" DROP COLUMN "meta_structured_data";
  ALTER TABLE "_venues_v" DROP COLUMN "version_content_mode";
  ALTER TABLE "_venues_v" DROP COLUMN "version_path";
  ALTER TABLE "_venues_v" DROP COLUMN "version_published_at";
  ALTER TABLE "_venues_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_venues_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_venues_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_venues_v" DROP COLUMN "version_meta_canonical_u_r_l";
  ALTER TABLE "_venues_v" DROP COLUMN "version_meta_no_index";
  ALTER TABLE "_venues_v" DROP COLUMN "version_meta_no_follow";
  ALTER TABLE "_venues_v" DROP COLUMN "version_meta_structured_data";
  ALTER TABLE "redirects_rels" DROP COLUMN "venues_id";
  ALTER TABLE "redirects_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "learning_videos_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "learning_video_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "route_registry_id";
  DROP TYPE "public"."enum_venues_blocks_trayport_hero_actions_style";
  DROP TYPE "public"."enum_venues_blocks_trayport_hero_appearance";
  DROP TYPE "public"."enum_venues_blocks_heading_level";
  DROP TYPE "public"."enum_venues_blocks_rich_text_size";
  DROP TYPE "public"."enum_venues_blocks_actions_actions_style";
  DROP TYPE "public"."enum_venues_blocks_media_aspect";
  DROP TYPE "public"."enum_venues_blocks_feature_list_layout";
  DROP TYPE "public"."enum_venues_blocks_entity_list_kind";
  DROP TYPE "public"."enum_venues_blocks_divider_style";
  DROP TYPE "public"."enum_venues_blocks_market_coverage_actions_style";
  DROP TYPE "public"."enum_venues_blocks_data_chart_data_type";
  DROP TYPE "public"."enum_venues_blocks_content_section_columns_span";
  DROP TYPE "public"."enum_venues_blocks_content_section_theme";
  DROP TYPE "public"."enum_venues_blocks_content_section_width";
  DROP TYPE "public"."enum_venues_blocks_content_section_spacing";
  DROP TYPE "public"."enum_venues_content_mode";
  DROP TYPE "public"."enum__venues_v_blocks_trayport_hero_actions_style";
  DROP TYPE "public"."enum__venues_v_blocks_trayport_hero_appearance";
  DROP TYPE "public"."enum__venues_v_blocks_heading_level";
  DROP TYPE "public"."enum__venues_v_blocks_rich_text_size";
  DROP TYPE "public"."enum__venues_v_blocks_actions_actions_style";
  DROP TYPE "public"."enum__venues_v_blocks_media_aspect";
  DROP TYPE "public"."enum__venues_v_blocks_feature_list_layout";
  DROP TYPE "public"."enum__venues_v_blocks_entity_list_kind";
  DROP TYPE "public"."enum__venues_v_blocks_divider_style";
  DROP TYPE "public"."enum__venues_v_blocks_market_coverage_actions_style";
  DROP TYPE "public"."enum__venues_v_blocks_data_chart_data_type";
  DROP TYPE "public"."enum__venues_v_blocks_content_section_columns_span";
  DROP TYPE "public"."enum__venues_v_blocks_content_section_theme";
  DROP TYPE "public"."enum__venues_v_blocks_content_section_width";
  DROP TYPE "public"."enum__venues_v_blocks_content_section_spacing";
  DROP TYPE "public"."enum__venues_v_version_content_mode";
  DROP TYPE "public"."enum_learning_videos_blocks_trayport_hero_actions_style";
  DROP TYPE "public"."enum_learning_videos_blocks_trayport_hero_appearance";
  DROP TYPE "public"."enum_learning_videos_blocks_heading_level";
  DROP TYPE "public"."enum_learning_videos_blocks_rich_text_size";
  DROP TYPE "public"."enum_learning_videos_blocks_actions_actions_style";
  DROP TYPE "public"."enum_learning_videos_blocks_media_aspect";
  DROP TYPE "public"."enum_learning_videos_blocks_feature_list_layout";
  DROP TYPE "public"."enum_learning_videos_blocks_entity_list_kind";
  DROP TYPE "public"."enum_learning_videos_blocks_divider_style";
  DROP TYPE "public"."enum_learning_videos_blocks_market_coverage_actions_style";
  DROP TYPE "public"."enum_learning_videos_blocks_data_chart_data_type";
  DROP TYPE "public"."enum_learning_videos_blocks_content_section_columns_span";
  DROP TYPE "public"."enum_learning_videos_blocks_content_section_theme";
  DROP TYPE "public"."enum_learning_videos_blocks_content_section_width";
  DROP TYPE "public"."enum_learning_videos_blocks_content_section_spacing";
  DROP TYPE "public"."enum_learning_videos_access_mode";
  DROP TYPE "public"."enum_learning_videos_status";
  DROP TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_actions_style";
  DROP TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_appearance";
  DROP TYPE "public"."enum__learning_videos_v_blocks_heading_level";
  DROP TYPE "public"."enum__learning_videos_v_blocks_rich_text_size";
  DROP TYPE "public"."enum__learning_videos_v_blocks_actions_actions_style";
  DROP TYPE "public"."enum__learning_videos_v_blocks_media_aspect";
  DROP TYPE "public"."enum__learning_videos_v_blocks_feature_list_layout";
  DROP TYPE "public"."enum__learning_videos_v_blocks_entity_list_kind";
  DROP TYPE "public"."enum__learning_videos_v_blocks_divider_style";
  DROP TYPE "public"."enum__learning_videos_v_blocks_market_coverage_actions_style";
  DROP TYPE "public"."enum__learning_videos_v_blocks_data_chart_data_type";
  DROP TYPE "public"."enum__learning_videos_v_blocks_content_section_columns_span";
  DROP TYPE "public"."enum__learning_videos_v_blocks_content_section_theme";
  DROP TYPE "public"."enum__learning_videos_v_blocks_content_section_width";
  DROP TYPE "public"."enum__learning_videos_v_blocks_content_section_spacing";
  DROP TYPE "public"."enum__learning_videos_v_version_access_mode";
  DROP TYPE "public"."enum__learning_videos_v_version_status";
  DROP TYPE "public"."enum_route_registry_owner_kind";
  DROP TYPE "public"."enum_route_registry_owner_collection";
  DROP TYPE "public"."enum_route_registry_archetype";
  DROP TYPE "public"."enum_route_registry_state";
  DROP TYPE "public"."enum_route_registry_provenance_source";
  DROP TYPE "public"."enum_route_indexes_status";
  DROP TYPE "public"."enum__route_indexes_v_version_status";`)
}
