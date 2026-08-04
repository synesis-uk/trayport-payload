import { AppIcon, type AppIconName } from '@/components/icons'
import type { ContentLink } from '@/routing/contentLink'
import { resolveContentLink } from '@/routing/contentLink'
import { cn } from '@/utilities/ui'
import { type VariantProps, cva } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { AppLink } from './AppLink'

const actionLinkVariants = cva('trayport-action', {
  variants: {
    appearance: {
      accent: 'trayport-action--accent',
      info: 'trayport-action--info',
      primary: 'trayport-action--primary',
      secondary: 'trayport-action--secondary',
      link: 'trayport-action--link',
    },
  },
  defaultVariants: {
    appearance: 'primary',
  },
})

export interface ActionLinkProps extends VariantProps<typeof actionLinkVariants> {
  children?: ReactNode
  className?: string
  leadingIcon?: AppIconName
  link: ContentLink
  showArrow?: boolean
}

export function ActionLink({
  appearance,
  children,
  className,
  leadingIcon,
  link,
  showArrow = true,
}: ActionLinkProps) {
  const { isExternal, newTab } = resolveContentLink(link)
  const isExternalDestination = newTab || isExternal
  const destinationIcon =
    appearance === 'link' ? 'chevronRight' : isExternalDestination ? 'externalLink' : 'arrowRight'

  return (
    <AppLink className={cn(actionLinkVariants({ appearance }), className)} link={link}>
      {leadingIcon ? <AppIcon aria-hidden className="size-4" name={leadingIcon} /> : null}
      <span>{children || link.label}</span>
      {newTab ? (
        <>
          {' '}
          <span className="sr-only">(opens in a new tab)</span>
        </>
      ) : null}
      {showArrow ? (
        <AppIcon
          aria-hidden
          className={destinationIcon === 'externalLink' ? 'size-4' : undefined}
          name={destinationIcon}
        />
      ) : null}
    </AppLink>
  )
}

export { actionLinkVariants }
