import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin } from 'payload'

import { admins, adminsOrEditors } from '@/access/roles'
import { anyone } from '@/access/anyone'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'

const s3StorageEnabled = Boolean(
  process.env.S3_ENDPOINT &&
  process.env.S3_BUCKET &&
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY,
)

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'articles', 'hubs'],
    overrides: {
      access: {
        create: adminsOrEditors,
        delete: admins,
        read: anyone,
        update: adminsOrEditors,
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  s3Storage({
    alwaysInsertFields: true,
    bucket: process.env.S3_BUCKET || 'trayport-media',
    collections: {
      media: true,
    },
    config: {
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      region: process.env.S3_REGION || 'eu-west-2',
    },
    enabled: s3StorageEnabled,
  }),
]
