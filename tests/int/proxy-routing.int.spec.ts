// @vitest-environment node

import { config, isRedirectProxyBypassPath } from '@/proxy'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { describe, expect, it } from 'vitest'

describe('managed redirect proxy routing', () => {
  it.each([
    '/apiary/',
    '/administrator/',
    '/next-generation/',
    '/release/v2.0/',
    '/learning-hub/watch/trading-in-joule/',
  ])('keeps valid content paths in proxy scope: %s', (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(true)
    expect(isRedirectProxyBypassPath(url)).toBe(false)
  })

  it.each([
    '/api/',
    '/api/users/me/',
    '/admin/',
    '/_next/static/chunk.js',
    '/next/preview/',
    '/content-sitemap.xml',
    '/sitemap.xml',
    '/robots.txt',
    '/favicon.ico',
  ])('bypasses only exact reserved route segments or files: %s', (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(true)
    expect(isRedirectProxyBypassPath(url)).toBe(true)
  })
})
