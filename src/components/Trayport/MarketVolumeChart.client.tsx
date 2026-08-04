'use client'

import dynamic from 'next/dynamic'

import type { MarketVolumeChartProps } from './MarketVolumeChartRuntime.client'

const MarketVolumeChartRuntime = dynamic(() => import('./MarketVolumeChartRuntime.client'), {
  ssr: true,
})

export const MarketVolumeChart = (props: MarketVolumeChartProps) => (
  <div className="trayport-chart__canvas-wrap">
    <MarketVolumeChartRuntime {...props} />
  </div>
)
