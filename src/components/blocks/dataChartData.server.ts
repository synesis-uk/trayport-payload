import 'server-only'

import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'

import {
  loadMarketData,
  MARKET_DATA_CACHE_LIFE,
  type MarketDataQuery,
  type MarketDataResult,
} from '@/data/market-data/loadMarketData.server'
import { cacheDependencyCollectionTag, cacheDependencyTag } from '@/data/cacheTags'

const marketHubLabelSelect = {
  legacySource: true,
  title: true,
} as const

const marketHubKeyLabelSelect = {
  marketDataKey: true,
  title: true,
} as const

const queryManagedMarketHubLabels = async (
  legacyIDs: number[],
): Promise<Record<number, string>> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'hubs',
    depth: 0,
    draft: false,
    limit: legacyIDs.length,
    overrideAccess: false,
    pagination: false,
    select: marketHubLabelSelect,
    where: {
      and: [{ _status: { equals: 'published' } }, { 'legacySource.legacyId': { in: legacyIDs } }],
    },
  })

  cacheTag(cacheDependencyCollectionTag('hubs'))
  for (const hub of result.docs) cacheTag(cacheDependencyTag('hubs', hub.id))

  return Object.fromEntries(
    result.docs.flatMap((hub) => {
      const legacyID = Number(hub.legacySource?.legacyId)
      return Number.isInteger(legacyID) && legacyID > 0 ? [[legacyID, hub.title]] : []
    }),
  )
}

const getCachedManagedMarketHubLabels = async (
  legacyIDs: number[],
): Promise<Record<number, string>> => {
  'use cache'

  cacheLife(MARKET_DATA_CACHE_LIFE)
  return queryManagedMarketHubLabels(legacyIDs)
}

const queryManagedMarketHubKeyLabels = async (keys: string[]): Promise<Record<string, string>> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'hubs',
    depth: 0,
    draft: false,
    limit: keys.length,
    overrideAccess: false,
    pagination: false,
    select: marketHubKeyLabelSelect as never,
    where: {
      and: [{ _status: { equals: 'published' } }, { marketDataKey: { in: keys } }],
    },
  })

  const docs = result.docs as unknown as Array<{
    id: number | string
    marketDataKey?: unknown
    title?: unknown
  }>
  cacheTag(cacheDependencyCollectionTag('hubs'))
  for (const hub of docs) cacheTag(cacheDependencyTag('hubs', hub.id))

  return Object.fromEntries(
    docs.flatMap((hub) => {
      const key = typeof hub.marketDataKey === 'string' ? hub.marketDataKey.trim() : ''
      return key && typeof hub.title === 'string' ? [[key, hub.title]] : []
    }),
  )
}

const getCachedManagedMarketHubKeyLabels = async (
  keys: string[],
): Promise<Record<string, string>> => {
  'use cache'

  cacheLife(MARKET_DATA_CACHE_LIFE)
  return queryManagedMarketHubKeyLabels(keys)
}

const hubLegacyIDFromSeriesKey = (key: string): number | null => {
  const match = /^hub:(\d+)$/u.exec(key)
  if (!match) return null
  const legacyID = Number(match[1])
  return Number.isInteger(legacyID) && legacyID > 0 ? legacyID : null
}

const hubKeyFromSeriesKey = (key: string): string | null => {
  const match = /^hub-key:(.+)$/u.exec(key)
  if (!match) return null
  try {
    return decodeURIComponent(match[1]!).trim() || null
  } catch {
    return null
  }
}

const unavailableResult = (result: MarketDataResult): MarketDataResult => ({
  ...result,
  categories: [],
  series: [],
  status: 'unavailable',
})

export const loadDataChartMarketData = async (
  query: MarketDataQuery,
): Promise<MarketDataResult> => {
  const result = await loadMarketData(query)
  if (result.status !== 'available' || result.seriesDimension !== 'hub') return result

  const stableKeys = result.series
    .map(({ key }) => hubKeyFromSeriesKey(key))
    .filter((key): key is string => key !== null)
  if (stableKeys.length === result.series.length) {
    try {
      const labels = await getCachedManagedMarketHubKeyLabels(stableKeys)
      const missingKeys = stableKeys.filter((key) => !labels[key])
      if (missingKeys.length) {
        console.warn('Managed market hub labels are unavailable.', { missingKeys })
        return unavailableResult(result)
      }

      return {
        ...result,
        series: result.series.map((series) => {
          const key = hubKeyFromSeriesKey(series.key)
          return { ...series, label: key ? labels[key] : undefined }
        }),
      }
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unknown'
      console.warn('Managed market hub labels are unavailable.', { code, stableKeys })
      return unavailableResult(result)
    }
  }

  const legacyIDs = result.series
    .map(({ key }) => hubLegacyIDFromSeriesKey(key))
    .filter((legacyID): legacyID is number => legacyID !== null)
  if (legacyIDs.length !== result.series.length) {
    console.warn('Market data returned an invalid hub series key.', {
      seriesKeys: result.series.map(({ key }) => key),
    })
    return unavailableResult(result)
  }

  try {
    const labels = await getCachedManagedMarketHubLabels(legacyIDs)
    const missingLegacyIDs = legacyIDs.filter((legacyID) => !labels[legacyID])
    if (missingLegacyIDs.length) {
      console.warn('Managed market hub labels are unavailable.', { missingLegacyIDs })
      return unavailableResult(result)
    }

    return {
      ...result,
      series: result.series.map((series) => {
        const legacyID = hubLegacyIDFromSeriesKey(series.key)
        return { ...series, label: legacyID ? labels[legacyID] : undefined }
      }),
    }
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unknown'
    console.warn('Managed market hub labels are unavailable.', { code, legacyIDs })
    return unavailableResult(result)
  }
}

export const marketDataHubLabelContract = {
  cacheLife: MARKET_DATA_CACHE_LIFE,
  dependencyCollection: 'hubs',
  failureMode: 'unavailable-result',
  source: 'managed-payload-hubs',
} as const
