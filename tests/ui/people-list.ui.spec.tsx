import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const peopleListHarness = vi.hoisted(() => ({ find: vi.fn() }))

vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))

vi.mock('payload', () => ({
  getPayload: async () => ({ find: peopleListHarness.find }),
}))

vi.mock('@/components/RichText', () => ({
  default: ({ data }: { data?: { marker?: string } }) => <span>{data?.marker}</span>,
}))

vi.mock('@/components/Trayport/TrayportMedia', () => ({
  TrayportMedia: () => <span data-testid="person-portrait" />,
}))

vi.mock('@/components/site/AppLink', () => ({
  AppLink: ({ children, link }: { children: React.ReactNode; link: { url?: string } }) => (
    <a href={link.url}>{children}</a>
  ),
}))

vi.mock('@/components/site/DynamicFeatureCarousel.client', () => ({
  DynamicFeatureCarousel: ({ items, label }: { items: React.ReactNode[]; label: string }) => (
    <section aria-label={label}>{items}</section>
  ),
}))

vi.mock('@/components/icons', () => ({
  AppIcon: () => <span aria-hidden />,
}))

import { PeopleListComponentAdapter } from '@/components/blocks/peopleListAdapter.server'

const person = {
  description: { marker: 'Current biography' },
  displayOrder: 0,
  externalProfileURL: null,
  id: 4843,
  image: { id: 9001 },
  jobRole: 'Senior developer',
  path: '/people/toby-smith/',
  quote: { marker: 'Current quotation' },
  team: 'careers',
  title: 'Toby Smith',
}

const teamBlock = {
  blockType: 'peopleList',
  people: [],
  presentation: 'careersCarousel',
  selectionMode: 'team',
  team: 'careers',
} as const

beforeEach(() => {
  peopleListHarness.find.mockReset()
  peopleListHarness.find.mockResolvedValue({ docs: [person] })
})

describe('People listing runtime', () => {
  it('queries only published team members in WP-compatible order and renders current profile fields', async () => {
    render(await PeopleListComponentAdapter({ block: teamBlock as never, draft: false, index: 0 }))

    expect(peopleListHarness.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'people',
        depth: 1,
        draft: false,
        overrideAccess: false,
        pagination: false,
        sort: ['displayOrder', '-publishedAt'],
        where: {
          and: [{ _status: { equals: 'published' } }, { team: { equals: 'careers' } }],
        },
      }),
    )
    expect(screen.getByRole('region', { name: 'Trayport people' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Toby Smith' })).toBeTruthy()
    expect(screen.getByText('Senior developer')).toBeTruthy()
    // The card deliberately does not print the biography. The WordPress template emits it and the
    // theme hides it (`.people-description { @apply hidden }`), and rendering it into a card-width
    // column turned a three-paragraph bio into 1,076px of copy. The text still lives on the
    // person's own profile route, which the card links to.
    expect(screen.queryByText('Current biography')).toBeNull()
    expect(screen.getByText('Current quotation')).toBeTruthy()
    expect(screen.getByTestId('person-portrait')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Read profile/ }).getAttribute('href')).toBe(
      '/people/toby-smith/',
    )
  })

  it('uses the authenticated draft branch without the published-only predicate', async () => {
    render(await PeopleListComponentAdapter({ block: teamBlock as never, draft: true, index: 0 }))

    expect(peopleListHarness.find).toHaveBeenCalledWith(
      expect.objectContaining({
        draft: true,
        overrideAccess: true,
        where: { team: { equals: 'careers' } },
      }),
    )
  })
})
