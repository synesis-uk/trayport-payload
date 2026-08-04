import type { CollectionConfig, TextFieldSingleValidation } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { admins, adminsOrEditors, isAdmin } from '@/access/roles'
import { resolveMediaStorageConfig } from '@/config/mediaStorage'
import { anyone } from '../access/anyone'
import { createLegacySourceField } from '@/fields/legacySource'
import { imageUploadField } from '@/fields/mediaUpload'
import { validateExternalMediaURL } from '@/routing/urlPolicy'

import {
  revalidateCacheDependency,
  revalidateDeletedCacheDependency,
} from './hooks/revalidateDependencies'

const mediaStorage = resolveMediaStorageConfig()

export const validateMediaAlternativeText = ({
  alt,
  decorative,
  mimeType,
}: {
  alt: unknown
  decorative: unknown
  mimeType: unknown
}): true | string => {
  if (typeof mimeType !== 'string' || !mimeType.startsWith('image/')) return true

  const hasAlternativeText = typeof alt === 'string' && Boolean(alt.trim())
  if (decorative === true) {
    return hasAlternativeText ? 'Clear the alternative text for a decorative image.' : true
  }

  return hasAlternativeText ? true : 'Add alternative text or mark this image as decorative.'
}

const validateMediaAlt: TextFieldSingleValidation = (value, { data }) => {
  const document = data as { decorative?: unknown; mimeType?: unknown } | undefined

  return validateMediaAlternativeText({
    alt: value,
    decorative: document?.decorative,
    mimeType: document?.mimeType,
  })
}

const validateMediaExternalURL: TextFieldSingleValidation = (value, { data }) => {
  const document = data as { legacySource?: unknown } | undefined
  const legacySource =
    document?.legacySource && typeof document.legacySource === 'object'
      ? (document.legacySource as { source?: unknown })
      : null

  return legacySource?.source === 'wordpress' &&
    typeof value === 'string' &&
    /^http:\/\/trayport\.local\/app\/uploads\//iu.test(value)
    ? true
    : validateExternalMediaURL(value)
}

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
      validate: validateMediaAlt,
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
        description:
          'Optional reviewed CDN source. Legacy local-source URLs remain as migration provenance but are never rendered.',
      },
      validate: validateMediaExternalURL,
    },
    {
      name: 'sourceFileHash',
      type: 'text',
      access: {
        create: ({ req }) => isAdmin(req.user),
        read: ({ req }) => isAdmin(req.user),
        update: ({ req }) => isAdmin(req.user),
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
      index: true,
    },
    imageUploadField({
      name: 'poster',
      admin: {
        condition: (data) =>
          typeof data?.mimeType === 'string' && data.mimeType.startsWith('video/'),
      },
    }),
    createLegacySourceField(),
  ],
  hooks: {
    afterChange: [revalidateCacheDependency()],
    afterDelete: [revalidateDeletedCacheDependency],
  },
  upload: {
    staticDir: mediaStorage.localPath,
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
