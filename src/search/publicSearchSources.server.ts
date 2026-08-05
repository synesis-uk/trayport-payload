import 'server-only'

import type { Payload, Where } from 'payload'

import type {
  ArticlesSelect,
  HubsSelect,
  LearningVideosSelect,
  PagesSelect,
  PeopleSelect,
  VenuesSelect,
} from '@/payload-types'

import { prepareSiteSearchDocument, type SiteSearchDocument } from './model'

type UnknownRecord = Record<string, unknown>

export interface PublicSearchSourceAdapter {
  cacheTag: string
  collection: string
  load: (payload: Payload) => Promise<SiteSearchDocument[]>
}

const pageSelect = {
  layout: true,
  meta: {
    description: true,
    noIndex: true,
    title: true,
  },
  navigationLabel: true,
  pageType: true,
  path: true,
  publishedAt: true,
  summary: true,
  title: true,
} satisfies PagesSelect

const articleSelect = {
  articleType: true,
  byline: true,
  contentMode: true,
  excerpt: true,
  layout: true,
  location: true,
  meta: {
    description: true,
    noIndex: true,
    title: true,
  },
  path: true,
  publishedAt: true,
  title: true,
} satisfies ArticlesSelect

const hubSelect = {
  code: true,
  contentMode: true,
  layout: true,
  meta: {
    description: true,
    noIndex: true,
    title: true,
  },
  path: true,
  publishedAt: true,
  summary: true,
  title: true,
} satisfies HubsSelect

const venueSelect = {
  code: true,
  contentMode: true,
  description: true,
  layout: true,
  location: {
    label: true,
  },
  meta: {
    description: true,
    noIndex: true,
    title: true,
  },
  path: true,
  publishedAt: true,
  summary: true,
  title: true,
} satisfies VenuesSelect

const learningVideoSelect = {
  accessMode: true,
  contentMode: true,
  description: true,
  layout: true,
  meta: {
    description: true,
    noIndex: true,
    title: true,
  },
  path: true,
  product: true,
  publishedAt: true,
  summary: true,
  tags: {
    label: true,
  },
  title: true,
} satisfies LearningVideosSelect

const peopleSelect = {
  description: true,
  jobRole: true,
  meta: {
    description: true,
    noIndex: true,
    title: true,
  },
  path: true,
  publishedAt: true,
  quote: true,
  team: true,
  title: true,
} satisfies PeopleSelect

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : {}

const stringValue = (value: unknown): string => (typeof value === 'string' ? value : '')

const visibleTextKeys = new Set([
  'accessibleSummary',
  'answer',
  'attribution',
  'badgeLabel',
  'body',
  'caption',
  'content',
  'copy',
  'description',
  'eyebrow',
  'heading',
  'intro',
  'label',
  'lineMarkerLabel',
  'locationLabel',
  'name',
  'question',
  'quote',
  'subheading',
  'summary',
  'text',
  'title',
])

/**
 * Extracts only visitor-visible copy from the already access-filtered public
 * projection. Presentation enums, URLs, relationship IDs and CMS metadata are
 * deliberately ignored so they cannot create noisy or private search matches.
 */
export const searchableTextFromStructuredContent = (value: unknown): string => {
  const values: string[] = []
  const visited = new WeakSet<object>()

  const walk = (current: unknown): void => {
    if (Array.isArray(current)) {
      for (const child of current) walk(child)
      return
    }
    if (!current || typeof current !== 'object') return
    if (visited.has(current)) return
    visited.add(current)

    for (const [key, child] of Object.entries(current)) {
      if (typeof child === 'string') {
        if (visibleTextKeys.has(key)) values.push(child)
      } else {
        walk(child)
      }
    }
  }

  walk(value)
  return values.join(' ')
}

const metaText = (document: UnknownRecord, field: 'description' | 'title'): string =>
  stringValue(asRecord(document.meta)[field])

const pathFrom = (document: UnknownRecord): string | null => {
  const path = stringValue(document.path)
  return path.startsWith('/') ? path : null
}

const project = ({
  body,
  collection,
  document,
  excerpt,
  typeLabel,
}: {
  body: string[]
  collection: string
  document: UnknownRecord
  excerpt: string[]
  typeLabel: string
}): SiteSearchDocument | null => {
  const path = pathFrom(document)
  const title = stringValue(document.title)
  const id = document.id
  if (
    !path ||
    !title ||
    asRecord(document.meta).noIndex === true ||
    (typeof id !== 'number' && typeof id !== 'string')
  ) {
    return null
  }

  return prepareSiteSearchDocument({
    body: body.filter(Boolean).join(' '),
    collection,
    excerpt: excerpt.find(Boolean) || '',
    id,
    path,
    publishedAt: stringValue(document.publishedAt) || null,
    title,
    typeLabel,
  })
}

const publicWhere = (conditions: Where[] = []): Where => ({
  and: [{ _status: { equals: 'published' } }, { path: { exists: true } }, ...conditions],
})

const loadPages = async (payload: Payload): Promise<SiteSearchDocument[]> => {
  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    select: pageSelect,
    where: publicWhere(),
  })

  return result.docs.flatMap((value) => {
    const document = asRecord(value)
    const projected = project({
      body: [
        stringValue(document.navigationLabel),
        metaText(document, 'title'),
        metaText(document, 'description'),
        searchableTextFromStructuredContent(document.layout),
      ],
      collection: 'pages',
      document,
      excerpt: [stringValue(document.summary), metaText(document, 'description')],
      typeLabel: 'Page',
    })
    return projected ? [projected] : []
  })
}

