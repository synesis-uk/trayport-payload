// @vitest-environment node

import { describe, expect, it } from 'vitest'

import {
  normalizeChecklistComponent,
  normalizeLifecycleComponent,
} from '@/components/blocks/checklistLifecycleModels'

describe('checklist and lifecycle presentation models', () => {
  it('normalizes checklist defaults and drops empty rows', () => {
    expect(
      normalizeChecklistComponent({
        appearance: 'unbounded-value',
        items: [{ id: 'one', text: ' First benefit ', title: ' Heading ' }, { text: '   ' }],
      }),
    ).toEqual({
      appearance: 'checks',
      items: [{ key: 'one', text: 'First benefit', title: 'Heading' }],
    })
  })

  it('groups and orders active populated lifecycle rows around the requested date', () => {
    const model = normalizeLifecycleComponent(
      {
        caption: 'Lifecycle schedule',
        lifecycleItems: [
          {
            active: true,
            duration: '12 months',
            endOfLifeDate: '2026-11-10T00:00:00.000Z',
            endOfLifeVersion: '6.0.36',
            id: 1,
            productLabel: 'Joule',
            serviceName: 'Joule 6.0.36',
          },
          {
            active: true,
            endOfAccessDate: '2025-03-31T00:00:00.000Z',
            endOfLifeDate: '2025-03-31T00:00:00.000Z',
            id: 2,
            productLabel: 'Joule',
            serviceName: 'Joule Direct API',
          },
          {
            active: false,
            endOfLifeDate: '2027-01-01T00:00:00.000Z',
            id: 3,
            productLabel: 'Hidden',
            serviceName: 'Hidden row',
          },
          99,
        ],
      },
      { now: new Date('2026-08-04T12:00:00.000Z') },
    )

    expect(model.periods[0]).toMatchObject({
      heading: 'Upcoming End-of-Life Details',
      groups: [
        {
          label: 'Joule',
          items: [
            {
              endOfLifeDate: { iso: '2026-11-10', label: '10/11/2026' },
              serviceName: 'Joule 6.0.36',
            },
          ],
        },
      ],
    })
    expect(model.periods[1].groups[0]?.items[0]).toMatchObject({
      endOfAccessDate: { iso: '2025-03-31', label: '31/03/2025' },
      endOfLifeDate: { iso: '2025-03-31', label: '31/03/2025' },
      serviceName: 'Joule Direct API',
    })
  })

  it('only includes supplied descriptions when explicitly enabled', () => {
    const item = {
      endOfLifeDate: '2027-01-01T00:00:00.000Z',
      id: 1,
      productLabel: 'Joule',
      serviceName: 'Joule',
    }
    const hidden = normalizeLifecycleComponent(
      { lifecycleItems: [item], showDescriptions: false },
      { descriptions: ['Detail'], now: new Date('2026-01-01T00:00:00.000Z') },
    )
    const shown = normalizeLifecycleComponent(
      { lifecycleItems: [item], showDescriptions: true },
      { descriptions: ['Detail'], now: new Date('2026-01-01T00:00:00.000Z') },
    )

    expect(hidden.periods[0].groups[0]?.items[0]?.description).toBeUndefined()
    expect(shown.periods[0].groups[0]?.items[0]?.description).toBe('Detail')
  })
})
