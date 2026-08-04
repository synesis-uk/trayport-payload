'use client'

import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'

import type { LearningVideoListingItem } from '@/data/listingContent'
import { useHydrated } from '@/hooks/useHydrated'
import type { LearningVideoCategory } from '@/payload-types'
import { safeExternalHTTPSURL } from '@/routing/urlPolicy'

import { TrayportMedia } from './TrayportMedia'

const categoriesFor = (video: LearningVideoListingItem): LearningVideoCategory[] =>
  (video.categories || []).filter(
    (category): category is LearningVideoCategory =>
      Boolean(category) && typeof category === 'object',
  )

const destinationFor = (video: LearningVideoListingItem) => {
  if (video.contentMode === 'full' && video.path) return { external: false, href: video.path }
  if (video.externalDestination) {
    const href = safeExternalHTTPSURL(video.externalDestination)
    return href ? { external: true, href } : null
  }
  return null
}

export interface LearningVideoListingIcons {
  arrowRight: ReactNode
  externalLink: ReactNode
  lock: ReactNode
}

export interface LearningVideoListingClientProps {
  icons: LearningVideoListingIcons
  initialPageSize: number
  showCategoryFilter: boolean
  showProductFilter: boolean
  videos: LearningVideoListingItem[]
}

const VideoCard = ({
  icons,
  video,
}: {
  icons: LearningVideoListingIcons
  video: LearningVideoListingItem
}) => {
  const destination = destinationFor(video)
  const protectedVideo = video.accessMode !== 'public'
  const content = (
    <>
      <span className="trayport-video-card__media">
        {video.poster && typeof video.poster === 'object' ? (
          <TrayportMedia composition="card" media={video.poster} showFallbackLink={false} />
        ) : (
          <span aria-hidden className="trayport-article-card__placeholder" />
        )}
        {protectedVideo ? (
          <span className="trayport-video-card__lock">
            {icons.lock}
            <span>Trayport login required</span>
          </span>
        ) : null}
      </span>
      <span className="trayport-video-card__body">
        <span className="trayport-video-card__meta">
          {video.product ? <span>{video.product}</span> : null}
          {video.duration ? <span>{video.duration}</span> : null}
        </span>
        <strong>{video.title}</strong>
        {video.summary ? <span>{video.summary}</span> : null}
        <span className="trayport-inline-link">
          View video
          {destination?.external ? icons.externalLink : icons.arrowRight}
        </span>
      </span>
    </>
  )

  if (!destination)
    return <article className="is-unavailable trayport-video-card">{content}</article>
  if (destination.external) {
    return (
      <a
        className="trayport-video-card"
        href={destination.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {content}
      </a>
    )
  }
  return (
    <Link className="trayport-video-card" href={destination.href}>
      {content}
    </Link>
  )
}

export const LearningVideoListingClient = ({
  icons,
  initialPageSize,
  showCategoryFilter,
  showProductFilter,
  videos,
}: LearningVideoListingClientProps) => {
  const hydrated = useHydrated()
  const [category, setCategory] = useState('all')
  const [product, setProduct] = useState('all')
  const [visible, setVisible] = useState(initialPageSize)
  const categories = useMemo(
    () =>
      [...new Set(videos.flatMap((video) => categoriesFor(video).map((item) => item.title)))].sort(
        (left, right) => left.localeCompare(right),
      ),
    [videos],
  )
  const products = useMemo(
    () =>
      [
        ...new Set(
          videos.map((video) => video.product).filter((value): value is string => Boolean(value)),
        ),
      ].sort((left, right) => left.localeCompare(right)),
    [videos],
  )
  const filtered = videos.filter(
    (video) =>
      (product === 'all' || video.product === product) &&
      (category === 'all' || categoriesFor(video).some((item) => item.title === category)),
  )
  const reset = () => setVisible(initialPageSize)

  return (
    <>
      {showCategoryFilter || showProductFilter ? (
        <form
          aria-busy={!hydrated}
          className="trayport-learning-filters"
          onSubmit={(event) => event.preventDefault()}
        >
          {showProductFilter ? (
            <label>
              <span>Product</span>
              <select
                disabled={!hydrated}
                onChange={(event) => {
                  setProduct(event.target.value)
                  reset()
                }}
                value={product}
              >
                <option value="all">All products</option>
                {products.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          ) : null}
          {showCategoryFilter ? (
            <label>
              <span>Topic</span>
              <select
                disabled={!hydrated}
                onChange={(event) => {
                  setCategory(event.target.value)
                  reset()
                }}
                value={category}
              >
                <option value="all">All topics</option>
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          ) : null}
        </form>
      ) : null}
      <div aria-live="polite" className="trayport-video-grid">
        {filtered.length ? (
          filtered
            .slice(0, visible)
            .map((video) => <VideoCard icons={icons} key={video.id} video={video} />)
        ) : (
          <p className="trayport-listing__empty">No videos match those filters.</p>
        )}
      </div>
      {visible < filtered.length ? (
        <button
          className="trayport-action trayport-action--secondary trayport-listing__more"
          disabled={!hydrated}
          onClick={() => setVisible((count) => count + initialPageSize)}
          type="button"
        >
          Load more videos
        </button>
      ) : null}
    </>
  )
}