const articleTypeLabel = (value: unknown): string => {
  const labels: Record<string, string> = {
    'case-study': 'Case study',
    event: 'Event',
    insight: 'Insight',
    news: 'News',
    video: 'Video',
    webinar: 'Webinar',
  }
  return labels[stringValue(value)] || 'Article'
}

const loadArticles = async (payload: Payload): Promise<SiteSearchDocument[]> => {
  const result = await payload.find({
    collection: 'articles',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    select: articleSelect,
    where: publicWhere([{ contentMode: { equals: 'full' } }]),
  })

  return result.docs.flatMap((value) => {
    const document = asRecord(value)
    const typeLabel = articleTypeLabel(document.articleType)
    const projected = project({
      body: [
        typeLabel,
        stringValue(document.byline),
        stringValue(document.location),
        metaText(document, 'title'),
        metaText(document, 'description'),
        searchableTextFromStructuredContent(document.layout),
      ],
      collection: 'articles',
      document,
      excerpt: [stringValue(document.excerpt), metaText(document, 'description')],
      typeLabel,
    })
    return projected ? [projected] : []
  })
}

const loadHubs = async (payload: Payload): Promise<SiteSearchDocument[]> => {
  const result = await payload.find({
    collection: 'hubs',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    select: hubSelect,
    where: publicWhere([{ contentMode: { equals: 'page' } }]),
  })

  return result.docs.flatMap((value) => {
    const document = asRecord(value)
    const projected = project({
      body: [
        stringValue(document.code),
        metaText(document, 'title'),
        metaText(document, 'description'),
        searchableTextFromStructuredContent(document.layout),
      ],
      collection: 'hubs',
      document,
      excerpt: [stringValue(document.summary), metaText(document, 'description')],
      typeLabel: 'Market hub',
    })
    return projected ? [projected] : []
  })
}

const loadVenues = async (payload: Payload): Promise<SiteSearchDocument[]> => {
  const result = await payload.find({
    collection: 'venues',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    select: venueSelect,
    where: publicWhere([{ contentMode: { equals: 'page' } }]),
  })

  return result.docs.flatMap((value) => {
    const document = asRecord(value)
    const projected = project({
      body: [
        stringValue(document.code),
        stringValue(asRecord(document.location).label),
        metaText(document, 'title'),
        metaText(document, 'description'),
        searchableTextFromStructuredContent(document.description),
        searchableTextFromStructuredContent(document.layout),
      ],
      collection: 'venues',
      document,
      excerpt: [
        stringValue(document.summary),
        metaText(document, 'description'),
        searchableTextFromStructuredContent(document.description),
      ],
      typeLabel: 'Venue',
    })
    return projected ? [projected] : []
  })
}

const tagLabels = (value: unknown): string =>
  (Array.isArray(value) ? value : [])
    .map((item) => stringValue(asRecord(item).label))
    .filter(Boolean)
    .join(' ')

const loadLearningVideos = async (payload: Payload): Promise<SiteSearchDocument[]> => {
  const result = await payload.find({
    collection: 'learning-videos',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    select: learningVideoSelect,
    where: publicWhere([{ contentMode: { equals: 'full' } }]),
  })

  return result.docs.flatMap((value) => {
    const document = asRecord(value)
    const projected = project({
      body: [
        stringValue(document.product),
        tagLabels(document.tags),
        metaText(document, 'title'),
        metaText(document, 'description'),
        searchableTextFromStructuredContent(document.description),
        searchableTextFromStructuredContent(document.layout),
      ],
      collection: 'learning-videos',
      document,
      excerpt: [
        stringValue(document.summary),
        metaText(document, 'description'),
        searchableTextFromStructuredContent(document.description),
      ],
      typeLabel: 'Learning video',
    })
    return projected ? [projected] : []
  })
}

const loadPeople = async (payload: Payload): Promise<SiteSearchDocument[]> => {
  const result = await payload.find({
    collection: 'people',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    select: peopleSelect,
    where: publicWhere(),
  })

  return result.docs.flatMap((value) => {
    const document = asRecord(value)
    const biography = searchableTextFromStructuredContent(document.description)
    const projected = project({
      body: [
        stringValue(document.jobRole),
        metaText(document, 'title'),
        metaText(document, 'description'),
        biography,
        searchableTextFromStructuredContent(document.quote),
      ],
      collection: 'people',
      document,
      excerpt: [metaText(document, 'description'), biography],
      typeLabel: 'Person',
    })
    return projected ? [projected] : []
  })
}

/**
 * Route-owner search is intentionally adapter based. A new public collection
 * (for example People) registers one access-filtered loader here and inherits
 * the shared cache, relevance, pagination and UI contracts unchanged.
 */
export const publicSearchSources: readonly PublicSearchSourceAdapter[] = [
  {
    cacheTag: 'content-dependency-collection:pages',
    collection: 'pages',
    load: loadPages,
  },
  {
    cacheTag: 'content-dependency-collection:articles',
    collection: 'articles',
    load: loadArticles,
  },
  {
    cacheTag: 'content-dependency-collection:people',
    collection: 'people',
    load: loadPeople,
  },
  {
    cacheTag: 'content-dependency-collection:hubs',
    collection: 'hubs',
    load: loadHubs,
  },
  {
    cacheTag: 'content-dependency-collection:venues',
    collection: 'venues',
    load: loadVenues,
  },
  {
    cacheTag: 'content-dependency-collection:learning-videos',
    collection: 'learning-videos',
    load: loadLearningVideos,
  },
]
