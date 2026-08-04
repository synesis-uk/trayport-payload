// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'

const cacheHarness = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

const routeRegistryHarness = vi.hoisted(() => ({
  ensureSystemRouteClaims: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: cacheHarness.revalidatePath,
  revalidateTag: cacheHarness.revalidateTag,
}))

vi.mock('@/routing/registry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/routing/registry')>()

  return {
    ...actual,
    ensureSystemRouteClaims: routeRegistryHarness.ensureSystemRouteClaims,
  }
})

import {
  revalidateDeletedRoutableContent,
  revalidateRoutableContent,
} from '@/collections/hooks/revalidateContent'
import { ArticleCategories } from '@/collections/ArticleCategories'
import { AssetClasses } from '@/collections/AssetClasses'
import { LearningVideoCategories } from '@/collections/LearningVideoCategories'
import { Media } from '@/collections/Media'
import { Offices } from '@/collections/Offices'
import { Regions } from '@/collections/Regions'
import { VenueTypes } from '@/collections/VenueTypes'
import {
  articleListingCacheTag,
  cacheDependencyCollectionTag,
  cacheDependencyTag,
  CONTENT_SITEMAP_CACHE_TAG,
  contentRouteCacheTag,
  IMMEDIATE_CACHE_TAG_EXPIRY,
  LEARNING_VIDEO_LISTING_CACHE_TAG,
  MARKET_COVERAGE_INDEX_CACHE_TAG,
  ROUTE_REGISTRY_CACHE_TAG,
  VENUE_INDEX_CACHE_TAG,
} from '@/data/cacheTags'
import { Footer } from '@/globals/Footer'
import { revalidateGlobal } from '@/globals/hooks/revalidateGlobal'
import { Navigation } from '@/globals/Navigation'
import { RouteIndexes } from '@/globals/RouteIndexes'
import { SiteSettings } from '@/globals/SiteSettings'
import { captureGlobalPublicProjectionIntent } from '@/hooks/publicProjection'
import {
  getRouteMutation,
  validateRoutableDocument,
  type RouteMutationOperation,
} from '@/routing/archetypes'

const logger = { info: vi.fn() }

const request = ({
  context = {},
  query = {},
}: {
  context?: Record<string, unknown>
  query?: Record<string, unknown>
} = {}) =>
  ({
    context,
    payload: { logger },
    query,
    searchParams: new URLSearchParams(
      Object.entries(query).flatMap(([key, value]) =>
        typeof value === 'string' ? [[key, value]] : [],
      ),
    ),
  }) as never

const contentArgs = ({
  collection = 'pages',
  context = {},
  current,
  previous,
  query = {},
}: {
  collection?: string
  context?: Record<string, unknown>
  current: Record<string, unknown>
  previous: null | Record<string, unknown>
  query?: Record<string, unknown>
}) => ({
  collection: { slug: collection },
  context,
  data: current,
  doc: current,
  operation: 'update' as RouteMutationOperation,
  previousDoc: previous,
  req: request({ context, query }),
})

const globalArgs = ({
  context = {},
  current,
  previous,
  query = {},
}: {
  context?: Record<string, unknown>
  current: Record<string, unknown>
  previous: null | Record<string, unknown>
  query?: Record<string, unknown>
}) => ({
  context,
  data: current,
  doc: current,
  previousDoc: previous,
  req: request({ context, query }),
})

const callRouteIndexesAfterChange = async (args: ReturnType<typeof globalArgs>) => {
  const hook = RouteIndexes.hooks?.afterChange?.[0]
  if (typeof hook !== 'function') throw new Error('RouteIndexes afterChange hook is missing')

  return hook(args as never)
}

beforeEach(() => {
  cacheHarness.revalidatePath.mockReset()
  cacheHarness.revalidateTag.mockReset()
  routeRegistryHarness.ensureSystemRouteClaims.mockReset()
  logger.info.mockReset()
})

