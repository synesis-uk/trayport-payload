import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors, isAdminOrEditor } from '@/access/roles'
import { validateBannerEndAt, validateBannerTargets } from '@/banners/model'
import { generateBannerPreviewPath } from '@/banners/preview'
import { createLegacySourceField } from '@/fields/legacySource'
import { imageUploadField } from '@/fields/mediaUpload'
import { navigationLinkField } from '@/fields/navigationLink'

export const Banners: CollectionConfig = {
  slug: 'banners',
  access: {
    create: adminsOrEditors,
    delete: admins,
    read: adminsOrEditors,
    readVersions: adminsOrEditors,
    update: adminsOrEditors,
  },
  admin: {
    defaultColumns: ['title', 'startAt', 'endAt', 'targetMode', 'position', '_status'],
    description: 'Schedule reusable announcements across every page or a selected group of pages.',
    group: 'Content',
    preview: (data, { req }) => generateBannerPreviewPath({ data, payload: req.payload }),
    useAsTitle: 'title',
  },
  defaultSort: ['priority', '-createdAt'],
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Internal name used to find and manage this banner.',
      },
      index: true,
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'headline',
              type: 'text',
              maxLength: 50,
              required: true,
            },
            {
              name: 'layout',
              type: 'radio',
              admin: {
                layout: 'horizontal',
              },
              defaultValue: 'small',
              options: [
                { label: 'Compact announcement', value: 'small' },
                { label: 'Large promotional banner', value: 'large' },
              ],
              required: true,
            },
            {
              name: 'body',
              type: 'richText',
              admin: {
                condition: (_data, siblingData) => siblingData?.layout === 'large',
                description: 'Optional supporting copy for a large banner.',
              },
            },
            imageUploadField({
              name: 'image',
              admin: {
                condition: (_data, siblingData) => siblingData?.layout === 'large',
                description: 'Optional background image for a large banner.',
              },
            }),
            navigationLinkField({ includeLabel: true }),
            {
              name: 'tone',
              type: 'select',
              defaultValue: 'deep',
              options: [
                { label: 'Trayport deep blue', value: 'deep' },
                { label: 'Trayport blue', value: 'blue' },
                { label: 'Cyan', value: 'cyan' },
                { label: 'Orange', value: 'orange' },
                { label: 'Yellow', value: 'yellow' },
                { label: 'Light', value: 'light' },
              ],
              required: true,
            },
            {
              name: 'dismissible',
              type: 'checkbox',
              defaultValue: true,
              label: 'Allow visitors to dismiss this banner',
            },
          ],
        },
        {
          label: 'Placement and schedule',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'startAt',
                  type: 'date',
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                    description: 'Shown from this instant, using the editor’s configured timezone.',
                    width: '50%',
                  },
                  index: true,
                  required: true,
                },
                {
                  name: 'endAt',
                  type: 'date',
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                    description: 'Hidden after this instant.',
                    width: '50%',
                  },
                  index: true,
                  required: true,
                  validate: (value, { siblingData }) => validateBannerEndAt(value, siblingData),
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'position',
                  type: 'select',
                  admin: {
                    description:
                      'First: above page content. Second: after its first section. Last: below page content.',
                    width: '50%',
                  },
                  defaultValue: 'first',
                  options: [
                    { label: 'First — above page content', value: 'first' },
                    { label: 'Second — after the first section', value: 'second' },
                    { label: 'Last — below page content', value: 'last' },
                  ],
                  required: true,
                },
                {
                  name: 'priority',
                  type: 'number',
                  admin: {
                    description: 'Lower numbers appear first when banners share a position.',
                    step: 1,
                    width: '50%',
                  },
                  defaultValue: 0,
                  index: true,
                  required: true,
                },
              ],
            },
            {
              name: 'targetMode',
              type: 'radio',
              admin: { layout: 'horizontal' },
              defaultValue: 'all',
              label: 'Show on',
              options: [
                { label: 'All pages', value: 'all' },
                { label: 'Specific pages', value: 'specific' },
              ],
              required: true,
            },
            {
              name: 'targetPages',
              type: 'relationship',
              admin: {
                condition: (_data, siblingData) => siblingData?.targetMode === 'specific',
                description: 'Choose one or more managed Pages.',
              },
              hasMany: true,
              relationTo: 'pages',
              validate: (value, { siblingData }) => validateBannerTargets(value, siblingData),
            },
          ],
        },
        {
          label: 'Notifications',
          fields: [
            {
              name: 'notifyUsers',
              type: 'relationship',
              access: {
                read: ({ req }) => isAdminOrEditor(req.user),
              },
              admin: {
                description:
                  'Optional CMS users who receive activation and expiry reminders. Maximum two.',
              },
              hasMany: true,
              maxRows: 2,
              relationTo: 'users',
            },
            {
              name: 'migratedRecipientEmails',
              type: 'array',
              access: {
                create: () => false,
                read: ({ req }) => isAdminOrEditor(req.user),
                update: () => false,
              },
              admin: {
                description:
                  'Read-only WordPress recipient evidence. Select matching CMS users above before launch.',
                readOnly: true,
              },
              fields: [
                {
                  name: 'email',
                  type: 'email',
                  required: true,
                },
              ],
              label: 'Recipients awaiting migration review',
            },
          ],
        },
      ],
    },
    createLegacySourceField(),
  ],
  labels: {
    plural: 'Banners',
    singular: 'Banner',
  },
  versions: {
    drafts: {
      autosave: { interval: 400 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
