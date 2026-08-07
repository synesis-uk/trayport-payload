// @vitest-environment node

import { describe, expect, it } from 'vitest'

import {
  DataChartComponent,
  MarketCoverageComponent,
  MarketMatrixComponent,
  sectionComponents,
} from '@/blocks/Trayport/components'

type Option = { label: string; value: string }
type SiblingData = Record<string, unknown>
type Condition = (data: SiblingData, siblingData: SiblingData) => boolean
type SelectFilter = (args: {
  data: SiblingData
  options: Option[]
  req: unknown
  siblingData: SiblingData
}) => Option[]

type FieldNode = {
  admin?: {
    condition?: Condition
    description?: string
    hidden?: boolean
    initCollapsed?: boolean
  }
  fields?: FieldNode[]
  filterOptions?: SelectFilter | unknown
  label?: string
  name?: string
  options?: Option[]
  tabs?: Array<{
    fields: FieldNode[]
    label: string
    name?: string
  }>
  type?: string
}

const findField = (fields: FieldNode[], name: string): FieldNode | undefined => {
  for (const field of fields) {
    if (field.name === name) return field

    const nested = findField(field.fields || [], name)
    if (nested) return nested

    for (const tab of field.tabs || []) {
      const tabField = findField(tab.fields, name)
      if (tabField) return tabField
    }
  }
}

const rootFieldNames = (fields: FieldNode[]): string[] =>
  fields
    .flatMap((field): string[] => {
      if (field.name) return [field.name]
      return [
        ...rootFieldNames(field.fields || []),
        ...(field.tabs || []).flatMap((tab) => rootFieldNames(tab.fields)),
      ]
    })
    .sort()

const tabLabels = (fields: FieldNode[]): string[] =>
  fields.flatMap((field) => field.tabs?.map((tab) => tab.label) || [])

const conditionFor = (fields: FieldNode[], name: string): Condition => {
  const condition = findField(fields, name)?.admin?.condition
  expect(condition, `Expected ${name} to have an admin condition`).toBeTypeOf('function')
  return condition as Condition
}

const filteredValues = (field: FieldNode | undefined, siblingData: SiblingData): string[] => {
  expect(field?.filterOptions).toBeTypeOf('function')
  const options = field?.options || []
  const filtered = (field?.filterOptions as SelectFilter)({
    data: {},
    options,
    req: {},
    siblingData,
  })
  return filtered.map(({ value }) => value)
}

