import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_navigation_primary_items_groups_items_kind" AS ENUM('link', 'feature');
  CREATE TYPE "public"."enum_navigation_primary_items_groups_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_navigation_primary_items_groups_items_icon" AS ENUM('people', 'offices', 'careers', 'tradingScreen', 'network', 'connections', 'connectivity', 'code', 'compare', 'waterfallChart', 'candlestickChart', 'calculator', 'users', 'marketAccess', 'quote', 'pieChart', 'ballot', 'shield', 'lock', 'csvFile', 'buildingSecurity', 'file', 'power', 'gas', 'metals', 'climate', 'bulkMarkets', 'oil', 'world', 'northAmerica', 'europe', 'asiaPacific', 'video', 'playCircle', 'marketMatrix', 'map', 'lifecycle', 'news', 'calendar', 'insight', 'list', 'email', 'messages', 'demo');
  CREATE TYPE "public"."enum_navigation_primary_items_groups_items_accent" AS ENUM('blue', 'cyan', 'green', 'yellow', 'orange');
  CREATE TYPE "public"."enum_navigation_primary_items_groups_title_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_navigation_primary_items_groups_span" AS ENUM('auto', '2', '3', '4', '6');
  CREATE TYPE "public"."enum_navigation_utility_items_icon" AS ENUM('people', 'offices', 'careers', 'tradingScreen', 'network', 'connections', 'connectivity', 'code', 'compare', 'waterfallChart', 'candlestickChart', 'calculator', 'users', 'marketAccess', 'quote', 'pieChart', 'ballot', 'shield', 'lock', 'csvFile', 'buildingSecurity', 'file', 'power', 'gas', 'metals', 'climate', 'bulkMarkets', 'oil', 'world', 'northAmerica', 'europe', 'asiaPacific', 'video', 'playCircle', 'marketMatrix', 'map', 'lifecycle', 'news', 'calendar', 'insight', 'list', 'email', 'messages', 'demo');
  CREATE TYPE "public"."enum__navigation_v_version_primary_items_groups_items_kind" AS ENUM('link', 'feature');
  CREATE TYPE "public"."enum__navigation_v_version_primary_items_groups_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__navigation_v_version_primary_items_groups_items_icon" AS ENUM('people', 'offices', 'careers', 'tradingScreen', 'network', 'connections', 'connectivity', 'code', 'compare', 'waterfallChart', 'candlestickChart', 'calculator', 'users', 'marketAccess', 'quote', 'pieChart', 'ballot', 'shield', 'lock', 'csvFile', 'buildingSecurity', 'file', 'power', 'gas', 'metals', 'climate', 'bulkMarkets', 'oil', 'world', 'northAmerica', 'europe', 'asiaPacific', 'video', 'playCircle', 'marketMatrix', 'map', 'lifecycle', 'news', 'calendar', 'insight', 'list', 'email', 'messages', 'demo');
  CREATE TYPE "public"."enum__navigation_v_version_primary_items_groups_items_accent" AS ENUM('blue', 'cyan', 'green', 'yellow', 'orange');
  CREATE TYPE "public"."enum__navigation_v_version_primary_items_groups_title_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__navigation_v_version_primary_items_groups_span" AS ENUM('auto', '2', '3', '4', '6');
  CREATE TYPE "public"."enum__navigation_v_version_utility_items_icon" AS ENUM('people', 'offices', 'careers', 'tradingScreen', 'network', 'connections', 'connectivity', 'code', 'compare', 'waterfallChart', 'candlestickChart', 'calculator', 'users', 'marketAccess', 'quote', 'pieChart', 'ballot', 'shield', 'lock', 'csvFile', 'buildingSecurity', 'file', 'power', 'gas', 'metals', 'climate', 'bulkMarkets', 'oil', 'world', 'northAmerica', 'europe', 'asiaPacific', 'video', 'playCircle', 'marketMatrix', 'map', 'lifecycle', 'news', 'calendar', 'insight', 'list', 'email', 'messages', 'demo');
  CREATE TYPE "public"."enum_footer_columns_links_icon" AS ENUM('companyProfile', 'offices', 'careers', 'contact', 'marketMatrix', 'regionEurope', 'regionNorthAmerica', 'regionAsiaPacific', 'legalDocument');
  CREATE TYPE "public"."enum_footer_columns_links_accent" AS ENUM('cyan', 'yellow', 'orange', 'white');
  CREATE TYPE "public"."enum_footer_columns_title_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__footer_v_version_columns_links_icon" AS ENUM('companyProfile', 'offices', 'careers', 'contact', 'marketMatrix', 'regionEurope', 'regionNorthAmerica', 'regionAsiaPacific', 'legalDocument');
  CREATE TYPE "public"."enum__footer_v_version_columns_links_accent" AS ENUM('cyan', 'yellow', 'orange', 'white');
  CREATE TYPE "public"."enum__footer_v_version_columns_title_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "navigation_primary_items_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_navigation_primary_items_groups_items_kind" DEFAULT 'link',
  	"label" varchar,
  	"description" varchar,
  	"link_type" "enum_navigation_primary_items_groups_items_link_type" DEFAULT 'reference',
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"icon" "enum_navigation_primary_items_groups_items_icon",
  	"accent" "enum_navigation_primary_items_groups_items_accent",
  	"media_id" integer
  );
  
  CREATE TABLE "navigation_primary_items_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"title_link_type" "enum_navigation_primary_items_groups_title_link_type",
  	"title_link_url" varchar,
  	"title_link_new_tab" boolean,
  	"span" "enum_navigation_primary_items_groups_span" DEFAULT 'auto'
  );
  
  CREATE TABLE "_navigation_v_version_primary_items_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__navigation_v_version_primary_items_groups_items_kind" DEFAULT 'link',
  	"label" varchar,
  	"description" varchar,
  	"link_type" "enum__navigation_v_version_primary_items_groups_items_link_type" DEFAULT 'reference',
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"icon" "enum__navigation_v_version_primary_items_groups_items_icon",
  	"accent" "enum__navigation_v_version_primary_items_groups_items_accent",
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v_version_primary_items_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"title_link_type" "enum__navigation_v_version_primary_items_groups_title_link_type",
  	"title_link_url" varchar,
  	"title_link_new_tab" boolean,
  	"span" "enum__navigation_v_version_primary_items_groups_span" DEFAULT 'auto',
  	"_uuid" varchar
  );
  
  ALTER TABLE "navigation_utility_items" ADD COLUMN "icon" "enum_navigation_utility_items_icon";
  ALTER TABLE "_navigation_v_version_utility_items" ADD COLUMN "icon" "enum__navigation_v_version_utility_items_icon";
  ALTER TABLE "footer_columns_links" ADD COLUMN "icon" "enum_footer_columns_links_icon";
  ALTER TABLE "footer_columns_links" ADD COLUMN "accent" "enum_footer_columns_links_accent" DEFAULT 'white';
  ALTER TABLE "footer_columns" ADD COLUMN "title_link_type" "enum_footer_columns_title_link_type";
  ALTER TABLE "footer_columns" ADD COLUMN "title_link_url" varchar;
  ALTER TABLE "footer_columns" ADD COLUMN "title_link_new_tab" boolean;
  ALTER TABLE "footer" ADD COLUMN "company_registration_text" varchar;
  ALTER TABLE "footer" ADD COLUMN "parent_company_text" varchar;
  ALTER TABLE "_footer_v_version_columns_links" ADD COLUMN "icon" "enum__footer_v_version_columns_links_icon";
  ALTER TABLE "_footer_v_version_columns_links" ADD COLUMN "accent" "enum__footer_v_version_columns_links_accent" DEFAULT 'white';
  ALTER TABLE "_footer_v_version_columns" ADD COLUMN "title_link_type" "enum__footer_v_version_columns_title_link_type";
  ALTER TABLE "_footer_v_version_columns" ADD COLUMN "title_link_url" varchar;
  ALTER TABLE "_footer_v_version_columns" ADD COLUMN "title_link_new_tab" boolean;
  ALTER TABLE "_footer_v" ADD COLUMN "version_company_registration_text" varchar;
  ALTER TABLE "_footer_v" ADD COLUMN "version_parent_company_text" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "cookie_notice_title" varchar DEFAULT 'Trayport Cookie Consent';
  ALTER TABLE "site_settings" ADD COLUMN "cookie_notice_policy_link_label" varchar DEFAULT 'Cookie Policy';
  ALTER TABLE "site_settings" ADD COLUMN "cookie_notice_accept_label" varchar DEFAULT 'Accept All';
  ALTER TABLE "site_settings" ADD COLUMN "cookie_notice_reject_label" varchar DEFAULT 'Reject All';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_cookie_notice_title" varchar DEFAULT 'Trayport Cookie Consent';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_cookie_notice_policy_link_label" varchar DEFAULT 'Cookie Policy';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_cookie_notice_accept_label" varchar DEFAULT 'Accept All';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_cookie_notice_reject_label" varchar DEFAULT 'Reject All';
  ALTER TABLE "navigation_primary_items_groups_items" ADD CONSTRAINT "navigation_primary_items_groups_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_primary_items_groups_items" ADD CONSTRAINT "navigation_primary_items_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_primary_items_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_primary_items_groups" ADD CONSTRAINT "navigation_primary_items_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_primary_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_primary_items_groups_items" ADD CONSTRAINT "_navigation_v_version_primary_items_groups_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_primary_items_groups_items" ADD CONSTRAINT "_navigation_v_version_primary_items_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_primary_items_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_primary_items_groups" ADD CONSTRAINT "_navigation_v_version_primary_items_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_primary_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "navigation_primary_items_groups_items_order_idx" ON "navigation_primary_items_groups_items" USING btree ("_order");
  CREATE INDEX "navigation_primary_items_groups_items_parent_id_idx" ON "navigation_primary_items_groups_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_primary_items_groups_items_media_idx" ON "navigation_primary_items_groups_items" USING btree ("media_id");
  CREATE INDEX "navigation_primary_items_groups_order_idx" ON "navigation_primary_items_groups" USING btree ("_order");
  CREATE INDEX "navigation_primary_items_groups_parent_id_idx" ON "navigation_primary_items_groups" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_primary_items_groups_items_order_idx" ON "_navigation_v_version_primary_items_groups_items" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_primary_items_groups_items_parent_id_idx" ON "_navigation_v_version_primary_items_groups_items" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_primary_items_groups_items_media_idx" ON "_navigation_v_version_primary_items_groups_items" USING btree ("media_id");
  CREATE INDEX "_navigation_v_version_primary_items_groups_order_idx" ON "_navigation_v_version_primary_items_groups" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_primary_items_groups_parent_id_idx" ON "_navigation_v_version_primary_items_groups" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "navigation_primary_items_groups_items" CASCADE;
  DROP TABLE "navigation_primary_items_groups" CASCADE;
  DROP TABLE "_navigation_v_version_primary_items_groups_items" CASCADE;
  DROP TABLE "_navigation_v_version_primary_items_groups" CASCADE;
  ALTER TABLE "navigation_utility_items" DROP COLUMN "icon";
  ALTER TABLE "_navigation_v_version_utility_items" DROP COLUMN "icon";
  ALTER TABLE "footer_columns_links" DROP COLUMN "icon";
  ALTER TABLE "footer_columns_links" DROP COLUMN "accent";
  ALTER TABLE "footer_columns" DROP COLUMN "title_link_type";
  ALTER TABLE "footer_columns" DROP COLUMN "title_link_url";
  ALTER TABLE "footer_columns" DROP COLUMN "title_link_new_tab";
  ALTER TABLE "footer" DROP COLUMN "company_registration_text";
  ALTER TABLE "footer" DROP COLUMN "parent_company_text";
  ALTER TABLE "_footer_v_version_columns_links" DROP COLUMN "icon";
  ALTER TABLE "_footer_v_version_columns_links" DROP COLUMN "accent";
  ALTER TABLE "_footer_v_version_columns" DROP COLUMN "title_link_type";
  ALTER TABLE "_footer_v_version_columns" DROP COLUMN "title_link_url";
  ALTER TABLE "_footer_v_version_columns" DROP COLUMN "title_link_new_tab";
  ALTER TABLE "_footer_v" DROP COLUMN "version_company_registration_text";
  ALTER TABLE "_footer_v" DROP COLUMN "version_parent_company_text";
  ALTER TABLE "site_settings" DROP COLUMN "cookie_notice_title";
  ALTER TABLE "site_settings" DROP COLUMN "cookie_notice_policy_link_label";
  ALTER TABLE "site_settings" DROP COLUMN "cookie_notice_accept_label";
  ALTER TABLE "site_settings" DROP COLUMN "cookie_notice_reject_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_cookie_notice_title";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_cookie_notice_policy_link_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_cookie_notice_accept_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_cookie_notice_reject_label";
  DROP TYPE "public"."enum_navigation_primary_items_groups_items_kind";
  DROP TYPE "public"."enum_navigation_primary_items_groups_items_link_type";
  DROP TYPE "public"."enum_navigation_primary_items_groups_items_icon";
  DROP TYPE "public"."enum_navigation_primary_items_groups_items_accent";
  DROP TYPE "public"."enum_navigation_primary_items_groups_title_link_type";
  DROP TYPE "public"."enum_navigation_primary_items_groups_span";
  DROP TYPE "public"."enum_navigation_utility_items_icon";
  DROP TYPE "public"."enum__navigation_v_version_primary_items_groups_items_kind";
  DROP TYPE "public"."enum__navigation_v_version_primary_items_groups_items_link_type";
  DROP TYPE "public"."enum__navigation_v_version_primary_items_groups_items_icon";
  DROP TYPE "public"."enum__navigation_v_version_primary_items_groups_items_accent";
  DROP TYPE "public"."enum__navigation_v_version_primary_items_groups_title_link_type";
  DROP TYPE "public"."enum__navigation_v_version_primary_items_groups_span";
  DROP TYPE "public"."enum__navigation_v_version_utility_items_icon";
  DROP TYPE "public"."enum_footer_columns_links_icon";
  DROP TYPE "public"."enum_footer_columns_links_accent";
  DROP TYPE "public"."enum_footer_columns_title_link_type";
  DROP TYPE "public"."enum__footer_v_version_columns_links_icon";
  DROP TYPE "public"."enum__footer_v_version_columns_links_accent";
  DROP TYPE "public"."enum__footer_v_version_columns_title_link_type";`)
}
