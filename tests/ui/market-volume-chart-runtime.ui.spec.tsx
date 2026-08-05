import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import MarketVolumeChartRuntime, {
  type MarketVolumeChartProps,
} from '@/components/Trayport/MarketVolumeChartRuntime.client'

const originalFontsDescriptor = Object.getOwnPropertyDescriptor(document, 'fonts')

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const monthCategories = (year: number, month: number, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const offset = month - 1 + index
    return `${MONTHS[offset % 12]} ${year + Math.floor(offset / 12)}`
  })

const quarterCategories = (year: number, quarter: number, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const offset = quarter - 1 + index
    return `${year + Math.floor(offset / 4)} Q${(offset % 4) + 1}`
  })

const seriesFor = (
  categories: string[],
  count: number,
  seriesDimension: MarketVolumeChartProps['seriesDimension'],
) => {
  const executionTypes = [
    ['otcBilateral', 'OTC bilateral'],
    ['otcCleared', 'OTC cleared'],
    ['exchangeTraded', 'Exchange traded'],
  ] as const

  return Array.from({ length: count }, (_, seriesIndex) => ({
    key:
      seriesDimension === 'executionType'
        ? executionTypes[seriesIndex]?.[0] || `execution:${seriesIndex}`
        : `hub:${2500 + seriesIndex}`,
    label:
      seriesDimension === 'executionType'
        ? executionTypes[seriesIndex]?.[1] || `Execution type ${seriesIndex + 1}`
        : `Hub ${seriesIndex + 1}`,
    values: categories.map((_, categoryIndex) => (seriesIndex + 1) * 100 + categoryIndex),
  }))
}

const chartProps = ({
  categories,
  dataType = 'volume',
  displayInterval,
  seriesCount,
  seriesDimension,
  title,
}: {
  categories: string[]
  dataType?: MarketVolumeChartProps['dataType']
  displayInterval: MarketVolumeChartProps['displayInterval']
  seriesCount: number
  seriesDimension: MarketVolumeChartProps['seriesDimension']
  title: string
}): MarketVolumeChartProps => ({
  categories,
  dataType,
  displayInterval,
  series: seriesFor(categories, seriesCount, seriesDimension),
  seriesDimension,
  showDataTable: true,
  title,
  unit: dataType === 'price' ? '' : 'TWh',
})

type CapturedChartOptions = {
  accessibility: { description: string }
  chart: { backgroundColor: null; height: number; type: string }
  credits: { enabled: boolean }
  legend: {
    itemStyle: { fontFamily: string; fontSize: string; fontWeight: string }
    verticalAlign: string
  }
  plotOptions: {
    column: {
      borderWidth: number
      groupPadding: number
      pointPadding: number
      stacking?: string
    }
  }
  series: Array<{
    color: string
    connectNulls: boolean
    data: Array<number | null>
    name: string
    type: string
  }>
  title: { text: null }
  tooltip: {
    backgroundColor: string
    borderColor?: string
    borderRadius?: number
    formatter: (this: {
      points: Array<{ series: { name: string }; y: number | null }>
      x: number | string
    }) => string
    shared: boolean
    style: { fontFamily: string; fontSize: string; fontWeight: string }
    useHTML: boolean
    valueDecimals?: number
    valueSuffix?: string
  }
  xAxis: {
    categories: string[]
    labels: { style: { fontFamily: string; fontSize: string; fontWeight: string } }
  }
  yAxis: {
    labels: {
      formatter: (this: { value: number | string }) => string
      style: { fontFamily: string; fontSize: string; fontWeight: string }
    }
    min?: number
    title: { style: { fontFamily: string; fontSize: string; fontWeight: string }; text: string }
  }
}

const chartCases = [
  {
    categories: quarterCategories(2021, 1, 20),
    dataType: 'volume' as const,
    displayInterval: 'quarter' as const,
    expectedType: 'column',
    seriesCount: 3,
    seriesDimension: 'executionType' as const,
    stacked: true,
    title: 'Traded power volumes by execution',
  },
  {
    categories: monthCategories(2023, 7, 30),
    dataType: 'volume' as const,
    displayInterval: 'month' as const,
    expectedType: 'column',
    seriesCount: 1,
    seriesDimension: 'hub' as const,
    stacked: false,
    title: 'Japan power market by volume',
  },
  {
    categories: ['2025'],
    dataType: 'volume' as const,
    displayInterval: 'year' as const,
    expectedType: 'column',
    seriesCount: 9,
    seriesDimension: 'hub' as const,
    stacked: false,
    title: 'Power volumes by hub',
  },
  {
    categories: monthCategories(2025, 1, 12),
    dataType: 'price' as const,
    displayInterval: 'month' as const,
    expectedType: 'line',
    seriesCount: 5,
    seriesDimension: 'hub' as const,
    stacked: false,
    title: 'Power prices by hub',
  },
  {
    categories: quarterCategories(2025, 1, 4),
    dataType: 'volume' as const,
    displayInterval: 'quarter' as const,
    expectedType: 'column',
    seriesCount: 4,
    seriesDimension: 'hub' as const,
    stacked: false,
    title: 'Gas volumes by hub',
  },
] as const

