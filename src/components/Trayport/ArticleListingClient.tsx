'use client'

import { ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import type { Article } from '@/payload-types'

import { TrayportMedia } from './TrayportMedia'

const PAGE_INCREMENT = 9

const articleCategories = (article: Article) =>
  (article.categories || []).filter((category) => typeof category === 'object')

const categoryTitle = (article: Article) => {
  const category = articleCategories(article)[0]
  return category && typeof category === 'object' ? category.title : 'Insight'
}

const formattedDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : 'Latest'

const ArticleImage = ({ article, priority = false }: { article: Article; priority?: boolean }) => (
  <div className="trayport-article-card__media">
    {article.heroMedia && typeof article.heroMedia === 'object' ? (
      <TrayportMedia media={article.heroMedia} priority={priority} showFallbackLink={false} />
    ) : (
      <div aria-hidden className="trayport-article-card__placeholder" />
    )}
  </div>
)

export const ArticleListingClient = ({
  articles,
  initialPageSize,
  showCategoryFilter,
}: {
  articles: Article[]
  initialPageSize: number
  showCategoryFilter: boolean
}) => {
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
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
        <section aria-labelledby="featured-insights-title" className="trayport-featured-articles">
          <div className="trayport-listing__subheading">
            <h3 id="featured-insights-title">Featured insights</h3>
          </div>
          <div className="trayport-featured-articles__grid">
            {featured.map((article, index) => (
              <Link
                className={index === 0 ? 'trayport-article-card is-lead' : 'trayport-article-card'}
                href={article.path}
                key={article.id}
              >
                <ArticleImage article={article} priority={index === 0} />
                <div className="trayport-article-card__body">
                  <p className="trayport-article-card__meta">
                    <span>{categoryTitle(article)}</span>
                    <time dateTime={article.publishedAt || undefined}>
                      {formattedDate(article.publishedAt)}
                    </time>
                  </p>
                  <h4>{article.title}</h4>
                  {index === 0 && article.excerpt ? <p>{article.excerpt}</p> : null}
                  <span className="trayport-inline-link">
                    Read insight <ArrowRight aria-hidden size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {showCategoryFilter ? (
        <form
          className="trayport-article-filters"
          onSubmit={(event) => event.preventDefault()}
          role="search"
        >
          <label className="trayport-article-filters__search">
            <span>Search insights</span>
            <span className="trayport-article-filters__input">
              <Search aria-hidden size={18} />
              <input
                onChange={(event) => {
                  setQuery(event.target.value)
                  resetVisible()
                }}
                placeholder="Search by title"
                type="search"
                value={query}
              />
            </span>
          </label>
          <label>
            <span>Category</span>
            <select
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
          <label>
            <span>Year</span>
            <select
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
            <Link className="trayport-article-row" href={article.path} key={article.id}>
              <p className="trayport-article-row__meta">
                <time dateTime={article.publishedAt || undefined}>
                  {formattedDate(article.publishedAt)}
                </time>
                <span>{categoryTitle(article)}</span>
              </p>
              <h3>{article.title}</h3>
              <span className="trayport-article-row__action">Read insight</span>
              <ArrowRight aria-hidden size={18} />
            </Link>
          ))
        ) : (
          <p className="trayport-listing__empty">No insights match those filters.</p>
        )}
      </div>

      {list.length < normalArticles.length ? (
        <button
          className="trayport-action trayport-action--secondary trayport-listing__more"
          onClick={() => setVisible((count) => count + PAGE_INCREMENT)}
          type="button"
        >
          Load more insights
        </button>
      ) : null}
    </>
  )
}
