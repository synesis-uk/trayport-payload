import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { Pool } from 'pg'

import { REDIRECTS_CACHE_TAG, ROUTE_REGISTRY_CACHE_TAG } from '@/data/cacheTags'
import { normalizeContentPath, validateContentPath } from '@/fields/contentPath'
import { previewRouteCookieName, verifyPreviewRouteToken } from '@/routing/previewAccess'
import { isApplicationProxyBypassPath } from '@/routing/reservedPaths'
import { internalOrHTTPSDestinationPolicy, safeDestination } from '@/routing/urlPolicy'

type PublishedRouteRow = {
  destination: string | null
  ownerKind: 'content' | 'redirect' | 'virtual'
  path: string
  type: '301' | '302' | null
}

type PublishedRouteDisposition = Omit<PublishedRouteRow, 'path'>
type PublishedRouteSnapshot = Record<string, PublishedRouteDisposition>

export const REDIRECT_PROXY_CACHE_REVALIDATE_SECONDS = 300
export const REDIRECT_PROXY_POOL_TIMEOUTS = {
  connectionTimeoutMillis: 3_000,
  query_timeout: 5_000,
  statement_timeout: 4_000,
} as const
export const redirectProxyCacheKey = ['route-status-proxy', 'published-snapshot', 'v4'] as const
export const redirectProxyCacheTag = REDIRECTS_CACHE_TAG
export const routeRegistryProxyCacheTag = ROUTE_REGISTRY_CACHE_TAG

export const redirectProxyCacheContract = {
  lookup: 'bounded-published-route-snapshot',
  key: redirectProxyCacheKey,
  pathKeyedEntries: false,
  poolTimeouts: REDIRECT_PROXY_POOL_TIMEOUTS,
  revalidate: REDIRECT_PROXY_CACHE_REVALIDATE_SECONDS,
  tags: [redirectProxyCacheTag, routeRegistryProxyCacheTag],
} as const

export const routeStatusPreflightContract = {
  draftCookie: previewRouteCookieName,
  unknownStatus: 404,
} as const

export const isRedirectProxyBypassPath = isApplicationProxyBypassPath

export const resolveSafeRedirectDestination = ({
  destination,
  requestURL,
  routeLookup,
  sourcePath,
}: {
  destination: unknown
  requestURL: string
  routeLookup: (path: string) => PublishedRouteDisposition | undefined
  sourcePath: string
}): URL | null => {
  const safe = safeDestination(destination, internalOrHTTPSDestinationPolicy)
  if (!safe) return null

  const url = new URL(safe, requestURL)
  const requestOrigin = new URL(requestURL).origin
  if (url.origin !== requestOrigin) return url

  const normalizedDestination = normalizeContentPath(url.pathname)
  if (
    typeof normalizedDestination !== 'string' ||
    validateContentPath(normalizedDestination) !== true
  ) {
    return null
  }
  if (normalizedDestination === sourcePath) return null
  if (routeLookup(normalizedDestination)?.ownerKind === 'redirect') return null

  return url
}

const redirectPool = (): Pool => {
  const shared = globalThis as typeof globalThis & {
    trayportRedirectPool?: Pool
  }

  if (!shared.trayportRedirectPool) {
    shared.trayportRedirectPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      ...REDIRECT_PROXY_POOL_TIMEOUTS,
    })
  }

  return shared.trayportRedirectPool
}

