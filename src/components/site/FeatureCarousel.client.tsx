'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'

import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/utilities/ui'

export interface FeatureCarouselProps extends HTMLAttributes<HTMLElement> {
  items: readonly ReactNode[]
  label?: string
  nextIcon: ReactNode
  previousIcon: ReactNode
}

/**
 * `matchMedia` is not universally present — JSDOM omits it entirely, and it is absent in some
 * embedded webviews. Treat a missing implementation as "no match" rather than letting the carousel
 * throw during mount, which would take the whole surrounding section down with it.
 */
const matchesMedia = (query: string): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia(query).matches

const visibleItemCount = (carousel: HTMLElement | null): number => {
  const configuredCount = Number.parseInt(
    carousel
      ? window.getComputedStyle(carousel).getPropertyValue('--trayport-carousel-visible-items')
      : '',
    10,
  )
  if (Number.isInteger(configuredCount) && configuredCount > 0) return configuredCount

  // JSDOM and non-CSS consumers do not expose the component custom property.
  // Keep the reference breakpoints as a deterministic compatibility fallback;
  // production browsers take their count from the rendered CSS above.
  if (matchesMedia('(min-width: 1600px)')) return 3
  if (matchesMedia('(min-width: 998px)')) return 2
  return 1
}

export function FeatureCarousel({
  className,
  items,
  label = 'Featured content',
  nextIcon,
  previousIcon,
  ...props
}: FeatureCarouselProps) {
  const carouselRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLUListElement>(null)
  const slideRefs = useRef<Array<HTMLLIElement | null>>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(1)
  const maxIndex = Math.max(0, items.length - visibleCount)

  const setSlideAccess = useCallback((startIndex: number, count: number) => {
    slideRefs.current.forEach((slide, index) => {
      if (!slide) return
      slide.toggleAttribute('inert', index < startIndex || index >= startIndex + count)
    })
  }, [])

  useEffect(() => {
    const updateVisibleCount = () => {
      const nextCount = visibleItemCount(carouselRef.current)
      setVisibleCount(nextCount)
      setCurrentIndex((index) => Math.min(index, Math.max(0, items.length - nextCount)))
    }

    updateVisibleCount()
    window.addEventListener('resize', updateVisibleCount)
    return () => window.removeEventListener('resize', updateVisibleCount)
  }, [items.length])

  useEffect(() => {
    setSlideAccess(currentIndex, visibleCount)
  }, [currentIndex, setSlideAccess, visibleCount])

  const scrollTo = useCallback(
    (index: number) => {
      const nextIndex = Math.min(Math.max(index, 0), maxIndex)
      const slide = slideRefs.current[nextIndex]
      const viewport = viewportRef.current
      if (!slide || !viewport) return

      const reduceMotion = matchesMedia('(prefers-reduced-motion: reduce)')
      viewport.scrollTo?.({
        behavior: reduceMotion ? 'auto' : 'smooth',
        left: slide.offsetLeft,
      })
      setCurrentIndex(nextIndex)
    },
    [maxIndex],
  )

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    let frame = 0
    const updateCurrentIndex = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const closestIndex = slideRefs.current.reduce(
          (closest, slide, index) => {
            if (!slide || index > maxIndex) return closest
            const distance = Math.abs(slide.offsetLeft - viewport.scrollLeft)
            return distance < closest.distance ? { distance, index } : closest
          },
          { distance: Number.POSITIVE_INFINITY, index: 0 },
        ).index
        setCurrentIndex(closestIndex)
      })
    }

    viewport.addEventListener('scroll', updateCurrentIndex, { passive: true })
    return () => {
      viewport.removeEventListener('scroll', updateCurrentIndex)
      window.cancelAnimationFrame(frame)
    }
  }, [maxIndex])

  if (!items.length) return null

  const visibleEnd = Math.min(items.length, currentIndex + visibleCount)

  return (
    <section
      aria-label={label}
      aria-roledescription="carousel"
      className={cn('trayport-carousel', className)}
      ref={carouselRef}
      {...props}
    >
      <ul
        aria-label={`${label} slides`}
        className="trayport-carousel__viewport"
        onKeyDown={(event) => {
          if (event.currentTarget !== event.target) return
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return

          event.preventDefault()
          scrollTo(currentIndex + (event.key === 'ArrowLeft' ? -1 : 1))
        }}
        ref={viewportRef}
        tabIndex={0}
      >
        {items.map((item, index) => (
          <li
            aria-label={`${index + 1} of ${items.length}`}
            aria-roledescription="slide"
            className="trayport-carousel__slide"
            key={index}
            ref={(element) => {
              slideRefs.current[index] = element
            }}
          >
            {item}
          </li>
        ))}
      </ul>
      {items.length > visibleCount ? (
        <div className="trayport-carousel__controls">
          <p aria-atomic="true" aria-live="polite" className="trayport-carousel__status">
            Showing {currentIndex + 1}–{visibleEnd} of {items.length}
          </p>
          <IconButton
            className="trayport-carousel__button"
            disabled={currentIndex === 0}
            icon={previousIcon}
            label="Previous slide"
            onClick={() => scrollTo(currentIndex - 1)}
            type="button"
          />
          <IconButton
            className="trayport-carousel__button"
            disabled={currentIndex === maxIndex}
            icon={nextIcon}
            label="Next slide"
            onClick={() => scrollTo(currentIndex + 1)}
            type="button"
          />
        </div>
      ) : null}
    </section>
  )
}
