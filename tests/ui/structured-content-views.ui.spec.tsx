import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { HubView } from '@/components/content/HubView'
import { VenueView } from '@/components/content/VenueView'
import type { Hub, Venue } from '@/payload-types'

vi.mock('@/components/blocks', () => ({
  TrayportBlocks: () => null,
}))

vi.mock('@/components/RichText', () => ({
  default: () => <div data-testid="rich-text" />,
}))

vi.mock('@/components/Trayport/TrayportMedia', () => ({
  TrayportMedia: ({
    media,
    unoptimized,
  }: {
    media?: { id?: number } | number | null
    unoptimized?: boolean
  }) => (
    <span
      data-media={typeof media === 'object' ? media?.id : media}
      data-testid="trayport-media"
      data-unoptimized={String(Boolean(unoptimized))}
    />
  ),
}))

const timestamps = {
  createdAt: '2026-08-04T00:00:00.000Z',
  updatedAt: '2026-08-04T00:00:00.000Z',
}

const venueType = (id: number, title: string, displayOrder: number) =>
  ({ id, title, displayOrder, slug: title.toLowerCase(), ...timestamps }) as const

const assetClass = (id: number, title: string, displayOrder: number) =>
  ({ id, title, displayOrder, slug: title.toLowerCase(), ...timestamps }) as const

const connectedVenue = ({
  id,
  title,
  type,
  website,
}: {
  id: number
  title: string
  type: ReturnType<typeof venueType>
  website?: string
}) =>
  ({
    id,
    title,
    slug: title.toLowerCase().replaceAll(' ', '-'),
    contentMode: 'relationship-only',
    venueTypes: [type],
    website,
    ...timestamps,
  }) as unknown as Venue

