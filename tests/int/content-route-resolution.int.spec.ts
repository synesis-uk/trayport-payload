// @vitest-environment node

import { resolveRouteClaimOwner } from '@/app/(frontend)/contentRoute'
import { splitLeadingHero } from '@/components/Trayport/ContentViews'
import type { PublicRouteClaim } from '@/routing/registry'
import type { Payload } from 'payload'
import { describe, expect, it, vi } from 'vitest'

const routeClaim = (overrides: Partial<PublicRouteClaim> = {}): PublicRouteClaim =>
  ({
    archetype: 'page.standard',
    ownerCollection: 'pages',
    ownerDocumentId: 'missing-owner',
    ownerKind: 'content',
    path: '/missing-owner/',
    state: 'published',
    ...overrides,
  }) as PublicRouteClaim

const payloadWithFindByID = (findByID: ReturnType<typeof vi.fn>): Payload =>
  ({ findByID }) as unknown as Payload

describe('content route owner resolution', () => {
  it('consumes one optional managed hero before rendering detail body blocks', () => {
    const hero = { blockType: 'trayportHero', heading: 'Managed heading' }
    const section = { blockType: 'contentSection', columns: [] }

    expect(splitLeadingHero([hero, section])).toEqual({ body: [section], hero: [hero] })
    expect(splitLeadingHero([section])).toEqual({ body: [section], hero: [] })
    expect(splitLeadingHero()).toEqual({ body: [], hero: [] })
  })

  it('returns null for a stale or access-filtered content owner', async () => {
    const findByID = vi.fn().mockResolvedValue(null)

    await expect(
      resolveRouteClaimOwner({
        claim: routeClaim(),
        draft: false,
        payload: payloadWithFindByID(findByID),
      }),
    ).resolves.toBeNull()

    expect(findByID).toHaveBeenCalledWith({
      collection: 'pages',
      depth: 3,
      disableErrors: true,
      draft: false,
      id: 'missing-owner',
      overrideAccess: false,
    })
  })

  it('returns null for a stale redirect owner or inaccessible reference target', async () => {
    const missingRedirect = vi.fn().mockResolvedValue(null)
    await expect(
      resolveRouteClaimOwner({
        claim: routeClaim({
          archetype: 'redirect',
          ownerCollection: 'redirects',
          ownerDocumentId: 'missing-redirect',
          ownerKind: 'redirect',
          path: '/missing-redirect/',
        }),
        draft: false,
        payload: payloadWithFindByID(missingRedirect),
      }),
    ).resolves.toBeNull()

    expect(missingRedirect).toHaveBeenCalledWith({
      collection: 'redirects',
      depth: 1,
      disableErrors: true,
      id: 'missing-redirect',
      overrideAccess: false,
    })

    const missingTarget = vi
      .fn()
      .mockResolvedValueOnce({
        createdAt: '2026-07-30T00:00:00.000Z',
        from: '/missing-target/',
        id: 1,
        to: {
          reference: {
            relationTo: 'pages',
            value: 404,
          },
          type: 'reference',
        },
        updatedAt: '2026-07-30T00:00:00.000Z',
      })
      .mockResolvedValueOnce(null)

    await expect(
      resolveRouteClaimOwner({
        claim: routeClaim({
          archetype: 'redirect',
          ownerCollection: 'redirects',
          ownerDocumentId: 'redirect-with-missing-target',
          ownerKind: 'redirect',
          path: '/missing-target/',
        }),
        draft: false,
        payload: payloadWithFindByID(missingTarget),
      }),
    ).resolves.toBeNull()
    expect(missingTarget).toHaveBeenLastCalledWith({
      collection: 'pages',
      depth: 0,
      disableErrors: true,
      draft: false,
      id: 404,
      overrideAccess: false,
    })
  })

  it.each([
    ['301', true],
    ['302', false],
  ] as const)('preserves the configured %s redirect intent', async (type, permanent) => {
    const findByID = vi.fn().mockResolvedValue({
      createdAt: '2026-07-30T00:00:00.000Z',
      from: `/redirect-${type}/`,
      id: type === '301' ? 301 : 302,
      to: {
        type: 'custom',
        url: '/destination/',
      },
      type,
      updatedAt: '2026-07-30T00:00:00.000Z',
    })

    await expect(
      resolveRouteClaimOwner({
        claim: routeClaim({
          archetype: 'redirect',
          ownerCollection: 'redirects',
          ownerDocumentId: `redirect-${type}`,
          ownerKind: 'redirect',
          path: `/redirect-${type}/`,
        }),
        draft: false,
        payload: payloadWithFindByID(findByID),
      }),
    ).resolves.toEqual({
      destination: '/destination/',
      kind: 'redirect',
      permanent,
    })
  })

  it('rejects a redirect owner without an explicit supported status', async () => {
    const findByID = vi.fn().mockResolvedValue({
      createdAt: '2026-07-30T00:00:00.000Z',
      from: '/invalid-status/',
      id: 303,
      to: {
        type: 'custom',
        url: '/destination/',
      },
      type: '307',
      updatedAt: '2026-07-30T00:00:00.000Z',
    })

    await expect(
      resolveRouteClaimOwner({
        claim: routeClaim({
          archetype: 'redirect',
          ownerCollection: 'redirects',
          ownerDocumentId: 'redirect-invalid',
          ownerKind: 'redirect',
          path: '/invalid-status/',
        }),
        draft: false,
        payload: payloadWithFindByID(findByID),
      }),
    ).resolves.toBeNull()
  })

  it('does not turn an infrastructure failure into a false 404', async () => {
    const infrastructureError = new Error('database unavailable')
    const findByID = vi.fn().mockRejectedValue(infrastructureError)

    await expect(
      resolveRouteClaimOwner({
        claim: routeClaim(),
        draft: false,
        payload: payloadWithFindByID(findByID),
      }),
    ).rejects.toBe(infrastructureError)

    const targetFailure = vi
      .fn()
      .mockResolvedValueOnce({
        createdAt: '2026-07-30T00:00:00.000Z',
        from: '/target-failure/',
        id: 2,
        to: {
          reference: {
            relationTo: 'pages',
            value: 500,
          },
          type: 'reference',
        },
        updatedAt: '2026-07-30T00:00:00.000Z',
      })
      .mockRejectedValueOnce(infrastructureError)

    await expect(
      resolveRouteClaimOwner({
        claim: routeClaim({
          archetype: 'redirect',
          ownerCollection: 'redirects',
          ownerDocumentId: 'redirect-with-failing-target',
          ownerKind: 'redirect',
          path: '/target-failure/',
        }),
        draft: false,
        payload: payloadWithFindByID(targetFailure),
      }),
    ).rejects.toBe(infrastructureError)
  })
})
