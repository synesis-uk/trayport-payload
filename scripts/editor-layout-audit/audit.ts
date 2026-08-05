import type {
  CandidatePresetEntry,
  CandidatePresetID,
  ColumnPatternEntry,
  CountEntry,
  PageLayoutSummary,
  SectionControlName,
  SectionUsageAudit,
} from './model'

type UnknownRecord = Record<string, unknown>

type PageDocument = {
  label: string
  layout: UnknownRecord[]
  path: string | null
  title: string
}

type PresetDefinition = {
  id: CandidatePresetID
  label: string
  rationale: string
}

const presetDefinitions: PresetDefinition[] = [
  {
    id: 'market-matrix',
    label: 'Market matrix',
    rationale: 'Contains the purpose-built Market Matrix component.',
  },
  {
    id: 'market-coverage-map',
    label: 'Market coverage map',
    rationale: 'Contains global or regional market-coverage content.',
  },
  {
    id: 'chart-or-data-table',
    label: 'Chart or data table',
    rationale: 'Contains a managed chart or structured data table.',
  },
  {
    id: 'faq',
    label: 'FAQ',
    rationale: 'Contains an FAQ component, optionally introduced by editorial text.',
  },
  {
    id: 'statistics',
    label: 'Statistics',
    rationale: 'Contains a statistics block or a repeated standalone-icon treatment.',
  },
  {
    id: 'feature-grid',
    label: 'Feature grid',
    rationale: 'Contains feature or entity-list content arranged as a section.',
  },
  {
    id: 'media-gallery',
    label: 'Media gallery',
    rationale: 'Contains a gallery as the section’s specialist content.',
  },
  {
    id: 'text-and-media',
    label: 'Text and media',
    rationale: 'Uses two columns with editorial content followed by media.',
  },
  {
    id: 'media-and-text',
    label: 'Media and text',
    rationale: 'Uses two columns with media followed by editorial content.',
  },
  {
    id: 'call-to-action-band',
    label: 'Call-to-action band',
    rationale: 'Uses a dark surface with concise text and actions.',
  },
  {
    id: 'text-with-actions',
    label: 'Text with actions',
    rationale: 'Contains editorial text and actions without a specialist component.',
  },
  {
    id: 'intro-text',
    label: 'Intro text',
    rationale: 'Contains a single editorial column without specialist components.',
  },
  {
    id: 'advanced-custom-section',
    label: 'Advanced custom section',
    rationale: 'Uses a composition not covered by a safe, focused preset.',
  },
]

const sectionControlNames: SectionControlName[] = [
  'anchor',
  'surfaceTone',
  'wrapperTheme',
  'backgroundMedia',
  'backgroundOpacity',
  'surfaceRadius',
  'surfacePadding',
  'width',
  'spacingTop',
  'spacingBottom',
  'columnGap',
  'legacyAppearance',
]

const asRecord = (value: unknown): UnknownRecord | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : null

const asRecords = (value: unknown): UnknownRecord[] =>
  Array.isArray(value)
    ? value.flatMap((item) => (asRecord(item) ? [item as UnknownRecord] : []))
    : []

const increment = (counts: Map<string, number>, value: string): void => {
  counts.set(value, (counts.get(value) || 0) + 1)
}

const percentage = (count: number, total: number): number =>
  total ? Number(((count / total) * 100).toFixed(1)) : 0

const countEntries = (counts: Map<string, number>, total: number): CountEntry[] =>
  [...counts.entries()]
    .map(([value, count]) => ({ count, percentage: percentage(count, total), value }))
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value))

const scalarValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return 'not-set'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return 'set'
}

const presenceValue = (value: unknown): string =>
  value === null || value === undefined || value === '' ? 'not-set' : 'set'

const sectionControlValue = (name: SectionControlName, section: UnknownRecord): string => {
  switch (name) {
    case 'anchor':
      return presenceValue(section.anchor)
    case 'surfaceTone':
      return scalarValue(section.surfaceTone ?? section.theme)
    case 'backgroundMedia':
      return presenceValue(section.backgroundMedia)
    case 'spacingTop':
      return scalarValue(section.spacingTop ?? section.spacing)
    case 'spacingBottom':
      return scalarValue(section.spacingBottom ?? section.spacing)
    case 'legacyAppearance':
      return scalarValue(section.appearance)
    default:
      return scalarValue(section[name])
  }
}

const inputRecords = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value
  const record = asRecord(value)
  if (record && Array.isArray(record.docs)) return record.docs
  return [value]
}

