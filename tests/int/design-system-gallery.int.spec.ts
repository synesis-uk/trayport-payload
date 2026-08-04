// @vitest-environment node

import { isValidElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import DesignSystemPage from '@/app/(design-system)/design-system/page'
import { gallerySections } from '@/components/design-system/fixtures'

const originalEnabled = process.env.DESIGN_SYSTEM_ENABLED

afterEach(() => {
  if (originalEnabled === undefined) {
    delete process.env.DESIGN_SYSTEM_ENABLED
  } else {
    process.env.DESIGN_SYSTEM_ENABLED = originalEnabled
  }
})

describe('design-system gallery', () => {
  it('fails closed unless the server explicitly enables the route', () => {
    for (const value of [undefined, '', 'false', 'TRUE']) {
      if (value === undefined) {
        delete process.env.DESIGN_SYSTEM_ENABLED
      } else {
        process.env.DESIGN_SYSTEM_ENABLED = value
      }

      try {
        DesignSystemPage()
        throw new Error(`Expected the design-system route to reject ${String(value)}`)
      } catch (error) {
        expect(error).toMatchObject({ digest: 'NEXT_HTTP_ERROR_FALLBACK;404' })
      }
    }
  })

  it('renders a deterministic gallery only when explicitly enabled', () => {
    process.env.DESIGN_SYSTEM_ENABLED = 'true'

    expect(isValidElement(DesignSystemPage())).toBe(true)
    expect(gallerySections.map(({ id }) => id)).toEqual([
      'colour-tokens',
      'typography',
      'icons',
      'buttons',
      'interaction-primitives',
      'compositions',
      'forms',
      'cards',
      'content-resilience',
      'responsive-surfaces',
    ])
    expect(new Set(gallerySections.map(({ id }) => id)).size).toBe(gallerySections.length)
  })
})
