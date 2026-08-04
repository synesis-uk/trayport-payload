import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import { publicProjectionCanChange } from '@/hooks/publicProjection'
import {
  articleListingCacheTag,
  articleListingFamiliesForType,
  cacheDependencyCollectionTag,
  cacheDependencyTag,
  contentRouteCacheTag,
  CONTENT_SITEMAP_CACHE_TAG,
  IMMEDIATE_CACHE_TAG_EXPIRY,
  LEARNING_VIDEO_LISTING_CACHE_TAG,
  MARKET_COVERAGE_INDEX_CACHE_TAG,
  ROUTE_REGISTRY_CACHE_TAG,
  VENUE_INDEX_CACHE_TAG,
} from '@/data/cacheTags'
import {
  contentRouteCollections,
  takeRouteMutation,
  type ContentRouteCollection,
  type RouteMutation,
} from '@/routing/archetypes'

type RoutableDocument = {
  _status?: 'changed' | 'draft' | 'published' | null
  articleType?: string | null
  path?: string | null
}

const documentPath = (doc: unknown): string | null => {
  if (!doc || typeof doc !== 'object') {
    return null
  }

  const path = (doc as RoutableDocument).path

  return typeof path === 'string' && path.startsWith('/') ? path : null
}

const documentStatus = (doc: unknown): RoutableDocument['_status'] => {
  if (!doc || typeof doc !== 'object') {
    return null
  }

  return (doc as RoutableDocument)._status
}

const documentID = (doc: unknown): number | string | null => {
  if (!doc || typeof doc !== 'object') return null
  const id = (doc as { id?: unknown }).id
  return typeof id === 'number' || typeof id === 'string' ? id : null
}

const revalidateOwnerDependency = (
  collection: ContentRouteCollection,
  documents: unknown[],
): void => {
  const ids = new Set(documents.map(documentID).filter((id): id is number | string => id !== null))
  for (const id of ids) revalidateTag(cacheDependencyTag(collection, id), 'max')
  revalidateTag(cacheDependencyCollectionTag(collection), 'max')
}

const contentRouteCollection = (value: string): ContentRouteCollection | null =>
  contentRouteCollections.includes(value as ContentRouteCollection)
    ? (value as ContentRouteCollection)
    : null

const relatedProjectionTags = (
  collection: ContentRouteCollection,
  documents: unknown[],
): string[] => {
  if (collection === 'articles') {
    return [
      ...new Set(
        documents.flatMap((document) =>
          articleListingFamiliesForType(
            document && typeof document === 'object'
              ? (document as RoutableDocument).articleType
              : null,
          ).map(articleListingCacheTag),
        ),
      ),
    ]
  }
  if (collection === 'learning-videos') return [LEARNING_VIDEO_LISTING_CACHE_TAG]
  if (collection === 'hubs') return [MARKET_COVERAGE_INDEX_CACHE_TAG]
  if (collection === 'venues') return [VENUE_INDEX_CACHE_TAG]
  return []
}

const routeMutationFor = ({
  collection,
  context,
  doc,
  operation,
}: Parameters<CollectionAfterChangeHook>[0]): RouteMutation | null => {
  const collectionSlug = contentRouteCollection(collection?.slug ?? '')
  if (!collectionSlug) return null

  return takeRouteMutation({
    collection: collectionSlug,
    context: context as Record<string, unknown>,
    document: doc as Record<string, unknown>,
    operation,
  })
}

export const revalidateRoutableContent = (
  relatedPaths: string[] = [],
): CollectionAfterChangeHook => {
  return (args) => {
    const { context, doc, previousDoc, req } = args
    const mutation = routeMutationFor(args)

    if (context.disableRevalidate) {
      return doc
    }

    if (
      !publicProjectionCanChange({
        context,
        current: doc,
        intent: mutation?.intent,
        previous: previousDoc,
        req,
      })
    ) {
      return doc
    }

    const currentPath =
      mutation?.intent === 'publish'
        ? mutation.nextPath
        : documentStatus(doc) === 'published'
          ? documentPath(doc)
          : null
    const previousPath =
      mutation?.previousPublishedPath ??
      (documentStatus(previousDoc) === 'published' ? documentPath(previousDoc) : null)

    const routePaths = new Set([currentPath, previousPath].filter((path): path is string => !!path))
    for (const path of routePaths) {
      revalidateTag(contentRouteCacheTag(path), IMMEDIATE_CACHE_TAG_EXPIRY)
    }

    const collection = contentRouteCollection(args.collection?.slug ?? '')
    if (collection) {
      revalidateOwnerDependency(collection, [doc, previousDoc])
      for (const projectionTag of relatedProjectionTags(collection, [doc, previousDoc])) {
        revalidateTag(projectionTag, 'max')
      }
    }

    if (currentPath) {
      req.payload.logger.info(`Revalidating ${currentPath}`)
      revalidatePath(currentPath)
    }

    if (previousPath && previousPath !== currentPath) {
      req.payload.logger.info(`Revalidating former path ${previousPath}`)
      revalidatePath(previousPath)
    }

    for (const relatedPath of relatedPaths) {
      revalidatePath(relatedPath)
    }
    if (currentPath !== previousPath) {
      revalidateTag(ROUTE_REGISTRY_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY)
    }
    if (routePaths.size > 0) {
      revalidateTag(CONTENT_SITEMAP_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY)
    }

    return doc
  }
}

export const revalidateDeletedRoutableContent = (
  relatedPaths: string[] = [],
): CollectionAfterDeleteHook => {
  return ({ collection, context, doc }) => {
    if (context.disableRevalidate) {
      return doc
    }

    const path = documentPath(doc)

    if (path) {
      revalidatePath(path)
      revalidateTag(contentRouteCacheTag(path), IMMEDIATE_CACHE_TAG_EXPIRY)
    }

    const collectionSlug = contentRouteCollection(collection?.slug ?? '')
    if (collectionSlug) {
      revalidateOwnerDependency(collectionSlug, [doc])
      for (const projectionTag of relatedProjectionTags(collectionSlug, [doc])) {
        revalidateTag(projectionTag, 'max')
      }
    }

    for (const relatedPath of relatedPaths) {
      revalidatePath(relatedPath)
    }
    if (path) {
      revalidateTag(ROUTE_REGISTRY_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY)
      revalidateTag(CONTENT_SITEMAP_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY)
    }

    return doc
  }
}
