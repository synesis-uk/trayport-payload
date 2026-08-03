// @vitest-environment node

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
  ])('rejects unsafe or ambiguous input %j', (input) => {
    const normalized = normalizeContentPath(input)

    expect(validateContentPath(normalized as string)).not.toBe(true)
  })

  it('allows an omitted optional path without weakening required paths', () => {
    expect(validateContentPath('', false)).toBe(true)
    expect(validateContentPath('', true)).toBe('A public path is required.')
  })
})
