// @vitest-environment node

import config from '@/payload.config'
import { articleTypesForFamily } from '@/data/listingContent'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  GATE_ID,
  OWNER_COLLECTIONS,
  expectedOwnerCount,
  verifyListingRouteOwnership,
  type OwnerCollection,
  type OwnerDocument,
  type OwnershipSnapshot,
  type RouteClaim,
} from '../../migration/gates/listingRouteOwnership'

let payload: Payload
let snapshot: OwnershipSnapshot

const suiteID = `gate-route-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const mutationContext = { disableRevalidate: true }
const publishContext = { ...mutationContext, routeOperation: 'publish' }

type UnknownRecord = Record<string, unknown>

const array = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

/**
 * Completeness, evaluated with each archetype's own publish rule from `src/routing/archetypes.ts`.
 *
 * There is deliberately no shared rule. `hub.public-page` has no content minimum anywhere in the
 * codebase — all 72 hubs carry zero layout blocks — so inventing one here would fail the entire
 * collection against a corpus the runtime considers valid.
 */
const isComplete = (collection: OwnerCollection, document: UnknownRecord): boolean => {
  const layout = array(document.layout)

  if (collection === 'articles') return layout.length > 0

  if (collection === 'venues') {
    return (
      layout.length > 0 ||
      Boolean(document.description) ||
      array(document.marketConnections).length > 0 ||
      Boolean(document.website) ||
      Boolean(document.logo)
    )
  }

  if (collection === 'learning-videos') {
    // Media is required only for public records; `archetypes.ts` actively forbids it on protected
    // ones, and every loaded video is `subscriber`.
    if ((document.accessMode ?? 'public') !== 'public') return true
    return Boolean(document.video) || Boolean(document.externalVideoURL)
  }

  return true
}

const loadDocuments = async (collection: OwnerCollection): Promise<OwnerDocument[]> => {
  const result = await payload.find({
    collection,
    depth: 0,
    draft: false,
    limit: 0,
    overrideAccess: true,
    pagination: false,
  })

  return result.docs.map((document) => {
    const record = document as unknown as UnknownRecord
    const contentMode = String(record.contentMode ?? '')
    const routeOwning =
      collection === 'articles' || collection === 'learning-videos'
        ? contentMode === 'full'
        : contentMode === 'page'

    return {
      collection,
      id: String(record.id),
      contentMode,
      path: typeof record.path === 'string' && record.path ? record.path : null,
      published: record._status === 'published',
      archetype: routeOwning
        ? {
            articles: 'article.full',
            hubs: 'hub.public-page',
            venues: 'venue.public-detail',
            'learning-videos': 'learning-video.public-detail',
          }[collection]
        : {
            articles: 'article.listing-metadata',
            hubs: 'hub.map-only',
            venues: 'venue.structured-record',
            'learning-videos': 'learning-video.listing-metadata',
          }[collection],
      complete: isComplete(collection, record),
    }
  })
}

const loadClaims = async (): Promise<RouteClaim[]> => {
  const result = await payload.find({
    collection: 'route-registry',
    depth: 0,
    limit: 0,
    overrideAccess: true,
    pagination: false,
  })

  return result.docs.map((document) => {
    const record = document as unknown as UnknownRecord
    return {
      path: String(record.path ?? ''),
      ownerKind: String(record.ownerKind ?? ''),
      ownerCollection: String(record.ownerCollection ?? ''),
      ownerDocumentId: String(record.ownerDocumentId ?? ''),
      archetype: String(record.archetype ?? ''),
      state: String(record.state ?? ''),
    }
  })
}

/**
 * Reachability measured through the same where-clauses the frontend loaders use, so a record that
 * owns a valid route but never appears on the listing meant to link to it fails the gate.
 */
const loadListingReach = async (): Promise<Record<OwnerCollection, number>> => {
  const publishedArticles = await payload.count({
    collection: 'articles',
    overrideAccess: true,
    where: {
      and: [
        { _status: { equals: 'published' } },
        { articleType: { in: articleTypesForFamily('all') } },
      ],
    },
  })
  const publishedVideos = await payload.count({
    collection: 'learning-videos',
    overrideAccess: true,
    where: { _status: { equals: 'published' } },
  })
  const indexedVenues = await payload.count({
    collection: 'venues',
    overrideAccess: true,
    where: {
      and: [{ _status: { equals: 'published' } }, { contentMode: { equals: 'page' } }],
    },
  })
  const indexedHubs = await payload.count({
    collection: 'hubs',
    overrideAccess: true,
    where: {
      and: [{ _status: { equals: 'published' } }, { contentMode: { equals: 'page' } }],
    },
  })

  return {
    articles: publishedArticles.totalDocs,
    'learning-videos': publishedVideos.totalDocs,
    venues: indexedVenues.totalDocs,
    hubs: indexedHubs.totalDocs,
  }
}

const cleanFixtures = async () => {
  for (const collection of OWNER_COLLECTIONS) {
    await payload.delete({
      collection,
      context: mutationContext,
      overrideAccess: true,
      where: { slug: { like: suiteID } },
    } as never)
  }
}

describe.sequential(GATE_ID, () => {
  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required to verify listing route ownership')
    }
    payload = await getPayload({ config })

    const documents = (
      await Promise.all(OWNER_COLLECTIONS.map((collection) => loadDocuments(collection)))
    ).flat()

    snapshot = {
      documents,
      claims: await loadClaims(),
      listingReach: await loadListingReach(),
    }
  }, 120_000)

  afterAll(cleanFixtures, 60_000)

  it('holds across the loaded corpus', () => {
    const verification = verifyListingRouteOwnership(snapshot)

    // Report every drift at once rather than failing on the first, so a red gate is actionable.
    expect(verification.failures, JSON.stringify(verification.details, null, 2)).toEqual([])
    expect(verification.status).toBe('passed')
  })

  it('measures the route owners the contract approved, not a self-derived total', () => {
    expect({
      articles: expectedOwnerCount('articles'),
      hubs: expectedOwnerCount('hubs'),
      venues: expectedOwnerCount('venues'),
      'learning-videos': expectedOwnerCount('learning-videos'),
    }).toEqual({
      articles: 93,
      hubs: 72,
      venues: 66,
      'learning-videos': 15,
    })
  })

  describe('drift detection', () => {
    const withDocuments = (mutate: (documents: OwnerDocument[]) => OwnerDocument[]) => ({
      ...snapshot,
      documents: mutate(snapshot.documents.map((document) => ({ ...document }))),
    })

    it('fails when a route owner loses its published claim', () => {
      const target = snapshot.claims.find(
        (claim) => claim.ownerCollection === 'hubs' && claim.state === 'published',
      )
      expect(target).toBeDefined()

      const verification = verifyListingRouteOwnership({
        ...snapshot,
        claims: snapshot.claims.filter((claim) => claim !== target),
      })

      expect(verification.status).toBe('failed')
      expect(verification.failures).toContain('published-claim:hubs: expected 72, received 71')
    })

    it('fails when a claim path drifts from its owner document', () => {
      const target = snapshot.claims.find(
        (claim) => claim.ownerCollection === 'articles' && claim.state === 'published',
      )
      expect(target).toBeDefined()

      const verification = verifyListingRouteOwnership({
        ...snapshot,
        claims: snapshot.claims.map((claim) =>
          claim === target ? { ...claim, path: '/drifted/' } : claim,
        ),
      })

      expect(verification.status).toBe('failed')
      expect(verification.failures).toContain('claim-path-drift:articles: expected 0, received 1')
      expect(verification.details['claim-path-drift:articles']?.[0]).toContain('/drifted/')
    })

    it('fails when a route owner is unpublished', () => {
      const verification = verifyListingRouteOwnership(
        withDocuments((documents) => {
          const target = documents.find(
            (document) => document.collection === 'venues' && document.published,
          )
          if (target) target.published = false
          return documents
        }),
      )

      expect(verification.status).toBe('failed')
      expect(verification.failures).toContain('route-owner:venues: expected 66, received 65')
    })

    it('fails when a dependency-only record acquires a path', () => {
      const verification = verifyListingRouteOwnership(
        withDocuments((documents) => [
          ...documents,
          {
            collection: 'learning-videos',
            id: 'phantom',
            contentMode: 'listing',
            path: '/learning-hub/watch/phantom/',
            published: true,
            archetype: 'learning-video.listing-metadata',
            complete: true,
          },
        ]),
      )

      expect(verification.status).toBe('failed')
      expect(verification.failures).toContain(
        'dependency-only-routable:learning-videos: expected 0, received 1',
      )
    })

    it('fails when a route owner stops satisfying its archetype publish rule', () => {
      const verification = verifyListingRouteOwnership(
        withDocuments((documents) => {
          const target = documents.find(
            (document) => document.collection === 'articles' && document.published,
          )
          if (target) target.complete = false
          return documents
        }),
      )

      expect(verification.status).toBe('failed')
      expect(verification.failures).toContain('owner-incomplete:articles: expected 0, received 1')
    })
  })

  /**
   * The dependency-only half of the assertion is vacuous against the corpus — it holds zero
   * `listing`, `map-only` or `relationship-only` records — so the sweep above proves nothing about
   * it. These fixtures prove the behaviour instead.
   *
   * `tests/int/archetype-invariants.int.spec.ts` already covers articles, hubs and venues.
   * Learning videos are the case it omits.
   */
  describe('dependency-only learning videos stay non-routable', () => {
    it('rejects a public path on a listing-only record', async () => {
      await expect(
        payload.create({
          collection: 'learning-videos',
          context: publishContext,
          data: {
            _status: 'published',
            contentMode: 'listing',
            path: `/learning-hub/watch/${suiteID}-path/`,
            slug: `${suiteID}-path`,
            title: 'Listing-only with a path',
          },
          overrideAccess: true,
        } as never),
      ).rejects.toThrow(/cannot own a public path/i)
    })

    it('publishes without creating a route claim', async () => {
      const created = (await payload.create({
        collection: 'learning-videos',
        context: publishContext,
        data: {
          _status: 'published',
          contentMode: 'listing',
          slug: `${suiteID}-clean`,
          title: 'Listing-only learning video',
        },
        overrideAccess: true,
      } as never)) as unknown as { id: number | string }

      const claims = await payload.find({
        collection: 'route-registry',
        limit: 0,
        overrideAccess: true,
        pagination: false,
        where: {
          and: [
            { ownerCollection: { equals: 'learning-videos' } },
            { ownerDocumentId: { equals: String(created.id) } },
          ],
        },
      })

      expect(claims.docs).toHaveLength(0)
    })
  })
})
