import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { AppIcon } from '@/components/icons'
import { TrayportBlocks } from '@/components/blocks'
import RichText from '@/components/RichText'
import type { LearningVideoRouteDocument } from '@/data/contentRouteProjection'
import { safeExternalHTTPSURL } from '@/routing/urlPolicy'

import { TrayportMedia } from '@/components/Trayport/TrayportMedia'

import { DetailHero, relationshipTitles, splitLeadingHero } from './shared'

/*
 * The learning-video detail uses the generic marketing detail treatment. Venue
 * and hub records above use their source template's structured presentation.
 */
export const LearningVideoView = ({
  document,
  draft = false,
}: {
  document: LearningVideoRouteDocument
  draft?: boolean
}) => {
  const externalVideoURL = safeExternalHTTPSURL(document.externalVideoURL)
  const categories = relationshipTitles(document.categories)
  const isPublic = document.accessMode === 'public'
  // Protected records are metadata-only gates until private asset delivery exists.
  // Ignore any stale layout defensively even if a record predates the model guard.
  const { body, hero } = isPublic ? splitLeadingHero(document.layout) : { body: [], hero: [] }

  return (
    <main className="trayport-detail trayport-learning-video" id="main-content">
      {hero.length ? (
        <TrayportBlocks blocks={hero} draft={draft} />
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
                  externalURL={externalVideoURL}
                  media={document.video}
                  showFallbackLink
                />
              ) : externalVideoURL ? (
                <a
                  className="trayport-video-destination"
                  href={externalVideoURL}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <AppIcon aria-hidden className="size-9" name="playCircle" />
                  <span>Watch this video</span>
                  <AppIcon aria-hidden className="size-[18px]" name="externalLink" />
                </a>
              ) : null
            ) : (
              <div className="trayport-video-gate">
                <AppIcon aria-hidden className="size-8" name="lock" />
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
        <section className="trayport-section trayport-section--compact trayport-section--white">
          <div className="trayport-container trayport-container--reading">
            <RichText
              className="trayport-richtext"
              data={document.description as DefaultTypedEditorState}
              enableGutter={false}
            />
          </div>
        </section>
      ) : null}

      {body.length ? <TrayportBlocks blocks={body} draft={draft} /> : null}
    </main>
  )
}
