import Link from 'next/link'
import type { ReactNode } from 'react'
import { safeDestination } from '@/routing/urlPolicy'

import type { FooterLinkModel } from './types'

type FooterLinkProps = {
  children?: ReactNode
  className?: string
  link: FooterLinkModel
}

export function FooterLink({ children, className, link }: FooterLinkProps) {
  const content = children ?? link.label
  const href = safeDestination(link.href)
  const shared = {
    className,
    rel: link.newTab ? 'noopener noreferrer' : undefined,
    target: link.newTab ? '_blank' : undefined,
  }

  if (!href) return <span className={className}>{content}</span>

  if (
    href.startsWith('https://') ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  ) {
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
