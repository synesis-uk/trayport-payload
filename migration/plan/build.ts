import crypto from 'node:crypto'

import type { ProductionInventory, RuntimeInventorySnapshot } from '../inventory/contracts'
import { inventoryUtilities } from '../inventory/discover'
import { contentArchitectureContract } from '../mappings/contentArchitecture'
import { pilotScope, type AcceptedRouteDependency, type PilotRoot } from '../scopes/pilot'
import {
  productionTargetPlanSchema,
  type ProductionTargetPlan,
  type TargetPlanRedirect,
  type TargetPlanRoute,
  type TargetPlanTaxonomy,
  type TargetPlanVerification,
  targetPlanVerificationSchema,
} from './contracts'

type PlanEvidence = ProductionTargetPlan['evidence']

const sha256 = (value: string): string => crypto.createHash('sha256').update(value).digest('hex')

export const architectureContractHash = (): string =>
  sha256(JSON.stringify(contentArchitectureContract))

const uniqueSorted = (values: Iterable<string>): string[] =>
  [...new Set(values)].sort((left, right) => left.localeCompare(right))

const managedTaxonomies = new Map(
  contentArchitectureContract.approvedProductionScope.managedTaxonomies.map((taxonomy) => [
    taxonomy.sourceTaxonomy,
    taxonomy,
  ]),
)

type VirtualConfigReference = {
  configGlobal: NonNullable<TargetPlanRoute['configGlobal']>
  configFieldPath: NonNullable<TargetPlanRoute['configFieldPath']>
}

const virtualConfigReferences: Record<string, VirtualConfigReference> = {
  'index.market-coverage': {
    configGlobal: 'route-indexes',
    configFieldPath: 'marketCoverageIndex',
  },
  'index.venue': {
    configGlobal: 'route-indexes',
    configFieldPath: 'venueIndex',
  },
}

const routeKey = (legacyId: number | null, canonicalPath: string): string =>
  legacyId === null ? `virtual:${canonicalPath}` : `wordpress:${legacyId}`

type AcceptedRoute = PilotRoot | AcceptedRouteDependency

const matchesAcceptedRoute = (route: TargetPlanRoute, accepted: AcceptedRoute): boolean =>
  route.ownerKind === 'payload-document' &&
  route.legacyId === accepted.legacyId &&
  route.sourcePostType === accepted.postType &&
  route.authoredPath === accepted.path &&
  route.canonicalPath === accepted.path &&
  route.archetype === accepted.archetype &&
  route.targetCollection === accepted.targetOwner

const buildRoutes = (inventory: ProductionInventory): TargetPlanRoute[] => {
  const archetypes = new Map(
    contentArchitectureContract.archetypes.map((archetype) => [archetype.id, archetype]),
  )
  const acceptedRoutesByID = new Map<number, AcceptedRoute>(
    [...pilotScope.roots, ...pilotScope.acceptedRouteDependencies].map((route) => [
      route.legacyId,
      route,
    ]),
  )

  return inventory.routes
    .filter(({ disposition }) => disposition === 'included')
    .map((route): TargetPlanRoute => {
      const contractArchetype = archetypes.get(route.archetype)
      if (!contractArchetype) {
        throw new Error(`Production route uses an unknown archetype: ${route.archetype}`)
      }
      if (contractArchetype.collection !== route.targetOwner) {
        throw new Error(
          `Production route ${route.canonicalPath} assigns ${route.archetype} to ${route.targetOwner}; contract owner is ${contractArchetype.collection}.`,
        )
      }

      const ownerKind = route.legacyId === null ? 'virtual-index' : 'payload-document'
      const configReference =
        ownerKind === 'virtual-index' ? virtualConfigReferences[route.archetype] : undefined
      const plannedRoute: TargetPlanRoute = {
        key: routeKey(route.legacyId, route.canonicalPath),
        ownerKind,
        legacyId: route.legacyId,
        title: route.title,
        sourcePostType: route.postType,
        sourceStatus: route.status,
        template: route.template,
        authoritativeField: route.authoritativeField,
        authoredPath: route.path,
        canonicalPath: route.canonicalPath,
        targetCollection: route.targetOwner,
        archetype: route.archetype,
        discriminator: contractArchetype.discriminator,
        routePolicy: contractArchetype.routePolicy,
        contentState: ownerKind === 'virtual-index' ? 'system-ready' : 'plan-only',
        configGlobal: configReference?.configGlobal || null,
        configFieldPath: configReference?.configFieldPath || null,
        roles: uniqueSorted(route.roles),
        sources: uniqueSorted(route.sources),
      }
      const acceptedRoute =
        plannedRoute.legacyId === null ? undefined : acceptedRoutesByID.get(plannedRoute.legacyId)
      if (acceptedRoute && matchesAcceptedRoute(plannedRoute, acceptedRoute)) {
        plannedRoute.contentState = 'poc-ready'
      }
      return plannedRoute
    })
    .sort(
      (left, right) =>
        left.canonicalPath.localeCompare(right.canonicalPath) || left.key.localeCompare(right.key),
    )
}

