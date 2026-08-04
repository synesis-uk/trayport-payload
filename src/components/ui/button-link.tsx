import Link from 'next/link'
import * as React from 'react'

import { ControlIcon } from '@/components/icons/ControlIcon'
import { cn } from '@/utilities/ui'

import { type ButtonProps, buttonVariants } from './button'

export interface ButtonLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> {
  disabled?: boolean
  href: string
  isLoading?: boolean
  loadingLabel?: string
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
}

const newTabRel = (rel?: string): string => {
  const values = new Set(rel?.split(/\s+/).filter(Boolean) || [])
  values.add('noopener')
  values.add('noreferrer')
  return [...values].join(' ')
}

export function ButtonLink({
  children,
  className,
  disabled = false,
  href,
  isLoading = false,
  loadingLabel = 'Loading',
  onClick,
  rel,
  size,
  tabIndex,
  target,
  variant,
  ...props
}: ButtonLinkProps) {
  const classes = cn(buttonVariants({ className, size, variant }))
  const content = isLoading ? (
    <>
      <ControlIcon aria-hidden className="animate-spin motion-reduce:animate-none" name="spinner" />
      <span className={cn(size === 'icon' && 'sr-only')}>{loadingLabel}</span>
    </>
  ) : (
    children
  )

  if (disabled || isLoading) {
    return (
      <span
        {...props}
        aria-busy={isLoading || undefined}
        aria-disabled="true"
        className={classes}
        data-loading={isLoading ? '' : undefined}
        data-slot="button-link"
        role="link"
        tabIndex={-1}
      >
        {content}
      </span>
    )
  }

  const isExternal = /^(?:https?:)?\/\//.test(href) || /^(?:mailto|tel):/.test(href)
  const resolvedRel = target === '_blank' ? newTabRel(rel) : rel

  if (isExternal) {
    return (
      <a
        className={classes}
        data-slot="button-link"
        href={href}
        onClick={onClick}
        rel={resolvedRel}
        tabIndex={tabIndex}
        target={target}
        {...props}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      className={classes}
      data-slot="button-link"
      href={href}
      onClick={onClick}
      rel={resolvedRel}
      tabIndex={tabIndex}
      target={target}
      {...props}
    >
      {content}
    </Link>
  )
}