const pageDocument = (value: unknown): PageDocument | null => {
  const record = asRecord(value)
  if (!record) return null

  if (typeof record.target === 'string' && record.target !== 'pages') return null
  const data = record.target === 'pages' ? asRecord(record.data) : record
  if (!data) return null

  const explicitlyPage = record.target === 'pages'
  if (!explicitlyPage && !Array.isArray(data.layout)) return null

  const title =
    typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Untitled page'
  const path =
    typeof data.path === 'string' && data.path.trim()
      ? data.path.trim()
      : typeof data.slug === 'string' && data.slug.trim()
        ? `/${data.slug.replace(/^\/+|\/+$/gu, '')}/`
        : null
  const label = path ? `${title} (${path})` : title

  return {
    label,
    layout: asRecords(data.layout),
    path,
    title,
  }
}

const componentTypesInColumn = (column: UnknownRecord): string[] =>
  asRecords(column.components).map(({ blockType }) =>
    typeof blockType === 'string' && blockType ? blockType : 'unknown',
  )

const componentTypesInSection = (section: UnknownRecord): string[] =>
  asRecords(section.columns).flatMap(componentTypesInColumn)

const hasAny = (types: Set<string>, candidates: string[]): boolean =>
  candidates.some((candidate) => types.has(candidate))

const isTextualColumn = (types: string[]): boolean =>
  types.some((type) => ['actions', 'heading', 'richText'].includes(type))

const isMediaColumn = (types: string[]): boolean =>
  types.some((type) => ['embed', 'gallery', 'media'].includes(type))

const isDarkSection = (section: UnknownRecord): boolean =>
  [section.surfaceTone, section.theme, section.wrapperTheme].some((value) => value === 'dark')

export const classifyCandidatePreset = (section: UnknownRecord): CandidatePresetID => {
  const columns = asRecords(section.columns)
  const types = componentTypesInSection(section)
  const typeSet = new Set(types)

  if (typeSet.has('marketMatrix')) return 'market-matrix'
  if (typeSet.has('marketCoverage')) return 'market-coverage-map'
  if (hasAny(typeSet, ['dataChart', 'dataTable'])) return 'chart-or-data-table'
  if (typeSet.has('faq')) return 'faq'
  if (typeSet.has('statistics') || types.filter((type) => type === 'standaloneIcon').length >= 2) {
    return 'statistics'
  }
  if (hasAny(typeSet, ['entityList', 'featureList'])) return 'feature-grid'
  if (typeSet.has('gallery')) return 'media-gallery'

  if (columns.length === 2) {
    const firstTypes = componentTypesInColumn(columns[0] as UnknownRecord)
    const secondTypes = componentTypesInColumn(columns[1] as UnknownRecord)
    if (isTextualColumn(firstTypes) && isMediaColumn(secondTypes)) return 'text-and-media'
    if (isMediaColumn(firstTypes) && isTextualColumn(secondTypes)) return 'media-and-text'
  }

  const ordinaryContentTypes = new Set(['actions', 'divider', 'heading', 'richText'])
  const containsOnlyOrdinaryContent = types.every((type) => ordinaryContentTypes.has(type))
  if (typeSet.has('actions') && containsOnlyOrdinaryContent && isDarkSection(section)) {
    return 'call-to-action-band'
  }
  if (typeSet.has('actions') && containsOnlyOrdinaryContent) return 'text-with-actions'
  if (columns.length === 1 && types.length > 0 && containsOnlyOrdinaryContent) return 'intro-text'
  return 'advanced-custom-section'
}

const columnPattern = (section: UnknownRecord): string => {
  const columns = asRecords(section.columns)
  if (!columns.length) return '(empty)'
  return columns.map(({ span }) => scalarValue(span)).join(' + ')
}

const deduplicatedSortedExamples = (examples: Iterable<string>): string[] =>
  [...new Set(examples)].sort((left, right) => left.localeCompare(right)).slice(0, 3)

const sortedPages = (pages: PageDocument[]): PageDocument[] =>
  [...pages].sort(
    (left, right) =>
      (left.path || '').localeCompare(right.path || '') || left.title.localeCompare(right.title),
  )

