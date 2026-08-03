import type { CollectionConfig } from 'payload'

import { admins } from '@/access/roles'
import { normalizeContentPath, validateContentPath } from '@/fields/contentPath'
import { routeArchetypeIDs } from '@/routing/archetypes'

const deny = () => false

export const RouteRegistry: CollectionConfig = {
  slug: 'route-registry',
  access: {
    admin: deny,
    create: deny,
    delete: deny,
    read: admins,
    update: deny,
  },
  admin: {
    hidden: true,
    useAsTitle: 'path',
  },
  fields: [
    {
      name: 'path',
      type: 'text',
      index: true,
      required: true,
      unique: true,
      validate: (value: string | null | undefined) => validateContentPath(value),
    },
    {
      name: 'ownerKind',
      type: 'select',
      index: true,
      options: [
        { label: 'Content', value: 'content' },
        { label: 'Virtual route', value: 'virtual' },
        { label: 'Redirect', value: 'redirect' },
      ],
      required: true,
    },
    {
      name: 'ownerCollection',
      type: 'select',
      index: true,
      options: [
        { label: 'Pages', value: 'pages' },
        { label: 'Articles', value: 'articles' },
        { label: 'Hubs', value: 'hubs' },
        { label: 'Venues', value: 'venues' },
        { label: 'Learning videos', value: 'learning-videos' },
        { label: 'Redirects', value: 'redirects' },
        { label: 'System', value: 'system' },
      ],
      required: true,
    },
    {
      name: 'ownerDocumentId',
      type: 'text',
      index: true,
      required: true,
    },
    {
      name: 'archetype',
      type: 'select',
      index: true,
      options: [
        ...routeArchetypeIDs.map((value) => ({ label: value, value })),
        { label: 'redirect', value: 'redirect' },
      ],
      required: true,
    },
    {
      name: 'state',
      type: 'select',
      index: true,
      options: [
        { label: 'Reserved', value: 'reserved' },
        { label: 'Published', value: 'published' },
      ],
      required: true,
    },
    {
      name: 'claimKey',
      type: 'text',
      admin: {
        hidden: true,
      },
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'provenance',
      type: 'group',
      fields: [
        {
          name: 'source',
          type: 'select',
          options: [
            { label: 'Native CMS', value: 'native' },
            { label: 'WordPress', value: 'wordpress' },
            { label: 'System', value: 'system' },
            { label: 'Redirect plugin', value: 'plugin' },
          ],
          required: true,
        },
        {
          name: 'legacyId',
          type: 'number',
        },
        {
          name: 'originalPath',
          type: 'text',
        },
        {
          name: 'note',
          type: 'text',
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        data.path = normalizeContentPath(data.path)
        data.claimKey = [
          data.ownerKind,
          data.ownerCollection,
          data.ownerDocumentId,
          data.state,
        ].join(':')
        return data
      },
    ],
  },
  timestamps: true,
}
