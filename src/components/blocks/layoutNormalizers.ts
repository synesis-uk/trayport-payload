import type {
  ArticleListingBlock,
  ContentSectionBlock,
  LearningVideoListingBlock,
} from '@/payload-types'

import type {
  ContentSectionPresentationModel,
  ListingPresentationModel,
} from './layoutPresentation'

export interface ContentSectionPresentationSlots {
  background?: ContentSectionPresentationModel['background']
  columns: Array<
    Pick<ContentSectionPresentationModel['columns'][number], 'background' | 'components'>
  >
}

export const normalizeContentSectionBlock = (
  block: ContentSectionBlock,
  slots: ContentSectionPresentationSlots,
): ContentSectionPresentationModel => ({
  anchor: block.anchor || undefined,
  background: slots.background,
  backgroundOpacity: block.backgroundOpacity || 'none',
  columnGap: block.columnGap || 'regular',
  columns: block.columns.map((column, index) => ({
    background: slots.columns[index]?.background,
    backgroundOpacity: column.backgroundOpacity || 'none',
    border: column.border || 'none',
    componentGap: column.componentGap || 'regular',
    componentTypes: Array.from(new Set(column.components.map((component) => component.blockType))),
    components: slots.columns[index]?.components || [],
    heightMode: column.heightMode || 'fill',
    horizontalAlign: column.horizontalAlign || 'left',
    key: column.id || `column-${index}`,
    padding: column.padding || 'none',
    radius: column.radius || 'default',
    span: Number(column.span) || 12,
    surface: column.surface || 'none',
    verticalAlign: column.verticalAlign || 'start',
  })),
  spacingBottom: block.spacingBottom || 'regular',
  spacingTop: block.spacingTop || 'regular',
  surfacePadding: block.surfacePadding || 'none',
  surfaceRadius: block.surfaceRadius || 'default',
  surfaceTone: block.surfaceTone || 'none',
  width: block.width || 'wide',
  wrapperTheme: block.wrapperTheme || 'none',
})

export interface ListingPresentationSlots {
  intro?: ListingPresentationModel['intro']
  listing: ListingPresentationModel['listing']
}

export const normalizeArticleListingBlock = (
  block: ArticleListingBlock,
  slots: ListingPresentationSlots,
): ListingPresentationModel => ({
  eyebrow: 'Resources',
  heading: block.heading || 'Latest insights',
  intro: slots.intro,
  listing: slots.listing,
})

export const normalizeLearningVideoListingBlock = (
  block: LearningVideoListingBlock,
  slots: ListingPresentationSlots,
): ListingPresentationModel => ({
  eyebrow: 'Learning Hub',
  heading: block.heading || 'Explore the Learning Hub',
  intro: slots.intro,
  listing: slots.listing,
})
