import Link from 'next/link'
import type { ReactNode } from 'react'

import type { ContentLink } from './contentLink'
import { resolveContentLink } from './contentLink'

type ManagedLinkProps = {
  children?: ReactNode
  className?: string
  link?: ContentLink | null
  onClick?: () => void
}

export const ManagedLink = ({ children, className, link, onClick }: ManagedLinkProps) => {
  const { href, isExternal, label, newTab } = resolveContentLink(link)
  const content = children || label
  const shared = {
    className,
    onClick,
    rel: newTab ? 'noopener noreferrer' : undefined,
    target: newTab ? '_blank' : undefined,
  }

  if (isExternal || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return (
      <a href={href} {...shared}>
        {content}
      </a>
    )
  }

  return (
    <Link href={href} {...shared}>
      {content}
    </Link>
  )
}
