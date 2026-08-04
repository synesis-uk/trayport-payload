import type {
  ActionsComponent,
  DataTableComponent,
  EntityListComponent,
  FAQComponent,
  FeatureListComponent,
  GalleryComponent,
  HeadingComponent,
  RichTextComponent,
  StatisticsComponent,
  StandaloneIconComponent,
  TimelineComponent,
  TrayportMediaComponent,
  TrayportHeroBlock,
} from '@/payload-types'
import type { ContentLink } from '@/routing/contentLink'
import { resolveContentLink } from '@/routing/contentLink'

import type {
  ActionPresentationModel,
  ActionsPresentationModel,
  DataTablePresentationModel,
  EntityListPresentationModel,
  FAQPresentationModel,
  FeatureListPresentationModel,
  GalleryPresentationModel,
  HeadingPresentationModel,
  MediaPresentationModel,
  RichTextPresentationModel,
  StatisticsPresentationModel,
  StandaloneIconPresentationModel,
  TimelinePresentationModel,
  TrayportHeroPresentationModel,
} from './presentation'

type PayloadAction = NonNullable<ActionsComponent['actions']>[number]

const normalizeContentLink = (action: PayloadAction): ContentLink => {
  const reference = action.link.reference

  return {
    label: action.label,
    newTab: action.link.newTab,
    reference: reference
      ? {
          relationTo: reference.relationTo,
          value: reference.value,
        }
      : undefined,
    type: action.link.type,
    url: action.link.url,
  }
}

export const normalizeActions = (
  actions?: readonly PayloadAction[] | null,
): ActionPresentationModel[] =>
  (actions || []).flatMap((action, index) => {
    const link = normalizeContentLink(action)

    if (!action.label || resolveContentLink(link).href === '#') return []

    return [
      {
        appearance: action.style,
        icon: action.icon || undefined,
        key: action.id || `${action.label}-${index}`,
        label: action.label,
        link,
      },
    ]
  })

export const normalizeActionsComponent = (
  component: ActionsComponent,
): ActionsPresentationModel => ({
  actions: normalizeActions(component.actions),
})

export const normalizeHeadingComponent = (
  component: HeadingComponent,
): HeadingPresentationModel => {
  const eyebrow = component.eyebrow?.trim() || undefined
  const heading = component.text.trim()

  return {
    appearance: component.appearance || component.level,
    eyebrow,
    eyebrowOnly: eyebrow === heading || undefined,
    heading,
    level: component.level === 'h3' ? 3 : component.level === 'h4' ? 4 : 2,
  }
}

export const normalizeStatisticsComponent = (
  component: StatisticsComponent,
): StatisticsPresentationModel => ({
  items: component.items.map((item, index) => ({
    description: item.description || undefined,
    key: item.id || `${item.label}-${index}`,
    label: item.label,
    value: item.value,
  })),
})

export type TrayportHeroPresentationSlots = Pick<TrayportHeroPresentationModel, 'body' | 'media'>

export const normalizeTrayportHeroBlock = (
  block: TrayportHeroBlock,
  slots: TrayportHeroPresentationSlots = {},
): TrayportHeroPresentationModel => ({
  actions: normalizeActions(block.actions),
  appearance: block.appearance,
  badge: block.badgeLabel
    ? {
        icon: block.badgeIcon || undefined,
        label: block.badgeLabel,
        tone: block.badgeTone || 'secondary',
      }
    : undefined,
  body: slots.body,
  eyebrow: block.eyebrow || undefined,
  heading: block.heading,
  media: slots.media,
  mediaAspect: block.mediaAspect || 'twoToOne',
  statistics: (block.statistics || []).map((item, index) => ({
    key: item.id || `${item.label}-${index}`,
    label: item.label,
    value: item.value,
  })),
})

export type RichTextPresentationSlots = Pick<RichTextPresentationModel, 'renderBody'>

export const normalizeRichTextComponent = (
  component: RichTextComponent,
  slots: RichTextPresentationSlots,
): RichTextPresentationModel => ({
  renderBody: slots.renderBody,
  size: component.size,
})

export type MediaPresentationSlots = Pick<MediaPresentationModel, 'media'>

export const normalizeMediaComponent = (
  component: TrayportMediaComponent,
  slots: MediaPresentationSlots,
): MediaPresentationModel => ({
  aspect: component.aspect || 'natural',
  caption: component.caption || undefined,
  media: slots.media,
})

type FeatureItem = FeatureListComponent['items'][number]

export interface FeaturePresentationSlot {
  body?: FeatureListPresentationModel['items'][number]['body']
  media?: FeatureListPresentationModel['items'][number]['media']
}

const normalizeFeatureLink = (
  link: FeatureItem['link'],
): { label: string; value: ContentLink } | undefined => {
  if (!link) return undefined

  const reference = link.reference
  const value: ContentLink = {
    label: link.label,
    newTab: link.newTab,
    reference: reference
      ? {
          relationTo: reference.relationTo,
          value: reference.value,
        }
      : undefined,
    type: link.type,
    url: link.url,
  }

  if (resolveContentLink(value).href === '#') return undefined

  return {
    label: value.label || 'Learn more',
    value,
  }
}

