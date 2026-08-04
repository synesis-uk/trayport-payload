import { cn } from '@/utilities/ui'
import type { HTMLAttributes, ReactNode } from 'react'

type HeadingLevel = 1 | 2 | 3 | 4

export type EyebrowProps = HTMLAttributes<HTMLParagraphElement>

export function Eyebrow({ className, ...props }: EyebrowProps) {
  return <p className={cn('trayport-eyebrow', className)} {...props} />
}

export interface HeadingGroupProps extends HTMLAttributes<HTMLDivElement> {
  appearance?: 'h1' | 'h2' | 'h3' | 'h4'
  description?: ReactNode
  eyebrow?: ReactNode
  eyebrowOnly?: boolean
  heading: ReactNode
  level?: HeadingLevel
}

export function HeadingGroup({
  appearance,
  className,
  description,
  eyebrow,
  eyebrowOnly = false,
  heading,
  level = 2,
  ...props
}: HeadingGroupProps) {
  const Heading = `h${level}` as const
  const visualAppearance = appearance || `h${level}`

  return (
    <div
      className={cn(
        'trayport-heading grid gap-3',
        `trayport-heading--${visualAppearance}`,
        className,
      )}
      {...props}
    >
      {eyebrow ? <Eyebrow className="mb-0">{eyebrow}</Eyebrow> : null}
      {eyebrowOnly ? null : <Heading className="m-0">{heading}</Heading>}
      {description ? <div className="trayport-richtext max-w-reading">{description}</div> : null}
    </div>
  )
}
