// @vitest-environment node

import { adminsOrFirstUser } from '@/access/roles'
import { assignInitialUserRoles, requireCMSRoleBeforeLogin } from '@/collections/Users'
import {
  applyApprovedBannerRecipientMappings,
  approvedBannerRecipientMappings,
} from '../../migration/load/bannerRecipients'
import { shouldApplyApprovedBannerRecipientMappings } from '../../migration/load'
import { describe, expect, it, vi } from 'vitest'

type StoredDocument = {
  id: number
  email?: string
  legacyId?: number
  notifyUsers?: Array<number | string>
  roles?: string[]
}

const mappingPayload = ({
  banner = { id: 116, legacyId: 11602 },
  user,
}: {
  banner?: StoredDocument | null
  user?: StoredDocument
}) => {
  let storedUser = user
  const create = vi.fn(async (args: Record<string, unknown>) => {
    const data = args.data as Record<string, unknown>
    storedUser = {
      email: String(data.email),
      id: 501,
      roles: data.roles as string[],
    }
    return storedUser
  })
  const update = vi.fn(async (args: Record<string, unknown>) => {
    if (!banner) throw new Error('Unexpected banner update')
    banner.notifyUsers = (args.data as { notifyUsers: number[] }).notifyUsers
    return banner
  })
  const find = vi.fn(async (args: Record<string, unknown>) => {
    if (args.collection === 'users') {
      return { docs: storedUser ? [storedUser] : [] }
    }
    return { docs: banner ? [banner] : [] }
  })

  return { banner, create, find, update }
}

describe('approved banner recipient mapping', () => {
  it('runs only for a publishing load that contains the approved banner', () => {
    const target = {
      legacy: { legacyId: 11602 },
      target: 'banners',
    } as never

    expect(shouldApplyApprovedBannerRecipientMappings(true, [target])).toBe(true)
    expect(shouldApplyApprovedBannerRecipientMappings(false, [target])).toBe(false)
    expect(shouldApplyApprovedBannerRecipientMappings(undefined, [target])).toBe(false)
    expect(
      shouldApplyApprovedBannerRecipientMappings(true, [
        {
          legacy: { legacyId: 4362 },
          target: 'banners',
        } as never,
      ]),
    ).toBe(false)
  })

  it('creates an inert notification identity and maps only the approved active banner', async () => {
    const payload = mappingPayload({})

    const report = await applyApprovedBannerRecipientMappings(payload)

    expect(approvedBannerRecipientMappings).toEqual([
      {
        bannerLegacyId: 11602,
        email: 'sophie.inghamclark@trayport.com',
        name: 'Sophie Ingham-Clark',
      },
    ])
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        context: expect.objectContaining({ notificationRecipientMigration: true }),
        data: expect.objectContaining({
          email: 'sophie.inghamclark@trayport.com',
          roles: [],
        }),
      }),
    )
    expect(payload.banner?.notifyUsers).toEqual([501])
    expect(report).toMatchObject({
      createdNotificationOnlyUsers: ['sophie.inghamclark@trayport.com'],
      mappedBanners: [
        {
          bannerLegacyId: 11602,
          email: 'sophie.inghamclark@trayport.com',
          userId: 501,
        },
      ],
      reusedCMSUsers: [],
    })

    await expect(applyApprovedBannerRecipientMappings(payload)).resolves.toMatchObject({
      createdNotificationOnlyUsers: [],
      reusedCMSUsers: ['sophie.inghamclark@trayport.com'],
    })
    expect(payload.create).toHaveBeenCalledTimes(1)
    expect(payload.update).toHaveBeenCalledTimes(1)
  })

  it('reuses an existing CMS user without changing their permissions', async () => {
    const payload = mappingPayload({
      user: {
        email: 'sophie.inghamclark@trayport.com',
        id: 27,
        roles: ['editor'],
      },
    })

    const report = await applyApprovedBannerRecipientMappings(payload)

    expect(payload.create).not.toHaveBeenCalled()
    expect(payload.banner?.notifyUsers).toEqual([27])
    expect(report).toMatchObject({
      createdNotificationOnlyUsers: [],
      reusedCMSUsers: ['sophie.inghamclark@trayport.com'],
    })
  })

  it('fails closed when the approved published banner is absent', async () => {
    const payload = mappingPayload({ banner: null })

    await expect(applyApprovedBannerRecipientMappings(payload)).rejects.toThrow(
      /published WordPress banner 11602 is missing/i,
    )
    expect(payload.create).not.toHaveBeenCalled()
    expect(payload.update).not.toHaveBeenCalled()
  })
})

describe('notification-only CMS identity guard', () => {
  it('does not promote a migration recipient even when it is the first user', async () => {
    const count = vi.fn().mockResolvedValue({ totalDocs: 0 })
    const result = await assignInitialUserRoles({
      data: { roles: ['editor'] },
      operation: 'create',
      req: {
        context: { notificationRecipientMigration: true },
        payload: { count },
      },
    } as never)

    expect(result).toMatchObject({ roles: [] })
    expect(count).not.toHaveBeenCalled()
  })

  it('promotes the first real CMS user when only notification identities already exist', async () => {
    const count = vi.fn().mockResolvedValue({ totalDocs: 0 })
    const result = await assignInitialUserRoles({
      data: { roles: ['editor'] },
      operation: 'create',
      req: {
        context: {},
        payload: { count },
      },
    } as never)

    expect(count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        where: {
          roles: {
            in: ['admin', 'editor'],
          },
        },
      }),
    )
    expect(result).toMatchObject({ roles: ['admin'] })
  })

  it('allows bootstrap creation until a role-bearing CMS user exists', async () => {
    const count = vi
      .fn()
      .mockResolvedValueOnce({ totalDocs: 0 })
      .mockResolvedValueOnce({ totalDocs: 1 })
    const args = {
      req: {
        payload: { count },
        user: null,
      },
    } as never

    await expect(adminsOrFirstUser(args)).resolves.toBe(true)
    await expect(adminsOrFirstUser(args)).resolves.toBe(false)
    expect(count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        where: {
          roles: {
            in: ['admin', 'editor'],
          },
        },
      }),
    )
  })

  it('allows CMS roles to sign in and rejects roleless identities', () => {
    expect(
      requireCMSRoleBeforeLogin({ user: { id: 1, roles: ['editor'] } } as never),
    ).toMatchObject({ roles: ['editor'] })
    expect(() => requireCMSRoleBeforeLogin({ user: { id: 2, roles: [] } } as never)).toThrow(
      /not been activated for CMS access/i,
    )
  })
})
