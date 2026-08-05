// @vitest-environment node

import type { NormalizedValue, SourceReusable } from '../../migration/contracts/v1'
import { discoverProductionInventory } from '../../migration/inventory/discover'
import { productionScope } from '../../migration/scopes/production'
import {
  canonicalEventArticleSlug,
  canonicalEventPath,
  eventDetailsFromWordPress,
  personDataFromWordPress,
} from '../../migration/transform'
import {
  hubSpotFormComponentFromWordPress,
  mapPageLayout,
  statsRightComponentsFromWordPress,
} from '../../migration/transform/blocks'
import type { TransformCoverage } from '../../migration/transform/types'
import {
  migrationDestination,
  setMigrationOwnedCorpusPaths,
} from '../../migration/transform/url'
import { productionFixture } from '../fixtures/productionInventory'
import { describe, expect, it } from 'vitest'

const coverage = (): TransformCoverage => ({
  componentLayouts: {},
  ignoredComponentLayouts: {},
  ignoredTaxonomies: {},
  topLevelLayouts: {},
  unsupportedComponentLayouts: [],
  unsupportedTopLevelLayouts: [],
})

const firstComponent = (layout: ReturnType<typeof mapPageLayout>): unknown => {
  const columns = layout[0]?.columns
  if (!Array.isArray(columns)) return undefined
  const column = columns[0]
  if (!column || typeof column !== 'object' || Array.isArray(column)) return undefined
  const components = (column as Record<string, unknown>).components
  return Array.isArray(components) ? components[0] : undefined
}

const personReusable = (
  legacyId: number,
  publishedAt: string,
  team: 'careers' | 'ceo' = 'careers',
): SourceReusable => ({
  schemaVersion: 1,
  data: { name: `Person ${legacyId}`, team },
  entity: 'reusable',
  legacyId,
  menuOrder: 0,
  modifiedAt: publishedAt,
  path: `/people/person-${legacyId}/`,
  postType: 'people',
  publishedAt,
  status: 'publish',
  title: `Person ${legacyId}`,
})

