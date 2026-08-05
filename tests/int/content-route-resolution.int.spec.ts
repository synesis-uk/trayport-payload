// @vitest-environment node

import {
  contentRouteSelects,
  resolveRouteClaimOwner,
} from '@/app/(frontend)/contentRoute.loader.server'
import { splitLeadingHero } from '@/components/content'
import { contentPathSelect } from '@/data/contentRouteProjection'
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
      select: contentRouteSelects.pages,
    })
  })

  it('resolves a sparse public People owner with the bounded profile projection', async () => {
    const person = {
      id: 11233,
      path: '/people/nicole-rosenberg/',
      team: 'careers',
      title: 'Nicole Rosenberg',
    }
    const findByID = vi.fn().mockResolvedValue(person)

    await expect(
      resolveRouteClaimOwner({
        claim: routeClaim({
          archetype: 'person.public-profile',
          ownerCollection: 'people',
          ownerDocumentId: '11233',
          path: '/people/nicole-rosenberg/',
        }),
        draft: false,
        payload: payloadWithFindByID(findByID),
      }),
    ).resolves.toEqual({ document: person, kind: 'person' })

    expect(findByID).toHaveBeenCalledWith({
      collection: 'people',
      depth: 3,
      disableErrors: true,
      draft: false,
      id: '11233',
      overrideAccess: false,
      select: contentRouteSelects.people,
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
      select: contentRouteSelects.redirects,
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
      select: contentPathSelect,
    })
  })

  it.each([
    ['301', 301],
    ['302', 302],
  ] as const)('preserves the configured %s redirect intent', async (type, status) => {
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
      status,
    })
  })

  it('resolves the managed Trading in Joule alias through its learning-video reference', async () => {
    const findByID = vi
      .fn()
      .mockResolvedValueOnce({
        createdAt: '2026-08-03T00:00:00.000Z',
        from: '/learning-hub/watch/trading-in-joule/',
        id: 845400,
        to: {
          reference: {
            relationTo: 'learning-videos',
            value: 8454,
          },
          type: 'reference',
        },
        type: '301',
        updatedAt: '2026-08-03T00:00:00.000Z',
      })
      .mockResolvedValueOnce({
        id: 8454,
        path: '/learning-hub-video/trading-in-joule/',
      })

    await expect(
      resolveRouteClaimOwner({
        claim: routeClaim({
          archetype: 'redirect',
          ownerCollection: 'redirects',
          ownerDocumentId: '845400',
          ownerKind: 'redirect',
          path: '/learning-hub/watch/trading-in-joule/',
        }),
        draft: false,
        payload: payloadWithFindByID(findByID),
      }),
    ).resolves.toEqual({
      destination: '/learning-hub-video/trading-in-joule/',
      kind: 'redirect',
      status: 301,
    })

    expect(findByID).toHaveBeenNthCalledWith(1, {
      collection: 'redirects',
      depth: 1,
      disableErrors: true,
      id: '845400',
      overrideAccess: false,
      select: contentRouteSelects.redirects,
    })
    expect(findByID).toHaveBeenNthCalledWith(2, {
      collection: 'learning-videos',
      depth: 0,
      disableErrors: true,
      draft: false,
      id: 8454,
      overrideAccess: false,
      select: contentPathSelect,
    })
  })

  it('resolves a managed redirect through its People reference', async () => {
    const findByID = vi
      .fn()
      .mockResolvedValueOnce({
        from: '/leadership/nicole/',
        id: 112330,
        to: {
          reference: { relationTo: 'people', value: 11233 },
          type: 'reference',
        },
        type: '301',
      })
      .mockResolvedValueOnce({ id: 11233, path: '/people/nicole-rosenberg/' })

    await expect(
      resolveRouteClaimOwner({
        claim: routeClaim({
          archetype: 'redirect',
          ownerCollection: 'redirects',
          ownerDocumentId: '112330',
          ownerKind: 'redirect',
          path: '/leadership/nicole/',
        }),
        draft: false,
        payload: payloadWithFindByID(findByID),
      }),
    ).resolves.toEqual({
      destination: '/people/nicole-rosenberg/',
      kind: 'redirect',
      status: 301,
    })
    expect(findByID).toHaveBeenLastCalledWith({
      collection: 'people',
      depth: 0,
      disableErrors: true,
      draft: false,
      id: 11233,
      overrideAccess: false,
      select: contentPathSelect,
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
