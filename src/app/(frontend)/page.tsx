import { contentRouteMetadata } from './contentRoute.metadata.server'
import { ContentRoute } from './contentRoute.renderer'

type HomePageProps = {
  searchParams: Promise<{ bannerPreview?: string | string[]; q?: string | string[] }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { bannerPreview, q } = await searchParams
  return <ContentRoute bannerPreview={bannerPreview} searchQuery={q} />
}

export const generateMetadata = () => contentRouteMetadata({})
