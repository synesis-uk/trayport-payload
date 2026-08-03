import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors, publicOrCMSUsers } from '@/access/roles'
import { trayportLayoutBlocks } from '@/blocks/Trayport/config'
import { contentPathField } from '@/fields/contentPath'
import { createLegacySourceField } from '@/fields/legacySource'
import { publishedAtField } from '@/fields/publishedAt'
import { confirmPathRedirectField } from '@/fields/routeControls'
import { seoField } from '@/fields/seo'
import { trayportSlugField } from '@/fields/slug'
import { validateRoutableDocument } from '@/routing/archetypes'
import { releaseRoutableRoute, syncRoutableRoute } from '@/routing/registry'
import { generateContentPreviewPath } from '@/utilities/generateContentPreviewPath'

import {
  revalidateDeletedRoutableContent,
  revalidateRoutableContent,
} from '../hooks/revalidateContent'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: adminsOrEditors,
    delete: admins,
    read: publicOrCMSUsers,
    readVersions: adminsOrEditors,
    update: adminsOrEditors,
  },
  defaultPopulate: {
    meta: {
      description: true,
      image: true,
    },
    path: true,
    slug: true,
    title: true,
  },
  admin: {
    defaultColumns: ['title', 'path', '_status', 'updatedAt'],
    group: 'Content',
    livePreview: {
      url: ({ data }) => generateContentPreviewPath(data?.path),
    },
    preview: (data) => generateContentPreviewPath(data?.path),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      index: true,
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'summary',
              type: 'textarea',
              admin: {
                description:
                  'Optional editorial summary used in listings and internal content previews.',
              },
            },
            {
              name: 'layout',
              type: 'blocks',
              blocks: trayportLayoutBlocks,
              admin: {
                initCollapsed: true,
              },
              required: true,
            },
          ],
        },
        {
          label: 'Organisation',
          fields: [
            {
              name: 'parent',
              type: 'relationship',
              maxDepth: 1,
              relationTo: 'pages',
            },
            {
              name: 'navigationLabel',
              type: 'text',
              admin: {
                description: 'Optional shorter title for menus and breadcrumbs.',
              },
            },
            {
              name: 'pageType',
              type: 'select',
              defaultValue: 'standard',
              options: [
                {
                  label: 'Homepage',
                  value: 'homepage',
                },
                {
                  label: 'Standard page',
                  value: 'standard',
                },
                {
                  label: 'Product page',
                  value: 'product',
                },
                {
                  label: 'Landing page',
                  value: 'landing',
                },
                {
                  label: 'Content index',
                  value: 'index',
                },
                {
                  label: 'Legal or policy page',
                  value: 'legal',
                },
                {
                  label: 'Conversion page',
                  value: 'conversion',
                },
                {
                  label: 'Interactive market matrix',
                  value: 'interactive',
                },
              ],
              required: true,
            },
          ],
        },
        {
          label: 'SEO',
          fields: [seoField()],
        },
      ],
    },
    trayportSlugField(),
    contentPathField({ required: false }),
    confirmPathRedirectField(),
    publishedAtField(),
    createLegacySourceField(),
  ],
  hooks: {
    beforeChange: [validateRoutableDocument('pages')],
    afterChange: [syncRoutableRoute('pages'), revalidateRoutableContent('content-sitemap')],
    afterDelete: [
      releaseRoutableRoute('pages'),
      revalidateDeletedRoutableContent('content-sitemap'),
    ],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 400,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
