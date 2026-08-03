import crypto from 'node:crypto'

import type { NormalizedValue } from '../contracts/v1'
import type { LegacyReference, TargetRecord } from './types'

export const asObject = (value: unknown): Record<string, NormalizedValue> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, NormalizedValue>)
    : {}

export const asArray = (value: unknown): NormalizedValue[] => (Array.isArray(value) ? value : [])

export const asString = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : ''

export const asBoolean = (value: unknown): boolean =>
  value === true || value === 1 || value === '1' || value === 'true'

export const referenceId = (value: unknown, ref?: 'post' | 'term' | 'media'): number | null => {
  const object = asObject(value)
  if (typeof object.id !== 'number') {
    return null
  }
  if (ref && object.$ref !== ref) {
    return null
  }
  return object.id
}

export const legacyRef = (
  kind: LegacyReference['$legacyRef'],
  value: unknown,
): LegacyReference | null => {
  const id = typeof value === 'number' ? value : referenceId(value)
  return id && id > 0 ? { $legacyRef: kind, legacyId: id } : null
}

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(canonicalize)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    )
  }
  return value
}

export const contentHash = (value: unknown): string =>
  crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex')

export const finalizeTarget = (
  record: Omit<TargetRecord, 'legacy'> & {
    legacy: Omit<TargetRecord['legacy'], 'contentHash'>
  },
): TargetRecord => ({
  ...record,
  legacy: {
    ...record.legacy,
    contentHash: contentHash(record.data),
  },
})

export const mediaToken = (value: unknown): LegacyReference | null => legacyRef('media', value)

export const sourceURL = (path: string | null): string =>
  new URL(path || '/', 'http://trayport.local').toString()

export const liveSourceURL = (path: string | null): string => {
  if (!path) {
    throw new Error('Cannot build a live-site destination without a WordPress source path.')
  }
  return new URL(path, 'https://www.trayport.com').toString()
}
