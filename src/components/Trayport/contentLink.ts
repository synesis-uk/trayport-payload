import type { Article, Hub, Page } from '@/payload-types'

type ReferenceValue = Article | Hub | Page | number | string | null | undefined

export type ContentLink = {
  label?: string | null
  type?: 'custom' | 'reference' | null
  reference?: {
    relationTo?: 'articles' | 'hubs' | 'pages' | null
    value?: ReferenceValue
  } | null
  url?: string | null
  newTab?: boolean | null
}

const pathFromReference = (value: ReferenceValue): string | null => {
  if (!value || typeof value !== 'object') return null
  if (typeof value.path === 'string' && value.path) return value.path
  if (typeof value.slug === 'string' && value.slug) return `/${value.slug}/`
  return null
}

export const resolveContentLink = (link?: ContentLink | null) => {
  const href =
    link?.type === 'reference'
      ? pathFromReference(link.reference?.value)
      : typeof link?.url === 'string'
        ? link.url
        : null

  return {
    href: href || '#',
    isExternal: Boolean(href && /^(?:[a-z]+:)?\/\//i.test(href)),
    label: link?.label || '',
    newTab: Boolean(link?.newTab),
  }
}
