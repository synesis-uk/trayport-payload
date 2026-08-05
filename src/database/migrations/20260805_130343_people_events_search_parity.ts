import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_people_list_selection_mode" AS ENUM('specific', 'team');
  CREATE TYPE "public"."enum_pages_blocks_people_list_team" AS ENUM('ceo', 'smt', 'head', 'careers');
  CREATE TYPE "public"."enum_pages_blocks_people_list_presentation" AS ENUM('leadershipGrid', 'careersCarousel');
  CREATE TYPE "public"."enum__pages_v_blocks_people_list_selection_mode" AS ENUM('specific', 'team');
  CREATE TYPE "public"."enum__pages_v_blocks_people_list_team" AS ENUM('ceo', 'smt', 'head', 'careers');
  CREATE TYPE "public"."enum__pages_v_blocks_people_list_presentation" AS ENUM('leadershipGrid', 'careersCarousel');
  CREATE TYPE "public"."enum_articles_blocks_people_list_selection_mode" AS ENUM('specific', 'team');
  CREATE TYPE "public"."enum_articles_blocks_people_list_team" AS ENUM('ceo', 'smt', 'head', 'careers');
  CREATE TYPE "public"."enum_articles_blocks_people_list_presentation" AS ENUM('leadershipGrid', 'careersCarousel');
  CREATE TYPE "public"."enum__articles_v_blocks_people_list_selection_mode" AS ENUM('specific', 'team');
  CREATE TYPE "public"."enum__articles_v_blocks_people_list_team" AS ENUM('ceo', 'smt', 'head', 'careers');
  CREATE TYPE "public"."enum__articles_v_blocks_people_list_presentation" AS ENUM('leadershipGrid', 'careersCarousel');
  CREATE TYPE "public"."enum_people_team" AS ENUM('ceo', 'smt', 'head', 'careers');
  CREATE TYPE "public"."enum_people_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__people_v_version_team" AS ENUM('ceo', 'smt', 'head', 'careers');
  CREATE TYPE "public"."enum__people_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_hubs_blocks_people_list_selection_mode" AS ENUM('specific', 'team');
  CREATE TYPE "public"."enum_hubs_blocks_people_list_team" AS ENUM('ceo', 'smt', 'head', 'careers');
  CREATE TYPE "public"."enum_hubs_blocks_people_list_presentation" AS ENUM('leadershipGrid', 'careersCarousel');
  CREATE TYPE "public"."enum__hubs_v_blocks_people_list_selection_mode" AS ENUM('specific', 'team');
  CREATE TYPE "public"."enum__hubs_v_blocks_people_list_team" AS ENUM('ceo', 'smt', 'head', 'careers');
  CREATE TYPE "public"."enum__hubs_v_blocks_people_list_presentation" AS ENUM('leadershipGrid', 'careersCarousel');
  CREATE TYPE "public"."enum_venues_blocks_people_list_selection_mode" AS ENUM('specific', 'team');
  CREATE TYPE "public"."enum_venues_blocks_people_list_team" AS ENUM('ceo', 'smt', 'head', 'careers');
  CREATE TYPE "public"."enum_venues_blocks_people_list_presentation" AS ENUM('leadershipGrid', 'careersCarousel');
  CREATE TYPE "public"."enum__venues_v_blocks_people_list_selection_mode" AS ENUM('specific', 'team');
  CREATE TYPE "public"."enum__venues_v_blocks_people_list_team" AS ENUM('ceo', 'smt', 'head', 'careers');
  CREATE TYPE "public"."enum__venues_v_blocks_people_list_presentation" AS ENUM('leadershipGrid', 'careersCarousel');
  CREATE TYPE "public"."enum_learning_videos_blocks_people_list_selection_mode" AS ENUM('specific', 'team');
  CREATE TYPE "public"."enum_learning_videos_blocks_people_list_team" AS ENUM('ceo', 'smt', 'head', 'careers');
  CREATE TYPE "public"."enum_learning_videos_blocks_people_list_presentation" AS ENUM('leadershipGrid', 'careersCarousel');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_people_list_selection_mode" AS ENUM('specific', 'team');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_people_list_team" AS ENUM('ceo', 'smt', 'head', 'careers');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_people_list_presentation" AS ENUM('leadershipGrid', 'careersCarousel');
  ALTER TYPE "public"."enum_route_registry_owner_collection" ADD VALUE 'people' BEFORE 'hubs';
  ALTER TYPE "public"."enum_route_registry_archetype" ADD VALUE 'person.public-profile' BEFORE 'learning-video.public-detail';
  CREATE TABLE "pages_blocks_people_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "selection_mode" "enum_pages_blocks_people_list_selection_mode" DEFAULT 'specific',
    "team" "enum_pages_blocks_people_list_team",
    "presentation" "enum_pages_blocks_people_list_presentation" DEFAULT 'leadershipGrid',
    "block_name" varchar
  );

  CREATE TABLE "pages_blocks_hubspot_form" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "form_id" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_people_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "selection_mode" "enum__pages_v_blocks_people_list_selection_mode" DEFAULT 'specific',
    "team" "enum__pages_v_blocks_people_list_team",
    "presentation" "enum__pages_v_blocks_people_list_presentation" DEFAULT 'leadershipGrid',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_hubspot_form" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "form_id" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_people_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "selection_mode" "enum_articles_blocks_people_list_selection_mode" DEFAULT 'specific',
    "team" "enum_articles_blocks_people_list_team",
    "presentation" "enum_articles_blocks_people_list_presentation" DEFAULT 'leadershipGrid',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_hubspot_form" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "form_id" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_people_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "selection_mode" "enum__articles_v_blocks_people_list_selection_mode" DEFAULT 'specific',
    "team" "enum__articles_v_blocks_people_list_team",
    "presentation" "enum__articles_v_blocks_people_list_presentation" DEFAULT 'leadershipGrid',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_hubspot_form" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "form_id" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "people" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "job_role" varchar,
    "team" "enum_people_team",
    "display_order" numeric DEFAULT 0,
    "image_id" integer,
    "description" jsonb,
    "quote" jsonb,
    "joined_at" timestamp(3) with time zone,
    "external_profile_u_r_l" varchar,
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
    "_status" "enum_people_status" DEFAULT 'draft'
  );

  CREATE TABLE "_people_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_job_role" varchar,
    "version_team" "enum__people_v_version_team",
    "version_display_order" numeric DEFAULT 0,
    "version_image_id" integer,
    "version_description" jsonb,
    "version_quote" jsonb,
    "version_joined_at" timestamp(3) with time zone,
    "version_external_profile_u_r_l" varchar,
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
    "version__status" "enum__people_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "hubs_blocks_people_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "selection_mode" "enum_hubs_blocks_people_list_selection_mode" DEFAULT 'specific',
    "team" "enum_hubs_blocks_people_list_team",
    "presentation" "enum_hubs_blocks_people_list_presentation" DEFAULT 'leadershipGrid',
    "block_name" varchar
  );

  CREATE TABLE "hubs_blocks_hubspot_form" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "form_id" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_people_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "selection_mode" "enum__hubs_v_blocks_people_list_selection_mode" DEFAULT 'specific',
    "team" "enum__hubs_v_blocks_people_list_team",
    "presentation" "enum__hubs_v_blocks_people_list_presentation" DEFAULT 'leadershipGrid',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_hubs_v_blocks_hubspot_form" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "form_id" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_people_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "selection_mode" "enum_venues_blocks_people_list_selection_mode" DEFAULT 'specific',
    "team" "enum_venues_blocks_people_list_team",
    "presentation" "enum_venues_blocks_people_list_presentation" DEFAULT 'leadershipGrid',
    "block_name" varchar
  );

  CREATE TABLE "venues_blocks_hubspot_form" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "form_id" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_people_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "selection_mode" "enum__venues_v_blocks_people_list_selection_mode" DEFAULT 'specific',
    "team" "enum__venues_v_blocks_people_list_team",
    "presentation" "enum__venues_v_blocks_people_list_presentation" DEFAULT 'leadershipGrid',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_venues_v_blocks_hubspot_form" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "form_id" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_people_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "selection_mode" "enum_learning_videos_blocks_people_list_selection_mode" DEFAULT 'specific',
    "team" "enum_learning_videos_blocks_people_list_team",
    "presentation" "enum_learning_videos_blocks_people_list_presentation" DEFAULT 'leadershipGrid',
    "block_name" varchar
  );

  CREATE TABLE "learning_videos_blocks_hubspot_form" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "form_id" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_people_list" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "selection_mode" "enum__learning_videos_v_blocks_people_list_selection_mode" DEFAULT 'specific',
    "team" "enum__learning_videos_v_blocks_people_list_team",
    "presentation" "enum__learning_videos_v_blocks_people_list_presentation" DEFAULT 'leadershipGrid',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_hubspot_form" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "form_id" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  ALTER TABLE "pages_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "banners_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "_banners_v_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "articles" ADD COLUMN "event_details_starts_at" timestamp(3) with time zone;
  ALTER TABLE "articles" ADD COLUMN "event_details_ends_at" timestamp(3) with time zone;
  ALTER TABLE "articles" ADD COLUMN "event_details_venue_name" varchar;
  ALTER TABLE "articles" ADD COLUMN "event_details_city" varchar;
  ALTER TABLE "articles" ADD COLUMN "event_details_region" varchar;
  ALTER TABLE "articles" ADD COLUMN "event_details_country" varchar;
  ALTER TABLE "articles" ADD COLUMN "event_details_coordinates_latitude" numeric;
  ALTER TABLE "articles" ADD COLUMN "event_details_coordinates_longitude" numeric;
  ALTER TABLE "articles" ADD COLUMN "event_details_form_title" varchar;
  ALTER TABLE "articles" ADD COLUMN "event_details_hubspot_form_id" varchar;
  ALTER TABLE "articles" ADD COLUMN "event_details_show_finished_notice" boolean DEFAULT false;
  ALTER TABLE "articles" ADD COLUMN "event_details_hide_forms_after_end" boolean DEFAULT false;
  ALTER TABLE "articles_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "_articles_v" ADD COLUMN "version_event_details_starts_at" timestamp(3) with time zone;
  ALTER TABLE "_articles_v" ADD COLUMN "version_event_details_ends_at" timestamp(3) with time zone;
  ALTER TABLE "_articles_v" ADD COLUMN "version_event_details_venue_name" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_event_details_city" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_event_details_region" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_event_details_country" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_event_details_coordinates_latitude" numeric;
  ALTER TABLE "_articles_v" ADD COLUMN "version_event_details_coordinates_longitude" numeric;
  ALTER TABLE "_articles_v" ADD COLUMN "version_event_details_form_title" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_event_details_hubspot_form_id" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_event_details_show_finished_notice" boolean DEFAULT false;
  ALTER TABLE "_articles_v" ADD COLUMN "version_event_details_hide_forms_after_end" boolean DEFAULT false;
  ALTER TABLE "_articles_v_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "hubs_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "_hubs_v_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "venues_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "_venues_v_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "learning_videos_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "_learning_videos_v_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "redirects_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "navigation_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "_navigation_v_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "footer_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "_footer_v_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "site_settings_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "_site_settings_v_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "pages_blocks_people_list" ADD CONSTRAINT "pages_blocks_people_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hubspot_form" ADD CONSTRAINT "pages_blocks_hubspot_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_people_list" ADD CONSTRAINT "_pages_v_blocks_people_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hubspot_form" ADD CONSTRAINT "_pages_v_blocks_hubspot_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_people_list" ADD CONSTRAINT "articles_blocks_people_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_hubspot_form" ADD CONSTRAINT "articles_blocks_hubspot_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_people_list" ADD CONSTRAINT "_articles_v_blocks_people_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_hubspot_form" ADD CONSTRAINT "_articles_v_blocks_hubspot_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_parent_id_people_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_blocks_people_list" ADD CONSTRAINT "hubs_blocks_people_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_hubspot_form" ADD CONSTRAINT "hubs_blocks_hubspot_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_people_list" ADD CONSTRAINT "_hubs_v_blocks_people_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_hubspot_form" ADD CONSTRAINT "_hubs_v_blocks_hubspot_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_people_list" ADD CONSTRAINT "venues_blocks_people_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_hubspot_form" ADD CONSTRAINT "venues_blocks_hubspot_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_people_list" ADD CONSTRAINT "_venues_v_blocks_people_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_hubspot_form" ADD CONSTRAINT "_venues_v_blocks_hubspot_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_people_list" ADD CONSTRAINT "learning_videos_blocks_people_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_hubspot_form" ADD CONSTRAINT "learning_videos_blocks_hubspot_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_people_list" ADD CONSTRAINT "_learning_videos_v_blocks_people_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_hubspot_form" ADD CONSTRAINT "_learning_videos_v_blocks_hubspot_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_people_list_order_idx" ON "pages_blocks_people_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_people_list_parent_id_idx" ON "pages_blocks_people_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_people_list_path_idx" ON "pages_blocks_people_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_hubspot_form_order_idx" ON "pages_blocks_hubspot_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_hubspot_form_parent_id_idx" ON "pages_blocks_hubspot_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hubspot_form_path_idx" ON "pages_blocks_hubspot_form" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_people_list_order_idx" ON "_pages_v_blocks_people_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_people_list_parent_id_idx" ON "_pages_v_blocks_people_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_people_list_path_idx" ON "_pages_v_blocks_people_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hubspot_form_order_idx" ON "_pages_v_blocks_hubspot_form" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hubspot_form_parent_id_idx" ON "_pages_v_blocks_hubspot_form" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hubspot_form_path_idx" ON "_pages_v_blocks_hubspot_form" USING btree ("_path");
  CREATE INDEX "articles_blocks_people_list_order_idx" ON "articles_blocks_people_list" USING btree ("_order");
  CREATE INDEX "articles_blocks_people_list_parent_id_idx" ON "articles_blocks_people_list" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_people_list_path_idx" ON "articles_blocks_people_list" USING btree ("_path");
  CREATE INDEX "articles_blocks_hubspot_form_order_idx" ON "articles_blocks_hubspot_form" USING btree ("_order");
  CREATE INDEX "articles_blocks_hubspot_form_parent_id_idx" ON "articles_blocks_hubspot_form" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_hubspot_form_path_idx" ON "articles_blocks_hubspot_form" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_people_list_order_idx" ON "_articles_v_blocks_people_list" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_people_list_parent_id_idx" ON "_articles_v_blocks_people_list" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_people_list_path_idx" ON "_articles_v_blocks_people_list" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_hubspot_form_order_idx" ON "_articles_v_blocks_hubspot_form" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_hubspot_form_parent_id_idx" ON "_articles_v_blocks_hubspot_form" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_hubspot_form_path_idx" ON "_articles_v_blocks_hubspot_form" USING btree ("_path");
  CREATE INDEX "people_title_idx" ON "people" USING btree ("title");
  CREATE INDEX "people_display_order_idx" ON "people" USING btree ("display_order");
  CREATE INDEX "people_image_idx" ON "people" USING btree ("image_id");
  CREATE INDEX "people_meta_meta_image_idx" ON "people" USING btree ("meta_image_id");
  CREATE INDEX "people_slug_idx" ON "people" USING btree ("slug");
  CREATE UNIQUE INDEX "people_path_idx" ON "people" USING btree ("path");
  CREATE UNIQUE INDEX "people_legacy_source_legacy_source_key_idx" ON "people" USING btree ("legacy_source_key");
  CREATE INDEX "people_legacy_source_legacy_source_source_idx" ON "people" USING btree ("legacy_source_source");
  CREATE INDEX "people_legacy_source_legacy_source_legacy_id_idx" ON "people" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "people_legacy_source_legacy_source_content_hash_idx" ON "people" USING btree ("legacy_source_content_hash");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE INDEX "people__status_idx" ON "people" USING btree ("_status");
  CREATE INDEX "_people_v_parent_idx" ON "_people_v" USING btree ("parent_id");
  CREATE INDEX "_people_v_version_version_title_idx" ON "_people_v" USING btree ("version_title");
  CREATE INDEX "_people_v_version_version_display_order_idx" ON "_people_v" USING btree ("version_display_order");
  CREATE INDEX "_people_v_version_version_image_idx" ON "_people_v" USING btree ("version_image_id");
  CREATE INDEX "_people_v_version_meta_version_meta_image_idx" ON "_people_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_people_v_version_version_slug_idx" ON "_people_v" USING btree ("version_slug");
  CREATE INDEX "_people_v_version_version_path_idx" ON "_people_v" USING btree ("version_path");
  CREATE INDEX "_people_v_version_legacy_source_version_legacy_source_ke_idx" ON "_people_v" USING btree ("version_legacy_source_key");
  CREATE INDEX "_people_v_version_legacy_source_version_legacy_source_so_idx" ON "_people_v" USING btree ("version_legacy_source_source");
  CREATE INDEX "_people_v_version_legacy_source_version_legacy_source_le_idx" ON "_people_v" USING btree ("version_legacy_source_legacy_id");
  CREATE INDEX "_people_v_version_legacy_source_version_legacy_source_co_idx" ON "_people_v" USING btree ("version_legacy_source_content_hash");
  CREATE INDEX "_people_v_version_version_updated_at_idx" ON "_people_v" USING btree ("version_updated_at");
  CREATE INDEX "_people_v_version_version_created_at_idx" ON "_people_v" USING btree ("version_created_at");
  CREATE INDEX "_people_v_version_version__status_idx" ON "_people_v" USING btree ("version__status");
  CREATE INDEX "_people_v_created_at_idx" ON "_people_v" USING btree ("created_at");
  CREATE INDEX "_people_v_updated_at_idx" ON "_people_v" USING btree ("updated_at");
  CREATE INDEX "_people_v_latest_idx" ON "_people_v" USING btree ("latest");
  CREATE INDEX "_people_v_autosave_idx" ON "_people_v" USING btree ("autosave");
  CREATE INDEX "hubs_blocks_people_list_order_idx" ON "hubs_blocks_people_list" USING btree ("_order");
  CREATE INDEX "hubs_blocks_people_list_parent_id_idx" ON "hubs_blocks_people_list" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_people_list_path_idx" ON "hubs_blocks_people_list" USING btree ("_path");
  CREATE INDEX "hubs_blocks_hubspot_form_order_idx" ON "hubs_blocks_hubspot_form" USING btree ("_order");
  CREATE INDEX "hubs_blocks_hubspot_form_parent_id_idx" ON "hubs_blocks_hubspot_form" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_hubspot_form_path_idx" ON "hubs_blocks_hubspot_form" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_people_list_order_idx" ON "_hubs_v_blocks_people_list" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_people_list_parent_id_idx" ON "_hubs_v_blocks_people_list" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_people_list_path_idx" ON "_hubs_v_blocks_people_list" USING btree ("_path");
  CREATE INDEX "_hubs_v_blocks_hubspot_form_order_idx" ON "_hubs_v_blocks_hubspot_form" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_hubspot_form_parent_id_idx" ON "_hubs_v_blocks_hubspot_form" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_hubspot_form_path_idx" ON "_hubs_v_blocks_hubspot_form" USING btree ("_path");
  CREATE INDEX "venues_blocks_people_list_order_idx" ON "venues_blocks_people_list" USING btree ("_order");
  CREATE INDEX "venues_blocks_people_list_parent_id_idx" ON "venues_blocks_people_list" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_people_list_path_idx" ON "venues_blocks_people_list" USING btree ("_path");
  CREATE INDEX "venues_blocks_hubspot_form_order_idx" ON "venues_blocks_hubspot_form" USING btree ("_order");
  CREATE INDEX "venues_blocks_hubspot_form_parent_id_idx" ON "venues_blocks_hubspot_form" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_hubspot_form_path_idx" ON "venues_blocks_hubspot_form" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_people_list_order_idx" ON "_venues_v_blocks_people_list" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_people_list_parent_id_idx" ON "_venues_v_blocks_people_list" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_people_list_path_idx" ON "_venues_v_blocks_people_list" USING btree ("_path");
  CREATE INDEX "_venues_v_blocks_hubspot_form_order_idx" ON "_venues_v_blocks_hubspot_form" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_hubspot_form_parent_id_idx" ON "_venues_v_blocks_hubspot_form" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_hubspot_form_path_idx" ON "_venues_v_blocks_hubspot_form" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_people_list_order_idx" ON "learning_videos_blocks_people_list" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_people_list_parent_id_idx" ON "learning_videos_blocks_people_list" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_people_list_path_idx" ON "learning_videos_blocks_people_list" USING btree ("_path");
  CREATE INDEX "learning_videos_blocks_hubspot_form_order_idx" ON "learning_videos_blocks_hubspot_form" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_hubspot_form_parent_id_idx" ON "learning_videos_blocks_hubspot_form" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_hubspot_form_path_idx" ON "learning_videos_blocks_hubspot_form" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_people_list_order_idx" ON "_learning_videos_v_blocks_people_list" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_people_list_parent_id_idx" ON "_learning_videos_v_blocks_people_list" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_people_list_path_idx" ON "_learning_videos_v_blocks_people_list" USING btree ("_path");
  CREATE INDEX "_learning_videos_v_blocks_hubspot_form_order_idx" ON "_learning_videos_v_blocks_hubspot_form" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_hubspot_form_parent_id_idx" ON "_learning_videos_v_blocks_hubspot_form" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_hubspot_form_path_idx" ON "_learning_videos_v_blocks_hubspot_form" USING btree ("_path");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "banners_rels" ADD CONSTRAINT "banners_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_banners_v_rels" ADD CONSTRAINT "_banners_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_rels" ADD CONSTRAINT "hubs_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_rels" ADD CONSTRAINT "_hubs_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_rels" ADD CONSTRAINT "_venues_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_rels" ADD CONSTRAINT "learning_videos_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_rels" ADD CONSTRAINT "_learning_videos_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_rels" ADD CONSTRAINT "_navigation_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_rels" ADD CONSTRAINT "_footer_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_people_id_idx" ON "pages_rels" USING btree ("people_id");
  CREATE INDEX "_pages_v_rels_people_id_idx" ON "_pages_v_rels" USING btree ("people_id");
  CREATE INDEX "banners_rels_people_id_idx" ON "banners_rels" USING btree ("people_id");
  CREATE INDEX "_banners_v_rels_people_id_idx" ON "_banners_v_rels" USING btree ("people_id");
  CREATE INDEX "articles_event_details_event_details_hubspot_form_id_idx" ON "articles" USING btree ("event_details_hubspot_form_id");
  CREATE INDEX "articles_rels_people_id_idx" ON "articles_rels" USING btree ("people_id");
  CREATE INDEX "_articles_v_version_event_details_version_event_details__idx" ON "_articles_v" USING btree ("version_event_details_hubspot_form_id");
  CREATE INDEX "_articles_v_rels_people_id_idx" ON "_articles_v_rels" USING btree ("people_id");
  CREATE INDEX "hubs_rels_people_id_idx" ON "hubs_rels" USING btree ("people_id");
  CREATE INDEX "_hubs_v_rels_people_id_idx" ON "_hubs_v_rels" USING btree ("people_id");
  CREATE INDEX "venues_rels_people_id_idx" ON "venues_rels" USING btree ("people_id");
  CREATE INDEX "_venues_v_rels_people_id_idx" ON "_venues_v_rels" USING btree ("people_id");
  CREATE INDEX "learning_videos_rels_people_id_idx" ON "learning_videos_rels" USING btree ("people_id");
  CREATE INDEX "_learning_videos_v_rels_people_id_idx" ON "_learning_videos_v_rels" USING btree ("people_id");
  CREATE INDEX "redirects_rels_people_id_idx" ON "redirects_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "navigation_rels_people_id_idx" ON "navigation_rels" USING btree ("people_id");
  CREATE INDEX "_navigation_v_rels_people_id_idx" ON "_navigation_v_rels" USING btree ("people_id");
  CREATE INDEX "footer_rels_people_id_idx" ON "footer_rels" USING btree ("people_id");
  CREATE INDEX "_footer_v_rels_people_id_idx" ON "_footer_v_rels" USING btree ("people_id");
  CREATE INDEX "site_settings_rels_people_id_idx" ON "site_settings_rels" USING btree ("people_id");
  CREATE INDEX "_site_settings_v_rels_people_id_idx" ON "_site_settings_v_rels" USING btree ("people_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_people_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hubspot_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_people_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hubspot_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_people_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_hubspot_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_people_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_hubspot_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_people_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hubs_blocks_people_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hubs_blocks_hubspot_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hubs_v_blocks_people_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hubs_v_blocks_hubspot_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_people_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_hubspot_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_people_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_hubspot_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_people_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_hubspot_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_people_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_hubspot_form" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_people_list" CASCADE;
  DROP TABLE "pages_blocks_hubspot_form" CASCADE;
  DROP TABLE "_pages_v_blocks_people_list" CASCADE;
  DROP TABLE "_pages_v_blocks_hubspot_form" CASCADE;
  DROP TABLE "articles_blocks_people_list" CASCADE;
  DROP TABLE "articles_blocks_hubspot_form" CASCADE;
  DROP TABLE "_articles_v_blocks_people_list" CASCADE;
  DROP TABLE "_articles_v_blocks_hubspot_form" CASCADE;
  DROP TABLE "hubs_blocks_people_list" CASCADE;
  DROP TABLE "hubs_blocks_hubspot_form" CASCADE;
  DROP TABLE "_hubs_v_blocks_people_list" CASCADE;
  DROP TABLE "_hubs_v_blocks_hubspot_form" CASCADE;
  DROP TABLE "venues_blocks_people_list" CASCADE;
  DROP TABLE "venues_blocks_hubspot_form" CASCADE;
  DROP TABLE "_venues_v_blocks_people_list" CASCADE;
  DROP TABLE "_venues_v_blocks_hubspot_form" CASCADE;
  DROP TABLE "learning_videos_blocks_people_list" CASCADE;
  DROP TABLE "learning_videos_blocks_hubspot_form" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_people_list" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_hubspot_form" CASCADE;
  DELETE FROM "route_registry"
    WHERE "owner_collection" = 'people'
       OR "archetype" = 'person.public-profile';
  DELETE FROM "pages_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "_pages_v_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "banners_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "_banners_v_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "articles_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "_articles_v_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "hubs_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "_hubs_v_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "venues_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "_venues_v_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "learning_videos_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "_learning_videos_v_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "redirects_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "payload_locked_documents"
    WHERE "id" IN (
      SELECT "parent_id"
      FROM "payload_locked_documents_rels"
      WHERE "people_id" IS NOT NULL
    );
  DELETE FROM "payload_locked_documents_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "navigation_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "_navigation_v_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "footer_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "_footer_v_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "site_settings_rels" WHERE "people_id" IS NOT NULL;
  DELETE FROM "_site_settings_v_rels" WHERE "people_id" IS NOT NULL;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_people_fk";

  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_people_fk";

  ALTER TABLE "banners_rels" DROP CONSTRAINT "banners_rels_people_fk";

  ALTER TABLE "_banners_v_rels" DROP CONSTRAINT "_banners_v_rels_people_fk";

  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_people_fk";

  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_people_fk";

  ALTER TABLE "hubs_rels" DROP CONSTRAINT "hubs_rels_people_fk";

  ALTER TABLE "_hubs_v_rels" DROP CONSTRAINT "_hubs_v_rels_people_fk";

  ALTER TABLE "venues_rels" DROP CONSTRAINT "venues_rels_people_fk";

  ALTER TABLE "_venues_v_rels" DROP CONSTRAINT "_venues_v_rels_people_fk";

  ALTER TABLE "learning_videos_rels" DROP CONSTRAINT "learning_videos_rels_people_fk";

  ALTER TABLE "_learning_videos_v_rels" DROP CONSTRAINT "_learning_videos_v_rels_people_fk";

  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_people_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_people_fk";

  ALTER TABLE "navigation_rels" DROP CONSTRAINT "navigation_rels_people_fk";

  ALTER TABLE "_navigation_v_rels" DROP CONSTRAINT "_navigation_v_rels_people_fk";

  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_people_fk";

  ALTER TABLE "_footer_v_rels" DROP CONSTRAINT "_footer_v_rels_people_fk";

  ALTER TABLE "site_settings_rels" DROP CONSTRAINT "site_settings_rels_people_fk";

  ALTER TABLE "_site_settings_v_rels" DROP CONSTRAINT "_site_settings_v_rels_people_fk";
  DROP TABLE "_people_v" CASCADE;
  DROP TABLE "people" CASCADE;

  ALTER TABLE "route_registry" ALTER COLUMN "owner_collection" SET DATA TYPE text;
  DROP TYPE "public"."enum_route_registry_owner_collection";
  CREATE TYPE "public"."enum_route_registry_owner_collection" AS ENUM('pages', 'articles', 'hubs', 'venues', 'learning-videos', 'redirects', 'system');
  ALTER TABLE "route_registry" ALTER COLUMN "owner_collection" SET DATA TYPE "public"."enum_route_registry_owner_collection" USING "owner_collection"::"public"."enum_route_registry_owner_collection";
  ALTER TABLE "route_registry" ALTER COLUMN "archetype" SET DATA TYPE text;
  DROP TYPE "public"."enum_route_registry_archetype";
  CREATE TYPE "public"."enum_route_registry_archetype" AS ENUM('page.homepage', 'page.standard', 'page.product', 'page.landing', 'page.legal', 'page.conversion', 'page.interactive-market-matrix', 'page.content-index', 'article.full', 'article.listing-metadata', 'learning-video.public-detail', 'learning-video.listing-metadata', 'hub.public-page', 'hub.map-only', 'venue.structured-record', 'venue.public-detail', 'index.venue', 'index.market-coverage', 'redirect');
  ALTER TABLE "route_registry" ALTER COLUMN "archetype" SET DATA TYPE "public"."enum_route_registry_archetype" USING "archetype"::"public"."enum_route_registry_archetype";
  DROP INDEX "pages_rels_people_id_idx";
  DROP INDEX "_pages_v_rels_people_id_idx";
  DROP INDEX "banners_rels_people_id_idx";
  DROP INDEX "_banners_v_rels_people_id_idx";
  DROP INDEX "articles_event_details_event_details_hubspot_form_id_idx";
  DROP INDEX "articles_rels_people_id_idx";
  DROP INDEX "_articles_v_version_event_details_version_event_details__idx";
  DROP INDEX "_articles_v_rels_people_id_idx";
  DROP INDEX "hubs_rels_people_id_idx";
  DROP INDEX "_hubs_v_rels_people_id_idx";
  DROP INDEX "venues_rels_people_id_idx";
  DROP INDEX "_venues_v_rels_people_id_idx";
  DROP INDEX "learning_videos_rels_people_id_idx";
  DROP INDEX "_learning_videos_v_rels_people_id_idx";
  DROP INDEX "redirects_rels_people_id_idx";
  DROP INDEX "payload_locked_documents_rels_people_id_idx";
  DROP INDEX "navigation_rels_people_id_idx";
  DROP INDEX "_navigation_v_rels_people_id_idx";
  DROP INDEX "footer_rels_people_id_idx";
  DROP INDEX "_footer_v_rels_people_id_idx";
  DROP INDEX "site_settings_rels_people_id_idx";
  DROP INDEX "_site_settings_v_rels_people_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "people_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "people_id";
  ALTER TABLE "banners_rels" DROP COLUMN "people_id";
  ALTER TABLE "_banners_v_rels" DROP COLUMN "people_id";
  ALTER TABLE "articles" DROP COLUMN "event_details_starts_at";
  ALTER TABLE "articles" DROP COLUMN "event_details_ends_at";
  ALTER TABLE "articles" DROP COLUMN "event_details_venue_name";
  ALTER TABLE "articles" DROP COLUMN "event_details_city";
  ALTER TABLE "articles" DROP COLUMN "event_details_region";
  ALTER TABLE "articles" DROP COLUMN "event_details_country";
  ALTER TABLE "articles" DROP COLUMN "event_details_coordinates_latitude";
  ALTER TABLE "articles" DROP COLUMN "event_details_coordinates_longitude";
  ALTER TABLE "articles" DROP COLUMN "event_details_form_title";
  ALTER TABLE "articles" DROP COLUMN "event_details_hubspot_form_id";
  ALTER TABLE "articles" DROP COLUMN "event_details_show_finished_notice";
  ALTER TABLE "articles" DROP COLUMN "event_details_hide_forms_after_end";
  ALTER TABLE "articles_rels" DROP COLUMN "people_id";
  ALTER TABLE "_articles_v" DROP COLUMN "version_event_details_starts_at";
  ALTER TABLE "_articles_v" DROP COLUMN "version_event_details_ends_at";
  ALTER TABLE "_articles_v" DROP COLUMN "version_event_details_venue_name";
  ALTER TABLE "_articles_v" DROP COLUMN "version_event_details_city";
  ALTER TABLE "_articles_v" DROP COLUMN "version_event_details_region";
  ALTER TABLE "_articles_v" DROP COLUMN "version_event_details_country";
  ALTER TABLE "_articles_v" DROP COLUMN "version_event_details_coordinates_latitude";
  ALTER TABLE "_articles_v" DROP COLUMN "version_event_details_coordinates_longitude";
  ALTER TABLE "_articles_v" DROP COLUMN "version_event_details_form_title";
  ALTER TABLE "_articles_v" DROP COLUMN "version_event_details_hubspot_form_id";
  ALTER TABLE "_articles_v" DROP COLUMN "version_event_details_show_finished_notice";
  ALTER TABLE "_articles_v" DROP COLUMN "version_event_details_hide_forms_after_end";
  ALTER TABLE "_articles_v_rels" DROP COLUMN "people_id";
  ALTER TABLE "hubs_rels" DROP COLUMN "people_id";
  ALTER TABLE "_hubs_v_rels" DROP COLUMN "people_id";
  ALTER TABLE "venues_rels" DROP COLUMN "people_id";
  ALTER TABLE "_venues_v_rels" DROP COLUMN "people_id";
  ALTER TABLE "learning_videos_rels" DROP COLUMN "people_id";
  ALTER TABLE "_learning_videos_v_rels" DROP COLUMN "people_id";
  ALTER TABLE "redirects_rels" DROP COLUMN "people_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "people_id";
  ALTER TABLE "navigation_rels" DROP COLUMN "people_id";
  ALTER TABLE "_navigation_v_rels" DROP COLUMN "people_id";
  ALTER TABLE "footer_rels" DROP COLUMN "people_id";
  ALTER TABLE "_footer_v_rels" DROP COLUMN "people_id";
  ALTER TABLE "site_settings_rels" DROP COLUMN "people_id";
  ALTER TABLE "_site_settings_v_rels" DROP COLUMN "people_id";
  DROP TYPE "public"."enum_pages_blocks_people_list_selection_mode";
  DROP TYPE "public"."enum_pages_blocks_people_list_team";
  DROP TYPE "public"."enum_pages_blocks_people_list_presentation";
  DROP TYPE "public"."enum__pages_v_blocks_people_list_selection_mode";
  DROP TYPE "public"."enum__pages_v_blocks_people_list_team";
  DROP TYPE "public"."enum__pages_v_blocks_people_list_presentation";
  DROP TYPE "public"."enum_articles_blocks_people_list_selection_mode";
  DROP TYPE "public"."enum_articles_blocks_people_list_team";
  DROP TYPE "public"."enum_articles_blocks_people_list_presentation";
  DROP TYPE "public"."enum__articles_v_blocks_people_list_selection_mode";
  DROP TYPE "public"."enum__articles_v_blocks_people_list_team";
  DROP TYPE "public"."enum__articles_v_blocks_people_list_presentation";
  DROP TYPE "public"."enum_people_team";
  DROP TYPE "public"."enum_people_status";
  DROP TYPE "public"."enum__people_v_version_team";
  DROP TYPE "public"."enum__people_v_version_status";
  DROP TYPE "public"."enum_hubs_blocks_people_list_selection_mode";
  DROP TYPE "public"."enum_hubs_blocks_people_list_team";
  DROP TYPE "public"."enum_hubs_blocks_people_list_presentation";
  DROP TYPE "public"."enum__hubs_v_blocks_people_list_selection_mode";
  DROP TYPE "public"."enum__hubs_v_blocks_people_list_team";
  DROP TYPE "public"."enum__hubs_v_blocks_people_list_presentation";
  DROP TYPE "public"."enum_venues_blocks_people_list_selection_mode";
  DROP TYPE "public"."enum_venues_blocks_people_list_team";
  DROP TYPE "public"."enum_venues_blocks_people_list_presentation";
  DROP TYPE "public"."enum__venues_v_blocks_people_list_selection_mode";
  DROP TYPE "public"."enum__venues_v_blocks_people_list_team";
  DROP TYPE "public"."enum__venues_v_blocks_people_list_presentation";
  DROP TYPE "public"."enum_learning_videos_blocks_people_list_selection_mode";
  DROP TYPE "public"."enum_learning_videos_blocks_people_list_team";
  DROP TYPE "public"."enum_learning_videos_blocks_people_list_presentation";
  DROP TYPE "public"."enum__learning_videos_v_blocks_people_list_selection_mode";
  DROP TYPE "public"."enum__learning_videos_v_blocks_people_list_team";
  DROP TYPE "public"."enum__learning_videos_v_blocks_people_list_presentation";`)
}
