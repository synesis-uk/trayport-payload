import { useId } from 'react'
import type { AnchorHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react'

import { AppIcon } from '@/components/icons'
import { MarketVolumeChart } from '@/components/Trayport/MarketVolumeChart.client'
import type { ConnectionsMapRuntimeConfig } from '@/config/connectionsMap'
import { cn } from '@/utilities/ui'

import type { ConnectionsMapGroup } from './connectionsMapData'
import { DynamicConnectionsMap } from './DynamicConnectionsMap.client'
import { ActionsPresentation, type ActionPresentationModel } from './presentation'

export interface DividerPresentationModel {
  style: 'line' | 'space'
}

export interface DividerPresentationProps extends HTMLAttributes<HTMLElement> {
  model: DividerPresentationModel
}

export function DividerPresentation({ className, model, ...props }: DividerPresentationProps) {
  return model.style === 'space' ? (
    <div aria-hidden className={cn('trayport-spacer', className)} {...props} />
  ) : (
    <hr className={cn('trayport-divider', className)} {...props} />
  )
}

export interface EmbedPresentationModel {
  title: string
  url?: string
}

export interface EmbedPresentationProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  model: EmbedPresentationModel
}

export function EmbedPresentation({ className, model, ...props }: EmbedPresentationProps) {
  if (!model.url) {
    return (
      <span className={cn('trayport-embed', className)} data-invalid-destination>
        <span>{model.title}</span>
      </span>
    )
  }

  return (
    <a className={cn('trayport-embed', className)} href={model.url} {...props}>
      <span>{model.title}</span>
      <AppIcon aria-hidden className="size-[18px]" name="arrowRight" />
    </a>
  )
}

export interface CoveragePoint {
  key: string
  latitude: number
  longitude: number
  title: string
}

export interface MarketCoveragePresentationModel {
  actions: ActionPresentationModel[]
  background?: ReactNode
  body?: ReactNode
  hubCount: number
  importedLocationCount: number
  lineColor: string
  lineOpacity: number
  lineWidth: number
  mapHeight: number
  mapStyle: 'dark' | 'light'
  markerGroups: ConnectionsMapGroup[]
  markerRadius: number
  markers: CoveragePoint[]
  presentation: 'mapOnly' | 'summary'
  regionAnchors: CoveragePoint[]
  regions: Array<{ key: string; label: string }>
  runtimeLineWidth: number
  showLines: boolean
  title: string
}

const mapX = (longitude: number) => ((longitude + 180) / 360) * 1000
const mapY = (latitude: number) => ((90 - latitude) / 180) * 562
const routeColors = ['#00c1d5', '#f7ea48', '#ff6021'] as const

export interface MarketCoveragePresentationProps extends HTMLAttributes<HTMLDivElement> {
  mapRuntime?: ConnectionsMapRuntimeConfig | null
  model: MarketCoveragePresentationModel
}

