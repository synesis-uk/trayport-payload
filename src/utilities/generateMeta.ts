import type { Metadata } from 'next'

import type { Article, Hub, Media, Page, SiteSetting } from '@/payload-types'

import { getServerSideURL } from './getURL'
import { mergeOpenGraph } from './mergeOpenGraph'

type ContentDocument = Partial<Article> | Partial<Hub> | Partial<Page>

const absoluteURL = (value?: string | null) => {
  if (!value) return undefined
  if (/^https?:\/\//i.test(value)) return value
  return new URL(value, getServerSideURL()).toString()
}

const getImageURL = (image?: Media | number | null) => {
  if (!image || typeof image !== 'object') return undefined
  return absoluteURL(image.sizes?.og?.url || image.url)
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
      ('summary' in doc ? doc.summary : undefined) ||
      ('excerpt' in doc ? doc.excerpt : undefined) ||
      settings?.defaultSEO?.description,
  )
  const image =
    getImageURL(doc.meta?.image) ||
    getImageURL(settings?.defaultSEO?.image) ||
    getImageURL('heroMedia' in doc ? doc.heroMedia : undefined)
  const path = trimmed(typeof doc.path === 'string' ? doc.path : undefined) || '/'
  const canonical = trimmed(doc.meta?.canonicalURL) || path

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
      url: absoluteURL(path),
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
