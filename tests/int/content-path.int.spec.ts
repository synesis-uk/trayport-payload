// @vitest-environment node

import { CACHE_TAG_ITEM_LIMIT, CACHE_TAG_MAX_LENGTH, contentRouteCacheTag } from '@/data/cacheTags'
import { normalizeContentPath, validateContentPath } from '@/fields/contentPath'
import { describe, expect, it } from 'vitest'

describe('canonical content paths', () => {
  it.each([
    ['  /company//about-us?campaign=test#team  ', '/company/about-us/'],
    ['/caf%C3%A9/', '/café/'],
    ['company/about-us', '/company/about-us/'],
    ['/', '/'],
  ])('normalizes %j to %j', (input, expected) => {
    expect(normalizeContentPath(input)).toBe(expected)
    expect(validateContentPath(normalizeContentPath(input) as string)).toBe(true)
  })

  it.each([
    'https://trayport.com/company/about-us/',
    '//trayport.com/company/about-us/',
    '/https://trayport.com/company/about-us/',
    '/company/../admin/',
    '/company/./about-us/',
    '/company/%2e%2e/admin/',
    '/company%2Fabout-us/',
    '/company%5Cabout-us/',
    '/company\\about-us/',
    '/company/about us/',
    '/company/about%20us/',
    '/company/\u0000about-us/',
    '/company/%00about-us/',
    '/company/%not-an-escape/',
    '/_next/static/managed-content/',
    '/admin/editorial-page/',
    '/api/public-page/',
    '/brand/bg-poly-angle-opacity-02.png',
    '/design-system/components/',
    '/next/chart-runtime/',
    '/favicon.svg/',
  ])('rejects unsafe or ambiguous input %j', (input) => {
    const normalized = normalizeContentPath(input)

    expect(validateContentPath(normalized as string)).not.toBe(true)
  })

  it.each(['/next-generation/', '/apiary/', '/administrator/', '/resources/report.pdf/'])(
    'does not reserve merely similar content paths %j',
    (input) => {
      expect(validateContentPath(normalizeContentPath(input) as string)).toBe(true)
    },
  )

  it('allows an omitted optional path without weakening required paths', () => {
    expect(validateContentPath('', false)).toBe(true)
    expect(validateContentPath('', true)).toBe('A public path is required.')
  })

  it('builds deterministic bounded cache tags from normalized paths', () => {
    const oversizedPath = `/${'long-segment/'.repeat(80)}`
    const canonicalTag = contentRouteCacheTag(oversizedPath)

    expect(canonicalTag).toMatch(/^content-route:v1:[a-f\d]{64}$/)
    expect(CACHE_TAG_MAX_LENGTH).toBe(256)
    expect(canonicalTag.length).toBeLessThanOrEqual(CACHE_TAG_MAX_LENGTH)
    expect(CACHE_TAG_ITEM_LIMIT).toBe(128)
    expect(contentRouteCacheTag(`  ${oversizedPath}?campaign=test#section  `)).toBe(canonicalTag)
    expect(contentRouteCacheTag(`${oversizedPath}different/`)).not.toBe(canonicalTag)
  })
})
