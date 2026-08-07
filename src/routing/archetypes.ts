import { APIError, type CollectionBeforeChangeHook } from 'payload'
import { isDeepStrictEqual } from 'node:util'

import { validateExternalHTTPSURL } from './urlPolicy'

export const contentRouteCollections = [
  'pages',
  'articles',
  'people',
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
  'person.public-profile',
  'learning-video.public-detail',
  'learning-video.listing-metadata',
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
  return validateExternalHTTPSURL(value)
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

  if (collection === 'people') {
    return { archetype: 'person.public-profile', policy: 'required' }
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

  return document.contentMode === 'full'
    ? { archetype: 'learning-video.public-detail', policy: 'required' }
    : { archetype: 'learning-video.listing-metadata', policy: 'forbidden' }
}

const allowedBlocksFor = (archetype: RouteArchetypeID): Set<string> => {
  if (archetype === 'page.content-index') {
    return new Set(['trayportHero', 'contentSection', 'articleListing', 'learningVideoListing'])
  }

  if (
    archetype === 'article.listing-metadata' ||
    archetype === 'learning-video.listing-metadata' ||
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

  if (published && allowed.has('trayportHero')) {
    const heroPositions = layout.flatMap((block, index) =>
      block.blockType === 'trayportHero' ? [index] : [],
    )

    if (heroPositions.length > 1) {
      throw new APIError('Published routes allow at most one trayportHero block.', 400)
    }
    if (heroPositions[0] !== undefined && heroPositions[0] !== 0) {
      throw new APIError('A published route trayportHero must be the first content block.', 400)
    }
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
    layout.filter(
      (block) => block.blockType === 'articleListing' || block.blockType === 'learningVideoListing',
    ).length !== 1
  ) {
    throw new APIError(
      'Content-index pages require exactly one article or learning-video listing before publication.',
      400,
    )
  }
}

const sectionComponents = (layout: UnknownRecord[]): UnknownRecord[] =>
  layout.flatMap((block) =>
    block.blockType === 'contentSection'
      ? blocks(block.columns).flatMap((column) => blocks(column.components))
      : [],
  )

const sectionComponentCount = (layout: UnknownRecord[], blockType: string): number =>
  sectionComponents(layout).filter((component) => component.blockType === blockType).length

const optionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const validateDataChartRange = (component: UnknownRecord): void => {
  const fromYear = optionalNumber(component.fromYear)
  const fromQuarter = optionalNumber(component.fromQuarter)
  const toYear = optionalNumber(component.toYear)
  const toQuarter = optionalNumber(component.toQuarter)

  if ((fromYear === null) !== (fromQuarter === null)) {
    throw new APIError('Data charts require both a from year and from quarter, or neither.', 400)
  }
  if ((toYear === null) !== (toQuarter === null)) {
    throw new APIError('Data charts require both a to year and to quarter, or neither.', 400)
  }
  if (
    fromYear !== null &&
    fromQuarter !== null &&
    toYear !== null &&
    toQuarter !== null &&
    fromYear * 4 + fromQuarter > toYear * 4 + toQuarter
  ) {
    throw new APIError('Data chart start quarter must not be after its end quarter.', 400)
  }
}

const relationID = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const id = (value as UnknownRecord).id
  return typeof id === 'number' || typeof id === 'string' ? id : null
}

const legacyIDFromAssetClass = (value: unknown): number | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const legacySource = (value as UnknownRecord).legacySource
  if (!legacySource || typeof legacySource !== 'object' || Array.isArray(legacySource)) return null
  const legacyID = Number((legacySource as UnknownRecord).legacyId)
  return Number.isInteger(legacyID) && legacyID > 0 ? legacyID : null
}

const dataChartRelationshipIDs = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [])
    .map(relationID)
    .filter((id): id is number | string => id !== null)
    .map(String)

