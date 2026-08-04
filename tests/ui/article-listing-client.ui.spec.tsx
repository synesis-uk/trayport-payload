import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ArticleListingClient } from '@/components/Trayport/ArticleListingClient'
import type { ArticleListingItem } from '@/data/listingContent'

vi.mock('@/components/Trayport/TrayportMedia', () => ({
  TrayportMedia: () => <span data-testid="article-media" />,
}))

const article = (overrides: Partial<ArticleListingItem> = {}): ArticleListingItem => ({
  categories: [],
  contentMode: 'listing',
  displayDate: '2024-01-21T00:00:00.000Z',
  excerpt: null,
  externalDestination: 'https://www.trayport.com/insights/example/',
  featured: false,
  featuredOrder: null,
  heroMedia: null,
  id: 1,
  path: null,
  publishedAt: '2025-03-24T21:26:06.000Z',
  title: 'Publication year source',
  ...overrides,
})

const listingIcons = {
  arrowRight: <svg aria-hidden data-icon-name="arrowRight" />,
  calendar: <svg aria-hidden data-icon-name="calendar" />,
  externalLink: <svg aria-hidden data-icon-name="externalLink" />,
  news: <svg aria-hidden data-icon-name="news" />,
  search: <svg aria-hidden data-icon-name="search" />,
  searchInsight: <svg aria-hidden data-icon-name="searchInsight" />,
}

const listing = (family = 'insights', articles = [article()]) => (
  <ArticleListingClient
    articles={articles}
    family={family}
    icons={listingIcons}
    initialPageSize={9}
    showCategoryFilter
  />
)

describe('article listing presentation', () => {
  it('shows the editorial date while filtering by the publication year', () => {
    render(
      listing('insights', [
        article(),
        article({
          displayDate: null,
          id: 2,
          publishedAt: '2025-06-16T08:00:00.000Z',
          title: 'Publication date fallback',
        }),
      ]),
    )

    const result = screen.getByRole('link', { name: /Publication year source/ })
    const displayDate = within(result).getByText('Jan 2024')
    expect(displayDate.tagName).toBe('TIME')
    expect(displayDate.getAttribute('datetime')).toBe('2024-01-21T00:00:00.000Z')
    expect(screen.getByRole('option', { name: '2025' })).toBeTruthy()
    expect(screen.queryByRole('option', { name: '2024' })).toBeNull()

    fireEvent.change(screen.getByRole('combobox', { name: 'Year' }), {
      target: { value: '2025' },
    })
    expect(screen.getByText('Publication year source')).toBeTruthy()
    expect(screen.getByText('Publication date fallback')).toBeTruthy()
  })

  it('uses the bounded Font Awesome icon for each listing family', () => {
    const { rerender } = render(listing('insights'))
    expect(document.querySelector('[data-icon-name="searchInsight"]')).toBeTruthy()

    rerender(listing('news'))
    expect(document.querySelector('[data-icon-name="news"]')).toBeTruthy()

    rerender(listing('events'))
    expect(document.querySelector('[data-icon-name="calendar"]')).toBeTruthy()
  })

  it('does not repeat a featured article in the unfiltered article list', () => {
    render(
      listing('insights', [
        article({ featured: true, featuredOrder: 0, id: 10, title: 'Featured once' }),
        article({ id: 11, title: 'Standard result' }),
      ]),
    )

    expect(screen.getAllByText('Featured once')).toHaveLength(1)
    expect(screen.getByText('Standard result')).toBeTruthy()
  })
})
