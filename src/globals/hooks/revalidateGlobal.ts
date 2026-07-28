import type { GlobalAfterChangeHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateGlobal = (slug: string): GlobalAfterChangeHook => {
  return ({ context, doc }) => {
    if (context.disableRevalidate) {
      return doc
    }

    revalidateTag(`global_${slug}`, 'max')
    revalidatePath('/', 'layout')

    return doc
  }
}
