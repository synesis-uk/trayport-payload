import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors, publicOrCMSUsers } from '@/access/roles'
import { trayportLayoutBlocks } from '@/blocks/Trayport/config'
import { contentPathField } from '@/fields/contentPath'
import { createLegacySourceField } from '@/fields/legacySource'
import { publishedAtField } from '@/fields/publishedAt'
import { confirmPathRedirectField } from '@/fields/routeControls'
import { seoField } from '@/fields/seo'
import { trayportSlugField } from '@/fields/slug'
import { validateRoutableDocument } from '@/routing/archetypes'
import { releaseRoutableRoute, syncRoutableRoute } from '@/routing/registry'
import { generateContentPreviewPath } from '@/utilities/generateContentPreviewPath'

import {
  revalidateDeletedRoutableContent,
  revalidateRoutableContent,
} from './hooks/revalidateContent'

export const Articles: CollectionConfig = {
  slug: 'articles',
  access: {
    create: adminsOrEditors,
    delete: admins,
    read: publicOrCMSUsers,
    readVersions: adminsOrEditors,
    update: adminsOrEditors,
  },
  admin: {
    defaultColumns: ['title', 'path', 'publishedAt', '_status', 'updatedAt'],
    group: 'Content',
    livePreview: {
      url: ({ data }) => generateContentPreviewPath(data?.path),
    },
    preview: (data) => generateContentPreviewPath(data?.path),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    excerpt: true,
    externalDestination: true,
    heroMedia: true,
    meta: {
      description: true,
      image: true,
    },
    path: true,
    publishedAt: true,
    slug: true,
    title: true,
  },
  defaultSort: '-publishedAt',
  fields: [
    {
      name: 'title',
      type: 'text',
      index: true,
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Article',
          fields: [
            {
              name: 'excerpt',
              type: 'textarea',
              admin: {
                description: 'Used in article listings and link previews.',
              },
              maxLength: 320,
            },
            {
              name: 'heroMedia',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'layout',
              type: 'blocks',
              admin: {
                condition: (_data, siblingData) => siblingData?.contentMode === 'full',
                initCollapsed: true,
              },
              blocks: trayportLayoutBlocks,
            },
          ],
        },
        {
          label: 'Editorial',
          fields: [
            {
              name: 'contentMode',
              type: 'select',
              admin: {
                description:
                  'Listing-only records support indexes and featured content without requiring a migrated article body.',
              },
              defaultValue: 'listing',
              options: [
                {
                  label: 'Listing only',
                  value: 'listing',
                },
                {
                  label: 'Full article',
                  value: 'full',
                },
              ],
              required: true,
            },
            {
              name: 'externalDestination',
              type: 'text',
              admin: {
                condition: (_data, siblingData) => siblingData?.contentMode === 'listing',
                description:
                  'Optional fully qualified destination for listing-only records. These records never own an internal route.',
              },
              validate: (value: string | null | undefined) =>
                !value ||
                /^https:\/\/[^/?#]+(?:[/?#].*)?$/i.test(value) ||
                'Use a complete HTTPS URL.',
            },
            {
              name: 'articleType',
              type: 'select',
              defaultValue: 'insight',
              options: [
                {
                  label: 'Insight',
                  value: 'insight',
                },
                {
                  label: 'Webinar',
                  value: 'webinar',
                },
                {
                  label: 'Video',
                  value: 'video',
                },
                {
                  label: 'Case study',
                  value: 'case-study',
                },
                {
                  label: 'News',
                  value: 'news',
                },
                {
                  label: 'Event',
                  value: 'event',
                },
              ],
              required: true,
            },
            {
              name: 'categories',
              type: 'relationship',
              hasMany: true,
              relationTo: 'article-categories',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'featured',
                  type: 'checkbox',
                  admin: {
                    description: 'Include this article in the curated featured area.',
                    width: '50%',
                  },
                  defaultValue: false,
                  index: true,
                },
                {
                  name: 'featuredOrder',
                  type: 'number',
                  admin: {
                    condition: (_data, siblingData) => Boolean(siblingData?.featured),
                    description: 'Lower numbers appear first.',
                    step: 1,
                    width: '50%',
                  },
                  index: true,
                  min: 0,
                },
              ],
            },
            {
              name: 'byline',
              type: 'text',
              admin: {
                description:
                  'Display name only. WordPress user accounts are deliberately not migrated.',
              },
            },
            {
              name: 'location',
              type: 'text',
              admin: {
                description: 'Optional event, webinar, or reporting location shown with the date.',
              },
            },
            {
              name: 'relatedArticles',
              type: 'relationship',
              filterOptions: ({ id }) => ({
                id: {
                  not_in: id ? [id] : [],
                },
              }),
              hasMany: true,
              relationTo: 'articles',
            },
            {
              name: 'relatedHubs',
              type: 'relationship',
              hasMany: true,
              relationTo: 'hubs',
            },
          ],
        },
        {
          label: 'SEO',
          fields: [seoField()],
        },
      ],
    },
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
    beforeChange: [validateRoutableDocument('articles')],
    afterChange: [syncRoutableRoute('articles'), revalidateRoutableContent('content-sitemap')],
    afterDelete: [
      releaseRoutableRoute('articles'),
      revalidateDeletedRoutableContent('content-sitemap'),
    ],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 400,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
