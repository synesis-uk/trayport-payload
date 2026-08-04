import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_trayport_hero_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_pages_blocks_trayport_hero_badge_icon" AS ENUM('people', 'tradingScreen');
  CREATE TYPE "public"."enum_pages_blocks_trayport_hero_badge_tone" AS ENUM('secondary', 'info');
  CREATE TYPE "public"."enum_pages_blocks_trayport_hero_media_aspect" AS ENUM('twoToOne', 'sixteenToNine');
  CREATE TYPE "public"."enum_pages_blocks_heading_appearance" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_pages_blocks_actions_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_pages_blocks_market_coverage_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."horizontal_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."vertical_align" AS ENUM('start', 'center');
  CREATE TYPE "public"."height_mode" AS ENUM('fill', 'content');
  CREATE TYPE "public"."component_gap" AS ENUM('none', 'regular');
  CREATE TYPE "public"."enum_pages_blocks_content_section_columns_padding" AS ENUM('none', 'medium');
  CREATE TYPE "public"."enum_pages_blocks_content_section_columns_surface" AS ENUM('none', 'muted', 'soft');
  CREATE TYPE "public"."enum_pages_blocks_content_section_columns_border" AS ENUM('none', 'subtle');
  CREATE TYPE "public"."enum_pages_blocks_content_section_columns_radius" AS ENUM('default', 'xl');
  CREATE TYPE "public"."theme" AS ENUM('none', 'white', 'softBlue', 'dark');
  CREATE TYPE "public"."surface_radius" AS ENUM('default', 'xl');
  CREATE TYPE "public"."surface_padding" AS ENUM('none', 'medium');
  CREATE TYPE "public"."spacing_top" AS ENUM('tight', 'regular', 'large');
  CREATE TYPE "public"."spacing_bottom" AS ENUM('tight', 'regular', 'large');
  CREATE TYPE "public"."column_gap" AS ENUM('tight', 'regular');
  CREATE TYPE "public"."enum__pages_v_blocks_trayport_hero_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__pages_v_blocks_trayport_hero_badge_icon" AS ENUM('people', 'tradingScreen');
  CREATE TYPE "public"."enum__pages_v_blocks_trayport_hero_badge_tone" AS ENUM('secondary', 'info');
  CREATE TYPE "public"."enum__pages_v_blocks_trayport_hero_media_aspect" AS ENUM('twoToOne', 'sixteenToNine');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_appearance" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__pages_v_blocks_actions_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__pages_v_blocks_market_coverage_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_columns_padding" AS ENUM('none', 'medium');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_columns_surface" AS ENUM('none', 'muted', 'soft');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_columns_border" AS ENUM('none', 'subtle');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_columns_radius" AS ENUM('default', 'xl');
  CREATE TYPE "public"."enum_articles_blocks_trayport_hero_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_articles_blocks_trayport_hero_badge_icon" AS ENUM('people', 'tradingScreen');
  CREATE TYPE "public"."enum_articles_blocks_trayport_hero_badge_tone" AS ENUM('secondary', 'info');
  CREATE TYPE "public"."enum_articles_blocks_trayport_hero_media_aspect" AS ENUM('twoToOne', 'sixteenToNine');
  CREATE TYPE "public"."enum_articles_blocks_heading_appearance" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_articles_blocks_actions_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_articles_blocks_market_coverage_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_articles_blocks_content_section_columns_padding" AS ENUM('none', 'medium');
  CREATE TYPE "public"."enum_articles_blocks_content_section_columns_surface" AS ENUM('none', 'muted', 'soft');
  CREATE TYPE "public"."enum_articles_blocks_content_section_columns_border" AS ENUM('none', 'subtle');
  CREATE TYPE "public"."enum_articles_blocks_content_section_columns_radius" AS ENUM('default', 'xl');
  CREATE TYPE "public"."enum__articles_v_blocks_trayport_hero_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__articles_v_blocks_trayport_hero_badge_icon" AS ENUM('people', 'tradingScreen');
  CREATE TYPE "public"."enum__articles_v_blocks_trayport_hero_badge_tone" AS ENUM('secondary', 'info');
  CREATE TYPE "public"."enum__articles_v_blocks_trayport_hero_media_aspect" AS ENUM('twoToOne', 'sixteenToNine');
  CREATE TYPE "public"."enum__articles_v_blocks_heading_appearance" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__articles_v_blocks_actions_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__articles_v_blocks_market_coverage_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__articles_v_blocks_content_section_columns_padding" AS ENUM('none', 'medium');
  CREATE TYPE "public"."enum__articles_v_blocks_content_section_columns_surface" AS ENUM('none', 'muted', 'soft');
  CREATE TYPE "public"."enum__articles_v_blocks_content_section_columns_border" AS ENUM('none', 'subtle');
  CREATE TYPE "public"."enum__articles_v_blocks_content_section_columns_radius" AS ENUM('default', 'xl');
  CREATE TYPE "public"."enum_hubs_blocks_trayport_hero_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_hubs_blocks_trayport_hero_badge_icon" AS ENUM('people', 'tradingScreen');
  CREATE TYPE "public"."enum_hubs_blocks_trayport_hero_badge_tone" AS ENUM('secondary', 'info');
  CREATE TYPE "public"."enum_hubs_blocks_trayport_hero_media_aspect" AS ENUM('twoToOne', 'sixteenToNine');
  CREATE TYPE "public"."enum_hubs_blocks_heading_appearance" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_hubs_blocks_actions_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_hubs_blocks_market_coverage_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_hubs_blocks_content_section_columns_padding" AS ENUM('none', 'medium');
  CREATE TYPE "public"."enum_hubs_blocks_content_section_columns_surface" AS ENUM('none', 'muted', 'soft');
  CREATE TYPE "public"."enum_hubs_blocks_content_section_columns_border" AS ENUM('none', 'subtle');
  CREATE TYPE "public"."enum_hubs_blocks_content_section_columns_radius" AS ENUM('default', 'xl');
  CREATE TYPE "public"."enum__hubs_v_blocks_trayport_hero_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__hubs_v_blocks_trayport_hero_badge_icon" AS ENUM('people', 'tradingScreen');
  CREATE TYPE "public"."enum__hubs_v_blocks_trayport_hero_badge_tone" AS ENUM('secondary', 'info');
  CREATE TYPE "public"."enum__hubs_v_blocks_trayport_hero_media_aspect" AS ENUM('twoToOne', 'sixteenToNine');
  CREATE TYPE "public"."enum__hubs_v_blocks_heading_appearance" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__hubs_v_blocks_actions_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__hubs_v_blocks_market_coverage_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__hubs_v_blocks_content_section_columns_padding" AS ENUM('none', 'medium');
  CREATE TYPE "public"."enum__hubs_v_blocks_content_section_columns_surface" AS ENUM('none', 'muted', 'soft');
  CREATE TYPE "public"."enum__hubs_v_blocks_content_section_columns_border" AS ENUM('none', 'subtle');
  CREATE TYPE "public"."enum__hubs_v_blocks_content_section_columns_radius" AS ENUM('default', 'xl');
  CREATE TYPE "public"."enum_venues_blocks_trayport_hero_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_venues_blocks_trayport_hero_badge_icon" AS ENUM('people', 'tradingScreen');
  CREATE TYPE "public"."enum_venues_blocks_trayport_hero_badge_tone" AS ENUM('secondary', 'info');
  CREATE TYPE "public"."enum_venues_blocks_trayport_hero_media_aspect" AS ENUM('twoToOne', 'sixteenToNine');
  CREATE TYPE "public"."enum_venues_blocks_heading_appearance" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_venues_blocks_actions_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_venues_blocks_market_coverage_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_venues_blocks_content_section_columns_padding" AS ENUM('none', 'medium');
  CREATE TYPE "public"."enum_venues_blocks_content_section_columns_surface" AS ENUM('none', 'muted', 'soft');
  CREATE TYPE "public"."enum_venues_blocks_content_section_columns_border" AS ENUM('none', 'subtle');
  CREATE TYPE "public"."enum_venues_blocks_content_section_columns_radius" AS ENUM('default', 'xl');
  CREATE TYPE "public"."enum__venues_v_blocks_trayport_hero_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__venues_v_blocks_trayport_hero_badge_icon" AS ENUM('people', 'tradingScreen');
  CREATE TYPE "public"."enum__venues_v_blocks_trayport_hero_badge_tone" AS ENUM('secondary', 'info');
  CREATE TYPE "public"."enum__venues_v_blocks_trayport_hero_media_aspect" AS ENUM('twoToOne', 'sixteenToNine');
  CREATE TYPE "public"."enum__venues_v_blocks_heading_appearance" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__venues_v_blocks_actions_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__venues_v_blocks_market_coverage_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__venues_v_blocks_content_section_columns_padding" AS ENUM('none', 'medium');
  CREATE TYPE "public"."enum__venues_v_blocks_content_section_columns_surface" AS ENUM('none', 'muted', 'soft');
  CREATE TYPE "public"."enum__venues_v_blocks_content_section_columns_border" AS ENUM('none', 'subtle');
  CREATE TYPE "public"."enum__venues_v_blocks_content_section_columns_radius" AS ENUM('default', 'xl');
  CREATE TYPE "public"."enum_learning_videos_blocks_trayport_hero_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_learning_videos_blocks_trayport_hero_badge_icon" AS ENUM('people', 'tradingScreen');
  CREATE TYPE "public"."enum_learning_videos_blocks_trayport_hero_badge_tone" AS ENUM('secondary', 'info');
  CREATE TYPE "public"."enum_learning_videos_blocks_trayport_hero_media_aspect" AS ENUM('twoToOne', 'sixteenToNine');
  CREATE TYPE "public"."enum_learning_videos_blocks_heading_appearance" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_learning_videos_blocks_actions_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_learning_videos_blocks_market_coverage_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum_learning_videos_blocks_content_section_columns_padding" AS ENUM('none', 'medium');
  CREATE TYPE "public"."enum_learning_videos_blocks_content_section_columns_surface" AS ENUM('none', 'muted', 'soft');
  CREATE TYPE "public"."enum_learning_videos_blocks_content_section_columns_border" AS ENUM('none', 'subtle');
  CREATE TYPE "public"."enum_learning_videos_blocks_content_section_columns_radius" AS ENUM('default', 'xl');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_badge_icon" AS ENUM('people', 'tradingScreen');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_badge_tone" AS ENUM('secondary', 'info');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_media_aspect" AS ENUM('twoToOne', 'sixteenToNine');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_heading_appearance" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_actions_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_market_coverage_actions_icon" AS ENUM('arrowRight', 'chart', 'europe', 'people', 'play', 'settings');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_content_section_columns_padding" AS ENUM('none', 'medium');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_content_section_columns_surface" AS ENUM('none', 'muted', 'soft');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_content_section_columns_border" AS ENUM('none', 'subtle');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_content_section_columns_radius" AS ENUM('default', 'xl');
  ALTER TYPE "public"."enum_pages_blocks_trayport_hero_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_pages_blocks_trayport_hero_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum_pages_blocks_actions_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_pages_blocks_actions_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum_pages_blocks_market_coverage_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_pages_blocks_market_coverage_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__pages_v_blocks_trayport_hero_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__pages_v_blocks_trayport_hero_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__pages_v_blocks_actions_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__pages_v_blocks_actions_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__pages_v_blocks_market_coverage_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__pages_v_blocks_market_coverage_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum_articles_blocks_trayport_hero_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_articles_blocks_trayport_hero_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum_articles_blocks_actions_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_articles_blocks_actions_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum_articles_blocks_market_coverage_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_articles_blocks_market_coverage_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__articles_v_blocks_trayport_hero_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__articles_v_blocks_trayport_hero_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__articles_v_blocks_actions_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__articles_v_blocks_actions_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__articles_v_blocks_market_coverage_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__articles_v_blocks_market_coverage_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum_hubs_blocks_trayport_hero_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_hubs_blocks_trayport_hero_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum_hubs_blocks_actions_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_hubs_blocks_actions_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum_hubs_blocks_market_coverage_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_hubs_blocks_market_coverage_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__hubs_v_blocks_trayport_hero_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__hubs_v_blocks_trayport_hero_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__hubs_v_blocks_actions_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__hubs_v_blocks_actions_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__hubs_v_blocks_market_coverage_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__hubs_v_blocks_market_coverage_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum_venues_blocks_trayport_hero_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_venues_blocks_trayport_hero_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum_venues_blocks_actions_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_venues_blocks_actions_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum_venues_blocks_market_coverage_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_venues_blocks_market_coverage_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__venues_v_blocks_trayport_hero_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__venues_v_blocks_trayport_hero_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__venues_v_blocks_actions_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__venues_v_blocks_actions_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__venues_v_blocks_market_coverage_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__venues_v_blocks_market_coverage_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum_learning_videos_blocks_trayport_hero_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_learning_videos_blocks_trayport_hero_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum_learning_videos_blocks_actions_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_learning_videos_blocks_actions_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum_learning_videos_blocks_market_coverage_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum_learning_videos_blocks_market_coverage_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__learning_videos_v_blocks_actions_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__learning_videos_v_blocks_actions_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TYPE "public"."enum__learning_videos_v_blocks_market_coverage_actions_style" ADD VALUE 'accent' BEFORE 'link';
  ALTER TYPE "public"."enum__learning_videos_v_blocks_market_coverage_actions_style" ADD VALUE 'info' BEFORE 'link';
  ALTER TABLE "pages_blocks_trayport_hero_actions" ADD COLUMN "icon" "enum_pages_blocks_trayport_hero_actions_icon";
  ALTER TABLE "pages_blocks_trayport_hero" ADD COLUMN "badge_label" varchar;
  ALTER TABLE "pages_blocks_trayport_hero" ADD COLUMN "badge_icon" "enum_pages_blocks_trayport_hero_badge_icon";
  ALTER TABLE "pages_blocks_trayport_hero" ADD COLUMN "badge_tone" "enum_pages_blocks_trayport_hero_badge_tone" DEFAULT 'secondary';
  ALTER TABLE "pages_blocks_trayport_hero" ADD COLUMN "media_aspect" "enum_pages_blocks_trayport_hero_media_aspect" DEFAULT 'twoToOne';
  ALTER TABLE "pages_blocks_heading" ADD COLUMN "appearance" "enum_pages_blocks_heading_appearance" DEFAULT 'h2';
  ALTER TABLE "pages_blocks_actions_actions" ADD COLUMN "icon" "enum_pages_blocks_actions_actions_icon";
  ALTER TABLE "pages_blocks_market_coverage_actions" ADD COLUMN "icon" "enum_pages_blocks_market_coverage_actions_icon";
  ALTER TABLE "pages_blocks_content_section_columns" ADD COLUMN "horizontal_align" "horizontal_align" DEFAULT 'left';
  ALTER TABLE "pages_blocks_content_section_columns" ADD COLUMN "vertical_align" "vertical_align" DEFAULT 'start';
  ALTER TABLE "pages_blocks_content_section_columns" ADD COLUMN "height_mode" "height_mode" DEFAULT 'fill';
  ALTER TABLE "pages_blocks_content_section_columns" ADD COLUMN "component_gap" "component_gap" DEFAULT 'regular';
  ALTER TABLE "pages_blocks_content_section_columns" ADD COLUMN "padding" "enum_pages_blocks_content_section_columns_padding" DEFAULT 'none';
  ALTER TABLE "pages_blocks_content_section_columns" ADD COLUMN "surface" "enum_pages_blocks_content_section_columns_surface" DEFAULT 'none';
  ALTER TABLE "pages_blocks_content_section_columns" ADD COLUMN "border" "enum_pages_blocks_content_section_columns_border" DEFAULT 'none';
  ALTER TABLE "pages_blocks_content_section_columns" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "pages_blocks_content_section_columns" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "pages_blocks_content_section_columns" ADD COLUMN "radius" "enum_pages_blocks_content_section_columns_radius" DEFAULT 'default';
  ALTER TABLE "pages_blocks_content_section" ADD COLUMN "surface_tone" "theme" DEFAULT 'none';
  ALTER TABLE "pages_blocks_content_section" ADD COLUMN "surface_radius" "surface_radius" DEFAULT 'default';
  ALTER TABLE "pages_blocks_content_section" ADD COLUMN "surface_padding" "surface_padding" DEFAULT 'none';
  ALTER TABLE "pages_blocks_content_section" ADD COLUMN "spacing_top" "spacing_top" DEFAULT 'regular';
  ALTER TABLE "pages_blocks_content_section" ADD COLUMN "spacing_bottom" "spacing_bottom" DEFAULT 'regular';
  ALTER TABLE "pages_blocks_content_section" ADD COLUMN "column_gap" "column_gap" DEFAULT 'regular';
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" ADD COLUMN "icon" "enum__pages_v_blocks_trayport_hero_actions_icon";
  ALTER TABLE "_pages_v_blocks_trayport_hero" ADD COLUMN "badge_label" varchar;
  ALTER TABLE "_pages_v_blocks_trayport_hero" ADD COLUMN "badge_icon" "enum__pages_v_blocks_trayport_hero_badge_icon";
  ALTER TABLE "_pages_v_blocks_trayport_hero" ADD COLUMN "badge_tone" "enum__pages_v_blocks_trayport_hero_badge_tone" DEFAULT 'secondary';
  ALTER TABLE "_pages_v_blocks_trayport_hero" ADD COLUMN "media_aspect" "enum__pages_v_blocks_trayport_hero_media_aspect" DEFAULT 'twoToOne';
  ALTER TABLE "_pages_v_blocks_heading" ADD COLUMN "appearance" "enum__pages_v_blocks_heading_appearance" DEFAULT 'h2';
  ALTER TABLE "_pages_v_blocks_actions_actions" ADD COLUMN "icon" "enum__pages_v_blocks_actions_actions_icon";
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" ADD COLUMN "icon" "enum__pages_v_blocks_market_coverage_actions_icon";
  ALTER TABLE "_pages_v_blocks_content_section_columns" ADD COLUMN "horizontal_align" "horizontal_align" DEFAULT 'left';
  ALTER TABLE "_pages_v_blocks_content_section_columns" ADD COLUMN "vertical_align" "vertical_align" DEFAULT 'start';
  ALTER TABLE "_pages_v_blocks_content_section_columns" ADD COLUMN "height_mode" "height_mode" DEFAULT 'fill';
  ALTER TABLE "_pages_v_blocks_content_section_columns" ADD COLUMN "component_gap" "component_gap" DEFAULT 'regular';
  ALTER TABLE "_pages_v_blocks_content_section_columns" ADD COLUMN "padding" "enum__pages_v_blocks_content_section_columns_padding" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_content_section_columns" ADD COLUMN "surface" "enum__pages_v_blocks_content_section_columns_surface" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_content_section_columns" ADD COLUMN "border" "enum__pages_v_blocks_content_section_columns_border" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_content_section_columns" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_pages_v_blocks_content_section_columns" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_content_section_columns" ADD COLUMN "radius" "enum__pages_v_blocks_content_section_columns_radius" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_content_section" ADD COLUMN "surface_tone" "theme" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_content_section" ADD COLUMN "surface_radius" "surface_radius" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_content_section" ADD COLUMN "surface_padding" "surface_padding" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_content_section" ADD COLUMN "spacing_top" "spacing_top" DEFAULT 'regular';
  ALTER TABLE "_pages_v_blocks_content_section" ADD COLUMN "spacing_bottom" "spacing_bottom" DEFAULT 'regular';
  ALTER TABLE "_pages_v_blocks_content_section" ADD COLUMN "column_gap" "column_gap" DEFAULT 'regular';
  ALTER TABLE "articles_blocks_trayport_hero_actions" ADD COLUMN "icon" "enum_articles_blocks_trayport_hero_actions_icon";
  ALTER TABLE "articles_blocks_trayport_hero" ADD COLUMN "badge_label" varchar;
  ALTER TABLE "articles_blocks_trayport_hero" ADD COLUMN "badge_icon" "enum_articles_blocks_trayport_hero_badge_icon";
  ALTER TABLE "articles_blocks_trayport_hero" ADD COLUMN "badge_tone" "enum_articles_blocks_trayport_hero_badge_tone" DEFAULT 'secondary';
  ALTER TABLE "articles_blocks_trayport_hero" ADD COLUMN "media_aspect" "enum_articles_blocks_trayport_hero_media_aspect" DEFAULT 'twoToOne';
  ALTER TABLE "articles_blocks_heading" ADD COLUMN "appearance" "enum_articles_blocks_heading_appearance" DEFAULT 'h2';
  ALTER TABLE "articles_blocks_actions_actions" ADD COLUMN "icon" "enum_articles_blocks_actions_actions_icon";
  ALTER TABLE "articles_blocks_market_coverage_actions" ADD COLUMN "icon" "enum_articles_blocks_market_coverage_actions_icon";
  ALTER TABLE "articles_blocks_content_section_columns" ADD COLUMN "horizontal_align" "horizontal_align" DEFAULT 'left';
  ALTER TABLE "articles_blocks_content_section_columns" ADD COLUMN "vertical_align" "vertical_align" DEFAULT 'start';
  ALTER TABLE "articles_blocks_content_section_columns" ADD COLUMN "height_mode" "height_mode" DEFAULT 'fill';
  ALTER TABLE "articles_blocks_content_section_columns" ADD COLUMN "component_gap" "component_gap" DEFAULT 'regular';
  ALTER TABLE "articles_blocks_content_section_columns" ADD COLUMN "padding" "enum_articles_blocks_content_section_columns_padding" DEFAULT 'none';
  ALTER TABLE "articles_blocks_content_section_columns" ADD COLUMN "surface" "enum_articles_blocks_content_section_columns_surface" DEFAULT 'none';
  ALTER TABLE "articles_blocks_content_section_columns" ADD COLUMN "border" "enum_articles_blocks_content_section_columns_border" DEFAULT 'none';
  ALTER TABLE "articles_blocks_content_section_columns" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "articles_blocks_content_section_columns" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "articles_blocks_content_section_columns" ADD COLUMN "radius" "enum_articles_blocks_content_section_columns_radius" DEFAULT 'default';
  ALTER TABLE "articles_blocks_content_section" ADD COLUMN "surface_tone" "theme" DEFAULT 'none';
  ALTER TABLE "articles_blocks_content_section" ADD COLUMN "surface_radius" "surface_radius" DEFAULT 'default';
  ALTER TABLE "articles_blocks_content_section" ADD COLUMN "surface_padding" "surface_padding" DEFAULT 'none';
  ALTER TABLE "articles_blocks_content_section" ADD COLUMN "spacing_top" "spacing_top" DEFAULT 'regular';
  ALTER TABLE "articles_blocks_content_section" ADD COLUMN "spacing_bottom" "spacing_bottom" DEFAULT 'regular';
  ALTER TABLE "articles_blocks_content_section" ADD COLUMN "column_gap" "column_gap" DEFAULT 'regular';
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" ADD COLUMN "icon" "enum__articles_v_blocks_trayport_hero_actions_icon";
  ALTER TABLE "_articles_v_blocks_trayport_hero" ADD COLUMN "badge_label" varchar;
  ALTER TABLE "_articles_v_blocks_trayport_hero" ADD COLUMN "badge_icon" "enum__articles_v_blocks_trayport_hero_badge_icon";
  ALTER TABLE "_articles_v_blocks_trayport_hero" ADD COLUMN "badge_tone" "enum__articles_v_blocks_trayport_hero_badge_tone" DEFAULT 'secondary';
  ALTER TABLE "_articles_v_blocks_trayport_hero" ADD COLUMN "media_aspect" "enum__articles_v_blocks_trayport_hero_media_aspect" DEFAULT 'twoToOne';
  ALTER TABLE "_articles_v_blocks_heading" ADD COLUMN "appearance" "enum__articles_v_blocks_heading_appearance" DEFAULT 'h2';
  ALTER TABLE "_articles_v_blocks_actions_actions" ADD COLUMN "icon" "enum__articles_v_blocks_actions_actions_icon";
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" ADD COLUMN "icon" "enum__articles_v_blocks_market_coverage_actions_icon";
  ALTER TABLE "_articles_v_blocks_content_section_columns" ADD COLUMN "horizontal_align" "horizontal_align" DEFAULT 'left';
  ALTER TABLE "_articles_v_blocks_content_section_columns" ADD COLUMN "vertical_align" "vertical_align" DEFAULT 'start';
  ALTER TABLE "_articles_v_blocks_content_section_columns" ADD COLUMN "height_mode" "height_mode" DEFAULT 'fill';
  ALTER TABLE "_articles_v_blocks_content_section_columns" ADD COLUMN "component_gap" "component_gap" DEFAULT 'regular';
  ALTER TABLE "_articles_v_blocks_content_section_columns" ADD COLUMN "padding" "enum__articles_v_blocks_content_section_columns_padding" DEFAULT 'none';
  ALTER TABLE "_articles_v_blocks_content_section_columns" ADD COLUMN "surface" "enum__articles_v_blocks_content_section_columns_surface" DEFAULT 'none';
  ALTER TABLE "_articles_v_blocks_content_section_columns" ADD COLUMN "border" "enum__articles_v_blocks_content_section_columns_border" DEFAULT 'none';
  ALTER TABLE "_articles_v_blocks_content_section_columns" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_articles_v_blocks_content_section_columns" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "_articles_v_blocks_content_section_columns" ADD COLUMN "radius" "enum__articles_v_blocks_content_section_columns_radius" DEFAULT 'default';
  ALTER TABLE "_articles_v_blocks_content_section" ADD COLUMN "surface_tone" "theme" DEFAULT 'none';
  ALTER TABLE "_articles_v_blocks_content_section" ADD COLUMN "surface_radius" "surface_radius" DEFAULT 'default';
  ALTER TABLE "_articles_v_blocks_content_section" ADD COLUMN "surface_padding" "surface_padding" DEFAULT 'none';
  ALTER TABLE "_articles_v_blocks_content_section" ADD COLUMN "spacing_top" "spacing_top" DEFAULT 'regular';
  ALTER TABLE "_articles_v_blocks_content_section" ADD COLUMN "spacing_bottom" "spacing_bottom" DEFAULT 'regular';
  ALTER TABLE "_articles_v_blocks_content_section" ADD COLUMN "column_gap" "column_gap" DEFAULT 'regular';
  ALTER TABLE "hubs_blocks_trayport_hero_actions" ADD COLUMN "icon" "enum_hubs_blocks_trayport_hero_actions_icon";
  ALTER TABLE "hubs_blocks_trayport_hero" ADD COLUMN "badge_label" varchar;
  ALTER TABLE "hubs_blocks_trayport_hero" ADD COLUMN "badge_icon" "enum_hubs_blocks_trayport_hero_badge_icon";
  ALTER TABLE "hubs_blocks_trayport_hero" ADD COLUMN "badge_tone" "enum_hubs_blocks_trayport_hero_badge_tone" DEFAULT 'secondary';
  ALTER TABLE "hubs_blocks_trayport_hero" ADD COLUMN "media_aspect" "enum_hubs_blocks_trayport_hero_media_aspect" DEFAULT 'twoToOne';
  ALTER TABLE "hubs_blocks_heading" ADD COLUMN "appearance" "enum_hubs_blocks_heading_appearance" DEFAULT 'h2';
  ALTER TABLE "hubs_blocks_actions_actions" ADD COLUMN "icon" "enum_hubs_blocks_actions_actions_icon";
  ALTER TABLE "hubs_blocks_market_coverage_actions" ADD COLUMN "icon" "enum_hubs_blocks_market_coverage_actions_icon";
  ALTER TABLE "hubs_blocks_content_section_columns" ADD COLUMN "horizontal_align" "horizontal_align" DEFAULT 'left';
  ALTER TABLE "hubs_blocks_content_section_columns" ADD COLUMN "vertical_align" "vertical_align" DEFAULT 'start';
  ALTER TABLE "hubs_blocks_content_section_columns" ADD COLUMN "height_mode" "height_mode" DEFAULT 'fill';
  ALTER TABLE "hubs_blocks_content_section_columns" ADD COLUMN "component_gap" "component_gap" DEFAULT 'regular';
  ALTER TABLE "hubs_blocks_content_section_columns" ADD COLUMN "padding" "enum_hubs_blocks_content_section_columns_padding" DEFAULT 'none';
  ALTER TABLE "hubs_blocks_content_section_columns" ADD COLUMN "surface" "enum_hubs_blocks_content_section_columns_surface" DEFAULT 'none';
  ALTER TABLE "hubs_blocks_content_section_columns" ADD COLUMN "border" "enum_hubs_blocks_content_section_columns_border" DEFAULT 'none';
  ALTER TABLE "hubs_blocks_content_section_columns" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "hubs_blocks_content_section_columns" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "hubs_blocks_content_section_columns" ADD COLUMN "radius" "enum_hubs_blocks_content_section_columns_radius" DEFAULT 'default';
  ALTER TABLE "hubs_blocks_content_section" ADD COLUMN "surface_tone" "theme" DEFAULT 'none';
  ALTER TABLE "hubs_blocks_content_section" ADD COLUMN "surface_radius" "surface_radius" DEFAULT 'default';
  ALTER TABLE "hubs_blocks_content_section" ADD COLUMN "surface_padding" "surface_padding" DEFAULT 'none';
  ALTER TABLE "hubs_blocks_content_section" ADD COLUMN "spacing_top" "spacing_top" DEFAULT 'regular';
  ALTER TABLE "hubs_blocks_content_section" ADD COLUMN "spacing_bottom" "spacing_bottom" DEFAULT 'regular';
  ALTER TABLE "hubs_blocks_content_section" ADD COLUMN "column_gap" "column_gap" DEFAULT 'regular';
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" ADD COLUMN "icon" "enum__hubs_v_blocks_trayport_hero_actions_icon";
  ALTER TABLE "_hubs_v_blocks_trayport_hero" ADD COLUMN "badge_label" varchar;
  ALTER TABLE "_hubs_v_blocks_trayport_hero" ADD COLUMN "badge_icon" "enum__hubs_v_blocks_trayport_hero_badge_icon";
  ALTER TABLE "_hubs_v_blocks_trayport_hero" ADD COLUMN "badge_tone" "enum__hubs_v_blocks_trayport_hero_badge_tone" DEFAULT 'secondary';
  ALTER TABLE "_hubs_v_blocks_trayport_hero" ADD COLUMN "media_aspect" "enum__hubs_v_blocks_trayport_hero_media_aspect" DEFAULT 'twoToOne';
  ALTER TABLE "_hubs_v_blocks_heading" ADD COLUMN "appearance" "enum__hubs_v_blocks_heading_appearance" DEFAULT 'h2';
  ALTER TABLE "_hubs_v_blocks_actions_actions" ADD COLUMN "icon" "enum__hubs_v_blocks_actions_actions_icon";
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" ADD COLUMN "icon" "enum__hubs_v_blocks_market_coverage_actions_icon";
  ALTER TABLE "_hubs_v_blocks_content_section_columns" ADD COLUMN "horizontal_align" "horizontal_align" DEFAULT 'left';
  ALTER TABLE "_hubs_v_blocks_content_section_columns" ADD COLUMN "vertical_align" "vertical_align" DEFAULT 'start';
  ALTER TABLE "_hubs_v_blocks_content_section_columns" ADD COLUMN "height_mode" "height_mode" DEFAULT 'fill';
  ALTER TABLE "_hubs_v_blocks_content_section_columns" ADD COLUMN "component_gap" "component_gap" DEFAULT 'regular';
  ALTER TABLE "_hubs_v_blocks_content_section_columns" ADD COLUMN "padding" "enum__hubs_v_blocks_content_section_columns_padding" DEFAULT 'none';
  ALTER TABLE "_hubs_v_blocks_content_section_columns" ADD COLUMN "surface" "enum__hubs_v_blocks_content_section_columns_surface" DEFAULT 'none';
  ALTER TABLE "_hubs_v_blocks_content_section_columns" ADD COLUMN "border" "enum__hubs_v_blocks_content_section_columns_border" DEFAULT 'none';
  ALTER TABLE "_hubs_v_blocks_content_section_columns" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_hubs_v_blocks_content_section_columns" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "_hubs_v_blocks_content_section_columns" ADD COLUMN "radius" "enum__hubs_v_blocks_content_section_columns_radius" DEFAULT 'default';
  ALTER TABLE "_hubs_v_blocks_content_section" ADD COLUMN "surface_tone" "theme" DEFAULT 'none';
  ALTER TABLE "_hubs_v_blocks_content_section" ADD COLUMN "surface_radius" "surface_radius" DEFAULT 'default';
  ALTER TABLE "_hubs_v_blocks_content_section" ADD COLUMN "surface_padding" "surface_padding" DEFAULT 'none';
  ALTER TABLE "_hubs_v_blocks_content_section" ADD COLUMN "spacing_top" "spacing_top" DEFAULT 'regular';
  ALTER TABLE "_hubs_v_blocks_content_section" ADD COLUMN "spacing_bottom" "spacing_bottom" DEFAULT 'regular';
  ALTER TABLE "_hubs_v_blocks_content_section" ADD COLUMN "column_gap" "column_gap" DEFAULT 'regular';
  ALTER TABLE "venues_blocks_trayport_hero_actions" ADD COLUMN "icon" "enum_venues_blocks_trayport_hero_actions_icon";
  ALTER TABLE "venues_blocks_trayport_hero" ADD COLUMN "badge_label" varchar;
  ALTER TABLE "venues_blocks_trayport_hero" ADD COLUMN "badge_icon" "enum_venues_blocks_trayport_hero_badge_icon";
  ALTER TABLE "venues_blocks_trayport_hero" ADD COLUMN "badge_tone" "enum_venues_blocks_trayport_hero_badge_tone" DEFAULT 'secondary';
  ALTER TABLE "venues_blocks_trayport_hero" ADD COLUMN "media_aspect" "enum_venues_blocks_trayport_hero_media_aspect" DEFAULT 'twoToOne';
  ALTER TABLE "venues_blocks_heading" ADD COLUMN "appearance" "enum_venues_blocks_heading_appearance" DEFAULT 'h2';
  ALTER TABLE "venues_blocks_actions_actions" ADD COLUMN "icon" "enum_venues_blocks_actions_actions_icon";
  ALTER TABLE "venues_blocks_market_coverage_actions" ADD COLUMN "icon" "enum_venues_blocks_market_coverage_actions_icon";
  ALTER TABLE "venues_blocks_content_section_columns" ADD COLUMN "horizontal_align" "horizontal_align" DEFAULT 'left';
  ALTER TABLE "venues_blocks_content_section_columns" ADD COLUMN "vertical_align" "vertical_align" DEFAULT 'start';
  ALTER TABLE "venues_blocks_content_section_columns" ADD COLUMN "height_mode" "height_mode" DEFAULT 'fill';
  ALTER TABLE "venues_blocks_content_section_columns" ADD COLUMN "component_gap" "component_gap" DEFAULT 'regular';
  ALTER TABLE "venues_blocks_content_section_columns" ADD COLUMN "padding" "enum_venues_blocks_content_section_columns_padding" DEFAULT 'none';
  ALTER TABLE "venues_blocks_content_section_columns" ADD COLUMN "surface" "enum_venues_blocks_content_section_columns_surface" DEFAULT 'none';
  ALTER TABLE "venues_blocks_content_section_columns" ADD COLUMN "border" "enum_venues_blocks_content_section_columns_border" DEFAULT 'none';
  ALTER TABLE "venues_blocks_content_section_columns" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "venues_blocks_content_section_columns" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "venues_blocks_content_section_columns" ADD COLUMN "radius" "enum_venues_blocks_content_section_columns_radius" DEFAULT 'default';
  ALTER TABLE "venues_blocks_content_section" ADD COLUMN "surface_tone" "theme" DEFAULT 'none';
  ALTER TABLE "venues_blocks_content_section" ADD COLUMN "surface_radius" "surface_radius" DEFAULT 'default';
  ALTER TABLE "venues_blocks_content_section" ADD COLUMN "surface_padding" "surface_padding" DEFAULT 'none';
  ALTER TABLE "venues_blocks_content_section" ADD COLUMN "spacing_top" "spacing_top" DEFAULT 'regular';
  ALTER TABLE "venues_blocks_content_section" ADD COLUMN "spacing_bottom" "spacing_bottom" DEFAULT 'regular';
  ALTER TABLE "venues_blocks_content_section" ADD COLUMN "column_gap" "column_gap" DEFAULT 'regular';
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" ADD COLUMN "icon" "enum__venues_v_blocks_trayport_hero_actions_icon";
  ALTER TABLE "_venues_v_blocks_trayport_hero" ADD COLUMN "badge_label" varchar;
  ALTER TABLE "_venues_v_blocks_trayport_hero" ADD COLUMN "badge_icon" "enum__venues_v_blocks_trayport_hero_badge_icon";
  ALTER TABLE "_venues_v_blocks_trayport_hero" ADD COLUMN "badge_tone" "enum__venues_v_blocks_trayport_hero_badge_tone" DEFAULT 'secondary';
  ALTER TABLE "_venues_v_blocks_trayport_hero" ADD COLUMN "media_aspect" "enum__venues_v_blocks_trayport_hero_media_aspect" DEFAULT 'twoToOne';
  ALTER TABLE "_venues_v_blocks_heading" ADD COLUMN "appearance" "enum__venues_v_blocks_heading_appearance" DEFAULT 'h2';
  ALTER TABLE "_venues_v_blocks_actions_actions" ADD COLUMN "icon" "enum__venues_v_blocks_actions_actions_icon";
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" ADD COLUMN "icon" "enum__venues_v_blocks_market_coverage_actions_icon";
  ALTER TABLE "_venues_v_blocks_content_section_columns" ADD COLUMN "horizontal_align" "horizontal_align" DEFAULT 'left';
  ALTER TABLE "_venues_v_blocks_content_section_columns" ADD COLUMN "vertical_align" "vertical_align" DEFAULT 'start';
  ALTER TABLE "_venues_v_blocks_content_section_columns" ADD COLUMN "height_mode" "height_mode" DEFAULT 'fill';
  ALTER TABLE "_venues_v_blocks_content_section_columns" ADD COLUMN "component_gap" "component_gap" DEFAULT 'regular';
  ALTER TABLE "_venues_v_blocks_content_section_columns" ADD COLUMN "padding" "enum__venues_v_blocks_content_section_columns_padding" DEFAULT 'none';
  ALTER TABLE "_venues_v_blocks_content_section_columns" ADD COLUMN "surface" "enum__venues_v_blocks_content_section_columns_surface" DEFAULT 'none';
  ALTER TABLE "_venues_v_blocks_content_section_columns" ADD COLUMN "border" "enum__venues_v_blocks_content_section_columns_border" DEFAULT 'none';
  ALTER TABLE "_venues_v_blocks_content_section_columns" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_venues_v_blocks_content_section_columns" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "_venues_v_blocks_content_section_columns" ADD COLUMN "radius" "enum__venues_v_blocks_content_section_columns_radius" DEFAULT 'default';
  ALTER TABLE "_venues_v_blocks_content_section" ADD COLUMN "surface_tone" "theme" DEFAULT 'none';
  ALTER TABLE "_venues_v_blocks_content_section" ADD COLUMN "surface_radius" "surface_radius" DEFAULT 'default';
  ALTER TABLE "_venues_v_blocks_content_section" ADD COLUMN "surface_padding" "surface_padding" DEFAULT 'none';
  ALTER TABLE "_venues_v_blocks_content_section" ADD COLUMN "spacing_top" "spacing_top" DEFAULT 'regular';
  ALTER TABLE "_venues_v_blocks_content_section" ADD COLUMN "spacing_bottom" "spacing_bottom" DEFAULT 'regular';
  ALTER TABLE "_venues_v_blocks_content_section" ADD COLUMN "column_gap" "column_gap" DEFAULT 'regular';
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" ADD COLUMN "icon" "enum_learning_videos_blocks_trayport_hero_actions_icon";
  ALTER TABLE "learning_videos_blocks_trayport_hero" ADD COLUMN "badge_label" varchar;
  ALTER TABLE "learning_videos_blocks_trayport_hero" ADD COLUMN "badge_icon" "enum_learning_videos_blocks_trayport_hero_badge_icon";
  ALTER TABLE "learning_videos_blocks_trayport_hero" ADD COLUMN "badge_tone" "enum_learning_videos_blocks_trayport_hero_badge_tone" DEFAULT 'secondary';
  ALTER TABLE "learning_videos_blocks_trayport_hero" ADD COLUMN "media_aspect" "enum_learning_videos_blocks_trayport_hero_media_aspect" DEFAULT 'twoToOne';
  ALTER TABLE "learning_videos_blocks_heading" ADD COLUMN "appearance" "enum_learning_videos_blocks_heading_appearance" DEFAULT 'h2';
  ALTER TABLE "learning_videos_blocks_actions_actions" ADD COLUMN "icon" "enum_learning_videos_blocks_actions_actions_icon";
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" ADD COLUMN "icon" "enum_learning_videos_blocks_market_coverage_actions_icon";
  ALTER TABLE "learning_videos_blocks_content_section_columns" ADD COLUMN "horizontal_align" "horizontal_align" DEFAULT 'left';
  ALTER TABLE "learning_videos_blocks_content_section_columns" ADD COLUMN "vertical_align" "vertical_align" DEFAULT 'start';
  ALTER TABLE "learning_videos_blocks_content_section_columns" ADD COLUMN "height_mode" "height_mode" DEFAULT 'fill';
  ALTER TABLE "learning_videos_blocks_content_section_columns" ADD COLUMN "component_gap" "component_gap" DEFAULT 'regular';
  ALTER TABLE "learning_videos_blocks_content_section_columns" ADD COLUMN "padding" "enum_learning_videos_blocks_content_section_columns_padding" DEFAULT 'none';
  ALTER TABLE "learning_videos_blocks_content_section_columns" ADD COLUMN "surface" "enum_learning_videos_blocks_content_section_columns_surface" DEFAULT 'none';
  ALTER TABLE "learning_videos_blocks_content_section_columns" ADD COLUMN "border" "enum_learning_videos_blocks_content_section_columns_border" DEFAULT 'none';
  ALTER TABLE "learning_videos_blocks_content_section_columns" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "learning_videos_blocks_content_section_columns" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "learning_videos_blocks_content_section_columns" ADD COLUMN "radius" "enum_learning_videos_blocks_content_section_columns_radius" DEFAULT 'default';
  ALTER TABLE "learning_videos_blocks_content_section" ADD COLUMN "surface_tone" "theme" DEFAULT 'none';
  ALTER TABLE "learning_videos_blocks_content_section" ADD COLUMN "surface_radius" "surface_radius" DEFAULT 'default';
  ALTER TABLE "learning_videos_blocks_content_section" ADD COLUMN "surface_padding" "surface_padding" DEFAULT 'none';
  ALTER TABLE "learning_videos_blocks_content_section" ADD COLUMN "spacing_top" "spacing_top" DEFAULT 'regular';
  ALTER TABLE "learning_videos_blocks_content_section" ADD COLUMN "spacing_bottom" "spacing_bottom" DEFAULT 'regular';
  ALTER TABLE "learning_videos_blocks_content_section" ADD COLUMN "column_gap" "column_gap" DEFAULT 'regular';
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" ADD COLUMN "icon" "enum__learning_videos_v_blocks_trayport_hero_actions_icon";
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero" ADD COLUMN "badge_label" varchar;
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero" ADD COLUMN "badge_icon" "enum__learning_videos_v_blocks_trayport_hero_badge_icon";
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero" ADD COLUMN "badge_tone" "enum__learning_videos_v_blocks_trayport_hero_badge_tone" DEFAULT 'secondary';
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero" ADD COLUMN "media_aspect" "enum__learning_videos_v_blocks_trayport_hero_media_aspect" DEFAULT 'twoToOne';
  ALTER TABLE "_learning_videos_v_blocks_heading" ADD COLUMN "appearance" "enum__learning_videos_v_blocks_heading_appearance" DEFAULT 'h2';
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" ADD COLUMN "icon" "enum__learning_videos_v_blocks_actions_actions_icon";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" ADD COLUMN "icon" "enum__learning_videos_v_blocks_market_coverage_actions_icon";
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" ADD COLUMN "horizontal_align" "horizontal_align" DEFAULT 'left';
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" ADD COLUMN "vertical_align" "vertical_align" DEFAULT 'start';
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" ADD COLUMN "height_mode" "height_mode" DEFAULT 'fill';
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" ADD COLUMN "component_gap" "component_gap" DEFAULT 'regular';
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" ADD COLUMN "padding" "enum__learning_videos_v_blocks_content_section_columns_padding" DEFAULT 'none';
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" ADD COLUMN "surface" "enum__learning_videos_v_blocks_content_section_columns_surface" DEFAULT 'none';
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" ADD COLUMN "border" "enum__learning_videos_v_blocks_content_section_columns_border" DEFAULT 'none';
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" ADD COLUMN "background_media_id" integer;
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" ADD COLUMN "background_opacity" "bg_opacity" DEFAULT 'none';
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" ADD COLUMN "radius" "enum__learning_videos_v_blocks_content_section_columns_radius" DEFAULT 'default';
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD COLUMN "surface_tone" "theme" DEFAULT 'none';
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD COLUMN "surface_radius" "surface_radius" DEFAULT 'default';
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD COLUMN "surface_padding" "surface_padding" DEFAULT 'none';
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD COLUMN "spacing_top" "spacing_top" DEFAULT 'regular';
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD COLUMN "spacing_bottom" "spacing_bottom" DEFAULT 'regular';
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD COLUMN "column_gap" "column_gap" DEFAULT 'regular';
  ALTER TABLE "pages_blocks_content_section_columns" ADD CONSTRAINT "pages_blocks_content_section_columns_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_section_columns" ADD CONSTRAINT "_pages_v_blocks_content_section_columns_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_content_section_columns" ADD CONSTRAINT "articles_blocks_content_section_columns_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_content_section_columns" ADD CONSTRAINT "_articles_v_blocks_content_section_columns_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_blocks_content_section_columns" ADD CONSTRAINT "hubs_blocks_content_section_columns_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_content_section_columns" ADD CONSTRAINT "_hubs_v_blocks_content_section_columns_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_blocks_content_section_columns" ADD CONSTRAINT "venues_blocks_content_section_columns_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_content_section_columns" ADD CONSTRAINT "_venues_v_blocks_content_section_columns_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_content_section_columns" ADD CONSTRAINT "learning_videos_blocks_content_section_columns_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" ADD CONSTRAINT "_learning_videos_v_blocks_content_section_columns_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_content_section_columns_background_media_idx" ON "pages_blocks_content_section_columns" USING btree ("background_media_id");
  CREATE INDEX "_pages_v_blocks_content_section_columns_background_media_idx" ON "_pages_v_blocks_content_section_columns" USING btree ("background_media_id");
  CREATE INDEX "articles_blocks_content_section_columns_background_media_idx" ON "articles_blocks_content_section_columns" USING btree ("background_media_id");
  CREATE INDEX "_articles_v_blocks_content_section_columns_background_me_idx" ON "_articles_v_blocks_content_section_columns" USING btree ("background_media_id");
  CREATE INDEX "hubs_blocks_content_section_columns_background_media_idx" ON "hubs_blocks_content_section_columns" USING btree ("background_media_id");
  CREATE INDEX "_hubs_v_blocks_content_section_columns_background_media_idx" ON "_hubs_v_blocks_content_section_columns" USING btree ("background_media_id");
  CREATE INDEX "venues_blocks_content_section_columns_background_media_idx" ON "venues_blocks_content_section_columns" USING btree ("background_media_id");
  CREATE INDEX "_venues_v_blocks_content_section_columns_background_medi_idx" ON "_venues_v_blocks_content_section_columns" USING btree ("background_media_id");
  CREATE INDEX "learning_videos_blocks_content_section_columns_backgroun_idx" ON "learning_videos_blocks_content_section_columns" USING btree ("background_media_id");
  CREATE INDEX "_learning_videos_v_blocks_content_section_columns_backgr_idx" ON "_learning_videos_v_blocks_content_section_columns" USING btree ("background_media_id");
  DO $migration$
  DECLARE
    table_name text;
  BEGIN
    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_content_section',
      '_pages_v_blocks_content_section',
      'articles_blocks_content_section',
      '_articles_v_blocks_content_section',
      'hubs_blocks_content_section',
      '_hubs_v_blocks_content_section',
      'venues_blocks_content_section',
      '_venues_v_blocks_content_section',
      'learning_videos_blocks_content_section',
      '_learning_videos_v_blocks_content_section'
    ]
    LOOP
      EXECUTE format(
        $statement$
          UPDATE %I
          SET
            "surface_tone" = (
              CASE WHEN "theme"::text = 'light' THEN 'none' ELSE "theme"::text END
            )::"theme",
            "surface_radius" = (
              CASE WHEN "appearance"::text = 'inset' THEN 'xl' ELSE 'default' END
            )::"surface_radius",
            "surface_padding" = (
              CASE WHEN "appearance"::text = 'inset' THEN 'medium' ELSE 'none' END
            )::"surface_padding",
            "spacing_top" = (
              CASE
                WHEN "spacing"::text = 'compact' THEN 'tight'
                WHEN "spacing"::text = 'generous' THEN 'large'
                ELSE 'regular'
              END
            )::"spacing_top",
            "spacing_bottom" = (
              CASE
                WHEN "spacing"::text = 'compact' THEN 'tight'
                WHEN "spacing"::text = 'generous' THEN 'large'
                ELSE 'regular'
              END
            )::"spacing_bottom"
        $statement$,
        table_name
      );
    END LOOP;
  END
  $migration$;
  ALTER TABLE "pages_blocks_content_section" DROP COLUMN "theme";
  ALTER TABLE "pages_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "pages_blocks_content_section" DROP COLUMN "spacing";
  ALTER TABLE "_pages_v_blocks_content_section" DROP COLUMN "theme";
  ALTER TABLE "_pages_v_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "_pages_v_blocks_content_section" DROP COLUMN "spacing";
  ALTER TABLE "articles_blocks_content_section" DROP COLUMN "theme";
  ALTER TABLE "articles_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "articles_blocks_content_section" DROP COLUMN "spacing";
  ALTER TABLE "_articles_v_blocks_content_section" DROP COLUMN "theme";
  ALTER TABLE "_articles_v_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "_articles_v_blocks_content_section" DROP COLUMN "spacing";
  ALTER TABLE "hubs_blocks_content_section" DROP COLUMN "theme";
  ALTER TABLE "hubs_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "hubs_blocks_content_section" DROP COLUMN "spacing";
  ALTER TABLE "_hubs_v_blocks_content_section" DROP COLUMN "theme";
  ALTER TABLE "_hubs_v_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "_hubs_v_blocks_content_section" DROP COLUMN "spacing";
  ALTER TABLE "venues_blocks_content_section" DROP COLUMN "theme";
  ALTER TABLE "venues_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "venues_blocks_content_section" DROP COLUMN "spacing";
  ALTER TABLE "_venues_v_blocks_content_section" DROP COLUMN "theme";
  ALTER TABLE "_venues_v_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "_venues_v_blocks_content_section" DROP COLUMN "spacing";
  ALTER TABLE "learning_videos_blocks_content_section" DROP COLUMN "theme";
  ALTER TABLE "learning_videos_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "learning_videos_blocks_content_section" DROP COLUMN "spacing";
  ALTER TABLE "_learning_videos_v_blocks_content_section" DROP COLUMN "theme";
  ALTER TABLE "_learning_videos_v_blocks_content_section" DROP COLUMN "appearance";
  ALTER TABLE "_learning_videos_v_blocks_content_section" DROP COLUMN "spacing";
  DROP TYPE "public"."enum_pages_blocks_content_section_theme";
  DROP TYPE "public"."presentation";
  DROP TYPE "public"."enum_pages_blocks_content_section_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_theme";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_spacing";
  DROP TYPE "public"."enum_articles_blocks_content_section_theme";
  DROP TYPE "public"."enum_articles_blocks_content_section_spacing";
  DROP TYPE "public"."enum__articles_v_blocks_content_section_theme";
  DROP TYPE "public"."enum__articles_v_blocks_content_section_spacing";
  DROP TYPE "public"."enum_hubs_blocks_content_section_theme";
  DROP TYPE "public"."enum_hubs_blocks_content_section_spacing";
  DROP TYPE "public"."enum__hubs_v_blocks_content_section_theme";
  DROP TYPE "public"."enum__hubs_v_blocks_content_section_spacing";
  DROP TYPE "public"."enum_venues_blocks_content_section_theme";
  DROP TYPE "public"."enum_venues_blocks_content_section_spacing";
  DROP TYPE "public"."enum__venues_v_blocks_content_section_theme";
  DROP TYPE "public"."enum__venues_v_blocks_content_section_spacing";
  DROP TYPE "public"."enum_learning_videos_blocks_content_section_theme";
  DROP TYPE "public"."enum_learning_videos_blocks_content_section_spacing";
  DROP TYPE "public"."enum__learning_videos_v_blocks_content_section_theme";
  DROP TYPE "public"."enum__learning_videos_v_blocks_content_section_spacing";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."presentation" AS ENUM('default', 'inset');
  CREATE TYPE "public"."enum_pages_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum__pages_v_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum_articles_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum_articles_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum__articles_v_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum__articles_v_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum_hubs_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum_hubs_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum__hubs_v_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum__hubs_v_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum_venues_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum_venues_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum__venues_v_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum__venues_v_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum_learning_videos_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum_learning_videos_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_content_section_theme" AS ENUM('light', 'softBlue', 'dark', 'white');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_content_section_spacing" AS ENUM('compact', 'regular', 'generous');
  ALTER TABLE "pages_blocks_content_section_columns" DROP CONSTRAINT "pages_blocks_content_section_columns_background_media_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_content_section_columns" DROP CONSTRAINT "_pages_v_blocks_content_section_columns_background_media_id_media_id_fk";
  
  ALTER TABLE "articles_blocks_content_section_columns" DROP CONSTRAINT "articles_blocks_content_section_columns_background_media_id_media_id_fk";
  
  ALTER TABLE "_articles_v_blocks_content_section_columns" DROP CONSTRAINT "_articles_v_blocks_content_section_columns_background_media_id_media_id_fk";
  
  ALTER TABLE "hubs_blocks_content_section_columns" DROP CONSTRAINT "hubs_blocks_content_section_columns_background_media_id_media_id_fk";
  
  ALTER TABLE "_hubs_v_blocks_content_section_columns" DROP CONSTRAINT "_hubs_v_blocks_content_section_columns_background_media_id_media_id_fk";
  
  ALTER TABLE "venues_blocks_content_section_columns" DROP CONSTRAINT "venues_blocks_content_section_columns_background_media_id_media_id_fk";
  
  ALTER TABLE "_venues_v_blocks_content_section_columns" DROP CONSTRAINT "_venues_v_blocks_content_section_columns_background_media_id_media_id_fk";
  
  ALTER TABLE "learning_videos_blocks_content_section_columns" DROP CONSTRAINT "learning_videos_blocks_content_section_columns_background_media_id_media_id_fk";
  
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" DROP CONSTRAINT "_learning_videos_v_blocks_content_section_columns_background_media_id_media_id_fk";
  
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
        'UPDATE %I SET "style" = ''primary'' WHERE "style"::text = ''accent''',
        table_name
      );
      EXECUTE format(
        'UPDATE %I SET "style" = ''secondary'' WHERE "style"::text = ''info''',
        table_name
      );
    END LOOP;
  END
  $migration$;
  ALTER TABLE "pages_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_pages_blocks_trayport_hero_actions_style";
  CREATE TYPE "public"."enum_pages_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "pages_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_pages_blocks_trayport_hero_actions_style";
  ALTER TABLE "pages_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_pages_blocks_trayport_hero_actions_style" USING "style"::"public"."enum_pages_blocks_trayport_hero_actions_style";
  ALTER TABLE "pages_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_pages_blocks_actions_actions_style";
  CREATE TYPE "public"."enum_pages_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "pages_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_pages_blocks_actions_actions_style";
  ALTER TABLE "pages_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_pages_blocks_actions_actions_style" USING "style"::"public"."enum_pages_blocks_actions_actions_style";
  ALTER TABLE "pages_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_pages_blocks_market_coverage_actions_style";
  CREATE TYPE "public"."enum_pages_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "pages_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_pages_blocks_market_coverage_actions_style";
  ALTER TABLE "pages_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_pages_blocks_market_coverage_actions_style" USING "style"::"public"."enum_pages_blocks_market_coverage_actions_style";
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__pages_v_blocks_trayport_hero_actions_style";
  CREATE TYPE "public"."enum__pages_v_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__pages_v_blocks_trayport_hero_actions_style";
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__pages_v_blocks_trayport_hero_actions_style" USING "style"::"public"."enum__pages_v_blocks_trayport_hero_actions_style";
  ALTER TABLE "_pages_v_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__pages_v_blocks_actions_actions_style";
  CREATE TYPE "public"."enum__pages_v_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_pages_v_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__pages_v_blocks_actions_actions_style";
  ALTER TABLE "_pages_v_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__pages_v_blocks_actions_actions_style" USING "style"::"public"."enum__pages_v_blocks_actions_actions_style";
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__pages_v_blocks_market_coverage_actions_style";
  CREATE TYPE "public"."enum__pages_v_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__pages_v_blocks_market_coverage_actions_style";
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__pages_v_blocks_market_coverage_actions_style" USING "style"::"public"."enum__pages_v_blocks_market_coverage_actions_style";
  ALTER TABLE "articles_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "articles_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_articles_blocks_trayport_hero_actions_style";
  CREATE TYPE "public"."enum_articles_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "articles_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_articles_blocks_trayport_hero_actions_style";
  ALTER TABLE "articles_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_articles_blocks_trayport_hero_actions_style" USING "style"::"public"."enum_articles_blocks_trayport_hero_actions_style";
  ALTER TABLE "articles_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "articles_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_articles_blocks_actions_actions_style";
  CREATE TYPE "public"."enum_articles_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "articles_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_articles_blocks_actions_actions_style";
  ALTER TABLE "articles_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_articles_blocks_actions_actions_style" USING "style"::"public"."enum_articles_blocks_actions_actions_style";
  ALTER TABLE "articles_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "articles_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_articles_blocks_market_coverage_actions_style";
  CREATE TYPE "public"."enum_articles_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "articles_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_articles_blocks_market_coverage_actions_style";
  ALTER TABLE "articles_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_articles_blocks_market_coverage_actions_style" USING "style"::"public"."enum_articles_blocks_market_coverage_actions_style";
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__articles_v_blocks_trayport_hero_actions_style";
  CREATE TYPE "public"."enum__articles_v_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__articles_v_blocks_trayport_hero_actions_style";
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__articles_v_blocks_trayport_hero_actions_style" USING "style"::"public"."enum__articles_v_blocks_trayport_hero_actions_style";
  ALTER TABLE "_articles_v_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_articles_v_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__articles_v_blocks_actions_actions_style";
  CREATE TYPE "public"."enum__articles_v_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_articles_v_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__articles_v_blocks_actions_actions_style";
  ALTER TABLE "_articles_v_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__articles_v_blocks_actions_actions_style" USING "style"::"public"."enum__articles_v_blocks_actions_actions_style";
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__articles_v_blocks_market_coverage_actions_style";
  CREATE TYPE "public"."enum__articles_v_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__articles_v_blocks_market_coverage_actions_style";
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__articles_v_blocks_market_coverage_actions_style" USING "style"::"public"."enum__articles_v_blocks_market_coverage_actions_style";
  ALTER TABLE "hubs_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "hubs_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_hubs_blocks_trayport_hero_actions_style";
  CREATE TYPE "public"."enum_hubs_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "hubs_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_hubs_blocks_trayport_hero_actions_style";
  ALTER TABLE "hubs_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_hubs_blocks_trayport_hero_actions_style" USING "style"::"public"."enum_hubs_blocks_trayport_hero_actions_style";
  ALTER TABLE "hubs_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "hubs_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_hubs_blocks_actions_actions_style";
  CREATE TYPE "public"."enum_hubs_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "hubs_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_hubs_blocks_actions_actions_style";
  ALTER TABLE "hubs_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_hubs_blocks_actions_actions_style" USING "style"::"public"."enum_hubs_blocks_actions_actions_style";
  ALTER TABLE "hubs_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "hubs_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_hubs_blocks_market_coverage_actions_style";
  CREATE TYPE "public"."enum_hubs_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "hubs_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_hubs_blocks_market_coverage_actions_style";
  ALTER TABLE "hubs_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_hubs_blocks_market_coverage_actions_style" USING "style"::"public"."enum_hubs_blocks_market_coverage_actions_style";
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__hubs_v_blocks_trayport_hero_actions_style";
  CREATE TYPE "public"."enum__hubs_v_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__hubs_v_blocks_trayport_hero_actions_style";
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__hubs_v_blocks_trayport_hero_actions_style" USING "style"::"public"."enum__hubs_v_blocks_trayport_hero_actions_style";
  ALTER TABLE "_hubs_v_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_hubs_v_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__hubs_v_blocks_actions_actions_style";
  CREATE TYPE "public"."enum__hubs_v_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_hubs_v_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__hubs_v_blocks_actions_actions_style";
  ALTER TABLE "_hubs_v_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__hubs_v_blocks_actions_actions_style" USING "style"::"public"."enum__hubs_v_blocks_actions_actions_style";
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__hubs_v_blocks_market_coverage_actions_style";
  CREATE TYPE "public"."enum__hubs_v_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__hubs_v_blocks_market_coverage_actions_style";
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__hubs_v_blocks_market_coverage_actions_style" USING "style"::"public"."enum__hubs_v_blocks_market_coverage_actions_style";
  ALTER TABLE "venues_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "venues_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_venues_blocks_trayport_hero_actions_style";
  CREATE TYPE "public"."enum_venues_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "venues_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_venues_blocks_trayport_hero_actions_style";
  ALTER TABLE "venues_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_venues_blocks_trayport_hero_actions_style" USING "style"::"public"."enum_venues_blocks_trayport_hero_actions_style";
  ALTER TABLE "venues_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "venues_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_venues_blocks_actions_actions_style";
  CREATE TYPE "public"."enum_venues_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "venues_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_venues_blocks_actions_actions_style";
  ALTER TABLE "venues_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_venues_blocks_actions_actions_style" USING "style"::"public"."enum_venues_blocks_actions_actions_style";
  ALTER TABLE "venues_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "venues_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_venues_blocks_market_coverage_actions_style";
  CREATE TYPE "public"."enum_venues_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "venues_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_venues_blocks_market_coverage_actions_style";
  ALTER TABLE "venues_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_venues_blocks_market_coverage_actions_style" USING "style"::"public"."enum_venues_blocks_market_coverage_actions_style";
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__venues_v_blocks_trayport_hero_actions_style";
  CREATE TYPE "public"."enum__venues_v_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__venues_v_blocks_trayport_hero_actions_style";
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__venues_v_blocks_trayport_hero_actions_style" USING "style"::"public"."enum__venues_v_blocks_trayport_hero_actions_style";
  ALTER TABLE "_venues_v_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_venues_v_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__venues_v_blocks_actions_actions_style";
  CREATE TYPE "public"."enum__venues_v_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_venues_v_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__venues_v_blocks_actions_actions_style";
  ALTER TABLE "_venues_v_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__venues_v_blocks_actions_actions_style" USING "style"::"public"."enum__venues_v_blocks_actions_actions_style";
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__venues_v_blocks_market_coverage_actions_style";
  CREATE TYPE "public"."enum__venues_v_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__venues_v_blocks_market_coverage_actions_style";
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__venues_v_blocks_market_coverage_actions_style" USING "style"::"public"."enum__venues_v_blocks_market_coverage_actions_style";
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_learning_videos_blocks_trayport_hero_actions_style";
  CREATE TYPE "public"."enum_learning_videos_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_learning_videos_blocks_trayport_hero_actions_style";
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_learning_videos_blocks_trayport_hero_actions_style" USING "style"::"public"."enum_learning_videos_blocks_trayport_hero_actions_style";
  ALTER TABLE "learning_videos_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "learning_videos_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_learning_videos_blocks_actions_actions_style";
  CREATE TYPE "public"."enum_learning_videos_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "learning_videos_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_learning_videos_blocks_actions_actions_style";
  ALTER TABLE "learning_videos_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_learning_videos_blocks_actions_actions_style" USING "style"::"public"."enum_learning_videos_blocks_actions_actions_style";
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum_learning_videos_blocks_market_coverage_actions_style";
  CREATE TYPE "public"."enum_learning_videos_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum_learning_videos_blocks_market_coverage_actions_style";
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum_learning_videos_blocks_market_coverage_actions_style" USING "style"::"public"."enum_learning_videos_blocks_market_coverage_actions_style";
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_actions_style";
  CREATE TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__learning_videos_v_blocks_trayport_hero_actions_style";
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_actions_style" USING "style"::"public"."enum__learning_videos_v_blocks_trayport_hero_actions_style";
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__learning_videos_v_blocks_actions_actions_style";
  CREATE TYPE "public"."enum__learning_videos_v_blocks_actions_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__learning_videos_v_blocks_actions_actions_style";
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__learning_videos_v_blocks_actions_actions_style" USING "style"::"public"."enum__learning_videos_v_blocks_actions_actions_style";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE text;
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::text;
  DROP TYPE "public"."enum__learning_videos_v_blocks_market_coverage_actions_style";
  CREATE TYPE "public"."enum__learning_videos_v_blocks_market_coverage_actions_style" AS ENUM('primary', 'secondary', 'link');
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DEFAULT 'primary'::"public"."enum__learning_videos_v_blocks_market_coverage_actions_style";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" ALTER COLUMN "style" SET DATA TYPE "public"."enum__learning_videos_v_blocks_market_coverage_actions_style" USING "style"::"public"."enum__learning_videos_v_blocks_market_coverage_actions_style";
  DROP INDEX "pages_blocks_content_section_columns_background_media_idx";
  DROP INDEX "_pages_v_blocks_content_section_columns_background_media_idx";
  DROP INDEX "articles_blocks_content_section_columns_background_media_idx";
  DROP INDEX "_articles_v_blocks_content_section_columns_background_me_idx";
  DROP INDEX "hubs_blocks_content_section_columns_background_media_idx";
  DROP INDEX "_hubs_v_blocks_content_section_columns_background_media_idx";
  DROP INDEX "venues_blocks_content_section_columns_background_media_idx";
  DROP INDEX "_venues_v_blocks_content_section_columns_background_medi_idx";
  DROP INDEX "learning_videos_blocks_content_section_columns_backgroun_idx";
  DROP INDEX "_learning_videos_v_blocks_content_section_columns_backgr_idx";
  ALTER TABLE "pages_blocks_content_section" ADD COLUMN "theme" "enum_pages_blocks_content_section_theme" DEFAULT 'light';
  ALTER TABLE "pages_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "pages_blocks_content_section" ADD COLUMN "spacing" "enum_pages_blocks_content_section_spacing" DEFAULT 'regular';
  ALTER TABLE "_pages_v_blocks_content_section" ADD COLUMN "theme" "enum__pages_v_blocks_content_section_theme" DEFAULT 'light';
  ALTER TABLE "_pages_v_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_content_section" ADD COLUMN "spacing" "enum__pages_v_blocks_content_section_spacing" DEFAULT 'regular';
  ALTER TABLE "articles_blocks_content_section" ADD COLUMN "theme" "enum_articles_blocks_content_section_theme" DEFAULT 'light';
  ALTER TABLE "articles_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "articles_blocks_content_section" ADD COLUMN "spacing" "enum_articles_blocks_content_section_spacing" DEFAULT 'regular';
  ALTER TABLE "_articles_v_blocks_content_section" ADD COLUMN "theme" "enum__articles_v_blocks_content_section_theme" DEFAULT 'light';
  ALTER TABLE "_articles_v_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "_articles_v_blocks_content_section" ADD COLUMN "spacing" "enum__articles_v_blocks_content_section_spacing" DEFAULT 'regular';
  ALTER TABLE "hubs_blocks_content_section" ADD COLUMN "theme" "enum_hubs_blocks_content_section_theme" DEFAULT 'light';
  ALTER TABLE "hubs_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "hubs_blocks_content_section" ADD COLUMN "spacing" "enum_hubs_blocks_content_section_spacing" DEFAULT 'regular';
  ALTER TABLE "_hubs_v_blocks_content_section" ADD COLUMN "theme" "enum__hubs_v_blocks_content_section_theme" DEFAULT 'light';
  ALTER TABLE "_hubs_v_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "_hubs_v_blocks_content_section" ADD COLUMN "spacing" "enum__hubs_v_blocks_content_section_spacing" DEFAULT 'regular';
  ALTER TABLE "venues_blocks_content_section" ADD COLUMN "theme" "enum_venues_blocks_content_section_theme" DEFAULT 'light';
  ALTER TABLE "venues_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "venues_blocks_content_section" ADD COLUMN "spacing" "enum_venues_blocks_content_section_spacing" DEFAULT 'regular';
  ALTER TABLE "_venues_v_blocks_content_section" ADD COLUMN "theme" "enum__venues_v_blocks_content_section_theme" DEFAULT 'light';
  ALTER TABLE "_venues_v_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "_venues_v_blocks_content_section" ADD COLUMN "spacing" "enum__venues_v_blocks_content_section_spacing" DEFAULT 'regular';
  ALTER TABLE "learning_videos_blocks_content_section" ADD COLUMN "theme" "enum_learning_videos_blocks_content_section_theme" DEFAULT 'light';
  ALTER TABLE "learning_videos_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "learning_videos_blocks_content_section" ADD COLUMN "spacing" "enum_learning_videos_blocks_content_section_spacing" DEFAULT 'regular';
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD COLUMN "theme" "enum__learning_videos_v_blocks_content_section_theme" DEFAULT 'light';
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD COLUMN "appearance" "presentation" DEFAULT 'default';
  ALTER TABLE "_learning_videos_v_blocks_content_section" ADD COLUMN "spacing" "enum__learning_videos_v_blocks_content_section_spacing" DEFAULT 'regular';
  DO $migration$
  DECLARE
    table_names text[] := ARRAY[
      'pages_blocks_content_section',
      '_pages_v_blocks_content_section',
      'articles_blocks_content_section',
      '_articles_v_blocks_content_section',
      'hubs_blocks_content_section',
      '_hubs_v_blocks_content_section',
      'venues_blocks_content_section',
      '_venues_v_blocks_content_section',
      'learning_videos_blocks_content_section',
      '_learning_videos_v_blocks_content_section'
    ];
    theme_types text[] := ARRAY[
      'enum_pages_blocks_content_section_theme',
      'enum__pages_v_blocks_content_section_theme',
      'enum_articles_blocks_content_section_theme',
      'enum__articles_v_blocks_content_section_theme',
      'enum_hubs_blocks_content_section_theme',
      'enum__hubs_v_blocks_content_section_theme',
      'enum_venues_blocks_content_section_theme',
      'enum__venues_v_blocks_content_section_theme',
      'enum_learning_videos_blocks_content_section_theme',
      'enum__learning_videos_v_blocks_content_section_theme'
    ];
    spacing_types text[] := ARRAY[
      'enum_pages_blocks_content_section_spacing',
      'enum__pages_v_blocks_content_section_spacing',
      'enum_articles_blocks_content_section_spacing',
      'enum__articles_v_blocks_content_section_spacing',
      'enum_hubs_blocks_content_section_spacing',
      'enum__hubs_v_blocks_content_section_spacing',
      'enum_venues_blocks_content_section_spacing',
      'enum__venues_v_blocks_content_section_spacing',
      'enum_learning_videos_blocks_content_section_spacing',
      'enum__learning_videos_v_blocks_content_section_spacing'
    ];
    table_index integer;
  BEGIN
    FOR table_index IN 1..array_length(table_names, 1)
    LOOP
      EXECUTE format(
        $statement$
          UPDATE %I
          SET
            "theme" = (
              CASE
                WHEN "surface_tone"::text = 'none' THEN 'light'
                ELSE "surface_tone"::text
              END
            )::%I,
            "appearance" = (
              CASE
                WHEN "surface_padding"::text = 'medium'
                  OR "surface_radius"::text = 'xl'
                  THEN 'inset'
                ELSE 'default'
              END
            )::"presentation",
            "spacing" = (
              CASE
                WHEN "spacing_top"::text = 'large'
                  OR "spacing_bottom"::text = 'large'
                  THEN 'generous'
                WHEN "spacing_top"::text = 'tight'
                  AND "spacing_bottom"::text = 'tight'
                  THEN 'compact'
                ELSE 'regular'
              END
            )::%I
        $statement$,
        table_names[table_index],
        theme_types[table_index],
        spacing_types[table_index]
      );
    END LOOP;
  END
  $migration$;
  ALTER TABLE "pages_blocks_trayport_hero_actions" DROP COLUMN "icon";
  ALTER TABLE "pages_blocks_trayport_hero" DROP COLUMN "badge_label";
  ALTER TABLE "pages_blocks_trayport_hero" DROP COLUMN "badge_icon";
  ALTER TABLE "pages_blocks_trayport_hero" DROP COLUMN "badge_tone";
  ALTER TABLE "pages_blocks_trayport_hero" DROP COLUMN "media_aspect";
  ALTER TABLE "pages_blocks_heading" DROP COLUMN "appearance";
  ALTER TABLE "pages_blocks_actions_actions" DROP COLUMN "icon";
  ALTER TABLE "pages_blocks_market_coverage_actions" DROP COLUMN "icon";
  ALTER TABLE "pages_blocks_content_section_columns" DROP COLUMN "horizontal_align";
  ALTER TABLE "pages_blocks_content_section_columns" DROP COLUMN "vertical_align";
  ALTER TABLE "pages_blocks_content_section_columns" DROP COLUMN "height_mode";
  ALTER TABLE "pages_blocks_content_section_columns" DROP COLUMN "component_gap";
  ALTER TABLE "pages_blocks_content_section_columns" DROP COLUMN "padding";
  ALTER TABLE "pages_blocks_content_section_columns" DROP COLUMN "surface";
  ALTER TABLE "pages_blocks_content_section_columns" DROP COLUMN "border";
  ALTER TABLE "pages_blocks_content_section_columns" DROP COLUMN "background_media_id";
  ALTER TABLE "pages_blocks_content_section_columns" DROP COLUMN "background_opacity";
  ALTER TABLE "pages_blocks_content_section_columns" DROP COLUMN "radius";
  ALTER TABLE "pages_blocks_content_section" DROP COLUMN "surface_tone";
  ALTER TABLE "pages_blocks_content_section" DROP COLUMN "surface_radius";
  ALTER TABLE "pages_blocks_content_section" DROP COLUMN "surface_padding";
  ALTER TABLE "pages_blocks_content_section" DROP COLUMN "spacing_top";
  ALTER TABLE "pages_blocks_content_section" DROP COLUMN "spacing_bottom";
  ALTER TABLE "pages_blocks_content_section" DROP COLUMN "column_gap";
  ALTER TABLE "_pages_v_blocks_trayport_hero_actions" DROP COLUMN "icon";
  ALTER TABLE "_pages_v_blocks_trayport_hero" DROP COLUMN "badge_label";
  ALTER TABLE "_pages_v_blocks_trayport_hero" DROP COLUMN "badge_icon";
  ALTER TABLE "_pages_v_blocks_trayport_hero" DROP COLUMN "badge_tone";
  ALTER TABLE "_pages_v_blocks_trayport_hero" DROP COLUMN "media_aspect";
  ALTER TABLE "_pages_v_blocks_heading" DROP COLUMN "appearance";
  ALTER TABLE "_pages_v_blocks_actions_actions" DROP COLUMN "icon";
  ALTER TABLE "_pages_v_blocks_market_coverage_actions" DROP COLUMN "icon";
  ALTER TABLE "_pages_v_blocks_content_section_columns" DROP COLUMN "horizontal_align";
  ALTER TABLE "_pages_v_blocks_content_section_columns" DROP COLUMN "vertical_align";
  ALTER TABLE "_pages_v_blocks_content_section_columns" DROP COLUMN "height_mode";
  ALTER TABLE "_pages_v_blocks_content_section_columns" DROP COLUMN "component_gap";
  ALTER TABLE "_pages_v_blocks_content_section_columns" DROP COLUMN "padding";
  ALTER TABLE "_pages_v_blocks_content_section_columns" DROP COLUMN "surface";
  ALTER TABLE "_pages_v_blocks_content_section_columns" DROP COLUMN "border";
  ALTER TABLE "_pages_v_blocks_content_section_columns" DROP COLUMN "background_media_id";
  ALTER TABLE "_pages_v_blocks_content_section_columns" DROP COLUMN "background_opacity";
  ALTER TABLE "_pages_v_blocks_content_section_columns" DROP COLUMN "radius";
  ALTER TABLE "_pages_v_blocks_content_section" DROP COLUMN "surface_tone";
  ALTER TABLE "_pages_v_blocks_content_section" DROP COLUMN "surface_radius";
  ALTER TABLE "_pages_v_blocks_content_section" DROP COLUMN "surface_padding";
  ALTER TABLE "_pages_v_blocks_content_section" DROP COLUMN "spacing_top";
  ALTER TABLE "_pages_v_blocks_content_section" DROP COLUMN "spacing_bottom";
  ALTER TABLE "_pages_v_blocks_content_section" DROP COLUMN "column_gap";
  ALTER TABLE "articles_blocks_trayport_hero_actions" DROP COLUMN "icon";
  ALTER TABLE "articles_blocks_trayport_hero" DROP COLUMN "badge_label";
  ALTER TABLE "articles_blocks_trayport_hero" DROP COLUMN "badge_icon";
  ALTER TABLE "articles_blocks_trayport_hero" DROP COLUMN "badge_tone";
  ALTER TABLE "articles_blocks_trayport_hero" DROP COLUMN "media_aspect";
  ALTER TABLE "articles_blocks_heading" DROP COLUMN "appearance";
  ALTER TABLE "articles_blocks_actions_actions" DROP COLUMN "icon";
  ALTER TABLE "articles_blocks_market_coverage_actions" DROP COLUMN "icon";
  ALTER TABLE "articles_blocks_content_section_columns" DROP COLUMN "horizontal_align";
  ALTER TABLE "articles_blocks_content_section_columns" DROP COLUMN "vertical_align";
  ALTER TABLE "articles_blocks_content_section_columns" DROP COLUMN "height_mode";
  ALTER TABLE "articles_blocks_content_section_columns" DROP COLUMN "component_gap";
  ALTER TABLE "articles_blocks_content_section_columns" DROP COLUMN "padding";
  ALTER TABLE "articles_blocks_content_section_columns" DROP COLUMN "surface";
  ALTER TABLE "articles_blocks_content_section_columns" DROP COLUMN "border";
  ALTER TABLE "articles_blocks_content_section_columns" DROP COLUMN "background_media_id";
  ALTER TABLE "articles_blocks_content_section_columns" DROP COLUMN "background_opacity";
  ALTER TABLE "articles_blocks_content_section_columns" DROP COLUMN "radius";
  ALTER TABLE "articles_blocks_content_section" DROP COLUMN "surface_tone";
  ALTER TABLE "articles_blocks_content_section" DROP COLUMN "surface_radius";
  ALTER TABLE "articles_blocks_content_section" DROP COLUMN "surface_padding";
  ALTER TABLE "articles_blocks_content_section" DROP COLUMN "spacing_top";
  ALTER TABLE "articles_blocks_content_section" DROP COLUMN "spacing_bottom";
  ALTER TABLE "articles_blocks_content_section" DROP COLUMN "column_gap";
  ALTER TABLE "_articles_v_blocks_trayport_hero_actions" DROP COLUMN "icon";
  ALTER TABLE "_articles_v_blocks_trayport_hero" DROP COLUMN "badge_label";
  ALTER TABLE "_articles_v_blocks_trayport_hero" DROP COLUMN "badge_icon";
  ALTER TABLE "_articles_v_blocks_trayport_hero" DROP COLUMN "badge_tone";
  ALTER TABLE "_articles_v_blocks_trayport_hero" DROP COLUMN "media_aspect";
  ALTER TABLE "_articles_v_blocks_heading" DROP COLUMN "appearance";
  ALTER TABLE "_articles_v_blocks_actions_actions" DROP COLUMN "icon";
  ALTER TABLE "_articles_v_blocks_market_coverage_actions" DROP COLUMN "icon";
  ALTER TABLE "_articles_v_blocks_content_section_columns" DROP COLUMN "horizontal_align";
  ALTER TABLE "_articles_v_blocks_content_section_columns" DROP COLUMN "vertical_align";
  ALTER TABLE "_articles_v_blocks_content_section_columns" DROP COLUMN "height_mode";
  ALTER TABLE "_articles_v_blocks_content_section_columns" DROP COLUMN "component_gap";
  ALTER TABLE "_articles_v_blocks_content_section_columns" DROP COLUMN "padding";
  ALTER TABLE "_articles_v_blocks_content_section_columns" DROP COLUMN "surface";
  ALTER TABLE "_articles_v_blocks_content_section_columns" DROP COLUMN "border";
  ALTER TABLE "_articles_v_blocks_content_section_columns" DROP COLUMN "background_media_id";
  ALTER TABLE "_articles_v_blocks_content_section_columns" DROP COLUMN "background_opacity";
  ALTER TABLE "_articles_v_blocks_content_section_columns" DROP COLUMN "radius";
  ALTER TABLE "_articles_v_blocks_content_section" DROP COLUMN "surface_tone";
  ALTER TABLE "_articles_v_blocks_content_section" DROP COLUMN "surface_radius";
  ALTER TABLE "_articles_v_blocks_content_section" DROP COLUMN "surface_padding";
  ALTER TABLE "_articles_v_blocks_content_section" DROP COLUMN "spacing_top";
  ALTER TABLE "_articles_v_blocks_content_section" DROP COLUMN "spacing_bottom";
  ALTER TABLE "_articles_v_blocks_content_section" DROP COLUMN "column_gap";
  ALTER TABLE "hubs_blocks_trayport_hero_actions" DROP COLUMN "icon";
  ALTER TABLE "hubs_blocks_trayport_hero" DROP COLUMN "badge_label";
  ALTER TABLE "hubs_blocks_trayport_hero" DROP COLUMN "badge_icon";
  ALTER TABLE "hubs_blocks_trayport_hero" DROP COLUMN "badge_tone";
  ALTER TABLE "hubs_blocks_trayport_hero" DROP COLUMN "media_aspect";
  ALTER TABLE "hubs_blocks_heading" DROP COLUMN "appearance";
  ALTER TABLE "hubs_blocks_actions_actions" DROP COLUMN "icon";
  ALTER TABLE "hubs_blocks_market_coverage_actions" DROP COLUMN "icon";
  ALTER TABLE "hubs_blocks_content_section_columns" DROP COLUMN "horizontal_align";
  ALTER TABLE "hubs_blocks_content_section_columns" DROP COLUMN "vertical_align";
  ALTER TABLE "hubs_blocks_content_section_columns" DROP COLUMN "height_mode";
  ALTER TABLE "hubs_blocks_content_section_columns" DROP COLUMN "component_gap";
  ALTER TABLE "hubs_blocks_content_section_columns" DROP COLUMN "padding";
  ALTER TABLE "hubs_blocks_content_section_columns" DROP COLUMN "surface";
  ALTER TABLE "hubs_blocks_content_section_columns" DROP COLUMN "border";
  ALTER TABLE "hubs_blocks_content_section_columns" DROP COLUMN "background_media_id";
  ALTER TABLE "hubs_blocks_content_section_columns" DROP COLUMN "background_opacity";
  ALTER TABLE "hubs_blocks_content_section_columns" DROP COLUMN "radius";
  ALTER TABLE "hubs_blocks_content_section" DROP COLUMN "surface_tone";
  ALTER TABLE "hubs_blocks_content_section" DROP COLUMN "surface_radius";
  ALTER TABLE "hubs_blocks_content_section" DROP COLUMN "surface_padding";
  ALTER TABLE "hubs_blocks_content_section" DROP COLUMN "spacing_top";
  ALTER TABLE "hubs_blocks_content_section" DROP COLUMN "spacing_bottom";
  ALTER TABLE "hubs_blocks_content_section" DROP COLUMN "column_gap";
  ALTER TABLE "_hubs_v_blocks_trayport_hero_actions" DROP COLUMN "icon";
  ALTER TABLE "_hubs_v_blocks_trayport_hero" DROP COLUMN "badge_label";
  ALTER TABLE "_hubs_v_blocks_trayport_hero" DROP COLUMN "badge_icon";
  ALTER TABLE "_hubs_v_blocks_trayport_hero" DROP COLUMN "badge_tone";
  ALTER TABLE "_hubs_v_blocks_trayport_hero" DROP COLUMN "media_aspect";
  ALTER TABLE "_hubs_v_blocks_heading" DROP COLUMN "appearance";
  ALTER TABLE "_hubs_v_blocks_actions_actions" DROP COLUMN "icon";
  ALTER TABLE "_hubs_v_blocks_market_coverage_actions" DROP COLUMN "icon";
  ALTER TABLE "_hubs_v_blocks_content_section_columns" DROP COLUMN "horizontal_align";
  ALTER TABLE "_hubs_v_blocks_content_section_columns" DROP COLUMN "vertical_align";
  ALTER TABLE "_hubs_v_blocks_content_section_columns" DROP COLUMN "height_mode";
  ALTER TABLE "_hubs_v_blocks_content_section_columns" DROP COLUMN "component_gap";
  ALTER TABLE "_hubs_v_blocks_content_section_columns" DROP COLUMN "padding";
  ALTER TABLE "_hubs_v_blocks_content_section_columns" DROP COLUMN "surface";
  ALTER TABLE "_hubs_v_blocks_content_section_columns" DROP COLUMN "border";
  ALTER TABLE "_hubs_v_blocks_content_section_columns" DROP COLUMN "background_media_id";
  ALTER TABLE "_hubs_v_blocks_content_section_columns" DROP COLUMN "background_opacity";
  ALTER TABLE "_hubs_v_blocks_content_section_columns" DROP COLUMN "radius";
  ALTER TABLE "_hubs_v_blocks_content_section" DROP COLUMN "surface_tone";
  ALTER TABLE "_hubs_v_blocks_content_section" DROP COLUMN "surface_radius";
  ALTER TABLE "_hubs_v_blocks_content_section" DROP COLUMN "surface_padding";
  ALTER TABLE "_hubs_v_blocks_content_section" DROP COLUMN "spacing_top";
  ALTER TABLE "_hubs_v_blocks_content_section" DROP COLUMN "spacing_bottom";
  ALTER TABLE "_hubs_v_blocks_content_section" DROP COLUMN "column_gap";
  ALTER TABLE "venues_blocks_trayport_hero_actions" DROP COLUMN "icon";
  ALTER TABLE "venues_blocks_trayport_hero" DROP COLUMN "badge_label";
  ALTER TABLE "venues_blocks_trayport_hero" DROP COLUMN "badge_icon";
  ALTER TABLE "venues_blocks_trayport_hero" DROP COLUMN "badge_tone";
  ALTER TABLE "venues_blocks_trayport_hero" DROP COLUMN "media_aspect";
  ALTER TABLE "venues_blocks_heading" DROP COLUMN "appearance";
  ALTER TABLE "venues_blocks_actions_actions" DROP COLUMN "icon";
  ALTER TABLE "venues_blocks_market_coverage_actions" DROP COLUMN "icon";
  ALTER TABLE "venues_blocks_content_section_columns" DROP COLUMN "horizontal_align";
  ALTER TABLE "venues_blocks_content_section_columns" DROP COLUMN "vertical_align";
  ALTER TABLE "venues_blocks_content_section_columns" DROP COLUMN "height_mode";
  ALTER TABLE "venues_blocks_content_section_columns" DROP COLUMN "component_gap";
  ALTER TABLE "venues_blocks_content_section_columns" DROP COLUMN "padding";
  ALTER TABLE "venues_blocks_content_section_columns" DROP COLUMN "surface";
  ALTER TABLE "venues_blocks_content_section_columns" DROP COLUMN "border";
  ALTER TABLE "venues_blocks_content_section_columns" DROP COLUMN "background_media_id";
  ALTER TABLE "venues_blocks_content_section_columns" DROP COLUMN "background_opacity";
  ALTER TABLE "venues_blocks_content_section_columns" DROP COLUMN "radius";
  ALTER TABLE "venues_blocks_content_section" DROP COLUMN "surface_tone";
  ALTER TABLE "venues_blocks_content_section" DROP COLUMN "surface_radius";
  ALTER TABLE "venues_blocks_content_section" DROP COLUMN "surface_padding";
  ALTER TABLE "venues_blocks_content_section" DROP COLUMN "spacing_top";
  ALTER TABLE "venues_blocks_content_section" DROP COLUMN "spacing_bottom";
  ALTER TABLE "venues_blocks_content_section" DROP COLUMN "column_gap";
  ALTER TABLE "_venues_v_blocks_trayport_hero_actions" DROP COLUMN "icon";
  ALTER TABLE "_venues_v_blocks_trayport_hero" DROP COLUMN "badge_label";
  ALTER TABLE "_venues_v_blocks_trayport_hero" DROP COLUMN "badge_icon";
  ALTER TABLE "_venues_v_blocks_trayport_hero" DROP COLUMN "badge_tone";
  ALTER TABLE "_venues_v_blocks_trayport_hero" DROP COLUMN "media_aspect";
  ALTER TABLE "_venues_v_blocks_heading" DROP COLUMN "appearance";
  ALTER TABLE "_venues_v_blocks_actions_actions" DROP COLUMN "icon";
  ALTER TABLE "_venues_v_blocks_market_coverage_actions" DROP COLUMN "icon";
  ALTER TABLE "_venues_v_blocks_content_section_columns" DROP COLUMN "horizontal_align";
  ALTER TABLE "_venues_v_blocks_content_section_columns" DROP COLUMN "vertical_align";
  ALTER TABLE "_venues_v_blocks_content_section_columns" DROP COLUMN "height_mode";
  ALTER TABLE "_venues_v_blocks_content_section_columns" DROP COLUMN "component_gap";
  ALTER TABLE "_venues_v_blocks_content_section_columns" DROP COLUMN "padding";
  ALTER TABLE "_venues_v_blocks_content_section_columns" DROP COLUMN "surface";
  ALTER TABLE "_venues_v_blocks_content_section_columns" DROP COLUMN "border";
  ALTER TABLE "_venues_v_blocks_content_section_columns" DROP COLUMN "background_media_id";
  ALTER TABLE "_venues_v_blocks_content_section_columns" DROP COLUMN "background_opacity";
  ALTER TABLE "_venues_v_blocks_content_section_columns" DROP COLUMN "radius";
  ALTER TABLE "_venues_v_blocks_content_section" DROP COLUMN "surface_tone";
  ALTER TABLE "_venues_v_blocks_content_section" DROP COLUMN "surface_radius";
  ALTER TABLE "_venues_v_blocks_content_section" DROP COLUMN "surface_padding";
  ALTER TABLE "_venues_v_blocks_content_section" DROP COLUMN "spacing_top";
  ALTER TABLE "_venues_v_blocks_content_section" DROP COLUMN "spacing_bottom";
  ALTER TABLE "_venues_v_blocks_content_section" DROP COLUMN "column_gap";
  ALTER TABLE "learning_videos_blocks_trayport_hero_actions" DROP COLUMN "icon";
  ALTER TABLE "learning_videos_blocks_trayport_hero" DROP COLUMN "badge_label";
  ALTER TABLE "learning_videos_blocks_trayport_hero" DROP COLUMN "badge_icon";
  ALTER TABLE "learning_videos_blocks_trayport_hero" DROP COLUMN "badge_tone";
  ALTER TABLE "learning_videos_blocks_trayport_hero" DROP COLUMN "media_aspect";
  ALTER TABLE "learning_videos_blocks_heading" DROP COLUMN "appearance";
  ALTER TABLE "learning_videos_blocks_actions_actions" DROP COLUMN "icon";
  ALTER TABLE "learning_videos_blocks_market_coverage_actions" DROP COLUMN "icon";
  ALTER TABLE "learning_videos_blocks_content_section_columns" DROP COLUMN "horizontal_align";
  ALTER TABLE "learning_videos_blocks_content_section_columns" DROP COLUMN "vertical_align";
  ALTER TABLE "learning_videos_blocks_content_section_columns" DROP COLUMN "height_mode";
  ALTER TABLE "learning_videos_blocks_content_section_columns" DROP COLUMN "component_gap";
  ALTER TABLE "learning_videos_blocks_content_section_columns" DROP COLUMN "padding";
  ALTER TABLE "learning_videos_blocks_content_section_columns" DROP COLUMN "surface";
  ALTER TABLE "learning_videos_blocks_content_section_columns" DROP COLUMN "border";
  ALTER TABLE "learning_videos_blocks_content_section_columns" DROP COLUMN "background_media_id";
  ALTER TABLE "learning_videos_blocks_content_section_columns" DROP COLUMN "background_opacity";
  ALTER TABLE "learning_videos_blocks_content_section_columns" DROP COLUMN "radius";
  ALTER TABLE "learning_videos_blocks_content_section" DROP COLUMN "surface_tone";
  ALTER TABLE "learning_videos_blocks_content_section" DROP COLUMN "surface_radius";
  ALTER TABLE "learning_videos_blocks_content_section" DROP COLUMN "surface_padding";
  ALTER TABLE "learning_videos_blocks_content_section" DROP COLUMN "spacing_top";
  ALTER TABLE "learning_videos_blocks_content_section" DROP COLUMN "spacing_bottom";
  ALTER TABLE "learning_videos_blocks_content_section" DROP COLUMN "column_gap";
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero_actions" DROP COLUMN "icon";
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero" DROP COLUMN "badge_label";
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero" DROP COLUMN "badge_icon";
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero" DROP COLUMN "badge_tone";
  ALTER TABLE "_learning_videos_v_blocks_trayport_hero" DROP COLUMN "media_aspect";
  ALTER TABLE "_learning_videos_v_blocks_heading" DROP COLUMN "appearance";
  ALTER TABLE "_learning_videos_v_blocks_actions_actions" DROP COLUMN "icon";
  ALTER TABLE "_learning_videos_v_blocks_market_coverage_actions" DROP COLUMN "icon";
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" DROP COLUMN "horizontal_align";
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" DROP COLUMN "vertical_align";
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" DROP COLUMN "height_mode";
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" DROP COLUMN "component_gap";
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" DROP COLUMN "padding";
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" DROP COLUMN "surface";
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" DROP COLUMN "border";
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" DROP COLUMN "background_media_id";
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" DROP COLUMN "background_opacity";
  ALTER TABLE "_learning_videos_v_blocks_content_section_columns" DROP COLUMN "radius";
  ALTER TABLE "_learning_videos_v_blocks_content_section" DROP COLUMN "surface_tone";
  ALTER TABLE "_learning_videos_v_blocks_content_section" DROP COLUMN "surface_radius";
  ALTER TABLE "_learning_videos_v_blocks_content_section" DROP COLUMN "surface_padding";
  ALTER TABLE "_learning_videos_v_blocks_content_section" DROP COLUMN "spacing_top";
  ALTER TABLE "_learning_videos_v_blocks_content_section" DROP COLUMN "spacing_bottom";
  ALTER TABLE "_learning_videos_v_blocks_content_section" DROP COLUMN "column_gap";
  DROP TYPE "public"."enum_pages_blocks_trayport_hero_actions_icon";
  DROP TYPE "public"."enum_pages_blocks_trayport_hero_badge_icon";
  DROP TYPE "public"."enum_pages_blocks_trayport_hero_badge_tone";
  DROP TYPE "public"."enum_pages_blocks_trayport_hero_media_aspect";
  DROP TYPE "public"."enum_pages_blocks_heading_appearance";
  DROP TYPE "public"."enum_pages_blocks_actions_actions_icon";
  DROP TYPE "public"."enum_pages_blocks_market_coverage_actions_icon";
  DROP TYPE "public"."horizontal_align";
  DROP TYPE "public"."vertical_align";
  DROP TYPE "public"."height_mode";
  DROP TYPE "public"."component_gap";
  DROP TYPE "public"."enum_pages_blocks_content_section_columns_padding";
  DROP TYPE "public"."enum_pages_blocks_content_section_columns_surface";
  DROP TYPE "public"."enum_pages_blocks_content_section_columns_border";
  DROP TYPE "public"."enum_pages_blocks_content_section_columns_radius";
  DROP TYPE "public"."theme";
  DROP TYPE "public"."surface_radius";
  DROP TYPE "public"."surface_padding";
  DROP TYPE "public"."spacing_top";
  DROP TYPE "public"."spacing_bottom";
  DROP TYPE "public"."column_gap";
  DROP TYPE "public"."enum__pages_v_blocks_trayport_hero_actions_icon";
  DROP TYPE "public"."enum__pages_v_blocks_trayport_hero_badge_icon";
  DROP TYPE "public"."enum__pages_v_blocks_trayport_hero_badge_tone";
  DROP TYPE "public"."enum__pages_v_blocks_trayport_hero_media_aspect";
  DROP TYPE "public"."enum__pages_v_blocks_heading_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_actions_actions_icon";
  DROP TYPE "public"."enum__pages_v_blocks_market_coverage_actions_icon";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_columns_padding";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_columns_surface";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_columns_border";
  DROP TYPE "public"."enum__pages_v_blocks_content_section_columns_radius";
  DROP TYPE "public"."enum_articles_blocks_trayport_hero_actions_icon";
  DROP TYPE "public"."enum_articles_blocks_trayport_hero_badge_icon";
  DROP TYPE "public"."enum_articles_blocks_trayport_hero_badge_tone";
  DROP TYPE "public"."enum_articles_blocks_trayport_hero_media_aspect";
  DROP TYPE "public"."enum_articles_blocks_heading_appearance";
  DROP TYPE "public"."enum_articles_blocks_actions_actions_icon";
  DROP TYPE "public"."enum_articles_blocks_market_coverage_actions_icon";
  DROP TYPE "public"."enum_articles_blocks_content_section_columns_padding";
  DROP TYPE "public"."enum_articles_blocks_content_section_columns_surface";
  DROP TYPE "public"."enum_articles_blocks_content_section_columns_border";
  DROP TYPE "public"."enum_articles_blocks_content_section_columns_radius";
  DROP TYPE "public"."enum__articles_v_blocks_trayport_hero_actions_icon";
  DROP TYPE "public"."enum__articles_v_blocks_trayport_hero_badge_icon";
  DROP TYPE "public"."enum__articles_v_blocks_trayport_hero_badge_tone";
  DROP TYPE "public"."enum__articles_v_blocks_trayport_hero_media_aspect";
  DROP TYPE "public"."enum__articles_v_blocks_heading_appearance";
  DROP TYPE "public"."enum__articles_v_blocks_actions_actions_icon";
  DROP TYPE "public"."enum__articles_v_blocks_market_coverage_actions_icon";
  DROP TYPE "public"."enum__articles_v_blocks_content_section_columns_padding";
  DROP TYPE "public"."enum__articles_v_blocks_content_section_columns_surface";
  DROP TYPE "public"."enum__articles_v_blocks_content_section_columns_border";
  DROP TYPE "public"."enum__articles_v_blocks_content_section_columns_radius";
  DROP TYPE "public"."enum_hubs_blocks_trayport_hero_actions_icon";
  DROP TYPE "public"."enum_hubs_blocks_trayport_hero_badge_icon";
  DROP TYPE "public"."enum_hubs_blocks_trayport_hero_badge_tone";
  DROP TYPE "public"."enum_hubs_blocks_trayport_hero_media_aspect";
  DROP TYPE "public"."enum_hubs_blocks_heading_appearance";
  DROP TYPE "public"."enum_hubs_blocks_actions_actions_icon";
  DROP TYPE "public"."enum_hubs_blocks_market_coverage_actions_icon";
  DROP TYPE "public"."enum_hubs_blocks_content_section_columns_padding";
  DROP TYPE "public"."enum_hubs_blocks_content_section_columns_surface";
  DROP TYPE "public"."enum_hubs_blocks_content_section_columns_border";
  DROP TYPE "public"."enum_hubs_blocks_content_section_columns_radius";
  DROP TYPE "public"."enum__hubs_v_blocks_trayport_hero_actions_icon";
  DROP TYPE "public"."enum__hubs_v_blocks_trayport_hero_badge_icon";
  DROP TYPE "public"."enum__hubs_v_blocks_trayport_hero_badge_tone";
  DROP TYPE "public"."enum__hubs_v_blocks_trayport_hero_media_aspect";
  DROP TYPE "public"."enum__hubs_v_blocks_heading_appearance";
  DROP TYPE "public"."enum__hubs_v_blocks_actions_actions_icon";
  DROP TYPE "public"."enum__hubs_v_blocks_market_coverage_actions_icon";
  DROP TYPE "public"."enum__hubs_v_blocks_content_section_columns_padding";
  DROP TYPE "public"."enum__hubs_v_blocks_content_section_columns_surface";
  DROP TYPE "public"."enum__hubs_v_blocks_content_section_columns_border";
  DROP TYPE "public"."enum__hubs_v_blocks_content_section_columns_radius";
  DROP TYPE "public"."enum_venues_blocks_trayport_hero_actions_icon";
  DROP TYPE "public"."enum_venues_blocks_trayport_hero_badge_icon";
  DROP TYPE "public"."enum_venues_blocks_trayport_hero_badge_tone";
  DROP TYPE "public"."enum_venues_blocks_trayport_hero_media_aspect";
  DROP TYPE "public"."enum_venues_blocks_heading_appearance";
  DROP TYPE "public"."enum_venues_blocks_actions_actions_icon";
  DROP TYPE "public"."enum_venues_blocks_market_coverage_actions_icon";
  DROP TYPE "public"."enum_venues_blocks_content_section_columns_padding";
  DROP TYPE "public"."enum_venues_blocks_content_section_columns_surface";
  DROP TYPE "public"."enum_venues_blocks_content_section_columns_border";
  DROP TYPE "public"."enum_venues_blocks_content_section_columns_radius";
  DROP TYPE "public"."enum__venues_v_blocks_trayport_hero_actions_icon";
  DROP TYPE "public"."enum__venues_v_blocks_trayport_hero_badge_icon";
  DROP TYPE "public"."enum__venues_v_blocks_trayport_hero_badge_tone";
  DROP TYPE "public"."enum__venues_v_blocks_trayport_hero_media_aspect";
  DROP TYPE "public"."enum__venues_v_blocks_heading_appearance";
  DROP TYPE "public"."enum__venues_v_blocks_actions_actions_icon";
  DROP TYPE "public"."enum__venues_v_blocks_market_coverage_actions_icon";
  DROP TYPE "public"."enum__venues_v_blocks_content_section_columns_padding";
  DROP TYPE "public"."enum__venues_v_blocks_content_section_columns_surface";
  DROP TYPE "public"."enum__venues_v_blocks_content_section_columns_border";
  DROP TYPE "public"."enum__venues_v_blocks_content_section_columns_radius";
  DROP TYPE "public"."enum_learning_videos_blocks_trayport_hero_actions_icon";
  DROP TYPE "public"."enum_learning_videos_blocks_trayport_hero_badge_icon";
  DROP TYPE "public"."enum_learning_videos_blocks_trayport_hero_badge_tone";
  DROP TYPE "public"."enum_learning_videos_blocks_trayport_hero_media_aspect";
  DROP TYPE "public"."enum_learning_videos_blocks_heading_appearance";
  DROP TYPE "public"."enum_learning_videos_blocks_actions_actions_icon";
  DROP TYPE "public"."enum_learning_videos_blocks_market_coverage_actions_icon";
  DROP TYPE "public"."enum_learning_videos_blocks_content_section_columns_padding";
  DROP TYPE "public"."enum_learning_videos_blocks_content_section_columns_surface";
  DROP TYPE "public"."enum_learning_videos_blocks_content_section_columns_border";
  DROP TYPE "public"."enum_learning_videos_blocks_content_section_columns_radius";
  DROP TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_actions_icon";
  DROP TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_badge_icon";
  DROP TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_badge_tone";
  DROP TYPE "public"."enum__learning_videos_v_blocks_trayport_hero_media_aspect";
  DROP TYPE "public"."enum__learning_videos_v_blocks_heading_appearance";
  DROP TYPE "public"."enum__learning_videos_v_blocks_actions_actions_icon";
  DROP TYPE "public"."enum__learning_videos_v_blocks_market_coverage_actions_icon";
  DROP TYPE "public"."enum__learning_videos_v_blocks_content_section_columns_padding";
  DROP TYPE "public"."enum__learning_videos_v_blocks_content_section_columns_surface";
  DROP TYPE "public"."enum__learning_videos_v_blocks_content_section_columns_border";
  DROP TYPE "public"."enum__learning_videos_v_blocks_content_section_columns_radius";`)
}
