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

const hubLegacyIDFromSeriesKey = (key: string): number | null => {
  const match = /^hub:(\d+)$/u.exec(key)
  if (!match) return null
  const legacyID = Number(match[1])
  return Number.isInteger(legacyID) && legacyID > 0 ? legacyID : null
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
