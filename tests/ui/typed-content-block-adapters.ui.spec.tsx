import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  FAQComponentAdapter,
  FeatureListComponentAdapter,
  MediaComponentAdapter,
  RichTextComponentAdapter,
} from '@/components/blocks/adapters'
import { normalizeFeatureListComponent } from '@/components/blocks/normalizers'
import { EntityListPresentation, FeatureListPresentation } from '@/components/blocks/presentation'
import type {
  FAQComponent,
  FeatureListComponent,
  RichTextComponent,
  TrayportMediaComponent,
} from '@/payload-types'

vi.mock('@/components/RichText', () => ({
  default: ({ className }: { className?: string }) => (
    <div className={className} data-testid="rich-text">
      Rendered rich text
    </div>
  ),
}))

vi.mock('@/components/Trayport/TrayportMedia', () => ({
  TrayportMedia: ({
    className,
    externalURL,
    media,
    showFallbackLink,
  }: {
    className?: string
    externalURL?: string | null
    media?: unknown
    showFallbackLink?: boolean
  }) =>
    media || externalURL ? (
      <span
        className={className}
        data-external-url={externalURL || undefined}
        data-fallback-link={String(showFallbackLink !== false)}
        data-testid="trayport-media"
      />
    ) : null,
}))

const lexicalBody = {
  root: {
    children: [],
    direction: null,
    format: '' as const,
    indent: 0,
    type: 'root',
    version: 1,
  },
}

const richTextBlock = {
  blockType: 'richText',
  body: lexicalBody,
  size: 'large',
} satisfies RichTextComponent

const mediaBlock = {
  aspect: 'wide',
  blockType: 'media',
  caption: 'Trayport market connectivity',
  externalURL: 'https://cdn.example.com/connectivity.mp4',
  media: 42,
} satisfies TrayportMediaComponent

const featureListBlock = {
  blockType: 'featureList',
  items: [
    {
      actionIcon: 'arrowRight',
      actionStyle: 'link',
      body: lexicalBody,
      display: 'image',
      link: {
        label: 'Explore the venue',
        newTab: true,
        type: 'custom',
        url: 'https://example.com/venue',
      },
      media: 43,
      showAction: true,
      title: 'Connected venues',
    },
    {
      actionStyle: 'link',
      display: 'icon',
      icon: 'lightbulb',
      link: { label: 'Unavailable', type: 'custom' },
      showAction: false,
      title: 'No destination',
    },
  ],
  presentation: 'grid',
} satisfies FeatureListComponent

const faqBlock = {
  blockType: 'faq',
  items: [
    {
      answer: lexicalBody,
      media: 44,
      question: 'How do I connect?',
    },
    {
      answer: lexicalBody,
      question: 'Which markets are covered?',
    },
  ],
} satisfies FAQComponent

