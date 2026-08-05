// @vitest-environment node

import {
  buildSectionUsageAudit,
  classifyCandidatePreset,
  parseSectionUsageAuditInput,
} from '../../scripts/editor-layout-audit/audit'
import { renderSectionUsageAuditMarkdown } from '../../scripts/editor-layout-audit/markdown'
import { describe, expect, it } from 'vitest'

const transformedRecords = [
  {
    target: 'pages',
    legacy: { legacyId: 1 },
    data: {
      title: 'Home',
      path: '/',
      layout: [
        { blockType: 'trayportHero' },
        {
          blockType: 'contentSection',
          theme: 'light',
          wrapperTheme: 'none',
          backgroundMedia: null,
          backgroundOpacity: '10',
          width: 'wide',
          spacing: 'regular',
          columns: [
            {
              span: '12',
              components: [{ blockType: 'heading' }, { blockType: 'richText' }],
            },
          ],
        },
      ],
    },
  },
  {
    target: 'pages',
    legacy: { legacyId: 2 },
    data: {
      title: 'Product',
      path: '/product/',
      layout: [
        {
          blockType: 'contentSection',
          surfaceTone: 'white',
          wrapperTheme: 'none',
          backgroundOpacity: 'none',
          width: 'standard',
          spacingTop: 'large',
          spacingBottom: 'regular',
          columnGap: 'regular',
          columns: [
            {
              span: '6',
              components: [
                { blockType: 'heading' },
                { blockType: 'richText' },
                { blockType: 'actions' },
              ],
            },
            { span: '6', components: [{ blockType: 'media' }] },
          ],
        },
      ],
    },
  },
  {
    target: 'articles',
    data: { title: 'Ignored article', layout: [{ blockType: 'contentSection' }] },
  },
]

describe('Payload editor section-usage audit', () => {
  it('parses transformed NDJSON and inventories page layouts without a database', () => {
    const input = transformedRecords.map((record) => JSON.stringify(record)).join('\n')
    const audit = buildSectionUsageAudit(parseSectionUsageAuditInput(input), 'fixture.ndjson')

    expect(audit.summary).toEqual({
      columns: 3,
      components: 6,
      contentSections: 2,
      emptyColumns: 0,
      emptySections: 0,
      ignoredRecords: 1,
      inputRecords: 3,
      pageDocuments: 2,
      pagesWithLayout: 2,
      topLevelBlocks: 3,
    })
    expect(audit.columnPatterns).toMatchObject([
      { count: 1, pattern: '12', percentage: 50 },
      { count: 1, pattern: '6 + 6', percentage: 50 },
    ])
    expect(audit.componentTypes.map(({ count, value }) => [value, count])).toEqual([
      ['heading', 2],
      ['richText', 2],
      ['actions', 1],
      ['media', 1],
    ])
    expect(audit.sectionControls.surfaceTone).toEqual([
      { count: 1, percentage: 50, value: 'light' },
      { count: 1, percentage: 50, value: 'white' },
    ])
    expect(audit.sectionControls.spacingTop).toEqual([
      { count: 1, percentage: 50, value: 'large' },
      { count: 1, percentage: 50, value: 'regular' },
    ])
    expect(audit.candidatePresets.find(({ id }) => id === 'intro-text')?.count).toBe(1)
    expect(audit.candidatePresets.find(({ id }) => id === 'text-and-media')?.count).toBe(1)
  })

  it('supports Payload API response JSON and stays deterministic when document order changes', () => {
    const pages = transformedRecords.slice(0, 2).map(({ data }) => data)
    const first = buildSectionUsageAudit({ docs: pages }, 'payload-export.json')
    const second = buildSectionUsageAudit({ docs: [...pages].reverse() }, 'payload-export.json')

    expect(second).toEqual(first)
    expect(parseSectionUsageAuditInput(JSON.stringify({ docs: pages }))).toEqual({ docs: pages })
  })

  it('uses conservative, mutually exclusive candidate-preset rules', () => {
    const section = (blockType: string) => ({
      columns: [{ components: [{ blockType }], span: '12' }],
    })

    expect(classifyCandidatePreset(section('marketMatrix'))).toBe('market-matrix')
    expect(classifyCandidatePreset(section('marketCoverage'))).toBe('market-coverage-map')
    expect(classifyCandidatePreset(section('dataChart'))).toBe('chart-or-data-table')
    expect(classifyCandidatePreset(section('faq'))).toBe('faq')
    expect(classifyCandidatePreset(section('statistics'))).toBe('statistics')
    expect(classifyCandidatePreset(section('featureList'))).toBe('feature-grid')
    expect(classifyCandidatePreset(section('timeline'))).toBe('advanced-custom-section')
  })

  it('renders a stable Markdown decision aid', () => {
    const audit = buildSectionUsageAudit(transformedRecords, 'fixture.ndjson')
    const markdown = renderSectionUsageAuditMarkdown(audit)

    expect(markdown).toContain('# Payload section usage audit')
    expect(markdown).toContain('| Content sections | 2 |')
    expect(markdown).toContain('| Text and media | 1 | 50% |')
    expect(markdown).toContain('| Home (/) | 1 | heading, richText |')
    expect(markdown.endsWith('\n')).toBe(true)
  })

  it('reports the exact NDJSON line when input is malformed', () => {
    expect(() => parseSectionUsageAuditInput('{"target":"pages"}\nnot-json')).toThrow(
      /Invalid NDJSON on line 2/u,
    )
  })
})
