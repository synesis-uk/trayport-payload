import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode, headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload, type Payload } from 'payload'
import { cache } from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import {
  ArticleView,
  HubView,
  LearningVideoView,
  MarketCoverageIndexView,
  PageView,
  VenueIndexView,
  VenueView,
} from '@/components/Trayport/ContentViews'
import { StructuredData } from '@/components/Trayport/StructuredData'
import { isAdminOrEditor } from '@/access/roles'
import { normalizeContentPath } from '@/fields/contentPath'
import type {
  Article,
  Hub,
  LearningVideo,
  Page,
  Redirect,
  RouteIndex,
  Venue,
} from '@/payload-types'
import { findRouteClaim, type PublicRouteClaim } from '@/routing/registry'
import { generateMeta } from '@/utilities/generateMeta'
import { getCachedGlobal } from '@/utilities/getGlobals'

type ContentResult =
  | { document: Article; kind: 'article' }
  | { document: Hub; kind: 'hub' }
  | { document: LearningVideo; kind: 'learning-video' }
  | { document: Page; kind: 'page' }
  | { document: Venue; kind: 'venue' }

type VirtualResult =
  | {
      document: RouteIndex
      kind: 'market-coverage-index'
    }
  | {
      document: RouteIndex
      kind: 'venue-index'
    }

type RedirectResult = {
  destination: string
  kind: 'redirect'
  status: 301 | 302
}

type RouteResult = ContentResult | RedirectResult | VirtualResult

const canonicalPath = (segments?: string[]): string => {
  const candidate = segments?.length ? `/${segments.join('/')}/` : '/'
  const normalized = normalizeContentPath(candidate)
  return typeof normalized === 'string' && normalized.startsWith('/') ? normalized : '/'
}

const authenticatedDraftRequest = cache(async (): Promise<boolean> => {
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
  document: Redirect,
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
      const document = await payload.findByID({ ...shared, collection: 'pages' })
      return document ? { document, kind: 'page' } : null
    }
    case 'articles': {
      const document = await payload.findByID({ ...shared, collection: 'articles' })
      return document ? { document, kind: 'article' } : null
    }
    case 'hubs': {
      const document = await payload.findByID({ ...shared, collection: 'hubs' })
      return document ? { document, kind: 'hub' } : null
    }
    case 'venues': {
      const document = await payload.findByID({ ...shared, collection: 'venues' })
      return document ? { document, kind: 'venue' } : null
    }
    case 'learning-videos': {
      const document = await payload.findByID({ ...shared, collection: 'learning-videos' })
      return document ? { document, kind: 'learning-video' } : null
    }
    default:
      return null
  }
}

const queryContentByPath = cache(async (path: string): Promise<RouteResult | null> => {
  const draft = await authenticatedDraftRequest()
  const payload = await getPayload({ config: configPromise })
  const claim = await findRouteClaim({ draft, path, payload })

  if (!claim) return null

  return resolveRouteClaimOwner({ claim, draft, payload })
})

type StructuredDataValue =
  Record<string, unknown> | unknown[] | string | number | boolean | null | undefined

const structuredDataFor = (result: RouteResult): StructuredDataValue => {
  if (result.kind === 'redirect') return null
  if (result.kind === 'venue-index') return result.document.venueIndex.meta?.structuredData
  if (result.kind === 'market-coverage-index') {
    return result.document.marketCoverageIndex.meta?.structuredData
  }
  return result.document.meta?.structuredData
}

export const ContentRoute = async ({ segments }: { segments?: string[] }) => {
  const path = canonicalPath(segments)
  const draft = await authenticatedDraftRequest()
  const result = await queryContentByPath(path)

  if (!result) notFound()
  if (result.kind === 'redirect') {
    // Public requests are handled by src/proxy.ts so Payload's exact 301/302
    // contract survives. Reaching the page renderer means Proxy was bypassed;
    // do not silently substitute Next's different 308/307 semantics.
    notFound()
  }

  return (
    <>
      <StructuredData value={structuredDataFor(result)} />
      {draft ? <LivePreviewListener /> : null}
      {result.kind === 'page' ? <PageView document={result.document} /> : null}
      {result.kind === 'article' ? <ArticleView document={result.document} /> : null}
      {result.kind === 'hub' ? <HubView document={result.document} /> : null}
      {result.kind === 'venue' ? <VenueView document={result.document} /> : null}
      {result.kind === 'learning-video' ? <LearningVideoView document={result.document} /> : null}
      {result.kind === 'venue-index' ? (
        <VenueIndexView configuration={result.document.venueIndex} />
      ) : null}
      {result.kind === 'market-coverage-index' ? (
        <MarketCoverageIndexView configuration={result.document.marketCoverageIndex} />
      ) : null}
    </>
  )
}

export const contentRouteMetadata = async ({
  segments,
}: {
  segments?: string[]
}): Promise<Metadata> => {
  const path = canonicalPath(segments)
  const [result, settings] = await Promise.all([
    queryContentByPath(path),
    getCachedGlobal('site-settings', 2)(),
  ])

  if (!result || result.kind === 'redirect') return {}
  if (result.kind === 'venue-index') {
    return generateMeta({
      doc: { ...result.document.venueIndex, path },
      settings,
    })
  }
  if (result.kind === 'market-coverage-index') {
    return generateMeta({
      doc: { ...result.document.marketCoverageIndex, path },
      settings,
    })
  }

  return generateMeta({
    doc: result.document,
    settings,
  })
}
