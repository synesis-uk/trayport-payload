'use client'

import { lazy, Suspense } from 'react'

import type { TrayportVideoProps } from './TrayportVideo.client'

const LazyTrayportVideo = lazy(() =>
  import('./TrayportVideo.client').then(({ TrayportVideo }) => ({ default: TrayportVideo })),
)

export function DynamicTrayportVideo(props: TrayportVideoProps) {
  return (
    <Suspense fallback={null}>
      <LazyTrayportVideo {...props} />
    </Suspense>
  )
}
