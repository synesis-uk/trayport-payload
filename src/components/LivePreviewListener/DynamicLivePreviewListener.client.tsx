'use client'

import dynamic from 'next/dynamic'

const LivePreviewImplementation = dynamic(
  () => import('./index').then((module) => module.LivePreviewListener),
  { ssr: true },
)

export function DynamicLivePreviewListener() {
  return <LivePreviewImplementation />
}
