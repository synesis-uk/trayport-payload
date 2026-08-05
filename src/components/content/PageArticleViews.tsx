import type { ArticleRouteDocument, PageRouteDocument } from '@/data/contentRouteProjection'
import type { Banner } from '@/payload-types'

import type { BannerSlots } from '@/banners/model'
import { TrayportBlocks } from '@/components/blocks'
import { BannerSlot } from '@/components/Banners/BannerSlot'
import { HubSpotFormMount } from '@/components/HubSpotForm/HubSpotFormMount'

import { formatDate, splitLeadingHero } from './shared'

const eventDateRange = (startsAt?: string | null, endsAt?: string | null): string | null => {
  if (!startsAt && !endsAt) return null
  const start = startsAt ? new Date(startsAt) : null
  const end = endsAt ? new Date(endsAt) : null
  const validStart = start && !Number.isNaN(start.getTime()) ? start : null
  const validEnd = end && !Number.isNaN(end.getTime()) ? end : null
  if (!validStart && !validEnd) return null

  const long = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  if (!validStart) return long.format(validEnd!)
  if (!validEnd || validStart.getTime() === validEnd.getTime()) return long.format(validStart)

  if (
    validStart.getUTCFullYear() === validEnd.getUTCFullYear() &&
    validStart.getUTCMonth() === validEnd.getUTCMonth()
  ) {
    const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric' }).format(validStart)
    return `${day}–${long.format(validEnd)}`
  }

  return `${long.format(validStart)} – ${long.format(validEnd)}`
}

const includesHubSpotForm = (layout: ArticleRouteDocument['layout']): boolean =>
  (layout || []).some(
    (block) =>
      block.blockType === 'contentSection' &&
      block.columns.some((column) =>
        column.components.some((component) => component.blockType === 'hubspotForm'),
      ),
  )

export const eventHasFinished = (endsAt?: string | null, now = new Date()): boolean => {
  if (!endsAt) return false
  const end = new Date(endsAt)
  if (Number.isNaN(end.getTime()) || Number.isNaN(now.getTime())) return false
  const endDay = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())
  const currentDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return currentDay > endDay
}

const withoutHubSpotForms = (
  layout: ArticleRouteDocument['layout'],
): ArticleRouteDocument['layout'] => {
  const filtered: NonNullable<ArticleRouteDocument['layout']> = []

  for (const block of layout || []) {
    if (block.blockType !== 'contentSection') {
      filtered.push(block)
      continue
    }

    const columns = block.columns.flatMap((column) => {
      const components = column.components.filter(
        (component) => component.blockType !== 'hubspotForm',
      )
      return components.length ? [{ ...column, components }] : []
    })

    if (columns.length) filtered.push({ ...block, columns })
  }

  return filtered
}

export const PageView = ({
  document,
  draft = false,
  searchQuery = '',
  banners,
}: {
  document: PageRouteDocument
  draft?: boolean
  searchQuery?: string
  banners?: BannerSlots<Banner>
}) => {
  const layout = document.layout || []
  const hasHero = layout.some(({ blockType }) => blockType === 'trayportHero')
  const presentation = document.pageType === 'homepage' ? 'home' : document.pageType

  return (
    <>
      <BannerSlot banners={banners?.first} />
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
        <TrayportBlocks blocks={layout.slice(0, 1)} draft={draft} searchQuery={searchQuery} />
        <BannerSlot banners={banners?.second} />
        <TrayportBlocks blocks={layout.slice(1)} draft={draft} searchQuery={searchQuery} />
      </main>
      <BannerSlot banners={banners?.last} />
    </>
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
  const eventDetails = document.articleType === 'event' ? document.eventDetails : null
  const date =
    eventDateRange(eventDetails?.startsAt, eventDetails?.endsAt) ||
    formatDate(document.displayDate || document.publishedAt)
  const typeLabel = document.articleType.replace('-', ' ')
  const { body, hero } = splitLeadingHero(document.layout)
  const eventLocation = [
    eventDetails?.venueName,
    eventDetails?.city,
    eventDetails?.region,
    eventDetails?.country,
  ]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(', ')
  const location = eventLocation || document.location
  const eventFinished = document.articleType === 'event' && eventHasFinished(eventDetails?.endsAt)
  const hideExpiredForms = eventFinished && eventDetails?.hideFormsAfterEnd === true
  const showFinishedNotice = eventFinished && eventDetails?.showFinishedNotice === true
  const visibleBody = hideExpiredForms ? withoutHubSpotForms(body) : body
  const hasLayoutForm = includesHubSpotForm(visibleBody)
  const metadata = (
    <div className="trayport-article__meta">
      {date ? (
        <time
          dateTime={
            eventDetails?.startsAt || document.displayDate || document.publishedAt || undefined
          }
        >
          {date}
        </time>
      ) : null}
      {location ? <span>{location}</span> : null}
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
        {showFinishedNotice ? (
          <div className="trayport-container trayport-container--reading">
            <p className="trayport-event-finished" role="status">
              This event has now finished.
            </p>
          </div>
        ) : null}
        <TrayportBlocks blocks={visibleBody} draft={draft} />
        {eventDetails?.hubspotFormId && !hasLayoutForm && !hideExpiredForms ? (
          <div className="trayport-container trayport-container--reading">
            <HubSpotFormMount formId={eventDetails.hubspotFormId} title={eventDetails.formTitle} />
          </div>
        ) : null}
      </div>
    </main>
  )
}
