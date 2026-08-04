import 'server-only'

import RichText from '@/components/RichText'
import { AppIcon } from '@/components/icons'
import { DynamicArticleListing } from '@/components/Trayport/DynamicArticleListing.client'
import { DynamicLearningVideoListing } from '@/components/Trayport/DynamicLearningVideoListing.client'
import { loadArticleListing, loadLearningVideoListing } from '@/data/listingContent.server'

import {
  normalizeArticleListingBlock,
  normalizeLearningVideoListingBlock,
} from './layoutNormalizers'
import { ArticleListingPresentation, LearningVideoListingPresentation } from './layoutPresentation'
import type { TrayportDraftAwareLayoutBlockAdapterProps } from './types'

export const ArticleListingBlockAdapter = async ({
  block,
  draft = false,
  searchQuery = '',
}: TrayportDraftAwareLayoutBlockAdapterProps<'articleListing'> & { searchQuery?: string }) => {
  const family = block.family || 'insights'
  const articles = await loadArticleListing(family, { draft })
  const intro = block.intro ? (
    <RichText className="trayport-richtext" data={block.intro} enableGutter={false} />
  ) : undefined
  const listing = (
    <DynamicArticleListing
      articles={articles}
      family={family}
      icons={{
        arrowRight: <AppIcon aria-hidden className="size-4" name="arrowRight" />,
        calendar: (
          <AppIcon aria-hidden className="trayport-article-row__icon size-[15px]" name="calendar" />
        ),
        externalLink: <AppIcon aria-hidden className="size-4" name="externalLink" />,
        news: (
          <AppIcon aria-hidden className="trayport-article-row__icon size-[15px]" name="news" />
        ),
        search: <AppIcon aria-hidden className="size-[18px]" name="search" />,
        searchInsight: (
          <AppIcon
            aria-hidden
            className="trayport-article-row__icon size-[15px]"
            name="searchInsight"
          />
        ),
      }}
      initialPageSize={Number(block.pageSize) || 12}
      initialQuery={searchQuery}
      key={`article-listing:${searchQuery}`}
      showCategoryFilter={Boolean(block.showCategoryFilter)}
    />
  )

  return (
    <ArticleListingPresentation model={normalizeArticleListingBlock(block, { intro, listing })} />
  )
}

export const LearningVideoListingBlockAdapter = async ({
  block,
  draft = false,
}: TrayportDraftAwareLayoutBlockAdapterProps<'learningVideoListing'>) => {
  const videos = await loadLearningVideoListing({ draft })
  const intro = block.intro ? (
    <RichText className="trayport-richtext" data={block.intro} enableGutter={false} />
  ) : undefined
  const listing = (
    <DynamicLearningVideoListing
      icons={{
        arrowRight: <AppIcon aria-hidden className="size-4" name="arrowRight" />,
        externalLink: <AppIcon aria-hidden className="size-4" name="externalLink" />,
        lock: <AppIcon aria-hidden className="size-5" name="lock" />,
      }}
      initialPageSize={Number(block.pageSize) || 15}
      showCategoryFilter={Boolean(block.showCategoryFilter)}
      showProductFilter={Boolean(block.showProductFilter)}
      videos={videos}
    />
  )

  return (
    <LearningVideoListingPresentation
      model={normalizeLearningVideoListingBlock(block, { intro, listing })}
    />
  )
}
