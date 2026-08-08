import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

import { AppIcon, type AppIconName, type FeatureIconName } from '@/components/icons'
import {
  ActionGroup,
  ActionLink,
  AppLink,
  HeadingGroup,
  Hero,
  MediaBlock,
  StatGrid,
  type StatItem,
} from '@/components/site'
import { FeatureCarousel } from '@/components/site/FeatureCarousel.client'
import type { ContentLink } from '@/routing/contentLink'
import { cn } from '@/utilities/ui'

export interface ActionPresentationModel {
  appearance: 'accent' | 'info' | 'link' | 'primary' | 'secondary'
  icon?: AppIconName
  key: string
  label: string
  link: ContentLink
}

export interface ActionsPresentationModel {
  actions: ActionPresentationModel[]
}

export interface HeadingPresentationModel {
  appearance: 'h1' | 'h2' | 'h3' | 'h4'
  eyebrow?: string
  eyebrowOnly?: boolean
  heading: string
  level: 2 | 3 | 4
}

export interface StatisticPresentationItem {
  description?: string
  key: string
  label: string
  value: string
}

export interface StatisticsPresentationModel {
  items: StatisticPresentationItem[]
}

export interface TrayportHeroPresentationModel {
  actions: ActionPresentationModel[]
  appearance: 'dark' | 'image' | 'light'
  body?: ReactNode
  badge?: {
    icon?: AppIconName
    label: string
    tone: 'info' | 'secondary'
  }
  eyebrow?: string
  heading: string
  media?: ReactNode
  mediaAspect: 'sixteenToNine' | 'twoToOne'
  statistics: StatisticPresentationItem[]
}

export interface RichTextPresentationModel {
  renderBody: (className: string) => ReactNode
  size: 'large' | 'regular'
}

export interface MediaPresentationModel {
  aspect: 'landscape' | 'natural' | 'portrait' | 'square' | 'wide'
  caption?: string
  media: ReactNode
}

export interface FeaturePresentationItem {
  action?: {
    appearance: ActionPresentationModel['appearance']
    icon?: AppIconName
    label: string
    link: ContentLink
  }
  body?: ReactNode
  display: 'icon' | 'image' | 'plain'
  icon?: FeatureIconName
  key: string
  media?: ReactNode
  title?: string
}

export interface FeatureListPresentationModel {
  items: FeaturePresentationItem[]
  presentation: 'carousel' | 'grid' | 'leadCarousel'
}

export interface StandaloneIconPresentationModel {
  icon: 'emissions' | 'gas' | 'power'
}

export interface FAQPresentationItem {
  answer: ReactNode
  key: string
  media?: ReactNode
  question: string
}

export interface FAQPresentationModel {
  items: FAQPresentationItem[]
}

export interface EntityPresentationItem {
  description?: ReactNode
  key: string
  link?: ContentLink
  media?: ReactNode
  title: string
}

export interface EntityListPresentationModel {
  items: EntityPresentationItem[]
  kind: 'clients' | 'general' | 'people' | 'products' | 'venues'
}

export interface TimelinePresentationItem {
  body?: ReactNode
  key: string
  label: string
  title?: string
}

export interface TimelinePresentationModel {
  items: TimelinePresentationItem[]
}

export interface DataTablePresentationCell {
  key: string
  text: string
}

export interface DataTablePresentationHeader extends DataTablePresentationCell {
  visuallyHidden?: boolean
}

export interface DataTablePresentationRow {
  cells: DataTablePresentationCell[]
  key: string
}

export interface DataTablePresentationModel {
  caption?: string
  headers: DataTablePresentationHeader[]
  rows: DataTablePresentationRow[]
}

export interface GalleryPresentationItem {
  caption?: string
  key: string
  media: ReactNode
}

export interface GalleryPresentationModel {
  items: GalleryPresentationItem[]
}

interface ActionItemsProps {
  actions: ActionPresentationModel[]
}

function ActionItems({ actions }: ActionItemsProps) {
  return actions.map((action) => (
    <ActionLink
      appearance={action.appearance}
      key={action.key}
      leadingIcon={action.icon}
      link={action.link}
    >
      {action.label}
    </ActionLink>
  ))
}

export interface ActionsPresentationProps extends HTMLAttributes<HTMLDivElement> {
  model: ActionsPresentationModel
}

export function ActionsPresentation({ className, model, ...props }: ActionsPresentationProps) {
  if (!model.actions.length) return null

  return (
    <ActionGroup className={className} {...props}>
      <ActionItems actions={model.actions} />
    </ActionGroup>
  )
}

export interface HeadingPresentationProps extends HTMLAttributes<HTMLDivElement> {
  model: HeadingPresentationModel
}

