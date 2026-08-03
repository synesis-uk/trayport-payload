import { expect, test } from '@playwright/test'

import { representativeRoutes } from '../helpers/site'

test.describe('representative WordPress content routes', () => {
  for (const route of representativeRoutes) {
    test(`${route.path} renders WordPress ${route.legacyId} at its canonical identity`, async ({
      page,
    }) => {
      const response = await page.goto(route.path)

      expect(response?.status()).toBe(200)
      await expect(page.locator('main#main-content')).toBeVisible()
      await expect(
        page.getByRole('heading', { exact: true, level: 1, name: route.heading }),
      ).toBeVisible()
      await expect(page.locator('main h1')).toHaveCount(1)
      await expect(page).toHaveTitle(route.title)

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonical, `Missing canonical metadata for WordPress ${route.legacyId}`).toBeTruthy()
      expect(new URL(canonical!, page.url()).pathname).toBe(route.path)

      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description?.trim().length).toBeGreaterThan(30)
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/)
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        'content',
        /https?:\/\//,
      )
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        'content',
        'summary_large_image',
      )

      const robots = await page
        .locator('meta[name="robots"]')
        .evaluateAll((elements) =>
          elements.map((element) => element.getAttribute('content') || '').join(','),
        )
      expect(robots.toLowerCase()).not.toContain('noindex')

      const wordpressUploadReferences = await page
        .locator(
          '[href*="trayport.local/app/uploads"], [poster*="trayport.local/app/uploads"], [src*="trayport.local/app/uploads"]',
        )
        .evaluateAll((elements) =>
          elements.map(
            (element) =>
              element.getAttribute('href') ||
              element.getAttribute('poster') ||
              element.getAttribute('src'),
          ),
        )
      expect(
        wordpressUploadReferences,
        `${route.path} still depends on the local WordPress uploads server`,
      ).toEqual([])
    })
  }

  for (const route of [
    { heading: 'Venues', path: '/venue/' },
    { heading: 'Market coverage', path: '/market-coverage/' },
  ]) {
    test(`${route.path} renders its managed virtual index`, async ({ page }) => {
      const response = await page.goto(route.path)

      expect(response?.status()).toBe(200)
      await expect(page.locator('main#main-content')).toBeVisible()
      await expect(
        page.getByRole('heading', { exact: true, level: 1, name: route.heading }),
      ).toBeVisible()

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonical).toBeTruthy()
      expect(new URL(canonical!, page.url()).pathname).toBe(route.path)
    })
  }

  test('the market coverage index links only to route-backed market profiles', async ({ page }) => {
    await page.goto('/market-coverage/')

    await expect(page.getByRole('link', { exact: true, name: /German Power/ })).toHaveAttribute(
      'href',
      '/market-coverage/german-power/',
    )
    await expect(page.locator('.trayport-index-map')).toBeVisible()
  })

  test('the public sitemap is generated from published route claims', async ({ request }) => {
    const response = await request.get('/content-sitemap.xml')
    expect(response.status()).toBe(200)
    const sitemap = await response.text()

    for (const path of [
      ...representativeRoutes.map((route) => route.path),
      '/venue/',
      '/market-coverage/',
    ]) {
      expect(sitemap).toContain(path)
    }
    expect(sitemap).not.toContain('/not-a-real-trayport-content-route/')
  })

  test('an unknown content path returns the designed 404 response', async ({ page }) => {
    const response = await page.goto('/not-a-real-trayport-content-route/')

    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole('heading', {
        exact: true,
        level: 1,
        name: "We couldn't find that page.",
      }),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Return to the homepage' })).toHaveAttribute(
      'href',
      '/',
    )
  })

  test('the mobile layout has no document-level horizontal overflow', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chromium')

    const mobileRoutes = [
      ...representativeRoutes.map((route) => route.path),
      '/venue/',
      '/market-coverage/',
    ]

    for (const path of mobileRoutes) {
      await page.goto(path)
      await expect(page.locator('main#main-content')).toBeVisible()
      await page.evaluate(() => document.fonts.ready)

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }))
      expect(
        dimensions.scrollWidth,
        `${path} overflows at ${dimensions.clientWidth}px`,
      ).toBeLessThanOrEqual(dimensions.clientWidth + 1)
    }
  })
})
