import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SiteSearchView } from '@/components/Search/SiteSearchView'
import {
  searchSiteCorpus,
  prepareSiteSearchDocument,
  validateSiteSearchQuery,
} from '@/search/model'

describe('whole-site search presentation', () => {
  it('renders a labelled search form, result context and internal result actions', () => {
    const query = validateSiteSearchQuery('energy trading')
    const result = searchSiteCorpus({
      corpus: [
        prepareSiteSearchDocument({
          body: 'Trayport connects people and markets through energy trading technology.',
          collection: 'pages',
          excerpt: 'Connect to wholesale energy markets.',
          id: 1,
          path: '/products/joule/',
          title: 'Energy trading with Joule',
          typeLabel: 'Page',
        }),
      ],
      query,
    })

    render(<SiteSearchView query={query} result={result} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Search Trayport' })).toBeTruthy()
    const form = screen.getByRole('search')
    expect(
      (within(form).getByLabelText('What are you looking for?') as HTMLInputElement).value,
    ).toBe('energy trading')
    expect(within(form).getByRole('button', { name: 'Search' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: '1 result for “energy trading”' })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Energy trading with Joule' }).getAttribute('href'),
    ).toBe('/products/joule')
    expect(
      screen.getByRole('link', { name: 'View Energy trading with Joule' }).getAttribute('href'),
    ).toBe('/products/joule')
    expect(screen.getAllByText('energy', { exact: false }).length).toBeGreaterThan(0)
  })

  it('announces invalid and empty-result states without rendering a fake result list', () => {
    const invalid = validateSiteSearchQuery('x')
    const empty = searchSiteCorpus({ corpus: [], query: invalid })
    const { rerender } = render(<SiteSearchView query={invalid} result={empty} />)

    expect(screen.getByRole('alert').textContent).toContain('Enter at least 2 characters')
    expect(screen.queryByRole('list', { name: 'Search results' })).toBeNull()

    const query = validateSiteSearchQuery('unfindable')
    rerender(<SiteSearchView query={query} result={searchSiteCorpus({ corpus: [], query })} />)
    expect(screen.getByRole('heading', { name: /couldn’t find anything/i })).toBeTruthy()
    expect(screen.queryByRole('list', { name: 'Search results' })).toBeNull()
  })
})
