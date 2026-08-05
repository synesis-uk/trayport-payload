import Link from 'next/link'

import { AppIcon } from '@/components/icons'
import { ShellIcon } from '@/components/icons/ShellIcon'
import { Pagination } from '@/components/ui/pagination'
import {
  SITE_SEARCH_MAX_QUERY_LENGTH,
  SITE_SEARCH_MIN_QUERY_LENGTH,
  type SiteSearchQuery,
  type SiteSearchResult,
} from '@/search/model'

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const HighlightedText = ({ children, terms }: { children: string; terms: string[] }) => {
  if (!children || !terms.length) return children

  const pattern = new RegExp(
    `(${terms
      .slice()
      .sort((left, right) => right.length - left.length)
      .map(escapeRegExp)
      .join('|')})`,
    'giu',
  )

  return children
    .split(pattern)
    .map((part, index) =>
      terms.some((term) => part.localeCompare(term, 'en-GB', { sensitivity: 'base' }) === 0) ? (
        <mark key={`${part}-${index}`}>{part}</mark>
      ) : (
        part
      ),
    )
}

const issueMessage = (query: SiteSearchQuery): string | null => {
  if (query.issue === 'empty' || query.issue === 'too-short') {
    return `Enter at least ${SITE_SEARCH_MIN_QUERY_LENGTH} characters to search.`
  }
  if (query.issue === 'too-long') {
    return `Keep your search to ${SITE_SEARCH_MAX_QUERY_LENGTH} characters or fewer.`
  }
  return null
}

const paginationHref = (query: string, page: number): string => {
  const parameters = new URLSearchParams({ s: query })
  if (page > 1) parameters.set('page', String(page))
  return `/?${parameters.toString()}`
}

const ResultSummary = ({ query, result }: { query: SiteSearchQuery; result: SiteSearchResult }) => {
  if (!result.total) {
    return (
      <div className="trayport-search__empty">
        <p className="trayport-eyebrow">No results</p>
        <h2>We couldn’t find anything for “{query.input}”.</h2>
        <p>Check the spelling, try fewer words, or search for a broader topic.</p>
      </div>
    )
  }

  return (
    <div className="trayport-search__summary">
      <div>
        <p className="trayport-eyebrow">Search results</p>
        <h2>
          {result.total} {result.total === 1 ? 'result' : 'results'} for “{query.input}”
        </h2>
      </div>
      <p>
        Showing {result.start}–{result.end}
      </p>
    </div>
  )
}

export const SiteSearchView = ({
  query,
  result,
}: {
  query: SiteSearchQuery
  result: SiteSearchResult
}) => {
  const message = issueMessage(query)
  const descriptionID = message ? 'site-search-error' : 'site-search-help'

  return (
    <main className="trayport-search" id="main-content">
      <header className="trayport-detail__hero trayport-search__hero">
        <div aria-hidden className="trayport-hub__polygon" />
        <div className="trayport-container trayport-detail__hero-inner">
          <div>
            <p className="trayport-eyebrow">Site search</p>
            <h1>Search Trayport</h1>
            <p>
              Find pages, people, market information, insights, news, events and learning resources.
            </p>
          </div>
        </div>
      </header>

      <section aria-label="Site search" className="trayport-search__body">
        <div className="trayport-container trayport-search__container">
          <form action="/" className="trayport-search__form" method="get" role="search">
            <label htmlFor="site-search-page-input">What are you looking for?</label>
            <div className="trayport-search__control">
              <ShellIcon aria-hidden height={20} name="search" width={20} />
              <input
                aria-describedby={descriptionID}
                aria-invalid={message ? true : undefined}
                autoComplete="off"
                defaultValue={query.input}
                id="site-search-page-input"
                maxLength={SITE_SEARCH_MAX_QUERY_LENGTH}
                minLength={SITE_SEARCH_MIN_QUERY_LENGTH}
                name="s"
                placeholder="Search Trayport…"
                required
                type="search"
              />
              <button type="submit">Search</button>
            </div>
            {message ? (
              <p className="trayport-search__error" id="site-search-error" role="alert">
                {message}
              </p>
            ) : (
              <p id="site-search-help">
                Search across all public content. Use a product, market, service or topic.
              </p>
            )}
          </form>

          {!query.issue ? (
            <div className="trayport-search__results">
              <ResultSummary query={query} result={result} />

              {result.hits.length ? (
                <ol aria-label="Search results" className="trayport-search__list">
                  {result.hits.map((hit) => (
                    <li key={`${hit.collection}:${hit.id}`}>
                      <article className="trayport-search-result">
                        <p className="trayport-search-result__type">{hit.typeLabel}</p>
                        <h3>
                          <Link href={hit.path}>
                            <HighlightedText terms={query.terms}>{hit.title}</HighlightedText>
                          </Link>
                        </h3>
                        {hit.snippet ? (
                          <p className="trayport-search-result__excerpt">
                            <HighlightedText terms={query.terms}>{hit.snippet}</HighlightedText>
                          </p>
                        ) : null}
                        <Link
                          aria-label={`View ${hit.title}`}
                          className="trayport-search-result__action"
                          href={hit.path}
                        >
                          View result
                          <AppIcon aria-hidden name="arrowRight" />
                        </Link>
                      </article>
                    </li>
                  ))}
                </ol>
              ) : null}

              <Pagination
                aria-label="Search result pages"
                className="trayport-search__pagination"
                currentPage={result.currentPage}
                getHref={(page) => paginationHref(query.input, page)}
                totalPages={Math.max(1, result.totalPages)}
              />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}
