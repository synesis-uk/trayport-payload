import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors } from '@/access/roles'
import { anyone } from '@/access/anyone'
import { coordinatesField } from '@/fields/coordinates'
import { createLegacySourceField } from '@/fields/legacySource'
import { trayportSlugField } from '@/fields/slug'

import {
  revalidateCacheDependency,
  revalidateDeletedCacheDependency,
} from './hooks/revalidateDependencies'

export const Regions: CollectionConfig = {
  slug: 'regions',
  access: {
    create: adminsOrEditors,
    delete: admins,
    read: anyone,
    update: adminsOrEditors,
  },
  admin: {
    defaultColumns: ['title', 'code', 'slug', 'updatedAt'],
    group: 'Taxonomies',
    useAsTitle: 'title',
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
      name: 'code',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'map',
      type: 'group',
      fields: [
        coordinatesField({
          label: 'Map centre',
          name: 'centre',
        }),
        {
          name: 'zoom',
          type: 'number',
          defaultValue: 4,
          max: 20,
          min: 1,
        },
      ],
    },
    trayportSlugField(),
    createLegacySourceField(),
  ],
  hooks: {
    afterChange: [revalidateCacheDependency()],
    afterDelete: [revalidateDeletedCacheDependency],
  },
}
