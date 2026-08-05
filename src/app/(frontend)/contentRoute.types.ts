import type {
  ArticleRouteDocument,
  HubRouteDocument,
  LearningVideoRouteDocument,
  PageRouteDocument,
  PersonRouteDocument,
  RouteIndexRouteDocument,
  VenueRouteDocument,
} from '@/data/contentRouteProjection'

export type ContentResult =
  | { document: ArticleRouteDocument; kind: 'article' }
  | { document: HubRouteDocument; kind: 'hub' }
  | { document: LearningVideoRouteDocument; kind: 'learning-video' }
  | { document: PageRouteDocument; kind: 'page' }
  | { document: PersonRouteDocument; kind: 'person' }
  | { document: VenueRouteDocument; kind: 'venue' }

export type VirtualResult =
  | {
      document: RouteIndexRouteDocument
      kind: 'market-coverage-index'
    }
  | {
      document: RouteIndexRouteDocument
      kind: 'venue-index'
    }

export type RedirectResult = {
  destination: string
  kind: 'redirect'
  status: 301 | 302
}

export type RouteResult = ContentResult | RedirectResult | VirtualResult

export type ContentRouteProps = {
  bannerPreview?: string | string[]
  searchQuery?: string | string[]
  segments?: string[]
}

export type ContentRouteMetadataProps = {
  segments?: string[]
}
