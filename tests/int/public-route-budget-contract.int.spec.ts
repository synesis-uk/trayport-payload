// @vitest-environment node

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const packageJSON = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
) as { scripts: Record<string, string> }
const budgets = JSON.parse(
  readFileSync(new URL('../../scripts/public-route-budgets.json', import.meta.url), 'utf8'),
) as {
  forbiddenFirstLoadCSSStrings: string[]
  forbiddenFirstLoadStrings: string[]
  routes: Array<{
    budgets: { jsGzipBytes: number }
    route: string
  }>
}
const script = readFileSync(
  new URL('../../scripts/check-public-route-budgets.mjs', import.meta.url),
  'utf8',
)

describe('public route budget gate', () => {
  it('runs after the existing layout-entry check and before sitemap generation', () => {
    expect(packageJSON.scripts.postbuild).toBe(
      'node scripts/check-public-shell-budget.mjs && node scripts/check-public-route-budgets.mjs && next-sitemap --config next-sitemap.config.cjs',
    )
  })

  it('bounds both public route patterns and the not-found shell', () => {
    expect(budgets.routes.map(({ route }) => route)).toEqual(['/', '/[...segments]', '/_not-found'])
    expect(
      budgets.routes.find(({ route }) => route === '/')?.budgets.jsGzipBytes,
    ).toBeLessThanOrEqual(216 * 1024)
    expect(
      budgets.routes.find(({ route }) => route === '/[...segments]')?.budgets.jsGzipBytes,
    ).toBeLessThanOrEqual(216 * 1024)
  })

  it('fails closed on missing artifacts, bundle-stat drift, and optional implementation leaks', () => {
    expect(script).toContain('.next/diagnostics/route-bundle-stats.json')
    expect(script).toContain('firstLoadUncompressedJsBytes')
    expect(script).toContain('gzipSync(readFileSync(path), { level: 9 })')
    expect(script).toContain('missing declared build artifact')
    expect(script).toContain('public-route-budget-report.json')

    for (const sentinel of [
      'Featured insights',
      'Trayport login required',
      'autoTRADER connection',
      'This browser cannot play the video.',
      'data-trayport-chart-runtime',
      'Mapbox GL JS',
      'Previous slide',
      'RefreshRouteOnSave',
    ]) {
      expect(budgets.forbiddenFirstLoadStrings).toContain(sentinel)
    }
    expect(budgets.forbiddenFirstLoadCSSStrings).toContain('mapboxgl-ctrl-logo')
  })
})
