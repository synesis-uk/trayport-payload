'use client'

import { useRef } from 'react'

import { ShellIcon } from '@/components/icons/ShellIcon'
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

export const SiteSearchDialog = () => {
  const searchInput = useRef<HTMLInputElement>(null)

  return (
    <Dialog>
      <DialogTrigger aria-controls="site-search-dialog" asChild>
        <button aria-label="Open site search" className="site-header__search" type="button">
          <ShellIcon aria-hidden height={18} name="search" width={18} />
        </button>
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay className="site-search" unstyled>
          <DialogContent
            aria-modal="true"
            className="site-search__panel"
            id="site-search-dialog"
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              searchInput.current?.focus()
            }}
            unstyled
          >
            <div className="site-search__header">
              <DialogTitle asChild>
                <h2>Site Search</h2>
              </DialogTitle>
              <DialogClose asChild>
                <button aria-label="Close site search" type="button">
                  <ShellIcon aria-hidden height={22} name="close" width={22} />
                </button>
              </DialogClose>
            </div>
            <form action="/" method="get" role="search">
              <label className="sr-only" htmlFor="site-search-input">
                Search Trayport
              </label>
              <ShellIcon aria-hidden height={20} name="search" width={20} />
              <input
                autoComplete="off"
                id="site-search-input"
                maxLength={100}
                minLength={2}
                name="s"
                placeholder="Search Trayport…"
                ref={searchInput}
                required
                type="search"
              />
              <button type="submit">Search</button>
            </form>
            <DialogDescription asChild>
              <p>Search across all public Trayport content.</p>
            </DialogDescription>
          </DialogContent>
        </DialogOverlay>
      </DialogPortal>
    </Dialog>
  )
}