const buildTaxonomies = (
  inventory: ProductionInventory,
  snapshot: RuntimeInventorySnapshot,
): { records: TargetPlanTaxonomy[]; missingTerms: string[] } => {
  const termByKey = new Map(
    snapshot.terms.map((term) => [`term:${term.taxonomy}:${term.legacyId}`, term]),
  )
  const dispositions = new Map(
    contentArchitectureContract.legacyLayoutDispositions
      .filter(({ scope }) => scope === 'taxonomy')
      .map((disposition) => [disposition.source, disposition]),
  )
  const missingTerms: string[] = []
  const records = inventory.dependencies
    .filter((dependency) => dependency.kind === 'term' && managedTaxonomies.has(dependency.subType))
    .flatMap((dependency): TargetPlanTaxonomy[] => {
      const term = termByKey.get(dependency.key)
      const disposition = dispositions.get(dependency.subType)
      const managedTaxonomy = managedTaxonomies.get(dependency.subType)
      if (!term) {
        missingTerms.push(dependency.key)
        return []
      }
      if (
        !managedTaxonomy ||
        !disposition ||
        (disposition.disposition !== 'map' && disposition.disposition !== 'consolidate') ||
        disposition.targets.length !== 1 ||
        disposition.targets[0] !== managedTaxonomy.targetCollection
      ) {
        throw new Error(
          `Managed taxonomy ${dependency.subType} does not have one matching map/consolidate contract target.`,
        )
      }

      return [
        {
          key: dependency.key,
          legacyId: dependency.legacyId,
          sourceTaxonomy: dependency.subType,
          name: term.name,
          slug: term.slug,
          targetCollection: managedTaxonomy.targetCollection,
          contractDisposition: disposition.disposition,
          contractTargets: uniqueSorted(disposition.targets),
          roles: uniqueSorted(dependency.roles),
          sources: uniqueSorted(dependency.sources),
        },
      ]
    })
    .sort(
      (left, right) =>
        left.targetCollection.localeCompare(right.targetCollection) ||
        left.legacyId - right.legacyId,
    )

  return { records, missingTerms: uniqueSorted(missingTerms) }
}

const targetPostID = (value: string | null): number | null => {
  if (!value) return null
  try {
    const id = new URL(value, 'https://inventory.invalid').searchParams.get('page_id')
    return id && /^\d+$/.test(id) ? Number(id) : null
  } catch {
    return null
  }
}

const targetHost = (value: string, sourceHome: string): string | null => {
  try {
    const target = new URL(value, sourceHome)
    return (target.protocol === 'http:' || target.protocol === 'https:') && target.hostname
      ? target.hostname.toLowerCase()
      : null
  } catch {
    return null
  }
}

