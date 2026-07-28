import type { Field, GlobalConfig } from 'payload'

import { publicGlobalRead } from '@/access/publicGlobalRead'
import { adminsOrEditors } from '@/access/roles'
import { createLegacySourceField } from '@/fields/legacySource'
import { navigationLinkField } from '@/fields/navigationLink'

import { revalidateGlobal } from './hooks/revalidateGlobal'

const childItemFields = (): Field[] => [
  {
    name: 'label',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    type: 'textarea',
  },
  {
    name: 'groupLabel',
    type: 'text',
    admin: {
      description: 'Optional heading used to group related dropdown links.',
    },
  },
  {
    name: 'media',
    type: 'upload',
    admin: {
      description: 'Optional image for feature-style dropdown entries.',
    },
    relationTo: 'media',
  },
  navigationLinkField(),
]

const primaryItemFields = (): Field[] => [
  {
    name: 'label',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    type: 'textarea',
  },
  navigationLinkField(),
  {
    name: 'children',
    type: 'array',
    admin: {
      initCollapsed: true,
    },
    fields: childItemFields(),
    maxRows: 32,
  },
]

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: publicGlobalRead,
    readVersions: adminsOrEditors,
    update: adminsOrEditors,
  },
  admin: {
    group: 'Site configuration',
  },
  fields: [
    {
      name: 'primaryItems',
      type: 'array',
      admin: {
        description:
          'Main desktop and mobile navigation. One level of dropdown items is supported.',
        initCollapsed: true,
      },
      fields: primaryItemFields(),
      maxRows: 12,
    },
    {
      name: 'utilityItems',
      type: 'array',
      admin: {
        description: 'Small supporting links shown separately from the primary navigation.',
        initCollapsed: true,
      },
      fields: [navigationLinkField({ includeLabel: true })],
      maxRows: 8,
    },
    {
      name: 'primaryAction',
      type: 'group',
      fields: [navigationLinkField({ includeLabel: true })],
    },
    createLegacySourceField(),
  ],
  hooks: {
    afterChange: [revalidateGlobal('navigation')],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 800,
      },
      schedulePublish: true,
    },
  },
}
