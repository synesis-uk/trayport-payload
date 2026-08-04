export const contentViewOwnership = {
  ArticleView: 'page-article',
  HubView: 'hub',
  LearningVideoView: 'learning-video',
  MarketCoverageIndexView: 'indexes',
  PageView: 'page-article',
  VenueIndexView: 'indexes',
  VenueView: 'venue',
  splitLeadingHero: 'shared',
} as const

export type ContentViewExportName = keyof typeof contentViewOwnership
export type ContentViewFamily = (typeof contentViewOwnership)[ContentViewExportName]
