import 'server-only'

import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { draftMode, headers } from 'next/headers'
import { getPayload, type Payload } from 'payload'
import { cache } from 'react'

import { isAdminOrEditor } from '@/access/roles'
import { collectCacheDependencyTags } from '@/data/cacheDependencies'
import { contentRouteCacheTag } from '@/data/cacheTags'
import {
  contentPathSelect,
  contentRouteSelects,
  type RedirectRouteDocument,
} from '@/data/contentRouteProjection'
import type { Redirect } from '@/payload-types'
import { findRouteClaim, type PublicRouteClaim } from '@/routing/registry'

import type { RedirectResult, RouteResult } from './contentRoute.types'

export { contentRouteSelects } from '@/data/contentRouteProjection'

export const CONTENT_ROUTE_CACHE_TAG_PREFIX = 'content-route'
export const CONTENT_ROUTE_CACHE_REVALIDATE_SECONDS = 300
export const CONTENT_ROUTE_CACHE_LIFE = {
  expire: 3600,
  revalidate: CONTENT_ROUTE_CACHE_REVALIDATE_SECONDS,
  stale: CONTENT_ROUTE_CACHE_REVALIDATE_SECONDS,
} as const

export const contentRouteCacheContract = {
  cacheKeyStrategy: 'use-cache-arguments',
  cacheLife: CONTENT_ROUTE_CACHE_LIFE,
  cacheTagStrategy: `${CONTENT_ROUTE_CACHE_TAG_PREFIX}:<canonical-path>`,
  draftCached: false,
  publishedCached: true,
  requestMemoized: true,
  revalidate: CONTENT_ROUTE_CACHE_REVALIDATE_SECONDS,
} as const

export const authenticatedDraftRequest = cache(async (): Promise<boolean> => {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return false

  const payload = await getPayload({ config: configPromise })

  try {
    const result = await payload.auth({
      headers: (await headers()) as Headers,
    })
    return isAdminOrEditor(result.user)
  } catch (error) {
    payload.logger.warn({ err: error }, 'Ignoring unauthenticated draft-mode request')
    return false
  }
})

const contentPathFromReference = async (
  reference: NonNullable<NonNullable<Redirect['to']>['reference']>,
  payload: Payload,
): Promise<string | null> => {
  if (typeof reference.value === 'object' && reference.value) {
    return typeof reference.value.path === 'string' ? reference.value.path : null
  }

  if (!reference.value) return null

  const shared = {
    depth: 0,
    disableErrors: true,
    draft: false,
    id: reference.value,
    overrideAccess: false,
    select: contentPathSelect,
  } as const

  switch (reference.relationTo) {
    case 'pages': {
      const document = await payload.findByID({ ...shared, collection: 'pages' })
      return document?.path || null
    }
    case 'articles': {
      const document = await payload.findByID({ ...shared, collection: 'articles' })
      return document?.path || null
    }
    case 'hubs': {
      const document = await payload.findByID({ ...shared, collection: 'hubs' })
      return document?.path || null
    }
    case 'venues': {
      const document = await payload.findByID({ ...shared, collection: 'venues' })
      return document?.path || null
    }
    case 'learning-videos': {
      const document = await payload.findByID({ ...shared, collection: 'learning-videos' })
      return document?.path || null
    }
  }
}

const redirectResult = async (
  document: RedirectRouteDocument,
  payload: Payload,
): Promise<RedirectResult | null> => {
  const destination =
    document.to?.type === 'reference' && document.to.reference
      ? await contentPathFromReference(document.to.reference, payload)
      : document.to?.url || null

  if (!destination) return null

  const redirectType = document.type
  if (redirectType !== '301' && redirectType !== '302') return null

  return {
    destination,
    kind: 'redirect',
    status: redirectType === '301' ? 301 : 302,
  }
}

