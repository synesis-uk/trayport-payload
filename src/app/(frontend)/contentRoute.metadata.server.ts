import type { Metadata } from 'next'
import { connection } from 'next/server'

import { generateMeta } from '@/utilities/generateMeta'
import { getCachedGlobal } from '@/utilities/getGlobals'

import { getCachedPublishedContentRoute } from './contentRoute.loader.server'
import { canonicalContentRoutePath } from './contentRoute.path'
import type { ContentRouteMetadataProps } from './contentRoute.types'

export const contentRouteMetadata = async ({
  segments,
}: ContentRouteMetadataProps): Promise<Metadata> => {
  await connection()
  const path = canonicalContentRoutePath(segments)
  const [result, settings] = await Promise.all([
    getCachedPublishedContentRoute(path),
    getCachedGlobal('site-settings', 2),
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
    contentType: result.kind === 'article' || result.kind === 'person' ? 'article' : 'website',
    doc: result.document,
    settings,
  })
}
