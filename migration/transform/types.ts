export type LegacyReference = {
  $legacyRef:
    | 'media'
    | 'page'
    | 'article'
    | 'person'
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
  | 'people'
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
  /**
   * Source sections that mapped to no target block at all.
   *
   * The transform drops these silently — a supported layout whose component mapper returns nothing
   * simply vanishes, with no warning and no counter. That is correct for an unfilled ACF stub and a
   * content loss for anything else, and until this existed nothing could tell the two apart.
   * `article-detail-content-ownership` asserts that every drop had `hadContent: false`.
   */
  droppedSections: Array<{ layout: string; hadContent: boolean; scope: 'page' | 'article' }>
}

/**
 * A fresh, empty coverage accumulator.
 *
 * Shared so that adding a counter here does not silently leave call sites behind — seven specs and
 * the transform itself each built this literal by hand.
 */
export const emptyTransformCoverage = (): TransformCoverage => ({
  componentLayouts: {},
  ignoredComponentLayouts: {},
  topLevelLayouts: {},
  ignoredTaxonomies: {},
  unsupportedComponentLayouts: [],
  unsupportedTopLevelLayouts: [],
  droppedSections: [],
})
