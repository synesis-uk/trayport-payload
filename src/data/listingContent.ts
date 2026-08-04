import type {
  Article,
  ArticleListingBlock,
  ArticlesSelect,
  LearningVideo,
  LearningVideosSelect,
} from '@/payload-types'

export type ArticleListingFamily = NonNullable<ArticleListingBlock['family']>

export const articleListingSelect = {
  categories: true,
  contentMode: true,
  displayDate: true,
  excerpt: true,
  externalDestination: true,
  featured: true,
  featuredOrder: true,
  heroMedia: true,
  path: true,
  publishedAt: true,
  title: true,
} as const satisfies ArticlesSelect

export const learningVideoListingSelect = {
  accessMode: true,
  categories: true,
  contentMode: true,
  duration: true,
  externalDestination: true,
  path: true,
  poster: true,
  product: true,
  summary: true,
  title: true,
} as const satisfies LearningVideosSelect

export const listingMediaSelect = {
  alt: true,
  decorative: true,
  externalURL: true,
  filename: true,
  height: true,
  mimeType: true,
  poster: true,
  title: true,
  updatedAt: true,
  url: true,
  width: true,
} as const

export const listingContentPopulate = {
  'article-categories': {
    slug: true,
    title: true,
  },
  'learning-video-categories': {
    slug: true,
    title: true,
  },
  media: listingMediaSelect,
} as const

export type ArticleListingItem = Pick<Article, 'id' | keyof typeof articleListingSelect>

export type LearningVideoListingItem = Pick<
  LearningVideo,
  'id' | keyof typeof learningVideoListingSelect
>

export const articleTypesForFamily = (
  family: ArticleListingBlock['family'],
): Array<'insight' | 'webinar' | 'video' | 'case-study' | 'news' | 'event'> => {
  if (family === 'news') return ['news']
  if (family === 'events') return ['event']
  if (family === 'all') return ['insight', 'webinar', 'video', 'case-study', 'news', 'event']
  return ['insight', 'webinar', 'video', 'case-study']
}
