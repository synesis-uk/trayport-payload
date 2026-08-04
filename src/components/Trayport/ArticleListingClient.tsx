'use client'

import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'

import type { ArticleListingItem } from '@/data/listingContent'
import { useHydrated } from '@/hooks/useHydrated'
import { safeExternalHTTPSURL } from '@/routing/urlPolicy'

import { TrayportMedia } from './TrayportMedia'

const PAGE_INCREMENT = 9

const copyFor = (family: string) => {
  if (family === 'news') {
    return {
      featured: 'Featured news',
      loadMore: 'Load more news',
      plural: 'news',
      singular: 'news item',
    }
  }
  if (family === 'events') {
    return {
      featured: 'Featured events',
      loadMore: 'Load more events',
      plural: 'events',
      singular: 'event',
    }
  }
  if (family === 'all') {
    return {
      featured: 'Featured resources',
      loadMore: 'Load more resources',
      plural: 'resources',
      singular: 'resource',
    }
  }
  return {
    featured: 'Featured insights',
    loadMore: 'Load more insights',
    plural: 'insights',
    singular: 'insight',
  }
}

const articleCategories = (article: ArticleListingItem) =>
  (article.categories || []).filter((category) => typeof category === 'object')

const categoryTitle = (article: ArticleListingItem) => {
  const category = articleCategories(article)[0]
  return category && typeof category === 'object' ? category.title : 'Insight'
}

const formattedDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        month: 'short',
        timeZone: 'UTC',
        year: 'numeric',
      }).format(new Date(value))
    : 'Latest'

export interface ArticleListingIcons {
  arrowRight: ReactNode
  calendar: ReactNode
  externalLink: ReactNode
  news: ReactNode
  search: ReactNode
  searchInsight: ReactNode
}

export interface ArticleListingClientProps {
  articles: ArticleListingItem[]
  family: string
  icons: ArticleListingIcons
  initialPageSize: number
  initialQuery?: string
  showCategoryFilter: boolean
}

const rowIconForFamily = (family: string, icons: ArticleListingIcons): ReactNode => {
  if (family === 'news') return icons.news
  if (family === 'events') return icons.calendar
  return icons.searchInsight
}

const articleDisplayDate = (article: ArticleListingItem) =>
  article.displayDate || article.publishedAt

const ArticleImage = ({
  article,
  preload = false,
}: {
  article: ArticleListingItem
  preload?: boolean
}) => (
  <div className="trayport-article-card__media">
    {article.heroMedia && typeof article.heroMedia === 'object' ? (
      <TrayportMedia
        composition="card"
        media={article.heroMedia}
        preload={preload}
        showFallbackLink={false}
      />
    ) : (
      <div aria-hidden className="trayport-article-card__placeholder" />
    )}
  </div>
)

const articleDestination = (
  article: ArticleListingItem,
): { external: boolean; href: string } | null => {
  if (article.contentMode === 'full' && article.path) {
    return { external: false, href: article.path }
  }
  if (article.externalDestination) {
    const href = safeExternalHTTPSURL(article.externalDestination)
    return href ? { external: true, href } : null
  }
  return null
}

const ArticleCard = ({
  article,
  family,
  icons,
  lead,
}: {
  article: ArticleListingItem
  family: string
  icons: ArticleListingIcons
  lead: boolean
}) => {
  const destination = articleDestination(article)
  const className = [
    'trayport-article-card',
    lead ? 'is-lead' : '',
    destination ? '' : 'is-unavailable',
  ]
    .filter(Boolean)
    .join(' ')
  const content = (
    <>
      <ArticleImage article={article} preload={lead} />
      <div className="trayport-article-card__body">
        <p className="trayport-article-card__meta">
          <span>{categoryTitle(article)}</span>
          <time dateTime={articleDisplayDate(article) || undefined}>
            {formattedDate(articleDisplayDate(article))}
          </time>
        </p>
        <h4>{article.title}</h4>
        {lead && article.excerpt ? <p>{article.excerpt}</p> : null}
        {destination ? (
          <span className="trayport-inline-link">
            {destination.external
              ? `View ${copyFor(family).singular}`
              : `Read ${copyFor(family).singular}`}
            {destination.external ? icons.externalLink : icons.arrowRight}
          </span>
        ) : (
          <span className="trayport-article-card__status">Detail migration in progress</span>
        )}
      </div>
    </>
  )

  if (!destination) {
    return (
      <article className={className} data-route-status="non-routable">
        {content}
      </article>
    )
  }
  if (destination.external) {
    return (
      <a className={className} href={destination.href} rel="noopener noreferrer" target="_blank">
        {content}
      </a>
    )
  }
  return (
    <Link className={className} href={destination.href}>
      {content}
    </Link>
  )
}

