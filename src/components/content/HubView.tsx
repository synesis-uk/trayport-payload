import { AppIcon } from '@/components/icons'
import { AppLink } from '@/components/site'
import { TrayportBlocks } from '@/components/blocks'
import type { HubRouteDocument } from '@/data/contentRouteProjection'
import type { Venue } from '@/payload-types'
import { safeExternalHTTPSURL } from '@/routing/urlPolicy'

import { TrayportMedia } from '@/components/Trayport/TrayportMedia'

import { orderedRelationships, splitLeadingHero } from './shared'

type HubConnection = NonNullable<HubRouteDocument['connections']>[number]

const venueFromConnection = (connection: HubConnection): Venue | null =>
  typeof connection.venue === 'object' ? connection.venue : null

const venueTypeHeading = (title: string): string => {
  const importedLabels: Record<string, string> = {
    Broker: 'Brokers',
    'Clearing House': 'Clearing Houses',
    Exchange: 'Exchanges',
  }

  return importedLabels[title] || title
}

const assetClassIcon = (title: string) => {
  if (title === 'Power') return 'power' as const
  if (title === 'Natural Gas') return 'gas' as const
  if (title === 'Climate') return 'climate' as const
  return 'bulkMarkets' as const
}

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

      <ul className="trayport-venue-list">
        {productGroups(values).flatMap(([groupName, group]) => [
          <li className="trayport-venue-list__group-heading" key={`${groupName}-heading`}>
            <h4>{venueTypeHeading(groupName)}</h4>
          </li>,
          ...[...group.connections].reverse().map((connection, index) => {
            const venue = venueFromConnection(connection)
            if (!venue) return null
            const href =
              venue.contentMode === 'page' && venue.path
                ? venue.path
                : safeExternalHTTPSURL(venue.website)
            const external = Boolean(href?.startsWith('https://'))

            return (
              <li key={`${groupName}-${venue.id}-${index}`}>
                {href ? (
                  <AppLink
                    link={{
                      newTab: external,
                      type: 'custom',
                      url: href,
                    }}
                  >
                    <span>{venue.title}</span>
                    {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
                  </AppLink>
                ) : (
                  <span>{venue.title}</span>
                )}
              </li>
            )
          }),
        ])}
      </ul>
    </section>
  )
}

const HubHeaderMap = ({ document }: { document: HubRouteDocument }) => {
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
export const HubView = ({
  document,
  draft = false,
}: {
  document: HubRouteDocument
  draft?: boolean
}) => {
  const { body, hero } = splitLeadingHero(document.layout)
  const connections = document.connections || []
  const joule = connections.filter((connection) => connection.supportsJoule)
  const autoTrader = connections.filter((connection) => connection.supportsAutoTrader)
  const assetClasses = orderedRelationships(document.assetClasses)
  const assetClassTitle = assetClasses.map(({ title }) => title).join(' · ') || 'Market coverage'
  const primaryAssetClassTitle = assetClasses[0]?.title || 'Market coverage'
  const resolvedHeroMedia = typeof document.heroMedia === 'object' ? document.heroMedia : null
  const hasUnavailableGermanHeader =
    resolvedHeroMedia?.legacySource?.legacyId === 9727 &&
    (!resolvedHeroMedia.url ||
      resolvedHeroMedia.mimeType === 'image/svg+xml' ||
      resolvedHeroMedia.filename?.startsWith('missing-media'))
  const hasHeroImage = Boolean(resolvedHeroMedia?.url && !hasUnavailableGermanHeader)
  const headerMediaMode = hasHeroImage
    ? 'image'
    : document.heroMedia || hasUnavailableGermanHeader
      ? 'bridge'
      : 'map'
  const Title = hero.length ? 'h2' : 'h1'

  return (
    <main
      className="trayport-structured-page trayport-structured-page--hub"
      data-content-type="hub"
      id="main-content"
    >
      {hero.length ? <TrayportBlocks blocks={hero} draft={draft} /> : null}

      <section className="trayport-structured-stage">
        <article className="trayport-structured-card trayport-structured-hub">
          <header className="trayport-structured-hub__header" data-media={headerMediaMode}>
            <div
              aria-hidden={headerMediaMode !== 'map' ? true : undefined}
              className="trayport-structured-hub__media"
            >
              {hasHeroImage ? (
                <TrayportMedia background media={resolvedHeroMedia} preload />
              ) : headerMediaMode === 'bridge' ? null : (
                <HubHeaderMap document={document} />
              )}
            </div>

            <p className="trayport-structured-hub__classification">
              <AppIcon
                aria-hidden
                className="size-[30px]"
                name={assetClassIcon(primaryAssetClassTitle)}
              />
              <span>{assetClassTitle}</span>
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

      {body.length ? <TrayportBlocks blocks={body} draft={draft} /> : null}
    </main>
  )
}
