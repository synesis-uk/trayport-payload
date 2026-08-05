import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_banners_layout" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum_banners_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_banners_tone" AS ENUM('deep', 'blue', 'cyan', 'orange', 'yellow', 'light');
  CREATE TYPE "public"."enum_banners_position" AS ENUM('first', 'second', 'last');
  CREATE TYPE "public"."enum_banners_target_mode" AS ENUM('all', 'specific');
  CREATE TYPE "public"."enum_banners_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__banners_v_version_layout" AS ENUM('small', 'large');
  CREATE TYPE "public"."enum__banners_v_version_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__banners_v_version_tone" AS ENUM('deep', 'blue', 'cyan', 'orange', 'yellow', 'light');
  CREATE TYPE "public"."enum__banners_v_version_position" AS ENUM('first', 'second', 'last');
  CREATE TYPE "public"."enum__banners_v_version_target_mode" AS ENUM('all', 'specific');
  CREATE TYPE "public"."enum__banners_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "banners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"headline" varchar,
  	"layout" "enum_banners_layout" DEFAULT 'small',
  	"body" jsonb,
  	"image_id" integer,
  	"link_label" varchar,
  	"link_type" "enum_banners_link_type" DEFAULT 'reference',
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"tone" "enum_banners_tone" DEFAULT 'deep',
  	"dismissible" boolean DEFAULT true,
  	"start_at" timestamp(3) with time zone,
  	"end_at" timestamp(3) with time zone,
  	"position" "enum_banners_position" DEFAULT 'first',
  	"priority" numeric DEFAULT 0,
  	"target_mode" "enum_banners_target_mode" DEFAULT 'all',
  	"notification_state_before_start_sent_at" timestamp(3) with time zone,
  	"notification_state_started_sent_at" timestamp(3) with time zone,
  	"notification_state_before_end_sent_at" timestamp(3) with time zone,
  	"notification_state_ended_sent_at" timestamp(3) with time zone,
  	"legacy_source_key" varchar,
  	"legacy_source_source" varchar,
  	"legacy_source_legacy_id" numeric,
  	"legacy_source_original_url" varchar,
  	"legacy_source_modified_gmt" timestamp(3) with time zone,
  	"legacy_source_content_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_banners_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "banners_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"articles_id" integer,
  	"hubs_id" integer,
  	"venues_id" integer,
  	"learning_videos_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_banners_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_headline" varchar,
  	"version_layout" "enum__banners_v_version_layout" DEFAULT 'small',
  	"version_body" jsonb,
  	"version_image_id" integer,
  	"version_link_label" varchar,
  	"version_link_type" "enum__banners_v_version_link_type" DEFAULT 'reference',
  	"version_link_url" varchar,
  	"version_link_new_tab" boolean DEFAULT false,
  	"version_tone" "enum__banners_v_version_tone" DEFAULT 'deep',
  	"version_dismissible" boolean DEFAULT true,
  	"version_start_at" timestamp(3) with time zone,
  	"version_end_at" timestamp(3) with time zone,
  	"version_position" "enum__banners_v_version_position" DEFAULT 'first',
  	"version_priority" numeric DEFAULT 0,
  	"version_target_mode" "enum__banners_v_version_target_mode" DEFAULT 'all',
  	"version_notification_state_before_start_sent_at" timestamp(3) with time zone,
  	"version_notification_state_started_sent_at" timestamp(3) with time zone,
  	"version_notification_state_before_end_sent_at" timestamp(3) with time zone,
  	"version_notification_state_ended_sent_at" timestamp(3) with time zone,
  	"version_legacy_source_key" varchar,
  	"version_legacy_source_source" varchar,
  	"version_legacy_source_legacy_id" numeric,
  	"version_legacy_source_original_url" varchar,
  	"version_legacy_source_modified_gmt" timestamp(3) with time zone,
  	"version_legacy_source_content_hash" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__banners_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_banners_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"articles_id" integer,
  	"hubs_id" integer,
  	"venues_id" integer,
  	"learning_videos_id" integer,
  	"users_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "banners_id" integer;
  ALTER TABLE "banners" ADD CONSTRAINT "banners_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "banners_rels" ADD CONSTRAINT "banners_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "banners_rels" ADD CONSTRAINT "banners_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "banners_rels" ADD CONSTRAINT "banners_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "banners_rels" ADD CONSTRAINT "banners_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "banners_rels" ADD CONSTRAINT "banners_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "banners_rels" ADD CONSTRAINT "banners_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "banners_rels" ADD CONSTRAINT "banners_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_banners_v" ADD CONSTRAINT "_banners_v_parent_id_banners_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."banners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_banners_v" ADD CONSTRAINT "_banners_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_banners_v_rels" ADD CONSTRAINT "_banners_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_banners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_banners_v_rels" ADD CONSTRAINT "_banners_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_banners_v_rels" ADD CONSTRAINT "_banners_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_banners_v_rels" ADD CONSTRAINT "_banners_v_rels_hubs_fk" FOREIGN KEY ("hubs_id") REFERENCES "public"."hubs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_banners_v_rels" ADD CONSTRAINT "_banners_v_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_banners_v_rels" ADD CONSTRAINT "_banners_v_rels_learning_videos_fk" FOREIGN KEY ("learning_videos_id") REFERENCES "public"."learning_videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_banners_v_rels" ADD CONSTRAINT "_banners_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "banners_title_idx" ON "banners" USING btree ("title");
  CREATE INDEX "banners_image_idx" ON "banners" USING btree ("image_id");
  CREATE INDEX "banners_start_at_idx" ON "banners" USING btree ("start_at");
  CREATE INDEX "banners_end_at_idx" ON "banners" USING btree ("end_at");
  CREATE INDEX "banners_priority_idx" ON "banners" USING btree ("priority");
  CREATE UNIQUE INDEX "banners_legacy_source_legacy_source_key_idx" ON "banners" USING btree ("legacy_source_key");
  CREATE INDEX "banners_legacy_source_legacy_source_source_idx" ON "banners" USING btree ("legacy_source_source");
  CREATE INDEX "banners_legacy_source_legacy_source_legacy_id_idx" ON "banners" USING btree ("legacy_source_legacy_id");
  CREATE INDEX "banners_legacy_source_legacy_source_content_hash_idx" ON "banners" USING btree ("legacy_source_content_hash");
  CREATE INDEX "banners_updated_at_idx" ON "banners" USING btree ("updated_at");
  CREATE INDEX "banners_created_at_idx" ON "banners" USING btree ("created_at");
  CREATE INDEX "banners__status_idx" ON "banners" USING btree ("_status");
  CREATE INDEX "banners_rels_order_idx" ON "banners_rels" USING btree ("order");
  CREATE INDEX "banners_rels_parent_idx" ON "banners_rels" USING btree ("parent_id");
  CREATE INDEX "banners_rels_path_idx" ON "banners_rels" USING btree ("path");
  CREATE INDEX "banners_rels_pages_id_idx" ON "banners_rels" USING btree ("pages_id");
  CREATE INDEX "banners_rels_articles_id_idx" ON "banners_rels" USING btree ("articles_id");
  CREATE INDEX "banners_rels_hubs_id_idx" ON "banners_rels" USING btree ("hubs_id");
  CREATE INDEX "banners_rels_venues_id_idx" ON "banners_rels" USING btree ("venues_id");
  CREATE INDEX "banners_rels_learning_videos_id_idx" ON "banners_rels" USING btree ("learning_videos_id");
  CREATE INDEX "banners_rels_users_id_idx" ON "banners_rels" USING btree ("users_id");
  CREATE INDEX "_banners_v_parent_idx" ON "_banners_v" USING btree ("parent_id");
  CREATE INDEX "_banners_v_version_version_title_idx" ON "_banners_v" USING btree ("version_title");
  CREATE INDEX "_banners_v_version_version_image_idx" ON "_banners_v" USING btree ("version_image_id");
  CREATE INDEX "_banners_v_version_version_start_at_idx" ON "_banners_v" USING btree ("version_start_at");
  CREATE INDEX "_banners_v_version_version_end_at_idx" ON "_banners_v" USING btree ("version_end_at");
  CREATE INDEX "_banners_v_version_version_priority_idx" ON "_banners_v" USING btree ("version_priority");
  CREATE INDEX "_banners_v_version_legacy_source_version_legacy_source_k_idx" ON "_banners_v" USING btree ("version_legacy_source_key");
  CREATE INDEX "_banners_v_version_legacy_source_version_legacy_source_s_idx" ON "_banners_v" USING btree ("version_legacy_source_source");
  CREATE INDEX "_banners_v_version_legacy_source_version_legacy_source_l_idx" ON "_banners_v" USING btree ("version_legacy_source_legacy_id");
  CREATE INDEX "_banners_v_version_legacy_source_version_legacy_source_c_idx" ON "_banners_v" USING btree ("version_legacy_source_content_hash");
  CREATE INDEX "_banners_v_version_version_updated_at_idx" ON "_banners_v" USING btree ("version_updated_at");
  CREATE INDEX "_banners_v_version_version_created_at_idx" ON "_banners_v" USING btree ("version_created_at");
  CREATE INDEX "_banners_v_version_version__status_idx" ON "_banners_v" USING btree ("version__status");
  CREATE INDEX "_banners_v_created_at_idx" ON "_banners_v" USING btree ("created_at");
  CREATE INDEX "_banners_v_updated_at_idx" ON "_banners_v" USING btree ("updated_at");
  CREATE INDEX "_banners_v_latest_idx" ON "_banners_v" USING btree ("latest");
  CREATE INDEX "_banners_v_autosave_idx" ON "_banners_v" USING btree ("autosave");
  CREATE INDEX "_banners_v_rels_order_idx" ON "_banners_v_rels" USING btree ("order");
  CREATE INDEX "_banners_v_rels_parent_idx" ON "_banners_v_rels" USING btree ("parent_id");
  CREATE INDEX "_banners_v_rels_path_idx" ON "_banners_v_rels" USING btree ("path");
  CREATE INDEX "_banners_v_rels_pages_id_idx" ON "_banners_v_rels" USING btree ("pages_id");
  CREATE INDEX "_banners_v_rels_articles_id_idx" ON "_banners_v_rels" USING btree ("articles_id");
  CREATE INDEX "_banners_v_rels_hubs_id_idx" ON "_banners_v_rels" USING btree ("hubs_id");
  CREATE INDEX "_banners_v_rels_venues_id_idx" ON "_banners_v_rels" USING btree ("venues_id");
  CREATE INDEX "_banners_v_rels_learning_videos_id_idx" ON "_banners_v_rels" USING btree ("learning_videos_id");
  CREATE INDEX "_banners_v_rels_users_id_idx" ON "_banners_v_rels" USING btree ("users_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_banners_fk" FOREIGN KEY ("banners_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_banners_id_idx" ON "payload_locked_documents_rels" USING btree ("banners_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "banners" DISABLE ROW LEVEL SECURITY;
   ALTER TABLE "banners_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_banners_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_banners_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_banners_fk";
  DROP INDEX "payload_locked_documents_rels_banners_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "banners_id";
  DROP TABLE "banners" CASCADE;
  DROP TABLE "banners_rels" CASCADE;
  DROP TABLE "_banners_v" CASCADE;
  DROP TABLE "_banners_v_rels" CASCADE;
  DROP TYPE "public"."enum_banners_layout";
  DROP TYPE "public"."enum_banners_link_type";
  DROP TYPE "public"."enum_banners_tone";
  DROP TYPE "public"."enum_banners_position";
  DROP TYPE "public"."enum_banners_target_mode";
  DROP TYPE "public"."enum_banners_status";
  DROP TYPE "public"."enum__banners_v_version_layout";
  DROP TYPE "public"."enum__banners_v_version_link_type";
  DROP TYPE "public"."enum__banners_v_version_tone";
  DROP TYPE "public"."enum__banners_v_version_position";
  DROP TYPE "public"."enum__banners_v_version_target_mode";
  DROP TYPE "public"."enum__banners_v_version_status";`)
}
