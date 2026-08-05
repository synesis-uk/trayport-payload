import type { PayloadRequest } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  dueBannerNotificationEvents,
  processBannerNotifications,
} from '@/banners/notificationWorkflow'
import type { Banner } from '@/payload-types'

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

afterEach(() => {
  restoreEnvironment('SMTP_HOST', originalEnvironment.smtpHost)
  restoreEnvironment('BANNER_NOTIFICATION_MAX_ATTEMPTS', originalEnvironment.maxAttempts)
  restoreEnvironment('BANNER_NOTIFICATION_RETRY_DELAY_MINUTES', originalEnvironment.retryDelay)
  restoreEnvironment('BANNER_NOTIFICATION_STALE_CLAIM_MINUTES', originalEnvironment.staleClaim)
  vi.restoreAllMocks()
})

const bannerFixture = (overrides: Partial<Banner> = {}): Banner => ({
  _status: 'published',
  createdAt: '2026-08-01T00:00:00.000Z',
  dismissible: true,
  endAt: '2026-08-10T12:00:00.000Z',
  headline: 'Maintenance',
  id: 42,
  layout: 'small',
  link: {
    label: 'Read more',
    type: 'custom',
    url: '/maintenance/',
  },
  notifyUsers: [
    {
      collection: 'users',
      createdAt: '2026-08-01T00:00:00.000Z',
      email: 'editor@example.test',
      id: 7,
      updatedAt: '2026-08-01T00:00:00.000Z',
    },
  ],
  position: 'first',
  priority: 0,
  startAt: '2026-08-06T12:00:00.000Z',
  targetMode: 'all',
  title: 'Planned maintenance',
  tone: 'deep',
  updatedAt: '2026-08-01T00:00:00.000Z',
  ...overrides,
})

const requestFixture = ({
  banner = bannerFixture(),
  execute,
  sendEmail = vi.fn().mockResolvedValue(undefined),
}: {
  banner?: Banner
  execute: ReturnType<typeof vi.fn>
  sendEmail?: ReturnType<typeof vi.fn>
}): PayloadRequest =>
  ({
    payload: {
      db: { drizzle: { execute } },
      find: vi.fn().mockResolvedValue({ docs: [banner], hasNextPage: false }),
      logger: { error: vi.fn(), info: vi.fn() },
      sendEmail,
    },
  }) as unknown as PayloadRequest

describe('banner notification event detection', () => {
  it('uses stored instants for each of the four boundaries', () => {
    const banner = bannerFixture({
      endAt: '2026-08-07T13:00:00+01:00',
      startAt: '2026-08-06T13:00:00+01:00',
    })

    expect(
      dueBannerNotificationEvents({
        banner,
        catchUpWindowMilliseconds: 1,
        now: new Date('2026-08-05T12:00:00.000Z'),
      }).map(({ key }) => key),
    ).toEqual(['beforeStart'])
    expect(
      dueBannerNotificationEvents({
        banner,
        catchUpWindowMilliseconds: 1,
        now: new Date('2026-08-06T12:00:00.000Z'),
      }).map(({ key }) => key),
    ).toEqual(['started', 'beforeEnd'])
    expect(
      dueBannerNotificationEvents({
        banner,
        catchUpWindowMilliseconds: 1,
        now: new Date('2026-08-07T12:00:00.000Z'),
      }).map(({ key }) => key),
    ).toEqual(['ended'])
  })

  it('does not revive stale historical events', () => {
    expect(
      dueBannerNotificationEvents({
        banner: bannerFixture({
          endAt: '2025-01-02T00:00:00.000Z',
          startAt: '2025-01-01T00:00:00.000Z',
        }),
        catchUpWindowMilliseconds: 6 * 60 * 60 * 1000,
        now: new Date('2026-08-05T12:00:00.000Z'),
      }),
    ).toEqual([])
  })
})

describe('banner notification sweep', () => {
  it('claims in the ledger before delivery and records SMTP acceptance', async () => {
    process.env.SMTP_HOST = 'mail.example.test'
    const execute = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ attempt_count: 1, id: 91, recipient_emails: ['editor@example.test'] }],
      })
      .mockResolvedValueOnce({ rows: [{ id: 91 }] })
      .mockResolvedValueOnce({ rows: [] })
    const sendEmail = vi.fn().mockResolvedValue(undefined)
    const req = requestFixture({ execute, sendEmail })
    const now = new Date('2026-08-05T12:00:00.000Z')

    await expect(processBannerNotifications({ now, req })).resolves.toMatchObject({
      attempted: 1,
      claimed: 1,
      failed: 0,
      sent: 1,
    })
    await expect(processBannerNotifications({ now, req })).resolves.toMatchObject({
      attempted: 1,
      claimed: 0,
      sent: 0,
    })
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(execute.mock.invocationCallOrder[0]).toBeLessThan(sendEmail.mock.invocationCallOrder[0])
    expect(execute).toHaveBeenCalledTimes(3)
    expect(req.payload.update).toBeUndefined()
  })

  it('records SMTP failure and permits a later bounded retry', async () => {
    process.env.SMTP_HOST = 'mail.example.test'
    process.env.BANNER_NOTIFICATION_RETRY_DELAY_MINUTES = '0'
    const execute = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ attempt_count: 1, id: 92, recipient_emails: ['editor@example.test'] }],
      })
      .mockResolvedValueOnce({ rows: [{ id: 92 }] })
      .mockResolvedValueOnce({
        rows: [{ attempt_count: 2, id: 92, recipient_emails: ['editor@example.test'] }],
      })
      .mockResolvedValueOnce({ rows: [{ id: 92 }] })
    const sendEmail = vi
      .fn()
      .mockRejectedValueOnce(new Error('SMTP unavailable'))
      .mockResolvedValueOnce(undefined)
    const req = requestFixture({ execute, sendEmail })
    const now = new Date('2026-08-05T12:00:00.000Z')

    await expect(processBannerNotifications({ now, req })).resolves.toMatchObject({
      claimed: 1,
      failed: 1,
      sent: 0,
    })
    await expect(
      processBannerNotifications({ now: new Date(now.getTime() + 1), req }),
    ).resolves.toMatchObject({
      claimed: 1,
      failed: 0,
      sent: 1,
    })
    expect(sendEmail).toHaveBeenCalledTimes(2)
    expect(execute).toHaveBeenCalledTimes(4)
  })

  it('is a no-op without SMTP and does not acquire a delivery lease', async () => {
    delete process.env.SMTP_HOST
    const execute = vi.fn()
    const req = requestFixture({ execute })

    await expect(processBannerNotifications({ req })).resolves.toEqual({
      attempted: 0,
      claimed: 0,
      disabled: true,
      failed: 0,
      scanned: 0,
      sent: 0,
    })
    expect(execute).not.toHaveBeenCalled()
    expect(req.payload.find).not.toHaveBeenCalled()
  })
})
