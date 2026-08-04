import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { CookieNotice } from '@/Footer/CookieNotice'
import {
  COOKIE_CONSENT_MAX_AGE_MS,
  COOKIE_CONSENT_STORAGE_KEY,
  persistCookieConsent,
  readCookieConsent,
} from '@/Footer/cookieConsent'
import { FooterPresentation } from '@/Footer/FooterPresentation'
import type { FooterModel } from '@/Footer/types'

const footerModel: FooterModel = {
  certifications: [],
  columns: [
    {
      links: [
        {
          accent: 'cyan',
          href: '/company/about-us/',
          icon: 'companyProfile',
          label: 'About Us',
        },
        {
          accent: 'cyan',
          href: '/company/offices/',
          icon: 'offices',
          label: 'Office Locations',
        },
        { accent: 'cyan', href: '/company/careers/', icon: 'careers', label: 'Careers' },
        { accent: 'cyan', href: '/contact/', icon: 'contact', label: 'Contact' },
      ],
    },
    {
      links: [
        {
          accent: 'orange',
          href: '/resources/market-matrix/',
          icon: 'marketMatrix',
          label: 'Market Matrix',
        },
        {
          accent: 'yellow',
          href: '/regions/europe/',
          icon: 'regionEurope',
          label: 'Europe',
        },
        {
          accent: 'yellow',
          href: '/regions/north-america/',
          icon: 'regionNorthAmerica',
          label: 'North America',
        },
        {
          accent: 'yellow',
          href: '/regions/asia-pacific/',
          icon: 'regionAsiaPacific',
          label: 'Asia Pacific',
        },
      ],
    },
    {
      links: [
        'Modern Slavery',
        'Legal Notice',
        'Terms of Use & Disclaimer',
        'Privacy & Cookies',
      ].map((label, index) => ({
        accent: 'white' as const,
        href: `/legal/${index}/`,
        icon: 'legalDocument' as const,
        label,
      })),
      title: 'Legal',
      titleLink: { href: '/legal/', label: 'Legal' },
    },
  ],
  contact: { address: 'Trayport Limited, 3rd Floor, 2 Gresham Street, London, EC2V 7AD' },
  copyright: 'Copyright © 2026 Trayport Limited',
  disclaimer:
    'Any trading activity is conducted with the specific trading venue.\nTrayport is not a trading venue.',
  legalLinks: [],
  legalText: {
    companyRegistration: 'Registered company statement',
    parentCompany: 'Parent company statement',
  },
  siteName: 'Trayport',
  socialLinks: [
    {
      href: 'https://uk.linkedin.com/company/trayport',
      icon: 'linkedin',
      label: 'LinkedIn',
      newTab: true,
    },
    { href: 'https://x.com/Trayport', icon: 'x', label: 'X', newTab: true },
  ],
}

describe('footer presentation', () => {
  it('renders the exact reachable navigation, supporting labels, and lower legal copy', () => {
    render(<FooterPresentation model={footerModel} />)

    const navigation = screen.getByRole('navigation', { name: 'Footer navigation' })
    expect(within(navigation).getAllByRole('link')).toHaveLength(13)
    expect(within(navigation).getByRole('link', { name: 'Legal' }).getAttribute('href')).toMatch(
      /^\/legal\/?$/,
    )
    expect(screen.getByText('Connect with us:')).toBeTruthy()
    expect(screen.getByText('Head Office:')).toBeTruthy()
    expect(screen.getByText(/Any trading activity/).textContent).toBe(
      'Any trading activity is conducted with the specific trading venue.\nTrayport is not a trading venue.',
    )
    expect(screen.getByText('Registered company statement')).toBeTruthy()
    expect(screen.getByText('Parent company statement')).toBeTruthy()
    expect(screen.getByText('Copyright © 2026 Trayport Limited')).toBeTruthy()
  })

  it('uses only the semantic Font Awesome footer mappings and safe social destinations', () => {
    render(<FooterPresentation model={footerModel} />)

    expect(
      screen.getByRole('link', { name: 'Market Matrix' }).querySelector('svg')?.dataset.icon,
    ).toBe('grid-round-4')
    expect(
      screen.getByRole('link', { name: 'Privacy & Cookies' }).querySelector('svg')?.dataset.icon,
    ).toBe('file-pen')
    const linkedin = screen.getByRole('link', {
      name: 'LinkedIn (opens in a new tab)',
    })
    expect(linkedin.getAttribute('target')).toBe('_blank')
    expect(linkedin.getAttribute('rel')).toBe('noopener noreferrer')
  })
})

describe('cookie consent notice', () => {
  beforeEach(() => {
    window.localStorage.clear()
    delete document.documentElement.dataset.cookieConsent
  })

  it('persists an accepted decision for one year and dismisses the notice', () => {
    render(
      <CookieNotice
        message="Reference consent message ending with our"
        policyPath="/legal/cookie-policy/"
      />,
    )

    const notice = screen.getByRole('complementary', { name: 'Trayport Cookie Consent' })
    expect(
      within(notice).getByRole('link', { name: 'Cookie Policy' }).getAttribute('href'),
    ).toMatch(/^\/legal\/cookie-policy\/?$/)
    fireEvent.click(within(notice).getByRole('button', { name: 'Accept All' }))

    expect(screen.queryByRole('complementary', { name: 'Trayport Cookie Consent' })).toBeNull()
    expect(readCookieConsent(window.localStorage)).toBe('accepted')
    expect(document.documentElement.dataset.cookieConsent).toBe('accepted')
  })

  it('records rejection distinctly and does not treat the previous close key as consent', () => {
    window.localStorage.setItem('trayport-cookie-notice-dismissed', 'true')
    render(<CookieNotice message="Consent message" />)

    const notice = screen.getByRole('complementary', { name: 'Trayport Cookie Consent' })
    fireEvent.click(within(notice).getByRole('button', { name: 'Reject All' }))

    expect(readCookieConsent(window.localStorage)).toBe('rejected')
    expect(document.documentElement.dataset.cookieConsent).toBe('rejected')
  })

  it('ignores malformed, expired, and superseded consent records', () => {
    const now = Date.now()
    persistCookieConsent(window.localStorage, 'accepted', now - COOKIE_CONSENT_MAX_AGE_MS - 1)
    expect(readCookieConsent(window.localStorage, now)).toBeNull()

    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, '{broken')
    expect(readCookieConsent(window.localStorage, now)).toBeNull()

    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        choice: 'accepted',
        expiresAt: now + COOKIE_CONSENT_MAX_AGE_MS,
        version: 0,
      }),
    )
    expect(readCookieConsent(window.localStorage, now)).toBeNull()
  })
})
