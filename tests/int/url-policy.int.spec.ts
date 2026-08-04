// @vitest-environment node

import { resolveSafeRedirectDestination } from '@/proxy'
import { resolveContentLink } from '@/routing/contentLink'
import {
  externalHTTPSDestinationPolicy,
  safeDestination,
  safeExternalMediaURL,
  validateDestination,
  validateExternalHTTPSURL,
} from '@/routing/urlPolicy'
import { describe, expect, it } from 'vitest'

describe('managed URL policy', () => {
  it('normalizes the bounded destination vocabulary', () => {
    expect(safeDestination('/company/about-us')).toBe('/company/about-us/')
    expect(safeDestination('#details')).toBe('#details')
    expect(safeDestination('mailto:editor@example.com')).toBe('mailto:editor@example.com')
    expect(safeDestination('tel:+44 20 7960 5500')).toBe('tel:+44 20 7960 5500')
    expect(safeDestination('https://example.com/path')).toBe('https://example.com/path')
  })

  it.each([
    '//example.com/path',
    'http://example.com/path',
    'data:text/html,unsafe',
    'javascript:alert(1)',
    'https://user:secret@example.com/path',
    'https://example.com/a path',
    '/next/unimplemented/',
    '/company/about-us/?draft=true',
  ])('rejects unsafe or noncanonical destinations: %s', (value) => {
    expect(safeDestination(value)).toBeNull()
    expect(validateDestination(value)).toEqual(expect.any(String))
  })

  it('keeps HTTPS-only fields narrower than general managed links', () => {
    expect(safeDestination('https://example.com/', externalHTTPSDestinationPolicy)).toBe(
      'https://example.com/',
    )
    expect(safeDestination('/contact/', externalHTTPSDestinationPolicy)).toBeNull()
    expect(validateExternalHTTPSURL('https://user@example.com/')).toEqual(expect.any(String))
  })

  it('allowlists external media by host, path, and file type', () => {
    expect(
      safeExternalMediaURL(
        'https://cdn.trayport.com/app/uploads/2026/08/market-overview.webp?version=2',
        'image',
      ),
    ).toBe('https://cdn.trayport.com/app/uploads/2026/08/market-overview.webp?version=2')
    expect(
      safeExternalMediaURL('https://cdn.trayport.com/app/uploads/2026/08/overview.mp4', 'video'),
    ).toBe('https://cdn.trayport.com/app/uploads/2026/08/overview.mp4')
    expect(safeExternalMediaURL('https://assets.example.com/app/uploads/overview.mp4')).toBeNull()
    expect(safeExternalMediaURL('https://cdn.trayport.com/private/overview.mp4')).toBeNull()
    expect(safeExternalMediaURL('https://cdn.trayport.com/app/uploads/report.pdf')).toBeNull()
  })

  it('fails closed for draft, unresolved, or slug-only relationship links', () => {
    expect(
      resolveContentLink({
        type: 'reference',
        reference: { relationTo: 'pages', value: { slug: 'unroutable' } as never },
      }).href,
    ).toBe('#')
    expect(
      resolveContentLink({
        type: 'reference',
        reference: {
          relationTo: 'pages',
          value: { _status: 'draft', path: '/draft-page/' },
        },
      }).href,
    ).toBe('#')
    expect(
      resolveContentLink({
        type: 'reference',
        reference: { relationTo: 'pages', value: { path: '/company/about-us/' } },
      }).href,
    ).toBe('/company/about-us/')
  })

  it('rejects malformed, self-referential, and chained runtime redirects', () => {
    const resolve = (destination: unknown, sourcePath = '/source/') =>
      resolveSafeRedirectDestination({
        destination,
        requestURL: 'https://trayport.example/source/',
        routeLookup: (path) =>
          path === '/redirect-target/'
            ? { destination: '/final/', ownerKind: 'redirect', type: '301' }
            : { destination: null, ownerKind: 'content', type: null },
        sourcePath,
      })

    expect(resolve('javascript:alert(1)')).toBeNull()
    expect(resolve('https://user:secret@example.com/')).toBeNull()
    expect(resolve('/source/')).toBeNull()
    expect(resolve('/redirect-target/')).toBeNull()
    expect(resolve('https://trayport.example/admin/')).toBeNull()
    expect(resolve('https://trayport.example/next/preview/')).toBeNull()
    expect(resolve('/safe-target/')?.href).toBe('https://trayport.example/safe-target/')
    expect(resolve('https://external.example/path')?.href).toBe('https://external.example/path')
  })
})
