import { z } from 'zod'

import rawContract from './content-architecture.v1.json'

const statusSchema = z.enum(['passing', 'partial', 'blocked'])

const boundaryItemSchema = z.object({
  id: z.string().min(1),
  owner: z.string().min(1),
  description: z.string().min(1),
})

const excludedBoundaryItemSchema = z.object({
  id: z.string().min(1),
  disposition: z.enum(['omit', 'replace', 'move']),
  reason: z.string().min(1),
})

const approvedRouteOwnerSchema = z.object({
  id: z.string().min(1),
  count: z.number().int().positive(),
  sourceType: z.string().min(1),
  targetOwner: z.string().min(1),
  ownership: z.enum(['payload-document', 'derived-collection-route']),
})

const approvedManagedTaxonomySchema = z.object({
  sourceTaxonomy: z.string().min(1),
  targetCollection: z.string().min(1),
  count: z.number().int().positive(),
})

const approvedScopeExceptionSchema = z.object({
  id: z.string().min(1),
  legacyId: z.number().int().positive(),
  path: z.string().startsWith('/'),
})

/**
 * A route whose WordPress source carries no body, so the migrated page is faithfully empty.
 *
 * `reason` is required because this list is the one place the article-body gate can be weakened,
 * and an unexplained entry is indistinguishable from a silenced defect. The gate additionally
 * re-derives emptiness from the source records, so an entry whose source does have a body fails
 * rather than granting itself an exemption.
 */
const sourceEmptyBodySchema = approvedScopeExceptionSchema.extend({
  reason: z.string().min(1),
})

const blockSourceSchema = z.object({
  scope: z.enum(['article-top-level', 'component', 'shortcode']),
  source: z.string().min(1),
})

const plannedBlockSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['block', 'structural', 'integration']),
  placement: z.enum(['section-component', 'content-section-structure']),
  targetBlockType: z.string().min(1).nullable(),
  sourceLayouts: z.array(blockSourceSchema).min(1),
  implementationStatus: z.literal('planned'),
  description: z.string().min(1),
})

const archetypeSchema = z.object({
  id: z.string().min(1),
  collection: z.string().min(1),
  discriminator: z
    .object({
      field: z.string().min(1),
      value: z.string().min(1),
    })
    .nullable(),
  routePolicy: z.enum(['required', 'optional', 'forbidden']),
  contentOwner: z.string().min(1),
  allowedTopLevelBlocks: z.array(z.string().min(1)),
  editorCapabilities: z.array(z.string().min(1)),
  implementationStatus: statusSchema,
  gap: z.string().min(1).nullable(),
})

const layoutDispositionSchema = z.object({
  scope: z.enum(['page-top-level', 'article-top-level', 'component', 'taxonomy', 'shortcode']),
  source: z.string().min(1),
  disposition: z.enum(['map', 'consolidate', 'split', 'omit', 'structure']),
  targets: z.array(z.string().min(1)),
  observedCount: z.number().int().positive().optional(),
  reason: z.string().min(1),
})

const derivedMappingSchema = z.object({
  id: z.string().min(1),
  sourceCondition: z.string().min(1),
  targets: z.array(z.string().min(1)).min(1),
  reason: z.string().min(1),
})

const collectionOwnershipSchema = z.object({
  resource: z.string().min(1),
  kind: z.enum([
    'payload-collection',
    'payload-global',
    'payload-plugin-collection',
    'payload-auth-collection',
    'payload-field-group',
    'application-postgres-table',
  ]),
  systemOfRecord: z.string().min(1),
  domainOwner: z.string().min(1),
  routeNamespace: z.string().min(1).nullable(),
  contentResponsibility: z.string().min(1),
})

const editorCapabilitySchema = z.object({
  resourceGroup: z.string().min(1),
  resources: z.array(z.string().min(1)).min(1),
  administrator: z.array(z.string().min(1)),
  editor: z.array(z.string().min(1)),
  public: z.array(z.string().min(1)),
})

