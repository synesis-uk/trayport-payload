'use client'

import { useEffect, useId, useRef, useState } from 'react'

import type { MarketDataResult } from '@/data/market-data/types'

type MarketChartData = Pick<
  MarketDataResult,
  'categories' | 'dataType' | 'displayInterval' | 'series' | 'seriesDimension'
>

export type MarketVolumeChartProps = MarketChartData & {
  axisLabel?: string
  height?: number
  showAxes?: boolean
  showDataTable?: boolean
  showLegend?: boolean
  showValues?: boolean
  title: string
  unit?: string
}

const EXECUTION_SERIES_COLORS = {
  exchangeTraded: { fallback: '#17375e', token: '--chart-3' },
  otcBilateral: { fallback: '#c6d9f1', token: '--chart-1' },
  otcCleared: { fallback: '#558ed5', token: '--chart-2' },
} as const

const EXECUTION_SERIES_LABELS = {
  exchangeTraded: 'Exchange Traded',
  otcBilateral: 'OTC Bilateral',
  otcCleared: 'OTC Cleared',
} as const

const HUB_SERIES_COLORS = [
  { fallback: '#1f2a44', token: '--chart-hub-1' },
  { fallback: '#002d72', token: '--chart-hub-2' },
  { fallback: '#0057b8', token: '--chart-hub-3' },
  { fallback: '#009cde', token: '--chart-hub-4' },
  { fallback: '#00c1d5', token: '--chart-hub-5' },
  { fallback: '#f7ea48', token: '--chart-hub-6' },
  { fallback: '#ff671f', token: '--chart-hub-7' },
  { fallback: '#b2397e', token: '--chart-hub-8' },
  { fallback: '#e6516d', token: '--chart-hub-9' },
] as const

const hubPaletteIndexes = (seriesCount: number): number[] => {
  if (seriesCount === 1) return [0]
  if (seriesCount === 2) return [0, 2]
  if (seriesCount === 3) return [0, 2, 3]
  if (seriesCount === 4) return [0, 2, 3, 4]
  if (seriesCount === 5) return [0, 1, 2, 3, 4]
  return Array.from({ length: seriesCount }, (_, index) => index)
}

type ChartInstance = {
  destroy: () => void
}

type ChartRuntime = {
  chart: (container: HTMLElement, options: object) => ChartInstance
}

declare global {
  interface Window {
    TrayportChartRuntime?: ChartRuntime
  }
}

const VENDOR_RUNTIME_URL = '/next/chart-runtime/?v=12.2.0'
let chartRuntimePromise: Promise<ChartRuntime> | undefined

const loadChartRuntime = (): Promise<ChartRuntime> => {
  if (window.TrayportChartRuntime) return Promise.resolve(window.TrayportChartRuntime)
  if (chartRuntimePromise) return chartRuntimePromise

  const pendingRuntime = new Promise<ChartRuntime>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('[data-trayport-chart-runtime]')
    const script = existing || document.createElement('script')

    const removeListeners = () => {
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
    }
    const rejectRuntime = (message: string) => {
      removeListeners()
      script.remove()
      if (chartRuntimePromise === pendingRuntime) chartRuntimePromise = undefined
      reject(new Error(message))
    }
    const handleLoad = () => {
      removeListeners()
      if (window.TrayportChartRuntime) {
        resolve(window.TrayportChartRuntime)
      } else {
        rejectRuntime('Chart runtime loaded without its expected browser API.')
      }
    }
    const handleError = () => rejectRuntime('Chart runtime request failed.')

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    if (!existing) {
      script.async = true
      script.dataset.trayportChartRuntime = ''
      script.src = VENDOR_RUNTIME_URL
      document.head.append(script)
    }
  })
  chartRuntimePromise = pendingRuntime

  return chartRuntimePromise
}

const chartDescription = ({
  categories,
  dataType,
  displayInterval,
  seriesDimension,
  title,
}: Pick<
  MarketVolumeChartProps,
  'categories' | 'dataType' | 'displayInterval' | 'seriesDimension' | 'title'
>) => {
  const visual =
    seriesDimension === 'executionType'
      ? 'Stacked volume columns split by execution type'
      : dataType === 'price'
        ? 'Price lines split by market hub'
        : 'Volume columns split by market hub'
  const period =
    displayInterval === 'month' ? 'monthly' : displayInterval === 'quarter' ? 'quarterly' : 'annual'

  return `${title}. ${visual} across ${categories.length} ${period} periods.`
}

const escapeTooltipText = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character] || character,
  )

