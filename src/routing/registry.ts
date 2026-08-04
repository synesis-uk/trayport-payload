import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionAfterDeleteHook,
  type Payload,
  type PayloadRequest,
  ValidationError,
} from 'payload'

import { normalizeContentPath } from '@/fields/contentPath'

import {
  encodePathRedirectApproval,
  type ContentRouteCollection,
  getRouteMutation,
  type PathRedirectApproval,
  resolveArchetype,
  type RouteArchetypeID,
} from './archetypes'

type UnknownRecord = Record<string, unknown>
type ClaimState = 'published' | 'reserved'
type OwnerKind = 'content' | 'redirect' | 'virtual'
type OwnerCollection = ContentRouteCollection | 'redirects' | 'system'

type ClaimInput = {
  archetype: RouteArchetypeID | 'redirect'
  ownerCollection: OwnerCollection
  ownerDocumentId: number | string
  ownerKind: OwnerKind
  path: string
  provenance: {
    legacyId?: number | null
    note?: string | null
    originalPath?: string | null
    source: 'native' | 'plugin' | 'system' | 'wordpress'
  }
  state: ClaimState
}

type RegistryDocument = ClaimInput & {
  claimKey: string
  id: number | string
  updatedAt?: string
}

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : {}

const pathFrom = (value: unknown): string | null => {
  const normalized = normalizeContentPath(value)
  return typeof normalized === 'string' && normalized.startsWith('/') ? normalized : null
}

const claimKey = ({
  ownerCollection,
  ownerDocumentId,
  ownerKind,
  state,
}: Pick<ClaimInput, 'ownerCollection' | 'ownerDocumentId' | 'ownerKind' | 'state'>): string =>
  [ownerKind, ownerCollection, String(ownerDocumentId), state].join(':')

const provenanceFromDocument = (document: UnknownRecord): ClaimInput['provenance'] => {
  const legacySource = asRecord(document.legacySource)
  const source = legacySource.source === 'wordpress' ? 'wordpress' : 'native'
  let originalPath: string | null = null
  if (typeof legacySource.originalUrl === 'string') {
    try {
      originalPath = new URL(legacySource.originalUrl).pathname
    } catch {
      originalPath = pathFrom(legacySource.originalUrl)
    }
  }

  return {
    source,
    legacyId: typeof legacySource.legacyId === 'number' ? legacySource.legacyId : null,
    note: null,
    originalPath,
  }
}

const findClaims = async (
  req: PayloadRequest,
  ownerCollection: OwnerCollection,
  ownerDocumentId: number | string,
): Promise<RegistryDocument[]> => {
  const result = await req.payload.find({
    collection: 'route-registry',
    depth: 0,
    overrideAccess: true,
    pagination: false,
    req,
    where: {
      and: [
        { ownerCollection: { equals: ownerCollection } },
        { ownerDocumentId: { equals: String(ownerDocumentId) } },
      ],
    },
  })

  return result.docs as unknown as RegistryDocument[]
}

const deleteClaim = async (req: PayloadRequest, claim: RegistryDocument): Promise<void> => {
  await req.payload.delete({
    collection: 'route-registry',
    context: { ...req.context, routeRegistryInternal: true },
    id: claim.id,
    overrideAccess: true,
    req,
  })
}

const deleteClaims = async (
  req: PayloadRequest,
  ownerCollection: OwnerCollection,
  ownerDocumentId: number | string,
  state?: ClaimState,
): Promise<void> => {
  const claims = await findClaims(req, ownerCollection, ownerDocumentId)
  for (const claim of claims) {
    if (!state || claim.state === state) {
      await deleteClaim(req, claim)
    }
  }
}

const conflictMessage = (path: string, conflict?: RegistryDocument): string => {
  const owner = conflict
    ? `${conflict.ownerKind}:${conflict.ownerCollection}:${conflict.ownerDocumentId}`
    : 'another route owner'
  return `The canonical path ${path} is already claimed by ${owner}.`
}

const isRegistryUniqueValidationError = (error: unknown): boolean =>
  error instanceof ValidationError &&
  error.data.collection === 'route-registry' &&
  error.data.errors.some(
    ({ path, tableName }) =>
      tableName === 'route_registry' && ['claimKey', 'claim_key', 'path'].includes(path),
  )

