import { isDeepStrictEqual } from 'node:util'

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  PayloadRequest,
  RequestContext,
} from 'payload'
import { revalidateTag } from 'next/cache'

import {
  cacheDependencyCollections,
  cacheDependencyCollectionTag,
  cacheDependencyTag,
  type CacheDependencyCollection,
} from '@/data/cacheTags'
import { publicProjectionCanChange, type PublicProjectionIntent } from '@/hooks/publicProjection'

type DependencyDocument = {
  _status?: unknown
  id?: unknown
}

const dependencyCollectionSet = new Set<string>(cacheDependencyCollections)
const dependencyIntentStoreKey = 'trayportDependencyPublicProjectionIntents'

const dependencyCollection = (value: unknown): CacheDependencyCollection | null =>
  typeof value === 'string' && dependencyCollectionSet.has(value)
    ? (value as CacheDependencyCollection)
    : null

const documentID = (document: unknown): number | string | null => {
  if (!document || typeof document !== 'object') return null
  const id = (document as DependencyDocument).id
  return typeof id === 'number' || typeof id === 'string' ? id : null
}

const valueFlag = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some((item) => item === true || item === 'true')
  return value === true || value === 'true' || value === 1 || value === '1'
}

const requestFlag = (req: PayloadRequest, name: string): boolean =>
  valueFlag(req.query?.[name]) || valueFlag(req.searchParams?.get(name))

const intentStore = (
  context: RequestContext,
  create: boolean,
): Record<string, PublicProjectionIntent> | null => {
  const current = context[dependencyIntentStoreKey]
  if (current && typeof current === 'object' && !Array.isArray(current)) {
    return current as Record<string, PublicProjectionIntent>
  }
  if (!create) return null

  const store: Record<string, PublicProjectionIntent> = {}
  context[dependencyIntentStoreKey] = store
  return store
}

const hasSubstantiveDraftChanges = (
  data: Record<string, unknown>,
  previous: Record<string, unknown>,
): boolean =>
  Object.keys(data).some(
    (key) =>
      !['_status', 'updatedAt'].includes(key) && !isDeepStrictEqual(data[key], previous[key]),
  )

/**
 * Payload represents both a draft save and an unpublish with `draft=true`.
 * Capture that distinction before a versioned dependency is written so its
 * public cache tags are untouched by private autosaves.
 */
export const captureDependencyPublicProjectionIntent: CollectionBeforeChangeHook = ({
  collection,
  data,
  originalDoc,
  req,
}) => {
  const slug = dependencyCollection(collection?.slug)
  if (!slug) return data

  const previous =
    originalDoc && typeof originalDoc === 'object' ? (originalDoc as Record<string, unknown>) : {}
  const update = data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
  const next = { ...previous, ...update }
  const explicitIntent = req.context.publicProjectionOperation
  let intent: PublicProjectionIntent

  if (
    explicitIntent === 'draft' ||
    explicitIntent === 'publish' ||
    explicitIntent === 'unpublish'
  ) {
    intent = explicitIntent
  } else if (requestFlag(req, 'autosave')) {
    intent = 'draft'
  } else if (next._status === 'published') {
    intent = 'publish'
  } else if (next._status === 'draft' && hasSubstantiveDraftChanges(update, previous)) {
    intent = 'draft'
  } else if (previous._status === 'published') {
    intent = 'unpublish'
  } else {
    intent = 'draft'
  }

  const store = intentStore(req.context, true)
  if (store) store[slug] = intent
  return data
}

const takeDependencyPublicProjectionIntent = (
  context: RequestContext,
  collection: CacheDependencyCollection,
): PublicProjectionIntent | null => {
  const store = intentStore(context, false)
  const intent = store?.[collection] ?? null
  if (store) delete store[collection]
  return intent
}

const revalidateDocuments = (collection: CacheDependencyCollection, documents: unknown[]): void => {
  const ids = new Set(documents.map(documentID).filter((id): id is number | string => id !== null))
  for (const id of ids) revalidateTag(cacheDependencyTag(collection, id), 'max')
  revalidateTag(cacheDependencyCollectionTag(collection), 'max')
}

export const revalidateCacheDependency = ({
  versioned = false,
}: {
  versioned?: boolean
} = {}): CollectionAfterChangeHook => {
  return ({ collection, context, doc, previousDoc, req }) => {
    const slug = dependencyCollection(collection?.slug)
    if (!slug) return doc

    const intent = versioned ? takeDependencyPublicProjectionIntent(context, slug) : null
    if (context.disableRevalidate) return doc
    if (
      versioned &&
      !publicProjectionCanChange({
        context,
        current: doc,
        intent,
        previous: previousDoc,
        req,
      })
    ) {
      return doc
    }

    revalidateDocuments(slug, [doc, previousDoc])
    return doc
  }
}

export const revalidateDeletedCacheDependency: CollectionAfterDeleteHook = ({
  collection,
  context,
  doc,
}) => {
  const slug = dependencyCollection(collection?.slug)
  if (!slug || context.disableRevalidate) return doc

  revalidateDocuments(slug, [doc])
  return doc
}
