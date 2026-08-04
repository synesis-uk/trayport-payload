// @vitest-environment node

import { containsUnresolvedWordPressShortcode } from '../../migration/validate'
import { normalizeTrayportSlug } from '../../src/fields/slug'
import { describe, expect, it } from 'vitest'

describe('migration source validation', () => {
  it('normalizes imported WordPress slugs exactly as the managed Payload fields do', () => {
    expect(normalizeTrayportSlug('iron_ore')).toBe('iron-ore')
    expect(normalizeTrayportSlug('  Café & Power  ')).toBe('cafe-power')
  })

  it('does not confuse structured company-data arrays with WordPress shortcodes', () => {
    expect(
      containsUnresolvedWordPressShortcode({
        company_secretary: ['Elliott Pickard'],
        directors: ['Peter Conroy', 'Elliott Pickard'],
      }),
    ).toBe(false)
  })

  it('still finds unresolved shortcodes in nested source strings', () => {
    expect(
      containsUnresolvedWordPressShortcode({
        directors: ['Peter Conroy'],
        registered_office: 'London [trayport_company_address id="4846"]',
      }),
    ).toBe(true)
  })
})
