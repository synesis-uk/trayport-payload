import crypto from 'node:crypto'

import { contentArchitectureContract } from '../mappings/contentArchitecture'
import type { ProductionScope } from '../scopes/production'
import type {
  InventoryDependency,
  ProductionInventory,
  RuntimeInventoryNode,
  RuntimeInventorySnapshot,
} from './contracts'
import { classifyInventoryNode, inventoryUtilities } from './discover'

type RouteManifestRow = {
  path: string
  canonicalPath: string
  wpId: number | null
  wpType: string
  wpStatus: string
  template: string
  authoritativeField: string
  scopeRoles: string
  sources: string
  archetype: string
  targetOwner: string
  disposition: string
  dependencyCount: number
}

type LayoutCoverageEntry = {
  layout: string
  scope: RuntimeInventoryNode['componentLayouts'][number]['scope']
  classification: 'contract-disposition' | 'unknown'
  disposition: string | null
  targets: string[]
  dynamicDependencyPostTypes: string[]
  occurrences: number
  routeCount: number
  postTypes: string[]
  targetOwners: string[]
  authoritativeFields: string[]
  sampleLegacyIds: number[]
}

type TaxonomyCoverageEntry = {
  taxonomy: string
  classification: 'contract-disposition' | 'unknown'
  disposition: string | null
  targets: string[]
  terms: number
  occurrences: number
  roles: string[]
  sampleLegacyIds: number[]
}

type InventoryVerification = {
  schemaVersion: 1
  scope: 'production'
  status: 'passed' | 'failed'
  assertions: Array<{
    id: string
    expected: number
    actual: number
    passed: boolean
  }>
  failures: string[]
}

const sha256 = (value: string): string => crypto.createHash('sha256').update(value).digest('hex')

