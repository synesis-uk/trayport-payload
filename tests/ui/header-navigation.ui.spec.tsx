import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DesktopNavigation } from '@/Header/DesktopNavigation.client'
import {
  MobileNavigationPanel,
  MobileNavigationRoot,
  MobileNavigationTrigger,
} from '@/Header/MobileNavigation.client'
import { normalizeHeader } from '@/Header/navigation'
import type { Media, Navigation, Page, SiteSetting } from '@/payload-types'

const navigationState = vi.hoisted(() => ({ pathname: '/' }))

vi.mock('next/navigation', () => ({
  usePathname: () => navigationState.pathname,
}))

beforeEach(() => {
  navigationState.pathname = '/'
})

const payloadPage = {
  createdAt: '2026-08-04T09:00:00.000Z',
  id: 2203,
  path: '/company/about-us/',
  slug: 'about-us',
  title: 'Payload page object must not cross the header boundary',
  updatedAt: '2026-08-04T09:00:00.000Z',
} as Page

const payloadMedia: Media = {
  alt: 'Colleagues in the Trayport office',
  createdAt: '2026-08-04T09:00:00.000Z',
  height: 360,
  id: 701,
  title: 'Payload media object must not cross the header boundary',
  updatedAt: '2026-08-04T09:00:00.000Z',
  url: '/media/company-office.jpg',
  width: 640,
}

const navigation: Navigation = {
  _status: 'published',
  createdAt: '2026-08-04T09:00:00.000Z',
  id: 1,
  legacySource: {
    key: 'options:navigation',
    source: 'wordpress',
  },
  primaryItems: [
    {
      groups: [
        {
          id: 'company-feature-group',
          items: [
            {
              accent: 'cyan',
              description: 'Learn about Trayport and the people behind the network.',
              icon: 'people',
              id: 'about-us-feature',
              kind: 'feature',
              label: 'About Us',
              link: {
                reference: {
                  relationTo: 'pages',
                  value: payloadPage,
                },
                type: 'reference',
              },
              media: payloadMedia,
            },
          ],
          span: '6',
          title: 'Our Company',
          titleLink: {
            type: 'custom',
            url: '/company/',
          },
        },
      ],
      id: 'company-root',
      label: 'Company',
      link: {
        type: 'custom',
        url: '/company/',
      },
    },
    {
      children: [
        {
          description: 'A retained child while grouped navigation is rolled out.',
          groupLabel: 'Legacy group metadata',
          id: 'legacy-child',
          label: 'Legacy destination',
          link: {
            newTab: true,
            type: 'custom',
            url: 'https://example.com/legacy',
          },
          media: payloadMedia,
        },
      ],
      id: 'legacy-root',
      label: 'Legacy',
      link: {
        type: 'custom',
        url: '/legacy/',
      },
    },
  ],
  updatedAt: '2026-08-04T09:00:00.000Z',
  utilityItems: [
    {
      icon: 'playCircle',
      id: 'see-joule',
      link: {
        label: 'See Joule',
        newTab: true,
        type: 'custom',
        url: 'https://example.com/joule',
      },
    },
  ],
}

const settings: SiteSetting = {
  _status: 'published',
  createdAt: '2026-08-04T09:00:00.000Z',
  id: 2,
  siteName: 'Trayport',
  siteNotice: {
    action: {
      link: {
        label: 'Read the notice',
        type: 'custom',
        url: '/notice/',
      },
    },
    enabled: true,
    message: 'Planned service notice',
  },
  updatedAt: '2026-08-04T09:00:00.000Z',
}

