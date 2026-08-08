// @vitest-environment node

import { describe, expect, it } from 'vitest'

import {
  DataChartComponent,
  EmbedComponent,
  FeatureListComponent,
  HeadingComponent,
  MarketCoverageComponent,
  StandaloneIconComponent,
} from '@/blocks/Trayport/components'
import { ContentSection, TrayportHero } from '@/blocks/Trayport/config'
import { Hubs } from '@/collections/Hubs'
import { Navigation } from '@/globals/Navigation'
import { SiteSettings } from '@/globals/SiteSettings'

type FieldNode = {
  access?: {
    create?: (args: never) => boolean
    update?: (args: never) => boolean
  }
  admin?: { hidden?: boolean; readOnly?: boolean }
  defaultValue?: unknown
  fields?: FieldNode[]
  filterOptions?: (args: { data?: Record<string, unknown> }) => string[] | true
  hasMany?: boolean
  maxRows?: number
  name?: string
  options?: Array<string | { label: string; value: string }>
  relationTo?: string
  required?: boolean
  tabs?: Array<{ fields?: FieldNode[]; label?: string }>
}

const findField = (fields: FieldNode[], name: string): FieldNode | undefined => {
  for (const field of fields) {
    if (field.name === name) return field
    const nested = findField(field.fields || [], name)
    if (nested) return nested
    for (const tab of field.tabs || []) {
      const tabField = findField(tab.fields || [], name)
      if (tabField) return tabField
    }
  }
}

const expectHidden = (fields: unknown, name: string) => {
  const field = findField(fields as FieldNode[], name)
  expect(field, `Expected field ${name}`).toBeDefined()
  expect(field?.admin?.hidden, `Expected ${name} to be hidden`).toBe(true)
}

const optionValues = (field?: FieldNode) =>
  field?.options?.map((option) => (typeof option === 'string' ? option : option.value))

