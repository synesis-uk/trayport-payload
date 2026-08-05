// @vitest-environment node

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

const dynamicBoundaries = [
  {
    implementation: './index',
    path: 'src/components/AdminBar/DynamicAdminBar.client.tsx',
  },
  {
    implementation: './index',
    path: 'src/components/LivePreviewListener/DynamicLivePreviewListener.client.tsx',
  },
  {
    implementation: './ArticleListingClient',
    path: 'src/components/Trayport/DynamicArticleListing.client.tsx',
  },
  {
    implementation: './LearningVideoListingClient',
    path: 'src/components/Trayport/DynamicLearningVideoListing.client.tsx',
  },
  {
    implementation: './TrayportVideo.client',
    path: 'src/components/Trayport/DynamicTrayportVideo.client.tsx',
  },
  {
    implementation: './MarketMatrixPresentation.client',
    path: 'src/components/blocks/DynamicMarketMatrixPresentation.client.tsx',
  },
  {
    implementation: './MarketVolumeChartRuntime.client',
    path: 'src/components/Trayport/MarketVolumeChart.client.tsx',
  },
  {
    implementation: './DynamicRegionalMarketMap.client',
    path: 'src/components/blocks/DynamicRegionalMarketMapIsland.client.tsx',
  },
  {
    implementation: './FeatureCarousel.client',
    path: 'src/components/site/DynamicFeatureCarousel.client.tsx',
  },
] as const

