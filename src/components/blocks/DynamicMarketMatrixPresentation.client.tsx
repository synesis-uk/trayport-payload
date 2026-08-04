'use client'

import dynamic from 'next/dynamic'

import type { MarketMatrixPresentationProps } from './MarketMatrixPresentation.client'

const MarketMatrixImplementation = dynamic(
  () =>
    import('./MarketMatrixPresentation.client').then((module) => module.MarketMatrixPresentation),
  { ssr: true },
)

export function DynamicMarketMatrixPresentation(props: MarketMatrixPresentationProps) {
  return <MarketMatrixImplementation {...props} />
}
