import 'server-only'

import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { type DataFromGlobalSlug, getPayload } from 'payload'
import { cacheLife, cacheTag } from 'next/cache'

import { collectCacheDependencyTags } from '@/data/cacheDependencies'

type Global = keyof Config['globals']

export const GLOBAL_CACHE_LIFE = {
  expire: 3600,
  revalidate: 300,
  stale: 300,
} as const

/**
 * Returns a tagged published-global lookup. Payload hooks invalidate the matching
 * tag after editorial writes; imports that deliberately suppress hooks are still
 * bounded by the five-minute lifetime rather than persisting indefinitely.
 */
export const getCachedGlobal = async <T extends Global>(
  slug: T,
  depth = 0,
): Promise<DataFromGlobalSlug<T>> => {
  'use cache'

  cacheLife(GLOBAL_CACHE_LIFE)
  cacheTag(`global_${slug}`)

  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    draft: false,
    overrideAccess: false,
  })

  if (
    slug === 'footer' ||
    slug === 'navigation' ||
    slug === 'route-indexes' ||
    slug === 'site-settings'
  ) {
    for (const tag of collectCacheDependencyTags(global, slug)) cacheTag(tag)
  }

  return global
}