const buildRedirects = (
  inventory: ProductionInventory,
  snapshot: RuntimeInventorySnapshot,
  routes: TargetPlanRoute[],
): TargetPlanRedirect[] => {
  const routeAliases = new Set(
    routes.flatMap(({ authoredPath, canonicalPath }) => [authoredPath, canonicalPath]),
  )
  const exclusions = new Set(
    inventory.exclusions.flatMap(({ canonicalPath, path }) =>
      canonicalPath ? [path, canonicalPath] : [path],
    ),
  )
  const sourceHosts = new Set(
    [snapshot.source.home, snapshot.source.site, 'https://trayport.com', 'https://www.trayport.com']
      .map((value) => targetHost(value, snapshot.source.home))
      .filter((value): value is string => Boolean(value)),
  )
  const nodesByID = new Map(snapshot.nodes.map((node) => [node.legacyId, node]))
  const normalized = inventory.redirects.map((redirect) => ({
    redirect,
    from: inventoryUtilities.normalizePath(redirect.from),
    target: inventoryUtilities.normalizePath(redirect.to),
  }))
  const sourceCounts = new Map<string, number>()
  for (const { from } of normalized) {
    if (from) sourceCounts.set(from, (sourceCounts.get(from) || 0) + 1)
  }
  const redirectSources = new Set(
    normalized.map(({ from }) => from).filter((value): value is string => Boolean(value)),
  )

  return normalized
    .map(({ from, redirect, target }): TargetPlanRedirect => {
      const reasons = new Set<TargetPlanRedirect['reviewReasons'][number]>()
      const parsedStatus = Number(redirect.type)
      const httpStatus = parsedStatus === 301 || parsedStatus === 302 ? parsedStatus : null

      if (!from) reasons.add('missing-source')
      if (!redirect.to) reasons.add('missing-target')
      if (!httpStatus) reasons.add('invalid-status')
      if (from && (sourceCounts.get(from) || 0) > 1) reasons.add('duplicate-source')
      if (from && routeAliases.has(from)) reasons.add('source-shadows-route')

      let validTarget: 'external' | 'internal' | null = null
      if (redirect.to) {
        const host = targetHost(redirect.to, snapshot.source.home)
        if (!host) {
          reasons.add('invalid-target')
        } else if (!sourceHosts.has(host)) {
          validTarget = 'external'
        } else if (!target) {
          reasons.add('invalid-target')
        } else if (exclusions.has(target)) {
          reasons.add('target-excluded')
        } else if (routeAliases.has(target)) {
          validTarget = 'internal'
        } else {
          const postID = targetPostID(redirect.to)
          const node = postID ? nodesByID.get(postID) : undefined
          if (node && (node.status !== 'publish' || !node.postTypePublic)) {
            reasons.add('target-non-public')
          } else {
            reasons.add('target-unresolved')
          }
        }
      }

      if (validTarget === 'internal' && from && target && from === target) {
        reasons.add('self-loop')
      }
      if (validTarget === 'internal' && target && redirectSources.has(target) && target !== from) {
        reasons.add('redirect-chain')
      }

      if (reasons.size === 0) {
        reasons.add(
          validTarget === 'external' ? 'validated-external-target' : 'validated-one-hop-target',
        )
      }
      const reviewReasons = [...reasons].sort((left, right) => left.localeCompare(right))
      const isValidated =
        reviewReasons.length === 1 &&
        (reviewReasons[0] === 'validated-external-target' ||
          reviewReasons[0] === 'validated-one-hop-target')

      return {
        legacyId: redirect.legacyId,
        from,
        rawTarget: redirect.to,
        normalizedTarget: target,
        httpStatus,
        decision: isValidated ? 'active' : 'inactive-review',
        reviewReasons,
      }
    })
    .sort(
      (left, right) =>
        (left.from || '').localeCompare(right.from || '') || left.legacyId - right.legacyId,
    )
}

