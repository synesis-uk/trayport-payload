import { contentRouteMetadata } from '../contentRoute.metadata.server'
import { ContentRoute } from '../contentRoute.renderer'
import { ContentLoadingState } from '../loading'
import { Suspense } from 'react'

type RouteProps = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{ q?: string | string[] }>
}

const CatchAllContent = async ({ params, searchParams }: RouteProps) => {
  const [{ segments }, { q }] = await Promise.all([params, searchParams])
  return <ContentRoute searchQuery={q} segments={segments} />
}

export default function CatchAllPage({ params, searchParams }: RouteProps) {
  return (
    <Suspense fallback={<ContentLoadingState />}>
      <CatchAllContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}

export async function generateMetadata({ params }: RouteProps) {
  const { segments } = await params
  return contentRouteMetadata({ segments })
}
