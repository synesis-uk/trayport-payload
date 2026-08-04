// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'

const routeCacheHarness = vi.hoisted(() => ({
  auth: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  connection: vi.fn(),
  draftMode: vi.fn(),
  findByID: vi.fn(),
  findGlobal: vi.fn(),
  findRouteClaim: vi.fn(),
  generateMeta: vi.fn(() => ({})),
  headers: vi.fn(),
  reactCacheWrappers: [] as Array<(...args: unknown[]) => unknown>,
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  warn: vi.fn(),
}))

vi.mock('@payload-config', () => ({
  default: Promise.resolve({}),
}))

vi.mock('payload', () => ({
  getPayload: async () => ({
    auth: routeCacheHarness.auth,
    findByID: routeCacheHarness.findByID,
    findGlobal: routeCacheHarness.findGlobal,
    logger: { warn: routeCacheHarness.warn },
  }),
}))

vi.mock('next/cache', () => ({
  cacheLife: routeCacheHarness.cacheLife,
  cacheTag: routeCacheHarness.cacheTag,
  revalidatePath: routeCacheHarness.revalidatePath,
  revalidateTag: routeCacheHarness.revalidateTag,
}))

vi.mock('next/headers', () => ({
  draftMode: routeCacheHarness.draftMode,
  headers: routeCacheHarness.headers,
}))

vi.mock('next/server', () => ({
  connection: routeCacheHarness.connection,
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}))

vi.mock('react', async (importOriginal) => {
  const original = await importOriginal<typeof import('react')>()

  return {
    ...original,
    cache: (callback: (...args: unknown[]) => unknown) => {
      const wrapped = (...args: unknown[]) => callback(...args)
      routeCacheHarness.reactCacheWrappers.push(wrapped)
      return wrapped
    },
  }
})

vi.mock('@/components/LivePreviewListener/DynamicLivePreviewListener.client', () => ({
  DynamicLivePreviewListener: () => null,
}))

vi.mock('@/components/content', () => ({
  ArticleView: () => null,
  HubView: () => null,
  LearningVideoView: () => null,
  MarketCoverageIndexView: () => null,
  PageView: () => null,
  VenueIndexView: () => null,
  VenueView: () => null,
}))

vi.mock('@/components/Trayport/StructuredData', () => ({
  StructuredData: () => null,
}))

vi.mock('@/routing/registry', () => ({
  findRouteClaim: routeCacheHarness.findRouteClaim,
}))

vi.mock('@/utilities/generateMeta', () => ({
  generateMeta: routeCacheHarness.generateMeta,
}))

vi.mock('@/utilities/getGlobals', () => ({
  getCachedGlobal: async () => ({}),
}))

import {
  CONTENT_ROUTE_CACHE_LIFE,
  CONTENT_ROUTE_CACHE_REVALIDATE_SECONDS,
  CONTENT_ROUTE_CACHE_TAG_PREFIX,
  contentRouteCacheContract,
  contentRouteSelects,
  getCachedPublishedContentRoute,
  loadContentRouteResult,
  queryContentByPath,
} from '@/app/(frontend)/contentRoute.loader.server'
import { contentRouteMetadata } from '@/app/(frontend)/contentRoute.metadata.server'
import { normalizeListingSearchQuery } from '@/app/(frontend)/contentRoute.path'
import { revalidateRoutableContent } from '@/collections/hooks/revalidateContent'
import {
  cacheDependencyTag,
  CONTENT_SITEMAP_CACHE_TAG,
  contentRouteCacheTag,
  IMMEDIATE_CACHE_TAG_EXPIRY,
  REDIRECTS_CACHE_TAG,
  ROUTE_REGISTRY_CACHE_TAG,
} from '@/data/cacheTags'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'

const claim = {
  archetype: 'page.standard',
  ownerCollection: 'pages',
  ownerDocumentId: '101',
  ownerKind: 'content',
  path: '/cache-contract/',
  state: 'published',
}

const document = {
  _status: 'published',
  heroMedia: { id: 501 },
  id: 101,
  layout: [
    {
      components: [
        { office: { id: 601 } },
        {
          link: {
            reference: {
              relationTo: 'pages',
              value: { id: 202, path: '/managed-destination/' },
            },
          },
        },
      ],
    },
  ],
  path: '/cache-contract/',
  slug: 'cache-contract',
  title: 'Cache contract',
}

