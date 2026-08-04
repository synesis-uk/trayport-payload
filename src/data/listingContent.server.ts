import 'server-only'

import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'

import { collectCacheDependencyTags } from './cacheDependencies'
import { articleListingCacheTag, LEARNING_VIDEO_LISTING_CACHE_TAG } from './cacheTags'
import {
  articleListingSelect,
  articleTypesForFamily,
  type ArticleListingFamily,
  type ArticleListingItem,
  learningVideoListingSelect,
  type LearningVideoListingItem,
  listingContentPopulate,
} from './listingContent'

export const LISTING_CONTENT_CACHE_REVALIDATE_SECONDS = 300
export const LISTING_CONTENT_CACHE_LIFE = {
  expire: 3600,
  revalidate: LISTING_CONTENT_CACHE_REVALIDATE_SECONDS,
  stale: LISTING_CONTENT_CACHE_REVALIDATE_SECONDS,
} as const

export interface ListingContentLoadOptions {
  draft?: boolean
}

const queryArticleListing = async (
  family: ArticleListingFamily,
  draft: boolean,
): Promise<ArticleListingItem[]> => {
  const payload = await getPayload({ config: configPromise })
  const articleTypes = articleTypesForFamily(family)
  const result = await payload.find({
    collection: 'articles',
    depth: 2,
    draft,
    overrideAccess: draft,
    pagination: false,
    populate: listingContentPopulate,
    select: articleListingSelect,
    sort: '-publishedAt',
    where: draft
      ? { articleType: { in: articleTypes } }
      : {
          and: [{ _status: { equals: 'published' } }, { articleType: { in: articleTypes } }],
        },
  })

  return result.docs
}

const queryLearningVideoListing = async (draft: boolean): Promise<LearningVideoListingItem[]> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'learning-videos',
    depth: 2,
    draft,
    overrideAccess: draft,
    pagination: false,
    populate: listingContentPopulate,
    select: learningVideoListingSelect,
    sort: 'displayOrder',
    where: draft ? undefined : { _status: { equals: 'published' } },
  })

  return result.docs
}

const getCachedPublishedArticleListing = async (
  family: ArticleListingFamily,
): Promise<ArticleListingItem[]> => {
  'use cache'

  cacheLife(LISTING_CONTENT_CACHE_LIFE)
  cacheTag(articleListingCacheTag(family))
  const documents = await queryArticleListing(family, false)
  for (const tag of collectCacheDependencyTags(documents, 'articles')) cacheTag(tag)
  return documents
}

const getCachedPublishedLearningVideoListing = async (): Promise<LearningVideoListingItem[]> => {
  'use cache'

  cacheLife(LISTING_CONTENT_CACHE_LIFE)
  cacheTag(LEARNING_VIDEO_LISTING_CACHE_TAG)
  const documents = await queryLearningVideoListing(false)
  for (const tag of collectCacheDependencyTags(documents, 'learning-videos')) cacheTag(tag)
  return documents
}

/**
 * Authenticated draft callers branch before `use cache`, so draft relationship
 * data can never be retained by the public listing cache.
 */
export const loadArticleListing = (
  family: ArticleListingFamily,
  { draft = false }: ListingContentLoadOptions = {},
) => (draft ? queryArticleListing(family, true) : getCachedPublishedArticleListing(family))

/**
 * Authenticated draft callers branch before `use cache`, so draft relationship
 * data can never be retained by the public listing cache.
 */
export const loadLearningVideoListing = ({ draft = false }: ListingContentLoadOptions = {}) =>
  draft ? queryLearningVideoListing(true) : getCachedPublishedLearningVideoListing()

export const listingContentLoaderContract = {
  articles: {
    cacheKeyStrategy: 'use-cache-function-with-family',
    cacheLife: LISTING_CONTENT_CACHE_LIFE,
    cacheTagStrategy: 'listing:articles:<family>',
    collection: 'articles',
    draftCached: false,
    pagination: false,
    publishedCached: true,
    select: articleListingSelect,
  },
  learningVideos: {
    cacheKeyStrategy: 'use-cache-function',
    cacheLife: LISTING_CONTENT_CACHE_LIFE,
    cacheTag: LEARNING_VIDEO_LISTING_CACHE_TAG,
    collection: 'learning-videos',
    draftCached: false,
    pagination: false,
    publishedCached: true,
    select: learningVideoListingSelect,
  },
} as const
