import {
  CACHE_TAG_ITEM_LIMIT,
  cacheDependencyCollections,
  cacheDependencyCollectionTag,
  cacheDependencyTag,
  type CacheDependencyCollection,
} from './cacheTags'

export type CacheDependencySource =
  CacheDependencyCollection | 'footer' | 'navigation' | 'route-indexes' | 'site-settings'

export interface CacheDependencyInput {
  source: CacheDependencySource
  value: unknown
}

export interface CacheDependencyTagOptions {
  /** Primary/owner tags the caller applies to the same Next.js cache entry. */
  reservedTagCount?: number
}

type UnknownRecord = Record<string, unknown>

const dependencyCollectionSet = new Set<string>(cacheDependencyCollections)

const isRecord = (value: unknown): value is UnknownRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const dependencyID = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (!isRecord(value)) return null

  return typeof value.id === 'number' || typeof value.id === 'string' ? value.id : null
}

const cacheDependencyCollection = (value: unknown): CacheDependencyCollection | null =>
  typeof value === 'string' && dependencyCollectionSet.has(value)
    ? (value as CacheDependencyCollection)
    : null

const relationshipTarget = (
  field: string,
  source: CacheDependencySource,
): CacheDependencyCollection | null => {
  if (
    field === 'backgroundMedia' ||
    field === 'heroMedia' ||
    field === 'image' ||
    field === 'logo' ||
    field === 'media' ||
    field === 'poster' ||
    field === 'video'
  ) {
    return 'media'
  }

  if (field === 'office') return 'offices'
  if (field === 'lifecycleItems') return 'lifecycle-items'
  if (field === 'regions') return 'regions'
  if (field === 'venueTypes') return 'venue-types'
  if (field === 'assetClass' || field === 'assetClasses') return 'asset-classes'
  if (field === 'relatedArticles') return 'articles'
  if (field === 'relatedHubs' || field === 'hub') return 'hubs'
  if (field === 'policyPage') return 'pages'
  if (field === 'people') return 'people'
  if (field === 'venue') return 'venues'

  if (field === 'categories') {
    if (source === 'articles') return 'article-categories'
    if (source === 'learning-videos') return 'learning-video-categories'
  }

  if (field === 'parent' && (source === 'pages' || source === 'article-categories')) {
    return source
  }

  return null
}

/**
 * Finds the document-level dependencies Payload populated into a cached public
 * projection. Only schema-backed relationship field names are followed, so row
 * IDs and other embedded object IDs never become cache tags accidentally.
 */
export const collectProjectionCacheDependencyTags = (
  inputs: readonly CacheDependencyInput[],
  { reservedTagCount = 1 }: CacheDependencyTagOptions = {},
): string[] => {
  if (
    !Number.isInteger(reservedTagCount) ||
    reservedTagCount < 0 ||
    reservedTagCount > CACHE_TAG_ITEM_LIMIT
  ) {
    throw new RangeError(`reservedTagCount must be between 0 and ${CACHE_TAG_ITEM_LIMIT}.`)
  }

  const dependencyTagBudget = CACHE_TAG_ITEM_LIMIT - reservedTagCount
  const tags = new Set<string>()
  const taggedCollections = new Set<CacheDependencyCollection>()
  const visited = new WeakMap<object, Set<CacheDependencySource>>()

  const addRelationship = (relationship: unknown, collection: CacheDependencyCollection): void => {
    if (Array.isArray(relationship)) {
      for (const item of relationship) addRelationship(item, collection)
      return
    }

    const id = dependencyID(relationship)
    if (id !== null) {
      tags.add(cacheDependencyTag(collection, id))
      taggedCollections.add(collection)
    }
    walk(relationship, collection)
  }

  const walk = (current: unknown, currentSource: CacheDependencySource): void => {
    if (Array.isArray(current)) {
      for (const item of current) walk(item, currentSource)
      return
    }
    if (!isRecord(current)) return
    const visitedSources = visited.get(current)
    if (visitedSources?.has(currentSource)) return
    if (visitedSources) visitedSources.add(currentSource)
    else visited.set(current, new Set([currentSource]))

    if (current.blockType === 'peopleList' && current.selectionMode === 'team') {
      tags.add(cacheDependencyCollectionTag('people'))
      taggedCollections.add('people')
    }

    const polymorphicCollection = cacheDependencyCollection(current.relationTo)
    if (polymorphicCollection && 'value' in current) {
      addRelationship(current.value, polymorphicCollection)
    }

    for (const [field, child] of Object.entries(current)) {
      if (field === 'relationTo' || (polymorphicCollection && field === 'value')) continue

      const target = relationshipTarget(field, currentSource)
      if (target) addRelationship(child, target)
      else walk(child, currentSource)
    }
  }

  for (const input of inputs) walk(input.value, input.source)
  if (tags.size <= dependencyTagBudget) return [...tags].sort()

  // Never truncate exact tags: omitted documents would no longer invalidate the projection. When
  // a projection exceeds Next's per-entry budget, use one tag per referenced collection instead.
  // Dependency hooks invalidate both forms, preserving correctness with intentionally broader
  // cache refreshes only for large projections.
  const collectionTags = [...taggedCollections].map(cacheDependencyCollectionTag).sort()
  if (collectionTags.length > dependencyTagBudget) {
    throw new RangeError(
      `The projection reserved ${reservedTagCount} primary tags, leaving too few slots for its ${collectionTags.length} dependency collections.`,
    )
  }

  return collectionTags
}

/**
 * Convenience boundary for the common one-source, one-primary-tag projection. Multi-source or
 * multi-owner caches must call `collectProjectionCacheDependencyTags` once over their final union.
 */
export const collectCacheDependencyTags = (
  value: unknown,
  source: CacheDependencySource,
  options?: CacheDependencyTagOptions,
): string[] => collectProjectionCacheDependencyTags([{ source, value }], options)
