import type { ReactNode } from 'react'

import { TrayportMedia } from '@/components/Trayport/TrayportMedia'

import { normalizeContentSectionBlock } from './layoutNormalizers'
import { ContentSectionPresentation } from './layoutPresentation'
import type { TrayportLayoutBlockAdapterProps, TrayportSectionComponent } from './types'

export interface ContentSectionBlockAdapterProps extends TrayportLayoutBlockAdapterProps<'contentSection'> {
  renderComponent: (component: TrayportSectionComponent, index: number) => ReactNode
}

export const ContentSectionBlockAdapter = ({
  block,
  renderComponent,
}: ContentSectionBlockAdapterProps) => {
  const background = block.backgroundMedia ? (
    <TrayportMedia background media={block.backgroundMedia} showFallbackLink={false} />
  ) : undefined
  const columns = block.columns.map((column) => ({
    background: column.backgroundMedia ? (
      <TrayportMedia
        background
        composition="content"
        media={column.backgroundMedia}
        showFallbackLink={false}
      />
    ) : undefined,
    components: column.components.map(renderComponent),
  }))

  return (
    <ContentSectionPresentation
      model={normalizeContentSectionBlock(block, { background, columns })}
    />
  )
}
