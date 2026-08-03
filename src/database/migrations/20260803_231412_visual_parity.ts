import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."map_style" AS ENUM('dark', 'light');
  CREATE TYPE "public"."line_color" AS ENUM('#1f2a44', '#002d72', '#0057b8', '#009cde', '#00c1d5', '#32b77b', '#ff671f', '#f7ea48');
  CREATE TYPE "public"."chart_type" AS ENUM('stackedColumn', 'column', 'line');
  CREATE TYPE "public"."wrapper_theme" AS ENUM('none', 'softBlue', 'green', 'dark');
  CREATE TYPE "public"."presentation" AS ENUM('default', 'inset');
  CREATE TYPE "public"."bg_opacity" AS ENUM('none', '10', '20', '50');
  CREATE TABLE "pages_blocks_trayport_hero_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar
  );

  CREATE TABLE "_pages_v_blocks_trayport_hero_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "articles_blocks_trayport_hero_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar
  );

  CREATE TABLE "_articles_v_blocks_trayport_hero_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "hubs_blocks_trayport_hero_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar
  );

  CREATE TABLE "_hubs_v_blocks_trayport_hero_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "venues_blocks_trayport_hero_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar
  );

  CREATE TABLE "_venues_v_blocks_trayport_hero_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "learning_videos_blocks_trayport_hero_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar
  );

  CREATE TABLE "_learning_videos_v_blocks_trayport_hero_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "_uuid" varchar
  );

  ALTER TABLE "pages_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 100;
  ALTER TABLE "_pages_v_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 100;
  ALTER TABLE "articles_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 100;
  ALTER TABLE "_articles_v_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 100;
  ALTER TABLE "hubs_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 100;
  ALTER TABLE "_hubs_v_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 100;
  ALTER TABLE "venues_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 100;
  ALTER TABLE "_venues_v_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 100;
  ALTER TABLE "learning_videos_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 100;
  ALTER TABLE "_learning_videos_v_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 100;
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "style" "map_style" DEFAULT 'dark';
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "height" numeric DEFAULT 300;
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "marker_size" numeric DEFAULT 5;
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "show_lines" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "line_color" "line_color" DEFAULT '#009cde';
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "line_width" numeric DEFAULT 0.5;
  ALTER TABLE "pages_blocks_market_coverage" ADD COLUMN "line_opacity" numeric DEFAULT 0.5;
  ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "chart_type" chart_type DEFAULT 'stackedColumn';
  ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "from_year" numeric;
  ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "from_quarter" numeric;
  ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "to_year" numeric;
  ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "to_quarter" numeric;
  ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "axis_label" varchar;
  ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "height" numeric DEFAULT 350;
  ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "scale_power" numeric DEFAULT 0;
  ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "show_axes" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "show_legend" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "show_values" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "show_data_table" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_content_section" ADD COLUMN "wrapper_theme" "wrapper_theme" DEFAULT 'none';
  ALTER TABLE "pages_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "pages_blocks_content_section" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "pages_blocks_content_section" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "pages_rels" ADD COLUMN "asset_classes_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "venue_types_id" integer;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "style" "map_style" DEFAULT 'dark';
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "height" numeric DEFAULT 300;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "marker_size" numeric DEFAULT 5;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "show_lines" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "line_color" "line_color" DEFAULT '#009cde';
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "line_width" numeric DEFAULT 0.5;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD COLUMN "line_opacity" numeric DEFAULT 0.5;
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "chart_type" chart_type DEFAULT 'stackedColumn';
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "from_year" numeric;
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "from_quarter" numeric;
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "to_year" numeric;
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "to_quarter" numeric;
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "axis_label" varchar;
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "height" numeric DEFAULT 350;
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "scale_power" numeric DEFAULT 0;
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "show_axes" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "show_legend" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "show_values" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "show_data_table" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_content_section" ADD COLUMN "wrapper_theme" "wrapper_theme" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_content_section" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_pages_v_blocks_content_section" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "_pages_v_rels" ADD COLUMN "asset_classes_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "venue_types_id" integer;
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "style" "map_style" DEFAULT 'dark';
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "height" numeric DEFAULT 300;
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "marker_size" numeric DEFAULT 5;
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "show_lines" boolean DEFAULT true;
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "line_color" "line_color" DEFAULT '#009cde';
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "line_width" numeric DEFAULT 0.5;
  ALTER TABLE "articles_blocks_market_coverage" ADD COLUMN "line_opacity" numeric DEFAULT 0.5;
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "chart_type" chart_type DEFAULT 'stackedColumn';
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "from_year" numeric;
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "from_quarter" numeric;
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "to_year" numeric;
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "to_quarter" numeric;
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "axis_label" varchar;
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "height" numeric DEFAULT 350;
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "scale_power" numeric DEFAULT 0;
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "show_axes" boolean DEFAULT true;
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "show_legend" boolean DEFAULT true;
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "show_values" boolean DEFAULT false;
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "show_data_table" boolean DEFAULT true;
  ALTER TABLE "articles_blocks_content_section" ADD COLUMN "wrapper_theme" "wrapper_theme" DEFAULT 'none';
  ALTER TABLE "articles_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "articles_blocks_content_section" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "articles_blocks_content_section" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "articles_rels" ADD COLUMN "asset_classes_id" integer;
  ALTER TABLE "articles_rels" ADD COLUMN "venue_types_id" integer;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "style" "map_style" DEFAULT 'dark';
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "height" numeric DEFAULT 300;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "marker_size" numeric DEFAULT 5;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "show_lines" boolean DEFAULT true;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "line_color" "line_color" DEFAULT '#009cde';
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "line_width" numeric DEFAULT 0.5;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD COLUMN "line_opacity" numeric DEFAULT 0.5;
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "chart_type" chart_type DEFAULT 'stackedColumn';
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "from_year" numeric;
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "from_quarter" numeric;
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "to_year" numeric;
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "to_quarter" numeric;
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "axis_label" varchar;
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "height" numeric DEFAULT 350;
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "scale_power" numeric DEFAULT 0;
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "show_axes" boolean DEFAULT true;
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "show_legend" boolean DEFAULT true;
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "show_values" boolean DEFAULT false;
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "show_data_table" boolean DEFAULT true;
  ALTER TABLE "_articles_v_blocks_content_section" ADD COLUMN "wrapper_theme" "wrapper_theme" DEFAULT 'none';
  ALTER TABLE "_articles_v_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "_articles_v_blocks_content_section" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_articles_v_blocks_content_section" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "_articles_v_rels" ADD COLUMN "asset_classes_id" integer;
  ALTER TABLE "_articles_v_rels" ADD COLUMN "venue_types_id" integer;
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "style" "map_style" DEFAULT 'dark';
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "height" numeric DEFAULT 300;
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "marker_size" numeric DEFAULT 5;
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "show_lines" boolean DEFAULT true;
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "line_color" "line_color" DEFAULT '#009cde';
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "line_width" numeric DEFAULT 0.5;
  ALTER TABLE "hubs_blocks_market_coverage" ADD COLUMN "line_opacity" numeric DEFAULT 0.5;
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "chart_type" chart_type DEFAULT 'stackedColumn';
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "from_year" numeric;
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "from_quarter" numeric;
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "to_year" numeric;
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "to_quarter" numeric;
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "axis_label" varchar;
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "height" numeric DEFAULT 350;
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "scale_power" numeric DEFAULT 0;
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "show_axes" boolean DEFAULT true;
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "show_legend" boolean DEFAULT true;
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "show_values" boolean DEFAULT false;
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "show_data_table" boolean DEFAULT true;
  ALTER TABLE "hubs_blocks_content_section" ADD COLUMN "wrapper_theme" "wrapper_theme" DEFAULT 'none';
  ALTER TABLE "hubs_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "hubs_blocks_content_section" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "hubs_blocks_content_section" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "style" "map_style" DEFAULT 'dark';
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "height" numeric DEFAULT 300;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "marker_size" numeric DEFAULT 5;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "show_lines" boolean DEFAULT true;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "line_color" "line_color" DEFAULT '#009cde';
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "line_width" numeric DEFAULT 0.5;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD COLUMN "line_opacity" numeric DEFAULT 0.5;
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "chart_type" chart_type DEFAULT 'stackedColumn';
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "from_year" numeric;
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "from_quarter" numeric;
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "to_year" numeric;
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "to_quarter" numeric;
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "axis_label" varchar;
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "height" numeric DEFAULT 350;
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "scale_power" numeric DEFAULT 0;
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "show_axes" boolean DEFAULT true;
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "show_legend" boolean DEFAULT true;
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "show_values" boolean DEFAULT false;
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "show_data_table" boolean DEFAULT true;
  ALTER TABLE "_hubs_v_blocks_content_section" ADD COLUMN "wrapper_theme" "wrapper_theme" DEFAULT 'none';
  ALTER TABLE "_hubs_v_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "_hubs_v_blocks_content_section" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_hubs_v_blocks_content_section" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "style" "map_style" DEFAULT 'dark';
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "height" numeric DEFAULT 300;
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "marker_size" numeric DEFAULT 5;
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "show_lines" boolean DEFAULT true;
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "line_color" "line_color" DEFAULT '#009cde';
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "line_width" numeric DEFAULT 0.5;
  ALTER TABLE "venues_blocks_market_coverage" ADD COLUMN "line_opacity" numeric DEFAULT 0.5;
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "chart_type" chart_type DEFAULT 'stackedColumn';
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "from_year" numeric;
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "from_quarter" numeric;
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "to_year" numeric;
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "to_quarter" numeric;
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "axis_label" varchar;
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "height" numeric DEFAULT 350;
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "scale_power" numeric DEFAULT 0;
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "show_axes" boolean DEFAULT true;
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "show_legend" boolean DEFAULT true;
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "show_values" boolean DEFAULT false;
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "show_data_table" boolean DEFAULT true;
  ALTER TABLE "venues_blocks_content_section" ADD COLUMN "wrapper_theme" "wrapper_theme" DEFAULT 'none';
  ALTER TABLE "venues_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "venues_blocks_content_section" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "venues_blocks_content_section" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "style" "map_style" DEFAULT 'dark';
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "height" numeric DEFAULT 300;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "marker_size" numeric DEFAULT 5;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "show_lines" boolean DEFAULT true;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "line_color" "line_color" DEFAULT '#009cde';
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "line_width" numeric DEFAULT 0.5;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD COLUMN "line_opacity" numeric DEFAULT 0.5;
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "chart_type" chart_type DEFAULT 'stackedColumn';
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "from_year" numeric;
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "from_quarter" numeric;
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "to_year" numeric;
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "to_quarter" numeric;
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "axis_label" varchar;
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "height" numeric DEFAULT 350;
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "scale_power" numeric DEFAULT 0;
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "show_axes" boolean DEFAULT true;
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "show_legend" boolean DEFAULT true;
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "show_values" boolean DEFAULT false;
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "show_data_table" boolean DEFAULT true;
  ALTER TABLE "_venues_v_blocks_content_section" ADD COLUMN "wrapper_theme" "wrapper_theme" DEFAULT 'none';
  ALTER TABLE "_venues_v_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "_venues_v_blocks_content_section" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_venues_v_blocks_content_section" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "style" "map_style" DEFAULT 'dark';
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "height" numeric DEFAULT 300;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "marker_size" numeric DEFAULT 5;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "show_lines" boolean DEFAULT true;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "line_color" "line_color" DEFAULT '#009cde';
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "line_width" numeric DEFAULT 0.5;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD COLUMN "line_opacity" numeric DEFAULT 0.5;
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "chart_type" chart_type DEFAULT 'stackedColumn';
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "from_year" numeric;
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "from_quarter" numeric;
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "to_year" numeric;
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "to_quarter" numeric;
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "axis_label" varchar;
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "height" numeric DEFAULT 350;
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "scale_power" numeric DEFAULT 0;
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "show_axes" boolean DEFAULT true;
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "show_legend" boolean DEFAULT true;
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "show_values" boolean DEFAULT false;
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "show_data_table" boolean DEFAULT true;
  ALTER TABLE "learning_videos_blocks_content_section" ADD COLUMN "wrapper_theme" "wrapper_theme" DEFAULT 'none';
  ALTER TABLE "learning_videos_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "learning_videos_blocks_content_section" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "learning_videos_blocks_content_section" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "learning_videos_rels" ADD COLUMN "asset_classes_id" integer;
  ALTER TABLE "learning_videos_rels" ADD COLUMN "venue_types_id" integer;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "style" "map_style" DEFAULT 'dark';
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "height" numeric DEFAULT 300;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "marker_size" numeric DEFAULT 5;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "show_lines" boolean DEFAULT true;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "line_color" "line_color" DEFAULT '#009cde';
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "line_width" numeric DEFAULT 0.5;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD COLUMN "line_opacity" numeric DEFAULT 0.5;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "chart_type" chart_type DEFAULT 'stackedColumn';
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "from_year" numeric;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "from_quarter" numeric;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "to_year" numeric;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "to_quarter" numeric;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "axis_label" varchar;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "height" numeric DEFAULT 350;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "scale_power" numeric DEFAULT 0;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "show_axes" boolean DEFAULT true;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "show_legend" boolean DEFAULT true;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "show_values" boolean DEFAULT false;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "show_data_table" boolean DEFAULT true;
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD COLUMN "wrapper_theme" "wrapper_theme" DEFAULT 'none';
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "_learning_videos_v_rels" ADD COLUMN "asset_classes_id" integer;
  ALTER TABLE "_learning_videos_v_rels" ADD COLUMN "venue_types_id" integer;
  ALTER TABLE "pages_blocks_trayport_hero_statistics" ADD CONSTRAINT "pages_blocks_trayport_hero_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trayport_hero_statistics" ADD CONSTRAINT "_pages_v_blocks_trayport_hero_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_trayport_hero_statistics" ADD CONSTRAINT "articles_blocks_trayport_hero_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_trayport_hero_statistics" ADD CONSTRAINT "_articles_v_blocks_trayport_hero_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_trayport_hero_statistics" ADD CONSTRAINT "hubs_blocks_trayport_hero_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hubs_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_trayport_hero_statistics" ADD CONSTRAINT "_hubs_v_blocks_trayport_hero_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hubs_v_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_blocks_trayport_hero_statistics" ADD CONSTRAINT "venues_blocks_trayport_hero_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_trayport_hero_statistics" ADD CONSTRAINT "_venues_v_blocks_trayport_hero_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_venues_v_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_trayport_hero_statistics" ADD CONSTRAINT "learning_videos_blocks_trayport_hero_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."learning_videos_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_statistics" ADD CONSTRAINT "_learning_videos_v_blocks_trayport_hero_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_learning_videos_v_blocks_trayport_hero"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_trayport_hero_statistics_order_idx" ON "pages_blocks_trayport_hero_statistics" USING btree ("_order");
  CREATE INDEX "pages_blocks_trayport_hero_statistics_parent_id_idx" ON "pages_blocks_trayport_hero_statistics" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_trayport_hero_statistics_order_idx" ON "_pages_v_blocks_trayport_hero_statistics" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_trayport_hero_statistics_parent_id_idx" ON "_pages_v_blocks_trayport_hero_statistics" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_trayport_hero_statistics_order_idx" ON "articles_blocks_trayport_hero_statistics" USING btree ("_order");
  CREATE INDEX "articles_blocks_trayport_hero_statistics_parent_id_idx" ON "articles_blocks_trayport_hero_statistics" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_trayport_hero_statistics_order_idx" ON "_articles_v_blocks_trayport_hero_statistics" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_trayport_hero_statistics_parent_id_idx" ON "_articles_v_blocks_trayport_hero_statistics" USING btree ("_parent_id");
  CREATE INDEX "hubs_blocks_trayport_hero_statistics_order_idx" ON "hubs_blocks_trayport_hero_statistics" USING btree ("_order");
  CREATE INDEX "hubs_blocks_trayport_hero_statistics_parent_id_idx" ON "hubs_blocks_trayport_hero_statistics" USING btree ("_parent_id");
  CREATE INDEX "_hubs_v_blocks_trayport_hero_statistics_order_idx" ON "_hubs_v_blocks_trayport_hero_statistics" USING btree ("_order");
  CREATE INDEX "_hubs_v_blocks_trayport_hero_statistics_parent_id_idx" ON "_hubs_v_blocks_trayport_hero_statistics" USING btree ("_parent_id");
  CREATE INDEX "venues_blocks_trayport_hero_statistics_order_idx" ON "venues_blocks_trayport_hero_statistics" USING btree ("_order");
  CREATE INDEX "venues_blocks_trayport_hero_statistics_parent_id_idx" ON "venues_blocks_trayport_hero_statistics" USING btree ("_parent_id");
  CREATE INDEX "_venues_v_blocks_trayport_hero_statistics_order_idx" ON "_venues_v_blocks_trayport_hero_statistics" USING btree ("_order");
  CREATE INDEX "_venues_v_blocks_trayport_hero_statistics_parent_id_idx" ON "_venues_v_blocks_trayport_hero_statistics" USING btree ("_parent_id");
  CREATE INDEX "learning_videos_blocks_trayport_hero_statistics_order_idx" ON "learning_videos_blocks_trayport_hero_statistics" USING btree ("_order");
  CREATE INDEX "learning_videos_blocks_trayport_hero_statistics_parent_id_idx" ON "learning_videos_blocks_trayport_hero_statistics" USING btree ("_parent_id");
  CREATE INDEX "_learning_videos_v_blocks_trayport_hero_statistics_order_idx" ON "_learning_videos_v_blocks_trayport_hero_statistics" USING btree ("_order");
  CREATE INDEX "_learning_videos_v_blocks_trayport_hero_statistics_parent_id_idx" ON "_learning_videos_v_blocks_trayport_hero_statistics" USING btree ("_parent_id");
  ALTER TABLE "pages_blocks_market_coverage" ADD CONSTRAINT "pages_blocks_market_coverage_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_section" ADD CONSTRAINT "pages_blocks_content_section_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_asset_classes_fk" FOREIGN KEY ("asset_classes_id") REFERENCES "public"."asset_classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_venue_types_fk" FOREIGN KEY ("venue_types_id") REFERENCES "public"."venue_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_market_coverage" ADD CONSTRAINT "_pages_v_blocks_market_coverage_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_section" ADD CONSTRAINT "_pages_v_blocks_content_section_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_asset_classes_fk" FOREIGN KEY ("asset_classes_id") REFERENCES "public"."asset_classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_venue_types_fk" FOREIGN KEY ("venue_types_id") REFERENCES "public"."venue_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_market_coverage" ADD CONSTRAINT "articles_blocks_market_coverage_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_content_section" ADD CONSTRAINT "articles_blocks_content_section_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_asset_classes_fk" FOREIGN KEY ("asset_classes_id") REFERENCES "public"."asset_classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_venue_types_fk" FOREIGN KEY ("venue_types_id") REFERENCES "public"."venue_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_market_coverage" ADD CONSTRAINT "_articles_v_blocks_market_coverage_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_content_section" ADD CONSTRAINT "_articles_v_blocks_content_section_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_asset_classes_fk" FOREIGN KEY ("asset_classes_id") REFERENCES "public"."asset_classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_venue_types_fk" FOREIGN KEY ("venue_types_id") REFERENCES "public"."venue_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hubs_blocks_market_coverage" ADD CONSTRAINT "hubs_blocks_market_coverage_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_blocks_content_section" ADD CONSTRAINT "hubs_blocks_content_section_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_market_coverage" ADD CONSTRAINT "_hubs_v_blocks_market_coverage_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_content_section" ADD CONSTRAINT "_hubs_v_blocks_content_section_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_blocks_market_coverage" ADD CONSTRAINT "venues_blocks_market_coverage_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_blocks_content_section" ADD CONSTRAINT "venues_blocks_content_section_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_market_coverage" ADD CONSTRAINT "_venues_v_blocks_market_coverage_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_content_section" ADD CONSTRAINT "_venues_v_blocks_content_section_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_market_coverage" ADD CONSTRAINT "learning_videos_blocks_market_coverage_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_content_section" ADD CONSTRAINT "learning_videos_blocks_content_section_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_rels" ADD CONSTRAINT "learning_videos_rels_asset_classes_fk" FOREIGN KEY ("asset_classes_id") REFERENCES "public"."asset_classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "learning_videos_rels" ADD CONSTRAINT "learning_videos_rels_venue_types_fk" FOREIGN KEY ("venue_types_id") REFERENCES "public"."venue_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" ADD CONSTRAINT "_learning_videos_v_blocks_market_coverage_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD CONSTRAINT "_learning_videos_v_blocks_content_section_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_rels" ADD CONSTRAINT "_learning_videos_v_rels_asset_classes_fk" FOREIGN KEY ("asset_classes_id") REFERENCES "public"."asset_classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_rels" ADD CONSTRAINT "_learning_videos_v_rels_venue_types_fk" FOREIGN KEY ("venue_types_id") REFERENCES "public"."venue_types"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_market_coverage_background_media_idx" ON "pages_blocks_market_coverage" USING btree ("background_media_id");
  CREATE INDEX "pages_blocks_content_section_background_media_idx" ON "pages_blocks_content_section" USING btree ("background_media_id");
  CREATE INDEX "pages_rels_asset_classes_id_idx" ON "pages_rels" USING btree ("asset_classes_id");
  CREATE INDEX "pages_rels_venue_types_id_idx" ON "pages_rels" USING btree ("venue_types_id");
  CREATE INDEX "_pages_v_blocks_market_coverage_background_media_idx" ON "_pages_v_blocks_market_coverage" USING btree ("background_media_id");
  CREATE INDEX "_pages_v_blocks_content_section_background_media_idx" ON "_pages_v_blocks_content_section" USING btree ("background_media_id");
  CREATE INDEX "_pages_v_rels_asset_classes_id_idx" ON "_pages_v_rels" USING btree ("asset_classes_id");
  CREATE INDEX "_pages_v_rels_venue_types_id_idx" ON "_pages_v_rels" USING btree ("venue_types_id");
  CREATE INDEX "articles_blocks_market_coverage_background_media_idx" ON "articles_blocks_market_coverage" USING btree ("background_media_id");
  CREATE INDEX "articles_blocks_content_section_background_media_idx" ON "articles_blocks_content_section" USING btree ("background_media_id");
  CREATE INDEX "articles_rels_asset_classes_id_idx" ON "articles_rels" USING btree ("asset_classes_id");
  CREATE INDEX "articles_rels_venue_types_id_idx" ON "articles_rels" USING btree ("venue_types_id");
  CREATE INDEX "_articles_v_blocks_market_coverage_background_media_idx" ON "_articles_v_blocks_market_coverage" USING btree ("background_media_id");
  CREATE INDEX "_articles_v_blocks_content_section_background_media_idx" ON "_articles_v_blocks_content_section" USING btree ("background_media_id");
  CREATE INDEX "_articles_v_rels_asset_classes_id_idx" ON "_articles_v_rels" USING btree ("asset_classes_id");
  CREATE INDEX "_articles_v_rels_venue_types_id_idx" ON "_articles_v_rels" USING btree ("venue_types_id");
  CREATE INDEX "hubs_blocks_market_coverage_background_media_idx" ON "hubs_blocks_market_coverage" USING btree ("background_media_id");
  CREATE INDEX "hubs_blocks_content_section_background_media_idx" ON "hubs_blocks_content_section" USING btree ("background_media_id");
  CREATE INDEX "_hubs_v_blocks_market_coverage_background_media_idx" ON "_hubs_v_blocks_market_coverage" USING btree ("background_media_id");
  CREATE INDEX "_hubs_v_blocks_content_section_background_media_idx" ON "_hubs_v_blocks_content_section" USING btree ("background_media_id");
  CREATE INDEX "venues_blocks_market_coverage_background_media_idx" ON "venues_blocks_market_coverage" USING btree ("background_media_id");
  CREATE INDEX "venues_blocks_content_section_background_media_idx" ON "venues_blocks_content_section" USING btree ("background_media_id");
  CREATE INDEX "_venues_v_blocks_market_coverage_background_media_idx" ON "_venues_v_blocks_market_coverage" USING btree ("background_media_id");
  CREATE INDEX "_venues_v_blocks_content_section_background_media_idx" ON "_venues_v_blocks_content_section" USING btree ("background_media_id");
  CREATE INDEX "learning_videos_blocks_market_coverage_background_media_idx" ON "learning_videos_blocks_market_coverage" USING btree ("background_media_id");
  CREATE INDEX "learning_videos_blocks_content_section_background_media_idx" ON "learning_videos_blocks_content_section" USING btree ("background_media_id");
  CREATE INDEX "learning_videos_rels_asset_classes_id_idx" ON "learning_videos_rels" USING btree ("asset_classes_id");
  CREATE INDEX "learning_videos_rels_venue_types_id_idx" ON "learning_videos_rels" USING btree ("venue_types_id");
  CREATE INDEX "_learning_videos_v_blocks_market_coverage_background_med_idx" ON "_learning_videos_v_blocks_market_coverage" USING btree ("background_media_id");
  CREATE INDEX "_learning_videos_v_blocks_content_section_background_med_idx" ON "_learning_videos_v_blocks_content_section" USING btree ("background_media_id");
  CREATE INDEX "_learning_videos_v_rels_asset_classes_id_idx" ON "_learning_videos_v_rels" USING btree ("asset_classes_id");
  CREATE INDEX "_learning_videos_v_rels_venue_types_id_idx" ON "_learning_videos_v_rels" USING btree ("venue_types_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_trayport_hero_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_trayport_hero_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_trayport_hero_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_trayport_hero_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hubs_blocks_trayport_hero_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hubs_v_blocks_trayport_hero_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "venues_blocks_trayport_hero_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_venues_v_blocks_trayport_hero_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "learning_videos_blocks_trayport_hero_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_statistics" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_trayport_hero_statistics" CASCADE;
  DROP TABLE "_pages_v_blocks_trayport_hero_statistics" CASCADE;
  DROP TABLE "articles_blocks_trayport_hero_statistics" CASCADE;
  DROP TABLE "_articles_v_blocks_trayport_hero_statistics" CASCADE;
  DROP TABLE "hubs_blocks_trayport_hero_statistics" CASCADE;
  DROP TABLE "_hubs_v_blocks_trayport_hero_statistics" CASCADE;
  DROP TABLE "venues_blocks_trayport_hero_statistics" CASCADE;
  DROP TABLE "_venues_v_blocks_trayport_hero_statistics" CASCADE;
  DROP TABLE "learning_videos_blocks_trayport_hero_statistics" CASCADE;
  DROP TABLE "_learning_videos_v_blocks_trayport_hero_statistics" CASCADE;
  ALTER TABLE "pages_blocks_market_coverage" DROP CONSTRAINT "pages_blocks_market_coverage_background_media_id_media_id_fk";

  ALTER TABLE "pages_blocks_content_section" DROP CONSTRAINT "pages_blocks_content_section_background_media_id_media_id_fk";

  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_asset_classes_fk";

  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_venue_types_fk";

  ALTER TABLE "_pages_v_blocks_market_coverage" DROP CONSTRAINT "_pages_v_blocks_market_coverage_background_media_id_media_id_fk";

  ALTER TABLE "_pages_v_blocks_content_section" DROP CONSTRAINT "_pages_v_blocks_content_section_background_media_id_media_id_fk";

  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_asset_classes_fk";

  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_venue_types_fk";

  ALTER TABLE "articles_blocks_market_coverage" DROP CONSTRAINT "articles_blocks_market_coverage_background_media_id_media_id_fk";

  ALTER TABLE "articles_blocks_content_section" DROP CONSTRAINT "articles_blocks_content_section_background_media_id_media_id_fk";

  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_asset_classes_fk";

  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_venue_types_fk";

  ALTER TABLE "_articles_v_blocks_market_coverage" DROP CONSTRAINT "_articles_v_blocks_market_coverage_background_media_id_media_id_fk";

  ALTER TABLE "_articles_v_blocks_content_section" DROP CONSTRAINT "_articles_v_blocks_content_section_background_media_id_media_id_fk";

  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_asset_classes_fk";

  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_venue_types_fk";

  ALTER TABLE "hubs_blocks_market_coverage" DROP CONSTRAINT "hubs_blocks_market_coverage_background_media_id_media_id_fk";

  ALTER TABLE "hubs_blocks_content_section" DROP CONSTRAINT "hubs_blocks_content_section_background_media_id_media_id_fk";

  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP CONSTRAINT "_hubs_v_blocks_market_coverage_background_media_id_media_id_fk";

  ALTER TABLE "_hubs_v_blocks_content_section" DROP CONSTRAINT "_hubs_v_blocks_content_section_background_media_id_media_id_fk";

  ALTER TABLE "venues_blocks_market_coverage" DROP CONSTRAINT "venues_blocks_market_coverage_background_media_id_media_id_fk";

  ALTER TABLE "venues_blocks_content_section" DROP CONSTRAINT "venues_blocks_content_section_background_media_id_media_id_fk";

  ALTER TABLE "_venues_v_blocks_market_coverage" DROP CONSTRAINT "_venues_v_blocks_market_coverage_background_media_id_media_id_fk";

  ALTER TABLE "_venues_v_blocks_content_section" DROP CONSTRAINT "_venues_v_blocks_content_section_background_media_id_media_id_fk";

  ALTER TABLE "learning_videos_blocks_market_coverage" DROP CONSTRAINT "learning_videos_blocks_market_coverage_background_media_id_media_id_fk";

  ALTER TABLE "learning_videos_blocks_content_section" DROP CONSTRAINT "learning_videos_blocks_content_section_background_media_id_media_id_fk";

  ALTER TABLE "learning_videos_rels" DROP CONSTRAINT "learning_videos_rels_asset_classes_fk";

  ALTER TABLE "learning_videos_rels" DROP CONSTRAINT "learning_videos_rels_venue_types_fk";

  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP CONSTRAINT "_learning_videos_v_blocks_market_coverage_background_media_id_media_id_fk";

  ALTER TABLE "_learning_videos_v_blocks_content_section" DROP CONSTRAINT "_learning_videos_v_blocks_content_section_background_media_id_media_id_fk";

  ALTER TABLE "_learning_videos_v_rels" DROP CONSTRAINT "_learning_videos_v_rels_asset_classes_fk";

  ALTER TABLE "_learning_videos_v_rels" DROP CONSTRAINT "_learning_videos_v_rels_venue_types_fk";

  DROP INDEX "pages_blocks_market_coverage_background_media_idx";
  DROP INDEX "pages_blocks_content_section_background_media_idx";
  DROP INDEX "pages_rels_asset_classes_id_idx";
  DROP INDEX "pages_rels_venue_types_id_idx";
  DROP INDEX "_pages_v_blocks_market_coverage_background_media_idx";
  DROP INDEX "_pages_v_blocks_content_section_background_media_idx";
  DROP INDEX "_pages_v_rels_asset_classes_id_idx";
  DROP INDEX "_pages_v_rels_venue_types_id_idx";
  DROP INDEX "articles_blocks_market_coverage_background_media_idx";
  DROP INDEX "articles_blocks_content_section_background_media_idx";
  DROP INDEX "articles_rels_asset_classes_id_idx";
  DROP INDEX "articles_rels_venue_types_id_idx";
  DROP INDEX "_articles_v_blocks_market_coverage_background_media_idx";
  DROP INDEX "_articles_v_blocks_content_section_background_media_idx";
  DROP INDEX "_articles_v_rels_asset_classes_id_idx";
  DROP INDEX "_articles_v_rels_venue_types_id_idx";
  DROP INDEX "hubs_blocks_market_coverage_background_media_idx";
  DROP INDEX "hubs_blocks_content_section_background_media_idx";
  DROP INDEX "_hubs_v_blocks_market_coverage_background_media_idx";
  DROP INDEX "_hubs_v_blocks_content_section_background_media_idx";
  DROP INDEX "venues_blocks_market_coverage_background_media_idx";
  DROP INDEX "venues_blocks_content_section_background_media_idx";
  DROP INDEX "_venues_v_blocks_market_coverage_background_media_idx";
  DROP INDEX "_venues_v_blocks_content_section_background_media_idx";
  DROP INDEX "learning_videos_blocks_market_coverage_background_media_idx";
  DROP INDEX "learning_videos_blocks_content_section_background_media_idx";
  DROP INDEX "learning_videos_rels_asset_classes_id_idx";
  DROP INDEX "learning_videos_rels_venue_types_id_idx";
  DROP INDEX "_learning_videos_v_blocks_market_coverage_background_med_idx";
  DROP INDEX "_learning_videos_v_blocks_content_section_background_med_idx";
  DROP INDEX "_learning_videos_v_rels_asset_classes_id_idx";
  DROP INDEX "_learning_videos_v_rels_venue_types_id_idx";
  ALTER TABLE "pages_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 12;
  ALTER TABLE "_pages_v_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 12;
  ALTER TABLE "articles_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 12;
  ALTER TABLE "_articles_v_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 12;
  ALTER TABLE "hubs_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 12;
  ALTER TABLE "_hubs_v_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 12;
  ALTER TABLE "venues_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 12;
  ALTER TABLE "_venues_v_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 12;
  ALTER TABLE "learning_videos_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 12;
  ALTER TABLE "_learning_videos_v_blocks_article_listing" ALTER COLUMN "page_size" SET DEFAULT 12;
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "style";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "background_media_id";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "height";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "marker_size";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "show_lines";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "line_color";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "line_width";
  ALTER TABLE "pages_blocks_market_coverage" DROP COLUMN "line_opacity";
  ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "chart_type";
  ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "from_year";
  ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "from_quarter";
  ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "to_year";
  ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "to_quarter";
  ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "axis_label";
  ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "height";
  ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "scale_power";
  ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "show_axes";
  ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "show_legend";
  ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "show_values";
  ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "show_data_table";
  ALTER TABLE "pages_blocks_content_section" DROP COLUMN "wrapper_theme";
  ALTER TABLE "pages_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "pages_blocks_content_section" DROP COLUMN "background_media_id";
  ALTER TABLE "pages_blocks_content_section" DROP COLUMN "background_opacity";
  ALTER TABLE "pages_rels" DROP COLUMN "asset_classes_id";
  ALTER TABLE "pages_rels" DROP COLUMN "venue_types_id";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "style";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "background_media_id";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "height";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "marker_size";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "show_lines";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "line_color";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "line_width";
  ALTER TABLE "_pages_v_blocks_market_coverage" DROP COLUMN "line_opacity";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "chart_type";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "from_year";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "from_quarter";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "to_year";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "to_quarter";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "axis_label";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "height";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "scale_power";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "show_axes";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "show_legend";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "show_values";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "show_data_table";
  ALTER TABLE "_pages_v_blocks_content_section" DROP COLUMN "wrapper_theme";
  ALTER TABLE "_pages_v_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "_pages_v_blocks_content_section" DROP COLUMN "background_media_id";
  ALTER TABLE "_pages_v_blocks_content_section" DROP COLUMN "background_opacity";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "asset_classes_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "venue_types_id";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "style";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "background_media_id";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "height";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "marker_size";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "show_lines";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "line_color";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "line_width";
  ALTER TABLE "articles_blocks_market_coverage" DROP COLUMN "line_opacity";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "chart_type";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "from_year";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "from_quarter";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "to_year";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "to_quarter";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "axis_label";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "height";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "scale_power";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "show_axes";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "show_legend";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "show_values";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "show_data_table";
  ALTER TABLE "articles_blocks_content_section" DROP COLUMN "wrapper_theme";
  ALTER TABLE "articles_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "articles_blocks_content_section" DROP COLUMN "background_media_id";
  ALTER TABLE "articles_blocks_content_section" DROP COLUMN "background_opacity";
  ALTER TABLE "articles_rels" DROP COLUMN "asset_classes_id";
  ALTER TABLE "articles_rels" DROP COLUMN "venue_types_id";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "style";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "background_media_id";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "height";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "marker_size";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "show_lines";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "line_color";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "line_width";
  ALTER TABLE "_articles_v_blocks_market_coverage" DROP COLUMN "line_opacity";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "chart_type";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "from_year";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "from_quarter";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "to_year";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "to_quarter";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "axis_label";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "height";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "scale_power";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "show_axes";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "show_legend";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "show_values";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "show_data_table";
  ALTER TABLE "_articles_v_blocks_content_section" DROP COLUMN "wrapper_theme";
  ALTER TABLE "_articles_v_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "_articles_v_blocks_content_section" DROP COLUMN "background_media_id";
  ALTER TABLE "_articles_v_blocks_content_section" DROP COLUMN "background_opacity";
  ALTER TABLE "_articles_v_rels" DROP COLUMN "asset_classes_id";
  ALTER TABLE "_articles_v_rels" DROP COLUMN "venue_types_id";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "style";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "background_media_id";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "height";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "marker_size";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "show_lines";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "line_color";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "line_width";
  ALTER TABLE "hubs_blocks_market_coverage" DROP COLUMN "line_opacity";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "chart_type";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "from_year";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "from_quarter";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "to_year";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "to_quarter";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "axis_label";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "height";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "scale_power";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "show_axes";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "show_legend";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "show_values";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "show_data_table";
  ALTER TABLE "hubs_blocks_content_section" DROP COLUMN "wrapper_theme";
  ALTER TABLE "hubs_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "hubs_blocks_content_section" DROP COLUMN "background_media_id";
  ALTER TABLE "hubs_blocks_content_section" DROP COLUMN "background_opacity";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "style";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "background_media_id";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "height";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "marker_size";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "show_lines";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "line_color";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "line_width";
  ALTER TABLE "_hubs_v_blocks_market_coverage" DROP COLUMN "line_opacity";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "chart_type";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "from_year";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "from_quarter";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "to_year";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "to_quarter";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "axis_label";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "height";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "scale_power";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "show_axes";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "show_legend";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "show_values";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "show_data_table";
  ALTER TABLE "_hubs_v_blocks_content_section" DROP COLUMN "wrapper_theme";
  ALTER TABLE "_hubs_v_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "_hubs_v_blocks_content_section" DROP COLUMN "background_media_id";
  ALTER TABLE "_hubs_v_blocks_content_section" DROP COLUMN "background_opacity";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "style";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "background_media_id";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "height";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "marker_size";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "show_lines";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "line_color";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "line_width";
  ALTER TABLE "venues_blocks_market_coverage" DROP COLUMN "line_opacity";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "chart_type";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "from_year";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "from_quarter";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "to_year";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "to_quarter";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "axis_label";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "height";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "scale_power";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "show_axes";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "show_legend";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "show_values";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "show_data_table";
  ALTER TABLE "venues_blocks_content_section" DROP COLUMN "wrapper_theme";
  ALTER TABLE "venues_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "venues_blocks_content_section" DROP COLUMN "background_media_id";
  ALTER TABLE "venues_blocks_content_section" DROP COLUMN "background_opacity";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "style";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "background_media_id";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "height";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "marker_size";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "show_lines";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "line_color";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "line_width";
  ALTER TABLE "_venues_v_blocks_market_coverage" DROP COLUMN "line_opacity";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "chart_type";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "from_year";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "from_quarter";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "to_year";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "to_quarter";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "axis_label";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "height";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "scale_power";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "show_axes";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "show_legend";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "show_values";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "show_data_table";
  ALTER TABLE "_venues_v_blocks_content_section" DROP COLUMN "wrapper_theme";
  ALTER TABLE "_venues_v_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "_venues_v_blocks_content_section" DROP COLUMN "background_media_id";
  ALTER TABLE "_venues_v_blocks_content_section" DROP COLUMN "background_opacity";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "style";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "background_media_id";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "height";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "marker_size";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "show_lines";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "line_color";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "line_width";
  ALTER TABLE "learning_videos_blocks_market_coverage" DROP COLUMN "line_opacity";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "chart_type";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "from_year";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "from_quarter";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "to_year";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "to_quarter";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "axis_label";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "height";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "scale_power";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "show_axes";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "show_legend";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "show_values";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "show_data_table";
  ALTER TABLE "learning_videos_blocks_content_section" DROP COLUMN "wrapper_theme";
  ALTER TABLE "learning_videos_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "learning_videos_blocks_content_section" DROP COLUMN "background_media_id";
  ALTER TABLE "learning_videos_blocks_content_section" DROP COLUMN "background_opacity";
  ALTER TABLE "learning_videos_rels" DROP COLUMN "asset_classes_id";
  ALTER TABLE "learning_videos_rels" DROP COLUMN "venue_types_id";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "style";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "background_media_id";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "height";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "marker_size";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "show_lines";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "line_color";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "line_width";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage" DROP COLUMN "line_opacity";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "chart_type";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "from_year";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "from_quarter";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "to_year";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "to_quarter";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "axis_label";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "height";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "scale_power";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "show_axes";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "show_legend";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "show_values";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "show_data_table";
  ALTER TABLE "_learning_videos_v_blocks_content_section" DROP COLUMN "wrapper_theme";
  ALTER TABLE "_learning_videos_v_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "_learning_videos_v_blocks_content_section" DROP COLUMN "background_media_id";
  ALTER TABLE "_learning_videos_v_blocks_content_section" DROP COLUMN "background_opacity";
  ALTER TABLE "_learning_videos_v_rels" DROP COLUMN "asset_classes_id";
  ALTER TABLE "_learning_videos_v_rels" DROP COLUMN "venue_types_id";
  DROP TYPE "public"."map_style";
  DROP TYPE "public"."line_color";
  DROP TYPE "public"."chart_type";
  DROP TYPE "public"."wrapper_theme";
  DROP TYPE "public"."presentation";
  DROP TYPE "public"."bg_opacity";`)
}
