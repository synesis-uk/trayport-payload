import type { GlobalBeforeOperationHook, PayloadRequest, RequestContext } from 'payload'

type ProjectionDocument = {
  _status?: unknown
}

export type PublicProjectionIntent = 'draft' | 'publish' | 'unpublish'

const globalIntentStoreKey = 'trayportGlobalPublicProjectionIntents'

const requestFlag = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(requestFlag)
  return value === true || value === 'true' || value === 1 || value === '1'
}

const searchParamFlag = (req: PayloadRequest, name: string): boolean =>
  requestFlag(req.query?.[name]) || requestFlag(req.searchParams?.get(name))

const contextIntent = (context: RequestContext): PublicProjectionIntent | null => {
  const value = context.publicProjectionOperation ?? context.routeOperation

  return value === 'draft' || value === 'publish' || value === 'unpublish' ? value : null
}

const globalIntentStore = (
  context: RequestContext,
  create: boolean,
): Record<string, PublicProjectionIntent> | null => {
  const current = context[globalIntentStoreKey]
  if (current && typeof current === 'object' && !Array.isArray(current)) {
    return current as Record<string, PublicProjectionIntent>
  }
  if (!create) return null

  const store: Record<string, PublicProjectionIntent> = {}
  context[globalIntentStoreKey] = store
  return store
}

const operationData = (args: unknown): Record<string, unknown> => {
  if (!args || typeof args !== 'object') return {}
  const data = (args as { data?: unknown }).data

  return data && typeof data === 'object' && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {}
}

const operationFlag = (args: unknown, name: string): boolean =>
  Boolean(args && typeof args === 'object' && requestFlag((args as Record<string, unknown>)[name]))

const draftOperationHasContent = (data: Record<string, unknown>): boolean =>
  Object.keys(data).some((key) => !['_status', 'updatedAt'].includes(key))

export const captureGlobalPublicProjectionIntent: GlobalBeforeOperationHook = ({
  args,
  context,
  global,
  operation,
}) => {
  if (operation !== 'update' || !args) return args

  const store = globalIntentStore(context, true)
  if (!store) return args

  const data = operationData(args)
  const status = data._status
  const explicitIntent = contextIntent(context)
  let intent: PublicProjectionIntent | null = explicitIntent

  if (!intent && operationFlag(args, 'autosave')) {
    intent = 'draft'
  } else if (!intent && operationFlag(args, 'unpublishAllLocales')) {
    intent = 'unpublish'
  } else if (!intent && operationFlag(args, 'draft') && status !== 'published') {
    // Payload can use `draft=true` for both a draft save and an unpublish.
    // Admin draft submissions include the edited projection, while an
    // unpublish is a status-only mutation.
    intent = draftOperationHasContent(data) ? 'draft' : 'unpublish'
  } else if (!intent && status === 'published') {
    intent = 'publish'
  } else if (!intent && status === 'draft') {
    intent = 'unpublish'
  }

  if (intent) store[global.slug] = intent
  else delete store[global.slug]

  return args
}

export const takeGlobalPublicProjectionIntent = ({
  context,
  slug,
}: {
  context: RequestContext
  slug: string
}): PublicProjectionIntent | null => {
  const store = globalIntentStore(context, false)
  const intent = store?.[slug] ?? null

  if (store) delete store[slug]
  return intent
}

const isPublished = (document: unknown): boolean =>
  Boolean(
    document &&
    typeof document === 'object' &&
    (document as ProjectionDocument)._status === 'published',
  )

export const publicProjectionCanChange = ({
  context,
  current,
  intent,
  previous,
  req,
}: {
  context: RequestContext
  current: unknown
  intent?: PublicProjectionIntent | null
  previous: unknown
  req: PayloadRequest
}): boolean => {
  const resolvedIntent = intent ?? contextIntent(context)

  if (resolvedIntent === 'draft') return false
  if (resolvedIntent === 'publish' || resolvedIntent === 'unpublish') return true

  const currentPublished = isPublished(current)
  if (currentPublished) return true

  if (!isPublished(previous)) return false

  // When no lifecycle intent was captured, Payload's request-level draft
  // flags are the safe signal that this write only changes private preview
  // state. Explicit unpublishes are classified before this fallback.
  return !searchParamFlag(req, 'autosave') && !searchParamFlag(req, 'draft')
}
