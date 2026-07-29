import { contentArchitectureContract } from '../mappings/contentArchitecture'
import type { ProductionScope } from '../scopes/production'
import type {
  InventoryDependency,
  InventoryEdge,
  InventoryExclusion,
  InventoryIssue,
  InventoryRedirect,
  InventoryRoute,
  InventoryRouteRole,
  ProductionInventory,
  RuntimeInventoryNode,
  RuntimeInventorySeed,
  RuntimeInventorySnapshot,
  RuntimeReference,
} from './contracts'

type RouteState = {
  node: RuntimeInventoryNode
  authoredPaths: Set<string>
  roles: Set<InventoryRouteRole>
  sources: Set<string>
}

type DependencyPostState = {
  node: RuntimeInventoryNode
  roles: Set<string>
  sources: Set<string>
}

type DependencyState = {
  roles: Set<string>
  sources: Set<string>
}

type VirtualRouteState = {
  route: ProductionScope['virtualRoutes'][number]
  roles: Set<InventoryRouteRole>
  sources: Set<string>
}

const sortStrings = <Value extends string>(values: Iterable<Value>): Value[] =>
  [...values].sort((a, b) => a.localeCompare(b))

const normalizePath = (value: string | null | undefined): string | null => {
  if (!value) return null
  let parsed: URL
  try {
    parsed = new URL(value, 'https://inventory.invalid')
  } catch {
    return null
  }

  let path = `/${parsed.pathname.replace(/^\/+/, '')}`.replace(/\/{2,}/g, '/')
  if (path !== '/' && !path.endsWith('/') && !/\.[a-z0-9]{1,8}$/i.test(path)) {
    path = `${path}/`
  }
  const pageID = parsed.searchParams.get('page_id')
  return pageID && /^\d+$/.test(pageID) ? `${path}?page_id=${Number(pageID)}` : path
}

const urlHost = (value: string, sourceHome: string): string | null => {
  try {
    return new URL(value, sourceHome).hostname.toLowerCase()
  } catch {
    return null
  }
}

const nodeKey = (legacyId: number): string => `post:${legacyId}`
const mediaKey = (legacyId: number): string => `media:${legacyId}`
const termKey = (taxonomy: string, legacyId: number): string => `term:${taxonomy}:${legacyId}`
const contractArchetypes = new Set(contentArchitectureContract.archetypes.map(({ id }) => id))

export const classifyInventoryNode = (
  node: RuntimeInventoryNode,
): { archetype: string; targetOwner: string } => {
  if (node.postType === 'page') {
    const contentIndexTemplates = new Set([
      'layouts/articles-list.blade.php',
      'layouts/learning-hub-home.blade.php',
    ])
    const path = normalizePath(node.path)
    const legalTemplate =
      node.template === 'layouts/article.blade.php' ||
      node.template === 'layouts/cookie-consent.blade.php'
    const legalPath = path?.startsWith('/legal/') === true || path === '/terms-of-use-disclaimer/'
    const conversionPath = path === '/contact/' || path === '/request-a-demo/'
    return {
      archetype:
        path === '/'
          ? 'page.homepage'
          : node.template === 'layouts/market-matrix.blade.php'
            ? 'page.interactive-market-matrix'
            : contentIndexTemplates.has(node.template)
              ? 'page.content-index'
              : legalTemplate || legalPath
                ? 'page.legal'
                : conversionPath
                  ? 'page.conversion'
                  : path?.startsWith('/products/')
                    ? 'page.product'
                    : 'page.standard',
      targetOwner: 'pages',
    }
  }
  if (node.postType === 'post') {
    return { archetype: 'article.full', targetOwner: 'articles' }
  }
  if (node.postType === 'hub') {
    return { archetype: 'hub.public-page', targetOwner: 'hubs' }
  }
  if (node.postType === 'venue') {
    return { archetype: 'venue.public-detail', targetOwner: 'venues' }
  }
  if (node.postType === 'redirect') {
    return { archetype: 'redirect', targetOwner: 'redirects' }
  }
  if (node.postType === 'learning-hub-video') {
    return {
      archetype: 'learning-video.public-detail',
      targetOwner: 'learning-videos',
    }
  }
  return { archetype: `unknown:${node.postType}`, targetOwner: 'unresolved' }
}

const compareEdges = (left: InventoryEdge, right: InventoryEdge): number =>
  [left.from, left.to, left.kind, left.sourcePath]
    .join('|')
    .localeCompare([right.from, right.to, right.kind, right.sourcePath].join('|'))

