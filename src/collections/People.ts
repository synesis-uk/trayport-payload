import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors, publicOrCMSUsers } from '@/access/roles'
import { contentPathField } from '@/fields/contentPath'
import { createLegacySourceField } from '@/fields/legacySource'
import { imageUploadField } from '@/fields/mediaUpload'
import { publishedAtField } from '@/fields/publishedAt'
import { confirmPathRedirectField } from '@/fields/routeControls'
import { seoField } from '@/fields/seo'
import { trayportSlugField } from '@/fields/slug'
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
import {
  captureDependencyPublicProjectionIntent,
  revalidateCacheDependency,
  revalidateDeletedCacheDependency,
} from './hooks/revalidateDependencies'

export const People: CollectionConfig = {
  slug: 'people',
  labels: {
    singular: 'Person',
    plural: 'People',
  },
  access: {
    create: adminsOrEditors,
    delete: admins,
    read: publicOrCMSUsers,
    readVersions: adminsOrEditors,
    update: adminsOrEditors,
  },
  admin: {
    defaultColumns: ['title', 'jobRole', 'team', 'path', '_status', 'updatedAt'],
    group: 'Company',
    livePreview: {
      url: ({ data }) => generateContentPreviewPath(data?.path),
    },
    preview: (data) => generateContentPreviewPath(data?.path),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    description: true,
    displayOrder: true,
    externalProfileURL: true,
    image: true,
    jobRole: true,
    path: true,
    quote: true,
    slug: true,
    team: true,
    title: true,
  },
  defaultSort: 'title',
  fields: [
    {
      name: 'title',
      type: 'text',
      index: true,
      label: 'Name',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profile',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'jobRole',
                  type: 'text',
                  admin: { width: '60%' },
                },
                {
                  name: 'team',
                  type: 'select',
                  admin: {
                    description: 'Controls profile presentation and team listings.',
                    width: '40%',
                  },
                  options: [
                    { label: 'Leadership', value: 'ceo' },
                    { label: 'Senior management', value: 'smt' },
                    { label: 'Department heads', value: 'head' },
                    { label: 'Careers', value: 'careers' },
                  ],
                  required: true,
                },
              ],
            },
            {
              name: 'displayOrder',
              type: 'number',
              admin: {
                description: 'Lower numbers appear first in automatic team listings.',
                step: 1,
                width: '50%',
              },
              defaultValue: 0,
              index: true,
              min: 0,
              required: true,
            },
            imageUploadField({
              name: 'image',
              label: 'Portrait',
            }),
            {
              name: 'description',
              type: 'richText',
              label: 'Biography',
            },
            {
              name: 'quote',
              type: 'richText',
              admin: {
                condition: (_data, siblingData) => siblingData?.team === 'careers',
                description: 'Optional quotation used by careers profiles.',
              },
            },
            {
              name: 'joinedAt',
              type: 'date',
              admin: {
                date: { pickerAppearance: 'dayOnly' },
                description: 'Optional internal chronology retained from WordPress.',
              },
              label: 'Joined Trayport',
            },
            {
              name: 'externalProfileURL',
              type: 'text',
              admin: {
                description:
                  'Optional complete HTTPS profile URL. The managed Trayport profile remains canonical.',
              },
              hooks: {
                beforeValidate: [
                  ({ value }) => normalizeDestinationValue(value, externalHTTPSDestinationPolicy),
                ],
              },
              validate: (value: string | null | undefined) => validateExternalHTTPSURL(value),
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
    contentPathField(),
    confirmPathRedirectField(),
    publishedAtField(),
    createLegacySourceField(),
  ],
  hooks: {
    beforeChange: [captureDependencyPublicProjectionIntent, validateRoutableDocument('people')],
    afterChange: [
      syncRoutableRoute('people'),
      revalidateRoutableContent(),
      revalidateCacheDependency({ versioned: true }),
    ],
    afterDelete: [
      releaseRoutableRoute('people'),
      revalidateDeletedRoutableContent(),
      revalidateDeletedCacheDependency,
    ],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 400,
      },
      schedulePublish: true,
    },
    maxPerDoc: 30,
  },
}
