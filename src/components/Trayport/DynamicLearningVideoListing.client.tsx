'use client'

import dynamic from 'next/dynamic'

import type { LearningVideoListingClientProps } from './LearningVideoListingClient'

const LearningVideoListingImplementation = dynamic(
  () => import('./LearningVideoListingClient').then((module) => module.LearningVideoListingClient),
  { ssr: true },
)

export function DynamicLearningVideoListing(props: LearningVideoListingClientProps) {
  return <LearningVideoListingImplementation {...props} />
}
