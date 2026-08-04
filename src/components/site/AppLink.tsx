import Link from 'next/link'
import type { ReactNode } from 'react'

import type { ContentLink } from '@/routing/contentLink'
import { resolveContentLink } from '@/routing/contentLink'

export type AppLinkProps = {
  children?: ReactNode
  className?: string
  link?: ContentLink | null
  onClick?: () => void
}

export function AppLink({ children, className, link, onClick }: AppLinkProps) {
  const { href, isExternal, label, newTab } = resolveContentLink(link)
  const content = children || label
  const shared = {
    className,
    onClick,
    rel: newTab ? 'noopener noreferrer' : undefined,
    target: newTab ? '_blank' : undefined,
  }

  if (href === '#') return <span className={className}>{content}</span>

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
