'use client'

import type { Chart } from 'highcharts'
import { useEffect, useId, useRef, useState } from 'react'

import type { MarketQuarter } from './marketData'

type MarketVolumeChartProps = {
  axisLabel?: string
  height?: number
  rows: MarketQuarter[]
  showAxes?: boolean
  showLegend?: boolean
  showValues?: boolean
  title: string
  unit?: string
}

const SERIES = [
  { color: '#c6d9f1', key: 'otcBilateral', name: 'OTC bilateral' },
  { color: '#558ed5', key: 'otcCleared', name: 'OTC cleared' },
  { color: '#17375e', key: 'exchangeTraded', name: 'Exchange traded' },
] as const

export const MarketVolumeChart = ({
  axisLabel,
  height = 350,
  rows,
  showAxes = true,
  showLegend = true,
  showValues = false,
  title,
  unit,
}: MarketVolumeChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartID = useId()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    let chart: Chart | undefined

    const render = async () => {
      try {
        const HighchartsModule = await import('highcharts/highstock')
        const HighchartsRuntime = HighchartsModule.default
        await import('highcharts/modules/accessibility')

        if (!active || !chartRef.current) return

        chart = HighchartsRuntime.chart(chartRef.current, {
          accessibility: {
            description: `${title}. Stacked quarterly volumes split by execution type.`,
            enabled: true,
          },
          chart: {
            animation: false,
            backgroundColor: 'transparent',
            height: Math.min(Math.max(height, 280), 560),
            spacing: [16, 8, 8, 8],
            style: { fontFamily: 'Inter, Arial, sans-serif' },
            type: 'column',
          },
          colors: SERIES.map(({ color }) => color),
          credits: { enabled: false },
          exporting: { enabled: false },
          legend: showLegend
            ? {
                align: 'center',
                enabled: true,
                itemStyle: {
                  color: '#1f2a44',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: '400',
                },
                symbolHeight: 10,
                symbolRadius: 0,
                symbolWidth: 10,
                verticalAlign: 'bottom',
              }
            : { enabled: false },
          plotOptions: {
            column: {
              animation: false,
              borderWidth: 0,
              dataLabels: {
                enabled: showValues,
                format: `{point.y:,.0f}${unit ? ` ${unit}` : ''}`,
                inside: true,
                style: {
                  color: '#fff',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '10px',
                  fontWeight: '400',
                  textOutline: '1px contrast',
                },
              },
              groupPadding: 0.05,
              pointPadding: 0.05,
              stacking: 'normal',
            },
            series: {
              animation: false,
              states: { inactive: { opacity: 0.45 } },
            },
          },
          responsive: {
            rules: [
              {
                chartOptions: {
                  chart: { height: 340, spacing: [8, 0, 4, 0] },
                  legend: { itemStyle: { fontSize: '10px' } },
                  xAxis: { labels: { rotation: -45, style: { fontSize: '9px' } } },
                },
                condition: { maxWidth: 520 },
              },
            ],
          },
          series: SERIES.map(({ color, key, name }) => ({
            color,
            data: rows.map((row) => row[key]),
            name,
            type: 'column',
          })),
          title: { text: undefined },
          tooltip: {
            borderColor: '#d5dbe4',
            borderRadius: 0,
            shared: true,
            valueDecimals: 0,
            valueSuffix: unit ? ` ${unit}` : undefined,
          },
          xAxis: {
            categories: rows.map((row) => `Q${row.quarter} ${String(row.year).slice(-2)}`),
            labels: {
              enabled: showAxes,
              style: {
                color: '#1f2a44',
                fontFamily: 'Inter, Arial, sans-serif',
                fontSize: '11px',
                fontWeight: '600',
              },
            },
            lineColor: '#d5dbe4',
            tickColor: '#d5dbe4',
            visible: showAxes,
          },
          yAxis: {
            gridLineColor: '#e7edf4',
            labels: {
              enabled: showAxes,
              style: {
                color: '#626262',
                fontFamily: 'Inter, Arial, sans-serif',
                fontSize: '10px',
              },
            },
            min: 0,
            title: showAxes
              ? {
                  style: {
                    color: '#1f2a44',
                    fontFamily: 'Inter, Arial, sans-serif',
                    fontSize: '11px',
                    fontWeight: '600',
                  },
                  text: axisLabel || unit || undefined,
                }
              : { text: undefined },
          },
        })
      } catch {
        if (active) setFailed(true)
      }
    }

    void render()
    return () => {
      active = false
      chart?.destroy()
    }
  }, [axisLabel, height, rows, showAxes, showLegend, showValues, title, unit])

  return (
    <div className="trayport-chart__canvas-wrap">
      <div
        aria-label={`${title} interactive chart`}
        className="trayport-chart__canvas"
        id={chartID}
        ref={chartRef}
        role="region"
      />
      {failed ? (
        <p className="trayport-chart__fallback" role="status">
          The interactive chart could not be loaded. The full data table is available below.
        </p>
      ) : null}
    </div>
  )
}