export function MarketCoveragePresentation({
  className,
  mapRuntime,
  model,
  ...props
}: MarketCoveragePresentationProps) {
  const accessibilityID = useId()
  const mapTitleID = `trayport-coverage-map-title-${accessibilityID}`
  const mapDescriptionID = `trayport-coverage-map-description-${accessibilityID}`
  const routeOrigin =
    model.regionAnchors.find(({ title }) => title.toLowerCase().includes('europe')) ||
    model.regionAnchors[0]

  const map = (
    <figure
      className="trayport-coverage-map"
      data-map-error="false"
      data-map-ready="false"
      data-map-style={model.mapStyle}
      style={
        {
          '--trayport-map-height': `${model.mapHeight}px`,
          '--trayport-map-line-color': model.lineColor,
          '--trayport-map-line-opacity': model.lineOpacity,
          '--trayport-map-line-width': model.lineWidth,
        } as CSSProperties
      }
    >
      {model.background ? (
        <div aria-hidden className="trayport-coverage-map__media">
          {model.background}
        </div>
      ) : null}
      <svg aria-labelledby={`${mapTitleID} ${mapDescriptionID}`} role="img" viewBox="0 0 1000 562">
        <title id={mapTitleID}>Trayport market connectivity locations</title>
        <desc id={mapDescriptionID}>
          Regional connectivity overview for{' '}
          {model.regionAnchors.map(({ title }) => title).join(', ')}.
        </desc>
        <rect className="trayport-coverage-map__field" height="562" rx="8" width="1000" />
        {model.showLines && routeOrigin
          ? model.regionAnchors
              .filter((region) => region !== routeOrigin)
              .map((region, index) => {
                const originX = mapX(routeOrigin.longitude)
                const originY = mapY(routeOrigin.latitude)
                const targetX = mapX(region.longitude)
                const targetY = mapY(region.latitude)
                const controlY = Math.min(originY, targetY) - Math.abs(targetX - originX) * 0.2

                return (
                  <path
                    className="trayport-coverage-map__route"
                    d={`M ${originX} ${originY} Q ${(originX + targetX) / 2} ${controlY} ${targetX} ${targetY}`}
                    key={`${routeOrigin.key}-${region.key}`}
                    style={{
                      stroke:
                        routeColors[index % routeColors.length] === '#00c1d5'
                          ? model.lineColor
                          : routeColors[index % routeColors.length],
                    }}
                  />
                )
              })
          : null}
        {model.markers.map((marker) => (
          <circle
            className="trayport-coverage-map__marker"
            cx={mapX(marker.longitude)}
            cy={mapY(marker.latitude)}
            key={marker.key}
            r={model.markerRadius}
          >
            <title>{marker.title}</title>
          </circle>
        ))}
      </svg>
      {mapRuntime && model.markerGroups.length ? (
        <DynamicConnectionsMap
          groups={model.markerGroups}
          lineColor={model.lineColor}
          lineOpacity={model.lineOpacity}
          lineWidth={model.runtimeLineWidth}
          markerRadius={model.markerRadius}
          runtime={mapRuntime}
          showLines={model.showLines}
        />
      ) : null}
      {model.markerGroups.length ? (
        <ul className="sr-only" data-map-marker-list>
          {model.markerGroups.flatMap((group) =>
            group.points.map((marker) => (
              <li key={`${group.key}:${marker.key}`}>
                {group.title}: {marker.title}
              </li>
            )),
          )}
        </ul>
      ) : null}
      <figcaption className={model.presentation === 'mapOnly' ? 'sr-only' : undefined}>
        {model.regionAnchors.length} connected regions shown from managed content.
      </figcaption>
    </figure>
  )

  if (model.presentation === 'mapOnly') {
    return (
      <div
        className={cn('trayport-market-coverage trayport-market-coverage--map-only', className)}
        {...props}
      >
        {map}
      </div>
    )
  }

  return (
    <div className={cn('trayport-market-coverage', className)} {...props}>
      <div className="trayport-market-coverage__copy">
        <p className="trayport-eyebrow">Market coverage</p>
        <h3>{model.title}</h3>
        {model.body}
        <p className="trayport-market-coverage__summary">
          {model.hubCount} market hubs and {model.importedLocationCount} imported locations are
          represented in this schematic view.
        </p>
        {model.regions.length ? (
          <ul className="trayport-market-coverage__regions">
            {model.regions.map((region) => (
              <li key={region.key}>{region.label}</li>
            ))}
          </ul>
        ) : null}
        <ActionsPresentation model={{ actions: model.actions }} />
      </div>

      {map}
    </div>
  )
}

export interface DataChartPresentationSeries {
  key: string
  label: string
  values: Array<number | null>
}

export interface DataChartPresentationModel {
  accessibleSummary?: string
  assetClassLegacyID: number
  axisLabel: string
  categories: string[]
  dataStatus: 'available' | 'empty' | 'unavailable' | 'unsupported'
  dataType: 'price' | 'volume'
  displayInterval: 'month' | 'quarter' | 'year'
  height: number
  series: DataChartPresentationSeries[]
  seriesDimension: 'executionType' | 'hub'
  showAxes: boolean
  showDataTable: boolean
  showLegend: boolean
  showValues: boolean
  title: string
  unit: string
}

const preciseMarketValue = new Intl.NumberFormat('en-GB', {
  maximumFractionDigits: 2,
})

export interface DataChartPresentationProps extends HTMLAttributes<HTMLElement> {
  model: DataChartPresentationModel
}