describe('lazy client islands', () => {
  it.each(dynamicBoundaries)('$path owns an SSR-preserving dynamic implementation', (boundary) => {
    const contents = source(boundary.path)

    expect(contents.trimStart().startsWith("'use client'")).toBe(true)
    expect(contents).toContain("from 'next/dynamic'")
    expect(contents).toContain(`import('${boundary.implementation}')`)
    expect(contents).toContain('ssr: true')
  })

  it('keeps optional implementations behind their client-owned wrappers', () => {
    const owners = {
      contentRouteRenderer: source('src/app/(frontend)/contentRoute.renderer.tsx'),
      layout: source('src/app/(frontend)/layout.tsx'),
      layoutAdapters: source('src/components/blocks/layoutServerAdapters.tsx'),
      media: source('src/components/Trayport/TrayportMedia.tsx'),
      presentation: source('src/components/blocks/presentation.tsx'),
      serverAdapters: source('src/components/blocks/serverAdapters.tsx'),
    }

    expect(owners.layout).toContain('AdminBar/DynamicAdminBar.client')
    expect(owners.layout).not.toContain("from '@/components/AdminBar'")
    expect(owners.contentRouteRenderer).toContain('DynamicLivePreviewListener.client')
    expect(owners.layoutAdapters).toContain('DynamicArticleListing.client')
    expect(owners.layoutAdapters).toContain('DynamicLearningVideoListing.client')
    expect(owners.media).toContain('DynamicTrayportVideo.client')
    expect(owners.media).not.toContain("from './TrayportVideo.client'")
    expect(owners.serverAdapters).toContain('DynamicMarketMatrixPresentation.client')
    expect(owners.presentation).toContain('DynamicFeatureCarousel.client')
    expect(owners.presentation).not.toContain("from '@/components/site/FeatureCarousel.client'")
  })

  it('keeps global and regional Mapbox runtimes behind viewport boundaries and out of route modules', () => {
    const globalBoundary = source('src/components/blocks/DynamicConnectionsMap.client.tsx')
    const globalRuntime = source('src/components/blocks/ConnectionsMapRuntime.client.tsx')
    const globalPresentation = source('src/components/blocks/specialistPresentation.tsx')
    const regionalBoundary = source('src/components/blocks/DynamicRegionalMarketMap.client.tsx')
    const regionalRuntime = source('src/components/blocks/RegionalMarketMapRuntime.client.tsx')
    const regionalPresentation = source('src/components/blocks/RegionalMarketMapPresentation.tsx')
    const serverAdapter = source('src/components/blocks/serverAdapters.tsx')

    expect(globalBoundary.trimStart().startsWith("'use client'")).toBe(true)
    expect(globalBoundary).toContain("import('./ConnectionsMapRuntime.client')")
    expect(globalBoundary).toContain('ssr: false')
    expect(globalBoundary).toContain('IntersectionObserver')
    expect(globalBoundary).toContain('setReady(false)')
    expect(globalBoundary).toContain('figure.dataset.mapError = String(failed)')
    expect(globalBoundary).toContain("figure.dataset.mapReady = 'false'")
    expect(globalRuntime).toContain("from 'mapbox-gl'")
    expect(globalRuntime).toContain("import 'mapbox-gl/dist/mapbox-gl.css'")
    expect(globalRuntime).toContain("import './connections-map-runtime.css'")
    expect(globalPresentation).toContain("from './DynamicConnectionsMap.client'")
    expect(globalPresentation).not.toContain("from 'mapbox-gl'")

    expect(regionalBoundary.trimStart().startsWith("'use client'")).toBe(true)
    expect(regionalBoundary).toContain("import('./RegionalMarketMapRuntime.client')")
    expect(regionalBoundary).toContain('ssr: false')
    expect(regionalBoundary).toContain('IntersectionObserver')
    expect(regionalBoundary).toContain('setReady(false)')
    expect(regionalBoundary).toContain("data-map-provider={runtime?.provider || 'fallback'}")
    expect(regionalBoundary).toContain('data-map-ready={String(ready)}')
    expect(regionalBoundary).toContain('dataDisplay={model.dataDisplay}')
    expect(regionalBoundary).toContain('activeAssetClassID={assetClassID}')
    expect(regionalBoundary).toContain('lineColor={model.lineColor}')
    expect(regionalBoundary).toContain('markerRadius={model.markerRadius}')
    expect(regionalBoundary).toContain('onRegionSelect={selectRegion}')
    expect(regionalBoundary).toContain('selectedHubIDs={effectiveSelectedHubIDs}')
    expect(regionalBoundary).toContain('showSidebar={model.showSidebar}')
    expect(regionalBoundary).toContain('showLines={model.showLines}')
    expect(regionalRuntime).toContain("from 'mapbox-gl'")
    expect(regionalRuntime).toContain("import 'mapbox-gl/dist/mapbox-gl.css'")
    expect(regionalRuntime).toContain('interactive: false')
    expect(regionalRuntime).toContain("dataDisplay: 'always' | 'hover'")
    expect(regionalRuntime).toContain('id === activeAssetClassID')
    expect(regionalRuntime).toContain("id: 'trayport-hub-values'")
    expect(regionalRuntime).toContain("visibility: dataDisplay === 'always' ? 'visible' : 'none'")
    expect(regionalRuntime).toContain("id: 'trayport-route-markers'")
    expect(regionalRuntime).toContain('showLines ? routeFeatures(index, visible)')
    expect(regionalRuntime).toContain("register('mouseenter', 'trayport-region-fill'")
    expect(regionalRuntime).toContain('segmentMidpoint(routeSegments(connection.route))')
    expect(regionalRuntime).toContain("hubType !== 'ohub'")
    expect(regionalRuntime).toContain('selectedHubIDs: string[]')
    expect(regionalRuntime).toContain('showSidebar: boolean')
    expect(regionalPresentation).toContain("from './DynamicRegionalMarketMapIsland.client'")
    expect(regionalPresentation).not.toContain("from 'mapbox-gl'")

    expect(serverAdapter).toContain("if (block.mode === 'regionalConnectivity')")
    expect(serverAdapter).toContain(
      "runtime={getConnectionsMapRuntimeConfig(block.style === 'light' ? 'light' : 'dark')}",
    )
    expect(serverAdapter).toContain(
      'model.markerGroups.length ? getConnectionsMapRuntimeConfig(model.mapStyle) : null',
    )
    expect(serverAdapter).not.toContain(
      "model.presentation === 'mapOnly' && model.mapStyle === 'dark'",
    )
    expect(serverAdapter).not.toContain("from 'mapbox-gl'")
  })
})
