const applicationFirstSegments = new Set([
  '_next',
  '_not-found',
  'admin',
  'api',
  'brand',
  'design-system',
  'next',
])

const applicationExactPaths = new Set([
  '/content-sitemap.xml',
  '/favicon.ico',
  '/favicon.svg',
  '/robots.txt',
  '/sitemap.xml',
  '/website-template-og.webp',
])

const proxyBypassFirstSegments = new Set(['_next', 'admin', 'api', 'brand'])

const proxyBypassExactPaths = new Set([
  ...applicationExactPaths,
  '/_not-found',
  '/design-system',
  '/next/chart-runtime',
  '/next/exit-preview',
  '/next/preview',
])

const withoutTrailingSlash = (pathname: string): string =>
  pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname

/**
 * Paths owned by Next.js, Payload, or a checked-in public asset cannot be
 * claimed by CMS content or managed redirects.
 */
export const isReservedApplicationPath = (pathname: string): boolean => {
  const normalized = withoutTrailingSlash(pathname).toLowerCase()
  const firstSegment = normalized.split('/')[1]

  return applicationExactPaths.has(normalized) || applicationFirstSegments.has(firstSegment)
}

/**
 * Only routes that are actually implemented bypass the public-route status
 * preflight. The broader reserved namespace above prevents CMS collisions but
 * must not turn unknown application-looking URLs into streamed HTTP 200s.
 */
export const isApplicationProxyBypassPath = (pathname: string): boolean => {
  const normalized = withoutTrailingSlash(pathname).toLowerCase()
  const firstSegment = normalized.split('/')[1]

  return proxyBypassExactPaths.has(normalized) || proxyBypassFirstSegments.has(firstSegment)
}

export const reservedApplicationPathMessage =
  'This path is reserved for an application route or public asset.'

export const reservedApplicationPathsContract = {
  exactPaths: [...applicationExactPaths],
  firstSegments: [...applicationFirstSegments],
} as const

export const applicationProxyBypassContract = {
  exactPaths: [...proxyBypassExactPaths],
  firstSegments: [...proxyBypassFirstSegments],
} as const
