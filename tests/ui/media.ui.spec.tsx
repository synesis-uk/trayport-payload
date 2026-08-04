import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Media } from '@/components/Media'
import { TrayportMedia } from '@/components/Trayport/TrayportMedia'
import type { Media as MediaResource } from '@/payload-types'

const recordNextImageProps = vi.hoisted(() => vi.fn())

vi.mock('next/image', () => ({
  default: (props: {
    alt: string
    blurDataURL?: string
    placeholder?: 'blur' | 'empty'
    preload?: boolean
    priority?: boolean
    src: string | { src: string }
    unoptimized?: boolean
  }) => {
    recordNextImageProps(props)
    const src = typeof props.src === 'string' ? props.src : props.src.src

    // eslint-disable-next-line @next/next/no-img-element -- this is the test double for next/image.
    return <img alt={props.alt} data-preload={String(Boolean(props.preload))} src={src} />
  },
}))

const imageResource = {
  alt: 'European energy market',
  height: 600,
  id: 42,
  mimeType: 'image/webp',
  updatedAt: '2026-08-04T12:00:00.000Z',
  url: '/api/media/file/market.webp',
  width: 1200,
} as MediaResource

const videoResource = {
  alt: 'Joule functionality demonstration',
  id: 7666,
  mimeType: 'video/mp4',
  poster: {
    alt: 'Joule on a tablet',
    id: 8519,
    mimeType: 'image/png',
    url: '/api/media/file/joule-poster.png',
  },
  title: 'Joule Functionality',
  updatedAt: '2026-08-04T12:00:00.000Z',
  url: '/api/media/file/joule-functionality.mp4',
} as MediaResource

describe('media boundary', () => {
  beforeEach(() => recordNextImageProps.mockClear())
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it.each([42, '42'])('does not render unresolved Payload relationship %s', (resource) => {
    const { container } = render(<Media resource={resource} />)

    expect(container.querySelector('img')).toBeNull()
    expect(recordNextImageProps).not.toHaveBeenCalled()
  })

  it.each([
    ['document', { ...imageResource, mimeType: 'application/pdf' }],
    ['unsupported MIME', { ...imageResource, mimeType: 'application/octet-stream' }],
    ['missing MIME', { ...imageResource, mimeType: null }],
  ])('fails closed for a %s passed to the visual renderer', (_label, resource) => {
    const { container } = render(<TrayportMedia media={resource as MediaResource} />)

    expect(container.innerHTML).toBe('')
    expect(recordNextImageProps).not.toHaveBeenCalled()
  })

  it('does not send incomplete intrinsic dimensions to next/image', () => {
    const { container } = render(
      <Media resource={{ ...imageResource, height: null } as MediaResource} />,
    )

    expect(container.querySelector('img')).toBeNull()
    expect(recordNextImageProps).not.toHaveBeenCalled()
  })

  it('passes the Next 16 preload prop without forwarding deprecated priority', () => {
    render(<TrayportMedia media={imageResource} preload />)

    expect(
      screen.getByRole('img', { name: 'European energy market' }).getAttribute('data-preload'),
    ).toBe('true')
    expect(recordNextImageProps).toHaveBeenCalledWith(
      expect.objectContaining({
        preload: true,
        src: '/api/media/file/market.webp?2026-08-04T12%3A00%3A00.000Z',
      }),
    )
    expect(recordNextImageProps.mock.calls[0]?.[0]).not.toHaveProperty('priority')
    expect(recordNextImageProps.mock.calls[0]?.[0]).not.toHaveProperty('placeholder')
    expect(recordNextImageProps.mock.calls[0]?.[0]).not.toHaveProperty('blurDataURL')
  })

  it('allows a caller to preserve a byte-exact managed image without changing the default', () => {
    const { rerender } = render(<TrayportMedia media={imageResource} />)

    expect(recordNextImageProps.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ unoptimized: false }),
    )

    rerender(<TrayportMedia media={imageResource} unoptimized />)
    expect(recordNextImageProps.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ unoptimized: true }),
    )
  })

  it('renders editor-marked decorative images with empty alternative text defensively', () => {
    const { container } = render(
      <TrayportMedia
        media={{
          ...imageResource,
          alt: 'Stale text that should not be announced',
          decorative: true,
        }}
      />,
    )

    expect(container.querySelector('img')?.getAttribute('alt')).toBe('')
    expect(recordNextImageProps).toHaveBeenCalledWith(expect.objectContaining({ alt: '' }))
  })

  it('keeps poster-backed videos source-free until the explicit play action', async () => {
    const load = vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined)
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.resolve())

    const { container } = render(<TrayportMedia media={videoResource} />)
    await waitFor(() => expect(container.querySelector('video')).toBeTruthy())
    const video = container.querySelector('video')!
    expect(video?.getAttribute('poster')).toBe('/api/media/file/joule-poster.png')
    expect(video?.getAttribute('preload')).toBe('none')
    expect(video?.controls).toBe(false)
    expect(video?.querySelector('source')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Play Joule functionality demonstration' }))

    await waitFor(() => expect(video?.querySelector('source')).toBeTruthy())
    expect(video?.querySelector('source')?.getAttribute('src')).toContain(
      '/api/media/file/joule-functionality.mp4',
    )
    expect(video?.controls).toBe(true)
    expect(load).toHaveBeenCalledOnce()
    expect(play).toHaveBeenCalledOnce()
  })

  it.each([
    ['reduced motion', true, false],
    ['data saver', false, true],
  ])('keeps background video source-free for %s', async (_label, reducedMotion, saveData) => {
    const addEventListener = vi.fn()
    const removeEventListener = vi.fn()
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        addEventListener,
        matches: reducedMotion,
        removeEventListener,
      })),
    )
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { addEventListener, removeEventListener, saveData },
    })
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.resolve())

    const { container } = render(<TrayportMedia background media={videoResource} />)
    await waitFor(() => expect(container.querySelector('video')).toBeTruthy())
    const video = container.querySelector('video')!

    await waitFor(() => expect(video?.querySelector('source')).toBeNull())
    expect(video?.getAttribute('preload')).toBe('none')
    expect(video?.autoplay).toBe(false)
    expect(play).not.toHaveBeenCalled()
  })

  it('loads and plays background video only after client preferences allow it', async () => {
    const addEventListener = vi.fn()
    const removeEventListener = vi.fn()
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        addEventListener,
        matches: false,
        removeEventListener,
      })),
    )
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { addEventListener, removeEventListener, saveData: false },
    })
    const load = vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined)
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.resolve())

    const { container } = render(<TrayportMedia background media={videoResource} />)
    await waitFor(() => expect(container.querySelector('video')).toBeTruthy())
    const video = container.querySelector('video')!

    await waitFor(() => expect(video?.querySelector('source')).toBeTruthy())
    expect(video?.getAttribute('preload')).toBe('auto')
    expect(video?.autoplay).toBe(true)
    expect(load).toHaveBeenCalledOnce()
    expect(play).toHaveBeenCalledOnce()
  })
})
