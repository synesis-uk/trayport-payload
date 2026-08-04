import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import {
  contentRouteCacheTag,
  IMMEDIATE_CACHE_TAG_EXPIRY,
  REDIRECTS_CACHE_TAG,
} from '@/data/cacheTags'

const redirectPath = (document: unknown): string | null => {
  if (!document || typeof document !== 'object' || !('from' in document)) return null
  const path = document.from
  return typeof path === 'string' && path.startsWith('/') ? path : null
}

const revalidateRedirectPaths = (documents: unknown[]) => {
  for (const path of new Set(
    documents.map(redirectPath).filter((value): value is string => !!value),
  )) {
    revalidatePath(path)
    revalidateTag(contentRouteCacheTag(path), IMMEDIATE_CACHE_TAG_EXPIRY)
  }
}

export const revalidateRedirects: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (req.context.disableRevalidate) return doc

  const { payload } = req
  payload.logger.info(`Revalidating redirects`)

  revalidateRedirectPaths([doc, previousDoc])
  revalidateTag(REDIRECTS_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY)

  return doc
}

export const revalidateDeletedRedirects: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (req.context.disableRevalidate) return doc

  const { payload } = req
  payload.logger.info(`Revalidating redirects`)
  revalidateRedirectPaths([doc])
  revalidateTag(REDIRECTS_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY)
  return doc
}