describe('structured golden-route views', () => {
  it('renders German Power as one source-ordered four-column list per product', () => {
    const brokers = venueType(41, 'Broker', 1)
    const exchanges = venueType(42, 'Exchange', 2)
    const clearingHouses = venueType(43, 'Clearing House', 3)
    const document = {
      id: 2495,
      title: 'German Power',
      slug: 'german-power',
      path: '/market-coverage/german-power/',
      contentMode: 'page',
      code: 'DEU',
      assetClasses: [assetClass(21, 'Power', 1)],
      regions: [{ id: 29, title: 'Europe', displayOrder: 1, slug: 'europe', ...timestamps }],
      heroMedia: { id: 9727, mimeType: 'image/jpeg', ...timestamps },
      layout: [],
      connections: [
        {
          venue: connectedVenue({
            id: 1394,
            title: '42 Financial',
            type: brokers,
            website: 'https://42.example/',
          }),
          connectionType: 'b',
          supportsJoule: true,
          supportsAutoTrader: true,
        },
        {
          venue: connectedVenue({ id: 3363, title: 'EEX', type: exchanges }),
          connectionType: 'b',
          supportsJoule: true,
          supportsAutoTrader: true,
        },
        {
          venue: connectedVenue({ id: 3374, title: 'ECC', type: clearingHouses }),
          connectionType: 'd',
          supportsJoule: true,
          supportsAutoTrader: false,
        },
      ],
      ...timestamps,
    } as unknown as Hub

    const { container } = render(<HubView document={document} />)

    expect(
      container.querySelector('.trayport-structured-hub__header')?.getAttribute('data-media'),
    ).toBe('bridge')
    expect(container.querySelector('.trayport-structured-hub__classification')?.textContent).toBe(
      'Power',
    )
    expect(
      container
        .querySelector('.trayport-structured-hub__classification svg')
        ?.getAttribute('data-icon'),
    ).toBe('lightbulb-cfl')
    expect(container.querySelector('.trayport-structured-hub__heading')?.textContent).toBe(
      'Connected Venues',
    )
    const joule = screen.getByRole('heading', { level: 3, name: 'Joule' }).closest('section')
    expect(joule).toBeTruthy()
    expect(within(joule!).getByRole('heading', { level: 4, name: 'Brokers' })).toBeTruthy()
    expect(within(joule!).getByRole('heading', { level: 4, name: 'Exchanges' })).toBeTruthy()
    expect(within(joule!).getByRole('heading', { level: 4, name: 'Clearing Houses' })).toBeTruthy()
    expect(
      [...joule!.querySelectorAll('li:not(.trayport-venue-list__group-heading)')].map((item) =>
        item.textContent?.replace(' (opens in a new tab)', ''),
      ),
    ).toEqual(['42 Financial', 'EEX', 'ECC'])
    expect(joule!.querySelectorAll('.trayport-venue-list')).toHaveLength(1)
    expect(joule!.querySelector('.trayport-venue-list svg')).toBeNull()
    expect(
      within(joule!)
        .getByRole('link', { name: /42 Financial.*opens in a new tab/ })
        .getAttribute('target'),
    ).toBe('_blank')

    const recovered = render(
      <HubView
        document={
          {
            ...document,
            heroMedia: {
              id: 9727,
              filename: 'AdobeStock_525262198-scaled.jpeg',
              legacySource: { legacyId: 9727, source: 'wordpress' },
              mimeType: 'image/jpeg',
              url: '/api/media/file/AdobeStock_525262198-scaled.jpeg',
              ...timestamps,
            },
          } as unknown as Hub
        }
      />,
    )
    expect(
      recovered.container
        .querySelector('.trayport-structured-hub__header')
        ?.getAttribute('data-media'),
    ).toBe('image')
    expect(recovered.container.querySelector('[data-testid="trayport-media"]')).toBeTruthy()
  })

  it('renders authored venue copy and orders each market group by hub title', () => {
    const power = assetClass(21, 'Power', 1)
    const gas = assetClass(22, 'Natural Gas', 2)
    const hub = (
      id: number,
      title: string,
      group: ReturnType<typeof assetClass>,
      externalDestination?: string,
    ) =>
      ({
        id,
        title,
        slug: title.toLowerCase().replaceAll(' ', '-'),
        path: externalDestination
          ? null
          : `/market-coverage/${title.toLowerCase().replaceAll(' ', '-')}/`,
        contentMode: externalDestination ? 'map-only' : 'page',
        externalDestination,
        assetClasses: [group],
        ...timestamps,
      }) as unknown as Hub
    const document = {
      id: 3363,
      title: 'EEX',
      slug: 'eex',
      path: '/venue/eex/',
      contentMode: 'page',
      summary: 'Search-only EEX description.',
      description: {
        root: {
          children: [
            {
              children: [{ text: 'Search-only EEX description.', type: 'text', version: 1 }],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
      layout: [],
      logo: { id: 7342, url: '/media/eex.png', ...timestamps },
      venueTypes: [venueType(42, 'Exchange', 2)],
      marketConnections: [
        { connectionType: 'b', hub: hub(2495, 'German Power', power) },
        { connectionType: 'b', hub: hub(2472, 'Austrian Power', power) },
        {
          connectionType: 'd',
          hub: hub(3319, 'LNG Europe', gas, 'https://example.com/markets/lng-europe/'),
        },
        { connectionType: 'd', hub: hub(3318, 'LNG Asia', gas) },
      ],
      meta: { description: 'Search-only EEX description.' },
      ...timestamps,
    } as unknown as Venue

    const { container } = render(<VenueView document={document} />)

    expect(screen.getByRole('heading', { name: 'About EEX' })).toBeTruthy()
    expect(screen.getByTestId('rich-text')).toBeTruthy()
    expect(
      container.querySelector('.trayport-structured-venue__identity .trayport-eyebrow')
        ?.textContent,
    ).toBe('Exchange')

    const groups = container.querySelectorAll('.trayport-venue-markets__groups > section')
    expect([...groups].map((group) => group.querySelector('h3')?.textContent)).toEqual([
      'Power',
      'Natural Gas',
    ])
    expect([...groups[0]!.querySelectorAll('li')].map((item) => item.textContent)).toEqual([
      'Austrian Power',
      'German Power',
    ])
    expect([...groups[1]!.querySelectorAll('li')].map((item) => item.textContent)).toEqual([
      'LNG Asia',
      'LNG Europe (opens in a new tab)',
    ])
    const externalMarket = within(groups[1] as HTMLElement).getByRole('link', {
      name: /LNG Europe.*opens in a new tab/,
    })
    expect(externalMarket.getAttribute('href')).toBe('https://example.com/markets/lng-europe/')
    expect(externalMarket.getAttribute('target')).toBe('_blank')
    expect(externalMarket.getAttribute('rel')).toBe('noopener noreferrer')
    expect(container.querySelector('.trayport-venue-markets svg')).toBeNull()
    expect(
      container
        .querySelector('.trayport-structured-venue__logo [data-testid="trayport-media"]')
        ?.getAttribute('data-unoptimized'),
    ).toBe('true')
  })
})
