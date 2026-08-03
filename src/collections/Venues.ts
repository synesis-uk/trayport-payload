import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors, publicOrCMSUsers } from '@/access/roles'
import { trayportLayoutBlocks } from '@/blocks/Trayport/config'
import { contentPathField } from '@/fields/contentPath'
import { coordinatesField } from '@/fields/coordinates'
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
} from './hooks/revalidateContent'

export const Venues: CollectionConfig = {
  slug: 'venues',
  access: {
    create: adminsOrEditors,
    delete: admins,
    read: publicOrCMSUsers,
    readVersions: adminsOrEditors,
    update: adminsOrEditors,
  },
  admin: {
    defaultColumns: ['title', 'code', 'contentMode', 'path', '_status', 'updatedAt'],
    group: 'Market coverage',
    livePreview: {
      url: ({ data }) => generateContentPreviewPath(data?.path),
    },
    preview: (data) => generateContentPreviewPath(data?.path),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    code: true,
    contentMode: true,
    logo: true,
    path: true,
    slug: true,
    summary: true,
    title: true,
    venueTypes: true,
  },
  defaultSort: 'title',
  fields: [
    {
      name: 'title',
      type: 'text',
      index: true,
      required: true,
    },
    {
      name: 'contentMode',
      type: 'select',
      admin: {
        description:
          'Relationship-only records support hub connectivity. Public details additionally own a complete frontend route.',
        position: 'sidebar',
      },
      defaultValue: 'relationship-only',
      options: [
        {
          label: 'Relationship only',
          value: 'relationship-only',
        },
        {
          label: 'Public detail page',
          value: 'page',
        },
      ],
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'layout',
      type: 'blocks',
      admin: {
        condition: (_data, siblingData) => siblingData?.contentMode === 'page',
        initCollapsed: true,
      },
      blocks: trayportLayoutBlocks,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'code',
          type: 'text',
          admin: {
            width: '50%',
          },
          index: true,
          label: 'Venue code',
        },
        {
          name: 'website',
          type: 'text',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'venueTypes',
      type: 'relationship',
      hasMany: true,
      relationTo: 'venue-types',
    },
    {
      name: 'assetClasses',
      type: 'relationship',
      hasMany: true,
      relationTo: 'asset-classes',
    },
    {
      name: 'regions',
      type: 'relationship',
      hasMany: true,
      relationTo: 'regions',
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        coordinatesField(),
      ],
    },
    {
      name: 'displayOrder',
      type: 'number',
      admin: {
        position: 'sidebar',
        step: 1,
      },
      defaultValue: 0,
      index: true,
      min: 0,
    },
    trayportSlugField(),
    contentPathField({
      condition: (_data, siblingData) => siblingData?.contentMode === 'page',
      required: false,
    }),
    confirmPathRedirectField({
      condition: (_data, siblingData) => siblingData?.contentMode === 'page',
    }),
    publishedAtField(),
    seoField(),
    createLegacySourceField(),
  ],
  hooks: {
    beforeChange: [validateRoutableDocument('venues')],
    afterChange: [
      syncRoutableRoute('venues'),
      revalidateRoutableContent('content-sitemap', ['/venue/']),
    ],
    afterDelete: [
      releaseRoutableRoute('venues'),
      revalidateDeletedRoutableContent('content-sitemap', ['/venue/']),
    ],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 800,
      },
      schedulePublish: true,
    },
    maxPerDoc: 30,
  },
}
