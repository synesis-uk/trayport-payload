// @vitest-environment node

import type { SourcePost } from '../../migration/contracts/v1'
import { articleDatesFromWordPress } from '../../migration/transform'
import { describe, expect, it } from 'vitest'

const datesFor = (displayDate: unknown, publishedAt: string | null = '2026-07-17T08:47:31+00:00') =>
  articleDatesFromWordPress({
    acf: { display_date: displayDate },
    publishedAt,
  } as Pick<SourcePost, 'acf' | 'publishedAt'>)

describe('Insights WordPress date transform', () => {
  it('keeps publication chronology separate from the managed editorial display date', () => {
    expect(datesFor('20260710')).toEqual({
      displayDate: '2026-07-10T00:00:00.000Z',
      publishedAt: '2026-07-17T08:47:31+00:00',
    })
  })

  it('falls back to the publication timestamp when WordPress has no valid display date', () => {
    expect(datesFor('not-a-date')).toEqual({
      displayDate: '2026-07-17T08:47:31+00:00',
      publishedAt: '2026-07-17T08:47:31+00:00',
    })
    expect(datesFor(null, null)).toEqual({ displayDate: null, publishedAt: null })
  })
})
