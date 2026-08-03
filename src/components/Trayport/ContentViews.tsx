import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import configPromise from '@payload-config'
import { ArrowRight, ExternalLink, LockKeyhole, MapPin, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'

import RichText from '@/components/RichText'
import type { Article, Hub, LearningVideo, Page, RouteIndex, Venue } from '@/payload-types'

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

const relationshipTitles = (
  values?: Array<{ title?: string | null } | number | null> | null,
): string[] =>
  (values || [])
    .filter(
      (value): value is { title?: string | null } => Boolean(value) && typeof value === 'object',
    )
    .map(({ title }) => title || '')
    .filter(Boolean)

export const splitLeadingHero = <Block extends { blockType?: string | null }>(
  layout?: Block[] | null,
): { body: Block[]; hero: Block[] } => {
  const blocks = layout || []
  return blocks[0]?.blockType === 'trayportHero'
    ? { body: blocks.slice(1), hero: blocks.slice(0, 1) }
    : { body: blocks, hero: [] }
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
          <TrayportBlocks blocks={hero} />
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
        <TrayportBlocks blocks={body} />
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
                  const href =
                    venue.contentMode === 'page' && venue.path ? venue.path : venue.website || null
                  const external = Boolean(href && /^https?:\/\//.test(href))
                  const content = (
                    <>
                      <span>{venue.title}</span>
                      {href ? (
                        external ? (
                          <ExternalLink aria-hidden size={15} />
                        ) : (
                          <ArrowRight aria-hidden size={15} />
                        )
                      ) : null}
                    </>
                  )

                  return (
                    <li key={`${venue.id}-${index}`}>
                      {href ? (
                        <a
                          href={href}
                          rel={external ? 'noopener noreferrer' : undefined}
                          target={external ? '_blank' : undefined}
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

const DetailHero = ({
  eyebrow,
  summary,
  title,
}: {
  eyebrow: string
  summary?: string | null
  title: string
}) => (
  <header className="trayport-detail__hero">
    <div aria-hidden className="trayport-hub__polygon" />
    <div className="trayport-container trayport-detail__hero-inner">
      <p className="trayport-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {summary ? <p>{summary}</p> : null}
    </div>
  </header>
)

export const VenueView = ({ document }: { document: Venue }) => {
  const venueTypes = relationshipTitles(document.venueTypes)
  const assetClasses = relationshipTitles(document.assetClasses)
  const regions = relationshipTitles(document.regions)
  const labels = [...venueTypes, ...assetClasses, ...regions]
  const { body, hero } = splitLeadingHero(document.layout)

  return (
    <main className="trayport-detail" id="main-content">
      {hero.length ? (
        <TrayportBlocks blocks={hero} />
      ) : (
        <DetailHero
          eyebrow={labels.slice(0, 2).join(' · ') || 'Connected venue'}
          summary={document.summary}
          title={document.title}
        />
      )}

      <section className="trayport-detail__body">
        <div className="trayport-container trayport-detail__grid">
          <div className="trayport-detail__primary">
            <p className="trayport-eyebrow">Venue profile</p>
            <h2>Connected through Trayport</h2>
            {document.description ? (
              <RichText
                className="trayport-richtext"
                data={document.description as DefaultTypedEditorState}
                enableGutter={false}
              />
            ) : document.summary ? (
              <p className="trayport-detail__summary">{document.summary}</p>
            ) : null}
            {document.website ? (
              <a
                className="trayport-action trayport-action--secondary"
                href={document.website}
                rel="noopener noreferrer"
                target="_blank"
              >
                Visit venue website <ExternalLink aria-hidden size={16} />
              </a>
            ) : null}
          </div>

          <aside aria-label="Venue details" className="trayport-detail__facts">
            {document.logo ? (
              <div className="trayport-detail__logo">
                <TrayportMedia media={document.logo} showFallbackLink={false} />
              </div>
            ) : null}
            <dl>
              {document.code ? (
                <div>
                  <dt>Venue code</dt>
                  <dd>{document.code}</dd>
                </div>
              ) : null}
              {venueTypes.length ? (
                <div>
                  <dt>Venue type</dt>
                  <dd>{venueTypes.join(', ')}</dd>
                </div>
              ) : null}
              {assetClasses.length ? (
                <div>
                  <dt>Markets</dt>
                  <dd>{assetClasses.join(', ')}</dd>
                </div>
              ) : null}
              {regions.length ? (
                <div>
                  <dt>Regions</dt>
                  <dd>{regions.join(', ')}</dd>
                </div>
              ) : null}
              {document.location?.label ? (
                <div>
                  <dt>Location</dt>
                  <dd>{document.location.label}</dd>
                </div>
              ) : null}
            </dl>
          </aside>
        </div>
      </section>

      {body.length ? <TrayportBlocks blocks={body} /> : null}
    </main>
  )
}

export const LearningVideoView = ({ document }: { document: LearningVideo }) => {
  const categories = relationshipTitles(document.categories)
  const isPublic = document.accessMode === 'public'
  const { body, hero } = splitLeadingHero(document.layout)

  return (
    <main className="trayport-detail trayport-learning-video" id="main-content">
      {hero.length ? (
        <TrayportBlocks blocks={hero} />
      ) : (
        <DetailHero
          eyebrow={categories[0] || 'Learning Hub'}
          summary={document.summary}
          title={document.title}
        />
      )}

      <section className="trayport-detail__body">
        <div className="trayport-container trayport-learning-video__grid">
          <div className="trayport-learning-video__player">
            {isPublic ? (
              document.video ? (
                <TrayportMedia
                  externalURL={document.externalVideoURL}
                  media={document.video}
                  showFallbackLink
                />
              ) : document.externalVideoURL ? (
                <a
                  className="trayport-video-destination"
                  href={document.externalVideoURL}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <PlayCircle aria-hidden size={36} />
                  <span>Watch this video</span>
                  <ExternalLink aria-hidden size={18} />
                </a>
              ) : null
            ) : (
              <div className="trayport-video-gate">
                <LockKeyhole aria-hidden size={32} />
                <p className="trayport-eyebrow">
                  {document.accessMode === 'subscriber' ? 'Subscriber access' : 'Sign in required'}
                </p>
                <h2>This video is available to registered viewers.</h2>
                <p>
                  The page remains public while the video and supporting actions stay protected.
                </p>
              </div>
            )}
          </div>

          <aside aria-label="Video details" className="trayport-detail__facts">
            <dl>
              {document.duration ? (
                <div>
                  <dt>Duration</dt>
                  <dd>{document.duration}</dd>
                </div>
              ) : null}
              {categories.length ? (
                <div>
                  <dt>Topics</dt>
                  <dd>{categories.join(', ')}</dd>
                </div>
              ) : null}
              <div>
                <dt>Access</dt>
                <dd>
                  {document.accessMode === 'public'
                    ? 'Public'
                    : document.accessMode === 'subscriber'
                      ? 'Subscribers'
                      : 'Registered viewers'}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {body.length ? <TrayportBlocks blocks={body} /> : null}
    </main>
  )
}

const IndexHero = ({
  count,
  eyebrow,
  intro,
  title,
}: {
  count: number
  eyebrow?: string | null
  intro?: string | null
  title: string
}) => (
  <header className="trayport-index__hero">
    <div aria-hidden className="trayport-hub__polygon" />
    <div className="trayport-container trayport-index__hero-inner">
      <div>
        <p className="trayport-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {intro ? <p>{intro}</p> : null}
      </div>
      <p aria-label={`${count} published profiles`} className="trayport-index__count">
        <strong>{count}</strong>
        <span>published profiles</span>
      </p>
    </div>
  </header>
)

export const VenueIndexView = async ({
  configuration,
}: {
  configuration: RouteIndex['venueIndex']
}) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'venues',
    depth: 2,
    draft: false,
    limit: 500,
    overrideAccess: false,
    pagination: false,
    where: {
      and: [{ _status: { equals: 'published' } }, { contentMode: { equals: 'page' } }],
    },
  })
  const venues = [...result.docs].sort(
    (left, right) =>
      (left.displayOrder || 0) - (right.displayOrder || 0) || left.title.localeCompare(right.title),
  )

  return (
    <main className="trayport-index" id="main-content">
      <IndexHero
        count={venues.length}
        eyebrow={configuration.eyebrow}
        intro={configuration.intro}
        title={configuration.title}
      />
      <section aria-labelledby="venue-index-title" className="trayport-index__body">
        <div className="trayport-container">
          <div className="trayport-index__section-heading">
            <p className="trayport-eyebrow">Directory</p>
            <h2 id="venue-index-title">Connected venues</h2>
          </div>
          {venues.length ? (
            <div className="trayport-index__list">
              {venues.map((venue) => {
                if (!venue.path) return null
                const types = relationshipTitles(venue.venueTypes)
                const regions = relationshipTitles(venue.regions)
                return (
                  <Link className="trayport-index-row" href={venue.path} key={venue.id}>
                    {venue.logo ? (
                      <span className="trayport-index-row__media">
                        <TrayportMedia media={venue.logo} showFallbackLink={false} />
                      </span>
                    ) : (
                      <span aria-hidden className="trayport-index-row__monogram">
                        {venue.title.slice(0, 1)}
                      </span>
                    )}
                    <span className="trayport-index-row__content">
                      <span className="trayport-index-row__meta">
                        {[...types, ...regions].slice(0, 3).join(' · ') || 'Connected venue'}
                      </span>
                      <strong>{venue.title}</strong>
                      {venue.summary ? <span>{venue.summary}</span> : null}
                    </span>
                    <ArrowRight aria-hidden size={20} />
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="trayport-index__empty">
              Public venue profiles will appear here as their migrated details are approved.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

type HubMarker = {
  hub: Hub
  label: string
  latitude: number
  longitude: number
}

const CoverageMap = ({ markers }: { markers: HubMarker[] }) => {
  const x = (longitude: number) => ((longitude + 180) / 360) * 1000
  const y = (latitude: number) => ((90 - latitude) / 180) * 500

  return (
    <figure className="trayport-index-map">
      <svg
        aria-labelledby="market-index-map-title market-index-map-description"
        role="img"
        viewBox="0 0 1000 500"
      >
        <title id="market-index-map-title">Trayport market coverage</title>
        <desc id="market-index-map-description">
          Schematic field showing {markers.length} managed market locations.
        </desc>
        <rect className="trayport-coverage-map__field" height="500" rx="8" width="1000" />
        {[250, 500, 750].map((value) => (
          <line
            className="trayport-coverage-map__grid"
            key={`vertical-${value}`}
            x1={value}
            x2={value}
            y1="0"
            y2="500"
          />
        ))}
        {[125, 250, 375].map((value) => (
          <line
            className="trayport-coverage-map__grid"
            key={`horizontal-${value}`}
            x1="0"
            x2="1000"
            y1={value}
            y2={value}
          />
        ))}
        {markers.map((marker, index) => (
          <circle
            className="trayport-coverage-map__marker"
            cx={x(marker.longitude)}
            cy={y(marker.latitude)}
            key={`${marker.hub.id}-${marker.label}-${index}`}
            r="7"
          >
            <title>{marker.label}</title>
          </circle>
        ))}
      </svg>
      <figcaption>
        <MapPin aria-hidden size={16} />
        {markers.length} managed market locations
      </figcaption>
    </figure>
  )
}

export const MarketCoverageIndexView = async ({
  configuration,
}: {
  configuration: RouteIndex['marketCoverageIndex']
}) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'hubs',
    depth: 2,
    draft: false,
    limit: 500,
    overrideAccess: false,
    pagination: false,
    sort: 'title',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })
  const publicHubs = result.docs.filter(
    (hub): hub is Hub & { path: string } => hub.contentMode === 'page' && Boolean(hub.path),
  )
  const markers = result.docs
    .filter((hub) => hub.showOnMap)
    .flatMap((hub) =>
      (hub.map?.markers || []).map((marker) => ({
        hub,
        label: marker.label || hub.title,
        latitude: marker.location.latitude,
        longitude: marker.location.longitude,
      })),
    )

  return (
    <main className="trayport-index trayport-index--markets" id="main-content">
      <IndexHero
        count={publicHubs.length}
        eyebrow={configuration.eyebrow}
        intro={configuration.intro}
        title={configuration.title}
      />
      <section className="trayport-index__map-section">
        <div className="trayport-container trayport-index__map-grid">
          <div>
            <p className="trayport-eyebrow">Global connectivity</p>
            <h2>Markets connected across regions</h2>
            <p>
              Locations and market relationships are managed in Payload while market time series
              remain in application PostgreSQL.
            </p>
          </div>
          <CoverageMap markers={markers} />
        </div>
      </section>
      <section aria-labelledby="market-index-title" className="trayport-index__body">
        <div className="trayport-container">
          <div className="trayport-index__section-heading">
            <p className="trayport-eyebrow">Markets</p>
            <h2 id="market-index-title">Explore market coverage</h2>
          </div>
          {publicHubs.length ? (
            <div className="trayport-index__list">
              {publicHubs.map((hub) => {
                const assetClasses = relationshipTitles(hub.assetClasses)
                const regions = relationshipTitles(hub.regions)
                return (
                  <Link className="trayport-index-row" href={hub.path} key={hub.id}>
                    <span aria-hidden className="trayport-index-row__monogram">
                      {hub.code?.slice(0, 2) || hub.title.slice(0, 1)}
                    </span>
                    <span className="trayport-index-row__content">
                      <span className="trayport-index-row__meta">
                        {[...assetClasses, ...regions].join(' · ') || 'Market coverage'}
                      </span>
                      <strong>{hub.title}</strong>
                      {hub.summary ? <span>{hub.summary}</span> : null}
                    </span>
                    <ArrowRight aria-hidden size={20} />
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="trayport-index__empty">
              Public market profiles will appear here as their migrated details are approved.
            </p>
          )}
        </div>
      </section>
    </main>
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