describe('header navigation model', () => {
  it('normalizes grouped and legacy Payload data into a compact presentation-only model', () => {
    const model = normalizeHeader(navigation, settings)

    expect(model.items[0]).toEqual({
      groups: [
        {
          id: 'company-feature-group',
          items: [
            {
              accent: 'cyan',
              description: 'Learn about Trayport and the people behind the network.',
              icon: 'people',
              kind: 'feature',
              link: {
                href: '/company/about-us/',
                label: 'About Us',
                newTab: false,
              },
              media: {
                alt: 'Colleagues in the Trayport office',
                height: 360,
                src: '/media/company-office.jpg',
                width: 640,
              },
            },
          ],
          span: '6',
          title: 'Our Company',
          titleLink: {
            href: '/company/',
            label: 'Our Company',
            newTab: false,
          },
        },
      ],
      id: 'company-root',
      label: 'Company',
      link: {
        href: '/company/',
        label: 'Company',
        newTab: false,
      },
    })

    expect(model.items[1]).toEqual({
      groups: [
        {
          id: 'navigation-1-legacy',
          items: [
            {
              description: 'A retained child while grouped navigation is rolled out.',
              kind: 'link',
              link: {
                href: 'https://example.com/legacy',
                label: 'Legacy destination',
                newTab: true,
              },
            },
          ],
          span: 'auto',
        },
      ],
      id: 'legacy-root',
      label: 'Legacy',
      link: {
        href: '/legacy/',
        label: 'Legacy',
        newTab: false,
      },
    })

    expect(model.utilityItems).toEqual([
      {
        href: 'https://example.com/joule',
        icon: 'playCircle',
        label: 'See Joule',
        newTab: true,
      },
    ])
    expect(model.siteNotice).toEqual({
      action: {
        href: '/notice/',
        label: 'Read the notice',
        newTab: false,
      },
      message: 'Planned service notice',
    })

    const serializedModel = JSON.stringify(model)
    expect(serializedModel).not.toContain('Payload page object')
    expect(serializedModel).not.toContain('Payload media object')
    expect(serializedModel).not.toContain('legacySource')
    expect(serializedModel).not.toContain('reference')
    expect(serializedModel).not.toContain('createdAt')
    expect(serializedModel).not.toContain('updatedAt')
    expect(model.items[0]?.groups[0]?.items[0]?.media).not.toBe(payloadMedia)
  })

  it('fails closed instead of presenting stale or unsafe CMS links as hash destinations', () => {
    const unsafeNavigation = {
      ...navigation,
      primaryItems: [
        {
          id: 'unsafe-direct',
          label: 'Unsafe direct link',
          link: { type: 'custom', url: 'javascript:alert(1)' },
        },
        {
          groups: [
            {
              id: 'partially-safe-group',
              items: [
                {
                  id: 'draft-child',
                  kind: 'link',
                  label: 'Draft child',
                  link: {
                    reference: {
                      relationTo: 'pages',
                      value: { _status: 'draft', path: '/draft-child/' },
                    },
                    type: 'reference',
                  },
                },
                {
                  id: 'safe-child',
                  kind: 'link',
                  label: 'Safe child',
                  link: { type: 'custom', url: '/safe-child/' },
                },
              ],
              span: 'auto',
              title: 'Destinations',
              titleLink: { type: 'custom', url: 'data:text/html,unsafe' },
            },
          ],
          id: 'grouped-root',
          label: 'Grouped root',
          link: { type: 'custom', url: 'javascript:alert(1)' },
        },
      ],
      utilityItems: [
        {
          id: 'unsafe-utility',
          link: { label: 'Unsafe utility', type: 'custom', url: '//example.com/path' },
        },
      ],
    } as Navigation
    const unsafeSettings = {
      ...settings,
      siteNotice: {
        ...settings.siteNotice,
        action: {
          link: { label: 'Unsafe notice', type: 'custom', url: 'http://example.com/' },
        },
      },
    } as SiteSetting

    const model = normalizeHeader(unsafeNavigation, unsafeSettings)

    expect(model.items).toHaveLength(1)
    expect(model.items[0]).toMatchObject({ id: 'grouped-root', link: null })
    expect(model.items[0]?.groups[0]?.items.map((item) => item.link.href)).toEqual(['/safe-child/'])
    expect(model.items[0]?.groups[0]?.titleLink).toBeUndefined()
    expect(model.utilityItems).toEqual([])
    expect(model.siteNotice?.action).toBeUndefined()
    expect(JSON.stringify(model)).not.toContain('href":"#')
  })

  it('closes an open desktop dropdown when keyboard focus leaves the navigation', () => {
    render(
      <DesktopNavigation
        items={[
          {
            groups: [
              {
                id: 'products-group',
                items: [
                  {
                    kind: 'link',
                    link: { href: '/products/joule/', label: 'Joule', newTab: false },
                  },
                ],
                span: 'auto',
                title: 'Products',
              },
            ],
            id: 'products',
            label: 'Products',
            link: { href: '/products/', label: 'Products', newTab: false },
          },
        ]}
        utilityItems={[]}
      />,
    )

    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' })
    const trigger = screen.getByRole('button', { name: 'Products menu' })
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    fireEvent.blur(navigation, { relatedTarget: document.body })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('marks grouped roots current from an owned child when the root itself is a live fallback', () => {
    navigationState.pathname = '/company/about-us/'
    const items = [
      {
        groups: [
          {
            id: 'company-group',
            items: [
              {
                kind: 'link' as const,
                link: { href: '/company/about-us/', label: 'About Us', newTab: false },
              },
            ],
            span: 'auto' as const,
            title: 'Company',
            titleLink: {
              href: 'https://www.trayport.com/company/',
              label: 'Company',
              newTab: false,
            },
          },
        ],
        id: 'company',
        label: 'Company',
        link: {
          href: 'https://www.trayport.com/company/',
          label: 'Company',
          newTab: false,
        },
      },
    ]

    const { unmount } = render(<DesktopNavigation items={items} utilityItems={[]} />)
    expect(screen.getByRole('button', { name: 'Company menu' }).getAttribute('data-current')).toBe(
      'true',
    )
    unmount()

    render(
      <MobileNavigationRoot>
        <MobileNavigationTrigger />
        <MobileNavigationPanel items={items} siteName="Trayport" utilityItems={[]} />
      </MobileNavigationRoot>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    const mobileRoot = screen.getByRole('button', { name: 'Company' })
    expect(mobileRoot.getAttribute('data-current')).toBe('true')
    fireEvent.click(mobileRoot)
    expect(screen.getByRole('link', { name: 'About Us' }).getAttribute('aria-current')).toBe('page')
  })

  it('renders CMS utility links with their icons and new-tab semantics in the mobile dialog', async () => {
    render(
      <MobileNavigationRoot>
        <MobileNavigationTrigger />
        <MobileNavigationPanel
          items={[]}
          siteName="Trayport"
          utilityItems={[
            {
              href: 'https://example.com/joule',
              icon: <svg aria-hidden data-icon="circle-play" />,
              label: 'See Joule',
              newTab: true,
            },
            {
              href: '/request-a-demo/',
              icon: <svg aria-hidden data-icon="calendar-days" />,
              label: 'Request A Demo',
              newTab: false,
            },
            {
              href: '/contact/',
              icon: <svg aria-hidden data-icon="messages" />,
              label: 'Contact Us',
              newTab: false,
            },
          ]}
        />
      </MobileNavigationRoot>,
    )

    const trigger = screen.getByRole('button', { name: 'Open navigation menu' })
    fireEvent.click(trigger)

    const navigation = await screen.findByRole('navigation', { name: 'Mobile navigation' })
    const utilityLinks = navigation.querySelectorAll('.mobile-navigation__utility a')
    expect(utilityLinks).toHaveLength(3)

    const jouleLink = screen.getByRole('link', { name: 'See Joule' })
    expect(jouleLink.getAttribute('href')).toBe('https://example.com/joule')
    expect(jouleLink.getAttribute('target')).toBe('_blank')
    expect(jouleLink.getAttribute('rel')).toBe('noopener noreferrer')
    expect(jouleLink.querySelector('svg[data-icon="circle-play"]')).not.toBeNull()
    expect(screen.getByRole('link', { name: 'Request A Demo' }).getAttribute('href')).toBe(
      '/request-a-demo',
    )
    expect(screen.getByRole('link', { name: 'Contact Us' }).getAttribute('href')).toBe('/contact')

    fireEvent.click(jouleLink)
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Navigation' })).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })
})