const ArticleRow = ({
  article,
  family,
  icons,
}: {
  article: ArticleListingItem
  family: string
  icons: ArticleListingIcons
}) => {
  const destination = articleDestination(article)
  const content = (
    <>
      {rowIconForFamily(family, icons)}
      <p className="trayport-article-row__meta">
        <time dateTime={articleDisplayDate(article) || undefined}>
          {formattedDate(articleDisplayDate(article))}
        </time>
      </p>
      <h3>{article.title}</h3>
      <span className="trayport-article-row__action">{categoryTitle(article)}</span>
      {!destination ? <span aria-hidden className="trayport-article-row__pending" /> : null}
    </>
  )

  if (!destination) {
    return (
      <article className="is-unavailable trayport-article-row" data-route-status="non-routable">
        {content}
      </article>
    )
  }
  if (destination.external) {
    return (
      <a
        className="trayport-article-row"
        href={destination.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {content}
      </a>
    )
  }
  return (
    <Link className="trayport-article-row" href={destination.href}>
      {content}
    </Link>
  )
}

export const ArticleListingClient = ({
  articles,
  family,
  icons,
  initialPageSize,
  initialQuery = '',
  showCategoryFilter,
}: ArticleListingClientProps) => {
  const copy = copyFor(family)
  const hydrated = useHydrated()
  const [category, setCategory] = useState('all')
  const [queryOverride, setQueryOverride] = useState<string | null>(null)
  const query = queryOverride ?? initialQuery
  const [year, setYear] = useState('all')
  const [visible, setVisible] = useState(Math.max(initialPageSize, PAGE_INCREMENT))

  const categories = useMemo(
    () =>
      [
        ...new Set(
          articles.flatMap((article) => articleCategories(article).map((item) => item.title)),
        ),
      ].sort((left, right) => left.localeCompare(right)),
    [articles],
  )
  const years = useMemo(
    () =>
      [
        ...new Set(articles.map((article) => article.publishedAt?.slice(0, 4)).filter(Boolean)),
      ].sort((left, right) => String(right).localeCompare(String(left))) as string[],
    [articles],
  )
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = articles.filter((article) => {
    const matchesCategory =
      category === 'all' ||
      articleCategories(article).some((item) => item.slug === category || item.title === category)
    const matchesYear = year === 'all' || article.publishedAt?.startsWith(year)
    const matchesQuery =
      !normalizedQuery ||
      `${article.title} ${article.excerpt || ''}`.toLowerCase().includes(normalizedQuery)
    return matchesCategory && matchesYear && matchesQuery
  })
  const filtering = category !== 'all' || year !== 'all' || Boolean(normalizedQuery)
  const featured = filtering
    ? []
    : articles
        .filter((article) => article.featured)
        .sort(
          (left, right) =>
            (left.featuredOrder ?? Number.MAX_SAFE_INTEGER) -
            (right.featuredOrder ?? Number.MAX_SAFE_INTEGER),
        )
        .slice(0, 4)
  const featuredIDs = new Set(featured.map((article) => article.id))
  const normalArticles = filtering
    ? filtered
    : filtered.filter((article) => !featuredIDs.has(article.id))
  const list = normalArticles.slice(0, visible)

  const resetVisible = () => setVisible(Math.max(initialPageSize, PAGE_INCREMENT))

  return (
    <>
      {featured.length ? (
        <section
          aria-labelledby={`featured-${family}-title`}
          className="trayport-featured-articles"
        >
          <div className="trayport-listing__subheading">
            <h3 id={`featured-${family}-title`}>{copy.featured}</h3>
          </div>
          <div className="trayport-featured-articles__grid">
            {featured.map((article, index) => (
              <ArticleCard
                article={article}
                family={family}
                icons={icons}
                key={article.id}
                lead={index === 0}
              />
            ))}
          </div>
        </section>
      ) : null}

      {showCategoryFilter ? (
        <form
          aria-busy={!hydrated}
          className="trayport-article-filters"
          onSubmit={(event) => event.preventDefault()}
          role="search"
        >
          <label className="trayport-article-filters__search">
            <span>Search {copy.plural}</span>
            <span className="trayport-article-filters__input">
              {icons.search}
              <input
                aria-label={`Search ${copy.plural}`}
                disabled={!hydrated}
                onChange={(event) => {
                  setQueryOverride(event.target.value)
                  resetVisible()
                }}
                placeholder="Search by title"
                type="search"
                value={query}
              />
            </span>
          </label>
          <label className="trayport-article-filters__category">
            <span>Category</span>
            <select
              aria-label="Category"
              disabled={!hydrated}
              onChange={(event) => {
                setCategory(event.target.value)
                resetVisible()
              }}
              value={category}
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="trayport-article-filters__year">
            <span>Year</span>
            <select
              aria-label="Year"
              disabled={!hydrated}
              onChange={(event) => {
                setYear(event.target.value)
                resetVisible()
              }}
              value={year}
            >
              <option value="all">All years</option>
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </form>
      ) : null}

      <div aria-live="polite" className="trayport-article-list">
        {list.length ? (
          list.map((article) => (
            <ArticleRow article={article} family={family} icons={icons} key={article.id} />
          ))
        ) : (
          <p className="trayport-listing__empty">No {copy.plural} match those filters.</p>
        )}
      </div>

      {list.length < normalArticles.length ? (
        <button
          className="trayport-action trayport-action--secondary trayport-listing__more"
          disabled={!hydrated}
          onClick={() => setVisible((count) => count + PAGE_INCREMENT)}
          type="button"
        >
          {copy.loadMore}
        </button>
      ) : null}
    </>
  )
}
