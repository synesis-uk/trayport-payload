/**
 * Gate: `managed-internal-link-integrity`.
 *
 * "Internal links in navigation, actions, feature lists, entity lists, and rich text are managed
 * references or are validated against the shared route namespace; path changes create or require
 * redirects."
 *
 * This is a pre-flight over the transformed corpus, not a re-test of the runtime. Shadowing, chains
 * and loops are already structurally impossible after load — `route_registry.path` is unique and
 * `src/proxy.ts` refuses self-loops and chains — so re-asserting them against a running app would
 * be theatre. What had no enforcement was catching those conditions in the corpus *before* a load
 * hits a 409 mid-run, and catching links that quietly leak to the live WordPress site.
 *
 * Two corrections to the checks this replaces, both of which hid real defects:
 *
 *   - It walks the whole record, not just `data.layout`. Home's JSON-LD organisation logo pointed
 *     at a WordPress theme asset and was invisible to a layout-only scan.
 *   - It compares the full path *and query*, not the pathname alone. `https://www.trayport.com/
 *     ?page_id=2207` has pathname `/`, so a pathname-only comparison reads a link to a retired
 *     private page as a link to the homepage.
 */
import { contentArchitectureContract } from '../mappings/contentArchitecture'
import { buildGateVerification, countAssertion, type GateVerification } from './ledger'

export const GATE_ID = 'managed-internal-link-integrity'

/** Collections `src/proxy.ts` can actually resolve a redirect destination through. */
const PROXY_RESOLVABLE = new Set(['pages', 'articles', 'hubs', 'venues', 'learning-videos'])

/** Live-site hosts a same-site link can be bridged to. */
const LIVE_HOSTS = new Set(['trayport.com', 'www.trayport.com'])

export type LinkSite = {
  /** Where the link was found, e.g. `pages:1898` or `global:navigation`. */
  owner: string
  url: string
  /** True when the owner is the navigation or footer global. */
  chrome: boolean
}

export type RedirectRecord = {
  from: string
  toLegacyId: number | null
  toRelationTo: string | null
}

export type LinkSnapshot = {
  links: LinkSite[]
  redirects: RedirectRecord[]
  /** Published content paths owned by the corpus. */
  ownedPaths: Set<string>
  /** Virtual system routes such as `/venue/` and `/market-coverage/`. */
  systemPaths: Set<string>
  /** `collection:legacyId` for every routable transformed target, for redirect destinations. */
  routableTargets: Set<string>
  /** Managed `{relationTo, legacyId}` references found in content, as `relationTo:legacyId`. */
  managedReferences: string[]
}

const normalize = (path: string): string => {
  const url = new URL(path, 'http://trayport.local')
  const collapsed = `/${url.pathname.replace(/^\/+/, '')}`.replace(/\/{2,}/g, '/')
  const pathname = collapsed === '/' ? collapsed : `${collapsed.replace(/\/+$/, '')}/`
  return `${pathname}${url.search}`
}

/**
 * Every path the corpus can serve: its own content, the paths it redirects, and its virtual
 * indexes. A link to a redirect source is legitimate — the corpus answers it with a 301.
 */
export const routeNamespace = (snapshot: LinkSnapshot): Set<string> =>
  new Set([
    ...snapshot.ownedPaths,
    ...snapshot.redirects.map(({ from }) => normalize(from)),
    ...snapshot.systemPaths,
  ])

