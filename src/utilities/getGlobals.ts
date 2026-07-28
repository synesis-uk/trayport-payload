import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { type DataFromGlobalSlug, getPayload } from 'payload'
import { cache } from 'react'

type Global = keyof Config['globals']

const getGlobal = cache(
  async <T extends Global>(slug: T, depth = 0): Promise<DataFromGlobalSlug<T>> => {
    const payload = await getPayload({ config: configPromise })

    const global = await payload.findGlobal({
      slug,
      depth,
      draft: false,
      overrideAccess: false,
    })

    return global
  },
)

/**
 * Returns a request-memoized global lookup. Globals are intentionally not persisted
 * in Next's data cache so standalone Payload import commands cannot leave navigation,
 * footer, or site settings stale across requests or application restarts.
 */
export const getCachedGlobal =
  <T extends Global>(slug: T, depth = 0) =>
  async (): Promise<DataFromGlobalSlug<T>> =>
    getGlobal(slug, depth)
