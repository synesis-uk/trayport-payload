import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors, isAdminOrEditor, publicOrCMSUsers } from '@/access/roles'
import { trayportLayoutBlocks } from '@/blocks/Trayport/config'
import { contentPathField } from '@/fields/contentPath'
import { createLegacySourceField } from '@/fields/legacySource'
import { imageUploadField, videoUploadField } from '@/fields/mediaUpload'
import { publishedAtField } from '@/fields/publishedAt'
import { confirmPathRedirectField } from '@/fields/routeControls'
import { seoField } from '@/fields/seo'
import { trayportSlugField } from '@/fields/slug'
import { validateHTTPSVideoURL, validateRoutableDocument } from '@/routing/archetypes'
import { releaseRoutableRoute, syncRoutableRoute } from '@/routing/registry'
import {
  externalHTTPSDestinationPolicy,
  normalizeDestinationValue,
  validateExternalHTTPSURL,
} from '@/routing/urlPolicy'
import { generateContentPreviewPath } from '@/utilities/generateContentPreviewPath'

import {
  revalidateDeletedRoutableContent,
  revalidateRoutableContent,
} from './hooks/revalidateContent'

export const LearningVideos: CollectionConfig = {
  slug: 'learning-videos',
  access: {
    create: adminsOrEditors,
    delete: admins,
    read: publicOrCMSUsers,
    readVersions: adminsOrEditors,
    update: adminsOrEditors,
  },
  admin: {
    defaultColumns: ['title', 'contentMode', 'accessMode', 'path', '_status', 'updatedAt'],
    group: 'Content',
    livePreview: {
      url: ({ data }) => generateContentPreviewPath(data?.path),
    },
    preview: (data) => generateContentPreviewPath(data?.path),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    accessMode: true,
    categories: true,
    contentMode: true,
    externalDestination: true,
    meta: {
      description: true,
      image: true,
    },
    path: true,
    poster: true,
    product: true,
    publishedAt: true,
    summary: true,
    title: true,
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
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'contentMode',
      type: 'select',
      admin: {
        description:
          'Listing-only records populate the Learning Hub while their detail page remains on the live site.',
        position: 'sidebar',
      },
      defaultValue: 'listing',
      options: [
        { label: 'Listing only', value: 'listing' },
        { label: 'Managed detail page', value: 'full' },
      ],
      required: true,
    },
    {
      name: 'externalDestination',
      type: 'text',
      admin: {
        condition: (_data, siblingData) => siblingData?.contentMode === 'listing',
        description: 'HTTPS destination for a listing-only record.',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => normalizeDestinationValue(value, externalHTTPSDestinationPolicy),
        ],
      },
      validate: (value: string | null | undefined) => validateExternalHTTPSURL(value),
    },
    {
      name: 'accessMode',
      type: 'select',
      admin: {
        description:
          'Protected records may publish as metadata-only gate pages. They cannot expose a managed video or external video URL until protected delivery is implemented.',
        position: 'sidebar',
      },
      defaultValue: 'subscriber',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Authenticated users', value: 'authenticated' },
        { label: 'Subscribers', value: 'subscriber' },
      ],
      required: true,
    },
    videoUploadField({
      name: 'video',
      access: {
        read: ({ doc, req, siblingData }) =>
          isAdminOrEditor(req.user) ||
          siblingData?.accessMode === 'public' ||
          doc?.accessMode === 'public',
      },
      admin: {
        condition: (_data, siblingData) =>
          siblingData?.contentMode === 'full' && siblingData?.accessMode === 'public',
        description:
          'Public videos only. Protected delivery is not implemented and protected records cannot reference this public media library.',
      },
    }),
    {
      name: 'externalVideoURL',
      type: 'text',
      access: {
        read: ({ doc, req, siblingData }) =>
          isAdminOrEditor(req.user) ||
          siblingData?.accessMode === 'public' ||
          doc?.accessMode === 'public',
      },
      admin: {
        condition: (_data, siblingData) =>
          siblingData?.contentMode === 'full' && siblingData?.accessMode === 'public',
        description: 'Optional HTTPS video destination when media is hosted outside Payload.',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => normalizeDestinationValue(value, externalHTTPSDestinationPolicy),
        ],
      },
      validate: (value: string | null | undefined) => validateHTTPSVideoURL(value),
    },
    imageUploadField({
      name: 'poster',
    }),
    {
      name: 'duration',
      type: 'text',
      admin: {
        description: 'Human-readable duration, for example 12:34.',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      hasMany: true,
      relationTo: 'learning-video-categories',
    },
    {
      name: 'product',
      type: 'text',
      index: true,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
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
    {
      name: 'layout',
      type: 'blocks',
      access: {
        read: ({ doc, req, siblingData }) =>
          isAdminOrEditor(req.user) ||
          siblingData?.accessMode === 'public' ||
          doc?.accessMode === 'public',
      },
      admin: {
        condition: (_data, siblingData) =>
          siblingData?.contentMode === 'full' && siblingData?.accessMode === 'public',
        initCollapsed: true,
      },
      blocks: trayportLayoutBlocks,
    },
    seoField(),
    trayportSlugField(),
    contentPathField({
      condition: (_data, siblingData) => siblingData?.contentMode === 'full',
      required: false,
    }),
    confirmPathRedirectField({
      condition: (_data, siblingData) => siblingData?.contentMode === 'full',
    }),
    publishedAtField(),
    createLegacySourceField(),
  ],
  hooks: {
    beforeChange: [validateRoutableDocument('learning-videos')],
    afterChange: [syncRoutableRoute('learning-videos'), revalidateRoutableContent()],
    afterDelete: [releaseRoutableRoute('learning-videos'), revalidateDeletedRoutableContent()],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 800,
      },
      schedulePublish: true,
    },
    maxPerDoc: 30,
  },
}
