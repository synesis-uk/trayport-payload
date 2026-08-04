import type { ArticleRouteDocument, PageRouteDocument } from '@/data/contentRouteProjection'

import { TrayportBlocks } from '@/components/blocks'

import { formatDate, splitLeadingHero } from './shared'

export const PageView = ({
  document,
  draft = false,
  searchQuery = '',
}: {
  document: PageRouteDocument
  draft?: boolean
  searchQuery?: string
}) => {
  const hasHero = (document.layout || []).some(({ blockType }) => blockType === 'trayportHero')
  const presentation = document.pageType === 'homepage' ? 'home' : document.pageType

  return (
    <main
      className={`trayport-page trayport-page--${presentation}`}
      data-page-path={document.path}
      data-page-type={document.pageType}
      id="main-content"
    >
      {!hasHero ? (
        <header className="trayport-page-header">
          <div className="trayport-container trayport-container--standard">
            <p className="trayport-eyebrow">Trayport</p>
            <h1>{document.title}</h1>
          </div>
        </header>
      ) : null}
      <TrayportBlocks blocks={document.layout} draft={draft} searchQuery={searchQuery} />
    </main>
  )
}

export const ArticleView = ({
  document,
  draft = false,
}: {
  document: ArticleRouteDocument
  draft?: boolean
}) => {
  const categories = (document.categories || []).filter((category) => typeof category === 'object')
  const date = formatDate(document.publishedAt)
  const typeLabel = document.articleType.replace('-', ' ')
  const { body, hero } = splitLeadingHero(document.layout)
  const metadata = (
    <div className="trayport-article__meta">
      {date ? <time dateTime={document.publishedAt || undefined}>{date}</time> : null}
      {document.location ? <span>{document.location}</span> : null}
      <span>{typeLabel}</span>
      {document.byline ? <span>By {document.byline}</span> : null}
    </div>
  )

  return (
    <main className="trayport-article" id="main-content">
      {hero.length ? (
        <>
          <TrayportBlocks blocks={hero} draft={draft} />
          <div className="trayport-container trayport-container--reading">{metadata}</div>
        </>
      ) : (
        <header className="trayport-article__header">
          <div className="trayport-container trayport-container--reading">
            <p className="trayport-eyebrow">
              {categories[0] && typeof categories[0] === 'object'
                ? categories[0].title
                : 'Insights'}
            </p>
            <h1>{document.title}</h1>
            {document.excerpt ? (
              <p className="trayport-article__excerpt">{document.excerpt}</p>
            ) : null}
            {metadata}
          </div>
        </header>
      )}
      <div className="trayport-article__body">
        <TrayportBlocks blocks={body} draft={draft} />
      </div>
    </main>
  )
}
