import type { ComponentType } from 'react'

import type { ContentSectionBlock, Page } from '@/payload-types'

export type TrayportLayoutBlock = Page['layout'][number]
export type TrayportLayoutBlockType = TrayportLayoutBlock['blockType']

export type TrayportSectionComponent = ContentSectionBlock['columns'][number]['components'][number]
export type TrayportSectionComponentType = TrayportSectionComponent['blockType']

export interface BlockAdapterProps<Block> {
  block: Block
  index: number
}

export interface DraftAwareAdapterProps {
  /** Authenticated preview state; omitted direct uses are public by default. */
  draft?: boolean
}

export type TrayportLayoutBlockAdapterProps<Type extends TrayportLayoutBlockType> =
  BlockAdapterProps<Extract<TrayportLayoutBlock, { blockType: Type }>>

export type TrayportSectionComponentAdapterProps<Type extends TrayportSectionComponentType> =
  BlockAdapterProps<Extract<TrayportSectionComponent, { blockType: Type }>>

export type TrayportDraftAwareLayoutBlockAdapterProps<Type extends TrayportLayoutBlockType> =
  TrayportLayoutBlockAdapterProps<Type> & DraftAwareAdapterProps

export type TrayportDraftAwareSectionComponentAdapterProps<
  Type extends TrayportSectionComponentType,
> = TrayportSectionComponentAdapterProps<Type> & DraftAwareAdapterProps

export type TrayportLayoutBlockAdapterRegistry = {
  [Type in TrayportLayoutBlockType]: ComponentType<TrayportLayoutBlockAdapterProps<Type>>
}

export type TrayportSectionComponentAdapterRegistry = {
  [Type in TrayportSectionComponentType]: ComponentType<TrayportSectionComponentAdapterProps<Type>>
}