export const verifyManagedLinkIntegrity = (snapshot: LinkSnapshot): GateVerification => {
  const assertions = []
  const details: Record<string, string[]> = {}
  const namespace = routeNamespace(snapshot)

  // 1. Every internal link resolves to something the corpus serves.
  const outside = snapshot.links.filter(({ url }) => {
    if (!url.startsWith('/')) return false
    return !namespace.has(normalize(url))
  })
  assertions.push(countAssertion('internal-links-outside-namespace', 0, outside.length))
  details['internal-links-outside-namespace'] = outside.map(({ owner, url }) => `${owner} -> ${url}`)

  // 2. No link is bridged to the live site for a destination the corpus already serves. This is the
  //    CA-021 retirement condition, measured corpus-wide rather than over the two globals.
  const liveFallbacks = snapshot.links.flatMap((link) => {
    try {
      const url = new URL(link.url)
      if (!LIVE_HOSTS.has(url.hostname.toLowerCase())) return []
      return [{ ...link, target: normalize(`${url.pathname}${url.search}`) }]
    } catch {
      return []
    }
  })
  const reclaimable = liveFallbacks.filter(({ target }) => namespace.has(target))
  assertions.push(countAssertion('reclaimable-live-fallbacks', 0, reclaimable.length))
  details['reclaimable-live-fallbacks'] = [
    ...new Set(reclaimable.map(({ owner, target }) => `${owner} -> ${target}`)),
  ]

  // 3. The remaining chrome fallbacks are exactly the ones the contract declares. Set equality
  //    rather than a count: a count cannot distinguish a retired fallback from a newly leaked one.
  const declared = new Set(
    contentArchitectureContract.approvedProductionScope.approvedLiveFallbackPaths.map(normalize),
  )
  const observed = new Set(
    liveFallbacks.filter(({ chrome }) => chrome).map(({ target }) => target),
  )
  const unexpected = [...observed].filter((path) => !declared.has(path))
  const retired = [...declared].filter((path) => !observed.has(path))
  assertions.push(countAssertion('undeclared-chrome-fallback', 0, unexpected.length))
  details['undeclared-chrome-fallback'] = unexpected
  assertions.push(countAssertion('stale-declared-fallback', 0, retired.length))
  details['stale-declared-fallback'] = retired.map(
    (path) => `${path} is declared but no longer used; remove it from approvedLiveFallbackPaths`,
  )

  // 4. Redirect graph hygiene, checked before a load can hit a 409 on the unique path index.
  const froms = snapshot.redirects.map(({ from }) => normalize(from))
  const duplicates = froms.filter((from, index) => froms.indexOf(from) !== index)
  assertions.push(countAssertion('redirect-duplicate-from', 0, new Set(duplicates).size))
  details['redirect-duplicate-from'] = [...new Set(duplicates)]

  const shadowing = froms.filter((from) => snapshot.ownedPaths.has(from))
  assertions.push(countAssertion('redirect-shadows-content-path', 0, shadowing.length))
  details['redirect-shadows-content-path'] = shadowing

  // 5. Destinations resolve, and resolve to a collection the proxy can join through. The redirects
  //    plugin accepts `people` as a destination while `src/proxy.ts` omits it from its join, so
  //    such a redirect would silently 404. Nothing hits it today; the rule closes the class.
  const unresolved = snapshot.redirects.filter(
    ({ toLegacyId, toRelationTo }) =>
      toLegacyId === null ||
      toRelationTo === null ||
      !snapshot.routableTargets.has(`${toRelationTo}:${toLegacyId}`),
  )
  assertions.push(countAssertion('redirect-destination-unresolved', 0, unresolved.length))
  details['redirect-destination-unresolved'] = unresolved.map(
    ({ from, toLegacyId, toRelationTo }) => `${from} -> ${toRelationTo}:${toLegacyId}`,
  )

  const unjoinable = snapshot.redirects.filter(
    ({ toRelationTo }) => toRelationTo !== null && !PROXY_RESOLVABLE.has(toRelationTo),
  )
  assertions.push(countAssertion('redirect-destination-outside-proxy-join', 0, unjoinable.length))
  details['redirect-destination-outside-proxy-join'] = unjoinable.map(
    ({ from, toRelationTo }) => `${from} -> ${toRelationTo}`,
  )

  // 6. Every managed reference in content points inside the accepted dependency graph.
  const danglingReferences = snapshot.managedReferences.filter(
    (reference) => !snapshot.routableTargets.has(reference),
  )
  assertions.push(countAssertion('unresolved-managed-reference', 0, danglingReferences.length))
  details['unresolved-managed-reference'] = [...new Set(danglingReferences)]

  return buildGateVerification(GATE_ID, assertions, details)
}
