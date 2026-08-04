import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ComponentGallery } from './GalleryClient'

export default function DesignSystemPage() {
  if (process.env.DESIGN_SYSTEM_ENABLED !== 'true') notFound()

  return <ComponentGallery />
}

export const metadata: Metadata = {
  description: 'Internal deterministic reference for the Trayport frontend component system.',
  robots: {
    follow: false,
    index: false,
  },
  title: 'Design system | Trayport',
}
