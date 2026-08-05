// @vitest-environment node

import { sql } from '@payloadcms/db-postgres'
import config from '@/payload.config'
import {
  bannerNotificationEvents,
  claimBannerNotificationDelivery,
  processBannerNotifications,
} from '@/banners/notificationWorkflow'
import type { Banner } from '@/payload-types'
import { getPayload, type Payload, type PayloadRequest } from 'payload'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

let payload: Payload
let editorID: number
const bannerIDs: number[] = []
const originalEnvironment = {
  maxAttempts: process.env.BANNER_NOTIFICATION_MAX_ATTEMPTS,
  retryDelay: process.env.BANNER_NOTIFICATION_RETRY_DELAY_MINUTES,
  smtpHost: process.env.SMTP_HOST,
  staleClaim: process.env.BANNER_NOTIFICATION_STALE_CLAIM_MINUTES,
}

const restoreEnvironment = (name: string, value: string | undefined): void => {
  if (value === undefined) delete process.env[name]
  else process.env[name] = value
}

const createBanner = async ({
  endAt,
  startAt,
}: {
  endAt: Date
  startAt: Date
}): Promise<Banner> => {
  const banner = await payload.create({
    collection: 'banners',
    data: {
      _status: 'published',
      dismissible: true,
      endAt: endAt.toISOString(),
      headline: 'Delivery ledger integration test',
      layout: 'small',
      link: {
        label: 'Read more',
        type: 'custom',
        url: '/delivery-ledger-test/',
      },
      migratedRecipientEmails: [{ email: 'legacy-recipient@example.test' }],
      notifyUsers: [editorID],
      position: 'first',
      priority: 0,
      startAt: startAt.toISOString(),
      targetMode: 'all',
      title: `Delivery ledger ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tone: 'deep',
    },
    draft: false,
    overrideAccess: true,
  })

  bannerIDs.push(banner.id)
  return payload.findByID({
    collection: 'banners',
    depth: 1,
    id: banner.id,
    overrideAccess: true,
  })
}

const requestFixture = ({
  banner,
  sendEmail,
}: {
  banner: Banner
  sendEmail: ReturnType<typeof vi.fn>
}): PayloadRequest =>
  ({
    payload: {
      db: payload.db,
      find: vi.fn().mockResolvedValue({ docs: [banner], hasNextPage: false }),
      logger: { error: vi.fn(), info: vi.fn() },
      sendEmail,
    },
  }) as unknown as PayloadRequest

beforeAll(async () => {
  payload = await getPayload({ config })
  const editor = await payload.create({
    collection: 'users',
    data: {
      email: `banner-ledger-${Date.now()}@example.test`,
      password: 'banner-ledger-integration-test',
      roles: ['editor'],
    },
    overrideAccess: true,
  })
  editorID = editor.id
})

afterEach(() => {
  restoreEnvironment('SMTP_HOST', originalEnvironment.smtpHost)
  restoreEnvironment('BANNER_NOTIFICATION_MAX_ATTEMPTS', originalEnvironment.maxAttempts)
  restoreEnvironment('BANNER_NOTIFICATION_RETRY_DELAY_MINUTES', originalEnvironment.retryDelay)
  restoreEnvironment('BANNER_NOTIFICATION_STALE_CLAIM_MINUTES', originalEnvironment.staleClaim)
  vi.restoreAllMocks()
})

afterAll(async () => {
  for (const id of bannerIDs.reverse()) {
    await payload.delete({ collection: 'banners', id, overrideAccess: true })
  }
  if (editorID) {
    await payload.delete({ collection: 'users', id: editorID, overrideAccess: true })
  }
})

describe.sequential('banner notification delivery ledger', () => {
  it('keeps the banner collection private while allowing CMS recipient review', async () => {
    const now = new Date()
    const banner = await createBanner({
      endAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      startAt: now,
    })

    await expect(
      payload.findByID({
        collection: 'banners',
        depth: 1,
        id: banner.id,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    const cms = await payload.findByID({
      collection: 'banners',
      depth: 1,
      id: banner.id,
      overrideAccess: false,
      user: { id: editorID, roles: ['editor'] },
    })

    expect(cms.notifyUsers).toHaveLength(1)
    expect(cms.migratedRecipientEmails).toEqual([
      expect.objectContaining({ email: 'legacy-recipient@example.test' }),
    ])
  })

  it('atomically sends once and does not resend when the same schedule is restored', async () => {
    process.env.SMTP_HOST = 'mail.example.test'
    const now = new Date()
    const banner = await createBanner({
      endAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      startAt: now,
    })
    const sendEmail = vi.fn().mockResolvedValue(undefined)
    const req = requestFixture({ banner, sendEmail })

    const sweeps = await Promise.all([
      processBannerNotifications({ now, req }),
      processBannerNotifications({ now, req }),
    ])

    expect(sweeps.reduce((total, result) => total + result.claimed, 0)).toBe(1)
    expect(sendEmail).toHaveBeenCalledTimes(1)

    const temporaryStart = new Date(now.getTime() + 60 * 60 * 1000).toISOString()
    await payload.update({
      collection: 'banners',
      data: { _status: 'published', startAt: temporaryStart },
      draft: false,
      id: banner.id,
      overrideAccess: true,
    })
    const restored = await payload.update({
      collection: 'banners',
      data: { _status: 'published', startAt: banner.startAt },
      depth: 1,
      draft: false,
      id: banner.id,
      overrideAccess: true,
    })
    const restoredReq = requestFixture({ banner: restored, sendEmail })

    await expect(
      processBannerNotifications({ now: new Date(now.getTime() + 1_000), req: restoredReq }),
    ).resolves.toMatchObject({ claimed: 0, sent: 0 })
    expect(sendEmail).toHaveBeenCalledTimes(1)

    const deliveries = await payload.db.drizzle.execute(sql`
      SELECT "attempt_count", "event_key", "state"
      FROM "app"."banner_notification_deliveries"
      WHERE "banner_id" = ${banner.id}
    `)
    expect(deliveries.rows).toEqual([
      expect.objectContaining({ attempt_count: 1, event_key: 'started', state: 'sent' }),
    ])
  })

  it('rejects a stale scan after the published boundary changes', async () => {
    const now = new Date()
    const originalEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const banner = await createBanner({ endAt: originalEnd, startAt: now })
    await payload.update({
      collection: 'banners',
      data: {
        _status: 'published',
        endAt: new Date(originalEnd.getTime() + 60 * 60 * 1000).toISOString(),
      },
      draft: false,
      id: banner.id,
      overrideAccess: true,
    })
    const req = requestFixture({ banner, sendEmail: vi.fn() })
    const ended = bannerNotificationEvents.find(({ key }) => key === 'ended')!

    await expect(
      claimBannerNotificationDelivery({ banner, event: ended, now: originalEnd, req }),
    ).resolves.toBeNull()
  })

  it('records SMTP failures and stops after the configured retry bound', async () => {
    process.env.SMTP_HOST = 'mail.example.test'
    process.env.BANNER_NOTIFICATION_MAX_ATTEMPTS = '2'
    process.env.BANNER_NOTIFICATION_RETRY_DELAY_MINUTES = '0'
    const now = new Date()
    const banner = await createBanner({
      endAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      startAt: now,
    })
    const sendEmail = vi.fn().mockRejectedValue(new Error('SMTP unavailable'))
    const req = requestFixture({ banner, sendEmail })

    await expect(processBannerNotifications({ now, req })).resolves.toMatchObject({
      claimed: 1,
      failed: 1,
    })
    await expect(
      processBannerNotifications({ now: new Date(now.getTime() + 60_000), req }),
    ).resolves.toMatchObject({ claimed: 1, failed: 1 })
    await expect(
      processBannerNotifications({ now: new Date(now.getTime() + 120_000), req }),
    ).resolves.toMatchObject({ claimed: 0, failed: 0 })
    expect(sendEmail).toHaveBeenCalledTimes(2)

    const deliveries = await payload.db.drizzle.execute(sql`
      SELECT "attempt_count", "last_error", "state"
      FROM "app"."banner_notification_deliveries"
      WHERE "banner_id" = ${banner.id}
        AND "event_key" = 'started'
    `)
    expect(deliveries.rows).toEqual([
      expect.objectContaining({
        attempt_count: 2,
        last_error: 'SMTP unavailable',
        state: 'failed',
      }),
    ])
  })

  it('recovers an abandoned sending lease only after it becomes stale', async () => {
    process.env.BANNER_NOTIFICATION_STALE_CLAIM_MINUTES = '1'
    const now = new Date()
    const banner = await createBanner({
      endAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      startAt: now,
    })
    const req = requestFixture({ banner, sendEmail: vi.fn() })
    const started = bannerNotificationEvents.find(({ key }) => key === 'started')!

    await expect(
      claimBannerNotificationDelivery({ banner, event: started, now, req }),
    ).resolves.toMatchObject({ attemptCount: 1 })
    await expect(
      claimBannerNotificationDelivery({
        banner,
        event: started,
        now: new Date(now.getTime() + 30_000),
        req,
      }),
    ).resolves.toBeNull()
    await expect(
      claimBannerNotificationDelivery({
        banner,
        event: started,
        now: new Date(now.getTime() + 61_000),
        req,
      }),
    ).resolves.toMatchObject({ attemptCount: 2 })
  })
})
