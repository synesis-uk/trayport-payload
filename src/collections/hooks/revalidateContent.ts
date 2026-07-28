import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

type RoutableDocument = {
  _status?: 'changed' | 'draft' | 'published' | null
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

export const revalidateRoutableContent = (tag: string): CollectionAfterChangeHook => {
  return ({ context, doc, previousDoc, req: { payload } }) => {
    if (context.disableRevalidate) {
      return doc
    }

    const currentPath = documentPath(doc)
    const previousPath = documentPath(previousDoc)

    if (documentStatus(doc) === 'published' && currentPath) {
      payload.logger.info(`Revalidating ${currentPath}`)
      revalidatePath(currentPath)
    }

    if (
      documentStatus(previousDoc) === 'published' &&
      previousPath &&
      (previousPath !== currentPath || documentStatus(doc) !== 'published')
    ) {
      payload.logger.info(`Revalidating former path ${previousPath}`)
      revalidatePath(previousPath)
    }

    revalidateTag(tag, 'max')

    return doc
  }
}

export const revalidateDeletedRoutableContent = (tag: string): CollectionAfterDeleteHook => {
  return ({ context, doc }) => {
    if (context.disableRevalidate) {
      return doc
    }

    const path = documentPath(doc)

    if (path) {
      revalidatePath(path)
    }

    revalidateTag(tag, 'max')

    return doc
  }
}
