import { z } from 'zod'

import rawContract from './functional-parity.v1.json'

export const functionalParityStatusSchema = z.enum([
  'complete',
  'partial',
  'missing',
  'deferred',
  'excluded',
  'decision',
])

const evidenceReferenceSchema = z
  .string()
  .regex(/^(code|decision|document|inventory|migration|test|wordpress):.+/)

const parityDimensionSchema = z.object({
  status: functionalParityStatusSchema,
  summary: z.string().min(1),
  evidence: z.array(evidenceReferenceSchema).min(1),
})

const parityFeatureSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  category: z.enum([
    'content',
    'editorial',
    'integration',
    'media',
    'navigation',
    'operations',
    'specialist',
  ]),
  launchPolicy: z.enum(['required', 'deferred-to-launch', 'excluded', 'decision-required']),
  targetOwner: z.string().min(1),
  status: functionalParityStatusSchema,
  boundary: z.string().min(1),
  dimensions: z.object({
    source: parityDimensionSchema,
    schema: parityDimensionSchema,
    editor: parityDimensionSchema,
    runtime: parityDimensionSchema,
    migration: parityDimensionSchema,
    verification: parityDimensionSchema,
  }),
  acceptance: z.array(z.string().min(1)).min(1),
  decisionRequired: z.string().min(1).nullable(),
  nextAction: z.string().min(1).nullable(),
})

const routeProgressSchema = z.object({
  status: z.literal('partial'),
  approvedRouteOwners: z.literal(317),
  acceptedRouteOwners: z.literal(73),
  acceptedPercent: z.literal(23),
  planOnlyRouteOwners: z.literal(244),
  acceptedBreakdown: z.object({
    renderedPayloadDocuments: z.literal(70),
    managedRedirectRouteOwners: z.literal(1),
    virtualIndexRouteOwners: z.literal(2),
  }),
  evidence: z.array(evidenceReferenceSchema).min(1),
})

export const functionalParityContractSchema = z
  .object({
    schemaVersion: z.literal(1),
    catalogue: z.literal('wordpress-to-payload-functional-parity'),
    auditedAt: z.iso.date(),
    catalogueStatus: z.literal('partial'),
    launchReadiness: z.literal('missing'),
    purpose: z.string().min(1),
    authority: z.object({
      sourceBaseline: z.string().min(1),
      routeInventory: z.literal('docs/content-architecture/inventory-summary.json'),
      routeContract: z.literal('migration/mappings/content-architecture.v1.json'),
      humanReport: z.literal('docs/content-architecture/functional-parity.md'),
    }),
    statusDefinitions: z.record(functionalParityStatusSchema, z.string().min(1)),
    routeProgress: routeProgressSchema,
    features: z.array(parityFeatureSchema).min(1),
  })
  .superRefine((contract, context) => {
    const ids = new Set<string>()

    for (const [index, feature] of contract.features.entries()) {
      if (ids.has(feature.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate feature id: ${feature.id}`,
          path: ['features', index, 'id'],
        })
      }
      ids.add(feature.id)

      const dimensionStatuses = Object.values(feature.dimensions).map(({ status }) => status)

      if (
        feature.status === 'complete' &&
        dimensionStatuses.some((status) => status !== 'complete')
      ) {
        context.addIssue({
          code: 'custom',
          message: `Complete feature has a non-complete dimension: ${feature.id}`,
          path: ['features', index, 'dimensions'],
        })
      }

      if (feature.status === 'missing' && !dimensionStatuses.includes('missing')) {
        context.addIssue({
          code: 'custom',
          message: `Missing feature has no missing dimension: ${feature.id}`,
          path: ['features', index, 'dimensions'],
        })
      }

      if (feature.status === 'deferred' && !dimensionStatuses.includes('deferred')) {
        context.addIssue({
          code: 'custom',
          message: `Deferred feature has no deferred dimension: ${feature.id}`,
          path: ['features', index, 'dimensions'],
        })
      }

      if (feature.status === 'decision' && feature.decisionRequired === null) {
        context.addIssue({
          code: 'custom',
          message: `Decision feature has no recorded decision question: ${feature.id}`,
          path: ['features', index, 'decisionRequired'],
        })
      }

      if (feature.status !== 'decision' && feature.decisionRequired !== null) {
        context.addIssue({
          code: 'custom',
          message: `Non-decision feature has a decision question: ${feature.id}`,
          path: ['features', index, 'decisionRequired'],
        })
      }

      if (feature.status === 'excluded' && feature.launchPolicy !== 'excluded') {
        context.addIssue({
          code: 'custom',
          message: `Excluded feature is not excluded by launch policy: ${feature.id}`,
          path: ['features', index, 'launchPolicy'],
        })
      }

      if (
        feature.status !== 'complete' &&
        feature.status !== 'excluded' &&
        feature.nextAction === null
      ) {
        context.addIssue({
          code: 'custom',
          message: `Open feature has no next action: ${feature.id}`,
          path: ['features', index, 'nextAction'],
        })
      }
    }

    const progress = contract.routeProgress
    const acceptedBreakdownTotal = Object.values(progress.acceptedBreakdown).reduce(
      (total, count) => total + count,
      0,
    )

    if (acceptedBreakdownTotal !== progress.acceptedRouteOwners) {
      context.addIssue({
        code: 'custom',
        message: 'Accepted route-owner breakdown does not equal the accepted total.',
        path: ['routeProgress', 'acceptedBreakdown'],
      })
    }

    if (
      progress.acceptedRouteOwners + progress.planOnlyRouteOwners !==
      progress.approvedRouteOwners
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Accepted and plan-only route owners do not equal the approved total.',
        path: ['routeProgress'],
      })
    }

    const expectedPercent = Number(
      ((progress.acceptedRouteOwners / progress.approvedRouteOwners) * 100).toFixed(1),
    )
    if (progress.acceptedPercent !== expectedPercent) {
      context.addIssue({
        code: 'custom',
        message: `Accepted route-owner percentage must be ${expectedPercent}.`,
        path: ['routeProgress', 'acceptedPercent'],
      })
    }
  })

export type FunctionalParityContract = z.infer<typeof functionalParityContractSchema>
export type FunctionalParityFeature = FunctionalParityContract['features'][number]
export type FunctionalParityStatus = z.infer<typeof functionalParityStatusSchema>

export const functionalParityContract: FunctionalParityContract =
  functionalParityContractSchema.parse(rawContract)
