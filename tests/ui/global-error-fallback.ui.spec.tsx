import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GlobalErrorFallback } from '@/components/site/GlobalErrorFallback'

describe('global error fallback', () => {
  it('offers labelled recovery and a durable home escape route', () => {
    const retry = vi.fn()
    render(<GlobalErrorFallback onRetry={retry} />)

    const main = screen.getByRole('main')
    const heading = screen.getByRole('heading', { level: 1, name: 'Something went wrong.' })
    const button = screen.getByRole('button', { name: 'Try again' })
    const home = screen.getByRole('link', { name: 'Return to the homepage' })

    expect(main.getAttribute('aria-labelledby')).toBe(heading.id)
    expect(home.getAttribute('href')).toBe('/')
    fireEvent.click(button)
    expect(retry).toHaveBeenCalledOnce()
  })
})