const jsonText = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const csvCell = (value: string | number | null): string => {
  const text = value === null ? '' : String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const routeDependencyCounts = (inventory: ProductionInventory): Map<number, number> => {
  const counts = new Map<number, number>()
  for (const edge of inventory.edges) {
    const match = /^post:(\d+)$/.exec(edge.from)
    if (!match) continue
    const legacyId = Number(match[1])
    counts.set(legacyId, (counts.get(legacyId) || 0) + 1)
  }
  return counts
}

const dependencyDisposition = (dependency: InventoryDependency): string =>
  dependency.roles.includes('reference-only') ? 'reference-only' : 'dependency-only'

export const buildRouteManifest = (
  inventory: ProductionInventory,
  snapshot: RuntimeInventorySnapshot,
): string => {
  const nodesByID = new Map(snapshot.nodes.map((node) => [node.legacyId, node]))
  const counts = routeDependencyCounts(inventory)
  const rows: RouteManifestRow[] = inventory.routes.map((route) => ({
    path: route.path,
    canonicalPath: route.canonicalPath,
    wpId: route.legacyId,
    wpType: route.postType,
    wpStatus: route.status,
    template: route.template,
    authoritativeField: route.authoritativeField,
    scopeRoles: route.roles.join('|'),
    sources: route.sources.join('|'),
    archetype: route.archetype,
    targetOwner: route.targetOwner,
    disposition: route.disposition,
    dependencyCount: route.dependencyCount,
  }))

  for (const dependency of inventory.dependencies) {
    if (dependency.kind !== 'post' || !dependency.path) continue
    const node = nodesByID.get(dependency.legacyId)
    if (!node) continue
    const classification = classifyInventoryNode(node)
    rows.push({
      path: dependency.path,
      canonicalPath: dependency.path,
      wpId: dependency.legacyId,
      wpType: node.postType,
      wpStatus: node.status,
      template: node.template || 'unknown',
      authoritativeField: node.authoritativeField,
      scopeRoles: dependency.roles.join('|') || 'dependency',
      sources: dependency.sources.join('|') || 'unknown',
      archetype: classification.archetype,
      targetOwner: classification.targetOwner,
      disposition: dependencyDisposition(dependency),
      dependencyCount: counts.get(node.legacyId) || 0,
    })
  }

  for (const exclusion of inventory.exclusions) {
    const node = nodesByID.get(exclusion.legacyId)
    const classification = node
      ? classifyInventoryNode(node)
      : { archetype: 'unknown:missing-exclusion', targetOwner: 'unresolved' }
    rows.push({
      path: exclusion.path,
      canonicalPath: exclusion.canonicalPath || 'unknown',
      wpId: exclusion.legacyId,
      wpType: node?.postType || 'unknown',
      wpStatus: node?.status || 'unknown',
      template: node?.template || 'unknown',
      authoritativeField: node?.authoritativeField || 'unknown',
      scopeRoles: 'excluded',
      sources: exclusion.sources.join('|') || 'scope.exclusions',
      archetype: classification.archetype,
      targetOwner: classification.targetOwner,
      disposition: 'excluded',
      dependencyCount: node ? counts.get(node.legacyId) || 0 : 0,
    })
  }

  for (const redirect of inventory.redirects) {
    rows.push({
      path: redirect.from || 'unknown',
      canonicalPath: inventoryUtilities.normalizePath(redirect.to) || 'unknown',
      wpId: redirect.legacyId,
      wpType: 'redirect',
      wpStatus: redirect.status,
      template: 'redirect-rule',
      authoritativeField: 'all-acf-fields',
      scopeRoles: 'redirect',
      sources: `redirect:${redirect.legacyId}`,
      archetype: 'redirect',
      targetOwner: 'redirects',
      disposition: 'redirect',
      dependencyCount: 0,
    })
  }

  rows.sort(
    (left, right) =>
      left.path.localeCompare(right.path) ||
      left.disposition.localeCompare(right.disposition) ||
      (left.wpId || 0) - (right.wpId || 0),
  )

  const columns: Array<keyof RouteManifestRow> = [
    'path',
    'canonicalPath',
    'wpId',
    'wpType',
    'wpStatus',
    'template',
    'authoritativeField',
    'scopeRoles',
    'sources',
    'archetype',
    'targetOwner',
    'disposition',
    'dependencyCount',
  ]
  return `${[
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(',')),
  ].join('\n')}\n`
}

export const buildLayoutCoverage = (
  inventory: ProductionInventory,
  snapshot: RuntimeInventorySnapshot,
  scope: ProductionScope,
): {
  schemaVersion: 1
  scope: 'production'
  summary: {
    reachableNodes: number
    layoutOccurrences: number
    layouts: number
    unknownLayouts: number
    taxonomies: number
    unknownTaxonomies: number
  }
  authoritativeFields: Array<{ field: string; nodes: number; legacyIds: number[] }>
  templates: Array<{
    template: string
    classification: string
    nodes: number
    authoritativeFields: string[]
    targetOwners: string[]
    legacyIds: number[]
  }>
  layouts: LayoutCoverageEntry[]
  unknownLayouts: string[]
  taxonomies: TaxonomyCoverageEntry[]
  unknownTaxonomies: string[]
} => {
  const reachableIDs = new Set<number>()
  for (const route of inventory.routes.filter(({ disposition }) => disposition === 'included')) {
    if (route.legacyId !== null) reachableIDs.add(route.legacyId)
  }
  for (const dependency of inventory.dependencies) {
    if (dependency.kind === 'post' && dependency.roles.some((role) => role !== 'reference-only')) {
      reachableIDs.add(dependency.legacyId)
    }
  }
  const reachableNodes = snapshot.nodes.filter(({ legacyId }) => reachableIDs.has(legacyId))

  const authoritative = new Map<string, number[]>()
  const templates = new Map<string, RuntimeInventoryNode[]>()
  const layouts = new Map<
    string,
    Array<{
      node: RuntimeInventoryNode
      scope: RuntimeInventoryNode['componentLayouts'][number]['scope']
      sourcePath: string
    }>
  >()

  for (const node of reachableNodes) {
    const fieldIDs = authoritative.get(node.authoritativeField) || []
    fieldIDs.push(node.legacyId)
    authoritative.set(node.authoritativeField, fieldIDs)

    const template = node.template || `post-type-default:${node.postType}`
    const templateNodes = templates.get(template) || []
    templateNodes.push(node)
    templates.set(template, templateNodes)

    for (const component of node.componentLayouts) {
      const key = `${component.scope}:${component.layout}`
      const occurrences = layouts.get(key) || []
      occurrences.push({
        node,
        scope: component.scope,
        sourcePath: component.sourcePath,
      })
      layouts.set(key, occurrences)
    }
  }

  const contractDispositions = new Map(
    contentArchitectureContract.legacyLayoutDispositions.map((disposition) => [
      `${disposition.scope}:${disposition.source}`,
      disposition,
    ]),
  )
  const layoutEntries: LayoutCoverageEntry[] = [...layouts.entries()]
    .map(([key, occurrences]) => {
      const [first] = occurrences
      const layout = key.slice(key.indexOf(':') + 1)
      const occurrenceScope = first.scope
      const nodes = new Map(occurrences.map(({ node }) => [node.legacyId, node]))
      const disposition = contractDispositions.get(key)
      return {
        layout,
        scope: occurrenceScope,
        classification: disposition ? 'contract-disposition' : 'unknown',
        disposition: disposition?.disposition || null,
        targets: disposition ? [...disposition.targets].sort() : [],
        dynamicDependencyPostTypes: [...(scope.componentListingPostTypes[layout] || [])].sort(),
        occurrences: occurrences.length,
        routeCount: nodes.size,
        postTypes: [...new Set([...nodes.values()].map(({ postType }) => postType))].sort(),
        targetOwners: [
          ...new Set([...nodes.values()].map((node) => classifyInventoryNode(node).targetOwner)),
        ].sort(),
        authoritativeFields: [
          ...new Set([...nodes.values()].map(({ authoritativeField }) => authoritativeField)),
        ].sort(),
        sampleLegacyIds: [...nodes.keys()].sort((a, b) => a - b).slice(0, 12),
      } satisfies LayoutCoverageEntry
    })
    .sort(
      (left, right) =>
        left.scope.localeCompare(right.scope) || left.layout.localeCompare(right.layout),
    )

  const unknownLayouts = layoutEntries
    .filter(({ classification }) => classification === 'unknown')
    .map(({ layout, scope: occurrenceScope }) => `${occurrenceScope}:${layout}`)

  const contractTaxonomies = new Map(
    contentArchitectureContract.legacyLayoutDispositions
      .filter(({ scope: dispositionScope }) => dispositionScope === 'taxonomy')
      .map((disposition) => [disposition.source, disposition]),
  )
  const taxonomyDependencies = new Map<string, InventoryDependency[]>()
  for (const dependency of inventory.dependencies) {
    if (dependency.kind !== 'term') continue
    const dependencies = taxonomyDependencies.get(dependency.subType) || []
    dependencies.push(dependency)
    taxonomyDependencies.set(dependency.subType, dependencies)
  }
  const termOccurrences = new Map<string, number>()
  for (const edge of inventory.edges) {
    if (edge.kind !== 'term-dependency') continue
    termOccurrences.set(edge.to, (termOccurrences.get(edge.to) || 0) + 1)
  }
  const taxonomyEntries: TaxonomyCoverageEntry[] = [...taxonomyDependencies.entries()]
    .map(([taxonomy, dependencies]) => {
      const disposition = contractTaxonomies.get(taxonomy)
      return {
        taxonomy,
        classification: disposition ? 'contract-disposition' : 'unknown',
        disposition: disposition?.disposition || null,
        targets: disposition ? [...disposition.targets].sort() : [],
        terms: dependencies.length,
        occurrences: dependencies.reduce(
          (total, dependency) => total + (termOccurrences.get(dependency.key) || 0),
          0,
        ),
        roles: [...new Set(dependencies.flatMap(({ roles }) => roles))].sort(),
        sampleLegacyIds: dependencies
          .map(({ legacyId }) => legacyId)
          .sort((a, b) => a - b)
          .slice(0, 12),
      } satisfies TaxonomyCoverageEntry
    })
    .sort((left, right) => left.taxonomy.localeCompare(right.taxonomy))
  const unknownTaxonomies = taxonomyEntries
    .filter(({ classification }) => classification === 'unknown')
    .map(({ taxonomy }) => taxonomy)

  return {
    schemaVersion: 1,
    scope: 'production',
    summary: {
      reachableNodes: reachableNodes.length,
      layoutOccurrences: layoutEntries.reduce((total, { occurrences }) => total + occurrences, 0),
      layouts: layoutEntries.length,
      unknownLayouts: unknownLayouts.length,
      taxonomies: taxonomyEntries.length,
      unknownTaxonomies: unknownTaxonomies.length,
    },
    authoritativeFields: [...authoritative.entries()]
      .map(([field, legacyIds]) => ({
        field,
        nodes: legacyIds.length,
        legacyIds: legacyIds.sort((a, b) => a - b),
      }))
      .sort((left, right) => left.field.localeCompare(right.field)),
    templates: [...templates.entries()]
      .map(([template, nodes]) => ({
        template,
        classification: template.startsWith('post-type-default:')
          ? 'post-type-default'
          : 'explicit-template',
        nodes: nodes.length,
        authoritativeFields: [
          ...new Set(nodes.map(({ authoritativeField }) => authoritativeField)),
        ].sort(),
        targetOwners: [
          ...new Set(nodes.map((node) => classifyInventoryNode(node).targetOwner)),
        ].sort(),
        legacyIds: nodes.map(({ legacyId }) => legacyId).sort((a, b) => a - b),
      }))
      .sort((left, right) => left.template.localeCompare(right.template)),
    layouts: layoutEntries,
    unknownLayouts,
    taxonomies: taxonomyEntries,
    unknownTaxonomies,
  }
}

export const verifyProductionInventory = (
  inventory: ProductionInventory,
  layoutCoverage: ReturnType<typeof buildLayoutCoverage>,
  scope: ProductionScope,
): InventoryVerification => {
  const includedRoutes = inventory.routes.filter(({ disposition }) => disposition === 'included')
  const countIncludedRoutes = (
    predicate: (route: ProductionInventory['routes'][number]) => boolean,
  ): number => includedRoutes.filter(predicate).length
  const errorIssues = inventory.issues.filter(({ severity }) => severity === 'error').length
  const duplicateCanonicalOwners = inventory.issues.filter(
    ({ code }) => code === 'duplicate-canonical-path',
  ).length
  const observed: Record<keyof ProductionScope['expectedInventory'], number> = {
    directPublicRoutes: inventory.summary.directPublicRoutes,
    listingRoutes: inventory.summary.listingRoutes,
    routes: inventory.summary.routes,
    redirects: inventory.summary.redirects,
    exclusions: inventory.summary.exclusions,
    unknownArchetypes: inventory.summary.unknownArchetypes,
    unknownLayouts: layoutCoverage.summary.unknownLayouts,
    unknownTaxonomies: layoutCoverage.summary.unknownTaxonomies,
    errorIssues,
    duplicateCanonicalOwners,
  }
  const aggregateAssertions = (
    Object.entries(scope.expectedInventory) as Array<
      [keyof ProductionScope['expectedInventory'], number]
    >
  ).map(([id, expected]) => ({
    id,
    expected,
    actual: observed[id],
    passed: observed[id] === expected,
  }))
  const routeOwnerMatchers: Record<
    string,
    (route: ProductionInventory['routes'][number]) => boolean
  > = {
    'page-documents': ({ archetype, legacyId, postType, targetOwner }) =>
      legacyId !== null &&
      postType === 'page' &&
      targetOwner === 'pages' &&
      archetype.startsWith('page.'),
    'temporary-contact-redirect': ({ archetype, legacyId, postType, targetOwner }) =>
      legacyId === 4031 &&
      postType === 'page' &&
      targetOwner === 'redirects' &&
      archetype === 'redirect.temporary-contact',
    'venue-index': ({ archetype, legacyId, postType, targetOwner }) =>
      legacyId === null &&
      postType === 'virtual' &&
      targetOwner === 'venues' &&
      archetype === 'index.venue',
    'market-coverage-index': ({ archetype, legacyId, postType, targetOwner }) =>
      legacyId === null &&
      postType === 'virtual' &&
      targetOwner === 'hubs' &&
      archetype === 'index.market-coverage',
    'editorial-posts': ({ archetype, legacyId, postType, targetOwner }) =>
      legacyId !== null &&
      postType === 'post' &&
      targetOwner === 'articles' &&
      archetype === 'article.full',
    'legacy-event-details': ({ archetype, legacyId, postType, targetOwner }) =>
      legacyId !== null &&
      postType === 'events' &&
      targetOwner === 'articles' &&
      archetype === 'article.full',
    'people-details': ({ archetype, legacyId, postType, targetOwner }) =>
      legacyId !== null &&
      postType === 'people' &&
      targetOwner === 'people' &&
      archetype === 'person.public-profile',
    'venue-details': ({ archetype, legacyId, postType, targetOwner }) =>
      legacyId !== null &&
      postType === 'venue' &&
      targetOwner === 'venues' &&
      archetype === 'venue.public-detail',
    'hub-details': ({ archetype, legacyId, postType, targetOwner }) =>
      legacyId !== null &&
      postType === 'hub' &&
      targetOwner === 'hubs' &&
      archetype === 'hub.public-page',
    'learning-video-details': ({ archetype, legacyId, postType, targetOwner }) =>
      legacyId !== null &&
      postType === 'learning-hub-video' &&
      targetOwner === 'learning-videos' &&
      archetype === 'learning-video.public-detail',
  }
  const routeOwnerAssertions = contentArchitectureContract.approvedProductionScope.routeOwners.map(
    ({ count: expected, id }) => {
      const matcher = routeOwnerMatchers[id]
      const actual = matcher ? countIncludedRoutes(matcher) : 0
      return {
        id: `route-owner:${id}`,
        expected,
        actual,
        passed: actual === expected,
      }
    },
  )
  const assertions = [...aggregateAssertions, ...routeOwnerAssertions]
  const failures = assertions
    .filter(({ passed }) => !passed)
    .map(({ id, expected, actual }) => `${id}: expected ${expected}, received ${actual}`)

  return {
    schemaVersion: 1,
    scope: 'production',
    status: failures.length === 0 ? 'passed' : 'failed',
    assertions,
    failures,
  }
}

const buildNDJSON = (inventory: ProductionInventory): string => {
  const records: unknown[] = [
    {
      entity: 'manifest',
      schemaVersion: inventory.schemaVersion,
      scope: inventory.scope,
      source: inventory.source,
      summary: inventory.summary,
    },
    ...inventory.routes.map((record) => ({ entity: 'route', ...record })),
    ...inventory.dependencies.map((record) => ({ entity: 'dependency', ...record })),
    ...inventory.redirects.map((record) => ({ entity: 'redirect', ...record })),
    ...inventory.exclusions.map((record) => ({ entity: 'exclusion', ...record })),
    ...inventory.edges.map((record) => ({ entity: 'edge', ...record })),
    ...inventory.issues.map((record) => ({ entity: 'issue', ...record })),
  ]
  return `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
}

export const buildInventoryArtifacts = (
  inventory: ProductionInventory,
  snapshot: RuntimeInventorySnapshot,
  scope: ProductionScope,
  snapshotHash: string,
): {
  inventoryText: string
  ndjsonText: string
  routeManifestCSV: string
  layoutCoverageText: string
  verificationText: string
  summaryText: string
  verification: InventoryVerification
  hashes: {
    snapshot: string
    inventory: string
    ndjson: string
    routeManifest: string
    layoutCoverage: string
    verification: string
  }
} => {
  const inventoryText = jsonText(inventory)
  const ndjsonText = buildNDJSON(inventory)
  const routeManifestCSV = buildRouteManifest(inventory, snapshot)
  const layoutCoverage = buildLayoutCoverage(inventory, snapshot, scope)
  const layoutCoverageText = jsonText(layoutCoverage)
  const verification = verifyProductionInventory(inventory, layoutCoverage, scope)
  const verificationText = jsonText(verification)
  const hashes = {
    snapshot: snapshotHash,
    inventory: sha256(inventoryText),
    ndjson: sha256(ndjsonText),
    routeManifest: sha256(routeManifestCSV),
    layoutCoverage: sha256(layoutCoverageText),
    verification: sha256(verificationText),
  }
  const summaryText = jsonText({
    schemaVersion: 1,
    scope: 'production',
    source: inventory.source,
    counts: inventory.summary,
    verification: {
      status: verification.status,
      failures: verification.failures,
    },
    hashes,
    artifacts: {
      sourceSnapshot: 'source-snapshot.json',
      inventory: 'production-inventory.json',
      ndjson: 'production-inventory.ndjson',
      routeManifest: 'route-manifest.csv',
      layoutCoverage: 'layout-coverage.json',
      verification: 'verification.json',
    },
  })

  return {
    inventoryText,
    ndjsonText,
    routeManifestCSV,
    layoutCoverageText,
    verificationText,
    summaryText,
    verification,
    hashes,
  }
}
