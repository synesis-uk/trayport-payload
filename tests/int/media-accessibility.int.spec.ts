// @vitest-environment node

import { validateMediaAlternativeText } from '@/collections/Media'
import { describe, expect, it } from 'vitest'

describe('media alternative-text policy', () => {
  it('requires exactly one meaningful-image or decorative-image state', () => {
    expect(
      validateMediaAlternativeText({
        alt: 'Traders using Joule',
        decorative: false,
        mimeType: 'image/webp',
      }),
    ).toBe(true)
    expect(
      validateMediaAlternativeText({ alt: '', decorative: true, mimeType: 'image/webp' }),
    ).toBe(true)

    expect(
      validateMediaAlternativeText({ alt: '', decorative: false, mimeType: 'image/webp' }),
    ).toEqual(expect.any(String))
    expect(
      validateMediaAlternativeText({
        alt: 'Stale decorative label',
        decorative: true,
        mimeType: 'image/webp',
      }),
    ).toEqual(expect.any(String))
  })

  it('does not impose image alternative-text rules on video and document uploads', () => {
    expect(
      validateMediaAlternativeText({ alt: '', decorative: false, mimeType: 'video/mp4' }),
    ).toBe(true)
    expect(
      validateMediaAlternativeText({ alt: '', decorative: false, mimeType: 'application/pdf' }),
    ).toBe(true)
  })
})
