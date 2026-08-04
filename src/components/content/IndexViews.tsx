import Link from 'next/link'

import { AppIcon } from '@/components/icons'
import type { RouteIndex } from '@/payload-types'
import {
  loadMarketCoverageIndex,
  loadVenueIndex,
  type MarketCoverageMarkerViewModel,
} from '@/data/contentIndexes.server'

import { TrayportMedia } from '@/components/Trayport/TrayportMedia'

import { IndexHero } from './shared'

export const VenueIndexView = async ({
  configuration,
  draft = false,
}: {
  configuration: RouteIndex['venueIndex']
  draft?: boolean
}) => {
  const venues = await loadVenueIndex({ draft })

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
                return (
                  <Link className="trayport-index-row" href={venue.path} key={venue.id}>
                    {venue.logo ? (
                      <span className="trayport-index-row__media">
                        <TrayportMedia
                          composition="logo"
                          media={venue.logo}
                          showFallbackLink={false}
                        />
                      </span>
                    ) : (
                      <span aria-hidden className="trayport-index-row__monogram">
                        {venue.title.slice(0, 1)}
                      </span>
                    )}
                    <span className="trayport-index-row__content">
                      <span className="trayport-index-row__meta">
                        {[...venue.venueTypes, ...venue.regions].slice(0, 3).join(' · ') ||
                          'Connected venue'}
                      </span>
                      <strong>{venue.title}</strong>
                      {venue.summary ? <span>{venue.summary}</span> : null}
                    </span>
                    <AppIcon aria-hidden className="size-5" name="arrowRight" />
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

const CoverageMap = ({ markers }: { markers: MarketCoverageMarkerViewModel[] }) => {
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
        <rect className="trayport-index-map__field" height="500" rx="8" width="1000" />
        {[250, 500, 750].map((value) => (
          <line
            className="trayport-index-map__grid"
            key={`vertical-${value}`}
            x1={value}
            x2={value}
            y1="0"
            y2="500"
          />
        ))}
        {[125, 250, 375].map((value) => (
          <line
            className="trayport-index-map__grid"
            key={`horizontal-${value}`}
            x1="0"
            x2="1000"
            y1={value}
            y2={value}
          />
        ))}
        {markers.map((marker, index) => (
          <circle
            className="trayport-index-map__marker"
            cx={x(marker.longitude)}
            cy={y(marker.latitude)}
            key={`${marker.hubId}-${marker.label}-${index}`}
            r="7"
          >
            <title>{marker.label}</title>
          </circle>
        ))}
      </svg>
      <figcaption>
        <AppIcon aria-hidden className="size-4" name="location" />
        {markers.length} managed market locations
      </figcaption>
    </figure>
  )
}

export const MarketCoverageIndexView = async ({
  configuration,
  draft = false,
}: {
  configuration: RouteIndex['marketCoverageIndex']
  draft?: boolean
}) => {
  const { hubs, markers } = await loadMarketCoverageIndex({ draft })

  return (
    <main className="trayport-index trayport-index--markets" id="main-content">
      <IndexHero
        count={hubs.length}
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
          {hubs.length ? (
            <div className="trayport-index__list">
              {hubs.map((hub) => {
                return (
                  <Link className="trayport-index-row" href={hub.path} key={hub.id}>
                    <span aria-hidden className="trayport-index-row__monogram">
                      {hub.code?.slice(0, 2) || hub.title.slice(0, 1)}
                    </span>
                    <span className="trayport-index-row__content">
                      <span className="trayport-index-row__meta">
                        {[...hub.assetClasses, ...hub.regions].join(' · ') || 'Market coverage'}
                      </span>
                      <strong>{hub.title}</strong>
                      {hub.summary ? <span>{hub.summary}</span> : null}
                    </span>
                    <AppIcon aria-hidden className="size-5" name="arrowRight" />
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
