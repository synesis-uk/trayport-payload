import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors, publicOrCMSUsers } from '@/access/roles'
import { coordinatesField } from '@/fields/coordinates'
import { createLegacySourceField } from '@/fields/legacySource'
import { trayportSlugField } from '@/fields/slug'

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
    defaultColumns: ['title', 'code', 'venueTypes', '_status', 'updatedAt'],
    group: 'Market coverage',
    useAsTitle: 'title',
  },
  defaultPopulate: {
    code: true,
    logo: true,
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
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'description',
      type: 'richText',
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
    createLegacySourceField(),
  ],
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
