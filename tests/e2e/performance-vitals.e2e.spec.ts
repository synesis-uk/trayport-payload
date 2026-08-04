import { expect, test } from '@playwright/test'

import { goldenRoutes } from '../helpers/site'

type ObserverEvidence = {
  cls: number
  fcpMs: number | null
  lcp: {
    size: number | null
    startTimeMs: number
    url: string | null
  } | null
  support: {
    layoutShift: boolean
    largestContentfulPaint: boolean
    paint: boolean
  }
}

type ResourceSummary = {
  count: number
  decodedBodyBytes: number
  encodedBodyBytes: number
  transferBytes: number
  zeroTransferCount: number
}

type PerformanceEvidence = {
  metrics: {
    cls: number
    fcpMs: number | null
    lcpMs: number | null
    loadMs: number | null
    ttfbMs: number | null
  }
  navigation: {
    decodedBodyBytes: number
    encodedBodyBytes: number
    redirectCount: number
    transferBytes: number
    type: string
  } | null
  observers: ObserverEvidence
  resources: ResourceSummary & {
    byInitiatorType: Record<string, ResourceSummary>
  }
  totalTransferBytes: number | null
}

declare global {
  interface Window {
    __trayportPerformanceEvidence?: ObserverEvidence
  }
}

const installPerformanceObservers = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => {
    performance.setResourceTimingBufferSize(2_000)

    const supportedEntryTypes = new Set(PerformanceObserver.supportedEntryTypes)
    const evidence: ObserverEvidence = {
      cls: 0,
      fcpMs: null,
      lcp: null,
      support: {
        layoutShift: supportedEntryTypes.has('layout-shift'),
        largestContentfulPaint: supportedEntryTypes.has('largest-contentful-paint'),
        paint: supportedEntryTypes.has('paint'),
      },
    }

    window.__trayportPerformanceEvidence = evidence

    if (evidence.support.largestContentfulPaint) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const entry = entries.at(-1) as
          | (PerformanceEntry & {
              size?: number
              url?: string
            })
          | undefined

        if (!entry) return
        evidence.lcp = {
          size: typeof entry.size === 'number' ? entry.size : null,
          startTimeMs: entry.startTime,
          url: entry.url || null,
        }
      }).observe({ buffered: true, type: 'largest-contentful-paint' })
    }

    if (evidence.support.layoutShift) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<
          PerformanceEntry & { hadRecentInput?: boolean; value?: number }
        >) {
          if (!entry.hadRecentInput && typeof entry.value === 'number') {
            evidence.cls += entry.value
          }
        }
      }).observe({ buffered: true, type: 'layout-shift' })
    }

    if (evidence.support.paint) {
      new PerformanceObserver((list) => {
        const firstContentfulPaint = list
          .getEntries()
          .find((entry) => entry.name === 'first-contentful-paint')

        if (firstContentfulPaint) evidence.fcpMs = firstContentfulPaint.startTime
      }).observe({ buffered: true, type: 'paint' })
    }
  })
}

const collectPerformanceEvidence = async (
  page: import('@playwright/test').Page,
): Promise<PerformanceEvidence> =>
  page.evaluate(() => {
    const observers = window.__trayportPerformanceEvidence ?? {
      cls: 0,
      fcpMs: null,
      lcp: null,
      support: {
        layoutShift: false,
        largestContentfulPaint: false,
        paint: false,
      },
    }
    const navigation = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const resourceSummary = resources.reduce(
      (summary, resource) => {
        const initiatorType = resource.initiatorType || 'other'
        const initiatorSummary = summary.byInitiatorType[initiatorType] ?? {
          count: 0,
          decodedBodyBytes: 0,
          encodedBodyBytes: 0,
          transferBytes: 0,
          zeroTransferCount: 0,
        }

        summary.count += 1
        summary.decodedBodyBytes += resource.decodedBodySize
        summary.encodedBodyBytes += resource.encodedBodySize
        summary.transferBytes += resource.transferSize
        summary.zeroTransferCount += Number(resource.transferSize === 0)

        initiatorSummary.count += 1
        initiatorSummary.decodedBodyBytes += resource.decodedBodySize
        initiatorSummary.encodedBodyBytes += resource.encodedBodySize
        initiatorSummary.transferBytes += resource.transferSize
        initiatorSummary.zeroTransferCount += Number(resource.transferSize === 0)
        summary.byInitiatorType[initiatorType] = initiatorSummary

        return summary
      },
      {
        count: 0,
        decodedBodyBytes: 0,
        encodedBodyBytes: 0,
        transferBytes: 0,
        zeroTransferCount: 0,
        byInitiatorType: {} as Record<string, ResourceSummary>,
      },
    )

    return {
      metrics: {
        cls: observers.cls,
        fcpMs: observers.fcpMs,
        lcpMs: observers.lcp?.startTimeMs ?? null,
        loadMs: navigation ? navigation.loadEventEnd - navigation.startTime : null,
        ttfbMs: navigation ? navigation.responseStart - navigation.requestStart : null,
      },
      navigation: navigation
        ? {
            decodedBodyBytes: navigation.decodedBodySize,
            encodedBodyBytes: navigation.encodedBodySize,
            redirectCount: navigation.redirectCount,
            transferBytes: navigation.transferSize,
            type: navigation.type,
          }
        : null,
      observers,
      resources: resourceSummary,
      totalTransferBytes: navigation
        ? navigation.transferSize + resourceSummary.transferBytes
        : null,
    }
  })

test.describe('golden-route performance evidence', () => {
  for (const route of goldenRoutes) {
    test(`${route.name} records browser performance evidence`, async ({
      browserName,
      page,
    }, testInfo) => {
      await installPerformanceObservers(page)

      const response = await page.goto(route.path, { waitUntil: 'load' })
      expect(response?.ok()).toBe(true)
      await expect(page.getByRole('main')).toBeVisible()
      await page.evaluate(async () => {
        await document.fonts.ready
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        )
      })

      await expect
        .poll(
          () =>
            page.evaluate(() => ({
              fcpMs: window.__trayportPerformanceEvidence?.fcpMs ?? null,
              lcpMs: window.__trayportPerformanceEvidence?.lcp?.startTimeMs ?? null,
            })),
          { message: `${route.path} should emit paint performance entries` },
        )
        .toMatchObject({
          fcpMs: expect.any(Number),
          lcpMs: expect.any(Number),
        })

      const evidence = await collectPerformanceEvidence(page)
      const viewport = page.viewportSize()
      const artifact = {
        browser: browserName,
        capturedAt: new Date().toISOString(),
        evidence,
        project: testInfo.project.name,
        route,
        schemaVersion: 1,
        userAgent: await page.evaluate(() => navigator.userAgent),
        viewport: {
          devicePixelRatio: await page.evaluate(() => window.devicePixelRatio),
          height: viewport?.height ?? null,
          width: viewport?.width ?? null,
        },
      }

      await testInfo.attach(`performance-vitals-${route.name}-${testInfo.project.name}.json`, {
        body: JSON.stringify(artifact, null, 2),
        contentType: 'application/json',
      })

      expect(evidence.navigation).not.toBeNull()
      expect(evidence.observers.support).toEqual({
        layoutShift: true,
        largestContentfulPaint: true,
        paint: true,
      })
      expect(evidence.metrics.fcpMs).not.toBeNull()
      expect(evidence.metrics.lcpMs).not.toBeNull()
      expect(evidence.metrics.loadMs).not.toBeNull()
      expect(evidence.metrics.ttfbMs).not.toBeNull()
      expect(Number.isFinite(evidence.metrics.cls)).toBe(true)
    })
  }
})
