import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors } from '@/access/roles'
import { anyone } from '@/access/anyone'
import { createLegacySourceField } from '@/fields/legacySource'
import { trayportSlugField } from '@/fields/slug'

export const VenueTypes: CollectionConfig = {
  slug: 'venue-types',
  access: {
    create: adminsOrEditors,
    delete: admins,
    read: anyone,
    update: adminsOrEditors,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'displayOrder', 'updatedAt'],
    group: 'Taxonomies',
    useAsTitle: 'title',
  },
  defaultSort: 'displayOrder',
  fields: [
    {
      name: 'title',
      type: 'text',
      index: true,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
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
}
