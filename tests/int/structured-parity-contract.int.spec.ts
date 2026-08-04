// @vitest-environment node

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const structuredCSS = readFileSync(
  new URL('../../src/app/(frontend)/parity-structured.css', import.meta.url),
  'utf8',
)

describe('structured content parity CSS', () => {
  it('uses the audited legacy cyan for both structured source rules', () => {
    expect(structuredCSS).toMatch(/--trayport-structured-accent:\s*#3ca1d5;/)
    expect(structuredCSS).toMatch(
      /\.trayport-structured-hub__title-tab\s*\{[^}]*border-bottom:\s*0\.25rem solid var\(--trayport-structured-accent\);/s,
    )
    expect(structuredCSS).toMatch(
      /\.trayport-structured-venue__rule\s*\{[^}]*background:\s*var\(--trayport-structured-accent\);/s,
    )
  })

  it('keeps venue labels and market tiles on their scoped legacy neutral colors', () => {
    expect(structuredCSS).toMatch(
      /\.trayport-structured-hub \.trayport-venue-list a,\s*\.trayport-structured-hub \.trayport-venue-list li > span\s*\{[^}]*color:\s*#232323;/s,
    )
    expect(structuredCSS).toMatch(
      /\.trayport-structured-venue \.trayport-venue-markets__groups a,\s*\.trayport-structured-venue \.trayport-venue-markets__groups li > span\s*\{(?=[^}]*border:\s*0\.0625rem solid #e5e5e5;)(?=[^}]*color:\s*#232323;)[^}]*\}/s,
    )
  })
})
