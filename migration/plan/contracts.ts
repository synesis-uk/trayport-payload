import { z } from 'zod'

export const targetPlanRouteSchema = z.object({
  key: z.string().min(1),
  ownerKind: z.enum(['payload-document', 'virtual-index']),
  legacyId: z.number().int().positive().nullable(),
  title: z.string(),
  sourcePostType: z.string().min(1),
  sourceStatus: z.string().min(1),
  template: z.string().min(1),
  authoritativeField: z.string().min(1),
  authoredPath: z.string().startsWith('/'),
  canonicalPath: z.string().startsWith('/'),
  targetCollection: z.string().min(1),
  archetype: z.string().min(1),
  discriminator: z
    .object({
      field: z.string().min(1),
      value: z.string().min(1),
    })
    .nullable(),
  routePolicy: z.enum(['required', 'optional', 'forbidden']),
  contentState: z.enum(['poc-ready', 'plan-only', 'system-ready']),
  configGlobal: z.literal('route-indexes').nullable(),
  configFieldPath: z.enum(['venueIndex', 'marketCoverageIndex']).nullable(),
  roles: z.array(z.string().min(1)),
  sources: z.array(z.string().min(1)),
})

export const targetPlanTaxonomySchema = z.object({
  key: z.string().min(1),
  legacyId: z.number().int().positive(),
  sourceTaxonomy: z.string().min(1),
  name: z.string(),
  slug: z.string(),
  targetCollection: z.string().min(1),
  contractDisposition: z.enum(['map', 'consolidate']),
  contractTargets: z.array(z.string().min(1)),
  roles: z.array(z.string().min(1)),
  sources: z.array(z.string().min(1)),
})

export const redirectReviewReasonSchema = z.enum([
  'duplicate-source',
  'invalid-status',
  'invalid-target',
  'missing-source',
  'missing-target',
  'redirect-chain',
  'self-loop',
  'source-shadows-route',
  'target-excluded',
  'target-non-public',
  'target-unresolved',
  'validated-external-target',
  'validated-one-hop-target',
])

export const targetPlanRedirectSchema = z.object({
  legacyId: z.number().int().positive(),
  from: z.string().startsWith('/').nullable(),
  rawTarget: z.string().nullable(),
  normalizedTarget: z.string().nullable(),
  httpStatus: z.union([z.literal(301), z.literal(302)]).nullable(),
  decision: z.enum(['active', 'inactive-review']),
  reviewReasons: z.array(redirectReviewReasonSchema).min(1),
})

export const productionTargetPlanSchema = z.object({
  schemaVersion: z.literal(1),
  scope: z.literal('production'),
  evidence: z.object({
    sourceSnapshotHash: z.string().min(1),
    productionInventoryHash: z.string().min(1),
    architectureContractHash: z.string().min(1),
  }),
  summary: z.object({
    routes: z.number().int().nonnegative(),
    payloadDocuments: z.number().int().nonnegative(),
    virtualIndexes: z.number().int().nonnegative(),
    pocReadyDocuments: z.number().int().nonnegative(),
    planOnlyDocuments: z.number().int().nonnegative(),
    systemReadyRoutes: z.number().int().nonnegative(),
    managedTaxonomies: z.number().int().nonnegative(),
    learningVideoCategories: z.number().int().nonnegative(),
    redirectCandidates: z.number().int().nonnegative(),
    activeRedirects: z.number().int().nonnegative(),
    inactiveRedirects: z.number().int().nonnegative(),
  }),
  routes: z.array(targetPlanRouteSchema),
  taxonomies: z.array(targetPlanTaxonomySchema),
  redirects: z.array(targetPlanRedirectSchema),
})

export const targetPlanVerificationSchema = z.object({
  schemaVersion: z.literal(1),
  scope: z.literal('production'),
  status: z.enum(['passed', 'failed']),
  assertions: z.array(
    z.object({
      id: z.string().min(1),
      expected: z.number().int().nonnegative(),
      actual: z.number().int().nonnegative(),
      passed: z.boolean(),
    }),
  ),
  failures: z.array(z.string()),
})

export type ProductionTargetPlan = z.infer<typeof productionTargetPlanSchema>
export type TargetPlanRedirect = z.infer<typeof targetPlanRedirectSchema>
export type TargetPlanRoute = z.infer<typeof targetPlanRouteSchema>
export type TargetPlanTaxonomy = z.infer<typeof targetPlanTaxonomySchema>
export type TargetPlanVerification = z.infer<typeof targetPlanVerificationSchema>
