import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ArticleView, HubView, PageView } from '@/components/Trayport/ContentViews'
import { StructuredData } from '@/components/Trayport/StructuredData'
import type { Article, Hub, Page } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import { getCachedGlobal } from '@/utilities/getGlobals'

type ContentResult =
  | { document: Article; kind: 'article' }
  | { document: Hub; kind: 'hub' }
  | { document: Page; kind: 'page' }

const canonicalPath = (segments?: string[]) => {
  if (!segments?.length) return '/'
  return `/${segments.map(decodeURIComponent).join('/')}/`
}

const queryContentByPath = cache(async (path: string): Promise<ContentResult | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const query = {
    depth: 3,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false as const,
    where: {
      path: {
        equals: path,
      },
    },
  }

  const [pages, articles, hubs] = await Promise.all([
    payload.find({ ...query, collection: 'pages' }),
    payload.find({ ...query, collection: 'articles' }),
    payload.find({ ...query, collection: 'hubs' }),
  ])

  if (pages.docs[0]) return { document: pages.docs[0], kind: 'page' }
  if (articles.docs[0]) return { document: articles.docs[0], kind: 'article' }
  if (hubs.docs[0]) return { document: hubs.docs[0], kind: 'hub' }
  return null
})

export const ContentRoute = async ({ segments }: { segments?: string[] }) => {
  const path = canonicalPath(segments)
  const { isEnabled: draft } = await draftMode()
  const result = await queryContentByPath(path)

  if (!result) return <PayloadRedirects url={path} />

  return (
    <>
      <StructuredData value={result.document.meta?.structuredData} />
      <PayloadRedirects disableNotFound url={path} />
      {draft ? <LivePreviewListener /> : null}
      {result.kind === 'page' ? <PageView document={result.document} /> : null}
      {result.kind === 'article' ? <ArticleView document={result.document} /> : null}
      {result.kind === 'hub' ? <HubView document={result.document} /> : null}
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

  return generateMeta({
    doc: result?.document || null,
    settings,
  })
}
