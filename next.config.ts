import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { redirects } from './redirects'
import { resolvePublicOrigin } from './src/config/publicOrigin'
import { publicResponseSecurityHeaders } from './src/config/securityHeaders'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const publicOrigin = new URL(resolvePublicOrigin())

const nextConfig: NextConfig = {
  // The local review server is reached over the LAN rather than on `localhost`, and Next
  // refuses cross-origin development asset requests unless the origin is listed here. Without
  // it the client chunks are answered with HTML, the map islands never hydrate, and every map
  // silently shows its static fallback. Development-only; production serves assets statically.
  allowedDevOrigins: (process.env.DEV_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  cacheComponents: true,
  experimental: {
    globalNotFound: true,
  },
  output: 'standalone',
  outputFileTracingIncludes: {
    '/next/chart-runtime': [
      './node_modules/highcharts/highcharts.js',
      './node_modules/highcharts/modules/accessibility.js',
    ],
  },
  trailingSlash: true,
  // Temporarily required on Windows until Next.js fixes Turbopack Sass resolution.
  // See: https://github.com/vercel/next.js/issues/86431
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    qualities: [82, 90, 100],
    remotePatterns: [
      {
        hostname: 'cdn.trayport.com',
        pathname: '/app/uploads/**',
        protocol: 'https',
      },
      {
        hostname: publicOrigin.hostname,
        port: publicOrigin.port,
        protocol: publicOrigin.protocol.replace(':', '') as 'http' | 'https',
      },
    ],
  },
  headers: async () => [
    {
      headers: publicResponseSecurityHeaders.map((header) => ({ ...header })),
      source: '/:path*',
    },
  ],
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
