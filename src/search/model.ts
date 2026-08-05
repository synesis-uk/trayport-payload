export const SITE_SEARCH_MAX_QUERY_LENGTH = 100
export const SITE_SEARCH_MIN_QUERY_LENGTH = 2
export const SITE_SEARCH_PAGE_SIZE = 10

export type SiteSearchQueryIssue = 'empty' | 'too-long' | 'too-short'

export interface SiteSearchQuery {
  input: string
  issue: SiteSearchQueryIssue | null
  normalized: string
  terms: string[]
}

export interface SiteSearchSourceDocument {
  body?: string | null
  collection: string
  excerpt?: string | null
  id: number | string
  path: string
  publishedAt?: string | null
  title: string
  typeLabel: string
}

export interface SiteSearchDocument extends SiteSearchSourceDocument {
  normalizedBody: string
  normalizedExcerpt: string
  normalizedTitle: string
}

export interface SiteSearchHit {
  collection: string
  id: number | string
  path: string
  publishedAt?: string | null
  score: number
  snippet: string
  title: string
  typeLabel: string
}

export interface SiteSearchResult {
  currentPage: number
  end: number
  hits: SiteSearchHit[]
  pageSize: number
  start: number
  total: number
  totalPages: number
}

const cleanDisplayText = (value: unknown): string =>
  typeof value === 'string'
    ? value
        .normalize('NFKC')
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    : ''

export const normalizeSiteSearchText = (value: unknown): string =>
  cleanDisplayText(value)
    .normalize('NFKD')
    .replace(/\p{Mark}+/gu, '')
    .toLocaleLowerCase('en-GB')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const termsFrom = (normalized: string): string[] =>
  [...new Set(normalized.split(' ').filter(Boolean))].slice(0, 16)

export const validateSiteSearchQuery = (value: unknown): SiteSearchQuery => {
  const candidate = Array.isArray(value) ? value[0] : value
  const cleaned = cleanDisplayText(candidate)

  if (!cleaned) {
    return { input: '', issue: 'empty', normalized: '', terms: [] }
  }

  if (cleaned.length > SITE_SEARCH_MAX_QUERY_LENGTH) {
    return {
      input: cleaned.slice(0, SITE_SEARCH_MAX_QUERY_LENGTH),
      issue: 'too-long',
      normalized: '',
      terms: [],
    }
  }

  const normalized = normalizeSiteSearchText(cleaned)
  if (normalized.length < SITE_SEARCH_MIN_QUERY_LENGTH) {
    return { input: cleaned, issue: 'too-short', normalized, terms: [] }
  }

  return {
    input: cleaned,
    issue: null,
    normalized,
    terms: termsFrom(normalized),
  }
}

export const normalizeSiteSearchPage = (value: unknown): number => {
  const candidate = Array.isArray(value) ? value[0] : value
  if (typeof candidate !== 'string' || !/^\d{1,6}$/.test(candidate)) return 1

  const page = Number.parseInt(candidate, 10)
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}

export const prepareSiteSearchDocument = (
  document: SiteSearchSourceDocument,
): SiteSearchDocument => ({
  ...document,
  body: cleanDisplayText(document.body),
  excerpt: cleanDisplayText(document.excerpt),
  normalizedBody: normalizeSiteSearchText(document.body),
  normalizedExcerpt: normalizeSiteSearchText(document.excerpt),
  normalizedTitle: normalizeSiteSearchText(document.title),
  title: cleanDisplayText(document.title),
})

const words = (value: string): string[] => value.split(' ').filter(Boolean)

const wordMatches = (word: string, term: string): boolean => {
  if (term.length < 3) return word === term
  return word === term || word.startsWith(term) || word.endsWith(term)
}

const fieldScore = (
  value: string,
  query: SiteSearchQuery,
  weight: number,
  phraseBonus: number,
): { matchedTerms: Set<string>; score: number } => {
  const valueWords = words(value)
  const matchedTerms = new Set<string>()
  let score = value.includes(query.normalized) ? phraseBonus : 0

  for (const term of query.terms) {
    let exactMatches = 0
    let partialMatches = 0

    for (const word of valueWords) {
      if (word === term) exactMatches += 1
      else if (wordMatches(word, term)) partialMatches += 1
    }

    if (exactMatches || partialMatches) matchedTerms.add(term)
    score += Math.min(exactMatches, 6) * weight
    score += Math.min(partialMatches, 4) * weight * 0.7
  }

  return { matchedTerms, score }
}

