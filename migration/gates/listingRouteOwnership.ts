/**
 * Gate: `listing-detail-route-ownership`.
 *
 * "Every listing-linked article, hub, venue, and learning video resolves to one complete managed
 * public route owner, while dependency-only records remain non-routable."
 *
 * The assertion has two halves that need different instruments, and conflating them is how this
 * gate could have been graded green while proving nothing:
 *
 *   - The *route owner* half is a corpus sweep. It is answered here, from a snapshot of the loaded
 *     database, because only the database knows whether a claim's path drifted from its owner's.
 *   - The *dependency-only* half is currently vacuous — the corpus contains zero `listing`,
 *     `map-only` or `relationship-only` records, so a data sweep over it passes by finding nothing.
 *     This builder records that emptiness as an explicit assertion rather than hiding it, and the
 *     spec proves the behaviour with fixtures instead.
 *
 * Completeness is deliberately archetype-specific and mirrors the rules already enforced at publish
 * time in `src/routing/archetypes.ts`. There is no uniform "has a body" rule, and inventing one
 * would fail all 72 hubs and all 66 venues, none of which carry layout blocks.
 */
import { contentArchitectureContract } from '../mappings/contentArchitecture'
import { buildGateVerification, countAssertion, type GateVerification } from './ledger'

export const GATE_ID = 'listing-detail-route-ownership'

/** The four collections whose route ownership is discriminated by `contentMode`. */
export const OWNER_COLLECTIONS = ['articles', 'hubs', 'venues', 'learning-videos'] as const

export type OwnerCollection = (typeof OWNER_COLLECTIONS)[number]

export type OwnerDocument = {
  collection: OwnerCollection
  id: string
  contentMode: string
  path: string | null
  published: boolean
  archetype: string
  /** True when the archetype's own publish rule in `src/routing/archetypes.ts` is satisfied. */
  complete: boolean
}

export type RouteClaim = {
  path: string
  ownerKind: string
  ownerCollection: string
  ownerDocumentId: string
  archetype: string
  state: string
}

export type OwnershipSnapshot = {
  documents: OwnerDocument[]
  claims: RouteClaim[]
  /**
   * How many documents each listing or index surface actually returns, measured with the same
   * query the frontend loader uses. A record can be a valid route owner and still be unreachable
   * from the listing that is supposed to link to it, which is the failure this catches.
   */
  listingReach: Record<OwnerCollection, number>
}

/**
 * Route-owning documents expected per collection, derived from the contract.
 *
 * `market-coverage-index` and `venue-index` are deliberately excluded: they are `ownerKind:
 * 'virtual'` system claims for `/market-coverage/` and `/venue/`, not hub or venue documents.
 * Counting them here would demand 73 hubs and 67 venues and fail against a correct corpus.
 */
const ROUTE_OWNER_IDS: Record<OwnerCollection, string[]> = {
  articles: ['editorial-posts', 'legacy-event-details'],
  hubs: ['hub-details'],
  venues: ['venue-details'],
  'learning-videos': ['learning-video-details'],
}

const ROUTE_OWNING_MODE: Record<OwnerCollection, string> = {
  articles: 'full',
  hubs: 'page',
  venues: 'page',
  'learning-videos': 'full',
}

const ROUTE_OWNING_ARCHETYPE: Record<OwnerCollection, string> = {
  articles: 'article.full',
  hubs: 'hub.public-page',
  venues: 'venue.public-detail',
  'learning-videos': 'learning-video.public-detail',
}

export const expectedOwnerCount = (collection: OwnerCollection): number =>
  ROUTE_OWNER_IDS[collection].reduce((total, id) => {
    const owner = contentArchitectureContract.approvedProductionScope.routeOwners.find(
      (candidate) => candidate.id === id,
    )
    return total + (owner?.count ?? 0)
  }, 0)

const label = (document: OwnerDocument): string =>
  `${document.collection}:${document.id} ${document.path ?? '(no path)'}`

