import type { Access, CollectionConfig, FieldHook, Where } from 'payload'

import { admins, adminsOrEditors, isAdminOrEditor } from '@/access/roles'
import { createLegacySourceField } from '@/fields/legacySource'

import {
  captureDependencyPublicProjectionIntent,
  revalidateCacheDependency,
  revalidateDeletedCacheDependency,
} from './hooks/revalidateDependencies'

const trimText: FieldHook = ({ value }) => (typeof value === 'string' ? value.trim() : value)

const publicLifecycleWhere: Where = {
  and: [
    {
      _status: {
        equals: 'published',
      },
    },
    {
      active: {
        equals: true,
      },
    },
  ],
}

/** Public lifecycle data must be both editorially active and published. */
export const publicActiveLifecycleItems: Access = ({ req: { user } }) => {
  if (isAdminOrEditor(user)) return true

  return publicLifecycleWhere
}

export const LifecycleItems: CollectionConfig = {
  slug: 'lifecycle-items',
  access: {
    create: adminsOrEditors,
    delete: admins,
    read: publicActiveLifecycleItems,
    readVersions: adminsOrEditors,
    update: adminsOrEditors,
  },
  admin: {
    defaultColumns: ['title', 'productLabel', 'serviceName', 'endOfLifeDate', 'active', '_status'],
    description:
      'Managed product and service lifecycle rows. Pages select these records through a Lifecycle component.',
    group: 'Resources',
    useAsTitle: 'title',
  },
  defaultSort: 'endOfLifeDate',
  fields: [
    {
      name: 'title',
      type: 'text',
      hooks: {
        beforeValidate: [trimText],
      },
      index: true,
      maxLength: 180,
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'productLabel',
          type: 'text',
          admin: {
            description: 'Heading used to group related lifecycle rows.',
            width: '50%',
          },
          hooks: {
            beforeValidate: [trimText],
          },
          index: true,
          maxLength: 160,
          required: true,
        },
        {
          name: 'serviceName',
          type: 'text',
          admin: {
            description: 'Product or service name shown in the table row.',
            width: '50%',
          },
          hooks: {
            beforeValidate: [trimText],
          },
          maxLength: 180,
          required: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'duration',
          type: 'text',
          admin: {
            width: '50%',
          },
          hooks: {
            beforeValidate: [trimText],
          },
          maxLength: 120,
        },
        {
          name: 'endOfLifeVersion',
          type: 'text',
          admin: {
            width: '50%',
          },
          hooks: {
            beforeValidate: [trimText],
          },
          maxLength: 180,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'endOfLifeDate',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
            width: '50%',
          },
          index: true,
          required: true,
        },
        {
          name: 'endOfAccessDate',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Optional supporting detail shown when the page component enables it.',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      admin: {
        description: 'Inactive rows are hidden from public reads without deleting their history.',
        position: 'sidebar',
      },
      defaultValue: true,
      index: true,
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
