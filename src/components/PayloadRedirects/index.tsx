import configPromise from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { getCachedRedirects } from '@/utilities/getRedirects'

interface Props {
  disableNotFound?: boolean
  url: string
}

type RedirectDocument = {
  path?: string | null
}

export const PayloadRedirects = async ({ disableNotFound, url }: Props) => {
  const redirects = await getCachedRedirects()()
  const redirectItem = redirects.find((item) => item.from === url)

  if (redirectItem?.to?.url) redirect(redirectItem.to.url)

  const reference = redirectItem?.to?.reference
  if (reference) {
    let document: RedirectDocument | null = null

    if (typeof reference.value === 'object') {
      document = reference.value
    } else if (reference.value) {
      const payload = await getPayload({ config: configPromise })
      document = (await payload.findByID({
        collection: reference.relationTo,
        id: reference.value,
        depth: 0,
      })) as RedirectDocument
    }

    if (document?.path) redirect(document.path)
  }

  if (!disableNotFound) notFound()
  return null
}