export const normalizeFeatureListComponent = (
  component: FeatureListComponent,
  slots: readonly FeaturePresentationSlot[] = [],
): FeatureListPresentationModel => ({
  items: component.items.map((item, index) => ({
    action:
      item.showAction && item.link
        ? (() => {
            const link = normalizeFeatureLink(item.link)
            return link
              ? {
                  appearance: item.actionStyle || 'link',
                  icon: item.actionIcon || undefined,
                  label: link.label,
                  link: link.value,
                }
              : undefined
          })()
        : undefined,
    body: slots[index]?.body,
    display: item.display || 'plain',
    icon: item.icon || undefined,
    key: item.id || `${item.title || ''}-${index}`,
    media: slots[index]?.media,
    title: item.title || undefined,
  })),
  presentation: component.presentation || 'grid',
})

export const normalizeStandaloneIconComponent = (
  component: StandaloneIconComponent,
): StandaloneIconPresentationModel => ({ icon: component.icon })

export interface FAQPresentationSlot {
  answer: FAQPresentationModel['items'][number]['answer']
  media?: FAQPresentationModel['items'][number]['media']
}

export const normalizeFAQComponent = (
  component: FAQComponent,
  slots: readonly FAQPresentationSlot[] = [],
): FAQPresentationModel => ({
  items: component.items.map((item, index) => ({
    answer: slots[index]?.answer,
    key: item.id || `${item.question}-${index}`,
    media: slots[index]?.media,
    question: item.question,
  })),
})

type EntityItem = EntityListComponent['items'][number]

const normalizeEntityLink = (link: EntityItem['link']): ContentLink | undefined => {
  if (!link) return undefined

  const reference = link.reference
  const value: ContentLink = {
    newTab: link.newTab,
    reference: reference
      ? {
          relationTo: reference.relationTo,
          value: reference.value,
        }
      : undefined,
    type: link.type,
    url: link.url,
  }

  return resolveContentLink(value).href === '#' ? undefined : value
}

export interface EntityPresentationSlot {
  description?: EntityListPresentationModel['items'][number]['description']
  renderMedia?: (showFallbackLink: boolean) => EntityListPresentationModel['items'][number]['media']
}

export const normalizeEntityListComponent = (
  component: EntityListComponent,
  slots: readonly EntityPresentationSlot[] = [],
): EntityListPresentationModel => ({
  items: component.items.map((item, index) => {
    const link = normalizeEntityLink(item.link)
    const slot = slots[index]

    return {
      description: slot?.description,
      key: item.id || `${item.title}-${index}`,
      link,
      media: slot?.renderMedia?.(!link),
      title: item.title,
    }
  }),
  kind: component.kind,
})

export interface TimelinePresentationSlot {
  body?: TimelinePresentationModel['items'][number]['body']
}

export const normalizeTimelineComponent = (
  component: TimelineComponent,
  slots: readonly TimelinePresentationSlot[] = [],
): TimelinePresentationModel => ({
  items: component.items.map((item, index) => ({
    body: slots[index]?.body,
    key: item.id || `${item.label}-${index}`,
    label: item.label,
    title: item.title?.trim() || undefined,
  })),
})

export const normalizeDataTableComponent = (
  component: DataTableComponent,
): DataTablePresentationModel => {
  const headers: DataTablePresentationModel['headers'] = (component.headers || []).map(
    (header, index) => ({
      key: header.id || `header-${index}`,
      text: header.text,
    }),
  )
  const rows: DataTablePresentationModel['rows'] = (component.rows || []).map((row, rowIndex) => ({
    cells: (row.cells || []).map((cell, cellIndex) => ({
      key: cell.id || `cell-${cellIndex}`,
      text: cell.text,
    })),
    key: row.id || `row-${rowIndex}`,
  }))

  if (!headers.length) {
    return {
      caption: component.caption || undefined,
      headers,
      rows,
    }
  }

  const columnCount = Math.max(headers.length, ...rows.map((row) => row.cells.length))
  const normalizedHeaders = Array.from({ length: columnCount }, (_, index) =>
    headers[index]
      ? headers[index]
      : {
          key: `generated-header-${index}`,
          text: `Column ${index + 1}`,
          visuallyHidden: true,
        },
  )
  const normalizedRows = rows.map((row) => ({
    ...row,
    cells: Array.from(
      { length: columnCount },
      (_, index) =>
        row.cells[index] || {
          key: `${row.key}-cell-${index}`,
          text: '',
        },
    ),
  }))

  return {
    caption: component.caption || undefined,
    headers: normalizedHeaders,
    rows: normalizedRows,
  }
}

export interface GalleryPresentationSlot {
  media: GalleryPresentationModel['items'][number]['media']
}

export const normalizeGalleryComponent = (
  component: GalleryComponent,
  slots: readonly GalleryPresentationSlot[] = [],
): GalleryPresentationModel => ({
  items: component.items.map((item, index) => ({
    caption: item.caption || undefined,
    key: item.id || `gallery-${index}`,
    media: slots[index]?.media,
  })),
})