describe('typed content block adapters', () => {
  it('applies the rich-text size contract to the adapter-rendered lexical root', () => {
    render(<RichTextComponentAdapter block={richTextBlock} index={0} />)

    const body = screen.getByTestId('rich-text')
    expect(body.className).toContain('trayport-richtext')
    expect(body.className).toContain('trayport-richtext--lead')
  })

  it('preserves media aspect, caption, composition, and an empty-media figure', () => {
    const { rerender } = render(<MediaComponentAdapter block={mediaBlock} index={0} />)

    const figure = screen.getByText(mediaBlock.caption).closest('figure')
    expect(figure?.className).toContain('trayport-media--wide')
    expect(figure?.dataset.slot).toBe('media-block')
    expect(screen.getByTestId('trayport-media').dataset.externalUrl).toBe(mediaBlock.externalURL)

    rerender(<MediaComponentAdapter block={{ blockType: 'media', aspect: 'natural' }} index={0} />)

    expect(screen.queryByText('Media is not available')).toBeNull()
    expect(document.querySelector('figure.trayport-media--natural')).toBeTruthy()
  })

  it('keeps bounded feature displays, media hooks, and explicitly enabled actions', () => {
    const normalized = normalizeFeatureListComponent(featureListBlock)
    expect(normalized.items[1].action).toBeUndefined()

    render(<FeatureListComponentAdapter block={featureListBlock} index={0} />)

    const list = screen
      .getByRole('heading', { level: 3, name: 'Connected venues' })
      .closest('.trayport-features')
    expect(list?.className).toContain('trayport-features--grid')

    const cards = document.querySelectorAll('article.trayport-feature')
    expect(cards).toHaveLength(2)
    expect(within(cards[0] as HTMLElement).getByTestId('trayport-media').className).toContain(
      'trayport-feature__media',
    )
    expect(cards[1].querySelector('.trayport-feature__icon svg')?.getAttribute('data-icon')).toBe(
      'lightbulb',
    )

    const link = screen.getByRole('link', {
      name: 'Explore the venue (opens in a new tab)',
    })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.querySelector('svg')?.getAttribute('data-icon')).toBe('arrow-right')
    expect(screen.queryByRole('link', { name: 'Unavailable' })).toBeNull()
  })

  it('always names overlay feature links, preferring the title with an action-label fallback', () => {
    render(
      <FeatureListPresentation
        model={{
          items: [
            {
              action: {
                appearance: 'link',
                label: 'Open titled card',
                link: { type: 'custom', url: '/titled/' },
              },
              display: 'image',
              key: 'titled',
              media: <span aria-hidden />,
              title: 'Titled card',
            },
            {
              action: {
                appearance: 'link',
                label: 'Open untitled card',
                link: { type: 'custom', url: '/untitled/' },
              },
              display: 'image',
              key: 'untitled',
              media: <span aria-hidden />,
            },
          ],
          presentation: 'grid',
        }}
      />,
    )

    expect(screen.getByRole('link', { name: 'Titled card' }).getAttribute('href')).toBe('/titled')
    expect(screen.getByRole('link', { name: 'Open untitled card' }).getAttribute('href')).toBe(
      '/untitled',
    )
  })

  it('retains native FAQ disclosure semantics and suppresses media fallback links', () => {
    render(<FAQComponentAdapter block={faqBlock} index={0} />)

    const firstSummary = screen.getByText('How do I connect?').closest('summary') as HTMLElement
    expect(firstSummary.tagName).toBe('SUMMARY')
    expect(firstSummary.querySelector('[data-icon="plus"]')).not.toBeNull()
    expect(firstSummary.querySelector('[data-icon="minus"]')).not.toBeNull()
    expect(
      Array.from(firstSummary.children).filter(
        (child) => child.matches('.trayport-faq__toggle') && child.getAttribute('aria-hidden'),
      ),
    ).toHaveLength(1)
    const firstAnswer = firstSummary.closest('details')?.querySelector('.trayport-faq__answer')
    expect(firstAnswer?.className).toContain('trayport-faq__answer--media')
    expect(
      within(firstAnswer as HTMLElement).getByTestId('trayport-media').dataset.fallbackLink,
    ).toBe('false')

    const secondAnswer = screen
      .getByText('Which markets are covered?')
      .closest('details')
      ?.querySelector('.trayport-faq__answer')
    expect(secondAnswer?.className).not.toContain('trayport-faq__answer--media')
    expect(screen.getAllByTestId('rich-text')).toHaveLength(2)
  })

  it('keeps client names accessible without duplicating logo labels visually', () => {
    render(
      <EntityListPresentation
        model={{
          items: [
            {
              key: 'client-1',
              link: { type: 'custom', url: '/clients/example/' },
              media: <span aria-hidden data-testid="client-logo" />,
              title: 'Example Energy',
            },
          ],
          kind: 'clients',
        }}
      />,
    )

    const title = screen.getByRole('heading', { level: 3, name: 'Example Energy' })
    expect(title.className).toContain('sr-only')
    expect(screen.getByRole('link', { name: 'Example Energy' }).querySelector('svg')).toBeNull()
    expect(screen.getByTestId('client-logo')).toBeTruthy()
  })
})
