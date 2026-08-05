import { revalidatePath, revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'

import { publicGlobalRead } from '@/access/publicGlobalRead'
import { adminsOrEditors, isAdmin } from '@/access/roles'
import {
  CONTENT_SITEMAP_CACHE_TAG,
  contentRouteCacheTag,
  IMMEDIATE_CACHE_TAG_EXPIRY,
  ROUTE_REGISTRY_CACHE_TAG,
} from '@/data/cacheTags'
import { seoField } from '@/fields/seo'
import {
  captureGlobalPublicProjectionIntent,
  publicProjectionCanChange,
  takeGlobalPublicProjectionIntent,
} from '@/hooks/publicProjection'
import { ensureSystemRouteClaims, systemRouteDefinitions } from '@/routing/registry'

export const RouteIndexes: GlobalConfig = {
  slug: 'route-indexes',
  label: 'Collection indexes',
  access: {
    read: publicGlobalRead,
    readVersions: adminsOrEditors,
    update: adminsOrEditors,
  },
  admin: {
    group: 'Site configuration',
    hidden: ({ user }) => !isAdmin(user),
  },
  fields: [
    {
      name: 'venueIndex',
      type: 'group',
      label: 'Venue index',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          defaultValue: 'Market coverage',
        },
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Venues',
          required: true,
        },
        {
          name: 'intro',
          type: 'textarea',
          defaultValue:
            'Explore the brokers, exchanges and clearing houses connected through Trayport.',
        },
        seoField(),
      ],
    },
    {
      name: 'marketCoverageIndex',
      type: 'group',
      label: 'Market coverage index',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          defaultValue: 'Global network',
        },
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Market coverage',
          required: true,
        },
        {
          name: 'intro',
          type: 'textarea',
          defaultValue:
            'Explore the energy markets available through Trayport’s global trading network.',
        },
        seoField(),
      ],
    },
  ],
  hooks: {
    beforeOperation: [captureGlobalPublicProjectionIntent],
    afterChange: [
      async ({ context, doc, previousDoc, req }) => {
        const intent = takeGlobalPublicProjectionIntent({
          context,
          slug: 'route-indexes',
        })

        if (context.disableRevalidate) return doc

        if (
          !publicProjectionCanChange({
            context,
            current: doc,
            intent,
            previous: previousDoc,
            req,
          })
        ) {
          return doc
        }

        await ensureSystemRouteClaims(req.payload, req)
        for (const route of systemRouteDefinitions) {
          revalidatePath(route.path)
          revalidateTag(contentRouteCacheTag(route.path), IMMEDIATE_CACHE_TAG_EXPIRY)
        }
        revalidateTag(ROUTE_REGISTRY_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY)
        revalidateTag(CONTENT_SITEMAP_CACHE_TAG, IMMEDIATE_CACHE_TAG_EXPIRY)
        return doc
      },
    ],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 800,
      },
      schedulePublish: true,
    },
  },
}
