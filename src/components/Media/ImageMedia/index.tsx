import type { StaticImageData } from 'next/image'
import NextImage from 'next/image'
import type { FC } from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

import { DEFAULT_IMAGE_QUALITY, type Props as MediaProps } from '../types'

/**
 * ImageMedia
 *
 * Payload's local `/api/media/file/...` URLs stay relative so Next.js treats them as local image
 * sources. Explicitly reviewed CDN URLs are allowed by `next.config.ts`. Non-fill string sources
 * must carry positive intrinsic dimensions; an incomplete media relationship is omitted instead
 * of reaching `next/image` with an invalid width/height pair.
 */

export const ImageMedia: FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    pictureClassName,
    imgClassName,
    preload,
    quality = DEFAULT_IMAGE_QUALITY,
    resource,
    sizes: sizesFromProps,
    src: srcFromProps,
    loading: loadingFromProps,
    unoptimized = false,
  } = props

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, decorative, height: fullHeight, url, width: fullWidth } = resource

    width = typeof fullWidth === 'number' ? fullWidth : undefined
    height = typeof fullHeight === 'number' ? fullHeight : undefined
    alt = decorative ? '' : altFromResource || ''

    const cacheTag = resource.updatedAt

    src = getMediaUrl(url, cacheTag)
  }

  // Relationship IDs can reach this boundary before Payload has populated them. Do not pass an
  // empty source to next/image; the resolved record will render on the subsequent server request.
  if (!src) return null

  const hasIntrinsicDimensions =
    typeof width === 'number' &&
    Number.isFinite(width) &&
    width > 0 &&
    typeof height === 'number' &&
    Number.isFinite(height) &&
    height > 0

  // Static imports already carry dimensions in their StaticImageData object. Payload/string
  // sources need an explicit pair unless they use fill mode.
  if (!fill && typeof src === 'string' && !hasIntrinsicDimensions) return null

  const loading = preload ? undefined : loadingFromProps || 'lazy'

  // `sizes` describes rendered CSS width, not source-image resolution.
  const sizes = sizesFromProps || '(max-width: 47.999rem) 100vw, 50vw'

  return (
    <picture className={cn(pictureClassName)}>
      <NextImage
        alt={alt || ''}
        className={cn(imgClassName)}
        fill={fill}
        height={!fill ? height : undefined}
        preload={preload}
        quality={quality}
        loading={loading}
        sizes={sizes}
        src={src}
        unoptimized={unoptimized}
        width={!fill ? width : undefined}
      />
    </picture>
  )
}