afterEach(() => {
  cleanup()
  delete window.TrayportChartRuntime
  document.querySelectorAll('[data-trayport-chart-runtime]').forEach((script) => script.remove())
  if (originalFontsDescriptor) {
    Object.defineProperty(document, 'fonts', originalFontsDescriptor)
  } else {
    Reflect.deleteProperty(document, 'fonts')
  }
})

describe('market-data chart runtime', () => {
  it.each(chartCases)(
    'renders $categories.length periods by $seriesCount series for $title',
    async ({
      categories,
      dataType,
      displayInterval,
      expectedType,
      seriesCount,
      seriesDimension,
      stacked,
      title,
    }) => {
      const destroy = vi.fn()
      const chart = vi.fn((_container: HTMLElement, _options: object) => ({ destroy }))
      window.TrayportChartRuntime = { chart }
      const props = chartProps({
        categories: [...categories],
        dataType,
        displayInterval,
        seriesCount,
        seriesDimension,
        title,
      })

      render(<MarketVolumeChartRuntime {...props} />)

      await waitFor(() => expect(chart).toHaveBeenCalledOnce())
      const options = chart.mock.calls[0]?.[1] as CapturedChartOptions
      expect(options.xAxis.categories).toEqual(categories)
      expect(options.series).toHaveLength(seriesCount)
      expect(options.series.every((item) => item.data.length === categories.length)).toBe(true)
      expect(options.chart.type).toBe(expectedType)
      expect(options.plotOptions.column.stacking).toBe(stacked ? 'normal' : undefined)
      expect(options.yAxis.min).toBe(dataType === 'volume' ? 0 : undefined)
      expect(options.accessibility.description).toContain(title)
      expect(options.chart.backgroundColor).toBeNull()
      expect(options.chart.height).toBe(350)
      expect(options.credits.enabled).toBe(false)
      expect(options.title.text).toBeNull()
      expect(options.legend.verticalAlign).toBe('bottom')
      expect(options.legend.itemStyle).toEqual(
        expect.objectContaining({
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          fontWeight: 'normal',
        }),
      )
      expect(options.xAxis.labels.style).toEqual(
        expect.objectContaining({
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 'bold',
        }),
      )
      expect(options.yAxis.labels.style).toEqual(
        expect.objectContaining({
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          fontWeight: 'normal',
        }),
      )
      expect(options.yAxis.title.style).toEqual(
        expect.objectContaining({
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 'bold',
        }),
      )
      expect(options.tooltip.style).toEqual(
        expect.objectContaining({
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          fontWeight: 'normal',
        }),
      )
      expect(options.tooltip).toEqual(
        expect.objectContaining({
          backgroundColor: '#ffffff',
          shared: true,
          useHTML: true,
        }),
      )
      expect(options.tooltip).not.toHaveProperty('borderColor')
      expect(options.tooltip).not.toHaveProperty('borderRadius')
      expect(options.tooltip).not.toHaveProperty('valueDecimals')
      expect(options.tooltip).not.toHaveProperty('valueSuffix')

      const tooltipPoints = options.series.map((item) => ({
        series: { name: item.name },
        y: item.data[0],
      }))
      const tooltipSuffix = dataType === 'price' ? '' : ' TWh'
      const decimals = dataType === 'price' ? 2 : 0
      const tooltipTotal = tooltipPoints.reduce((sum, point) => sum + Number(point.y || 0), 0)
      const expectedTooltip = [
        dataType === 'price'
          ? `<b>${categories[0]}</b><br/>`
          : `<b>${categories[0]}: ${tooltipTotal.toFixed(0)}${tooltipSuffix}</b><br/>`,
        ...tooltipPoints.map(
          (point) =>
            `${point.series.name}: ${Number(point.y).toFixed(decimals)}${tooltipSuffix}<br/>`,
        ),
      ].join('')
      expect(options.tooltip.formatter.call({ points: tooltipPoints, x: 0 })).toBe(expectedTooltip)
      expect(options.plotOptions.column).toEqual(
        expect.objectContaining({ borderWidth: 0, groupPadding: 0.05, pointPadding: 0.05 }),
      )

      if (seriesDimension === 'hub' && seriesCount === 9) {
        expect(new Set(options.series.map(({ color }) => color)).size).toBe(9)
      }
      if (expectedType === 'line') {
        expect(options.series.every((item) => item.connectNulls === false)).toBe(true)
      }
      if (seriesDimension === 'executionType') {
        expect(options.series.map(({ name }) => name)).toEqual([
          'OTC Bilateral',
          'OTC Cleared',
          'Exchange Traded',
        ])
      }

      expect(options.yAxis.labels.formatter.call({ value: 35_000 })).toBe(
        dataType === 'price' ? '35000.00' : '35000 TWh',
      )

      expect(screen.getByRole('region', { name: `${title} interactive chart` })).toBeTruthy()
    },
  )

  it('removes a failed script, explains the table fallback, and retries after remount', async () => {
    const props = chartProps({
      categories: ['2026 Q1'],
      displayInterval: 'quarter',
      seriesCount: 3,
      seriesDimension: 'executionType',
      title: 'Quarterly energy volume',
    })
    const firstMount = render(<MarketVolumeChartRuntime {...props} />)

    const failedScript = await waitFor(() => {
      const script = document.querySelector<HTMLScriptElement>('[data-trayport-chart-runtime]')
      expect(script).not.toBeNull()
      return script as HTMLScriptElement
    })

    fireEvent.error(failedScript)
    expect((await screen.findByRole('status')).textContent).toBe(
      'The interactive chart could not be loaded. The full data table is available below.',
    )
    expect(failedScript.isConnected).toBe(false)
    firstMount.unmount()

    const destroy = vi.fn()
    const chart = vi.fn((_container: HTMLElement, _options: object) => ({ destroy }))
    render(<MarketVolumeChartRuntime {...props} />)

    const retryScript = await waitFor(() => {
      const script = document.querySelector<HTMLScriptElement>('[data-trayport-chart-runtime]')
      expect(script).not.toBeNull()
      return script as HTMLScriptElement
    })
    expect(retryScript).not.toBe(failedScript)

    window.TrayportChartRuntime = { chart }
    fireEvent.load(retryScript)

    await waitFor(() => expect(chart).toHaveBeenCalledOnce())
  })

  it('creates the chart without gating reference geometry on the static font request', async () => {
    const load = vi.fn(() => new Promise<FontFace[]>(() => undefined))
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { load },
    })

    const chart = vi.fn(() => ({ destroy: vi.fn() }))
    window.TrayportChartRuntime = { chart }
    render(
      <MarketVolumeChartRuntime
        {...chartProps({
          categories: ['2026 Q1'],
          displayInterval: 'quarter',
          seriesCount: 3,
          seriesDimension: 'executionType',
          title: 'Quarterly energy volume',
        })}
      />,
    )

    await waitFor(() => expect(chart).toHaveBeenCalledOnce())
    expect(load).not.toHaveBeenCalled()
  })

  it('escapes managed labels before returning the reference HTML tooltip', async () => {
    const chart = vi.fn((_container: HTMLElement, _options: object) => ({ destroy: vi.fn() }))
    window.TrayportChartRuntime = { chart }
    const props = chartProps({
      categories: ['2026 <Q1> & review'],
      displayInterval: 'quarter',
      seriesCount: 1,
      seriesDimension: 'hub',
      title: 'Quarterly energy volume',
    })
    props.series[0]!.label = 'North & <East>'
    props.unit = '<TWh>'

    render(<MarketVolumeChartRuntime {...props} />)

    await waitFor(() => expect(chart).toHaveBeenCalledOnce())
    const options = chart.mock.calls[0]?.[1] as CapturedChartOptions
    expect(
      options.tooltip.formatter.call({
        points: [{ series: { name: 'North & <East>' }, y: 12.6 }],
        x: 0,
      }),
    ).toBe(
      '<b>2026 &lt;Q1&gt; &amp; review: 13 &lt;TWh&gt;</b><br/>North &amp; &lt;East&gt;: 13 &lt;TWh&gt;<br/>',
    )
  })

  it('does not promise a fallback table when editors disable it', async () => {
    window.TrayportChartRuntime = {
      chart: () => {
        throw new Error('Chart renderer unavailable')
      },
    }
    render(
      <MarketVolumeChartRuntime
        {...chartProps({
          categories: ['2026 Q1'],
          displayInterval: 'quarter',
          seriesCount: 3,
          seriesDimension: 'executionType',
          title: 'Quarterly energy volume',
        })}
        showDataTable={false}
      />,
    )

    const status = await screen.findByRole('status')
    expect(status.textContent).toBe(
      'The interactive chart could not be loaded. Please try again later.',
    )
  })
})
