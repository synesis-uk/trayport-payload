// @vitest-environment node

import fs from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  sourceLifecycleReusableSchema,
  type NormalizedValue,
  type SourceReusable,
} from '../../migration/contracts/v1'
import { mapPageLayout } from '../../migration/transform/blocks'
import { mapLifecycleReusable } from '../../migration/transform/lifecycle'
import { emptyTransformCoverage, type TransformCoverage } from '../../migration/transform/types'

const coverage = (): TransformCoverage => emptyTransformCoverage()

const lifecycleReusable = ({
  id,
  productID,
  productTitle = 'Joule',
}: {
  id: number
  productID?: number
  productTitle?: string
}): SourceReusable => ({
  data: {
    description: id === 4026 ? '<p>Supported detail.</p>' : '',
    duration: '12 months',
    eoa_date: '',
    eol_date: id === 4026 ? '20261110' : '20250331',
    eol_version: id === 4026 ? '6.0.36' : '2.135.0.14685',
    name: id === 4026 ? 'Joule 6.0.36' : 'Joule Direct API',
    product: productID
      ? {
          $ref: 'post',
          id: productID,
          postType: 'product',
          title: productTitle,
        }
      : false,
  },
  entity: 'reusable',
  legacyId: id,
  path: `/lifecycle/${id}/`,
  postType: 'lifecycle',
  schemaVersion: 1,
  title: id === 4026 ? 'Joule 6.0.36' : 'Joule Direct API',
})

const firstComponent = (
  component: Record<string, NormalizedValue>,
  reusables: SourceReusable[] = [],
) => {
  const layout = mapPageLayout(
    {
      sections_new: [{ acf_fc_layout: 'single', components: [component] }],
    },
    coverage(),
    {},
    new Map(reusables.map((record) => [record.legacyId, record])),
  )
  const columns = layout[0]?.columns as Array<{ components: Array<Record<string, unknown>> }>
  return columns[0]?.components[0]
}

describe('WordPress checklist and lifecycle migration', () => {
  it('maps only the bounded checklist fields and row limit', () => {
    const items = Array.from({ length: 25 }, (_, index) => ({
      header: index === 0 ? '<strong>Fast</strong>' : '',
      icon: index === 0 ? 'arbitrary-legacy-icon' : '',
      item: `<p>Benefit ${index + 1}</p>`,
    }))

    expect(firstComponent({ acf_fc_layout: 'checklist', items })).toMatchObject({
      appearance: 'checks',
      blockType: 'checklist',
      items: expect.arrayContaining([{ text: 'Benefit 1', title: 'Fast' }]),
    })
    expect(firstComponent({ acf_fc_layout: 'checklist', items })?.items as unknown[]).toHaveLength(
      24,
    )
    expect(firstComponent({ acf_fc_layout: 'checklist', items })).not.toHaveProperty('icon')
  })

  it('resolves all, specific, and product lifecycle selectors to managed relationships', () => {
    const joule = lifecycleReusable({ id: 4026, productID: 752 })
    const api = lifecycleReusable({ id: 4208, productID: 752 })
    const broker = lifecycleReusable({ id: 4209, productID: 1863, productTitle: 'Broker' })
    const reusables = [broker, api, joule]

    expect(
      firstComponent({ acf_fc_layout: 'lifecycle', category: { type: 'all' } }, reusables)
        ?.lifecycleItems,
    ).toEqual([
      { $legacyRef: 'lifecycle-item', legacyId: 4026 },
      { $legacyRef: 'lifecycle-item', legacyId: 4208 },
      { $legacyRef: 'lifecycle-item', legacyId: 4209 },
    ])
    expect(
      firstComponent(
        {
          acf_fc_layout: 'lifecycle',
          category: {
            type: 'specific',
            specific: [
              { $ref: 'post', id: 4209 },
              { $ref: 'post', id: 4026 },
            ],
          },
        },
        reusables,
      )?.lifecycleItems,
    ).toEqual([
      { $legacyRef: 'lifecycle-item', legacyId: 4209 },
      { $legacyRef: 'lifecycle-item', legacyId: 4026 },
    ])
    expect(
      firstComponent(
        {
          acf_fc_layout: 'lifecycle',
          category: { type: 'single', single: { $ref: 'post', id: 752 } },
        },
        reusables,
      )?.lifecycleItems,
    ).toEqual([
      { $legacyRef: 'lifecycle-item', legacyId: 4026 },
      { $legacyRef: 'lifecycle-item', legacyId: 4208 },
    ])
  })

  it('validates and maps the active lifecycle reusable contract', () => {
    const source = lifecycleReusable({ id: 4026, productID: 752 })
    expect(sourceLifecycleReusableSchema.parse(source)).toMatchObject({
      legacyId: 4026,
      postType: 'lifecycle',
    })
    expect(mapLifecycleReusable(source)).toMatchObject({
      target: 'lifecycle-items',
      legacy: { legacyId: 4026, source: 'wordpress' },
      data: {
        _status: 'published',
        active: true,
        endOfAccessDate: null,
        endOfLifeDate: '2026-11-10T00:00:00.000Z',
        endOfLifeVersion: '6.0.36',
        productLabel: 'Joule',
        serviceName: 'Joule 6.0.36',
      },
    })
    expect(() =>
      sourceLifecycleReusableSchema.parse({
        ...source,
        data: { ...source.data, eol_date: '10/11/2026' },
      }),
    ).toThrow()
  })

  it('keeps the exporter limited to published lifecycle rows and seven named fields', () => {
    const exporter = fs.readFileSync('migration/wp-exporter/export.php', 'utf8')
    expect(exporter).toContain("'post_type' => 'lifecycle'")
    expect(exporter).toContain("'post_status' => 'publish'")
    expect(exporter).toContain(
      "['product', 'name', 'duration', 'eol_version', 'eol_date', 'eoa_date', 'description']",
    )
  })
})