describe('routable content public revalidation', () => {
  it('does not invalidate public caches for draft autosaves or explicit draft saves', async () => {
    const hook = revalidateRoutableContent(['/related/'])

    for (const query of [{ autosave: 'true', draft: 'true' }, { draft: 'true' }]) {
      await hook(
        contentArgs({
          current: { _status: 'draft', path: '/edited-draft/' },
          previous: { _status: 'published', path: '/published/' },
          query,
        }) as never,
      )
    }

    expect(cacheHarness.revalidatePath).not.toHaveBeenCalled()
    expect(cacheHarness.revalidateTag).not.toHaveBeenCalled()
  })

  it('invalidates the published route, related projections, and tag on publish', async () => {
    const hook = revalidateRoutableContent(['/related/'])

    await hook(
      contentArgs({
        current: { _status: 'published', path: '/published/' },
        previous: { _status: 'draft', path: '/published/' },
      }) as never,
    )

    expect(cacheHarness.revalidatePath.mock.calls).toEqual([['/published/'], ['/related/']])
    expect(cacheHarness.revalidateTag.mock.calls).toEqual([
      [contentRouteCacheTag('/published/'), IMMEDIATE_CACHE_TAG_EXPIRY],
      [cacheDependencyCollectionTag('pages'), 'max'],
      [ROUTE_REGISTRY_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY],
      [CONTENT_SITEMAP_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY],
    ])
  })

  it('invalidates the former route, related projections, and tag on unpublish', async () => {
    const hook = revalidateRoutableContent(['/related/'])

    await hook(
      contentArgs({
        current: { _status: 'draft', path: '/published/' },
        previous: { _status: 'published', path: '/published/' },
      }) as never,
    )

    expect(cacheHarness.revalidatePath.mock.calls).toEqual([['/published/'], ['/related/']])
    expect(cacheHarness.revalidateTag.mock.calls).toEqual([
      [contentRouteCacheTag('/published/'), IMMEDIATE_CACHE_TAG_EXPIRY],
      [cacheDependencyCollectionTag('pages'), 'max'],
      [ROUTE_REGISTRY_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY],
      [CONTENT_SITEMAP_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY],
    ])
  })

  it('uses the classified published path when publishing a path move from a draft', async () => {
    const context: Record<string, unknown> = {}
    const previous = {
      _status: 'draft',
      id: 41,
      layout: [{ blockType: 'trayportHero', heading: 'Moved page' }],
      pageType: 'standard',
      path: '/new-path/',
      title: 'Moved page',
    }
    const data = {
      _status: 'published',
      confirmPathRedirect: true,
    }
    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            path: '/old-path/',
            provenance: {},
            state: 'published',
          },
        ],
      }),
      logger,
    }
    const req = {
      context,
      payload,
      query: {},
      searchParams: new URLSearchParams(),
    }

    await validateRoutableDocument('pages')({
      collection: { slug: 'pages' },
      context,
      data,
      operation: 'update',
      originalDoc: previous,
      req,
    } as never)

    const current = { ...previous, ...data }
    expect(
      getRouteMutation({
        collection: 'pages',
        context,
        document: current,
        operation: 'update',
      }),
    ).toMatchObject({
      intent: 'publish',
      nextPath: '/new-path/',
      previousPublishedPath: '/old-path/',
    })

    await revalidateRoutableContent()({
      collection: { slug: 'pages' },
      context,
      data,
      doc: current,
      operation: 'update',
      previousDoc: previous,
      req,
    } as never)

    expect(cacheHarness.revalidatePath.mock.calls).toEqual([['/new-path/'], ['/old-path/']])
    expect(cacheHarness.revalidateTag.mock.calls).toEqual([
      [contentRouteCacheTag('/new-path/'), IMMEDIATE_CACHE_TAG_EXPIRY],
      [contentRouteCacheTag('/old-path/'), IMMEDIATE_CACHE_TAG_EXPIRY],
      [cacheDependencyTag('pages', 41), 'max'],
      [cacheDependencyCollectionTag('pages'), 'max'],
      [ROUTE_REGISTRY_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY],
      [CONTENT_SITEMAP_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY],
    ])
    expect(
      getRouteMutation({
        collection: 'pages',
        context,
        document: current,
        operation: 'update',
      }),
    ).toBeNull()
  })

  it('keeps same-path edits narrow while refreshing route and listing projections', async () => {
    const hook = revalidateRoutableContent(['/insights/'])

    await hook(
      contentArgs({
        collection: 'articles',
        current: { _status: 'published', articleType: 'news', path: '/edited-article/' },
        previous: {
          _status: 'published',
          articleType: 'insight',
          path: '/edited-article/',
        },
      }) as never,
    )

    expect(cacheHarness.revalidatePath.mock.calls).toEqual([['/edited-article/'], ['/insights/']])
    expect(cacheHarness.revalidateTag.mock.calls).toEqual([
      [contentRouteCacheTag('/edited-article/'), IMMEDIATE_CACHE_TAG_EXPIRY],
      [cacheDependencyCollectionTag('articles'), 'max'],
      [articleListingCacheTag('all'), 'max'],
      [articleListingCacheTag('news'), 'max'],
      [articleListingCacheTag('insights'), 'max'],
      [CONTENT_SITEMAP_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY],
    ])
    expect(cacheHarness.revalidateTag).not.toHaveBeenCalledWith(
      ROUTE_REGISTRY_CACHE_TAG,
      expect.anything(),
    )
  })

  it.each([
    ['learning-videos', LEARNING_VIDEO_LISTING_CACHE_TAG],
    ['hubs', MARKET_COVERAGE_INDEX_CACHE_TAG],
    ['venues', VENUE_INDEX_CACHE_TAG],
  ] as const)(
    'refreshes the %s projection independently of the route set',
    async (collection, tag) => {
      const hook = revalidateRoutableContent()

      await hook(
        contentArgs({
          collection,
          current: { _status: 'published' },
          previous: { _status: 'published' },
        }) as never,
      )

      expect(cacheHarness.revalidateTag.mock.calls).toEqual([
        [cacheDependencyCollectionTag(collection), 'max'],
        [tag, 'max'],
      ])
      expect(cacheHarness.revalidatePath).not.toHaveBeenCalled()
    },
  )

  it('invalidates the deleted route, listing projection, related path, and route set', async () => {
    const hook = revalidateDeletedRoutableContent(['/news/'])

    await hook({
      collection: { slug: 'articles' },
      context: {},
      doc: { articleType: 'news', path: '/deleted-article/' },
    } as never)

    expect(cacheHarness.revalidatePath.mock.calls).toEqual([['/deleted-article/'], ['/news/']])
    expect(cacheHarness.revalidateTag.mock.calls).toEqual([
      [contentRouteCacheTag('/deleted-article/'), IMMEDIATE_CACHE_TAG_EXPIRY],
      [cacheDependencyCollectionTag('articles'), 'max'],
      [articleListingCacheTag('all'), 'max'],
      [articleListingCacheTag('news'), 'max'],
      [ROUTE_REGISTRY_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY],
      [CONTENT_SITEMAP_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY],
    ])
  })

  it('keeps a pathless listing deletion out of route and sitemap caches', async () => {
    const hook = revalidateDeletedRoutableContent()

    await hook({
      collection: { slug: 'learning-videos' },
      context: {},
      doc: { title: 'Deleted listing-only video' },
    } as never)

    expect(cacheHarness.revalidatePath).not.toHaveBeenCalled()
    expect(cacheHarness.revalidateTag.mock.calls).toEqual([
      [cacheDependencyCollectionTag('learning-videos'), 'max'],
      [LEARNING_VIDEO_LISTING_CACHE_TAG, 'max'],
    ])
  })
})

