import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense, type ReactElement } from 'react'

import { DynamicLivePreviewListener } from '@/components/LivePreviewListener/DynamicLivePreviewListener.client'
import {
  ArticleView,
  HubView,
  LearningVideoView,
  MarketCoverageIndexView,
  PageView,
  VenueIndexView,
  VenueView,
} from '@/components/content'
import { StructuredData } from '@/components/Trayport/StructuredData'

import { authenticatedDraftRequest, queryContentByPath } from './contentRoute.loader.server'
import { canonicalContentRoutePath, normalizeListingSearchQuery } from './contentRoute.path'
import type { ContentRouteProps, RouteResult } from './contentRoute.types'
import { ContentLoadingState } from './loading'

type StructuredDataValue =
  Record<string, unknown> | unknown[] | string | number | boolean | null | undefined

const structuredDataFor = (result: RouteResult): StructuredDataValue => {
  switch (result.kind) {
    case 'redirect':
      return null
    case 'venue-index':
      return result.document.venueIndex.meta?.structuredData
    case 'market-coverage-index':
      return result.document.marketCoverageIndex.meta?.structuredData
    case 'article':
    case 'hub':
    case 'learning-video':
    case 'page':
    case 'venue':
      return result.document.meta?.structuredData
    default:
      return assertNever(result, 'content route structured data')
  }
}

const assertNever = (value: never, boundary: string): never => {
  throw new Error(`Unsupported ${boundary}: ${JSON.stringify(value)}`)
}

const renderRouteResult = ({
  draft,
  result,
  searchQuery,
}: {
  draft: boolean
  result: Exclude<RouteResult, { kind: 'redirect' }>
  searchQuery: string
}): ReactElement => {
  switch (result.kind) {
    case 'page':
      return <PageView document={result.document} draft={draft} searchQuery={searchQuery} />
    case 'article':
      return <ArticleView document={result.document} draft={draft} />
    case 'hub':
      return <HubView document={result.document} draft={draft} />
    case 'venue':
      return <VenueView document={result.document} draft={draft} />
    case 'learning-video':
      return <LearningVideoView document={result.document} draft={draft} />
    case 'venue-index':
      return <VenueIndexView configuration={result.document.venueIndex} draft={draft} />
    case 'market-coverage-index':
      return (
        <MarketCoverageIndexView
          configuration={result.document.marketCoverageIndex}
          draft={draft}
        />
      )
    default:
      return assertNever(result, 'content route renderer')
  }
}

const RenderedContentRoute = ({
  draft,
  result,
  searchQuery,
}: {
  draft: boolean
  result: RouteResult | null
  searchQuery: string
}) => {
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
      {draft ? <DynamicLivePreviewListener /> : null}
      {renderRouteResult({ draft, result, searchQuery })}
    </>
  )
}

const DraftAwareContentRoute = async ({
  path,
  searchQuery,
}: {
  path: string
  searchQuery: string
}) => {
  await connection()
  const draft = await authenticatedDraftRequest()
  const result = await queryContentByPath(path)
  return <RenderedContentRoute draft={draft} result={result} searchQuery={searchQuery} />
}

/**
 * The build shell stays database-free. Request context is resolved before either
 * the tagged published lookup or the deliberately uncached authenticated draft lookup.
 */
export const ContentRoute = ({ searchQuery, segments }: ContentRouteProps) => {
  const path = canonicalContentRoutePath(segments)
  const initialSearchQuery = normalizeListingSearchQuery(searchQuery)

  return (
    <Suspense fallback={<ContentLoadingState />}>
      <DraftAwareContentRoute path={path} searchQuery={initialSearchQuery} />
    </Suspense>
  )
}
