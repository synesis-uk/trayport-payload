// @vitest-environment node

import { Articles } from '@/collections/Articles'
import { Hubs } from '@/collections/Hubs'
import { LearningVideos } from '@/collections/LearningVideos'
import { Pages } from '@/collections/Pages'
import { Venues } from '@/collections/Venues'
import config from '@/payload.config'
import {
  contentRouteCollections,
  resolveArchetype,
  routeArchetypeIDs,
  type ContentRouteCollection,
} from '@/routing/archetypes'
import { findRouteClaim } from '@/routing/registry'
import { getPayload, type CollectionConfig, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { contentArchitectureContract } from '../../migration/mappings/contentArchitecture'

type CleanupCollection =
  'articles' | 'asset-classes' | 'hubs' | 'learning-videos' | 'pages' | 'venues'

type FieldLike = {
  fields?: unknown[]
  name?: string
  options?: Array<string | { value?: string }>
  tabs?: Array<{ fields?: unknown[] }>
}

type IdentifiedDocument = {
  id: number | string
}

let payload: Payload

const suiteID = `archetype-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const mutationContext = {
  disableRevalidate: true,
}
const draftMutationContext = {
  ...mutationContext,
  routeOperation: 'draft',
}
const publishMutationContext = {
  ...mutationContext,
  routeOperation: 'publish',
}

const fixtureKey = (name: string): string => `${suiteID}-${name}`
const fixturePath = (name: string): string => `/integration/${fixtureKey(name)}/`

const hero = (heading: string) => ({
  appearance: 'dark' as const,
  blockType: 'trayportHero' as const,
  heading,
})

const articleListing = (heading: string) => ({
  blockType: 'articleListing' as const,
  family: 'insights' as const,
  heading,
  pageSize: 12,
  showCategoryFilter: true,
})

const marketMatrixSection = () => ({
  backgroundOpacity: 'none' as const,
  blockType: 'contentSection' as const,
  columns: [
    {
      components: [
        {
          blockType: 'marketMatrix' as const,
          caption: 'Managed market connectivity',
          defaultView: 'joule' as const,
          showDownload: true,
          showFilters: true,
        },
      ],
      span: '12' as const,
    },
  ],
  width: 'wide' as const,
  wrapperTheme: 'none' as const,
})

const dataChartSection = (
  assetClass: number,
  range: {
    chartType?: 'column' | 'line' | 'stackedColumn'
    dataType?: 'price' | 'volume'
    displayInterval?: 'month' | 'quarter' | 'year'
    excludedHubs?: number[]
    fromQuarter?: number
    fromYear?: number
    includedHubs?: number[]
    seriesDimension?: 'executionType' | 'hub'
    toQuarter?: number
    toYear?: number
  } = {},
) => ({
  backgroundOpacity: 'none' as const,
  blockType: 'contentSection' as const,
  columns: [
    {
      components: [
        {
          assetClass,
          blockType: 'dataChart' as const,
          chartType: 'stackedColumn' as const,
          dataType: 'volume' as const,
          displayInterval: 'quarter' as const,
          excludedHubs: [],
          includedHubs: [],
          seriesDimension: 'executionType' as const,
          showDataTable: true,
          title: 'Managed market volume',
          ...range,
        },
      ],
      span: '12' as const,
    },
  ],
  width: 'wide' as const,
  wrapperTheme: 'none' as const,
})

const nestedFields = (field: FieldLike): unknown[] => [
  ...(field.fields || []),
  ...(field.tabs || []).flatMap((tab) => tab.fields || []),
]

const findField = (fields: unknown[], name: string): FieldLike | null => {
  for (const candidate of fields) {
    if (!candidate || typeof candidate !== 'object') continue
    const field = candidate as FieldLike
    if (field.name === name) return field
    const nested = findField(nestedFields(field), name)
    if (nested) return nested
  }
  return null
}

const optionValues = (field: FieldLike | null): string[] =>
  (field?.options || [])
    .map((option) => (typeof option === 'string' ? option : option.value))
    .filter((value): value is string => Boolean(value))
    .sort()

const cleanSuiteFixtures = async (): Promise<void> => {
  if (!payload) return

  const cleanupErrors: unknown[] = []
  const attempt = async (operation: () => Promise<unknown>): Promise<void> => {
    try {
      await operation()
    } catch (error) {
      cleanupErrors.push(error)
    }
  }
  const collections: CleanupCollection[] = [
    'articles',
    'hubs',
    'learning-videos',
    'pages',
    'venues',
    'asset-classes',
  ]

  for (const collection of collections) {
    const result = (await payload.find({
      collection,
      depth: 0,
      limit: 100,
      overrideAccess: true,
      pagination: false,
      where: {
        slug: {
          contains: suiteID,
        },
      },
    } as never)) as unknown as { docs: IdentifiedDocument[] }

    for (const document of result.docs) {
      await attempt(() =>
        payload.delete({
          collection,
          context: mutationContext,
          id: document.id,
          overrideAccess: true,
        } as never),
      )
    }
  }

  const residualClaims = await payload.find({
    collection: 'route-registry',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: {
      path: {
        contains: suiteID,
      },
    },
  })
  for (const claim of residualClaims.docs) {
    await attempt(() =>
      payload.delete({
        collection: 'route-registry',
        context: {
          routeRegistryInternal: true,
        },
        id: claim.id,
        overrideAccess: true,
      }),
    )
  }

  if (cleanupErrors.length) {
    throw new AggregateError(cleanupErrors, 'Failed to clean archetype integration fixtures')
  }
}

const expectNoDocument = async (collection: CleanupCollection, slug: string): Promise<void> => {
  const result = (await payload.find({
    collection,
    depth: 0,
    limit: 10,
    overrideAccess: true,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  } as never)) as unknown as { docs: IdentifiedDocument[] }

  expect(result.docs).toHaveLength(0)
}

describe.sequential('route archetype invariants', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })
  }, 60_000)

  afterAll(cleanSuiteFixtures, 60_000)

  it('keeps the content-route runtime registry aligned with its 18 contract archetypes', () => {
    const contractIDs = contentArchitectureContract.archetypes
      .filter(({ collection }) =>
        contentRouteCollections.includes(collection as ContentRouteCollection),
      )
      .map(({ id }) => id)
      .sort()
    const runtimeIDs = [...routeArchetypeIDs].sort()

    expect(routeArchetypeIDs).toHaveLength(18)
    expect(new Set(routeArchetypeIDs)).toHaveLength(18)
    expect(runtimeIDs).toEqual(contractIDs)
  })

  it('resolves every document archetype and route policy from its contract discriminator', () => {
    const documentArchetypes = contentArchitectureContract.archetypes.filter(
      ({ collection, id }) =>
        !id.startsWith('index.') &&
        contentRouteCollections.includes(collection as ContentRouteCollection),
    )

    for (const expected of documentArchetypes) {
      expect(contentRouteCollections).toContain(expected.collection)
      const document = expected.discriminator
        ? {
            [expected.discriminator.field]: expected.discriminator.value,
          }
        : {}

      expect(
        resolveArchetype(expected.collection as ContentRouteCollection, document),
        expected.id,
      ).toEqual({
        archetype: expected.id,
        policy: expected.routePolicy,
      })
    }
  })

  it('keeps Payload discriminator options equal to the contract values', () => {
    const collections: Record<ContentRouteCollection, CollectionConfig> = {
      articles: Articles,
      hubs: Hubs,
      'learning-videos': LearningVideos,
      pages: Pages,
      venues: Venues,
    }

    for (const collection of contentRouteCollections) {
      const discriminators = contentArchitectureContract.archetypes
        .filter(
          (archetype) =>
            archetype.collection === collection &&
            archetype.discriminator &&
            !archetype.id.startsWith('index.'),
        )
        .flatMap(({ discriminator }) => (discriminator ? [discriminator] : []))

      if (!discriminators.length) continue
      const fieldName = discriminators[0]?.field
      expect(fieldName, collection).toBeTruthy()
      expect(
        new Set(discriminators.map(({ field }) => field)),
        `${collection} discriminator fields`,
      ).toHaveLength(1)

      const configured = findField(collections[collection].fields, fieldName as string)
      expect(configured, `${collection}.${fieldName}`).not.toBeNull()
      expect(optionValues(configured)).toEqual(discriminators.map(({ value }) => value).sort())
    }
  })

  it('rejects unknown discriminators and invalid root-route ownership atomically', async () => {
    const unknownSlug = fixtureKey('unknown-page-type')
    await expect(
      payload.create({
        collection: 'pages',
        context: draftMutationContext,
        data: {
          layout: [hero('Unknown page type')],
          pageType: 'unknown' as never,
          path: fixturePath('unknown-page-type'),
          slug: unknownSlug,
          title: 'Unknown page type',
        },
        draft: true,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/Unknown page archetype|pageType/i)
    await expectNoDocument('pages', unknownSlug)

    const standardRootSlug = fixtureKey('standard-root')
    await expect(
      payload.create({
        collection: 'pages',
        context: draftMutationContext,
        data: {
          layout: [hero('Standard root')],
          pageType: 'standard',
          path: '/',
          slug: standardRootSlug,
          title: 'Standard root',
        },
        draft: true,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/Only the homepage/i)
    await expectNoDocument('pages', standardRootSlug)

    const homepageNestedSlug = fixtureKey('homepage-nested')
    await expect(
      payload.create({
        collection: 'pages',
        context: draftMutationContext,
        data: {
          layout: [hero('Nested homepage')],
          pageType: 'homepage',
          path: fixturePath('homepage-nested'),
          slug: homepageNestedSlug,
          title: 'Nested homepage',
        },
        draft: true,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/homepage must own the root/i)
    await expectNoDocument('pages', homepageNestedSlug)
  })

  it('requires a path before a route-owning document can publish', async () => {
    const slug = fixtureKey('published-without-path')
    await expect(
      payload.create({
        collection: 'pages',
        context: publishMutationContext,
        data: {
          _status: 'published',
          layout: [hero('No public path')],
          pageType: 'standard',
          slug,
          title: 'No public path',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/requires a public path/i)
    await expectNoDocument('pages', slug)
  })

  it('forbids paths and layouts on metadata-only and relationship-only records', async () => {
    const cases = [
      {
        collection: 'articles' as const,
        data: {
          articleType: 'insight',
          contentMode: 'listing',
        },
        label: 'listing-article',
        message: /article\.listing-metadata/i,
      },
      {
        collection: 'hubs' as const,
        data: {
          contentMode: 'map-only',
        },
        label: 'map-only-hub',
        message: /hub\.map-only/i,
      },
      {
        collection: 'venues' as const,
        data: {
          contentMode: 'relationship-only',
        },
        label: 'relationship-venue',
        message: /venue\.structured-record/i,
      },
    ]

    for (const fixture of cases) {
      const pathSlug = fixtureKey(`${fixture.label}-path`)
      await expect(
        payload.create({
          collection: fixture.collection,
          context: draftMutationContext,
          data: {
            ...fixture.data,
            path: fixturePath(`${fixture.label}-path`),
            slug: pathSlug,
            title: `${fixture.label} with path`,
          },
          draft: true,
          overrideAccess: true,
        } as never),
      ).rejects.toThrow(fixture.message)
      await expectNoDocument(fixture.collection, pathSlug)

      const layoutSlug = fixtureKey(`${fixture.label}-layout`)
      await expect(
        payload.create({
          collection: fixture.collection,
          context: draftMutationContext,
          data: {
            ...fixture.data,
            layout: [hero(`${fixture.label} layout`)],
            slug: layoutSlug,
            title: `${fixture.label} with layout`,
          },
          draft: true,
          overrideAccess: true,
        } as never),
      ).rejects.toThrow(fixture.message)
      await expectNoDocument(fixture.collection, layoutSlug)
    }
  })

  it('publishes valid non-routable records without creating route claims', async () => {
    const article = await payload.create({
      collection: 'articles',
      context: publishMutationContext,
      data: {
        _status: 'published',
        articleType: 'insight',
        contentMode: 'listing',
        slug: fixtureKey('valid-listing-article'),
        title: 'Valid listing article',
      },
      draft: false,
      overrideAccess: true,
    })
    const hub = await payload.create({
      collection: 'hubs',
      context: publishMutationContext,
      data: {
        _status: 'published',
        contentMode: 'map-only',
        slug: fixtureKey('valid-map-only-hub'),
        title: 'Valid map-only hub',
      },
      draft: false,
      overrideAccess: true,
    })
    const venue = await payload.create({
      collection: 'venues',
      context: publishMutationContext,
      data: {
        _status: 'published',
        contentMode: 'relationship-only',
        slug: fixtureKey('valid-relationship-venue'),
        title: 'Valid relationship-only venue',
      },
      draft: false,
      overrideAccess: true,
    })

    for (const [collection, document] of [
      ['articles', article],
      ['hubs', hub],
      ['venues', venue],
    ] as const) {
      const claims = await payload.find({
        collection: 'route-registry',
        depth: 0,
        limit: 10,
        overrideAccess: true,
        pagination: false,
        where: {
          and: [
            {
              ownerCollection: {
                equals: collection,
              },
            },
            {
              ownerDocumentId: {
                equals: String(document.id),
              },
            },
          ],
        },
      })
      expect(claims.docs, collection).toHaveLength(0)
    }
  })

  it('enforces top-level block allowlists and the content-index listing invariant', async () => {
    const standardSlug = fixtureKey('standard-with-listing')
    await expect(
      payload.create({
        collection: 'pages',
        context: draftMutationContext,
        data: {
          layout: [articleListing('Disallowed listing')],
          pageType: 'standard',
          path: fixturePath('standard-with-listing'),
          slug: standardSlug,
          title: 'Standard with listing',
        },
        draft: true,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/does not allow.*articleListing/i)
    await expectNoDocument('pages', standardSlug)

    const missingListingSlug = fixtureKey('index-without-listing')
    await expect(
      payload.create({
        collection: 'pages',
        context: publishMutationContext,
        data: {
          _status: 'published',
          layout: [hero('Index without listing')],
          pageType: 'index',
          path: fixturePath('index-without-listing'),
          slug: missingListingSlug,
          title: 'Index without listing',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/require exactly one article or learning-video listing/i)
    await expectNoDocument('pages', missingListingSlug)

    const validListingPath = fixturePath('valid-index')
    const valid = await payload.create({
      collection: 'pages',
      context: publishMutationContext,
      data: {
        _status: 'published',
        layout: [hero('Valid index'), articleListing('Latest insights')],
        pageType: 'index',
        path: validListingPath,
        slug: fixtureKey('valid-index'),
        title: 'Valid content index',
      },
      draft: false,
      overrideAccess: true,
    })
    expect(valid._status).toBe('published')
    await expect(
      findRouteClaim({
        draft: false,
        path: validListingPath,
        payload,
      }),
    ).resolves.toMatchObject({
      archetype: 'page.content-index',
      ownerDocumentId: String(valid.id),
      state: 'published',
    })
  })

  it('keeps conversion pages draft-only until a first-party form exists', async () => {
    const slug = fixtureKey('conversion-draft-only')
    const path = fixturePath('conversion-draft-only')
    const page = await payload.create({
      collection: 'pages',
      context: draftMutationContext,
      data: {
        layout: [hero('Conversion draft')],
        pageType: 'conversion',
        path,
        slug,
        title: 'Conversion draft',
      },
      draft: true,
      overrideAccess: true,
    })

    expect(page._status).toBe('draft')
    await expect(
      payload.update({
        collection: 'pages',
        context: publishMutationContext,
        data: { _status: 'published' },
        draft: false,
        id: page.id,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/required first-party form/i)
  })

  it('requires exactly one managed matrix on interactive pages and forbids it elsewhere', async () => {
    const missingSlug = fixtureKey('interactive-missing-matrix')
    await expect(
      payload.create({
        collection: 'pages',
        context: publishMutationContext,
        data: {
          _status: 'published',
          layout: [hero('Missing matrix')],
          pageType: 'interactive',
          path: fixturePath('interactive-missing-matrix'),
          slug: missingSlug,
          title: 'Missing matrix',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/require exactly one marketMatrix/i)
    await expectNoDocument('pages', missingSlug)

    const standardSlug = fixtureKey('standard-with-matrix')
    await expect(
      payload.create({
        collection: 'pages',
        context: draftMutationContext,
        data: {
          layout: [marketMatrixSection()],
          pageType: 'standard',
          path: fixturePath('standard-with-matrix'),
          slug: standardSlug,
          title: 'Standard with matrix',
        },
        draft: true,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/does not allow the marketMatrix/i)
    await expectNoDocument('pages', standardSlug)

    const duplicateSlug = fixtureKey('interactive-duplicate-matrix')
    await expect(
      payload.create({
        collection: 'pages',
        context: publishMutationContext,
        data: {
          _status: 'published',
          layout: [marketMatrixSection(), marketMatrixSection()],
          pageType: 'interactive',
          path: fixturePath('interactive-duplicate-matrix'),
          slug: duplicateSlug,
          title: 'Duplicate matrix',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/require exactly one marketMatrix/i)
    await expectNoDocument('pages', duplicateSlug)

    const path = fixturePath('valid-interactive-matrix')
    const valid = await payload.create({
      collection: 'pages',
      context: publishMutationContext,
      data: {
        _status: 'published',
        layout: [marketMatrixSection()],
        pageType: 'interactive',
        path,
        slug: fixtureKey('valid-interactive-matrix'),
        title: 'Valid market matrix',
      },
      draft: false,
      overrideAccess: true,
    })

    expect(valid._status).toBe('published')
    await expect(findRouteClaim({ draft: false, path, payload })).resolves.toMatchObject({
      archetype: 'page.interactive-market-matrix',
      ownerDocumentId: String(valid.id),
      state: 'published',
    })
  })

  it('allows at most one first-position hero on published routes', async () => {
    const misplacedSlug = fixtureKey('misplaced-route-hero')
    await expect(
      payload.create({
        collection: 'pages',
        context: publishMutationContext,
        data: {
          _status: 'published',
          layout: [articleListing('Latest insights'), hero('Misplaced hero')],
          pageType: 'index',
          path: fixturePath('misplaced-route-hero'),
          slug: misplacedSlug,
          title: 'Misplaced route hero',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/hero must be the first content block/i)
    await expectNoDocument('pages', misplacedSlug)

    const repeatedSlug = fixtureKey('repeated-route-hero')
    await expect(
      payload.create({
        collection: 'pages',
        context: publishMutationContext,
        data: {
          _status: 'published',
          layout: [hero('First hero'), hero('Repeated hero'), articleListing('Latest insights')],
          pageType: 'index',
          path: fixturePath('repeated-route-hero'),
          slug: repeatedSlug,
          title: 'Repeated route hero',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/at most one trayportHero/i)
    await expectNoDocument('pages', repeatedSlug)
  })

  it('requires data-backed asset classes and coherent chart quarter ranges to publish', async () => {
    const backedLegacyID = 1_500_000_000 + (Date.now() % 500_000_000)
    const unbackedAssetClass = await payload.create({
      collection: 'asset-classes',
      context: mutationContext,
      data: {
        displayOrder: 1,
        slug: fixtureKey('unbacked-chart-asset'),
        title: 'Unbacked chart asset',
      },
      overrideAccess: true,
    })
    const backedAssetClass = await payload.create({
      collection: 'asset-classes',
      context: mutationContext,
      data: {
        displayOrder: 2,
        legacySource: { legacyId: backedLegacyID, source: 'wordpress' },
        slug: fixtureKey('backed-chart-asset'),
        title: 'Backed chart asset',
      },
      overrideAccess: true,
    })
    const chartHub = await payload.create({
      collection: 'hubs',
      context: publishMutationContext,
      data: {
        _status: 'published',
        contentMode: 'map-only',
        legacySource: { legacyId: backedLegacyID + 1, source: 'wordpress' },
        slug: fixtureKey('chart-hub'),
        title: 'Chart hub',
      },
      draft: false,
      overrideAccess: true,
    })

    const expectSemanticRejection = async (
      name: string,
      overrides: Parameters<typeof dataChartSection>[1],
      message: RegExp,
    ) => {
      const slug = fixtureKey(name)
      await expect(
        payload.create({
          collection: 'pages',
          context: publishMutationContext,
          data: {
            _status: 'published',
            layout: [dataChartSection(backedAssetClass.id, overrides)],
            pageType: 'standard',
            path: fixturePath(name),
            slug,
            title: name,
          },
          draft: false,
          overrideAccess: true,
        }),
      ).rejects.toThrow(message)
      await expectNoDocument('pages', slug)
    }

    const unbackedSlug = fixtureKey('unbacked-data-chart')
    await expect(
      payload.create({
        collection: 'pages',
        context: publishMutationContext,
        data: {
          _status: 'published',
          layout: [dataChartSection(unbackedAssetClass.id)],
          pageType: 'standard',
          path: fixturePath('unbacked-data-chart'),
          slug: unbackedSlug,
          title: 'Unbacked data chart',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/imported asset class with an application-data key/i)
    await expectNoDocument('pages', unbackedSlug)

    const partialSlug = fixtureKey('partial-data-chart-range')
    await expect(
      payload.create({
        collection: 'pages',
        context: publishMutationContext,
        data: {
          _status: 'published',
          layout: [dataChartSection(backedAssetClass.id, { fromYear: 2024 })],
          pageType: 'standard',
          path: fixturePath('partial-data-chart-range'),
          slug: partialSlug,
          title: 'Partial data chart range',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/both a from year and from quarter/i)
    await expectNoDocument('pages', partialSlug)

    const reversedSlug = fixtureKey('reversed-data-chart-range')
    await expect(
      payload.create({
        collection: 'pages',
        context: publishMutationContext,
        data: {
          _status: 'published',
          layout: [
            dataChartSection(backedAssetClass.id, {
              fromQuarter: 4,
              fromYear: 2025,
              toQuarter: 1,
              toYear: 2024,
            }),
          ],
          pageType: 'standard',
          path: fixturePath('reversed-data-chart-range'),
          slug: reversedSlug,
          title: 'Reversed data chart range',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/start quarter must not be after its end quarter/i)
    await expectNoDocument('pages', reversedSlug)

    await expectSemanticRejection(
      'filtered-execution-chart',
      { includedHubs: [chartHub.id] },
      /execution-type data charts cannot filter hubs/i,
    )
    await expectSemanticRejection(
      'invalid-hub-chart-pair',
      { seriesDimension: 'hub' },
      /hub data charts require volume columns or a price line/i,
    )
    await expectSemanticRejection(
      'overlapping-hub-filters',
      {
        chartType: 'line',
        dataType: 'price',
        excludedHubs: [chartHub.id],
        includedHubs: [chartHub.id],
        seriesDimension: 'hub',
      },
      /cannot include and exclude the same hub/i,
    )

    await expect(
      payload.create({
        collection: 'pages',
        context: publishMutationContext,
        data: {
          _status: 'published',
          layout: [
            dataChartSection(backedAssetClass.id, {
              fromQuarter: 1,
              fromYear: 2024,
              toQuarter: 4,
              toYear: 2025,
            }),
          ],
          pageType: 'standard',
          path: fixturePath('valid-data-chart-range'),
          slug: fixtureKey('valid-data-chart-range'),
          title: 'Valid data chart range',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).resolves.toMatchObject({ _status: 'published' })

    await expect(
      payload.create({
        collection: 'pages',
        context: publishMutationContext,
        data: {
          _status: 'published',
          layout: [
            dataChartSection(backedAssetClass.id, {
              chartType: 'line',
              dataType: 'price',
              displayInterval: 'month',
              includedHubs: [chartHub.id],
              seriesDimension: 'hub',
            }),
          ],
          pageType: 'standard',
          path: fixturePath('valid-hub-data-chart'),
          slug: fixtureKey('valid-hub-data-chart'),
          title: 'Valid hub data chart',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).resolves.toMatchObject({ _status: 'published' })
  })

  it('requires managed or structured content for full articles and public venue details', async () => {
    const articleSlug = fixtureKey('empty-full-article')
    await expect(
      payload.create({
        collection: 'articles',
        context: publishMutationContext,
        data: {
          _status: 'published',
          articleType: 'insight',
          contentMode: 'full',
          path: fixturePath('empty-full-article'),
          slug: articleSlug,
          title: 'Empty full article',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/requires at least one content block/i)
    await expectNoDocument('articles', articleSlug)

    const venueSlug = fixtureKey('empty-public-venue')
    await expect(
      payload.create({
        collection: 'venues',
        context: publishMutationContext,
        data: {
          _status: 'published',
          contentMode: 'page',
          path: fixturePath('empty-public-venue'),
          slug: venueSlug,
          title: 'Empty public venue',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/requires a managed description, layout, or market connections/i)
    await expectNoDocument('venues', venueSlug)

    const hub = await payload.create({
      collection: 'hubs',
      context: publishMutationContext,
      data: {
        _status: 'published',
        contentMode: 'map-only',
        marketDataKey: fixtureKey('structured-venue-hub'),
        slug: fixtureKey('structured-venue-hub'),
        title: 'Structured venue market',
      },
      draft: false,
      overrideAccess: true,
    })
    const structuredVenueSlug = fixtureKey('structured-public-venue')
    await expect(
      payload.create({
        collection: 'venues',
        context: publishMutationContext,
        data: {
          _status: 'published',
          contentMode: 'page',
          marketConnections: [{ connectionType: 'd', hub: hub.id }],
          path: fixturePath('structured-public-venue'),
          slug: structuredVenueSlug,
          title: 'Structured public venue',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).resolves.toMatchObject({
      contentMode: 'page',
      description: null,
      marketConnections: [expect.objectContaining({ connectionType: 'd' })],
    })
  })

  it('publishes protected gate pages without media and valid public media', async () => {
    const missingVideoSlug = fixtureKey('missing-video')
    await expect(
      payload.create({
        collection: 'learning-videos',
        context: publishMutationContext,
        data: {
          _status: 'published',
          accessMode: 'public',
          contentMode: 'full',
          displayOrder: 0,
          path: fixturePath('missing-video'),
          slug: missingVideoSlug,
          title: 'Missing video',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/requires managed media or an external video URL/i)
    await expectNoDocument('learning-videos', missingVideoSlug)

    const image = await payload.create({
      collection: 'media',
      context: mutationContext,
      data: {
        alt: '',
        decorative: true,
        title: `${suiteID} non-video media`,
      },
      filePath: 'src/endpoints/seed/image-post1.webp',
      overrideAccess: true,
    })
    const imageVideoSlug = fixtureKey('image-as-video')
    try {
      await expect(
        payload.create({
          collection: 'learning-videos',
          context: publishMutationContext,
          data: {
            _status: 'published',
            accessMode: 'public',
            contentMode: 'full',
            displayOrder: 0,
            path: fixturePath('image-as-video'),
            slug: imageVideoSlug,
            title: 'Image supplied as video',
            video: image.id,
          },
          draft: false,
          overrideAccess: true,
        }),
      ).rejects.toThrow(/must use a video MIME type/i)
      await expectNoDocument('learning-videos', imageVideoSlug)
    } finally {
      await payload.delete({
        collection: 'media',
        context: mutationContext,
        id: image.id,
        overrideAccess: true,
      })
    }

    const invalidExternalSlug = fixtureKey('invalid-external-video')
    await expect(
      payload.create({
        collection: 'learning-videos',
        context: publishMutationContext,
        data: {
          _status: 'published',
          accessMode: 'public',
          contentMode: 'full',
          displayOrder: 0,
          externalVideoURL: 'https://',
          path: fixturePath('invalid-external-video'),
          slug: invalidExternalSlug,
          title: 'Invalid external video',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/complete HTTPS URL/i)
    await expectNoDocument('learning-videos', invalidExternalSlug)

    const protectedMediaSlug = fixtureKey('protected-media')
    await expect(
      payload.create({
        collection: 'learning-videos',
        context: draftMutationContext,
        data: {
          accessMode: 'subscriber',
          contentMode: 'full',
          displayOrder: 0,
          externalVideoURL: 'https://video.example.test/watch/restricted-video',
          path: fixturePath('protected-media'),
          slug: protectedMediaSlug,
          title: 'Protected media leak',
        },
        draft: true,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/must not expose managed media, an external video URL, or supporting layout/i)
    await expectNoDocument('learning-videos', protectedMediaSlug)

    const protectedLayoutSlug = fixtureKey('protected-layout')
    await expect(
      payload.create({
        collection: 'learning-videos',
        context: draftMutationContext,
        data: {
          accessMode: 'subscriber',
          contentMode: 'full',
          displayOrder: 0,
          layout: [hero('Protected supporting layout')],
          path: fixturePath('protected-layout'),
          slug: protectedLayoutSlug,
          title: 'Protected layout leak',
        },
        draft: true,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/must not expose managed media, an external video URL, or supporting layout/i)
    await expectNoDocument('learning-videos', protectedLayoutSlug)

    const protectedListingSlug = fixtureKey('protected-listing-media')
    await expect(
      payload.create({
        collection: 'learning-videos',
        context: publishMutationContext,
        data: {
          _status: 'published',
          accessMode: 'subscriber',
          contentMode: 'listing',
          displayOrder: 0,
          externalDestination: 'https://www.trayport.com/learning-hub/watch/restricted/',
          externalVideoURL: 'https://video.example.test/watch/restricted-video',
          slug: protectedListingSlug,
          title: 'Protected listing media leak',
        },
        draft: false,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/listing-only learning videos must not store managed media/i)
    await expectNoDocument('learning-videos', protectedListingSlug)

    const staleProtected = await payload.create({
      collection: 'learning-videos',
      context: { disableRevalidate: true, skipRouteRegistry: true },
      data: {
        _status: 'published',
        accessMode: 'subscriber',
        contentMode: 'full',
        displayOrder: 0,
        externalVideoURL: 'https://video.example.test/watch/stale-protected-video',
        layout: [hero('Stale protected supporting layout')],
        path: fixturePath('stale-protected-video'),
        slug: fixtureKey('stale-protected-video'),
        title: 'Stale protected video',
      },
      draft: false,
      overrideAccess: true,
    })
    try {
      const publicProtected = await payload.findByID({
        collection: 'learning-videos',
        depth: 0,
        id: staleProtected.id,
        overrideAccess: false,
      })
      expect(publicProtected.externalVideoURL).toBeUndefined()
      expect(publicProtected.video).toBeUndefined()
      expect(publicProtected.layout).toEqual([])
    } finally {
      await payload.delete({
        collection: 'learning-videos',
        context: { disableRevalidate: true, skipRouteRegistry: true },
        id: staleProtected.id,
        overrideAccess: true,
      })
    }

    const restrictedPath = fixturePath('restricted-video')
    const restricted = await payload.create({
      collection: 'learning-videos',
      context: draftMutationContext,
      data: {
        accessMode: 'subscriber',
        contentMode: 'full',
        displayOrder: 0,
        path: restrictedPath,
        slug: fixtureKey('restricted-video'),
        title: 'Restricted learning video',
      },
      draft: true,
      overrideAccess: true,
    })

    expect(restricted._status).toBe('draft')
    await expect(
      findRouteClaim({ draft: false, path: restrictedPath, payload }),
    ).resolves.toBeNull()
    await expect(
      findRouteClaim({ draft: true, path: restrictedPath, payload }),
    ).resolves.toMatchObject({
      ownerCollection: 'learning-videos',
      ownerDocumentId: String(restricted.id),
      state: 'reserved',
    })
    const protectedGate = await payload.update({
      collection: 'learning-videos',
      context: publishMutationContext,
      data: {
        _status: 'published',
      },
      draft: false,
      id: restricted.id,
      overrideAccess: true,
    })
    expect(protectedGate._status).toBe('published')
    await expect(
      findRouteClaim({ draft: false, path: restrictedPath, payload }),
    ).resolves.toMatchObject({
      archetype: 'learning-video.public-detail',
      ownerCollection: 'learning-videos',
      ownerDocumentId: String(restricted.id),
      state: 'published',
    })

    const validPath = fixturePath('external-video')
    const valid = await payload.create({
      collection: 'learning-videos',
      context: publishMutationContext,
      data: {
        _status: 'published',
        accessMode: 'public',
        contentMode: 'full',
        displayOrder: 0,
        externalVideoURL: 'https://video.example.test/watch/external-video',
        path: validPath,
        slug: fixtureKey('external-video'),
        title: 'External learning video',
      },
      draft: false,
      overrideAccess: true,
    })

    expect(valid._status).toBe('published')
    await expect(
      findRouteClaim({
        draft: false,
        path: validPath,
        payload,
      }),
    ).resolves.toMatchObject({
      archetype: 'learning-video.public-detail',
      ownerCollection: 'learning-videos',
      ownerDocumentId: String(valid.id),
      state: 'published',
    })
  })
})
