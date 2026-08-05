import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BeforeDashboard } from '@/components/AdminBranding/BeforeDashboard'
import { AdminIcon } from '@/components/AdminBranding/Icon'
import { AdminLogo } from '@/components/AdminBranding/Logo'
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

  it('makes the CMS and customer identity sign-in boundary explicit', () => {
    render(<BeforeLogin />)

    expect(screen.getByRole('heading', { level: 1, name: 'Content management' })).toBeTruthy()
    expect(screen.getByText(/editor or administrator account/i)).toBeTruthy()
    expect(screen.getByText(/customer identities are managed separately/i)).toBeTruthy()
  })

  it('offers a semantic quick start and explains publishing permissions', () => {
    render(<BeforeDashboard />)

    expect(screen.getByRole('heading', { level: 1, name: 'Content workspace' })).toBeTruthy()
    const navigation = screen.getByRole('navigation', { name: 'Content quick start' })
    const links = within(navigation).getAllByRole('link')
    expect(links).toHaveLength(4)
    expect(within(navigation).getByRole('list')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Pages/ }).getAttribute('href')).toBe(
      '/admin/collections/pages',
    )
    expect(screen.getByRole('link', { name: /Navigation/ }).getAttribute('href')).toBe(
      '/admin/globals/navigation',
    )
    expect(screen.getByLabelText('Publishing permissions').textContent).toMatch(
      /editors and administrators can draft and publish content/i,
    )
  })
})
