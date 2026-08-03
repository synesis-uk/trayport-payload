import { revalidatePath, revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'

import { publicGlobalRead } from '@/access/publicGlobalRead'
import { adminsOrEditors } from '@/access/roles'
import { seoField } from '@/fields/seo'
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
    afterChange: [
      async ({ doc, req }) => {
        if (req.context.disableRevalidate) return doc

        await ensureSystemRouteClaims(req.payload, req)
        for (const route of systemRouteDefinitions) {
          revalidatePath(route.path)
        }
        revalidateTag('content-sitemap', 'max')
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
