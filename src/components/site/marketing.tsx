import { AppIcon, type AppIconName } from '@/components/icons'
import { cn } from '@/utilities/ui'
import type { HTMLAttributes, ReactNode } from 'react'

import { ActionGroup } from './ActionGroup'
import { Container } from './layout'
import { Section, type SectionProps } from './section'
import { StatGrid, type StatItem } from './surface'
import { HeadingGroup } from './typography'

export interface HeroProps extends HTMLAttributes<HTMLElement> {
  actions?: ReactNode
  appearance?: 'dark' | 'image' | 'light'
  badge?: HeroBadgeProps
  body?: ReactNode
  eyebrow?: ReactNode
  heading: ReactNode
  media?: ReactNode
  mediaAspect?: 'sixteenToNine' | 'twoToOne'
  stats?: StatItem[]
}

export interface HeroBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: AppIconName
  label: ReactNode
  tone?: 'info' | 'secondary'
}

export function HeroBadge({
  className,
  icon,
  label,
  tone = 'secondary',
  ...props
}: HeroBadgeProps) {
  return (
    <span
      className={cn('trayport-hero__badge', `trayport-hero__badge--${tone}`, className)}
      {...props}
    >
      {icon ? <AppIcon aria-hidden className="size-4" name={icon} /> : null}
      <span>{label}</span>
    </span>
  )
}

export function Hero({
  actions,
  appearance = 'dark',
  badge,
  body,
  className,
  eyebrow,
  heading,
  media,
  mediaAspect = 'twoToOne',
  stats,
  ...props
}: HeroProps) {
  return (
    <section
      className={cn(
        'trayport-hero',
        `trayport-hero--${appearance}`,
        `trayport-hero--aspect-${mediaAspect}`,
        className,
      )}
      data-has-media={media ? '' : undefined}
      data-slot="hero"
      {...props}
    >
      {media ? (
        <div aria-hidden className="trayport-hero__media">
          {media}
        </div>
      ) : null}
      <div aria-hidden className="trayport-hero__polygon" />
      <Container className="trayport-hero__inner" width="full">
        <div className="trayport-hero__content">
          {badge ? <HeroBadge {...badge} /> : null}
          {eyebrow ? <p className="trayport-eyebrow">{eyebrow}</p> : null}
          <h1>{heading}</h1>
          {body ? <div className="trayport-richtext trayport-richtext--lead">{body}</div> : null}
          {actions ? <ActionGroup>{actions}</ActionGroup> : null}
        </div>
      </Container>
      {stats?.length ? (
        <StatGrid appearance="hero" items={stats} label="Trayport at a glance" />
      ) : null}
    </section>
  )
}

export interface MediaBlockProps extends HTMLAttributes<HTMLElement> {
  aspect?: 'landscape' | 'natural' | 'portrait' | 'square' | 'wide'
  caption?: ReactNode
  media?: ReactNode
  missingLabel?: string
}

export function MediaBlock({
  aspect = 'natural',
  caption,
  className,
  media,
  missingLabel = 'Media is not available',
  ...props
}: MediaBlockProps) {
  return (
    <figure
      className={cn('m-0', 'trayport-media', `trayport-media--${aspect}`, className)}
      data-slot="media-block"
      {...props}
    >
      {media || (
        <div className="grid min-h-48 place-items-center rounded-media border border-dashed border-border bg-muted p-6 text-center text-muted-foreground">
          <span className="grid justify-items-center gap-3">
            <AppIcon aria-hidden className="size-7" name="image" />
            <span className="text-sm font-medium">{missingLabel}</span>
          </span>
        </div>
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

export interface IconTextProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  description?: ReactNode
  icon: AppIconName
  title: ReactNode
}

export function IconText({ className, description, icon, title, ...props }: IconTextProps) {
  return (
    <div
      className={cn('grid grid-cols-[auto_1fr] gap-4', className)}
      data-slot="icon-text"
      {...props}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
        <AppIcon aria-hidden className="size-5" name={icon} />
      </span>
      <div className="min-w-0">
        <h3 className="m-0 text-lg font-semibold">{title}</h3>
        {description ? (
          <div className="mt-1 text-sm/6 text-muted-foreground">{description}</div>
        ) : null}
      </div>
    </div>
  )
}

export interface LogoCloudItem {
  href?: string
  logo?: ReactNode
  name: string
}

export interface LogoCloudProps extends HTMLAttributes<HTMLUListElement> {
  items: LogoCloudItem[]
}

export function LogoCloud({ className, items, ...props }: LogoCloudProps) {
  return (
    <ul
      className={cn(
        'grid list-none grid-cols-2 gap-px p-0 sm:grid-cols-3 lg:grid-cols-5',
        className,
      )}
      data-slot="logo-cloud"
      {...props}
    >
      {items.map((item) => {
        const content = item.logo || (
          <span className="text-center text-sm font-semibold text-muted-foreground">
            {item.name}
          </span>
        )
        return (
          <li className="grid min-h-28 place-items-center bg-background p-5" key={item.name}>
            {item.href ? (
              <a
                aria-label={item.name}
                className="duration-fast grid size-full place-items-center rounded-control transition-opacity outline-none hover:opacity-75 focus-visible:focus-ring"
                href={item.href}
              >
                {content}
              </a>
            ) : (
              content
            )}
          </li>
        )
      })}
    </ul>
  )
}

export interface CTASectionProps extends Omit<SectionProps, 'children'> {
  actions?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  heading: ReactNode
  level?: 2 | 3
}

export function CTASection({
  actions,
  containerClassName,
  description,
  eyebrow,
  heading,
  level = 2,
  theme = 'dark',
  ...props
}: CTASectionProps) {
  return (
    <Section
      containerClassName={cn(
        'grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10',
        containerClassName,
      )}
      data-slot="cta-section"
      theme={theme}
      {...props}
    >
      <HeadingGroup description={description} eyebrow={eyebrow} heading={heading} level={level} />
      {actions ? <ActionGroup className="mt-0 lg:justify-end">{actions}</ActionGroup> : null}
    </Section>
  )
}
