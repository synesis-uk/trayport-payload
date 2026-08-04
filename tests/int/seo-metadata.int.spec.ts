// @vitest-environment node

import { seoField } from '@/fields/seo'
import { generateMeta } from '@/utilities/generateMeta'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { describe, expect, it } from 'vitest'

describe('SEO metadata', () => {
  it('uses Trayport Open Graph defaults without an unapproved fallback image', () => {
    const openGraph = mergeOpenGraph()

    expect(openGraph).toEqual({
      description:
        'Trayport connects people and markets through energy trading solutions and a global commodities network.',
      siteName: 'Trayport',
      title: 'Trayport',
      type: 'website',
    })
    expect(JSON.stringify(openGraph)).not.toMatch(/Payload Website Template|website-template-OG/)
  })

  it('preserves an explicitly approved Open Graph image without adding a template fallback', () => {
    expect(
      mergeOpenGraph({
        images: [{ url: 'https://media.example.test/approved.jpg' }],
        title: 'Approved page',
      }),
    ).toEqual({
      description:
        'Trayport connects people and markets through energy trading solutions and a global commodities network.',
      images: [{ url: 'https://media.example.test/approved.jpg' }],
      siteName: 'Trayport',
      title: 'Approved page',
      type: 'website',
    })
  })

  it('uses the resolved canonical URL for canonical and Open Graph metadata', async () => {
    const metadata = await generateMeta({
      doc: {
        meta: {
          canonicalURL: 'https://canonical.example.test/original/',
        },
        path: '/managed-route/',
        title: 'Managed route',
      },
    })

    expect(metadata.alternates?.canonical).toBe('https://canonical.example.test/original/')
    expect(metadata.openGraph?.url).toBe('https://canonical.example.test/original/')
  })

  it('retains the site Open Graph description when a document has no description', async () => {
    const metadata = await generateMeta({
      doc: {
        path: '/managed-route/',
        title: 'Managed route',
      },
    })

    expect(metadata.description).toBeUndefined()
    expect(metadata.openGraph?.description).toBe(
      'Trayport connects people and markets through energy trading solutions and a global commodities network.',
    )
  })

  it('emits article-specific Open Graph metadata for routed articles', async () => {
    const metadata = await generateMeta({
      contentType: 'article',
      doc: {
        byline: 'Trayport Editorial',
        path: '/insights/managed-article/',
        publishedAt: '2026-08-04T09:30:00.000Z',
        title: 'Managed article',
      },
    })

    expect(metadata.openGraph).toMatchObject({
      authors: ['Trayport Editorial'],
      publishedTime: '2026-08-04T09:30:00.000Z',
      type: 'article',
    })
  })

  it('uses a video poster for social metadata and never exposes the video asset as an image', async () => {
    const withoutPoster = await generateMeta({
      doc: {
        path: '/learning/no-poster/',
        title: 'Video without poster',
        video: {
          mimeType: 'video/mp4',
          url: 'https://media.example.test/video.mp4',
        } as never,
      },
    })
    expect(JSON.stringify(withoutPoster.openGraph?.images) || '').not.toContain('video.mp4')
    expect(JSON.stringify(withoutPoster.twitter?.images) || '').not.toContain('video.mp4')

    const withPoster = await generateMeta({
      doc: {
        path: '/learning/with-poster/',
        title: 'Video with poster',
        video: {
          mimeType: 'video/mp4',
          poster: {
            mimeType: 'image/jpeg',
            url: 'https://media.example.test/poster.jpg',
          },
          url: 'https://media.example.test/video.mp4',
        } as never,
      },
    })
    expect(withPoster.openGraph?.images).toEqual([{ url: 'https://media.example.test/poster.jpg' }])
    expect(withPoster.twitter?.images).toEqual(['https://media.example.test/poster.jpg'])
  })

  it('validates canonical overrides as root-relative or HTTP(S) URLs', () => {
    const field = seoField().fields.find(
      (candidate) => 'name' in candidate && candidate.name === 'canonicalURL',
    )
    const validate = (field && 'validate' in field ? field.validate : undefined) as
      ((value: string | null | undefined, options: unknown) => true | string) | undefined

    expect(typeof validate).toBe('function')
    if (typeof validate !== 'function') return

    expect(validate('/original/', {} as never)).toBe(true)
    expect(validate('https://canonical.example.test/original/', {} as never)).toBe(true)
    expect(validate('/original', {} as never)).toEqual(expect.any(String))
    expect(validate('/company/../original/', {} as never)).toEqual(expect.any(String))
    expect(validate('/\\canonical.example.test/', {} as never)).toEqual(expect.any(String))
    expect(validate('mailto:editor@example.test', {} as never)).toEqual(expect.any(String))
    expect(validate('canonical.example.test/original/', {} as never)).toEqual(expect.any(String))
  })
})
