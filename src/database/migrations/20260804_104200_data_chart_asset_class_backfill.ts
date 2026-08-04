import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
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
          $statement$
            UPDATE %I AS chart
            SET asset_class_id = asset_class.id
            FROM asset_classes AS asset_class
            WHERE chart.asset_class_id IS NULL
              AND chart.asset_class_legacy_id IS NOT NULL
              AND asset_class.legacy_source_source = 'wordpress'
              AND asset_class.legacy_source_legacy_id = chart.asset_class_legacy_id
          $statement$,
          chart_table
        );
      END LOOP;
    END
    $migration$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
          $statement$
            UPDATE %I AS chart
            SET asset_class_id = NULL
            FROM asset_classes AS asset_class
            WHERE chart.asset_class_id = asset_class.id
              AND asset_class.legacy_source_source = 'wordpress'
              AND asset_class.legacy_source_legacy_id = chart.asset_class_legacy_id
          $statement$,
          chart_table
        );
      END LOOP;
    END
    $migration$;
  `)
}
