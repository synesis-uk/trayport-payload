import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "app"."enum_banner_notification_delivery_event" AS ENUM(
    'beforeStart',
    'started',
    'beforeEnd',
    'ended'
  );
  CREATE TYPE "app"."enum_banner_notification_delivery_state" AS ENUM(
    'sending',
    'sent',
    'failed'
  );
  CREATE TABLE "app"."banner_notification_deliveries" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "banner_id" integer NOT NULL,
    "event_key" "app"."enum_banner_notification_delivery_event" NOT NULL,
    "scheduled_at" timestamp(3) with time zone NOT NULL,
    "state" "app"."enum_banner_notification_delivery_state" DEFAULT 'sending' NOT NULL,
    "attempt_count" integer DEFAULT 1 NOT NULL,
    "claim_token" uuid,
    "claimed_at" timestamp(3) with time zone NOT NULL,
    "sent_at" timestamp(3) with time zone,
    "failed_at" timestamp(3) with time zone,
    "last_error" text,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "banner_notification_deliveries_attempt_count_check" CHECK ("attempt_count" > 0),
    CONSTRAINT "banner_notification_deliveries_banner_id_fk" FOREIGN KEY ("banner_id")
      REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "banner_notification_deliveries_schedule_unique" UNIQUE (
      "banner_id",
      "event_key",
      "scheduled_at"
    )
  );
  COMMENT ON TABLE "app"."banner_notification_deliveries" IS
    'Non-versioned delivery history retained independently of banner version restores.';
  CREATE INDEX "banner_notification_deliveries_retry_idx"
    ON "app"."banner_notification_deliveries" USING btree (
      "state",
      "updated_at",
      "attempt_count"
    );
  CREATE INDEX "banner_notification_deliveries_banner_idx"
    ON "app"."banner_notification_deliveries" USING btree ("banner_id");

  INSERT INTO "app"."banner_notification_deliveries" (
    "banner_id", "event_key", "scheduled_at", "state", "attempt_count",
    "claimed_at", "sent_at", "created_at", "updated_at"
  )
  SELECT
    "id", 'beforeStart', "start_at" - interval '1 day', 'sent', 1,
    "notification_state_before_start_sent_at", "notification_state_before_start_sent_at",
    "notification_state_before_start_sent_at", "notification_state_before_start_sent_at"
  FROM "banners"
  WHERE "notification_state_before_start_sent_at" IS NOT NULL
    AND "start_at" IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO "app"."banner_notification_deliveries" (
    "banner_id", "event_key", "scheduled_at", "state", "attempt_count",
    "claimed_at", "sent_at", "created_at", "updated_at"
  )
  SELECT
    "id", 'started', "start_at", 'sent', 1,
    "notification_state_started_sent_at", "notification_state_started_sent_at",
    "notification_state_started_sent_at", "notification_state_started_sent_at"
  FROM "banners"
  WHERE "notification_state_started_sent_at" IS NOT NULL
    AND "start_at" IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO "app"."banner_notification_deliveries" (
    "banner_id", "event_key", "scheduled_at", "state", "attempt_count",
    "claimed_at", "sent_at", "created_at", "updated_at"
  )
  SELECT
    "id", 'beforeEnd', "end_at" - interval '1 day', 'sent', 1,
    "notification_state_before_end_sent_at", "notification_state_before_end_sent_at",
    "notification_state_before_end_sent_at", "notification_state_before_end_sent_at"
  FROM "banners"
  WHERE "notification_state_before_end_sent_at" IS NOT NULL
    AND "end_at" IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO "app"."banner_notification_deliveries" (
    "banner_id", "event_key", "scheduled_at", "state", "attempt_count",
    "claimed_at", "sent_at", "created_at", "updated_at"
  )
  SELECT
    "id", 'ended', "end_at", 'sent', 1,
    "notification_state_ended_sent_at", "notification_state_ended_sent_at",
    "notification_state_ended_sent_at", "notification_state_ended_sent_at"
  FROM "banners"
  WHERE "notification_state_ended_sent_at" IS NOT NULL
    AND "end_at" IS NOT NULL
  ON CONFLICT DO NOTHING;

  ALTER TABLE "banners" DROP COLUMN "notification_state_before_start_sent_at";
  ALTER TABLE "banners" DROP COLUMN "notification_state_started_sent_at";
  ALTER TABLE "banners" DROP COLUMN "notification_state_before_end_sent_at";
  ALTER TABLE "banners" DROP COLUMN "notification_state_ended_sent_at";
  ALTER TABLE "_banners_v" DROP COLUMN "version_notification_state_before_start_sent_at";
  ALTER TABLE "_banners_v" DROP COLUMN "version_notification_state_started_sent_at";
  ALTER TABLE "_banners_v" DROP COLUMN "version_notification_state_before_end_sent_at";
  ALTER TABLE "_banners_v" DROP COLUMN "version_notification_state_ended_sent_at";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DO $migration$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM "app"."banner_notification_deliveries" AS "delivery"
      INNER JOIN "banners" AS "banner" ON "banner"."id" = "delivery"."banner_id"
      WHERE "delivery"."state" <> 'sent'
         OR "delivery"."sent_at" IS NULL
         OR (
           ("delivery"."event_key" = 'beforeStart'
             AND "delivery"."scheduled_at" = "banner"."start_at" - interval '1 day')
           OR ("delivery"."event_key" = 'started'
             AND "delivery"."scheduled_at" = "banner"."start_at")
           OR ("delivery"."event_key" = 'beforeEnd'
             AND "delivery"."scheduled_at" = "banner"."end_at" - interval '1 day')
           OR ("delivery"."event_key" = 'ended'
             AND "delivery"."scheduled_at" = "banner"."end_at")
         ) IS NOT TRUE
    ) THEN
      RAISE EXCEPTION
        'Cannot roll back the banner notification ledger while non-sent or historical-schedule deliveries exist.'
        USING HINT =
          'Resolve and explicitly archive non-representable delivery history before retrying rollback.';
    END IF;
  END
  $migration$;

  ALTER TABLE "banners" ADD COLUMN "notification_state_before_start_sent_at" timestamp(3) with time zone;
  ALTER TABLE "banners" ADD COLUMN "notification_state_started_sent_at" timestamp(3) with time zone;
  ALTER TABLE "banners" ADD COLUMN "notification_state_before_end_sent_at" timestamp(3) with time zone;
  ALTER TABLE "banners" ADD COLUMN "notification_state_ended_sent_at" timestamp(3) with time zone;
  ALTER TABLE "_banners_v" ADD COLUMN "version_notification_state_before_start_sent_at" timestamp(3) with time zone;
  ALTER TABLE "_banners_v" ADD COLUMN "version_notification_state_started_sent_at" timestamp(3) with time zone;
  ALTER TABLE "_banners_v" ADD COLUMN "version_notification_state_before_end_sent_at" timestamp(3) with time zone;
  ALTER TABLE "_banners_v" ADD COLUMN "version_notification_state_ended_sent_at" timestamp(3) with time zone;

  UPDATE "banners" AS "banner"
  SET "notification_state_before_start_sent_at" = "delivery"."sent_at"
  FROM "app"."banner_notification_deliveries" AS "delivery"
  WHERE "delivery"."banner_id" = "banner"."id"
    AND "delivery"."event_key" = 'beforeStart'
    AND "delivery"."state" = 'sent'
    AND "delivery"."scheduled_at" = "banner"."start_at" - interval '1 day';

  UPDATE "banners" AS "banner"
  SET "notification_state_started_sent_at" = "delivery"."sent_at"
  FROM "app"."banner_notification_deliveries" AS "delivery"
  WHERE "delivery"."banner_id" = "banner"."id"
    AND "delivery"."event_key" = 'started'
    AND "delivery"."state" = 'sent'
    AND "delivery"."scheduled_at" = "banner"."start_at";

  UPDATE "banners" AS "banner"
  SET "notification_state_before_end_sent_at" = "delivery"."sent_at"
  FROM "app"."banner_notification_deliveries" AS "delivery"
  WHERE "delivery"."banner_id" = "banner"."id"
    AND "delivery"."event_key" = 'beforeEnd'
    AND "delivery"."state" = 'sent'
    AND "delivery"."scheduled_at" = "banner"."end_at" - interval '1 day';

  UPDATE "banners" AS "banner"
  SET "notification_state_ended_sent_at" = "delivery"."sent_at"
  FROM "app"."banner_notification_deliveries" AS "delivery"
  WHERE "delivery"."banner_id" = "banner"."id"
    AND "delivery"."event_key" = 'ended'
    AND "delivery"."state" = 'sent'
    AND "delivery"."scheduled_at" = "banner"."end_at";

  DROP TABLE "app"."banner_notification_deliveries";
  DROP TYPE "app"."enum_banner_notification_delivery_state";
  DROP TYPE "app"."enum_banner_notification_delivery_event";`)
}