export function HeadingPresentation({ className, model, ...props }: HeadingPresentationProps) {
  return (
    <HeadingGroup
      appearance={model.appearance}
      className={className}
      eyebrow={model.eyebrow}
      eyebrowOnly={model.eyebrowOnly}
      heading={model.heading}
      level={model.level}
      {...props}
    />
  )
}

export interface StatisticsPresentationProps extends HTMLAttributes<HTMLDListElement> {
  model: StatisticsPresentationModel
}

export function StatisticsPresentation({
  className,
  model,
  ...props
}: StatisticsPresentationProps) {
  const items: StatItem[] = model.items.map((item) => ({
    label: item.label,
    value: (
      <>
        <span>{item.value}</span>
        {item.description ? (
          <span className="trayport-statistics__description">{item.description}</span>
        ) : null}
      </>
    ),
  }))

  return <StatGrid appearance="editorial" className={className} items={items} {...props} />
}

export interface TrayportHeroPresentationProps extends HTMLAttributes<HTMLElement> {
  model: TrayportHeroPresentationModel
}

export function TrayportHeroPresentation({
  className,
  model,
  ...props
}: TrayportHeroPresentationProps) {
  return (
    <Hero
      actions={model.actions.length ? <ActionItems actions={model.actions} /> : undefined}
      appearance={model.appearance}
      badge={model.badge}
      body={model.body}
      className={className}
      eyebrow={model.eyebrow}
      heading={model.heading}
      media={model.media}
      mediaAspect={model.mediaAspect}
      stats={model.statistics}
      {...props}
    />
  )
}

export interface RichTextPresentationProps {
  className?: string
  model: RichTextPresentationModel
}

export function RichTextPresentation({ className, model }: RichTextPresentationProps) {
  return model.renderBody(
    cn('trayport-richtext', model.size === 'large' && 'trayport-richtext--lead', className),
  )
}

export interface MediaPresentationProps extends HTMLAttributes<HTMLElement> {
  model: MediaPresentationModel
}

export function MediaPresentation({ className, model, ...props }: MediaPresentationProps) {
  return (
    <MediaBlock
      aspect={model.aspect}
      caption={model.caption}
      className={className}
      media={model.media}
      {...props}
    />
  )
}

export interface FeatureListPresentationProps extends HTMLAttributes<HTMLDivElement> {
  model: FeatureListPresentationModel
}

function FeatureCard({ item }: { item: FeaturePresentationItem }) {
  const content = (
    <>
      {item.display === 'image' ? item.media : null}
      <div className="trayport-feature__body">
        {item.display === 'icon' && item.icon ? (
          <span className="trayport-feature__icon">
            <AppIcon aria-hidden className="size-[22px]" name={item.icon} />
          </span>
        ) : null}
        {item.title ? <h3>{item.title}</h3> : null}
        {item.body}
        {item.action ? (
          <ActionLink
            appearance={item.action.appearance}
            className="trayport-feature__action"
            leadingIcon={item.action.icon}
            link={item.action.link}
          >
            {item.action.label}
          </ActionLink>
        ) : null}
      </div>
    </>
  )
  const isOverlayLink = item.display === 'image' && !item.body && Boolean(item.action)
  const overlayLabel = item.title?.trim() || item.action?.label

  return (
    <article className={cn('trayport-feature', isOverlayLink && 'trayport-feature--overlay')}>
      {isOverlayLink && item.action ? (
        <AppLink className="trayport-feature__overlay-link" link={item.action.link}>
          {item.media}
          <span className="trayport-feature__overlay-body">
            <span>{overlayLabel}</span>
            <AppIcon aria-hidden className="size-[18px]" name={item.action.icon || 'arrowRight'} />
          </span>
        </AppLink>
      ) : (
        content
      )}
    </article>
  )
}

export function FeatureListPresentation({
  className,
  model,
  ...props
}: FeatureListPresentationProps) {
  if (!model.items.length) return null

  const cards = model.items.map((item) => <FeatureCard item={item} key={item.key} />)
  const carouselIcons = {
    nextIcon: <AppIcon aria-hidden name="chevronRight" />,
    previousIcon: <AppIcon aria-hidden name="chevronLeft" />,
  }

  if (model.presentation === 'carousel') {
    return (
      <FeatureCarousel
        className={className}
        items={cards}
        label="Featured content"
        {...carouselIcons}
        {...props}
      />
    )
  }

  if (model.presentation === 'leadCarousel') {
    return (
      <div
        className={cn('trayport-features trayport-features--lead-carousel', className)}
        {...props}
      >
        <div className="trayport-features__lead">{cards[0]}</div>
        <FeatureCarousel
          className="trayport-features__carousel"
          items={cards.slice(1)}
          label="More featured content"
          {...carouselIcons}
        />
      </div>
    )
  }

  return (
    <div className={cn('trayport-features trayport-features--grid', className)} {...props}>
      {cards}
    </div>
  )
}

