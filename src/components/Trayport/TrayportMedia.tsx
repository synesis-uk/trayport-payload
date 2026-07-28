'use client'

import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { useEffect, useRef } from 'react'

type TrayportMediaProps = {
  background?: boolean
  className?: string
  media?: MediaType | number | string | null
  externalURL?: string | null
  priority?: boolean
  showFallbackLink?: boolean
}

export const TrayportMedia = ({
  background = false,
  className,
  media,
  externalURL,
  priority,
  showFallbackLink = true,
}: TrayportMediaProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const resource = media && typeof media === 'object' ? media : null
  const isVideo = Boolean(resource?.mimeType?.startsWith('video/'))
  const videoURL = isVideo
    ? getMediaUrl(resource?.url, resource?.updatedAt) || resource?.externalURL || externalURL
    : background
      ? externalURL
      : externalURL && /\.(?:m4v|mov|mp4|ogv|webm)(?:[?#].*)?$/i.test(externalURL)
        ? externalURL
        : null
  const relatedPoster =
    resource?.poster && typeof resource.poster === 'object' ? resource.poster.url : null
  const imagePoster =
    resource?.mimeType?.startsWith('image/') && resource.url
      ? getMediaUrl(resource.url, resource.updatedAt)
      : null
  const posterURL = relatedPoster || imagePoster || undefined
  const videoMimeType = isVideo
    ? resource?.mimeType || 'video/mp4'
    : videoURL?.toLowerCase().includes('.webm')
      ? 'video/webm'
      : 'video/mp4'

  useEffect(() => {
    if (!background || !videoRef.current) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')

    const applyPreference = () => {
      if (!videoRef.current) return
      if (preference.matches) {
        videoRef.current.pause()
      } else {
        void videoRef.current.play().catch(() => undefined)
      }
    }

    applyPreference()
    preference.addEventListener('change', applyPreference)
    return () => preference.removeEventListener('change', applyPreference)
  }, [background])

  if (isVideo || videoURL) {
    return (
      <div className={className}>
        <video
          aria-label={background ? undefined : resource?.alt || resource?.title || 'Trayport video'}
          aria-hidden={background || undefined}
          autoPlay={background}
          className="trayport-media__video"
          controls={!background}
          loop={background}
          muted={background}
          playsInline
          poster={posterURL}
          preload={background ? 'auto' : 'metadata'}
          ref={videoRef}
        >
          {videoURL ? <source src={videoURL} type={videoMimeType} /> : null}
          {!background ? <p>This browser cannot play the video.</p> : null}
        </video>
        {!background && showFallbackLink && videoURL ? (
          <a className="trayport-video-fallback" href={videoURL}>
            Open the video in a new window
          </a>
        ) : null}
      </div>
    )
  }

  if (!media) return null

  return (
    <Media
      className={[className, background ? 'trayport-background-media' : null]
        .filter(Boolean)
        .join(' ')}
      fill={background}
      imgClassName="trayport-media__image"
      pictureClassName={background ? 'trayport-background-media__picture' : undefined}
      priority={priority}
      resource={media}
      size="(max-width: 767px) 100vw, 50vw"
    />
  )
}
