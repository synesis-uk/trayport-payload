import configPromise from '@payload-config'
import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'

import type { Article, Hub, LearningVideo, Page, RouteRegistry, Venue } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

type ContentOwner = Article | Hub | LearningVideo | Page | Venue
type ContentOwnerCollection = Extract<
  RouteRegistry['ownerCollection'],
  'articles' | 'hubs' | 'learning-videos' | 'pages' | 'venues'
>

const ownerIDs = (claims: RouteRegistry[], ownerCollection: ContentOwnerCollection): number[] =>
  claims
    .filter((claim) => claim.ownerKind === 'content' && claim.ownerCollection === ownerCollection)
    .map(({ ownerDocumentId }) => Number(ownerDocumentId))
    .filter((id) => Number.isInteger(id) && id > 0)

const indexableOwnerKeys = (entries: [ContentOwnerCollection, ContentOwner[]][]): Set<string> => {
  const keys = new Set<string>()

  for (const [collection, documents] of entries) {
    for (const document of documents) {
      if (!document.meta?.noIndex) {
        keys.add(`${collection}:${document.id}`)
      }
    }
  }

  return keys
}

export const getContentSitemap = async () => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'route-registry',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    select: {
      archetype: true,
      ownerCollection: true,
      ownerDocumentId: true,
      ownerKind: true,
      path: true,
      updatedAt: true,
    },
    sort: 'path',
    where: {
      and: [
        {
          state: {
            equals: 'published',
          },
        },
        {
          ownerKind: {
            in: ['content', 'virtual'],
          },
        },
      ],
    },
  })
  const claims = result.docs as RouteRegistry[]
  const pageIDs = ownerIDs(claims, 'pages')
  const articleIDs = ownerIDs(claims, 'articles')
  const hubIDs = ownerIDs(claims, 'hubs')
  const venueIDs = ownerIDs(claims, 'venues')
  const learningVideoIDs = ownerIDs(claims, 'learning-videos')

  const [pages, articles, hubs, venues, learningVideos, routeIndexes] = await Promise.all([
    pageIDs.length
      ? payload.find({
          collection: 'pages',
          depth: 0,
          draft: false,
          limit: pageIDs.length,
          overrideAccess: false,
          pagination: false,
          where: {
            and: [{ id: { in: pageIDs } }, { _status: { equals: 'published' } }],
          },
        })
      : null,
    articleIDs.length
      ? payload.find({
          collection: 'articles',
          depth: 0,
          draft: false,
          limit: articleIDs.length,
          overrideAccess: false,
          pagination: false,
          where: {
            and: [{ id: { in: articleIDs } }, { _status: { equals: 'published' } }],
          },
        })
      : null,
    hubIDs.length
      ? payload.find({
          collection: 'hubs',
          depth: 0,
          draft: false,
          limit: hubIDs.length,
          overrideAccess: false,
          pagination: false,
          where: {
            and: [{ id: { in: hubIDs } }, { _status: { equals: 'published' } }],
          },
        })
      : null,
    venueIDs.length
      ? payload.find({
          collection: 'venues',
          depth: 0,
          draft: false,
          limit: venueIDs.length,
          overrideAccess: false,
          pagination: false,
          where: {
            and: [{ id: { in: venueIDs } }, { _status: { equals: 'published' } }],
          },
        })
      : null,
    learningVideoIDs.length
      ? payload.find({
          collection: 'learning-videos',
          depth: 0,
          draft: false,
          limit: learningVideoIDs.length,
          overrideAccess: false,
          pagination: false,
          where: {
            and: [{ id: { in: learningVideoIDs } }, { _status: { equals: 'published' } }],
          },
        })
      : null,
    payload.findGlobal({
      slug: 'route-indexes',
      depth: 0,
      draft: false,
      overrideAccess: false,
    }),
  ])
  const indexableContentOwners = indexableOwnerKeys([
    ['pages', pages?.docs || []],
    ['articles', articles?.docs || []],
    ['hubs', hubs?.docs || []],
    ['venues', venues?.docs || []],
    ['learning-videos', learningVideos?.docs || []],
  ])
  const baseURL = getServerSideURL()

  return claims
    .filter((claim) => {
      if (claim.ownerKind === 'content') {
        return indexableContentOwners.has(`${claim.ownerCollection}:${claim.ownerDocumentId}`)
      }

      if (claim.ownerKind !== 'virtual') return false
      if (claim.archetype === 'index.venue') {
        return !routeIndexes.venueIndex.meta?.noIndex
      }
      if (claim.archetype === 'index.market-coverage') {
        return !routeIndexes.marketCoverageIndex.meta?.noIndex
      }

      return false
    })
    .map(({ path, updatedAt }) => ({
      lastmod: updatedAt,
      loc: new URL(path, baseURL).toString(),
    }))
}

export async function GET() {
  return getServerSideSitemap(await getContentSitemap())
}

export const dynamic = 'force-dynamic'
