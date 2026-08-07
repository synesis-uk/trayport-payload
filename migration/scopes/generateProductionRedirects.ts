/**
 * Regenerates `productionRedirects.ts` from a verified production target plan.
 *
 * The WordPress `redirect` post type is not exported by the extract, so these rules come from the
 * inventory's source snapshot instead. Only candidates the plan marks `active` are emitted: the
 * rest are held for review because their destination is unresolved, non-public, excluded, missing,
 * or duplicated by another rule.
 *
 *   corepack pnpm exec tsx migration/scopes/generateProductionRedirects.ts [--run-id <inventory-run>]
 */
import fs from 'node:fs'
import path from 'node:path'

type PlanRoute = {
  canonicalPath: string | null
  legacyId: number | null
  targetCollection: string | null
}

type PlanRedirect = {
  decision: string
  from: string
  httpStatus: number
  legacyId: number
  normalizedTarget: string | null
}

const workDir = process.env.MIGRATION_WORK_DIR || './migration/work'
const inventoryDir = path.resolve(workDir, 'inventory')

const requestedRunId = process.argv.includes('--run-id')
  ? process.argv[process.argv.indexOf('--run-id') + 1]
  : undefined

const runId =
  requestedRunId ||
  fs
    .readdirSync(inventoryDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse()
    .find((name) => fs.existsSync(path.join(inventoryDir, name, 'production-target-plan.json')))

if (!runId) throw new Error(`No production target plan found under ${inventoryDir}`)

const plan = JSON.parse(
  fs.readFileSync(path.join(inventoryDir, runId, 'production-target-plan.json'), 'utf8'),
) as { redirects: PlanRedirect[]; routes: PlanRoute[] }

const routeByPath = new Map(
  plan.routes.flatMap((route) => (route.canonicalPath ? [[route.canonicalPath, route]] : [])),
)

const quote = (value: string | null) =>
  `'${(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

/**
 * Rules whose source is a WordPress upload path redirect an asset, not a route. Media is served
 * from object storage rather than /wp-content/, so those belong to media disposition rather than
 * the route redirect set.
 */
const isAssetPath = (from: string) => from.startsWith('/wp-content/')

const active = plan.redirects
  .filter((redirect) => redirect.decision === 'active' && !isAssetPath(redirect.from))
  .sort((left, right) => left.from.localeCompare(right.from))

const lines = [
  '// GENERATED FILE — do not edit by hand.',
  '//',
  '// Active WordPress redirect rules, derived from the verified production target plan.',
  '// Regenerate with:',
  '//   corepack pnpm exec tsx migration/scopes/generateProductionRedirects.ts',
  '//',
  "// The exporter does not emit the `redirect` post type, so these come from the inventory's",
  '// source snapshot rather than the extract. `targetOwner` names the collection that owns the',
  '// destination path, so the loader can resolve a managed reference rather than a raw URL.',
  '',
  'export const productionRedirects = [',
]

const unresolved: string[] = []
for (const redirect of active) {
  const target = redirect.normalizedTarget ? routeByPath.get(redirect.normalizedTarget) : undefined
  if (!target || typeof target.legacyId !== 'number') {
    unresolved.push(redirect.from)
    continue
  }
  lines.push('  {')
  lines.push(`    legacyId: ${redirect.legacyId},`)
  lines.push(`    from: ${quote(redirect.from)},`)
  lines.push(`    to: ${quote(redirect.normalizedTarget)},`)
  lines.push(`    targetOwner: ${quote(target.targetCollection)},`)
  lines.push(`    targetLegacyId: ${target.legacyId},`)
  lines.push(`    type: ${quote(String(redirect.httpStatus))},`)
  lines.push('  },')
}

lines.push('] as const', '')

fs.writeFileSync(path.resolve('migration/scopes/productionRedirects.ts'), lines.join('\n'))
process.stdout.write(
  `Wrote ${active.length - unresolved.length} redirects from ${runId}` +
    (unresolved.length ? `; ${unresolved.length} unresolved: ${unresolved.join(', ')}\n` : '\n'),
)
