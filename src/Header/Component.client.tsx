'use client'

import { ChevronDown, Menu, Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

import { Logo } from '@/components/Logo/Logo'
import { ManagedLink } from '@/components/Trayport/ManagedLink'
import type { ContentLink } from '@/components/Trayport/contentLink'
import { resolveContentLink } from '@/components/Trayport/contentLink'
import type { Navigation, SiteSetting } from '@/payload-types'

type PrimaryItem = NonNullable<Navigation['primaryItems']>[number]

interface HeaderClientProps {
  navigation: Navigation
  settings: SiteSetting
}

const primaryLink = (item: PrimaryItem): ContentLink => ({
  ...item.link,
  label: item.label,
})

export const HeaderClient = ({ navigation, settings }: HeaderClientProps) => {
  const pathname = usePathname()
  const menuID = useId()
  const menuButton = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const searchButton = useRef<HTMLButtonElement>(null)
  const searchDialog = useRef<HTMLDivElement>(null)
  const [mobileMenu, setMobileMenu] = useState({ open: false, pathname })
  const [searchOpen, setSearchOpen] = useState(false)
  const [dropdown, setDropdown] = useState<{ item: string | null; pathname: string }>({
    item: null,
    pathname,
  })
  const mobileOpen = mobileMenu.pathname === pathname && mobileMenu.open
  const openDropdown = dropdown.pathname === pathname ? dropdown.item : null
  const items = navigation.primaryItems || []
  const utilityItems = navigation.utilityItems || []
  const primaryAction = navigation.primaryAction?.link

  useEffect(() => {
    const mobileViewport = window.matchMedia('(max-width: 63.999rem)')
    const applyBodyLock = () => {
      document.body.classList.toggle('trayport-menu-open', mobileOpen && mobileViewport.matches)
    }

    applyBodyLock()
    mobileViewport.addEventListener('change', applyBodyLock)
    return () => {
      mobileViewport.removeEventListener('change', applyBodyLock)
      document.body.classList.remove('trayport-menu-open')
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!searchOpen) return

    const dialog = searchDialog.current
    if (!dialog) return

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const focusable = [...dialog.querySelectorAll<HTMLElement>('button, input, [href]')].filter(
        (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1,
      )
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    dialog.addEventListener('keydown', trapFocus)
    return () => dialog.removeEventListener('keydown', trapFocus)
  }, [searchOpen])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (mobileOpen) {
        setMobileMenu({ open: false, pathname })
        menuButton.current?.focus()
      }
      if (searchOpen) {
        setSearchOpen(false)
        window.requestAnimationFrame(() => searchButton.current?.focus())
      }
      setDropdown({ item: null, pathname })
    }

    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setDropdown({ item: null, pathname })
      }
    }

    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOutside)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOutside)
    }
  }, [mobileOpen, pathname, searchOpen])

  return (
    <header className="site-header" ref={headerRef}>
      {settings.siteNotice?.enabled && settings.siteNotice.message ? (
        <div className="site-notice">
          <div className="trayport-container site-notice__inner">
            <p>{settings.siteNotice.message}</p>
            {settings.siteNotice.action?.link ? (
              <ManagedLink className="site-notice__link" link={settings.siteNotice.action.link} />
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="site-header__bar">
        <div className="trayport-container site-header__inner">
          <Link
            aria-label={`${settings.siteName || 'Trayport'} home`}
            className="site-header__brand"
            href="/"
          >
            <Logo title={settings.siteName || 'TMX Trayport'} />
          </Link>

          <nav aria-label="Primary navigation" className="desktop-navigation">
            <ul className="desktop-navigation__list">
              {items.map((item, index) => {
                const itemKey = item.id || `${item.label}-${index}`
                const children = item.children || []
                const dropdownID = `${menuID}-dropdown-${index}`
                const expanded = openDropdown === itemKey

                return (
                  <li
                    className="desktop-navigation__item"
                    key={itemKey}
                    onMouseEnter={() => children.length && setDropdown({ item: itemKey, pathname })}
                    onMouseLeave={() => children.length && setDropdown({ item: null, pathname })}
                  >
                    <div className="desktop-navigation__trigger">
                      <ManagedLink
                        className={
                          pathname === resolveContentLink(primaryLink(item)).href ? 'is-active' : ''
                        }
                        link={primaryLink(item)}
                      />
                      {children.length ? (
                        <button
                          aria-controls={dropdownID}
                          aria-expanded={expanded}
                          aria-label={`${expanded ? 'Close' : 'Open'} ${item.label} menu`}
                          onClick={() => setDropdown({ item: expanded ? null : itemKey, pathname })}
                          type="button"
                        >
                          <ChevronDown aria-hidden size={15} strokeWidth={1.8} />
                        </button>
                      ) : null}
                    </div>

                    {children.length ? (
                      <div
                        className="desktop-navigation__dropdown"
                        data-large={children.length > 10 || undefined}
                        hidden={!expanded}
                        id={dropdownID}
                      >
                        {item.description ? (
                          <p className="desktop-navigation__description">{item.description}</p>
                        ) : null}
                        <ul>
                          {children.map((child, childIndex) => (
                            <li key={child.id || `${child.label}-${childIndex}`}>
                              <ManagedLink
                                link={{
                                  ...child.link,
                                  label: child.label,
                                }}
                              >
                                <span>{child.label}</span>
                                {child.description ? <small>{child.description}</small> : null}
                              </ManagedLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="site-header__actions">
            <button
              aria-controls="site-search-dialog"
              aria-expanded={searchOpen}
              aria-haspopup="dialog"
              aria-label="Open site search"
              className="site-header__search"
              onClick={() => setSearchOpen(true)}
              ref={searchButton}
              type="button"
            >
              <Search aria-hidden size={18} strokeWidth={1.8} />
            </button>
            <button
              aria-controls={menuID}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="mobile-navigation__toggle"
              onClick={() => setMobileMenu({ open: !mobileOpen, pathname })}
              ref={menuButton}
              type="button"
            >
              {mobileOpen ? <X aria-hidden size={24} /> : <Menu aria-hidden size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div className="mobile-navigation" hidden={!mobileOpen} id={menuID}>
        <nav aria-label="Mobile navigation" className="mobile-navigation__inner">
          <ul className="mobile-navigation__primary">
            {items.map((item, index) => (
              <li key={item.id || `${item.label}-${index}`}>
                <ManagedLink link={primaryLink(item)} />
                {item.children?.length ? (
                  <ul>
                    {item.children.map((child, childIndex) => (
                      <li key={child.id || `${child.label}-${childIndex}`}>
                        <ManagedLink
                          link={{
                            ...child.link,
                            label: child.label,
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>

          {utilityItems.length ? (
            <ul className="mobile-navigation__utility">
              {utilityItems.map((item, index) => (
                <li key={item.id || index}>
                  <ManagedLink link={item.link} />
                </li>
              ))}
            </ul>
          ) : null}

          {primaryAction && resolveContentLink(primaryAction).href !== '#' ? (
            <ManagedLink
              className="trayport-action trayport-action--primary"
              link={primaryAction}
            />
          ) : null}
        </nav>
      </div>

      {searchOpen ? (
        <div
          aria-labelledby="site-search-title"
          aria-modal="true"
          className="site-search"
          id="site-search-dialog"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setSearchOpen(false)
              window.requestAnimationFrame(() => searchButton.current?.focus())
            }
          }}
          ref={searchDialog}
          role="dialog"
        >
          <div className="site-search__panel">
            <div className="site-search__header">
              <h2 id="site-search-title">Site Search</h2>
              <button
                aria-label="Close site search"
                onClick={() => {
                  setSearchOpen(false)
                  window.requestAnimationFrame(() => searchButton.current?.focus())
                }}
                type="button"
              >
                <X aria-hidden size={22} />
              </button>
            </div>
            <form action="/resources/insights/" method="get" role="search">
              <label className="sr-only" htmlFor="site-search-input">
                Search Trayport insights
              </label>
              <Search aria-hidden size={20} />
              <input
                autoFocus
                id="site-search-input"
                name="q"
                placeholder="Search insights…"
                type="search"
              />
              <button type="submit">Search</button>
            </form>
            <p>
              Search currently covers the migrated insight library. Broader content search can be
              enabled as additional routes are migrated.
            </p>
          </div>
        </div>
      ) : null}
    </header>
  )
}
