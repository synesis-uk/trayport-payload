import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_market_coverage_mode" AS ENUM('globalConnections', 'regionalConnectivity');
  CREATE TYPE "public"."enum_pages_blocks_market_coverage_zoom_to" AS ENUM('markers', 'region');
  CREATE TYPE "public"."enum_pages_blocks_market_coverage_data_display" AS ENUM('always', 'hover');
  CREATE TYPE "public"."enum_pages_blocks_checklist_appearance" AS ENUM('checks', 'numbers');
  CREATE TYPE "public"."enum__pages_v_blocks_market_coverage_mode" AS ENUM('globalConnections', 'regionalConnectivity');
  CREATE TYPE "public"."enum__pages_v_blocks_market_coverage_zoom_to" AS ENUM('markers', 'region');
  CREATE TYPE "public"."enum__pages_v_blocks_market_coverage_data_display" AS ENUM('always', 'hover');
  CREATE TYPE "public"."enum__pages_v_blocks_checklist_appearance" AS ENUM('checks', 'numbers');
  CREATE TYPE "public"."enum_articles_blocks_market_coverage_mode" AS ENUM('globalConnections', 'regionalConnectivity');
  CREATE TYPE "public"."enum_articles_blocks_market_coverage_zoom_to" AS ENUM('markers', 'region');
  CREATE TYPE "public"."enum_articles_blocks_market_coverage_data_display" AS ENUM('always', 'hover');
  CREATE TYPE "public"."enum_articles_blocks_checklist_appearance" AS ENUM('checks', 'numbers');
  CREATE TYPE "public"."enum__articles_v_blocks_market_coverage_mode" AS ENUM('globalConnections', 'regionalConnectivity');
  CREATE TYPE "public"."enum__articles_v_blocks_market_coverage_zoom_to" AS ENUM('markers', 'region');
  CREATE TYPE "public"."enum__articles_v_blocks_market_coverage_data_display" AS ENUM('always', 'hover');
  CREATE TYPE "public"."enum__articles_v_blocks_checklist_appearance" AS ENUM('checks', 'numbers');
  CREATE TYPE "public"."enum_hubs_blocks_market_coverage_mode" AS ENUM('globalConnections', 'regionalConnectivity');
  CREATE TYPE "public"."enum_hubs_blocks_market_coverage_zoom_to" AS ENUM('markers', 'region');
  CREATE TYPE "public"."enum_hubs_blocks_market_coverage_data_display" AS ENUM('always', 'hover');
  CREATE TYPE "public"."enum_hubs_blocks_checklist_appearance" AS ENUM('checks', 'numbers');
  CREATE TYPE "public"."enum_hubs_hub_type" AS ENUM('vhub', 'phub', 'ohub', 'rhub');
  CREATE TYPE "public"."enum__hubs_v_blocks_market_coverage_mode" AS ENUM('globalConnections', 'regionalConnectivity');
  CREATE TYPE "public"."enum__hubs_v_blocks_market_coverage_zoom_to" AS ENUM('markers', 'region');
  CREATE TYPE "public"."enum__hubs_v_blocks_market_coverage_data_display" AS ENUM('always', 'hover');
  CREATE TYPE "public"."enum__hubs_v_blocks_checklist_appearance" AS ENUM('checks', 'numbers');
  CREATE TYPE "public"."enum__hubs_v_version_hub_type" AS ENUM('vhub', 'phub', 'ohub', 'rhub');
  CREATE TYPE "public"."enum_venues_blocks_market_coverage_mode" AS ENUM('globalConnections', 'regionalConnectivity');
  CREATE TYPE "public"."enum_venues_blocks_market_coverage_zoom_to" AS ENUM('markers', 'region');
  CREATE TYPE "public"."enum_venues_blocks_market_coverage_data_display" AS ENUM('always', 'hover');
  CREATE TYPE "public"."enum_venues_blocks_checklist_appearance" AS ENUM('checks', 'numbers');
  CREATE TYPE "public"."enum__venues_v_blocks_market_coverage_mode" AS ENUM('globalConnections', 'regionalConnectivity');
  CREATE TYPE "public"."enum__venues_v_blocks_market_coverage_zoom_to" AS ENUM('markers', 'region');
  CREATE TYPE "public"."enum__venues_v_blocks_market_coverage_data_display" AS ENUM('always', 'hover');
  CREATE TYPE "public"."enum__venues_v_blocks_checklist_appearance" AS ENUM('checks', 'numbers');
  CREATE TYPE "public"."enum_learning_videos_blocks_market_coverage_mode" AS ENUM('globalConnections', 'regionalConnectivity');
  CREATE TYPE "public"."enum_learning_videos_blocks_market_coverage_zoom_to" AS ENUM('markers', 'region');
  CREATE TYPE "public"."enum_learning_videos_blocks_market_coverage_data_display" AS ENUM('always', 'hover');
  CREATE TYPE "public"."enum_learning_videos_blocks_checklist_appearance" AS ENUM('checks', 'numbers');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_market_coverage_mode" AS ENUM('globalConnections', 'regionalConnectivity');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_market_coverage_zoom_to" AS ENUM('markers', 'region');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_market_coverage_data_display" AS ENUM('always', 'hover');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_checklist_appearance" AS ENUM('checks', 'numbers');
  CREATE TYPE "public"."enum_market_data_imports_import_type" AS ENUM('volume', 'price');
  CREATE TYPE "public"."enum_market_data_imports_status" AS ENUM('uploaded', 'validating', 'invalid', 'validated', 'importing', 'imported', 'failed');
  CREATE TYPE "public"."enum_lifecycle_items_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__lifecycle_items_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_asset_classes_map_appearance_color" AS ENUM('#1f2a44', '#002d72', '#0057b8', '#009cde', '#00c1d5', '#32b77b', '#ff671f', '#f7ea48');
  CREATE TYPE "public"."enum_customer_identities_entitlements_status" AS ENUM('granted', 'revoked', 'expired');
  CREATE TYPE "public"."enum_customer_identities_status" AS ENUM('pending', 'active', 'suspended', 'disabled');
  CREATE TYPE "public"."enum_customer_identities_sync_state" AS ENUM('never', 'success', 'warning', 'error');
  CREATE TABLE "pages_blocks_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_pages_blocks_checklist_appearance" DEFAULT 'checks',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_lifecycle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Product lifecycle schedule',
  	"upcoming_heading" varchar DEFAULT 'Upcoming End-of-Life Details',
  	"previous_heading" varchar DEFAULT 'Previous Versions',
  	"show_descriptions" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__pages_v_blocks_checklist_appearance" DEFAULT 'checks',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_lifecycle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Product lifecycle schedule',
  	"upcoming_heading" varchar DEFAULT 'Upcoming End-of-Life Details',
  	"previous_heading" varchar DEFAULT 'Previous Versions',
  	"show_descriptions" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "articles_blocks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_articles_blocks_checklist_appearance" DEFAULT 'checks',
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_lifecycle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Product lifecycle schedule',
  	"upcoming_heading" varchar DEFAULT 'Upcoming End-of-Life Details',
  	"previous_heading" varchar DEFAULT 'Previous Versions',
  	"show_descriptions" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__articles_v_blocks_checklist_appearance" DEFAULT 'checks',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_lifecycle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Product lifecycle schedule',
  	"upcoming_heading" varchar DEFAULT 'Upcoming End-of-Life Details',
  	"previous_heading" varchar DEFAULT 'Previous Versions',
  	"show_descriptions" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "hubs_blocks_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "hubs_blocks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_hubs_blocks_checklist_appearance" DEFAULT 'checks',
  	"block_name" varchar
  );
  
  CREATE TABLE "hubs_blocks_lifecycle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Product lifecycle schedule',
  	"upcoming_heading" varchar DEFAULT 'Upcoming End-of-Life Details',
  	"previous_heading" varchar DEFAULT 'Previous Versions',
  	"show_descriptions" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "hubs_market_data_aliases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "hubs_connected_country_codes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"code" varchar
  );
  
  CREATE TABLE "hubs_map_connections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hub_id" integer,
  	"route" jsonb,
  	"show_line_marker" boolean DEFAULT false,
  	"line_marker_label" varchar
  );
  
  CREATE TABLE "_hubs_v_blocks_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_hubs_v_blocks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__hubs_v_blocks_checklist_appearance" DEFAULT 'checks',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_hubs_v_blocks_lifecycle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Product lifecycle schedule',
  	"upcoming_heading" varchar DEFAULT 'Upcoming End-of-Life Details',
  	"previous_heading" varchar DEFAULT 'Previous Versions',
  	"show_descriptions" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_hubs_v_version_market_data_aliases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_hubs_v_version_connected_country_codes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_hubs_v_version_map_connections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hub_id" integer,
  	"route" jsonb,
  	"show_line_marker" boolean DEFAULT false,
  	"line_marker_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "venues_blocks_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "venues_blocks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_venues_blocks_checklist_appearance" DEFAULT 'checks',
  	"block_name" varchar
  );
  
  CREATE TABLE "venues_blocks_lifecycle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Product lifecycle schedule',
  	"upcoming_heading" varchar DEFAULT 'Upcoming End-of-Life Details',
  	"previous_heading" varchar DEFAULT 'Previous Versions',
  	"show_descriptions" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "_venues_v_blocks_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_venues_v_blocks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__venues_v_blocks_checklist_appearance" DEFAULT 'checks',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_venues_v_blocks_lifecycle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Product lifecycle schedule',
  	"upcoming_heading" varchar DEFAULT 'Upcoming End-of-Life Details',
  	"previous_heading" varchar DEFAULT 'Previous Versions',
  	"show_descriptions" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "learning_videos_blocks_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "learning_videos_blocks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_learning_videos_blocks_checklist_appearance" DEFAULT 'checks',
  	"block_name" varchar
  );
  
  CREATE TABLE "learning_videos_blocks_lifecycle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Product lifecycle schedule',
  	"upcoming_heading" varchar DEFAULT 'Upcoming End-of-Life Details',
  	"previous_heading" varchar DEFAULT 'Previous Versions',
  	"show_descriptions" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "_learning_videos_v_blocks_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_learning_videos_v_blocks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__learning_videos_v_blocks_checklist_appearance" DEFAULT 'checks',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_learning_videos_v_blocks_lifecycle" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" varchar DEFAULT 'Product lifecycle schedule',
  	"upcoming_heading" varchar DEFAULT 'Upcoming End-of-Life Details',
  	"previous_heading" varchar DEFAULT 'Previous Versions',
  	"show_descriptions" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "market_data_imports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"import_type" "enum_market_data_imports_import_type" NOT NULL,
  	"asset_class_id" integer,
  	"force_missing_hubs" boolean DEFAULT false,
  	"force_reason" varchar,
  	"status" "enum_market_data_imports_status" DEFAULT 'uploaded' NOT NULL,
  	"file_hash" varchar,
  	"parser_version" varchar,
  	"staging_fingerprint" varchar,
  	"validation" jsonb,
  	"preview" jsonb,
  	"result" jsonb,
  	"failure_code" varchar,
  	"failure_message" varchar,
  	"validated_at" timestamp(3) with time zone,
  	"validated_by_id" integer,
  	"imported_at" timestamp(3) with time zone,
  	"imported_by_id" integer,
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
  	"focal_y" numeric
  );
  
  CREATE TABLE "lifecycle_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"product_label" varchar,
  	"service_name" varchar,
  	"duration" varchar,
  	"end_of_life_version" varchar,
  	"end_of_life_date" timestamp(3) with time zone,
  	"end_of_access_date" timestamp(3) with time zone,
  	"description" jsonb,
  	"active" boolean DEFAULT true,
  	"legacy_source_key" varchar,
  	"legacy_source_source" varchar,
  	"legacy_source_legacy_id" numeric,
  	"legacy_source_original_url" varchar,
  	"legacy_source_modified_gmt" timestamp(3) with time zone,
  	"legacy_source_content_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_lifecycle_items_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_lifecycle_items_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_product_label" varchar,
  	"version_service_name" varchar,
  	"version_duration" varchar,
  	"version_end_of_life_version" varchar,
  	"version_end_of_life_date" timestamp(3) with time zone,
  	"version_end_of_access_date" timestamp(3) with time zone,
  	"version_description" jsonb,
  	"version_active" boolean DEFAULT true,
  	"version_legacy_source_key" varchar,
  	"version_legacy_source_source" varchar,
  	"version_legacy_source_legacy_id" numeric,
  	"version_legacy_source_original_url" varchar,
  	"version_legacy_source_modified_gmt" timestamp(3) with time zone,
  	"version_legacy_source_content_hash" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__lifecycle_items_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "asset_classes_market_data_aliases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "regions_map_points_of_interest" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"popup_text" varchar,
  	"location_latitude" numeric NOT NULL,
  	"location_longitude" numeric NOT NULL
  );
  
  CREATE TABLE "customer_identities_entitlements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"label" varchar,
  	"status" "enum_customer_identities_entitlements_status" DEFAULT 'granted' NOT NULL,
  	"starts_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "customer_identities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"provider" varchar NOT NULL,
  	"external_subject" varchar NOT NULL,
  	"identity_key" varchar NOT NULL,
  	"status" "enum_customer_identities_status" DEFAULT 'pending' NOT NULL,
  	"email" varchar,
  	"display_name" varchar,
  	"customer_reference" varchar,
  	"customer_name" varchar,
  	"account_reference" varchar,
  	"account_name" varchar,
  	"sync_state" "enum_customer_identities_sync_state" DEFAULT 'never' NOT NULL,
  	"sync_last_attempt_at" timestamp(3) with time zone,
  	"sync_last_success_at" timestamp(3) with time zone,
  	"sync_source_updated_at" timestamp(3) with time zone,
  	"sync_revision" varchar,
  	"sync_message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DROP INDEX "hubs_market_data_key_idx";
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "mode" "enum_pages_blocks_market_coverage_mode" DEFAULT 'globalConnections';
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "default_asset_class_id" integer;
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "show_asset_class_filter" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "autoplay_asset_classes" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "autoplay_delay" numeric DEFAULT 5;
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "zoom_to" "enum_pages_blocks_market_coverage_zoom_to" DEFAULT 'markers';
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "show_sidebar" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "show_market_data" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "data_display" "enum_pages_blocks_market_coverage_data_display" DEFAULT 'always';
  ALTER TABLE "pages_rels" ADD COLUMN "lifecycle_items_id" integer;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "mode" "enum__pages_v_blocks_market_coverage_mode" DEFAULT 'globalConnections';
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "default_asset_class_id" integer;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "show_asset_class_filter" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "autoplay_asset_classes" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "autoplay_delay" numeric DEFAULT 5;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "zoom_to" "enum__pages_v_blocks_market_coverage_zoom_to" DEFAULT 'markers';
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "show_sidebar" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "show_market_data" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "data_display" "enum__pages_v_blocks_market_coverage_data_display" DEFAULT 'always';
  ALTER TABLE "_pages_v_rels" ADD COLUMN "lifecycle_items_id" integer;
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "mode" "enum_articles_blocks_market_coverage_mode" DEFAULT 'globalConnections';
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "default_asset_class_id" integer;
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "show_asset_class_filter" boolean DEFAULT true;
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "autoplay_asset_classes" boolean DEFAULT false;
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "autoplay_delay" numeric DEFAULT 5;
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "zoom_to" "enum_articles_blocks_market_coverage_zoom_to" DEFAULT 'markers';
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "show_sidebar" boolean DEFAULT true;
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "show_market_data" boolean DEFAULT false;
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "data_display" "enum_articles_blocks_market_coverage_data_display" DEFAULT 'always';
  ALTER TABLE "articles_rels" ADD COLUMN "lifecycle_items_id" integer;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "mode" "enum__articles_v_blocks_market_coverage_mode" DEFAULT 'globalConnections';
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "default_asset_class_id" integer;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "show_asset_class_filter" boolean DEFAULT true;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "autoplay_asset_classes" boolean DEFAULT false;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "autoplay_delay" numeric DEFAULT 5;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "zoom_to" "enum__articles_v_blocks_market_coverage_zoom_to" DEFAULT 'markers';
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "show_sidebar" boolean DEFAULT true;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "show_market_data" boolean DEFAULT false;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "data_display" "enum__articles_v_blocks_market_coverage_data_display" DEFAULT 'always';
  ALTER TABLE "_articles_v_rels" ADD COLUMN "lifecycle_items_id" integer;
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "mode" "enum_hubs_blocks_market_coverage_mode" DEFAULT 'globalConnections';
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "default_asset_class_id" integer;
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "show_asset_class_filter" boolean DEFAULT true;
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "autoplay_asset_classes" boolean DEFAULT false;
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "autoplay_delay" numeric DEFAULT 5;
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "zoom_to" "enum_hubs_blocks_market_coverage_zoom_to" DEFAULT 'markers';
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "show_sidebar" boolean DEFAULT true;
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "show_market_data" boolean DEFAULT false;
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "data_display" "enum_hubs_blocks_market_coverage_data_display" DEFAULT 'always';
  ALTER TABLE "hubs" ADD COLUMN "hub_type" "enum_hubs_hub_type" DEFAULT 'vhub';
  ALTER TABLE "hubs" ADD COLUMN "country_code" varchar;
  ALTER TABLE "hubs_rels" ADD COLUMN "lifecycle_items_id" integer;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "mode" "enum__hubs_v_blocks_market_coverage_mode" DEFAULT 'globalConnections';
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "default_asset_class_id" integer;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "show_asset_class_filter" boolean DEFAULT true;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "autoplay_asset_classes" boolean DEFAULT false;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "autoplay_delay" numeric DEFAULT 5;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "zoom_to" "enum__hubs_v_blocks_market_coverage_zoom_to" DEFAULT 'markers';
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "show_sidebar" boolean DEFAULT true;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "show_market_data" boolean DEFAULT false;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "data_display" "enum__hubs_v_blocks_market_coverage_data_display" DEFAULT 'always';
  ALTER TABLE "_hubs_v" ADD COLUMN "version_hub_type" "enum__hubs_v_version_hub_type" DEFAULT 'vhub';
  ALTER TABLE "_hubs_v" ADD COLUMN "version_country_code" varchar;
  ALTER TABLE "_hubs_v_rels" ADD COLUMN "lifecycle_items_id" integer;
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "mode" "enum_venues_blocks_market_coverage_mode" DEFAULT 'globalConnections';
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "default_asset_class_id" integer;
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "show_asset_class_filter" boolean DEFAULT true;
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "autoplay_asset_classes" boolean DEFAULT false;
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "autoplay_delay" numeric DEFAULT 5;
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "zoom_to" "enum_venues_blocks_market_coverage_zoom_to" DEFAULT 'markers';
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "show_sidebar" boolean DEFAULT true;
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "show_market_data" boolean DEFAULT false;
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "data_display" "enum_venues_blocks_market_coverage_data_display" DEFAULT 'always';
  ALTER TABLE "venues_rels" ADD COLUMN "lifecycle_items_id" integer;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "mode" "enum__venues_v_blocks_market_coverage_mode" DEFAULT 'globalConnections';
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "default_asset_class_id" integer;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "show_asset_class_filter" boolean DEFAULT true;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "autoplay_asset_classes" boolean DEFAULT false;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "autoplay_delay" numeric DEFAULT 5;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "zoom_to" "enum__venues_v_blocks_market_coverage_zoom_to" DEFAULT 'markers';
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "show_sidebar" boolean DEFAULT true;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "show_market_data" boolean DEFAULT false;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "data_display" "enum__venues_v_blocks_market_coverage_data_display" DEFAULT 'always';
  ALTER TABLE "_venues_v_rels" ADD COLUMN "lifecycle_items_id" integer;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "mode" "enum_learning_videos_blocks_market_coverage_mode" DEFAULT 'globalConnections';
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "default_asset_class_id" integer;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "show_asset_class_filter" boolean DEFAULT true;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "autoplay_asset_classes" boolean DEFAULT false;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "autoplay_delay" numeric DEFAULT 5;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "zoom_to" "enum_learning_videos_blocks_market_coverage_zoom_to" DEFAULT 'markers';
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "show_sidebar" boolean DEFAULT true;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "show_market_data" boolean DEFAULT false;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "data_display" "enum_learning_videos_blocks_market_coverage_data_display" DEFAULT 'always';
  ALTER TABLE "learning_videos_rels" ADD COLUMN "lifecycle_items_id" integer;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "mode" "enum__learning_videos_v_blocks_market_coverage_mode" DEFAULT 'globalConnections';
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "default_asset_class_id" integer;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "show_asset_class_filter" boolean DEFAULT true;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "autoplay_asset_classes" boolean DEFAULT false;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "autoplay_delay" numeric DEFAULT 5;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "zoom_to" "enum__learning_videos_v_blocks_market_coverage_zoom_to" DEFAULT 'markers';
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "show_sidebar" boolean DEFAULT true;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "show_market_data" boolean DEFAULT false;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "data_display" "enum__learning_videos_v_blocks_market_coverage_data_display" DEFAULT 'always';
  ALTER TABLE "_learning_videos_v_rels" ADD COLUMN "lifecycle_items_id" integer;
  ALTER TABLE "asset_classes" ADD COLUMN "map_appearance_color" "enum_asset_classes_map_appearance_color" DEFAULT '#00c1d5';
  ALTER TABLE "asset_classes" ADD COLUMN "map_appearance_volume_label" varchar;
  ALTER TABLE "asset_classes" ADD COLUMN "map_appearance_price_label" varchar;
  ALTER TABLE "asset_classes" ADD COLUMN "map_appearance_currency" varchar;
  ALTER TABLE "asset_classes" ADD COLUMN "market_data_key" varchar;
  ALTER TABLE "venue_types" ADD COLUMN "parent_venue_type_id" integer;
  ALTER TABLE "venue_types" ADD COLUMN "map_label" varchar;
  ALTER TABLE "regions" ADD COLUMN "map_label" varchar;
  ALTER TABLE "regions" ADD COLUMN "map_boundary" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "market_data_imports_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "lifecycle_items_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "customer_identities_id" integer;
  ALTER TABLE "pages_blocks_checklist_items" ADD CONSTRAINT "pages_blocks_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_checklist" ADD CONSTRAINT "pages_blocks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_lifecycle" ADD CONSTRAINT "pages_blocks_lifecycle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_checklist_items" ADD CONSTRAINT "_pages_v_blocks_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_checklist" ADD CONSTRAINT "_pages_v_blocks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lifecycle" ADD CONSTRAINT "_pages_v_blocks_lifecycle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_checklist_items" ADD CONSTRAINT "articles_blocks_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_checklist" ADD CONSTRAINT "articles_blocks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_lifecycle" ADD CONSTRAINT "articles_blocks_lifecycle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_checklist_items" ADD CONSTRAINT "_articles_v_blocks_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_checklist" ADD CONSTRAINT "_articles_v_blocks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_lifecycle" ADD CONSTRAINT "_articles_v_blocks_lifecycle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_checklist_items" ADD CONSTRAINT "hubs_blocks_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_checklist" ADD CONSTRAINT "hubs_blocks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_lifecycle" ADD CONSTRAINT "hubs_blocks_lifecycle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_market_data_aliases" ADD CONSTRAINT "hubs_market_data_aliases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_connected_country_codes" ADD CONSTRAINT "hubs_connected_country_codes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_map_connections" ADD CONSTRAINT "hubs_map_connections_hub_id_hubs_id_fk" FOREIGN KEY ("hub_id") REFERENCES "public"."hubs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_map_connections" ADD CONSTRAINT "hubs_map_connections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_checklist_items" ADD CONSTRAINT "_hubs_v_blocks_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_checklist" ADD CONSTRAINT "_hubs_v_blocks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_lifecycle" ADD CONSTRAINT "_hubs_v_blocks_lifecycle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_version_market_data_aliases" ADD CONSTRAINT "_hubs_v_version_market_data_aliases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_version_connected_country_codes" ADD CONSTRAINT "_hubs_v_version_connected_country_codes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_version_map_connections" ADD CONSTRAINT "_hubs_v_version_map_connections_hub_id_hubs_id_fk" FOREIGN KEY ("hub_id") REFERENCES "public"."hubs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_version_map_connections" ADD CONSTRAINT "_hubs_v_version_map_connections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_checklist_items" ADD CONSTRAINT "venues_blocks_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_checklist" ADD CONSTRAINT "venues_blocks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_lifecycle" ADD CONSTRAINT "venues_blocks_lifecycle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_checklist_items" ADD CONSTRAINT "_venues_v_blocks_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_checklist" ADD CONSTRAINT "_venues_v_blocks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_lifecycle" ADD CONSTRAINT "_venues_v_blocks_lifecycle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_checklist_items" ADD CONSTRAINT "learning_videos_blocks_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_checklist" ADD CONSTRAINT "learning_videos_blocks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_lifecycle" ADD CONSTRAINT "learning_videos_blocks_lifecycle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_checklist_items" ADD CONSTRAINT "_learning_videos_v_blocks_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_checklist" ADD CONSTRAINT "_learning_videos_v_blocks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_lifecycle" ADD CONSTRAINT "_learning_videos_v_blocks_lifecycle_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "market_data_imports" ADD CONSTRAINT "market_data_imports_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "market_data_imports" ADD CONSTRAINT "market_data_imports_validated_by_id_users_id_fk" FOREIGN KEY ("validated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "market_data_imports" ADD CONSTRAINT "market_data_imports_imported_by_id_users_id_fk" FOREIGN KEY ("imported_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lifecycle_items_v" ADD CONSTRAINT "_lifecycle_items_v_parent_id_lifecycle_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lifecycle_items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "asset_classes_market_data_aliases" ADD CONSTRAINT "asset_classes_market_data_aliases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."asset_classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_map_points_of_interest" ADD CONSTRAINT "regions_map_points_of_interest_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customer_identities_entitlements" ADD CONSTRAINT "customer_identities_entitlements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customer_identities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_checklist_items_order_idx" ON "pages_blocks_checklist_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_checklist_items_parent_id_idx" ON "pages_blocks_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_checklist_order_idx" ON "pages_blocks_checklist" USING btree ("_order");
  CREATE INDEX "pages_blocks_checklist_parent_id_idx" ON "pages_blocks_checklist" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_checklist_path_idx" ON "pages_blocks_checklist" USING btree ("_path");
  CREATE INDEX "pages_blocks_lifecycle_order_idx" ON "pages_blocks_lifecycle" USING btree ("_order");
  CREATE INDEX "pages_blocks_lifecycle_parent_id_idx" ON "pages_blocks_lifecycle" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_lifecycle_path_idx" ON "pages_blocks_lifecycle" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_checklist_items_order_idx" ON "_pages_v_blocks_checklist_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_checklist_items_parent_id_idx" ON "_pages_v_blocks_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_checklist_order_idx" ON "_pages_v_blocks_checklist" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_checklist_parent_id_idx" ON "_pages_v_blocks_checklist" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_checklist_path_idx" ON "_pages_v_blocks_checklist" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_lifecycle_order_idx" ON "_pages_v_blocks_lifecycle" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_lifecycle_parent_id_idx" ON "_pages_v_blocks_lifecycle" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_lifecycle_path_idx" ON "_pages_v_blocks_lifecycle" USING btree ("_path");
  CREATE INDEX "articles_blocks_checklist_items_order_idx" ON "articles_blocks_checklist_items" USING btree ("_order");
  CREATE INDEX "articles_blocks_checklist_items_parent_id_idx" ON "articles_blocks_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_checklist_order_idx" ON "articles_blocks_checklist" USING btree ("_order");
  CREATE INDEX "articles_blocks_checklist_parent_id_idx" ON "articles_blocks_checklist" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_checklist_path_idx" ON "articles_blocks_checklist" USING btree ("_path");
  CREATE INDEX "articles_blocks_lifecycle_order_idx" ON "articles_blocks_lifecycle" USING btree ("_order");
  CREATE INDEX "articles_blocks_lifecycle_parent_id_idx" ON "articles_blocks_lifecycle" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_lifecycle_path_idx" ON "articles_blocks_lifecycle" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_checklist_items_order_idx" ON "_articles_v_blocks_checklist_items" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_checklist_items_parent_id_idx" ON "_articles_v_blocks_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_checklist_order_idx" ON "_articles_v_blocks_checklist" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_checklist_parent_id_idx" ON "_articles_v_blocks_checklist" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_checklist_path_idx" ON "_articles_v_blocks_checklist" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_lifecycle_order_idx" ON "_articles_v_blocks_lifecycle" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_lifecycle_parent_id_idx" ON "_articles_v_blocks_lifecycle" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_lifecycle_path_idx" ON "_articles_v_blocks_lifecycle" USING btree ("_path");
  CREATE INDEX "hubs_blocks_checklist_items_order_idx" ON "hubs_blocks_checklist_items" USING btree ("_order");
  CREATE INDEX "hubs_blocks_checklist_items_parent_id_idx" ON "hubs_blocks_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_checklist_order_idx" ON "hubs_blocks_checklist" USING btree ("_order");
  CREATE INDEX "hubs_blocks_checklist_parent_id_idx" ON "hubs_blocks_checklist" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_checklist_path_idx" ON "hubs_blocks_checklist" USING btree ("_path");
  CREATE INDEX "hubs_blocks_lifecycle_order_idx" ON "hubs_blocks_lifecycle" USING btree ("_order");
  CREATE INDEX "hubs_blocks_lifecycle_parent_id_idx" ON "hubs_blocks_lifecycle" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_lifecycle_path_idx" ON "hubs_blocks_lifecycle" USING btree ("_path");
  CREATE INDEX "hubs_market_data_aliases_order_idx" ON "hubs_market_data_aliases" USING btree ("_order");
  CREATE INDEX "hubs_market_data_aliases_parent_id_idx" ON "hubs_market_data_aliases" USING btree ("_parent_id");
  CREATE INDEX "hubs_connected_country_codes_order_idx" ON "hubs_connected_country_codes" USING btree ("_order");
  CREATE INDEX "hubs_connected_country_codes_parent_id_idx" ON "hubs_connected_country_codes" USING btree ("_parent_id");
  CREATE INDEX "hubs_map_connections_order_idx" ON "hubs_map_connections" USING btree ("_order");
  CREATE INDEX "hubs_map_connections_parent_id_idx" ON "hubs_map_connections" USING btree ("_parent_id");
  CREATE INDEX "hubs_map_connections_hub_idx" ON "hubs_map_connections" USING btree ("hub_id");
  CREATE INDEX "_hubs_v_blocks_checklist_items_order_idx" ON "_hubs_v_blocks_checklist_items" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_checklist_items_parent_id_idx" ON "_hubs_v_blocks_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_checklist_order_idx" ON "_hubs_v_blocks_checklist" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_checklist_parent_id_idx" ON "_hubs_v_blocks_checklist" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_checklist_path_idx" ON "_hubs_v_blocks_checklist" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_lifecycle_order_idx" ON "_hubs_v_blocks_lifecycle" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_lifecycle_parent_id_idx" ON "_hubs_v_blocks_lifecycle" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_lifecycle_path_idx" ON "_hubs_v_blocks_lifecycle" USING btree ("_path");
  CREATE INDEX "_hubs_v_version_market_data_aliases_order_idx" ON "_hubs_v_version_market_data_aliases" USING btree ("_order");
  CREATE INDEX "_hubs_v_version_market_data_aliases_parent_id_idx" ON "_hubs_v_version_market_data_aliases" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_version_connected_country_codes_order_idx" ON "_hubs_v_version_connected_country_codes" USING btree ("_order");
  CREATE INDEX "_hubs_v_version_connected_country_codes_parent_id_idx" ON "_hubs_v_version_connected_country_codes" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_version_map_connections_order_idx" ON "_hubs_v_version_map_connections" USING btree ("_order");
  CREATE INDEX "_hubs_v_version_map_connections_parent_id_idx" ON "_hubs_v_version_map_connections" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_version_map_connections_hub_idx" ON "_hubs_v_version_map_connections" USING btree ("hub_id");
  CREATE INDEX "venues_blocks_checklist_items_order_idx" ON "venues_blocks_checklist_items" USING btree ("_order");
  CREATE INDEX "venues_blocks_checklist_items_parent_id_idx" ON "venues_blocks_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_checklist_order_idx" ON "venues_blocks_checklist" USING btree ("_order");
  CREATE INDEX "venues_blocks_checklist_parent_id_idx" ON "venues_blocks_checklist" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_checklist_path_idx" ON "venues_blocks_checklist" USING btree ("_path");
  CREATE INDEX "venues_blocks_lifecycle_order_idx" ON "venues_blocks_lifecycle" USING btree ("_order");
  CREATE INDEX "venues_blocks_lifecycle_parent_id_idx" ON "venues_blocks_lifecycle" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_lifecycle_path_idx" ON "venues_blocks_lifecycle" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_checklist_items_order_idx" ON "_venues_v_blocks_checklist_items" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_checklist_items_parent_id_idx" ON "_venues_v_blocks_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_checklist_order_idx" ON "_venues_v_blocks_checklist" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_checklist_parent_id_idx" ON "_venues_v_blocks_checklist" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_checklist_path_idx" ON "_venues_v_blocks_checklist" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_lifecycle_order_idx" ON "_venues_v_blocks_lifecycle" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_lifecycle_parent_id_idx" ON "_venues_v_blocks_lifecycle" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_lifecycle_path_idx" ON "_venues_v_blocks_lifecycle" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_checklist_items_order_idx" ON "learning_videos_blocks_checklist_items" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_checklist_items_parent_id_idx" ON "learning_videos_blocks_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_checklist_order_idx" ON "learning_videos_blocks_checklist" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_checklist_parent_id_idx" ON "learning_videos_blocks_checklist" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_checklist_path_idx" ON "learning_videos_blocks_checklist" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_lifecycle_order_idx" ON "learning_videos_blocks_lifecycle" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_lifecycle_parent_id_idx" ON "learning_videos_blocks_lifecycle" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_lifecycle_path_idx" ON "learning_videos_blocks_lifecycle" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_checklist_items_order_idx" ON "_learning_videos_v_blocks_checklist_items" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_checklist_items_parent_id_idx" ON "_learning_videos_v_blocks_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_checklist_order_idx" ON "_learning_videos_v_blocks_checklist" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_checklist_parent_id_idx" ON "_learning_videos_v_blocks_checklist" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_checklist_path_idx" ON "_learning_videos_v_blocks_checklist" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_lifecycle_order_idx" ON "_learning_videos_v_blocks_lifecycle" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_lifecycle_parent_id_idx" ON "_learning_videos_v_blocks_lifecycle" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_lifecycle_path_idx" ON "_learning_videos_v_blocks_lifecycle" USING btree ("_path");
  CREATE INDEX "market_data_imports_asset_class_idx" ON "market_data_imports" USING btree ("asset_class_id");
  CREATE INDEX "market_data_imports_status_idx" ON "market_data_imports" USING btree ("status");
  CREATE INDEX "market_data_imports_file_hash_idx" ON "market_data_imports" USING btree ("file_hash");
  CREATE INDEX "market_data_imports_validated_by_idx" ON "market_data_imports" USING btree ("validated_by_id");
  CREATE INDEX "market_data_imports_imported_by_idx" ON "market_data_imports" USING btree ("imported_by_id");
  CREATE INDEX "market_data_imports_updated_at_idx" ON "market_data_imports" USING btree ("updated_at");
  CREATE INDEX "market_data_imports_created_at_idx" ON "market_data_imports" USING btree ("created_at");
  CREATE UNIQUE INDEX "market_data_imports_filename_idx" ON "market_data_imports" USING btree ("filename");
  CREATE INDEX "lifecycle_items_title_idx" ON "lifecycle_items" USING btree ("title");
  CREATE INDEX "lifecycle_items_product_label_idx" ON "lifecycle_items" USING btree ("product_label");
  CREATE INDEX "lifecycle_items_end_of_life_date_idx" ON "lifecycle_items" USING btree ("end_of_life_date");
  CREATE INDEX "lifecycle_items_active_idx" ON "lifecycle_items" USING btree ("active");
  CREATE UNIQUE INDEX "lifecycle_items_legacy_source_legacy_source_key_idx" ON "lifecycle_items" USING btree ("legacy_source_key");
  CREATE INDEX "lifecycle_items_legacy_source_legacy_source_source_idx" ON "lifecycle_items" USING btree ("legacy_source_source");
  CREATE INDEX "lifecycle_items_legacy_source_legacy_source_legacy_id_idx" ON "lifecycle_items" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "lifecycle_items_legacy_source_legacy_source_content_hash_idx" ON "lifecycle_items" USING btree ("legacy_source_content_hash");
  CREATE INDEX "lifecycle_items_updated_at_idx" ON "lifecycle_items" USING btree ("updated_at");
  CREATE INDEX "lifecycle_items_created_at_idx" ON "lifecycle_items" USING btree ("created_at");
  CREATE INDEX "lifecycle_items__status_idx" ON "lifecycle_items" USING btree ("_status");
  CREATE INDEX "_lifecycle_items_v_parent_idx" ON "_lifecycle_items_v" USING btree ("parent_id");
  CREATE INDEX "_lifecycle_items_v_version_version_title_idx" ON "_lifecycle_items_v" USING btree ("version_title");
  CREATE INDEX "_lifecycle_items_v_version_version_product_label_idx" ON "_lifecycle_items_v" USING btree ("version_product_label");
  CREATE INDEX "_lifecycle_items_v_version_version_end_of_life_date_idx" ON "_lifecycle_items_v" USING btree ("version_end_of_life_date");
  CREATE INDEX "_lifecycle_items_v_version_version_active_idx" ON "_lifecycle_items_v" USING btree ("version_active");
  CREATE INDEX "_lifecycle_items_v_version_legacy_source_version_legacy__idx" ON "_lifecycle_items_v" USING btree ("version_legacy_source_key");
  CREATE INDEX "_lifecycle_items_v_version_legacy_source_version_legac_1_idx" ON "_lifecycle_items_v" USING btree ("version_legacy_source_source");
  CREATE INDEX "_lifecycle_items_v_version_legacy_source_version_legac_2_idx" ON "_lifecycle_items_v" USING btree ("version_legacy_source_legacy_id");
  CREATE INDEX "_lifecycle_items_v_version_legacy_source_version_legac_3_idx" ON "_lifecycle_items_v" USING btree ("version_legacy_source_content_hash");
  CREATE INDEX "_lifecycle_items_v_version_version_updated_at_idx" ON "_lifecycle_items_v" USING btree ("version_updated_at");
  CREATE INDEX "_lifecycle_items_v_version_version_created_at_idx" ON "_lifecycle_items_v" USING btree ("version_created_at");
  CREATE INDEX "_lifecycle_items_v_version_version__status_idx" ON "_lifecycle_items_v" USING btree ("version__status");
  CREATE INDEX "_lifecycle_items_v_created_at_idx" ON "_lifecycle_items_v" USING btree ("created_at");
  CREATE INDEX "_lifecycle_items_v_updated_at_idx" ON "_lifecycle_items_v" USING btree ("updated_at");
  CREATE INDEX "_lifecycle_items_v_latest_idx" ON "_lifecycle_items_v" USING btree ("latest");
  CREATE INDEX "asset_classes_market_data_aliases_order_idx" ON "asset_classes_market_data_aliases" USING btree ("_order");
  CREATE INDEX "asset_classes_market_data_aliases_parent_id_idx" ON "asset_classes_market_data_aliases" USING btree ("_parent_id");
  CREATE INDEX "regions_map_points_of_interest_order_idx" ON "regions_map_points_of_interest" USING btree ("_order");
  CREATE INDEX "regions_map_points_of_interest_parent_id_idx" ON "regions_map_points_of_interest" USING btree ("_parent_id");
  CREATE INDEX "customer_identities_entitlements_order_idx" ON "customer_identities_entitlements" USING btree ("_order");
  CREATE INDEX "customer_identities_entitlements_parent_id_idx" ON "customer_identities_entitlements" USING btree ("_parent_id");
  CREATE INDEX "customer_identities_provider_idx" ON "customer_identities" USING btree ("provider");
  CREATE INDEX "customer_identities_external_subject_idx" ON "customer_identities" USING btree ("external_subject");
  CREATE UNIQUE INDEX "customer_identities_identity_key_idx" ON "customer_identities" USING btree ("identity_key");
  CREATE INDEX "customer_identities_status_idx" ON "customer_identities" USING btree ("status");
  CREATE INDEX "customer_identities_email_idx" ON "customer_identities" USING btree ("email");
  CREATE INDEX "customer_identities_display_name_idx" ON "customer_identities" USING btree ("display_name");
  CREATE INDEX "customer_identities_customer_customer_reference_idx" ON "customer_identities" USING btree ("customer_reference");
  CREATE INDEX "customer_identities_account_account_reference_idx" ON "customer_identities" USING btree ("account_reference");
  CREATE INDEX "customer_identities_updated_at_idx" ON "customer_identities" USING btree ("updated_at");
  CREATE INDEX "customer_identities_created_at_idx" ON "customer_identities" USING btree ("created_at");
  ALTER TABLE "pages_blocks_market_coverage" ADD CONSTRAINT "pages_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("default_asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_lifecycle_items_fk" FOREIGN KEY ("lifecycle_items_id") REFERENCES "public"."lifecycle_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD CONSTRAINT "_pages_v_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("default_asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_lifecycle_items_fk" FOREIGN KEY ("lifecycle_items_id") REFERENCES "public"."lifecycle_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_market_coverage" ADD CONSTRAINT "articles_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("default_asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_lifecycle_items_fk" FOREIGN KEY ("lifecycle_items_id") REFERENCES "public"."lifecycle_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD CONSTRAINT "_articles_v_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("default_asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_lifecycle_items_fk" FOREIGN KEY ("lifecycle_items_id") REFERENCES "public"."lifecycle_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_market_coverage" ADD CONSTRAINT "hubs_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("default_asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_rels" ADD CONSTRAINT "hubs_rels_lifecycle_items_fk" FOREIGN KEY ("lifecycle_items_id") REFERENCES "public"."lifecycle_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD CONSTRAINT "_hubs_v_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("default_asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_rels" ADD CONSTRAINT "_hubs_v_rels_lifecycle_items_fk" FOREIGN KEY ("lifecycle_items_id") REFERENCES "public"."lifecycle_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_market_coverage" ADD CONSTRAINT "venues_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("default_asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_lifecycle_items_fk" FOREIGN KEY ("lifecycle_items_id") REFERENCES "public"."lifecycle_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD CONSTRAINT "_venues_v_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("default_asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_rels" ADD CONSTRAINT "_venues_v_rels_lifecycle_items_fk" FOREIGN KEY ("lifecycle_items_id") REFERENCES "public"."lifecycle_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD CONSTRAINT "learning_videos_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("default_asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_rels" ADD CONSTRAINT "learning_videos_rels_lifecycle_items_fk" FOREIGN KEY ("lifecycle_items_id") REFERENCES "public"."lifecycle_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD CONSTRAINT "_learning_videos_v_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("default_asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_rels" ADD CONSTRAINT "_learning_videos_v_rels_lifecycle_items_fk" FOREIGN KEY ("lifecycle_items_id") REFERENCES "public"."lifecycle_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venue_types" ADD CONSTRAINT "venue_types_parent_venue_type_id_venue_types_id_fk" FOREIGN KEY ("parent_venue_type_id") REFERENCES "public"."venue_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_market_data_imports_fk" FOREIGN KEY ("market_data_imports_id") REFERENCES "public"."market_data_imports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lifecycle_items_fk" FOREIGN KEY ("lifecycle_items_id") REFERENCES "public"."lifecycle_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customer_identities_fk" FOREIGN KEY ("customer_identities_id") REFERENCES "public"."customer_identities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_market_coverage_default_asset_class_idx" ON "pages_blocks_market_coverage" USING btree ("default_asset_class_id");
  CREATE INDEX "pages_rels_lifecycle_items_id_idx" ON "pages_rels" USING btree ("lifecycle_items_id");
  CREATE INDEX "_pages_v_blocks_market_coverage_default_asset_class_idx" ON "_pages_v_blocks_market_coverage" USING btree ("default_asset_class_id");
  CREATE INDEX "_pages_v_rels_lifecycle_items_id_idx" ON "_pages_v_rels" USING btree ("lifecycle_items_id");
  CREATE INDEX "articles_blocks_market_coverage_default_asset_class_idx" ON "articles_blocks_market_coverage" USING btree ("default_asset_class_id");
  CREATE INDEX "articles_rels_lifecycle_items_id_idx" ON "articles_rels" USING btree ("lifecycle_items_id");
  CREATE INDEX "_articles_v_blocks_market_coverage_default_asset_class_idx" ON "_articles_v_blocks_market_coverage" USING btree ("default_asset_class_id");
  CREATE INDEX "_articles_v_rels_lifecycle_items_id_idx" ON "_articles_v_rels" USING btree ("lifecycle_items_id");
  CREATE INDEX "hubs_blocks_market_coverage_default_asset_class_idx" ON "hubs_blocks_market_coverage" USING btree ("default_asset_class_id");
  CREATE INDEX "hubs_rels_lifecycle_items_id_idx" ON "hubs_rels" USING btree ("lifecycle_items_id");
  CREATE INDEX "_hubs_v_blocks_market_coverage_default_asset_class_idx" ON "_hubs_v_blocks_market_coverage" USING btree ("default_asset_class_id");
  CREATE INDEX "_hubs_v_rels_lifecycle_items_id_idx" ON "_hubs_v_rels" USING btree ("lifecycle_items_id");
  CREATE INDEX "venues_blocks_market_coverage_default_asset_class_idx" ON "venues_blocks_market_coverage" USING btree ("default_asset_class_id");
  CREATE INDEX "venues_rels_lifecycle_items_id_idx" ON "venues_rels" USING btree ("lifecycle_items_id");
  CREATE INDEX "_venues_v_blocks_market_coverage_default_asset_class_idx" ON "_venues_v_blocks_market_coverage" USING btree ("default_asset_class_id");
  CREATE INDEX "_venues_v_rels_lifecycle_items_id_idx" ON "_venues_v_rels" USING btree ("lifecycle_items_id");
  CREATE INDEX "learning_videos_blocks_market_coverage_default_asset_cla_idx" ON "learning_videos_blocks_market_coverage" USING btree ("default_asset_class_id");
  CREATE INDEX "learning_videos_rels_lifecycle_items_id_idx" ON "learning_videos_rels" USING btree ("lifecycle_items_id");
  CREATE INDEX "_learning_videos_v_blocks_market_coverage_default_asset__idx" ON "_learning_videos_v_blocks_market_coverage" USING btree ("default_asset_class_id");
  CREATE INDEX "_learning_videos_v_rels_lifecycle_items_id_idx" ON "_learning_videos_v_rels" USING btree ("lifecycle_items_id");
  CREATE UNIQUE INDEX "asset_classes_market_data_key_idx" ON "asset_classes" USING btree ("market_data_key");
  CREATE INDEX "venue_types_parent_venue_type_idx" ON "venue_types" USING btree ("parent_venue_type_id");
  CREATE INDEX "payload_locked_documents_rels_market_data_imports_id_idx" ON "payload_locked_documents_rels" USING btree ("market_data_imports_id");
  CREATE INDEX "payload_locked_documents_rels_lifecycle_items_id_idx" ON "payload_locked_documents_rels" USING btree ("lifecycle_items_id");
  CREATE INDEX "payload_locked_documents_rels_customer_identities_id_idx" ON "payload_locked_documents_rels" USING btree ("customer_identities_id");
  CREATE UNIQUE INDEX "hubs_market_data_key_idx" ON "hubs" USING btree ("market_data_key");`)

  await db.execute(sql`
    UPDATE "asset_classes"
    SET "market_data_key" = 'asset-class:' || "slug"
    WHERE "market_data_key" IS NULL OR btrim("market_data_key") = '';

    UPDATE "hubs"
    SET "market_data_key" = 'hub:' || "slug"
    WHERE "slug" IS NOT NULL AND btrim("slug") <> '';

    WITH aliases AS (
      SELECT
        asset_class.id AS parent_id,
        alias.value
      FROM "asset_classes" asset_class
      CROSS JOIN LATERAL (
        VALUES
          ('wordpress-asset-class:' || asset_class."legacy_source_legacy_id"::int::text),
          (asset_class."title"),
          (asset_class."slug")
      ) AS alias(value)
      WHERE alias.value IS NOT NULL AND btrim(alias.value) <> ''
    ),
    deduplicated AS (
      SELECT
        parent_id,
        btrim(value) AS value,
        row_number() OVER (PARTITION BY parent_id ORDER BY lower(btrim(value)), btrim(value)) AS item_order,
        row_number() OVER (PARTITION BY parent_id, lower(btrim(value)) ORDER BY btrim(value)) AS duplicate_order
      FROM aliases
    )
    INSERT INTO "asset_classes_market_data_aliases" ("_order", "_parent_id", "id", "value")
    SELECT
      item_order,
      parent_id,
      md5(parent_id::text || ':asset-class-alias:' || lower(value)),
      value
    FROM deduplicated
    WHERE duplicate_order = 1
    ON CONFLICT ("id") DO NOTHING;

    WITH explicit_aliases(title, value) AS (
      VALUES
        ('CEGH VTP (Austrian)', 'Austria VTP'),
        ('Czech Gas', 'CZ'),
        ('GTF (Danish)', 'Denmark ETF'),
        ('GTF (Danish)', 'GTF'),
        ('NBP (UK)', 'NBP'),
        ('PEG (French)', 'France PEG'),
        ('PEG (French)', 'PEG'),
        ('PSV (Italian)', 'PSV'),
        ('PVB (Spanish)', 'PVB'),
        ('THE (German)', 'THE'),
        ('TTF (Dutch)', 'TTF'),
        ('ZTP (Belgian)', 'ZEE'),
        ('ZTP (Belgian)', 'ZTP')
    ),
    aliases AS (
      SELECT
        hub.id AS parent_id,
        alias.value
      FROM "hubs" hub
      CROSS JOIN LATERAL (
        VALUES
          ('wordpress-hub:' || hub."legacy_source_legacy_id"::int::text),
          (hub."title"),
          (hub."code")
      ) AS alias(value)
      WHERE alias.value IS NOT NULL AND btrim(alias.value) <> ''

      UNION ALL

      SELECT hub.id, explicit_aliases.value
      FROM "hubs" hub
      INNER JOIN explicit_aliases ON lower(explicit_aliases.title) = lower(hub.title)
    ),
    deduplicated AS (
      SELECT
        parent_id,
        btrim(value) AS value,
        row_number() OVER (PARTITION BY parent_id ORDER BY lower(btrim(value)), btrim(value)) AS item_order,
        row_number() OVER (PARTITION BY parent_id, lower(btrim(value)) ORDER BY btrim(value)) AS duplicate_order
      FROM aliases
    )
    INSERT INTO "hubs_market_data_aliases" ("_order", "_parent_id", "id", "value")
    SELECT
      item_order,
      parent_id,
      md5(parent_id::text || ':hub-alias:' || lower(value)),
      value
    FROM deduplicated
    WHERE duplicate_order = 1
    ON CONFLICT ("id") DO NOTHING;

    ALTER TABLE "app"."market_volume_monthly"
      ADD COLUMN "asset_class_key" text,
      ADD COLUMN "hub_key" text,
      ADD COLUMN "source_import_id" integer;

    UPDATE "app"."market_volume_monthly" fact
    SET "asset_class_key" = asset_class."market_data_key"
    FROM "asset_classes" asset_class
    WHERE asset_class."legacy_source_legacy_id" = fact."asset_class_legacy_id";

    UPDATE "app"."market_volume_monthly" fact
    SET "hub_key" = hub."market_data_key"
    FROM "hubs" hub
    WHERE hub."legacy_source_legacy_id" = fact."hub_legacy_id";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM "app"."market_volume_monthly"
        WHERE "asset_class_key" IS NULL OR "hub_key" IS NULL
      ) THEN
        RAISE EXCEPTION 'Stable market-data key backfill is incomplete.';
      END IF;
    END
    $$;

    ALTER TABLE "app"."market_volume_monthly"
      ALTER COLUMN "asset_class_key" SET NOT NULL,
      ALTER COLUMN "hub_key" SET NOT NULL,
      ALTER COLUMN "asset_class_legacy_id" DROP NOT NULL,
      ALTER COLUMN "hub_legacy_id" DROP NOT NULL,
      ALTER COLUMN "source_post_legacy_id" DROP NOT NULL,
      DROP CONSTRAINT "market_volume_monthly_scope_unique",
      ADD CONSTRAINT "market_volume_monthly_source_import_id_fk"
        FOREIGN KEY ("source_import_id") REFERENCES "market_data_imports"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION;

    CREATE UNIQUE INDEX "market_volume_monthly_stable_scope_unique"
      ON "app"."market_volume_monthly" ("asset_class_key", "hub_key", "year", "month");

    CREATE TABLE "app"."market_data_import_staging" (
      "import_id" integer NOT NULL REFERENCES "market_data_imports"("id") ON DELETE CASCADE,
      "import_type" text NOT NULL CHECK ("import_type" IN ('volume', 'price')),
      "asset_class_key" text NOT NULL,
      "hub_key" text NOT NULL,
      "year" smallint NOT NULL CHECK ("year" BETWEEN 2000 AND 2100),
      "month" smallint NOT NULL CHECK ("month" BETWEEN 1 AND 12),
      "otc_bilateral" numeric,
      "otc_cleared" numeric,
      "exchange_traded" numeric,
      "price" numeric,
      "source_line" integer NOT NULL,
      "row_hash" text NOT NULL,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      PRIMARY KEY ("import_id", "asset_class_key", "hub_key", "year", "month")
    );

    CREATE INDEX "market_data_import_staging_import_id_idx"
      ON "app"."market_data_import_staging" ("import_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM "app"."market_volume_monthly"
        WHERE "asset_class_legacy_id" IS NULL
          OR "hub_legacy_id" IS NULL
          OR "source_post_legacy_id" IS NULL
      ) THEN
        RAISE EXCEPTION 'Cannot roll back stable market-data keys after native imports without restoring legacy provenance.';
      END IF;
    END
    $$;

    DROP TABLE IF EXISTS "app"."market_data_import_staging";
    DROP INDEX IF EXISTS "app"."market_volume_monthly_stable_scope_unique";

    ALTER TABLE "app"."market_volume_monthly"
      DROP CONSTRAINT IF EXISTS "market_volume_monthly_source_import_id_fk",
      ALTER COLUMN "asset_class_legacy_id" SET NOT NULL,
      ALTER COLUMN "hub_legacy_id" SET NOT NULL,
      ALTER COLUMN "source_post_legacy_id" SET NOT NULL,
      ADD CONSTRAINT "market_volume_monthly_scope_unique"
        UNIQUE ("asset_class_legacy_id", "hub_legacy_id", "year", "month"),
      DROP COLUMN "source_import_id",
      DROP COLUMN "hub_key",
      DROP COLUMN "asset_class_key";

    UPDATE "hubs"
    SET "market_data_key" = 'wordpress-hub:' || "legacy_source_legacy_id"::int::text
    WHERE "legacy_source_legacy_id" IS NOT NULL;
  `)

  await db.execute(sql`
   ALTER TABLE "pages_blocks_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_lifecycle" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_lifecycle" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_lifecycle" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_lifecycle" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hubs_blocks_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hubs_blocks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hubs_blocks_lifecycle" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hubs_market_data_aliases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hubs_connected_country_codes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hubs_map_connections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hubs_v_blocks_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hubs_v_blocks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hubs_v_blocks_lifecycle" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hubs_v_version_market_data_aliases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hubs_v_version_connected_country_codes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hubs_v_version_map_connections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_lifecycle" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_lifecycle" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_lifecycle" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_lifecycle" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "market_data_imports" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lifecycle_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lifecycle_items_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "asset_classes_market_data_aliases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_map_points_of_interest" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "customer_identities_entitlements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "customer_identities" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_checklist_items" CASCADE;
  DROP TABLE "pages_blocks_checklist" CASCADE;
  DROP TABLE "pages_blocks_lifecycle" CASCADE;
  DROP TABLE "_pages_v_blocks_checklist_items" CASCADE;
  DROP TABLE "_pages_v_blocks_checklist" CASCADE;
  DROP TABLE "_pages_v_blocks_lifecycle" CASCADE;
  DROP TABLE "articles_blocks_checklist_items" CASCADE;
  DROP TABLE "articles_blocks_checklist" CASCADE;
  DROP TABLE "articles_blocks_lifecycle" CASCADE;
  DROP TABLE "_articles_v_blocks_checklist_items" CASCADE;
  DROP TABLE "_articles_v_blocks_checklist" CASCADE;
  DROP TABLE "_articles_v_blocks_lifecycle" CASCADE;
  DROP TABLE "hubs_blocks_checklist_items" CASCADE;
  DROP TABLE "hubs_blocks_checklist" CASCADE;
  DROP TABLE "hubs_blocks_lifecycle" CASCADE;
  DROP TABLE "hubs_market_data_aliases" CASCADE;
  DROP TABLE "hubs_connected_country_codes" CASCADE;
  DROP TABLE "hubs_map_connections" CASCADE;
  DROP TABLE "_hubs_v_blocks_checklist_items" CASCADE;
  DROP TABLE "_hubs_v_blocks_checklist" CASCADE;
  DROP TABLE "_hubs_v_blocks_lifecycle" CASCADE;
  DROP TABLE "_hubs_v_version_market_data_aliases" CASCADE;
  DROP TABLE "_hubs_v_version_connected_country_codes" CASCADE;
  DROP TABLE "_hubs_v_version_map_connections" CASCADE;
  DROP TABLE "venues_blocks_checklist_items" CASCADE;
  DROP TABLE "venues_blocks_checklist" CASCADE;
  DROP TABLE "venues_blocks_lifecycle" CASCADE;
  DROP TABLE "_venues_v_blocks_checklist_items" CASCADE;
  DROP TABLE "_venues_v_blocks_checklist" CASCADE;
  DROP TABLE "_venues_v_blocks_lifecycle" CASCADE;
  DROP TABLE "learning_videos_blocks_checklist_items" CASCADE;
  DROP TABLE "learning_videos_blocks_checklist" CASCADE;
  DROP TABLE "learning_videos_blocks_lifecycle" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_checklist_items" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_checklist" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_lifecycle" CASCADE;
  DROP TABLE "market_data_imports" CASCADE;
  DROP TABLE "lifecycle_items" CASCADE;
  DROP TABLE "_lifecycle_items_v" CASCADE;
  DROP TABLE "asset_classes_market_data_aliases" CASCADE;
  DROP TABLE "regions_map_points_of_interest" CASCADE;
  DROP TABLE "customer_identities_entitlements" CASCADE;
  DROP TABLE "customer_identities" CASCADE;
  ALTER TABLE "pages_blocks_market_coverage" DROP CONSTRAINT "pages_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_lifecycle_items_fk";
  
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP CONSTRAINT "_pages_v_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_lifecycle_items_fk";
  
  ALTER TABLE "articles_blocks_market_coverage" DROP CONSTRAINT "articles_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_lifecycle_items_fk";
  
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP CONSTRAINT "_articles_v_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_lifecycle_items_fk";
  
  ALTER TABLE "hubs_blocks_market_coverage" DROP CONSTRAINT "hubs_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "hubs_rels" DROP CONSTRAINT "hubs_rels_lifecycle_items_fk";
  
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP CONSTRAINT "_hubs_v_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "_hubs_v_rels" DROP CONSTRAINT "_hubs_v_rels_lifecycle_items_fk";
  
  ALTER TABLE "venues_blocks_market_coverage" DROP CONSTRAINT "venues_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "venues_rels" DROP CONSTRAINT "venues_rels_lifecycle_items_fk";
  
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP CONSTRAINT "_venues_v_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "_venues_v_rels" DROP CONSTRAINT "_venues_v_rels_lifecycle_items_fk";
  
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP CONSTRAINT "learning_videos_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "learning_videos_rels" DROP CONSTRAINT "learning_videos_rels_lifecycle_items_fk";
  
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP CONSTRAINT "_learning_videos_v_blocks_market_coverage_default_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "_learning_videos_v_rels" DROP CONSTRAINT "_learning_videos_v_rels_lifecycle_items_fk";
  
  ALTER TABLE "venue_types" DROP CONSTRAINT "venue_types_parent_venue_type_id_venue_types_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_market_data_imports_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_lifecycle_items_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_customer_identities_fk";
  
  DROP INDEX "pages_blocks_market_coverage_default_asset_class_idx";
  DROP INDEX "pages_rels_lifecycle_items_id_idx";
  DROP INDEX "_pages_v_blocks_market_coverage_default_asset_class_idx";
  DROP INDEX "_pages_v_rels_lifecycle_items_id_idx";
  DROP INDEX "articles_blocks_market_coverage_default_asset_class_idx";
  DROP INDEX "articles_rels_lifecycle_items_id_idx";
  DROP INDEX "_articles_v_blocks_market_coverage_default_asset_class_idx";
  DROP INDEX "_articles_v_rels_lifecycle_items_id_idx";
  DROP INDEX "hubs_blocks_market_coverage_default_asset_class_idx";
  DROP INDEX "hubs_rels_lifecycle_items_id_idx";
  DROP INDEX "_hubs_v_blocks_market_coverage_default_asset_class_idx";
  DROP INDEX "_hubs_v_rels_lifecycle_items_id_idx";
  DROP INDEX "venues_blocks_market_coverage_default_asset_class_idx";
  DROP INDEX "venues_rels_lifecycle_items_id_idx";
  DROP INDEX "_venues_v_blocks_market_coverage_default_asset_class_idx";
  DROP INDEX "_venues_v_rels_lifecycle_items_id_idx";
  DROP INDEX "learning_videos_blocks_market_coverage_default_asset_cla_idx";
  DROP INDEX "learning_videos_rels_lifecycle_items_id_idx";
  DROP INDEX "_learning_videos_v_blocks_market_coverage_default_asset__idx";
  DROP INDEX "_learning_videos_v_rels_lifecycle_items_id_idx";
  DROP INDEX "asset_classes_market_data_key_idx";
  DROP INDEX "venue_types_parent_venue_type_idx";
  DROP INDEX "payload_locked_documents_rels_market_data_imports_id_idx";
  DROP INDEX "payload_locked_documents_rels_lifecycle_items_id_idx";
  DROP INDEX "payload_locked_documents_rels_customer_identities_id_idx";
  DROP INDEX "hubs_market_data_key_idx";
  CREATE INDEX "hubs_market_data_key_idx" ON "hubs" USING btree ("market_data_key");
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "mode";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "default_asset_class_id";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "show_asset_class_filter";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "autoplay_asset_classes";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "autoplay_delay";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "zoom_to";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "show_sidebar";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "show_market_data";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "data_display";
  ALTER TABLE "pages_rels" DROP COLUMN "lifecycle_items_id";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "mode";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "default_asset_class_id";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "show_asset_class_filter";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "autoplay_asset_classes";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "autoplay_delay";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "zoom_to";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "show_sidebar";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "show_market_data";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "data_display";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "lifecycle_items_id";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "mode";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "default_asset_class_id";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "show_asset_class_filter";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "autoplay_asset_classes";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "autoplay_delay";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "zoom_to";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "show_sidebar";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "show_market_data";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "data_display";
  ALTER TABLE "articles_rels" DROP COLUMN "lifecycle_items_id";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "mode";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "default_asset_class_id";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "show_asset_class_filter";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "autoplay_asset_classes";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "autoplay_delay";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "zoom_to";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "show_sidebar";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "show_market_data";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "data_display";
  ALTER TABLE "_articles_v_rels" DROP COLUMN "lifecycle_items_id";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "mode";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "default_asset_class_id";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "show_asset_class_filter";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "autoplay_asset_classes";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "autoplay_delay";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "zoom_to";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "show_sidebar";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "show_market_data";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "data_display";
  ALTER TABLE "hubs" DROP COLUMN "hub_type";
  ALTER TABLE "hubs" DROP COLUMN "country_code";
  ALTER TABLE "hubs_rels" DROP COLUMN "lifecycle_items_id";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "mode";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "default_asset_class_id";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "show_asset_class_filter";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "autoplay_asset_classes";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "autoplay_delay";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "zoom_to";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "show_sidebar";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "show_market_data";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "data_display";
  ALTER TABLE "_hubs_v" DROP COLUMN "version_hub_type";
  ALTER TABLE "_hubs_v" DROP COLUMN "version_country_code";
  ALTER TABLE "_hubs_v_rels" DROP COLUMN "lifecycle_items_id";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "mode";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "default_asset_class_id";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "show_asset_class_filter";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "autoplay_asset_classes";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "autoplay_delay";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "zoom_to";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "show_sidebar";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "show_market_data";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "data_display";
  ALTER TABLE "venues_rels" DROP COLUMN "lifecycle_items_id";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "mode";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "default_asset_class_id";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "show_asset_class_filter";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "autoplay_asset_classes";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "autoplay_delay";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "zoom_to";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "show_sidebar";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "show_market_data";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "data_display";
  ALTER TABLE "_venues_v_rels" DROP COLUMN "lifecycle_items_id";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "mode";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "default_asset_class_id";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "show_asset_class_filter";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "autoplay_asset_classes";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "autoplay_delay";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "zoom_to";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "show_sidebar";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "show_market_data";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "data_display";
  ALTER TABLE "learning_videos_rels" DROP COLUMN "lifecycle_items_id";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "mode";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "default_asset_class_id";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "show_asset_class_filter";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "autoplay_asset_classes";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "autoplay_delay";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "zoom_to";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "show_sidebar";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "show_market_data";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "data_display";
  ALTER TABLE "_learning_videos_v_rels" DROP COLUMN "lifecycle_items_id";
  ALTER TABLE "asset_classes" DROP COLUMN "map_appearance_color";
  ALTER TABLE "asset_classes" DROP COLUMN "map_appearance_volume_label";
  ALTER TABLE "asset_classes" DROP COLUMN "map_appearance_price_label";
  ALTER TABLE "asset_classes" DROP COLUMN "map_appearance_currency";
  ALTER TABLE "asset_classes" DROP COLUMN "market_data_key";
  ALTER TABLE "venue_types" DROP COLUMN "parent_venue_type_id";
  ALTER TABLE "venue_types" DROP COLUMN "map_label";
  ALTER TABLE "regions" DROP COLUMN "map_label";
  ALTER TABLE "regions" DROP COLUMN "map_boundary";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "market_data_imports_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "lifecycle_items_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "customer_identities_id";
  DROP TYPE "public"."enum_pages_blocks_market_coverage_mode";
  DROP TYPE "public"."enum_pages_blocks_market_coverage_zoom_to";
  DROP TYPE "public"."enum_pages_blocks_market_coverage_data_display";
  DROP TYPE "public"."enum_pages_blocks_checklist_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_market_coverage_mode";
  DROP TYPE "public"."enum__pages_v_blocks_market_coverage_zoom_to";
  DROP TYPE "public"."enum__pages_v_blocks_market_coverage_data_display";
  DROP TYPE "public"."enum__pages_v_blocks_checklist_appearance";
  DROP TYPE "public"."enum_articles_blocks_market_coverage_mode";
  DROP TYPE "public"."enum_articles_blocks_market_coverage_zoom_to";
  DROP TYPE "public"."enum_articles_blocks_market_coverage_data_display";
  DROP TYPE "public"."enum_articles_blocks_checklist_appearance";
  DROP TYPE "public"."enum__articles_v_blocks_market_coverage_mode";
  DROP TYPE "public"."enum__articles_v_blocks_market_coverage_zoom_to";
  DROP TYPE "public"."enum__articles_v_blocks_market_coverage_data_display";
  DROP TYPE "public"."enum__articles_v_blocks_checklist_appearance";
  DROP TYPE "public"."enum_hubs_blocks_market_coverage_mode";
  DROP TYPE "public"."enum_hubs_blocks_market_coverage_zoom_to";
  DROP TYPE "public"."enum_hubs_blocks_market_coverage_data_display";
  DROP TYPE "public"."enum_hubs_blocks_checklist_appearance";
  DROP TYPE "public"."enum_hubs_hub_type";
  DROP TYPE "public"."enum__hubs_v_blocks_market_coverage_mode";
  DROP TYPE "public"."enum__hubs_v_blocks_market_coverage_zoom_to";
  DROP TYPE "public"."enum__hubs_v_blocks_market_coverage_data_display";
  DROP TYPE "public"."enum__hubs_v_blocks_checklist_appearance";
  DROP TYPE "public"."enum__hubs_v_version_hub_type";
  DROP TYPE "public"."enum_venues_blocks_market_coverage_mode";
  DROP TYPE "public"."enum_venues_blocks_market_coverage_zoom_to";
  DROP TYPE "public"."enum_venues_blocks_market_coverage_data_display";
  DROP TYPE "public"."enum_venues_blocks_checklist_appearance";
  DROP TYPE "public"."enum__venues_v_blocks_market_coverage_mode";
  DROP TYPE "public"."enum__venues_v_blocks_market_coverage_zoom_to";
  DROP TYPE "public"."enum__venues_v_blocks_market_coverage_data_display";
  DROP TYPE "public"."enum__venues_v_blocks_checklist_appearance";
  DROP TYPE "public"."enum_learning_videos_blocks_market_coverage_mode";
  DROP TYPE "public"."enum_learning_videos_blocks_market_coverage_zoom_to";
  DROP TYPE "public"."enum_learning_videos_blocks_market_coverage_data_display";
  DROP TYPE "public"."enum_learning_videos_blocks_checklist_appearance";
  DROP TYPE "public"."enum__learning_videos_v_blocks_market_coverage_mode";
  DROP TYPE "public"."enum__learning_videos_v_blocks_market_coverage_zoom_to";
  DROP TYPE "public"."enum__learning_videos_v_blocks_market_coverage_data_display";
  DROP TYPE "public"."enum__learning_videos_v_blocks_checklist_appearance";
  DROP TYPE "public"."enum_market_data_imports_import_type";
  DROP TYPE "public"."enum_market_data_imports_status";
  DROP TYPE "public"."enum_lifecycle_items_status";
  DROP TYPE "public"."enum__lifecycle_items_v_version_status";
  DROP TYPE "public"."enum_asset_classes_map_appearance_color";
  DROP TYPE "public"."enum_customer_identities_entitlements_status";
  DROP TYPE "public"."enum_customer_identities_status";
  DROP TYPE "public"."enum_customer_identities_sync_state";`)
}
