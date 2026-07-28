import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_pages_blocks_trayport_hero_appearance" AS ENUM('dark', 'image', 'light');
  CREATE TYPE "public"."enum_pages_blocks_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_size" AS ENUM('regular', 'large');
  CREATE TYPE "public"."enum_pages_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_pages_blocks_media_aspect" AS ENUM('landscape', 'wide', 'square', 'portrait', 'natural');
  CREATE TYPE "public"."enum_pages_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum_pages_blocks_entity_list_kind" AS ENUM('general', 'products', 'people', 'clients', 'venues');
  CREATE TYPE "public"."enum_pages_blocks_divider_style" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum_pages_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_pages_blocks_data_chart_data_type" AS ENUM('volume', 'price', 'other');
  CREATE TYPE "public"."enum_pages_blocks_content_section_columns_span" AS ENUM('4', '6', '8', '12');
  CREATE TYPE "public"."enum_pages_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum_pages_blocks_content_section_width" AS ENUM('reading', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum_pages_page_type" AS ENUM('standard', 'product', 'landing', 'index');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_trayport_hero_appearance" AS ENUM('dark', 'image', 'light');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_size" AS ENUM('regular', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_media_aspect" AS ENUM('landscape', 'wide', 'square', 'portrait', 'natural');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum__pages_v_blocks_entity_list_kind" AS ENUM('general', 'products', 'people', 'clients', 'venues');
  CREATE TYPE "public"."enum__pages_v_blocks_divider_style" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum__pages_v_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__pages_v_blocks_data_chart_data_type" AS ENUM('volume', 'price', 'other');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_columns_span" AS ENUM('4', '6', '8', '12');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_width" AS ENUM('reading', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum__pages_v_version_page_type" AS ENUM('standard', 'product', 'landing', 'index');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_articles_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_articles_blocks_trayport_hero_appearance" AS ENUM('dark', 'image', 'light');
  CREATE TYPE "public"."enum_articles_blocks_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_articles_blocks_rich_text_size" AS ENUM('regular', 'large');
  CREATE TYPE "public"."enum_articles_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_articles_blocks_media_aspect" AS ENUM('landscape', 'wide', 'square', 'portrait', 'natural');
  CREATE TYPE "public"."enum_articles_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum_articles_blocks_entity_list_kind" AS ENUM('general', 'products', 'people', 'clients', 'venues');
  CREATE TYPE "public"."enum_articles_blocks_divider_style" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum_articles_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_articles_blocks_data_chart_data_type" AS ENUM('volume', 'price', 'other');
  CREATE TYPE "public"."enum_articles_blocks_content_section_columns_span" AS ENUM('4', '6', '8', '12');
  CREATE TYPE "public"."enum_articles_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum_articles_blocks_content_section_width" AS ENUM('reading', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum_articles_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum_articles_content_mode" AS ENUM('listing', 'full');
  CREATE TYPE "public"."enum_articles_article_type" AS ENUM('insight', 'webinar', 'video', 'case-study', 'news');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__articles_v_blocks_trayport_hero_appearance" AS ENUM('dark', 'image', 'light');
  CREATE TYPE "public"."enum__articles_v_blocks_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__articles_v_blocks_rich_text_size" AS ENUM('regular', 'large');
  CREATE TYPE "public"."enum__articles_v_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__articles_v_blocks_media_aspect" AS ENUM('landscape', 'wide', 'square', 'portrait', 'natural');
  CREATE TYPE "public"."enum__articles_v_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum__articles_v_blocks_entity_list_kind" AS ENUM('general', 'products', 'people', 'clients', 'venues');
  CREATE TYPE "public"."enum__articles_v_blocks_divider_style" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum__articles_v_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__articles_v_blocks_data_chart_data_type" AS ENUM('volume', 'price', 'other');
  CREATE TYPE "public"."enum__articles_v_blocks_content_section_columns_span" AS ENUM('4', '6', '8', '12');
  CREATE TYPE "public"."enum__articles_v_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum__articles_v_blocks_content_section_width" AS ENUM('reading', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum__articles_v_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum__articles_v_version_content_mode" AS ENUM('listing', 'full');
  CREATE TYPE "public"."enum__articles_v_version_article_type" AS ENUM('insight', 'webinar', 'video', 'case-study', 'news');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_hubs_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_hubs_blocks_trayport_hero_appearance" AS ENUM('dark', 'image', 'light');
  CREATE TYPE "public"."enum_hubs_blocks_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_hubs_blocks_rich_text_size" AS ENUM('regular', 'large');
  CREATE TYPE "public"."enum_hubs_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_hubs_blocks_media_aspect" AS ENUM('landscape', 'wide', 'square', 'portrait', 'natural');
  CREATE TYPE "public"."enum_hubs_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum_hubs_blocks_entity_list_kind" AS ENUM('general', 'products', 'people', 'clients', 'venues');
  CREATE TYPE "public"."enum_hubs_blocks_divider_style" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum_hubs_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum_hubs_blocks_data_chart_data_type" AS ENUM('volume', 'price', 'other');
  CREATE TYPE "public"."enum_hubs_blocks_content_section_columns_span" AS ENUM('4', '6', '8', '12');
  CREATE TYPE "public"."enum_hubs_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum_hubs_blocks_content_section_width" AS ENUM('reading', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum_hubs_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum_hubs_connections_connection_type" AS ENUM('d', 'a', 'b');
  CREATE TYPE "public"."enum_hubs_content_mode" AS ENUM('map-only', 'page');
  CREATE TYPE "public"."enum_hubs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__hubs_v_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__hubs_v_blocks_trayport_hero_appearance" AS ENUM('dark', 'image', 'light');
  CREATE TYPE "public"."enum__hubs_v_blocks_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__hubs_v_blocks_rich_text_size" AS ENUM('regular', 'large');
  CREATE TYPE "public"."enum__hubs_v_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__hubs_v_blocks_media_aspect" AS ENUM('landscape', 'wide', 'square', 'portrait', 'natural');
  CREATE TYPE "public"."enum__hubs_v_blocks_feature_list_layout" AS ENUM('grid', 'stacked', 'logos');
  CREATE TYPE "public"."enum__hubs_v_blocks_entity_list_kind" AS ENUM('general', 'products', 'people', 'clients', 'venues');
  CREATE TYPE "public"."enum__hubs_v_blocks_divider_style" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum__hubs_v_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  CREATE TYPE "public"."enum__hubs_v_blocks_data_chart_data_type" AS ENUM('volume', 'price', 'other');
  CREATE TYPE "public"."enum__hubs_v_blocks_content_section_columns_span" AS ENUM('4', '6', '8', '12');
  CREATE TYPE "public"."enum__hubs_v_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum__hubs_v_blocks_content_section_width" AS ENUM('reading', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum__hubs_v_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum__hubs_v_version_connections_connection_type" AS ENUM('d', 'a', 'b');
  CREATE TYPE "public"."enum__hubs_v_version_content_mode" AS ENUM('map-only', 'page');
  CREATE TYPE "public"."enum__hubs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_venues_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__venues_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_media_alt_source" AS ENUM('wordpress', 'title-fallback', 'editor-review');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
  CREATE TYPE "public"."enum_navigation_primary_items_children_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_navigation_primary_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_navigation_utility_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_navigation_primary_action_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_navigation_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__navigation_v_version_primary_items_children_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__navigation_v_version_primary_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__navigation_v_version_utility_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__navigation_v_version_primary_action_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__navigation_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_footer_columns_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_legal_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__footer_v_version_columns_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__footer_v_version_legal_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__footer_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_site_settings_social_links_platform" AS ENUM('linkedin', 'youtube', 'x', 'other');
  CREATE TYPE "public"."enum_site_settings_site_notice_action_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_social_links_platform" AS ENUM('linkedin', 'youtube', 'x', 'other');
  CREATE TYPE "public"."enum__site_settings_v_version_site_notice_action_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "pages_blocks_trayport_hero_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_pages_blocks_trayport_hero_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "pages_blocks_trayport_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "heading" varchar,
    "body" jsonb,
    "media_id" integer,
    "external_video_u_r_l" varchar,
    "appearance" "enum_pages_blocks_trayport_hero_appearance" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_heading" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "text" varchar,
    "level" "enum_pages_blocks_heading_level" DEFAULT 'h2',
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_rich_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "body" jsonb,
    "size" "enum_pages_blocks_rich_text_size" DEFAULT 'regular',
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_actions_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_pages_blocks_actions_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "pages_blocks_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "external_u_r_l" varchar,
    "caption" varchar,
    "aspect" "enum_pages_blocks_media_aspect" DEFAULT 'landscape',
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_feature_list_items" (
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

  CREATE TABLE "pages_blocks_feature_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "layout" "enum_pages_blocks_feature_list_layout" DEFAULT 'grid',
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_statistics_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "description" varchar
  );

  CREATE TABLE "pages_blocks_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_faq_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" jsonb
  );

  CREATE TABLE "pages_blocks_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_entity_list_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" jsonb,
    "url" varchar,
    "media_id" integer
  );

  CREATE TABLE "pages_blocks_entity_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "kind" "enum_pages_blocks_entity_list_kind" DEFAULT 'general',
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_timeline_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "title" varchar,
    "body" jsonb
  );

  CREATE TABLE "pages_blocks_timeline" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_data_table_headers" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar
  );

  CREATE TABLE "pages_blocks_data_table_rows_cells" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar
  );

  CREATE TABLE "pages_blocks_data_table_rows" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL
  );

  CREATE TABLE "pages_blocks_data_table" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "caption" varchar,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_gallery_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar
  );

  CREATE TABLE "pages_blocks_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_divider" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "style" "enum_pages_blocks_divider_style" DEFAULT 'line',
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_market_coverage_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_pages_blocks_market_coverage_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "pages_blocks_market_coverage" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar DEFAULT 'Explore our connectivity',
    "body" jsonb,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_embed" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "url" varchar,
    "poster_id" integer,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_data_chart" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "data_type" "enum_pages_blocks_data_chart_data_type" DEFAULT 'volume',
    "unit" varchar,
    "asset_class_legacy_id" numeric,
    "accessible_summary" varchar,
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_content_section_columns" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "span" "enum_pages_blocks_content_section_columns_span" DEFAULT '12'
  );

  CREATE TABLE "pages_blocks_content_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "anchor" varchar,
    "theme" "enum_pages_blocks_content_section_theme" DEFAULT 'light',
    "width" "enum_pages_blocks_content_section_width" DEFAULT 'wide',
    "spacing" "enum_pages_blocks_content_section_spacing" DEFAULT 'regular',
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_article_listing" (
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

  CREATE TABLE "pages" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "summary" varchar,
    "parent_id" integer,
    "navigation_label" varchar,
    "page_type" "enum_pages_page_type" DEFAULT 'standard',
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
    "_status" "enum_pages_status" DEFAULT 'draft'
  );

  CREATE TABLE "pages_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "regions_id" integer
  );

  CREATE TABLE "_pages_v_blocks_trayport_hero_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__pages_v_blocks_trayport_hero_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_trayport_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "heading" varchar,
    "body" jsonb,
    "media_id" integer,
    "external_video_u_r_l" varchar,
    "appearance" "enum__pages_v_blocks_trayport_hero_appearance" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_heading" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "text" varchar,
    "level" "enum__pages_v_blocks_heading_level" DEFAULT 'h2',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_rich_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "body" jsonb,
    "size" "enum__pages_v_blocks_rich_text_size" DEFAULT 'regular',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_actions_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__pages_v_blocks_actions_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "external_u_r_l" varchar,
    "caption" varchar,
    "aspect" "enum__pages_v_blocks_media_aspect" DEFAULT 'landscape',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_feature_list_items" (
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

  CREATE TABLE "_pages_v_blocks_feature_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "layout" "enum__pages_v_blocks_feature_list_layout" DEFAULT 'grid',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_statistics_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "description" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_faq_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_entity_list_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" jsonb,
    "url" varchar,
    "media_id" integer,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_entity_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "kind" "enum__pages_v_blocks_entity_list_kind" DEFAULT 'general',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_timeline_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "title" varchar,
    "body" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_timeline" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_data_table_headers" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_data_table_rows_cells" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_data_table_rows" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_data_table" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "caption" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_gallery_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_divider" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "style" "enum__pages_v_blocks_divider_style" DEFAULT 'line',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_market_coverage_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__pages_v_blocks_market_coverage_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_market_coverage" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar DEFAULT 'Explore our connectivity',
    "body" jsonb,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_embed" (
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

  CREATE TABLE "_pages_v_blocks_data_chart" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "data_type" "enum__pages_v_blocks_data_chart_data_type" DEFAULT 'volume',
    "unit" varchar,
    "asset_class_legacy_id" numeric,
    "accessible_summary" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_content_section_columns" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "span" "enum__pages_v_blocks_content_section_columns_span" DEFAULT '12',
    "_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_content_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "anchor" varchar,
    "theme" "enum__pages_v_blocks_content_section_theme" DEFAULT 'light',
    "width" "enum__pages_v_blocks_content_section_width" DEFAULT 'wide',
    "spacing" "enum__pages_v_blocks_content_section_spacing" DEFAULT 'regular',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_article_listing" (
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

  CREATE TABLE "_pages_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_summary" varchar,
    "version_parent_id" integer,
    "version_navigation_label" varchar,
    "version_page_type" "enum__pages_v_version_page_type" DEFAULT 'standard',
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
    "version__status" "enum__pages_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_pages_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "regions_id" integer
  );

  CREATE TABLE "articles_blocks_trayport_hero_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_articles_blocks_trayport_hero_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "articles_blocks_trayport_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "heading" varchar,
    "body" jsonb,
    "media_id" integer,
    "external_video_u_r_l" varchar,
    "appearance" "enum_articles_blocks_trayport_hero_appearance" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_heading" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "text" varchar,
    "level" "enum_articles_blocks_heading_level" DEFAULT 'h2',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_rich_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "body" jsonb,
    "size" "enum_articles_blocks_rich_text_size" DEFAULT 'regular',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_actions_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_articles_blocks_actions_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "articles_blocks_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "external_u_r_l" varchar,
    "caption" varchar,
    "aspect" "enum_articles_blocks_media_aspect" DEFAULT 'landscape',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_feature_list_items" (
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

  CREATE TABLE "articles_blocks_feature_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "layout" "enum_articles_blocks_feature_list_layout" DEFAULT 'grid',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_statistics_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "description" varchar
  );

  CREATE TABLE "articles_blocks_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_faq_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" jsonb
  );

  CREATE TABLE "articles_blocks_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_entity_list_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" jsonb,
    "url" varchar,
    "media_id" integer
  );

  CREATE TABLE "articles_blocks_entity_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "kind" "enum_articles_blocks_entity_list_kind" DEFAULT 'general',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_timeline_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "title" varchar,
    "body" jsonb
  );

  CREATE TABLE "articles_blocks_timeline" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_data_table_headers" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar
  );

  CREATE TABLE "articles_blocks_data_table_rows_cells" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar
  );

  CREATE TABLE "articles_blocks_data_table_rows" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL
  );

  CREATE TABLE "articles_blocks_data_table" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "caption" varchar,
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_gallery_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar
  );

  CREATE TABLE "articles_blocks_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_divider" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "style" "enum_articles_blocks_divider_style" DEFAULT 'line',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_market_coverage_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_articles_blocks_market_coverage_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "articles_blocks_market_coverage" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar DEFAULT 'Explore our connectivity',
    "body" jsonb,
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_embed" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "url" varchar,
    "poster_id" integer,
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_data_chart" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "data_type" "enum_articles_blocks_data_chart_data_type" DEFAULT 'volume',
    "unit" varchar,
    "asset_class_legacy_id" numeric,
    "accessible_summary" varchar,
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_content_section_columns" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "span" "enum_articles_blocks_content_section_columns_span" DEFAULT '12'
  );

  CREATE TABLE "articles_blocks_content_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "anchor" varchar,
    "theme" "enum_articles_blocks_content_section_theme" DEFAULT 'light',
    "width" "enum_articles_blocks_content_section_width" DEFAULT 'wide',
    "spacing" "enum_articles_blocks_content_section_spacing" DEFAULT 'regular',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_article_listing" (
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

  CREATE TABLE "articles" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "excerpt" varchar,
    "hero_media_id" integer,
    "content_mode" "enum_articles_content_mode" DEFAULT 'listing',
    "article_type" "enum_articles_article_type" DEFAULT 'insight',
    "featured" boolean DEFAULT false,
    "featured_order" numeric,
    "byline" varchar,
    "location" varchar,
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
    "_status" "enum_articles_status" DEFAULT 'draft'
  );

  CREATE TABLE "articles_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "regions_id" integer,
    "article_categories_id" integer,
    "articles_id" integer,
    "hubs_id" integer
  );

  CREATE TABLE "_articles_v_blocks_trayport_hero_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__articles_v_blocks_trayport_hero_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_trayport_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "heading" varchar,
    "body" jsonb,
    "media_id" integer,
    "external_video_u_r_l" varchar,
    "appearance" "enum__articles_v_blocks_trayport_hero_appearance" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_heading" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "text" varchar,
    "level" "enum__articles_v_blocks_heading_level" DEFAULT 'h2',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_rich_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "body" jsonb,
    "size" "enum__articles_v_blocks_rich_text_size" DEFAULT 'regular',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_actions_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__articles_v_blocks_actions_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "external_u_r_l" varchar,
    "caption" varchar,
    "aspect" "enum__articles_v_blocks_media_aspect" DEFAULT 'landscape',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_feature_list_items" (
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

  CREATE TABLE "_articles_v_blocks_feature_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "layout" "enum__articles_v_blocks_feature_list_layout" DEFAULT 'grid',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_statistics_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "description" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_faq_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_entity_list_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" jsonb,
    "url" varchar,
    "media_id" integer,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_entity_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "kind" "enum__articles_v_blocks_entity_list_kind" DEFAULT 'general',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_timeline_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "title" varchar,
    "body" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_timeline" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_data_table_headers" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_data_table_rows_cells" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_data_table_rows" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_data_table" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "caption" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_gallery_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_divider" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "style" "enum__articles_v_blocks_divider_style" DEFAULT 'line',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_market_coverage_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__articles_v_blocks_market_coverage_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_market_coverage" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar DEFAULT 'Explore our connectivity',
    "body" jsonb,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_embed" (
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

  CREATE TABLE "_articles_v_blocks_data_chart" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "data_type" "enum__articles_v_blocks_data_chart_data_type" DEFAULT 'volume',
    "unit" varchar,
    "asset_class_legacy_id" numeric,
    "accessible_summary" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_content_section_columns" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "span" "enum__articles_v_blocks_content_section_columns_span" DEFAULT '12',
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_content_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "anchor" varchar,
    "theme" "enum__articles_v_blocks_content_section_theme" DEFAULT 'light',
    "width" "enum__articles_v_blocks_content_section_width" DEFAULT 'wide',
    "spacing" "enum__articles_v_blocks_content_section_spacing" DEFAULT 'regular',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_article_listing" (
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

  CREATE TABLE "_articles_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_excerpt" varchar,
    "version_hero_media_id" integer,
    "version_content_mode" "enum__articles_v_version_content_mode" DEFAULT 'listing',
    "version_article_type" "enum__articles_v_version_article_type" DEFAULT 'insight',
    "version_featured" boolean DEFAULT false,
    "version_featured_order" numeric,
    "version_byline" varchar,
    "version_location" varchar,
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
    "version__status" "enum__articles_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_articles_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "regions_id" integer,
    "article_categories_id" integer,
    "articles_id" integer,
    "hubs_id" integer
  );

  CREATE TABLE "hubs_blocks_trayport_hero_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_hubs_blocks_trayport_hero_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "hubs_blocks_trayport_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "heading" varchar,
    "body" jsonb,
    "media_id" integer,
    "external_video_u_r_l" varchar,
    "appearance" "enum_hubs_blocks_trayport_hero_appearance" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_heading" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "text" varchar,
    "level" "enum_hubs_blocks_heading_level" DEFAULT 'h2',
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_rich_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "body" jsonb,
    "size" "enum_hubs_blocks_rich_text_size" DEFAULT 'regular',
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_actions_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_hubs_blocks_actions_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "hubs_blocks_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "external_u_r_l" varchar,
    "caption" varchar,
    "aspect" "enum_hubs_blocks_media_aspect" DEFAULT 'landscape',
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_feature_list_items" (
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

  CREATE TABLE "hubs_blocks_feature_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "layout" "enum_hubs_blocks_feature_list_layout" DEFAULT 'grid',
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_statistics_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "description" varchar
  );

  CREATE TABLE "hubs_blocks_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_faq_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" jsonb
  );

  CREATE TABLE "hubs_blocks_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_entity_list_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" jsonb,
    "url" varchar,
    "media_id" integer
  );

  CREATE TABLE "hubs_blocks_entity_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "kind" "enum_hubs_blocks_entity_list_kind" DEFAULT 'general',
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_timeline_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "title" varchar,
    "body" jsonb
  );

  CREATE TABLE "hubs_blocks_timeline" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_data_table_headers" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar
  );

  CREATE TABLE "hubs_blocks_data_table_rows_cells" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar
  );

  CREATE TABLE "hubs_blocks_data_table_rows" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL
  );

  CREATE TABLE "hubs_blocks_data_table" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "caption" varchar,
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_gallery_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar
  );

  CREATE TABLE "hubs_blocks_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_divider" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "style" "enum_hubs_blocks_divider_style" DEFAULT 'line',
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_market_coverage_actions" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_hubs_blocks_market_coverage_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false
  );

  CREATE TABLE "hubs_blocks_market_coverage" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar DEFAULT 'Explore our connectivity',
    "body" jsonb,
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_embed" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "url" varchar,
    "poster_id" integer,
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_data_chart" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "data_type" "enum_hubs_blocks_data_chart_data_type" DEFAULT 'volume',
    "unit" varchar,
    "asset_class_legacy_id" numeric,
    "accessible_summary" varchar,
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_content_section_columns" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "span" "enum_hubs_blocks_content_section_columns_span" DEFAULT '12'
  );

  CREATE TABLE "hubs_blocks_content_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "anchor" varchar,
    "theme" "enum_hubs_blocks_content_section_theme" DEFAULT 'light',
    "width" "enum_hubs_blocks_content_section_width" DEFAULT 'wide',
    "spacing" "enum_hubs_blocks_content_section_spacing" DEFAULT 'regular',
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_article_listing" (
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

  CREATE TABLE "hubs_map_markers" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "location_latitude" numeric,
    "location_longitude" numeric
  );

  CREATE TABLE "hubs_connections" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "venue_id" integer,
    "connection_type" "enum_hubs_connections_connection_type",
    "supports_joule" boolean,
    "supports_auto_trader" boolean
  );

  CREATE TABLE "hubs" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "content_mode" "enum_hubs_content_mode" DEFAULT 'map-only',
    "summary" varchar,
    "hero_media_id" integer,
    "code" varchar,
    "market_data_key" varchar,
    "show_on_map" boolean DEFAULT true,
    "map_location_label" varchar,
    "map_centre_latitude" numeric,
    "map_centre_longitude" numeric,
    "map_zoom" numeric DEFAULT 6,
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
    "_status" "enum_hubs_status" DEFAULT 'draft'
  );

  CREATE TABLE "hubs_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "regions_id" integer,
    "asset_classes_id" integer,
    "venue_types_id" integer,
    "hubs_id" integer
  );

  CREATE TABLE "_hubs_v_blocks_trayport_hero_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__hubs_v_blocks_trayport_hero_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_hubs_v_blocks_trayport_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "heading" varchar,
    "body" jsonb,
    "media_id" integer,
    "external_video_u_r_l" varchar,
    "appearance" "enum__hubs_v_blocks_trayport_hero_appearance" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_heading" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "text" varchar,
    "level" "enum__hubs_v_blocks_heading_level" DEFAULT 'h2',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_rich_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "body" jsonb,
    "size" "enum__hubs_v_blocks_rich_text_size" DEFAULT 'regular',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_actions_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__hubs_v_blocks_actions_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_hubs_v_blocks_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "external_u_r_l" varchar,
    "caption" varchar,
    "aspect" "enum__hubs_v_blocks_media_aspect" DEFAULT 'landscape',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_feature_list_items" (
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

  CREATE TABLE "_hubs_v_blocks_feature_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "layout" "enum__hubs_v_blocks_feature_list_layout" DEFAULT 'grid',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_statistics_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "description" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_hubs_v_blocks_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_faq_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE "_hubs_v_blocks_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_entity_list_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" jsonb,
    "url" varchar,
    "media_id" integer,
    "_uuid" varchar
  );

  CREATE TABLE "_hubs_v_blocks_entity_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "kind" "enum__hubs_v_blocks_entity_list_kind" DEFAULT 'general',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_timeline_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "title" varchar,
    "body" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE "_hubs_v_blocks_timeline" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_data_table_headers" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_hubs_v_blocks_data_table_rows_cells" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_hubs_v_blocks_data_table_rows" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar
  );

  CREATE TABLE "_hubs_v_blocks_data_table" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "caption" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_gallery_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_hubs_v_blocks_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_divider" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "style" "enum__hubs_v_blocks_divider_style" DEFAULT 'line',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_market_coverage_actions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__hubs_v_blocks_market_coverage_actions_style" DEFAULT 'primary',
    "new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_hubs_v_blocks_market_coverage" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar DEFAULT 'Explore our connectivity',
    "body" jsonb,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_embed" (
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

  CREATE TABLE "_hubs_v_blocks_data_chart" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "data_type" "enum__hubs_v_blocks_data_chart_data_type" DEFAULT 'volume',
    "unit" varchar,
    "asset_class_legacy_id" numeric,
    "accessible_summary" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_content_section_columns" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "span" "enum__hubs_v_blocks_content_section_columns_span" DEFAULT '12',
    "_uuid" varchar
  );

  CREATE TABLE "_hubs_v_blocks_content_section" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "anchor" varchar,
    "theme" "enum__hubs_v_blocks_content_section_theme" DEFAULT 'light',
    "width" "enum__hubs_v_blocks_content_section_width" DEFAULT 'wide',
    "spacing" "enum__hubs_v_blocks_content_section_spacing" DEFAULT 'regular',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_article_listing" (
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

  CREATE TABLE "_hubs_v_version_map_markers" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "location_latitude" numeric,
    "location_longitude" numeric,
    "_uuid" varchar
  );

  CREATE TABLE "_hubs_v_version_connections" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "venue_id" integer,
    "connection_type" "enum__hubs_v_version_connections_connection_type",
    "supports_joule" boolean,
    "supports_auto_trader" boolean,
    "_uuid" varchar
  );

  CREATE TABLE "_hubs_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_content_mode" "enum__hubs_v_version_content_mode" DEFAULT 'map-only',
    "version_summary" varchar,
    "version_hero_media_id" integer,
    "version_code" varchar,
    "version_market_data_key" varchar,
    "version_show_on_map" boolean DEFAULT true,
    "version_map_location_label" varchar,
    "version_map_centre_latitude" numeric,
    "version_map_centre_longitude" numeric,
    "version_map_zoom" numeric DEFAULT 6,
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
    "version__status" "enum__hubs_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_hubs_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "regions_id" integer,
    "asset_classes_id" integer,
    "venue_types_id" integer,
    "hubs_id" integer
  );

  CREATE TABLE "venues" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "summary" varchar,
    "description" jsonb,
    "code" varchar,
    "website" varchar,
    "logo_id" integer,
    "location_label" varchar,
    "location_coordinates_latitude" numeric,
    "location_coordinates_longitude" numeric,
    "display_order" numeric DEFAULT 0,
    "slug" varchar,
    "legacy_source_key" varchar,
    "legacy_source_source" varchar,
    "legacy_source_legacy_id" numeric,
    "legacy_source_original_url" varchar,
    "legacy_source_modified_gmt" timestamp(3) with time zone,
    "legacy_source_content_hash" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_venues_status" DEFAULT 'draft'
  );

  CREATE TABLE "venues_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "venue_types_id" integer,
    "asset_classes_id" integer,
    "regions_id" integer
  );

  CREATE TABLE "_venues_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_summary" varchar,
    "version_description" jsonb,
    "version_code" varchar,
    "version_website" varchar,
    "version_logo_id" integer,
    "version_location_label" varchar,
    "version_location_coordinates_latitude" numeric,
    "version_location_coordinates_longitude" numeric,
    "version_display_order" numeric DEFAULT 0,
    "version_slug" varchar,
    "version_legacy_source_key" varchar,
    "version_legacy_source_source" varchar,
    "version_legacy_source_legacy_id" numeric,
    "version_legacy_source_original_url" varchar,
    "version_legacy_source_modified_gmt" timestamp(3) with time zone,
    "version_legacy_source_content_hash" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__venues_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_venues_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "venue_types_id" integer,
    "asset_classes_id" integer,
    "regions_id" integer
  );

  CREATE TABLE "media" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "alt" varchar,
    "decorative" boolean DEFAULT false,
    "alt_source" "enum_media_alt_source",
    "caption" jsonb,
    "attribution" varchar,
    "external_u_r_l" varchar,
    "poster_id" integer,
    "legacy_source_key" varchar,
    "legacy_source_source" varchar,
    "legacy_source_legacy_id" numeric,
    "legacy_source_original_url" varchar,
    "legacy_source_modified_gmt" timestamp(3) with time zone,
    "legacy_source_content_hash" varchar,
    "folder_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "url" varchar,
    "thumbnail_u_r_l" varchar,
    "filename" varchar,
    "mime_type" varchar,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric,
    "sizes_thumbnail_url" varchar,
    "sizes_thumbnail_width" numeric,
    "sizes_thumbnail_height" numeric,
    "sizes_thumbnail_mime_type" varchar,
    "sizes_thumbnail_filesize" numeric,
    "sizes_thumbnail_filename" varchar,
    "sizes_square_url" varchar,
    "sizes_square_width" numeric,
    "sizes_square_height" numeric,
    "sizes_square_mime_type" varchar,
    "sizes_square_filesize" numeric,
    "sizes_square_filename" varchar,
    "sizes_small_url" varchar,
    "sizes_small_width" numeric,
    "sizes_small_height" numeric,
    "sizes_small_mime_type" varchar,
    "sizes_small_filesize" numeric,
    "sizes_small_filename" varchar,
    "sizes_medium_url" varchar,
    "sizes_medium_width" numeric,
    "sizes_medium_height" numeric,
    "sizes_medium_mime_type" varchar,
    "sizes_medium_filesize" numeric,
    "sizes_medium_filename" varchar,
    "sizes_large_url" varchar,
    "sizes_large_width" numeric,
    "sizes_large_height" numeric,
    "sizes_large_mime_type" varchar,
    "sizes_large_filesize" numeric,
    "sizes_large_filename" varchar,
    "sizes_xlarge_url" varchar,
    "sizes_xlarge_width" numeric,
    "sizes_xlarge_height" numeric,
    "sizes_xlarge_mime_type" varchar,
    "sizes_xlarge_filesize" numeric,
    "sizes_xlarge_filename" varchar,
    "sizes_og_url" varchar,
    "sizes_og_width" numeric,
    "sizes_og_height" numeric,
    "sizes_og_mime_type" varchar,
    "sizes_og_filesize" numeric,
    "sizes_og_filename" varchar
  );

  CREATE TABLE "article_categories" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "description" varchar,
    "parent_id" integer,
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

  CREATE TABLE "asset_classes" (
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

  CREATE TABLE "venue_types" (
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

  CREATE TABLE "regions" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "code" varchar,
    "description" varchar,
    "map_centre_latitude" numeric,
    "map_centre_longitude" numeric,
    "map_zoom" numeric DEFAULT 4,
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

  CREATE TABLE "users_roles" (
    "order" integer NOT NULL,
    "parent_id" integer NOT NULL,
    "value" "enum_users_roles",
    "id" serial PRIMARY KEY NOT NULL
  );

  CREATE TABLE "users_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "email" varchar NOT NULL,
    "reset_password_token" varchar,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" varchar,
    "hash" varchar,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone
  );

  CREATE TABLE "redirects" (
    "id" serial PRIMARY KEY NOT NULL,
    "from" varchar NOT NULL,
    "to_type" "enum_redirects_to_type" DEFAULT 'reference',
    "to_url" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "redirects_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "articles_id" integer,
    "hubs_id" integer
  );

  CREATE TABLE "payload_kv" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar NOT NULL,
    "data" jsonb NOT NULL
  );

  CREATE TABLE "payload_jobs_log" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "executed_at" timestamp(3) with time zone NOT NULL,
    "completed_at" timestamp(3) with time zone NOT NULL,
    "task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
    "task_i_d" varchar NOT NULL,
    "input" jsonb,
    "output" jsonb,
    "state" "enum_payload_jobs_log_state" NOT NULL,
    "error" jsonb
  );

  CREATE TABLE "payload_jobs" (
    "id" serial PRIMARY KEY NOT NULL,
    "input" jsonb,
    "completed_at" timestamp(3) with time zone,
    "total_tried" numeric DEFAULT 0,
    "has_error" boolean DEFAULT false,
    "error" jsonb,
    "task_slug" "enum_payload_jobs_task_slug",
    "queue" varchar DEFAULT 'default',
    "wait_until" timestamp(3) with time zone,
    "processing" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_folders_folder_type" (
    "order" integer NOT NULL,
    "parent_id" integer NOT NULL,
    "value" "enum_payload_folders_folder_type",
    "id" serial PRIMARY KEY NOT NULL
  );

  CREATE TABLE "payload_folders" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "folder_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents" (
    "id" serial PRIMARY KEY NOT NULL,
    "global_slug" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "articles_id" integer,
    "hubs_id" integer,
    "venues_id" integer,
    "media_id" integer,
    "article_categories_id" integer,
    "asset_classes_id" integer,
    "venue_types_id" integer,
    "regions_id" integer,
    "users_id" integer,
    "redirects_id" integer,
    "payload_folders_id" integer
  );

  CREATE TABLE "payload_preferences" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar,
    "value" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_preferences_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer
  );

  CREATE TABLE "payload_migrations" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "batch" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "navigation_primary_items_children" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "description" varchar,
    "group_label" varchar,
    "media_id" integer,
    "link_type" "enum_navigation_primary_items_children_link_type" DEFAULT 'reference',
    "link_url" varchar,
    "link_new_tab" boolean DEFAULT false
  );

  CREATE TABLE "navigation_primary_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "description" varchar,
    "link_type" "enum_navigation_primary_items_link_type" DEFAULT 'reference',
    "link_url" varchar,
    "link_new_tab" boolean DEFAULT false
  );

  CREATE TABLE "navigation_utility_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "link_label" varchar,
    "link_type" "enum_navigation_utility_items_link_type" DEFAULT 'reference',
    "link_url" varchar,
    "link_new_tab" boolean DEFAULT false
  );

  CREATE TABLE "navigation" (
    "id" serial PRIMARY KEY NOT NULL,
    "primary_action_link_label" varchar,
    "primary_action_link_type" "enum_navigation_primary_action_link_type" DEFAULT 'reference',
    "primary_action_link_url" varchar,
    "primary_action_link_new_tab" boolean DEFAULT false,
    "legacy_source_key" varchar,
    "legacy_source_source" varchar,
    "legacy_source_legacy_id" numeric,
    "legacy_source_original_url" varchar,
    "legacy_source_modified_gmt" timestamp(3) with time zone,
    "legacy_source_content_hash" varchar,
    "_status" "enum_navigation_status" DEFAULT 'draft',
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "navigation_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "articles_id" integer,
    "hubs_id" integer
  );

  CREATE TABLE "_navigation_v_version_primary_items_children" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "description" varchar,
    "group_label" varchar,
    "media_id" integer,
    "link_type" "enum__navigation_v_version_primary_items_children_link_type" DEFAULT 'reference',
    "link_url" varchar,
    "link_new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_navigation_v_version_primary_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "description" varchar,
    "link_type" "enum__navigation_v_version_primary_items_link_type" DEFAULT 'reference',
    "link_url" varchar,
    "link_new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_navigation_v_version_utility_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "link_label" varchar,
    "link_type" "enum__navigation_v_version_utility_items_link_type" DEFAULT 'reference',
    "link_url" varchar,
    "link_new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_navigation_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "version_primary_action_link_label" varchar,
    "version_primary_action_link_type" "enum__navigation_v_version_primary_action_link_type" DEFAULT 'reference',
    "version_primary_action_link_url" varchar,
    "version_primary_action_link_new_tab" boolean DEFAULT false,
    "version_legacy_source_key" varchar,
    "version_legacy_source_source" varchar,
    "version_legacy_source_legacy_id" numeric,
    "version_legacy_source_original_url" varchar,
    "version_legacy_source_modified_gmt" timestamp(3) with time zone,
    "version_legacy_source_content_hash" varchar,
    "version__status" "enum__navigation_v_version_status" DEFAULT 'draft',
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_navigation_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "articles_id" integer,
    "hubs_id" integer
  );

  CREATE TABLE "footer_columns_links" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "link_label" varchar,
    "link_type" "enum_footer_columns_links_link_type" DEFAULT 'reference',
    "link_url" varchar,
    "link_new_tab" boolean DEFAULT false
  );

  CREATE TABLE "footer_columns" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar
  );

  CREATE TABLE "footer_legal_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "link_label" varchar,
    "link_type" "enum_footer_legal_links_link_type" DEFAULT 'reference',
    "link_url" varchar,
    "link_new_tab" boolean DEFAULT false
  );

  CREATE TABLE "footer_certification_marks" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar,
    "image_id" integer,
    "url" varchar
  );

  CREATE TABLE "footer" (
    "id" serial PRIMARY KEY NOT NULL,
    "intro" varchar,
    "copyright" varchar,
    "legacy_source_key" varchar,
    "legacy_source_source" varchar,
    "legacy_source_legacy_id" numeric,
    "legacy_source_original_url" varchar,
    "legacy_source_modified_gmt" timestamp(3) with time zone,
    "legacy_source_content_hash" varchar,
    "_status" "enum_footer_status" DEFAULT 'draft',
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "footer_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "articles_id" integer,
    "hubs_id" integer
  );

  CREATE TABLE "_footer_v_version_columns_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "link_label" varchar,
    "link_type" "enum__footer_v_version_columns_links_link_type" DEFAULT 'reference',
    "link_url" varchar,
    "link_new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_footer_v_version_columns" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_footer_v_version_legal_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "link_label" varchar,
    "link_type" "enum__footer_v_version_legal_links_link_type" DEFAULT 'reference',
    "link_url" varchar,
    "link_new_tab" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_footer_v_version_certification_marks" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "image_id" integer,
    "url" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_footer_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "version_intro" varchar,
    "version_copyright" varchar,
    "version_legacy_source_key" varchar,
    "version_legacy_source_source" varchar,
    "version_legacy_source_legacy_id" numeric,
    "version_legacy_source_original_url" varchar,
    "version_legacy_source_modified_gmt" timestamp(3) with time zone,
    "version_legacy_source_content_hash" varchar,
    "version__status" "enum__footer_v_version_status" DEFAULT 'draft',
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_footer_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "articles_id" integer,
    "hubs_id" integer
  );

  CREATE TABLE "site_settings_social_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "platform" "enum_site_settings_social_links_platform",
    "label" varchar,
    "url" varchar
  );

  CREATE TABLE "site_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "site_name" varchar DEFAULT 'Trayport',
    "tagline" varchar,
    "logo_id" integer,
    "logo_on_dark_id" integer,
    "favicon_id" integer,
    "default_s_e_o_title_suffix" varchar DEFAULT ' | Trayport',
    "default_s_e_o_description" varchar,
    "default_s_e_o_image_id" integer,
    "contact_email" varchar,
    "contact_phone" varchar,
    "contact_address" varchar,
    "site_notice_enabled" boolean DEFAULT false,
    "site_notice_message" varchar,
    "site_notice_action_link_label" varchar,
    "site_notice_action_link_type" "enum_site_settings_site_notice_action_link_type" DEFAULT 'reference',
    "site_notice_action_link_url" varchar,
    "site_notice_action_link_new_tab" boolean DEFAULT false,
    "cookie_notice_enabled" boolean DEFAULT true,
    "cookie_notice_message" varchar,
    "cookie_notice_policy_page_id" integer,
    "_status" "enum_site_settings_status" DEFAULT 'draft',
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "site_settings_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "articles_id" integer,
    "hubs_id" integer
  );

  CREATE TABLE "_site_settings_v_version_social_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "platform" "enum__site_settings_v_version_social_links_platform",
    "label" varchar,
    "url" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_site_settings_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "version_site_name" varchar DEFAULT 'Trayport',
    "version_tagline" varchar,
    "version_logo_id" integer,
    "version_logo_on_dark_id" integer,
    "version_favicon_id" integer,
    "version_default_s_e_o_title_suffix" varchar DEFAULT ' | Trayport',
    "version_default_s_e_o_description" varchar,
    "version_default_s_e_o_image_id" integer,
    "version_contact_email" varchar,
    "version_contact_phone" varchar,
    "version_contact_address" varchar,
    "version_site_notice_enabled" boolean DEFAULT false,
    "version_site_notice_message" varchar,
    "version_site_notice_action_link_label" varchar,
    "version_site_notice_action_link_type" "enum__site_settings_v_version_site_notice_action_link_type" DEFAULT 'reference',
    "version_site_notice_action_link_url" varchar,
    "version_site_notice_action_link_new_tab" boolean DEFAULT false,
    "version_cookie_notice_enabled" boolean DEFAULT true,
    "version_cookie_notice_message" varchar,
    "version_cookie_notice_policy_page_id" integer,
    "version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_site_settings_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "articles_id" integer,
    "hubs_id" integer
  );

  ALTER TABLE "pages_blocks_trayport_hero_actions" ADD CONSTRAINT "pages_blocks_trayport_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_trayport_hero" ADD CONSTRAINT "pages_blocks_trayport_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_trayport_hero" ADD CONSTRAINT "pages_blocks_trayport_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_heading" ADD CONSTRAINT "pages_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_actions_actions" ADD CONSTRAINT "pages_blocks_actions_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_actions" ADD CONSTRAINT "pages_blocks_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media" ADD CONSTRAINT "pages_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media" ADD CONSTRAINT "pages_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_list_items" ADD CONSTRAINT "pages_blocks_feature_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_list_items" ADD CONSTRAINT "pages_blocks_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_list" ADD CONSTRAINT "pages_blocks_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_statistics_items" ADD CONSTRAINT "pages_blocks_statistics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_statistics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_statistics" ADD CONSTRAINT "pages_blocks_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_entity_list_items" ADD CONSTRAINT "pages_blocks_entity_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_entity_list_items" ADD CONSTRAINT "pages_blocks_entity_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_entity_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_entity_list" ADD CONSTRAINT "pages_blocks_entity_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_items" ADD CONSTRAINT "pages_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline" ADD CONSTRAINT "pages_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_data_table_headers" ADD CONSTRAINT "pages_blocks_data_table_headers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_data_table_rows_cells" ADD CONSTRAINT "pages_blocks_data_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_data_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_data_table_rows" ADD CONSTRAINT "pages_blocks_data_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_data_table" ADD CONSTRAINT "pages_blocks_data_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_divider" ADD CONSTRAINT "pages_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_market_coverage_actions" ADD CONSTRAINT "pages_blocks_market_coverage_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_market_coverage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_market_coverage" ADD CONSTRAINT "pages_blocks_market_coverage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_embed" ADD CONSTRAINT "pages_blocks_embed_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_embed" ADD CONSTRAINT "pages_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_data_chart" ADD CONSTRAINT "pages_blocks_data_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_section_columns" ADD CONSTRAINT "pages_blocks_content_section_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_section" ADD CONSTRAINT "pages_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_article_listing" ADD CONSTRAINT "pages_blocks_article_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" ADD CONSTRAINT "_pages_v_blocks_trayport_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trayport_hero" ADD CONSTRAINT "_pages_v_blocks_trayport_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trayport_hero" ADD CONSTRAINT "_pages_v_blocks_trayport_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_heading" ADD CONSTRAINT "_pages_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_actions_actions" ADD CONSTRAINT "_pages_v_blocks_actions_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_actions" ADD CONSTRAINT "_pages_v_blocks_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media" ADD CONSTRAINT "_pages_v_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media" ADD CONSTRAINT "_pages_v_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_list_items" ADD CONSTRAINT "_pages_v_blocks_feature_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_list_items" ADD CONSTRAINT "_pages_v_blocks_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_list" ADD CONSTRAINT "_pages_v_blocks_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_statistics_items" ADD CONSTRAINT "_pages_v_blocks_statistics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_statistics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_statistics" ADD CONSTRAINT "_pages_v_blocks_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_entity_list_items" ADD CONSTRAINT "_pages_v_blocks_entity_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_entity_list_items" ADD CONSTRAINT "_pages_v_blocks_entity_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_entity_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_entity_list" ADD CONSTRAINT "_pages_v_blocks_entity_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_items" ADD CONSTRAINT "_pages_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline" ADD CONSTRAINT "_pages_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_data_table_headers" ADD CONSTRAINT "_pages_v_blocks_data_table_headers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_data_table_rows_cells" ADD CONSTRAINT "_pages_v_blocks_data_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_data_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_data_table_rows" ADD CONSTRAINT "_pages_v_blocks_data_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_data_table" ADD CONSTRAINT "_pages_v_blocks_data_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_divider" ADD CONSTRAINT "_pages_v_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" ADD CONSTRAINT "_pages_v_blocks_market_coverage_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_market_coverage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD CONSTRAINT "_pages_v_blocks_market_coverage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_embed" ADD CONSTRAINT "_pages_v_blocks_embed_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_embed" ADD CONSTRAINT "_pages_v_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_data_chart" ADD CONSTRAINT "_pages_v_blocks_data_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_section_columns" ADD CONSTRAINT "_pages_v_blocks_content_section_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_section" ADD CONSTRAINT "_pages_v_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_article_listing" ADD CONSTRAINT "_pages_v_blocks_article_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_id_pages_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_trayport_hero_actions" ADD CONSTRAINT "articles_blocks_trayport_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_trayport_hero" ADD CONSTRAINT "articles_blocks_trayport_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_trayport_hero" ADD CONSTRAINT "articles_blocks_trayport_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_heading" ADD CONSTRAINT "articles_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_rich_text" ADD CONSTRAINT "articles_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_actions_actions" ADD CONSTRAINT "articles_blocks_actions_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_actions" ADD CONSTRAINT "articles_blocks_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_media" ADD CONSTRAINT "articles_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_media" ADD CONSTRAINT "articles_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_feature_list_items" ADD CONSTRAINT "articles_blocks_feature_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_feature_list_items" ADD CONSTRAINT "articles_blocks_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_feature_list" ADD CONSTRAINT "articles_blocks_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_statistics_items" ADD CONSTRAINT "articles_blocks_statistics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_statistics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_statistics" ADD CONSTRAINT "articles_blocks_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_faq_items" ADD CONSTRAINT "articles_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_faq" ADD CONSTRAINT "articles_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_entity_list_items" ADD CONSTRAINT "articles_blocks_entity_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_entity_list_items" ADD CONSTRAINT "articles_blocks_entity_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_entity_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_entity_list" ADD CONSTRAINT "articles_blocks_entity_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_timeline_items" ADD CONSTRAINT "articles_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_timeline" ADD CONSTRAINT "articles_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_data_table_headers" ADD CONSTRAINT "articles_blocks_data_table_headers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_data_table_rows_cells" ADD CONSTRAINT "articles_blocks_data_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_data_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_data_table_rows" ADD CONSTRAINT "articles_blocks_data_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_data_table" ADD CONSTRAINT "articles_blocks_data_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_gallery_items" ADD CONSTRAINT "articles_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_gallery_items" ADD CONSTRAINT "articles_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_gallery" ADD CONSTRAINT "articles_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_divider" ADD CONSTRAINT "articles_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_market_coverage_actions" ADD CONSTRAINT "articles_blocks_market_coverage_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_market_coverage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_market_coverage" ADD CONSTRAINT "articles_blocks_market_coverage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_embed" ADD CONSTRAINT "articles_blocks_embed_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_embed" ADD CONSTRAINT "articles_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_data_chart" ADD CONSTRAINT "articles_blocks_data_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_content_section_columns" ADD CONSTRAINT "articles_blocks_content_section_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_content_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_content_section" ADD CONSTRAINT "articles_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_article_listing" ADD CONSTRAINT "articles_blocks_article_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_article_categories_fk" FOREIGN KEY ("article_categories_id") REFERENCES "public"."article_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" ADD CONSTRAINT "_articles_v_blocks_trayport_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_trayport_hero" ADD CONSTRAINT "_articles_v_blocks_trayport_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_trayport_hero" ADD CONSTRAINT "_articles_v_blocks_trayport_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_heading" ADD CONSTRAINT "_articles_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_rich_text" ADD CONSTRAINT "_articles_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_actions_actions" ADD CONSTRAINT "_articles_v_blocks_actions_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_actions" ADD CONSTRAINT "_articles_v_blocks_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_media" ADD CONSTRAINT "_articles_v_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_media" ADD CONSTRAINT "_articles_v_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_feature_list_items" ADD CONSTRAINT "_articles_v_blocks_feature_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_feature_list_items" ADD CONSTRAINT "_articles_v_blocks_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_feature_list" ADD CONSTRAINT "_articles_v_blocks_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_statistics_items" ADD CONSTRAINT "_articles_v_blocks_statistics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_statistics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_statistics" ADD CONSTRAINT "_articles_v_blocks_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_faq_items" ADD CONSTRAINT "_articles_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_faq" ADD CONSTRAINT "_articles_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_entity_list_items" ADD CONSTRAINT "_articles_v_blocks_entity_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_entity_list_items" ADD CONSTRAINT "_articles_v_blocks_entity_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_entity_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_entity_list" ADD CONSTRAINT "_articles_v_blocks_entity_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_timeline_items" ADD CONSTRAINT "_articles_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_timeline" ADD CONSTRAINT "_articles_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_data_table_headers" ADD CONSTRAINT "_articles_v_blocks_data_table_headers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_data_table_rows_cells" ADD CONSTRAINT "_articles_v_blocks_data_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_data_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_data_table_rows" ADD CONSTRAINT "_articles_v_blocks_data_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_data_table" ADD CONSTRAINT "_articles_v_blocks_data_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_gallery_items" ADD CONSTRAINT "_articles_v_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_gallery_items" ADD CONSTRAINT "_articles_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_gallery" ADD CONSTRAINT "_articles_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_divider" ADD CONSTRAINT "_articles_v_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" ADD CONSTRAINT "_articles_v_blocks_market_coverage_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_market_coverage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD CONSTRAINT "_articles_v_blocks_market_coverage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_embed" ADD CONSTRAINT "_articles_v_blocks_embed_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_embed" ADD CONSTRAINT "_articles_v_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_data_chart" ADD CONSTRAINT "_articles_v_blocks_data_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_content_section_columns" ADD CONSTRAINT "_articles_v_blocks_content_section_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_content_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_content_section" ADD CONSTRAINT "_articles_v_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_article_listing" ADD CONSTRAINT "_articles_v_blocks_article_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_article_categories_fk" FOREIGN KEY ("article_categories_id") REFERENCES "public"."article_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_trayport_hero_actions" ADD CONSTRAINT "hubs_blocks_trayport_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_trayport_hero" ADD CONSTRAINT "hubs_blocks_trayport_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_blocks_trayport_hero" ADD CONSTRAINT "hubs_blocks_trayport_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_heading" ADD CONSTRAINT "hubs_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_rich_text" ADD CONSTRAINT "hubs_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_actions_actions" ADD CONSTRAINT "hubs_blocks_actions_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_actions" ADD CONSTRAINT "hubs_blocks_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_media" ADD CONSTRAINT "hubs_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_blocks_media" ADD CONSTRAINT "hubs_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_feature_list_items" ADD CONSTRAINT "hubs_blocks_feature_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_blocks_feature_list_items" ADD CONSTRAINT "hubs_blocks_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_feature_list" ADD CONSTRAINT "hubs_blocks_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_statistics_items" ADD CONSTRAINT "hubs_blocks_statistics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_statistics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_statistics" ADD CONSTRAINT "hubs_blocks_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_faq_items" ADD CONSTRAINT "hubs_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_faq" ADD CONSTRAINT "hubs_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_entity_list_items" ADD CONSTRAINT "hubs_blocks_entity_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_blocks_entity_list_items" ADD CONSTRAINT "hubs_blocks_entity_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_entity_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_entity_list" ADD CONSTRAINT "hubs_blocks_entity_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_timeline_items" ADD CONSTRAINT "hubs_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_timeline" ADD CONSTRAINT "hubs_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_data_table_headers" ADD CONSTRAINT "hubs_blocks_data_table_headers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_data_table_rows_cells" ADD CONSTRAINT "hubs_blocks_data_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_data_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_data_table_rows" ADD CONSTRAINT "hubs_blocks_data_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_data_table" ADD CONSTRAINT "hubs_blocks_data_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_gallery_items" ADD CONSTRAINT "hubs_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_blocks_gallery_items" ADD CONSTRAINT "hubs_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_gallery" ADD CONSTRAINT "hubs_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_divider" ADD CONSTRAINT "hubs_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_market_coverage_actions" ADD CONSTRAINT "hubs_blocks_market_coverage_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_market_coverage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_market_coverage" ADD CONSTRAINT "hubs_blocks_market_coverage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_embed" ADD CONSTRAINT "hubs_blocks_embed_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_blocks_embed" ADD CONSTRAINT "hubs_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_data_chart" ADD CONSTRAINT "hubs_blocks_data_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_content_section_columns" ADD CONSTRAINT "hubs_blocks_content_section_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_content_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_content_section" ADD CONSTRAINT "hubs_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_article_listing" ADD CONSTRAINT "hubs_blocks_article_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_map_markers" ADD CONSTRAINT "hubs_map_markers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_connections" ADD CONSTRAINT "hubs_connections_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_connections" ADD CONSTRAINT "hubs_connections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs" ADD CONSTRAINT "hubs_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs" ADD CONSTRAINT "hubs_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_rels" ADD CONSTRAINT "hubs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_rels" ADD CONSTRAINT "hubs_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_rels" ADD CONSTRAINT "hubs_rels_asset_classes_fk" FOREIGN KEY ("asset_classes_id") REFERENCES "public"."asset_classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_rels" ADD CONSTRAINT "hubs_rels_venue_types_fk" FOREIGN KEY ("venue_types_id") REFERENCES "public"."venue_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_rels" ADD CONSTRAINT "hubs_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" ADD CONSTRAINT "_hubs_v_blocks_trayport_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_trayport_hero" ADD CONSTRAINT "_hubs_v_blocks_trayport_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_trayport_hero" ADD CONSTRAINT "_hubs_v_blocks_trayport_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_heading" ADD CONSTRAINT "_hubs_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_rich_text" ADD CONSTRAINT "_hubs_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_actions_actions" ADD CONSTRAINT "_hubs_v_blocks_actions_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_actions" ADD CONSTRAINT "_hubs_v_blocks_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_media" ADD CONSTRAINT "_hubs_v_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_media" ADD CONSTRAINT "_hubs_v_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ADD CONSTRAINT "_hubs_v_blocks_feature_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ADD CONSTRAINT "_hubs_v_blocks_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_feature_list" ADD CONSTRAINT "_hubs_v_blocks_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_statistics_items" ADD CONSTRAINT "_hubs_v_blocks_statistics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_statistics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_statistics" ADD CONSTRAINT "_hubs_v_blocks_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_faq_items" ADD CONSTRAINT "_hubs_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_faq" ADD CONSTRAINT "_hubs_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_entity_list_items" ADD CONSTRAINT "_hubs_v_blocks_entity_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_entity_list_items" ADD CONSTRAINT "_hubs_v_blocks_entity_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_entity_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_entity_list" ADD CONSTRAINT "_hubs_v_blocks_entity_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_timeline_items" ADD CONSTRAINT "_hubs_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_timeline" ADD CONSTRAINT "_hubs_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_data_table_headers" ADD CONSTRAINT "_hubs_v_blocks_data_table_headers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_data_table_rows_cells" ADD CONSTRAINT "_hubs_v_blocks_data_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_data_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_data_table_rows" ADD CONSTRAINT "_hubs_v_blocks_data_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_data_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_data_table" ADD CONSTRAINT "_hubs_v_blocks_data_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_gallery_items" ADD CONSTRAINT "_hubs_v_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_gallery_items" ADD CONSTRAINT "_hubs_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_gallery" ADD CONSTRAINT "_hubs_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_divider" ADD CONSTRAINT "_hubs_v_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" ADD CONSTRAINT "_hubs_v_blocks_market_coverage_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_market_coverage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD CONSTRAINT "_hubs_v_blocks_market_coverage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_embed" ADD CONSTRAINT "_hubs_v_blocks_embed_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_embed" ADD CONSTRAINT "_hubs_v_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD CONSTRAINT "_hubs_v_blocks_data_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_content_section_columns" ADD CONSTRAINT "_hubs_v_blocks_content_section_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_content_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_content_section" ADD CONSTRAINT "_hubs_v_blocks_content_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_article_listing" ADD CONSTRAINT "_hubs_v_blocks_article_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_version_map_markers" ADD CONSTRAINT "_hubs_v_version_map_markers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_version_connections" ADD CONSTRAINT "_hubs_v_version_connections_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_version_connections" ADD CONSTRAINT "_hubs_v_version_connections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v" ADD CONSTRAINT "_hubs_v_parent_id_hubs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hubs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v" ADD CONSTRAINT "_hubs_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v" ADD CONSTRAINT "_hubs_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_rels" ADD CONSTRAINT "_hubs_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_rels" ADD CONSTRAINT "_hubs_v_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_rels" ADD CONSTRAINT "_hubs_v_rels_asset_classes_fk" FOREIGN KEY ("asset_classes_id") REFERENCES "public"."asset_classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_rels" ADD CONSTRAINT "_hubs_v_rels_venue_types_fk" FOREIGN KEY ("venue_types_id") REFERENCES "public"."venue_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_rels" ADD CONSTRAINT "_hubs_v_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues" ADD CONSTRAINT "venues_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_venue_types_fk" FOREIGN KEY ("venue_types_id") REFERENCES "public"."venue_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_asset_classes_fk" FOREIGN KEY ("asset_classes_id") REFERENCES "public"."asset_classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v" ADD CONSTRAINT "_venues_v_parent_id_venues_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v" ADD CONSTRAINT "_venues_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_rels" ADD CONSTRAINT "_venues_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_rels" ADD CONSTRAINT "_venues_v_rels_venue_types_fk" FOREIGN KEY ("venue_types_id") REFERENCES "public"."venue_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_rels" ADD CONSTRAINT "_venues_v_rels_asset_classes_fk" FOREIGN KEY ("asset_classes_id") REFERENCES "public"."asset_classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_rels" ADD CONSTRAINT "_venues_v_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_parent_id_article_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders_folder_type" ADD CONSTRAINT "payload_folders_folder_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders" ADD CONSTRAINT "payload_folders_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_article_categories_fk" FOREIGN KEY ("article_categories_id") REFERENCES "public"."article_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_asset_classes_fk" FOREIGN KEY ("asset_classes_id") REFERENCES "public"."asset_classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_venue_types_fk" FOREIGN KEY ("venue_types_id") REFERENCES "public"."venue_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_folders_fk" FOREIGN KEY ("payload_folders_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_primary_items_children" ADD CONSTRAINT "navigation_primary_items_children_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_primary_items_children" ADD CONSTRAINT "navigation_primary_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_primary_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_primary_items" ADD CONSTRAINT "navigation_primary_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_utility_items" ADD CONSTRAINT "navigation_utility_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_primary_items_children" ADD CONSTRAINT "_navigation_v_version_primary_items_children_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_primary_items_children" ADD CONSTRAINT "_navigation_v_version_primary_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_primary_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_primary_items" ADD CONSTRAINT "_navigation_v_version_primary_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_utility_items" ADD CONSTRAINT "_navigation_v_version_utility_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_rels" ADD CONSTRAINT "_navigation_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_rels" ADD CONSTRAINT "_navigation_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_rels" ADD CONSTRAINT "_navigation_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_rels" ADD CONSTRAINT "_navigation_v_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_certification_marks" ADD CONSTRAINT "footer_certification_marks_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_certification_marks" ADD CONSTRAINT "footer_certification_marks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_links" ADD CONSTRAINT "_footer_v_version_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns" ADD CONSTRAINT "_footer_v_version_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_legal_links" ADD CONSTRAINT "_footer_v_version_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_certification_marks" ADD CONSTRAINT "_footer_v_version_certification_marks_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_certification_marks" ADD CONSTRAINT "_footer_v_version_certification_marks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_rels" ADD CONSTRAINT "_footer_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_rels" ADD CONSTRAINT "_footer_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_rels" ADD CONSTRAINT "_footer_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_rels" ADD CONSTRAINT "_footer_v_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_on_dark_id_media_id_fk" FOREIGN KEY ("logo_on_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_s_e_o_image_id_media_id_fk" FOREIGN KEY ("default_s_e_o_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_cookie_notice_policy_page_id_pages_id_fk" FOREIGN KEY ("cookie_notice_policy_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_social_links" ADD CONSTRAINT "_site_settings_v_version_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_logo_on_dark_id_media_id_fk" FOREIGN KEY ("version_logo_on_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_favicon_id_media_id_fk" FOREIGN KEY ("version_favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_default_s_e_o_image_id_media_id_fk" FOREIGN KEY ("version_default_s_e_o_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_cookie_notice_policy_page_id_pages_id_fk" FOREIGN KEY ("version_cookie_notice_policy_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_trayport_hero_actions_order_idx" ON "pages_blocks_trayport_hero_actions" USING btree ("_order");
  CREATE INDEX "pages_blocks_trayport_hero_actions_parent_id_idx" ON "pages_blocks_trayport_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_trayport_hero_order_idx" ON "pages_blocks_trayport_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_trayport_hero_parent_id_idx" ON "pages_blocks_trayport_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_trayport_hero_path_idx" ON "pages_blocks_trayport_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_trayport_hero_media_idx" ON "pages_blocks_trayport_hero" USING btree ("media_id");
  CREATE INDEX "pages_blocks_heading_order_idx" ON "pages_blocks_heading" USING btree ("_order");
  CREATE INDEX "pages_blocks_heading_parent_id_idx" ON "pages_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_heading_path_idx" ON "pages_blocks_heading" USING btree ("_path");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_actions_actions_order_idx" ON "pages_blocks_actions_actions" USING btree ("_order");
  CREATE INDEX "pages_blocks_actions_actions_parent_id_idx" ON "pages_blocks_actions_actions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_actions_order_idx" ON "pages_blocks_actions" USING btree ("_order");
  CREATE INDEX "pages_blocks_actions_parent_id_idx" ON "pages_blocks_actions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_actions_path_idx" ON "pages_blocks_actions" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_order_idx" ON "pages_blocks_media" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_parent_id_idx" ON "pages_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_path_idx" ON "pages_blocks_media" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_media_idx" ON "pages_blocks_media" USING btree ("media_id");
  CREATE INDEX "pages_blocks_feature_list_items_order_idx" ON "pages_blocks_feature_list_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_list_items_parent_id_idx" ON "pages_blocks_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_list_items_media_idx" ON "pages_blocks_feature_list_items" USING btree ("media_id");
  CREATE INDEX "pages_blocks_feature_list_order_idx" ON "pages_blocks_feature_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_list_parent_id_idx" ON "pages_blocks_feature_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_list_path_idx" ON "pages_blocks_feature_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_statistics_items_order_idx" ON "pages_blocks_statistics_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_statistics_items_parent_id_idx" ON "pages_blocks_statistics_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_statistics_order_idx" ON "pages_blocks_statistics" USING btree ("_order");
  CREATE INDEX "pages_blocks_statistics_parent_id_idx" ON "pages_blocks_statistics" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_statistics_path_idx" ON "pages_blocks_statistics" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_entity_list_items_order_idx" ON "pages_blocks_entity_list_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_entity_list_items_parent_id_idx" ON "pages_blocks_entity_list_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_entity_list_items_media_idx" ON "pages_blocks_entity_list_items" USING btree ("media_id");
  CREATE INDEX "pages_blocks_entity_list_order_idx" ON "pages_blocks_entity_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_entity_list_parent_id_idx" ON "pages_blocks_entity_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_entity_list_path_idx" ON "pages_blocks_entity_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_timeline_items_order_idx" ON "pages_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_items_parent_id_idx" ON "pages_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_order_idx" ON "pages_blocks_timeline" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_parent_id_idx" ON "pages_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_path_idx" ON "pages_blocks_timeline" USING btree ("_path");
  CREATE INDEX "pages_blocks_data_table_headers_order_idx" ON "pages_blocks_data_table_headers" USING btree ("_order");
  CREATE INDEX "pages_blocks_data_table_headers_parent_id_idx" ON "pages_blocks_data_table_headers" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_data_table_rows_cells_order_idx" ON "pages_blocks_data_table_rows_cells" USING btree ("_order");
  CREATE INDEX "pages_blocks_data_table_rows_cells_parent_id_idx" ON "pages_blocks_data_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_data_table_rows_order_idx" ON "pages_blocks_data_table_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_data_table_rows_parent_id_idx" ON "pages_blocks_data_table_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_data_table_order_idx" ON "pages_blocks_data_table" USING btree ("_order");
  CREATE INDEX "pages_blocks_data_table_parent_id_idx" ON "pages_blocks_data_table" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_data_table_path_idx" ON "pages_blocks_data_table" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_items_order_idx" ON "pages_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_items_parent_id_idx" ON "pages_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_items_media_idx" ON "pages_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_divider_order_idx" ON "pages_blocks_divider" USING btree ("_order");
  CREATE INDEX "pages_blocks_divider_parent_id_idx" ON "pages_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_divider_path_idx" ON "pages_blocks_divider" USING btree ("_path");
  CREATE INDEX "pages_blocks_market_coverage_actions_order_idx" ON "pages_blocks_market_coverage_actions" USING btree ("_order");
  CREATE INDEX "pages_blocks_market_coverage_actions_parent_id_idx" ON "pages_blocks_market_coverage_actions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_market_coverage_order_idx" ON "pages_blocks_market_coverage" USING btree ("_order");
  CREATE INDEX "pages_blocks_market_coverage_parent_id_idx" ON "pages_blocks_market_coverage" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_market_coverage_path_idx" ON "pages_blocks_market_coverage" USING btree ("_path");
  CREATE INDEX "pages_blocks_embed_order_idx" ON "pages_blocks_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_embed_parent_id_idx" ON "pages_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_embed_path_idx" ON "pages_blocks_embed" USING btree ("_path");
  CREATE INDEX "pages_blocks_embed_poster_idx" ON "pages_blocks_embed" USING btree ("poster_id");
  CREATE INDEX "pages_blocks_data_chart_order_idx" ON "pages_blocks_data_chart" USING btree ("_order");
  CREATE INDEX "pages_blocks_data_chart_parent_id_idx" ON "pages_blocks_data_chart" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_data_chart_path_idx" ON "pages_blocks_data_chart" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_section_columns_order_idx" ON "pages_blocks_content_section_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_section_columns_parent_id_idx" ON "pages_blocks_content_section_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_section_order_idx" ON "pages_blocks_content_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_section_parent_id_idx" ON "pages_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_section_path_idx" ON "pages_blocks_content_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_article_listing_order_idx" ON "pages_blocks_article_listing" USING btree ("_order");
  CREATE INDEX "pages_blocks_article_listing_parent_id_idx" ON "pages_blocks_article_listing" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_article_listing_path_idx" ON "pages_blocks_article_listing" USING btree ("_path");
  CREATE INDEX "pages_title_idx" ON "pages" USING btree ("title");
  CREATE INDEX "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE UNIQUE INDEX "pages_path_idx" ON "pages" USING btree ("path");
  CREATE UNIQUE INDEX "pages_legacy_source_legacy_source_key_idx" ON "pages" USING btree ("legacy_source_key");
  CREATE INDEX "pages_legacy_source_legacy_source_source_idx" ON "pages" USING btree ("legacy_source_source");
  CREATE INDEX "pages_legacy_source_legacy_source_legacy_id_idx" ON "pages" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "pages_legacy_source_legacy_source_content_hash_idx" ON "pages" USING btree ("legacy_source_content_hash");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_regions_id_idx" ON "pages_rels" USING btree ("regions_id");
  CREATE INDEX "_pages_v_blocks_trayport_hero_actions_order_idx" ON "_pages_v_blocks_trayport_hero_actions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_trayport_hero_actions_parent_id_idx" ON "_pages_v_blocks_trayport_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_trayport_hero_order_idx" ON "_pages_v_blocks_trayport_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_trayport_hero_parent_id_idx" ON "_pages_v_blocks_trayport_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_trayport_hero_path_idx" ON "_pages_v_blocks_trayport_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_trayport_hero_media_idx" ON "_pages_v_blocks_trayport_hero" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_heading_order_idx" ON "_pages_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_heading_parent_id_idx" ON "_pages_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_heading_path_idx" ON "_pages_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_actions_actions_order_idx" ON "_pages_v_blocks_actions_actions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_actions_actions_parent_id_idx" ON "_pages_v_blocks_actions_actions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_actions_order_idx" ON "_pages_v_blocks_actions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_actions_parent_id_idx" ON "_pages_v_blocks_actions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_actions_path_idx" ON "_pages_v_blocks_actions" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_order_idx" ON "_pages_v_blocks_media" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_parent_id_idx" ON "_pages_v_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_path_idx" ON "_pages_v_blocks_media" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_media_idx" ON "_pages_v_blocks_media" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_feature_list_items_order_idx" ON "_pages_v_blocks_feature_list_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_list_items_parent_id_idx" ON "_pages_v_blocks_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_list_items_media_idx" ON "_pages_v_blocks_feature_list_items" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_feature_list_order_idx" ON "_pages_v_blocks_feature_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_list_parent_id_idx" ON "_pages_v_blocks_feature_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_list_path_idx" ON "_pages_v_blocks_feature_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_statistics_items_order_idx" ON "_pages_v_blocks_statistics_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_statistics_items_parent_id_idx" ON "_pages_v_blocks_statistics_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_statistics_order_idx" ON "_pages_v_blocks_statistics" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_statistics_parent_id_idx" ON "_pages_v_blocks_statistics" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_statistics_path_idx" ON "_pages_v_blocks_statistics" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_entity_list_items_order_idx" ON "_pages_v_blocks_entity_list_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_entity_list_items_parent_id_idx" ON "_pages_v_blocks_entity_list_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_entity_list_items_media_idx" ON "_pages_v_blocks_entity_list_items" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_entity_list_order_idx" ON "_pages_v_blocks_entity_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_entity_list_parent_id_idx" ON "_pages_v_blocks_entity_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_entity_list_path_idx" ON "_pages_v_blocks_entity_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_timeline_items_order_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_items_parent_id_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_order_idx" ON "_pages_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_parent_id_idx" ON "_pages_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_path_idx" ON "_pages_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_data_table_headers_order_idx" ON "_pages_v_blocks_data_table_headers" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_data_table_headers_parent_id_idx" ON "_pages_v_blocks_data_table_headers" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_data_table_rows_cells_order_idx" ON "_pages_v_blocks_data_table_rows_cells" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_data_table_rows_cells_parent_id_idx" ON "_pages_v_blocks_data_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_data_table_rows_order_idx" ON "_pages_v_blocks_data_table_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_data_table_rows_parent_id_idx" ON "_pages_v_blocks_data_table_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_data_table_order_idx" ON "_pages_v_blocks_data_table" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_data_table_parent_id_idx" ON "_pages_v_blocks_data_table" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_data_table_path_idx" ON "_pages_v_blocks_data_table" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_items_order_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_items_parent_id_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_items_media_idx" ON "_pages_v_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_divider_order_idx" ON "_pages_v_blocks_divider" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_divider_parent_id_idx" ON "_pages_v_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_divider_path_idx" ON "_pages_v_blocks_divider" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_market_coverage_actions_order_idx" ON "_pages_v_blocks_market_coverage_actions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_market_coverage_actions_parent_id_idx" ON "_pages_v_blocks_market_coverage_actions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_market_coverage_order_idx" ON "_pages_v_blocks_market_coverage" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_market_coverage_parent_id_idx" ON "_pages_v_blocks_market_coverage" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_market_coverage_path_idx" ON "_pages_v_blocks_market_coverage" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_embed_order_idx" ON "_pages_v_blocks_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_embed_parent_id_idx" ON "_pages_v_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_embed_path_idx" ON "_pages_v_blocks_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_embed_poster_idx" ON "_pages_v_blocks_embed" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_data_chart_order_idx" ON "_pages_v_blocks_data_chart" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_data_chart_parent_id_idx" ON "_pages_v_blocks_data_chart" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_data_chart_path_idx" ON "_pages_v_blocks_data_chart" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_section_columns_order_idx" ON "_pages_v_blocks_content_section_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_section_columns_parent_id_idx" ON "_pages_v_blocks_content_section_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_section_order_idx" ON "_pages_v_blocks_content_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_section_parent_id_idx" ON "_pages_v_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_section_path_idx" ON "_pages_v_blocks_content_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_article_listing_order_idx" ON "_pages_v_blocks_article_listing" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_article_listing_parent_id_idx" ON "_pages_v_blocks_article_listing" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_article_listing_path_idx" ON "_pages_v_blocks_article_listing" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_title_idx" ON "_pages_v" USING btree ("version_title");
  CREATE INDEX "_pages_v_version_version_parent_idx" ON "_pages_v" USING btree ("version_parent_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_path_idx" ON "_pages_v" USING btree ("version_path");
  CREATE INDEX "_pages_v_version_legacy_source_version_legacy_source_key_idx" ON "_pages_v" USING btree ("version_legacy_source_key");
  CREATE INDEX "_pages_v_version_legacy_source_version_legacy_source_sou_idx" ON "_pages_v" USING btree ("version_legacy_source_source");
  CREATE INDEX "_pages_v_version_legacy_source_version_legacy_source_leg_idx" ON "_pages_v" USING btree ("version_legacy_source_legacy_id");
  CREATE INDEX "_pages_v_version_legacy_source_version_legacy_source_con_idx" ON "_pages_v" USING btree ("version_legacy_source_content_hash");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_regions_id_idx" ON "_pages_v_rels" USING btree ("regions_id");
  CREATE INDEX "articles_blocks_trayport_hero_actions_order_idx" ON "articles_blocks_trayport_hero_actions" USING btree ("_order");
  CREATE INDEX "articles_blocks_trayport_hero_actions_parent_id_idx" ON "articles_blocks_trayport_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_trayport_hero_order_idx" ON "articles_blocks_trayport_hero" USING btree ("_order");
  CREATE INDEX "articles_blocks_trayport_hero_parent_id_idx" ON "articles_blocks_trayport_hero" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_trayport_hero_path_idx" ON "articles_blocks_trayport_hero" USING btree ("_path");
  CREATE INDEX "articles_blocks_trayport_hero_media_idx" ON "articles_blocks_trayport_hero" USING btree ("media_id");
  CREATE INDEX "articles_blocks_heading_order_idx" ON "articles_blocks_heading" USING btree ("_order");
  CREATE INDEX "articles_blocks_heading_parent_id_idx" ON "articles_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_heading_path_idx" ON "articles_blocks_heading" USING btree ("_path");
  CREATE INDEX "articles_blocks_rich_text_order_idx" ON "articles_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "articles_blocks_rich_text_parent_id_idx" ON "articles_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_rich_text_path_idx" ON "articles_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "articles_blocks_actions_actions_order_idx" ON "articles_blocks_actions_actions" USING btree ("_order");
  CREATE INDEX "articles_blocks_actions_actions_parent_id_idx" ON "articles_blocks_actions_actions" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_actions_order_idx" ON "articles_blocks_actions" USING btree ("_order");
  CREATE INDEX "articles_blocks_actions_parent_id_idx" ON "articles_blocks_actions" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_actions_path_idx" ON "articles_blocks_actions" USING btree ("_path");
  CREATE INDEX "articles_blocks_media_order_idx" ON "articles_blocks_media" USING btree ("_order");
  CREATE INDEX "articles_blocks_media_parent_id_idx" ON "articles_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_media_path_idx" ON "articles_blocks_media" USING btree ("_path");
  CREATE INDEX "articles_blocks_media_media_idx" ON "articles_blocks_media" USING btree ("media_id");
  CREATE INDEX "articles_blocks_feature_list_items_order_idx" ON "articles_blocks_feature_list_items" USING btree ("_order");
  CREATE INDEX "articles_blocks_feature_list_items_parent_id_idx" ON "articles_blocks_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_feature_list_items_media_idx" ON "articles_blocks_feature_list_items" USING btree ("media_id");
  CREATE INDEX "articles_blocks_feature_list_order_idx" ON "articles_blocks_feature_list" USING btree ("_order");
  CREATE INDEX "articles_blocks_feature_list_parent_id_idx" ON "articles_blocks_feature_list" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_feature_list_path_idx" ON "articles_blocks_feature_list" USING btree ("_path");
  CREATE INDEX "articles_blocks_statistics_items_order_idx" ON "articles_blocks_statistics_items" USING btree ("_order");
  CREATE INDEX "articles_blocks_statistics_items_parent_id_idx" ON "articles_blocks_statistics_items" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_statistics_order_idx" ON "articles_blocks_statistics" USING btree ("_order");
  CREATE INDEX "articles_blocks_statistics_parent_id_idx" ON "articles_blocks_statistics" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_statistics_path_idx" ON "articles_blocks_statistics" USING btree ("_path");
  CREATE INDEX "articles_blocks_faq_items_order_idx" ON "articles_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "articles_blocks_faq_items_parent_id_idx" ON "articles_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_faq_order_idx" ON "articles_blocks_faq" USING btree ("_order");
  CREATE INDEX "articles_blocks_faq_parent_id_idx" ON "articles_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_faq_path_idx" ON "articles_blocks_faq" USING btree ("_path");
  CREATE INDEX "articles_blocks_entity_list_items_order_idx" ON "articles_blocks_entity_list_items" USING btree ("_order");
  CREATE INDEX "articles_blocks_entity_list_items_parent_id_idx" ON "articles_blocks_entity_list_items" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_entity_list_items_media_idx" ON "articles_blocks_entity_list_items" USING btree ("media_id");
  CREATE INDEX "articles_blocks_entity_list_order_idx" ON "articles_blocks_entity_list" USING btree ("_order");
  CREATE INDEX "articles_blocks_entity_list_parent_id_idx" ON "articles_blocks_entity_list" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_entity_list_path_idx" ON "articles_blocks_entity_list" USING btree ("_path");
  CREATE INDEX "articles_blocks_timeline_items_order_idx" ON "articles_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "articles_blocks_timeline_items_parent_id_idx" ON "articles_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_timeline_order_idx" ON "articles_blocks_timeline" USING btree ("_order");
  CREATE INDEX "articles_blocks_timeline_parent_id_idx" ON "articles_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_timeline_path_idx" ON "articles_blocks_timeline" USING btree ("_path");
  CREATE INDEX "articles_blocks_data_table_headers_order_idx" ON "articles_blocks_data_table_headers" USING btree ("_order");
  CREATE INDEX "articles_blocks_data_table_headers_parent_id_idx" ON "articles_blocks_data_table_headers" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_data_table_rows_cells_order_idx" ON "articles_blocks_data_table_rows_cells" USING btree ("_order");
  CREATE INDEX "articles_blocks_data_table_rows_cells_parent_id_idx" ON "articles_blocks_data_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_data_table_rows_order_idx" ON "articles_blocks_data_table_rows" USING btree ("_order");
  CREATE INDEX "articles_blocks_data_table_rows_parent_id_idx" ON "articles_blocks_data_table_rows" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_data_table_order_idx" ON "articles_blocks_data_table" USING btree ("_order");
  CREATE INDEX "articles_blocks_data_table_parent_id_idx" ON "articles_blocks_data_table" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_data_table_path_idx" ON "articles_blocks_data_table" USING btree ("_path");
  CREATE INDEX "articles_blocks_gallery_items_order_idx" ON "articles_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "articles_blocks_gallery_items_parent_id_idx" ON "articles_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_gallery_items_media_idx" ON "articles_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "articles_blocks_gallery_order_idx" ON "articles_blocks_gallery" USING btree ("_order");
  CREATE INDEX "articles_blocks_gallery_parent_id_idx" ON "articles_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_gallery_path_idx" ON "articles_blocks_gallery" USING btree ("_path");
  CREATE INDEX "articles_blocks_divider_order_idx" ON "articles_blocks_divider" USING btree ("_order");
  CREATE INDEX "articles_blocks_divider_parent_id_idx" ON "articles_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_divider_path_idx" ON "articles_blocks_divider" USING btree ("_path");
  CREATE INDEX "articles_blocks_market_coverage_actions_order_idx" ON "articles_blocks_market_coverage_actions" USING btree ("_order");
  CREATE INDEX "articles_blocks_market_coverage_actions_parent_id_idx" ON "articles_blocks_market_coverage_actions" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_market_coverage_order_idx" ON "articles_blocks_market_coverage" USING btree ("_order");
  CREATE INDEX "articles_blocks_market_coverage_parent_id_idx" ON "articles_blocks_market_coverage" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_market_coverage_path_idx" ON "articles_blocks_market_coverage" USING btree ("_path");
  CREATE INDEX "articles_blocks_embed_order_idx" ON "articles_blocks_embed" USING btree ("_order");
  CREATE INDEX "articles_blocks_embed_parent_id_idx" ON "articles_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_embed_path_idx" ON "articles_blocks_embed" USING btree ("_path");
  CREATE INDEX "articles_blocks_embed_poster_idx" ON "articles_blocks_embed" USING btree ("poster_id");
  CREATE INDEX "articles_blocks_data_chart_order_idx" ON "articles_blocks_data_chart" USING btree ("_order");
  CREATE INDEX "articles_blocks_data_chart_parent_id_idx" ON "articles_blocks_data_chart" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_data_chart_path_idx" ON "articles_blocks_data_chart" USING btree ("_path");
  CREATE INDEX "articles_blocks_content_section_columns_order_idx" ON "articles_blocks_content_section_columns" USING btree ("_order");
  CREATE INDEX "articles_blocks_content_section_columns_parent_id_idx" ON "articles_blocks_content_section_columns" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_content_section_order_idx" ON "articles_blocks_content_section" USING btree ("_order");
  CREATE INDEX "articles_blocks_content_section_parent_id_idx" ON "articles_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_content_section_path_idx" ON "articles_blocks_content_section" USING btree ("_path");
  CREATE INDEX "articles_blocks_article_listing_order_idx" ON "articles_blocks_article_listing" USING btree ("_order");
  CREATE INDEX "articles_blocks_article_listing_parent_id_idx" ON "articles_blocks_article_listing" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_article_listing_path_idx" ON "articles_blocks_article_listing" USING btree ("_path");
  CREATE INDEX "articles_title_idx" ON "articles" USING btree ("title");
  CREATE INDEX "articles_hero_media_idx" ON "articles" USING btree ("hero_media_id");
  CREATE INDEX "articles_featured_idx" ON "articles" USING btree ("featured");
  CREATE INDEX "articles_featured_order_idx" ON "articles" USING btree ("featured_order");
  CREATE INDEX "articles_meta_meta_image_idx" ON "articles" USING btree ("meta_image_id");
  CREATE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE UNIQUE INDEX "articles_path_idx" ON "articles" USING btree ("path");
  CREATE UNIQUE INDEX "articles_legacy_source_legacy_source_key_idx" ON "articles" USING btree ("legacy_source_key");
  CREATE INDEX "articles_legacy_source_legacy_source_source_idx" ON "articles" USING btree ("legacy_source_source");
  CREATE INDEX "articles_legacy_source_legacy_source_legacy_id_idx" ON "articles" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "articles_legacy_source_legacy_source_content_hash_idx" ON "articles" USING btree ("legacy_source_content_hash");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_regions_id_idx" ON "articles_rels" USING btree ("regions_id");
  CREATE INDEX "articles_rels_article_categories_id_idx" ON "articles_rels" USING btree ("article_categories_id");
  CREATE INDEX "articles_rels_articles_id_idx" ON "articles_rels" USING btree ("articles_id");
  CREATE INDEX "articles_rels_hubs_id_idx" ON "articles_rels" USING btree ("hubs_id");
  CREATE INDEX "_articles_v_blocks_trayport_hero_actions_order_idx" ON "_articles_v_blocks_trayport_hero_actions" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_trayport_hero_actions_parent_id_idx" ON "_articles_v_blocks_trayport_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_trayport_hero_order_idx" ON "_articles_v_blocks_trayport_hero" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_trayport_hero_parent_id_idx" ON "_articles_v_blocks_trayport_hero" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_trayport_hero_path_idx" ON "_articles_v_blocks_trayport_hero" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_trayport_hero_media_idx" ON "_articles_v_blocks_trayport_hero" USING btree ("media_id");
  CREATE INDEX "_articles_v_blocks_heading_order_idx" ON "_articles_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_heading_parent_id_idx" ON "_articles_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_heading_path_idx" ON "_articles_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_rich_text_order_idx" ON "_articles_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_rich_text_parent_id_idx" ON "_articles_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_rich_text_path_idx" ON "_articles_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_actions_actions_order_idx" ON "_articles_v_blocks_actions_actions" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_actions_actions_parent_id_idx" ON "_articles_v_blocks_actions_actions" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_actions_order_idx" ON "_articles_v_blocks_actions" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_actions_parent_id_idx" ON "_articles_v_blocks_actions" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_actions_path_idx" ON "_articles_v_blocks_actions" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_media_order_idx" ON "_articles_v_blocks_media" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_media_parent_id_idx" ON "_articles_v_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_media_path_idx" ON "_articles_v_blocks_media" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_media_media_idx" ON "_articles_v_blocks_media" USING btree ("media_id");
  CREATE INDEX "_articles_v_blocks_feature_list_items_order_idx" ON "_articles_v_blocks_feature_list_items" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_feature_list_items_parent_id_idx" ON "_articles_v_blocks_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_feature_list_items_media_idx" ON "_articles_v_blocks_feature_list_items" USING btree ("media_id");
  CREATE INDEX "_articles_v_blocks_feature_list_order_idx" ON "_articles_v_blocks_feature_list" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_feature_list_parent_id_idx" ON "_articles_v_blocks_feature_list" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_feature_list_path_idx" ON "_articles_v_blocks_feature_list" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_statistics_items_order_idx" ON "_articles_v_blocks_statistics_items" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_statistics_items_parent_id_idx" ON "_articles_v_blocks_statistics_items" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_statistics_order_idx" ON "_articles_v_blocks_statistics" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_statistics_parent_id_idx" ON "_articles_v_blocks_statistics" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_statistics_path_idx" ON "_articles_v_blocks_statistics" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_faq_items_order_idx" ON "_articles_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_faq_items_parent_id_idx" ON "_articles_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_faq_order_idx" ON "_articles_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_faq_parent_id_idx" ON "_articles_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_faq_path_idx" ON "_articles_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_entity_list_items_order_idx" ON "_articles_v_blocks_entity_list_items" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_entity_list_items_parent_id_idx" ON "_articles_v_blocks_entity_list_items" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_entity_list_items_media_idx" ON "_articles_v_blocks_entity_list_items" USING btree ("media_id");
  CREATE INDEX "_articles_v_blocks_entity_list_order_idx" ON "_articles_v_blocks_entity_list" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_entity_list_parent_id_idx" ON "_articles_v_blocks_entity_list" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_entity_list_path_idx" ON "_articles_v_blocks_entity_list" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_timeline_items_order_idx" ON "_articles_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_timeline_items_parent_id_idx" ON "_articles_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_timeline_order_idx" ON "_articles_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_timeline_parent_id_idx" ON "_articles_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_timeline_path_idx" ON "_articles_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_data_table_headers_order_idx" ON "_articles_v_blocks_data_table_headers" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_data_table_headers_parent_id_idx" ON "_articles_v_blocks_data_table_headers" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_data_table_rows_cells_order_idx" ON "_articles_v_blocks_data_table_rows_cells" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_data_table_rows_cells_parent_id_idx" ON "_articles_v_blocks_data_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_data_table_rows_order_idx" ON "_articles_v_blocks_data_table_rows" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_data_table_rows_parent_id_idx" ON "_articles_v_blocks_data_table_rows" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_data_table_order_idx" ON "_articles_v_blocks_data_table" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_data_table_parent_id_idx" ON "_articles_v_blocks_data_table" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_data_table_path_idx" ON "_articles_v_blocks_data_table" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_gallery_items_order_idx" ON "_articles_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_gallery_items_parent_id_idx" ON "_articles_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_gallery_items_media_idx" ON "_articles_v_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "_articles_v_blocks_gallery_order_idx" ON "_articles_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_gallery_parent_id_idx" ON "_articles_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_gallery_path_idx" ON "_articles_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_divider_order_idx" ON "_articles_v_blocks_divider" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_divider_parent_id_idx" ON "_articles_v_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_divider_path_idx" ON "_articles_v_blocks_divider" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_market_coverage_actions_order_idx" ON "_articles_v_blocks_market_coverage_actions" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_market_coverage_actions_parent_id_idx" ON "_articles_v_blocks_market_coverage_actions" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_market_coverage_order_idx" ON "_articles_v_blocks_market_coverage" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_market_coverage_parent_id_idx" ON "_articles_v_blocks_market_coverage" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_market_coverage_path_idx" ON "_articles_v_blocks_market_coverage" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_embed_order_idx" ON "_articles_v_blocks_embed" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_embed_parent_id_idx" ON "_articles_v_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_embed_path_idx" ON "_articles_v_blocks_embed" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_embed_poster_idx" ON "_articles_v_blocks_embed" USING btree ("poster_id");
  CREATE INDEX "_articles_v_blocks_data_chart_order_idx" ON "_articles_v_blocks_data_chart" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_data_chart_parent_id_idx" ON "_articles_v_blocks_data_chart" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_data_chart_path_idx" ON "_articles_v_blocks_data_chart" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_content_section_columns_order_idx" ON "_articles_v_blocks_content_section_columns" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_content_section_columns_parent_id_idx" ON "_articles_v_blocks_content_section_columns" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_content_section_order_idx" ON "_articles_v_blocks_content_section" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_content_section_parent_id_idx" ON "_articles_v_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_content_section_path_idx" ON "_articles_v_blocks_content_section" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_article_listing_order_idx" ON "_articles_v_blocks_article_listing" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_article_listing_parent_id_idx" ON "_articles_v_blocks_article_listing" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_article_listing_path_idx" ON "_articles_v_blocks_article_listing" USING btree ("_path");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_title_idx" ON "_articles_v" USING btree ("version_title");
  CREATE INDEX "_articles_v_version_version_hero_media_idx" ON "_articles_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_articles_v_version_version_featured_idx" ON "_articles_v" USING btree ("version_featured");
  CREATE INDEX "_articles_v_version_version_featured_order_idx" ON "_articles_v" USING btree ("version_featured_order");
  CREATE INDEX "_articles_v_version_meta_version_meta_image_idx" ON "_articles_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_path_idx" ON "_articles_v" USING btree ("version_path");
  CREATE INDEX "_articles_v_version_legacy_source_version_legacy_source__idx" ON "_articles_v" USING btree ("version_legacy_source_key");
  CREATE INDEX "_articles_v_version_legacy_source_version_legacy_sourc_1_idx" ON "_articles_v" USING btree ("version_legacy_source_source");
  CREATE INDEX "_articles_v_version_legacy_source_version_legacy_sourc_2_idx" ON "_articles_v" USING btree ("version_legacy_source_legacy_id");
  CREATE INDEX "_articles_v_version_legacy_source_version_legacy_sourc_3_idx" ON "_articles_v" USING btree ("version_legacy_source_content_hash");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_autosave_idx" ON "_articles_v" USING btree ("autosave");
  CREATE INDEX "_articles_v_rels_order_idx" ON "_articles_v_rels" USING btree ("order");
  CREATE INDEX "_articles_v_rels_parent_idx" ON "_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articles_v_rels_path_idx" ON "_articles_v_rels" USING btree ("path");
  CREATE INDEX "_articles_v_rels_regions_id_idx" ON "_articles_v_rels" USING btree ("regions_id");
  CREATE INDEX "_articles_v_rels_article_categories_id_idx" ON "_articles_v_rels" USING btree ("article_categories_id");
  CREATE INDEX "_articles_v_rels_articles_id_idx" ON "_articles_v_rels" USING btree ("articles_id");
  CREATE INDEX "_articles_v_rels_hubs_id_idx" ON "_articles_v_rels" USING btree ("hubs_id");
  CREATE INDEX "hubs_blocks_trayport_hero_actions_order_idx" ON "hubs_blocks_trayport_hero_actions" USING btree ("_order");
  CREATE INDEX "hubs_blocks_trayport_hero_actions_parent_id_idx" ON "hubs_blocks_trayport_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_trayport_hero_order_idx" ON "hubs_blocks_trayport_hero" USING btree ("_order");
  CREATE INDEX "hubs_blocks_trayport_hero_parent_id_idx" ON "hubs_blocks_trayport_hero" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_trayport_hero_path_idx" ON "hubs_blocks_trayport_hero" USING btree ("_path");
  CREATE INDEX "hubs_blocks_trayport_hero_media_idx" ON "hubs_blocks_trayport_hero" USING btree ("media_id");
  CREATE INDEX "hubs_blocks_heading_order_idx" ON "hubs_blocks_heading" USING btree ("_order");
  CREATE INDEX "hubs_blocks_heading_parent_id_idx" ON "hubs_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_heading_path_idx" ON "hubs_blocks_heading" USING btree ("_path");
  CREATE INDEX "hubs_blocks_rich_text_order_idx" ON "hubs_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "hubs_blocks_rich_text_parent_id_idx" ON "hubs_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_rich_text_path_idx" ON "hubs_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "hubs_blocks_actions_actions_order_idx" ON "hubs_blocks_actions_actions" USING btree ("_order");
  CREATE INDEX "hubs_blocks_actions_actions_parent_id_idx" ON "hubs_blocks_actions_actions" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_actions_order_idx" ON "hubs_blocks_actions" USING btree ("_order");
  CREATE INDEX "hubs_blocks_actions_parent_id_idx" ON "hubs_blocks_actions" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_actions_path_idx" ON "hubs_blocks_actions" USING btree ("_path");
  CREATE INDEX "hubs_blocks_media_order_idx" ON "hubs_blocks_media" USING btree ("_order");
  CREATE INDEX "hubs_blocks_media_parent_id_idx" ON "hubs_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_media_path_idx" ON "hubs_blocks_media" USING btree ("_path");
  CREATE INDEX "hubs_blocks_media_media_idx" ON "hubs_blocks_media" USING btree ("media_id");
  CREATE INDEX "hubs_blocks_feature_list_items_order_idx" ON "hubs_blocks_feature_list_items" USING btree ("_order");
  CREATE INDEX "hubs_blocks_feature_list_items_parent_id_idx" ON "hubs_blocks_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_feature_list_items_media_idx" ON "hubs_blocks_feature_list_items" USING btree ("media_id");
  CREATE INDEX "hubs_blocks_feature_list_order_idx" ON "hubs_blocks_feature_list" USING btree ("_order");
  CREATE INDEX "hubs_blocks_feature_list_parent_id_idx" ON "hubs_blocks_feature_list" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_feature_list_path_idx" ON "hubs_blocks_feature_list" USING btree ("_path");
  CREATE INDEX "hubs_blocks_statistics_items_order_idx" ON "hubs_blocks_statistics_items" USING btree ("_order");
  CREATE INDEX "hubs_blocks_statistics_items_parent_id_idx" ON "hubs_blocks_statistics_items" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_statistics_order_idx" ON "hubs_blocks_statistics" USING btree ("_order");
  CREATE INDEX "hubs_blocks_statistics_parent_id_idx" ON "hubs_blocks_statistics" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_statistics_path_idx" ON "hubs_blocks_statistics" USING btree ("_path");
  CREATE INDEX "hubs_blocks_faq_items_order_idx" ON "hubs_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "hubs_blocks_faq_items_parent_id_idx" ON "hubs_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_faq_order_idx" ON "hubs_blocks_faq" USING btree ("_order");
  CREATE INDEX "hubs_blocks_faq_parent_id_idx" ON "hubs_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_faq_path_idx" ON "hubs_blocks_faq" USING btree ("_path");
  CREATE INDEX "hubs_blocks_entity_list_items_order_idx" ON "hubs_blocks_entity_list_items" USING btree ("_order");
  CREATE INDEX "hubs_blocks_entity_list_items_parent_id_idx" ON "hubs_blocks_entity_list_items" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_entity_list_items_media_idx" ON "hubs_blocks_entity_list_items" USING btree ("media_id");
  CREATE INDEX "hubs_blocks_entity_list_order_idx" ON "hubs_blocks_entity_list" USING btree ("_order");
  CREATE INDEX "hubs_blocks_entity_list_parent_id_idx" ON "hubs_blocks_entity_list" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_entity_list_path_idx" ON "hubs_blocks_entity_list" USING btree ("_path");
  CREATE INDEX "hubs_blocks_timeline_items_order_idx" ON "hubs_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "hubs_blocks_timeline_items_parent_id_idx" ON "hubs_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_timeline_order_idx" ON "hubs_blocks_timeline" USING btree ("_order");
  CREATE INDEX "hubs_blocks_timeline_parent_id_idx" ON "hubs_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_timeline_path_idx" ON "hubs_blocks_timeline" USING btree ("_path");
  CREATE INDEX "hubs_blocks_data_table_headers_order_idx" ON "hubs_blocks_data_table_headers" USING btree ("_order");
  CREATE INDEX "hubs_blocks_data_table_headers_parent_id_idx" ON "hubs_blocks_data_table_headers" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_data_table_rows_cells_order_idx" ON "hubs_blocks_data_table_rows_cells" USING btree ("_order");
  CREATE INDEX "hubs_blocks_data_table_rows_cells_parent_id_idx" ON "hubs_blocks_data_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_data_table_rows_order_idx" ON "hubs_blocks_data_table_rows" USING btree ("_order");
  CREATE INDEX "hubs_blocks_data_table_rows_parent_id_idx" ON "hubs_blocks_data_table_rows" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_data_table_order_idx" ON "hubs_blocks_data_table" USING btree ("_order");
  CREATE INDEX "hubs_blocks_data_table_parent_id_idx" ON "hubs_blocks_data_table" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_data_table_path_idx" ON "hubs_blocks_data_table" USING btree ("_path");
  CREATE INDEX "hubs_blocks_gallery_items_order_idx" ON "hubs_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "hubs_blocks_gallery_items_parent_id_idx" ON "hubs_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_gallery_items_media_idx" ON "hubs_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "hubs_blocks_gallery_order_idx" ON "hubs_blocks_gallery" USING btree ("_order");
  CREATE INDEX "hubs_blocks_gallery_parent_id_idx" ON "hubs_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_gallery_path_idx" ON "hubs_blocks_gallery" USING btree ("_path");
  CREATE INDEX "hubs_blocks_divider_order_idx" ON "hubs_blocks_divider" USING btree ("_order");
  CREATE INDEX "hubs_blocks_divider_parent_id_idx" ON "hubs_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_divider_path_idx" ON "hubs_blocks_divider" USING btree ("_path");
  CREATE INDEX "hubs_blocks_market_coverage_actions_order_idx" ON "hubs_blocks_market_coverage_actions" USING btree ("_order");
  CREATE INDEX "hubs_blocks_market_coverage_actions_parent_id_idx" ON "hubs_blocks_market_coverage_actions" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_market_coverage_order_idx" ON "hubs_blocks_market_coverage" USING btree ("_order");
  CREATE INDEX "hubs_blocks_market_coverage_parent_id_idx" ON "hubs_blocks_market_coverage" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_market_coverage_path_idx" ON "hubs_blocks_market_coverage" USING btree ("_path");
  CREATE INDEX "hubs_blocks_embed_order_idx" ON "hubs_blocks_embed" USING btree ("_order");
  CREATE INDEX "hubs_blocks_embed_parent_id_idx" ON "hubs_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_embed_path_idx" ON "hubs_blocks_embed" USING btree ("_path");
  CREATE INDEX "hubs_blocks_embed_poster_idx" ON "hubs_blocks_embed" USING btree ("poster_id");
  CREATE INDEX "hubs_blocks_data_chart_order_idx" ON "hubs_blocks_data_chart" USING btree ("_order");
  CREATE INDEX "hubs_blocks_data_chart_parent_id_idx" ON "hubs_blocks_data_chart" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_data_chart_path_idx" ON "hubs_blocks_data_chart" USING btree ("_path");
  CREATE INDEX "hubs_blocks_content_section_columns_order_idx" ON "hubs_blocks_content_section_columns" USING btree ("_order");
  CREATE INDEX "hubs_blocks_content_section_columns_parent_id_idx" ON "hubs_blocks_content_section_columns" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_content_section_order_idx" ON "hubs_blocks_content_section" USING btree ("_order");
  CREATE INDEX "hubs_blocks_content_section_parent_id_idx" ON "hubs_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_content_section_path_idx" ON "hubs_blocks_content_section" USING btree ("_path");
  CREATE INDEX "hubs_blocks_article_listing_order_idx" ON "hubs_blocks_article_listing" USING btree ("_order");
  CREATE INDEX "hubs_blocks_article_listing_parent_id_idx" ON "hubs_blocks_article_listing" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_article_listing_path_idx" ON "hubs_blocks_article_listing" USING btree ("_path");
  CREATE INDEX "hubs_map_markers_order_idx" ON "hubs_map_markers" USING btree ("_order");
  CREATE INDEX "hubs_map_markers_parent_id_idx" ON "hubs_map_markers" USING btree ("_parent_id");
  CREATE INDEX "hubs_connections_order_idx" ON "hubs_connections" USING btree ("_order");
  CREATE INDEX "hubs_connections_parent_id_idx" ON "hubs_connections" USING btree ("_parent_id");
  CREATE INDEX "hubs_connections_venue_idx" ON "hubs_connections" USING btree ("venue_id");
  CREATE INDEX "hubs_title_idx" ON "hubs" USING btree ("title");
  CREATE INDEX "hubs_hero_media_idx" ON "hubs" USING btree ("hero_media_id");
  CREATE INDEX "hubs_code_idx" ON "hubs" USING btree ("code");
  CREATE INDEX "hubs_market_data_key_idx" ON "hubs" USING btree ("market_data_key");
  CREATE INDEX "hubs_meta_meta_image_idx" ON "hubs" USING btree ("meta_image_id");
  CREATE INDEX "hubs_slug_idx" ON "hubs" USING btree ("slug");
  CREATE UNIQUE INDEX "hubs_path_idx" ON "hubs" USING btree ("path");
  CREATE UNIQUE INDEX "hubs_legacy_source_legacy_source_key_idx" ON "hubs" USING btree ("legacy_source_key");
  CREATE INDEX "hubs_legacy_source_legacy_source_source_idx" ON "hubs" USING btree ("legacy_source_source");
  CREATE INDEX "hubs_legacy_source_legacy_source_legacy_id_idx" ON "hubs" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "hubs_legacy_source_legacy_source_content_hash_idx" ON "hubs" USING btree ("legacy_source_content_hash");
  CREATE INDEX "hubs_updated_at_idx" ON "hubs" USING btree ("updated_at");
  CREATE INDEX "hubs_created_at_idx" ON "hubs" USING btree ("created_at");
  CREATE INDEX "hubs__status_idx" ON "hubs" USING btree ("_status");
  CREATE INDEX "hubs_rels_order_idx" ON "hubs_rels" USING btree ("order");
  CREATE INDEX "hubs_rels_parent_idx" ON "hubs_rels" USING btree ("parent_id");
  CREATE INDEX "hubs_rels_path_idx" ON "hubs_rels" USING btree ("path");
  CREATE INDEX "hubs_rels_regions_id_idx" ON "hubs_rels" USING btree ("regions_id");
  CREATE INDEX "hubs_rels_asset_classes_id_idx" ON "hubs_rels" USING btree ("asset_classes_id");
  CREATE INDEX "hubs_rels_venue_types_id_idx" ON "hubs_rels" USING btree ("venue_types_id");
  CREATE INDEX "hubs_rels_hubs_id_idx" ON "hubs_rels" USING btree ("hubs_id");
  CREATE INDEX "_hubs_v_blocks_trayport_hero_actions_order_idx" ON "_hubs_v_blocks_trayport_hero_actions" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_trayport_hero_actions_parent_id_idx" ON "_hubs_v_blocks_trayport_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_trayport_hero_order_idx" ON "_hubs_v_blocks_trayport_hero" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_trayport_hero_parent_id_idx" ON "_hubs_v_blocks_trayport_hero" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_trayport_hero_path_idx" ON "_hubs_v_blocks_trayport_hero" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_trayport_hero_media_idx" ON "_hubs_v_blocks_trayport_hero" USING btree ("media_id");
  CREATE INDEX "_hubs_v_blocks_heading_order_idx" ON "_hubs_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_heading_parent_id_idx" ON "_hubs_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_heading_path_idx" ON "_hubs_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_rich_text_order_idx" ON "_hubs_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_rich_text_parent_id_idx" ON "_hubs_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_rich_text_path_idx" ON "_hubs_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_actions_actions_order_idx" ON "_hubs_v_blocks_actions_actions" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_actions_actions_parent_id_idx" ON "_hubs_v_blocks_actions_actions" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_actions_order_idx" ON "_hubs_v_blocks_actions" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_actions_parent_id_idx" ON "_hubs_v_blocks_actions" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_actions_path_idx" ON "_hubs_v_blocks_actions" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_media_order_idx" ON "_hubs_v_blocks_media" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_media_parent_id_idx" ON "_hubs_v_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_media_path_idx" ON "_hubs_v_blocks_media" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_media_media_idx" ON "_hubs_v_blocks_media" USING btree ("media_id");
  CREATE INDEX "_hubs_v_blocks_feature_list_items_order_idx" ON "_hubs_v_blocks_feature_list_items" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_feature_list_items_parent_id_idx" ON "_hubs_v_blocks_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_feature_list_items_media_idx" ON "_hubs_v_blocks_feature_list_items" USING btree ("media_id");
  CREATE INDEX "_hubs_v_blocks_feature_list_order_idx" ON "_hubs_v_blocks_feature_list" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_feature_list_parent_id_idx" ON "_hubs_v_blocks_feature_list" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_feature_list_path_idx" ON "_hubs_v_blocks_feature_list" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_statistics_items_order_idx" ON "_hubs_v_blocks_statistics_items" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_statistics_items_parent_id_idx" ON "_hubs_v_blocks_statistics_items" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_statistics_order_idx" ON "_hubs_v_blocks_statistics" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_statistics_parent_id_idx" ON "_hubs_v_blocks_statistics" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_statistics_path_idx" ON "_hubs_v_blocks_statistics" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_faq_items_order_idx" ON "_hubs_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_faq_items_parent_id_idx" ON "_hubs_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_faq_order_idx" ON "_hubs_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_faq_parent_id_idx" ON "_hubs_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_faq_path_idx" ON "_hubs_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_entity_list_items_order_idx" ON "_hubs_v_blocks_entity_list_items" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_entity_list_items_parent_id_idx" ON "_hubs_v_blocks_entity_list_items" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_entity_list_items_media_idx" ON "_hubs_v_blocks_entity_list_items" USING btree ("media_id");
  CREATE INDEX "_hubs_v_blocks_entity_list_order_idx" ON "_hubs_v_blocks_entity_list" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_entity_list_parent_id_idx" ON "_hubs_v_blocks_entity_list" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_entity_list_path_idx" ON "_hubs_v_blocks_entity_list" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_timeline_items_order_idx" ON "_hubs_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_timeline_items_parent_id_idx" ON "_hubs_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_timeline_order_idx" ON "_hubs_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_timeline_parent_id_idx" ON "_hubs_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_timeline_path_idx" ON "_hubs_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_data_table_headers_order_idx" ON "_hubs_v_blocks_data_table_headers" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_data_table_headers_parent_id_idx" ON "_hubs_v_blocks_data_table_headers" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_data_table_rows_cells_order_idx" ON "_hubs_v_blocks_data_table_rows_cells" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_data_table_rows_cells_parent_id_idx" ON "_hubs_v_blocks_data_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_data_table_rows_order_idx" ON "_hubs_v_blocks_data_table_rows" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_data_table_rows_parent_id_idx" ON "_hubs_v_blocks_data_table_rows" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_data_table_order_idx" ON "_hubs_v_blocks_data_table" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_data_table_parent_id_idx" ON "_hubs_v_blocks_data_table" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_data_table_path_idx" ON "_hubs_v_blocks_data_table" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_gallery_items_order_idx" ON "_hubs_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_gallery_items_parent_id_idx" ON "_hubs_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_gallery_items_media_idx" ON "_hubs_v_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "_hubs_v_blocks_gallery_order_idx" ON "_hubs_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_gallery_parent_id_idx" ON "_hubs_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_gallery_path_idx" ON "_hubs_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_divider_order_idx" ON "_hubs_v_blocks_divider" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_divider_parent_id_idx" ON "_hubs_v_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_divider_path_idx" ON "_hubs_v_blocks_divider" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_market_coverage_actions_order_idx" ON "_hubs_v_blocks_market_coverage_actions" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_market_coverage_actions_parent_id_idx" ON "_hubs_v_blocks_market_coverage_actions" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_market_coverage_order_idx" ON "_hubs_v_blocks_market_coverage" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_market_coverage_parent_id_idx" ON "_hubs_v_blocks_market_coverage" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_market_coverage_path_idx" ON "_hubs_v_blocks_market_coverage" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_embed_order_idx" ON "_hubs_v_blocks_embed" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_embed_parent_id_idx" ON "_hubs_v_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_embed_path_idx" ON "_hubs_v_blocks_embed" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_embed_poster_idx" ON "_hubs_v_blocks_embed" USING btree ("poster_id");
  CREATE INDEX "_hubs_v_blocks_data_chart_order_idx" ON "_hubs_v_blocks_data_chart" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_data_chart_parent_id_idx" ON "_hubs_v_blocks_data_chart" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_data_chart_path_idx" ON "_hubs_v_blocks_data_chart" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_content_section_columns_order_idx" ON "_hubs_v_blocks_content_section_columns" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_content_section_columns_parent_id_idx" ON "_hubs_v_blocks_content_section_columns" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_content_section_order_idx" ON "_hubs_v_blocks_content_section" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_content_section_parent_id_idx" ON "_hubs_v_blocks_content_section" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_content_section_path_idx" ON "_hubs_v_blocks_content_section" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_article_listing_order_idx" ON "_hubs_v_blocks_article_listing" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_article_listing_parent_id_idx" ON "_hubs_v_blocks_article_listing" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_article_listing_path_idx" ON "_hubs_v_blocks_article_listing" USING btree ("_path");
  CREATE INDEX "_hubs_v_version_map_markers_order_idx" ON "_hubs_v_version_map_markers" USING btree ("_order");
  CREATE INDEX "_hubs_v_version_map_markers_parent_id_idx" ON "_hubs_v_version_map_markers" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_version_connections_order_idx" ON "_hubs_v_version_connections" USING btree ("_order");
  CREATE INDEX "_hubs_v_version_connections_parent_id_idx" ON "_hubs_v_version_connections" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_version_connections_venue_idx" ON "_hubs_v_version_connections" USING btree ("venue_id");
  CREATE INDEX "_hubs_v_parent_idx" ON "_hubs_v" USING btree ("parent_id");
  CREATE INDEX "_hubs_v_version_version_title_idx" ON "_hubs_v" USING btree ("version_title");
  CREATE INDEX "_hubs_v_version_version_hero_media_idx" ON "_hubs_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_hubs_v_version_version_code_idx" ON "_hubs_v" USING btree ("version_code");
  CREATE INDEX "_hubs_v_version_version_market_data_key_idx" ON "_hubs_v" USING btree ("version_market_data_key");
  CREATE INDEX "_hubs_v_version_meta_version_meta_image_idx" ON "_hubs_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_hubs_v_version_version_slug_idx" ON "_hubs_v" USING btree ("version_slug");
  CREATE INDEX "_hubs_v_version_version_path_idx" ON "_hubs_v" USING btree ("version_path");
  CREATE INDEX "_hubs_v_version_legacy_source_version_legacy_source_key_idx" ON "_hubs_v" USING btree ("version_legacy_source_key");
  CREATE INDEX "_hubs_v_version_legacy_source_version_legacy_source_sour_idx" ON "_hubs_v" USING btree ("version_legacy_source_source");
  CREATE INDEX "_hubs_v_version_legacy_source_version_legacy_source_lega_idx" ON "_hubs_v" USING btree ("version_legacy_source_legacy_id");
  CREATE INDEX "_hubs_v_version_legacy_source_version_legacy_source_cont_idx" ON "_hubs_v" USING btree ("version_legacy_source_content_hash");
  CREATE INDEX "_hubs_v_version_version_updated_at_idx" ON "_hubs_v" USING btree ("version_updated_at");
  CREATE INDEX "_hubs_v_version_version_created_at_idx" ON "_hubs_v" USING btree ("version_created_at");
  CREATE INDEX "_hubs_v_version_version__status_idx" ON "_hubs_v" USING btree ("version__status");
  CREATE INDEX "_hubs_v_created_at_idx" ON "_hubs_v" USING btree ("created_at");
  CREATE INDEX "_hubs_v_updated_at_idx" ON "_hubs_v" USING btree ("updated_at");
  CREATE INDEX "_hubs_v_latest_idx" ON "_hubs_v" USING btree ("latest");
  CREATE INDEX "_hubs_v_autosave_idx" ON "_hubs_v" USING btree ("autosave");
  CREATE INDEX "_hubs_v_rels_order_idx" ON "_hubs_v_rels" USING btree ("order");
  CREATE INDEX "_hubs_v_rels_parent_idx" ON "_hubs_v_rels" USING btree ("parent_id");
  CREATE INDEX "_hubs_v_rels_path_idx" ON "_hubs_v_rels" USING btree ("path");
  CREATE INDEX "_hubs_v_rels_regions_id_idx" ON "_hubs_v_rels" USING btree ("regions_id");
  CREATE INDEX "_hubs_v_rels_asset_classes_id_idx" ON "_hubs_v_rels" USING btree ("asset_classes_id");
  CREATE INDEX "_hubs_v_rels_venue_types_id_idx" ON "_hubs_v_rels" USING btree ("venue_types_id");
  CREATE INDEX "_hubs_v_rels_hubs_id_idx" ON "_hubs_v_rels" USING btree ("hubs_id");
  CREATE INDEX "venues_title_idx" ON "venues" USING btree ("title");
  CREATE INDEX "venues_code_idx" ON "venues" USING btree ("code");
  CREATE INDEX "venues_logo_idx" ON "venues" USING btree ("logo_id");
  CREATE INDEX "venues_display_order_idx" ON "venues" USING btree ("display_order");
  CREATE INDEX "venues_slug_idx" ON "venues" USING btree ("slug");
  CREATE UNIQUE INDEX "venues_legacy_source_legacy_source_key_idx" ON "venues" USING btree ("legacy_source_key");
  CREATE INDEX "venues_legacy_source_legacy_source_source_idx" ON "venues" USING btree ("legacy_source_source");
  CREATE INDEX "venues_legacy_source_legacy_source_legacy_id_idx" ON "venues" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "venues_legacy_source_legacy_source_content_hash_idx" ON "venues" USING btree ("legacy_source_content_hash");
  CREATE INDEX "venues_updated_at_idx" ON "venues" USING btree ("updated_at");
  CREATE INDEX "venues_created_at_idx" ON "venues" USING btree ("created_at");
  CREATE INDEX "venues__status_idx" ON "venues" USING btree ("_status");
  CREATE INDEX "venues_rels_order_idx" ON "venues_rels" USING btree ("order");
  CREATE INDEX "venues_rels_parent_idx" ON "venues_rels" USING btree ("parent_id");
  CREATE INDEX "venues_rels_path_idx" ON "venues_rels" USING btree ("path");
  CREATE INDEX "venues_rels_venue_types_id_idx" ON "venues_rels" USING btree ("venue_types_id");
  CREATE INDEX "venues_rels_asset_classes_id_idx" ON "venues_rels" USING btree ("asset_classes_id");
  CREATE INDEX "venues_rels_regions_id_idx" ON "venues_rels" USING btree ("regions_id");
  CREATE INDEX "_venues_v_parent_idx" ON "_venues_v" USING btree ("parent_id");
  CREATE INDEX "_venues_v_version_version_title_idx" ON "_venues_v" USING btree ("version_title");
  CREATE INDEX "_venues_v_version_version_code_idx" ON "_venues_v" USING btree ("version_code");
  CREATE INDEX "_venues_v_version_version_logo_idx" ON "_venues_v" USING btree ("version_logo_id");
  CREATE INDEX "_venues_v_version_version_display_order_idx" ON "_venues_v" USING btree ("version_display_order");
  CREATE INDEX "_venues_v_version_version_slug_idx" ON "_venues_v" USING btree ("version_slug");
  CREATE INDEX "_venues_v_version_legacy_source_version_legacy_source_ke_idx" ON "_venues_v" USING btree ("version_legacy_source_key");
  CREATE INDEX "_venues_v_version_legacy_source_version_legacy_source_so_idx" ON "_venues_v" USING btree ("version_legacy_source_source");
  CREATE INDEX "_venues_v_version_legacy_source_version_legacy_source_le_idx" ON "_venues_v" USING btree ("version_legacy_source_legacy_id");
  CREATE INDEX "_venues_v_version_legacy_source_version_legacy_source_co_idx" ON "_venues_v" USING btree ("version_legacy_source_content_hash");
  CREATE INDEX "_venues_v_version_version_updated_at_idx" ON "_venues_v" USING btree ("version_updated_at");
  CREATE INDEX "_venues_v_version_version_created_at_idx" ON "_venues_v" USING btree ("version_created_at");
  CREATE INDEX "_venues_v_version_version__status_idx" ON "_venues_v" USING btree ("version__status");
  CREATE INDEX "_venues_v_created_at_idx" ON "_venues_v" USING btree ("created_at");
  CREATE INDEX "_venues_v_updated_at_idx" ON "_venues_v" USING btree ("updated_at");
  CREATE INDEX "_venues_v_latest_idx" ON "_venues_v" USING btree ("latest");
  CREATE INDEX "_venues_v_autosave_idx" ON "_venues_v" USING btree ("autosave");
  CREATE INDEX "_venues_v_rels_order_idx" ON "_venues_v_rels" USING btree ("order");
  CREATE INDEX "_venues_v_rels_parent_idx" ON "_venues_v_rels" USING btree ("parent_id");
  CREATE INDEX "_venues_v_rels_path_idx" ON "_venues_v_rels" USING btree ("path");
  CREATE INDEX "_venues_v_rels_venue_types_id_idx" ON "_venues_v_rels" USING btree ("venue_types_id");
  CREATE INDEX "_venues_v_rels_asset_classes_id_idx" ON "_venues_v_rels" USING btree ("asset_classes_id");
  CREATE INDEX "_venues_v_rels_regions_id_idx" ON "_venues_v_rels" USING btree ("regions_id");
  CREATE INDEX "media_poster_idx" ON "media" USING btree ("poster_id");
  CREATE UNIQUE INDEX "media_legacy_source_legacy_source_key_idx" ON "media" USING btree ("legacy_source_key");
  CREATE INDEX "media_legacy_source_legacy_source_source_idx" ON "media" USING btree ("legacy_source_source");
  CREATE INDEX "media_legacy_source_legacy_source_legacy_id_idx" ON "media" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "media_legacy_source_legacy_source_content_hash_idx" ON "media" USING btree ("legacy_source_content_hash");
  CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "article_categories_title_idx" ON "article_categories" USING btree ("title");
  CREATE INDEX "article_categories_parent_idx" ON "article_categories" USING btree ("parent_id");
  CREATE INDEX "article_categories_display_order_idx" ON "article_categories" USING btree ("display_order");
  CREATE INDEX "article_categories_slug_idx" ON "article_categories" USING btree ("slug");
  CREATE UNIQUE INDEX "article_categories_legacy_source_legacy_source_key_idx" ON "article_categories" USING btree ("legacy_source_key");
  CREATE INDEX "article_categories_legacy_source_legacy_source_source_idx" ON "article_categories" USING btree ("legacy_source_source");
  CREATE INDEX "article_categories_legacy_source_legacy_source_legacy_id_idx" ON "article_categories" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "article_categories_legacy_source_legacy_source_content_h_idx" ON "article_categories" USING btree ("legacy_source_content_hash");
  CREATE INDEX "article_categories_updated_at_idx" ON "article_categories" USING btree ("updated_at");
  CREATE INDEX "article_categories_created_at_idx" ON "article_categories" USING btree ("created_at");
  CREATE INDEX "asset_classes_title_idx" ON "asset_classes" USING btree ("title");
  CREATE INDEX "asset_classes_display_order_idx" ON "asset_classes" USING btree ("display_order");
  CREATE INDEX "asset_classes_slug_idx" ON "asset_classes" USING btree ("slug");
  CREATE UNIQUE INDEX "asset_classes_legacy_source_legacy_source_key_idx" ON "asset_classes" USING btree ("legacy_source_key");
  CREATE INDEX "asset_classes_legacy_source_legacy_source_source_idx" ON "asset_classes" USING btree ("legacy_source_source");
  CREATE INDEX "asset_classes_legacy_source_legacy_source_legacy_id_idx" ON "asset_classes" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "asset_classes_legacy_source_legacy_source_content_hash_idx" ON "asset_classes" USING btree ("legacy_source_content_hash");
  CREATE INDEX "asset_classes_updated_at_idx" ON "asset_classes" USING btree ("updated_at");
  CREATE INDEX "asset_classes_created_at_idx" ON "asset_classes" USING btree ("created_at");
  CREATE INDEX "venue_types_title_idx" ON "venue_types" USING btree ("title");
  CREATE INDEX "venue_types_display_order_idx" ON "venue_types" USING btree ("display_order");
  CREATE INDEX "venue_types_slug_idx" ON "venue_types" USING btree ("slug");
  CREATE UNIQUE INDEX "venue_types_legacy_source_legacy_source_key_idx" ON "venue_types" USING btree ("legacy_source_key");
  CREATE INDEX "venue_types_legacy_source_legacy_source_source_idx" ON "venue_types" USING btree ("legacy_source_source");
  CREATE INDEX "venue_types_legacy_source_legacy_source_legacy_id_idx" ON "venue_types" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "venue_types_legacy_source_legacy_source_content_hash_idx" ON "venue_types" USING btree ("legacy_source_content_hash");
  CREATE INDEX "venue_types_updated_at_idx" ON "venue_types" USING btree ("updated_at");
  CREATE INDEX "venue_types_created_at_idx" ON "venue_types" USING btree ("created_at");
  CREATE INDEX "regions_title_idx" ON "regions" USING btree ("title");
  CREATE INDEX "regions_code_idx" ON "regions" USING btree ("code");
  CREATE INDEX "regions_slug_idx" ON "regions" USING btree ("slug");
  CREATE UNIQUE INDEX "regions_legacy_source_legacy_source_key_idx" ON "regions" USING btree ("legacy_source_key");
  CREATE INDEX "regions_legacy_source_legacy_source_source_idx" ON "regions" USING btree ("legacy_source_source");
  CREATE INDEX "regions_legacy_source_legacy_source_legacy_id_idx" ON "regions" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "regions_legacy_source_legacy_source_content_hash_idx" ON "regions" USING btree ("legacy_source_content_hash");
  CREATE INDEX "regions_updated_at_idx" ON "regions" USING btree ("updated_at");
  CREATE INDEX "regions_created_at_idx" ON "regions" USING btree ("created_at");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_articles_id_idx" ON "redirects_rels" USING btree ("articles_id");
  CREATE INDEX "redirects_rels_hubs_id_idx" ON "redirects_rels" USING btree ("hubs_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_folders_folder_type_order_idx" ON "payload_folders_folder_type" USING btree ("order");
  CREATE INDEX "payload_folders_folder_type_parent_idx" ON "payload_folders_folder_type" USING btree ("parent_id");
  CREATE INDEX "payload_folders_name_idx" ON "payload_folders" USING btree ("name");
  CREATE INDEX "payload_folders_folder_idx" ON "payload_folders" USING btree ("folder_id");
  CREATE INDEX "payload_folders_updated_at_idx" ON "payload_folders" USING btree ("updated_at");
  CREATE INDEX "payload_folders_created_at_idx" ON "payload_folders" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_hubs_id_idx" ON "payload_locked_documents_rels" USING btree ("hubs_id");
  CREATE INDEX "payload_locked_documents_rels_venues_id_idx" ON "payload_locked_documents_rels" USING btree ("venues_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_article_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("article_categories_id");
  CREATE INDEX "payload_locked_documents_rels_asset_classes_id_idx" ON "payload_locked_documents_rels" USING btree ("asset_classes_id");
  CREATE INDEX "payload_locked_documents_rels_venue_types_id_idx" ON "payload_locked_documents_rels" USING btree ("venue_types_id");
  CREATE INDEX "payload_locked_documents_rels_regions_id_idx" ON "payload_locked_documents_rels" USING btree ("regions_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_payload_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_folders_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "navigation_primary_items_children_order_idx" ON "navigation_primary_items_children" USING btree ("_order");
  CREATE INDEX "navigation_primary_items_children_parent_id_idx" ON "navigation_primary_items_children" USING btree ("_parent_id");
  CREATE INDEX "navigation_primary_items_children_media_idx" ON "navigation_primary_items_children" USING btree ("media_id");
  CREATE INDEX "navigation_primary_items_order_idx" ON "navigation_primary_items" USING btree ("_order");
  CREATE INDEX "navigation_primary_items_parent_id_idx" ON "navigation_primary_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_utility_items_order_idx" ON "navigation_utility_items" USING btree ("_order");
  CREATE INDEX "navigation_utility_items_parent_id_idx" ON "navigation_utility_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_legacy_source_legacy_source_key_idx" ON "navigation" USING btree ("legacy_source_key");
  CREATE INDEX "navigation_legacy_source_legacy_source_source_idx" ON "navigation" USING btree ("legacy_source_source");
  CREATE INDEX "navigation_legacy_source_legacy_source_legacy_id_idx" ON "navigation" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "navigation_legacy_source_legacy_source_content_hash_idx" ON "navigation" USING btree ("legacy_source_content_hash");
  CREATE INDEX "navigation__status_idx" ON "navigation" USING btree ("_status");
  CREATE INDEX "navigation_rels_order_idx" ON "navigation_rels" USING btree ("order");
  CREATE INDEX "navigation_rels_parent_idx" ON "navigation_rels" USING btree ("parent_id");
  CREATE INDEX "navigation_rels_path_idx" ON "navigation_rels" USING btree ("path");
  CREATE INDEX "navigation_rels_pages_id_idx" ON "navigation_rels" USING btree ("pages_id");
  CREATE INDEX "navigation_rels_articles_id_idx" ON "navigation_rels" USING btree ("articles_id");
  CREATE INDEX "navigation_rels_hubs_id_idx" ON "navigation_rels" USING btree ("hubs_id");
  CREATE INDEX "_navigation_v_version_primary_items_children_order_idx" ON "_navigation_v_version_primary_items_children" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_primary_items_children_parent_id_idx" ON "_navigation_v_version_primary_items_children" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_primary_items_children_media_idx" ON "_navigation_v_version_primary_items_children" USING btree ("media_id");
  CREATE INDEX "_navigation_v_version_primary_items_order_idx" ON "_navigation_v_version_primary_items" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_primary_items_parent_id_idx" ON "_navigation_v_version_primary_items" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_utility_items_order_idx" ON "_navigation_v_version_utility_items" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_utility_items_parent_id_idx" ON "_navigation_v_version_utility_items" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_legacy_source_version_legacy_sourc_idx" ON "_navigation_v" USING btree ("version_legacy_source_key");
  CREATE INDEX "_navigation_v_version_legacy_source_version_legacy_sou_1_idx" ON "_navigation_v" USING btree ("version_legacy_source_source");
  CREATE INDEX "_navigation_v_version_legacy_source_version_legacy_sou_2_idx" ON "_navigation_v" USING btree ("version_legacy_source_legacy_id");
  CREATE INDEX "_navigation_v_version_legacy_source_version_legacy_sou_3_idx" ON "_navigation_v" USING btree ("version_legacy_source_content_hash");
  CREATE INDEX "_navigation_v_version_version__status_idx" ON "_navigation_v" USING btree ("version__status");
  CREATE INDEX "_navigation_v_created_at_idx" ON "_navigation_v" USING btree ("created_at");
  CREATE INDEX "_navigation_v_updated_at_idx" ON "_navigation_v" USING btree ("updated_at");
  CREATE INDEX "_navigation_v_latest_idx" ON "_navigation_v" USING btree ("latest");
  CREATE INDEX "_navigation_v_autosave_idx" ON "_navigation_v" USING btree ("autosave");
  CREATE INDEX "_navigation_v_rels_order_idx" ON "_navigation_v_rels" USING btree ("order");
  CREATE INDEX "_navigation_v_rels_parent_idx" ON "_navigation_v_rels" USING btree ("parent_id");
  CREATE INDEX "_navigation_v_rels_path_idx" ON "_navigation_v_rels" USING btree ("path");
  CREATE INDEX "_navigation_v_rels_pages_id_idx" ON "_navigation_v_rels" USING btree ("pages_id");
  CREATE INDEX "_navigation_v_rels_articles_id_idx" ON "_navigation_v_rels" USING btree ("articles_id");
  CREATE INDEX "_navigation_v_rels_hubs_id_idx" ON "_navigation_v_rels" USING btree ("hubs_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX "footer_certification_marks_order_idx" ON "footer_certification_marks" USING btree ("_order");
  CREATE INDEX "footer_certification_marks_parent_id_idx" ON "footer_certification_marks" USING btree ("_parent_id");
  CREATE INDEX "footer_certification_marks_image_idx" ON "footer_certification_marks" USING btree ("image_id");
  CREATE UNIQUE INDEX "footer_legacy_source_legacy_source_key_idx" ON "footer" USING btree ("legacy_source_key");
  CREATE INDEX "footer_legacy_source_legacy_source_source_idx" ON "footer" USING btree ("legacy_source_source");
  CREATE INDEX "footer_legacy_source_legacy_source_legacy_id_idx" ON "footer" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "footer_legacy_source_legacy_source_content_hash_idx" ON "footer" USING btree ("legacy_source_content_hash");
  CREATE INDEX "footer__status_idx" ON "footer" USING btree ("_status");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_articles_id_idx" ON "footer_rels" USING btree ("articles_id");
  CREATE INDEX "footer_rels_hubs_id_idx" ON "footer_rels" USING btree ("hubs_id");
  CREATE INDEX "_footer_v_version_columns_links_order_idx" ON "_footer_v_version_columns_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_links_parent_id_idx" ON "_footer_v_version_columns_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_columns_order_idx" ON "_footer_v_version_columns" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_parent_id_idx" ON "_footer_v_version_columns" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_legal_links_order_idx" ON "_footer_v_version_legal_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_legal_links_parent_id_idx" ON "_footer_v_version_legal_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_certification_marks_order_idx" ON "_footer_v_version_certification_marks" USING btree ("_order");
  CREATE INDEX "_footer_v_version_certification_marks_parent_id_idx" ON "_footer_v_version_certification_marks" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_certification_marks_image_idx" ON "_footer_v_version_certification_marks" USING btree ("image_id");
  CREATE INDEX "_footer_v_version_legacy_source_version_legacy_source_ke_idx" ON "_footer_v" USING btree ("version_legacy_source_key");
  CREATE INDEX "_footer_v_version_legacy_source_version_legacy_source_so_idx" ON "_footer_v" USING btree ("version_legacy_source_source");
  CREATE INDEX "_footer_v_version_legacy_source_version_legacy_source_le_idx" ON "_footer_v" USING btree ("version_legacy_source_legacy_id");
  CREATE INDEX "_footer_v_version_legacy_source_version_legacy_source_co_idx" ON "_footer_v" USING btree ("version_legacy_source_content_hash");
  CREATE INDEX "_footer_v_version_version__status_idx" ON "_footer_v" USING btree ("version__status");
  CREATE INDEX "_footer_v_created_at_idx" ON "_footer_v" USING btree ("created_at");
  CREATE INDEX "_footer_v_updated_at_idx" ON "_footer_v" USING btree ("updated_at");
  CREATE INDEX "_footer_v_latest_idx" ON "_footer_v" USING btree ("latest");
  CREATE INDEX "_footer_v_autosave_idx" ON "_footer_v" USING btree ("autosave");
  CREATE INDEX "_footer_v_rels_order_idx" ON "_footer_v_rels" USING btree ("order");
  CREATE INDEX "_footer_v_rels_parent_idx" ON "_footer_v_rels" USING btree ("parent_id");
  CREATE INDEX "_footer_v_rels_path_idx" ON "_footer_v_rels" USING btree ("path");
  CREATE INDEX "_footer_v_rels_pages_id_idx" ON "_footer_v_rels" USING btree ("pages_id");
  CREATE INDEX "_footer_v_rels_articles_id_idx" ON "_footer_v_rels" USING btree ("articles_id");
  CREATE INDEX "_footer_v_rels_hubs_id_idx" ON "_footer_v_rels" USING btree ("hubs_id");
  CREATE INDEX "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_logo_on_dark_idx" ON "site_settings" USING btree ("logo_on_dark_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
  CREATE INDEX "site_settings_default_s_e_o_default_s_e_o_image_idx" ON "site_settings" USING btree ("default_s_e_o_image_id");
  CREATE INDEX "site_settings_cookie_notice_cookie_notice_policy_page_idx" ON "site_settings" USING btree ("cookie_notice_policy_page_id");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_pages_id_idx" ON "site_settings_rels" USING btree ("pages_id");
  CREATE INDEX "site_settings_rels_articles_id_idx" ON "site_settings_rels" USING btree ("articles_id");
  CREATE INDEX "site_settings_rels_hubs_id_idx" ON "site_settings_rels" USING btree ("hubs_id");
  CREATE INDEX "_site_settings_v_version_social_links_order_idx" ON "_site_settings_v_version_social_links" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_social_links_parent_id_idx" ON "_site_settings_v_version_social_links" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_version_logo_idx" ON "_site_settings_v" USING btree ("version_logo_id");
  CREATE INDEX "_site_settings_v_version_version_logo_on_dark_idx" ON "_site_settings_v" USING btree ("version_logo_on_dark_id");
  CREATE INDEX "_site_settings_v_version_version_favicon_idx" ON "_site_settings_v" USING btree ("version_favicon_id");
  CREATE INDEX "_site_settings_v_version_default_s_e_o_version_default_s_idx" ON "_site_settings_v" USING btree ("version_default_s_e_o_image_id");
  CREATE INDEX "_site_settings_v_version_cookie_notice_version_cookie_no_idx" ON "_site_settings_v" USING btree ("version_cookie_notice_policy_page_id");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");
  CREATE INDEX "_site_settings_v_autosave_idx" ON "_site_settings_v" USING btree ("autosave");
  CREATE INDEX "_site_settings_v_rels_order_idx" ON "_site_settings_v_rels" USING btree ("order");
  CREATE INDEX "_site_settings_v_rels_parent_idx" ON "_site_settings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_site_settings_v_rels_path_idx" ON "_site_settings_v_rels" USING btree ("path");
  CREATE INDEX "_site_settings_v_rels_pages_id_idx" ON "_site_settings_v_rels" USING btree ("pages_id");
  CREATE INDEX "_site_settings_v_rels_articles_id_idx" ON "_site_settings_v_rels" USING btree ("articles_id");
  CREATE INDEX "_site_settings_v_rels_hubs_id_idx" ON "_site_settings_v_rels" USING btree ("hubs_id");
  CREATE SCHEMA IF NOT EXISTS "app";
  CREATE TABLE "app"."market_volume_monthly" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "asset_class_legacy_id" integer NOT NULL,
    "hub_legacy_id" integer NOT NULL,
    "year" smallint NOT NULL,
    "month" smallint NOT NULL,
    "otc_bilateral" numeric,
    "otc_cleared" numeric,
    "exchange_traded" numeric,
    "price" numeric,
    "source_post_legacy_id" integer NOT NULL,
    "source_fingerprint" text NOT NULL,
    "imported_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "market_volume_monthly_year_check" CHECK ("year" BETWEEN 2000 AND 2100),
    CONSTRAINT "market_volume_monthly_month_check" CHECK ("month" BETWEEN 1 AND 12),
    CONSTRAINT "market_volume_monthly_scope_unique" UNIQUE(
      "asset_class_legacy_id",
      "hub_legacy_id",
      "year",
      "month"
    )
  );
  CREATE INDEX "market_volume_monthly_asset_hub_date_idx"
    ON "app"."market_volume_monthly" USING btree (
      "asset_class_legacy_id",
      "hub_legacy_id",
      "year",
      "month"
    );`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP SCHEMA "app" CASCADE;
  DROP TABLE "pages_blocks_trayport_hero_actions" CASCADE;
  DROP TABLE "pages_blocks_trayport_hero" CASCADE;
  DROP TABLE "pages_blocks_heading" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_actions_actions" CASCADE;
  DROP TABLE "pages_blocks_actions" CASCADE;
  DROP TABLE "pages_blocks_media" CASCADE;
  DROP TABLE "pages_blocks_feature_list_items" CASCADE;
  DROP TABLE "pages_blocks_feature_list" CASCADE;
  DROP TABLE "pages_blocks_statistics_items" CASCADE;
  DROP TABLE "pages_blocks_statistics" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_entity_list_items" CASCADE;
  DROP TABLE "pages_blocks_entity_list" CASCADE;
  DROP TABLE "pages_blocks_timeline_items" CASCADE;
  DROP TABLE "pages_blocks_timeline" CASCADE;
  DROP TABLE "pages_blocks_data_table_headers" CASCADE;
  DROP TABLE "pages_blocks_data_table_rows_cells" CASCADE;
  DROP TABLE "pages_blocks_data_table_rows" CASCADE;
  DROP TABLE "pages_blocks_data_table" CASCADE;
  DROP TABLE "pages_blocks_gallery_items" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_divider" CASCADE;
  DROP TABLE "pages_blocks_market_coverage_actions" CASCADE;
  DROP TABLE "pages_blocks_market_coverage" CASCADE;
  DROP TABLE "pages_blocks_embed" CASCADE;
  DROP TABLE "pages_blocks_data_chart" CASCADE;
  DROP TABLE "pages_blocks_content_section_columns" CASCADE;
  DROP TABLE "pages_blocks_content_section" CASCADE;
  DROP TABLE "pages_blocks_article_listing" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_trayport_hero_actions" CASCADE;
  DROP TABLE "_pages_v_blocks_trayport_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_heading" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_actions_actions" CASCADE;
  DROP TABLE "_pages_v_blocks_actions" CASCADE;
  DROP TABLE "_pages_v_blocks_media" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_list_items" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_list" CASCADE;
  DROP TABLE "_pages_v_blocks_statistics_items" CASCADE;
  DROP TABLE "_pages_v_blocks_statistics" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_entity_list_items" CASCADE;
  DROP TABLE "_pages_v_blocks_entity_list" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline" CASCADE;
  DROP TABLE "_pages_v_blocks_data_table_headers" CASCADE;
  DROP TABLE "_pages_v_blocks_data_table_rows_cells" CASCADE;
  DROP TABLE "_pages_v_blocks_data_table_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_data_table" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_divider" CASCADE;
  DROP TABLE "_pages_v_blocks_market_coverage_actions" CASCADE;
  DROP TABLE "_pages_v_blocks_market_coverage" CASCADE;
  DROP TABLE "_pages_v_blocks_embed" CASCADE;
  DROP TABLE "_pages_v_blocks_data_chart" CASCADE;
  DROP TABLE "_pages_v_blocks_content_section_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_content_section" CASCADE;
  DROP TABLE "_pages_v_blocks_article_listing" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "articles_blocks_trayport_hero_actions" CASCADE;
  DROP TABLE "articles_blocks_trayport_hero" CASCADE;
  DROP TABLE "articles_blocks_heading" CASCADE;
  DROP TABLE "articles_blocks_rich_text" CASCADE;
  DROP TABLE "articles_blocks_actions_actions" CASCADE;
  DROP TABLE "articles_blocks_actions" CASCADE;
  DROP TABLE "articles_blocks_media" CASCADE;
  DROP TABLE "articles_blocks_feature_list_items" CASCADE;
  DROP TABLE "articles_blocks_feature_list" CASCADE;
  DROP TABLE "articles_blocks_statistics_items" CASCADE;
  DROP TABLE "articles_blocks_statistics" CASCADE;
  DROP TABLE "articles_blocks_faq_items" CASCADE;
  DROP TABLE "articles_blocks_faq" CASCADE;
  DROP TABLE "articles_blocks_entity_list_items" CASCADE;
  DROP TABLE "articles_blocks_entity_list" CASCADE;
  DROP TABLE "articles_blocks_timeline_items" CASCADE;
  DROP TABLE "articles_blocks_timeline" CASCADE;
  DROP TABLE "articles_blocks_data_table_headers" CASCADE;
  DROP TABLE "articles_blocks_data_table_rows_cells" CASCADE;
  DROP TABLE "articles_blocks_data_table_rows" CASCADE;
  DROP TABLE "articles_blocks_data_table" CASCADE;
  DROP TABLE "articles_blocks_gallery_items" CASCADE;
  DROP TABLE "articles_blocks_gallery" CASCADE;
  DROP TABLE "articles_blocks_divider" CASCADE;
  DROP TABLE "articles_blocks_market_coverage_actions" CASCADE;
  DROP TABLE "articles_blocks_market_coverage" CASCADE;
  DROP TABLE "articles_blocks_embed" CASCADE;
  DROP TABLE "articles_blocks_data_chart" CASCADE;
  DROP TABLE "articles_blocks_content_section_columns" CASCADE;
  DROP TABLE "articles_blocks_content_section" CASCADE;
  DROP TABLE "articles_blocks_article_listing" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "_articles_v_blocks_trayport_hero_actions" CASCADE;
  DROP TABLE "_articles_v_blocks_trayport_hero" CASCADE;
  DROP TABLE "_articles_v_blocks_heading" CASCADE;
  DROP TABLE "_articles_v_blocks_rich_text" CASCADE;
  DROP TABLE "_articles_v_blocks_actions_actions" CASCADE;
  DROP TABLE "_articles_v_blocks_actions" CASCADE;
  DROP TABLE "_articles_v_blocks_media" CASCADE;
  DROP TABLE "_articles_v_blocks_feature_list_items" CASCADE;
  DROP TABLE "_articles_v_blocks_feature_list" CASCADE;
  DROP TABLE "_articles_v_blocks_statistics_items" CASCADE;
  DROP TABLE "_articles_v_blocks_statistics" CASCADE;
  DROP TABLE "_articles_v_blocks_faq_items" CASCADE;
  DROP TABLE "_articles_v_blocks_faq" CASCADE;
  DROP TABLE "_articles_v_blocks_entity_list_items" CASCADE;
  DROP TABLE "_articles_v_blocks_entity_list" CASCADE;
  DROP TABLE "_articles_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_articles_v_blocks_timeline" CASCADE;
  DROP TABLE "_articles_v_blocks_data_table_headers" CASCADE;
  DROP TABLE "_articles_v_blocks_data_table_rows_cells" CASCADE;
  DROP TABLE "_articles_v_blocks_data_table_rows" CASCADE;
  DROP TABLE "_articles_v_blocks_data_table" CASCADE;
  DROP TABLE "_articles_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_articles_v_blocks_gallery" CASCADE;
  DROP TABLE "_articles_v_blocks_divider" CASCADE;
  DROP TABLE "_articles_v_blocks_market_coverage_actions" CASCADE;
  DROP TABLE "_articles_v_blocks_market_coverage" CASCADE;
  DROP TABLE "_articles_v_blocks_embed" CASCADE;
  DROP TABLE "_articles_v_blocks_data_chart" CASCADE;
  DROP TABLE "_articles_v_blocks_content_section_columns" CASCADE;
  DROP TABLE "_articles_v_blocks_content_section" CASCADE;
  DROP TABLE "_articles_v_blocks_article_listing" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_rels" CASCADE;
  DROP TABLE "hubs_blocks_trayport_hero_actions" CASCADE;
  DROP TABLE "hubs_blocks_trayport_hero" CASCADE;
  DROP TABLE "hubs_blocks_heading" CASCADE;
  DROP TABLE "hubs_blocks_rich_text" CASCADE;
  DROP TABLE "hubs_blocks_actions_actions" CASCADE;
  DROP TABLE "hubs_blocks_actions" CASCADE;
  DROP TABLE "hubs_blocks_media" CASCADE;
  DROP TABLE "hubs_blocks_feature_list_items" CASCADE;
  DROP TABLE "hubs_blocks_feature_list" CASCADE;
  DROP TABLE "hubs_blocks_statistics_items" CASCADE;
  DROP TABLE "hubs_blocks_statistics" CASCADE;
  DROP TABLE "hubs_blocks_faq_items" CASCADE;
  DROP TABLE "hubs_blocks_faq" CASCADE;
  DROP TABLE "hubs_blocks_entity_list_items" CASCADE;
  DROP TABLE "hubs_blocks_entity_list" CASCADE;
  DROP TABLE "hubs_blocks_timeline_items" CASCADE;
  DROP TABLE "hubs_blocks_timeline" CASCADE;
  DROP TABLE "hubs_blocks_data_table_headers" CASCADE;
  DROP TABLE "hubs_blocks_data_table_rows_cells" CASCADE;
  DROP TABLE "hubs_blocks_data_table_rows" CASCADE;
  DROP TABLE "hubs_blocks_data_table" CASCADE;
  DROP TABLE "hubs_blocks_gallery_items" CASCADE;
  DROP TABLE "hubs_blocks_gallery" CASCADE;
  DROP TABLE "hubs_blocks_divider" CASCADE;
  DROP TABLE "hubs_blocks_market_coverage_actions" CASCADE;
  DROP TABLE "hubs_blocks_market_coverage" CASCADE;
  DROP TABLE "hubs_blocks_embed" CASCADE;
  DROP TABLE "hubs_blocks_data_chart" CASCADE;
  DROP TABLE "hubs_blocks_content_section_columns" CASCADE;
  DROP TABLE "hubs_blocks_content_section" CASCADE;
  DROP TABLE "hubs_blocks_article_listing" CASCADE;
  DROP TABLE "hubs_map_markers" CASCADE;
  DROP TABLE "hubs_connections" CASCADE;
  DROP TABLE "hubs" CASCADE;
  DROP TABLE "hubs_rels" CASCADE;
  DROP TABLE "_hubs_v_blocks_trayport_hero_actions" CASCADE;
  DROP TABLE "_hubs_v_blocks_trayport_hero" CASCADE;
  DROP TABLE "_hubs_v_blocks_heading" CASCADE;
  DROP TABLE "_hubs_v_blocks_rich_text" CASCADE;
  DROP TABLE "_hubs_v_blocks_actions_actions" CASCADE;
  DROP TABLE "_hubs_v_blocks_actions" CASCADE;
  DROP TABLE "_hubs_v_blocks_media" CASCADE;
  DROP TABLE "_hubs_v_blocks_feature_list_items" CASCADE;
  DROP TABLE "_hubs_v_blocks_feature_list" CASCADE;
  DROP TABLE "_hubs_v_blocks_statistics_items" CASCADE;
  DROP TABLE "_hubs_v_blocks_statistics" CASCADE;
  DROP TABLE "_hubs_v_blocks_faq_items" CASCADE;
  DROP TABLE "_hubs_v_blocks_faq" CASCADE;
  DROP TABLE "_hubs_v_blocks_entity_list_items" CASCADE;
  DROP TABLE "_hubs_v_blocks_entity_list" CASCADE;
  DROP TABLE "_hubs_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_hubs_v_blocks_timeline" CASCADE;
  DROP TABLE "_hubs_v_blocks_data_table_headers" CASCADE;
  DROP TABLE "_hubs_v_blocks_data_table_rows_cells" CASCADE;
  DROP TABLE "_hubs_v_blocks_data_table_rows" CASCADE;
  DROP TABLE "_hubs_v_blocks_data_table" CASCADE;
  DROP TABLE "_hubs_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_hubs_v_blocks_gallery" CASCADE;
  DROP TABLE "_hubs_v_blocks_divider" CASCADE;
  DROP TABLE "_hubs_v_blocks_market_coverage_actions" CASCADE;
  DROP TABLE "_hubs_v_blocks_market_coverage" CASCADE;
  DROP TABLE "_hubs_v_blocks_embed" CASCADE;
  DROP TABLE "_hubs_v_blocks_data_chart" CASCADE;
  DROP TABLE "_hubs_v_blocks_content_section_columns" CASCADE;
  DROP TABLE "_hubs_v_blocks_content_section" CASCADE;
  DROP TABLE "_hubs_v_blocks_article_listing" CASCADE;
  DROP TABLE "_hubs_v_version_map_markers" CASCADE;
  DROP TABLE "_hubs_v_version_connections" CASCADE;
  DROP TABLE "_hubs_v" CASCADE;
  DROP TABLE "_hubs_v_rels" CASCADE;
  DROP TABLE "venues" CASCADE;
  DROP TABLE "venues_rels" CASCADE;
  DROP TABLE "_venues_v" CASCADE;
  DROP TABLE "_venues_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "article_categories" CASCADE;
  DROP TABLE "asset_classes" CASCADE;
  DROP TABLE "venue_types" CASCADE;
  DROP TABLE "regions" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_folders_folder_type" CASCADE;
  DROP TABLE "payload_folders" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "navigation_primary_items_children" CASCADE;
  DROP TABLE "navigation_primary_items" CASCADE;
  DROP TABLE "navigation_utility_items" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "navigation_rels" CASCADE;
  DROP TABLE "_navigation_v_version_primary_items_children" CASCADE;
  DROP TABLE "_navigation_v_version_primary_items" CASCADE;
  DROP TABLE "_navigation_v_version_utility_items" CASCADE;
  DROP TABLE "_navigation_v" CASCADE;
  DROP TABLE "_navigation_v_rels" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "footer_certification_marks" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TABLE "_footer_v_version_columns_links" CASCADE;
  DROP TABLE "_footer_v_version_columns" CASCADE;
  DROP TABLE "_footer_v_version_legal_links" CASCADE;
  DROP TABLE "_footer_v_version_certification_marks" CASCADE;
  DROP TABLE "_footer_v" CASCADE;
  DROP TABLE "_footer_v_rels" CASCADE;
  DROP TABLE "site_settings_social_links" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_rels" CASCADE;
  DROP TABLE "_site_settings_v_version_social_links" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_site_settings_v_rels" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_trayport_hero_actions_style";
  DROP TYPE "public"."enum_pages_blocks_trayport_hero_appearance";
  DROP TYPE "public"."enum_pages_blocks_heading_level";
  DROP TYPE "public"."enum_pages_blocks_rich_text_size";
  DROP TYPE "public"."enum_pages_blocks_actions_actions_style";
  DROP TYPE "public"."enum_pages_blocks_media_aspect";
  DROP TYPE "public"."enum_pages_blocks_feature_list_layout";
  DROP TYPE "public"."enum_pages_blocks_entity_list_kind";
  DROP TYPE "public"."enum_pages_blocks_divider_style";
  DROP TYPE "public"."enum_pages_blocks_market_coverage_actions_style";
  DROP TYPE "public"."enum_pages_blocks_data_chart_data_type";
  DROP TYPE "public"."enum_pages_blocks_content_section_columns_span";
  DROP TYPE "public"."enum_pages_blocks_content_section_theme";
  DROP TYPE "public"."enum_pages_blocks_content_section_width";
  DROP TYPE "public"."enum_pages_blocks_content_section_spacing";
  DROP TYPE "public"."enum_pages_page_type";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_trayport_hero_actions_style";
  DROP TYPE "public"."enum__pages_v_blocks_trayport_hero_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_heading_level";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_size";
  DROP TYPE "public"."enum__pages_v_blocks_actions_actions_style";
  DROP TYPE "public"."enum__pages_v_blocks_media_aspect";
  DROP TYPE "public"."enum__pages_v_blocks_feature_list_layout";
  DROP TYPE "public"."enum__pages_v_blocks_entity_list_kind";
  DROP TYPE "public"."enum__pages_v_blocks_divider_style";
  DROP TYPE "public"."enum__pages_v_blocks_market_coverage_actions_style";
  DROP TYPE "public"."enum__pages_v_blocks_data_chart_data_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_columns_span";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_theme";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_spacing";
  DROP TYPE "public"."enum__pages_v_version_page_type";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_articles_blocks_trayport_hero_actions_style";
  DROP TYPE "public"."enum_articles_blocks_trayport_hero_appearance";
  DROP TYPE "public"."enum_articles_blocks_heading_level";
  DROP TYPE "public"."enum_articles_blocks_rich_text_size";
  DROP TYPE "public"."enum_articles_blocks_actions_actions_style";
  DROP TYPE "public"."enum_articles_blocks_media_aspect";
  DROP TYPE "public"."enum_articles_blocks_feature_list_layout";
  DROP TYPE "public"."enum_articles_blocks_entity_list_kind";
  DROP TYPE "public"."enum_articles_blocks_divider_style";
  DROP TYPE "public"."enum_articles_blocks_market_coverage_actions_style";
  DROP TYPE "public"."enum_articles_blocks_data_chart_data_type";
  DROP TYPE "public"."enum_articles_blocks_content_section_columns_span";
  DROP TYPE "public"."enum_articles_blocks_content_section_theme";
  DROP TYPE "public"."enum_articles_blocks_content_section_width";
  DROP TYPE "public"."enum_articles_blocks_content_section_spacing";
  DROP TYPE "public"."enum_articles_content_mode";
  DROP TYPE "public"."enum_articles_article_type";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_blocks_trayport_hero_actions_style";
  DROP TYPE "public"."enum__articles_v_blocks_trayport_hero_appearance";
  DROP TYPE "public"."enum__articles_v_blocks_heading_level";
  DROP TYPE "public"."enum__articles_v_blocks_rich_text_size";
  DROP TYPE "public"."enum__articles_v_blocks_actions_actions_style";
  DROP TYPE "public"."enum__articles_v_blocks_media_aspect";
  DROP TYPE "public"."enum__articles_v_blocks_feature_list_layout";
  DROP TYPE "public"."enum__articles_v_blocks_entity_list_kind";
  DROP TYPE "public"."enum__articles_v_blocks_divider_style";
  DROP TYPE "public"."enum__articles_v_blocks_market_coverage_actions_style";
  DROP TYPE "public"."enum__articles_v_blocks_data_chart_data_type";
  DROP TYPE "public"."enum__articles_v_blocks_content_section_columns_span";
  DROP TYPE "public"."enum__articles_v_blocks_content_section_theme";
  DROP TYPE "public"."enum__articles_v_blocks_content_section_width";
  DROP TYPE "public"."enum__articles_v_blocks_content_section_spacing";
  DROP TYPE "public"."enum__articles_v_version_content_mode";
  DROP TYPE "public"."enum__articles_v_version_article_type";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum_hubs_blocks_trayport_hero_actions_style";
  DROP TYPE "public"."enum_hubs_blocks_trayport_hero_appearance";
  DROP TYPE "public"."enum_hubs_blocks_heading_level";
  DROP TYPE "public"."enum_hubs_blocks_rich_text_size";
  DROP TYPE "public"."enum_hubs_blocks_actions_actions_style";
  DROP TYPE "public"."enum_hubs_blocks_media_aspect";
  DROP TYPE "public"."enum_hubs_blocks_feature_list_layout";
  DROP TYPE "public"."enum_hubs_blocks_entity_list_kind";
  DROP TYPE "public"."enum_hubs_blocks_divider_style";
  DROP TYPE "public"."enum_hubs_blocks_market_coverage_actions_style";
  DROP TYPE "public"."enum_hubs_blocks_data_chart_data_type";
  DROP TYPE "public"."enum_hubs_blocks_content_section_columns_span";
  DROP TYPE "public"."enum_hubs_blocks_content_section_theme";
  DROP TYPE "public"."enum_hubs_blocks_content_section_width";
  DROP TYPE "public"."enum_hubs_blocks_content_section_spacing";
  DROP TYPE "public"."enum_hubs_connections_connection_type";
  DROP TYPE "public"."enum_hubs_content_mode";
  DROP TYPE "public"."enum_hubs_status";
  DROP TYPE "public"."enum__hubs_v_blocks_trayport_hero_actions_style";
  DROP TYPE "public"."enum__hubs_v_blocks_trayport_hero_appearance";
  DROP TYPE "public"."enum__hubs_v_blocks_heading_level";
  DROP TYPE "public"."enum__hubs_v_blocks_rich_text_size";
  DROP TYPE "public"."enum__hubs_v_blocks_actions_actions_style";
  DROP TYPE "public"."enum__hubs_v_blocks_media_aspect";
  DROP TYPE "public"."enum__hubs_v_blocks_feature_list_layout";
  DROP TYPE "public"."enum__hubs_v_blocks_entity_list_kind";
  DROP TYPE "public"."enum__hubs_v_blocks_divider_style";
  DROP TYPE "public"."enum__hubs_v_blocks_market_coverage_actions_style";
  DROP TYPE "public"."enum__hubs_v_blocks_data_chart_data_type";
  DROP TYPE "public"."enum__hubs_v_blocks_content_section_columns_span";
  DROP TYPE "public"."enum__hubs_v_blocks_content_section_theme";
  DROP TYPE "public"."enum__hubs_v_blocks_content_section_width";
  DROP TYPE "public"."enum__hubs_v_blocks_content_section_spacing";
  DROP TYPE "public"."enum__hubs_v_version_connections_connection_type";
  DROP TYPE "public"."enum__hubs_v_version_content_mode";
  DROP TYPE "public"."enum__hubs_v_version_status";
  DROP TYPE "public"."enum_venues_status";
  DROP TYPE "public"."enum__venues_v_version_status";
  DROP TYPE "public"."enum_media_alt_source";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_payload_folders_folder_type";
  DROP TYPE "public"."enum_navigation_primary_items_children_link_type";
  DROP TYPE "public"."enum_navigation_primary_items_link_type";
  DROP TYPE "public"."enum_navigation_utility_items_link_type";
  DROP TYPE "public"."enum_navigation_primary_action_link_type";
  DROP TYPE "public"."enum_navigation_status";
  DROP TYPE "public"."enum__navigation_v_version_primary_items_children_link_type";
  DROP TYPE "public"."enum__navigation_v_version_primary_items_link_type";
  DROP TYPE "public"."enum__navigation_v_version_utility_items_link_type";
  DROP TYPE "public"."enum__navigation_v_version_primary_action_link_type";
  DROP TYPE "public"."enum__navigation_v_version_status";
  DROP TYPE "public"."enum_footer_columns_links_link_type";
  DROP TYPE "public"."enum_footer_legal_links_link_type";
  DROP TYPE "public"."enum_footer_status";
  DROP TYPE "public"."enum__footer_v_version_columns_links_link_type";
  DROP TYPE "public"."enum__footer_v_version_legal_links_link_type";
  DROP TYPE "public"."enum__footer_v_version_status";
  DROP TYPE "public"."enum_site_settings_social_links_platform";
  DROP TYPE "public"."enum_site_settings_site_notice_action_link_type";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_social_links_platform";
  DROP TYPE "public"."enum__site_settings_v_version_site_notice_action_link_type";
  DROP TYPE "public"."enum__site_settings_v_version_status";`)
}
