import { ExternalLink } from 'lucide-react'

import type { Article, Hub, Page, Venue } from '@/payload-types'

import { TrayportBlocks } from './BlockRenderer'
import { TrayportMedia } from './TrayportMedia'

const formatDate = (date?: string | null) => {
  if (!date) return null
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export const PageView = ({ document }: { document: Page }) => (
  <main id="main-content">
    <TrayportBlocks blocks={document.layout} />
  </main>
)

export const ArticleView = ({ document }: { document: Article }) => {
  const categories = (document.categories || []).filter((category) => typeof category === 'object')
  const date = formatDate(document.publishedAt)
  const typeLabel = document.articleType.replace('-', ' ')

  return (
    <main className="trayport-article" id="main-content">
      <header className="trayport-article__header">
        <div className="trayport-container trayport-container--reading">
          <p className="trayport-eyebrow">
            {categories[0] && typeof categories[0] === 'object' ? categories[0].title : 'Insights'}
          </p>
          <h1>{document.title}</h1>
          {document.excerpt ? (
            <p className="trayport-article__excerpt">{document.excerpt}</p>
          ) : null}
          <div className="trayport-article__meta">
            {date ? <time dateTime={document.publishedAt || undefined}>{date}</time> : null}
            {document.location ? <span>{document.location}</span> : null}
            <span>{typeLabel}</span>
            {document.byline ? <span>By {document.byline}</span> : null}
          </div>
        </div>
      </header>
      <div className="trayport-article__body">
        <TrayportBlocks blocks={document.layout} />
      </div>
    </main>
  )
}

type HubConnection = NonNullable<Hub['connections']>[number]

const venueFromConnection = (connection: HubConnection): Venue | null =>
  typeof connection.venue === 'object' ? connection.venue : null

const venueTypeName = (connection: HubConnection) => {
  const venue = venueFromConnection(connection)
  const venueType = venue?.venueTypes?.find((item) => typeof item === 'object')
  return venueType && typeof venueType === 'object' ? venueType.title : 'Connected venues'
}

const productGroups = (connections: HubConnection[]) => {
  const groups = new Map<string, HubConnection[]>()

  for (const connection of connections) {
    const name = venueTypeName(connection)
    groups.set(name, [...(groups.get(name) || []), connection])
  }

  return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right))
}

const ConnectionProduct = ({ title, values }: { title: string; values: HubConnection[] }) => {
  if (!values.length) return null

  return (
    <section className="trayport-connectivity">
      <div className="trayport-connectivity__header">
        <p className="trayport-eyebrow">Connectivity</p>
        <h2>{title}</h2>
      </div>

      <div className="trayport-connectivity__groups">
        {productGroups(values).map(([groupName, connections]) => (
          <section className="trayport-venue-group" key={groupName}>
            <h3>{groupName}</h3>
            <ul className="trayport-venue-list">
              {connections
                .sort((left, right) => {
                  const leftVenue = venueFromConnection(left)
                  const rightVenue = venueFromConnection(right)
                  return (leftVenue?.title || '').localeCompare(rightVenue?.title || '')
                })
                .map((connection, index) => {
                  const venue = venueFromConnection(connection)
                  if (!venue) return null
                  const href = venue.website || null
                  const content = (
                    <>
                      <span>{venue.title}</span>
                      {href ? <ExternalLink aria-hidden size={15} /> : null}
                    </>
                  )

                  return (
                    <li key={`${venue.id}-${index}`}>
                      {href ? (
                        <a
                          href={href}
                          rel={/^https?:\/\//.test(href) ? 'noopener noreferrer' : undefined}
                          target={/^https?:\/\//.test(href) ? '_blank' : undefined}
                        >
                          {content}
                        </a>
                      ) : (
                        <span>{content}</span>
                      )}
                    </li>
                  )
                })}
            </ul>
          </section>
        ))}
      </div>
    </section>
  )
}

export const HubView = ({ document }: { document: Hub }) => {
  const layout = document.layout || []
  const connections = document.connections || []
  const joule = connections.filter((connection) => connection.supportsJoule)
  const autoTrader = connections.filter((connection) => connection.supportsAutoTrader)
  const assetClass = document.assetClasses?.find((item) => typeof item === 'object')
  const region = document.regions?.find((item) => typeof item === 'object')
  const hasManagedHero = layout[0]?.blockType === 'trayportHero'

  return (
    <main className="trayport-hub" id="main-content">
      {hasManagedHero ? (
        <TrayportBlocks blocks={layout} />
      ) : (
        <>
          <section className="trayport-hub__hero">
            {document.heroMedia ? (
              <div className="trayport-hub__media" aria-hidden>
                <TrayportMedia background media={document.heroMedia} priority />
              </div>
            ) : null}
            <div aria-hidden className="trayport-hub__polygon" />
            <div className="trayport-container trayport-hub__inner">
              <div>
                <p className="trayport-eyebrow">
                  {[
                    assetClass && typeof assetClass === 'object' ? assetClass.title : null,
                    region && typeof region === 'object' ? region.title : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Market coverage'}
                </p>
                <h1>{document.title}</h1>
                <p>
                  {document.summary ||
                    `Explore broker, exchange and clearing connections available through Trayport's global network.`}
                </p>
              </div>
            </div>
          </section>
          {layout.length ? <TrayportBlocks blocks={layout} /> : null}
        </>
      )}

      <div className="trayport-container trayport-hub__content">
        <ConnectionProduct title="Joule" values={joule} />
        <ConnectionProduct title="autoTRADER" values={autoTrader} />
      </div>
    </main>
  )
}
