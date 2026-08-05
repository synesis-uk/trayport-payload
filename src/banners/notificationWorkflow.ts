import { randomUUID } from 'node:crypto'

import { sql } from '@payloadcms/db-postgres'
import type { PayloadRequest, TaskConfig, Where } from 'payload'

import type { Banner, User } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const DEFAULT_CATCH_UP_HOURS = 6
const DEFAULT_MAX_ATTEMPTS = 3
const DEFAULT_RETRY_DELAY_MINUTES = 5
const DEFAULT_STALE_CLAIM_MINUTES = 30
const MAX_CATCH_UP_HOURS = 7 * 24
const MAX_DELIVERY_ATTEMPTS = 10
const MAX_RETRY_DELAY_MINUTES = 24 * 60
const MAX_STALE_CLAIM_MINUTES = 24 * 60

export const bannerNotificationQueue = 'banner-notifications'

export const bannerNotificationEvents = [
  {
    dateField: 'startAt',
    key: 'beforeStart',
    label: 'starts in 24 hours',
    offsetMilliseconds: -DAY_IN_MILLISECONDS,
  },
  {
    dateField: 'startAt',
    key: 'started',
    label: 'is now live',
    offsetMilliseconds: 0,
  },
  {
    dateField: 'endAt',
    key: 'beforeEnd',
    label: 'ends in 24 hours',
    offsetMilliseconds: -DAY_IN_MILLISECONDS,
  },
  {
    dateField: 'endAt',
    key: 'ended',
    label: 'is now offline',
    offsetMilliseconds: 0,
  },
] as const

export type BannerNotificationEvent = (typeof bannerNotificationEvents)[number]
export type BannerNotificationEventKey = BannerNotificationEvent['key']

type BannerSchedule = Pick<Banner, 'endAt' | 'startAt'>

type BannerNotificationDeliveryClaim = {
  attemptCount: number
  claimToken: string
  deliveryID: number
  recipientEmails: string[]
}

type ScheduledBannerNotificationEvent = {
  boundaryAt: string
  dueAt: string
  event: BannerNotificationEvent
}

export type BannerNotificationSweepResult = {
  attempted: number
  claimed: number
  disabled: boolean
  failed: number
  scanned: number
  sent: number
}

const instant = (value: unknown): number | null => {
  if (typeof value !== 'string' && !(value instanceof Date)) return null
  const milliseconds = new Date(value).getTime()
  return Number.isFinite(milliseconds) ? milliseconds : null
}

const boundedNumber = ({
  fallback,
  maximum,
  minimum,
  value,
}: {
  fallback: number
  maximum: number
  minimum: number
  value: string | undefined
}): number => {
  const configured = Number.parseFloat(value || '')
  return Number.isFinite(configured) ? Math.min(Math.max(configured, minimum), maximum) : fallback
}

const catchUpMilliseconds = (): number =>
  boundedNumber({
    fallback: DEFAULT_CATCH_UP_HOURS,
    maximum: MAX_CATCH_UP_HOURS,
    minimum: 0,
    value: process.env.BANNER_NOTIFICATION_CATCH_UP_HOURS,
  }) *
  60 *
  60 *
  1000

const maximumDeliveryAttempts = (): number =>
  Math.floor(
    boundedNumber({
      fallback: DEFAULT_MAX_ATTEMPTS,
      maximum: MAX_DELIVERY_ATTEMPTS,
      minimum: 1,
      value: process.env.BANNER_NOTIFICATION_MAX_ATTEMPTS,
    }),
  )

const retryDelayMilliseconds = (): number =>
  boundedNumber({
    fallback: DEFAULT_RETRY_DELAY_MINUTES,
    maximum: MAX_RETRY_DELAY_MINUTES,
    minimum: 0,
    value: process.env.BANNER_NOTIFICATION_RETRY_DELAY_MINUTES,
  }) *
  60 *
  1000

const staleClaimMilliseconds = (): number =>
  boundedNumber({
    fallback: DEFAULT_STALE_CLAIM_MINUTES,
    maximum: MAX_STALE_CLAIM_MINUTES,
    minimum: 1,
    value: process.env.BANNER_NOTIFICATION_STALE_CLAIM_MINUTES,
  }) *
  60 *
  1000

const scheduleForEvent = (
  banner: BannerSchedule,
  event: BannerNotificationEvent,
): ScheduledBannerNotificationEvent | null => {
  const boundaryMilliseconds = instant(banner[event.dateField])
  if (boundaryMilliseconds === null) return null

  return {
    boundaryAt: new Date(boundaryMilliseconds).toISOString(),
    dueAt: new Date(boundaryMilliseconds + event.offsetMilliseconds).toISOString(),
    event,
  }
}

