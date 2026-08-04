'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

import { ShellIcon } from '@/components/icons/ShellIcon'

import type {
  HeaderLinkModel,
  HeaderPresentationModel,
  HeaderPresentationNavigationGroupModel,
  HeaderPresentationNavigationItemModel,
  HeaderPresentationNavigationRootModel,
} from './navigation'
import { isNavigationRootCurrent } from './navigation'

interface DesktopNavigationProps {
  items: HeaderPresentationNavigationRootModel[]
  utilityItems: HeaderPresentationModel['utilityItems']
}

const linkProps = (link: HeaderLinkModel) => ({
  href: link.href,
  rel: link.newTab ? 'noopener noreferrer' : undefined,
  target: link.newTab ? '_blank' : undefined,
})

const NavigationItem = ({ item }: { item: HeaderPresentationNavigationItemModel }) => (
  <li className="desktop-navigation__menu-item" data-kind={item.kind}>
    <Link
      className={
        item.kind === 'feature' ? 'desktop-navigation__feature' : 'desktop-navigation__menu-link'
      }
      data-accent={item.accent}
      {...linkProps(item.link)}
    >
      {item.kind === 'feature' && item.media ? (
        <span className="desktop-navigation__feature-media">
          <Image
            alt={item.media.alt}
            fill
            sizes="(min-width: 1024px) 22vw, 1px"
            src={item.media.src}
          />
        </span>
      ) : null}

      <span className="desktop-navigation__menu-content">
        {item.icon ? (
          <span aria-hidden className="desktop-navigation__menu-icon">
            {item.icon}
          </span>
        ) : null}
        <span className="desktop-navigation__menu-copy">
          <span>{item.link.label}</span>
          {item.description ? <small>{item.description}</small> : null}
        </span>
      </span>
    </Link>
  </li>
)

const NavigationGroup = ({ group }: { group: HeaderPresentationNavigationGroupModel }) => (
  <section className="desktop-navigation__group" data-span={group.span}>
    {group.title ? (
      group.titleLink ? (
        <Link className="desktop-navigation__group-title" {...linkProps(group.titleLink)}>
          {group.title}
        </Link>
      ) : (
        <h2 className="desktop-navigation__group-title">{group.title}</h2>
      )
    ) : null}
    <ul className="desktop-navigation__group-items">
      {group.items.map((item, index) => (
        <NavigationItem item={item} key={`${group.id}-${item.link.href}-${index}`} />
      ))}
    </ul>
  </section>
)

export const DesktopNavigation = ({ items = [], utilityItems = [] }: DesktopNavigationProps) => {
  const pathname = usePathname()
  const menuID = useId()
  const navigationRef = useRef<HTMLElement>(null)
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [menu, setMenu] = useState<{ item: string | null; pathname: string }>({
    item: null,
    pathname,
  })
  const openItem = menu.pathname === pathname ? menu.item : null

  useEffect(() => {
    if (!openItem) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenu({ item: null, pathname })
      triggerRefs.current[openItem]?.focus()
    }

    const closeOutside = (event: PointerEvent) => {
      if (!navigationRef.current?.contains(event.target as Node)) {
        setMenu({ item: null, pathname })
      }
    }

    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOutside)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOutside)
    }
  }, [openItem, pathname])

  return (
    <nav
      aria-label="Primary navigation"
      className="desktop-navigation"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setMenu({ item: null, pathname })
        }
      }}
      ref={navigationRef}
    >
      <ul className="desktop-navigation__list">
        {items.map((item, index) => {
          const dropdownID = `${menuID}-dropdown-${index}`
          const expanded = openItem === item.id
          const current = isNavigationRootCurrent(pathname, item)

          if (!item.groups.length) {
            if (!item.link) return null

            return (
              <li className="desktop-navigation__item" key={item.id}>
                <Link
                  aria-current={current ? 'page' : undefined}
                  className="desktop-navigation__direct-link"
                  {...linkProps(item.link)}
                >
                  {item.label}
                </Link>
              </li>
            )
          }

          return (
            <li
              className="desktop-navigation__item"
              key={item.id}
              onMouseEnter={() => setMenu({ item: item.id, pathname })}
              onMouseLeave={() => setMenu({ item: null, pathname })}
            >
              <button
                aria-controls={dropdownID}
                aria-expanded={expanded}
                aria-haspopup="true"
                aria-label={`${item.label} menu`}
                className="desktop-navigation__trigger"
                data-current={current || undefined}
                onClick={() => setMenu({ item: expanded ? null : item.id, pathname })}
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowDown') return
                  event.preventDefault()
                  setMenu({ item: item.id, pathname })
                  requestAnimationFrame(() => {
                    document
                      .querySelector<HTMLAnchorElement>(`#${CSS.escape(dropdownID)} a`)
                      ?.focus()
                  })
                }}
                ref={(element) => {
                  triggerRefs.current[item.id] = element
                }}
                type="button"
              >
                <span>{item.label}</span>
                <ShellIcon aria-hidden name="chevronDown" />
              </button>

              <div
                aria-label={`${item.label} menu`}
                className="desktop-navigation__dropdown"
                hidden={!expanded}
                id={dropdownID}
              >
                <div className="desktop-navigation__groups">
                  {item.groups.map((group) => (
                    <NavigationGroup group={group} key={group.id} />
                  ))}
                </div>

                {utilityItems.length ? (
                  <ul className="desktop-navigation__utility">
                    {utilityItems.map((utility, utilityIndex) => (
                      <li key={`${utility.href}-${utilityIndex}`}>
                        <Link {...linkProps(utility)}>
                          {utility.icon}
                          <span>{utility.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
