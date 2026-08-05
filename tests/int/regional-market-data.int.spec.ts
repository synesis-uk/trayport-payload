// @vitest-environment node

import { describe, expect, it } from 'vitest'

import {
  REGIONAL_MARKET_VOLUME_DIVISOR,
  regionalMarketVolumeInDisplayUnits,
} from '@/data/regionalMarketData.server'

describe('regional market-data display units', () => {
  it('converts raw imported volume facts to the TWh scale used by the live map', () => {
    expect(REGIONAL_MARKET_VOLUME_DIVISOR).toBe(1_000_000)
    expect(regionalMarketVolumeInDisplayUnits(69_407_322)).toBeCloseTo(69.407322)
    expect(regionalMarketVolumeInDisplayUnits('1500000')).toBe(1.5)
    expect(regionalMarketVolumeInDisplayUnits(null)).toBeNull()
    expect(regionalMarketVolumeInDisplayUnits('not-a-number')).toBeNull()
  })
})
