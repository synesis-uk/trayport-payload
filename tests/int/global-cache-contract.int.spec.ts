// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'

const globalCacheHarness = vi.hoisted(() => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  findGlobal: vi.fn(),
}))

vi.mock('@payload-config', () => ({
  default: Promise.resolve({}),
}))

vi.mock('payload', () => ({
  getPayload: async () => ({ findGlobal: globalCacheHarness.findGlobal }),
}))

vi.mock('next/cache', () => ({
  cacheLife: globalCacheHarness.cacheLife,
  cacheTag: globalCacheHarness.cacheTag,
}))

import { cacheDependencyTag } from '@/data/cacheTags'
import { GLOBAL_CACHE_LIFE, getCachedGlobal } from '@/utilities/getGlobals'

beforeEach(() => {
  globalCacheHarness.cacheLife.mockReset()
  globalCacheHarness.cacheTag.mockReset()
  globalCacheHarness.findGlobal.mockReset()
})

describe('published global cache boundary', () => {
  it('tags the global and uses bounded published public access', async () => {
    const navigation = {
      id: 1,
      primaryItems: [
        {
          groups: [
            {
              items: [
                {
                  link: {
                    reference: {
                      relationTo: 'pages',
                      value: { id: 41, path: '/managed-page/' },
                    },
                  },
                  media: { id: 33 },
                },
              ],
            },
          ],
        },
      ],
    }
    globalCacheHarness.findGlobal.mockResolvedValue(navigation)

    await expect(getCachedGlobal('navigation', 3)).resolves.toBe(navigation)

    expect(globalCacheHarness.cacheLife).toHaveBeenCalledWith(GLOBAL_CACHE_LIFE)
    expect(globalCacheHarness.cacheTag).toHaveBeenCalledWith('global_navigation')
    expect(globalCacheHarness.cacheTag).toHaveBeenCalledWith(cacheDependencyTag('pages', 41))
    expect(globalCacheHarness.cacheTag).toHaveBeenCalledWith(cacheDependencyTag('media', 33))
    expect(globalCacheHarness.findGlobal).toHaveBeenCalledWith({
      slug: 'navigation',
      depth: 3,
      draft: false,
      overrideAccess: false,
    })
  })

  it('keeps a five-minute refresh bound when import hooks are suppressed', () => {
    expect(GLOBAL_CACHE_LIFE).toEqual({
      expire: 3600,
      revalidate: 300,
      stale: 300,
    })
  })
})
