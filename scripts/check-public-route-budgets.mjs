import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { gzipSync } from 'node:zlib'

const CONFIG_PATH = resolve('scripts/public-route-budgets.json')
const ROUTE_STATS_PATH = resolve('.next/diagnostics/route-bundle-stats.json')
const REPORT_PATH = resolve('.next/diagnostics/public-route-budget-report.json')
const NEXT_ROOT = resolve('.next')
const STATIC_ROOT = resolve('.next/static')

const fail = (message) => {
  console.error(`[public-route-budget] ${message}`)
  process.exit(1)
}

const readJSON = (path, label) => {
  if (!existsSync(path)) fail(`missing ${label}: ${path}`)
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    fail(`could not parse ${label}: ${error.message}`)
  }
}

const unique = (values) => [...new Set(values)].sort()

const measurementsFor = (paths) => {
  const files = unique(paths)
  for (const path of files) {
    if (!existsSync(path)) fail(`missing declared build artifact: ${path}`)
  }

  return {
    chunks: files.length,
    files: files.map((path) => relative(process.cwd(), path)),
    gzipBytes: files.reduce(
      (total, path) => total + gzipSync(readFileSync(path), { level: 9 }).byteLength,
      0,
    ),
    rawBytes: files.reduce((total, path) => total + statSync(path).size, 0),
  }
}

const localStylesheets = (htmlSource) => {
  const links = htmlSource.match(/<link\b[^>]*>/giu) || []

  return unique(
    links.flatMap((link) => {
      if (!/\brel=["']stylesheet["']/iu.test(link)) return []
      const href = link.match(/\bhref=["']([^"']+)["']/iu)?.[1]
      if (!href) fail(`stylesheet link is missing href: ${link}`)

      const url = new URL(href, 'https://build.invalid')
      if (url.origin !== 'https://build.invalid' || !url.pathname.startsWith('/_next/static/')) {
        fail(`public shell declares a non-local stylesheet: ${href}`)
      }

      const absolutePath = resolve(NEXT_ROOT, `.${url.pathname.replace(/^\/_next/u, '')}`)
      if (absolutePath !== STATIC_ROOT && !absolutePath.startsWith(`${STATIC_ROOT}${sep}`)) {
        fail(`stylesheet path escapes the Next static root: ${href}`)
      }
      return [absolutePath]
    }),
  )
}

const segmentFiles = (segmentsPath) => {
  if (!existsSync(segmentsPath)) fail(`missing segment artifact directory: ${segmentsPath}`)
  return readdirSync(segmentsPath, { recursive: true })
    .filter((entry) => String(entry).endsWith('.segment.rsc'))
    .map((entry) => resolve(segmentsPath, String(entry)))
}

const budgetKeys = {
  allSegmentRSCGzipBytes: ['allSegmentRSC', 'gzipBytes'],
  allSegmentRSCRawBytes: ['allSegmentRSC', 'rawBytes'],
  cssChunks: ['css', 'chunks'],
  cssGzipBytes: ['css', 'gzipBytes'],
  cssRawBytes: ['css', 'rawBytes'],
  fullSegmentRSCGzipBytes: ['fullSegmentRSC', 'gzipBytes'],
  fullSegmentRSCRawBytes: ['fullSegmentRSC', 'rawBytes'],
  htmlGzipBytes: ['html', 'gzipBytes'],
  htmlRawBytes: ['html', 'rawBytes'],
  jsChunks: ['js', 'chunks'],
  jsGzipBytes: ['js', 'gzipBytes'],
  jsRawBytes: ['js', 'rawBytes'],
}

const config = readJSON(CONFIG_PATH, 'public route budget configuration')
const routeStats = readJSON(ROUTE_STATS_PATH, 'Next route bundle statistics')
if (!Array.isArray(routeStats)) fail('Next route bundle statistics must be an array')
if (!Array.isArray(config.routes) || !config.routes.length)
  fail('no public route budgets configured')

const errors = []
const results = []

for (const routeConfig of config.routes) {
  const stats = routeStats.find((entry) => entry.route === routeConfig.route)
  if (!stats) fail(`missing Next bundle statistics for ${routeConfig.route}`)

  const jsPaths = unique(stats.firstLoadChunkPaths || []).map((path) => resolve(path))
  const js = measurementsFor(jsPaths)
  if (js.rawBytes !== stats.firstLoadUncompressedJsBytes) {
    errors.push(
      `${routeConfig.route} JS raw-byte total ${js.rawBytes} does not match Next's ${stats.firstLoadUncompressedJsBytes}`,
    )
  }

  const htmlPath = resolve(routeConfig.artifacts.html)
  if (!existsSync(htmlPath)) fail(`missing HTML artifact for ${routeConfig.route}: ${htmlPath}`)
  const htmlSource = readFileSync(htmlPath)
  const html = measurementsFor([htmlPath])
  const cssPaths = localStylesheets(htmlSource.toString('utf8'))
  const css = measurementsFor(cssPaths)
  const segmentsPath = resolve(routeConfig.artifacts.segments)
  const allSegmentRSC = measurementsFor(segmentFiles(segmentsPath))
  const fullSegmentRSC = measurementsFor([resolve(segmentsPath, '_full.segment.rsc')])
  const metrics = { allSegmentRSC, css, fullSegmentRSC, html, js }

  const forbiddenStrings = (config.forbiddenFirstLoadStrings || []).filter((sentinel) =>
    jsPaths.some((path) => readFileSync(path, 'utf8').includes(sentinel)),
  )
  if (forbiddenStrings.length) {
    errors.push(
      `${routeConfig.route} first-load JS contains optional/CMS sentinels: ${forbiddenStrings.join(', ')}`,
    )
  }
  const forbiddenCSSStrings = (config.forbiddenFirstLoadCSSStrings || []).filter((sentinel) =>
    cssPaths.some((path) => readFileSync(path, 'utf8').includes(sentinel)),
  )
  if (forbiddenCSSStrings.length) {
    errors.push(
      `${routeConfig.route} first-load CSS contains optional sentinels: ${forbiddenCSSStrings.join(', ')}`,
    )
  }

  for (const [budgetName, limit] of Object.entries(routeConfig.budgets || {})) {
    const metricPath = budgetKeys[budgetName]
    if (!metricPath) fail(`unknown budget ${budgetName} for ${routeConfig.route}`)
    const [group, field] = metricPath
    const actual = metrics[group][field]
    if (actual > limit) {
      errors.push(`${routeConfig.route} ${budgetName} is ${actual}; budget is ${limit}`)
    }
  }

  results.push({
    budgets: routeConfig.budgets,
    forbiddenCSSStrings,
    forbiddenStrings,
    metrics,
    route: routeConfig.route,
  })
}

const report = {
  generatedAt: new Date().toISOString(),
  results: results.sort((left, right) => left.route.localeCompare(right.route)),
  schemaVersion: 1,
}
mkdirSync(dirname(REPORT_PATH), { recursive: true })
writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

if (errors.length) fail(errors.join('\n[public-route-budget] '))

for (const result of results) {
  console.log(
    `[public-route-budget] ${result.route}: ${result.metrics.js.gzipBytes} JS gzip bytes, ${result.metrics.css.gzipBytes} CSS gzip bytes, ${result.metrics.allSegmentRSC.gzipBytes} segment RSC gzip bytes`,
  )
}
