// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { resolvePublicOrigin } from '@/config/publicOrigin'

describe('public origin configuration', () => {
  it('uses the explicit public origin before platform discovery and removes a root slash', () => {
    expect(
      resolvePublicOrigin({
        NEXT_PUBLIC_SERVER_URL: ' https://www.trayport.com/ ',
        VERCEL_PROJECT_PRODUCTION_URL: 'preview.vercel.app',
      }),
    ).toBe('https://www.trayport.com')
  })

  it('normalizes a Vercel hostname and provides a local development default', () => {
    expect(resolvePublicOrigin({ VERCEL_PROJECT_PRODUCTION_URL: 'trayport.vercel.app' })).toBe(
      'https://trayport.vercel.app',
    )
    expect(resolvePublicOrigin({})).toBe('http://localhost:3000')
  })

  it.each([
    'trayport.example.com',
    'ftp://trayport.example.com',
    'https://user:secret@trayport.example.com',
    'https://trayport.example.com/website/',
    'https://trayport.example.com/?preview=true',
    'https://trayport.example.com/#content',
  ])('rejects a non-origin public URL: %s', (value) => {
    expect(() => resolvePublicOrigin({ NEXT_PUBLIC_SERVER_URL: value })).toThrow(
      /Invalid public origin configuration/,
    )
  })
})
