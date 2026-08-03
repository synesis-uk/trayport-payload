import { APIError, type CollectionBeforeChangeHook } from 'payload'
import { isDeepStrictEqual } from 'node:util'

export const contentRouteCollections = [
  'pages',
  'articles',
  'hubs',
  'venues',
  'learning-videos',
] as const

export type ContentRouteCollection = (typeof contentRouteCollections)[number]

export const routeArchetypeIDs = [
  'page.homepage',
  'page.standard',
  'page.product',
  'page.landing',
  'page.legal',
  'page.conversion',
  'page.interactive-market-matrix',
  'page.content-index',
  'article.full',
  'article.listing-metadata',
  'learning-video.public-detail',
  'hub.public-page',
  'hub.map-only',
  'venue.structured-record',
  'venue.public-detail',
  'index.venue',
  'index.market-coverage',
] as const

export type RouteArchetypeID = (typeof routeArchetypeIDs)[number]
export type RoutePolicy = 'forbidden' | 'required'

type UnknownRecord = Record<string, unknown>

export type ArchetypeResolution = {
  archetype: RouteArchetypeID
  policy: RoutePolicy
}

const text = (value: unknown): string => (typeof value === 'string' ? value : '')

export const validateHTTPSVideoURL = (value: string | null | undefined): true | string => {
  if (!value) return true

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(url.hostname) ? true : 'Use a complete HTTPS URL.'
  } catch {
    return 'Use a complete HTTPS URL.'
  }
}

const managedVideoMimeType = async (
  value: unknown,
  req: Parameters<CollectionBeforeChangeHook>[0]['req'],
): Promise<string | null> => {
  if (!value) return null
  if (typeof value === 'object' && !Array.isArray(value)) {
    return text((value as UnknownRecord).mimeType) || null
  }
  if (typeof value !== 'string' && typeof value !== 'number') return null

  const media = await req.payload.findByID({
    collection: 'media',
    depth: 0,
    id: value,
    overrideAccess: true,
    req,
  })
  return text(media?.mimeType) || null
}

const blocks = (value: unknown): UnknownRecord[] =>
  Array.isArray(value)
    ? value.filter(
        (item): item is UnknownRecord =>
          Boolean(item) && typeof item === 'object' && !Array.isArray(item),
      )
    : []

const status = (document: UnknownRecord): 'draft' | 'published' =>
  document._status === 'published' ? 'published' : 'draft'

export const resolveArchetype = (
  collection: ContentRouteCollection,
  document: UnknownRecord,
): ArchetypeResolution => {
  if (collection === 'pages') {
    const pageTypes: Record<string, RouteArchetypeID> = {
      homepage: 'page.homepage',
      standard: 'page.standard',
      product: 'page.product',
      landing: 'page.landing',
      legal: 'page.legal',
      conversion: 'page.conversion',
      interactive: 'page.interactive-market-matrix',
      index: 'page.content-index',
    }
    const pageType = text(document.pageType) || 'standard'
    const archetype = pageTypes[pageType]
    if (!archetype) {
      throw new APIError(`Unknown page archetype: ${pageType}`, 400)
    }
    return { archetype, policy: 'required' }
  }

  if (collection === 'articles') {
    return document.contentMode === 'full'
      ? { archetype: 'article.full', policy: 'required' }
      : { archetype: 'article.listing-metadata', policy: 'forbidden' }
  }

  if (collection === 'hubs') {
    return document.contentMode === 'page'
      ? { archetype: 'hub.public-page', policy: 'required' }
      : { archetype: 'hub.map-only', policy: 'forbidden' }
  }

  if (collection === 'venues') {
    return document.contentMode === 'page'
      ? { archetype: 'venue.public-detail', policy: 'required' }
      : { archetype: 'venue.structured-record', policy: 'forbidden' }
  }

  return { archetype: 'learning-video.public-detail', policy: 'required' }
}

const allowedBlocksFor = (archetype: RouteArchetypeID): Set<string> => {
  if (archetype === 'page.content-index') {
    return new Set(['trayportHero', 'contentSection', 'articleListing'])
  }

  if (
    archetype === 'article.listing-metadata' ||
    archetype === 'hub.map-only' ||
    archetype === 'venue.structured-record'
  ) {
    return new Set()
  }

  return new Set(['trayportHero', 'contentSection'])
}

const validateLayout = (
  archetype: RouteArchetypeID,
  layout: UnknownRecord[],
  published: boolean,
): void => {
  const allowed = allowedBlocksFor(archetype)
  const invalid = layout
    .map((block) => text(block.blockType))
    .filter((blockType) => blockType && !allowed.has(blockType))

  if (invalid.length) {
    throw new APIError(
      `${archetype} does not allow these top-level blocks: ${[...new Set(invalid)].join(', ')}`,
      400,
    )
  }

  if (
    published &&
    [
      'page.homepage',
      'page.standard',
      'page.product',
      'page.landing',
      'page.legal',
      'page.conversion',
      'page.interactive-market-matrix',
      'page.content-index',
      'article.full',
    ].includes(archetype) &&
    layout.length === 0
  ) {
    throw new APIError(`${archetype} requires at least one content block before publication.`, 400)
  }

  if (
    published &&
    archetype === 'page.content-index' &&
    !layout.some((block) => block.blockType === 'articleListing')
  ) {
    throw new APIError('Content-index pages require an article listing before publication.', 400)
  }
}

