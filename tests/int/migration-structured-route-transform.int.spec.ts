// @vitest-environment node

import type { SourcePost } from '../../migration/contracts/v1'
import {
  venueConnectionsFromWordPress,
  venueEditorialDataFromWordPress,
  venueWebsiteFromWordPress,
} from '../../migration/transform'
import { mapArticleLayout } from '../../migration/transform/blocks'
import type { TransformCoverage } from '../../migration/transform/types'
import { describe, expect, it } from 'vitest'

const venuePost = (overrides: Partial<SourcePost> = {}): SourcePost => ({
  schemaVersion: 1,
  entity: 'post',
  legacyId: 3363,
  postType: 'venue',
  status: 'publish',
  title: 'EEX',
  slug: 'eex',
  path: '/venue/eex/',
  parentId: 0,
  menuOrder: 0,
  excerpt: '',
  content: '',
  publishedAt: '2024-12-20T23:17:14+00:00',
  modifiedAt: '2025-07-07T13:45:38+00:00',
  featuredMediaId: null,
  scopeRole: 'root',
  featuredOrder: null,
  taxonomies: {},
  acf: {
    display_name: 'EEX',
    page_settings: {
      meta_description: 'Search-only EEX description.',
      page_title: 'EEX | Exchange | Trayport',
    },
  },
  ...overrides,
})

const hub = (id: number) => ({
  $ref: 'post' as const,
  id,
  postType: 'hub',
  title: `Hub ${id}`,
  path: `/market-coverage/hub-${id}/`,
})

const coverage = (): TransformCoverage => ({
  componentLayouts: {},
  ignoredComponentLayouts: {},
  topLevelLayouts: {},
  ignoredTaxonomies: {},
  unsupportedComponentLayouts: [],
  unsupportedTopLevelLayouts: [],
})

describe('structured-route WordPress transform', () => {
  it('keeps public venue SEO metadata out of visible summary and About content', () => {
    const result = venueEditorialDataFromWordPress(venuePost(), true)

    expect(result).toMatchObject({
      description: null,
      meta: {
        description: 'Search-only EEX description.',
        title: 'EEX | Exchange | Trayport',
      },
      summary: null,
    })
  })

  it('retains relationship-only venue names as index summaries', () => {
    expect(venueEditorialDataFromWordPress(venuePost(), false)).toEqual({
      description: undefined,
      meta: undefined,
      summary: 'EEX',
    })
  })

  it('upgrades the legacy GFI website and preserves valid HTTPS venue websites', () => {
    expect(venueWebsiteFromWordPress('http://www.gfigroup.co.uk/')).toBe(
      'https://www.gfigroup.co.uk/',
    )
    expect(venueWebsiteFromWordPress('https://www.eex.com/en/')).toBe('https://www.eex.com/en/')
  })

  it.each([
    'http://editor:secret@example.com/',
    'https://editor:secret@example.com/',
    'ftp://example.com/',
    'javascript:alert(1)',
    'not a URL',
  ])('drops unsafe legacy venue website %s', (website) => {
    expect(venueWebsiteFromWordPress(website)).toBeUndefined()
  })

  it('deduplicates repeated hubs without moving their first source-row position', () => {
    expect(
      venueConnectionsFromWordPress([
        { hub: hub(2493), type: 'd' },
        { hub: hub(2497), type: 'd' },
        { hub: hub(2493), type: 'b' },
        { hub: hub(2495), type: 'd' },
      ]),
    ).toEqual([
      {
        connectionType: 'b',
        hub: { $legacyRef: 'hub', legacyId: 2493 },
      },
      {
        connectionType: 'd',
        hub: { $legacyRef: 'hub', legacyId: 2497 },
      },
      {
        connectionType: 'd',
        hub: { $legacyRef: 'hub', legacyId: 2495 },
      },
    ])
  })

  it('emits only current bounded section fields for legacy full-article blocks', () => {
    const layout = mapArticleLayout(
      [
        {
          acf_fc_layout: 'paragraph',
          paragraph: { paragraph: '<p>Managed article copy.</p>' },
        },
      ],
      coverage(),
    )

    expect(layout).toMatchObject([
      {
        backgroundOpacity: 'none',
        blockType: 'contentSection',
        columnGap: 'regular',
        columns: [
          {
            backgroundOpacity: 'none',
            border: 'none',
            componentGap: 'regular',
            heightMode: 'fill',
            horizontalAlign: 'left',
            padding: 'none',
            radius: 'default',
            span: '12',
            surface: 'none',
            verticalAlign: 'start',
          },
        ],
        spacingBottom: 'tight',
        spacingTop: 'tight',
        surfacePadding: 'none',
        surfaceRadius: 'default',
        surfaceTone: 'white',
        width: 'reading',
        wrapperTheme: 'none',
      },
    ])
    expect(JSON.stringify(layout)).not.toMatch(/"(?:theme|spacing)":/u)
  })
})
