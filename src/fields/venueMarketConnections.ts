import { mergeMarketMatrixConnection, type MarketMatrixConnectionType } from '@/data/marketMatrix'

type UnknownRecord = Record<string, unknown>

const record = (value: unknown): UnknownRecord | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : null

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  const related = record(value)
  return related && (typeof related.id === 'number' || typeof related.id === 'string')
    ? String(related.id)
    : null
}

const connectionType = (value: unknown): MarketMatrixConnectionType | null =>
  value === 'a' || value === 'b' || value === 'd' ? value : null

/**
 * Payload keeps the first row (including its stable row id) and combines any
 * repeated hub capabilities. This preserves the imported source order while
 * ensuring persisted connectivity has one authoritative row per hub.
 */
export const normalizeVenueMarketConnections = (value: unknown): unknown => {
  if (!Array.isArray(value)) return value

  const normalized: unknown[] = []
  const rowIndexes = new Map<string, number>()

  for (const item of value) {
    const row = record(item)
    const hubID = relationshipID(row?.hub)
    const type = connectionType(row?.connectionType)

    if (!row || !hubID || !type) {
      normalized.push(item)
      continue
    }

    const existingIndex = rowIndexes.get(hubID)
    if (existingIndex === undefined) {
      rowIndexes.set(hubID, normalized.length)
      normalized.push(item)
      continue
    }

    const existing = record(normalized[existingIndex])
    const existingType = connectionType(existing?.connectionType)
    if (!existing || !existingType) {
      normalized.push(item)
      continue
    }

    normalized[existingIndex] = {
      ...existing,
      connectionType: mergeMarketMatrixConnection(existingType, type),
    }
  }

  return normalized
}

/** Defence in depth for direct validation and future writes that omit hooks. */
export const validateVenueMarketConnections = (value: unknown): true | string => {
  if (!Array.isArray(value)) return true

  const hubIDs = new Set<string>()
  for (const item of value) {
    const hubID = relationshipID(record(item)?.hub)
    if (!hubID) continue
    if (hubIDs.has(hubID)) {
      return 'Add each market hub once. Repeated capabilities are combined automatically.'
    }
    hubIDs.add(hubID)
  }

  return true
}
