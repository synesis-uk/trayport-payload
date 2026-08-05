import { cacheLife, cacheTag } from 'next/cache'
import { getServerSideSitemap } from 'next-sitemap'
import { connection } from 'next/server'

import { CONTENT_SITEMAP_CACHE_TAG } from '@/data/cacheTags'
import { getContentSitemap } from '@/data/contentSitemap.server'

const CONTENT_SITEMAP_CACHE_LIFE = {
  expire: 3600,
  revalidate: 300,
  stale: 300,
} as const

const getCachedContentSitemap = async () => {
  'use cache'

  cacheLife(CONTENT_SITEMAP_CACHE_LIFE)
  cacheTag(CONTENT_SITEMAP_CACHE_TAG)
  return getContentSitemap()
}

export async function GET() {
  await connection()
  return getServerSideSitemap(await getCachedContentSitemap())
}
