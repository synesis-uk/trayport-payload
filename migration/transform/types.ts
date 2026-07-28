export type LegacyReference = {
  $legacyRef: 'media' | 'venue' | 'article-category' | 'asset-class' | 'venue-type' | 'region'
  legacyId: number
}

export type TargetCollection =
  | 'media'
  | 'pages'
  | 'articles'
  | 'hubs'
  | 'venues'
  | 'article-categories'
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
