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

type OrderedRelationship = {
  displayOrder?: number | null
  title: string
}

const orderedRelationships = (
  values?: Array<OrderedRelationship | number | null> | null,
): OrderedRelationship[] =>
  (values || [])
    .filter(
      (value): value is OrderedRelationship =>
        value !== null && typeof value === 'object' && Boolean(value.title),
    )
    .sort(
      (left, right) =>
        (left.displayOrder ?? Number.MAX_SAFE_INTEGER) -
          (right.displayOrder ?? Number.MAX_SAFE_INTEGER) || left.title.localeCompare(right.title),
    )

export const splitLeadingHero = <Block extends { blockType?: string | null }>(
  layout?: Block[] | null,
): { body: Block[]; hero: Block[] } => {
  const blocks = layout || []
  return blocks[0]?.blockType === 'trayportHero'
    ? { body: blocks.slice(1), hero: blocks.slice(0, 1) }
    : { body: blocks, hero: [] }
}

export const PageView = ({ document }: { document: Page }) => {
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
      <TrayportBlocks blocks={document.layout} />
    </main>
  )
}

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

const productGroups = (connections: HubConnection[]) => {
  const groups = new Map<string, { connections: HubConnection[]; displayOrder: number | null }>()

  for (const connection of connections) {
    const venue = venueFromConnection(connection)
    const memberships = orderedRelationships(venue?.venueTypes)
    const venueTypes = memberships.length
      ? memberships
      : [{ displayOrder: null, title: 'Connected venues' }]

    for (const venueType of venueTypes) {
      const existing = groups.get(venueType.title)
      groups.set(venueType.title, {
        connections: [...(existing?.connections || []), connection],
        displayOrder: existing?.displayOrder ?? venueType.displayOrder ?? null,
      })
    }
  }

  return [...groups.entries()].sort(
    ([leftName, left], [rightName, right]) =>
      (left.displayOrder ?? Number.MAX_SAFE_INTEGER) -
        (right.displayOrder ?? Number.MAX_SAFE_INTEGER) || leftName.localeCompare(rightName),
  )
}

