import type { PayloadRequest } from 'payload'

export type DashboardCollectionSlug = 'articles' | 'learning-videos' | 'pages'

export type DashboardContentItem = {
  collection: DashboardCollectionSlug
  href: string
  id: number | string
  kind: string
  status: 'draft' | 'published'
  title: string
  updatedAt: string
}

export type DashboardContentData = {
  draftCounts: Record<DashboardCollectionSlug, number>
  recent: DashboardContentItem[]
  unavailable: boolean
}

const collectionDetails = [
  {
    kind: 'Page',
    slug: 'pages',
  },
  {
    kind: 'Article',
    slug: 'articles',
  },
  {
    kind: 'Learning video',
    slug: 'learning-videos',
  },
] as const

export const emptyDashboardContentData = (): DashboardContentData => ({
  draftCounts: {
    articles: 0,
    'learning-videos': 0,
    pages: 0,
  },
  recent: [],
  unavailable: false,
})

type DashboardDocument = {
  _status?: 'draft' | 'published' | null
  id: number | string
  title?: string | null
  updatedAt?: string | null
}

export const loadDashboardContent = async (req: PayloadRequest): Promise<DashboardContentData> => {
  const initial = emptyDashboardContentData()

  const results = await Promise.allSettled(
    collectionDetails.map(async ({ kind, slug }) => {
      const [recentResult, draftResult] = await Promise.all([
        req.payload.find({
          collection: slug,
          depth: 0,
          draft: true,
          limit: 4,
          overrideAccess: false,
          pagination: false,
          req,
          select: {
            _status: true,
            title: true,
            updatedAt: true,
          },
          sort: '-updatedAt',
        }),
        req.payload.find({
          collection: slug,
          depth: 0,
          draft: true,
          limit: 1,
          overrideAccess: false,
          req,
          where: {
            _status: {
              equals: 'draft',
            },
          },
        }),
      ])

      return {
        draftCount: draftResult.totalDocs,
        recent: (recentResult.docs as DashboardDocument[]).flatMap((document) => {
          if (!document.updatedAt) return []

          return [
            {
              collection: slug,
              href: `/admin/collections/${slug}/${document.id}`,
              id: document.id,
              kind,
              status: document._status === 'draft' ? 'draft' : 'published',
              title: document.title?.trim() || `Untitled ${kind.toLocaleLowerCase('en-GB')}`,
              updatedAt: document.updatedAt,
            } satisfies DashboardContentItem,
          ]
        }),
        slug,
      }
    }),
  )

  const recent: DashboardContentItem[] = []
  let unavailable = false

  for (const result of results) {
    if (result.status === 'rejected') {
      unavailable = true
      req.payload.logger.warn({
        err: result.reason,
        msg: 'Could not load one content source for the Payload dashboard',
      })
      continue
    }

    initial.draftCounts[result.value.slug] = result.value.draftCount
    recent.push(...result.value.recent)
  }

  recent.sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))

  return {
    draftCounts: initial.draftCounts,
    recent: recent.slice(0, 7),
    unavailable,
  }
}