const countRouteOwner = (
  routes: TargetPlanRoute[],
  owner: (typeof contentArchitectureContract.approvedProductionScope.routeOwners)[number],
): number =>
  routes.filter((route) => {
    if (owner.ownership === 'derived-collection-route') {
      return route.ownerKind === 'virtual-index' && route.targetCollection === owner.targetOwner
    }
    return (
      route.ownerKind === 'payload-document' &&
      route.sourcePostType === owner.sourceType &&
      route.targetCollection === owner.targetOwner
    )
  }).length

const verifyPlan = (plan: ProductionTargetPlan, missingTerms: string[]): TargetPlanVerification => {
  const uniqueCanonicalPaths = new Set(plan.routes.map(({ canonicalPath }) => canonicalPath)).size
  const requiredRoutePolicies = plan.routes.filter(
    ({ routePolicy }) => routePolicy === 'required',
  ).length
  const configuredVirtualIndexes = plan.routes.filter(
    ({ archetype, configFieldPath, configGlobal, ownerKind }) => {
      if (ownerKind !== 'virtual-index') return false
      const expected = virtualConfigReferences[archetype]
      return (
        Boolean(expected) &&
        configGlobal === expected.configGlobal &&
        configFieldPath === expected.configFieldPath
      )
    },
  ).length
  const expectedManagedTaxonomies =
    contentArchitectureContract.approvedProductionScope.managedTaxonomies
  const expectedManagedTaxonomyCount = expectedManagedTaxonomies.reduce(
    (total, taxonomy) => total + taxonomy.count,
    0,
  )
  const expectedLearningVideoCategories =
    expectedManagedTaxonomies.find(
      ({ targetCollection }) => targetCollection === 'learning-video-categories',
    )?.count || 0
  const expectedRouteCount = contentArchitectureContract.approvedProductionScope.publicRouteTotal
  const expectedVirtualIndexCount = contentArchitectureContract.approvedProductionScope.routeOwners
    .filter(({ ownership }) => ownership === 'derived-collection-route')
    .reduce((total, { count }) => total + count, 0)
  const expectedPayloadDocumentCount = expectedRouteCount - expectedVirtualIndexCount
  const acceptedRoutes = [...pilotScope.roots, ...pilotScope.acceptedRouteDependencies]
  const assertions = [
    { id: 'routes', expected: expectedRouteCount, actual: plan.routes.length },
    {
      id: 'payload-documents',
      expected: expectedPayloadDocumentCount,
      actual: plan.routes.filter(({ ownerKind }) => ownerKind === 'payload-document').length,
    },
    {
      id: 'virtual-indexes',
      expected: expectedVirtualIndexCount,
      actual: plan.routes.filter(({ ownerKind }) => ownerKind === 'virtual-index').length,
    },
    {
      id: 'unique-canonical-paths',
      expected: expectedRouteCount,
      actual: uniqueCanonicalPaths,
    },
    {
      id: 'required-route-policies',
      expected: expectedRouteCount,
      actual: requiredRoutePolicies,
    },
    {
      id: 'configured-virtual-indexes',
      expected: expectedVirtualIndexCount,
      actual: configuredVirtualIndexes,
    },
    {
      id: 'poc-ready-documents',
      expected: acceptedRoutes.length,
      actual: plan.routes.filter(({ contentState }) => contentState === 'poc-ready').length,
    },
    {
      id: 'plan-only-documents',
      expected: expectedPayloadDocumentCount - acceptedRoutes.length,
      actual: plan.routes.filter(({ contentState }) => contentState === 'plan-only').length,
    },
    {
      id: 'system-ready-routes',
      expected: expectedVirtualIndexCount,
      actual: plan.routes.filter(({ contentState }) => contentState === 'system-ready').length,
    },
    {
      id: 'managed-taxonomies',
      expected: expectedManagedTaxonomyCount,
      actual: plan.taxonomies.length,
    },
    {
      id: 'learning-video-categories',
      expected: expectedLearningVideoCategories,
      actual: plan.taxonomies.filter(
        ({ targetCollection }) => targetCollection === 'learning-video-categories',
      ).length,
    },
    {
      id: 'missing-managed-taxonomy-terms',
      expected: 0,
      actual: missingTerms.length,
    },
    {
      id: 'redirect-candidates',
      expected: 50,
      actual: plan.redirects.length,
    },
    ...pilotScope.roots.map((root) => ({
      id: `poc-root:${root.legacyId}`,
      expected: 1,
      actual: plan.routes.filter((route) => matchesAcceptedRoute(route, root)).length,
    })),
    ...pilotScope.acceptedRouteDependencies.map((dependency) => ({
      id: `accepted-route-dependency:${dependency.legacyId}`,
      expected: 1,
      actual: plan.routes.filter((route) => matchesAcceptedRoute(route, dependency)).length,
    })),
    ...expectedManagedTaxonomies.flatMap((taxonomy) => [
      {
        id: `managed-taxonomy:${taxonomy.sourceTaxonomy}`,
        expected: taxonomy.count,
        actual: plan.taxonomies.filter(
          ({ sourceTaxonomy }) => sourceTaxonomy === taxonomy.sourceTaxonomy,
        ).length,
      },
      {
        id: `managed-taxonomy-target:${taxonomy.sourceTaxonomy}:${taxonomy.targetCollection}`,
        expected: taxonomy.count,
        actual: plan.taxonomies.filter(
          ({ sourceTaxonomy, targetCollection }) =>
            sourceTaxonomy === taxonomy.sourceTaxonomy &&
            targetCollection === taxonomy.targetCollection,
        ).length,
      },
    ]),
    ...contentArchitectureContract.approvedProductionScope.routeOwners.map((owner) => ({
      id: `route-owner:${owner.id}`,
      expected: owner.count,
      actual: countRouteOwner(plan.routes, owner),
    })),
  ].map(({ actual, expected, id }) => ({
    id,
    expected,
    actual,
    passed: actual === expected,
  }))
  const failures = [
    ...assertions
      .filter(({ passed }) => !passed)
      .map(({ actual, expected, id }) => `${id}: expected ${expected}, received ${actual}`),
    ...missingTerms.map((key) => `Missing managed taxonomy source term: ${key}`),
  ]

  return targetPlanVerificationSchema.parse({
    schemaVersion: 1,
    scope: 'production',
    status: failures.length === 0 ? 'passed' : 'failed',
    assertions,
    failures,
  })
}

