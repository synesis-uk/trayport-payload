const configuredOrigin = process.env.NEXT_PUBLIC_SERVER_URL?.trim()
const vercelHostname = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
const publicOrigin = new URL(
  configuredOrigin || (vercelHostname ? `https://${vercelHostname}` : 'http://localhost:3000'),
)

if (
  !['http:', 'https:'].includes(publicOrigin.protocol) ||
  publicOrigin.username ||
  publicOrigin.password ||
  publicOrigin.pathname !== '/' ||
  publicOrigin.search ||
  publicOrigin.hash
) {
  throw new Error('NEXT_PUBLIC_SERVER_URL must be an absolute HTTP(S) origin without a suffix.')
}

const SITE_URL = publicOrigin.origin

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ['/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/admin/*',
      },
    ],
    additionalSitemaps: [`${SITE_URL}/content-sitemap.xml`],
  },
}
