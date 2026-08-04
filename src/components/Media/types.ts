import type { StaticImageData } from 'next/image'
import type { ElementType } from 'react'

import type { Media as MediaType } from '@/payload-types'

export const imageQualityValues = [82, 90, 100] as const
export type ImageQuality = (typeof imageQualityValues)[number]

export const DEFAULT_IMAGE_QUALITY: ImageQuality = 82

export interface Props {
  alt?: string
  className?: string
  fill?: boolean // for NextImage only
  htmlElement?: ElementType | null
  pictureClassName?: string
  imgClassName?: string
  loading?: 'lazy' | 'eager' // for NextImage only
  preload?: boolean // for NextImage only
  quality?: ImageQuality // for NextImage only
  resource?: MediaType | string | number | null // for Payload media
  sizes?: string // for NextImage only
  src?: StaticImageData // for static media
  unoptimized?: boolean // for byte-exact assets that should bypass Next image transformation
}
