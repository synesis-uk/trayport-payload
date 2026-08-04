import { expect, test, type Page, type Response } from '@playwright/test'

const highchartsScriptsFor = async (page: Page, path: string): Promise<string[]> => {
  const scriptResponses: Response[] = []
  const recordScript = (response: Response) => {
    if (response.request().resourceType() === 'script') scriptResponses.push(response)
  }

  page.on('response', recordScript)
  await page.goto(path, { waitUntil: 'networkidle' })
  page.off('response', recordScript)

  const matches = await Promise.all(
    scriptResponses.map(async (response) => {
      try {
        const source = await response.text()
        return /(?:Highcharts|highcharts)/.test(source) ? new URL(response.url()).pathname : null
      } catch {
        return null
      }
    }),
  )

  return [...new Set(matches.filter((value): value is string => Boolean(value)))].sort()
}

const initialScriptSourceFor = async (page: Page, path: string): Promise<string> => {
  const scriptResponses: Response[] = []
  const recordScript = (response: Response) => {
    if (response.request().resourceType() === 'script') scriptResponses.push(response)
  }

  page.on('response', recordScript)
  await page.goto(path, { waitUntil: 'networkidle' })
  page.off('response', recordScript)

  const sources = await Promise.all(
    scriptResponses.map(async (response) => {
      try {
        return await response.text()
      } catch {
        return ''
      }
    }),
  )

  return sources.join('\n')
}

const mapboxResourcesFor = async (
  page: Page,
  path: string,
  revealConnectionsMap = false,
): Promise<string[]> => {
  const responses: Response[] = []
  const recordResponse = (response: Response) => responses.push(response)

  page.on('response', recordResponse)
  await page.goto(path, { waitUntil: 'networkidle' })
  if (revealConnectionsMap) {
    const map = page.locator('.trayport-coverage-map').first()
    await expect(map).toBeVisible()
    await map.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
  }
  page.off('response', recordResponse)

  const matches = await Promise.all(
    responses.map(async (response) => {
      const url = new URL(response.url())
      if (/(^|\.)mapbox\.com$/i.test(url.hostname)) return response.url()
      if (response.request().resourceType() !== 'script') return null

      try {
        return (await response.text()).includes('Mapbox GL JS') ? response.url() : null
      } catch {
        return null
      }
    }),
  )

  return [...new Set(matches.filter((value): value is string => Boolean(value)))].sort()
}

test.describe('production performance boundaries', () => {
  test('loads Highcharts on the chart route but not a non-chart detail route', async ({
    isMobile,
    page,
  }) => {
    test.skip(isMobile, 'The module boundary is viewport independent and needs one browser pass.')

    await expect(highchartsScriptsFor(page, '/venue/eex/')).resolves.toEqual([])

    const homeScripts = await highchartsScriptsFor(page, '/')
    expect(homeScripts.length).toBeGreaterThan(0)
  })

  test('does not ship the CMS icon registry in the always-hydrated public shell', async ({
    isMobile,
    page,
  }) => {
    test.skip(isMobile, 'The module boundary is viewport independent and needs one browser pass.')

    const initialScripts = await initialScriptSourceFor(page, '/venue/eex/')

    // Both values are unique to CMS-selectable navigation/content icons and are
    // intentionally absent from the four-icon fixed shell registry.
    expect(initialScripts).not.toContain('chart-waterfall')
    expect(initialScripts).not.toContain('building-lock')
  })

  test('does not request the Mapbox runtime or provider resources on a non-Home route', async ({
    isMobile,
    page,
  }) => {
    test.skip(isMobile, 'The module boundary is viewport independent and needs one browser pass.')

    await expect(mapboxResourcesFor(page, '/venue/eex/')).resolves.toEqual([])
  })

  test('does not request Mapbox when Home is using the no-config fallback', async ({
    isMobile,
    page,
  }) => {
    test.skip(isMobile, 'The module boundary is viewport independent and needs one browser pass.')

    const resources = await mapboxResourcesFor(page, '/', true)
    test.skip(
      (await page.locator('[data-map-provider="mapbox"]').count()) > 0,
      'This assertion covers the deterministic no-config runtime; Mapbox is configured.',
    )
    expect(resources).toEqual([])
    await expect(page.locator('.trayport-coverage-map').first()).toHaveAttribute(
      'data-map-ready',
      'false',
    )
    const markerLabels = await page.locator('[data-map-marker-list] li').allTextContents()
    expect(markerLabels.filter((label) => label.startsWith('Power:'))).toHaveLength(33)
    expect(markerLabels.filter((label) => label.startsWith('Natural Gas:'))).toHaveLength(22)
  })

  test('loads optional client implementations only on routes that render them', async ({
    isMobile,
    page,
  }) => {
    test.skip(isMobile, 'The module boundary is viewport independent and needs one browser pass.')

    const optionalMarkers = [
      'Featured insights',
      'Trayport login required',
      'autoTRADER connection',
      'This browser cannot play the video.',
      'data-trayport-chart-runtime',
      'Previous slide',
      'RefreshRouteOnSave',
      'onPreviewExit',
    ]

    const detailScripts = await initialScriptSourceFor(page, '/venue/eex/')
    for (const marker of optionalMarkers) expect(detailScripts).not.toContain(marker)

    const insightScripts = await initialScriptSourceFor(page, '/resources/insights/')
    expect(insightScripts).toContain('Featured insights')
    expect(insightScripts).not.toContain('Trayport login required')
    expect(insightScripts).not.toContain('autoTRADER connection')

    const learningScripts = await initialScriptSourceFor(page, '/learning-hub/')
    expect(learningScripts).toContain('Trayport login required')
    expect(learningScripts).not.toContain('autoTRADER connection')

    const matrixScripts = await initialScriptSourceFor(page, '/resources/market-matrix/')
    expect(matrixScripts).toContain('autoTRADER connection')

    const homeScripts = await initialScriptSourceFor(page, '/')
    expect(homeScripts).toContain('Previous slide')
    expect(homeScripts).toContain('This browser cannot play the video.')
    expect(homeScripts).toContain('data-trayport-chart-runtime')
    expect(homeScripts).not.toContain('RefreshRouteOnSave')
    expect(homeScripts).not.toContain('onPreviewExit')
  })
})
