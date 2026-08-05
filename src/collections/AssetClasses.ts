import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors } from '@/access/roles'
import { anyone } from '@/access/anyone'
import { createLegacySourceField } from '@/fields/legacySource'
import {
  ensureMarketDataKey,
  marketDataAliasesField,
  marketDataKeyField,
} from '@/fields/marketData'
import { trayportSlugField } from '@/fields/slug'

import {
  revalidateCacheDependency,
  revalidateDeletedCacheDependency,
} from './hooks/revalidateDependencies'

export const AssetClasses: CollectionConfig = {
  slug: 'asset-classes',
  access: {
    create: adminsOrEditors,
    delete: admins,
    read: anyone,
    update: adminsOrEditors,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
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
    {
      name: 'mapAppearance',
      type: 'group',
      admin: {
        description: 'Labels and colour used consistently by the regional and connections maps.',
      },
      fields: [
        {
          name: 'color',
          type: 'select',
          defaultValue: '#00c1d5',
          options: [
            { label: 'Navy', value: '#1f2a44' },
            { label: 'Dark blue', value: '#002d72' },
            { label: 'Mid blue', value: '#0057b8' },
            { label: 'Light blue', value: '#009cde' },
            { label: 'Turquoise', value: '#00c1d5' },
            { label: 'Green', value: '#32b77b' },
            { label: 'Orange', value: '#ff671f' },
            { label: 'Yellow', value: '#f7ea48' },
          ],
        },
        {
          name: 'volumeLabel',
          type: 'text',
          admin: {
            description: 'Public label for aggregated volume values, for example TWh.',
          },
        },
        {
          name: 'priceLabel',
          type: 'text',
        },
        {
          name: 'currency',
          type: 'text',
          maxLength: 8,
        },
      ],
    },
    marketDataKeyField(),
    marketDataAliasesField(),
    trayportSlugField(),
    createLegacySourceField(),
  ],
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) =>
        ensureMarketDataKey(
          'asset-class',
          data as Record<string, unknown>,
          originalDoc as Record<string, unknown>,
        ),
    ],
    afterChange: [revalidateCacheDependency()],
    afterDelete: [revalidateDeletedCacheDependency],
  },
}
