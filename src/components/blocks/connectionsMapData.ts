export interface ConnectionsMapPoint {
  key: string
  latitude: number
  longitude: number
  title: string
}

export interface ConnectionsMapGroup {
  color: string
  key: string
  points: ConnectionsMapPoint[]
  slug: string
  title: string
}

export interface ConnectionsMapLineFeature {
  geometry: {
    coordinates: [[number, number], [number, number]]
    type: 'LineString'
  }
  properties: Record<string, never>
  type: 'Feature'
}

export const pairwiseConnectionCount = (pointCount: number): number =>
  pointCount > 1 ? (pointCount * (pointCount - 1)) / 2 : 0

export const buildPairwiseConnectionFeatures = (
  points: readonly ConnectionsMapPoint[],
): ConnectionsMapLineFeature[] => {
  const features: ConnectionsMapLineFeature[] = []

  for (let sourceIndex = 0; sourceIndex < points.length; sourceIndex += 1) {
    for (let targetIndex = sourceIndex + 1; targetIndex < points.length; targetIndex += 1) {
      const source = points[sourceIndex]
      const target = points[targetIndex]
      if (!source || !target) continue

      features.push({
        geometry: {
          coordinates: [
            [source.longitude, source.latitude],
            [target.longitude, target.latitude],
          ],
          type: 'LineString',
        },
        properties: {},
        type: 'Feature',
      })
    }
  }

  return features
}

export const connectionsMapLineCount = (groups: readonly ConnectionsMapGroup[]): number =>
  groups.reduce((total, group) => total + pairwiseConnectionCount(group.points.length), 0)
