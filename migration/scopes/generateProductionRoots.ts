/**
 * Regenerates `productionRoots.ts` from a verified production target plan.
 *
 * The public-route corpus is discovery-led: the inventory reads the WordPress source and emits a
 * hashed plan, and this script projects that plan into the extraction root set the migration
 * pipeline consumes. Keeping it generated means the corpus can never drift from the evidence.
 *
 *   corepack pnpm exec tsx migration/scopes/generateProductionRoots.ts [--run-id <inventory-run>]
 */
import fs from 'node:fs'
import path from 'node:path'

/**
 * Post types the WordPress exporter owns as `post` records. `people` routes are owned end to end
 * by the curated-reusable pass, so making them roots would double-emit them as `post` entities the
 * transform cannot map.
 */
const EXPORTER_OWNED_POST_TYPES = new Set([
  'page',
  'post',
  'hub',
  'venue',
  'learning-hub-video',
  'events',
])

type PlanRoute = {
  archetype: string
  authoritativeField: string | null
  canonicalPath: string | null
  legacyId: number | null
  ownerKind: string
  sourcePostType: string | null
  targetCollection: string | null
  template: string | null
  title: string
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

const planPath = path.join(inventoryDir, runId, 'production-target-plan.json')
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8')) as { routes: PlanRoute[] }

const routes = plan.routes
  .filter(
    (route) =>
      route.ownerKind === 'payload-document' &&
      route.sourcePostType &&
      EXPORTER_OWNED_POST_TYPES.has(route.sourcePostType) &&
      typeof route.legacyId === 'number',
  )
  .sort((left, right) => (left.legacyId || 0) - (right.legacyId || 0))

const quote = (value: string | null) =>
  `'${(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

const lines = [
  '// GENERATED FILE — do not edit by hand.',
  '//',
  '// The public-route corpus, derived from the verified production target plan',
  '// (migration/cli.ts inventory --scope production). Regenerate with:',
  '//   corepack pnpm exec tsx migration/scopes/generateProductionRoots.ts',
  '//',
  '// `people` routes are omitted deliberately: they are owned end to end by the curated-reusable',
  '// pass in the exporter, so making them extraction roots would double-emit them as `post`',
  '// records the transform cannot map. The two virtual indexes have no legacy identity.',
  '',
  'export const productionRoots = [',
]

for (const route of routes) {
  lines.push('  {')
  lines.push(`    legacyId: ${route.legacyId},`)
  lines.push(`    postType: ${quote(route.sourcePostType)},`)
  lines.push(`    path: ${quote(route.canonicalPath)},`)
  lines.push(`    purpose: ${quote((route.title || '').slice(0, 80))},`)
  lines.push(`    archetype: ${quote(route.archetype)},`)
  lines.push(`    targetOwner: ${quote(route.targetCollection)},`)
  lines.push(`    sourceTitle: ${quote(route.title)},`)
  lines.push(`    sourceTemplate: ${quote(route.template)},`)
  lines.push(`    authoritativeField: ${quote(route.authoritativeField)},`)
  if (route.legacyId === 4031) {
    lines.push('    redirectToLegacyId: 34,')
    lines.push("    redirectType: '302',")
  }
  lines.push('  },')
}

lines.push('] as const', '')

const outputPath = path.resolve('migration/scopes/productionRoots.ts')
fs.writeFileSync(outputPath, lines.join('\n'))
process.stdout.write(`Wrote ${routes.length} roots from ${runId} to ${outputPath}\n`)
