import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const DialogFixture = () => (
  <Dialog>
    <DialogTrigger asChild>
      <button type="button">Open search</button>
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay data-testid="dialog-overlay">
        <DialogContent>
          <DialogTitle>Site Search</DialogTitle>
          <DialogDescription>Search all migrated insights.</DialogDescription>
          <input aria-label="Search query" />
          <DialogClose asChild>
            <button type="button">Close search</button>
          </DialogClose>
        </DialogContent>
      </DialogOverlay>
    </DialogPortal>
  </Dialog>
)

describe('dialog primitive', () => {
  it('provides modal semantics and restores focus after Escape', async () => {
    render(<DialogFixture />)
    const trigger = screen.getByRole('button', { name: 'Open search' })

    trigger.focus()
    fireEvent.click(trigger)

    const dialog = await screen.findByRole('dialog', { name: 'Site Search' })
    expect(dialog.parentElement).toBe(screen.getByTestId('dialog-overlay'))
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Search query' }))

    fireEvent.keyDown(document, { code: 'Escape', key: 'Escape' })

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })
})
