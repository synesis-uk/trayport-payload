// @vitest-environment node

import type { NormalizedValue } from '../../migration/contracts/v1'
import { mapPageLayout } from '../../migration/transform/blocks'
import type { TransformCoverage } from '../../migration/transform/types'
import { describe, expect, it } from 'vitest'

const coverage = (): TransformCoverage => ({
  componentLayouts: {},
  ignoredComponentLayouts: {},
  topLevelLayouts: {},
  ignoredTaxonomies: {},
  unsupportedComponentLayouts: [],
  unsupportedTopLevelLayouts: [],
})

const media = (id: number, url: string): NormalizedValue => ({
  $ref: 'media',
  id,
  title: `Media ${id}`,
  url,
})

const transformedHero = ({
  backgroundType,
  image = null,
  video = null,
}: {
  backgroundType?: string
  image?: NormalizedValue
  video?: NormalizedValue
}) => {
  const settings: Record<string, NormalizedValue> = {}
  if (backgroundType) settings.bg_type = backgroundType

  const layout = mapPageLayout(
    {
      sections_new: [
        {
          acf_fc_layout: 'hero',
          hero: {
            settings,
            new_content: {
              header: { text: 'Selected background' },
              image,
              video: { video },
            },
          },
        },
      ],
    },
    coverage(),
  )

  expect(layout).toHaveLength(1)
  return layout[0]
}

describe('WordPress hero background transform', () => {
  const image = media(101, 'https://cdn.trayport.com/image.jpg')
  const video = media(202, 'http://trayport.local/app/uploads/video.mp4')

  it('imports the configured image instead of a retained video value', () => {
    expect(transformedHero({ backgroundType: 'image', image, video })).toMatchObject({
      blockType: 'trayportHero',
      media: { $legacyRef: 'media', legacyId: 101 },
      externalVideoURL: '',
      appearance: 'image',
    })
  })

  it('preserves an intentionally selected managed video', () => {
    expect(transformedHero({ backgroundType: 'video', image, video })).toMatchObject({
      media: { $legacyRef: 'media', legacyId: 202 },
      externalVideoURL: '',
      appearance: 'image',
    })
  })

  it('preserves an intentionally selected external video', () => {
    expect(
      transformedHero({
        backgroundType: 'video',
        image,
        video: { url: 'https://video.example.test/hero.mp4' },
      }),
    ).toMatchObject({
      media: null,
      externalVideoURL: 'https://video.example.test/hero.mp4',
      appearance: 'image',
    })
  })

  it('does not import retained media when the source selects no background', () => {
    expect(transformedHero({ backgroundType: 'none', image, video })).toMatchObject({
      media: null,
      externalVideoURL: '',
      appearance: 'dark',
    })
  })

  it('uses the ACF image default when older source data has no selector', () => {
    expect(transformedHero({ image, video })).toMatchObject({
      media: { $legacyRef: 'media', legacyId: 101 },
      externalVideoURL: '',
      appearance: 'image',
    })
  })
})
