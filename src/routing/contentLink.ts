import { safeDestination } from './urlPolicy'

export type ReferenceValue =
  { _status?: string | null; path?: string | null } | number | string | null | undefined

export type ContentLink = {
  label?: string | null
  type?: 'custom' | 'reference' | null
  reference?: {
    relationTo?: 'articles' | 'hubs' | 'learning-videos' | 'pages' | 'people' | 'venues' | null
    value?: ReferenceValue
  } | null
  url?: string | null
  newTab?: boolean | null
}

const pathFromReference = (value: ReferenceValue): string | null => {
  if (!value || typeof value !== 'object') return null
  if (value._status === 'draft') return null
  if (typeof value.path === 'string' && value.path) return value.path
  return null
}

export const resolveContentLink = (link?: ContentLink | null) => {
  const candidate =
    link?.type === 'reference'
      ? pathFromReference(link.reference?.value)
      : typeof link?.url === 'string'
        ? link.url
        : null
  const href = safeDestination(candidate)

  return {
    href: href || '#',
    isExternal: Boolean(href?.startsWith('https://')),
    label: link?.label || '',
    newTab: Boolean(link?.newTab),
  }
}
