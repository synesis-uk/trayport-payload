import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ContentSectionBlockAdapter } from '@/components/blocks/layoutAdapters'
import {
  normalizeArticleListingBlock,
  normalizeLearningVideoListingBlock,
} from '@/components/blocks/layoutNormalizers'
import {
  ArticleListingPresentation,
  LearningVideoListingPresentation,
} from '@/components/blocks/layoutPresentation'
import type {
  ArticleListingBlock,
  ContentSectionBlock,
  LearningVideoListingBlock,
} from '@/payload-types'

vi.mock('@/components/Trayport/TrayportMedia', () => ({
  TrayportMedia: ({
    background,
    composition,
    media,
    showFallbackLink,
  }: {
    background?: boolean
    composition?: string
    media?: unknown
    showFallbackLink?: boolean
  }) => (
    <span
      data-background={String(Boolean(background))}
      data-composition={composition}
      data-fallback-link={String(showFallbackLink !== false)}
      data-media={String(media)}
      data-testid="section-background-media"
    />
  ),
}))

const contentSectionBlock = {
  anchor: 'market-access',
  backgroundMedia: 72,
  backgroundOpacity: '20',
  blockType: 'contentSection',
  columnGap: 'tight',
  columns: [
    {
      backgroundMedia: 84,
      backgroundOpacity: '10',
      border: 'subtle',
      componentGap: 'none',
      components: [
        { appearance: 'h1', blockType: 'heading', level: 'h2', text: 'Market access' },
        { blockType: 'divider', style: 'line' },
      ],
      heightMode: 'content',
      horizontalAlign: 'center',
      id: 'primary-column',
      padding: 'medium',
      radius: 'xl',
      span: '8',
      surface: 'muted',
      verticalAlign: 'center',
    },
    {
      components: [
        { appearance: 'h3', blockType: 'heading', level: 'h3', text: 'Connected venues' },
      ],
      span: '4',
    },
  ],
  spacingBottom: 'large',
  spacingTop: 'tight',
  surfacePadding: 'medium',
  surfaceRadius: 'xl',
  surfaceTone: 'dark',
  width: 'standard',
  wrapperTheme: 'green',
} satisfies ContentSectionBlock

const articleListingBlock = {
  blockType: 'articleListing',
  family: 'insights',
  heading: 'Latest analysis',
  pageSize: 12,
} satisfies ArticleListingBlock

const learningListingBlock = {
  blockType: 'learningVideoListing',
  pageSize: 15,
} satisfies LearningVideoListingBlock

describe('typed layout block adapters', () => {
  it('preserves section themes, managed backgrounds, column spans, and nested order', () => {
    render(
      <ContentSectionBlockAdapter
        block={contentSectionBlock}
        index={0}
        renderComponent={(component, index) => (
          <span data-index={index} data-testid="nested-component" key={index}>
            {component.blockType}
          </span>
        )}
      />,
    )

    const section = document.querySelector('section#market-access') as HTMLElement
    expect(section.className).toBe(
      'trayport-section trayport-section--space-top-tight trayport-section--space-bottom-large trayport-section--wrapper-green trayport-section--has-heading trayport-section--has-divider',
    )
    expect(section.querySelector('.trayport-container')?.className).toContain(
      'trayport-container--standard',
    )

    const surface = section.querySelector('.trayport-section__surface') as HTMLElement
    expect(surface.className).toContain('trayport-section__surface--tone-dark')
    expect(surface.className).toContain('trayport-section__surface--radius-xl')
    expect(surface.className).toContain('trayport-section__surface--padding-medium')

    const background = surface.querySelector('.trayport-section__background') as HTMLElement
    expect(background.getAttribute('aria-hidden')).toBe('true')
    expect(background.dataset.opacity).toBe('20')
    expect(within(background).getByTestId('section-background-media').dataset).toMatchObject({
      background: 'true',
      fallbackLink: 'false',
      media: '72',
    })

    const columns = section.querySelectorAll('.trayport-column')
    expect(columns).toHaveLength(2)
    expect((columns[0] as HTMLElement).style.getPropertyValue('--trayport-span')).toBe('8')
    expect((columns[1] as HTMLElement).style.getPropertyValue('--trayport-span')).toBe('4')
    expect(columns[0]?.className).toContain('trayport-column--align-center')
    expect(columns[0]?.className).toContain('trayport-column--valign-center')
    expect(columns[0]?.className).toContain('trayport-column--height-content')
    expect(columns[0]?.className).toContain('trayport-column--gap-none')
    expect(columns[0]?.className).toContain('trayport-column--padding-medium')
    expect(columns[0]?.className).toContain('trayport-column--surface-muted')
    expect(columns[0]?.className).toContain('trayport-column--border-subtle')
    expect(columns[0]?.className).toContain('trayport-column--radius-xl')
    expect(columns[0]?.className).toContain('trayport-column--has-heading')
    expect(columns[0]?.className).toContain('trayport-column--has-divider')
    expect(
      (columns[0] as HTMLElement)
        .querySelector('.trayport-column__background')
        ?.getAttribute('data-opacity'),
    ).toBe('10')
    expect(
      within(columns[0] as HTMLElement).getByTestId('section-background-media').dataset,
    ).toMatchObject({
      background: 'true',
      composition: 'content',
      fallbackLink: 'false',
      media: '84',
    })
    expect(
      within(columns[0] as HTMLElement)
        .getAllByTestId('nested-component')
        .map((item) => item.textContent),
    ).toEqual(['heading', 'divider'])
    expect(screen.getAllByTestId('nested-component')).toHaveLength(3)
  })

  it('keeps both listing shells and their bounded fallback copy presentation-only', () => {
    const { rerender } = render(
      <ArticleListingPresentation
        model={normalizeArticleListingBlock(articleListingBlock, {
          intro: <p>Editorial introduction</p>,
          listing: <div data-testid="article-listing-client" />,
        })}
      />,
    )

    const articleSection = screen
      .getByRole('heading', { name: 'Latest analysis' })
      .closest('section')
    expect(articleSection?.className).toBe(
      'trayport-listing trayport-section trayport-section--light',
    )
    expect(within(articleSection as HTMLElement).getByText('Resources').className).toBe(
      'trayport-eyebrow',
    )
    expect(within(articleSection as HTMLElement).getByText('Editorial introduction')).toBeTruthy()
    expect(within(articleSection as HTMLElement).getByTestId('article-listing-client')).toBeTruthy()

    rerender(
      <LearningVideoListingPresentation
        model={normalizeLearningVideoListingBlock(learningListingBlock, {
          listing: <div data-testid="learning-listing-client" />,
        })}
      />,
    )

    const learningSection = screen
      .getByRole('heading', { name: 'Explore the Learning Hub' })
      .closest('section')
    expect(learningSection?.className).toContain('trayport-learning-listing')
    expect(within(learningSection as HTMLElement).getByText('Learning Hub')).toBeTruthy()
    expect(
      within(learningSection as HTMLElement).getByTestId('learning-listing-client'),
    ).toBeTruthy()
  })
})
