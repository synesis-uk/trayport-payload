import { ContentRoute, contentRouteMetadata } from '../contentRoute'

type RouteProps = {
  params: Promise<{
    segments: string[]
  }>
}

export default async function CatchAllPage({ params }: RouteProps) {
  const { segments } = await params
  return <ContentRoute segments={segments} />
}

export async function generateMetadata({ params }: RouteProps) {
  const { segments } = await params
  return contentRouteMetadata({ segments })
}

export const dynamic = 'force-dynamic'
