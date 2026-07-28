import type { GlobalConfig } from 'payload'

import { publicGlobalRead } from '@/access/publicGlobalRead'
import { adminsOrEditors } from '@/access/roles'
import { navigationLinkField } from '@/fields/navigationLink'

import { revalidateGlobal } from './hooks/revalidateGlobal'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  access: {
    read: publicGlobalRead,
    readVersions: adminsOrEditors,
    update: adminsOrEditors,
  },
  admin: {
    group: 'Site configuration',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              defaultValue: 'Trayport',
              required: true,
            },
            {
              name: 'tagline',
              type: 'text',
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'logoOnDark',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Default SEO',
          fields: [
            {
              name: 'defaultSEO',
              type: 'group',
              fields: [
                {
                  name: 'titleSuffix',
                  type: 'text',
                  defaultValue: ' | Trayport',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  maxLength: 180,
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
        {
          label: 'Contact and social',
          fields: [
            {
              name: 'contact',
              type: 'group',
              fields: [
                {
                  name: 'email',
                  type: 'email',
                },
                {
                  name: 'phone',
                  type: 'text',
                },
                {
                  name: 'address',
                  type: 'textarea',
                },
              ],
            },
            {
              name: 'socialLinks',
              type: 'array',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  options: [
                    {
                      label: 'LinkedIn',
                      value: 'linkedin',
                    },
                    {
                      label: 'YouTube',
                      value: 'youtube',
                    },
                    {
                      label: 'X',
                      value: 'x',
                    },
                    {
                      label: 'Other',
                      value: 'other',
                    },
                  ],
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                },
              ],
              maxRows: 8,
            },
          ],
        },
        {
          label: 'Notices',
          fields: [
            {
              name: 'siteNotice',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'message',
                  type: 'textarea',
                  admin: {
                    condition: (_data, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
                {
                  name: 'action',
                  type: 'group',
                  admin: {
                    condition: (_data, siblingData) => Boolean(siblingData?.enabled),
                  },
                  fields: [navigationLinkField({ includeLabel: true })],
                },
              ],
            },
            {
              name: 'cookieNotice',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'message',
                  type: 'textarea',
                },
                {
                  name: 'policyPage',
                  type: 'relationship',
                  relationTo: 'pages',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal('site-settings')],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 800,
      },
      schedulePublish: true,
    },
  },
}
