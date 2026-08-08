import fs from 'node:fs'
import path from 'node:path'

import { expect, test } from '@playwright/test'

import { COOKIE_CONSENT_STORAGE_KEY } from '../../src/Footer/cookieConsent'
import { goldenRoutes } from '../helpers/site'
import {
  MAX_BUDGET_SLACK,
  budgetFor,
  type VisualProject,
} from '../visual/acceptance'

const referenceProxyOrigin = process.env.PLAYWRIGHT_REFERENCE_PROXY_ORIGIN
const referenceHostname = 'trayport.local'

const isReferenceBaseURL = (baseURL: string | undefined): boolean => {
  if (!baseURL) return false

  try {
    return new URL(baseURL).hostname.toLowerCase() === referenceHostname
  } catch {
    return false
  }
}

/**
 * Audited source defects on the live WordPress reference. Keep this allowlist route-scoped and
 * path-exact so a new media regression cannot be mistaken for an inherited legacy limitation.
 */
const allowedMissingReferenceImages: Partial<
  Record<(typeof goldenRoutes)[number]['name'], string[]>
> = {
  'german-power': ['/app/uploads/2024/12/AdobeStock_525262198-scaled.jpeg'],
  insights: ['/app/uploads/2024/12/AdobeStock_1281989703-1024x490.jpeg'],
}

test.beforeEach(async ({ context, page }) => {
  await context.clearCookies()
  await page.addInitScript(
    (storageKey) => window.localStorage.removeItem(storageKey),
    COOKIE_CONSENT_STORAGE_KEY,
  )

  if (!referenceProxyOrigin) return

  const proxy = new URL(referenceProxyOrigin)
  await page.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const isReferenceHost = url.hostname.toLowerCase() === referenceHostname
    const isProxyHost = url.origin === proxy.origin

    if (!isReferenceHost && !isProxyHost) return route.continue()

    if (isReferenceHost) {
      url.protocol = proxy.protocol
      url.hostname = proxy.hostname
      url.port = proxy.port
    }

    return route.continue({ url: url.href })
  })
})