const excerptSource = (document: SiteSearchDocument, query: SiteSearchQuery): string => {
  const excerptHasMatch = query.terms.some((term) =>
    words(document.normalizedExcerpt).some((word) => wordMatches(word, term)),
  )
  if (excerptHasMatch) return document.excerpt || ''

  const bodyHasMatch = query.terms.some((term) =>
    words(document.normalizedBody).some((word) => wordMatches(word, term)),
  )
  if (bodyHasMatch) return document.body || ''

  return document.excerpt || document.body || ''
}

const snippetFrom = (document: SiteSearchDocument, query: SiteSearchQuery): string => {
  const source = excerptSource(document, query)
  if (!source) return ''

  const sourceWords = source.split(/\s+/).filter(Boolean)
  const normalizedWords = sourceWords.map(normalizeSiteSearchText)
  const matchIndex = normalizedWords.findIndex((word) =>
    query.terms.some((term) => wordMatches(word, term)),
  )
  const windowStart = Math.max(0, (matchIndex < 0 ? 0 : matchIndex) - 10)
  const windowEnd = Math.min(sourceWords.length, windowStart + 30)
  const prefix = windowStart > 0 ? '…' : ''
  const suffix = windowEnd < sourceWords.length ? '…' : ''
  const snippet = `${prefix}${sourceWords.slice(windowStart, windowEnd).join(' ')}${suffix}`

  if (snippet.length <= 280) return snippet
  const clipped = snippet.slice(0, 277)
  const lastSpace = clipped.lastIndexOf(' ')
  return `${clipped.slice(0, Math.max(lastSpace, 220)).trimEnd()}…`
}

const rankedHit = (document: SiteSearchDocument, query: SiteSearchQuery): SiteSearchHit | null => {
  const title = fieldScore(document.normalizedTitle, query, 16, 120)
  const excerpt = fieldScore(document.normalizedExcerpt, query, 5, 45)
  const body = fieldScore(document.normalizedBody, query, 1, 15)
  const matchedTerms = new Set([
    ...title.matchedTerms,
    ...excerpt.matchedTerms,
    ...body.matchedTerms,
  ])

  if (!matchedTerms.size) return null

  let score = title.score + excerpt.score + body.score
  score += matchedTerms.size * 4
  if (matchedTerms.size === query.terms.length) score += 18
  if (title.matchedTerms.size === query.terms.length) score += 24

  return {
    collection: document.collection,
    id: document.id,
    path: document.path,
    publishedAt: document.publishedAt,
    score,
    snippet: snippetFrom(document, query),
    title: document.title,
    typeLabel: document.typeLabel,
  }
}

export const searchSiteCorpus = ({
  corpus,
  page = 1,
  pageSize = SITE_SEARCH_PAGE_SIZE,
  query,
}: {
  corpus: readonly SiteSearchDocument[]
  page?: number
  pageSize?: number
  query: SiteSearchQuery
}): SiteSearchResult => {
  if (query.issue || !query.terms.length) {
    return {
      currentPage: 1,
      end: 0,
      hits: [],
      pageSize,
      start: 0,
      total: 0,
      totalPages: 0,
    }
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
    throw new RangeError('Search page size must be an integer between 1 and 50.')
  }

  const ranked = corpus
    .flatMap((document) => {
      const hit = rankedHit(document, query)
      return hit ? [hit] : []
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.title.localeCompare(right.title, 'en-GB') ||
        left.path.localeCompare(right.path, 'en-GB'),
    )

  const total = ranked.length
  const totalPages = total ? Math.ceil(total / pageSize) : 0
  const currentPage = totalPages ? Math.min(Math.max(1, page), totalPages) : 1
  const offset = (currentPage - 1) * pageSize
  const hits = ranked.slice(offset, offset + pageSize)

  return {
    currentPage,
    end: hits.length ? offset + hits.length : 0,
    hits,
    pageSize,
    start: hits.length ? offset + 1 : 0,
    total,
    totalPages,
  }
}
