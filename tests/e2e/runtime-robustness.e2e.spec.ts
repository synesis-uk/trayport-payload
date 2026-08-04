import { expect, test, type ConsoleMessage, type Request, type Response } from '@playwright/test'

import { managedRedirectRoutes, representativeRoutes } from '../helpers/site'

const criticalResourceTypes = new Set(['document', 'font', 'image', 'script', 'stylesheet'])

const isNextRSCRequest = (request: Request): boolean => {
  const headers = request.headers()
  return new URL(request.url()).searchParams.has('_rsc') || headers.rsc === '1'
}

type RuntimeIssue = {
  detail: string
  kind: 'console' | 'http' | 'pageerror' | 'requestfailed'
  url?: string
}

const consoleIssue = (message: ConsoleMessage): RuntimeIssue | null => {
  if (message.type() !== 'error') return null

  // Do not suppress errors by message. Errors in the browser console are
  // actionable even when the route still paints successfully.
  return {
    detail: message.text(),
    kind: 'console',
    url: message.location().url || undefined,
  }
}

const failedRequestIssue = (request: Request): RuntimeIssue | null => {
  // Fetch/XHR includes cancellable Next.js prefetching, and media streams may
  // intentionally abort range requests. Critical render resources are never
  // filtered by error text and must load successfully.
  if (!criticalResourceTypes.has(request.resourceType()) && !isNextRSCRequest(request)) return null

  return {
    detail: `${request.resourceType()}: ${request.failure()?.errorText || 'unknown failure'}`,
    kind: 'requestfailed',
    url: request.url(),
  }
}

const failedResponseIssue = (response: Response): RuntimeIssue | null => {
  if (
    response.status() < 400 ||
    (!criticalResourceTypes.has(response.request().resourceType()) &&
      !isNextRSCRequest(response.request()))
  ) {
    return null
  }

  return {
    detail: `${response.request().resourceType()}: HTTP ${response.status()}`,
    kind: 'http',
    url: response.url(),
  }
}

const loadAllImages = async (page: import('@playwright/test').Page) => {
  await page.evaluate(async () => {
    await document.fonts.ready

    const renderedImages = [...document.images].filter(
      (image) => image.getClientRects().length > 0 && !image.closest('details:not([open])'),
    )

    // Move each rendered image into the viewport before waiting. A fast page
    // sweep can outrun native lazy loading and produce false broken-image hits.
    for (const image of renderedImages) {
      image.scrollIntoView({ block: 'center' })
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      )

      if (image.complete) continue

      await Promise.race([
        new Promise<void>((resolve) => {
          image.addEventListener('error', () => resolve(), { once: true })
          image.addEventListener('load', () => resolve(), { once: true })
        }),
        new Promise<void>((resolve) => window.setTimeout(resolve, 5_000)),
      ])
    }

    window.scrollTo(0, 0)
  })
}

for (const route of [...representativeRoutes, ...managedRedirectRoutes]) {
  test(`WordPress ${route.legacyId} has no browser runtime, RSC, or critical asset failures`, async ({
    page,
  }, testInfo) => {
    const issues: RuntimeIssue[] = []

    page.on('console', (message) => {
      const issue = consoleIssue(message)
      if (issue) issues.push(issue)
    })
    page.on('pageerror', (error) => {
      issues.push({ detail: error.stack || error.message, kind: 'pageerror' })
    })
    page.on('requestfailed', (request) => {
      const issue = failedRequestIssue(request)
      if (issue) issues.push(issue)
    })
    page.on('response', (response) => {
      const issue = failedResponseIssue(response)
      if (issue) issues.push(issue)
    })

    const response = await page.goto(route.path, { waitUntil: 'networkidle' })
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('main')).toBeVisible()

    await loadAllImages(page)
    await page.waitForLoadState('networkidle')

    if (route.legacyId === 1926) {
      const mediaFeatures = page.locator('details:has(.trayport-faq__answer--media img)')
      await expect(mediaFeatures).toHaveCount(5)

      for (let index = 0; index < (await mediaFeatures.count()); index += 1) {
        const feature = mediaFeatures.nth(index)
        const featureImage = feature.locator('.trayport-faq__answer--media img').first()

        await feature.locator('summary').click()
        await expect(feature).toHaveAttribute('open', '')
        await featureImage.scrollIntoViewIfNeeded()
        await expect
          .poll(() =>
            featureImage.evaluate((node) => {
              const image = node as HTMLImageElement
              return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0
            }),
          )
          .toBe(true)
        expect(await featureImage.getAttribute('src')).toContain('/_next/image/')
      }
    }

    const brokenImages = await page.locator('img').evaluateAll((nodes) =>
      nodes
        .map((node) => node as HTMLImageElement)
        .filter(
          (image) =>
            image.getClientRects().length > 0 &&
            !image.closest('details:not([open])') &&
            (!image.complete || image.naturalWidth === 0),
        )
        .map((image) => ({
          alt: image.alt,
          src: image.currentSrc || image.src,
        })),
    )

    await testInfo.attach(`runtime-wp-${route.legacyId}-${testInfo.project.name}.json`, {
      body: JSON.stringify({ brokenImages, issues }, null, 2),
      contentType: 'application/json',
    })

    expect(brokenImages, `${route.path} contains broken rendered images`).toEqual([])
    expect(
      issues,
      issues
        .map((issue) => `${issue.kind}: ${issue.detail}${issue.url ? ` (${issue.url})` : ''}`)
        .join('\n'),
    ).toEqual([])
  })
}
