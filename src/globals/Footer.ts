import type { GlobalConfig } from 'payload'

import { publicGlobalRead } from '@/access/publicGlobalRead'
import { adminsOrEditors } from '@/access/roles'
import { footerAccentOptions, footerIconOptions } from '@/config/footer'
import { createLegacySourceField } from '@/fields/legacySource'
import { imageUploadField } from '@/fields/mediaUpload'
import { navigationLinkField } from '@/fields/navigationLink'
import { captureGlobalPublicProjectionIntent } from '@/hooks/publicProjection'
import {
  externalHTTPSDestinationPolicy,
  normalizeDestinationValue,
  validateExternalHTTPSURL,
} from '@/routing/urlPolicy'

import { revalidateGlobal } from './hooks/revalidateGlobal'

export const Footer: GlobalConfig = {
  slug: 'footer',
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
      name: 'intro',
      type: 'textarea',
      admin: {
        description: 'Legal disclaimer shown in the footer supporting row.',
      },
    },
    {
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Optional visible column heading.',
          },
        },
        navigationLinkField({
          includeLabel: false,
          name: 'titleLink',
          required: false,
        }),
        {
          name: 'links',
          type: 'array',
          admin: {
            initCollapsed: true,
          },
          fields: [
            navigationLinkField({ includeLabel: true }),
            {
              name: 'icon',
              type: 'select',
              admin: {
                description: 'Bounded semantic Font Awesome icon used before the link label.',
              },
              options: [...footerIconOptions],
            },
            {
              name: 'accent',
              type: 'select',
              defaultValue: 'white',
              options: [...footerAccentOptions],
            },
          ],
          maxRows: 12,
        },
      ],
      maxRows: 5,
    },
    {
      name: 'legalLinks',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [navigationLinkField({ includeLabel: true })],
      maxRows: 8,
    },
    {
      name: 'copyright',
      type: 'text',
      admin: {
        description:
          'Use {year} where the current year should be inserted, for example “© {year} Trayport”.',
      },
    },
    {
      name: 'companyRegistrationText',
      type: 'textarea',
      admin: {
        description: 'Company registration statement shown in the lower footer.',
      },
    },
    {
      name: 'parentCompanyText',
      type: 'textarea',
      admin: {
        description: 'Parent-company statement shown in the lower footer.',
      },
    },
    {
      name: 'certificationMarks',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        imageUploadField({
          name: 'image',
          required: true,
        }),
        {
          name: 'url',
          type: 'text',
          hooks: {
            beforeValidate: [
              ({ value }) => normalizeDestinationValue(value, externalHTTPSDestinationPolicy),
            ],
          },
          validate: (value: string | null | undefined) => validateExternalHTTPSURL(value),
        },
      ],
      maxRows: 6,
    },
    createLegacySourceField(),
  ],
  hooks: {
    beforeOperation: [captureGlobalPublicProjectionIntent],
    afterChange: [revalidateGlobal('footer')],
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
