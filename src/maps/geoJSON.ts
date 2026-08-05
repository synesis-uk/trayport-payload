type UnknownRecord = Record<string, unknown>

export type TrayportPosition = [number, number]

export type TrayportGeoJSONGeometry = {
  coordinates: unknown
  type: 'LineString' | 'MultiLineString' | 'MultiPolygon' | 'Point' | 'Polygon'
}

export type TrayportGeoJSONFeature = {
  geometry: TrayportGeoJSONGeometry
  properties?: UnknownRecord | null
  type: 'Feature'
}

export type TrayportGeoJSON =
  | TrayportGeoJSONFeature
  | {
      features: TrayportGeoJSONFeature[]
      type: 'FeatureCollection'
    }
  | TrayportGeoJSONGeometry

const record = (value: unknown): UnknownRecord | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : null

const position = (value: unknown, longitudeLimit = 180): value is TrayportPosition =>
  Array.isArray(value) &&
  value.length >= 2 &&
  Number.isFinite(Number(value[0])) &&
  Number(value[0]) >= -longitudeLimit &&
  Number(value[0]) <= longitudeLimit &&
  Number.isFinite(Number(value[1])) &&
  Number(value[1]) >= -90 &&
  Number(value[1]) <= 90

const coordinatesValid = (value: unknown, depth = 0, longitudeLimit = 180): boolean => {
  if (depth > 5 || !Array.isArray(value) || value.length === 0) return false
  if (position(value, longitudeLimit)) return true
  return value.every((child) => coordinatesValid(child, depth + 1, longitudeLimit))
}

const allowedGeometryTypes = new Set([
  'LineString',
  'MultiLineString',
  'MultiPolygon',
  'Point',
  'Polygon',
])

const geometry = (
  value: unknown,
  longitudeLimit = 180,
  types: ReadonlySet<string> = allowedGeometryTypes,
): TrayportGeoJSONGeometry | null => {
  const candidate = record(value)
  if (!candidate || !types.has(String(candidate.type))) return null
  if (!coordinatesValid(candidate.coordinates, 0, longitudeLimit)) return null
  return candidate as TrayportGeoJSONGeometry
}

const feature = (
  value: unknown,
  longitudeLimit = 180,
  types: ReadonlySet<string> = allowedGeometryTypes,
): TrayportGeoJSONFeature | null => {
  const candidate = record(value)
  const normalizedGeometry =
    candidate?.type === 'Feature' ? geometry(candidate.geometry, longitudeLimit, types) : null
  return normalizedGeometry
    ? {
        geometry: normalizedGeometry,
        properties: record(candidate?.properties),
        type: 'Feature',
      }
    : null
}

export const normalizeGeoJSON = (
  value: unknown,
  options: { longitudeLimit?: number; types?: ReadonlySet<string> } = {},
): TrayportGeoJSON | null => {
  const longitudeLimit = options.longitudeLimit || 180
  const types = options.types || allowedGeometryTypes
  let candidate = value
  if (typeof value === 'string') {
    try {
      candidate = JSON.parse(value)
    } catch {
      return null
    }
  }

  const directGeometry = geometry(candidate, longitudeLimit, types)
  if (directGeometry) return directGeometry
  const directFeature = feature(candidate, longitudeLimit, types)
  if (directFeature) return directFeature

  const collection = record(candidate)
  if (collection?.type !== 'FeatureCollection' || !Array.isArray(collection.features)) return null
  const features = collection.features.map((item) => feature(item, longitudeLimit, types))
  return features.length > 0 && features.every(Boolean)
    ? { features: features as TrayportGeoJSONFeature[], type: 'FeatureCollection' }
    : null
}

export const validateGeoJSON = (value: unknown): true | string =>
  value === null || value === undefined || value === '' || normalizeGeoJSON(value)
    ? true
    : 'Enter valid GeoJSON with bounded Point, LineString, Polygon, MultiLineString or MultiPolygon coordinates.'

const mapRouteGeometryTypes = new Set(['LineString', 'MultiLineString'])

export const normalizeMapRouteGeoJSON = (value: unknown): TrayportGeoJSON | null =>
  normalizeGeoJSON(value, { longitudeLimit: 540, types: mapRouteGeometryTypes })

export const validateMapRouteGeoJSON = (value: unknown): true | string =>
  value === null || value === undefined || value === '' || normalizeMapRouteGeoJSON(value)
    ? true
    : 'Enter LineString or MultiLineString GeoJSON. Wrapped longitudes are supported for routes crossing the antimeridian.'

export const geoJSONFeatures = (value: TrayportGeoJSON | null | undefined): TrayportGeoJSONFeature[] => {
  if (!value) return []
  if (value.type === 'FeatureCollection') return value.features
  if (value.type === 'Feature') return [value]
  return [{ geometry: value, properties: {}, type: 'Feature' }]
}

export const geoJSONPositions = (value: TrayportGeoJSON | null | undefined): TrayportPosition[] => {
  const positions: TrayportPosition[] = []
  const visit = (candidate: unknown) => {
    if (position(candidate, 540)) {
      positions.push([Number(candidate[0]), Number(candidate[1])])
      return
    }
    if (Array.isArray(candidate)) candidate.forEach(visit)
  }
  for (const item of geoJSONFeatures(value)) visit(item.geometry.coordinates)
  return positions
}
