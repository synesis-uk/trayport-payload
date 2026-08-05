export type LegacyReference = {
  $legacyRef:
    | 'media'
    | 'page'
    | 'article'
    | 'hub'
    | 'venue'
    | 'learning-video'
    | 'lifecycle-item'
    | 'office'
    | 'article-category'
    | 'learning-video-category'
    | 'asset-class'
    | 'venue-type'
    | 'region'
  legacyId: number
}

export type TargetCollection =
  | 'media'
  | 'banners'
  | 'redirects'
  | 'pages'
  | 'articles'
  | 'hubs'
  | 'venues'
  | 'article-categories'
  | 'learning-video-categories'
  | 'learning-videos'
  | 'lifecycle-items'
  | 'offices'
  | 'asset-classes'
  | 'venue-types'
  | 'regions'

export type TargetRecord = {
  target: TargetCollection | 'global'
  globalSlug?: 'navigation' | 'footer' | 'site-settings'
  legacy: {
    source: 'wordpress'
    legacyId: number
    originalUrl: string
    modifiedGmt: string | null
    contentHash: string
  }
  data: Record<string, unknown>
}

export type TransformCoverage = {
  componentLayouts: Record<string, number>
  ignoredComponentLayouts: Record<string, { count: number; reason: string }>
  topLevelLayouts: Record<string, number>
  ignoredTaxonomies: Record<string, number>
  unsupportedComponentLayouts: string[]
  unsupportedTopLevelLayouts: string[]
}
