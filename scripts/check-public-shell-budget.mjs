import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const MAX_PUBLIC_SHELL_GZIP_BYTES = 60 * 1024
const CLIENT_MANIFEST_PATH = resolve(
  '.next/server/app/(frontend)/page_client-reference-manifest.js',
)
const CLIENT_CHUNK_ROOT = resolve('.next')
const LAYOUT_ENTRY_SUFFIX = '/src/app/(frontend)/layout'
const ROUTE_ASSIGNMENT = 'globalThis.__RSC_MANIFEST["/(frontend)/page"] = '
const CMS_ICON_SENTINELS = ['building-lock', 'chart-waterfall']

const fail = (message) => {
  console.error(`[public-shell-budget] ${message}`)
  process.exit(1)
}

if (!existsSync(CLIENT_MANIFEST_PATH)) {
  fail(`missing production client manifest: ${CLIENT_MANIFEST_PATH}`)
}

const manifestSource = readFileSync(CLIENT_MANIFEST_PATH, 'utf8')
const assignmentIndex = manifestSource.indexOf(ROUTE_ASSIGNMENT)
if (assignmentIndex < 0) fail('could not parse the frontend client manifest assignment')

let manifest
try {
  manifest = JSON.parse(
    manifestSource
      .slice(assignmentIndex + ROUTE_ASSIGNMENT.length)
      .trim()
      .replace(/;$/, ''),
  )
} catch (error) {
  fail(`could not parse the frontend client manifest JSON: ${error.message}`)
}

const layoutEntry = Object.entries(manifest.entryJSFiles || {}).find(([entry]) =>
  entry.endsWith(LAYOUT_ENTRY_SUFFIX),
)
if (!layoutEntry) fail(`missing ${LAYOUT_ENTRY_SUFFIX} entry in the client manifest`)

const chunkPaths = [...new Set(layoutEntry[1])].sort()
if (!chunkPaths.length) fail('the public layout does not declare any client chunks')

const chunks = chunkPaths.map((chunkPath) => {
  const absolutePath = resolve(CLIENT_CHUNK_ROOT, chunkPath)
  if (!existsSync(absolutePath)) fail(`missing declared public-shell chunk: ${chunkPath}`)

  const source = readFileSync(absolutePath)
  return {
    gzipBytes: gzipSync(source, { level: 9 }).byteLength,
    path: chunkPath,
    rawBytes: statSync(absolutePath).size,
    source: source.toString('utf8'),
  }
})

const rawBytes = chunks.reduce((total, chunk) => total + chunk.rawBytes, 0)
const gzipBytes = chunks.reduce((total, chunk) => total + chunk.gzipBytes, 0)
const leakedSentinels = CMS_ICON_SENTINELS.filter((sentinel) =>
  chunks.some((chunk) => chunk.source.includes(sentinel)),
)

if (leakedSentinels.length) {
  fail(`CMS/content icon definitions leaked into the public shell: ${leakedSentinels.join(', ')}`)
}

if (gzipBytes > MAX_PUBLIC_SHELL_GZIP_BYTES) {
  fail(
    `public layout client chunks total ${gzipBytes} gzip bytes; budget is ${MAX_PUBLIC_SHELL_GZIP_BYTES}`,
  )
}

console.log(
  `[public-shell-budget] ${chunkPaths.length} chunks, ${rawBytes} raw bytes, ${gzipBytes} gzip bytes (budget ${MAX_PUBLIC_SHELL_GZIP_BYTES})`,
)
