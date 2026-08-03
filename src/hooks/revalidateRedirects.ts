import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateRedirects: CollectionAfterChangeHook = ({ doc, req }) => {
  if (req.context.disableRevalidate) return doc

  const { payload } = req
  payload.logger.info(`Revalidating redirects`)

  revalidateTag('redirects', 'max')

  return doc
}

export const revalidateDeletedRedirects: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (req.context.disableRevalidate) return doc

  const { payload } = req
  payload.logger.info(`Revalidating redirects`)
  revalidateTag('redirects', 'max')
  return doc
}