const MarketVolumeChartRuntime = ({
  axisLabel,
  categories,
  dataType,
  displayInterval,
  height = 350,
  series,
  seriesDimension,
  showAxes = true,
  showDataTable = true,
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
    let chart: ChartInstance | undefined

    const render = async () => {
      try {
        const runtime = await loadChartRuntime()
        if (!active || !chartRef.current) return

        const styles = getComputedStyle(document.documentElement)
        const token = (name: string, fallback: string) =>
          styles.getPropertyValue(name).trim() || fallback
        const documentFontFamily = token('--font-inter', 'InterVariable, Arial, sans-serif')
        const chartFontFamily = 'Inter, sans-serif'
        const foreground = '#333333'
        const stacked = seriesDimension === 'executionType' && dataType === 'volume'
        const chartType = dataType === 'price' ? 'line' : 'column'
        const hubColorIndexes = hubPaletteIndexes(series.length)
        const colorForSeries = (key: string, index: number) => {
          if (seriesDimension === 'executionType') {
            const color = EXECUTION_SERIES_COLORS[key as keyof typeof EXECUTION_SERIES_COLORS]
            if (color) return token(color.token, color.fallback)
          }

          const paletteIndex = hubColorIndexes[index] ?? index
          const color = HUB_SERIES_COLORS[paletteIndex % HUB_SERIES_COLORS.length]
          return token(color.token, color.fallback)
        }
        const chartSeries = series.map((item, index) => ({
          color: colorForSeries(item.key, index),
          connectNulls: false,
          data: item.values,
          id: item.key,
          marker: chartType === 'line' ? { enabled: true, radius: 2, symbol: 'circle' } : undefined,
          name:
            (seriesDimension === 'executionType'
              ? EXECUTION_SERIES_LABELS[item.key as keyof typeof EXECUTION_SERIES_LABELS]
              : undefined) ||
            item.label ||
            item.key,
          type: chartType,
        }))

        chart = runtime.chart(chartRef.current, {
          accessibility: {
            description: chartDescription({
              categories,
              dataType,
              displayInterval,
              seriesDimension,
              title,
            }),
            enabled: true,
          },
          chart: {
            animation: false,
            backgroundColor: null,
            height: Math.min(Math.max(height, 280), 560),
            style: { fontFamily: documentFontFamily },
            type: chartType,
          },
          colors: chartSeries.map(({ color }) => color),
          credits: { enabled: false },
          exporting: { enabled: false },
          legend: showLegend
            ? {
                align: 'center',
                enabled: true,
                itemStyle: {
                  color: foreground,
                  fontFamily: chartFontFamily,
                  fontSize: '16px',
                  fontWeight: 'normal',
                },
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
                inside: stacked,
                style: {
                  color: stacked ? '#fff' : foreground,
                  fontFamily: chartFontFamily,
                  fontSize: '12px',
                  fontWeight: 'normal',
                  textOutline: stacked ? '#000' : 'none',
                },
              },
              groupPadding: 0.05,
              pointPadding: 0.05,
              stacking: stacked ? 'normal' : undefined,
            },
            line: {
              dataLabels: {
                enabled: showValues,
                format: `{point.y:,.2f}${unit ? ` ${unit}` : ''}`,
                style: {
                  color: foreground,
                  fontFamily: chartFontFamily,
                  fontSize: '12px',
                  fontWeight: 'normal',
                  textOutline: 'none',
                },
              },
              lineWidth: 2,
            },
            series: {
              animation: false,
            },
          },
          series: chartSeries,
          title: { text: null },
          tooltip: {
            backgroundColor: '#ffffff',
            formatter(this: {
              points?: Array<{ series: { name: string }; y?: number | null }>
              x?: number | string
            }) {
              const points = this.points || []
              const category =
                typeof this.x === 'number' && categories[this.x] !== undefined
                  ? categories[this.x]
                  : String(this.x ?? '')
              const suffix = unit ? ` ${escapeTooltipText(unit)}` : ''
              const total = points.reduce((sum, point) => {
                const value = Number(point.y)
                return Number.isFinite(value) ? sum + value : sum
              }, 0)
              let html = `<b>${escapeTooltipText(category)}: ${total.toFixed(0)}${suffix}</b><br/>`

              for (const point of points) {
                const value = Number(point.y)
                if (!Number.isFinite(value)) continue
                html += `${escapeTooltipText(point.series.name)}: ${value.toFixed(0)}${suffix}<br/>`
              }

              return html
            },
            shared: true,
            style: {
              fontFamily: chartFontFamily,
              fontSize: '16px',
              fontWeight: 'normal',
            },
            useHTML: true,
          },
          xAxis: {
            categories,
            labels: {
              enabled: showAxes,
              style: {
                color: foreground,
                fontFamily: chartFontFamily,
                fontSize: '14px',
                fontWeight: 'bold',
              },
            },
            lineColor: foreground,
            tickColor: foreground,
            visible: showAxes,
          },
          yAxis: {
            gridLineColor: '#e6e6e6',
            labels: {
              enabled: showAxes,
              formatter(this: { value: number | string }) {
                const value = Number(this.value)
                return `${Number.isFinite(value) ? value.toFixed(0) : this.value}${unit ? ` ${unit}` : ''}`
              },
              style: {
                color: foreground,
                fontFamily: chartFontFamily,
                fontSize: '12px',
                fontWeight: 'normal',
              },
            },
            min: dataType === 'volume' ? 0 : undefined,
            title: showAxes
              ? {
                  style: {
                    color: '#666666',
                    fontFamily: chartFontFamily,
                    fontSize: '14px',
                    fontWeight: 'bold',
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
  }, [
    axisLabel,
    categories,
    dataType,
    displayInterval,
    height,
    series,
    seriesDimension,
    showAxes,
    showLegend,
    showValues,
    title,
    unit,
  ])

  return (
    <>
      <div
        aria-label={`${title} interactive chart`}
        className="trayport-chart__canvas"
        id={chartID}
        ref={chartRef}
        role="region"
      />
      {failed ? (
        <p className="trayport-chart__fallback" role="status">
          {showDataTable
            ? 'The interactive chart could not be loaded. The full data table is available below.'
            : 'The interactive chart could not be loaded. Please try again later.'}
        </p>
      ) : null}
    </>
  )
}

export default MarketVolumeChartRuntime
