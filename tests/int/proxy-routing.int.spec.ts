// @vitest-environment node

import {
  config,
  isRedirectProxyBypassPath,
  redirectProxyCacheContract,
  redirectProxyCacheTag,
  routeRegistryProxyCacheTag,
  routeStatusPreflightContract,
} from '@/proxy'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { describe, expect, it } from 'vitest'

describe('managed redirect proxy routing', () => {
  it('uses one bounded published-route snapshot behind both route invalidation tags', () => {
    expect(redirectProxyCacheContract).toEqual({
      key: ['route-status-proxy', 'published-snapshot', 'v4'],
      lookup: 'bounded-published-route-snapshot',
      pathKeyedEntries: false,
      poolTimeouts: {
        connectionTimeoutMillis: 3_000,
        query_timeout: 5_000,
        statement_timeout: 4_000,
      },
      revalidate: 300,
      tags: ['redirects', 'route-registry'],
    })
    expect(redirectProxyCacheTag).toBe('redirects')
    expect(routeRegistryProxyCacheTag).toBe('route-registry')
  })

  it('marks published-route misses before a streamed not-found body renders', () => {
    expect(routeStatusPreflightContract).toEqual({
      draftCookie: 'trayport-preview-route',
      unknownStatus: 404,
    })
  })

  it.each(['/brand.svg', '/fonts/inter.woff2', '/documents/report.pdf'])(
    'keeps unknown file-like paths in the 404 status preflight: %s',
    (url) => {
      expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(true)
      expect(isRedirectProxyBypassPath(url)).toBe(false)
    },
  )

  it.each([
    '/apiary/',
    '/administrator/',
    '/design-systematic/',
    '/next-generation/',
    '/release/v2.0/',
    '/resources/annual-report.pdf/',
    '/robots.txt/archive/',
    '/favicon.ico/archive/',
    '/learning-hub/watch/trading-in-joule/',
  ])('keeps valid content paths in proxy scope: %s', (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(true)
    expect(isRedirectProxyBypassPath(url)).toBe(false)
  })

  it.each([
    '/design-system/components/',
    '/design-system/definitely-missing/',
    '/next/preview/archive/',
    '/next/definitely-missing/',
    '/_not-found/definitely-missing/',
  ])('keeps unknown reserved-namespace children in 404 preflight scope: %s', (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(true)
    expect(isRedirectProxyBypassPath(url)).toBe(false)
  })

  it.each([
    '/_not-found',
    '/_not-found/',
    '/design-system/',
    '/api',
    '/api/',
    '/api/users/me/',
    '/admin',
    '/admin/',
    '/brand/bg-poly-angle-opacity-02.png',
    '/_next',
    '/_next/static/chunk.js',
    '/_next/image/',
    '/next/preview/',
    '/next/exit-preview/',
    '/next/chart-runtime/',
    '/content-sitemap.xml',
    '/sitemap.xml',
    '/robots.txt',
    '/favicon.ico',
    '/favicon.svg',
    '/website-template-OG.webp',
  ])('bypasses verified framework, application, and static paths: %s', (url) => {
    const excludedByMatcher = /^\/(?:_next|api|admin)(?:\/|$)/.test(url)
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(!excludedByMatcher)
    expect(isRedirectProxyBypassPath(url)).toBe(true)
  })
})
