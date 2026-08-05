import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors, publicOrCMSUsers } from '@/access/roles'
import { trayportLayoutBlocks } from '@/blocks/Trayport/config'
import { contentPathField } from '@/fields/contentPath'
import { coordinatesField } from '@/fields/coordinates'
import { createLegacySourceField } from '@/fields/legacySource'
import { imageOrVideoUploadField } from '@/fields/mediaUpload'
import { publishedAtField } from '@/fields/publishedAt'
import { confirmPathRedirectField } from '@/fields/routeControls'
import { seoField } from '@/fields/seo'
import { trayportSlugField } from '@/fields/slug'
import { validateOptionalHubSpotFormID } from '@/integrations/hubSpotForm'
import { validateRoutableDocument } from '@/routing/archetypes'
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
    defaultColumns: ['title', 'path', 'displayDate', 'publishedAt', '_status', 'updatedAt'],
    group: 'Content',
    livePreview: {
      url: ({ data }) => generateContentPreviewPath(data?.path),
    },
    preview: (data) => generateContentPreviewPath(data?.path),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    excerpt: true,
    displayDate: true,
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
            imageOrVideoUploadField({
              name: 'heroMedia',
            }),
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
              hooks: {
                beforeValidate: [
                  ({ value }) => normalizeDestinationValue(value, externalHTTPSDestinationPolicy),
                ],
              },
              validate: (value: string | null | undefined) => validateExternalHTTPSURL(value),
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
              name: 'displayDate',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                },
                description:
                  'Editorial date shown on cards and listings. Year filters use Published At; Published At is also the display fallback when this is empty.',
              },
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
              name: 'eventDetails',
              type: 'group',
              admin: {
                condition: (data) => data?.articleType === 'event',
                description:
                  'Structured event details used by event pages and whole-site search. Leave fields empty when they are not known.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'startsAt',
                      type: 'date',
                      admin: {
                        date: { pickerAppearance: 'dayOnly' },
                        width: '50%',
                      },
                    },
                    {
                      name: 'endsAt',
                      type: 'date',
                      admin: {
                        date: { pickerAppearance: 'dayOnly' },
                        width: '50%',
                      },
                    },
                  ],
                },
                {
                  name: 'venueName',
                  type: 'text',
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'city',
                      type: 'text',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'region',
                      type: 'text',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'country',
                  type: 'text',
                },
                coordinatesField(),
                {
                  name: 'formTitle',
                  type: 'text',
                  admin: {
                    description: 'Heading retained for the associated HubSpot form.',
                  },
                },
                {
                  name: 'hubspotFormId',
                  type: 'text',
                  admin: {
                    description:
                      'Existing HubSpot form identifier. Rendering remains governed by the shared form integration.',
                  },
                  index: true,
                  validate: validateOptionalHubSpotFormID,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'showFinishedNotice',
                      type: 'checkbox',
                      admin: {
                        description:
                          'After the end date, show the legacy “This event has now finished” notice.',
                        width: '50%',
                      },
                      defaultValue: false,
                    },
                    {
                      name: 'hideFormsAfterEnd',
                      type: 'checkbox',
                      admin: {
                        description:
                          'After the end date, remove HubSpot forms from this event page.',
                        width: '50%',
                      },
                      defaultValue: false,
                    },
                  ],
                },
              ],
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
    afterChange: [syncRoutableRoute('articles'), revalidateRoutableContent()],
    afterDelete: [releaseRoutableRoute('articles'), revalidateDeletedRoutableContent()],
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
