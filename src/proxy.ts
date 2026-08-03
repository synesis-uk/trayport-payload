import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { Pool } from 'pg'

import { normalizeContentPath } from '@/fields/contentPath'

type ManagedRedirectRow = {
  destination: string | null
  type: '301' | '302'
}

const bypassFirstSegments = new Set(['_next', 'admin', 'api', 'next'])
const bypassExactPaths = new Set([
  '/content-sitemap.xml',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
])

export const isRedirectProxyBypassPath = (pathname: string): boolean => {
  const withoutTrailingSlash =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  const firstSegment = withoutTrailingSlash.split('/')[1]

  return bypassExactPaths.has(withoutTrailingSlash) || bypassFirstSegments.has(firstSegment)
}

const redirectPool = (): Pool => {
  const shared = globalThis as typeof globalThis & {
    trayportRedirectPool?: Pool
  }

  if (!shared.trayportRedirectPool) {
    shared.trayportRedirectPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
    })
  }

  return shared.trayportRedirectPool
}

const publishedRedirect = async (path: string): Promise<ManagedRedirectRow | null> => {
  const result = await redirectPool().query<ManagedRedirectRow>(
    `SELECT
       "redirects"."type"::text AS "type",
       CASE
         WHEN "redirects"."to_type"::text = 'custom' THEN "redirects"."to_url"
         ELSE "destination_claim"."path"
       END AS "destination"
     FROM "route_registry" AS "source_claim"
     INNER JOIN "redirects"
       ON "source_claim"."owner_document_id" = "redirects"."id"::text
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
     WHERE
       "source_claim"."path" = $1
       AND "source_claim"."owner_kind" = 'redirect'
       AND "source_claim"."owner_collection" = 'redirects'
       AND "source_claim"."state" = 'published'
       AND "redirects"."from" = $1
     LIMIT 1`,
    [path],
  )

  return result.rows[0] || null
}

export const proxy = async (request: NextRequest): Promise<NextResponse> => {
  if (isRedirectProxyBypassPath(request.nextUrl.pathname)) return NextResponse.next()

  const normalized = normalizeContentPath(request.nextUrl.pathname)
  if (typeof normalized !== 'string' || !normalized.startsWith('/')) {
    return NextResponse.next()
  }

  const redirect = await publishedRedirect(normalized)
  if (!redirect?.destination || (redirect.type !== '301' && redirect.type !== '302')) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL(redirect.destination, request.url), Number(redirect.type))
}

export const config = {
  matcher: ['/:path*'],
}
