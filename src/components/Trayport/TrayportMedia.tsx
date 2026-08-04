import { Media } from '@/components/Media'
import type { ImageQuality } from '@/components/Media/types'
import type { Media as MediaType } from '@/payload-types'
import { safeExternalMediaURL } from '@/routing/urlPolicy'
import { getMediaUrl } from '@/utilities/getMediaUrl'

import { DynamicTrayportVideo } from './DynamicTrayportVideo.client'

export const trayportMediaSizes = {
  background: '100vw',
  card: '(max-width: 39.999rem) 100vw, (max-width: 63.999rem) 50vw, 33vw',
  content: '(max-width: 47.999rem) 100vw, 50vw',
  full: '100vw',
  logo: '(max-width: 39.999rem) 40vw, (max-width: 63.999rem) 25vw, 12rem',
} as const

export type TrayportMediaComposition = keyof typeof trayportMediaSizes

export type TrayportMediaProps = {
  background?: boolean
  className?: string
  composition?: TrayportMediaComposition
  media?: MediaType | number | string | null
  externalURL?: string | null
  preload?: boolean
  quality?: ImageQuality
  showFallbackLink?: boolean
  sizes?: string
  unoptimized?: boolean
}

export const TrayportMedia = ({
  background = false,
  className,
  composition,
  media,
  externalURL,
  preload = false,
  quality,
  showFallbackLink = true,
  sizes,
  unoptimized = false,
}: TrayportMediaProps) => {
  const resource = media && typeof media === 'object' ? media : null
  const isImage = Boolean(resource?.mimeType?.startsWith('image/'))
  const isVideo = Boolean(resource?.mimeType?.startsWith('video/'))
  const reviewedExternalImage = isImage
    ? safeExternalMediaURL(resource?.externalURL, 'image')
    : null
  const reviewedExternalVideo =
    (isVideo ? safeExternalMediaURL(resource?.externalURL, 'video') : null) ||
    safeExternalMediaURL(externalURL, 'video')
  const videoURL = isVideo
    ? getMediaUrl(resource?.url, resource?.updatedAt) || reviewedExternalVideo
    : reviewedExternalVideo
  const relatedPoster =
    resource?.poster &&
    typeof resource.poster === 'object' &&
    resource.poster.mimeType?.startsWith('image/')
      ? resource.poster.url
      : null
  const imagePoster =
    isImage && resource?.url ? getMediaUrl(resource.url, resource.updatedAt) : null
  const posterURL = relatedPoster || imagePoster || undefined
  const videoMimeType = isVideo
    ? resource?.mimeType || 'video/mp4'
    : videoURL?.toLowerCase().includes('.webm')
      ? 'video/webm'
      : 'video/mp4'
  const effectiveComposition = composition || (background ? 'background' : 'content')
  const responsiveSizes = sizes || trayportMediaSizes[effectiveComposition]

  if (isVideo || videoURL) {
    return (
      <div className={className}>
        <DynamicTrayportVideo
          accessibleLabel={resource?.alt || resource?.title || 'Trayport video'}
          background={background}
          mimeType={videoMimeType}
          poster={posterURL}
          url={videoURL || undefined}
        />
        {!background && showFallbackLink && videoURL ? (
          <a className="trayport-video-fallback" href={videoURL}>
            Open the video in a new window
          </a>
        ) : null}
      </div>
    )
  }

  if (!resource || !isImage) return null

  if (reviewedExternalImage && resource) {
    return (
      <Media
        className={[className, background ? 'trayport-background-media' : null]
          .filter(Boolean)
          .join(' ')}
        fill={background}
        imgClassName="trayport-media__image"
        pictureClassName={background ? 'trayport-background-media__picture' : undefined}
        preload={preload}
        quality={quality}
        resource={{ ...resource, mimeType: 'image/*', url: reviewedExternalImage }}
        sizes={responsiveSizes}
        unoptimized={unoptimized}
      />
    )
  }

  return (
    <Media
      className={[className, background ? 'trayport-background-media' : null]
        .filter(Boolean)
        .join(' ')}
      fill={background}
      imgClassName="trayport-media__image"
      pictureClassName={background ? 'trayport-background-media__picture' : undefined}
      preload={preload}
      quality={quality}
      resource={resource}
      sizes={responsiveSizes}
      unoptimized={unoptimized}
    />
  )
}
