import { normalizeContentPath } from '@/fields/contentPath'

export const canonicalContentRoutePath = (segments?: string[]): string => {
  const candidate = segments?.length ? `/${segments.join('/')}/` : '/'
  const normalized = normalizeContentPath(candidate)
  return typeof normalized === 'string' && normalized.startsWith('/') ? normalized : '/'
}

export const normalizeListingSearchQuery = (value?: string | string[]): string => {
  const candidate = Array.isArray(value) ? value[0] : value
  return typeof candidate === 'string' ? candidate.trim().slice(0, 200) : ''
}
