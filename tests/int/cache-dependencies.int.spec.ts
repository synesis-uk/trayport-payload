// @vitest-environment node

import { describe, expect, it } from 'vitest'

import {
  collectCacheDependencyTags,
  collectProjectionCacheDependencyTags,
} from '@/data/cacheDependencies'
import {
  CACHE_DEPENDENCY_TAG_BUDGET,
  CACHE_TAG_ITEM_LIMIT,
  cacheDependencyCollectionTag,
  cacheDependencyTag,
} from '@/data/cacheTags'

describe('populated cache dependency discovery', () => {
  it('finds nested media, taxonomy, office, and managed-content relationships', () => {
    const tags = collectCacheDependencyTags(
      {
        categories: [{ id: 31, parent: { id: 32 } }],
        heroMedia: { id: 41, poster: { id: 42 } },
        layout: [
          {
            blockType: 'contentSection',
            components: [
              { blockType: 'officeDetails', office: { id: 51 } },
              {
                link: {
                  reference: {
                    relationTo: 'pages',
                    value: { id: 61, path: '/managed-page/' },
                  },
                },
              },
              {
                assetClass: { id: 70 },
                assetClasses: [71],
                regions: [{ id: 72 }],
                venueTypes: [{ id: 73 }],
              },
            ],
          },
        ],
        policyPage: { id: 64 },
        relatedArticles: [{ categories: [{ id: 33 }], id: 62 }],
        relatedHubs: [{ id: 63 }],
      },
      'articles',
    )

    expect(new Set(tags)).toEqual(
      new Set([
        cacheDependencyTag('article-categories', 31),
        cacheDependencyTag('article-categories', 32),
        cacheDependencyTag('article-categories', 33),
        cacheDependencyTag('articles', 62),
        cacheDependencyTag('asset-classes', 70),
        cacheDependencyTag('asset-classes', 71),
        cacheDependencyTag('hubs', 63),
        cacheDependencyTag('media', 41),
        cacheDependencyTag('media', 42),
        cacheDependencyTag('offices', 51),
        cacheDependencyTag('pages', 61),
        cacheDependencyTag('pages', 64),
        cacheDependencyTag('regions', 72),
        cacheDependencyTag('venue-types', 73),
      ]),
    )
  })

  it('deduplicates references and never treats embedded row IDs as documents', () => {
    expect(
      collectCacheDependencyTags(
        {
          layout: [
            { id: 'row-id', media: { id: 8 } },
            { id: 'another-row', media: 8 },
          ],
        },
        'pages',
      ),
    ).toEqual([cacheDependencyTag('media', 8)])
  })

  it('tracks explicit People and the automatic team-list collection dependency', () => {
    expect(
      collectCacheDependencyTags(
        {
          layout: [
            {
              blockType: 'peopleList',
              people: [{ id: 2561 }, { id: 2563 }],
              selectionMode: 'team',
              team: 'careers',
            },
          ],
        },
        'pages',
      ),
    ).toEqual([
      cacheDependencyCollectionTag('people'),
      cacheDependencyTag('people', 2561),
      cacheDependencyTag('people', 2563),
    ])
  })

  it('uses exact dependency tags through the per-projection budget', () => {
    const tags = collectCacheDependencyTags(
      {
        media: Array.from({ length: CACHE_DEPENDENCY_TAG_BUDGET }, (_, index) => ({
          id: index + 1,
        })),
      },
      'pages',
    )

    expect(CACHE_TAG_ITEM_LIMIT).toBe(128)
    expect(CACHE_DEPENDENCY_TAG_BUDGET).toBe(127)
    expect(tags).toHaveLength(CACHE_DEPENDENCY_TAG_BUDGET)
    expect(tags).toContain(cacheDependencyTag('media', 1))
    expect(tags).toContain(cacheDependencyTag('media', CACHE_DEPENDENCY_TAG_BUDGET))
  })

  it('coarsens the complete dependency set by collection instead of truncating over budget', () => {
    const tags = collectCacheDependencyTags(
      {
        media: Array.from({ length: CACHE_DEPENDENCY_TAG_BUDGET + 1 }, (_, index) => ({
          id: index + 1,
        })),
        policyPage: { id: 900 },
      },
      'pages',
    )

    expect(tags).toEqual([
      cacheDependencyCollectionTag('media'),
      cacheDependencyCollectionTag('pages'),
    ])
    expect(tags).not.toContain(cacheDependencyTag('media', 1))
  })

  it('budgets the final multi-source dependency union after reserving two owner tags', () => {
    const hubs = {
      assetClasses: Array.from({ length: 70 }, (_, index) => ({ id: index + 1 })),
    }
    const venuesAtBoundary = {
      venueTypes: Array.from({ length: 56 }, (_, index) => ({ id: index + 1 })),
    }
    const venuesOverBoundary = {
      venueTypes: [...venuesAtBoundary.venueTypes, { id: 57 }],
    }
    const independentlyCollected = new Set([
      ...collectCacheDependencyTags(hubs, 'hubs'),
      ...collectCacheDependencyTags(venuesOverBoundary, 'venues'),
    ])

    const atBoundary = collectProjectionCacheDependencyTags(
      [
        { source: 'hubs', value: hubs },
        { source: 'venues', value: venuesAtBoundary },
      ],
      { reservedTagCount: 2 },
    )
    const overBoundary = collectProjectionCacheDependencyTags(
      [
        { source: 'hubs', value: hubs },
        { source: 'venues', value: venuesOverBoundary },
      ],
      { reservedTagCount: 2 },
    )

    expect(atBoundary).toHaveLength(CACHE_TAG_ITEM_LIMIT - 2)
    expect(atBoundary.length + 2).toBe(CACHE_TAG_ITEM_LIMIT)
    expect(independentlyCollected.size + 2).toBe(CACHE_TAG_ITEM_LIMIT + 1)
    expect(overBoundary).toEqual([
      cacheDependencyCollectionTag('asset-classes'),
      cacheDependencyCollectionTag('venue-types'),
    ])
    expect(overBoundary.length + 2).toBeLessThanOrEqual(CACHE_TAG_ITEM_LIMIT)
  })

  it('rejects primary-tag reservations that cannot fit their dependency collections', () => {
    expect(() =>
      collectProjectionCacheDependencyTags([{ source: 'pages', value: { media: [{ id: 1 }] } }], {
        reservedTagCount: CACHE_TAG_ITEM_LIMIT,
      }),
    ).toThrow(/too few slots/u)
  })
})
