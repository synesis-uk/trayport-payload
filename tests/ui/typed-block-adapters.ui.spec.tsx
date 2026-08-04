import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TrayportHeroBlockAdapter } from '@/components/blocks/adapters'
import {
  normalizeActionsComponent,
  normalizeHeadingComponent,
  normalizeStatisticsComponent,
  normalizeTrayportHeroBlock,
} from '@/components/blocks/normalizers'
import {
  ActionsPresentation,
  HeadingPresentation,
  StatisticsPresentation,
} from '@/components/blocks/presentation'
import type {
  ActionsComponent,
  HeadingComponent,
  StatisticsComponent,
  TrayportHeroBlock,
} from '@/payload-types'

vi.mock('@/components/RichText', () => ({
  default: () => <div data-testid="hero-rich-text" />,
}))

vi.mock('@/components/Trayport/TrayportMedia', () => ({
  TrayportMedia: ({ preload }: { preload?: boolean }) => (
    <span data-preload={String(Boolean(preload))} data-testid="hero-media" />
  ),
}))

const headingBlock = {
  appearance: 'h1',
  blockType: 'heading',
  eyebrow: 'Market access',
  level: 'h3',
  text: 'One connection, many venues',
} satisfies HeadingComponent

const actionsBlock = {
  actions: [
    {
      label: 'Explore Joule',
      icon: 'chart',
      link: { type: 'custom', url: '/products/joule/' },
      style: 'primary',
    },
    {
      label: 'External venue',
      link: { newTab: true, type: 'custom', url: 'https://example.com/venue' },
      style: 'link',
    },
    {
      label: 'Request a demo',
      link: { type: 'custom', url: '/request-a-demo/' },
      style: 'info',
    },
    {
      label: 'Missing destination',
      link: { type: 'custom' },
      style: 'secondary',
    },
  ],
  blockType: 'actions',
} satisfies ActionsComponent

const statisticsBlock = {
  blockType: 'statistics',
  items: [
    {
      description: 'Connected through one network',
      label: 'Markets',
      value: '25+',
    },
  ],
} satisfies StatisticsComponent

const heroBlock = {
  appearance: 'image',
  badgeIcon: 'tradingScreen',
  badgeLabel: 'Trayport Joule',
  badgeTone: 'info',
  blockType: 'trayportHero',
  heading: 'Powering energy markets',
  media: 42,
  mediaAspect: 'twoToOne',
  statistics: [{ label: 'Years', value: '30+' }],
} satisfies TrayportHeroBlock

describe('typed Payload block adapters', () => {
  it('normalizes headings into the Payload-independent heading composition', () => {
    render(<HeadingPresentation model={normalizeHeadingComponent(headingBlock)} />)

    expect(screen.getByText('Market access').className).toContain('trayport-eyebrow')
    expect(screen.getByRole('heading', { level: 3, name: headingBlock.text })).toBeTruthy()
    expect(screen.getByRole('heading').closest('.trayport-heading')?.className).toContain(
      'trayport-heading--h1',
    )
  })

  it('trims and renders an imported preheader once when its eyebrow and heading text are identical', () => {
    const label = 'Traded Volumes for 2025'
    const preheader = {
      ...headingBlock,
      appearance: 'h4',
      eyebrow: `  ${label}\n`,
      level: 'h4',
      text: `\t${label}  `,
    } satisfies HeadingComponent
    const model = normalizeHeadingComponent(preheader)

    expect(model).toMatchObject({ eyebrow: label, eyebrowOnly: true, heading: label })
    render(<HeadingPresentation model={model} />)

    expect(screen.getAllByText(label)).toHaveLength(1)
    expect(screen.queryByRole('heading', { name: label })).toBeNull()
    expect(screen.getByText(label).className).toContain('trayport-eyebrow')
  })

  it('normalizes valid actions and preserves destination-specific icons', () => {
    const model = normalizeActionsComponent(actionsBlock)
    render(<ActionsPresentation model={model} />)

    expect(model.actions).toHaveLength(3)
    expect(screen.queryByText('Missing destination')).toBeNull()

    const internal = screen.getByRole('link', { name: 'Explore Joule' })
    expect(
      Array.from(internal.querySelectorAll('svg')).map((icon) => icon.getAttribute('data-icon')),
    ).toEqual(['chart-mixed', 'arrow-right'])

    const external = screen.getByRole('link', {
      name: 'External venue (opens in a new tab)',
    })
    expect(external.getAttribute('target')).toBe('_blank')
    expect(external.querySelector('svg')?.getAttribute('data-icon')).toBe('chevron-right')
    expect(screen.getByRole('link', { name: 'Request a demo' }).className).toContain(
      'trayport-action--info',
    )
  })

  it('keeps the legacy statistics hooks and description inside its value cell', () => {
    render(<StatisticsPresentation model={normalizeStatisticsComponent(statisticsBlock)} />)

    const list = screen.getByText('Markets').closest('dl')
    expect(list?.className).toContain('trayport-statistics')
    expect(list?.className).not.toContain('gap-5')
    expect(screen.getByText('Markets').parentElement?.className).not.toContain('border-l-2')

    const description = screen.getByText('Connected through one network')
    expect(description.className).toContain('trayport-statistics__description')
    expect(description.closest('dd')).toBeTruthy()
  })

  it('keeps hero statistics typed and prioritizes media only for the first layout block', () => {
    const normalized = normalizeTrayportHeroBlock(heroBlock)
    expect(normalized.statistics).toMatchObject([{ label: 'Years', value: '30+' }])
    expect(normalized.badge).toEqual({
      icon: 'tradingScreen',
      label: 'Trayport Joule',
      tone: 'info',
    })

    render(
      <div>
        <TrayportHeroBlockAdapter block={heroBlock} index={0} />
        <TrayportHeroBlockAdapter block={heroBlock} index={1} />
      </div>,
    )

    const heroes = screen.getAllByRole('heading', { level: 1, name: heroBlock.heading })
    expect(heroes).toHaveLength(2)
    expect(heroes[0].closest('section')?.className).toContain('trayport-hero--aspect-twoToOne')
    expect(
      heroes[0].closest('section')?.querySelector('.trayport-hero__inner')?.className,
    ).toContain('trayport-container--full')
    expect(within(heroes[0].closest('section')!).getByText('Trayport Joule')).toBeTruthy()
    expect(within(heroes[0].closest('section')!).getByTestId('hero-media').dataset.preload).toBe(
      'true',
    )
    expect(within(heroes[1].closest('section')!).getByTestId('hero-media').dataset.preload).toBe(
      'false',
    )
    expect(heroes[0].closest('section')?.hasAttribute('data-has-media')).toBe(true)
  })

  it('keeps dark and light heroes text-led even when retained records contain media', () => {
    const darkHero = { ...heroBlock, appearance: 'dark' as const }
    const lightHero = { ...heroBlock, appearance: 'light' as const }

    render(
      <div>
        <TrayportHeroBlockAdapter block={darkHero} index={0} />
        <TrayportHeroBlockAdapter block={lightHero} index={0} />
      </div>,
    )

    expect(screen.queryAllByTestId('hero-media')).toHaveLength(0)
    for (const hero of screen.getAllByRole('heading', { level: 1, name: heroBlock.heading })) {
      expect(hero.closest('section')?.hasAttribute('data-has-media')).toBe(false)
    }
  })
})
