import type { GroupField } from 'payload'

import { isAdmin } from '@/access/roles'

export const createLegacySourceField = (): GroupField => ({
  name: 'legacySource',
  type: 'group',
  access: {
    create: ({ req }) => isAdmin(req.user),
    update: ({ req }) => isAdmin(req.user),
  },
  admin: {
    condition: (_data, _siblingData, { user }) => {
      const roles = (user as { roles?: unknown } | null | undefined)?.roles
      return Array.isArray(roles) && roles.includes('admin')
    },
    position: 'sidebar',
    readOnly: true,
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [
          ({ siblingData }) => {
            const source = typeof siblingData?.source === 'string' ? siblingData.source.trim() : ''
            const legacyId = siblingData?.legacyId

            if (source && (typeof legacyId === 'number' || typeof legacyId === 'string')) {
              return `${source}:${legacyId}`
            }

            return null
          },
        ],
      },
      index: true,
      unique: true,
    },
    {
      name: 'source',
      type: 'text',
      index: true,
    },
    {
      name: 'legacyId',
      type: 'number',
      index: true,
    },
    {
      name: 'originalUrl',
      type: 'text',
    },
    {
      name: 'modifiedGmt',
      type: 'date',
    },
    {
      name: 'contentHash',
      type: 'text',
      index: true,
    },
  ],
})

// Kept for compatibility with early migration code. Collection configs should use
// the factory so Payload receives an independent field object for every schema.
export const legacySourceField = createLegacySourceField()
