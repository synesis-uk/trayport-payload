import { Suspense, type ReactElement } from 'react'

import {
  ActionsComponentAdapter,
  DataTableComponentAdapter,
  DividerComponentAdapter,
  EmbedComponentAdapter,
  EntityListComponentAdapter,
  FAQComponentAdapter,
  FeatureListComponentAdapter,
  GalleryComponentAdapter,
  HeadingComponentAdapter,
  HubSpotFormComponentAdapter,
  MediaComponentAdapter,
  OfficeComponentAdapter,
  RichTextComponentAdapter,
  StatisticsComponentAdapter,
  StandaloneIconComponentAdapter,
  TimelineComponentAdapter,
  TrayportHeroBlockAdapter,
} from './adapters'
import { ContentSectionBlockAdapter } from './layoutAdapters'
import { PeopleListComponentAdapter } from './peopleListAdapter.server'
import { ChecklistComponentAdapter, LifecycleComponentAdapter } from './checklistLifecycleAdapters'
import {
  ArticleListingBlockAdapter,
  LearningVideoListingBlockAdapter,
} from './layoutServerAdapters'
import {
  DataChartComponentAdapter,
  MarketCoverageComponentAdapter,
  MarketMatrixComponentAdapter,
} from './serverAdapters'
import type {
  TrayportLayoutBlock,
  TrayportLayoutBlockAdapterProps,
  TrayportLayoutBlockAdapterRegistry,
  TrayportSectionComponent,
  TrayportSectionComponentAdapterRegistry,
} from './types'

export const trayportSectionComponentAdapterRegistry = {
  heading: HeadingComponentAdapter,
  hubspotForm: HubSpotFormComponentAdapter,
  richText: RichTextComponentAdapter,
  actions: ActionsComponentAdapter,
  media: MediaComponentAdapter,
  featureList: FeatureListComponentAdapter,
  statistics: StatisticsComponentAdapter,
  standaloneIcon: StandaloneIconComponentAdapter,
  faq: FAQComponentAdapter,
  entityList: EntityListComponentAdapter,
  timeline: TimelineComponentAdapter,
  dataTable: DataTableComponentAdapter,
  gallery: GalleryComponentAdapter,
  divider: DividerComponentAdapter,
  marketCoverage: MarketCoverageComponentAdapter,
  embed: EmbedComponentAdapter,
  dataChart: DataChartComponentAdapter,
  marketMatrix: MarketMatrixComponentAdapter,
  checklist: ChecklistComponentAdapter,
  lifecycle: LifecycleComponentAdapter,
  office: OfficeComponentAdapter,
  peopleList: PeopleListComponentAdapter,
} satisfies TrayportSectionComponentAdapterRegistry

type KeyedTrayportBlock = {
  blockType: string
  id?: string | null
}

export const trayportBlockRenderKey = (block: KeyedTrayportBlock, index: number): string =>
  block.id || `${block.blockType}-${index}`

const assertNever = (value: never, boundary: string): never => {
  throw new Error(`Unsupported ${boundary}: ${JSON.stringify(value)}`)
}

const AsyncBlockFallback = ({ label }: { label: string }) => (
  <div
    aria-busy="true"
    aria-label={`Loading ${label}`}
    className="trayport-block-loading"
    data-async-block-fallback={label}
    role="status"
  >
    <span aria-hidden className="trayport-block-loading__heading" />
    <span aria-hidden className="trayport-block-loading__body" />
  </div>
)

const isTrayportSectionComponent = (value: unknown): value is TrayportSectionComponent => {
  if (!value || typeof value !== 'object' || !('blockType' in value)) return false
  return (
    typeof value.blockType === 'string' &&
    Object.hasOwn(trayportSectionComponentAdapterRegistry, value.blockType)
  )
}

