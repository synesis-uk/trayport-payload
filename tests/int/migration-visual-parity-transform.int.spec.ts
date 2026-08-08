// @vitest-environment node

import type { NormalizedValue, SourceReusable } from '../../migration/contracts/v1'
import { mapPageLayout } from '../../migration/transform/blocks'
import { emptyTransformCoverage, type TransformCoverage } from '../../migration/transform/types'
import { describe, expect, it } from 'vitest'

const coverage = (): TransformCoverage => emptyTransformCoverage()

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
  it('suppresses source-hidden Home headings and selects the bounded map-only composition', () => {
    const layout = mapPageLayout(
      {
        sections_new: [
          {
            acf_fc_layout: 'columns',
            columns: [
              {
                acfe_layout_col: '6',
                components: [
                  {
                    acf_fc_layout: 'header',
                    header: { size: 'h1', tag: 'h2', text: 'Why Trayport?' },
                  },
                  {
                    acf_fc_layout: 'paragraph',
                    paragraph: '<p>Managed introduction.</p>',
                  },
                ],
              },
              {
                acfe_layout_col: '12',
                components: [
                  {
                    acf_fc_layout: 'header',
                    header: { size: 'h1', tag: 'h2', text: 'Who we serve' },
                  },
                ],
              },
              {
                acfe_layout_col: '6',
                components: [
                  {
                    acf_fc_layout: 'connections',
                    regions: [31, 29, 30],
                    style: 'dark',
                  },
                ],
              },
            ],
          },
        ],
      },
      coverage(),
      {
        marketCoveragePresentation: 'mapOnly',
        suppressedHeadingTexts: ['Why Trayport?', 'Who we serve'],
      },
    )

    const columns = layout[0]?.columns as Array<{
      components: Array<Record<string, unknown>>
    }>
    const components = columns.flatMap(({ components }) => components)

    expect(columns).toHaveLength(2)
    expect(
      components.filter(({ blockType }) => blockType === 'heading').map(({ text }) => text),
    ).toEqual([])
    expect(components.find(({ blockType }) => blockType === 'marketCoverage')).toMatchObject({
      presentation: 'mapOnly',
      title: 'Explore our connectivity',
    })
  })

  it('preserves the bounded market-chart presentation while keeping facts outside Payload', () => {
    expect(
      firstComponent({
        acf_fc_layout: 'charts-new',
        asset_class: 22,
        chart_type: 'stacked-column',
        data_type: 'volume',
        display_interval: 'quarters',
        for: 'trade_type',
        height: '500',
        interval: 'quarter_range',
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
      assetClass: { $legacyRef: 'asset-class', legacyId: 22 },
      assetClassLegacyId: 22,
      axisLabel: 'Volume (millions)',
      blockType: 'dataChart',
      chartType: 'stackedColumn',
      dataType: 'volume',
      displayInterval: 'quarter',
      excludedHubs: [],
      fromQuarter: 1,
      fromYear: 2021,
      height: 500,
      scalePower: 6,
      seriesDimension: 'executionType',
      includedHubs: [],
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

  it.each([
    {
      assetClass: 22,
      configuration: {
        chart_type: 'column-stacked',
        display_interval: 'quarters',
        excluded_hubs: null,
        for: 'trade_type',
        hubs: null,
      },
      interval: 'quarter_range',
      range: {
        quarter_range: {
          qr_from_quarter: '01',
          qr_from_year: '21',
          qr_to_quarter: '04',
          qr_to_year: '25',
        },
      },
      title: 'Traded Gas Volumes by Execution (Quarterly)',
      want: {
        chartType: 'stackedColumn',
        displayInterval: 'quarter',
        excludedHubs: [],
        fromQuarter: 1,
        fromYear: 2021,
        includedHubs: [],
        seriesDimension: 'executionType',
        toQuarter: 4,
        toYear: 2025,
      },
    },
    {
      assetClass: 21,
      configuration: {
        chart_type: 'column-stacked',
        display_interval: 'quarters',
        excluded_hubs: null,
        for: 'trade_type',
        hubs: null,
      },
      interval: 'quarter_range',
      range: {
        quarter_range: {
          qr_from_quarter: '01',
          qr_from_year: '21',
          qr_to_quarter: '04',
          qr_to_year: '25',
        },
      },
      title: 'Traded Power Volumes by Execution (Quarterly)',
      want: {
        chartType: 'stackedColumn',
        displayInterval: 'quarter',
        excludedHubs: [],
        fromQuarter: 1,
        fromYear: 2021,
        includedHubs: [],
        seriesDimension: 'executionType',
        toQuarter: 4,
        toYear: 2025,
      },
    },
    {
      assetClass: 21,
      configuration: {
        chart_type: 'column',
        display_interval: 'months',
        excluded_hubs: '',
        for: 'hubs',
        hubs: [2500],
      },
      interval: 'quarter_range',
      range: {
        quarter_range: {
          qr_from_quarter: '03',
          qr_from_year: '23',
          qr_to_quarter: '01',
          qr_to_year: '26',
        },
      },
      title: 'Japan Power Market by Volume',
      want: {
        chartType: 'column',
        displayInterval: 'month',
        excludedHubs: [],
        fromQuarter: 3,
        fromYear: 2023,
        includedHubs: [{ $legacyRef: 'hub', legacyId: 2500 }],
        seriesDimension: 'hub',
        toQuarter: 1,
        toYear: 2026,
      },
    },
    {
      assetClass: 21,
      configuration: {
        chart_type: 'column',
        display_interval: 'ytd',
        excluded_hubs: [2511, 2496, 2500],
        for: 'hubs',
        hubs: '',
      },
      interval: 'year',
      range: { year: '2025' },
      title: 'Power Volumes by Hub',
      want: {
        chartType: 'column',
        displayInterval: 'year',
        excludedHubs: [2511, 2496, 2500].map((legacyId) => ({
          $legacyRef: 'hub',
          legacyId,
        })),
        fromQuarter: 1,
        fromYear: 2025,
        includedHubs: [],
        seriesDimension: 'hub',
        toQuarter: 4,
        toYear: 2025,
      },
    },
    {
      assetClass: 21,
      configuration: {
        chart_type: 'line',
        display_interval: 'months',
        excluded_hubs: '',
        for: 'hubs',
        hubs: [2513, 2495, 2494, 2499, 2502],
      },
      dataType: 'price',
      interval: 'year',
      range: { year: '2025' },
      title: 'Power Prices from Commodities Report (front month = Jan 2025)',
      want: {
        chartType: 'line',
        displayInterval: 'month',
        excludedHubs: [],
        fromQuarter: 1,
        fromYear: 2025,
        includedHubs: [2513, 2495, 2494, 2499, 2502].map((legacyId) => ({
          $legacyRef: 'hub',
          legacyId,
        })),
        seriesDimension: 'hub',
        toQuarter: 4,
        toYear: 2025,
      },
    },
    {
      assetClass: 22,
      configuration: {
        chart_type: 'column',
        display_interval: 'quarters',
        excluded_hubs: '',
        for: 'hubs',
        hubs: [3315, 3316, 3320, 2488],
      },
      interval: 'year',
      range: { year: '2025' },
      title: 'Gas Volumes by Hub',
      want: {
        chartType: 'column',
        displayInterval: 'quarter',
        excludedHubs: [],
        fromQuarter: 1,
        fromYear: 2025,
        includedHubs: [3315, 3316, 3320, 2488].map((legacyId) => ({
          $legacyRef: 'hub',
          legacyId,
        })),
        seriesDimension: 'hub',
        toQuarter: 4,
        toYear: 2025,
      },
    },
  ])(
    'maps the accepted source range for $title',
    ({ assetClass, configuration, dataType, interval, range, title, want }) => {
      expect(
        firstComponent({
          acf_fc_layout: 'charts-new',
          asset_class: assetClass,
          data_type: dataType || 'volume',
          interval,
          quarter_range: {
            qr_from_quarter: 2024,
            qr_from_year: 24,
            qr_to_quarter: 2024,
            qr_to_year: 24,
          },
          title,
          ...configuration,
          ...range,
        } as Record<string, NormalizedValue>),
      ).toMatchObject({
        assetClass: { $legacyRef: 'asset-class', legacyId: assetClass },
        assetClassLegacyId: assetClass,
        title,
        ...want,
      })
    },
  )

  it.each([
    {
      interval: 'year_range',
      source: { year_range: { from_year: '24', to_year: 2026 } },
      want: { fromQuarter: 1, fromYear: 2024, toQuarter: 4, toYear: 2026 },
    },
    {
      interval: 'quarter',
      source: { single_quarter: { sq_quarter: '04', sq_year: '24' } },
      want: { fromQuarter: 4, fromYear: 2024, toQuarter: 4, toYear: 2024 },
    },
  ])('maps a valid legacy $interval interval', ({ interval, source, want }) => {
    const component: Record<string, NormalizedValue> = {
      acf_fc_layout: 'charts-new',
      asset_class: 21,
      interval,
    }
    Object.assign(component, source)
    expect(firstComponent(component)).toMatchObject(want)
  })

  it.each([
    ['all', { quarter_range: { qr_from_quarter: 1, qr_from_year: 2021 } }],
    ['latest_years', { latest_period_count: 5, year: 2025 }],
    ['latest_quarters', { latest_period_count: 5, year: 2025 }],
    [
      'quarter_range',
      {
        quarter_range: {
          qr_from_quarter: 2024,
          qr_from_year: 24,
          qr_to_quarter: 2024,
          qr_to_year: 24,
        },
      },
    ],
    ['year_range', { year_range: { from_year: 2026, to_year: 2024 } }],
  ])('omits static bounds for an unbounded or invalid $0 interval', (interval, source) => {
    const chart = firstComponent({
      acf_fc_layout: 'charts-new',
      asset_class: 21,
      interval,
      ...source,
    })

    for (const field of ['fromYear', 'fromQuarter', 'toYear', 'toQuarter']) {
      expect(chart).not.toHaveProperty(field)
    }
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
      backgroundMedia: { $legacyRef: 'media', legacyId: 777 },
      backgroundOpacity: '20',
      blockType: 'contentSection',
      columnGap: 'regular',
      spacingBottom: 'regular',
      spacingTop: 'large',
      surfacePadding: 'medium',
      surfaceRadius: 'xl',
      surfaceTone: 'dark',
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
      backgroundMedia: null,
      backgroundOpacity: 'none',
      surfacePadding: 'none',
      surfaceRadius: 'default',
      surfaceTone: 'none',
      wrapperTheme: 'softBlue',
    })
  })

  it('imports only the active hero action branch, drops blank destinations, and preserves bounded badge and media controls', () => {
    const layout = mapPageLayout(
      {
        sections_new: [
          {
            acf_fc_layout: 'hero',
            hero: {
              new_content: {
                badge: {
                  icon: 'display-chart-up-circle-currency',
                  new_link: { title: 'Trayport Joule', url: '' },
                  style: 'info',
                },
                button_style: 'links',
                buttons: [
                  {
                    new_link: { title: 'Inactive button', url: '/inactive/' },
                    style: 'primary',
                  },
                ],
                header: { text: 'Trade globally' },
                links: [
                  {
                    icon: 'chart-mixed',
                    link: { title: 'See Joule', url: '/products/joule/' },
                  },
                  {
                    icon: 'earth-europe',
                    link: { title: 'Missing destination', url: '' },
                  },
                  {
                    icon: 'forward',
                    link: { title: 'Book a demo', url: '/request-a-demo/' },
                  },
                ],
              },
              settings: { aspect: '[16/9]', bg_type: 'none' },
            },
          },
        ],
      },
      coverage(),
    )

    expect(layout[0]).toMatchObject({
      actions: [
        {
          icon: 'chart',
          label: 'See Joule',
          link: { type: 'custom', url: '/products/joule/' },
          style: 'link',
        },
        {
          icon: 'forward',
          label: 'Book a demo',
          link: { type: 'custom', url: '/request-a-demo/' },
          style: 'link',
        },
      ],
      badgeIcon: 'tradingScreen',
      badgeLabel: 'Trayport Joule',
      badgeTone: 'info',
      blockType: 'trayportHero',
      mediaAspect: 'sixteenToNine',
    })
    expect(JSON.stringify(layout[0])).not.toContain('Inactive button')
    expect(JSON.stringify(layout[0])).not.toContain('Missing destination')
  })

  it('keeps semantic heading levels separate from visual scale and gates retained column styling', () => {
    const activeMedia = media(779, 'https://cdn.trayport.com/column-background.jpg')
    const layout = mapPageLayout(
      {
        sections_new: [
          {
            acf_fc_layout: 'columns',
            columns: [
              {
                acfe_layout_col: '4',
                align: 'center',
                background_color: { light: '#f5f5f5', style: 'light' },
                border: { background_color: { light: '#eeeeee', style: 'light' } },
                component_spacing: 'component-space-none',
                components: [
                  {
                    acf_fc_layout: 'header',
                    header: { size: 'h1', tag: 'div', text: '<p>Visual display heading</p>' },
                  },
                ],
                has_image: '1',
                height: 'content',
                image: activeMedia,
                opacity: '10',
                padding: 'column-p-md',
                rounded: 'theme-rounded-xl',
                valign: 'center',
              },
              {
                acfe_layout_col: '8',
                background_color: { light: '#eff7ff', style: 'none' },
                border: { background_color: { light: '#eeeeee', style: 'none' } },
                components: [
                  {
                    acf_fc_layout: 'header',
                    header: { size: 'h3', tag: 'h3', text: '<p>Retained values</p>' },
                  },
                ],
                has_image: '0',
                image: media(780, 'https://cdn.trayport.com/retained-column.jpg'),
                opacity: '50',
              },
            ],
            new_settings: {
              bottom_spacing: 'spacing-large',
              column_gap: 'tight',
              content_background: {
                background_color: { light: '#ffffff', style: 'light' },
                content_has_image: '0',
                rounded: 'theme-rounded-default',
              },
              top_spacing: 'spacing-tight',
            },
          },
        ],
      },
      coverage(),
    )

    expect(layout[0]).toMatchObject({
      columnGap: 'tight',
      spacingBottom: 'large',
      spacingTop: 'tight',
      surfacePadding: 'medium',
      surfaceTone: 'white',
    })
    const columns = layout[0]?.columns as Array<Record<string, unknown>>
    expect(columns[0]).toMatchObject({
      backgroundMedia: { $legacyRef: 'media', legacyId: 779 },
      backgroundOpacity: '10',
      border: 'subtle',
      componentGap: 'none',
      heightMode: 'content',
      horizontalAlign: 'center',
      padding: 'medium',
      radius: 'xl',
      surface: 'muted',
      verticalAlign: 'center',
    })
    expect((columns[0]?.components as Array<Record<string, unknown>>)[0]).toMatchObject({
      appearance: 'h1',
      level: 'h2',
    })
    expect(columns[1]).toMatchObject({
      backgroundMedia: null,
      backgroundOpacity: 'none',
      border: 'none',
      surface: 'none',
    })
  })

  it('preserves bounded feature display, explicit action visibility, style, and icon semantics', () => {
    const component = firstComponent({
      acf_fc_layout: 'features',
      feature: [
        {
          button: {
            icon: 'chart-mixed',
            new_link: { title: 'Explore Joule', url: '/products/joule/' },
            style: 'cta',
          },
          description: '<p>Trade wherever you are.</p>',
          display: 'image',
          image: { image: media(801, 'https://cdn.trayport.com/joule.jpg') },
          name: 'Joule',
          show_button: '1',
        },
        {
          button: {
            new_link: { title: 'Dormant action', url: '/dormant/' },
            style: 'primary',
          },
          display: 'icon',
          icon: 'arrow-trend-up',
          name: 'Retained but hidden',
          show_button: '0',
        },
      ],
    })

    expect(component).toMatchObject({
      blockType: 'featureList',
      items: [
        {
          actionIcon: 'chart',
          actionStyle: 'accent',
          display: 'image',
          showAction: true,
          title: 'Joule',
        },
        {
          actionStyle: 'primary',
          display: 'icon',
          icon: 'trend',
          showAction: false,
          title: 'Retained but hidden',
        },
      ],
      presentation: 'grid',
    })
  })

  it('combines the legacy four/eight product split into one lead-carousel composition', () => {
    const feature = (name: string, id: number): NormalizedValue => ({
      display: 'image',
      image: { image: media(id, `https://cdn.trayport.com/${id}.jpg`) },
      name,
      show_button: '0',
    })
    const layout = mapPageLayout(
      {
        sections_new: [
          {
            acf_fc_layout: 'columns',
            columns: [
              {
                acfe_layout_col: '4',
                components: [{ acf_fc_layout: 'features', feature: [feature('Lead', 810)] }],
              },
              {
                acfe_layout_col: '8',
                components: [
                  {
                    acf_fc_layout: 'features',
                    feature: [
                      feature('Second', 811),
                      feature('Third', 812),
                      feature('Fourth', 813),
                      feature('Fifth', 814),
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      coverage(),
    )
    const columns = layout[0]?.columns as Array<Record<string, unknown>>
    const components = columns[0]?.components as Array<Record<string, unknown>>

    expect(columns).toHaveLength(1)
    expect(columns[0]?.span).toBe('12')
    expect(components[0]).toMatchObject({
      blockType: 'featureList',
      presentation: 'leadCarousel',
    })
    expect(components[0]?.items).toHaveLength(5)
  })

  it.each([
    ['fire-flame', 'gas'],
    ['lightbulb', 'power'],
    ['industry', 'emissions'],
  ])('maps standalone legacy icon %s to semantic role %s', (legacyIcon, semanticIcon) => {
    expect(firstComponent({ acf_fc_layout: 'icon', icon: legacyIcon })).toEqual({
      blockType: 'standaloneIcon',
      icon: semanticIcon,
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

  it('does not expose a reusable-video admin name as a visible media caption', () => {
    const reusable: SourceReusable = {
      data: {
        name: 'Joule Functionality',
        video: media(7666, '/app/uploads/joule-functionality.mp4'),
      },
      entity: 'reusable',
      legacyId: 7665,
      path: null,
      postType: 'videos',
      schemaVersion: 1,
      title: 'Joule Functionality',
    }
    const layout = mapPageLayout(
      {
        sections_new: [
          {
            acf_fc_layout: 'single',
            components: [
              {
                acf_fc_layout: 'videos',
                category: { single: { $ref: 'post', id: reusable.legacyId } },
              },
            ],
          },
        ],
      },
      coverage(),
      {},
      new Map([[reusable.legacyId, reusable]]),
    )
    const columns = layout[0]?.columns as Array<{
      components: Array<Record<string, unknown>>
    }>

    expect(columns[0]?.components[0]).toMatchObject({
      aspect: 'wide',
      blockType: 'media',
      media: { $legacyRef: 'media', legacyId: 7666 },
    })
    expect(columns[0]?.components[0]).not.toHaveProperty('caption')
  })
})
