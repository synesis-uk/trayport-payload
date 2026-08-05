import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors } from '@/access/roles'
import { anyone } from '@/access/anyone'
import { createLegacySourceField } from '@/fields/legacySource'
import { trayportSlugField } from '@/fields/slug'

import {
  revalidateCacheDependency,
  revalidateDeletedCacheDependency,
} from './hooks/revalidateDependencies'

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
      name: 'parentVenueType',
      type: 'relationship',
      admin: {
        description: 'Optional parent used to group venues in regional-map sidebars.',
        position: 'sidebar',
      },
      relationTo: 'venue-types',
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
    {
      name: 'mapLabel',
      type: 'text',
      admin: {
        description: 'Optional shorter label for map filters and connection summaries.',
      },
    },
    trayportSlugField(),
    createLegacySourceField(),
  ],
  hooks: {
    afterChange: [revalidateCacheDependency()],
    afterDelete: [revalidateDeletedCacheDependency],
  },
}