export const resolveRouteClaimOwner = async ({
  claim,
  draft,
  payload,
}: {
  claim: PublicRouteClaim
  draft: boolean
  payload: Payload
}): Promise<RouteResult | null> => {
  if (claim.ownerKind === 'virtual') {
    const document = await payload.findGlobal({
      slug: 'route-indexes',
      depth: 2,
      draft,
      overrideAccess: draft,
      select: contentRouteSelects.routeIndexes,
    })

    if (claim.archetype === 'index.venue') {
      return { document, kind: 'venue-index' }
    }
    if (claim.archetype === 'index.market-coverage') {
      return { document, kind: 'market-coverage-index' }
    }
    return null
  }

  if (claim.ownerKind === 'redirect') {
    const document = await payload.findByID({
      collection: 'redirects',
      depth: 1,
      disableErrors: true,
      id: claim.ownerDocumentId,
      overrideAccess: false,
      select: contentRouteSelects.redirects,
    })
    return document ? redirectResult(document, payload) : null
  }

  const shared = {
    depth: 3,
    disableErrors: true,
    draft,
    id: claim.ownerDocumentId,
    overrideAccess: draft,
  } as const

  switch (claim.ownerCollection) {
    case 'pages': {
      const document = await payload.findByID({
        ...shared,
        collection: 'pages',
        select: contentRouteSelects.pages,
      })
      return document ? { document, kind: 'page' } : null
    }
    case 'articles': {
      const document = await payload.findByID({
        ...shared,
        collection: 'articles',
        select: contentRouteSelects.articles,
      })
      return document ? { document, kind: 'article' } : null
    }
    case 'hubs': {
      const document = await payload.findByID({
        ...shared,
        collection: 'hubs',
        select: contentRouteSelects.hubs,
      })
      return document ? { document, kind: 'hub' } : null
    }
    case 'venues': {
      const document = await payload.findByID({
        ...shared,
        collection: 'venues',
        select: contentRouteSelects.venues,
      })
      return document ? { document, kind: 'venue' } : null
    }
    case 'learning-videos': {
      const document = await payload.findByID({
        ...shared,
        collection: 'learning-videos',
        select: contentRouteSelects.learningVideos,
      })
      return document ? { document, kind: 'learning-video' } : null
    }
    default:
      return null
  }
}

const queryContentRoute = async ({
  draft,
  path,
}: {
  draft: boolean
  path: string
}): Promise<RouteResult | null> => {
  const payload = await getPayload({ config: configPromise })
  const claim = await findRouteClaim({ draft, path, payload })

  if (!claim) return null

  return resolveRouteClaimOwner({ claim, draft, payload })
}

export const getCachedPublishedContentRoute = async (path: string): Promise<RouteResult | null> => {
  'use cache'

  cacheLife(CONTENT_ROUTE_CACHE_LIFE)
  cacheTag(contentRouteCacheTag(path))
  const result = await queryContentRoute({ draft: false, path })

  if (result && result.kind !== 'redirect') {
    const source =
      result.kind === 'market-coverage-index' || result.kind === 'venue-index'
        ? 'route-indexes'
        : result.kind === 'learning-video'
          ? 'learning-videos'
          : result.kind === 'article'
            ? 'articles'
            : result.kind === 'hub'
              ? 'hubs'
              : result.kind === 'page'
                ? 'pages'
                : 'venues'

    for (const tag of collectCacheDependencyTags(result.document, source)) cacheTag(tag)
  }

  return result
}

/**
 * Authenticated draft reads branch before the persistent cache boundary so a
 * preview document can never be written to or served from Next's data cache.
 */
export const loadContentRouteResult = ({
  draft,
  path,
}: {
  draft: boolean
  path: string
}): Promise<RouteResult | null> =>
  draft ? queryContentRoute({ draft: true, path }) : getCachedPublishedContentRoute(path)

/**
 * React cache scopes repeated route reads to the current render request. It is
 * not a persistent cache, so the authenticated draft result cannot cross requests;
 * metadata deliberately uses the separate published-only lookup below.
 */
export const queryContentByPath = cache(async (path: string): Promise<RouteResult | null> => {
  const draft = await authenticatedDraftRequest()
  return loadContentRouteResult({ draft, path })
})
