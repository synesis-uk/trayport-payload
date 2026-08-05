import type {
  ContentSectionBlock,
  FAQComponent,
  FeatureListComponent,
  MarketCoverageComponent,
  MarketMatrixComponent,
  RichTextComponent,
  StatisticsComponent,
} from '@/payload-types'

export type SectionPresetCategory = 'content' | 'data' | 'promotional'

export type SectionPresetKey =
  | 'advanced'
  | 'callToAction'
  | 'chart'
  | 'faq'
  | 'featureGrid'
  | 'intro'
  | 'marketCoverage'
  | 'marketMatrix'
  | 'mediaText'
  | 'statistics'
  | 'textActions'
  | 'textMedia'

export type SectionPresetDiagram =
  'data' | 'features' | 'single' | 'split' | 'splitReverse' | 'statistics'

export interface SectionPresetDefinition {
  category: SectionPresetCategory
  create: () => ContentSectionBlock
  description: string
  diagram: SectionPresetDiagram
  interactiveOnly?: boolean
  key: SectionPresetKey
  label: string
}

export const createEmptyRichText = (): RichTextComponent['body'] => ({
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
})

type SectionColumn = ContentSectionBlock['columns'][number]
type SectionComponent = SectionColumn['components'][number]

const heading = (text = ''): SectionComponent => ({
  appearance: 'h2',
  blockType: 'heading',
  level: 'h2',
  text,
})

const richText = (): SectionComponent => ({
  blockType: 'richText',
  body: createEmptyRichText(),
  size: 'regular',
})

const actions = (): SectionComponent => ({
  actions: [],
  blockType: 'actions',
})

const media = (): SectionComponent => ({
  aspect: 'landscape',
  blockType: 'media',
})

const createColumn = (
  span: SectionColumn['span'],
  components: SectionComponent[],
  overrides: Partial<Omit<SectionColumn, 'components' | 'span'>> = {},
): SectionColumn => ({
  backgroundOpacity: 'none',
  border: 'none',
  componentGap: 'regular',
  components,
  heightMode: 'fill',
  horizontalAlign: 'left',
  padding: 'none',
  radius: 'default',
  span,
  surface: 'none',
  verticalAlign: 'start',
  ...overrides,
})

export const createDefaultContentColumn = (): SectionColumn =>
  createColumn('12', [heading(), richText()])

const createSection = (
  columns: SectionColumn[],
  overrides: Partial<Omit<ContentSectionBlock, 'blockType' | 'columns'>> = {},
): ContentSectionBlock => ({
  backgroundOpacity: 'none',
  blockType: 'contentSection',
  columnGap: 'regular',
  columns,
  spacingBottom: 'regular',
  spacingTop: 'regular',
  surfacePadding: 'none',
  surfaceRadius: 'default',
  surfaceTone: 'none',
  width: 'wide',
  wrapperTheme: 'none',
  ...overrides,
})

const featureList = (): FeatureListComponent => ({
  blockType: 'featureList',
  items: [
    {
      actionStyle: 'link',
      display: 'plain',
      showAction: false,
      title: '',
    },
  ],
  presentation: 'grid',
})

const statistics = (): StatisticsComponent => ({
  blockType: 'statistics',
  items: Array.from({ length: 3 }, () => ({ label: '', value: '' })),
})

const faq = (): FAQComponent => ({
  blockType: 'faq',
  items: [{ answer: createEmptyRichText(), question: '' }],
})

const marketCoverage = (): MarketCoverageComponent => ({
  autoplayAssetClasses: false,
  autoplayDelay: 5,
  blockType: 'marketCoverage',
  dataDisplay: 'always',
  height: 300,
  lineColor: '#009cde',
  lineOpacity: 0.5,
  lineWidth: 0.5,
  markerSize: 5,
  mode: 'regionalConnectivity',
  presentation: 'mapOnly',
  showAssetClassFilter: true,
  showLines: true,
  showMarketData: false,
  showSidebar: true,
  style: 'dark',
  title: 'Explore our connectivity',
  zoomTo: 'markers',
})

const marketMatrix = (): MarketMatrixComponent => ({
  blockType: 'marketMatrix',
  caption: 'Trayport venue connectivity by market hub',
  defaultView: 'joule',
  showDownload: true,
  showFilters: true,
})

const dataChart = (): SectionComponent =>
  ({
    accessibleSummary: '',
    blockType: 'dataChart',
    chartType: 'stackedColumn',
    displayInterval: 'quarter',
    height: 350,
    scalePower: 0,
    seriesDimension: 'executionType',
    showAxes: true,
    showDataTable: true,
    showLegend: true,
    showValues: false,
    title: '',
    dataType: 'volume',
  }) as SectionComponent

