import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "asset_class_id" integer;
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "asset_class_id" integer;
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "asset_class_id" integer;
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "asset_class_id" integer;
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "asset_class_id" integer;
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "asset_class_id" integer;
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "asset_class_id" integer;
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "asset_class_id" integer;
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "asset_class_id" integer;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "asset_class_id" integer;
  ALTER TABLE "pages_blocks_data_chart" ADD CONSTRAINT "pages_blocks_data_chart_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_data_chart" ADD CONSTRAINT "_pages_v_blocks_data_chart_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_data_chart" ADD CONSTRAINT "articles_blocks_data_chart_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_data_chart" ADD CONSTRAINT "_articles_v_blocks_data_chart_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hubs_blocks_data_chart" ADD CONSTRAINT "hubs_blocks_data_chart_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD CONSTRAINT "_hubs_v_blocks_data_chart_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_blocks_data_chart" ADD CONSTRAINT "venues_blocks_data_chart_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_venues_v_blocks_data_chart" ADD CONSTRAINT "_venues_v_blocks_data_chart_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "learning_videos_blocks_data_chart" ADD CONSTRAINT "learning_videos_blocks_data_chart_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD CONSTRAINT "_learning_videos_v_blocks_data_chart_asset_class_id_asset_classes_id_fk" FOREIGN KEY ("asset_class_id") REFERENCES "public"."asset_classes"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_data_chart_asset_class_idx" ON "pages_blocks_data_chart" USING btree ("asset_class_id");
  CREATE INDEX "_pages_v_blocks_data_chart_asset_class_idx" ON "_pages_v_blocks_data_chart" USING btree ("asset_class_id");
  CREATE INDEX "articles_blocks_data_chart_asset_class_idx" ON "articles_blocks_data_chart" USING btree ("asset_class_id");
  CREATE INDEX "_articles_v_blocks_data_chart_asset_class_idx" ON "_articles_v_blocks_data_chart" USING btree ("asset_class_id");
  CREATE INDEX "hubs_blocks_data_chart_asset_class_idx" ON "hubs_blocks_data_chart" USING btree ("asset_class_id");
  CREATE INDEX "_hubs_v_blocks_data_chart_asset_class_idx" ON "_hubs_v_blocks_data_chart" USING btree ("asset_class_id");
  CREATE INDEX "venues_blocks_data_chart_asset_class_idx" ON "venues_blocks_data_chart" USING btree ("asset_class_id");
  CREATE INDEX "_venues_v_blocks_data_chart_asset_class_idx" ON "_venues_v_blocks_data_chart" USING btree ("asset_class_id");
  CREATE INDEX "learning_videos_blocks_data_chart_asset_class_idx" ON "learning_videos_blocks_data_chart" USING btree ("asset_class_id");
  CREATE INDEX "_learning_videos_v_blocks_data_chart_asset_class_idx" ON "_learning_videos_v_blocks_data_chart" USING btree ("asset_class_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_data_chart" DROP CONSTRAINT "pages_blocks_data_chart_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "_pages_v_blocks_data_chart" DROP CONSTRAINT "_pages_v_blocks_data_chart_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "articles_blocks_data_chart" DROP CONSTRAINT "articles_blocks_data_chart_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "_articles_v_blocks_data_chart" DROP CONSTRAINT "_articles_v_blocks_data_chart_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "hubs_blocks_data_chart" DROP CONSTRAINT "hubs_blocks_data_chart_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP CONSTRAINT "_hubs_v_blocks_data_chart_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "venues_blocks_data_chart" DROP CONSTRAINT "venues_blocks_data_chart_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "_venues_v_blocks_data_chart" DROP CONSTRAINT "_venues_v_blocks_data_chart_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "learning_videos_blocks_data_chart" DROP CONSTRAINT "learning_videos_blocks_data_chart_asset_class_id_asset_classes_id_fk";
  
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP CONSTRAINT "_learning_videos_v_blocks_data_chart_asset_class_id_asset_classes_id_fk";
  
  DROP INDEX "pages_blocks_data_chart_asset_class_idx";
  DROP INDEX "_pages_v_blocks_data_chart_asset_class_idx";
  DROP INDEX "articles_blocks_data_chart_asset_class_idx";
  DROP INDEX "_articles_v_blocks_data_chart_asset_class_idx";
  DROP INDEX "hubs_blocks_data_chart_asset_class_idx";
  DROP INDEX "_hubs_v_blocks_data_chart_asset_class_idx";
  DROP INDEX "venues_blocks_data_chart_asset_class_idx";
  DROP INDEX "_venues_v_blocks_data_chart_asset_class_idx";
  DROP INDEX "learning_videos_blocks_data_chart_asset_class_idx";
  DROP INDEX "_learning_videos_v_blocks_data_chart_asset_class_idx";
  ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "asset_class_id";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "asset_class_id";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "asset_class_id";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "asset_class_id";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "asset_class_id";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "asset_class_id";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "asset_class_id";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "asset_class_id";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "asset_class_id";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "asset_class_id";`)
}
