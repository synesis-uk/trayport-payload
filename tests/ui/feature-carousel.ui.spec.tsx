import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FeatureCarousel } from '@/components/site/FeatureCarousel.client'

const carouselIcons = {
  nextIcon: <svg aria-hidden data-testid="next-icon" />,
  previousIcon: <svg aria-hidden data-testid="previous-icon" />,
}

describe('owned feature carousel', () => {
  const scrollTo = vi.fn()
  let viewportWidth = 998

  beforeEach(() => {
    viewportWidth = 998
    scrollTo.mockClear()
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollTo,
    })
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        matches: viewportWidth >= Number(query.match(/\d+/)?.[0] || Number.POSITIVE_INFINITY),
        media: query,
        removeEventListener: vi.fn(),
      })),
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('exposes two visible slides at the reference desktop breakpoint without autoplay', () => {
    vi.useFakeTimers()
    render(
      <FeatureCarousel
        {...carouselIcons}
        items={[
          <button key="one" type="button">
            One
          </button>,
          <button key="two" type="button">
            Two
          </button>,
          <button key="three" type="button">
            Three
          </button>,
          <button key="four" type="button">
            Four
          </button>,
        ]}
        label="Product features"
      />,
    )

    expect(
      screen.getByRole('region', { name: 'Product features' }).getAttribute('aria-roledescription'),
    ).toBe('carousel')
    expect(screen.getByText('Showing 1–2 of 4')).toBeTruthy()
    expect(
      (screen.getByRole('button', { name: 'Previous slide' }) as HTMLButtonElement).disabled,
    ).toBe(true)
    expect((screen.getByRole('button', { name: 'Next slide' }) as HTMLButtonElement).disabled).toBe(
      false,
    )

    vi.advanceTimersByTime(30_000)
    expect(scrollTo).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'smooth', left: 0 })
    expect(screen.getByText('Showing 2–3 of 4')).toBeTruthy()
  })

  it.each([
    { expected: 'Showing 1–1 of 4', width: 320 },
    { expected: 'Showing 1–2 of 4', width: 998 },
    { expected: 'Showing 1–3 of 4', width: 1600 },
  ])('uses the bounded visible-item count at $width px', ({ expected, width }) => {
    viewportWidth = width
    render(
      <FeatureCarousel
        {...carouselIcons}
        items={[
          <span key="one">One</span>,
          <span key="two">Two</span>,
          <span key="three">Three</span>,
          <span key="four">Four</span>,
        ]}
      />,
    )

    expect(screen.getByText(expected)).toBeTruthy()
  })

  it('makes the scroll viewport focusable and supports bounded arrow-key navigation', () => {
    viewportWidth = 320
    render(
      <FeatureCarousel
        {...carouselIcons}
        items={[
          <span key="one">One</span>,
          <span key="two">Two</span>,
          <span key="three">Three</span>,
        ]}
        label="Product features"
      />,
    )

    const viewport = screen.getByRole('list', { name: 'Product features slides' })
    expect(viewport.getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(viewport, { key: 'ArrowRight' })
    expect(scrollTo).toHaveBeenLastCalledWith({ behavior: 'smooth', left: 0 })
    expect(screen.getByText('Showing 2–2 of 3')).toBeTruthy()

    fireEvent.keyDown(viewport, { key: 'ArrowLeft' })
    expect(screen.getByText('Showing 1–1 of 3')).toBeTruthy()
  })
})
