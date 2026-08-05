// @vitest-environment node

import { describe, expect, it } from 'vitest'

import {
  normalizeVenueMarketConnections,
  validateVenueMarketConnections,
} from '@/fields/venueMarketConnections'

describe('venue market-connection integrity', () => {
  it('keeps first-row identity and order while combining repeated capabilities', () => {
    const source = [
      { connectionType: 'd', hub: 10, id: 'first-row', note: 'keep me' },
      { connectionType: 'a', hub: { id: 20, title: 'French Power' }, id: 'second-row' },
      { connectionType: 'a', hub: { id: 10, title: 'German Power' }, id: 'duplicate-row' },
      { connectionType: 'a', hub: 20, id: 'same-capability-row' },
    ]

    expect(normalizeVenueMarketConnections(source)).toEqual([
      { connectionType: 'b', hub: 10, id: 'first-row', note: 'keep me' },
      { connectionType: 'a', hub: { id: 20, title: 'French Power' }, id: 'second-row' },
    ])
  })

  it('treats combined connectivity as absorbing and preserves invalid rows for child validation', () => {
    expect(
      normalizeVenueMarketConnections([
        { connectionType: 'b', hub: 'ttf', id: 'combined' },
        { connectionType: 'd', hub: 'ttf', id: 'duplicate' },
        { connectionType: 'invalid', hub: 'nbp', id: 'invalid-row' },
      ]),
    ).toEqual([
      { connectionType: 'b', hub: 'ttf', id: 'combined' },
      { connectionType: 'invalid', hub: 'nbp', id: 'invalid-row' },
    ])
  })

  it('rejects duplicate hubs when validation runs without normalization', () => {
    const repeated = [
      { connectionType: 'd', hub: 10 },
      { connectionType: 'a', hub: { id: 10 } },
    ]

    expect(validateVenueMarketConnections(repeated)).toMatch(/each market hub once/iu)
    expect(validateVenueMarketConnections(normalizeVenueMarketConnections(repeated))).toBe(true)
  })
})
