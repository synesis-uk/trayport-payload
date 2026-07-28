import { ContentRoute, contentRouteMetadata } from './contentRoute'

export default function HomePage() {
  return <ContentRoute />
}

export const generateMetadata = () => contentRouteMetadata({})
export const dynamic = 'force-dynamic'
