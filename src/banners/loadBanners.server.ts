import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Banner } from '@/payload-types'

import {
  activeBannerWhere,
  emptyBannerSlots,
  groupBannersByPlacement,
  type BannerSlots,
} from './model'

export type PageBannerSlots = BannerSlots<Banner>

export const loadBannersForPage = async ({
  draft,
  pageID,
  previewBannerID,
}: {
  draft: boolean
  pageID: number | string
  previewBannerID?: number
}): Promise<PageBannerSlots> => {
  const payload = await getPayload({ config: configPromise })

  try {
    const result = await payload.find({
      collection: 'banners',
      depth: 2,
      draft,
      limit: 50,
      overrideAccess: true,
      pagination: false,
      sort: ['priority', '-createdAt'],
      where: activeBannerWhere({ draft, now: new Date(), pageID, previewBannerID }),
    })

    return groupBannersByPlacement(result.docs)
  } catch (error) {
    payload.logger.error({ err: error, pageID }, 'Could not resolve scheduled page banners')
    return emptyBannerSlots<Banner>()
  }
}