const routeMutationStoreKey = 'trayportRouteMutations'
const redirectApprovalPrefix = 'trayport-path-redirect:'

export type RouteMutationIntent = 'draft' | 'publish' | 'unpublish'
export type RouteMutationOperation = 'create' | 'update'

export type RouteMutation = {
  archetype: RouteArchetypeID
  confirmedRedirect: boolean
  intent: RouteMutationIntent
  nextPath: string | null
  previousPublishedPath: string | null
  routePolicy: RoutePolicy
}

export type PathRedirectApproval = {
  from: string
  to: string
}

type RequestWithRouteMutation = {
  context: Record<string, unknown>
  payloadAPI?: string
  query?: Record<string, unknown>
}

const routeMutationIdentity = (
  collection: ContentRouteCollection,
  document: UnknownRecord,
  operation: RouteMutationOperation,
): string | null => {
  if (
    operation === 'update' &&
    (typeof document.id === 'string' || typeof document.id === 'number')
  ) {
    return `${collection}:id:${document.id}`
  }

  const slug = text(document.slug)
  if (slug) return `${collection}:slug:${slug}`

  const path = text(document.path)
  return path ? `${collection}:path:${path}` : null
}

const mutationStore = (
  context: Record<string, unknown>,
  create: boolean,
): Record<string, RouteMutation> | null => {
  const current = context[routeMutationStoreKey]
  if (current && typeof current === 'object' && !Array.isArray(current)) {
    return current as Record<string, RouteMutation>
  }
  if (!create) return null

  const store: Record<string, RouteMutation> = {}
  context[routeMutationStoreKey] = store
  return store
}

const setRouteMutation = ({
  collection,
  context,
  document,
  mutation,
  operation,
}: {
  collection: ContentRouteCollection
  context: Record<string, unknown>
  document: UnknownRecord
  mutation: RouteMutation
  operation: RouteMutationOperation
}): void => {
  const identity = routeMutationIdentity(collection, document, operation)
  if (!identity) return
  const store = mutationStore(context, true)
  if (store) store[identity] = mutation
}

export const takeRouteMutation = ({
  collection,
  context,
  document,
  operation,
}: {
  collection: ContentRouteCollection
  context: Record<string, unknown>
  document: UnknownRecord
  operation: RouteMutationOperation
}): RouteMutation | null => {
  const identity = routeMutationIdentity(collection, document, operation)
  const store = mutationStore(context, false)
  if (!identity || !store?.[identity]) return null

  const mutation = store[identity]
  delete store[identity]
  return mutation
}

export const encodePathRedirectApproval = ({ from, to }: PathRedirectApproval): string =>
  `${redirectApprovalPrefix}${JSON.stringify({ from, to })}`

export const decodePathRedirectApproval = (value: unknown): PathRedirectApproval | null => {
  if (typeof value !== 'string' || !value.startsWith(redirectApprovalPrefix)) return null

  try {
    const parsed = JSON.parse(value.slice(redirectApprovalPrefix.length)) as UnknownRecord
    const from = asPath(parsed.from)
    const to = asPath(parsed.to)
    return from && to ? { from, to } : null
  } catch {
    return null
  }
}

const requestFlag = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(requestFlag)
  return value === true || value === 'true' || value === 1 || value === '1'
}

const draftSaveRequested = (
  req: RequestWithRouteMutation,
  data: UnknownRecord,
  previousPublished: boolean,
  previous: UnknownRecord,
): boolean => {
  if (req.context.routeOperation === 'draft') return true
  if (req.context.routeOperation === 'unpublish') return false
  if (requestFlag(req.query?.autosave)) return true
  if (!previousPublished) return true

  // Both saving a draft and unpublishing can carry Payload's `draft` query flag.
  // A status-only update against a live claim is therefore an unpublish; a
  // substantive change is a new draft unless the caller supplied an explicit
  // route operation above.
  return Object.keys(data).some(
    (key) =>
      !['_status', 'updatedAt', 'confirmPathRedirect'].includes(key) &&
      !isDeepStrictEqual(data[key], previous[key]),
  )
}

const asPath = (value: unknown): string | null =>
  typeof value === 'string' && value.startsWith('/') ? value : null