describe('relationship dependency revalidation', () => {
  it('wires each populated relationship collection to exact and coarse tags', async () => {
    const dependencies = [
      ['article-categories', ArticleCategories],
      ['asset-classes', AssetClasses],
      ['learning-video-categories', LearningVideoCategories],
      ['media', Media],
      ['regions', Regions],
      ['venue-types', VenueTypes],
    ] as const

    for (const [slug, config] of dependencies) {
      const hook = config.hooks?.afterChange?.[0]
      if (typeof hook !== 'function') throw new Error(`${slug} afterChange hook is missing`)

      await hook({
        collection: { slug },
        context: {},
        doc: { id: 91 },
        previousDoc: { id: 91 },
        req: request(),
      } as never)
    }

    expect(cacheHarness.revalidateTag.mock.calls).toEqual(
      dependencies.flatMap(([slug]) => [
        [cacheDependencyTag(slug, 91), 'max'],
        [cacheDependencyCollectionTag(slug), 'max'],
      ]),
    )
    expect(cacheHarness.revalidatePath).not.toHaveBeenCalled()
  })

  it('keeps private office drafts out of public tags but invalidates publish and unpublish', async () => {
    const beforeChange = Offices.hooks?.beforeChange?.[0]
    const afterChange = Offices.hooks?.afterChange?.[0]
    if (typeof beforeChange !== 'function' || typeof afterChange !== 'function') {
      throw new Error('Office public dependency hooks are missing')
    }

    const draftContext: Record<string, unknown> = {}
    const draftRequest = request({ context: draftContext })
    await beforeChange({
      collection: { slug: 'offices' },
      data: { _status: 'draft', title: 'Private edit' },
      operation: 'update',
      originalDoc: { _status: 'published', id: 7, title: 'Public office' },
      req: draftRequest,
    } as never)
    await afterChange({
      collection: { slug: 'offices' },
      context: draftContext,
      doc: { _status: 'draft', id: 7, title: 'Private edit' },
      previousDoc: { _status: 'published', id: 7, title: 'Public office' },
      req: draftRequest,
    } as never)
    expect(cacheHarness.revalidateTag).not.toHaveBeenCalled()

    const unpublishContext: Record<string, unknown> = {}
    const unpublishRequest = request({
      context: unpublishContext,
      query: { draft: 'true' },
    })
    await beforeChange({
      collection: { slug: 'offices' },
      data: { _status: 'draft' },
      operation: 'update',
      originalDoc: { _status: 'published', id: 7, title: 'Public office' },
      req: unpublishRequest,
    } as never)
    await afterChange({
      collection: { slug: 'offices' },
      context: unpublishContext,
      doc: { _status: 'draft', id: 7 },
      previousDoc: { _status: 'draft', id: 7 },
      req: unpublishRequest,
    } as never)
    expect(cacheHarness.revalidateTag).toHaveBeenCalledWith(cacheDependencyTag('offices', 7), 'max')

    cacheHarness.revalidateTag.mockReset()
    await afterChange({
      collection: { slug: 'offices' },
      context: {},
      doc: { _status: 'published', id: 7 },
      previousDoc: { _status: 'draft', id: 7 },
      req: request(),
    } as never)
    expect(cacheHarness.revalidateTag.mock.calls).toEqual([
      [cacheDependencyTag('offices', 7), 'max'],
      [cacheDependencyCollectionTag('offices'), 'max'],
    ])
  })

  it('invalidates a deleted dependency narrowly and retains the import escape hatch', async () => {
    const deleteHook = Media.hooks?.afterDelete?.[0]
    const changeHook = Media.hooks?.afterChange?.[0]
    if (typeof deleteHook !== 'function' || typeof changeHook !== 'function') {
      throw new Error('Media dependency hooks are missing')
    }

    await deleteHook({
      collection: { slug: 'media' },
      context: {},
      doc: { id: 44 },
      req: request(),
    } as never)
    await changeHook({
      collection: { slug: 'media' },
      context: { disableRevalidate: true },
      doc: { id: 45 },
      previousDoc: { id: 45 },
      req: request({ context: { disableRevalidate: true } }),
    } as never)

    expect(cacheHarness.revalidateTag.mock.calls).toEqual([
      [cacheDependencyTag('media', 44), 'max'],
      [cacheDependencyCollectionTag('media'), 'max'],
    ])
    expect(cacheHarness.revalidatePath).not.toHaveBeenCalled()
  })
})