const validationGateSchema = z.object({
  id: z.string().min(1),
  requiredFor: z.literal('production'),
  severity: z.enum(['blocker', 'warning']),
  status: statusSchema,
  /**
   * How the gate is enforced. An enum rather than free text because the previous string field let
   * a gate assert its own enforcement with nothing behind it; `migration/mappings/gateEnforcement.ts`
   * now binds each value to the specs that implement it.
   *
   * `not-implemented` and `contract-only` are honest declarations of an unbacked gate, and the
   * refinement below forbids either alongside a `passing` status.
   */
  enforcement: z.enum([
    'vitest',
    'contract-vitest',
    'contract-only',
    'gate-ledger-and-vitest',
    'production-inventory-verification',
    'payload-transaction-hooks-postgres-unique-index-and-vitest',
    'payload-publication-hooks-target-plan-validation-and-vitest',
    'payload-access-and-integration-tests',
    'migration-validation',
    'schema-and-migration-validation',
    'migration-report-and-manual-review',
    'not-implemented',
  ]),
  assertion: z.string().min(1),
  evidence: z.array(z.string().min(1)).min(1),
  remediation: z.string().min(1).nullable(),
})

export const contentArchitectureContractSchema = z
  .object({
    schemaVersion: z.literal(1),
    milestone: z.literal('production-content-architecture'),
    milestoneStatus: z.literal('complete'),
    productionReadiness: statusSchema,
    contentBoundary: z.object({
      included: z.array(boundaryItemSchema).min(1),
      excluded: z.array(excludedBoundaryItemSchema),
    }),
    approvedProductionScope: z.object({
      publicRouteTotal: z.number().int().positive(),
      inventoryEvidenceStatus: z.enum(['pending', 'verified']),
      reachableTermSubtypes: z.array(z.string().min(1)).min(1),
      managedTaxonomies: z.array(approvedManagedTaxonomySchema).min(1),
      routeOwners: z.array(approvedRouteOwnerSchema).min(1),
      requiredIncludes: z.array(approvedScopeExceptionSchema),
      requiredExclusions: z.array(approvedScopeExceptionSchema),
      sourceEmptyArticleBodies: z.array(sourceEmptyBodySchema),
      /**
       * Navigation and footer destinations the corpus does not own, still served by the live site.
       * Declared as a set so the check is set equality rather than the bare count it replaces —
       * a count cannot tell a retired fallback from a newly leaked one.
       */
      approvedLiveFallbackPaths: z.array(z.string().startsWith('/')),
    }),
    blocks: z.object({
      implemented: z.object({
        topLevel: z.array(z.string().min(1)).min(1),
        sectionComponents: z.array(z.string().min(1)).min(1),
      }),
      planned: z.array(plannedBlockSchema).min(1),
    }),
    archetypes: z.array(archetypeSchema).min(1),
    legacyLayoutDispositions: z.array(layoutDispositionSchema).min(1),
    derivedMappings: z.array(derivedMappingSchema),
    collectionOwnership: z.array(collectionOwnershipSchema).min(1),
    editorCapabilities: z.array(editorCapabilitySchema).min(1),
    validationGates: z.array(validationGateSchema).min(1),
  })
  .superRefine((contract, context) => {
    const duplicate = (values: string[]): string | undefined => {
      const seen = new Set<string>()
      return values.find((value) => {
        if (seen.has(value)) return true
        seen.add(value)
        return false
      })
    }

    const duplicateArchetype = duplicate(contract.archetypes.map(({ id }) => id))
    if (duplicateArchetype) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate archetype id: ${duplicateArchetype}`,
        path: ['archetypes'],
      })
    }

    const duplicateOwner = duplicate(contract.collectionOwnership.map(({ resource }) => resource))
    if (duplicateOwner) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate collection ownership resource: ${duplicateOwner}`,
        path: ['collectionOwnership'],
      })
    }

    const duplicateGate = duplicate(contract.validationGates.map(({ id }) => id))
    if (duplicateGate) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate validation gate id: ${duplicateGate}`,
        path: ['validationGates'],
      })
    }

    const layoutKeys = contract.legacyLayoutDispositions.map(
      ({ scope, source }) => `${scope}:${source}`,
    )
    const duplicateLayout = duplicate(layoutKeys)
    if (duplicateLayout) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate legacy layout disposition: ${duplicateLayout}`,
        path: ['legacyLayoutDispositions'],
      })
    }

    const duplicateReachableTermSubtype = duplicate(
      contract.approvedProductionScope.reachableTermSubtypes,
    )
    if (duplicateReachableTermSubtype) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate reachable term subtype: ${duplicateReachableTermSubtype}`,
        path: ['approvedProductionScope', 'reachableTermSubtypes'],
      })
    }

    const taxonomyDispositionSources = new Set(
      contract.legacyLayoutDispositions
        .filter(({ scope }) => scope === 'taxonomy')
        .map(({ source }) => source),
    )
    for (const subtype of contract.approvedProductionScope.reachableTermSubtypes) {
      if (!taxonomyDispositionSources.has(subtype)) {
        context.addIssue({
          code: 'custom',
          message: `Reachable term subtype has no taxonomy disposition: ${subtype}`,
          path: ['approvedProductionScope', 'reachableTermSubtypes', subtype],
        })
      }
    }

    const duplicateManagedTaxonomy = duplicate(
      contract.approvedProductionScope.managedTaxonomies.map(
        ({ sourceTaxonomy }) => sourceTaxonomy,
      ),
    )
    if (duplicateManagedTaxonomy) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate approved managed taxonomy: ${duplicateManagedTaxonomy}`,
        path: ['approvedProductionScope', 'managedTaxonomies'],
      })
    }
    const reachableTermSubtypes = new Set(contract.approvedProductionScope.reachableTermSubtypes)
    const taxonomyDispositions = new Map(
      contract.legacyLayoutDispositions
        .filter(({ scope }) => scope === 'taxonomy')
        .map((disposition) => [disposition.source, disposition]),
    )
    for (const managedTaxonomy of contract.approvedProductionScope.managedTaxonomies) {
      if (!reachableTermSubtypes.has(managedTaxonomy.sourceTaxonomy)) {
        context.addIssue({
          code: 'custom',
          message: `Managed taxonomy is not a reachable term subtype: ${managedTaxonomy.sourceTaxonomy}`,
          path: ['approvedProductionScope', 'managedTaxonomies', managedTaxonomy.sourceTaxonomy],
        })
      }
      const disposition = taxonomyDispositions.get(managedTaxonomy.sourceTaxonomy)
      if (
        !disposition ||
        (disposition.disposition !== 'map' && disposition.disposition !== 'consolidate') ||
        disposition.targets.length !== 1 ||
        disposition.targets[0] !== managedTaxonomy.targetCollection
      ) {
        context.addIssue({
          code: 'custom',
          message: `Managed taxonomy ${managedTaxonomy.sourceTaxonomy} must map to ${managedTaxonomy.targetCollection} in its taxonomy disposition.`,
          path: ['approvedProductionScope', 'managedTaxonomies', managedTaxonomy.sourceTaxonomy],
        })
      }
    }

    const duplicateRouteOwner = duplicate(
      contract.approvedProductionScope.routeOwners.map(({ id }) => id),
    )
    if (duplicateRouteOwner) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate approved route-owner id: ${duplicateRouteOwner}`,
        path: ['approvedProductionScope', 'routeOwners'],
      })
    }

    const approvedRouteTotal = contract.approvedProductionScope.routeOwners.reduce(
      (total, owner) => total + owner.count,
      0,
    )
    if (approvedRouteTotal !== contract.approvedProductionScope.publicRouteTotal) {
      context.addIssue({
        code: 'custom',
        message: `Approved route-owner counts total ${approvedRouteTotal}, expected ${contract.approvedProductionScope.publicRouteTotal}.`,
        path: ['approvedProductionScope', 'publicRouteTotal'],
      })
    }

    const duplicatePlannedBlock = duplicate(contract.blocks.planned.map(({ id }) => id))
    if (duplicatePlannedBlock) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate planned block id: ${duplicatePlannedBlock}`,
        path: ['blocks', 'planned'],
      })
    }

    const plannedSourceKeys = contract.blocks.planned.flatMap(({ sourceLayouts }) =>
      sourceLayouts.map(({ scope, source }) => `${scope}:${source}`),
    )
    const duplicatePlannedSource = duplicate(plannedSourceKeys)
    if (duplicatePlannedSource) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate planned block source: ${duplicatePlannedSource}`,
        path: ['blocks', 'planned'],
      })
    }

    const dispositionKeys = new Set(layoutKeys)
    for (const sourceKey of plannedSourceKeys) {
      if (!dispositionKeys.has(sourceKey)) {
        context.addIssue({
          code: 'custom',
          message: `Planned block source has no legacy disposition: ${sourceKey}`,
          path: ['blocks', 'planned'],
        })
      }
    }

    const ownedResources = new Set(contract.collectionOwnership.map(({ resource }) => resource))
    for (const managedTaxonomy of contract.approvedProductionScope.managedTaxonomies) {
      if (!ownedResources.has(managedTaxonomy.targetCollection)) {
        context.addIssue({
          code: 'custom',
          message: `Managed taxonomy target is not declared in collectionOwnership: ${managedTaxonomy.targetCollection}`,
          path: ['approvedProductionScope', 'managedTaxonomies', managedTaxonomy.sourceTaxonomy],
        })
      }
    }
    for (const owner of contract.approvedProductionScope.routeOwners) {
      if (!ownedResources.has(owner.targetOwner)) {
        context.addIssue({
          code: 'custom',
          message: `Approved route owner is not declared in collectionOwnership: ${owner.targetOwner}`,
          path: ['approvedProductionScope', 'routeOwners', owner.id],
        })
      }
    }

    const sourceClosureGate = contract.validationGates.find(
      ({ id }) => id === 'production-source-scope-complete',
    )
    const inventoryEvidenceVerified =
      contract.approvedProductionScope.inventoryEvidenceStatus === 'verified'
    if (!sourceClosureGate) {
      context.addIssue({
        code: 'custom',
        message: 'The production source-closure validation gate is required.',
        path: ['validationGates', 'production-source-scope-complete'],
      })
    } else if (inventoryEvidenceVerified !== (sourceClosureGate.status === 'passing')) {
      context.addIssue({
        code: 'custom',
        message:
          'Inventory evidence status and the production source-closure gate must pass together.',
        path: ['validationGates', 'production-source-scope-complete', 'status'],
      })
    }

    const hasProductionBlocker = contract.validationGates.some(
      ({ severity, status }) => severity === 'blocker' && status !== 'passing',
    )
    if (hasProductionBlocker && contract.productionReadiness !== 'blocked') {
      context.addIssue({
        code: 'custom',
        message: 'productionReadiness must be blocked while a production blocker is not passing.',
        path: ['productionReadiness'],
      })
    }

    for (const archetype of contract.archetypes) {
      if (archetype.implementationStatus === 'passing' && archetype.gap) {
        context.addIssue({
          code: 'custom',
          message: 'A passing archetype cannot declare a gap.',
          path: ['archetypes', archetype.id, 'gap'],
        })
      }
      if (archetype.implementationStatus !== 'passing' && !archetype.gap) {
        context.addIssue({
          code: 'custom',
          message: 'A partial or blocked archetype must declare its gap.',
          path: ['archetypes', archetype.id, 'gap'],
        })
      }
    }

    for (const gate of contract.validationGates) {
      if (gate.status === 'passing' && gate.remediation) {
        context.addIssue({
          code: 'custom',
          message: 'A passing gate cannot declare remediation.',
          path: ['validationGates', gate.id, 'remediation'],
        })
      }
      if (gate.status !== 'passing' && !gate.remediation) {
        context.addIssue({
          code: 'custom',
          message: 'A partial or blocked gate must declare remediation.',
          path: ['validationGates', gate.id, 'remediation'],
        })
      }
      /**
       * The anti-lying rule. Three blocker gates once sat at `not-implemented` while the work they
       * described was substantially delivered, and nothing prevented the reverse either: grading a
       * gate green while nothing measured it. A green gate must now name a real mechanism.
       */
      if (gate.status === 'passing' && ['not-implemented', 'contract-only'].includes(gate.enforcement)) {
        context.addIssue({
          code: 'custom',
          message: `A passing gate cannot declare enforcement '${gate.enforcement}'.`,
          path: ['validationGates', gate.id, 'enforcement'],
        })
      }
    }
  })

export const contentArchitectureContract = contentArchitectureContractSchema.parse(rawContract)

export type ContentArchitectureContract = z.infer<typeof contentArchitectureContractSchema>
