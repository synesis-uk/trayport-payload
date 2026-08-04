import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { FormField } from '@/components/ui/form-field'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { getPaginationItems, Pagination } from '@/components/ui/pagination'
import { AppLink, Container, Grid, HeadingGroup, StatList, Surface } from '@/components/site'

describe('frontend primitives', () => {
  it('exposes a stable button API and merges consumer classes', () => {
    render(
      <Button className="min-h-12" variant="secondary">
        Compare markets
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Compare markets' })
    expect(button.dataset.slot).toBe('button')
    expect(button.className).toContain('min-h-12')
    expect(button.className).toContain('trayport-deep')
    expect(button.className).toContain('bg-trayport-soft')
    expect(button.className).not.toContain('bg-transparent')
  })

  it('requires an accessible name for an icon-only action', () => {
    render(
      <IconButton
        icon={<svg aria-hidden data-icon="magnifying-glass" />}
        label="Search Trayport"
        variant="ghost"
      />,
    )

    const button = screen.getByRole('button', { name: 'Search Trayport' })
    expect(button.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('preserves native disabled and invalid form semantics', () => {
    render(<Input aria-invalid disabled name="email" />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.disabled).toBe(true)
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })

  it('makes loading buttons and disabled button-links non-interactive', () => {
    const onDisabledClick = vi.fn()

    render(
      <>
        <Button isLoading loadingLabel="Saving" type="button">
          Save
        </Button>
        <ButtonLink disabled href="/products/joule/" onClick={onDisabledClick} tabIndex={0}>
          Unavailable
        </ButtonLink>
      </>,
    )

    const loading = screen.getByRole('button', { name: 'Saving' })
    expect((loading as HTMLButtonElement).disabled).toBe(true)
    expect(loading.getAttribute('aria-busy')).toBe('true')

    const disabledLink = screen.getByRole('link', { name: 'Unavailable' })
    expect(disabledLink.getAttribute('aria-disabled')).toBe('true')
    expect(disabledLink.getAttribute('href')).toBeNull()
    expect(disabledLink.getAttribute('tabindex')).toBe('-1')
    fireEvent.click(disabledLink)
    expect(onDisabledClick).not.toHaveBeenCalled()
  })

  it('preserves caller relationship tokens while securing new-tab button links', () => {
    render(
      <ButtonLink href="https://example.com/report" rel="nofollow" target="_blank">
        Market report
      </ButtonLink>,
    )

    expect(screen.getByRole('link', { name: 'Market report' }).getAttribute('rel')).toBe(
      'nofollow noopener noreferrer',
    )
  })

  it('coordinates form labels, help, errors, and control attributes', () => {
    render(
      <FormField
        description="Use a work address."
        error="Enter a complete email address."
        id="contact-email"
        label="Email address"
        name="email"
        required
      >
        <Input defaultValue="alex@" type="email" />
      </FormField>,
    )

    const input = screen.getByRole('textbox', { name: /Email address/ })
    expect(input.getAttribute('id')).toBe('contact-email')
    expect(input.getAttribute('name')).toBe('email')
    expect(input.getAttribute('required')).not.toBeNull()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe(
      'contact-email-description contact-email-error',
    )
    expect(input.getAttribute('aria-errormessage')).toBe('contact-email-error')
  })

  it('builds an accessible bounded pagination range', () => {
    expect(getPaginationItems(5, 12)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 12])

    render(
      <Pagination currentPage={5} getHref={(page) => `/insights/?page=${page}`} totalPages={12} />,
    )

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Page 5' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Previous' }).getAttribute('href')).toContain('page=4')
    expect(screen.getByRole('link', { name: 'Next' }).getAttribute('href')).toContain('page=6')
  })
})

describe('site compositions', () => {
  it('uses Next-aware links internally and safe anchors externally', () => {
    render(
      <>
        <AppLink link={{ label: 'Joule', type: 'custom', url: '/products/joule/' }} />
        <AppLink
          link={{
            label: 'External market',
            newTab: true,
            type: 'custom',
            url: 'https://example.com/market',
          }}
        />
      </>,
    )

    expect(screen.getByRole('link', { name: 'Joule' }).getAttribute('href')).toMatch(
      /^\/products\/joule\/?$/,
    )
    const external = screen.getByRole('link', { name: 'External market' })
    expect(external.getAttribute('target')).toBe('_blank')
    expect(external.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('maps layout choices to bounded component variants', () => {
    render(
      <Container data-testid="container" width="reading">
        <Grid columns="three" data-testid="grid">
          Content
        </Grid>
      </Container>,
    )

    expect(screen.getByTestId('container').className).toContain('trayport-container--reading')
    expect(screen.getByTestId('grid').className).toContain('lg:grid-cols-3')
  })

  it('renders a semantic heading group and statistics list', () => {
    render(
      <Surface>
        <HeadingGroup eyebrow="Coverage" heading="European power" level={2} />
        <StatList items={[{ label: 'Markets', value: '25+' }]} />
      </Surface>,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'European power' })).toBeTruthy()
    expect(screen.getByText('Markets').closest('dt')).toBeTruthy()
    expect(screen.getByText('25+').closest('dd')).toBeTruthy()
  })
})