export const validateRoutableDocument = (
  collection: ContentRouteCollection,
): CollectionBeforeChangeHook => {
  return async ({ data, operation, originalDoc, req }) => {
    if (req.context.skipRouteRegistry) return data

    const previous = (originalDoc || {}) as UnknownRecord
    const next = { ...previous, ...data } as UnknownRecord
    const resolution = resolveArchetype(collection, next)
    const nextPath = asPath(next.path)
    const previousPath = asPath(previous.path)
    const previousPublished = previous._status === 'published'
    const nextStatus = status(next)
    let previousPublishedPath = previousPublished ? previousPath : null
    let reservedRedirectApproval: PathRedirectApproval | null = null

    // Payload can pass a draft version as `originalDoc` for both unpublishing
    // and republishing a versioned document. The live route claim is the
    // authoritative fallback for deciding which lifecycle operation this is.
    if (typeof previous.id === 'string' || typeof previous.id === 'number') {
      const result = await req.payload.find({
        collection: 'route-registry',
        depth: 0,
        limit: 2,
        overrideAccess: true,
        pagination: false,
        req,
        where: {
          and: [
            { ownerCollection: { equals: collection } },
            { ownerDocumentId: { equals: String(previous.id) } },
          ],
        },
      })
      const publishedClaim = result.docs.find(({ state }) => state === 'published')
      const reservedClaim = result.docs.find(({ state }) => state === 'reserved')
      previousPublishedPath ||= asPath(publishedClaim?.path)
      reservedRedirectApproval = decodePathRedirectApproval(reservedClaim?.provenance.note)
    }

    const isDraftSave =
      nextStatus === 'draft' &&
      draftSaveRequested(
        req as unknown as RequestWithRouteMutation,
        data as UnknownRecord,
        Boolean(previousPublishedPath),
        previous,
      )
    const intent: RouteMutationIntent =
      nextStatus === 'published' ? 'publish' : isDraftSave ? 'draft' : 'unpublish'
    const published = intent === 'publish'
    const layout = blocks(next.layout)

    if (resolution.policy === 'forbidden') {
      if (nextPath) {
        throw new APIError(`${resolution.archetype} records cannot own a public path.`, 400)
      }
      if (layout.length) {
        throw new APIError(`${resolution.archetype} records cannot own layout blocks.`, 400)
      }
    }

    if (published && resolution.policy === 'required' && !nextPath) {
      throw new APIError(`${resolution.archetype} requires a public path before publication.`, 400)
    }

    if (resolution.archetype === 'page.homepage' && nextPath && nextPath !== '/') {
      throw new APIError('The homepage must own the root path (/).', 400)
    }
    if (resolution.archetype !== 'page.homepage' && nextPath === '/') {
      throw new APIError('Only the homepage can own the root path (/).', 400)
    }

    validateLayout(resolution.archetype, layout, published)

    if (
      published &&
      ['page.conversion', 'page.interactive-market-matrix'].includes(resolution.archetype)
    ) {
      throw new APIError(
        `${resolution.archetype} cannot publish until its required production block is implemented.`,
        400,
      )
    }

    if (
      published &&
      resolution.archetype === 'venue.public-detail' &&
      layout.length === 0 &&
      !next.description
    ) {
      throw new APIError(
        'A public venue detail requires a managed description or layout before publication.',
        400,
      )
    }

    if (published && resolution.archetype === 'learning-video.public-detail') {
      const accessMode = text(next.accessMode) || 'public'
      if (accessMode !== 'public') {
        throw new APIError(
          'Authenticated and subscriber learning videos must remain drafts until protected media delivery is implemented.',
          400,
        )
      }

      const externalVideoURL = text(next.externalVideoURL)
      if (externalVideoURL && validateHTTPSVideoURL(externalVideoURL) !== true) {
        throw new APIError(
          'A learning video external destination must be a complete HTTPS URL.',
          400,
        )
      }

      const mediaMimeType = await managedVideoMimeType(next.video, req)
      if (next.video && !mediaMimeType?.startsWith('video/')) {
        throw new APIError('Managed learning-video media must use a video MIME type.', 400)
      }

      if (!mediaMimeType && !externalVideoURL) {
        throw new APIError(
          'A learning video requires managed media or an external video URL before publication.',
          400,
        )
      }
    }

    const publishedPathChanged =
      intent === 'publish' &&
      Boolean(previousPublishedPath && nextPath && previousPublishedPath !== nextPath)
    const confirmedRedirect =
      data.confirmPathRedirect === true ||
      Boolean(
        reservedRedirectApproval &&
        reservedRedirectApproval.from === previousPublishedPath &&
        reservedRedirectApproval.to === nextPath,
      )
    if (publishedPathChanged && !confirmedRedirect) {
      throw new APIError(
        `Publishing this path change requires confirmation that ${previousPublishedPath} will redirect to ${nextPath}.`,
        400,
      )
    }

    setRouteMutation({
      collection,
      context: req.context as Record<string, unknown>,
      document: next,
      mutation: {
        archetype: resolution.archetype,
        confirmedRedirect,
        intent,
        nextPath,
        previousPublishedPath,
        routePolicy: resolution.policy,
      },
      operation,
    })

    if (operation === 'create' && resolution.policy === 'forbidden') {
      data.path = null
    }

    return data
  }
}
