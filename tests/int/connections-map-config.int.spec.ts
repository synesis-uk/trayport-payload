// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getConnectionsMapRuntimeConfig } from '@/config/connectionsMap.server'

// The repository `.env` is loaded into `process.env` by `vitest.setup.ts`, and a
// configured deployment sets the split dark/light styles. `getConnectionsMapRuntimeConfig`
// resolves `MAPBOX_STYLE_DARK_URL || MAPBOX_STYLE_URL`, so an ambient dark style would
// shadow every style URL these cases assign. Every variable the module reads is therefore
// captured, cleared before each case, and restored afterwards.
const READ_VARIABLES = [
  'MAPBOX_PUBLIC_TOKEN',
  'MAPBOX_STYLE_URL',
  'MAPBOX_STYLE_DARK_URL',
  'MAPBOX_STYLE_LIGHT_URL',
] as const

const originalValues = new Map(READ_VARIABLES.map((name) => [name, process.env[name]]))

beforeEach(() => {
  for (const name of READ_VARIABLES) delete process.env[name]
})

afterEach(() => {
  for (const name of READ_VARIABLES) {
    const original = originalValues.get(name)
    if (original === undefined) delete process.env[name]
    else process.env[name] = original
  }
})

describe('connections map runtime configuration', () => {
  it('returns no client runtime when either required value is absent or invalid', () => {
    delete process.env.MAPBOX_PUBLIC_TOKEN
    process.env.MAPBOX_STYLE_URL = 'mapbox://styles/example/reference'
    expect(getConnectionsMapRuntimeConfig()).toBeNull()

    process.env.MAPBOX_PUBLIC_TOKEN = 'not-a-public-token'
    expect(getConnectionsMapRuntimeConfig()).toBeNull()

    process.env.MAPBOX_PUBLIC_TOKEN = 'pk.valid-example'
    process.env.MAPBOX_STYLE_URL = 'javascript:alert(1)'
    expect(getConnectionsMapRuntimeConfig()).toBeNull()
  })

  it.each([
    'sk.secret-token',
    'pk.',
    'pk.valid/token',
    'pk.valid?access_token=sk.secret',
    'pk.valid token',
  ])('rejects a non-public or malformed access token: %s', (token) => {
    process.env.MAPBOX_PUBLIC_TOKEN = token
    process.env.MAPBOX_STYLE_URL = 'mapbox://styles/example/reference'

    expect(getConnectionsMapRuntimeConfig()).toBeNull()
  })

  it.each([
    'mapbox://styles/example/reference?access_token=sk.secret',
    'mapbox://styles/example/reference#fragment',
    'mapbox://styles/example/reference/',
    'mapbox://styles/example',
    'mapbox://styles/example/reference/extra',
    'https://user:password@api.mapbox.com/styles/v1/example/reference',
    'https://api.mapbox.com/styles/v1/example/reference?access_token=sk.secret',
    'https://api.mapbox.com/styles/v1/example/reference#fragment',
    'https://api.mapbox.com:443/styles/v1/example/reference',
    'https://api.mapbox.com/styles/v1/example/reference/',
    'https://api.mapbox.com/styles/v1/example',
    'https://api.mapbox.com/styles/v1/example/reference/extra',
    'https://api.mapbox.com/style/v1/example/reference',
    'https://example.com/styles/v1/example/reference',
  ])('rejects a credential-bearing or non-canonical style URL: %s', (styleURL) => {
    process.env.MAPBOX_PUBLIC_TOKEN = 'pk.valid-example'
    process.env.MAPBOX_STYLE_URL = styleURL

    expect(getConnectionsMapRuntimeConfig()).toBeNull()
  })

  it('accepts an application-owned public token and Mapbox style URL', () => {
    process.env.MAPBOX_PUBLIC_TOKEN = 'pk.valid-example'
    process.env.MAPBOX_STYLE_URL = 'mapbox://styles/example/reference'

    expect(getConnectionsMapRuntimeConfig()).toEqual({
      accessToken: 'pk.valid-example',
      provider: 'mapbox',
      styleURL: 'mapbox://styles/example/reference',
    })
  })

  it('accepts the exact HTTPS Mapbox style endpoint shape', () => {
    process.env.MAPBOX_PUBLIC_TOKEN = 'pk.valid-example'
    process.env.MAPBOX_STYLE_URL = 'https://api.mapbox.com/styles/v1/example/reference'

    expect(getConnectionsMapRuntimeConfig()).toEqual({
      accessToken: 'pk.valid-example',
      provider: 'mapbox',
      styleURL: 'https://api.mapbox.com/styles/v1/example/reference',
    })
  })
})
