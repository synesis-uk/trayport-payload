import { expect, test } from '@playwright/test'
import { createHash } from 'node:crypto'

import { managedRedirectRoutes, representativeRoutes } from '../helpers/site'

const pagePresentations = {
  '/': { className: 'trayport-page--home', type: 'homepage' },
  '/company/about-us/': { className: 'trayport-page--standard', type: 'standard' },
  '/company/careers/': { className: 'trayport-page--standard', type: 'standard' },
  '/company/offices/': { className: 'trayport-page--standard', type: 'standard' },
  '/contact/': { className: 'trayport-page--standard', type: 'standard' },
  '/eex-news/': { className: 'trayport-page--standard', type: 'standard' },
  '/legal/': { className: 'trayport-page--legal', type: 'legal' },
  '/legal/cookie-policy/': { className: 'trayport-page--legal', type: 'legal' },
  '/legal/legal-notice/': { className: 'trayport-page--legal', type: 'legal' },
  '/legal/modern-slavery/': { className: 'trayport-page--legal', type: 'legal' },
  '/products/joule/': { className: 'trayport-page--product', type: 'product' },
  '/products/data-analytics/': { className: 'trayport-page--product', type: 'product' },
  '/products/exchange-connectivity/': { className: 'trayport-page--product', type: 'product' },
  '/products/exchange-trading-system/': { className: 'trayport-page--product', type: 'product' },
  '/products/tradesignal/': { className: 'trayport-page--product', type: 'product' },
  '/regions/asia-pacific/': { className: 'trayport-page--standard', type: 'standard' },
  '/regions/europe/': { className: 'trayport-page--standard', type: 'standard' },
  '/regions/north-america/': { className: 'trayport-page--standard', type: 'standard' },
  '/resources/faqs/': { className: 'trayport-page--standard', type: 'standard' },
  '/resources/lifecycle-information/': { className: 'trayport-page--standard', type: 'standard' },
  '/resources/market-matrix/': { className: 'trayport-page--interactive', type: 'interactive' },
  '/resources/markets-map/': { className: 'trayport-page--standard', type: 'standard' },
  '/terms-of-use-disclaimer/': { className: 'trayport-page--legal', type: 'legal' },
} as const

test.describe('representative WordPress content routes', () => {
  for (const route of representativeRoutes) {
    test(`${route.path} renders WordPress ${route.legacyId} at its canonical identity`, async ({
      page,
    }) => {
      const response = await page.goto(route.path)

      expect(response?.status()).toBe(200)
      const main = page.locator('main#main-content')
      await expect(main).toBeVisible()

      const presentation = pagePresentations[route.path as keyof typeof pagePresentations]
      if (presentation) {
        await expect(main).toHaveClass(new RegExp(`\\b${presentation.className}\\b`))
        await expect(main).toHaveAttribute('data-page-path', route.path)
        await expect(main).toHaveAttribute('data-page-type', presentation.type)
      }

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

  test('the immutable brand artwork bypasses the managed-route preflight', async ({
    isMobile,
    request,
  }) => {
    test.skip(isMobile, 'The application-owned asset boundary needs one HTTP pass.')

    const response = await request.get('/brand/bg-poly-angle-opacity-02.png')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('image/png')
    expect(
      createHash('sha256')
        .update(await response.body())
        .digest('hex'),
    ).toBe('327fbdfef7fb970a7a49e186825ba930745c91cacc40270561289e78e11af2dd')
  })

  for (const redirect of managedRedirectRoutes) {
    test(`${redirect.path} preserves WordPress ${redirect.legacyId} as a temporary managed redirect`, async ({
      page,
      request,
    }) => {
      const direct = await request.get(redirect.path, { maxRedirects: 0 })
      expect(direct.status()).toBe(redirect.status)
      expect(new URL(direct.headers().location, 'http://trayport.test').pathname).toBe(
        redirect.target,
      )

      const response = await page.goto(redirect.path)
      expect(response?.status()).toBe(200)
      expect(new URL(page.url()).pathname).toBe(redirect.target)
      await expect(page.getByRole('heading', { level: 1, name: 'Contact Us' })).toBeVisible()
    })
  }

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

  test('unknown file-like paths remain 404 when preview cookies are forged', async ({
    request,
  }) => {
    const path = '/not-a-real-trayport-asset.pdf'

    for (const cookie of [
      undefined,
      '__prerender_bypass=forged',
      'trayport-preview-route=forged',
    ]) {
      const response = await request.get(path, {
        headers: cookie ? { Cookie: cookie } : undefined,
      })

      expect(response.status()).toBe(404)
      expect(await response.text()).toContain("We couldn't find that page.")
    }
  })

  test('unknown children of reserved application namespaces still return 404', async ({
    request,
  }) => {
    for (const path of [
      '/_not-found/definitely-missing/',
      '/design-system/definitely-missing/',
      '/next/definitely-missing/',
    ]) {
      const response = await request.get(path)

      expect(response.status(), path).toBe(404)
      expect(await response.text(), path).toContain("We couldn't find that page.")
    }
  })

  test('the internal not-found target cannot be requested as a successful page', async ({
    request,
  }) => {
    expect((await request.get('/_not-found/')).status()).toBe(404)
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
