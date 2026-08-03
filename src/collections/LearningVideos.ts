import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors, publicOrCMSUsers } from '@/access/roles'
import { trayportLayoutBlocks } from '@/blocks/Trayport/config'
import { contentPathField } from '@/fields/contentPath'
import { createLegacySourceField } from '@/fields/legacySource'
import { publishedAtField } from '@/fields/publishedAt'
import { confirmPathRedirectField } from '@/fields/routeControls'
import { seoField } from '@/fields/seo'
import { trayportSlugField } from '@/fields/slug'
import { validateHTTPSVideoURL, validateRoutableDocument } from '@/routing/archetypes'
import { releaseRoutableRoute, syncRoutableRoute } from '@/routing/registry'
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
    defaultColumns: ['title', 'accessMode', 'path', '_status', 'updatedAt'],
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
    meta: {
      description: true,
      image: true,
    },
    path: true,
    publishedAt: true,
    summary: true,
    title: true,
    video: true,
  },
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
      name: 'accessMode',
      type: 'select',
      admin: {
        description:
          'Only public videos can be published until identity checks and protected media delivery are implemented. Other access modes can be prepared as drafts.',
        position: 'sidebar',
      },
      defaultValue: 'public',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Authenticated users (draft only)', value: 'authenticated' },
        { label: 'Subscribers (draft only)', value: 'subscriber' },
      ],
      required: true,
    },
    {
      name: 'video',
      type: 'upload',
      filterOptions: {
        mimeType: {
          contains: 'video/',
        },
      },
      relationTo: 'media',
    },
    {
      name: 'externalVideoURL',
      type: 'text',
      admin: {
        description: 'Optional HTTPS video destination when media is hosted outside Payload.',
      },
      validate: (value: string | null | undefined) => validateHTTPSVideoURL(value),
    },
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
      name: 'layout',
      type: 'blocks',
      admin: {
        initCollapsed: true,
      },
      blocks: trayportLayoutBlocks,
    },
    seoField(),
    trayportSlugField(),
    contentPathField({ required: false }),
    confirmPathRedirectField(),
    publishedAtField(),
    createLegacySourceField(),
  ],
  hooks: {
    beforeChange: [validateRoutableDocument('learning-videos')],
    afterChange: [
      syncRoutableRoute('learning-videos'),
      revalidateRoutableContent('content-sitemap'),
    ],
    afterDelete: [
      releaseRoutableRoute('learning-videos'),
      revalidateDeletedRoutableContent('content-sitemap'),
    ],
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
