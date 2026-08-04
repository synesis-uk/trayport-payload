import type {
  Article,
  ArticlesSelect,
  Hub,
  HubsSelect,
  LearningVideo,
  LearningVideosSelect,
  Page,
  PagesSelect,
  Redirect,
  RedirectsSelect,
  RouteIndex,
  RouteIndexesSelect,
  Venue,
  VenuesSelect,
} from '@/payload-types'

export const contentRouteSelects = {
  articles: {
    articleType: true,
    byline: true,
    categories: true,
    excerpt: true,
    heroMedia: true,
    layout: true,
    location: true,
    meta: true,
    path: true,
    publishedAt: true,
    title: true,
  } satisfies ArticlesSelect,
  hubs: {
    assetClasses: true,
    connections: true,
    heroMedia: true,
    layout: true,
    map: true,
    meta: true,
    path: true,
    summary: true,
    title: true,
  } satisfies HubsSelect,
  learningVideos: {
    accessMode: true,
    categories: true,
    description: true,
    duration: true,
    externalVideoURL: true,
    layout: true,
    meta: true,
    path: true,
    summary: true,
    title: true,
    video: true,
  } satisfies LearningVideosSelect,
  pages: {
    layout: true,
    meta: true,
    pageType: true,
    path: true,
    publishedAt: true,
    summary: true,
    title: true,
  } satisfies PagesSelect,
  redirects: {
    to: true,
    type: true,
  } satisfies RedirectsSelect,
  routeIndexes: {
    marketCoverageIndex: true,
    venueIndex: true,
  } satisfies RouteIndexesSelect,
  venues: {
    description: true,
    layout: true,
    logo: true,
    marketConnections: true,
    meta: true,
    path: true,
    title: true,
    venueTypes: true,
    website: true,
  } satisfies VenuesSelect,
} as const

export const contentPathSelect = { path: true } as const

export type ArticleRouteDocument = Pick<
  Article,
  | 'articleType'
  | 'byline'
  | 'categories'
  | 'excerpt'
  | 'heroMedia'
  | 'id'
  | 'layout'
  | 'location'
  | 'meta'
  | 'path'
  | 'publishedAt'
  | 'title'
>

export type HubRouteDocument = Pick<
  Hub,
  | 'assetClasses'
  | 'connections'
  | 'heroMedia'
  | 'id'
  | 'layout'
  | 'map'
  | 'meta'
  | 'path'
  | 'summary'
  | 'title'
>

export type LearningVideoRouteDocument = Pick<
  LearningVideo,
  | 'accessMode'
  | 'categories'
  | 'description'
  | 'duration'
  | 'externalVideoURL'
  | 'id'
  | 'layout'
  | 'meta'
  | 'path'
  | 'summary'
  | 'title'
  | 'video'
>

export type PageRouteDocument = Pick<
  Page,
  'id' | 'layout' | 'meta' | 'pageType' | 'path' | 'publishedAt' | 'summary' | 'title'
>

export type RedirectRouteDocument = Pick<Redirect, 'id' | 'to' | 'type'>

export type RouteIndexRouteDocument = Pick<RouteIndex, 'id' | 'marketCoverageIndex' | 'venueIndex'>

export type VenueRouteDocument = Pick<
  Venue,
  | 'description'
  | 'id'
  | 'layout'
  | 'logo'
  | 'marketConnections'
  | 'meta'
  | 'path'
  | 'title'
  | 'venueTypes'
  | 'website'
>
