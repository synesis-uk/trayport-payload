import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import Link from 'next/link'

import { AppIcon } from '@/components/icons'
import { AppLink } from '@/components/site'
import { TrayportBlocks } from '@/components/blocks'
import RichText from '@/components/RichText'
import type { VenueRouteDocument } from '@/data/contentRouteProjection'
import { safeExternalHTTPSURL } from '@/routing/urlPolicy'

import { TrayportMedia } from '@/components/Trayport/TrayportMedia'

import { orderedRelationships, relationshipTitles, splitLeadingHero } from './shared'

type VenueConnection = NonNullable<VenueRouteDocument['marketConnections']>[number]

const orderedConnectionsByHubTitle = (connections: VenueConnection[]) =>
  connections
    .map((connection, sourceIndex) => ({ connection, sourceIndex }))
    .sort((left, right) => {
      const leftHub = typeof left.connection.hub === 'object' ? left.connection.hub : null
      const rightHub = typeof right.connection.hub === 'object' ? right.connection.hub : null

      return (
        (leftHub?.title || '').localeCompare(rightHub?.title || '') ||
        left.sourceIndex - right.sourceIndex
      )
    })

export const VenueView = ({
  document,
  draft = false,
}: {
  document: VenueRouteDocument
  draft?: boolean
}) => {
  const website = safeExternalHTTPSURL(document.website)
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
      {hero.length ? <TrayportBlocks blocks={hero} draft={draft} /> : null}

      <section className="trayport-structured-stage">
        <article className="trayport-structured-card trayport-structured-venue">
          <header className="trayport-structured-venue__header">
            <div className="trayport-structured-venue__identity">
              <p className="trayport-eyebrow">{venueTypes.join(' · ') || 'Connected venue'}</p>
              <Title>{document.title}</Title>
            </div>

            {document.logo ? (
              website ? (
                <a
                  aria-label={`Visit ${document.title} website (opens in a new tab)`}
                  className="trayport-structured-venue__logo"
                  href={website}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <TrayportMedia
                    composition="logo"
                    media={document.logo}
                    showFallbackLink={false}
                    unoptimized
                  />
                </a>
              ) : (
                <div aria-hidden className="trayport-structured-venue__logo">
                  <TrayportMedia
                    composition="logo"
                    media={document.logo}
                    showFallbackLink={false}
                    unoptimized
                  />
                </div>
              )
            ) : website ? (
              <a
                className="trayport-inline-link trayport-structured-venue__website"
                href={website}
                rel="noopener noreferrer"
                target="_blank"
              >
                Visit venue website <AppIcon aria-hidden className="size-4" name="externalLink" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
          </header>

          <div aria-hidden className="trayport-structured-venue__rule" />

          {document.description ? (
            <section
              aria-labelledby="venue-about-heading"
              className="trayport-structured-venue__about"
            >
              <h2 id="venue-about-heading">About {document.title}</h2>
              <RichText
                className="trayport-richtext"
                data={document.description as DefaultTypedEditorState}
                enableGutter={false}
              />
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
                        {orderedConnectionsByHubTitle(groupData.connections).map(
                          ({ connection, sourceIndex }) => {
                            const hub = typeof connection.hub === 'object' ? connection.hub : null
                            if (!hub) return null
                            const href =
                              hub.contentMode === 'page' && hub.path
                                ? hub.path
                                : safeExternalHTTPSURL(hub.externalDestination)
                            const external = Boolean(href?.startsWith('https://'))
                            return (
                              <li key={`${hub.id}-${sourceIndex}`}>
                                {href ? (
                                  <AppLink
                                    link={{
                                      newTab: external,
                                      type: 'custom',
                                      url: href,
                                    }}
                                  >
                                    <span>{hub.title}</span>
                                    {external ? (
                                      <span className="sr-only"> (opens in a new tab)</span>
                                    ) : null}
                                  </AppLink>
                                ) : (
                                  <span>{hub.title}</span>
                                )}
                              </li>
                            )
                          },
                        )}
                      </ul>
                    </section>
                  ))}
              </div>
            </section>
          ) : null}

          <footer className="trayport-structured-venue__footer">
            <Link className="trayport-action trayport-action--primary" href="/contact/">
              Contact Us <AppIcon aria-hidden className="size-[17px]" name="arrowRight" />
            </Link>
          </footer>
        </article>
      </section>

      {body.length ? <TrayportBlocks blocks={body} draft={draft} /> : null}
    </main>
  )
}
