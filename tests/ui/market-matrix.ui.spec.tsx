import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import {
  MarketMatrixPresentation,
  marketMatrixCSVCell,
} from '@/components/blocks/MarketMatrixPresentation.client'
import { normalizeMarketMatrixComponent } from '@/components/blocks/marketMatrixModel'
import type { MarketMatrixIndex } from '@/data/marketMatrix'
import type { MarketMatrixComponent } from '@/payload-types'

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
})

const block = {
  blockType: 'marketMatrix',
  caption: 'Managed venue connectivity',
  defaultView: 'joule',
  showDownload: true,
  showFilters: true,
} satisfies MarketMatrixComponent

const index: MarketMatrixIndex = {
  assetClasses: [
    { displayOrder: 1, id: 'power', title: 'Power' },
    { displayOrder: 2, id: 'gas', title: 'Gas' },
  ],
  hubs: [
    {
      assetClassIDs: ['power'],
      destination: '/market-coverage/german-power/',
      id: 'de-power',
      regionIDs: ['europe'],
      title: 'German Power',
    },
    {
      assetClassIDs: ['power'],
      destination: null,
      id: 'fr-power',
      regionIDs: ['europe'],
      title: 'French Power',
    },
    {
      assetClassIDs: ['gas'],
      destination: null,
      id: 'ttf',
      regionIDs: ['europe'],
      title: 'TTF',
    },
  ],
  venueTypes: [
    { displayOrder: 1, id: 'exchange', title: 'Exchange' },
    { displayOrder: 2, id: 'broker', title: 'Broker' },
  ],
  venues: [
    {
      connections: { 'de-power': 'b', ttf: 'd' },
      destination: '/venue/eex/',
      displayOrder: 1,
      id: 'eex',
      title: 'EEX',
      venueType: { displayOrder: 1, id: 'exchange', title: 'Exchange' },
    },
    {
      connections: { 'fr-power': 'a' },
      destination: null,
      displayOrder: 2,
      id: 'broker-one',
      title: 'Broker One',
      venueType: { displayOrder: 2, id: 'broker', title: 'Broker' },
    },
  ],
}

describe('typed market-matrix component', () => {
  it('neutralizes spreadsheet formula prefixes in exported cells', () => {
    expect(marketMatrixCSVCell('=HYPERLINK("https://example.com")')).toBe(
      '"\'=HYPERLINK(""https://example.com"")"',
    )
    expect(marketMatrixCSVCell('  +1+1')).toBe('"\'  +1+1"')
    expect(marketMatrixCSVCell('German Power')).toBe('"German Power"')
  })

  it('filters the managed projection using bounded CMS relationships', () => {
    const model = normalizeMarketMatrixComponent(
      { ...block, assetClasses: [1], regions: [9], venueTypes: [2] },
      {
        ...index,
        assetClasses: index.assetClasses.map((item, position) => ({
          ...item,
          id: String(position + 1),
        })),
        hubs: index.hubs.map((hub) => ({
          ...hub,
          assetClassIDs: hub.assetClassIDs.map((value) => (value === 'power' ? '1' : '2')),
          regionIDs: ['9'],
        })),
        venueTypes: index.venueTypes.map((item, position) => ({
          ...item,
          id: String(position + 1),
        })),
        venues: index.venues.map((venue, position) => ({
          ...venue,
          venueType: {
            ...venue.venueType,
            id: String(position + 1),
          },
        })),
      },
    )

    expect(model.groups.map(({ title }) => title)).toEqual(['Power'])
    expect(model.venues.map(({ title }) => title)).toEqual(['Broker One'])
  })

  it('renders a labelled scroll table, row groups, links, and connection alternatives', () => {
    render(
      <MarketMatrixPresentation
        downloadIcon={<svg aria-hidden />}
        model={normalizeMarketMatrixComponent(block, index)}
      />,
    )

    expect(screen.getByRole('region', { name: 'Managed venue connectivity table' })).toBeTruthy()
    expect(screen.getByRole('table', { name: 'Managed venue connectivity' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Connectivity' }).textContent).toContain('Joule')
    expect(screen.getByText('Showing 1 venue across 3 market hubs.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'German Power' }).getAttribute('href')).toMatch(
      /^\/market-coverage\/german-power\/?$/,
    )
    expect(screen.getByRole('link', { name: 'EEX' }).getAttribute('href')).toMatch(
      /^\/venue\/eex\/?$/,
    )
    expect(screen.getByText('Exchange (1)').closest('tbody')?.getAttribute('aria-labelledby')).toBe(
      screen.getByText('Exchange (1)').getAttribute('id'),
    )
    expect(
      screen.getByText('Joule connection to German Power').closest('td')?.dataset.connection,
    ).toBe('b')
    expect(document.querySelectorAll('td:not([data-connection])')).toHaveLength(1)
    expect(document.querySelector('td:not([data-connection])')?.textContent).toBe('')
    expect(screen.getByRole('button', { name: 'Download CSV' }).querySelector('svg')).toBeTruthy()
  })

  it('switches d/a/b semantics and applies visitor filters without losing table structure', async () => {
    render(
      <MarketMatrixPresentation
        downloadIcon={<svg aria-hidden />}
        model={normalizeMarketMatrixComponent(block, index)}
      />,
    )

    const trigger = screen.getByRole('combobox', { name: 'Connectivity' })
    fireEvent.keyDown(trigger, { code: 'ArrowDown', key: 'ArrowDown' })
    const listbox = await screen.findByRole('listbox')
    fireEvent.click(within(listbox).getByRole('option', { name: 'Joule and autoTRADER' }))

    await waitFor(() => {
      expect(screen.getByText('Showing 2 venues across 3 market hubs.')).toBeTruthy()
    })
    expect(screen.getByText('Joule and autoTRADER connection to German Power')).toBeTruthy()
    expect(screen.getByText('autoTRADER connection to French Power')).toBeTruthy()

    fireEvent.click(screen.getByText('Filter matrix'))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Gas' }))
    expect(screen.queryByRole('columnheader', { name: 'Gas' })).toBeNull()
    expect(screen.getByText('Showing 2 venues across 2 market hubs.')).toBeTruthy()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Exchange' }))
    expect(screen.getByText('Showing 1 venue across 2 market hubs.')).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'EEX' })).toBeNull()
    expect(screen.getByRole('table', { name: 'Managed venue connectivity' })).toBeTruthy()
  })

  it('renders a safe empty state when the bounded projection has no connected venues', () => {
    render(
      <MarketMatrixPresentation
        downloadIcon={<svg aria-hidden />}
        model={normalizeMarketMatrixComponent(block, { ...index, venues: [] })}
      />,
    )

    expect(screen.getByRole('status').textContent).toMatch(/No managed venue connections/)
    expect(screen.queryByRole('table')).toBeNull()
    expect(
      (screen.getByRole('button', { name: 'Download CSV' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })

  it('uses stable occurrence identities when one hub belongs to multiple asset classes', () => {
    const sharedHubIndex = {
      ...index,
      hubs: index.hubs.map((hub) =>
        hub.id === 'de-power' ? { ...hub, assetClassIDs: ['power', 'gas'] } : hub,
      ),
    }
    render(
      <MarketMatrixPresentation
        downloadIcon={<svg aria-hidden />}
        model={normalizeMarketMatrixComponent(block, sharedHubIndex)}
      />,
    )

    const occurrences = Array.from(
      document.querySelectorAll('[data-hub-occurrence$=":de-power"]'),
      (cell) => cell.getAttribute('data-hub-occurrence'),
    )
    expect(occurrences).toEqual(['power:de-power', 'gas:de-power'])
  })
})
