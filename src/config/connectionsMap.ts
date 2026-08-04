export const CONNECTIONS_MAP_PROVIDER = 'mapbox' as const

export const CONNECTIONS_MAP_MARKER_COLORS = {
  gas: '#f7ea48',
  power: '#ff671f',
} as const

export const CONNECTIONS_MAP_DEFAULT_MARKER_COLOR = '#00c1d5'

export interface ConnectionsMapRuntimeConfig {
  accessToken: string
  provider: typeof CONNECTIONS_MAP_PROVIDER
  styleURL: string
}

export const connectionsMapMarkerColor = (assetClassSlug: string): string =>
  CONNECTIONS_MAP_MARKER_COLORS[
    assetClassSlug.toLowerCase() as keyof typeof CONNECTIONS_MAP_MARKER_COLORS
  ] || CONNECTIONS_MAP_DEFAULT_MARKER_COLOR
