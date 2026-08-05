import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

import type { ConnectionsMapRuntimeConfig } from '@/config/connectionsMap'
import type { RegionalMarketMapIndex } from '@/data/regionalMarketMap'
import { cn } from '@/utilities/ui'

import { DynamicRegionalMarketMapIsland } from './DynamicRegionalMarketMapIsland.client'
import { ActionsPresentation, type ActionPresentationModel } from './presentation'

export interface RegionalMarketMapPresentationModel {
  dataDisplay: 'always' | 'hover'
  defaultAssetClassID: string | null
  height: number
  index: RegionalMarketMapIndex
  lineColor: string
  lineOpacity: number
  lineWidth: number
  mapStyle: 'dark' | 'light'
  markerRadius: number
  showAssetClassFilter: boolean
  showLines: boolean
  showMarketData: boolean
  showSidebar: boolean
  title: string
  zoomTo: 'markers' | 'region'
}

export interface RegionalMarketMapPresentationProps extends HTMLAttributes<HTMLDivElement> {
  actions: ActionPresentationModel[]
  background?: ReactNode
  body?: ReactNode
  model: RegionalMarketMapPresentationModel
  presentation: 'mapOnly' | 'summary'
  runtime: ConnectionsMapRuntimeConfig | null
}

export function RegionalMarketMapPresentation({
  actions,
  background,
  body,
  className,
  model,
  presentation,
  runtime,
  ...props
}: RegionalMarketMapPresentationProps) {
  const map = (
    <div className="trayport-coverage-map trayport-regional-market-map">
      <DynamicRegionalMarketMapIsland
        fallbackBackground={background}
        model={model}
        runtime={runtime}
        style={
          {
            '--trayport-regional-map-height': `${model.height}px`,
            height: `${model.height}px`,
          } as CSSProperties
        }
      />
    </div>
  )

  if (presentation === 'mapOnly') {
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
        {body}
        <p className="trayport-market-coverage__summary">
          {model.index.hubs.length} market hubs across {model.index.regions.length}{' '}
          {model.index.regions.length === 1 ? 'region' : 'regions'} are represented from managed
          content.
        </p>
        {model.index.regions.length ? (
          <ul className="trayport-market-coverage__regions">
            {model.index.regions.map((region) => (
              <li key={region.id}>{region.label || region.title}</li>
            ))}
          </ul>
        ) : null}
        <ActionsPresentation model={{ actions }} />
      </div>
      {map}
    </div>
  )
}
