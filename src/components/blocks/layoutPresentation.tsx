import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/utilities/ui'

export interface ContentSectionPresentationColumn {
  background?: ReactNode
  backgroundOpacity: 'none' | '10' | '20' | '50'
  border: 'none' | 'subtle'
  componentGap: 'none' | 'regular'
  componentTypes: ContentSectionComponentType[]
  components: ReactNode[]
  heightMode: 'content' | 'fill'
  horizontalAlign: 'center' | 'left'
  key: string
  padding: 'medium' | 'none'
  radius: 'default' | 'xl'
  span: number
  surface: 'muted' | 'none' | 'soft'
  verticalAlign: 'center' | 'start'
}

export type ContentSectionComponentType =
  | 'actions'
  | 'checklist'
  | 'dataChart'
  | 'dataTable'
  | 'divider'
  | 'embed'
  | 'entityList'
  | 'faq'
  | 'featureList'
  | 'gallery'
  | 'heading'
  | 'hubspotForm'
  | 'lifecycle'
  | 'marketCoverage'
  | 'marketMatrix'
  | 'media'
  | 'office'
  | 'peopleList'
  | 'richText'
  | 'standaloneIcon'
  | 'statistics'
  | 'timeline'

const componentTypeClassName = (type: ContentSectionComponentType) =>
  type.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)

export interface ContentSectionPresentationModel {
  anchor?: string
  background?: ReactNode
  backgroundOpacity: 'none' | '10' | '20' | '50'
  columnGap: 'regular' | 'tight'
  columns: ContentSectionPresentationColumn[]
  spacingBottom: 'large' | 'regular' | 'tight'
  spacingTop: 'large' | 'regular' | 'tight'
  surfacePadding: 'medium' | 'none'
  surfaceRadius: 'default' | 'xl'
  surfaceTone: 'dark' | 'none' | 'softBlue' | 'white'
  width: 'reading' | 'standard' | 'wide' | 'full'
  wrapperTheme: 'none' | 'softBlue' | 'green' | 'dark'
}

export interface ListingPresentationModel {
  eyebrow: string
  heading: string
  intro?: ReactNode
  listing: ReactNode
}

interface ContentSectionColumnProps extends HTMLAttributes<HTMLDivElement> {
  column: ContentSectionPresentationColumn
}

function ContentSectionColumn({ className, column, ...props }: ContentSectionColumnProps) {
  return (
    <div
      className={cn(
        'trayport-column',
        `trayport-column--align-${column.horizontalAlign}`,
        `trayport-column--valign-${column.verticalAlign}`,
        `trayport-column--height-${column.heightMode}`,
        `trayport-column--gap-${column.componentGap}`,
        `trayport-column--padding-${column.padding}`,
        `trayport-column--surface-${column.surface}`,
        `trayport-column--border-${column.border}`,
        `trayport-column--radius-${column.radius}`,
        ...column.componentTypes.map(
          (type) => `trayport-column--has-${componentTypeClassName(type)}`,
        ),
        className,
      )}
      style={{ '--trayport-span': column.span } as CSSProperties}
      {...props}
    >
      {column.background ? (
        <div
          aria-hidden
          className="trayport-column__background"
          data-opacity={column.backgroundOpacity}
        >
          {column.background}
        </div>
      ) : null}
      <div className="trayport-column__content">{column.components}</div>
    </div>
  )
}

export interface ContentSectionPresentationProps extends HTMLAttributes<HTMLElement> {
  model: ContentSectionPresentationModel
}

export function ContentSectionPresentation({
  className,
  model,
  ...props
}: ContentSectionPresentationProps) {
  const componentTypes = Array.from(
    new Set(model.columns.flatMap((column) => column.componentTypes)),
  )

  return (
    <section
      className={cn(
        'trayport-section',
        `trayport-section--space-top-${model.spacingTop}`,
        `trayport-section--space-bottom-${model.spacingBottom}`,
        `trayport-section--wrapper-${model.wrapperTheme}`,
        ...componentTypes.map((type) => `trayport-section--has-${componentTypeClassName(type)}`),
        className,
      )}
      id={model.anchor}
      {...props}
    >
      <div className={`trayport-container trayport-container--${model.width}`}>
        <div
          className={cn(
            'trayport-section__surface',
            `trayport-section__surface--tone-${model.surfaceTone}`,
            `trayport-section__surface--radius-${model.surfaceRadius}`,
            `trayport-section__surface--padding-${model.surfacePadding}`,
          )}
        >
          {model.background ? (
            <div
              aria-hidden
              className="trayport-section__background"
              data-opacity={model.backgroundOpacity}
            >
              {model.background}
            </div>
          ) : null}
          <div className={`trayport-grid trayport-grid--gap-${model.columnGap}`}>
            {model.columns.map((column) => (
              <ContentSectionColumn column={column} key={column.key} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ListingHeader({ model }: { model: ListingPresentationModel }) {
  return (
    <div className="trayport-listing__header">
      <p className="trayport-eyebrow">{model.eyebrow}</p>
      <h2>{model.heading}</h2>
      {model.intro}
    </div>
  )
}

export function ArticleListingPresentation({ model }: { model: ListingPresentationModel }) {
  return (
    <section className="trayport-listing trayport-section trayport-section--light">
      <div className="trayport-container">
        <ListingHeader model={model} />
        {model.listing}
      </div>
    </section>
  )
}

export function LearningVideoListingPresentation({ model }: { model: ListingPresentationModel }) {
  return (
    <section className="trayport-learning-listing trayport-listing trayport-section trayport-section--light">
      <div className="trayport-container">
        <ListingHeader model={model} />
        {model.listing}
      </div>
    </section>
  )
}
