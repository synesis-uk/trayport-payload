import type { Where } from 'payload'

export const bannerPlacements = ['first', 'second', 'last'] as const
export type BannerPlacement = (typeof bannerPlacements)[number]
export type BannerSlots<T> = Record<BannerPlacement, T[]>

type BannerLike = {
  position?: string | null
}

export const emptyBannerSlots = <T>(): BannerSlots<T> => ({
  first: [],
  last: [],
  second: [],
})

export const groupBannersByPlacement = <T extends BannerLike>(
  banners: readonly T[],
): BannerSlots<T> => {
  const slots = emptyBannerSlots<T>()

  for (const banner of banners) {
    const placement = bannerPlacements.includes(banner.position as BannerPlacement)
      ? (banner.position as BannerPlacement)
      : 'first'
    slots[placement].push(banner)
  }

  return slots
}

export const activeBannerWhere = ({
  draft,
  now,
  pageID,
  previewBannerID,
}: {
  draft: boolean
  now: Date
  pageID: number | string
  previewBannerID?: number
}): Where => {
  const targetWhere: Where = {
    or: [
      { targetMode: { equals: 'all' } },
      {
        and: [{ targetMode: { equals: 'specific' } }, { targetPages: { contains: pageID } }],
      },
    ],
  }

  if (draft && previewBannerID !== undefined) {
    return {
      and: [{ id: { equals: previewBannerID } }, targetWhere],
    }
  }

  return {
    and: [
      ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      { startAt: { less_than_equal: now.toISOString() } },
      { endAt: { greater_than_equal: now.toISOString() } },
      targetWhere,
    ],
  }
}

export const normalizeBannerPreviewID = (value: unknown): number | undefined => {
  const candidate = Array.isArray(value) ? value[0] : value
  if (typeof candidate !== 'string' || !/^\d+$/.test(candidate)) return undefined

  const parsed = Number(candidate)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined
}

export const validateBannerEndAt = (
  value: unknown,
  siblingData: { startAt?: unknown } | undefined,
): string | true => {
  const start = typeof siblingData?.startAt === 'string' ? Date.parse(siblingData.startAt) : NaN
  const end = typeof value === 'string' ? Date.parse(value) : NaN

  if (!Number.isFinite(end)) return 'Choose when the banner should stop displaying.'
  if (!Number.isFinite(start)) return 'Choose when the banner should start displaying.'
  return end > start ? true : 'The end date must be later than the start date.'
}

export const validateBannerTargets = (
  value: unknown,
  siblingData: { targetMode?: unknown } | undefined,
): string | true =>
  siblingData?.targetMode !== 'specific' || (Array.isArray(value) && value.length > 0)
    ? true
    : 'Choose at least one page, or change “Show on” to all pages.'