describe('People and Event migration parity', () => {
  it('retains sparse published People without inventing biography, role, or portrait content', () => {
    const data = personDataFromWordPress({
      schemaVersion: 1,
      entity: 'reusable',
      legacyId: 11233,
      postType: 'people',
      status: 'publish',
      title: 'Nicole Rosenberg',
      path: '/people/nicole-rosenberg/',
      menuOrder: 0,
      publishedAt: '2026-07-01T00:00:00+00:00',
      modifiedAt: '2026-07-02T00:00:00+00:00',
      data: {
        date: '',
        description: '',
        external_link: '',
        image: false,
        job_role: '',
        name: 'Nicole Rosenberg',
        page_settings: {},
        quote: '<p>Trayport gives people room to grow.</p>',
        team: 'ceo',
      },
    })

    expect(data).toMatchObject({
      _status: 'published',
      path: '/people/nicole-rosenberg/',
      slug: 'nicole-rosenberg',
      team: 'ceo',
      title: 'Nicole Rosenberg',
    })
    expect(data).not.toHaveProperty('description')
    expect(data).not.toHaveProperty('image')
    expect(data).not.toHaveProperty('jobRole')
    expect(data.quote).toBeTruthy()
  })

  it('normalizes structured Event dates, location, coordinates, and HubSpot identity', () => {
    const details = eventDetailsFromWordPress({
      postType: 'events',
      acf: {
        date: '20260212',
        form_title: 'E-World 2026 - Request a Meeting',
        hubspot_form_id: '8c3a5fef-87b8-43c2-9662-fb663f0f3e9f',
        latlng: {
          city: 'Essen',
          country: 'Germany',
          lat: 51.429161,
          lng: 6.9929165,
          name: 'MESSE ESSEN GmbH',
          state: 'Nordrhein-Westfalen',
        },
        start_date: '20260210',
      },
    })

    expect(details).toEqual({
      city: 'Essen',
      coordinates: { latitude: 51.429161, longitude: 6.9929165 },
      country: 'Germany',
      endsAt: '2026-02-12T00:00:00.000Z',
      formTitle: 'E-World 2026 - Request a Meeting',
      hideFormsAfterEnd: true,
      hubspotFormId: '8c3a5fef-87b8-43c2-9662-fb663f0f3e9f',
      region: 'Nordrhein-Westfalen',
      showFinishedNotice: true,
      startsAt: '2026-02-10T00:00:00.000Z',
      venueName: 'MESSE ESSEN GmbH',
    })
    expect(
      hubSpotFormComponentFromWordPress({
        form: {
          form_title: details.formTitle,
          hubspot_form_id: details.hubspotFormId,
        },
      }),
    ).toEqual({
      blockType: 'hubspotForm',
      formId: details.hubspotFormId,
      title: details.formTitle,
    })
  })

  it('does not add legacy lifecycle behavior to core Event articles', () => {
    expect(
      eventDetailsFromWordPress({
        postType: 'post',
        acf: {
          date: '20260212',
          start_date: '20260210',
        },
      }),
    ).not.toMatchObject({ hideFormsAfterEnd: true, showFinishedNotice: true })
  })

  it('preserves authored stats-right content and omits wholly blank legacy statistic rows', () => {
    const components = statsRightComponentsFromWordPress({
      acf_fc_layout: 'stats-right',
      content: {
        header: { text: 'Event scale' },
        paragraph: '<p>Meet the Trayport team at the event.</p>',
        stats: [
          {
            data: { number: '1,500', prefix: '', suffix: '+' },
            description: 'Across the energy market',
            title: 'Attendees',
          },
          {
            data: { number: '', prefix: '', suffix: '' },
            description: '',
            title: '',
          },
        ],
      },
    })

    expect(components.map(({ blockType }) => blockType)).toEqual([
      'heading',
      'richText',
      'statistics',
    ])
    expect(components[2]).toMatchObject({
      blockType: 'statistics',
      items: [
        {
          description: 'Across the energy market',
          label: 'Attendees',
          value: '1,500+',
        },
      ],
    })
  })

  it('maps People components to live relationships and preserves WP team order', () => {
    const people = [
      personReusable(4145, '2024-01-01T00:00:00Z'),
      personReusable(4146, '2024-02-01T00:00:00Z'),
      personReusable(4837, '2024-03-01T00:00:00Z'),
      personReusable(4839, '2024-04-01T00:00:00Z'),
      personReusable(4841, '2024-05-01T00:00:00Z'),
      personReusable(4843, '2024-06-01T00:00:00Z'),
      personReusable(2561, '2023-01-01T00:00:00Z', 'ceo'),
    ]
    const reusables = new Map(people.map((person) => [person.legacyId, person]))
    const component = (category: { [key: string]: NormalizedValue }) =>
      firstComponent(
        mapPageLayout(
        {
          sections_new: [
            {
              acf_fc_layout: 'single',
              components: [{ acf_fc_layout: 'people', category }],
            },
          ],
        },
        coverage(),
        {},
        reusables,
        ),
      )

    expect(component({ team: { team: 'careers' }, type: 'team' })).toMatchObject({
      blockType: 'peopleList',
      people: [4843, 4841, 4839, 4837, 4146, 4145].map((legacyId) => ({
        $legacyRef: 'person',
        legacyId,
      })),
      presentation: 'careersCarousel',
      selectionMode: 'team',
      team: 'careers',
    })
    expect(
      component({
        specific: [
          { $ref: 'post', id: 2561 },
          { $ref: 'post', id: 4843 },
        ],
        type: 'specific',
      }),
    ).toMatchObject({
      blockType: 'peopleList',
      people: [
        { $legacyRef: 'person', legacyId: 2561 },
        { $legacyRef: 'person', legacyId: 4843 },
      ],
      presentation: 'leadershipGrid',
      selectionMode: 'specific',
    })
  })

  it('keeps canonical Event and People paths internal and resolves legacy Event links to Articles', () => {
    setMigrationOwnedCorpusPaths([
      '/event/e-world-2026/',
      '/events/e-world-2026/',
      '/people/peter-conroy/',
    ])
    expect(migrationDestination('https://www.trayport.com/event/e-world-2026/')).toBe(
      '/event/e-world-2026/',
    )
    expect(migrationDestination('/people/peter-conroy/')).toBe('/people/peter-conroy/')

    const layout = mapPageLayout(
      {
        sections_new: [
          {
            acf_fc_layout: 'single',
            components: [
              {
                acf_fc_layout: 'buttons',
                buttons: [
                  {
                    new_link: {
                      title: 'E-world 2026',
                      url: '/events/e-world-2026/',
                      value: { $ref: 'post', id: 8850 },
                    },
                    style: 'primary',
                  },
                ],
              },
            ],
          },
        ],
      },
      coverage(),
      {},
      new Map(),
      new Map([
        [
          8850,
          { kind: 'article', legacyId: 10030, relationTo: 'articles' },
        ],
      ]),
    )

    expect(firstComponent(layout)).toMatchObject({
      actions: [
        {
          link: {
            reference: {
              relationTo: 'articles',
              value: { $legacyRef: 'article', legacyId: 10030 },
            },
            type: 'reference',
          },
        },
      ],
      blockType: 'actions',
    })
  })

  it('keeps all 17 People and 23 unique Event owners while reversing five legacy aliases', () => {
    const inventory = discoverProductionInventory(productionFixture(), productionScope)
    const people = inventory.routes.filter(({ targetOwner }) => targetOwner === 'people')
    const events = inventory.routes.filter(
      ({ canonicalPath, targetOwner }) =>
        targetOwner === 'articles' && canonicalPath.startsWith('/event/'),
    )

    expect(people).toHaveLength(17)
    expect(events).toHaveLength(23)
    expect(inventory.summary).toMatchObject({ listingRoutes: 263, redirects: 53, routes: 317 })
    expect(events.map(({ canonicalPath }) => canonicalPath)).toEqual(
      expect.arrayContaining([
        '/event/commodity-trading-week-2026/',
        '/event/energy-trading-week-2026/',
        '/event/eworld-2025/',
      ]),
    )
    const eventPaths = new Set(events.map(({ canonicalPath }) => canonicalPath))
    expect(eventPaths.size).toBe(23)
    expect(inventory.redirects.filter(({ from }) => from?.startsWith('/events/'))).toHaveLength(5)
    expect(
      inventory.redirects
        .filter(({ from }) => from?.startsWith('/events/'))
        .every(({ to, type }) => to?.startsWith('/event/') && type === '301'),
    ).toBe(true)
  })

  it('pins the two similarly named 2026 source posts to distinct canonical routes', () => {
    expect(
      canonicalEventArticleSlug({ legacyId: 10974, slug: 'commodity-trading-week-2026' }),
    ).toBe('commodity-trading-week-2026')
    expect(canonicalEventPath('commodity-trading-week-2026')).toBe(
      '/event/commodity-trading-week-2026/',
    )
    expect(canonicalEventPath('energy-trading-week-2026')).toBe('/event/energy-trading-week-2026/')
  })
})
