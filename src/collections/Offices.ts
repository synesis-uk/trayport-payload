import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors, publicOrCMSUsers } from '@/access/roles'
import { coordinatesField } from '@/fields/coordinates'
import { createLegacySourceField } from '@/fields/legacySource'

import {
  captureDependencyPublicProjectionIntent,
  revalidateCacheDependency,
  revalidateDeletedCacheDependency,
} from './hooks/revalidateDependencies'

export const Offices: CollectionConfig = {
  slug: 'offices',
  access: {
    create: adminsOrEditors,
    delete: admins,
    read: publicOrCMSUsers,
    readVersions: adminsOrEditors,
    update: adminsOrEditors,
  },
  admin: {
    defaultColumns: ['title', 'legalName', 'country', 'displayOrder', '_status'],
    group: 'Company',
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
      name: 'legalName',
      type: 'text',
      required: true,
    },
    {
      name: 'addressPrefix',
      type: 'text',
    },
    {
      name: 'address',
      type: 'textarea',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'city',
          type: 'text',
          admin: { width: '50%' },
        },
        {
          name: 'postcode',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'country',
          type: 'text',
          admin: { width: '50%' },
          required: true,
        },
        {
          name: 'countryCode',
          type: 'text',
          admin: { width: '50%' },
          maxLength: 2,
        },
      ],
    },
    coordinatesField(),
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          type: 'text',
          admin: { width: '50%' },
        },
        {
          name: 'email',
          type: 'email',
          admin: { width: '50%' },
        },
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
      required: true,
    },
    createLegacySourceField(),
  ],
  hooks: {
    afterChange: [revalidateCacheDependency({ versioned: true })],
    afterDelete: [revalidateDeletedCacheDependency],
    beforeChange: [captureDependencyPublicProjectionIntent],
  },
  versions: {
    drafts: true,
    maxPerDoc: 30,
  },
}
