// @vitest-environment node

import config from '@/payload.config'
import { Users } from '@/collections/Users'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
const cleanup: Array<() => Promise<unknown>> = []
const mutationContext = {
  disableRevalidate: true,
}

const track = (operation: () => Promise<unknown>): void => {
  cleanup.push(operation)
}

describe.sequential('Trayport content models', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })

    const bootstrapAdmin = await payload.create({
      collection: 'users',
      data: {
        email: `content-model-admin-${Date.now()}@example.test`,
        password: 'content-model-test',
        roles: ['admin'],
      },
      overrideAccess: true,
    })

    track(() =>
      payload.delete({
        collection: 'users',
        id: bootstrapAdmin.id,
        overrideAccess: true,
      }),
    )
  }, 60_000)

  afterAll(async () => {
    for (const operation of cleanup.reverse()) {
      await operation()
    }
  })

  it('allows an editor into the admin and keeps user management admin-only', async () => {
    const stamp = Date.now()
    const editor = await payload.create({
      collection: 'users',
      data: {
        email: `content-editor-${stamp}@example.test`,
        password: 'content-model-test',
        roles: ['editor'],
      },
      overrideAccess: true,
    })

    track(() =>
      payload.delete({
        collection: 'users',
        id: editor.id,
        overrideAccess: true,
      }),
    )

    const adminAccess = Users.access?.admin
    expect(typeof adminAccess).toBe('function')

    if (typeof adminAccess === 'function') {
      expect(
        await adminAccess({
          req: {
            user: editor,
          },
        } as never),
      ).toBe(true)
    }

    await expect(
      payload.create({
        collection: 'users',
        data: {
          email: `forbidden-user-${stamp}@example.test`,
          password: 'content-model-test',
          roles: ['admin'],
        },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('creates native content without WordPress migration metadata', async () => {
    const stamp = Date.now()
    const editor = await payload.create({
      collection: 'users',
      data: {
        email: `native-content-editor-${stamp}@example.test`,
        password: 'content-model-test',
        roles: ['editor'],
      },
      overrideAccess: true,
    })

    track(() =>
      payload.delete({
        collection: 'users',
        id: editor.id,
        overrideAccess: true,
      }),
    )

    const page = await payload.create({
      collection: 'pages',
      data: {
        layout: [
          {
            appearance: 'dark',
            blockType: 'trayportHero',
            heading: 'Native page',
          },
        ],
        pageType: 'standard',
        path: `/model-test-${stamp}/`,
        slug: `model-test-${stamp}`,
        title: 'Native page',
      },
      context: mutationContext,
      draft: true,
      overrideAccess: false,
      user: editor,
    })

    track(() =>
      payload.delete({
        collection: 'pages',
        context: mutationContext,
        id: page.id,
        overrideAccess: true,
      }),
    )

    const article = await payload.create({
      collection: 'articles',
      data: {
        articleType: 'insight',
        contentMode: 'full',
        layout: [
          {
            appearance: 'dark',
            blockType: 'trayportHero',
            heading: 'Native article',
          },
        ],
        path: `/insights/model-test-${stamp}/`,
        slug: `model-test-${stamp}`,
        title: 'Native article',
      },
      context: mutationContext,
      draft: true,
      overrideAccess: false,
      user: editor,
    })

    track(() =>
      payload.delete({
        collection: 'articles',
        context: mutationContext,
        id: article.id,
        overrideAccess: true,
      }),
    )

    const hub = await payload.create({
      collection: 'hubs',
      data: {
        contentMode: 'map-only',
        showOnMap: true,
        slug: `map-hub-${stamp}`,
        title: 'Native map-only hub',
      },
      context: mutationContext,
      draft: true,
      overrideAccess: false,
      user: editor,
    })

    track(() =>
      payload.delete({
        collection: 'hubs',
        context: mutationContext,
        id: hub.id,
        overrideAccess: true,
      }),
    )

    const venue = await payload.create({
      collection: 'venues',
      context: mutationContext,
      data: {
        slug: `venue-${stamp}`,
        title: 'Native venue',
      },
      draft: true,
      overrideAccess: false,
      user: editor,
    })

    track(() =>
      payload.delete({
        collection: 'venues',
        context: mutationContext,
        id: venue.id,
        overrideAccess: true,
      }),
    )

    const category = await payload.create({
      collection: 'article-categories',
      context: mutationContext,
      data: {
        slug: `category-${stamp}`,
        title: 'Native category',
      },
      overrideAccess: false,
      user: editor,
    })

    track(() =>
      payload.delete({
        collection: 'article-categories',
        context: mutationContext,
        id: category.id,
        overrideAccess: true,
      }),
    )

    const assetClass = await payload.create({
      collection: 'asset-classes',
      context: mutationContext,
      data: {
        slug: `asset-class-${stamp}`,
        title: 'Native asset class',
      },
      overrideAccess: false,
      user: editor,
    })

    track(() =>
      payload.delete({
        collection: 'asset-classes',
        context: mutationContext,
        id: assetClass.id,
        overrideAccess: true,
      }),
    )

    const venueType = await payload.create({
      collection: 'venue-types',
      context: mutationContext,
      data: {
        slug: `venue-type-${stamp}`,
        title: 'Native venue type',
      },
      overrideAccess: false,
      user: editor,
    })

    track(() =>
      payload.delete({
        collection: 'venue-types',
        context: mutationContext,
        id: venueType.id,
        overrideAccess: true,
      }),
    )

    const region = await payload.create({
      collection: 'regions',
      context: mutationContext,
      data: {
        slug: `region-${stamp}`,
        title: 'Native region',
      },
      overrideAccess: false,
      user: editor,
    })

    track(() =>
      payload.delete({
        collection: 'regions',
        context: mutationContext,
        id: region.id,
        overrideAccess: true,
      }),
    )

    const media = await payload.create({
      collection: 'media',
      context: mutationContext,
      data: {
        alt: '',
        decorative: true,
        sourceFileHash: 'a'.repeat(64),
        title: 'Native decorative image',
      },
      filePath: 'src/endpoints/seed/image-post1.webp',
      overrideAccess: false,
      user: editor,
    })

    track(() =>
      payload.delete({
        collection: 'media',
        context: mutationContext,
        id: media.id,
        overrideAccess: true,
      }),
    )

    await payload.update({
      collection: 'media',
      context: mutationContext,
      data: {
        sourceFileHash: 'b'.repeat(64),
      },
      id: media.id,
      overrideAccess: false,
      user: editor,
    })
    const privilegedMedia = await payload.findByID({
      collection: 'media',
      depth: 0,
      id: media.id,
      overrideAccess: true,
    })
    expect(privilegedMedia.sourceFileHash).toBeFalsy()

    for (const document of [
      page,
      article,
      hub,
      venue,
      category,
      assetClass,
      venueType,
      region,
      media,
    ]) {
      expect(document.legacySource?.source).toBeFalsy()
      expect(document.legacySource?.key).toBeFalsy()
    }
  })

  it('computes a stable unique key for imported records', async () => {
    const stamp = Date.now()
    const legacyId = stamp % 1_000_000_000
    const assetClass = await payload.create({
      collection: 'asset-classes',
      context: mutationContext,
      data: {
        legacySource: {
          contentHash: `hash-${stamp}`,
          legacyId,
          source: 'wordpress',
        },
        slug: `imported-asset-class-${stamp}`,
        title: 'Imported asset class',
      },
      overrideAccess: true,
    })

    track(() =>
      payload.delete({
        collection: 'asset-classes',
        context: mutationContext,
        id: assetClass.id,
        overrideAccess: true,
      }),
    )

    expect(assetClass.legacySource?.key).toBe(`wordpress:${legacyId}`)
  })
})