describe('content-route request input', () => {
  it('normalizes one bounded listing query without making it part of the content cache key', () => {
    expect(normalizeListingSearchQuery('  market data  ')).toBe('market data')
    expect(normalizeListingSearchQuery(['first query', 'ignored query'])).toBe('first query')
    expect(normalizeListingSearchQuery('x'.repeat(250))).toHaveLength(200)
    expect(normalizeListingSearchQuery(undefined)).toBe('')
  })
})

beforeEach(() => {
  routeCacheHarness.auth.mockReset()
  routeCacheHarness.cacheLife.mockReset()
  routeCacheHarness.cacheTag.mockReset()
  routeCacheHarness.connection.mockReset()
  routeCacheHarness.draftMode.mockReset()
  routeCacheHarness.findByID.mockReset()
  routeCacheHarness.findGlobal.mockReset()
  routeCacheHarness.findRouteClaim.mockReset()
  routeCacheHarness.generateMeta.mockClear()
  routeCacheHarness.headers.mockReset()
  routeCacheHarness.revalidatePath.mockReset()
  routeCacheHarness.revalidateTag.mockReset()
  routeCacheHarness.warn.mockReset()

  routeCacheHarness.draftMode.mockResolvedValue({ isEnabled: false })
  routeCacheHarness.headers.mockResolvedValue(new Headers())
  routeCacheHarness.auth.mockResolvedValue({ user: null })
  routeCacheHarness.findRouteClaim.mockResolvedValue(claim)
  routeCacheHarness.findByID.mockResolvedValue(document)
})

