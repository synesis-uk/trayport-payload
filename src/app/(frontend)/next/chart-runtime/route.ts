import { readFile } from 'node:fs/promises'
import path from 'node:path'

const packageRoot = path.join(process.cwd(), 'node_modules', 'highcharts')
const corePath = path.join(packageRoot, 'highcharts.js')
const accessibilityPath = path.join(packageRoot, 'modules', 'accessibility.js')

let sourcePromise: Promise<string> | undefined

const getSource = () => {
  // Both package files are browser UMD distributions. Core must execute first because it creates
  // the window globals consumed by the accessibility module. Serving them as one same-origin
  // external script keeps the loader compatible with `script-src 'self'` without inline script or
  // eval permissions.
  sourcePromise ??= Promise.all([
    readFile(corePath, 'utf8'),
    readFile(accessibilityPath, 'utf8'),
  ]).then(
    ([core, accessibility]) =>
      `${core}\n${accessibility}\nwindow.TrayportChartRuntime=window.Highcharts;`,
  )

  return sourcePromise
}

export async function GET() {
  return new Response(await getSource(), {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'text/javascript; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
