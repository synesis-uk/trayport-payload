'use client'

import { useEffect, useRef, useState } from 'react'

import { ControlIcon } from '@/components/icons/ControlIcon'

export type TrayportVideoProps = {
  accessibleLabel: string
  background: boolean
  mimeType: string
  poster?: string
  url?: string
}

export const TrayportVideo = ({
  accessibleLabel,
  background,
  mimeType,
  poster,
  url,
}: TrayportVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const wasActivatedRef = useRef(false)
  const [backgroundActivated, setBackgroundActivated] = useState(false)
  const [foregroundActivated, setForegroundActivated] = useState(!background && !poster)
  const activated = background ? backgroundActivated : foregroundActivated

  useEffect(() => {
    if (!background) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (
      navigator as Navigator & {
        connection?: {
          addEventListener?: (type: 'change', listener: () => void) => void
          removeEventListener?: (type: 'change', listener: () => void) => void
          saveData?: boolean
        }
      }
    ).connection

    const applyPreference = () => {
      setBackgroundActivated(!preference.matches && connection?.saveData !== true)
    }

    applyPreference()
    preference.addEventListener('change', applyPreference)
    connection?.addEventListener?.('change', applyPreference)
    return () => {
      preference.removeEventListener('change', applyPreference)
      connection?.removeEventListener?.('change', applyPreference)
    }
  }, [background])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const wasActivated = wasActivatedRef.current
    wasActivatedRef.current = activated

    if (!activated) {
      if (wasActivated) {
        video.pause()
        video.load()
      }
      return
    }

    video.load()
    void video.play().catch(() => undefined)
  }, [activated])

  return (
    <div className="trayport-video">
      <video
        aria-label={background ? undefined : accessibleLabel}
        aria-hidden={background || undefined}
        autoPlay={background && activated}
        className="trayport-media__video"
        controls={!background && activated}
        loop={background}
        muted={background}
        playsInline
        poster={poster}
        preload={activated ? (background ? 'auto' : 'metadata') : 'none'}
        ref={videoRef}
      >
        {url && activated ? <source src={url} type={mimeType} /> : null}
        {!background ? <p>This browser cannot play the video.</p> : null}
      </video>
      {!background && poster && url && !activated ? (
        <button
          aria-label={`Play ${accessibleLabel}`}
          className="trayport-video__play"
          onClick={() => setForegroundActivated(true)}
          type="button"
        >
          <ControlIcon aria-hidden name="playCircle" />
        </button>
      ) : null}
    </div>
  )
}
