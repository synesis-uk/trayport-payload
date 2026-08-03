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

type CleanupCollection = 'articles' | 'hubs' | 'learning-videos' | 'pages' | 'venues'

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

  it('keeps the runtime registry exactly aligned with all 18 contract archetypes', () => {
    const contractIDs = contentArchitectureContract.archetypes.map(({ id }) => id).sort()
    const runtimeIDs = [...routeArchetypeIDs].sort()

    expect(routeArchetypeIDs).toHaveLength(18)
    expect(new Set(routeArchetypeIDs)).toHaveLength(18)
    expect(runtimeIDs).toEqual(contractIDs)
  })

  it('resolves every document archetype and route policy from its contract discriminator', () => {
    const documentArchetypes = contentArchitectureContract.archetypes.filter(
      ({ id }) => !id.startsWith('index.'),
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

  it('keeps incomplete conversion and interactive archetypes draft-only', async () => {
    for (const pageType of ['conversion', 'interactive'] as const) {
      const slug = fixtureKey(`${pageType}-draft-only`)
      const path = fixturePath(`${pageType}-draft-only`)
      const page = await payload.create({
        collection: 'pages',
        context: draftMutationContext,
        data: {
          layout: [hero(`${pageType} draft`)],
          pageType,
          path,
          slug,
          title: `${pageType} draft`,
        },
        draft: true,
        overrideAccess: true,
      })

      expect(page._status).toBe('draft')
      await expect(
        findRouteClaim({
          draft: true,
          path,
          payload,
        }),
      ).resolves.toMatchObject({
        state: 'reserved',
      })
      await expect(
        payload.update({
          collection: 'pages',
          context: publishMutationContext,
          data: {
            _status: 'published',
          },
          draft: false,
          id: page.id,
          overrideAccess: true,
        }),
      ).rejects.toThrow(/cannot publish until its required production block is implemented/i)
    }
  })

  it('requires managed content for full articles and public venue details', async () => {
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
    ).rejects.toThrow(/requires a managed description or layout/i)
    await expectNoDocument('venues', venueSlug)
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
      await payload.delete({ collection: 'media', id: image.id, overrideAccess: true })
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
