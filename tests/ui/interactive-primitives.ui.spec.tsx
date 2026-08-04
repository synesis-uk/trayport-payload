import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
})

describe('interactive primitive contracts', () => {
  it('opens and closes an accordion item with keyboard-capable button semantics', () => {
    render(
      <Accordion collapsible type="single">
        <AccordionItem value="market">
          <AccordionTrigger>Market access</AccordionTrigger>
          <AccordionContent>Connected venues and hubs.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    const trigger = screen.getByRole('button', { name: 'Market access' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Connected venues and hubs.')).toBeTruthy()
  })

  it('opens a labelled popover and restores the trigger on Escape', async () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button">Status</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Market status">All services operating.</PopoverContent>
      </Popover>,
    )

    const trigger = screen.getByRole('button', { name: 'Status' })
    trigger.focus()
    fireEvent.click(trigger)
    expect(await screen.findByRole('dialog', { name: 'Market status' })).toBeTruthy()

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('exposes menu semantics and disabled items', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Copy link</DropdownMenuItem>
          <DropdownMenuItem disabled>Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Actions' }), { button: 0 })

    expect(await screen.findByRole('menu')).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: 'Copy link' })).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: 'Archive' }).hasAttribute('data-disabled')).toBe(
      true,
    )
  })

  it('opens a selected Radix select from the keyboard and restores focus on Escape', async () => {
    render(
      <>
        <Label id="market-label">Market</Label>
        <Select defaultValue="power">
          <SelectTrigger aria-labelledby="market-label">
            <SelectValue placeholder="Select a market" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="power">Power</SelectItem>
            <SelectItem value="gas">Natural gas</SelectItem>
            <SelectItem disabled value="climate">
              Climate
            </SelectItem>
          </SelectContent>
        </Select>
      </>,
    )

    const trigger = screen.getByRole('combobox', { name: 'Market' })
    trigger.focus()
    fireEvent.keyDown(trigger, { code: 'ArrowDown', key: 'ArrowDown' })

    expect(await screen.findByRole('listbox')).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Power' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('option', { name: 'Climate' }).getAttribute('aria-disabled')).toBe(
      'true',
    )

    fireEvent.keyDown(document.activeElement || document, { code: 'Escape', key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('retains checkbox state semantics while responding to a focused keyboard activation', () => {
    render(
      <>
        <Label htmlFor="updates">Receive updates</Label>
        <Checkbox defaultChecked id="updates" />
        <Label htmlFor="partial">Partially selected</Label>
        <Checkbox defaultChecked="indeterminate" id="partial" />
        <Label htmlFor="unavailable">Unavailable</Label>
        <Checkbox disabled id="unavailable" />
      </>,
    )

    const updates = screen.getByRole('checkbox', { name: 'Receive updates' })
    updates.focus()
    fireEvent.keyDown(updates, { code: 'Space', key: ' ' })
    fireEvent.keyUp(updates, { code: 'Space', key: ' ' })
    // jsdom does not synthesize the detail=0 click a browser emits after a
    // Space activation on a native button; model that final native event.
    fireEvent.click(updates, { detail: 0 })

    expect(document.activeElement).toBe(updates)
    expect(updates.getAttribute('data-state')).toBe('unchecked')
    expect(screen.getByRole('checkbox', { name: 'Partially selected' }).dataset.state).toBe(
      'indeterminate',
    )
    expect(
      (screen.getByRole('checkbox', { name: 'Unavailable' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })

  it('preserves textarea state, caller classes, and native keyboard input events', () => {
    let lastKey = ''

    render(
      <>
        <Label htmlFor="message">Message</Label>
        <Textarea
          aria-invalid
          className="min-h-40"
          defaultValue="Market access"
          id="message"
          onKeyDown={(event) => {
            lastKey = event.key
          }}
        />
        <Label htmlFor="disabled-message">Disabled message</Label>
        <Textarea disabled id="disabled-message" />
      </>,
    )

    const message = screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement
    message.focus()
    fireEvent.keyDown(message, { code: 'Enter', key: 'Enter' })
    fireEvent.change(message, { target: { value: 'Market access\nPlease contact me.' } })

    expect(lastKey).toBe('Enter')
    expect(message.value).toBe('Market access\nPlease contact me.')
    expect(message.getAttribute('aria-invalid')).toBe('true')
    expect(message.className).toContain('min-h-40')
    expect(
      (screen.getByRole('textbox', { name: 'Disabled message' }) as HTMLTextAreaElement).disabled,
    ).toBe(true)
  })
})
