import 'server-only'

import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'

import type { SiteSearchDocument } from './model'
import { publicSearchSources } from './publicSearchSources.server'

export const SITE_SEARCH_CACHE_LIFE = {
  expire: 3600,
  revalidate: 300,
  stale: 300,
} as const

const querySiteSearchCorpus = async (): Promise<SiteSearchDocument[]> => {
  const payload = await getPayload({ config: configPromise })
  const documents = await Promise.all(publicSearchSources.map((source) => source.load(payload)))

  return documents
    .flat()
    .sort(
      (left, right) =>
        left.title.localeCompare(right.title, 'en-GB') || left.path.localeCompare(right.path),
    )
}

/**
 * The cache stores only a normalized public projection, never a Payload result
 * or request-specific query. Existing routable collection hooks invalidate the
 * same collection tags on publish, unpublish, path and body changes.
 */
export const loadSiteSearchCorpus = async (): Promise<SiteSearchDocument[]> => {
  'use cache'

  cacheLife(SITE_SEARCH_CACHE_LIFE)
  for (const source of publicSearchSources) cacheTag(source.cacheTag)

  return querySiteSearchCorpus()
}
