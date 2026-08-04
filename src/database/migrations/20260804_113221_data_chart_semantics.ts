import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_data_chart_series_dimension" AS ENUM('executionType', 'hub');
  CREATE TYPE "public"."enum_pages_blocks_data_chart_display_interval" AS ENUM('month', 'quarter', 'year');
  CREATE TYPE "public"."enum__pages_v_blocks_data_chart_series_dimension" AS ENUM('executionType', 'hub');
  CREATE TYPE "public"."enum__pages_v_blocks_data_chart_display_interval" AS ENUM('month', 'quarter', 'year');
  CREATE TYPE "public"."enum_articles_blocks_data_chart_series_dimension" AS ENUM('executionType', 'hub');
  CREATE TYPE "public"."enum_articles_blocks_data_chart_display_interval" AS ENUM('month', 'quarter', 'year');
  CREATE TYPE "public"."enum__articles_v_blocks_data_chart_series_dimension" AS ENUM('executionType', 'hub');
  CREATE TYPE "public"."enum__articles_v_blocks_data_chart_display_interval" AS ENUM('month', 'quarter', 'year');
  CREATE TYPE "public"."enum_hubs_blocks_data_chart_series_dimension" AS ENUM('executionType', 'hub');
  CREATE TYPE "public"."enum_hubs_blocks_data_chart_display_interval" AS ENUM('month', 'quarter', 'year');
  CREATE TYPE "public"."enum__hubs_v_blocks_data_chart_series_dimension" AS ENUM('executionType', 'hub');
  CREATE TYPE "public"."enum__hubs_v_blocks_data_chart_display_interval" AS ENUM('month', 'quarter', 'year');
  CREATE TYPE "public"."enum_venues_blocks_data_chart_series_dimension" AS ENUM('executionType', 'hub');
  CREATE TYPE "public"."enum_venues_blocks_data_chart_display_interval" AS ENUM('month', 'quarter', 'year');
  CREATE TYPE "public"."enum__venues_v_blocks_data_chart_series_dimension" AS ENUM('executionType', 'hub');
  CREATE TYPE "public"."enum__venues_v_blocks_data_chart_display_interval" AS ENUM('month', 'quarter', 'year');
  CREATE TYPE "public"."enum_learning_videos_blocks_data_chart_series_dimension" AS ENUM('executionType', 'hub');
  CREATE TYPE "public"."enum_learning_videos_blocks_data_chart_display_interval" AS ENUM('month', 'quarter', 'year');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_data_chart_series_dimension" AS ENUM('executionType', 'hub');
  CREATE TYPE "public"."enum__learning_videos_v_blocks_data_chart_display_interval" AS ENUM('month', 'quarter', 'year');
  ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "series_dimension" "enum_pages_blocks_data_chart_series_dimension" DEFAULT 'executionType';
  ALTER TABLE "pages_blocks_data_chart" ADD COLUMN "display_interval" "enum_pages_blocks_data_chart_display_interval" DEFAULT 'quarter';
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "series_dimension" "enum__pages_v_blocks_data_chart_series_dimension" DEFAULT 'executionType';
  ALTER TABLE "_pages_v_blocks_data_chart" ADD COLUMN "display_interval" "enum__pages_v_blocks_data_chart_display_interval" DEFAULT 'quarter';
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "series_dimension" "enum_articles_blocks_data_chart_series_dimension" DEFAULT 'executionType';
  ALTER TABLE "articles_blocks_data_chart" ADD COLUMN "display_interval" "enum_articles_blocks_data_chart_display_interval" DEFAULT 'quarter';
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "series_dimension" "enum__articles_v_blocks_data_chart_series_dimension" DEFAULT 'executionType';
  ALTER TABLE "_articles_v_blocks_data_chart" ADD COLUMN "display_interval" "enum__articles_v_blocks_data_chart_display_interval" DEFAULT 'quarter';
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "series_dimension" "enum_hubs_blocks_data_chart_series_dimension" DEFAULT 'executionType';
  ALTER TABLE "hubs_blocks_data_chart" ADD COLUMN "display_interval" "enum_hubs_blocks_data_chart_display_interval" DEFAULT 'quarter';
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "series_dimension" "enum__hubs_v_blocks_data_chart_series_dimension" DEFAULT 'executionType';
  ALTER TABLE "_hubs_v_blocks_data_chart" ADD COLUMN "display_interval" "enum__hubs_v_blocks_data_chart_display_interval" DEFAULT 'quarter';
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "series_dimension" "enum_venues_blocks_data_chart_series_dimension" DEFAULT 'executionType';
  ALTER TABLE "venues_blocks_data_chart" ADD COLUMN "display_interval" "enum_venues_blocks_data_chart_display_interval" DEFAULT 'quarter';
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "series_dimension" "enum__venues_v_blocks_data_chart_series_dimension" DEFAULT 'executionType';
  ALTER TABLE "_venues_v_blocks_data_chart" ADD COLUMN "display_interval" "enum__venues_v_blocks_data_chart_display_interval" DEFAULT 'quarter';
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "series_dimension" "enum_learning_videos_blocks_data_chart_series_dimension" DEFAULT 'executionType';
  ALTER TABLE "learning_videos_blocks_data_chart" ADD COLUMN "display_interval" "enum_learning_videos_blocks_data_chart_display_interval" DEFAULT 'quarter';
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "series_dimension" "enum__learning_videos_v_blocks_data_chart_series_dimension" DEFAULT 'executionType';
  ALTER TABLE "_learning_videos_v_blocks_data_chart" ADD COLUMN "display_interval" "enum__learning_videos_v_blocks_data_chart_display_interval" DEFAULT 'quarter';

  DO $migration$
  DECLARE
    chart_table text;
  BEGIN
    FOREACH chart_table IN ARRAY ARRAY[
      'pages_blocks_data_chart',
      '_pages_v_blocks_data_chart',
      'articles_blocks_data_chart',
      '_articles_v_blocks_data_chart',
      'hubs_blocks_data_chart',
      '_hubs_v_blocks_data_chart',
      'venues_blocks_data_chart',
      '_venues_v_blocks_data_chart',
      'learning_videos_blocks_data_chart',
      '_learning_videos_v_blocks_data_chart'
    ]
    LOOP
      EXECUTE format(
        'UPDATE %I SET series_dimension = ''hub'' WHERE (data_type = ''volume'' AND chart_type = ''column'') OR (data_type = ''price'' AND chart_type = ''line'')',
        chart_table
      );
      EXECUTE format(
        'UPDATE %I SET display_interval = ''month'' WHERE title = ''Japan Power Market by Volume'' OR (data_type = ''price'' AND chart_type = ''line'')',
        chart_table
      );
      EXECUTE format(
        'UPDATE %I SET display_interval = ''year'' WHERE title = ''Power Volumes by Hub'' AND from_year = to_year AND from_quarter = 1 AND to_quarter = 4',
        chart_table
      );
    END LOOP;
  END
  $migration$;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "series_dimension";
  ALTER TABLE "pages_blocks_data_chart" DROP COLUMN "display_interval";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "series_dimension";
  ALTER TABLE "_pages_v_blocks_data_chart" DROP COLUMN "display_interval";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "series_dimension";
  ALTER TABLE "articles_blocks_data_chart" DROP COLUMN "display_interval";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "series_dimension";
  ALTER TABLE "_articles_v_blocks_data_chart" DROP COLUMN "display_interval";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "series_dimension";
  ALTER TABLE "hubs_blocks_data_chart" DROP COLUMN "display_interval";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "series_dimension";
  ALTER TABLE "_hubs_v_blocks_data_chart" DROP COLUMN "display_interval";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "series_dimension";
  ALTER TABLE "venues_blocks_data_chart" DROP COLUMN "display_interval";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "series_dimension";
  ALTER TABLE "_venues_v_blocks_data_chart" DROP COLUMN "display_interval";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "series_dimension";
  ALTER TABLE "learning_videos_blocks_data_chart" DROP COLUMN "display_interval";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "series_dimension";
  ALTER TABLE "_learning_videos_v_blocks_data_chart" DROP COLUMN "display_interval";
  DROP TYPE "public"."enum_pages_blocks_data_chart_series_dimension";
  DROP TYPE "public"."enum_pages_blocks_data_chart_display_interval";
  DROP TYPE "public"."enum__pages_v_blocks_data_chart_series_dimension";
  DROP TYPE "public"."enum__pages_v_blocks_data_chart_display_interval";
  DROP TYPE "public"."enum_articles_blocks_data_chart_series_dimension";
  DROP TYPE "public"."enum_articles_blocks_data_chart_display_interval";
  DROP TYPE "public"."enum__articles_v_blocks_data_chart_series_dimension";
  DROP TYPE "public"."enum__articles_v_blocks_data_chart_display_interval";
  DROP TYPE "public"."enum_hubs_blocks_data_chart_series_dimension";
  DROP TYPE "public"."enum_hubs_blocks_data_chart_display_interval";
  DROP TYPE "public"."enum__hubs_v_blocks_data_chart_series_dimension";
  DROP TYPE "public"."enum__hubs_v_blocks_data_chart_display_interval";
  DROP TYPE "public"."enum_venues_blocks_data_chart_series_dimension";
  DROP TYPE "public"."enum_venues_blocks_data_chart_display_interval";
  DROP TYPE "public"."enum__venues_v_blocks_data_chart_series_dimension";
  DROP TYPE "public"."enum__venues_v_blocks_data_chart_display_interval";
  DROP TYPE "public"."enum_learning_videos_blocks_data_chart_series_dimension";
  DROP TYPE "public"."enum_learning_videos_blocks_data_chart_display_interval";
  DROP TYPE "public"."enum__learning_videos_v_blocks_data_chart_series_dimension";
  DROP TYPE "public"."enum__learning_videos_v_blocks_data_chart_display_interval";`)
}
