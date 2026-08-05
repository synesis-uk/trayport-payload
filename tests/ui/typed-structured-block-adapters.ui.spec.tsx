import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  DataTableComponentAdapter,
  EntityListComponentAdapter,
  GalleryComponentAdapter,
  TimelineComponentAdapter,
} from '@/components/blocks/adapters'
import type {
  DataTableComponent,
  EntityListComponent,
  GalleryComponent,
  TimelineComponent,
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
    media,
    showFallbackLink,
  }: {
    className?: string
    media?: unknown
    showFallbackLink?: boolean
  }) => (
    <span
      className={className}
      data-fallback-link={String(showFallbackLink !== false)}
      data-media={String(media)}
      data-testid="trayport-media"
    />
  ),
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

const entityListBlock = {
  blockType: 'entityList',
  items: [
    {
      description: lexicalBody,
      link: { type: 'custom', url: '/products/joule/' },
      media: 51,
      title: 'Joule',
    },
    {
      link: { type: 'custom' },
      media: 52,
      title: 'Unlinked market',
    },
  ],
  kind: 'products',
} satisfies EntityListComponent

const timelineBlock = {
  blockType: 'timeline',
  items: [
    {
      body: lexicalBody,
      label: '1993',
      title: 'Trayport is founded',
    },
    {
      label: 'Today',
    },
  ],
} satisfies TimelineComponent

const dataTableBlock = {
  blockType: 'dataTable',
  caption: 'Connected power markets',
  headers: [{ text: 'Market' }, { text: 'Status' }, {}],
  rows: [
    { cells: [{ text: 'German Power' }, { text: 'Connected' }, {}, { text: 'Supplemental' }] },
    { cells: null },
  ],
} satisfies DataTableComponent

const headerlessDataTableBlock = {
  blockType: 'dataTable',
  caption: 'Joule gives you access to 8 global markets',
  headers: [],
  rows: [
    { cells: [{ text: 'Power' }, { text: 'Gas' }] },
    { cells: [{ text: 'Coal' }, { text: 'Emissions' }] },
    { cells: [{ text: 'Iron Ore' }, { text: 'Oil' }] },
    { cells: [{ text: 'Freight' }, { text: 'Voluntary Carbon' }] },
  ],
} satisfies DataTableComponent

const galleryBlock = {
  blockType: 'gallery',
  items: [{ caption: 'Trading screen', media: 53 }, { media: 54 }],
} satisfies GalleryComponent

describe('typed structured block adapters', () => {
  it('retains entity link wrappers, arrow glyphs, and link-sensitive media fallbacks', () => {
    render(<EntityListComponentAdapter block={entityListBlock} index={0} />)

    const entities = screen
      .getByRole('heading', { level: 3, name: 'Joule' })
      .closest('.trayport-entities')
    expect(entities?.className).toContain('trayport-entities--products')

    const linked = screen.getByRole('link', { name: /Joule/ })
    expect(linked.className).toContain('trayport-entity')
    expect(linked.querySelector('svg')?.getAttribute('data-icon')).toBe('arrow-right')
    expect(within(linked).getByTestId('trayport-media').dataset.fallbackLink).toBe('false')
    expect(within(linked).getByTestId('rich-text').className).toContain('trayport-richtext')

    const unlinked = screen.getByRole('heading', {
      level: 3,
      name: 'Unlinked market',
    }).parentElement
    expect(unlinked?.tagName).toBe('ARTICLE')
    expect(within(unlinked as HTMLElement).getByTestId('trayport-media').dataset.fallbackLink).toBe(
      'true',
    )
    expect(unlinked?.querySelector('svg')).toBeNull()
  })

  it('keeps timeline items ordered with optional titles and rich text', () => {
    render(<TimelineComponentAdapter block={timelineBlock} index={0} />)

    const timeline = document.querySelector('ol.trayport-timeline')
    expect(timeline).toBeTruthy()
    const items = timeline?.querySelectorAll(':scope > li') || []
    expect(items).toHaveLength(2)
    expect(items[0].querySelector(':scope > span')?.textContent).toBe('1993')
    expect(items[0].querySelector('h3')?.textContent).toBe('Trayport is founded')
    expect(items[0].querySelector('.trayport-richtext')).toBeTruthy()
    expect(items[1].querySelector(':scope > span')?.textContent).toBe('Today')
    expect(items[1].querySelector('h3')).toBeNull()
  })

  it('preserves the labelled native table and normalizes ragged rows without dropping cells', () => {
    render(<DataTableComponentAdapter block={dataTableBlock} index={0} />)

    const region = screen.getByRole('region', { name: dataTableBlock.caption })
    expect(region.className).toContain('trayport-table-wrap')
    expect(region.getAttribute('tabindex')).toBe('0')
    expect(within(region).getByRole('table', { name: dataTableBlock.caption })).toBeTruthy()
    const headers = within(region).getAllByRole('columnheader')
    expect(headers.map((header) => header.textContent)).toEqual([
      'Market',
      'Status',
      '',
      'Column 4',
    ])
    expect(headers[3].querySelector('.sr-only')).toBeTruthy()
    expect(
      within(region)
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    ).toEqual(['German Power', 'Connected', '', 'Supplemental', '', '', '', ''])
    expect(region.querySelectorAll('tbody > tr')).toHaveLength(2)
  })

  it('renders the accepted headerless Joule composition as a semantic list grid', () => {
    render(<DataTableComponentAdapter block={headerlessDataTableBlock} index={0} />)

    const region = screen.getByRole('region', { name: headerlessDataTableBlock.caption })
    expect(within(region).queryByRole('table')).toBeNull()
    expect(within(region).getByText(headerlessDataTableBlock.caption)).toBeTruthy()

    const list = within(region).getByRole('list')
    expect(list.className).toContain('trayport-data-grid')
    expect(list.style.getPropertyValue('--trayport-data-grid-columns')).toBe('2')
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual([
      'Power',
      'Gas',
      'Coal',
      'Emissions',
      'Iron Ore',
      'Oil',
      'Freight',
      'Voluntary Carbon',
    ])
  })

  it('keeps gallery figures unclassed with captions and default media fallback behavior', () => {
    render(<GalleryComponentAdapter block={galleryBlock} index={0} />)

    const gallery = document.querySelector('.trayport-gallery')
    expect(gallery).toBeTruthy()
    const figures = gallery?.querySelectorAll(':scope > figure') || []
    expect(figures).toHaveLength(2)
    expect(figures[0].getAttribute('class')).toBeNull()
    expect(within(figures[0] as HTMLElement).getByText('Trading screen').tagName).toBe('FIGCAPTION')
    expect(
      within(figures[0] as HTMLElement).getByTestId('trayport-media').dataset.fallbackLink,
    ).toBe('true')
    expect(figures[1].querySelector('figcaption')).toBeNull()
  })
})
