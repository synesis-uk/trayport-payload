import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { s3Storage } from '@payloadcms/storage-s3'
import type { Field, GroupField, Plugin, TextField, TextFieldSingleValidation } from 'payload'

import { admins, adminsOrEditors } from '@/access/roles'
import { anyone } from '@/access/anyone'
import { resolveMediaStorageConfig } from '@/config/mediaStorage'
import { validateContentPath } from '@/fields/contentPath'
import { revalidateDeletedRedirects, revalidateRedirects } from '@/hooks/revalidateRedirects'
import {
  normalizeRedirectSource,
  releaseRedirectRoute,
  syncRedirectRoute,
} from '@/routing/registry'
import {
  internalOrHTTPSDestinationPolicy,
  normalizeDestinationValue,
  validateDestination,
} from '@/routing/urlPolicy'

const mediaStorage = resolveMediaStorageConfig()
const s3Configuration = mediaStorage.s3
const documentSidebarToggle =
  '@/components/AdminEditor/DocumentSidebarToggle.client#DocumentSidebarToggle'

const documentSidebarPlugin: Plugin = (config) => ({
  ...config,
  collections: config.collections?.map((collection) => ({
    ...collection,
    admin: {
      ...collection.admin,
      components: {
        ...collection.admin?.components,
        edit: {
          ...collection.admin?.components?.edit,
          beforeDocumentControls: [
            documentSidebarToggle,
            ...(collection.admin?.components?.edit?.beforeDocumentControls || []),
          ],
        },
      },
    },
  })),
  globals: config.globals?.map((global) => ({
    ...global,
    admin: {
      ...global.admin,
      components: {
        ...global.admin?.components,
        elements: {
          ...global.admin?.components?.elements,
          beforeDocumentControls: [
            documentSidebarToggle,
            ...(global.admin?.components?.elements?.beforeDocumentControls || []),
          ],
        },
      },
    },
  })),
})

const validateRedirectCustomURL: TextFieldSingleValidation = (value, { siblingData }) => {
  const destination = siblingData as { type?: unknown } | undefined
  return destination?.type !== 'custom'
    ? true
    : validateDestination(value, {
        message: 'Use a normalized internal path or complete HTTPS URL without credentials.',
        policy: internalOrHTTPSDestinationPolicy,
        required: true,
      })
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'articles', 'people', 'hubs', 'venues', 'learning-videos'],
    redirectTypeFieldOverride: {
      defaultValue: '301',
    },
    redirectTypes: ['301', '302'],
    overrides: {
      access: {
        create: adminsOrEditors,
        delete: admins,
        read: anyone,
        update: adminsOrEditors,
      },
      hooks: {
        afterChange: [syncRedirectRoute, revalidateRedirects],
        afterDelete: [releaseRedirectRoute, revalidateDeletedRedirects],
        beforeValidate: [normalizeRedirectSource],
      },
      fields: ({ defaultFields }) =>
        defaultFields.map((field): Field => {
          if ('name' in field && field.name === 'from' && field.type === 'text') {
            return {
              ...(field as TextField),
              hasMany: false,
              maxRows: undefined,
              minRows: undefined,
              validate: (value: string | null | undefined) => validateContentPath(value),
            } as TextField
          }

          if ('name' in field && field.name === 'to' && field.type === 'group') {
            const toField = field as GroupField
            return {
              ...toField,
              fields: toField.fields.map((nestedField): Field => {
                if (
                  'name' in nestedField &&
                  nestedField.name === 'url' &&
                  nestedField.type === 'text'
                ) {
                  const urlField = nestedField as TextField
                  return {
                    ...urlField,
                    hasMany: false,
                    hooks: {
                      ...urlField.hooks,
                      beforeValidate: [
                        ...(urlField.hooks?.beforeValidate || []),
                        ({ value }) =>
                          normalizeDestinationValue(value, internalOrHTTPSDestinationPolicy),
                      ],
                    },
                    maxRows: undefined,
                    minRows: undefined,
                    validate: validateRedirectCustomURL,
                  } as TextField
                }

                return nestedField
              }),
            }
          }

          return field
        }),
    },
  }),
  s3Storage({
    alwaysInsertFields: true,
    bucket: s3Configuration?.bucket || 'build-only-disabled-media-storage',
    collections: {
      media: true,
    },
    config: {
      credentials: {
        accessKeyId: s3Configuration?.accessKeyId || 'disabled',
        secretAccessKey: s3Configuration?.secretAccessKey || 'disabled',
      },
      endpoint: s3Configuration?.endpoint,
      forcePathStyle: s3Configuration?.forcePathStyle || false,
      region: s3Configuration?.region || 'eu-west-2',
    },
    enabled: mediaStorage.mode === 's3',
  }),
  documentSidebarPlugin,
]
