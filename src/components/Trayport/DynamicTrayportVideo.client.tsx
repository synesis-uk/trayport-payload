'use client'

import dynamic from 'next/dynamic'

import type { TrayportVideoProps } from './TrayportVideo.client'

const TrayportVideoImplementation = dynamic(
  () => import('./TrayportVideo.client').then((module) => module.TrayportVideo),
  { ssr: true },
)

export function DynamicTrayportVideo(props: TrayportVideoProps) {
  return <TrayportVideoImplementation {...props} />
}