export const sectionPresets: readonly SectionPresetDefinition[] = [
  {
    category: 'content',
    create: () =>
      createSection([createColumn('12', [heading(), richText()])], { width: 'reading' }),
    description: 'A focused heading and rich-text introduction at a comfortable reading width.',
    diagram: 'single',
    key: 'intro',
    label: 'Introductory text',
  },
  {
    category: 'content',
    create: () =>
      createSection([createColumn('12', [heading(), richText(), actions()])], {
        width: 'standard',
      }),
    description: 'Heading, body copy and one or more managed links or buttons.',
    diagram: 'single',
    key: 'textActions',
    label: 'Text with actions',
  },
  {
    category: 'content',
    create: () =>
      createSection([
        createColumn('6', [heading(), richText(), actions()], { verticalAlign: 'center' }),
        createColumn('6', [media()], { verticalAlign: 'center' }),
      ]),
    description: 'Editorial content on the left with managed image or video on the right.',
    diagram: 'split',
    key: 'textMedia',
    label: 'Text and media',
  },
  {
    category: 'content',
    create: () =>
      createSection([
        createColumn('6', [media()], { verticalAlign: 'center' }),
        createColumn('6', [heading(), richText(), actions()], { verticalAlign: 'center' }),
      ]),
    description: 'Managed image or video on the left with editorial content on the right.',
    diagram: 'splitReverse',
    key: 'mediaText',
    label: 'Media and text',
  },
  {
    category: 'content',
    create: () => createSection([createColumn('12', [heading(), featureList()])]),
    description: 'A heading followed by reusable feature cards, icons or carousel items.',
    diagram: 'features',
    key: 'featureGrid',
    label: 'Feature grid',
  },
  {
    category: 'content',
    create: () => createSection([createColumn('12', [heading(), faq()])], { width: 'reading' }),
    description: 'A compact, accessible group of expandable questions and answers.',
    diagram: 'features',
    key: 'faq',
    label: 'Frequently asked questions',
  },
  {
    category: 'promotional',
    create: () =>
      createSection([createColumn('12', [heading(), richText(), actions()])], {
        surfacePadding: 'medium',
        surfaceRadius: 'xl',
        surfaceTone: 'dark',
        width: 'standard',
      }),
    description: 'A branded high-emphasis panel with a message and clear next action.',
    diagram: 'single',
    key: 'callToAction',
    label: 'Call to action',
  },
  {
    category: 'promotional',
    create: () => createSection([createColumn('12', [heading(), statistics()])]),
    description: 'A heading and three starter statistics for concise proof points.',
    diagram: 'statistics',
    key: 'statistics',
    label: 'Statistics',
  },
  {
    category: 'data',
    create: () => createSection([createColumn('12', [heading(), dataChart()])]),
    description: 'A managed market-data chart. Select its asset class before publishing.',
    diagram: 'data',
    key: 'chart',
    label: 'Market data chart',
  },
  {
    category: 'data',
    create: () => createSection([createColumn('12', [marketCoverage()])], { width: 'full' }),
    description: 'The managed regional connectivity map with bounded filters and controls.',
    diagram: 'data',
    key: 'marketCoverage',
    label: 'Market coverage map',
  },
  {
    category: 'data',
    create: () => createSection([createColumn('12', [marketMatrix()])], { width: 'full' }),
    description: 'The interactive venue-to-hub connectivity matrix for an interactive page.',
    diagram: 'data',
    interactiveOnly: true,
    key: 'marketMatrix',
    label: 'Market matrix',
  },
  {
    category: 'content',
    create: () => createSection([createDefaultContentColumn()]),
    description: 'A flexible one-column section with all layout controls available.',
    diagram: 'single',
    key: 'advanced',
    label: 'Advanced custom section',
  },
] as const

export const sectionPresetGroups: readonly {
  key: SectionPresetCategory
  label: string
}[] = [
  { key: 'content', label: 'Content sections' },
  { key: 'promotional', label: 'Promotional sections' },
  { key: 'data', label: 'Data and market tools' },
]

export const getSectionPreset = (key: SectionPresetKey): SectionPresetDefinition => {
  const preset = sectionPresets.find((candidate) => candidate.key === key)
  if (!preset) throw new Error(`Unknown section preset: ${key}`)
  return preset
}

export const createSectionFromPreset = (key: SectionPresetKey): ContentSectionBlock =>
  getSectionPreset(key).create()
