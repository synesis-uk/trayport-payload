import type { GlobalAfterChangeHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import {
  publicProjectionCanChange,
  takeGlobalPublicProjectionIntent,
} from '@/hooks/publicProjection'

export const revalidateGlobal = (slug: string): GlobalAfterChangeHook => {
  return ({ context, doc, previousDoc, req }) => {
    const intent = takeGlobalPublicProjectionIntent({ context, slug })

    if (context.disableRevalidate) {
      return doc
    }

    if (
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

    revalidateTag(`global_${slug}`, 'max')
    revalidatePath('/', 'layout')

    return doc
  }
}