const validateDataChartSemantics = (component: UnknownRecord): void => {
  const seriesDimension = text(component.seriesDimension)
  const dataType = text(component.dataType)
  const chartType = text(component.chartType)
  const displayInterval = text(component.displayInterval)
  const includedHubIDs = dataChartRelationshipIDs(component.includedHubs)
  const excludedHubIDs = dataChartRelationshipIDs(component.excludedHubs)

  if (!['month', 'quarter', 'year'].includes(displayInterval)) {
    throw new APIError('Data charts require a supported display interval.', 400)
  }
  if (includedHubIDs.some((id) => excludedHubIDs.includes(id))) {
    throw new APIError('Data charts cannot include and exclude the same hub.', 400)
  }

  if (seriesDimension === 'executionType') {
    if (dataType !== 'volume' || chartType !== 'stackedColumn') {
      throw new APIError('Execution-type data charts require volume stacked columns.', 400)
    }
    if (includedHubIDs.length || excludedHubIDs.length) {
      throw new APIError('Execution-type data charts cannot filter hubs.', 400)
    }
    return
  }

  if (seriesDimension !== 'hub') {
    throw new APIError('Data charts require a supported series dimension.', 400)
  }
  if (!(
    (dataType === 'volume' && chartType === 'column') ||
    (dataType === 'price' && chartType === 'line')
  )) {
    throw new APIError('Hub data charts require volume columns or a price line.', 400)
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

export const getRouteMutation = ({
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

  return identity && store?.[identity] ? store[identity] : null
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

    if (
      published &&
      collection === 'articles' &&
      next.articleType === 'event' &&
      !nextPath?.startsWith('/event/')
    ) {
      throw new APIError('Published events must use the canonical /event/ namespace.', 400)
    }

    if (collection === 'articles' && next.articleType === 'event') {
      const eventDetails =
        next.eventDetails &&
        typeof next.eventDetails === 'object' &&
        !Array.isArray(next.eventDetails)
          ? (next.eventDetails as UnknownRecord)
          : {}
      const startsAt = Date.parse(text(eventDetails.startsAt))
      const endsAt = Date.parse(text(eventDetails.endsAt))
      if (Number.isFinite(startsAt) && Number.isFinite(endsAt) && startsAt > endsAt) {
        throw new APIError('An event cannot end before it starts.', 400)
      }
    }

    validateLayout(resolution.archetype, layout, published)

    if (published) {
      for (const component of sectionComponents(layout).filter(
        ({ blockType }) => blockType === 'dataChart',
      )) {
        validateDataChartRange(component)
        validateDataChartSemantics(component)
        const assetClassID = relationID(component.assetClass)
        if (assetClassID === null) {
          throw new APIError('Data charts require a managed asset class before publication.', 400)
        }

        let legacyID = legacyIDFromAssetClass(component.assetClass)
        if (legacyID === null) {
          const assetClass = await req.payload.findByID({
            collection: 'asset-classes',
            depth: 0,
            id: assetClassID,
            overrideAccess: true,
            req,
          })
          legacyID = legacyIDFromAssetClass(assetClass)
        }
        if (legacyID === null) {
          throw new APIError(
            'Data charts require an imported asset class with an application-data key.',
            400,
          )
        }
      }
    }

    const marketMatrixCount = sectionComponentCount(layout, 'marketMatrix')
    if (resolution.archetype !== 'page.interactive-market-matrix' && marketMatrixCount > 0) {
      throw new APIError(
        `${resolution.archetype} does not allow the marketMatrix section component.`,
        400,
      )
    }
    if (
      published &&
      resolution.archetype === 'page.interactive-market-matrix' &&
      marketMatrixCount !== 1
    ) {
      throw new APIError(
        'Interactive market-matrix pages require exactly one marketMatrix section component before publication.',
        400,
      )
    }
    if (published && resolution.archetype === 'page.conversion') {
      throw new APIError(
        'page.conversion cannot publish until its required first-party form is implemented.',
        400,
      )
    }

    if (
      published &&
      resolution.archetype === 'venue.public-detail' &&
      layout.length === 0 &&
      !next.description &&
      (!Array.isArray(next.marketConnections) || next.marketConnections.length === 0) &&
      // The reference publishes venue details that carry nothing but an identity: it serves
      // /venue/nasdaq-omx/ and /venue/nasdaq-commodities-europe/ at 200 with only a website
      // link. Requiring body content would make those two routes 404 against a live 200, so a
      // managed website or logo is accepted as the minimum a public venue detail needs.
      !next.website &&
      !next.logo
    ) {
      throw new APIError(
        'A public venue detail requires a managed description, layout, market connections, website, or logo before publication.',
        400,
      )
    }

    if (collection === 'learning-videos') {
      const contentMode = text(next.contentMode) || 'listing'
      const accessMode = text(next.accessMode) || 'public'
      const externalVideoURL = text(next.externalVideoURL)

      if (contentMode !== 'full' && (next.video || externalVideoURL || layout.length > 0)) {
        throw new APIError(
          'Listing-only learning videos must not store managed media, an external video URL, or supporting layout.',
          400,
        )
      }

      if (accessMode !== 'public' && (next.video || externalVideoURL || layout.length > 0)) {
        throw new APIError(
          'Protected learning-video pages must not expose managed media, an external video URL, or supporting layout.',
          400,
        )
      }

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

      if (
        published &&
        resolution.archetype === 'learning-video.public-detail' &&
        accessMode === 'public' &&
        !mediaMimeType &&
        !externalVideoURL
      ) {
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
