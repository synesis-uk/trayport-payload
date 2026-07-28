import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { ArticleCategories } from './collections/ArticleCategories'
import { Articles } from './collections/Articles'
import { AssetClasses } from './collections/AssetClasses'
import { Hubs } from './collections/Hubs'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Regions } from './collections/Regions'
import { Users } from './collections/Users'
import { Venues } from './collections/Venues'
import { VenueTypes } from './collections/VenueTypes'
import { Footer } from './globals/Footer'
import { Navigation } from './globals/Navigation'
import { SiteSettings } from './globals/SiteSettings'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const smtpPort = Number.parseInt(process.env.SMTP_PORT || '1025', 10)

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, 'database/migrations'),
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: process.env.PAYLOAD_DB_PUSH === 'true',
  }),
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM_ADDRESS || 'no-reply@trayport.local',
        defaultFromName: process.env.SMTP_FROM_NAME || 'Trayport Website',
        skipVerify: process.env.SMTP_SKIP_VERIFY === 'true',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number.isNaN(smtpPort) ? 1025 : smtpPort,
          secure: process.env.SMTP_SECURE === 'true',
        },
      })
    : undefined,
  collections: [
    Pages,
    Articles,
    Hubs,
    Venues,
    Media,
    ArticleCategories,
    AssetClasses,
    VenueTypes,
    Regions,
    Users,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Navigation, Footer, SiteSettings],
  graphQL: {
    disable: true,
  },
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
