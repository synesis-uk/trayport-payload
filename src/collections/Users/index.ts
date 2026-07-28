import type { CollectionConfig } from 'payload'

import {
  admins,
  adminsOrFirstUser,
  adminsOrOwnUserRecord,
  adminsOrSelf,
  cmsRoleOptions,
  isAdmin,
  isAdminOrEditor,
} from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => isAdminOrEditor(user),
    create: adminsOrFirstUser,
    delete: admins,
    read: adminsOrOwnUserRecord,
    unlock: admins,
    update: adminsOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles', 'updatedAt'],
    group: 'Administration',
    useAsTitle: 'email',
  },
  auth: {
    cookies: {
      sameSite: 'Lax',
      secure:
        typeof process.env.PAYLOAD_COOKIE_SECURE === 'string'
          ? process.env.PAYLOAD_COOKIE_SECURE === 'true'
          : process.env.NODE_ENV === 'production',
    },
    lockTime: 10 * 60 * 1000,
    maxLoginAttempts: 5,
    tokenExpiration: 2 * 60 * 60,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      access: {
        create: ({ req: { user } }) => isAdmin(user),
        update: ({ req: { user } }) => isAdmin(user),
      },
      admin: {
        position: 'sidebar',
      },
      defaultValue: ['editor'],
      hasMany: true,
      options: [...cmsRoleOptions],
      saveToJWT: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') {
          return data
        }

        const { totalDocs } = await req.payload.count({
          collection: 'users',
          overrideAccess: true,
        })

        if (totalDocs === 0) {
          return {
            ...data,
            roles: ['admin'],
          }
        }

        return data
      },
    ],
  },
  timestamps: true,
}
