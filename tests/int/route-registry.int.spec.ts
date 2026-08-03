// @vitest-environment node

import { getContentSitemap } from '@/app/(frontend)/(sitemaps)/content-sitemap.xml/route'
import config from '@/payload.config'
import { ensureSystemRouteClaims, findRouteClaim, systemRouteDefinitions } from '@/routing/registry'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

type CleanupCollection = 'articles' | 'hubs' | 'learning-videos' | 'pages' | 'venues'

type IdentifiedDocument = {
  id: number | string
}

let payload: Payload
let admin: Awaited<ReturnType<Payload['create']>>
let editor: Awaited<ReturnType<Payload['create']>>

const suiteID = `route-registry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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

const createDraftPage = async (name: string, path = fixturePath(name)) =>
  payload.create({
    collection: 'pages',
    context: draftMutationContext,
    data: {
      layout: [hero(`Draft ${name}`)],
      pageType: 'standard',
      path,
      slug: fixtureKey(name),
      title: `Draft ${fixtureKey(name)}`,
    },
    draft: true,
    overrideAccess: true,
  })

const createPublishedPage = async (name: string, path = fixturePath(name)) =>
  payload.create({
    collection: 'pages',
    context: publishMutationContext,
    data: {
      _status: 'published',
      layout: [hero(`Published ${name}`)],
      pageType: 'standard',
      path,
      slug: fixtureKey(name),
      title: `Published ${fixtureKey(name)}`,
    },
    draft: false,
    overrideAccess: true,
  })

const findDocumentsBySlug = async (
  collection: CleanupCollection,
  slug: string,
): Promise<IdentifiedDocument[]> => {
  const result = (await payload.find({
    collection,
    depth: 0,
    limit: 20,
    overrideAccess: true,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  } as never)) as unknown as { docs: IdentifiedDocument[] }

  return result.docs
}

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

  const contentCollections: CleanupCollection[] = [
    'articles',
    'hubs',
    'learning-videos',
    'pages',
    'venues',
  ]

  for (const collection of contentCollections) {
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

  const redirects = await payload.find({
    collection: 'redirects',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: {
      from: {
        contains: suiteID,
      },
    },
  })
  for (const redirect of redirects.docs) {
    await attempt(() =>
      payload.delete({
        collection: 'redirects',
        context: mutationContext,
        id: redirect.id,
        overrideAccess: true,
      }),
    )
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

  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 20,
    overrideAccess: true,
    pagination: false,
    where: {
      email: {
        contains: suiteID,
      },
    },
  })
  for (const user of users.docs) {
    await attempt(() =>
      payload.delete({
        collection: 'users',
        id: user.id,
        overrideAccess: true,
      }),
    )
  }

  if (cleanupErrors.length) {
    throw new AggregateError(cleanupErrors, 'Failed to clean route-registry integration fixtures')
  }
}

describe.sequential('route registry integration', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })

    admin = await payload.create({
      collection: 'users',
      data: {
        email: `${suiteID}-admin@example.test`,
        password: 'route-registry-test',
        roles: ['admin'],
      },
      overrideAccess: true,
    })
    editor = await payload.create({
      collection: 'users',
      data: {
        email: `${suiteID}-editor@example.test`,
        password: 'route-registry-test',
        roles: ['editor'],
      },
      overrideAccess: true,
    })
  }, 60_000)

  afterAll(cleanSuiteFixtures, 60_000)

  it('normalizes a draft path and reserves its canonical form', async () => {
    const name = 'normalization'
    const rawPath = `  /integration//${fixtureKey(name)}?campaign=test#fragment  `
    const expectedPath = fixturePath(name)
    const page = await createDraftPage(name, rawPath)

    expect(page.path).toBe(expectedPath)
    await expect(
      findRouteClaim({
        draft: false,
        path: rawPath,
        payload,
      }),
    ).resolves.toBeNull()
    await expect(
      findRouteClaim({
        draft: true,
        path: rawPath,
        payload,
      }),
    ).resolves.toMatchObject({
      archetype: 'page.standard',
      ownerCollection: 'pages',
      ownerDocumentId: String(page.id),
      ownerKind: 'content',
      path: expectedPath,
      state: 'reserved',
    })
  })

  it('rolls back a cross-collection document when its path is already reserved', async () => {
    const name = 'cross-collection'
    const path = fixturePath(name)
    const articleSlug = fixtureKey(`${name}-article`)
    const page = await createDraftPage(name, path)

    await expect(
      payload.create({
        collection: 'articles',
        context: draftMutationContext,
        data: {
          articleType: 'insight',
          contentMode: 'full',
          layout: [hero('Conflicting article')],
          path,
          slug: articleSlug,
          title: `Conflicting ${articleSlug}`,
        },
        draft: true,
        overrideAccess: true,
      }),
    ).rejects.toMatchObject({
      status: 409,
    })

    expect(await findDocumentsBySlug('articles', articleSlug)).toHaveLength(0)
    await expect(
      findRouteClaim({
        draft: true,
        path,
        payload,
      }),
    ).resolves.toMatchObject({
      ownerCollection: 'pages',
      ownerDocumentId: String(page.id),
      state: 'reserved',
    })
  })

  it('atomically resolves a concurrent cross-collection collision', async () => {
    const name = 'concurrent'
    const path = fixturePath(name)
    const pageSlug = fixtureKey(`${name}-page`)
    const articleSlug = fixtureKey(`${name}-article`)

    const results = await Promise.allSettled([
      payload.create({
        collection: 'pages',
        context: draftMutationContext,
        data: {
          layout: [hero('Concurrent page')],
          pageType: 'standard',
          path,
          slug: pageSlug,
          title: `Concurrent ${pageSlug}`,
        },
        draft: true,
        overrideAccess: true,
      }),
      payload.create({
        collection: 'articles',
        context: draftMutationContext,
        data: {
          articleType: 'insight',
          contentMode: 'full',
          layout: [hero('Concurrent article')],
          path,
          slug: articleSlug,
          title: `Concurrent ${articleSlug}`,
        },
        draft: true,
        overrideAccess: true,
      }),
    ])

    const fulfilled = results.filter((result) => result.status === 'fulfilled')
    const rejected = results.filter((result) => result.status === 'rejected')
    const [pages, articles] = await Promise.all([
      findDocumentsBySlug('pages', pageSlug),
      findDocumentsBySlug('articles', articleSlug),
    ])
    const claims = await payload.find({
      collection: 'route-registry',
      depth: 0,
      limit: 10,
      overrideAccess: true,
      pagination: false,
      where: {
        path: {
          equals: path,
        },
      },
    })

    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect(rejected[0]?.reason).toMatchObject({
      status: 409,
    })
    expect([...pages, ...articles]).toHaveLength(1)
    expect(claims.docs).toHaveLength(1)
    expect(claims.docs[0]).toMatchObject({
      ownerKind: 'content',
      path,
      state: 'reserved',
    })
  })

  it('keeps route mutations isolated during a bulk publication', async () => {
    const first = await createDraftPage('bulk-first')
    const second = await createDraftPage('bulk-second')

    const result = await payload.update({
      collection: 'pages',
      context: publishMutationContext,
      data: {
        _status: 'published',
      },
      draft: false,
      overrideAccess: true,
      where: {
        id: {
          in: [first.id, second.id],
        },
      },
    })

    expect(result.errors).toHaveLength(0)
    expect(result.docs).toHaveLength(2)

    for (const page of [first, second]) {
      await expect(
        findRouteClaim({
          draft: false,
          path: page.path as string,
          payload,
        }),
      ).resolves.toMatchObject({
        ownerCollection: 'pages',
        ownerDocumentId: String(page.id),
        state: 'published',
      })
    }
  })

  it('omits published no-index owners from the public sitemap', async () => {
    const name = 'sitemap-no-index'
    const path = fixturePath(name)

    const page = await payload.create({
      collection: 'pages',
      context: publishMutationContext,
      data: {
        _status: 'published',
        layout: [hero('No-index sitemap page')],
        meta: {
          noIndex: true,
        },
        pageType: 'standard',
        path,
        slug: fixtureKey(name),
        title: `Published ${fixtureKey(name)}`,
      },
      draft: false,
      overrideAccess: true,
    })

    const excludesPath = (await getContentSitemap()).every(
      ({ loc }) => new URL(loc).pathname !== path,
    )
    expect(excludesPath).toBe(true)

    await payload.update({
      collection: 'pages',
      context: publishMutationContext,
      data: {
        meta: {
          noIndex: false,
        },
      },
      draft: false,
      id: page.id,
      overrideAccess: true,
    })

    const includesPath = (await getContentSitemap()).some(
      ({ loc }) => new URL(loc).pathname === path,
    )
    expect(includesPath).toBe(true)
  })

  it('protects the virtual system routes and seeds them idempotently', async () => {
    await ensureSystemRouteClaims(payload)
    await ensureSystemRouteClaims(payload)

    const virtualClaims = await payload.find({
      collection: 'route-registry',
      depth: 0,
      limit: 10,
      overrideAccess: true,
      pagination: false,
      sort: 'path',
      where: {
        and: [
          {
            ownerCollection: {
              equals: 'system',
            },
          },
          {
            ownerKind: {
              equals: 'virtual',
            },
          },
        ],
      },
    })

    expect(
      virtualClaims.docs.map(({ archetype, ownerDocumentId, path, state }) => ({
        archetype,
        ownerDocumentId,
        path,
        state,
      })),
    ).toEqual(
      [...systemRouteDefinitions]
        .sort((left, right) => left.path.localeCompare(right.path))
        .map(({ archetype, key, path }) => ({
          archetype,
          ownerDocumentId: key,
          path,
          state: 'published',
        })),
    )

    const conflictingSlug = fixtureKey('system-conflict')
    await expect(
      payload.create({
        collection: 'pages',
        context: draftMutationContext,
        data: {
          layout: [hero('System conflict')],
          pageType: 'standard',
          path: ' /venue?campaign=conflict ',
          slug: conflictingSlug,
          title: `System conflict ${conflictingSlug}`,
        },
        draft: true,
        overrideAccess: true,
      }),
    ).rejects.toMatchObject({
      status: 409,
    })
    expect(await findDocumentsBySlug('pages', conflictingSlug)).toHaveLength(0)
  })

  it('keeps the published path live while a changed draft path is reserved', async () => {
    const name = 'draft-path-state'
    const oldPath = fixturePath(`${name}-old`)
    const newPath = fixturePath(`${name}-new`)
    const page = await createPublishedPage(name, oldPath)

    const draft = await payload.update({
      collection: 'pages',
      context: draftMutationContext,
      data: {
        _status: 'draft',
        path: newPath,
      },
      draft: true,
      id: page.id,
      overrideAccess: true,
    })

    expect(draft._status).toBe('draft')
    await expect(
      findRouteClaim({
        draft: false,
        path: oldPath,
        payload,
      }),
    ).resolves.toMatchObject({
      ownerDocumentId: String(page.id),
      state: 'published',
    })
    await expect(
      findRouteClaim({
        draft: false,
        path: newPath,
        payload,
      }),
    ).resolves.toBeNull()
    await expect(
      findRouteClaim({
        draft: true,
        path: newPath,
        payload,
      }),
    ).resolves.toMatchObject({
      ownerDocumentId: String(page.id),
      state: 'reserved',
    })
  })

  it('refuses to publish a drafted path change without redirect confirmation', async () => {
    const name = 'confirmation-required'
    const oldPath = fixturePath(`${name}-old`)
    const newPath = fixturePath(`${name}-new`)
    const page = await createPublishedPage(name, oldPath)

    await payload.update({
      collection: 'pages',
      context: draftMutationContext,
      data: {
        _status: 'draft',
        path: newPath,
      },
      draft: true,
      id: page.id,
      overrideAccess: true,
    })

    await expect(
      payload.update({
        collection: 'pages',
        context: publishMutationContext,
        data: {
          _status: 'published',
          confirmPathRedirect: false,
        },
        draft: false,
        id: page.id,
        overrideAccess: true,
      }),
    ).rejects.toMatchObject({
      status: 400,
    })

    await expect(
      findRouteClaim({
        draft: false,
        path: oldPath,
        payload,
      }),
    ).resolves.toMatchObject({
      ownerDocumentId: String(page.id),
      state: 'published',
    })
    await expect(
      findRouteClaim({
        draft: true,
        path: newPath,
        payload,
      }),
    ).resolves.toMatchObject({
      ownerDocumentId: String(page.id),
      state: 'reserved',
    })
    const redirects = await payload.find({
      collection: 'redirects',
      depth: 0,
      limit: 10,
      overrideAccess: true,
      pagination: false,
      where: {
        from: {
          equals: oldPath,
        },
      },
    })
    expect(redirects.docs).toHaveLength(0)
  })

  it('publishes a confirmed drafted path change and creates its redirect atomically', async () => {
    const name = 'confirmation-success'
    const oldPath = fixturePath(`${name}-old`)
    const newPath = fixturePath(`${name}-new`)
    const page = await createPublishedPage(name, oldPath)

    await payload.update({
      collection: 'pages',
      context: draftMutationContext,
      data: {
        _status: 'draft',
        path: newPath,
      },
      draft: true,
      id: page.id,
      overrideAccess: true,
    })
    const published = await payload.update({
      collection: 'pages',
      context: publishMutationContext,
      data: {
        _status: 'published',
        confirmPathRedirect: true,
      },
      draft: false,
      id: page.id,
      overrideAccess: true,
    })

    expect(published._status).toBe('published')
    expect(published.path).toBe(newPath)
    await expect(
      findRouteClaim({
        draft: false,
        path: newPath,
        payload,
      }),
    ).resolves.toMatchObject({
      ownerCollection: 'pages',
      ownerDocumentId: String(page.id),
      ownerKind: 'content',
      state: 'published',
    })
    await expect(
      findRouteClaim({
        draft: false,
        path: oldPath,
        payload,
      }),
    ).resolves.toMatchObject({
      archetype: 'redirect',
      ownerCollection: 'redirects',
      ownerKind: 'redirect',
      state: 'published',
    })

    const redirects = await payload.find({
      collection: 'redirects',
      depth: 0,
      limit: 10,
      overrideAccess: true,
      pagination: false,
      where: {
        from: {
          equals: oldPath,
        },
      },
    })
    expect(redirects.docs).toHaveLength(1)
    expect(redirects.docs[0]?.type).toBe('301')
    expect(redirects.docs[0]?.to).toMatchObject({
      type: 'custom',
      url: newPath,
    })
  })

  it('retains redirect approval for the exact path pair through scheduled publication', async () => {
    const name = 'scheduled-path-change'
    const oldPath = fixturePath(`${name}-old`)
    const newPath = fixturePath(`${name}-new`)
    const page = await createPublishedPage(name, oldPath)

    await payload.update({
      collection: 'pages',
      context: draftMutationContext,
      data: {
        confirmPathRedirect: true,
        path: newPath,
      },
      draft: true,
      id: page.id,
      overrideAccess: true,
    })

    await expect(findRouteClaim({ draft: false, path: oldPath, payload })).resolves.toMatchObject({
      ownerDocumentId: String(page.id),
      state: 'published',
    })
    await expect(findRouteClaim({ draft: true, path: newPath, payload })).resolves.toMatchObject({
      ownerDocumentId: String(page.id),
      provenance: {
        note: expect.stringContaining('trayport-path-redirect:'),
      },
      state: 'reserved',
    })

    const published = await payload.update({
      collection: 'pages',
      context: mutationContext,
      data: {
        _status: 'published',
      },
      draft: false,
      id: page.id,
      overrideAccess: true,
    })

    expect(published.path).toBe(newPath)
    await expect(findRouteClaim({ draft: false, path: newPath, payload })).resolves.toMatchObject({
      ownerDocumentId: String(page.id),
      state: 'published',
    })
    await expect(findRouteClaim({ draft: false, path: oldPath, payload })).resolves.toMatchObject({
      archetype: 'redirect',
      ownerCollection: 'redirects',
      state: 'published',
    })
  })

  it('releases the public claim on unpublish and reserves the path for a later republish', async () => {
    const name = 'unpublish-republish'
    const path = fixturePath(name)
    const page = await createPublishedPage(name, path)

    const unpublished = await payload.update({
      collection: 'pages',
      context: mutationContext,
      data: {
        _status: 'draft',
      },
      draft: true,
      id: page.id,
      overrideAccess: true,
    })

    expect(unpublished._status).toBe('draft')
    await expect(findRouteClaim({ draft: false, path, payload })).resolves.toBeNull()
    await expect(findRouteClaim({ draft: true, path, payload })).resolves.toMatchObject({
      ownerDocumentId: String(page.id),
      state: 'reserved',
    })

    const republished = await payload.update({
      collection: 'pages',
      context: publishMutationContext,
      data: {
        _status: 'published',
      },
      draft: false,
      id: page.id,
      overrideAccess: true,
    })

    expect(republished._status).toBe('published')
    await expect(findRouteClaim({ draft: false, path, payload })).resolves.toMatchObject({
      ownerDocumentId: String(page.id),
      state: 'published',
    })
  })

  it('releases a route claim when its owning document is deleted', async () => {
    const name = 'deletion'
    const path = fixturePath(name)
    const page = await createPublishedPage(name, path)

    await payload.delete({
      collection: 'pages',
      context: mutationContext,
      id: page.id,
      overrideAccess: true,
    })

    await expect(
      findRouteClaim({
        draft: true,
        path,
        payload,
      }),
    ).resolves.toBeNull()
  })

  it('allows admin reads but denies all direct writes and non-admin reads', async () => {
    await ensureSystemRouteClaims(payload)
    const systemClaim = await findRouteClaim({
      draft: false,
      path: systemRouteDefinitions[0].path,
      payload,
    })
    expect(systemClaim).not.toBeNull()

    const readable = await payload.find({
      collection: 'route-registry',
      depth: 0,
      limit: 10,
      overrideAccess: false,
      pagination: false,
      user: admin,
      where: {
        path: {
          equals: systemRouteDefinitions[0].path,
        },
      },
    })
    expect(readable.docs).toHaveLength(1)

    await expect(
      payload.find({
        collection: 'route-registry',
        depth: 0,
        limit: 10,
        overrideAccess: false,
        pagination: false,
        user: editor,
      }),
    ).rejects.toThrow()

    const forbiddenPath = fixturePath('forbidden-direct-claim')
    await expect(
      payload.create({
        collection: 'route-registry',
        data: {
          archetype: 'page.standard',
          claimKey: 'client-supplied-value-is-never-authorized',
          ownerCollection: 'pages',
          ownerDocumentId: 'forbidden',
          ownerKind: 'content',
          path: forbiddenPath,
          provenance: {
            source: 'native',
          },
          state: 'reserved',
        },
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()

    const claimID = readable.docs[0]?.id
    expect(claimID).toBeDefined()
    await expect(
      payload.update({
        collection: 'route-registry',
        data: {
          provenance: {
            note: 'forbidden direct update',
            source: 'system',
          },
        },
        id: claimID as number,
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()
    await expect(
      payload.delete({
        collection: 'route-registry',
        id: claimID as number,
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()

    await expect(
      findRouteClaim({
        draft: false,
        path: systemRouteDefinitions[0].path,
        payload,
      }),
    ).resolves.toMatchObject({
      ownerDocumentId: systemRouteDefinitions[0].key,
      ownerKind: 'virtual',
      state: 'published',
    })
  })
})
