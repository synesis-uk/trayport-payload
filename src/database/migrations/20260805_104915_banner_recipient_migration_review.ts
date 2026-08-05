import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "banners_migrated_recipient_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar
  );
  
  CREATE TABLE "_banners_v_version_migrated_recipient_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "banners_migrated_recipient_emails" ADD CONSTRAINT "banners_migrated_recipient_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_banners_v_version_migrated_recipient_emails" ADD CONSTRAINT "_banners_v_version_migrated_recipient_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_banners_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "banners_migrated_recipient_emails_order_idx" ON "banners_migrated_recipient_emails" USING btree ("_order");
  CREATE INDEX "banners_migrated_recipient_emails_parent_id_idx" ON "banners_migrated_recipient_emails" USING btree ("_parent_id");
  CREATE INDEX "_banners_v_version_migrated_recipient_emails_order_idx" ON "_banners_v_version_migrated_recipient_emails" USING btree ("_order");
  CREATE INDEX "_banners_v_version_migrated_recipient_emails_parent_id_idx" ON "_banners_v_version_migrated_recipient_emails" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "banners_migrated_recipient_emails" CASCADE;
  DROP TABLE "_banners_v_version_migrated_recipient_emails" CASCADE;`)
}
