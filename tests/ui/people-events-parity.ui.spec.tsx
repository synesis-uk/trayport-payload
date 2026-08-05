import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ArticleView, eventHasFinished } from '@/components/content/PageArticleViews'
import { PersonView } from '@/components/content/PersonView'
import type { ArticleRouteDocument, PersonRouteDocument } from '@/data/contentRouteProjection'

vi.mock('@/components/blocks', () => ({
  TrayportBlocks: ({ blocks }: { blocks?: Array<Record<string, unknown>> }) => (
    <div data-testid="rendered-blocks">
      {(blocks || []).flatMap((block) => {
        if (block.blockType !== 'contentSection' || !Array.isArray(block.columns)) return []
        return block.columns.flatMap((column: { components?: Array<Record<string, unknown>> }) =>
          (column.components || []).flatMap((component) =>
            component.blockType === 'hubspotForm' ? (
              <section
                data-hubspot-form-id={String(component.formId)}
                key={String(component.formId)}
              >
                {String(component.title)}
              </section>
            ) : (
              []
            ),
          ),
        )
      })}
    </div>
  ),
}))

vi.mock('@/components/RichText', () => ({
  default: () => <div data-testid="rich-text" />,
}))

vi.mock('@/components/Trayport/TrayportMedia', () => ({
  TrayportMedia: ({ unoptimized }: { unoptimized?: boolean }) => (
    <span data-testid="trayport-media" data-unoptimized={String(Boolean(unoptimized))} />
  ),
}))

vi.mock('@/components/icons', () => ({
  AppIcon: () => <span aria-hidden />,
}))

const formID = '8c3a5fef-87b8-43c2-9662-fb663f0f3e9f'

const eventDocument = (
  endsAt: string,
  { legacyLifecycle = false }: { legacyLifecycle?: boolean } = {},
): ArticleRouteDocument =>
  ({
    articleType: 'event',
    byline: null,
    categories: [],
    displayDate: '2099-02-10T00:00:00.000Z',
    eventDetails: {
      city: 'Essen',
      country: 'Germany',
      endsAt,
      formTitle: 'Request a meeting',
      ...(legacyLifecycle ? { hideFormsAfterEnd: true, showFinishedNotice: true } : {}),
      hubspotFormId: formID,
      startsAt: '2099-02-10T00:00:00.000Z',
    },
    excerpt: 'Meet Trayport at E-world.',
    heroMedia: null,
    id: 10030,
    layout: [
      {
        blockType: 'contentSection',
        columns: [
          {
            components: [
              {
                blockType: 'hubspotForm',
                formId: formID,
                title: 'Request a meeting',
              },
            ],
            span: '12',
          },
        ],
        width: 'reading',
        wrapperTheme: 'none',
      },
    ],
    location: 'Essen',
    meta: {},
    path: '/event/e-world-2099/',
    publishedAt: '2098-12-01T00:00:00.000Z',
    title: 'E-world 2099',
  }) as ArticleRouteDocument

describe('People and Event public views', () => {
  it('renders a sparse Person in a one-column no-portrait layout without invented fields', () => {
    const document = {
      id: 11233,
      path: '/people/nicole-rosenberg/',
      quote: { root: { children: [] } },
      team: 'ceo',
      title: 'Nicole Rosenberg',
    } as unknown as PersonRouteDocument
    const { container } = render(<PersonView document={document} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Nicole Rosenberg' })).toBeTruthy()
    expect(container.querySelector('.trayport-person--no-portrait')).toBeTruthy()
    expect(screen.queryByTestId('trayport-media')).toBeNull()
    expect(container.querySelector('.trayport-person__role')).toBeNull()
    expect(screen.getByTestId('rich-text')).toBeTruthy()
  })

  it('keeps responsive image optimization enabled when a Person has a portrait', () => {
    render(
      <PersonView
        document={
          {
            id: 2561,
            image: { id: 7001 },
            jobRole: 'Chief Executive Officer',
            path: '/people/peter-conroy/',
            team: 'ceo',
            title: 'Peter Conroy',
          } as PersonRouteDocument
        }
      />,
    )

    expect(screen.getByTestId('trayport-media').getAttribute('data-unoptimized')).toBe('false')
  })

  it('renders one owned HubSpot mount for a current event even when structured fields mirror it', () => {
    const { container } = render(
      <ArticleView document={eventDocument('2099-02-12T00:00:00.000Z')} />,
    )

    expect(container.querySelectorAll(`[data-hubspot-form-id="${formID}"]`)).toHaveLength(1)
    expect(screen.queryByText('This event has now finished.')).toBeNull()
  })

  it('shows the finished notice before body content and suppresses every stale form mount', () => {
    const { container } = render(
      <ArticleView
        document={eventDocument('2025-02-12T00:00:00.000Z', { legacyLifecycle: true })}
      />,
    )

    expect(screen.getByText('This event has now finished.')).toBeTruthy()
    expect(container.querySelectorAll('[data-hubspot-form-id]')).toHaveLength(0)
    const notice = container.querySelector('.trayport-event-finished')
    const blocks = screen.getByTestId('rendered-blocks')
    expect(notice).not.toBeNull()
    expect(notice!.compareDocumentPosition(blocks) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('retains authored forms on expired core Event articles without legacy lifecycle flags', () => {
    const { container } = render(
      <ArticleView document={eventDocument('2025-02-12T00:00:00.000Z')} />,
    )

    expect(screen.queryByText('This event has now finished.')).toBeNull()
    expect(container.querySelectorAll(`[data-hubspot-form-id="${formID}"]`)).toHaveLength(1)
  })

  it('does not mark an event finished until the day after its end date', () => {
    expect(eventHasFinished('2026-08-05T00:00:00.000Z', new Date('2026-08-05T23:59:59Z'))).toBe(
      false,
    )
    expect(eventHasFinished('2026-08-05T00:00:00.000Z', new Date('2026-08-06T00:00:00Z'))).toBe(
      true,
    )
  })
})
