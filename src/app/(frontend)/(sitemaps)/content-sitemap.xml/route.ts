import configPromise from '@payload-config'
import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'

import { getServerSideURL } from '@/utilities/getURL'

const getContentSitemap = async () => {
  const payload = await getPayload({ config: configPromise })
  const query = {
    depth: 0,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false as const,
    select: {
      path: true as const,
      updatedAt: true as const,
    },
    where: {
      _status: {
        equals: 'published' as const,
      },
    },
  }
  const [pages, articles, hubs] = await Promise.all([
    payload.find({ ...query, collection: 'pages' }),
    payload.find({ ...query, collection: 'articles' }),
    payload.find({ ...query, collection: 'hubs' }),
  ])
  const baseURL = getServerSideURL()
  const entries = [...pages.docs, ...articles.docs, ...hubs.docs]
  const paths = new Map<string, string>()

  for (const document of entries) {
    if (!document.path) continue
    const currentDate = paths.get(document.path)
    if (!currentDate || document.updatedAt > currentDate) {
      paths.set(document.path, document.updatedAt)
    }
  }

  return [...paths.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([path, lastmod]) => ({
      lastmod,
      loc: new URL(path, baseURL).toString(),
    }))
}

export async function GET() {
  return getServerSideSitemap(await getContentSitemap())
}

export const dynamic = 'force-dynamic'
