import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DashboardWorkspace } from '@/components/AdminBranding/DashboardWorkspace'
import { AdminIcon } from '@/components/AdminBranding/Icon'
import { AdminLogo } from '@/components/AdminBranding/Logo'
import { AdminNavBrand } from '@/components/AdminBranding/NavBrand'
import { emptyDashboardContentData } from '@/components/AdminBranding/dashboardData'
import BeforeLogin from '@/components/BeforeLogin'

describe('Payload admin branding', () => {
  it('renders accessible Trayport graphics without remote assets', () => {
    const { rerender } = render(<AdminLogo />)
    expect(screen.getByRole('img', { name: 'TMX Trayport content management' })).toBeTruthy()

    rerender(<AdminIcon />)
    expect(screen.getByRole('img', { name: 'Trayport' })).toBeTruthy()
    expect(document.querySelector('svg use')).toBeNull()
    expect(document.querySelector('img')).toBeNull()
  })

  it('adds an accessible Trayport identity to the native Payload navigation', () => {
    render(<AdminNavBrand />)

    const link = screen.getByRole('link', { name: /tmx trayport content workspace/i })
    expect(link.getAttribute('href')).toBe('/admin')
    expect(within(link).getByText('Content management')).toBeTruthy()
  })

  it('makes the CMS and customer identity sign-in boundary explicit', () => {
    render(<BeforeLogin />)

    expect(screen.getByRole('heading', { level: 1, name: 'Content management' })).toBeTruthy()
    expect(screen.getByText(/editor or administrator account/i)).toBeTruthy()
    expect(screen.getByText(/customer identities are managed separately/i)).toBeTruthy()
  })

  it('gives editors a focused workspace without administrator tools', () => {
    render(
      <DashboardWorkspace
        data={emptyDashboardContentData()}
        isAdministrator={false}
        userName="Alex"
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Content workspace' })).toBeTruthy()
    expect(screen.getByText(/welcome, alex/i)).toBeTruthy()
    expect(screen.getByLabelText('Current CMS role').textContent).toMatch(/editor/i)

    const navigation = screen.getByRole('navigation', { name: 'Primary content actions' })
    const links = within(navigation).getAllByRole('link')
    expect(links).toHaveLength(4)
    expect(within(navigation).getByRole('list')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Create a page/ }).getAttribute('href')).toBe(
      '/admin/collections/pages/create',
    )
    expect(screen.getByRole('link', { name: /Navigation/ }).getAttribute('href')).toBe(
      '/admin/globals/navigation',
    )
    expect(screen.getByRole('link', { name: /Redirects/ }).getAttribute('href')).toBe(
      '/admin/collections/redirects',
    )
    expect(screen.getByText(/editors and administrators can draft and publish/i)).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Administration' })).toBeNull()
    expect(screen.getByText('No recent content yet.')).toBeTruthy()
  })

  it('shows current content activity and restricted tools to administrators', () => {
    render(
      <DashboardWorkspace
        data={{
          draftCounts: {
            articles: 2,
            'learning-videos': 1,
            pages: 3,
          },
          recent: [
            {
              collection: 'pages',
              href: '/admin/collections/pages/42',
              id: 42,
              kind: 'Page',
              status: 'draft',
              title: 'Market coverage',
              updatedAt: '2026-08-05T09:30:00.000Z',
            },
            {
              collection: 'articles',
              href: '/admin/collections/articles/17',
              id: 17,
              kind: 'Article',
              status: 'published',
              title: 'Energy markets outlook',
              updatedAt: '2026-08-04T15:00:00.000Z',
            },
          ],
          unavailable: false,
        }}
        isAdministrator
        userName="Morgan"
      />,
    )

    expect(screen.getByLabelText('Current CMS role').textContent).toMatch(/administrator/i)
    expect(screen.getByRole('heading', { level: 2, name: 'Administration' })).toBeTruthy()
    const recentRegion = screen.getByRole('region', { name: 'Recently edited' })
    expect(within(recentRegion).getByText('Market coverage')).toBeTruthy()
    expect(screen.getByText('Draft / changed')).toBeTruthy()
    expect(screen.getByText('Published')).toBeTruthy()
    expect(screen.getByText('6')).toBeTruthy()

    const adminNavigation = screen.getByRole('navigation', { name: 'Administration areas' })
    expect(within(adminNavigation).getAllByRole('link')).toHaveLength(4)
    expect(
      within(adminNavigation)
        .getByRole('link', { name: /CMS users/ })
        .getAttribute('href'),
    ).toBe('/admin/collections/users')
  })
})
