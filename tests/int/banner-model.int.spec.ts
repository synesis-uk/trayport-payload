import {
  activeBannerWhere,
  groupBannersByPlacement,
  normalizeBannerPreviewID,
  validateBannerEndAt,
  validateBannerTargets,
} from '@/banners/model'
import { generateBannerPreviewPath } from '@/banners/preview'
import { describe, expect, it, vi } from 'vitest'

describe('scheduled banner model', () => {
  it('requires a valid forward date range and specific-page targets', () => {
    expect(validateBannerEndAt('2026-08-05T12:00:00Z', { startAt: '2026-08-05T11:00:00Z' })).toBe(
      true,
    )
    expect(
      validateBannerEndAt('2026-08-05T10:00:00Z', { startAt: '2026-08-05T11:00:00Z' }),
    ).toMatch(/later than/i)
    expect(validateBannerTargets([], { targetMode: 'specific' })).toMatch(/at least one page/i)
    expect(validateBannerTargets([], { targetMode: 'all' })).toBe(true)
  })

  it('queries only the active date window and the current page target', () => {
    expect(
      activeBannerWhere({
        draft: false,
        now: new Date('2026-08-05T11:30:00.000Z'),
        pageID: 42,
      }),
    ).toEqual({
      and: [
        { _status: { equals: 'published' } },
        { startAt: { less_than_equal: '2026-08-05T11:30:00.000Z' } },
        { endAt: { greater_than_equal: '2026-08-05T11:30:00.000Z' } },
        {
          or: [
            { targetMode: { equals: 'all' } },
            {
              and: [{ targetMode: { equals: 'specific' } }, { targetPages: { contains: 42 } }],
            },
          ],
        },
      ],
    })
  })

  it('previews only the selected banner on one of its target pages outside the date window', () => {
    expect(
      activeBannerWhere({
        draft: true,
        now: new Date('2026-08-05T11:30:00.000Z'),
        pageID: 42,
        previewBannerID: 7,
      }),
    ).toEqual({
      and: [
        { id: { equals: 7 } },
        {
          or: [
            { targetMode: { equals: 'all' } },
            {
              and: [{ targetMode: { equals: 'specific' } }, { targetPages: { contains: 42 } }],
            },
          ],
        },
      ],
    })
    expect(normalizeBannerPreviewID('7')).toBe(7)
    expect(normalizeBannerPreviewID(['9', '10'])).toBe(9)
    expect(normalizeBannerPreviewID('0')).toBeUndefined()
    expect(normalizeBannerPreviewID('../7')).toBeUndefined()
  })

  it('builds a saved banner preview against the first managed target page', async () => {
    const previousSecret = process.env.PREVIEW_SECRET
    process.env.PREVIEW_SECRET = 'banner-preview-secret'
    const findByID = vi.fn().mockResolvedValue({ path: '/products/exchange-connectivity/' })

    try {
      await expect(
        generateBannerPreviewPath({
          data: { id: 7, targetMode: 'specific', targetPages: [42] },
          payload: { findByID } as never,
        }),
      ).resolves.toBe(
        '/next/preview?path=%2Fproducts%2Fexchange-connectivity%2F&previewSecret=banner-preview-secret&banner=7',
      )
      expect(findByID).toHaveBeenCalledWith(
        expect.objectContaining({ collection: 'pages', id: 42, overrideAccess: true }),
      )
    } finally {
      if (previousSecret === undefined) delete process.env.PREVIEW_SECRET
      else process.env.PREVIEW_SECRET = previousSecret
    }
  })

  it('groups unknown legacy placements safely into the first slot', () => {
    const first = { position: 'first', title: 'First' }
    const second = { position: 'second', title: 'Second' }
    const legacy = { position: 'unknown', title: 'Legacy' }

    expect(groupBannersByPlacement([first, second, legacy])).toEqual({
      first: [first, legacy],
      last: [],
      second: [second],
    })
  })
})
