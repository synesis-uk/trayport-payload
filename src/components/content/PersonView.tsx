import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import RichText from '@/components/RichText'
import { AppIcon } from '@/components/icons'
import { TrayportMedia } from '@/components/Trayport/TrayportMedia'
import type { PersonRouteDocument } from '@/data/contentRouteProjection'
import { safeExternalHTTPSURL } from '@/routing/urlPolicy'

const teamLabels: Record<PersonRouteDocument['team'], string> = {
  careers: 'Trayport people',
  ceo: 'Leadership',
  head: 'Department leadership',
  smt: 'Senior management',
}

export const PersonView = ({ document }: { document: PersonRouteDocument }) => {
  const externalProfileURL = safeExternalHTTPSURL(document.externalProfileURL)
  const careersProfile = document.team === 'careers'
  const hasPortrait = Boolean(document.image)

  return (
    <main
      className={`trayport-person${careersProfile ? ' trayport-person--careers' : ''}${hasPortrait ? '' : ' trayport-person--no-portrait'}`}
      data-content-type="person"
      id="main-content"
    >
      <div className="trayport-person__stage">
        <article className="trayport-person__profile">
          <div className="trayport-person__identity">
            <p className="trayport-eyebrow">{teamLabels[document.team]}</p>
            <h1>{document.title}</h1>
            {document.jobRole ? <p className="trayport-person__role">{document.jobRole}</p> : null}
          </div>

          {hasPortrait ? (
            <div className="trayport-person__portrait">
              <TrayportMedia
                composition="content"
                media={document.image}
                showFallbackLink={false}
              />
            </div>
          ) : null}

          <div className="trayport-person__rule" aria-hidden="true" />

          <div className="trayport-person__content">
            {document.quote ? (
              <blockquote className="trayport-person__quote">
                <RichText
                  data={document.quote as DefaultTypedEditorState}
                  enableGutter={false}
                  enableProse={false}
                />
              </blockquote>
            ) : null}

            {document.description ? (
              <RichText
                className="trayport-richtext"
                data={document.description as DefaultTypedEditorState}
                enableGutter={false}
              />
            ) : null}

            {externalProfileURL ? (
              <a
                className="trayport-inline-link trayport-person__external"
                href={externalProfileURL}
                rel="noopener noreferrer"
                target="_blank"
              >
                External profile <AppIcon aria-hidden name="externalLink" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
          </div>
        </article>
      </div>
    </main>
  )
}
