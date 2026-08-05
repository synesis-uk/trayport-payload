import 'server-only'

import RichText from '@/components/RichText'
import { AppIcon } from '@/components/icons'
import type { MarketDataResult } from '@/data/market-data/types'
import { TrayportMedia } from '@/components/Trayport/TrayportMedia'
import { getConnectionsMapRuntimeConfig } from '@/config/connectionsMap.server'
import { loadMarketCoverageIndex } from '@/data/contentIndexes.server'
import { loadMarketMatrixIndex } from '@/data/marketMatrix.server'
import { filterRegionalMarketMapIndex, regionalMapRelationshipID } from '@/data/regionalMarketMap'
import { loadRegionalMarketMapIndex } from '@/data/regionalMarketMap.server'

import { DynamicMarketMatrixPresentation } from './DynamicMarketMatrixPresentation.client'
import { loadDataChartMarketData } from './dataChartData.server'
import { normalizeMarketMatrixComponent } from './marketMatrixModel'
import { normalizeActions } from './normalizers'
import { RegionalMarketMapPresentation } from './RegionalMarketMapPresentation'
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
  if (block.mode === 'regionalConnectivity') {
    const relationshipIDs = (value: unknown): string[] =>
      (Array.isArray(value) ? value : []).flatMap((item) => regionalMapRelationshipID(item) || [])
    const fullIndex = await loadRegionalMarketMapIndex({ draft })
    const index = filterRegionalMarketMapIndex(fullIndex, {
      assetClassIDs: relationshipIDs(block.assetClasses),
      hubIDs: relationshipIDs(block.includedHubs),
      regionIDs: relationshipIDs(block.regions),
      venueTypeIDs: relationshipIDs(block.venueTypes),
    })
    const defaultAssetClassID = regionalMapRelationshipID(block.defaultAssetClass)
    const markerRadius = Math.min(Math.max(Number(block.markerSize) || 5, 2), 8)
    const rawLineWidth = Number(block.lineWidth)
    const rawLineOpacity = Number(block.lineOpacity)

    return (
      <RegionalMarketMapPresentation
        actions={normalizeActions(block.actions)}
        background={
          block.backgroundMedia ? (
            <TrayportMedia
              background
              composition="content"
              media={block.backgroundMedia}
              showFallbackLink={false}
            />
          ) : undefined
        }
        body={
          block.body ? (
            <RichText className="trayport-richtext" data={block.body} enableGutter={false} />
          ) : undefined
        }
        model={{
          dataDisplay: block.dataDisplay === 'hover' ? 'hover' : 'always',
          defaultAssetClassID,
          height: Math.min(Math.max(Number(block.height) || 600, 320), 800),
          index,
          lineColor: block.lineColor || '#009cde',
          lineOpacity: Number.isFinite(rawLineOpacity)
            ? Math.min(Math.max(rawLineOpacity, 0), 1)
            : 0.5,
          lineWidth: Math.max(
            (Number.isFinite(rawLineWidth) ? Math.min(Math.max(rawLineWidth, 0), 1) : 0.5) * 8,
            1,
          ),
          mapStyle: block.style === 'light' ? 'light' : 'dark',
          markerRadius,
          showAssetClassFilter: block.showAssetClassFilter !== false,
          showLines: block.showLines !== false,
          showMarketData: block.showMarketData === true,
          showSidebar: block.showSidebar !== false,
          title: block.title || 'Explore market connectivity',
          zoomTo: block.zoomTo === 'region' ? 'region' : 'markers',
        }}
        presentation={block.presentation === 'mapOnly' ? 'mapOnly' : 'summary'}
        runtime={getConnectionsMapRuntimeConfig(block.style === 'light' ? 'light' : 'dark')}
      />
    )
  }

  const { hubCount, markers } = await loadMarketCoverageIndex({ draft })
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
    markers,
  })

  return (
    <MarketCoveragePresentation
      mapRuntime={model.markerGroups.length ? getConnectionsMapRuntimeConfig(model.mapStyle) : null}
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

  const managedAssetClass =
    block.assetClass && typeof block.assetClass === 'object' ? block.assetClass : null
  const assetClassKey = managedAssetClass?.marketDataKey?.trim() || null
  const managedAssetClassLegacyID = Number(managedAssetClass?.legacySource?.legacyId)
  const assetClassLegacyID =
    Number.isInteger(managedAssetClassLegacyID) && managedAssetClassLegacyID > 0
      ? managedAssetClassLegacyID
      : Number(block.assetClassLegacyId)
  const managedHubIdentifiers = (values: typeof block.includedHubs | typeof block.excludedHubs) => {
    const keys: string[] = []
    const legacyIDs: number[] = []
    let unresolved = 0

    for (const value of values || []) {
      if (!value || typeof value !== 'object') {
        unresolved += 1
        continue
      }
      const key = value.marketDataKey?.trim()
      const legacyID = Number(value.legacySource?.legacyId)
      if (key) keys.push(key)
      if (Number.isInteger(legacyID) && legacyID > 0) legacyIDs.push(legacyID)
      if (!key && !(Number.isInteger(legacyID) && legacyID > 0)) unresolved += 1
    }

    return { keys, legacyIDs, unresolved }
  }
  const includedHubs = managedHubIdentifiers(block.includedHubs)
  const excludedHubs = managedHubIdentifiers(block.excludedHubs)
  const hasUnresolvedHubRelationship = includedHubs.unresolved > 0 || excludedHubs.unresolved > 0
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
        assetClassKey,
        assetClassLegacyID,
        dataType: block.dataType,
        displayInterval: block.displayInterval,
        excludedHubKeys: excludedHubs.keys,
        excludedHubLegacyIDs: excludedHubs.legacyIDs,
        fromQuarter: Number(block.fromQuarter) || null,
        fromYear: Number(block.fromYear) || null,
        includedHubKeys: includedHubs.keys,
        includedHubLegacyIDs: includedHubs.legacyIDs,
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
