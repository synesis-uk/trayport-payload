'use client'

import dynamic from 'next/dynamic'

import type { FeatureCarouselProps } from './FeatureCarousel.client'

const FeatureCarouselImplementation = dynamic(
  () => import('./FeatureCarousel.client').then((module) => module.FeatureCarousel),
  { ssr: true },
)

export function DynamicFeatureCarousel(props: FeatureCarouselProps) {
  return <FeatureCarouselImplementation {...props} />
}
