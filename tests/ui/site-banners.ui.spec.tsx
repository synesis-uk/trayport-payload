import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DismissibleBanner } from '@/components/Banners/DismissibleBanner.client'

describe('site banners', () => {
  it('keeps large-banner copy white over the deep-blue image overlay', () => {
    const styles = readFileSync(resolve(process.cwd(), 'src/app/(frontend)/banners.css'), 'utf8')
    const largeBannerRule = styles.match(/\.site-banner--large\s*\{([^}]*)\}/)?.[1]

    expect(largeBannerRule).toContain('--banner-foreground: white')
    expect(styles).toContain('linear-gradient(90deg, rgb(0 45 114 / 88%), rgb(0 45 114 / 52%))')
  })

  it('exposes an accessible, optional dismiss action', () => {
    const { rerender } = render(
      <DismissibleBanner
        ariaLabel="Announcement: Planned maintenance"
        className="site-banner"
        dismissible
      >
        <p>Planned maintenance</p>
      </DismissibleBanner>,
    )

    expect(screen.getByRole('complementary', { name: /planned maintenance/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /dismiss announcement/i }))
    expect(screen.queryByText('Planned maintenance')).toBeNull()

    rerender(
      <DismissibleBanner
        ariaLabel="Announcement: Required notice"
        className="site-banner"
        dismissible={false}
      >
        <p>Required notice</p>
      </DismissibleBanner>,
    )
    expect(screen.queryByRole('button', { name: /dismiss announcement/i })).toBeNull()
  })
})