const compareIssues = (left: InventoryIssue, right: InventoryIssue): number =>
  [left.code, left.source, left.target || '', left.message]
    .join('|')
    .localeCompare([right.code, right.source, right.target || '', right.message].join('|'))

export const discoverProductionInventory = (
  snapshot: RuntimeInventorySnapshot,
  scope: ProductionScope,
): ProductionInventory => {
  const nodesByID = new Map(snapshot.nodes.map((node) => [node.legacyId, node]))
  const nodesByPath = new Map<string, RuntimeInventoryNode>()
  for (const node of snapshot.nodes) {
    const path = normalizePath(node.path)
    if (path && !nodesByPath.has(path)) nodesByPath.set(path, node)
  }

  const mediaByID = new Map(snapshot.media.map((media) => [media.legacyId, media]))
  const termsByKey = new Map(
    snapshot.terms.map((term) => [termKey(term.taxonomy, term.legacyId), term]),
  )
  const sourceHosts = new Set(
    [snapshot.source.home, snapshot.source.site, 'https://trayport.com', 'https://www.trayport.com']
      .map((value) => urlHost(value, snapshot.source.home))
      .filter((value): value is string => Boolean(value)),
  )
  const overrideByPath = new Map<string | null, ProductionScope['canonicalRouteOverrides'][number]>(
    scope.canonicalRouteOverrides.map((override) => [normalizePath(override.sourcePath), override]),
  )
  const virtualRoutesByPath = new Map<string | null, ProductionScope['virtualRoutes'][number]>(
    scope.virtualRoutes.map((route) => [normalizePath(route.path), route]),
  )
  const exclusionsByID = new Map<number, ProductionScope['exclusions'][number]>(
    scope.exclusions.map((exclusion) => [exclusion.legacyId, exclusion]),
  )
  const exclusionsByPath = new Map<string | null, ProductionScope['exclusions'][number]>(
    scope.exclusions.map((exclusion) => [normalizePath(exclusion.path), exclusion]),
  )

  const routes = new Map<number, RouteState>()
  const virtualRoutes = new Map<string, VirtualRouteState>()
  const dependencyPosts = new Map<number, DependencyPostState>()
  const dependencyMedia = new Map<number, DependencyState>()
  const dependencyTerms = new Map<string, DependencyState>()
  const exclusionSources = new Map<number, Set<string>>()
  const edges = new Map<string, InventoryEdge>()
  const issues = new Map<string, InventoryIssue>()
  const queue: number[] = []
  const processed = new Set<number>()
  const listingRouteIDs = new Set<number>()
  const directPublicKeys = new Set<string>()
  const authoredDirectPaths = new Set<string>()

  const addIssue = (issue: InventoryIssue): void => {
    const key = [issue.code, issue.source, issue.target || '', issue.message].join('|')
    issues.set(key, issue)
  }

  const addEdge = (edge: InventoryEdge): void => {
    const key = [edge.from, edge.to, edge.kind, edge.sourcePath].join('|')
    edges.set(key, edge)
  }

  const recordExclusion = (
    legacyId: number,
    source: string,
    authoredPath?: string | null,
  ): boolean => {
    const configured =
      exclusionsByID.get(legacyId) ||
      (authoredPath ? exclusionsByPath.get(normalizePath(authoredPath)) : undefined)
    if (!configured) return false
    const sources = exclusionSources.get(configured.legacyId) || new Set<string>()
    sources.add(source)
    exclusionSources.set(configured.legacyId, sources)
    return true
  }

  const addRoute = (
    node: RuntimeInventoryNode,
    role: InventoryRouteRole,
    source: string,
    authoredPath?: string | null,
    direct = false,
  ): void => {
    if (recordExclusion(node.legacyId, source, authoredPath)) return
    const current = routes.get(node.legacyId) || {
      node,
      authoredPaths: new Set<string>(),
      roles: new Set<InventoryRouteRole>(),
      sources: new Set<string>(),
    }
    const path = normalizePath(authoredPath)
    if (path) current.authoredPaths.add(path)
    current.roles.add(role)
    current.sources.add(source)
    routes.set(node.legacyId, current)

    if (node.status === 'publish' && node.postTypePublic && normalizePath(node.path)) {
      if (direct) directPublicKeys.add(nodeKey(node.legacyId))
      queue.push(node.legacyId)
    } else {
      addIssue({
        code: 'non-public-route',
        severity: 'warning',
        source,
        target: nodeKey(node.legacyId),
        message: `Referenced route ${node.legacyId} is ${node.status} or is not publicly viewable.`,
      })
    }
  }

  const isInternalURL = (url: string): boolean => {
    if (url.startsWith('/')) return true
    const host = urlHost(url, snapshot.source.home)
    return Boolean(host && sourceHosts.has(host))
  }

  const resolveRouteTarget = (
    postId: number | null,
    rawURL: string,
    source: string,
  ): RuntimeInventoryNode | undefined => {
    const authoredPath = normalizePath(rawURL)
    const override = authoredPath ? overrideByPath.get(authoredPath) : undefined
    if (override) {
      const node = nodesByID.get(override.legacyId)
      addIssue({
        code: 'canonical-route-override',
        severity: 'info',
        source,
        target: node ? nodeKey(node.legacyId) : null,
        message: override.reason,
      })
      return node
    }
    if (postId) return nodesByID.get(postId)
    return authoredPath ? nodesByPath.get(authoredPath) : undefined
  }

  const processSeed = (seed: RuntimeInventorySeed): void => {
    if (seed.kind === 'dropdown-root' && (seed.menuBlockCount || 0) > 0) return
    if (!seed.url || !isInternalURL(seed.url)) {
      if (seed.url) {
        addIssue({
          code: 'external-link',
          severity: 'info',
          source: seed.sourcePath,
          target: seed.url,
          message: 'External navigation/footer link is recorded but not added to route scope.',
        })
      }
      return
    }
    const authoredPath = normalizePath(seed.url)
    if (authoredPath) authoredDirectPaths.add(authoredPath)
    const virtualRoute = authoredPath ? virtualRoutesByPath.get(authoredPath) : undefined
    if (virtualRoute && authoredPath) {
      const current = virtualRoutes.get(authoredPath) || {
        route: virtualRoute,
        roles: new Set<InventoryRouteRole>(),
        sources: new Set<string>(),
      }
      const role: InventoryRouteRole = seed.origin === 'navigation' ? 'navigation' : 'footer'
      current.roles.add(role)
      current.sources.add(seed.sourcePath)
      virtualRoutes.set(authoredPath, current)
      directPublicKeys.add(`virtual:${authoredPath}`)
      addEdge({
        from: `global:${seed.origin}`,
        to: `virtual:${authoredPath}`,
        kind: role,
        sourcePath: seed.sourcePath,
      })
      return
    }
    const node = resolveRouteTarget(seed.postId, seed.url, seed.sourcePath)
    const configuredExclusion =
      (node && exclusionsByID.get(node.legacyId)) ||
      (authoredPath ? exclusionsByPath.get(authoredPath) : undefined)
    if (configuredExclusion) {
      recordExclusion(configuredExclusion.legacyId, seed.sourcePath, authoredPath)
      return
    }
    if (!node) {
      addIssue({
        code: 'unresolved-internal-url',
        severity: 'error',
        source: seed.sourcePath,
        target: seed.url,
        message: 'Internal navigation/footer URL did not resolve to an inventoried WordPress post.',
      })
      return
    }
    const role: InventoryRouteRole = seed.origin === 'navigation' ? 'navigation' : 'footer'
    addRoute(node, role, seed.sourcePath, authoredPath, true)
    addEdge({
      from: `global:${seed.origin}`,
      to: nodeKey(node.legacyId),
      kind: role,
      sourcePath: seed.sourcePath,
    })
  }

  for (const seed of [...snapshot.navigationCandidates, ...snapshot.footerCandidates]) {
    processSeed(seed)
  }

  for (const include of scope.explicitIncludes) {
    if (include.provenance !== 'public-navigation-override') {
      const path = normalizePath(include.path)
      if (path) authoredDirectPaths.add(path)
    }
    const node = nodesByID.get(include.legacyId)
    if (!node) {
      addIssue({
        code: 'missing-explicit-include',
        severity: 'error',
        source: `scope.explicitIncludes.${include.legacyId}`,
        target: nodeKey(include.legacyId),
        message: `Explicit production include ${include.legacyId} is missing from WordPress.`,
      })
      continue
    }
    addRoute(
      node,
      include.provenance,
      `scope.explicitIncludes.${include.legacyId}`,
      include.path,
      true,
    )
    addEdge({
      from: `scope:${include.provenance}`,
      to: nodeKey(node.legacyId),
      kind: 'navigation',
      sourcePath: `scope.explicitIncludes.${include.legacyId}`,
    })
  }

  const addDependencyPost = (
    node: RuntimeInventoryNode,
    role: string,
    source: string,
    recursive = true,
  ): void => {
    if (recordExclusion(node.legacyId, source, node.path)) return
    const current = dependencyPosts.get(node.legacyId) || {
      node,
      roles: new Set<string>(),
      sources: new Set<string>(),
    }
    current.roles.add(role)
    current.sources.add(source)
    dependencyPosts.set(node.legacyId, current)
    if (recursive) queue.push(node.legacyId)
  }

  const addMediaDependency = (legacyId: number, role: string, source: string): void => {
    const current = dependencyMedia.get(legacyId) || {
      roles: new Set<string>(),
      sources: new Set<string>(),
    }
    current.roles.add(role)
    current.sources.add(source)
    dependencyMedia.set(legacyId, current)
  }

  const addTermDependency = (
    taxonomy: string,
    legacyId: number,
    role: string,
    source: string,
  ): void => {
    const key = termKey(taxonomy, legacyId)
    const current = dependencyTerms.get(key) || {
      roles: new Set<string>(),
      sources: new Set<string>(),
    }
    current.roles.add(role)
    current.sources.add(source)
    dependencyTerms.set(key, current)
  }

  const processReference = (owner: RuntimeInventoryNode, reference: RuntimeReference): void => {
    const from = nodeKey(owner.legacyId)
    if (reference.kind === 'media' && reference.legacyId) {
      addMediaDependency(reference.legacyId, 'referenced-media', reference.sourcePath)
      addEdge({
        from,
        to: mediaKey(reference.legacyId),
        kind: 'media-dependency',
        sourcePath: reference.sourcePath,
      })
      return
    }
    if (reference.kind === 'term' && reference.legacyId && reference.taxonomy) {
      addTermDependency(
        reference.taxonomy,
        reference.legacyId,
        'referenced-term',
        reference.sourcePath,
      )
      addEdge({
        from,
        to: termKey(reference.taxonomy, reference.legacyId),
        kind: 'term-dependency',
        sourcePath: reference.sourcePath,
      })
      return
    }

    let target: RuntimeInventoryNode | undefined
    if (reference.kind === 'post' && reference.legacyId) {
      target = nodesByID.get(reference.legacyId)
    } else if (reference.kind === 'url' && reference.url) {
      if (!isInternalURL(reference.url)) {
        if (reference.intent === 'link') {
          addIssue({
            code: 'external-link',
            severity: 'info',
            source: reference.sourcePath,
            target: reference.url,
            message: 'External content link is outside the WordPress migration graph.',
          })
        }
        return
      }
      target = resolveRouteTarget(null, reference.url, reference.sourcePath)
    }

    if (!target) {
      if (reference.kind !== 'url' || reference.intent === 'link') {
        addIssue({
          code: reference.kind === 'url' ? 'unresolved-internal-url' : 'unresolved-reference',
          severity: 'warning',
          source: reference.sourcePath,
          target: reference.url || (reference.legacyId ? nodeKey(reference.legacyId) : null),
          message: 'Reachable content reference did not resolve to an inventoried WordPress post.',
        })
      }
      return
    }
    if (recordExclusion(target.legacyId, reference.sourcePath, reference.url || target.path)) return

    if (reference.intent === 'link') {
      // Authored body/ACF links are validation and redirect targets. They do not
      // broaden the public scope or recursively pull the destination's graph into
      // the migration closure.
      addDependencyPost(target, 'reference-only', reference.sourcePath, false)
      addEdge({
        from,
        to: nodeKey(target.legacyId),
        kind: 'content-link',
        sourcePath: reference.sourcePath,
      })
    } else {
      addDependencyPost(target, 'post-reference', reference.sourcePath)
      addEdge({
        from,
        to: nodeKey(target.legacyId),
        kind: 'post-dependency',
        sourcePath: reference.sourcePath,
      })
    }
  }

  const addListingItems = (
    owner: RuntimeInventoryNode,
    postTypes: readonly string[],
    sourcePath: string,
    asRoutes: boolean,
  ): void => {
    for (const item of snapshot.nodes) {
      if (item.status !== 'publish' || !postTypes.includes(item.postType)) continue
      if (exclusionsByID.has(item.legacyId)) {
        recordExclusion(item.legacyId, sourcePath, item.path)
        continue
      }
      if (asRoutes && item.postTypePublic && normalizePath(item.path)) {
        addRoute(item, 'listing-item', sourcePath, item.path)
        listingRouteIDs.add(item.legacyId)
        addEdge({
          from: nodeKey(owner.legacyId),
          to: nodeKey(item.legacyId),
          kind: 'listing-item',
          sourcePath,
        })
      } else {
        addDependencyPost(item, 'component-listing', sourcePath)
        addEdge({
          from: nodeKey(owner.legacyId),
          to: nodeKey(item.legacyId),
          kind: 'post-dependency',
          sourcePath,
        })
      }
    }
  }

  while (queue.length) {
    const legacyId = queue.shift()
    if (!legacyId || processed.has(legacyId)) continue
    const owner = nodesByID.get(legacyId)
    if (!owner || owner.postType === 'redirect') continue
    processed.add(legacyId)

    for (const reference of owner.references) processReference(owner, reference)

    for (const selector of owner.listingSelectors) {
      addListingItems(owner, [selector.postType], selector.sourcePath, true)
    }
    for (const rule of scope.listingRules) {
      if (rule.templates.includes(owner.template)) {
        addListingItems(owner, rule.postTypes, `scope.listingRules.${rule.id}`, true)
      }
    }
    for (const component of owner.componentLayouts) {
      const postTypes = scope.componentListingPostTypes[component.layout]
      if (postTypes?.length) {
        addListingItems(owner, postTypes, component.sourcePath, false)
      }
    }
  }

  for (const [legacyId, state] of routes) {
    if (state.node.status === 'publish' && state.node.postTypePublic) {
      dependencyPosts.delete(legacyId)
    }
  }

  const edgeList = [...edges.values()].sort(compareEdges)
  const dependencyCounts = new Map<number, number>()
  for (const edge of edgeList) {
    const match = /^post:(\d+)$/.exec(edge.from)
    if (!match) continue
    const legacyId = Number(match[1])
    dependencyCounts.set(legacyId, (dependencyCounts.get(legacyId) || 0) + 1)
  }

  const routeList: InventoryRoute[] = [...routes.values()]
    .map((state): InventoryRoute => {
      const canonicalPath = normalizePath(state.node.path) || '/'
      const authored = sortStrings(state.authoredPaths)
      const classification = classifyInventoryNode(state.node)
      const isPublic = state.node.status === 'publish' && state.node.postTypePublic
      return {
        legacyId: state.node.legacyId,
        title: state.node.title,
        path: authored[0] || canonicalPath,
        canonicalPath,
        postType: state.node.postType,
        status: state.node.status,
        template: state.node.template || 'unknown',
        authoritativeField: state.node.authoritativeField,
        roles: sortStrings(state.roles),
        sources: sortStrings(state.sources),
        archetype: classification.archetype,
        targetOwner: classification.targetOwner,
        disposition: isPublic ? 'included' : 'blocked-non-public',
        dependencyCount: dependencyCounts.get(state.node.legacyId) || 0,
      }
    })
    .sort(
      (left, right) =>
        left.canonicalPath.localeCompare(right.canonicalPath) ||
        (left.legacyId || 0) - (right.legacyId || 0),
    )
  for (const [path, state] of virtualRoutes) {
    routeList.push({
      legacyId: null,
      title: state.route.title,
      path,
      canonicalPath: path,
      postType: 'virtual',
      status: 'publish',
      template: 'virtual',
      authoritativeField: 'synthetic-route',
      roles: sortStrings(state.roles),
      sources: sortStrings(state.sources),
      archetype: state.route.archetype,
      targetOwner: state.route.targetOwner,
      disposition: 'included',
      dependencyCount: 0,
    })
  }
  routeList.sort(
    (left, right) =>
      left.canonicalPath.localeCompare(right.canonicalPath) ||
      (left.legacyId || 0) - (right.legacyId || 0),
  )

  const canonicalOwners = new Map<string, InventoryRoute[]>()
  for (const route of routeList.filter(({ disposition }) => disposition === 'included')) {
    const owners = canonicalOwners.get(route.canonicalPath) || []
    owners.push(route)
    canonicalOwners.set(route.canonicalPath, owners)
  }
  for (const [canonicalPath, owners] of canonicalOwners) {
    if (owners.length < 2) continue
    addIssue({
      code: 'duplicate-canonical-path',
      severity: 'error',
      source: canonicalPath,
      target: owners
        .map(({ legacyId }) => (legacyId === null ? `virtual:${canonicalPath}` : nodeKey(legacyId)))
        .join(','),
      message: `Multiple reachable WordPress posts resolve to ${canonicalPath}.`,
    })
  }

  const dependencies: InventoryDependency[] = []
  for (const state of dependencyPosts.values()) {
    const classification = classifyInventoryNode(state.node)
    dependencies.push({
      key: nodeKey(state.node.legacyId),
      kind: 'post',
      legacyId: state.node.legacyId,
      subType: state.node.postType,
      title: state.node.title,
      path: normalizePath(state.node.path),
      status: state.node.status,
      roles: sortStrings(state.roles),
      sources: sortStrings(state.sources),
      available: null,
    })
    if (classification.targetOwner === 'unresolved') {
      // The explicit unknown owner is carried by the route manifest/layout coverage;
      // dependency records remain source-shaped for downstream architecture work.
    }
  }
  for (const [legacyId, state] of dependencyMedia) {
    const media = mediaByID.get(legacyId)
    if (!media) {
      addIssue({
        code: 'unresolved-reference',
        severity: 'warning',
        source: sortStrings(state.sources).join('|'),
        target: mediaKey(legacyId),
        message: `Referenced media ${legacyId} is missing from the WordPress snapshot.`,
      })
    }
    dependencies.push({
      key: mediaKey(legacyId),
      kind: 'media',
      legacyId,
      subType: media?.mimeType || 'unknown-media',
      title: media?.title || `Missing media ${legacyId}`,
      path: media?.relativePath || null,
      status: null,
      roles: sortStrings(state.roles),
      sources: sortStrings(state.sources),
      available: media?.available ?? false,
    })
  }
  for (const [key, state] of dependencyTerms) {
    const term = termsByKey.get(key)
    const [, taxonomy = 'unknown', legacyIdText = '0'] = key.split(':')
    const legacyId = Number(legacyIdText)
    if (!term) {
      addIssue({
        code: 'unresolved-reference',
        severity: 'warning',
        source: sortStrings(state.sources).join('|'),
        target: key,
        message: `Referenced term ${key} is missing from the WordPress snapshot.`,
      })
    }
    dependencies.push({
      key,
      kind: 'term',
      legacyId,
      subType: term?.taxonomy || taxonomy,
      title: term?.name || `Missing term ${key}`,
      path: null,
      status: null,
      roles: sortStrings(state.roles),
      sources: sortStrings(state.sources),
      available: null,
    })
  }
  dependencies.sort((left, right) => left.key.localeCompare(right.key))

  const redirects: InventoryRedirect[] = snapshot.nodes
    .filter(({ postType, status }) => postType === 'redirect' && status === 'publish')
    .map((node) => ({
      legacyId: node.legacyId,
      from: normalizePath(node.redirect?.from),
      to: node.redirect?.to || null,
      type: node.redirect?.type || 'unknown',
      status: node.status,
    }))
    .sort(
      (left, right) =>
        (left.from || '').localeCompare(right.from || '') || left.legacyId - right.legacyId,
    )

  const exclusions: InventoryExclusion[] = scope.exclusions
    .map((configured) => {
      const node = nodesByID.get(configured.legacyId)
      return {
        legacyId: configured.legacyId,
        path: normalizePath(configured.path) || configured.path,
        canonicalPath: normalizePath(node?.path),
        title: node?.title || null,
        reason: configured.reason,
        sources: sortStrings(exclusionSources.get(configured.legacyId) || []),
      }
    })
    .sort((left, right) => left.path.localeCompare(right.path))

  const issueList = [...issues.values()].sort(compareIssues)
  const publicRoutes = routeList.filter(({ disposition }) => disposition === 'included')

  return {
    schemaVersion: 1,
    scope: 'production',
    source: snapshot.source,
    routes: routeList,
    dependencies,
    redirects,
    exclusions,
    edges: edgeList,
    issues: issueList,
    summary: {
      directAuthoredRouteStrings: authoredDirectPaths.size,
      directPublicRoutes: directPublicKeys.size,
      listingRoutes: listingRouteIDs.size,
      routes: publicRoutes.length,
      dependencies: dependencies.length,
      redirects: redirects.length,
      exclusions: exclusions.length,
      issues: issueList.length,
      unknownArchetypes: publicRoutes.filter(
        ({ archetype, targetOwner }) =>
          targetOwner === 'unresolved' || !contractArchetypes.has(archetype),
      ).length,
      unavailableMedia: dependencies.filter(
        ({ kind, available }) => kind === 'media' && available === false,
      ).length,
    },
  }
}

export const inventoryUtilities = {
  normalizePath,
}
