import type { Metadata } from 'next'

import type { Media, SiteSetting } from '@/payload-types'

import { getServerSideURL } from './getURL'
import { mergeOpenGraph } from './mergeOpenGraph'

type ContentDocument = {
  excerpt?: string | null
  heroMedia?: Media | number | null
  intro?: string | null
  logo?: Media | number | null
  meta?: {
    canonicalURL?: string | null
    description?: string | null
    image?: Media | number | null
    noFollow?: boolean | null
    noIndex?: boolean | null
    title?: string | null
  } | null
  path?: string | null
  summary?: string | null
  title?: string | null
  video?: Media | number | null
}

const absoluteURL = (value?: string | null) => {
  if (!value) return undefined
  if (/^https?:\/\//i.test(value)) return value
  return new URL(value, getServerSideURL()).toString()
}

const getImageURL = (image?: Media | number | null, posterOnly = false): string | undefined => {
  if (!image || typeof image !== 'object') return undefined
  const poster = typeof image.poster === 'object' ? image.poster : null
  const posterURL = poster ? getImageURL(poster) : undefined
  if (posterOnly || image.mimeType?.startsWith('video/')) return posterURL
  if (image.mimeType && !image.mimeType.startsWith('image/')) return undefined
  return absoluteURL(image.sizes?.og?.url || image.url) || posterURL
}

const withSuffix = (title: string, suffix: string) => {
  if (!suffix || title.toLowerCase().includes('trayport')) return title
  return `${title}${suffix}`
}

const trimmed = (value?: string | null) => value?.trim() || undefined

export const generateMeta = async ({
  doc,
  settings,
}: {
  doc: ContentDocument | null
  settings?: SiteSetting | null
}): Promise<Metadata> => {
  if (!doc) return {}

  const suffix = settings?.defaultSEO?.titleSuffix || ' | Trayport'
  const plainTitle =
    trimmed(doc.meta?.title) || trimmed(doc.title) || trimmed(settings?.siteName) || 'Trayport'
  const title = withSuffix(plainTitle, suffix)
  const description = trimmed(
    doc.meta?.description ||
      doc.summary ||
      doc.intro ||
      doc.excerpt ||
      settings?.defaultSEO?.description,
  )
  const image =
    getImageURL(doc.meta?.image) ||
    getImageURL(settings?.defaultSEO?.image) ||
    getImageURL(doc.heroMedia) ||
    getImageURL(doc.logo) ||
    getImageURL(doc.video, true)
  const path = trimmed(typeof doc.path === 'string' ? doc.path : undefined) || '/'
  const canonical = absoluteURL(trimmed(doc.meta?.canonicalURL) || path)

  return {
    alternates: {
      canonical,
    },
    description,
    openGraph: mergeOpenGraph({
      description: description || '',
      images: image ? [{ url: image }] : undefined,
      title,
      type: 'website',
      url: canonical,
    }),
    robots:
      doc.meta?.noIndex || doc.meta?.noFollow
        ? {
            follow: !doc.meta?.noFollow,
            index: !doc.meta?.noIndex,
          }
        : undefined,
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: image ? [image] : undefined,
      title,
    },
  }
}