describe('bounded editor controls', () => {
  it('exposes only chart controls implemented by the application-data renderer', () => {
    expect(findField(DataChartComponent.fields as FieldNode[], 'dataType')?.admin?.hidden).not.toBe(
      true,
    )
    expect(
      findField(DataChartComponent.fields as FieldNode[], 'chartType')?.admin?.hidden,
    ).not.toBe(true)
    expect(optionValues(findField(DataChartComponent.fields as FieldNode[], 'dataType'))).toEqual([
      'volume',
      'price',
    ])
    expectHidden(DataChartComponent.fields, 'assetClassLegacyId')
    expect(findField(DataChartComponent.fields as FieldNode[], 'assetClass')).toMatchObject({
      relationTo: 'asset-classes',
      required: true,
    })
    expect(findField(DataChartComponent.fields as FieldNode[], 'seriesDimension')).toMatchObject({
      defaultValue: 'executionType',
      options: [
        { label: 'Execution type', value: 'executionType' },
        { label: 'Hub', value: 'hub' },
      ],
      required: true,
    })
    expect(findField(DataChartComponent.fields as FieldNode[], 'displayInterval')).toMatchObject({
      defaultValue: 'quarter',
      options: [
        { label: 'Month', value: 'month' },
        { label: 'Quarter', value: 'quarter' },
        { label: 'Year', value: 'year' },
      ],
      required: true,
    })
    for (const fieldName of ['includedHubs', 'excludedHubs']) {
      expect(findField(DataChartComponent.fields as FieldNode[], fieldName)).toMatchObject({
        hasMany: true,
        relationTo: 'hubs',
      })
    }
  })

  it('populates the stable and compatibility identifiers required by nested chart filters', () => {
    expect(Hubs.defaultPopulate).toMatchObject({
      legacySource: { legacyId: true },
      marketDataKey: true,
    })
  })

  it('exposes implemented managed map controls while retaining the inactive embed value', () => {
    const fields = MarketCoverageComponent.fields as FieldNode[]

    expect(optionValues(findField(fields, 'mode'))).toEqual([
      'globalConnections',
      'regionalConnectivity',
    ])
    expect(findField(fields, 'assetClasses')).toMatchObject({
      hasMany: true,
      relationTo: 'asset-classes',
    })
    expect(findField(fields, 'venueTypes')).toMatchObject({
      hasMany: true,
      relationTo: 'venue-types',
    })
    expect(findField(fields, 'regions')).toMatchObject({
      hasMany: true,
      relationTo: 'regions',
    })
    expect(findField(fields, 'includedHubs')).toMatchObject({
      hasMany: true,
      relationTo: 'hubs',
    })
    for (const fieldName of [
      'assetClasses',
      'venueTypes',
      'regions',
      'includedHubs',
      'showAssetClassFilter',
    ]) {
      expect(findField(fields, fieldName)?.admin?.hidden).not.toBe(true)
    }
    expectHidden(EmbedComponent.fields, 'poster')
  })

  it('keeps the legacy hub inverse hidden, read-only, and API-write protected', () => {
    const venueConnectionsTab = (Hubs.fields as FieldNode[])
      .flatMap((field) => field.tabs || [])
      .find(({ label }) => label === 'Venue connections')
    const connections = venueConnectionsTab?.fields?.find(({ name }) => name === 'connections')

    expect(venueConnectionsTab).toBeDefined()
    expect(connections?.admin).toMatchObject({ hidden: true, readOnly: true })
    expect(connections?.access?.create?.({} as never)).toBe(false)
    expect(connections?.access?.update?.({} as never)).toBe(false)
  })

  it('offers the managed matrix only inside interactive page content sections', () => {
    const components = findField(ContentSection.fields as FieldNode[], 'components')

    expect(components?.filterOptions?.({ data: { pageType: 'interactive' } })).toBe(true)
    expect(components?.filterOptions?.({ data: { pageType: 'standard' } })).not.toContain(
      'marketMatrix',
    )
    expect(components?.filterOptions?.({ data: {} })).not.toContain('marketMatrix')
  })

  it('keeps section columns bounded while admitting the observed ten-column source layout', () => {
    // /products/customer-portal/ alternates five text/media pairs, so the bound has to admit ten
    // while still stopping an unbounded grid.
    expect(findField(ContentSection.fields as FieldNode[], 'columns')?.maxRows).toBe(12)
  })

  it('bounds hero actions, badges, media aspect, and heading appearance', () => {
    expect(optionValues(findField(TrayportHero.fields as FieldNode[], 'badgeTone'))).toEqual([
      'secondary',
      'info',
    ])
    expect(optionValues(findField(TrayportHero.fields as FieldNode[], 'badgeIcon'))).toEqual([
      'people',
      'tradingScreen',
    ])
    expect(optionValues(findField(TrayportHero.fields as FieldNode[], 'mediaAspect'))).toEqual([
      'twoToOne',
      'sixteenToNine',
    ])
    expect(optionValues(findField(TrayportHero.fields as FieldNode[], 'style'))).toEqual([
      'primary',
      'secondary',
      'accent',
      'info',
      'link',
    ])
    expect(optionValues(findField(TrayportHero.fields as FieldNode[], 'icon'))).toEqual([
      'arrowRight',
      'chart',
      'europe',
      'forward',
      'people',
      'play',
      'settings',
    ])
    expect(optionValues(findField(HeadingComponent.fields as FieldNode[], 'level'))).toEqual([
      'h2',
      'h3',
      'h4',
    ])
    expect(optionValues(findField(HeadingComponent.fields as FieldNode[], 'appearance'))).toEqual([
      'h1',
      'h2',
      'h3',
      'h4',
    ])
  })

  it('exposes only the active bounded section and column presentation controls', () => {
    const fields = ContentSection.fields as FieldNode[]
    expect(optionValues(findField(fields, 'surfaceTone'))).toEqual([
      'none',
      'white',
      'softBlue',
      'dark',
    ])
    // Four deliberate steps against WordPress's five. `none` is kept because zero spacing is a
    // distinct intent an editor needs and 45 imported section edges use it — collapsing it into
    // `regular`, as the importer did, silently changed those pages. `xl` folds into `large`,
    // because a second step above standard is the kind of near-duplicate choice this rebuild exists
    // to remove.
    const spacingSteps = ['none', 'tight', 'regular', 'large']
    expect(optionValues(findField(fields, 'spacingTop'))).toEqual(spacingSteps)
    expect(optionValues(findField(fields, 'spacingBottom'))).toEqual(spacingSteps)
    expect(optionValues(findField(fields, 'columnGap'))).toEqual(['tight', 'regular'])
    expect(optionValues(findField(fields, 'horizontalAlign'))).toEqual(['left', 'center'])
    expect(optionValues(findField(fields, 'verticalAlign'))).toEqual(['start', 'center'])
    expect(optionValues(findField(fields, 'heightMode'))).toEqual(['fill', 'content'])
    expect(optionValues(findField(fields, 'componentGap'))).toEqual(['none', 'regular'])
    expect(optionValues(findField(fields, 'padding'))).toEqual(['none', 'medium'])
    expect(optionValues(findField(fields, 'surface'))).toEqual(['none', 'muted', 'soft'])
    expect(optionValues(findField(fields, 'border'))).toEqual(['none', 'subtle'])
    expect(optionValues(findField(fields, 'radius'))).toEqual(['default', 'xl'])
    expect(findField(fields, 'wrapperBackgroundMedia')).toBeUndefined()
    expect(findField(fields, 'contentSpacing')).toBeUndefined()
  })

  it('bounds feature presentation, item display, actions, and standalone icon roles', () => {
    const featureFields = FeatureListComponent.fields as FieldNode[]
    expect(optionValues(findField(featureFields, 'presentation'))).toEqual([
      'grid',
      'carousel',
      'leadCarousel',
    ])
    expect(optionValues(findField(featureFields, 'display'))).toEqual(['plain', 'image', 'icon'])
    expect(optionValues(findField(featureFields, 'actionStyle'))).toEqual([
      'primary',
      'secondary',
      'accent',
      'info',
      'link',
    ])
    expect(optionValues(findField(featureFields, 'actionIcon'))).toEqual([
      'arrowRight',
      'chart',
      'europe',
      'forward',
      'people',
      'play',
      'settings',
    ])
    expect(optionValues(findField(StandaloneIconComponent.fields as FieldNode[], 'icon'))).toEqual([
      'gas',
      'power',
      'emissions',
    ])
  })

  it('bounds active navigation controls and hides retained legacy fields', () => {
    expectHidden(Navigation.fields, 'groupLabel')
    expectHidden(Navigation.fields, 'children')
    expect(findField(Navigation.fields as FieldNode[], 'primaryAction')).toBeUndefined()

    const groups = findField(Navigation.fields as FieldNode[], 'groups')
    const icon = findField(groups?.fields || [], 'icon')
    const accent = findField(groups?.fields || [], 'accent')
    const span = findField(groups?.fields || [], 'span')

    expect(groups).toBeDefined()
    expect(icon?.options?.length).toBeGreaterThan(0)
    expect(
      accent?.options?.map((option) => (typeof option === 'string' ? option : option.value)),
    ).toEqual(['blue', 'cyan', 'green', 'yellow', 'orange'])
    expect(
      span?.options?.map((option) => (typeof option === 'string' ? option : option.value)),
    ).toEqual(['auto', '2', '3', '4', '6'])
  })

  it('keeps inactive brand fields hidden', () => {
    expectHidden(SiteSettings.fields, 'logo')
    expectHidden(SiteSettings.fields, 'logoOnDark')
    expectHidden(SiteSettings.fields, 'favicon')
  })
})
