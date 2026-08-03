import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $migration$
  DECLARE
    table_name text;
  BEGIN
    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_feature_list_items',
      '_pages_v_blocks_feature_list_items',
      'articles_blocks_feature_list_items',
      '_articles_v_blocks_feature_list_items',
      'hubs_blocks_feature_list_items',
      '_hubs_v_blocks_feature_list_items',
      'venues_blocks_feature_list_items',
      '_venues_v_blocks_feature_list_items',
      'learning_videos_blocks_feature_list_items',
      '_learning_videos_v_blocks_feature_list_items'
    ]
    LOOP
      EXECUTE format(
        'UPDATE %I SET link_type = NULL, link_new_tab = NULL, link_label = NULL WHERE link_type = ''reference'' AND NULLIF(BTRIM(link_url), '''') IS NULL',
        table_name
      );
    END LOOP;

    FOREACH table_name IN ARRAY ARRAY[
      'pages_blocks_entity_list_items',
      '_pages_v_blocks_entity_list_items',
      'articles_blocks_entity_list_items',
      '_articles_v_blocks_entity_list_items',
      'hubs_blocks_entity_list_items',
      '_hubs_v_blocks_entity_list_items',
      'venues_blocks_entity_list_items',
      '_venues_v_blocks_entity_list_items',
      'learning_videos_blocks_entity_list_items',
      '_learning_videos_v_blocks_entity_list_items'
    ]
    LOOP
      EXECUTE format(
        'UPDATE %I SET link_type = NULL, link_new_tab = NULL WHERE link_type = ''reference'' AND NULLIF(BTRIM(link_url), '''') IS NULL',
        table_name
      );
    END LOOP;
  END
  $migration$;

  ALTER TABLE "pages_blocks_feature_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "pages_blocks_feature_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "pages_blocks_entity_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "pages_blocks_entity_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_feature_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_feature_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_entity_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_entity_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "articles_blocks_feature_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "articles_blocks_feature_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "articles_blocks_entity_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "articles_blocks_entity_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "_articles_v_blocks_feature_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "_articles_v_blocks_feature_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "_articles_v_blocks_entity_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "_articles_v_blocks_entity_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "hubs_blocks_feature_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "hubs_blocks_feature_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "hubs_blocks_entity_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "hubs_blocks_entity_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "_hubs_v_blocks_entity_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "_hubs_v_blocks_entity_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "venues_blocks_feature_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "venues_blocks_feature_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "venues_blocks_entity_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "venues_blocks_entity_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "_venues_v_blocks_feature_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "_venues_v_blocks_feature_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "_venues_v_blocks_entity_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "_venues_v_blocks_entity_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "learning_videos_blocks_feature_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "learning_videos_blocks_feature_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "learning_videos_blocks_entity_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "learning_videos_blocks_entity_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" ALTER COLUMN "link_type" DROP DEFAULT;
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" ALTER COLUMN "link_new_tab" DROP DEFAULT;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_feature_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "pages_blocks_feature_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "pages_blocks_entity_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "pages_blocks_entity_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "_pages_v_blocks_feature_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "_pages_v_blocks_feature_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "_pages_v_blocks_entity_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "_pages_v_blocks_entity_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "articles_blocks_feature_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "articles_blocks_feature_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "articles_blocks_entity_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "articles_blocks_entity_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "_articles_v_blocks_feature_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "_articles_v_blocks_feature_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "_articles_v_blocks_entity_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "_articles_v_blocks_entity_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "hubs_blocks_feature_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "hubs_blocks_feature_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "hubs_blocks_entity_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "hubs_blocks_entity_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "_hubs_v_blocks_feature_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "_hubs_v_blocks_entity_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "_hubs_v_blocks_entity_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "venues_blocks_feature_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "venues_blocks_feature_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "venues_blocks_entity_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "venues_blocks_entity_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "_venues_v_blocks_feature_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "_venues_v_blocks_feature_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "_venues_v_blocks_entity_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "_venues_v_blocks_entity_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "learning_videos_blocks_feature_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "learning_videos_blocks_feature_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "learning_videos_blocks_entity_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "learning_videos_blocks_entity_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "_learning_videos_v_blocks_feature_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" ALTER COLUMN "link_type" SET DEFAULT 'reference';
  ALTER TABLE "_learning_videos_v_blocks_entity_list_items" ALTER COLUMN "link_new_tab" SET DEFAULT false;`)
}
