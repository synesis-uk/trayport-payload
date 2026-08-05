import { readFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

import {
  normalizeSiteSearchPage,
  prepareSiteSearchDocument,
  searchSiteCorpus,
  validateSiteSearchQuery,
} from '@/search/model'
import {
  publicSearchSources,
  searchableTextFromStructuredContent,
} from '@/search/publicSearchSources.server'

const document = (
  id: number,
  title: string,
  { body = '', excerpt = '', path = `/result-${id}/`, typeLabel = 'Page' } = {},
) =>
  prepareSiteSearchDocument({
    body,
    collection: 'pages',
    excerpt,
    id,
    path,
    title,
    typeLabel,
  })

describe('whole-site search query contract', () => {
  it('normalizes safe repeated input and rejects empty, short and overlong requests', () => {
    expect(validateSiteSearchQuery(['  Énergy\u0000   trading  ', 'ignored'])).toEqual({
      input: 'Énergy trading',
      issue: null,
      normalized: 'energy trading',
      terms: ['energy', 'trading'],
    })
    expect(validateSiteSearchQuery('')).toMatchObject({ issue: 'empty', terms: [] })
    expect(validateSiteSearchQuery('x')).toMatchObject({ issue: 'too-short', terms: [] })
    expect(validateSiteSearchQuery('x'.repeat(101))).toMatchObject({
      input: 'x'.repeat(100),
      issue: 'too-long',
      terms: [],
    })
  })

  it('accepts only bounded positive page numbers', () => {
    expect(normalizeSiteSearchPage('3')).toBe(3)
    expect(normalizeSiteSearchPage(['9', '10'])).toBe(9)
    expect(normalizeSiteSearchPage('0')).toBe(1)
    expect(normalizeSiteSearchPage('-1')).toBe(1)
    expect(normalizeSiteSearchPage('1e3')).toBe(1)
    expect(normalizeSiteSearchPage('1234567')).toBe(1)
  })
})

describe('whole-site relevance and excerpts', () => {
  const corpus = [
    document(1, 'Energy trading solutions', {
      body: 'Carbon market access is available alongside other commodities.',
      excerpt: 'Connect to wholesale energy markets with Trayport.',
    }),
    document(2, 'Market technology', {
      body: 'Teams use advanced energy trading workflows across European markets.',
      typeLabel: 'Insight',
    }),
    document(3, 'Carbon markets', {
      excerpt: 'Understand emissions and carbon liquidity.',
    }),
  ]

  it('searches titles, summaries and full body copy and ranks title matches first', () => {
    const result = searchSiteCorpus({ corpus, query: validateSiteSearchQuery('energy trading') })

    expect(result.total).toBe(2)
    expect(result.hits.map(({ id }) => id)).toEqual([1, 2])
    expect(result.hits[1]?.snippet).toContain('energy trading workflows')
  })

  it('keeps Relevanssi-style OR coverage while rewarding records matching every term', () => {
    const result = searchSiteCorpus({ corpus, query: validateSiteSearchQuery('energy carbon') })

    expect(result.hits.map(({ id }) => id)).toEqual([1, 3, 2])
  })

  it('supports prefix and suffix fuzzy matches without matching inside a word', () => {
    expect(
      searchSiteCorpus({ corpus, query: validateSiteSearchQuery('trad') }).hits.map(({ id }) => id),
    ).toEqual([1, 2])
    expect(
      searchSiteCorpus({ corpus, query: validateSiteSearchQuery('ding') }).hits.map(({ id }) => id),
    ).toEqual([1, 2])
    expect(searchSiteCorpus({ corpus, query: validateSiteSearchQuery('adi') }).total).toBe(0)
  })

  it('paginates a stable relevance order and clamps out-of-range pages', () => {
    const many = Array.from({ length: 12 }, (_, index) =>
      document(index + 1, `Energy result ${String(index + 1).padStart(2, '0')}`),
    )
    const result = searchSiteCorpus({
      corpus: many,
      page: 99,
      pageSize: 5,
      query: validateSiteSearchQuery('energy'),
    })

    expect(result).toMatchObject({ currentPage: 3, end: 12, start: 11, total: 12, totalPages: 3 })
    expect(result.hits.map(({ id }) => id)).toEqual([11, 12])
  })
})

describe('whole-site public corpus contract', () => {
  it('extracts visitor-facing structured copy without indexing presentation or URLs', () => {
    const text = searchableTextFromStructuredContent({
      blockType: 'contentSection',
      heading: 'European energy markets',
      link: { label: 'Explore Joule', url: 'https://private.example.test/token' },
      richText: {
        root: {
          children: [{ format: 0, text: 'Connect people and markets.', type: 'text' }],
          type: 'root',
        },
      },
      wrapperTheme: 'dark',
    })

    expect(text).toBe('European energy markets Explore Joule Connect people and markets.')
    expect(text).not.toContain('contentSection')
    expect(text).not.toContain('private.example.test')
    expect(text).not.toContain('dark')
  })

  it('registers every current public route-owner collection through one adapter boundary', () => {
    expect(publicSearchSources.map(({ collection }) => collection)).toEqual([
      'pages',
      'articles',
      'people',
      'hubs',
      'venues',
      'learning-videos',
    ])
    expect(new Set(publicSearchSources.map(({ cacheTag }) => cacheTag)).size).toBe(
      publicSearchSources.length,
    )
  })

  it('keeps the corpus server-only, access-filtered, bounded and collection-tag invalidated', async () => {
    const [sources, loader] = await Promise.all([
      readFile('src/search/publicSearchSources.server.ts', 'utf8'),
      readFile('src/search/loadSiteSearchCorpus.server.ts', 'utf8'),
    ])

    expect(sources).toContain("import 'server-only'")
    expect(sources.match(/overrideAccess: false/g)).toHaveLength(publicSearchSources.length)
    expect(sources.match(/pagination: false/g)).toHaveLength(publicSearchSources.length)
    expect(sources).toContain("{ _status: { equals: 'published' } }")
    expect(sources).toContain('asRecord(document.meta).noIndex === true')
    expect(loader).toContain("'use cache'")
    expect(loader).toContain('for (const source of publicSearchSources) cacheTag(source.cacheTag)')
    expect(loader).toContain(
      'Promise.all(publicSearchSources.map((source) => source.load(payload)))',
    )
  })

  it('routes the global header to the whole-site search without retaining Insights-only copy', async () => {
    const header = await readFile('src/Header/SiteSearchDialog.client.tsx', 'utf8')
    const home = await readFile('src/app/(frontend)/page.tsx', 'utf8')

    expect(header).toContain('<form action="/" method="get" role="search">')
    expect(header).toContain('name="s"')
    expect(header).toContain('Search across all public Trayport content.')
    expect(header).not.toContain('/resources/insights/')
    expect(home).toContain('if (s !== undefined) return <SiteSearchPage')
    expect(home).toContain("title: 'Site Search | Trayport'")
  })
})
