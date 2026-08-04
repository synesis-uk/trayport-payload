import { expect, test } from '@playwright/test'

test.describe('market-volume charts', () => {
  test('renders visible stacked columns and retains its accessible data disclosure', async ({
    isMobile,
    page,
  }) => {
    await page.goto('/')

    const chartCanvases = page.locator('.trayport-chart__canvas')
    await expect(chartCanvases).toHaveCount(2)

    for (const canvas of await chartCanvases.all()) {
      const chartRoot = canvas.locator('.highcharts-root')
      await expect(chartRoot).toBeVisible()
      await expect(canvas.locator('.highcharts-series-group .highcharts-point')).toHaveCount(60)

      const geometry = await chartRoot.evaluate((root) => {
        const rootBox = root.getBoundingClientRect()
        const visiblePoint = Array.from(
          root.querySelectorAll<SVGElement>('.highcharts-point'),
        ).find((point) => {
          const box = point.getBoundingClientRect()
          return box.width > 0 && box.height > 0
        })
        const pointBox = visiblePoint?.getBoundingClientRect()

        return {
          height: rootBox.height,
          pointHeight: pointBox?.height || 0,
          pointWidth: pointBox?.width || 0,
          width: rootBox.width,
        }
      })

      expect(geometry.width).toBeGreaterThan(isMobile ? 250 : 300)
      expect(geometry.height).toBeGreaterThanOrEqual(280)
      expect(geometry.pointWidth).toBeGreaterThan(0)
      expect(geometry.pointHeight).toBeGreaterThan(0)
    }

    const runtimeScript = page.locator('script[data-trayport-chart-runtime]')
    await expect(runtimeScript).toHaveCount(1)
    const runtimeSource = await runtimeScript.getAttribute('src')
    expect(runtimeSource).not.toBeNull()
    expect(new URL(runtimeSource!, page.url()).origin).toBe(new URL(page.url()).origin)

    const dataDisclosure = page.locator('.trayport-chart__data').first()
    await dataDisclosure.locator('summary').click()
    await expect(dataDisclosure).toHaveAttribute('open', '')
    await expect(dataDisclosure.locator('tbody tr')).toHaveCount(20)
    await expect(chartCanvases.first().locator('.highcharts-root')).toBeVisible()
  })
})