describe('global public revalidation', () => {
  it('captures publication intent before all draft-enabled global mutations', () => {
    for (const global of [Navigation, Footer, SiteSettings, RouteIndexes]) {
      expect(global.hooks?.beforeOperation).toContain(captureGlobalPublicProjectionIntent)
    }
  })

  it('does not invalidate public layout caches for autosaves, draft saves, or draft-only data', async () => {
    const hook = revalidateGlobal('navigation')

    for (const args of [
      globalArgs({
        current: { _status: 'draft' },
        previous: { _status: 'published' },
        query: { autosave: 'true', draft: 'true' },
      }),
      globalArgs({
        current: { _status: 'draft' },
        previous: { _status: 'published' },
        query: { draft: 'true' },
      }),
      globalArgs({
        current: { _status: 'draft' },
        previous: { _status: 'draft' },
      }),
    ]) {
      await hook(args as never)
    }

    expect(cacheHarness.revalidatePath).not.toHaveBeenCalled()
    expect(cacheHarness.revalidateTag).not.toHaveBeenCalled()
  })

  it('classifies a local draft save as private even when request query flags are unavailable', async () => {
    const context: Record<string, unknown> = {}
    const req = request({ context })

    await captureGlobalPublicProjectionIntent({
      args: {
        data: { _status: 'draft', primary: [{ label: 'Edited draft' }] },
        draft: true,
      },
      context,
      global: { slug: 'navigation' },
      operation: 'update',
      req,
    } as never)
    await revalidateGlobal('navigation')(
      globalArgs({
        context,
        current: { _status: 'draft' },
        previous: { _status: 'published' },
      }) as never,
    )

    expect(cacheHarness.revalidatePath).not.toHaveBeenCalled()
    expect(cacheHarness.revalidateTag).not.toHaveBeenCalled()
  })

  it('does not rewrite public index claims or caches for route-index draft writes', async () => {
    for (const query of [{ autosave: 'true', draft: 'true' }, { draft: 'true' }]) {
      await callRouteIndexesAfterChange(
        globalArgs({
          current: { _status: 'draft', venueIndex: { title: 'Edited draft' } },
          previous: { _status: 'published', venueIndex: { title: 'Published index' } },
          query,
        }),
      )
    }

    const context: Record<string, unknown> = {}
    const req = request({ context })

    await captureGlobalPublicProjectionIntent({
      args: {
        data: { _status: 'draft', venueIndex: { title: 'Local draft' } },
        draft: true,
      },
      context,
      global: { slug: 'route-indexes' },
      operation: 'update',
      req,
    } as never)
    await callRouteIndexesAfterChange(
      globalArgs({
        context,
        current: { _status: 'draft', venueIndex: { title: 'Local draft' } },
        previous: { _status: 'published', venueIndex: { title: 'Published index' } },
      }),
    )

    expect(routeRegistryHarness.ensureSystemRouteClaims).not.toHaveBeenCalled()
    expect(cacheHarness.revalidatePath).not.toHaveBeenCalled()
    expect(cacheHarness.revalidateTag).not.toHaveBeenCalled()
  })

  it('refreshes public index claims, paths, and route caches on publish', async () => {
    const args = globalArgs({
      current: { _status: 'published', venueIndex: { title: 'Published index' } },
      previous: { _status: 'draft', venueIndex: { title: 'Draft index' } },
    })

    await callRouteIndexesAfterChange(args)

    expect(routeRegistryHarness.ensureSystemRouteClaims).toHaveBeenCalledOnce()
    expect(cacheHarness.revalidatePath.mock.calls).toEqual([['/venue/'], ['/market-coverage/']])
    expect(cacheHarness.revalidateTag.mock.calls).toEqual([
      [contentRouteCacheTag('/venue/'), IMMEDIATE_CACHE_TAG_EXPIRY],
      [contentRouteCacheTag('/market-coverage/'), IMMEDIATE_CACHE_TAG_EXPIRY],
      [ROUTE_REGISTRY_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY],
      [CONTENT_SITEMAP_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY],
    ])
  })

  it('refreshes public index claims, paths, and route caches on a classified unpublish', async () => {
    const context: Record<string, unknown> = {}
    const req = request({ context, query: { draft: 'true' } })

    await captureGlobalPublicProjectionIntent({
      args: { data: { _status: 'draft' }, draft: true },
      context,
      global: { slug: 'route-indexes' },
      operation: 'update',
      req,
    } as never)
    await callRouteIndexesAfterChange(
      globalArgs({
        context,
        current: { _status: 'draft' },
        previous: { _status: 'draft' },
        query: { draft: 'true' },
      }),
    )

    expect(routeRegistryHarness.ensureSystemRouteClaims).toHaveBeenCalledOnce()
    expect(cacheHarness.revalidatePath.mock.calls).toEqual([['/venue/'], ['/market-coverage/']])
    expect(cacheHarness.revalidateTag.mock.calls).toEqual([
      [contentRouteCacheTag('/venue/'), IMMEDIATE_CACHE_TAG_EXPIRY],
      [contentRouteCacheTag('/market-coverage/'), IMMEDIATE_CACHE_TAG_EXPIRY],
      [ROUTE_REGISTRY_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY],
      [CONTENT_SITEMAP_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY],
    ])
  })

  it('retains the route-index import revalidation escape hatch', async () => {
    await callRouteIndexesAfterChange(
      globalArgs({
        context: { disableRevalidate: true },
        current: { _status: 'published' },
        previous: { _status: 'draft' },
      }),
    )

    expect(routeRegistryHarness.ensureSystemRouteClaims).not.toHaveBeenCalled()
    expect(cacheHarness.revalidatePath).not.toHaveBeenCalled()
    expect(cacheHarness.revalidateTag).not.toHaveBeenCalled()
  })

  it('invalidates the global tag and layout when a published projection is saved', async () => {
    await revalidateGlobal('navigation')(
      globalArgs({
        current: { _status: 'published' },
        previous: { _status: 'draft' },
      }) as never,
    )

    expect(cacheHarness.revalidateTag).toHaveBeenCalledWith('global_navigation', 'max')
    expect(cacheHarness.revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('invalidates the global tag and layout when a published projection is unpublished', async () => {
    await revalidateGlobal('navigation')(
      globalArgs({
        current: { _status: 'draft' },
        previous: { _status: 'published' },
      }) as never,
    )

    expect(cacheHarness.revalidateTag).toHaveBeenCalledWith('global_navigation', 'max')
    expect(cacheHarness.revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('invalidates a status-only unpublish even when Payload carries draft=true', async () => {
    const context: Record<string, unknown> = {}
    const req = request({ context, query: { draft: 'true' } })

    await captureGlobalPublicProjectionIntent({
      args: { data: { _status: 'draft' }, draft: true },
      context,
      global: { slug: 'navigation' },
      operation: 'update',
      req,
    } as never)
    await revalidateGlobal('navigation')(
      globalArgs({
        context,
        current: { _status: 'draft' },
        previous: { _status: 'draft' },
        query: { draft: 'true' },
      }) as never,
    )

    expect(cacheHarness.revalidateTag).toHaveBeenCalledWith('global_navigation', 'max')
    expect(cacheHarness.revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('retains the disableRevalidate import escape hatch', async () => {
    await revalidateGlobal('navigation')(
      globalArgs({
        context: { disableRevalidate: true },
        current: { _status: 'published' },
        previous: { _status: 'published' },
      }) as never,
    )

    expect(cacheHarness.revalidatePath).not.toHaveBeenCalled()
    expect(cacheHarness.revalidateTag).not.toHaveBeenCalled()
  })
})
