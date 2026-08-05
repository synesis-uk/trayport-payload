import { expect, test } from '@playwright/test'

test.describe('regional market maps', () => {
  test('the full markets map preserves its live defaults and runtime boundary', async ({
    page,
  }) => {
    await page.goto('/resources/markets-map/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Explore Trayport’s Markets Map',
    )
    const map = page.getByRole('region', { name: 'Explore our connectivity' }).first()
    await expect(map.getByRole('combobox', { name: 'Region' })).toHaveText('All regions')
    await expect(map.getByRole('combobox', { name: 'Asset class' })).toHaveText('Power')
    await expect(map.getByRole('combobox', { name: 'Data interval' })).toHaveText('Quarter')
    await expect(map.getByText('Showing 26 hubs for Power across all regions.')).toBeVisible()

    const shell = map.locator('[data-map-provider]')
    await expect(shell).toHaveCSS('height', '650px')
    if ((await shell.getAttribute('data-map-provider')) === 'mapbox') {
      await shell.scrollIntoViewIfNeeded()
      await expect
        .poll(async () => {
          const [error, ready] = await Promise.all([
            shell.getAttribute('data-map-error'),
            shell.getAttribute('data-map-ready'),
          ])
          return error === 'true' || ready === 'true'
        })
        .toBe(true)
    } else {
      await expect(shell).toHaveAttribute('data-map-provider', 'fallback')
      await expect(shell.locator('svg[aria-hidden="true"]')).toBeVisible()
    }
  })

  test('the Europe map exposes scaled quarterly data and venue links without a no-op sidebar', async ({
    page,
  }) => {
    await page.goto('/regions/europe/')

    const map = page.getByRole('region', { name: 'Explore our connectivity' }).first()
    await expect(map.getByRole('combobox', { name: 'Region' })).toHaveCount(0)
    await expect(map.getByText('Europe', { exact: true })).toBeVisible()
    await expect(map.getByRole('combobox', { name: 'Asset class' })).toHaveText('Natural Gas')
    await expect(map.getByRole('combobox', { name: 'Data interval' })).toHaveText('Quarter')
    await expect(map.getByText('Showing 17 hubs for Natural Gas in Europe.')).toBeVisible()

    await map.getByText('Accessible market-hub and venue list').click()
    const ttf = map.getByRole('heading', { level: 4, name: 'TTF (Dutch)' }).locator('..')
    await expect(ttf.getByText(/TWh \([+-][\d.]+% QoQ\)/)).toBeVisible()
    await expect(ttf.getByRole('button', { name: 'Show connections' })).toHaveCount(0)
    await ttf.getByText(/connected venues/).click()
    await expect(ttf.getByRole('link', { name: 'EEX' })).toHaveAttribute('href', '/venue/eex/')
  })

  test('the public market summary endpoint returns display-scale values', async ({ request }) => {
    const response = await request.get(
      '/api/market-map-data/?assetClassKey=asset-class%3Agas&interval=quarter',
    )
    expect(response.ok()).toBe(true)
    const result = (await response.json()) as {
      interval: string
      status: string
      summaries: Record<
        string,
        { changeLabel: string; changePercent: number | null; value: number | null }
      >
    }
    const summaries = Object.values(result.summaries)
    const values = summaries
      .map(({ value }) => value)
      .filter((value): value is number => value !== null)

    expect(result).toMatchObject({ interval: 'quarter', status: 'available' })
    expect(values.length).toBeGreaterThan(8)
    expect(Math.max(...values)).toBeLessThan(100_000)
    expect(summaries.some(({ changeLabel }) => changeLabel === 'QoQ')).toBe(true)
  })
})
