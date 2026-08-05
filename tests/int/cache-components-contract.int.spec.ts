// @vitest-environment node

import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = (relativePath: string): string =>
  readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8')

describe('Next.js Cache Components boundary', () => {
  it('enables Cache Components and removes unsupported route-segment configs', () => {
    expect(source('next.config.ts')).toContain('cacheComponents: true')

    for (const route of [
      'src/app/(frontend)/page.tsx',
      'src/app/(frontend)/[...segments]/page.tsx',
      'src/app/(frontend)/(sitemaps)/content-sitemap.xml/route.ts',
      'src/app/(design-system)/design-system/page.tsx',
    ]) {
      expect(source(route), route).not.toMatch(/export const dynamic\s*=/)
    }

    expect(source('src/app/(frontend)/(sitemaps)/content-sitemap.xml/route.ts')).toContain(
      'await connection()',
    )
    expect(source('src/app/(frontend)/(sitemaps)/content-sitemap.xml/route.ts')).toContain(
      'getServerSideSitemap(await getCachedContentSitemap())',
    )
  })

  it('keeps request data behind close Suspense boundaries', () => {
    const layout = source('src/app/(frontend)/layout.tsx')
    const catchAll = source('src/app/(frontend)/[...segments]/page.tsx')
    const contentRouteRenderer = source('src/app/(frontend)/contentRoute.renderer.tsx')

    expect(layout).toContain('<Suspense fallback={null}>')
    expect(layout).toContain('<DraftAdminBar />')
    expect(layout).toContain('<Suspense fallback={<HeaderFallback />}>')
    expect(layout).toContain('<RequestTimeHeader />')
    expect(layout).toContain('<Suspense fallback={<FooterFallback />}>')
    expect(layout).toContain('<RequestTimeFooter />')
    expect(catchAll).toContain('<Suspense fallback={<ContentLoadingState />}>')
    expect(catchAll).toContain('<CatchAllContent params={params} searchParams={searchParams} />')
    expect(contentRouteRenderer).toContain('<Suspense fallback={<ContentLoadingState />}>')
    expect(contentRouteRenderer).toContain('<DraftAwareContentRoute')
    expect(contentRouteRenderer).toContain('previewBannerID={previewBannerID}')
    expect(contentRouteRenderer).toContain('searchQuery={initialSearchQuery}')
  })

  it('keeps build-time fallbacks free of CMS reads', () => {
    const layout = source('src/app/(frontend)/layout.tsx')
    const home = source('src/app/(frontend)/page.tsx')
    const catchAll = source('src/app/(frontend)/[...segments]/page.tsx')
    const contentRouteMetadata = source('src/app/(frontend)/contentRoute.metadata.server.ts')
    const contentRouteRenderer = source('src/app/(frontend)/contentRoute.renderer.tsx')

    expect(layout.match(/await connection\(\)/g)).toHaveLength(2)
    expect(contentRouteRenderer.match(/await connection\(\)/g)).toHaveLength(1)
    expect(contentRouteMetadata.match(/await connection\(\)/g)).toHaveLength(1)
    expect(contentRouteRenderer).not.toContain('fallback={<PublishedContentRoute')
    expect(home).not.toMatch(/connection|getPayload/)
    expect(catchAll).not.toMatch(/connection|getPayload/)
    expect(contentRouteMetadata).not.toContain('getPayload')
    expect(contentRouteRenderer).not.toContain('getPayload')
  })

  it('streams data-backed blocks behind close non-landmark fallbacks', () => {
    const registry = source('src/components/blocks/registry.tsx')

    expect(registry.match(/<Suspense\b/g)).toHaveLength(5)
    for (const label of [
      'articles',
      'learning videos',
      'market coverage',
      'market data',
      'market matrix',
    ]) {
      expect(registry).toContain(`fallback={<AsyncBlockFallback label="${label}" />}`)
    }
    expect(registry).toContain('role="status"')
    expect(registry).not.toContain('<main')
  })

  it('makes generated-union dispatch boundaries compile-time exhaustive', () => {
    const registry = source('src/components/blocks/registry.tsx')
    const contentRouteRenderer = source('src/app/(frontend)/contentRoute.renderer.tsx')

    expect(registry.match(/\): ReactElement \| null => \{/g)).toHaveLength(2)
    expect(registry).toContain("return assertNever(component, 'Trayport section component')")
    expect(registry).toContain("return assertNever(block, 'Trayport layout block')")
    expect(contentRouteRenderer).toContain(
      "return assertNever(result, 'content route structured data')",
    )
    expect(contentRouteRenderer).toContain("return assertNever(result, 'content route renderer')")
  })

  it('uses use cache only for published RSC data paths', () => {
    for (const dataPath of [
      'src/app/(frontend)/contentRoute.loader.server.ts',
      'src/data/contentIndexes.server.ts',
      'src/data/listingContent.server.ts',
      'src/data/marketMatrix.server.ts',
      'src/data/market-data/loadMarketData.server.ts',
      'src/utilities/getGlobals.ts',
      'src/app/(frontend)/(sitemaps)/content-sitemap.xml/route.ts',
    ]) {
      const dataSource = source(dataPath)
      expect(dataSource, dataPath).toContain("'use cache'")
      expect(dataSource, dataPath).not.toContain('unstable_cache')
    }

    expect(source('src/app/(frontend)/contentRoute.loader.server.ts')).toContain(
      'draft ? queryContentRoute({ draft: true, path }) : getCachedPublishedContentRoute(path)',
    )
  })

  it('keeps route entries on explicit server-data, metadata, and renderer owners', () => {
    const home = source('src/app/(frontend)/page.tsx')
    const catchAll = source('src/app/(frontend)/[...segments]/page.tsx')
    const loader = source('src/app/(frontend)/contentRoute.loader.server.ts')
    const metadata = source('src/app/(frontend)/contentRoute.metadata.server.ts')
    const renderer = source('src/app/(frontend)/contentRoute.renderer.tsx')
    const globals = source('src/utilities/getGlobals.ts')

    expect(home).toContain("from './contentRoute.metadata.server'")
    expect(home).toContain("from './contentRoute.renderer'")
    expect(catchAll).toContain("from '../contentRoute.metadata.server'")
    expect(catchAll).toContain("from '../contentRoute.renderer'")
    expect(existsSync(new URL('../../src/app/(frontend)/contentRoute.tsx', import.meta.url))).toBe(
      false,
    )

    expect(loader.startsWith("import 'server-only'\n")).toBe(true)
    expect(globals.startsWith("import 'server-only'\n")).toBe(true)
    expect(loader).toContain('getPayload({ config: configPromise })')
    expect(renderer).not.toContain('getPayload')
    expect(metadata).not.toContain('getPayload')
  })
})