const upsertClaim = async (req: PayloadRequest, input: ClaimInput): Promise<RegistryDocument> => {
  const path = pathFrom(input.path)
  if (!path) {
    throw new APIError(`Invalid canonical route path: ${input.path}`, 400)
  }

  const key = claimKey(input)
  const [matchingKey, matchingPath] = await Promise.all([
    req.payload.find({
      collection: 'route-registry',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      req,
      where: { claimKey: { equals: key } },
    }),
    req.payload.find({
      collection: 'route-registry',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      req,
      where: { path: { equals: path } },
    }),
  ])
  const existing = matchingKey.docs[0] as unknown as RegistryDocument | undefined
  const conflict = matchingPath.docs[0] as unknown as RegistryDocument | undefined

  if (conflict && conflict.id !== existing?.id) {
    throw new APIError(conflictMessage(path, conflict), 409)
  }

  const data = {
    ...input,
    ownerDocumentId: String(input.ownerDocumentId),
    path,
    claimKey: key,
  }

  try {
    const saved = existing
      ? await req.payload.update({
          collection: 'route-registry',
          context: { ...req.context, routeRegistryInternal: true },
          data,
          id: existing.id,
          overrideAccess: true,
          req,
        })
      : await req.payload.create({
          collection: 'route-registry',
          context: { ...req.context, routeRegistryInternal: true },
          data,
          overrideAccess: true,
          req,
        })

    return saved as unknown as RegistryDocument
  } catch (error) {
    if (isRegistryUniqueValidationError(error)) {
      throw new APIError(conflictMessage(path), 409)
    }
    if (error instanceof APIError) throw error
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: unknown }).code === '23505'
    ) {
      throw new APIError(conflictMessage(path), 409)
    }
    throw error
  }
}

const upsertContentClaim = async ({
  archetype,
  collection,
  document,
  path,
  redirectApproval,
  req,
  state,
}: {
  archetype: RouteArchetypeID
  collection: ContentRouteCollection
  document: UnknownRecord
  path: string
  redirectApproval?: PathRedirectApproval | null
  req: PayloadRequest
  state: ClaimState
}): Promise<RegistryDocument> =>
  upsertClaim(req, {
    archetype,
    ownerCollection: collection,
    ownerDocumentId: document.id as number | string,
    ownerKind: 'content',
    path,
    provenance: {
      ...provenanceFromDocument(document),
      note: redirectApproval ? encodePathRedirectApproval(redirectApproval) : null,
    },
    state,
  })

const upsertAutomaticRedirect = async (
  req: PayloadRequest,
  from: string,
  to: string,
): Promise<void> => {
  const existing = await req.payload.find({
    collection: 'redirects',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: { from: { equals: from } },
  })
  const data = {
    from,
    type: '301' as const,
    to: {
      type: 'custom' as const,
      url: to,
    },
  }

  if (existing.docs[0]) {
    await req.payload.update({
      collection: 'redirects',
      context: { ...req.context, automaticRouteRedirect: true },
      data,
      id: existing.docs[0].id,
      overrideAccess: true,
      req,
    })
    return
  }

  await req.payload.create({
    collection: 'redirects',
    context: { ...req.context, automaticRouteRedirect: true },
    data,
    overrideAccess: true,
    req,
  })
}

export const syncRoutableRoute = (
  collection: ContentRouteCollection,
): CollectionAfterChangeHook => {
  return async ({ doc, operation, previousDoc, req }) => {
    if (req.context.skipRouteRegistry) return doc

    const document = asRecord(doc)
    const previous = asRecord(previousDoc)
    const documentID = document.id as number | string
    // Leave the classified mutation available for the following cache hook.
    // That hook consumes it after route synchronization succeeds.
    const mutation = getRouteMutation({
      collection,
      context: req.context as Record<string, unknown>,
      document,
      operation,
    })
    const resolution = mutation || {
      ...resolveArchetype(collection, document),
      confirmedRedirect: false,
      intent: document._status === 'published' ? ('publish' as const) : ('draft' as const),
      nextPath: pathFrom(document.path),
      previousPublishedPath: previous._status === 'published' ? pathFrom(previous.path) : null,
      routePolicy: resolveArchetype(collection, document).policy,
    }
    const claims = await findClaims(req, collection, documentID)
    const publishedClaim = claims.find(({ state }) => state === 'published')
    const reservedClaim = claims.find(({ state }) => state === 'reserved')

    if (resolution.intent === 'draft') {
      if (previous._status === 'published' && resolution.previousPublishedPath) {
        const previousResolution = resolveArchetype(collection, previous)
        await upsertContentClaim({
          archetype: previousResolution.archetype,
          collection,
          document: previous,
          path: resolution.previousPublishedPath,
          req,
          state: 'published',
        })
      }

      if (resolution.routePolicy === 'forbidden' || !resolution.nextPath) {
        if (reservedClaim) await deleteClaim(req, reservedClaim)
        return doc
      }

      const activePath = resolution.previousPublishedPath || publishedClaim?.path || null
      if (activePath === resolution.nextPath) {
        if (reservedClaim) await deleteClaim(req, reservedClaim)
        return doc
      }

      await upsertContentClaim({
        archetype: resolution.archetype,
        collection,
        document,
        path: resolution.nextPath,
        redirectApproval:
          resolution.confirmedRedirect && activePath
            ? {
                from: activePath,
                to: resolution.nextPath,
              }
            : null,
        req,
        state: 'reserved',
      })
      return doc
    }

    if (resolution.intent === 'unpublish' || resolution.routePolicy === 'forbidden') {
      await deleteClaims(req, collection, documentID, 'published')
      if (resolution.routePolicy === 'required' && resolution.nextPath) {
        await upsertContentClaim({
          archetype: resolution.archetype,
          collection,
          document,
          path: resolution.nextPath,
          req,
          state: 'reserved',
        })
      } else {
        await deleteClaims(req, collection, documentID, 'reserved')
      }
      return doc
    }

    if (!resolution.nextPath) {
      throw new APIError(`${resolution.archetype} cannot publish without a path.`, 400)
    }

    const formerPublishedPath = resolution.previousPublishedPath || publishedClaim?.path || null
    if (publishedClaim && publishedClaim.path !== resolution.nextPath) {
      await deleteClaim(req, publishedClaim)
    }
    if (reservedClaim && reservedClaim.path !== resolution.nextPath) {
      await deleteClaim(req, reservedClaim)
    }
    if (reservedClaim?.path === resolution.nextPath) {
      await deleteClaim(req, reservedClaim)
    }

    await upsertContentClaim({
      archetype: resolution.archetype,
      collection,
      document,
      path: resolution.nextPath,
      req,
      state: 'published',
    })

    if (
      formerPublishedPath &&
      formerPublishedPath !== resolution.nextPath &&
      resolution.confirmedRedirect
    ) {
      await upsertAutomaticRedirect(req, formerPublishedPath, resolution.nextPath)
    }

    return doc
  }
}