export const buildProductionTargetPlan = (
  inventory: ProductionInventory,
  snapshot: RuntimeInventorySnapshot,
  evidence: PlanEvidence,
): { plan: ProductionTargetPlan; verification: TargetPlanVerification } => {
  const routes = buildRoutes(inventory)
  const taxonomies = buildTaxonomies(inventory, snapshot)
  const redirects = buildRedirects(inventory, snapshot, routes)
  const plan = productionTargetPlanSchema.parse({
    schemaVersion: 1,
    scope: 'production',
    evidence,
    summary: {
      routes: routes.length,
      payloadDocuments: routes.filter(({ ownerKind }) => ownerKind === 'payload-document').length,
      virtualIndexes: routes.filter(({ ownerKind }) => ownerKind === 'virtual-index').length,
      pocReadyDocuments: routes.filter(({ contentState }) => contentState === 'poc-ready').length,
      planOnlyDocuments: routes.filter(({ contentState }) => contentState === 'plan-only').length,
      systemReadyRoutes: routes.filter(({ contentState }) => contentState === 'system-ready')
        .length,
      managedTaxonomies: taxonomies.records.length,
      learningVideoCategories: taxonomies.records.filter(
        ({ targetCollection }) => targetCollection === 'learning-video-categories',
      ).length,
      redirectCandidates: redirects.length,
      activeRedirects: redirects.filter(({ decision }) => decision === 'active').length,
      inactiveRedirects: redirects.filter(({ decision }) => decision === 'inactive-review').length,
    },
    routes,
    taxonomies: taxonomies.records,
    redirects,
  })
  const verification = verifyPlan(plan, taxonomies.missingTerms)
  return { plan, verification }
}
