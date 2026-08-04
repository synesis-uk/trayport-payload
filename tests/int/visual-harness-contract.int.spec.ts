// @vitest-environment node

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const projectRoot = fileURLToPath(new URL('../..', import.meta.url))

describe('visual harness contract', () => {
  it('keeps generated Playwright output outside the canonical lint surface', async () => {
    const eslint = new ESLint({ cwd: projectRoot })

    await expect(eslint.isPathIgnored('output/playwright/visual-report/index.html')).resolves.toBe(
      true,
    )
    await expect(eslint.isPathIgnored('tests/e2e/visual-regression.e2e.spec.ts')).resolves.toBe(
      false,
    )
  })

  it('waits for an optional Mapbox island to resolve before strict capture', () => {
    const harness = readFileSync(
      new URL('../e2e/visual-regression.e2e.spec.ts', import.meta.url),
      'utf8',
    )

    expect(harness).toContain('waitForConnectionsMap(page)')
    expect(harness).toContain("dataset.mapReady === 'true'")
    expect(harness).toContain("dataset.mapError === 'true'")
    expect(harness).toContain('scrollIntoViewIfNeeded()')
  })
})
