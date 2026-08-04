// @vitest-environment node

import { Children, isValidElement, Suspense, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ListingPresentationModel } from '@/components/blocks/layoutPresentation'
import type {
  ArticleListingBlock,
  ContentSectionBlock,
  LearningVideoListingBlock,
  TrayportHeroBlock,
} from '@/payload-types'

const harness = vi.hoisted(() => ({
  loadArticleListing: vi.fn(),
  loadLearningVideoListing: vi.fn(),
}))

vi.mock('@/data/listingContent.server', () => ({
  loadArticleListing: harness.loadArticleListing,
  loadLearningVideoListing: harness.loadLearningVideoListing,
}))

vi.mock('@/components/RichText', () => ({
  default: () => null,
}))

vi.mock('@/components/Trayport/DynamicArticleListing.client', () => ({
  DynamicArticleListing: () => null,
}))

vi.mock('@/components/Trayport/DynamicLearningVideoListing.client', () => ({
  DynamicLearningVideoListing: () => null,
}))

vi.mock('@/components/blocks/layoutPresentation', () => ({
  ArticleListingPresentation: () => null,
  LearningVideoListingPresentation: () => null,
}))

import {
  ArticleListingBlockAdapter,
  LearningVideoListingBlockAdapter,
} from '@/components/blocks/layoutServerAdapters'
import { TrayportBlocks } from '@/components/blocks/registry'

const lexicalBody = {
  root: {
    children: [],
    direction: null,
    format: '' as const,
    indent: 0,
    type: 'root',
    version: 1,
  },
}

const articleListingBlock = {
  blockType: 'articleListing',
  family: 'news',
  intro: lexicalBody,
  pageSize: 0,
  showCategoryFilter: true,
} satisfies ArticleListingBlock

const learningListingBlock = {
  blockType: 'learningVideoListing',
  intro: lexicalBody,
  pageSize: 0,
  showCategoryFilter: true,
  showProductFilter: true,
} satisfies LearningVideoListingBlock

beforeEach(() => {
  harness.loadArticleListing.mockReset()
  harness.loadLearningVideoListing.mockReset()
})

describe('typed layout server adapters', () => {
  it('keeps article selection and family filtering at the server boundary', async () => {
    const docs = [{ id: 1, title: 'News item' }]
    harness.loadArticleListing.mockResolvedValue(docs)

    const element = await ArticleListingBlockAdapter({
      block: articleListingBlock,
      draft: false,
      index: 0,
    })

    expect(harness.loadArticleListing).toHaveBeenCalledWith('news', { draft: false })
    expect(isValidElement<{ model: ListingPresentationModel }>(element)).toBe(true)
    if (!isValidElement<{ model: ListingPresentationModel }>(element)) return

    const listing = element.props.model.listing
    expect(isValidElement(listing)).toBe(true)
    if (
      !isValidElement<{
        articles: unknown[]
        family: string
        initialPageSize: number
        showCategoryFilter: boolean
      }>(listing)
    ) {
      return
    }
    expect(listing.props).toMatchObject({
      articles: docs,
      family: 'news',
      initialPageSize: 12,
      showCategoryFilter: true,
    })
  })

  it('keeps the bounded learning-video projection and controls at the server boundary', async () => {
    const docs = [{ id: 2, title: 'Learning video' }]
    harness.loadLearningVideoListing.mockResolvedValue(docs)

    const element = await LearningVideoListingBlockAdapter({
      block: learningListingBlock,
      draft: true,
      index: 0,
    })

    expect(harness.loadLearningVideoListing).toHaveBeenCalledWith({ draft: true })
    expect(isValidElement<{ model: ListingPresentationModel }>(element)).toBe(true)
    if (!isValidElement<{ model: ListingPresentationModel }>(element)) return

    const listing = element.props.model.listing
    expect(isValidElement(listing)).toBe(true)
    if (
      !isValidElement<{
        initialPageSize: number
        showCategoryFilter: boolean
        showProductFilter: boolean
        videos: unknown[]
      }>(listing)
    ) {
      return
    }
    expect(listing.props).toMatchObject({
      initialPageSize: 15,
      showCategoryFilter: true,
      showProductFilter: true,
      videos: docs,
    })
  })

  it('dispatches every top-level block without a union-component cast', async () => {
    const hero = {
      appearance: 'light',
      blockType: 'trayportHero',
      heading: 'Hero',
    } satisfies TrayportHeroBlock
    const content = {
      backgroundOpacity: 'none',
      blockType: 'contentSection',
      columnGap: 'regular',
      columns: [],
      spacingBottom: 'regular',
      spacingTop: 'regular',
      surfacePadding: 'none',
      surfaceRadius: 'default',
      surfaceTone: 'none',
      width: 'wide',
      wrapperTheme: 'none',
    } satisfies ContentSectionBlock
    const blocks = [hero, content, articleListingBlock, learningListingBlock]

    const fragment = await TrayportBlocks({ blocks })
    expect(isValidElement(fragment)).toBe(true)
    if (!isValidElement<{ children: ReactNode }>(fragment)) return

    const children = Children.toArray(fragment.props.children)
    expect(children).toHaveLength(4)
    expect(
      children.map((child) => (isValidElement(child) && child.type === Suspense ? true : false)),
    ).toEqual([false, false, true, true])

    const adapters = children.map((child) => {
      if (!isValidElement<{ children?: ReactNode }>(child) || child.type !== Suspense) return child
      return Children.only(child.props.children)
    })
    expect(
      adapters.map((child) =>
        isValidElement<{ block: { blockType: string } }>(child)
          ? child.props.block.blockType
          : null,
      ),
    ).toEqual(['trayportHero', 'contentSection', 'articleListing', 'learningVideoListing'])
    expect(
      adapters.map((child) =>
        isValidElement<{ draft: boolean }>(child) ? child.props.draft : null,
      ),
    ).toEqual([undefined, false, false, false])

    for (const child of children.slice(2)) {
      expect(isValidElement<{ fallback?: ReactNode }>(child)).toBe(true)
      if (!isValidElement<{ fallback?: ReactNode }>(child)) continue
      expect(isValidElement(child.props.fallback)).toBe(true)
    }
  })
})
