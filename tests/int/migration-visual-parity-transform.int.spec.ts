// @vitest-environment node

import type { NormalizedValue, SourceReusable } from '../../migration/contracts/v1'
import { mapPageLayout } from '../../migration/transform/blocks'
import type { TransformCoverage } from '../../migration/transform/types'
import { describe, expect, it } from 'vitest'

const coverage = (): TransformCoverage => ({
  componentLayouts: {},
  ignoredComponentLayouts: {},
  topLevelLayouts: {},
  ignoredTaxonomies: {},
  unsupportedComponentLayouts: [],
  unsupportedTopLevelLayouts: [],
})

const media = (id: number, url: string): NormalizedValue => ({
  $ref: 'media',
  id,
  title: `Media ${id}`,
  url,
})

const firstComponent = (component: Record<string, NormalizedValue>) => {
  const layout = mapPageLayout(
    {
      sections_new: [
        {
          acf_fc_layout: 'single',
          components: [component],
        },
      ],
    },
    coverage(),
  )

  expect(layout).toHaveLength(1)
  expect(layout[0]?.blockType).toBe('contentSection')
  const columns = layout[0]?.columns as Array<{
    components: Array<Record<string, unknown>>
  }>
  return columns[0]?.components[0]
}

describe('visual-parity migration controls', () => {
  it('preserves the bounded market-chart presentation while keeping facts outside Payload', () => {
    expect(
      firstComponent({
        acf_fc_layout: 'charts-new',
        asset_class: 22,
        chart_type: 'stacked-column',
        data_type: 'volume',
        height: '500',
        power: '6',
        quarter_range: {
          qr_from_quarter: '1',
          qr_from_year: '21',
          qr_to_quarter: '4',
          qr_to_year: '2025',
        },
        show_axes: '0',
        show_legend: '1',
        show_values_on_chart: '1',
        title: 'Quarterly market volume',
        unit: 'MWh',
        y_axis_text: 'Volume (millions)',
      }),
    ).toMatchObject({
      accessibleSummary:
        'Chart series are supplied by the application market-data store rather than Payload.',
      assetClassLegacyId: 22,
      axisLabel: 'Volume (millions)',
      blockType: 'dataChart',
      chartType: 'stackedColumn',
      dataType: 'volume',
      fromQuarter: 1,
      fromYear: 2021,
      height: 500,
      scalePower: 6,
      showAxes: false,
      showDataTable: true,
      showLegend: true,
      showValues: true,
      title: 'Quarterly market volume',
      toQuarter: 4,
      toYear: 2025,
      unit: 'MWh',
    })
  })

  it('clamps imported chart height and scale to the editor control bounds', () => {
    expect(
      firstComponent({
        acf_fc_layout: 'charts-new',
        chart_type: 'line',
        height: '900',
        power: '99',
      }),
    ).toMatchObject({
      chartType: 'line',
      height: 560,
      scalePower: 12,
      showAxes: true,
      showDataTable: true,
      showLegend: true,
      showValues: false,
    })
  })

  it('maps the selected section wrapper, inset surface, background, and spacing controls', () => {
    const background = media(777, 'https://cdn.trayport.com/section-background.jpg')
    const layout = mapPageLayout(
      {
        sections_new: [
          {
            acf_fc_layout: 'single',
            components: [
              {
                acf_fc_layout: 'paragraph',
                paragraph: '<p>Managed section content.</p>',
              },
            ],
            new_settings: {
              bottom_spacing: 'normal',
              content_background: {
                background_color: { dark: '#002d72', style: 'dark' },
                content_bg_image: background,
                content_has_image: '1',
                opacity: '20',
                rounded: 'large',
              },
              content_width: 'medium',
              top_spacing: 'large',
              wrapper_background: {
                background_color: { dark: '#32B77B', style: 'dark' },
              },
            },
          },
        ],
      },
      coverage(),
    )

    expect(layout[0]).toMatchObject({
      appearance: 'inset',
      backgroundMedia: { $legacyRef: 'media', legacyId: 777 },
      backgroundOpacity: '20',
      blockType: 'contentSection',
      spacing: 'generous',
      theme: 'dark',
      width: 'standard',
      wrapperTheme: 'green',
    })
  })

  it('does not activate retained background values that were disabled in WordPress', () => {
    const layout = mapPageLayout(
      {
        sections_new: [
          {
            acf_fc_layout: 'single',
            components: [
              {
                acf_fc_layout: 'paragraph',
                paragraph: '<p>Default section content.</p>',
              },
            ],
            new_settings: {
              content_background: {
                background_color: { dark: '#1f2a44', style: 'none' },
                content_bg_image: media(778, 'https://cdn.trayport.com/retained-background.jpg'),
                content_has_image: '0',
                opacity: '80',
              },
              wrapper_background: {
                background_color: { light: '#eff7ff', style: 'light' },
              },
            },
          },
        ],
      },
      coverage(),
    )

    expect(layout[0]).toMatchObject({
      appearance: 'default',
      backgroundMedia: null,
      backgroundOpacity: 'none',
      theme: 'light',
      wrapperTheme: 'softBlue',
    })
  })

  it('resolves the reusable Home hero statistics into four bounded value-label pairs', () => {
    const reusable: SourceReusable = {
      data: {
        stats: [
          {
            data: { number: '9800', suffix: '+' },
            description: '<p>Global community</p>',
          },
          {
            data: { number: '390', suffix: '+' },
            description: '<p>Active entities</p>',
          },
          {
            data: { number: '45', suffix: '+' },
            description: '<p>Countries served</p>',
          },
          {
            data: { number: '65', suffix: '+' },
            description: '<p>Connected venues</p>',
          },
        ],
      },
      entity: 'reusable',
      legacyId: 3055,
      path: null,
      postType: 'stats_group',
      schemaVersion: 1,
      title: 'Home statistics',
    }
    const layout = mapPageLayout(
      {
        sections_new: [
          {
            acf_fc_layout: 'hero',
            hero: {
              new_content: {
                header: { text: 'Connecting people and markets' },
                stats_group: { $ref: 'post', id: 3055 },
              },
              settings: { bg_type: 'none' },
            },
          },
        ],
      },
      coverage(),
      {},
      new Map([[reusable.legacyId, reusable]]),
    )

    expect(layout[0]).toMatchObject({
      blockType: 'trayportHero',
      statistics: [
        { label: 'Global community', value: '9800+' },
        { label: 'Active entities', value: '390+' },
        { label: 'Countries served', value: '45+' },
        { label: 'Connected venues', value: '65+' },
      ],
    })
  })
})
