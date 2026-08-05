import 'server-only'

import { CONNECTIONS_MAP_PROVIDER, type ConnectionsMapRuntimeConfig } from './connectionsMap'

const publicMapboxToken = (value: string | undefined): string | null => {
  const token = value?.trim()
  return token && /^pk\.[A-Za-z0-9._-]+$/.test(token) ? token : null
}

const mapboxStyleURL = (value: string | undefined): string | null => {
  const styleURL = value?.trim()
  if (!styleURL) return null

  try {
    const parsed = new URL(styleURL)
    const hasEmbeddedAuthorityOrMetadata =
      parsed.username !== '' ||
      parsed.password !== '' ||
      parsed.search !== '' ||
      parsed.hash !== '' ||
      parsed.port !== ''
    if (hasEmbeddedAuthorityOrMetadata) return null

    if (
      parsed.protocol === 'mapbox:' &&
      parsed.hostname === 'styles' &&
      /^mapbox:\/\/styles\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(styleURL)
    ) {
      return styleURL
    }

    if (
      parsed.protocol === 'https:' &&
      parsed.hostname === 'api.mapbox.com' &&
      /^https:\/\/api\.mapbox\.com\/styles\/v1\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(styleURL)
    ) {
      return styleURL
    }
  } catch {
    return null
  }

  return null
}

/**
 * Map provider configuration is intentionally application-owned. A missing or
 * invalid value returns the deterministic server-rendered map fallback.
 */
export const getConnectionsMapRuntimeConfig = (
  style: 'dark' | 'light' = 'dark',
): ConnectionsMapRuntimeConfig | null => {
  const accessToken = publicMapboxToken(process.env.MAPBOX_PUBLIC_TOKEN)
  const styleURL = mapboxStyleURL(
    style === 'light'
      ? process.env.MAPBOX_STYLE_LIGHT_URL || process.env.MAPBOX_STYLE_URL
      : process.env.MAPBOX_STYLE_DARK_URL || process.env.MAPBOX_STYLE_URL,
  )

  return accessToken && styleURL
    ? {
        accessToken,
        provider: CONNECTIONS_MAP_PROVIDER,
        styleURL,
      }
    : null
}