export const dueBannerNotificationEvents = ({
  banner,
  catchUpWindowMilliseconds = catchUpMilliseconds(),
  now = new Date(),
}: {
  banner: BannerSchedule
  catchUpWindowMilliseconds?: number
  now?: Date
}): BannerNotificationEvent[] => {
  const nowMilliseconds = now.getTime()
  if (!Number.isFinite(nowMilliseconds)) return []

  return bannerNotificationEvents
    .map((event) => scheduleForEvent(banner, event))
    .filter(
      (scheduled): scheduled is ScheduledBannerNotificationEvent =>
        scheduled !== null &&
        new Date(scheduled.dueAt).getTime() <= nowMilliseconds &&
        nowMilliseconds - new Date(scheduled.dueAt).getTime() <= catchUpWindowMilliseconds,
    )
    .sort((left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime())
    .map(({ event }) => event)
}

const candidateWhere = ({
  catchUpWindowMilliseconds,
  now,
}: {
  catchUpWindowMilliseconds: number
  now: Date
}): Where => {
  const earliestBoundary = new Date(now.getTime() - catchUpWindowMilliseconds).toISOString()
  const latestBoundary = new Date(now.getTime() + DAY_IN_MILLISECONDS).toISOString()

  return {
    and: [
      { _status: { equals: 'published' } },
      { notifyUsers: { exists: true } },
      {
        or: [
          {
            and: [
              { startAt: { greater_than_equal: earliestBoundary } },
              { startAt: { less_than_equal: latestBoundary } },
            ],
          },
          {
            and: [
              { endAt: { greater_than_equal: earliestBoundary } },
              { endAt: { less_than_equal: latestBoundary } },
            ],
          },
        ],
      },
    ],
  }
}

const userEmail = (value: number | User): string | null =>
  typeof value === 'object' && typeof value.email === 'string' && value.email.trim()
    ? value.email.trim()
    : null

const recipientEmails = (banner: Banner): string[] => [
  ...new Set((banner.notifyUsers || []).map(userEmail).filter((email): email is string => !!email)),
]

const eventBoundary = (banner: BannerSchedule, event: BannerNotificationEvent): string =>
  new Date(banner[event.dateField]).toISOString()

const notificationText = ({
  banner,
  event,
}: {
  banner: Banner
  event: BannerNotificationEvent
}): string => {
  const adminURL = `${getServerSideURL()}/admin/collections/banners/${banner.id}`
  const boundaryLabel = event.dateField === 'startAt' ? 'Start' : 'End'

  return [
    `Banner “${banner.title}” ${event.label}.`,
    '',
    `${boundaryLabel}: ${eventBoundary(banner, event)}`,
    `Review: ${adminURL}`,
  ].join('\n')
}

/**
 * Atomically acquires a delivery lease. The INSERT source rechecks the live
 * banner row so an unpublished or rescheduled banner cannot be claimed from a
 * stale sweep result. The unique schedule key survives Payload version restores.
 */
export const claimBannerNotificationDelivery = async ({
  banner,
  event,
  now,
  req,
}: {
  banner: Banner
  event: BannerNotificationEvent
  now: Date
  req: PayloadRequest
}): Promise<BannerNotificationDeliveryClaim | null> => {
  const scheduled = scheduleForEvent(banner, event)
  if (!scheduled) return null

  const claimedAt = now.toISOString()
  const claimToken = randomUUID()
  const retryBefore = new Date(now.getTime() - retryDelayMilliseconds()).toISOString()
  const staleBefore = new Date(now.getTime() - staleClaimMilliseconds()).toISOString()
  const maxAttempts = maximumDeliveryAttempts()
  const boundaryPredicate =
    event.dateField === 'startAt'
      ? sql`"banner"."start_at" = CAST(${scheduled.boundaryAt} AS timestamp with time zone)`
      : sql`"banner"."end_at" = CAST(${scheduled.boundaryAt} AS timestamp with time zone)`

  const claimed = await req.payload.db.drizzle.execute(sql`
    WITH "claimed_delivery" AS (
      INSERT INTO "app"."banner_notification_deliveries" AS "delivery" (
        "banner_id",
        "event_key",
        "scheduled_at",
        "state",
        "attempt_count",
        "claim_token",
        "claimed_at",
        "created_at",
        "updated_at"
      )
      SELECT
        "banner"."id",
        CAST(${event.key} AS "app"."enum_banner_notification_delivery_event"),
        CAST(${scheduled.dueAt} AS timestamp with time zone),
        'sending',
        1,
        CAST(${claimToken} AS uuid),
        CAST(${claimedAt} AS timestamp with time zone),
        CAST(${claimedAt} AS timestamp with time zone),
        CAST(${claimedAt} AS timestamp with time zone)
      FROM "banners" AS "banner"
      WHERE "banner"."id" = ${banner.id}
        AND "banner"."_status" = 'published'
        AND ${boundaryPredicate}
        AND EXISTS (
          SELECT 1
          FROM "banners_rels" AS "recipient_relation"
          INNER JOIN "users" AS "recipient"
            ON "recipient"."id" = "recipient_relation"."users_id"
          WHERE "recipient_relation"."parent_id" = "banner"."id"
            AND "recipient_relation"."path" = 'notifyUsers'
            AND btrim("recipient"."email") <> ''
        )
      ON CONFLICT ("banner_id", "event_key", "scheduled_at") DO UPDATE
      SET
        "state" = 'sending',
        "attempt_count" = "delivery"."attempt_count" + 1,
        "claim_token" = EXCLUDED."claim_token",
        "claimed_at" = EXCLUDED."claimed_at",
        "failed_at" = NULL,
        "last_error" = NULL,
        "updated_at" = EXCLUDED."updated_at"
      WHERE "delivery"."attempt_count" < ${maxAttempts}
        AND (
          (
            "delivery"."state" = 'failed'
            AND "delivery"."updated_at" <= CAST(${retryBefore} AS timestamp with time zone)
          )
          OR (
            "delivery"."state" = 'sending'
            AND "delivery"."claimed_at" <= CAST(${staleBefore} AS timestamp with time zone)
          )
        )
      RETURNING "id", "attempt_count", "banner_id"
    )
    SELECT
      "claimed_delivery"."id",
      "claimed_delivery"."attempt_count",
      ARRAY(
        SELECT lower(btrim("recipient"."email"))
        FROM "banners_rels" AS "recipient_relation"
        INNER JOIN "users" AS "recipient"
          ON "recipient"."id" = "recipient_relation"."users_id"
        WHERE "recipient_relation"."parent_id" = "claimed_delivery"."banner_id"
          AND "recipient_relation"."path" = 'notifyUsers'
          AND btrim("recipient"."email") <> ''
        ORDER BY "recipient_relation"."order", "recipient"."id"
      ) AS "recipient_emails"
    FROM "claimed_delivery"
  `)

  const row = claimed.rows[0] as
    | {
        attempt_count?: number | string
        id?: number | string
        recipient_emails?: unknown
      }
    | undefined
  const deliveryID = Number(row?.id)
  const currentRecipients = Array.isArray(row?.recipient_emails)
    ? row.recipient_emails.filter(
        (email): email is string => typeof email === 'string' && email.length > 0,
      )
    : []
  if (!row || !Number.isSafeInteger(deliveryID) || !currentRecipients.length) return null

  return {
    attemptCount: Number(row.attempt_count || 1),
    claimToken,
    deliveryID,
    recipientEmails: currentRecipients,
  }
}

const markDeliverySent = async ({
  claim,
  req,
  timestamp,
}: {
  claim: BannerNotificationDeliveryClaim
  req: PayloadRequest
  timestamp: string
}): Promise<boolean> => {
  const updated = await req.payload.db.drizzle.execute(sql`
    UPDATE "app"."banner_notification_deliveries"
    SET
      "state" = 'sent',
      "claim_token" = NULL,
      "sent_at" = CAST(${timestamp} AS timestamp with time zone),
      "failed_at" = NULL,
      "last_error" = NULL,
      "updated_at" = CAST(${timestamp} AS timestamp with time zone)
    WHERE "id" = ${claim.deliveryID}
      AND "state" = 'sending'
      AND "claim_token" = CAST(${claim.claimToken} AS uuid)
    RETURNING "id"
  `)

  return updated.rows.length > 0
}

const deliveryErrorMessage = (error: unknown): string =>
  (error instanceof Error ? error.message : String(error)).slice(0, 4_000)

const markDeliveryFailed = async ({
  claim,
  error,
  req,
  timestamp,
}: {
  claim: BannerNotificationDeliveryClaim
  error: unknown
  req: PayloadRequest
  timestamp: string
}): Promise<boolean> => {
  const updated = await req.payload.db.drizzle.execute(sql`
    UPDATE "app"."banner_notification_deliveries"
    SET
      "state" = 'failed',
      "claim_token" = NULL,
      "failed_at" = CAST(${timestamp} AS timestamp with time zone),
      "last_error" = ${deliveryErrorMessage(error)},
      "updated_at" = CAST(${timestamp} AS timestamp with time zone)
    WHERE "id" = ${claim.deliveryID}
      AND "state" = 'sending'
      AND "claim_token" = CAST(${claim.claimToken} AS uuid)
    RETURNING "id"
  `)

  return updated.rows.length > 0
}

export const processBannerNotifications = async ({
  now = new Date(),
  req,
}: {
  now?: Date
  req: PayloadRequest
}): Promise<BannerNotificationSweepResult> => {
  const result: BannerNotificationSweepResult = {
    attempted: 0,
    claimed: 0,
    disabled: !process.env.SMTP_HOST,
    failed: 0,
    scanned: 0,
    sent: 0,
  }

  if (result.disabled) {
    req.payload.logger.info(
      'Banner notification sweep skipped because SMTP_HOST is not configured.',
    )
    return result
  }

  const catchUpWindowMilliseconds = catchUpMilliseconds()
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const banners = await req.payload.find({
      collection: 'banners',
      depth: 1,
      draft: false,
      limit: 100,
      overrideAccess: true,
      page,
      pagination: true,
      sort: 'id',
      where: candidateWhere({ catchUpWindowMilliseconds, now }),
    })

    for (const banner of banners.docs) {
      result.scanned += 1
      const recipients = recipientEmails(banner)
      if (!recipients.length) continue

      const events = dueBannerNotificationEvents({
        banner,
        catchUpWindowMilliseconds,
        now,
      })

      for (const event of events) {
        result.attempted += 1
        const claim = await claimBannerNotificationDelivery({ banner, event, now, req })
        if (!claim) continue
        result.claimed += 1

        try {
          await req.payload.sendEmail({
            subject: `[Trayport website] Banner ${event.label}: ${banner.title}`,
            text: notificationText({ banner, event }),
            to: claim.recipientEmails,
          })
        } catch (error) {
          result.failed += 1
          try {
            const recorded = await markDeliveryFailed({
              claim,
              error,
              req,
              timestamp: new Date().toISOString(),
            })
            if (!recorded) {
              req.payload.logger.error({
                bannerID: banner.id,
                deliveryID: claim.deliveryID,
                event: event.key,
                msg: 'A failed banner notification no longer held its delivery lease.',
              })
            }
          } catch (ledgerError) {
            req.payload.logger.error({
              bannerID: banner.id,
              deliveryID: claim.deliveryID,
              err: ledgerError,
              event: event.key,
              msg: 'A failed banner notification could not be recorded in the delivery ledger.',
            })
          }
          req.payload.logger.error({
            attempt: claim.attemptCount,
            bannerID: banner.id,
            deliveryID: claim.deliveryID,
            err: error,
            event: event.key,
            msg: 'A claimed banner notification could not be handed to SMTP.',
          })
          continue
        }

        const recorded = await markDeliverySent({
          claim,
          req,
          timestamp: new Date().toISOString(),
        })
        result.sent += 1
        if (!recorded) {
          req.payload.logger.error({
            bannerID: banner.id,
            deliveryID: claim.deliveryID,
            event: event.key,
            msg: 'SMTP accepted a banner notification, but its delivery lease was no longer current.',
          })
        }
      }
    }

    hasNextPage = banners.hasNextPage
    page += 1
  }

  return result
}

const outputNumberField = (name: keyof Omit<BannerNotificationSweepResult, 'disabled'>) => ({
  name,
  type: 'number' as const,
  required: true,
})

export const processBannerNotificationsTask: TaskConfig<'processBannerNotifications'> = {
  concurrency: {
    exclusive: true,
    key: () => 'banner-notification-sweep',
    supersedes: true,
  },
  handler: async ({ req }) => ({
    output: await processBannerNotifications({ req }),
  }),
  inputSchema: [],
  label: 'Process scheduled banner notifications',
  outputSchema: [
    outputNumberField('attempted'),
    outputNumberField('claimed'),
    { name: 'disabled', type: 'checkbox', required: true },
    outputNumberField('failed'),
    outputNumberField('scanned'),
    outputNumberField('sent'),
  ],
  retries: {
    attempts: 3,
    backoff: { delay: 5_000, type: 'exponential' },
  },
  schedule: [{ cron: '0 */5 * * * *', queue: bannerNotificationQueue }],
  slug: 'processBannerNotifications',
}
