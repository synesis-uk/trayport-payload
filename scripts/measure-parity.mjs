/**
 * Measures how far each archetype has drifted from the WordPress reference, by full-page height.
 *
 * This exists because the visual suite cannot answer the question. All five of its golden routes
 * carry route-specific parity CSS, so they sit within ~100px of the reference while routes nobody
 * has hand-tuned average nearly ten times that. The suite reports on the tuned sample and is blind
 * to the rest; this samples across every route-owning archetype instead.
 *
 * Height is a proxy, deliberately. It is not the acceptance bar — that is "indistinguishable to a
 * client, or clearly better", which no number captures. What a large height delta reliably means is
 * that a *component is laid out wrongly* rather than styled slightly differently, and that is the
 * work C2 exists to do. Treat it as a triage signal for where to look, never as a score to optimise.
 *
 *   corepack pnpm measure:parity
 *   corepack pnpm measure:parity -- --viewport mobile --json output/parity.json
 *
 * Requires both origins to be running. The reference is served through the audited read-only
 * forwarder described in tests/visual/reference/README.md, which sets the upstream Host itself.
 */
import fs from 'node:fs'

import { chromium } from '@playwright/test'

const arg = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`)
  return index >= 0 ? process.argv[index + 1] : fallback
}

const OURS = arg('ours', process.env.PARITY_OURS || 'http://127.0.0.1:3000')
const REF = arg('reference', process.env.PARITY_REFERENCE || 'http://127.0.0.1:3090')
const VIEWPORT = arg('viewport', 'desktop')
const JSON_OUT = arg('json', null)

/**
 * Playwright expects the viewport nested under `viewport`, not spread at the top level of
 * `newContext`. Spreading it silently leaves the default 1280x720 in place and every measurement
 * reads the same regardless of the flag, which is exactly what happened on the first run.
 */
const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 1000 } },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
}

/**
 * One or more routes per route-owning archetype, weighted towards the ones with no parity CSS.
 * `routes` is how many published routes that archetype owns, which is what turns a mean delta into
 * an impact ranking — a 200px error across 93 articles matters more than 1400px on a single page.
 */
const SAMPLE = [
  { archetype: 'page.homepage', routes: 1, paths: ['/'] },
  { archetype: 'page.standard', routes: 17, paths: ['/company/about-us/', '/company/offices/', '/company/careers/', '/resources/faqs/'] },
  { archetype: 'page.product', routes: 22, paths: ['/products/joule/', '/products/tradesignal/', '/products/api-connectivity/', '/products/broker-trading-system/'] },
  { archetype: 'page.legal', routes: 5, paths: ['/legal/legal-notice/', '/legal/cookie-policy/'] },
  { archetype: 'page.content-index', routes: 5, paths: ['/resources/insights/', '/resources/news/', '/learning-hub/'] },
  { archetype: 'page.interactive-market-matrix', routes: 1, paths: ['/resources/market-matrix/'] },
  { archetype: 'article.full', routes: 93, paths: ['/insights/the-role-of-algorithms-in-energy-trading/', '/insights/the-future-of-automation-in-energy-trading-markets/', '/event/e-world-2026/'] },
  { archetype: 'person.public-profile', routes: 17, paths: ['/people/andreas-hoff/'] },
  { archetype: 'hub.public-page', routes: 72, paths: ['/market-coverage/german-power/', '/market-coverage/acx/'] },
  { archetype: 'venue.public-detail', routes: 66, paths: ['/venue/eex/', '/venue/42-financial/'] },
  { archetype: 'learning-video.public-detail', routes: 15, paths: ['/learning-hub-video/scanner/'] },
  // Excluded from every earlier measurement because they never reached networkidle.
  { archetype: 'page.landing', routes: 3, paths: ['/regions/europe/', '/regions/asia-pacific/'] },
]

const settle = async (page) => {
  await page.addStyleTag({
    content: '*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}',
  })
  await page.evaluate(async () => {
    await document.fonts.ready
    for (const image of document.images) image.loading = 'eager'
    for (let offset = 0; offset < document.documentElement.scrollHeight; offset += innerHeight) {
      window.scrollTo(0, offset)
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(350)
}

const measure = async (page, base, route) => {
  try {
    // Deliberately not `networkidle`. The Mapbox runtime polls events.mapbox.com indefinitely on
    // both sites, so five routes — the three /regions/ pages, /products/exchange-connectivity/ and
    // /resources/markets-map/ — never reach it and were being dropped from every measurement
    // without failing anything.
    const response = await page.goto(base + route, { waitUntil: 'load', timeout: 45_000 })
    if (!response?.ok()) return null
    await page.waitForLoadState('domcontentloaded')
    await settle(page)
    return page.evaluate(() => document.documentElement.scrollHeight)
  } catch {
    return null
  }
}

const viewport = VIEWPORTS[VIEWPORT]
if (!viewport) throw new Error(`Unknown viewport "${VIEWPORT}". Expected desktop or mobile.`)

const browser = await chromium.launch()
const page = await (
  await browser.newContext({ ...viewport, deviceScaleFactor: 1, locale: 'en-GB' })
).newPage()

const rows = []
for (const { archetype, paths, routes } of SAMPLE) {
  for (const path of paths) {
    const reference = await measure(page, REF, path)
    const ours = await measure(page, OURS, path)
    rows.push({
      archetype,
      routes,
      path,
      reference,
      ours,
      delta: reference != null && ours != null ? ours - reference : null,
    })
  }
}
await browser.close()

const measured = rows.filter((row) => row.delta != null)
const skipped = rows.filter((row) => row.delta == null)

const byArchetype = new Map()
for (const row of measured) {
  const entry = byArchetype.get(row.archetype) || { routes: row.routes, deltas: [] }
  entry.deltas.push(Math.abs(row.delta))
  byArchetype.set(row.archetype, entry)
}

const ranked = [...byArchetype.entries()]
  .map(([archetype, { deltas, routes }]) => {
    const mean = Math.round(deltas.reduce((total, value) => total + value, 0) / deltas.length)
    return { archetype, routes, sampled: deltas.length, mean, impact: mean * routes }
  })
  .sort((left, right) => right.impact - left.impact)

process.stdout.write(`\nParity measurement — ${VIEWPORT} (${viewport.viewport.width}px)\n`)
process.stdout.write(`  ours      ${OURS}\n  reference ${REF}\n\n`)
for (const row of measured.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))) {
  process.stdout.write(
    `${String(row.delta).padStart(8)}  ${row.path.slice(0, 62).padEnd(62)} ${row.archetype}\n`,
  )
}

process.stdout.write('\nImpact ranking (routes owned x mean absolute delta)\n')
process.stdout.write(
  `${'archetype'.padEnd(32)}${'routes'.padStart(7)}${'sampled'.padStart(8)}${'mean'.padStart(7)}${'impact'.padStart(9)}\n`,
)
for (const row of ranked) {
  process.stdout.write(
    `${row.archetype.padEnd(32)}${String(row.routes).padStart(7)}${String(row.sampled).padStart(8)}${String(row.mean).padStart(7)}${String(row.impact).padStart(9)}\n`,
  )
}

const overall = Math.round(
  measured.reduce((total, row) => total + Math.abs(row.delta), 0) / measured.length,
)
process.stdout.write(`\nmean |delta| over ${measured.length} routes: ${overall}px\n`)
if (skipped.length) {
  process.stdout.write(`unreachable: ${skipped.map((row) => row.path).join(', ')}\n`)
}

if (JSON_OUT) {
  fs.writeFileSync(
    JSON_OUT,
    `${JSON.stringify({ viewport: VIEWPORT, overall, ranked, rows }, null, 2)}\n`,
  )
  process.stdout.write(`\nwrote ${JSON_OUT}\n`)
}
