import type { GlobalConfig } from 'payload'

import { publicGlobalRead } from '@/access/publicGlobalRead'
import { adminsOrEditors, isAdmin } from '@/access/roles'
import { imageUploadField } from '@/fields/mediaUpload'
import { navigationLinkField } from '@/fields/navigationLink'
import { captureGlobalPublicProjectionIntent } from '@/hooks/publicProjection'
import {
  externalHTTPSDestinationPolicy,
  internalOrHTTPSDestinationPolicy,
  normalizeDestinationValue,
  validateDestination,
  validateExternalHTTPSURL,
} from '@/routing/urlPolicy'

import { revalidateGlobal } from './hooks/revalidateGlobal'

const validateCookiePolicyURL = (value: unknown): true | string =>
  validateDestination(value, {
    message: 'Use a normalized internal path or complete HTTPS URL without credentials.',
    policy: internalOrHTTPSDestinationPolicy,
  })

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
    hidden: ({ user }) => !isAdmin(user),
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
            imageUploadField({
              name: 'logo',
              admin: {
                description: 'Reserved for a future managed-brand-assets slice.',
                hidden: true,
              },
            }),
            imageUploadField({
              name: 'logoOnDark',
              admin: {
                description: 'Reserved for a future managed-brand-assets slice.',
                hidden: true,
              },
            }),
            imageUploadField({
              name: 'favicon',
              admin: {
                description: 'Reserved for a future managed-brand-assets slice.',
                hidden: true,
              },
            }),
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
                imageUploadField({
                  name: 'image',
                }),
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
                  hooks: {
                    beforeValidate: [
                      ({ value }) =>
                        normalizeDestinationValue(value, externalHTTPSDestinationPolicy),
                    ],
                  },
                  required: true,
                  validate: (value: unknown) => validateExternalHTTPSURL(value, true),
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
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Trayport Cookie Consent',
                  admin: {
                    condition: (_data, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
                {
                  name: 'message',
                  type: 'textarea',
                  admin: {
                    condition: (_data, siblingData) => Boolean(siblingData?.enabled),
                    description: 'Notice copy before the managed cookie-policy link.',
                  },
                },
                {
                  name: 'policyPage',
                  type: 'relationship',
                  admin: {
                    condition: (_data, siblingData) => Boolean(siblingData?.enabled),
                  },
                  relationTo: 'pages',
                },
                {
                  name: 'policyURL',
                  type: 'text',
                  admin: {
                    condition: (_data, siblingData) => Boolean(siblingData?.enabled),
                    description:
                      'Fallback destination when the policy page is outside the managed content set.',
                  },
                  hooks: {
                    beforeValidate: [
                      ({ value }) =>
                        normalizeDestinationValue(value, internalOrHTTPSDestinationPolicy),
                    ],
                  },
                  validate: validateCookiePolicyURL,
                },
                {
                  name: 'policyLinkLabel',
                  type: 'text',
                  defaultValue: 'Cookie Policy',
                  admin: {
                    condition: (_data, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
                {
                  name: 'acceptLabel',
                  type: 'text',
                  defaultValue: 'Accept All',
                  admin: {
                    condition: (_data, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
                {
                  name: 'rejectLabel',
                  type: 'text',
                  defaultValue: 'Reject All',
                  admin: {
                    condition: (_data, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeOperation: [captureGlobalPublicProjectionIntent],
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