export const buildSectionUsageAudit = (
  input: unknown,
  source = 'provided-input',
): SectionUsageAudit => {
  const records = inputRecords(input)
  const pageDocuments = sortedPages(
    records.flatMap((record) => {
      const page = pageDocument(record)
      return page ? [page] : []
    }),
  )
  const topLevelTypeCounts = new Map<string, number>()
  const componentTypeCounts = new Map<string, number>()
  const controlCounts = Object.fromEntries(
    sectionControlNames.map((name) => [name, new Map<string, number>()]),
  ) as Record<SectionControlName, Map<string, number>>
  const patternCounts = new Map<string, number>()
  const patternExamples = new Map<string, Set<string>>()
  const presetCounts = new Map<CandidatePresetID, number>()
  const presetExamples = new Map<CandidatePresetID, Set<string>>()
  let columnCount = 0
  let componentCount = 0
  let contentSectionCount = 0
  let emptyColumnCount = 0
  let emptySectionCount = 0

  const pageSummaries: PageLayoutSummary[] = pageDocuments.map((page) => {
    const pageComponentTypes = new Set<string>()
    let pageSectionCount = 0

    page.layout.forEach((block) => {
      const blockType =
        typeof block.blockType === 'string' && block.blockType ? block.blockType : 'unknown'
      increment(topLevelTypeCounts, blockType)
      if (blockType !== 'contentSection') return

      pageSectionCount += 1
      contentSectionCount += 1
      sectionControlNames.forEach((name) =>
        increment(controlCounts[name], sectionControlValue(name, block)),
      )

      const columns = asRecords(block.columns)
      const pattern = columnPattern(block)
      increment(patternCounts, pattern)
      if (!patternExamples.has(pattern)) patternExamples.set(pattern, new Set())
      patternExamples.get(pattern)?.add(page.label)

      const preset = classifyCandidatePreset(block)
      presetCounts.set(preset, (presetCounts.get(preset) || 0) + 1)
      if (!presetExamples.has(preset)) presetExamples.set(preset, new Set())
      presetExamples.get(preset)?.add(page.label)

      if (!columns.length) emptySectionCount += 1
      let sectionComponents = 0
      columns.forEach((column) => {
        columnCount += 1
        const types = componentTypesInColumn(column)
        sectionComponents += types.length
        componentCount += types.length
        if (!types.length) emptyColumnCount += 1
        types.forEach((type) => {
          increment(componentTypeCounts, type)
          pageComponentTypes.add(type)
        })
      })
      if (!sectionComponents) emptySectionCount += columns.length ? 1 : 0
    })

    return {
      componentTypes: [...pageComponentTypes].sort((left, right) => left.localeCompare(right)),
      contentSections: pageSectionCount,
      label: page.label,
      path: page.path,
      title: page.title,
      topLevelBlocks: page.layout.map(({ blockType }) =>
        typeof blockType === 'string' && blockType ? blockType : 'unknown',
      ),
    }
  })

  const columnPatterns: ColumnPatternEntry[] = [...patternCounts.entries()]
    .map(([pattern, count]) => ({
      count,
      examples: deduplicatedSortedExamples(patternExamples.get(pattern) || []),
      pattern,
      percentage: percentage(count, contentSectionCount),
    }))
    .sort((left, right) => right.count - left.count || left.pattern.localeCompare(right.pattern))

  const candidatePresets: CandidatePresetEntry[] = presetDefinitions.map((definition) => {
    const count = presetCounts.get(definition.id) || 0
    return {
      ...definition,
      count,
      examples: deduplicatedSortedExamples(presetExamples.get(definition.id) || []),
      percentage: percentage(count, contentSectionCount),
    }
  })

  const sectionControls = Object.fromEntries(
    sectionControlNames.map((name) => [
      name,
      countEntries(controlCounts[name], contentSectionCount),
    ]),
  ) as Record<SectionControlName, CountEntry[]>

  const warnings: string[] = []
  if (!pageDocuments.length) warnings.push('No page documents with a layout field were found.')
  if (emptySectionCount) {
    warnings.push(`${emptySectionCount} content section(s) contain no editable components.`)
  }
  if (emptyColumnCount) warnings.push(`${emptyColumnCount} column(s) contain no components.`)
  const advancedCount = presetCounts.get('advanced-custom-section') || 0
  if (advancedCount) {
    warnings.push(
      `${advancedCount} section(s) need an advanced/custom workflow or a more specific preset rule.`,
    )
  }

  return {
    candidatePresets,
    columnPatterns,
    componentTypes: countEntries(componentTypeCounts, componentCount),
    pages: pageSummaries,
    schemaVersion: 1,
    sectionControls,
    source,
    summary: {
      columns: columnCount,
      components: componentCount,
      contentSections: contentSectionCount,
      emptyColumns: emptyColumnCount,
      emptySections: emptySectionCount,
      ignoredRecords: records.length - pageDocuments.length,
      inputRecords: records.length,
      pageDocuments: pageDocuments.length,
      pagesWithLayout: pageDocuments.filter(({ layout }) => layout.length > 0).length,
      topLevelBlocks: pageDocuments.reduce((total, { layout }) => total + layout.length, 0),
    },
    topLevelBlockTypes: countEntries(
      topLevelTypeCounts,
      pageDocuments.reduce((total, { layout }) => total + layout.length, 0),
    ),
    warnings,
  }
}

export const parseSectionUsageAuditInput = (text: string): unknown => {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('The audit input is empty.')

  try {
    return JSON.parse(trimmed) as unknown
  } catch (jsonError) {
    const records: unknown[] = []
    for (const [index, line] of trimmed.split(/\r?\n/gu).entries()) {
      if (!line.trim()) continue
      try {
        records.push(JSON.parse(line) as unknown)
      } catch {
        const detail =
          jsonError instanceof Error ? ` Whole-file JSON error: ${jsonError.message}` : ''
        throw new Error(`Invalid NDJSON on line ${index + 1}.${detail}`)
      }
    }
    return records
  }
}
