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

  it('keeps Mapbox behind the Home map viewport boundary and out of initial route modules', () => {
    const boundary = source('src/components/blocks/DynamicConnectionsMap.client.tsx')
    const runtime = source('src/components/blocks/ConnectionsMapRuntime.client.tsx')
    const presentation = source('src/components/blocks/specialistPresentation.tsx')
    const serverAdapter = source('src/components/blocks/serverAdapters.tsx')

    expect(boundary.trimStart().startsWith("'use client'")).toBe(true)
    expect(boundary).toContain("import('./ConnectionsMapRuntime.client')")
    expect(boundary).toContain('ssr: false')
    expect(boundary).toContain('IntersectionObserver')
    expect(boundary).toContain('setReady(false)')
    expect(boundary).toContain('figure.dataset.mapError = String(failed)')
    expect(boundary).toContain("figure.dataset.mapReady = 'false'")
    expect(runtime).toContain("from 'mapbox-gl'")
    expect(runtime).toContain("import 'mapbox-gl/dist/mapbox-gl.css'")
    expect(runtime).toContain("import './connections-map-runtime.css'")
    expect(presentation).toContain("from './DynamicConnectionsMap.client'")
    expect(presentation).not.toContain("from 'mapbox-gl'")
    expect(serverAdapter).toContain("model.presentation === 'mapOnly' && model.mapStyle === 'dark'")
    expect(serverAdapter).not.toContain("from 'mapbox-gl'")
  })
})