export interface StandaloneIconPresentationProps extends HTMLAttributes<HTMLDivElement> {
  model: StandaloneIconPresentationModel
}

export function StandaloneIconPresentation({
  className,
  model,
  ...props
}: StandaloneIconPresentationProps) {
  return (
    <div className={cn('trayport-standalone-icon', className)} {...props}>
      <AppIcon aria-hidden name={model.icon === 'power' ? 'powerVolume' : model.icon} />
    </div>
  )
}

export interface FAQPresentationProps extends HTMLAttributes<HTMLDivElement> {
  model: FAQPresentationModel
}

export function FAQPresentation({ className, model, ...props }: FAQPresentationProps) {
  return (
    <div className={cn('trayport-faq', className)} {...props}>
      {model.items.map((item) => (
        <details key={item.key}>
          <summary>
            <span>{item.question}</span>
            <span aria-hidden className="trayport-faq__toggle" data-slot="faq-toggle-icon">
              <span className="trayport-faq__toggle-closed">
                <AppIcon name="plus" />
              </span>
              <span className="trayport-faq__toggle-open">
                <AppIcon name="minus" />
              </span>
            </span>
          </summary>
          <div className={cn('trayport-faq__answer', item.media && 'trayport-faq__answer--media')}>
            {item.answer}
            {item.media}
          </div>
        </details>
      ))}
    </div>
  )
}

export interface EntityListPresentationProps extends HTMLAttributes<HTMLDivElement> {
  model: EntityListPresentationModel
}

export function EntityListPresentation({
  className,
  model,
  ...props
}: EntityListPresentationProps) {
  return (
    <div
      className={cn('trayport-entities', `trayport-entities--${model.kind}`, className)}
      {...props}
    >
      {model.items.map((item) => {
        const body = (
          <>
            {item.media}
            <h3 className={model.kind === 'clients' ? 'sr-only' : undefined}>{item.title}</h3>
            {item.description}
            {item.link && model.kind !== 'clients' ? (
              <AppIcon aria-hidden className="size-[17px]" name="arrowRight" />
            ) : null}
          </>
        )

        return item.link ? (
          <AppLink className="trayport-entity" key={item.key} link={item.link}>
            {body}
          </AppLink>
        ) : (
          <article className="trayport-entity" key={item.key}>
            {body}
          </article>
        )
      })}
    </div>
  )
}

export interface TimelinePresentationProps extends HTMLAttributes<HTMLOListElement> {
  model: TimelinePresentationModel
}

export function TimelinePresentation({ className, model, ...props }: TimelinePresentationProps) {
  return (
    <ol className={cn('trayport-timeline', className)} {...props}>
      {model.items.map((item) => (
        <li key={item.key}>
          <span>{item.label}</span>
          {item.title ? <h3>{item.title}</h3> : null}
          {item.body}
        </li>
      ))}
    </ol>
  )
}

export interface DataTablePresentationProps extends HTMLAttributes<HTMLDivElement> {
  model: DataTablePresentationModel
}

export function DataTablePresentation({ className, model, ...props }: DataTablePresentationProps) {
  const isHeaderless = model.headers.length === 0
  const headerlessColumnCount = Math.max(1, ...model.rows.map((row) => row.cells.length))

  return (
    <div
      aria-label={model.caption || 'Data table'}
      className={cn('trayport-table-wrap', className)}
      role="region"
      tabIndex={0}
      {...props}
    >
      {isHeaderless ? (
        <>
          {model.caption ? <p className="trayport-data-grid__caption">{model.caption}</p> : null}
          <ul
            className="trayport-data-grid"
            role="list"
            style={
              {
                '--trayport-data-grid-columns': headerlessColumnCount,
              } as CSSProperties
            }
          >
            {model.rows.flatMap((row) =>
              row.cells.map((cell) => <li key={`${row.key}-${cell.key}`}>{cell.text}</li>),
            )}
          </ul>
        </>
      ) : (
        <table className="trayport-table">
          {model.caption ? <caption>{model.caption}</caption> : null}
          <thead>
            <tr>
              {model.headers.map((header) => (
                <th key={header.key} scope="col">
                  {header.visuallyHidden ? (
                    <span className="sr-only">{header.text}</span>
                  ) : (
                    header.text
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {model.rows.map((row) => (
              <tr key={row.key}>
                {row.cells.map((cell) => (
                  <td key={cell.key}>{cell.text}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export interface GalleryPresentationProps extends HTMLAttributes<HTMLDivElement> {
  model: GalleryPresentationModel
}

export function GalleryPresentation({ className, model, ...props }: GalleryPresentationProps) {
  return (
    <div className={cn('trayport-gallery', className)} {...props}>
      {model.items.map((item) => (
        <figure key={item.key}>
          {item.media}
          {item.caption ? <figcaption>{item.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  )
}
