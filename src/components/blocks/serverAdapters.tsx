import 'server-only'

import RichText from '@/components/RichText'
import { AppIcon } from '@/components/icons'
import type { MarketDataResult } from '@/data/market-data/types'
import { TrayportMedia } from '@/components/Trayport/TrayportMedia'
import { getConnectionsMapRuntimeConfig } from '@/config/connectionsMap.server'
import { loadMarketCoverageIndex } from '@/data/contentIndexes.server'
import { loadMarketMatrixIndex } from '@/data/marketMatrix.server'

import { DynamicMarketMatrixPresentation } from './DynamicMarketMatrixPresentation.client'
import { loadDataChartMarketData } from './dataChartData.server'
import { normalizeMarketMatrixComponent } from './marketMatrixModel'
import {
  normalizeDataChartComponent,
  normalizeMarketCoverageComponent,
  normalizeUnsupportedDataChartComponent,
} from './specialistNormalizers'
import { DataChartPresentation, MarketCoveragePresentation } from './specialistPresentation'
import type {
  TrayportDraftAwareSectionComponentAdapterProps,
  TrayportSectionComponentAdapterProps,
} from './types'

export const MarketCoverageComponentAdapter = async ({
  block,
  draft = false,
}: TrayportDraftAwareSectionComponentAdapterProps<'marketCoverage'>) => {
  const { allMarkers, hubCount } = await loadMarketCoverageIndex({ draft })
  const model = normalizeMarketCoverageComponent(block, {
    background: block.backgroundMedia ? (
      <TrayportMedia
        background
        composition="content"
        media={block.backgroundMedia}
        showFallbackLink={false}
      />
    ) : undefined,
    body: block.body ? (
      <RichText className="trayport-richtext" data={block.body} enableGutter={false} />
    ) : undefined,
    hubCount,
    markers: allMarkers,
  })

  return (
    <MarketCoveragePresentation
      mapRuntime={
        model.presentation === 'mapOnly' && model.mapStyle === 'dark'
          ? getConnectionsMapRuntimeConfig()
          : null
      }
      model={model}
    />
  )
}

export const DataChartComponentAdapter = async ({
  block,
}: TrayportSectionComponentAdapterProps<'dataChart'>) => {
  const isSupportedPresentation =
    (block.seriesDimension === 'executionType' &&
      block.dataType === 'volume' &&
      block.chartType === 'stackedColumn') ||
    (block.seriesDimension === 'hub' &&
      block.dataType === 'volume' &&
      block.chartType === 'column') ||
    (block.seriesDimension === 'hub' && block.dataType === 'price' && block.chartType === 'line')

  if (!isSupportedPresentation) {
    return <DataChartPresentation model={normalizeUnsupportedDataChartComponent(block)} />
  }

  const assetClassLegacyID =
    typeof block.assetClass === 'object'
      ? Number(block.assetClass.legacySource?.legacyId)
      : Number(block.assetClassLegacyId)
  const managedHubLegacyIDs = (values: typeof block.includedHubs | typeof block.excludedHubs) =>
    (values || []).flatMap((value) => {
      if (!value || typeof value !== 'object') return []
      const legacyID = Number(value.legacySource?.legacyId)
      return Number.isInteger(legacyID) && legacyID > 0 ? [legacyID] : []
    })
  const includedHubLegacyIDs = managedHubLegacyIDs(block.includedHubs)
  const excludedHubLegacyIDs = managedHubLegacyIDs(block.excludedHubs)
  const hasUnresolvedHubRelationship =
    includedHubLegacyIDs.length !== (block.includedHubs || []).length ||
    excludedHubLegacyIDs.length !== (block.excludedHubs || []).length
  const unavailableResult: MarketDataResult = {
    categories: [],
    dataType: block.dataType,
    displayInterval: block.displayInterval,
    series: [],
    seriesDimension: block.seriesDimension,
    status: 'unavailable',
  }
  const result = hasUnresolvedHubRelationship
    ? unavailableResult
    : await loadDataChartMarketData({
        assetClassLegacyID,
        dataType: block.dataType,
        displayInterval: block.displayInterval,
        excludedHubLegacyIDs,
        fromQuarter: Number(block.fromQuarter) || null,
        fromYear: Number(block.fromYear) || null,
        includedHubLegacyIDs,
        limit: 40,
        seriesDimension: block.seriesDimension,
        toQuarter: Number(block.toQuarter) || null,
        toYear: Number(block.toYear) || null,
      })

  return <DataChartPresentation model={normalizeDataChartComponent(block, result)} />
}

export const MarketMatrixComponentAdapter = async ({
  block,
  draft = false,
}: TrayportDraftAwareSectionComponentAdapterProps<'marketMatrix'>) => {
  const index = await loadMarketMatrixIndex({ draft })

  return (
    <DynamicMarketMatrixPresentation
      downloadIcon={<AppIcon aria-hidden name="csvFile" />}
      model={normalizeMarketMatrixComponent(block, index)}
    />
  )
}
