import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  row: {
    data: { components: [], span: '6' },
    rowNumber: 0,
  },
}))

vi.mock('@payloadcms/ui', () => ({
  useRowLabel: () => mocks.row,
}))

import { DocumentSidebarToggle } from '@/components/AdminEditor/DocumentSidebarToggle.client'
import { ColumnRowLabel } from '@/components/AdminEditor/RowLabels.client'

describe('Payload editor layout controls', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('exposes the stored grid span on each column row label', () => {
    render(<ColumnRowLabel />)

    expect(screen.getByText(/Column · 6\/12/).getAttribute('data-column-span')).toBe('6')
  })

  it('closes, restores and remembers the document details rail', () => {
    render(
      <main>
        <DocumentSidebarToggle />
        <div className="document-fields document-fields--has-sidebar">
          <div className="document-fields__main" />
          <aside className="document-fields__sidebar-wrap" />
        </div>
      </main>,
    )

    const button = screen.getByRole('button', { name: 'Hide details' })
    const fields = document.querySelector('.document-fields')
    const sidebar = document.querySelector('.document-fields__sidebar-wrap')

    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(sidebar?.id.startsWith('trayport-document-sidebar-')).toBe(true)

    fireEvent.click(button)
    expect(fields?.classList.contains('trayport-document-sidebar--closed')).toBe(true)
    expect(screen.getByRole('button', { name: 'Show details' })).toBeTruthy()
    expect(window.localStorage.getItem('trayport-admin-document-sidebar')).toBe('closed')

    fireEvent.click(screen.getByRole('button', { name: 'Show details' }))
    expect(fields?.classList.contains('trayport-document-sidebar--closed')).toBe(false)
    expect(window.localStorage.getItem('trayport-admin-document-sidebar')).toBe('open')
  })
})