const settlePage = async (
  page: import('@playwright/test').Page,
  allowedMissingImagePaths: readonly string[] = [],
) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
      }

      nextjs-portal {
        display: none !important;
      }
    `,
  })

  const failedImages = await page.evaluate(async () => {
    await document.fonts.ready

    const resetCarousels = () => {
      for (const element of document.querySelectorAll<
        HTMLElement & {
          swiper?: {
            autoplay?: { stop?: () => void }
            slideTo?: (index: number, speed?: number, runCallbacks?: boolean) => void
            slideToLoop?: (index: number, speed?: number, runCallbacks?: boolean) => void
          }
        }
      >('.swiper')) {
        element.swiper?.autoplay?.stop?.()
        if (element.swiper?.slideToLoop) element.swiper.slideToLoop(0, 0, false)
        else element.swiper?.slideTo?.(0, 0, false)
      }
    }

    resetCarousels()

    const renderedImages = [...document.images].filter((image) => {
      const bounds = image.getBoundingClientRect()
      return bounds.width > 0 && bounds.height > 0
    })

    // A full-page screenshot does not make native lazy images intersect the viewport. Promote
    // only layout-bearing images for deterministic capture; hidden mega-menu media stays lazy.
    for (const image of renderedImages) image.loading = 'eager'

    for (let offset = 0; offset < document.documentElement.scrollHeight; offset += innerHeight) {
      window.scrollTo(0, offset)
      await new Promise((resolve) => window.setTimeout(resolve, 40))
    }
    window.scrollTo(0, 0)
    resetCarousels()

    await Promise.all(
      renderedImages
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) =>
          Promise.race([
            image.decode().catch(() => undefined),
            new Promise((resolve) => window.setTimeout(resolve, 12_000)),
          ]),
        ),
    )

    return renderedImages
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src)
  })

  const unexpectedFailedImages = failedImages.filter((source) => {
    try {
      return !allowedMissingImagePaths.includes(new URL(source).pathname)
    } catch {
      return true
    }
  })

  expect(unexpectedFailedImages, 'Every visible image must load before visual capture').toEqual([])
}

const waitForHomeCharts = async (page: import('@playwright/test').Page) => {
  const chartRoots = page.locator('svg.highcharts-root')

  await expect(chartRoots, 'Home must render both Highcharts instances before capture').toHaveCount(
    2,
  )
  await expect
    .poll(
      () =>
        chartRoots.evaluateAll((roots) =>
          roots.map((root) =>
            [...root.querySelectorAll<SVGGraphicsElement>('.highcharts-point')].some((point) => {
              const bounds = point.getBoundingClientRect()
              return bounds.width > 0 && bounds.height > 0
            }),
          ),
        ),
      {
        message: 'Every Home chart must contain visible plotted geometry before capture',
        timeout: 15_000,
      },
    )
    .toEqual([true, true])
}

const waitForConnectionsMap = async (page: import('@playwright/test').Page) => {
  const mapFigures = page.locator(
    '.trayport-coverage-map:has(.trayport-coverage-map__interactive[data-map-provider="mapbox"])',
  )
  const mapCount = await mapFigures.count()
  if (mapCount === 0) return

  for (let index = 0; index < mapCount; index += 1) {
    await mapFigures.nth(index).scrollIntoViewIfNeeded()
  }

  await expect
    .poll(
      () =>
        mapFigures.evaluateAll((figures) =>
          figures.map(
            (figure) =>
              (figure as HTMLElement).dataset.mapReady === 'true' ||
              (figure as HTMLElement).dataset.mapError === 'true',
          ),
        ),
      {
        message: 'Configured connection maps must settle to the runtime or explicit fallback',
        timeout: 20_000,
      },
    )
    .toEqual(Array.from({ length: mapCount }, () => true))

  await page.evaluate(() => window.scrollTo(0, 0))
}

/**
 * Whether a tighter budget would also have passed.
 *
 * The ratchet only works in both directions if an improvement is forced into the recorded number.
 * Playwright reports the measured ratio on failure but not on success, so the only way to detect
 * unused headroom is to re-run the comparison against a tighter bound and see whether it holds.
 */
const passesAt = async (
  page: import('@playwright/test').Page,
  name: string,
  maxDiffPixelRatio: number,
): Promise<boolean> => {
  try {
    await expect(page).toHaveScreenshot(name, {
      fullPage: true,
      maxDiffPixelRatio,
      timeout: 20_000,
    })
    return true
  } catch {
    return false
  }
}

/** Height in pixels from a PNG's IHDR chunk, which begins at a fixed offset after the signature. */
const pngHeight = (buffer: Buffer): number => buffer.readUInt32BE(20)

const referenceHeight = (route: string, project: string): number | null => {
  const file = path.resolve(
    process.cwd(),
    'tests/visual/reference',
    project,
    `${route}.png`,
  )
  return fs.existsSync(file) ? pngHeight(fs.readFileSync(file)) : null
}

for (const route of goldenRoutes) {
  test(`${route.name} matches the approved WordPress reference`, async ({ baseURL, page }) => {
    const isReferenceCapture = isReferenceBaseURL(baseURL)
    const response = await page.goto(route.path, { waitUntil: 'networkidle' })
    expect(response?.ok()).toBe(true)
    const routeIdentity = isReferenceCapture
      ? page.locator('main .h1').filter({ hasText: route.heading, visible: true }).first()
      : page.getByRole('heading', { exact: true, level: 1, name: route.heading })

    await expect(routeIdentity).toBeVisible()
    await expect(routeIdentity).toHaveText(route.heading)
    await settlePage(
      page,
      isReferenceCapture ? allowedMissingReferenceImages[route.name] : undefined,
    )
    await waitForConnectionsMap(page)
    if (route.name === 'home') await waitForHomeCharts(page)

    // Reference capture writes the baseline; it has nothing to compare against yet.
    if (isReferenceCapture) {
      await expect(page).toHaveScreenshot(`${route.name}.png`, { fullPage: true })
      return
    }

    const project = test.info().project.name as VisualProject
    const budget = budgetFor(route.name, project)
    expect(
      budget,
      `${route.name}/${project} has no visual budget. Add one to tests/visual/acceptance.ts before capturing it.`,
    ).toBeDefined()

    // Tier 2 — height parity. Measured first because it is the more informative signal and because
    // toHaveScreenshot cannot compare images of different sizes at all.
    const expectedHeight = referenceHeight(route.name, project)
    expect(expectedHeight, `No tracked reference for ${route.name}/${project}`).not.toBeNull()

    const actualHeight = pngHeight(await page.screenshot({ fullPage: true }))
    const delta = Math.abs(actualHeight - expectedHeight!)

    expect(
      delta,
      `${route.name}/${project} full-page height is ${actualHeight} against a reference of ${expectedHeight} (delta ${delta}, budget ${budget!.maxHeightDelta}). Heights ratchet down.`,
    ).toBeLessThanOrEqual(budget!.maxHeightDelta)

    expect(
      delta,
      `${route.name}/${project} height delta is ${delta}, below its recorded budget of ${budget!.maxHeightDelta}. Lower maxHeightDelta in tests/visual/acceptance.ts.`,
    ).toBeGreaterThanOrEqual(budget!.maxHeightDelta)

    // Tier 3 — pixel comparison, only meaningful once the heights agree. Where they do not, the
    // comparison is pending rather than skipped: the height assertion above is what holds the line.
    if (delta !== 0) {
      test.info().annotations.push({
        type: 'pixel-comparison-pending',
        description: `Height differs by ${delta}px; pixel acceptance cannot run until it reaches 0.`,
      })
      return
    }

    await expect(page).toHaveScreenshot(`${route.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: budget!.maxDiffPixelRatio,
    })

    // The ratchet. A budget carrying more than MAX_BUDGET_SLACK of unused headroom is stale, and
    // leaving it there banks room for a later regression to spend unnoticed.
    const tighter = Number((budget!.maxDiffPixelRatio - MAX_BUDGET_SLACK).toFixed(4))
    if (tighter > 0) {
      expect(
        await passesAt(page, `${route.name}.png`, tighter),
        `${route.name}/${project} now passes at ${tighter}, below its recorded budget of ${
          budget!.maxDiffPixelRatio
        }. Lower maxDiffPixelRatio in tests/visual/acceptance.ts — budgets ratchet down.`,
      ).toBe(false)
    }
  })
}
