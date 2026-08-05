'use client'

import dynamic from 'next/dynamic'

import type { DynamicRegionalMarketMapProps } from './DynamicRegionalMarketMap.client'

const RegionalMarketMapImplementation = dynamic(
  () =>
    import('./DynamicRegionalMarketMap.client').then((module) => module.DynamicRegionalMarketMap),
  { ssr: true },
)

export function DynamicRegionalMarketMapIsland(props: DynamicRegionalMarketMapProps) {
  return <RegionalMarketMapImplementation {...props} />
}
