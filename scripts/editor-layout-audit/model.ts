export type CountEntry = {
  count: number
  percentage: number
  value: string
}

export type PageLayoutSummary = {
  componentTypes: string[]
  contentSections: number
  label: string
  path: string | null
  title: string
  topLevelBlocks: string[]
}

export type ColumnPatternEntry = {
  count: number
  examples: string[]
  pattern: string
  percentage: number
}

export type CandidatePresetID =
  | 'market-matrix'
  | 'market-coverage-map'
  | 'chart-or-data-table'
  | 'faq'
  | 'statistics'
  | 'feature-grid'
  | 'media-gallery'
  | 'text-and-media'
  | 'media-and-text'
  | 'call-to-action-band'
  | 'text-with-actions'
  | 'intro-text'
  | 'advanced-custom-section'

export type CandidatePresetEntry = {
  count: number
  examples: string[]
  id: CandidatePresetID
  label: string
  percentage: number
  rationale: string
}

export type SectionControlName =
  | 'anchor'
  | 'surfaceTone'
  | 'wrapperTheme'
  | 'backgroundMedia'
  | 'backgroundOpacity'
  | 'surfaceRadius'
  | 'surfacePadding'
  | 'width'
  | 'spacingTop'
  | 'spacingBottom'
  | 'columnGap'
  | 'legacyAppearance'

export type SectionUsageAudit = {
  candidatePresets: CandidatePresetEntry[]
  columnPatterns: ColumnPatternEntry[]
  componentTypes: CountEntry[]
  pages: PageLayoutSummary[]
  schemaVersion: 1
  sectionControls: Record<SectionControlName, CountEntry[]>
  source: string
  summary: {
    columns: number
    components: number
    contentSections: number
    emptyColumns: number
    emptySections: number
    ignoredRecords: number
    inputRecords: number
    pageDocuments: number
    pagesWithLayout: number
    topLevelBlocks: number
  }
  topLevelBlockTypes: CountEntry[]
  warnings: string[]
}