describe('specialist editor experience', () => {
  it('organises specialist blocks into editorial tabs without changing stored root paths', () => {
    const mapFields = MarketCoverageComponent.fields as FieldNode[]
    const chartFields = DataChartComponent.fields as FieldNode[]
    const matrixFields = MarketMatrixComponent.fields as FieldNode[]

    expect(tabLabels(mapFields)).toEqual([
      'Content',
      'Markets shown',
      'Visitor controls',
      'Map appearance',
    ])
    expect(tabLabels(chartFields)).toEqual(['Content', 'Data', 'Display', 'Advanced'])
    expect(tabLabels(matrixFields)).toEqual(['Content', 'Markets shown', 'Visitor controls'])

    expect(rootFieldNames(mapFields)).toEqual(
      [
        'actions',
        'assetClasses',
        'autoplayAssetClasses',
        'autoplayDelay',
        'backgroundMedia',
        'body',
        'dataDisplay',
        'defaultAssetClass',
        'height',
        'includedHubs',
        'lineColor',
        'lineOpacity',
        'lineWidth',
        'markerSize',
        'mode',
        'presentation',
        'regions',
        'showAssetClassFilter',
        'showLines',
        'showMarketData',
        'showSidebar',
        'style',
        'title',
        'venueTypes',
        'zoomTo',
      ].sort(),
    )
    expect(rootFieldNames(chartFields)).toEqual(
      [
        'accessibleSummary',
        'assetClass',
        'assetClassLegacyId',
        'axisLabel',
        'chartType',
        'dataType',
        'displayInterval',
        'excludedHubs',
        'fromQuarter',
        'fromYear',
        'height',
        'includedHubs',
        'scalePower',
        'seriesDimension',
        'showAxes',
        'showDataTable',
        'showLegend',
        'showValues',
        'title',
        'toQuarter',
        'toYear',
        'unit',
      ].sort(),
    )
    expect(rootFieldNames(matrixFields)).toEqual(
      [
        'assetClasses',
        'caption',
        'defaultView',
        'regions',
        'showDownload',
        'showFilters',
        'venueTypes',
      ].sort(),
    )
  })

  it('shows only map controls that apply to the selected experience and layout', () => {
    const fields = MarketCoverageComponent.fields as FieldNode[]

    expect(conditionFor(fields, 'title')({}, { presentation: 'mapOnly' })).toBe(false)
    expect(conditionFor(fields, 'title')({}, { presentation: 'summary' })).toBe(true)
    expect(conditionFor(fields, 'actions')({}, { presentation: 'mapOnly' })).toBe(false)

    for (const name of ['venueTypes', 'includedHubs', 'zoomTo', 'showSidebar', 'showMarketData']) {
      expect(conditionFor(fields, name)({}, { mode: 'globalConnections' })).toBe(false)
      expect(conditionFor(fields, name)({}, { mode: 'regionalConnectivity' })).toBe(true)
    }

    expect(conditionFor(fields, 'autoplayAssetClasses')({}, { mode: 'globalConnections' })).toBe(
      true,
    )
    expect(conditionFor(fields, 'autoplayAssetClasses')({}, { mode: 'regionalConnectivity' })).toBe(
      false,
    )
    expect(
      conditionFor(fields, 'autoplayDelay')(
        {},
        { autoplayAssetClasses: true, mode: 'globalConnections' },
      ),
    ).toBe(true)
    expect(
      conditionFor(fields, 'autoplayDelay')(
        {},
        { autoplayAssetClasses: false, mode: 'globalConnections' },
      ),
    ).toBe(false)
    expect(
      conditionFor(fields, 'dataDisplay')(
        {},
        { mode: 'regionalConnectivity', showMarketData: true },
      ),
    ).toBe(true)
    expect(
      conditionFor(fields, 'dataDisplay')(
        {},
        { mode: 'regionalConnectivity', showMarketData: false },
      ),
    ).toBe(false)
  })

  it('offers only chart combinations implemented by the frontend adapter', () => {
    const fields = DataChartComponent.fields as FieldNode[]
    const dataType = findField(fields, 'dataType')
    const chartType = findField(fields, 'chartType')

    expect(filteredValues(dataType, { seriesDimension: 'executionType' })).toEqual(['volume'])
    expect(filteredValues(dataType, { seriesDimension: 'hub' })).toEqual(['volume', 'price'])
    // Volume can be plotted stacked or unstacked for either comparison — the reference authors
    // both — while price remains a line.
    expect(
      filteredValues(chartType, { dataType: 'volume', seriesDimension: 'executionType' }),
    ).toEqual(['stackedColumn', 'column'])
    expect(filteredValues(chartType, { dataType: 'volume', seriesDimension: 'hub' })).toEqual([
      'stackedColumn',
      'column',
    ])
    expect(filteredValues(chartType, { dataType: 'price', seriesDimension: 'hub' })).toEqual([
      'line',
    ])

    expect(conditionFor(fields, 'fromQuarter')({}, {})).toBe(false)
    expect(conditionFor(fields, 'fromQuarter')({}, { fromYear: 2025 })).toBe(true)
    expect(conditionFor(fields, 'toQuarter')({}, {})).toBe(false)
    expect(conditionFor(fields, 'toQuarter')({}, { toYear: 2026 })).toBe(true)
    expect(conditionFor(fields, 'axisLabel')({}, { showAxes: false })).toBe(false)
    expect(conditionFor(fields, 'axisLabel')({}, { showAxes: true })).toBe(true)

    expect(findField(fields, 'assetClass')?.filterOptions).toEqual({
      marketDataKey: { exists: true },
    })
    expect(findField(fields, 'includedHubs')?.filterOptions).toEqual({
      marketDataKey: { exists: true },
    })
    expect(findField(fields, 'excludedHubs')?.filterOptions).toEqual({
      marketDataKey: { exists: true },
    })
  })

  it('adds useful local selector artwork, grouping and meaningful component row labels', () => {
    expect(MarketCoverageComponent.admin).toMatchObject({
      group: 'Market tools',
      images: {
        icon: { url: '/admin/blocks/specialist-market-map-icon.svg' },
        thumbnail: { url: '/admin/blocks/specialist-market-map-thumbnail.svg' },
      },
    })
    expect(DataChartComponent.admin).toMatchObject({
      group: 'Data and charts',
      images: {
        icon: { url: '/admin/blocks/specialist-data-chart-icon.svg' },
        thumbnail: { url: '/admin/blocks/specialist-data-chart-thumbnail.svg' },
      },
    })
    expect(MarketMatrixComponent.admin).toMatchObject({
      group: 'Market tools',
      images: {
        icon: { url: '/admin/blocks/specialist-market-matrix-icon.svg' },
        thumbnail: { url: '/admin/blocks/specialist-market-matrix-thumbnail.svg' },
      },
    })

    expect(sectionComponents).toHaveLength(22)
    expect(sectionComponents.find(({ slug }) => slug === 'peopleList')?.admin?.group).toBe(
      'Company information',
    )
    expect(sectionComponents.find(({ slug }) => slug === 'hubspotForm')?.admin?.group).toBe(
      'Integrations',
    )
    for (const component of sectionComponents) {
      expect(component.admin?.group, `${component.slug} needs a selector group`).toBeTruthy()
      expect(component.admin?.components?.Label).toBe(
        '@/components/AdminEditor/RowLabels.client#ComponentRowLabel',
      )
    }
  })

  it('describes matrix controls using the current visitor workflow', () => {
    const fields = MarketMatrixComponent.fields as FieldNode[]

    expect(findField(fields, 'showFilters')?.label).toBe('Let visitors filter the matrix')
    expect(findField(fields, 'showDownload')?.admin?.description).toContain('CSV')
    expect(findField(fields, 'showDownload')?.admin?.description).toContain('Excel')
  })
})