describe('content route cache boundary', () => {
  it('declares the tagged use-cache contract and retains request memoization', () => {
    expect(contentRouteCacheContract).toEqual({
      cacheKeyStrategy: 'use-cache-arguments',
      cacheLife: CONTENT_ROUTE_CACHE_LIFE,
      cacheTagStrategy: `${CONTENT_ROUTE_CACHE_TAG_PREFIX}:<canonical-path>`,
      draftCached: false,
      publishedCached: true,
      requestMemoized: true,
      revalidate: CONTENT_ROUTE_CACHE_REVALIDATE_SECONDS,
    })
    expect(CONTENT_ROUTE_CACHE_LIFE).toEqual({
      expire: 3600,
      revalidate: 300,
      stale: 300,
    })
    expect(routeCacheHarness.reactCacheWrappers).toContain(queryContentByPath)
  })

  it('uses tags that the existing content and redirect hooks invalidate', async () => {
    const payload = { logger: { info: vi.fn() } }
    const contentHook = revalidateRoutableContent()

    await contentHook({
      context: {},
      doc: { _status: 'published', path: '/cache-contract/' },
      previousDoc: null,
      req: { payload },
    } as never)
    await revalidateRedirects({
      doc: { from: '/redirect-source/' },
      previousDoc: null,
      req: { context: {}, payload },
    } as never)

    expect(routeCacheHarness.revalidateTag).toHaveBeenCalledWith(
      contentRouteCacheTag('/cache-contract/'),
      IMMEDIATE_CACHE_TAG_EXPIRY,
    )
    expect(routeCacheHarness.revalidateTag).toHaveBeenCalledWith(
      CONTENT_SITEMAP_CACHE_TAG,
      IMMEDIATE_CACHE_TAG_EXPIRY,
    )
    expect(routeCacheHarness.revalidateTag).toHaveBeenCalledWith(
      ROUTE_REGISTRY_CACHE_TAG,
      IMMEDIATE_CACHE_TAG_EXPIRY,
    )
    expect(routeCacheHarness.revalidateTag).toHaveBeenCalledWith(
      contentRouteCacheTag('/redirect-source/'),
      IMMEDIATE_CACHE_TAG_EXPIRY,
    )
    expect(routeCacheHarness.revalidateTag).toHaveBeenCalledWith(
      REDIRECTS_CACHE_TAG,
      IMMEDIATE_CACHE_TAG_EXPIRY,
    )
  })

  it('resolves published content through cacheLife and cacheTag with public access', async () => {
    await expect(getCachedPublishedContentRoute('/cache-contract/')).resolves.toMatchObject({
      document,
      kind: 'page',
    })

    expect(routeCacheHarness.cacheLife).toHaveBeenCalledWith(CONTENT_ROUTE_CACHE_LIFE)
    expect(routeCacheHarness.cacheTag).toHaveBeenCalledWith(
      contentRouteCacheTag('/cache-contract/'),
    )
    expect(routeCacheHarness.cacheTag).toHaveBeenCalledWith(cacheDependencyTag('media', 501))
    expect(routeCacheHarness.cacheTag).toHaveBeenCalledWith(cacheDependencyTag('offices', 601))
    expect(routeCacheHarness.cacheTag).toHaveBeenCalledWith(cacheDependencyTag('pages', 202))
    expect(routeCacheHarness.findRouteClaim).toHaveBeenCalledWith({
      draft: false,
      path: '/cache-contract/',
      payload: expect.any(Object),
    })
    expect(routeCacheHarness.findByID).toHaveBeenCalledWith({
      collection: 'pages',
      depth: 3,
      disableErrors: true,
      draft: false,
      id: '101',
      overrideAccess: false,
      select: contentRouteSelects.pages,
    })
  })

  it('keeps authenticated draft resolution completely outside use cache', async () => {
    await expect(
      loadContentRouteResult({ draft: true, path: '/cache-contract/' }),
    ).resolves.toMatchObject({ document, kind: 'page' })

    expect(routeCacheHarness.cacheLife).not.toHaveBeenCalled()
    expect(routeCacheHarness.cacheTag).not.toHaveBeenCalled()
    expect(routeCacheHarness.findRouteClaim).toHaveBeenCalledWith({
      draft: true,
      path: '/cache-contract/',
      payload: expect.any(Object),
    })
    expect(routeCacheHarness.findByID).toHaveBeenCalledWith({
      collection: 'pages',
      depth: 3,
      disableErrors: true,
      draft: true,
      id: '101',
      overrideAccess: true,
      select: contentRouteSelects.pages,
    })
  })

  it('routes an authenticated editor preview through the uncached draft branch', async () => {
    routeCacheHarness.draftMode.mockResolvedValue({ isEnabled: true })
    routeCacheHarness.auth.mockResolvedValue({ user: { id: 7, roles: ['editor'] } })

    await expect(queryContentByPath('/cache-contract/')).resolves.toMatchObject({
      document,
      kind: 'page',
    })

    expect(routeCacheHarness.auth).toHaveBeenCalledWith({ headers: expect.any(Headers) })
    expect(routeCacheHarness.cacheLife).not.toHaveBeenCalled()
    expect(routeCacheHarness.cacheTag).not.toHaveBeenCalled()
    expect(routeCacheHarness.findRouteClaim).toHaveBeenCalledWith({
      draft: true,
      path: '/cache-contract/',
      payload: expect.any(Object),
    })
  })

  it('does not expose drafts when a draft-mode request has no CMS role', async () => {
    routeCacheHarness.draftMode.mockResolvedValue({ isEnabled: true })
    routeCacheHarness.auth.mockResolvedValue({ user: null })

    await expect(queryContentByPath('/cache-contract/')).resolves.toMatchObject({
      document,
      kind: 'page',
    })

    expect(routeCacheHarness.cacheLife).toHaveBeenCalledWith(CONTENT_ROUTE_CACHE_LIFE)
    expect(routeCacheHarness.cacheTag).toHaveBeenCalledWith(
      contentRouteCacheTag('/cache-contract/'),
    )
    expect(routeCacheHarness.findRouteClaim).toHaveBeenCalledWith({
      draft: false,
      path: '/cache-contract/',
      payload: expect.any(Object),
    })
  })

  it('always generates published metadata, even on an authenticated draft request', async () => {
    routeCacheHarness.draftMode.mockResolvedValue({ isEnabled: true })
    routeCacheHarness.auth.mockResolvedValue({ user: { id: 7, roles: ['editor'] } })

    await contentRouteMetadata({ segments: ['cache-contract'] })

    expect(routeCacheHarness.connection).toHaveBeenCalledOnce()
    expect(routeCacheHarness.draftMode).not.toHaveBeenCalled()
    expect(routeCacheHarness.auth).not.toHaveBeenCalled()
    expect(routeCacheHarness.findRouteClaim).toHaveBeenCalledWith({
      draft: false,
      path: '/cache-contract/',
      payload: expect.any(Object),
    })
    expect(routeCacheHarness.generateMeta).toHaveBeenCalledWith({
      contentType: 'website',
      doc: document,
      settings: {},
    })
  })
})
