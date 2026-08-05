import type { Metadata } from 'next'

import { SiteSearchPage } from '@/search/SiteSearchPage.server'

import { contentRouteMetadata } from './contentRoute.metadata.server'
import { ContentRoute } from './contentRoute.renderer'

type HomePageProps = {
  searchParams: Promise<{
    bannerPreview?: string | string[]
    page?: string | string[]
    q?: string | string[]
    s?: string | string[]
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { bannerPreview, page, q, s } = await searchParams
  if (s !== undefined) return <SiteSearchPage page={page} searchQuery={s} />

  return <ContentRoute bannerPreview={bannerPreview} searchQuery={q} />
}

export const generateMetadata = async ({ searchParams }: HomePageProps): Promise<Metadata> => {
  const { s } = await searchParams
  if (s !== undefined) {
    return {
      description: 'Search public pages, market information, insights and resources from Trayport.',
      robots: {
        follow: true,
        index: false,
      },
      title: 'Site Search | Trayport',
    }
  }

  return contentRouteMetadata({})
}