const renderTrayportSectionComponent = (
  component: unknown,
  index: number,
  draft: boolean,
): ReactElement | null => {
  if (!isTrayportSectionComponent(component)) return null
  const key = trayportBlockRenderKey(component, index)

  switch (component.blockType) {
    case 'heading':
      return <HeadingComponentAdapter block={component} index={index} key={key} />
    case 'hubspotForm':
      return <HubSpotFormComponentAdapter block={component} index={index} key={key} />
    case 'richText':
      return <RichTextComponentAdapter block={component} index={index} key={key} />
    case 'actions':
      return <ActionsComponentAdapter block={component} index={index} key={key} />
    case 'media':
      return <MediaComponentAdapter block={component} index={index} key={key} />
    case 'featureList':
      return <FeatureListComponentAdapter block={component} index={index} key={key} />
    case 'statistics':
      return <StatisticsComponentAdapter block={component} index={index} key={key} />
    case 'standaloneIcon':
      return <StandaloneIconComponentAdapter block={component} index={index} key={key} />
    case 'faq':
      return <FAQComponentAdapter block={component} index={index} key={key} />
    case 'entityList':
      return <EntityListComponentAdapter block={component} index={index} key={key} />
    case 'timeline':
      return <TimelineComponentAdapter block={component} index={index} key={key} />
    case 'dataTable':
      return <DataTableComponentAdapter block={component} index={index} key={key} />
    case 'gallery':
      return <GalleryComponentAdapter block={component} index={index} key={key} />
    case 'divider':
      return <DividerComponentAdapter block={component} index={index} key={key} />
    case 'marketCoverage':
      return (
        <Suspense fallback={<AsyncBlockFallback label="market coverage" />} key={key}>
          <MarketCoverageComponentAdapter block={component} draft={draft} index={index} />
        </Suspense>
      )
    case 'embed':
      return <EmbedComponentAdapter block={component} index={index} key={key} />
    case 'dataChart':
      return (
        <Suspense fallback={<AsyncBlockFallback label="market data" />} key={key}>
          <DataChartComponentAdapter block={component} index={index} />
        </Suspense>
      )
    case 'marketMatrix':
      return (
        <Suspense fallback={<AsyncBlockFallback label="market matrix" />} key={key}>
          <MarketMatrixComponentAdapter block={component} draft={draft} index={index} />
        </Suspense>
      )
    case 'checklist':
      return <ChecklistComponentAdapter block={component} index={index} key={key} />
    case 'lifecycle':
      return <LifecycleComponentAdapter block={component} index={index} key={key} />
    case 'office':
      return <OfficeComponentAdapter block={component} index={index} key={key} />
    case 'peopleList':
      return (
        <Suspense fallback={<AsyncBlockFallback label="people" />} key={key}>
          <PeopleListComponentAdapter block={component} draft={draft} index={index} />
        </Suspense>
      )
  }

  return assertNever(component, 'Trayport section component')
}

const ContentSectionLayoutAdapter = ({
  block,
  draft = false,
  index,
}: TrayportLayoutBlockAdapterProps<'contentSection'> & { draft?: boolean }) => (
  <ContentSectionBlockAdapter
    block={block}
    index={index}
    renderComponent={(component, componentIndex) =>
      renderTrayportSectionComponent(component, componentIndex, draft)
    }
  />
)

export const trayportLayoutBlockAdapterRegistry = {
  trayportHero: TrayportHeroBlockAdapter,
  contentSection: ContentSectionLayoutAdapter,
  articleListing: ArticleListingBlockAdapter,
  learningVideoListing: LearningVideoListingBlockAdapter,
} satisfies TrayportLayoutBlockAdapterRegistry

const isTrayportLayoutBlock = (value: unknown): value is TrayportLayoutBlock => {
  if (!value || typeof value !== 'object' || !('blockType' in value)) return false
  return (
    typeof value.blockType === 'string' &&
    Object.hasOwn(trayportLayoutBlockAdapterRegistry, value.blockType)
  )
}

const renderTrayportLayoutBlock = (
  block: unknown,
  index: number,
  draft: boolean,
  searchQuery: string,
): ReactElement | null => {
  if (!isTrayportLayoutBlock(block)) return null
  const key = trayportBlockRenderKey(block, index)

  switch (block.blockType) {
    case 'trayportHero':
      return <TrayportHeroBlockAdapter block={block} index={index} key={key} />
    case 'contentSection':
      return <ContentSectionLayoutAdapter block={block} draft={draft} index={index} key={key} />
    case 'articleListing':
      return (
        <Suspense fallback={<AsyncBlockFallback label="articles" />} key={key}>
          <ArticleListingBlockAdapter
            block={block}
            draft={draft}
            index={index}
            searchQuery={searchQuery}
          />
        </Suspense>
      )
    case 'learningVideoListing':
      return (
        <Suspense fallback={<AsyncBlockFallback label="learning videos" />} key={key}>
          <LearningVideoListingBlockAdapter block={block} draft={draft} index={index} />
        </Suspense>
      )
  }

  return assertNever(block, 'Trayport layout block')
}

export interface TrayportBlocksProps {
  blocks?: readonly TrayportLayoutBlock[] | null
  draft?: boolean
  searchQuery?: string
}

export const TrayportBlocks = async ({
  blocks,
  draft = false,
  searchQuery = '',
}: TrayportBlocksProps) => {
  const values: readonly unknown[] = Array.isArray(blocks) ? blocks : []

  return (
    <>{values.map((block, index) => renderTrayportLayoutBlock(block, index, draft, searchQuery))}</>
  )
}
