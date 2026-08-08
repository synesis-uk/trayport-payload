import 'server-only'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import RichText from '@/components/RichText'
import { AppIcon } from '@/components/icons'
import { FeatureCarousel } from '@/components/site/FeatureCarousel.client'
import { AppLink } from '@/components/site/AppLink'
import { TrayportMedia } from '@/components/Trayport/TrayportMedia'
import type { Person } from '@/payload-types'
import type { ContentLink } from '@/routing/contentLink'
import { safeExternalHTTPSURL } from '@/routing/urlPolicy'

import type { TrayportDraftAwareSectionComponentAdapterProps } from './types'

type PeopleListPerson = Pick<Person, 'id' | 'path' | 'team' | 'title'> &
  Partial<
    Pick<
      Person,
      'displayOrder' | 'externalProfileURL' | 'image' | 'jobRole' | 'quote'
    >
  >

const personSelect = {
  displayOrder: true,
  externalProfileURL: true,
  image: true,
  jobRole: true,
  path: true,
  publishedAt: true,
  quote: true,
  team: true,
  title: true,
} as const

const populatedPeople = (values: Array<number | Person> | null | undefined): PeopleListPerson[] =>
  (values || []).filter((value): value is Person => Boolean(value) && typeof value === 'object')

const personLink = (person: PeopleListPerson): ContentLink => {
  const externalURL = safeExternalHTTPSURL(person.externalProfileURL)

  return externalURL
    ? { label: person.title, newTab: true, type: 'custom', url: externalURL }
    : { label: person.title, type: 'custom', url: person.path }
}

export const PeopleListCard = ({
  person,
  presentation,
}: {
  person: PeopleListPerson
  presentation: 'careersCarousel' | 'leadershipGrid'
}) => {
  const careers = presentation === 'careersCarousel'
  const link = personLink(person)

  return (
    <article
      className={`trayport-people-card trayport-people-card--${careers ? 'careers' : 'leadership'}`}
    >
      {person.image ? (
        <div className="trayport-people-card__portrait">
          <TrayportMedia
            className="trayport-media trayport-media--portrait"
            composition="content"
            media={person.image}
            showFallbackLink={false}
          />
        </div>
      ) : null}
      <div className="trayport-people-card__content">
        <h3>
          <AppLink link={link}>{person.title}</AppLink>
        </h3>
        {person.jobRole ? <p className="trayport-people-card__role">{person.jobRole}</p> : null}
        {person.quote ? (
          <blockquote className="trayport-people-card__quote">
            <RichText
              data={person.quote as DefaultTypedEditorState}
              enableGutter={false}
              enableProse={false}
            />
          </blockquote>
        ) : null}
        <AppLink className="trayport-people-card__link" link={link}>
          Read profile <AppIcon aria-hidden name={link.newTab ? 'externalLink' : 'arrowRight'} />
        </AppLink>
      </div>
    </article>
  )
}

const loadTeamPeople = async ({
  draft,
  team,
}: {
  draft: boolean
  team: Person['team']
}): Promise<PeopleListPerson[]> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'people',
    depth: 1,
    draft,
    overrideAccess: draft,
    pagination: false,
    select: personSelect,
    sort: ['displayOrder', '-publishedAt'],
    where: draft
      ? { team: { equals: team } }
      : {
          and: [{ _status: { equals: 'published' } }, { team: { equals: team } }],
        },
  })

  return result.docs
}

export const PeopleListComponentAdapter = async ({
  block,
  draft = false,
}: TrayportDraftAwareSectionComponentAdapterProps<'peopleList'>) => {
  const storedPeople = populatedPeople(block.people)
  const people =
    block.selectionMode === 'team' && block.team
      ? await loadTeamPeople({ draft, team: block.team })
      : storedPeople
  const presentation = block.presentation || 'leadershipGrid'
  const careersPresentation = presentation === 'careersCarousel'
  const cards = people.map((person) => (
    <PeopleListCard key={person.id} person={person} presentation={presentation} />
  ))

  if (!cards.length) return null

  // Both presentations are carousels, matching the reference, which renders the leadership list
  // as a single row of slides. The previous leadership grid reflowed nine cards onto three rows
  // and equalised each row to its tallest card, which is what made the section 3,337px against
  // the reference's 756px — and 7,983px at 390px, where it collapsed to one column.
  return (
    <FeatureCarousel
      className={`trayport-people-list trayport-people-list--${careersPresentation ? 'careers' : 'leadership'}`}
      items={cards}
      label="Trayport people"
      nextIcon={<AppIcon aria-hidden name="chevronRight" />}
      previousIcon={<AppIcon aria-hidden name="chevronLeft" />}
    />
  )
}
