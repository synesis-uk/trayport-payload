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

export const Hubs: CollectionConfig = {
  slug: 'hubs',
  access: {
    create: adminsOrEditors,
    delete: admins,
    read: publicOrCMSUsers,
    readVersions: adminsOrEditors,
    update: adminsOrEditors,
  },
  admin: {
    defaultColumns: ['title', 'code', 'path', '_status', 'updatedAt'],
    group: 'Market coverage',
    livePreview: {
      url: ({ data }) => generateContentPreviewPath(data?.path),
    },
    preview: (data) => generateContentPreviewPath(data?.path),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    code: true,
    heroMedia: true,
    meta: {
      description: true,
      image: true,
    },
    path: true,
    slug: true,
    summary: true,
    title: true,
  },
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
          'Map-only hubs are market markers and relationship records. Page hubs also render a public editorial page.',
        position: 'sidebar',
      },
      defaultValue: 'map-only',
      options: [
        {
          label: 'Map only',
          value: 'map-only',
        },
        {
          label: 'Public page',
          value: 'page',
        },
      ],
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
            },
            {
              name: 'heroMedia',
              type: 'upload',
              relationTo: 'media',
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
          ],
        },
        {
          label: 'Market',
          fields: [
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
                  label: 'Market code',
                },
                {
                  name: 'marketDataKey',
                  type: 'text',
                  admin: {
                    description:
                      'Stable key for future market-data queries. The market data itself is stored outside Payload.',
                    width: '50%',
                  },
                  index: true,
                },
              ],
            },
            {
              name: 'assetClasses',
              type: 'relationship',
              hasMany: true,
              relationTo: 'asset-classes',
            },
            {
              name: 'venueTypes',
              type: 'relationship',
              hasMany: true,
              relationTo: 'venue-types',
            },
            {
              name: 'regions',
              type: 'relationship',
              hasMany: true,
              relationTo: 'regions',
            },
            {
              name: 'relatedHubs',
              type: 'relationship',
              hasMany: true,
              relationTo: 'hubs',
            },
            {
              name: 'showOnMap',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'map',
              type: 'group',
              fields: [
                {
                  name: 'locationLabel',
                  type: 'text',
                },
                coordinatesField({
                  label: 'Map centre',
                  name: 'centre',
                }),
                {
                  name: 'zoom',
                  type: 'number',
                  defaultValue: 6,
                  max: 20,
                  min: 1,
                },
                {
                  name: 'markers',
                  type: 'array',
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                    },
                    coordinatesField({
                      label: 'Location',
                      name: 'location',
                      required: true,
                    }),
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Venue connections',
          fields: [
            {
              name: 'connections',
              type: 'array',
              admin: {
                description:
                  'Editorial connectivity only. Pricing and time-series market data remain outside the CMS.',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'venue',
                  type: 'relationship',
                  relationTo: 'venues',
                  required: true,
                },
                {
                  name: 'connectionType',
                  type: 'select',
                  options: [
                    {
                      label: 'Joule',
                      value: 'd',
                    },
                    {
                      label: 'autoTRADER',
                      value: 'a',
                    },
                    {
                      label: 'Joule and autoTRADER',
                      value: 'b',
                    },
                  ],
                  required: true,
                },
                {
                  name: 'supportsJoule',
                  type: 'checkbox',
                  admin: {
                    readOnly: true,
                  },
                  hooks: {
                    beforeValidate: [
                      ({ siblingData }) =>
                        siblingData?.connectionType === 'd' || siblingData?.connectionType === 'b',
                    ],
                  },
                },
                {
                  name: 'supportsAutoTrader',
                  type: 'checkbox',
                  admin: {
                    readOnly: true,
                  },
                  hooks: {
                    beforeValidate: [
                      ({ siblingData }) =>
                        siblingData?.connectionType === 'a' || siblingData?.connectionType === 'b',
                    ],
                  },
                },
              ],
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
    contentPathField({
      condition: (_data, siblingData) => siblingData?.contentMode === 'page',
      required: false,
    }),
    confirmPathRedirectField({
      condition: (_data, siblingData) => siblingData?.contentMode === 'page',
    }),
    publishedAtField(),
    createLegacySourceField(),
  ],
  hooks: {
    beforeChange: [validateRoutableDocument('hubs')],
    afterChange: [
      syncRoutableRoute('hubs'),
      revalidateRoutableContent('content-sitemap', ['/market-coverage/']),
    ],
    afterDelete: [
      releaseRoutableRoute('hubs'),
      revalidateDeletedRoutableContent('content-sitemap', ['/market-coverage/']),
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