export function DataChartPresentation({ className, model, ...props }: DataChartPresentationProps) {
  const accessibilityID = useId()
  const headingID = `market-chart-${model.assetClassLegacyID}-${accessibilityID}`
  const hasData =
    model.dataStatus === 'available' && model.categories.length > 0 && model.series.length > 0

  return (
    <section
      aria-labelledby={headingID}
      className={cn('trayport-chart', className)}
      data-market-data-status={model.dataStatus}
      {...props}
    >
      <div className="trayport-chart__header">
        <div>
          <h3 id={headingID}>{model.title}</h3>
          {model.accessibleSummary ? <p className="sr-only">{model.accessibleSummary}</p> : null}
        </div>
      </div>

      {hasData ? (
        <>
          <MarketVolumeChart
            axisLabel={model.axisLabel}
            categories={model.categories}
            dataType={model.dataType}
            displayInterval={model.displayInterval}
            height={model.height}
            series={model.series}
            seriesDimension={model.seriesDimension}
            showAxes={model.showAxes}
            showDataTable={model.showDataTable}
            showLegend={model.showLegend}
            showValues={model.showValues}
            title={model.title}
            unit={model.unit}
          />
          <div
            className={cn(
              'trayport-chart__footer',
              model.showDataTable && 'trayport-chart__footer--with-data',
            )}
          >
            <p className="trayport-chart__licence">Usage restricted under licence.</p>
            {model.showDataTable ? (
              <details className="trayport-chart__data">
                <summary>View chart data</summary>
                <div
                  aria-label={`${model.title} data table`}
                  className="trayport-table-wrap"
                  role="region"
                  tabIndex={0}
                >
                  <table className="trayport-table">
                    <thead>
                      <tr>
                        <th scope="col">Period</th>
                        {model.series.map((item) => (
                          <th key={item.key} scope="col">
                            {item.label}
                            {model.unit ? ` (${model.unit})` : ''}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {model.categories.map((category, categoryIndex) => (
                        <tr key={`${category}-${categoryIndex}`}>
                          <th scope="row">{category}</th>
                          {model.series.map((item) => {
                            const value = item.values[categoryIndex]

                            return (
                              <td key={item.key}>
                                {typeof value === 'number' ? (
                                  preciseMarketValue.format(value)
                                ) : (
                                  <>
                                    <span aria-hidden>—</span>
                                    <span className="sr-only">Not available</span>
                                  </>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ) : null}
          </div>
        </>
      ) : (
        <p className="trayport-chart__empty">
          {model.dataStatus === 'unsupported'
            ? 'This chart configuration is not supported.'
            : model.dataStatus === 'unavailable'
              ? 'Market data is temporarily unavailable. Please try again later.'
              : 'No imported market-data values are available for this chart yet.'}
        </p>
      )}
    </section>
  )
}

export interface OfficePresentationModel {
  address: string
  addressPrefix?: string
  appearance: 'featured' | 'standard'
  email?: string
  legalName: string
  mapURL?: string
  phone?: string
  phoneURL?: string
  title: string
}

export interface OfficePresentationProps extends HTMLAttributes<HTMLElement> {
  model: OfficePresentationModel
}

export function OfficePresentation({ className, model, ...props }: OfficePresentationProps) {
  return (
    <article
      className={cn('trayport-office', `trayport-office--${model.appearance}`, className)}
      {...props}
    >
      <p className="trayport-eyebrow">{model.title}</p>
      <h3>{model.legalName}</h3>
      <address>
        {model.addressPrefix ? <span>{model.addressPrefix}</span> : null}
        <span>{model.address}</span>
      </address>
      <div className="trayport-office__contacts">
        {model.phone && model.phoneURL ? (
          <a href={model.phoneURL}>
            <AppIcon aria-hidden className="size-4" name="phone" />
            {model.phone}
          </a>
        ) : null}
        {model.email ? (
          <a href={`mailto:${model.email}`}>
            <AppIcon aria-hidden className="size-4" name="email" />
            {model.email}
          </a>
        ) : null}
        {model.mapURL ? (
          <a href={model.mapURL} rel="noopener noreferrer" target="_blank">
            <AppIcon aria-hidden className="size-4" name="location" />
            View map
          </a>
        ) : null}
      </div>
    </article>
  )
}
