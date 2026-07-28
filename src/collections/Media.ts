import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { admins, adminsOrEditors } from '@/access/roles'
import { anyone } from '../access/anyone'
import { createLegacySourceField } from '@/fields/legacySource'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: adminsOrEditors,
    delete: admins,
    read: anyone,
    update: adminsOrEditors,
  },
  admin: {
    defaultColumns: ['filename', 'title', 'mimeType', 'updatedAt'],
    group: 'Assets',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Editorial asset name. This does not replace image alternative text.',
      },
    },
    {
      name: 'alt',
      type: 'text',
      admin: {
        description:
          'Describe the purpose of an image for people who cannot see it. Leave empty for decorative images or non-image files.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'decorative',
          type: 'checkbox',
          admin: {
            description:
              'Decorative images are intentionally announced with empty alternative text.',
            width: '50%',
          },
          defaultValue: false,
        },
        {
          name: 'altSource',
          type: 'select',
          admin: {
            description:
              'Records whether alternative text came from WordPress, a migration fallback, or editorial review.',
            width: '50%',
          },
          options: [
            {
              label: 'WordPress',
              value: 'wordpress',
            },
            {
              label: 'Title fallback',
              value: 'title-fallback',
            },
            {
              label: 'Editor review',
              value: 'editor-review',
            },
          ],
        },
      ],
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'attribution',
      type: 'text',
    },
    {
      name: 'externalURL',
      type: 'text',
      admin: {
        description: 'Optional externally hosted source, primarily for video.',
      },
    },
    {
      name: 'poster',
      type: 'upload',
      admin: {
        condition: (data) =>
          typeof data?.mimeType === 'string' && data.mimeType.startsWith('video/'),
      },
      relationTo: 'media',
    },
    createLegacySourceField(),
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
