import RichText from '@/components/RichText'
import { TrayportMedia } from '@/components/Trayport/TrayportMedia'

import {
  normalizeActionsComponent,
  normalizeDataTableComponent,
  normalizeEntityListComponent,
  normalizeFAQComponent,
  normalizeFeatureListComponent,
  normalizeGalleryComponent,
  normalizeHeadingComponent,
  normalizeMediaComponent,
  normalizeRichTextComponent,
  normalizeStatisticsComponent,
  normalizeStandaloneIconComponent,
  normalizeTimelineComponent,
  normalizeTrayportHeroBlock,
} from './normalizers'
import {
  ActionsPresentation,
  DataTablePresentation,
  EntityListPresentation,
  FAQPresentation,
  FeatureListPresentation,
  GalleryPresentation,
  HeadingPresentation,
  MediaPresentation,
  RichTextPresentation,
  StatisticsPresentation,
  StandaloneIconPresentation,
  TimelinePresentation,
  TrayportHeroPresentation,
} from './presentation'
import {
  normalizeDividerComponent,
  normalizeEmbedComponent,
  normalizeOfficeComponent,
} from './specialistNormalizers'
import {
  DividerPresentation,
  EmbedPresentation,
  OfficePresentation,
} from './specialistPresentation'
import type { TrayportLayoutBlockAdapterProps, TrayportSectionComponentAdapterProps } from './types'

export const HeadingComponentAdapter = ({
  block,
}: TrayportSectionComponentAdapterProps<'heading'>) => (
  <HeadingPresentation model={normalizeHeadingComponent(block)} />
)

export const ActionsComponentAdapter = ({
  block,
}: TrayportSectionComponentAdapterProps<'actions'>) => (
  <ActionsPresentation model={normalizeActionsComponent(block)} />
)

export const StatisticsComponentAdapter = ({
  block,
}: TrayportSectionComponentAdapterProps<'statistics'>) => (
  <StatisticsPresentation model={normalizeStatisticsComponent(block)} />
)

export const StandaloneIconComponentAdapter = ({
  block,
}: TrayportSectionComponentAdapterProps<'standaloneIcon'>) => (
  <StandaloneIconPresentation model={normalizeStandaloneIconComponent(block)} />
)

export const RichTextComponentAdapter = ({
  block,
}: TrayportSectionComponentAdapterProps<'richText'>) => (
  <RichTextPresentation
    model={normalizeRichTextComponent(block, {
      renderBody: (className) => (
        <RichText className={className} data={block.body} enableGutter={false} />
      ),
    })}
  />
)

export const MediaComponentAdapter = ({ block }: TrayportSectionComponentAdapterProps<'media'>) => (
  <MediaPresentation
    model={normalizeMediaComponent(block, {
      media: <TrayportMedia externalURL={block.externalURL} media={block.media} />,
    })}
  />
)

export const FeatureListComponentAdapter = ({
  block,
}: TrayportSectionComponentAdapterProps<'featureList'>) => {
  const slots = block.items.map((item) => ({
    body: item.body ? (
      <RichText className="trayport-richtext" data={item.body} enableGutter={false} />
    ) : undefined,
    media: item.media ? (
      <TrayportMedia className="trayport-feature__media" media={item.media} />
    ) : undefined,
  }))

  return <FeatureListPresentation model={normalizeFeatureListComponent(block, slots)} />
}

export const FAQComponentAdapter = ({ block }: TrayportSectionComponentAdapterProps<'faq'>) => {
  const slots = block.items.map((item) => ({
    answer: <RichText className="trayport-richtext" data={item.answer} enableGutter={false} />,
    media: item.media ? <TrayportMedia media={item.media} showFallbackLink={false} /> : undefined,
  }))

  return <FAQPresentation model={normalizeFAQComponent(block, slots)} />
}

export const EntityListComponentAdapter = ({
  block,
}: TrayportSectionComponentAdapterProps<'entityList'>) => {
  const slots = block.items.map((item) => ({
    description: item.description ? (
      <RichText className="trayport-richtext" data={item.description} enableGutter={false} />
    ) : undefined,
    renderMedia: item.media
      ? (showFallbackLink: boolean) => (
          <TrayportMedia
            className="trayport-entity__media"
            media={item.media}
            showFallbackLink={showFallbackLink}
          />
        )
      : undefined,
  }))

  return <EntityListPresentation model={normalizeEntityListComponent(block, slots)} />
}

export const TimelineComponentAdapter = ({
  block,
}: TrayportSectionComponentAdapterProps<'timeline'>) => {
  const slots = block.items.map((item) => ({
    body: item.body ? (
      <RichText className="trayport-richtext" data={item.body} enableGutter={false} />
    ) : undefined,
  }))

  return <TimelinePresentation model={normalizeTimelineComponent(block, slots)} />
}

export const DataTableComponentAdapter = ({
  block,
}: TrayportSectionComponentAdapterProps<'dataTable'>) => (
  <DataTablePresentation model={normalizeDataTableComponent(block)} />
)

export const GalleryComponentAdapter = ({
  block,
}: TrayportSectionComponentAdapterProps<'gallery'>) => {
  const slots = block.items.map((item) => ({
    media: <TrayportMedia media={item.media} />,
  }))

  return <GalleryPresentation model={normalizeGalleryComponent(block, slots)} />
}

export const DividerComponentAdapter = ({
  block,
}: TrayportSectionComponentAdapterProps<'divider'>) => (
  <DividerPresentation model={normalizeDividerComponent(block)} />
)

export const EmbedComponentAdapter = ({ block }: TrayportSectionComponentAdapterProps<'embed'>) => (
  <EmbedPresentation model={normalizeEmbedComponent(block)} />
)

export const OfficeComponentAdapter = ({
  block,
}: TrayportSectionComponentAdapterProps<'office'>) => {
  const model = normalizeOfficeComponent(block)

  return model ? <OfficePresentation model={model} /> : null
}

export const TrayportHeroBlockAdapter = ({
  block,
  index,
}: TrayportLayoutBlockAdapterProps<'trayportHero'>) => {
  const body = block.body ? <RichText data={block.body} enableGutter={false} /> : undefined
  const displaysMedia =
    block.appearance === 'image' && Boolean(block.media || block.externalVideoURL)
  const media = displaysMedia ? (
    <TrayportMedia
      background
      externalURL={block.externalVideoURL}
      media={block.media}
      preload={index === 0}
    />
  ) : undefined

  return <TrayportHeroPresentation model={normalizeTrayportHeroBlock(block, { body, media })} />
}