const queryPublishedRoutes = async (): Promise<PublishedRouteSnapshot> => {
  const result = await redirectPool().query<PublishedRouteRow>(
    `SELECT
       "source_claim"."path" AS "path",
       "source_claim"."owner_kind"::text AS "ownerKind",
       "redirects"."type"::text AS "type",
       CASE
         WHEN "redirects"."to_type"::text = 'custom' THEN "redirects"."to_url"
         ELSE "destination_claim"."path"
       END AS "destination"
     FROM "route_registry" AS "source_claim"
     LEFT JOIN "redirects"
       ON "source_claim"."owner_kind" = 'redirect'
       AND "source_claim"."owner_document_id" = "redirects"."id"::text
       AND "redirects"."from" = "source_claim"."path"
     LEFT JOIN "redirects_rels" AS "relation"
       ON "relation"."parent_id" = "redirects"."id"
       AND "relation"."path" = 'to.reference'
     LEFT JOIN "route_registry" AS "destination_claim"
       ON "destination_claim"."owner_kind" = 'content'
       AND "destination_claim"."state" = 'published'
       AND (
         ("destination_claim"."owner_collection" = 'pages' AND "destination_claim"."owner_document_id" = "relation"."pages_id"::text)
         OR ("destination_claim"."owner_collection" = 'articles' AND "destination_claim"."owner_document_id" = "relation"."articles_id"::text)
         OR ("destination_claim"."owner_collection" = 'hubs' AND "destination_claim"."owner_document_id" = "relation"."hubs_id"::text)
         OR ("destination_claim"."owner_collection" = 'venues' AND "destination_claim"."owner_document_id" = "relation"."venues_id"::text)
         OR ("destination_claim"."owner_collection" = 'learning-videos' AND "destination_claim"."owner_document_id" = "relation"."learning_videos_id"::text)
       )
     WHERE "source_claim"."state" = 'published'`,
  )

  return Object.fromEntries(
    result.rows.map(({ path, ...disposition }) => [path, disposition]),
  ) as PublishedRouteSnapshot
}

const hasManagedPreviewRoute = async (path: string): Promise<boolean> => {
  const result = await redirectPool().query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM "route_registry"
       WHERE "path" = $1
     ) AS "exists"`,
    [path],
  )

  return result.rows[0]?.exists === true
}

// Every request reads one bounded snapshot rather than creating a cache entry
// for each attacker-controlled miss. Content-route and redirect hooks invalidate
// their respective tags so a publish, path move, unpublish, delete, or redirect
// edit cannot leave the proxy preflight stale. Query failures intentionally
// propagate so infrastructure errors are never presented as false 404s.
const publishedRoutes = unstable_cache(queryPublishedRoutes, [...redirectProxyCacheKey], {
  revalidate: REDIRECT_PROXY_CACHE_REVALIDATE_SECONDS,
  tags: [redirectProxyCacheTag, routeRegistryProxyCacheTag],
})

const renderGlobalNotFound = (request: NextRequest): NextResponse =>
  NextResponse.rewrite(new URL('/_not-found/', request.url), {
    status: routeStatusPreflightContract.unknownStatus,
  })

export const proxy = async (request: NextRequest): Promise<NextResponse> => {
  if (isRedirectProxyBypassPath(request.nextUrl.pathname)) return NextResponse.next()

  const normalized = normalizeContentPath(request.nextUrl.pathname)
  if (typeof normalized !== 'string' || !normalized.startsWith('/')) {
    return NextResponse.next()
  }

  const routeSnapshot = await publishedRoutes()
  const route = routeSnapshot[normalized]

  // `loading.tsx` and the request-time content boundary may begin streaming before
  // `notFound()` resolves. Mark a published-route miss before rendering so the
  // designed not-found body retains the correct HTTP status. A draft-only claim
  // bypasses this published preflight only with the short-lived, path-bound token
  // issued after the preview endpoint authenticates the CMS user.
  if (!route) {
    const previewToken = request.cookies.get(routeStatusPreflightContract.draftCookie)?.value
    const hasAuthorizedPreview = verifyPreviewRouteToken({
      path: normalized,
      secret: process.env.PREVIEW_SECRET,
      token: previewToken,
    })

    if (hasAuthorizedPreview && (await hasManagedPreviewRoute(normalized))) {
      return NextResponse.next()
    }
    return renderGlobalNotFound(request)
  }

  if (route.ownerKind !== 'redirect') {
    return NextResponse.next()
  }

  const destination = resolveSafeRedirectDestination({
    destination: route.destination,
    requestURL: request.url,
    routeLookup: (path) => routeSnapshot[path],
    sourcePath: normalized,
  })
  if (!destination || (route.type !== '301' && route.type !== '302')) {
    return renderGlobalNotFound(request)
  }

  return NextResponse.redirect(destination, Number(route.type))
}

export const config = {
  matcher: ['/((?!_next(?:/|$)|api(?:/|$)|admin(?:/|$)).*)'],
}
