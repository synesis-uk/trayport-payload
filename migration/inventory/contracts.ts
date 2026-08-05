import { z } from 'zod'

const nullableString = z.string().nullable()
const nullablePositiveInteger = z.number().int().positive().nullable()

export const runtimeSeedSchema = z.object({
  origin: z.enum(['navigation', 'footer']),
  kind: z.enum(['link', 'dropdown-root']),
  sourcePath: z.string().min(1),
  label: z.string(),
  url: z.string(),
  target: z.string(),
  postId: nullablePositiveInteger,
  menuBlockCount: z.number().int().nonnegative().nullable(),
})

export const runtimeReferenceSchema = z.object({
  kind: z.enum(['post', 'media', 'term', 'url']),
  intent: z.enum(['link', 'dependency']),
  legacyId: nullablePositiveInteger,
  taxonomy: nullableString,
  url: nullableString,
  sourcePath: z.string().min(1),
})

export const runtimeNodeSchema = z.object({
  legacyId: z.number().int().positive(),
  postType: z.string().min(1),
  postTypePublic: z.boolean(),
  status: z.string().min(1),
  title: z.string(),
  slug: z.string(),
  path: nullableString,
  template: z.string(),
  authoritativeField: z.string().min(1),
  references: z.array(runtimeReferenceSchema),
  listingSelectors: z.array(
    z.object({
      postType: z.string().min(1),
      sourcePath: z.string().min(1),
    }),
  ),
  componentLayouts: z.array(
    z.object({
      layout: z.string().min(1),
      scope: z.enum(['page-top-level', 'article-top-level', 'component']),
      sourcePath: z.string().min(1),
    }),
  ),
  redirect: z
    .object({
      from: nullableString,
      to: nullableString,
      type: z.string(),
    })
    .nullable(),
})

export const runtimeMediaSchema = z.object({
  legacyId: z.number().int().positive(),
  title: z.string(),
  mimeType: z.string(),
  url: nullableString,
  relativePath: nullableString,
  available: z.boolean(),
})

export const runtimeTermSchema = z.object({
  legacyId: z.number().int().positive(),
  taxonomy: z.string().min(1),
  name: z.string(),
  slug: z.string(),
})

export const runtimeInventorySnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  source: z.object({
    home: z.string().url(),
    site: z.string().url(),
    tablePrefix: z.string().min(1),
    wordpressVersion: z.string().min(1),
    acfVersion: z.string().min(1),
    frontPageId: z.number().int().nonnegative(),
  }),
  navigationCandidates: z.array(runtimeSeedSchema),
  footerCandidates: z.array(runtimeSeedSchema),
  nodes: z.array(runtimeNodeSchema),
  media: z.array(runtimeMediaSchema),
  terms: z.array(runtimeTermSchema),
})

export type RuntimeInventorySnapshot = z.infer<typeof runtimeInventorySnapshotSchema>
export type RuntimeInventoryNode = z.infer<typeof runtimeNodeSchema>
export type RuntimeInventorySeed = z.infer<typeof runtimeSeedSchema>
export type RuntimeReference = z.infer<typeof runtimeReferenceSchema>

export type InventoryRouteRole =
  | 'banner'
  | 'canonical-corpus'
  | 'footer'
  | 'listing-item'
  | 'navigation'
  | 'public-navigation-override'
  | 'site-home'
  | 'theme-hardcoded'

export type InventoryRoute = {
  legacyId: number | null
  title: string
  path: string
  canonicalPath: string
  postType: string
  status: string
  template: string
  authoritativeField: string
  roles: InventoryRouteRole[]
  sources: string[]
  archetype: string
  targetOwner: string
  disposition: 'blocked-non-public' | 'included' | 'unknown'
  dependencyCount: number
}

export type InventoryDependency = {
  key: string
  kind: 'media' | 'post' | 'term'
  legacyId: number
  subType: string
  title: string
  path: string | null
  status: string | null
  roles: string[]
  sources: string[]
  available: boolean | null
}

export type InventoryEdge = {
  from: string
  to: string
  kind:
    | 'banner'
    | 'content-link'
    | 'footer'
    | 'listing-item'
    | 'media-dependency'
    | 'navigation'
    | 'post-dependency'
    | 'term-dependency'
  sourcePath: string
}

export type InventoryIssue = {
  code:
    | 'canonical-route-override'
    | 'duplicate-canonical-path'
    | 'external-link'
    | 'missing-explicit-include'
    | 'non-public-route'
    | 'unresolved-internal-url'
    | 'unresolved-reference'
  severity: 'info' | 'warning' | 'error'
  source: string
  target: string | null
  message: string
}

export type InventoryExclusion = {
  legacyId: number
  path: string
  canonicalPath: string | null
  title: string | null
  reason: string
  sources: string[]
}

export type InventoryRedirect = {
  legacyId: number
  from: string | null
  to: string | null
  type: string
  status: string
}

export type ProductionInventory = {
  schemaVersion: 1
  scope: 'production'
  source: RuntimeInventorySnapshot['source']
  routes: InventoryRoute[]
  dependencies: InventoryDependency[]
  redirects: InventoryRedirect[]
  exclusions: InventoryExclusion[]
  edges: InventoryEdge[]
  issues: InventoryIssue[]
  summary: {
    directAuthoredRouteStrings: number
    directPublicRoutes: number
    listingRoutes: number
    routes: number
    dependencies: number
    redirects: number
    exclusions: number
    issues: number
    unknownArchetypes: number
    unavailableMedia: number
  }
}