const ConnectionProduct = ({ title, values }: { title: string; values: HubConnection[] }) => {
  if (!values.length) return null

  const headingID = `connectivity-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  return (
    <section aria-labelledby={headingID} className="trayport-connectivity">
      <div className="trayport-connectivity__header">
        <h3 id={headingID}>{title}</h3>
      </div>

      <div className="trayport-connectivity__groups">
        {productGroups(values).map(([groupName, group]) => (
          <section className="trayport-venue-group" key={groupName}>
            <h4>{groupName}</h4>
            <ul className="trayport-venue-list">
              {[...group.connections]
                .sort((left, right) => {
                  const leftVenue = venueFromConnection(left)
                  const rightVenue = venueFromConnection(right)
                  return (
                    (leftVenue?.displayOrder ?? Number.MAX_SAFE_INTEGER) -
                      (rightVenue?.displayOrder ?? Number.MAX_SAFE_INTEGER) ||
                    (leftVenue?.title || '').localeCompare(rightVenue?.title || '')
                  )
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
                          {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
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

const HubHeaderMap = ({ document }: { document: Hub }) => {
  const markers = document.map?.markers || []
  const x = (longitude: number) => ((longitude + 180) / 360) * 1000
  const y = (latitude: number) => ((90 - latitude) / 180) * 500

  return (
    <svg
      aria-labelledby="structured-hub-map-title structured-hub-map-description"
      className="trayport-structured-hub__map"
      role="img"
      viewBox="0 0 1000 500"
    >
      <title id="structured-hub-map-title">{document.title} location map</title>
      <desc id="structured-hub-map-description">
        {markers.length
          ? `${markers.length} managed market ${markers.length === 1 ? 'location' : 'locations'}.`
          : 'Managed market location.'}
      </desc>
      <rect height="500" width="1000" />
      {[250, 500, 750].map((value) => (
        <line key={`vertical-${value}`} x1={value} x2={value} y1="0" y2="500" />
      ))}
      {[125, 250, 375].map((value) => (
        <line key={`horizontal-${value}`} x1="0" x2="1000" y1={value} y2={value} />
      ))}
      {markers.map((marker, index) => (
        <circle
          cx={x(marker.location.longitude)}
          cy={y(marker.location.latitude)}
          key={`${marker.label || document.title}-${index}`}
          r="8"
        >
          <title>{marker.label || document.map?.locationLabel || document.title}</title>
        </circle>
      ))}
    </svg>
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
  const { body, hero } = splitLeadingHero(document.layout)
  const Title = hero.length ? 'h2' : 'h1'
  const connections = document.marketConnections || []
  const connectionGroups = new Map<
    string,
    { connections: typeof connections; displayOrder: number | null }
  >()
  for (const connection of connections) {
    const hub = typeof connection.hub === 'object' ? connection.hub : null
    const memberships = orderedRelationships(hub?.assetClasses)
    const assetClasses = memberships.length
      ? memberships
      : [{ displayOrder: null, title: 'Other markets' }]

    for (const assetClass of assetClasses) {
      const existing = connectionGroups.get(assetClass.title)
      connectionGroups.set(assetClass.title, {
        connections: [...(existing?.connections || []), connection],
        displayOrder: existing?.displayOrder ?? assetClass.displayOrder ?? null,
      })
    }
  }

  return (
    <main
      className="trayport-structured-page trayport-structured-page--venue"
      data-content-type="venue"
      id="main-content"
    >
      {hero.length ? <TrayportBlocks blocks={hero} /> : null}

      <section className="trayport-structured-stage">
        <article className="trayport-structured-card trayport-structured-venue">
          <header className="trayport-structured-venue__header">
            <div className="trayport-structured-venue__identity">
              <p className="trayport-eyebrow">{venueTypes.join(' · ') || 'Connected venue'}</p>
              <Title>{document.title}</Title>
            </div>

            {document.logo ? (
              document.website ? (
                <a
                  aria-label={`Visit ${document.title} website (opens in a new tab)`}
                  className="trayport-structured-venue__logo"
                  href={document.website}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <TrayportMedia media={document.logo} showFallbackLink={false} />
                </a>
              ) : (
                <div aria-hidden className="trayport-structured-venue__logo">
                  <TrayportMedia media={document.logo} showFallbackLink={false} />
                </div>
              )
            ) : document.website ? (
              <a
                className="trayport-inline-link trayport-structured-venue__website"
                href={document.website}
                rel="noopener noreferrer"
                target="_blank"
              >
                Visit venue website <ExternalLink aria-hidden size={16} />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
          </header>

          <div aria-hidden className="trayport-structured-venue__rule" />

          {document.description || document.summary ? (
            <section
              aria-labelledby="venue-about-heading"
              className="trayport-structured-venue__about"
            >
              <h2 id="venue-about-heading">About {document.title}</h2>
              {document.description ? (
                <RichText
                  className="trayport-richtext"
                  data={document.description as DefaultTypedEditorState}
                  enableGutter={false}
                />
              ) : (
                <p className="trayport-detail__summary">{document.summary}</p>
              )}
            </section>
          ) : null}

          {connections.length ? (
            <section
              aria-labelledby="venue-markets-heading"
              className="trayport-structured-venue__markets trayport-venue-markets"
            >
              <h2 id="venue-markets-heading">Markets</h2>
              <div className="trayport-venue-markets__groups">
                {[...connectionGroups.entries()]
                  .sort(
                    ([leftName, left], [rightName, right]) =>
                      (left.displayOrder ?? Number.MAX_SAFE_INTEGER) -
                        (right.displayOrder ?? Number.MAX_SAFE_INTEGER) ||
                      leftName.localeCompare(rightName),
                  )
                  .map(([group, groupData]) => (
                    <section key={group}>
                      <h3>{group}</h3>
                      <ul>
                        {[...groupData.connections]
                          .sort((left, right) => {
                            const leftHub = typeof left.hub === 'object' ? left.hub : null
                            const rightHub = typeof right.hub === 'object' ? right.hub : null
                            return (leftHub?.title || '').localeCompare(rightHub?.title || '')
                          })
                          .map((connection, index) => {
                            const hub = typeof connection.hub === 'object' ? connection.hub : null
                            if (!hub) return null
                            const href =
                              hub.contentMode === 'page' && hub.path
                                ? hub.path
                                : hub.externalDestination
                            const external = Boolean(href && /^https?:\/\//.test(href))
                            const content = (
                              <>
                                <span>{hub.title}</span>
                                {external ? (
                                  <ExternalLink aria-hidden size={14} />
                                ) : href ? (
                                  <ArrowRight aria-hidden size={14} />
                                ) : null}
                              </>
                            )

                            return (
                              <li key={`${hub.id}-${index}`}>
                                {href ? (
                                  <a
                                    href={href}
                                    rel={external ? 'noopener noreferrer' : undefined}
                                    target={external ? '_blank' : undefined}
                                  >
                                    {content}
                                    {external ? (
                                      <span className="sr-only"> (opens in a new tab)</span>
                                    ) : null}
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
          ) : null}

          <footer className="trayport-structured-venue__footer">
            <Link className="trayport-action trayport-action--primary" href="/contact/">
              Contact Us <ArrowRight aria-hidden size={17} />
            </Link>
          </footer>
        </article>
      </section>

      {body.length ? <TrayportBlocks blocks={body} /> : null}
    </main>
  )
}

/*
 * The learning-video detail uses the generic marketing detail treatment. Venue
 * and hub records above use their source template's structured presentation.
 */
export const LearningVideoView = ({ document }: { document: LearningVideo }) => {
  const categories = relationshipTitles(document.categories)
  const isPublic = document.accessMode === 'public'
  // Protected records are metadata-only gates until private asset delivery exists.
  // Ignore any stale layout defensively even if a record predates the model guard.
  const { body, hero } = isPublic ? splitLeadingHero(document.layout) : { body: [], hero: [] }

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
                <h2>This video is available to customers with a Trayport login.</h2>
                <p>Contact our sales team if you would like to gain access or learn more.</p>
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

      {document.description ? (
        <section className="trayport-section trayport-section--white trayport-section--compact">
          <div className="trayport-container trayport-container--reading">
            <RichText
              className="trayport-richtext"
              data={document.description as DefaultTypedEditorState}
              enableGutter={false}
            />
          </div>
        </section>
      ) : null}

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
  const { body, hero } = splitLeadingHero(document.layout)
  const connections = document.connections || []
  const joule = connections.filter((connection) => connection.supportsJoule)
  const autoTrader = connections.filter((connection) => connection.supportsAutoTrader)
  const assetClasses = orderedRelationships(document.assetClasses)
  const region = document.regions?.find((item) => typeof item === 'object')
  const assetClassTitle = assetClasses.map(({ title }) => title).join(' · ') || 'Market coverage'
  const regionTitle = region && typeof region === 'object' ? region.title : null
  const Title = hero.length ? 'h2' : 'h1'

  return (
    <main
      className="trayport-structured-page trayport-structured-page--hub"
      data-content-type="hub"
      id="main-content"
    >
      {hero.length ? <TrayportBlocks blocks={hero} /> : null}

      <section className="trayport-structured-stage">
        <article className="trayport-structured-card trayport-structured-hub">
          <header
            className="trayport-structured-hub__header"
            data-media={document.heroMedia ? 'image' : 'map'}
          >
            <div
              aria-hidden={document.heroMedia ? true : undefined}
              className="trayport-structured-hub__media"
            >
              {document.heroMedia ? (
                <TrayportMedia background media={document.heroMedia} priority />
              ) : (
                <HubHeaderMap document={document} />
              )}
            </div>

            <p className="trayport-structured-hub__classification">
              <MapPin aria-hidden size={19} />
              <span>{[assetClassTitle, regionTitle].filter(Boolean).join(' · ')}</span>
            </p>

            <div className="trayport-structured-hub__title-tab">
              <Title>{document.title}</Title>
            </div>
          </header>

          <div className="trayport-structured-hub__body">
            {document.summary ? (
              <p className="trayport-structured-hub__summary">{document.summary}</p>
            ) : null}

            <div className="trayport-structured-hub__heading">
              <h2>Connected Venues</h2>
              {document.code ? <span>{document.code}</span> : null}
            </div>

            <div className="trayport-structured-hub__connections">
              <ConnectionProduct title="Joule" values={joule} />
              <ConnectionProduct title="autoTRADER" values={autoTrader} />
              {!joule.length && !autoTrader.length ? (
                <p className="trayport-structured-hub__empty">
                  No managed venue connections are available for this market.
                </p>
              ) : null}
            </div>
          </div>
        </article>
      </section>

      {body.length ? <TrayportBlocks blocks={body} /> : null}
    </main>
  )
}
