'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { ShellIcon } from '@/components/icons/ShellIcon'
import { Logo } from '@/components/Logo/Logo'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import type {
  HeaderLinkModel,
  HeaderPresentationModel,
  HeaderPresentationNavigationRootModel,
} from './navigation'
import { isNavigationLinkCurrent, isNavigationRootCurrent } from './navigation'

interface MobileNavigationRootProps {
  children: React.ReactNode
}

interface MobileNavigationPanelProps {
  items: HeaderPresentationNavigationRootModel[]
  siteName: string
  utilityItems: HeaderPresentationModel['utilityItems']
}

const linkProps = (link: HeaderLinkModel) => ({
  href: link.href,
  rel: link.newTab ? 'noopener noreferrer' : undefined,
  target: link.newTab ? '_blank' : undefined,
})

export const MobileNavigationRoot = ({ children }: MobileNavigationRootProps) => {
  const pathname = usePathname()
  const [menu, setMenu] = useState({ open: false, pathname })
  const open = menu.pathname === pathname && menu.open

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => setMenu({ open: nextOpen, pathname })}>
      {children}
    </Dialog>
  )
}

export const MobileNavigationTrigger = () => (
  <DialogTrigger asChild>
    <button aria-label="Open navigation menu" className="mobile-navigation__toggle" type="button">
      <ShellIcon aria-hidden name="menu" />
    </button>
  </DialogTrigger>
)

export const MobileNavigationPanel = ({
  items = [],
  siteName,
  utilityItems = [],
}: MobileNavigationPanelProps) => {
  const pathname = usePathname()

  return (
    <DialogPortal>
      <DialogOverlay className="mobile-navigation__backdrop" unstyled />
      <DialogContent className="mobile-navigation" unstyled>
        <DialogTitle className="sr-only">Navigation</DialogTitle>

        <div className="mobile-navigation__header">
          <DialogClose asChild>
            <Link aria-label={`${siteName} home`} className="mobile-navigation__brand" href="/">
              <Logo title={`TMX ${siteName}`} />
            </Link>
          </DialogClose>
          <DialogClose asChild>
            <button
              aria-label="Close navigation menu"
              className="mobile-navigation__close"
              type="button"
            >
              <ShellIcon aria-hidden name="close" />
            </button>
          </DialogClose>
        </div>

        <nav aria-label="Mobile navigation" className="mobile-navigation__inner">
          <Accordion className="mobile-navigation__primary" collapsible type="single">
            {items.map((item) =>
              item.groups.length ? (
                <AccordionItem className="mobile-navigation__section" key={item.id} value={item.id}>
                  <AccordionTrigger
                    className="mobile-navigation__section-trigger"
                    data-current={isNavigationRootCurrent(pathname, item) || undefined}
                  >
                    {item.label}
                  </AccordionTrigger>
                  <AccordionContent className="mobile-navigation__section-content">
                    {item.groups.map((group) => (
                      <div className="mobile-navigation__group" key={group.id}>
                        {group.title ? (
                          group.titleLink ? (
                            <DialogClose asChild>
                              <Link
                                aria-current={
                                  isNavigationLinkCurrent(pathname, group.titleLink)
                                    ? 'page'
                                    : undefined
                                }
                                className="mobile-navigation__group-title"
                                {...linkProps(group.titleLink)}
                              >
                                {group.title}
                              </Link>
                            </DialogClose>
                          ) : (
                            <h2 className="mobile-navigation__group-title">{group.title}</h2>
                          )
                        ) : null}
                        <ul>
                          {group.items.map((child, index) => (
                            <li key={`${group.id}-${child.link.href}-${index}`}>
                              <DialogClose asChild>
                                <Link
                                  aria-current={
                                    isNavigationLinkCurrent(pathname, child.link)
                                      ? 'page'
                                      : undefined
                                  }
                                  className="mobile-navigation__item"
                                  data-accent={child.accent}
                                  {...linkProps(child.link)}
                                >
                                  {child.icon}
                                  <span>
                                    <span>{child.link.label}</span>
                                    {child.description ? <small>{child.description}</small> : null}
                                  </span>
                                </Link>
                              </DialogClose>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ) : item.link ? (
                <div className="mobile-navigation__section" key={item.id}>
                  <DialogClose asChild>
                    <Link
                      aria-current={
                        isNavigationLinkCurrent(pathname, item.link) ? 'page' : undefined
                      }
                      className="mobile-navigation__direct-link"
                      {...linkProps(item.link)}
                    >
                      {item.label}
                    </Link>
                  </DialogClose>
                </div>
              ) : null,
            )}
          </Accordion>

          {utilityItems.length ? (
            <ul className="mobile-navigation__utility">
              {utilityItems.map((utility, index) => (
                <li key={`${utility.href}-${index}`}>
                  <DialogClose asChild>
                    <Link
                      aria-current={isNavigationLinkCurrent(pathname, utility) ? 'page' : undefined}
                      {...linkProps(utility)}
                    >
                      {utility.icon}
                      <span>{utility.label}</span>
                    </Link>
                  </DialogClose>
                </li>
              ))}
            </ul>
          ) : null}
        </nav>
      </DialogContent>
    </DialogPortal>
  )
}
