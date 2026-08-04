import { contentRouteMetadata } from './contentRoute.metadata.server'
import { ContentRoute } from './contentRoute.renderer'

type HomePageProps = {
  searchParams: Promise<{ q?: string | string[] }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q } = await searchParams
  return <ContentRoute searchQuery={q} />
}

export const generateMetadata = () => contentRouteMetadata({})
