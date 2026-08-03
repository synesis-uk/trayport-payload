// @vitest-environment node

import type { NormalizedValue } from '../../migration/contracts/v1'
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

const term = (id: number, taxonomy: 'asset-class' | 'region' | 'venue-type'): NormalizedValue => ({
  $ref: 'term',
  id,
  taxonomy,
})

const transformedCoverage = (overrides: Record<string, NormalizedValue> = {}) => {
  const layout = mapPageLayout(
    {
      sections_new: [
        {
          acf_fc_layout: 'single',
          components: [
            {
              acf_fc_layout: 'connections',
              asset_classes: [term(22, 'asset-class'), term(21, 'asset-class')],
              color: { color: '#009cde', shade: '#52afde', type: 'brand' },
              height: '350',
              line_opacity: '0.5',
              line_width: '0.2',
              marker_size: '3',
              regions: [term(31, 'region'), term(29, 'region'), term(30, 'region')],
              show_lines: '1',
              style: 'dark',
              venue_types: [term(41, 'venue-type'), term(43, 'venue-type'), term(42, 'venue-type')],
              ...overrides,
            },
          ],
        },
      ],
    },
    coverage(),
  )

  expect(layout).toHaveLength(1)
  const section = layout[0]
  expect(section?.blockType).toBe('contentSection')
  const columns = section?.columns as Array<{ components: Array<Record<string, unknown>> }>
  return columns[0]?.components[0]
}

describe('WordPress connection-map transform', () => {
  it('preserves the Home map controls and assigns the managed dark-map background', () => {
    expect(transformedCoverage()).toMatchObject({
      blockType: 'marketCoverage',
      style: 'dark',
      backgroundMedia: { $legacyRef: 'media', legacyId: 6101 },
      height: 350,
      markerSize: 3,
      showLines: true,
      lineColor: '#009cde',
      lineWidth: 0.2,
      lineOpacity: 0.5,
      assetClasses: [
        { $legacyRef: 'asset-class', legacyId: 22 },
        { $legacyRef: 'asset-class', legacyId: 21 },
      ],
      venueTypes: [
        { $legacyRef: 'venue-type', legacyId: 41 },
        { $legacyRef: 'venue-type', legacyId: 43 },
        { $legacyRef: 'venue-type', legacyId: 42 },
      ],
      regions: [
        { $legacyRef: 'region', legacyId: 31 },
        { $legacyRef: 'region', legacyId: 29 },
        { $legacyRef: 'region', legacyId: 30 },
      ],
    })
  })

  it('preserves light-map and disabled-line choices without assigning the dark background', () => {
    expect(
      transformedCoverage({
        style: 'light',
        show_lines: '0',
        line_width: '0.3',
      }),
    ).toMatchObject({
      style: 'light',
      backgroundMedia: null,
      showLines: false,
      lineWidth: 0.3,
    })
  })
})