export const verifyListingRouteOwnership = (snapshot: OwnershipSnapshot): GateVerification => {
  const assertions = []
  const details: Record<string, string[]> = {}

  const contentClaims = snapshot.claims.filter(({ ownerKind }) => ownerKind === 'content')

  for (const collection of OWNER_COLLECTIONS) {
    const expected = expectedOwnerCount(collection)
    const documents = snapshot.documents.filter((document) => document.collection === collection)

    // 1. The corpus holds exactly the route owners the contract approved.
    const owners = documents.filter(
      (document) =>
        document.published &&
        document.contentMode === ROUTE_OWNING_MODE[collection] &&
        Boolean(document.path),
    )
    assertions.push(countAssertion(`route-owner:${collection}`, expected, owners.length))
    details[`route-owner:${collection}`] = documents
      .filter(
        (document) =>
          document.contentMode === ROUTE_OWNING_MODE[collection] &&
          (!document.published || !document.path),
      )
      .map((document) => `${label(document)} (published=${document.published})`)

    // 2. Each one satisfies its own archetype's publish rule.
    const incomplete = owners.filter((document) => !document.complete)
    assertions.push(countAssertion(`owner-incomplete:${collection}`, 0, incomplete.length))
    details[`owner-incomplete:${collection}`] = incomplete.map(label)

    // 3. Exactly one published registry claim per owner.
    const claims = contentClaims.filter(
      (claim) => claim.ownerCollection === collection && claim.state === 'published',
    )
    assertions.push(countAssertion(`published-claim:${collection}`, expected, claims.length))

    // 4. No claim path has drifted from its owner document's path. The claimKey unique index caps
    //    an owner at one published claim but does not couple the two path columns, which are
    //    written separately.
    const byId = new Map(owners.map((document) => [document.id, document]))
    const drifted = claims.filter((claim) => byId.get(claim.ownerDocumentId)?.path !== claim.path)
    assertions.push(countAssertion(`claim-path-drift:${collection}`, 0, drifted.length))
    details[`claim-path-drift:${collection}`] = drifted.map(
      (claim) =>
        `${collection}:${claim.ownerDocumentId} claim=${claim.path} document=${
          byId.get(claim.ownerDocumentId)?.path ?? '(absent)'
        }`,
    )

    // 5. No claim archetype has drifted from the owner's resolved archetype.
    const archetypeDrift = claims.filter(
      (claim) => claim.archetype !== ROUTE_OWNING_ARCHETYPE[collection],
    )
    assertions.push(countAssertion(`claim-archetype-drift:${collection}`, 0, archetypeDrift.length))
    details[`claim-archetype-drift:${collection}`] = archetypeDrift.map(
      (claim) => `${collection}:${claim.ownerDocumentId} archetype=${claim.archetype}`,
    )

    // 6. Every owner is actually reachable from the listing or index that links to it. A record can
    //    own a valid route and still be invisible to the surface meant to surface it.
    assertions.push(
      countAssertion(
        `listing-reachability:${collection}`,
        expected,
        snapshot.listingReach[collection] ?? 0,
      ),
    )

    // 7. Dependency-only records own no path and no claim. Vacuous while the corpus holds none —
    //    recorded so the emptiness is visible rather than mistaken for coverage.
    const dependencyOnly = documents.filter(
      (document) => document.contentMode !== ROUTE_OWNING_MODE[collection],
    )
    const routableDependencies = dependencyOnly.filter(
      (document) =>
        Boolean(document.path) ||
        contentClaims.some(
          (claim) =>
            claim.ownerCollection === collection && claim.ownerDocumentId === document.id,
        ),
    )
    assertions.push(
      countAssertion(`dependency-only-routable:${collection}`, 0, routableDependencies.length),
    )
    details[`dependency-only-routable:${collection}`] = routableDependencies.map(label)
  }

  // 8. No published content claim points at an owner document that is missing or unpublished.
  const ownerIds = new Set(
    snapshot.documents.filter(({ published }) => published).map(({ collection, id }) => `${collection}:${id}`),
  )
  const orphaned = contentClaims.filter(
    (claim) =>
      claim.state === 'published' &&
      (OWNER_COLLECTIONS as readonly string[]).includes(claim.ownerCollection) &&
      !ownerIds.has(`${claim.ownerCollection}:${claim.ownerDocumentId}`),
  )
  assertions.push(countAssertion('orphaned-published-claim', 0, orphaned.length))
  details['orphaned-published-claim'] = orphaned.map(
    (claim) => `${claim.ownerCollection}:${claim.ownerDocumentId} ${claim.path}`,
  )

  // 9. Nothing is left half-published. A reserved claim on a route owner means a load stopped
  //    between reserving the path and publishing the document.
  const reserved = contentClaims.filter(
    (claim) =>
      claim.state === 'reserved' &&
      (OWNER_COLLECTIONS as readonly string[]).includes(claim.ownerCollection),
  )
  assertions.push(countAssertion('reserved-owner-claim', 0, reserved.length))
  details['reserved-owner-claim'] = reserved.map(
    (claim) => `${claim.ownerCollection}:${claim.ownerDocumentId} ${claim.path}`,
  )

  return buildGateVerification(GATE_ID, assertions, details)
}
