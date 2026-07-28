import type { GlobalConfig } from 'payload'

import { publicGlobalRead } from '@/access/publicGlobalRead'
import { adminsOrEditors } from '@/access/roles'
import { createLegacySourceField } from '@/fields/legacySource'
import { navigationLinkField } from '@/fields/navigationLink'

import { revalidateGlobal } from './hooks/revalidateGlobal'

export const Footer: GlobalConfig = {
  slug: 'footer',
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
      name: 'intro',
      type: 'textarea',
      admin: {
        description: 'Short brand statement shown alongside the footer navigation.',
      },
    },
    {
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          admin: {
            initCollapsed: true,
          },
          fields: [navigationLinkField({ includeLabel: true })],
          maxRows: 12,
        },
      ],
      maxRows: 5,
    },
    {
      name: 'legalLinks',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [navigationLinkField({ includeLabel: true })],
      maxRows: 8,
    },
    {
      name: 'copyright',
      type: 'text',
      admin: {
        description:
          'Use {year} where the current year should be inserted, for example “© {year} Trayport”.',
      },
    },
    {
      name: 'certificationMarks',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
        },
      ],
      maxRows: 6,
    },
    createLegacySourceField(),
  ],
  hooks: {
    afterChange: [revalidateGlobal('footer')],
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
