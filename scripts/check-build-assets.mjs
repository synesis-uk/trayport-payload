import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const nextRoot = path.resolve('.next')
const appServerRoot = path.join(nextRoot, 'server', 'app')

if (!existsSync(appServerRoot)) {
  throw new Error(`[build-assets] missing Next app output: ${appServerRoot}`)
}

const loadableManifests = []
const visit = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      visit(entryPath)
    } else if (entry.name === 'react-loadable-manifest.json') {
      loadableManifests.push(entryPath)
    }
  }
}

visit(appServerRoot)

if (!loadableManifests.length) {
  throw new Error('[build-assets] no route loadable manifests were discovered')
}

const referencedAssets = new Map()
for (const manifestPath of loadableManifests) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  for (const entry of Object.values(manifest)) {
    for (const assetPath of entry.files || []) {
      if (!assetPath.startsWith('static/')) continue
      const owners = referencedAssets.get(assetPath) || []
      owners.push(path.relative(nextRoot, manifestPath))
      referencedAssets.set(assetPath, owners)
    }
  }
}

if (!referencedAssets.size) {
  throw new Error('[build-assets] route loadable manifests contain no static asset references')
}

const missingAssets = [...referencedAssets.entries()].filter(
  ([assetPath]) => !existsSync(path.join(nextRoot, assetPath)),
)

if (missingAssets.length) {
  for (const [assetPath, owners] of missingAssets) {
    process.stderr.write(
      `[build-assets] missing ${assetPath}; referenced by ${owners.join(', ')}\n`,
    )
  }
  process.exit(1)
}

process.stdout.write(
  `[build-assets] ${referencedAssets.size} referenced static assets exist across ${loadableManifests.length} route manifests\n`,
)
