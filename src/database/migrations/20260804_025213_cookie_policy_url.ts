import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "cookie_notice_policy_u_r_l" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_cookie_notice_policy_u_r_l" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "cookie_notice_policy_u_r_l";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_cookie_notice_policy_u_r_l";`)
}