export const releaseRoutableRoute = (
  collection: ContentRouteCollection,
): CollectionAfterDeleteHook => {
  return async ({ doc, req }) => {
    if (req.context.skipRouteRegistry) return doc
    const document = asRecord(doc)
    if (typeof document.id === 'string' || typeof document.id === 'number') {
      await deleteClaims(req, collection, document.id)
    }
    return doc
  }
}

export const normalizeRedirectSource = ({ data }: { data?: UnknownRecord | null }) => {
  if (data?.from) data.from = normalizeContentPath(data.from)
  return data
}

export const syncRedirectRoute: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (req.context.skipRouteRegistry) return doc
  const redirect = asRecord(doc)
  const from = pathFrom(redirect.from)
  if (!from || (typeof redirect.id !== 'string' && typeof redirect.id !== 'number')) {
    throw new APIError('Redirects require a canonical source path.', 400)
  }

  await upsertClaim(req, {
    archetype: 'redirect',
    ownerCollection: 'redirects',
    ownerDocumentId: redirect.id,
    ownerKind: 'redirect',
    path: from,
    provenance: {
      source: 'plugin',
      note: req.context.automaticRouteRedirect
        ? 'Created automatically from a published path change.'
        : 'Managed redirect.',
    },
    state: 'published',
  })

  return doc
}

export const releaseRedirectRoute: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const redirect = asRecord(doc)
  if (typeof redirect.id === 'string' || typeof redirect.id === 'number') {
    await deleteClaims(req, 'redirects', redirect.id)
  }
  return doc
}

export const systemRouteDefinitions = [
  {
    archetype: 'index.venue',
    key: 'venue-index',
    path: '/venue/',
  },
  {
    archetype: 'index.market-coverage',
    key: 'market-coverage-index',
    path: '/market-coverage/',
  },
] as const satisfies ReadonlyArray<{
  archetype: RouteArchetypeID
  key: string
  path: string
}>

export const ensureSystemRouteClaims = async (
  payload: Payload,
  req?: PayloadRequest,
): Promise<void> => {
  const request =
    req ||
    ({
      context: {},
      payload,
    } as PayloadRequest)

  for (const route of systemRouteDefinitions) {
    await upsertClaim(request, {
      archetype: route.archetype,
      ownerCollection: 'system',
      ownerDocumentId: route.key,
      ownerKind: 'virtual',
      path: route.path,
      provenance: {
        source: 'system',
        note: 'Approved production virtual index route.',
      },
      state: 'published',
    })
  }
}

export type PublicRouteClaim = {
  archetype: RouteArchetypeID | 'redirect'
  ownerCollection: OwnerCollection
  ownerDocumentId: string
  ownerKind: OwnerKind
  path: string
  state: ClaimState
  updatedAt?: string
}

export const findRouteClaim = async ({
  draft,
  path,
  payload,
}: {
  draft: boolean
  path: string
  payload: Payload
}): Promise<PublicRouteClaim | null> => {
  const normalized = pathFrom(path)
  if (!normalized) return null

  const result = await payload.find({
    collection: 'route-registry',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { path: { equals: normalized } },
        ...(draft ? [] : [{ state: { equals: 'published' as const } }]),
      ],
    },
  })

  return (result.docs[0] as unknown as PublicRouteClaim | undefined) || null
}
