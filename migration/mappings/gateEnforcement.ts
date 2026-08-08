/**
 * Binds every contract validation gate to the code that actually enforces it.
 *
 * Before this registry existed, `enforcement` was free text that nothing read. A gate could claim
 * `enforcement: "vitest"` without a single test asserting it, and two gates cited evidence files
 * that had been deleted. The contract could therefore describe a state of the world that no longer
 * held, and nothing would notice — which is how three blocker gates sat at `not-implemented` while
 * the work they described was substantially delivered.
 *
 * The registry closes that by name. `tests/int/content-architecture-contract.int.spec.ts` asserts
 * that this map and `validationGates` have identical key sets, that each declared `enforcement`
 * matches the contract, that every path here and in each gate's `evidence` exists on disk, and —
 * the load-bearing rule — that a gate may only be graded `passing` if it names at least one spec.
 *
 * `specs: []` is an honest declaration that a gate is unbacked. It is not a placeholder to be
 * filled in later and forgotten: the spec forbids pairing it with a `passing` status, so an
 * unbacked gate can never be green.
 */
export type GateEnforcer = {
  enforcement: string
  specs: string[]
}

export const gateEnforcers: Record<string, GateEnforcer> = {
  'contract-schema-valid': {
    enforcement: 'vitest',
    specs: ['tests/int/content-architecture-contract.int.spec.ts'],
  },
  'block-schema-renderer-totality': {
    enforcement: 'vitest',
    specs: ['tests/int/content-architecture-contract.int.spec.ts'],
  },
  'legacy-layout-disposition-totality': {
    enforcement: 'contract-vitest',
    specs: ['tests/int/content-architecture-contract.int.spec.ts'],
  },
  'production-source-scope-complete': {
    enforcement: 'production-inventory-verification',
    specs: ['tests/int/production-inventory.int.spec.ts'],
  },
  'cross-collection-route-uniqueness': {
    enforcement: 'payload-transaction-hooks-postgres-unique-index-and-vitest',
    specs: ['tests/int/content-path.int.spec.ts', 'tests/int/content-route-resolution.int.spec.ts'],
  },
  'archetype-discriminator-invariants': {
    enforcement: 'payload-publication-hooks-target-plan-validation-and-vitest',
    specs: ['tests/int/archetype-invariants.int.spec.ts'],
  },
  'article-detail-content-ownership': {
    enforcement: 'gate-ledger-and-vitest',
    specs: ['tests/int/gate-article-body-ownership.int.spec.ts'],
  },
  'listing-detail-route-ownership': {
    enforcement: 'gate-ledger-and-vitest',
    specs: [
      'tests/int/gate-listing-route-ownership.int.spec.ts',
      'tests/int/archetype-invariants.int.spec.ts',
    ],
  },
  'production-block-catalogue-implemented': {
    // Honestly unbacked. The contract lists the catalogue but nothing asserts every configured
    // block is implemented end to end, so this gate stays blocked and names no spec.
    enforcement: 'contract-only',
    specs: [],
  },
  'managed-internal-link-integrity': {
    enforcement: 'gate-ledger-and-vitest',
    specs: ['tests/int/gate-managed-link-integrity.int.spec.ts'],
  },
  'editor-controls-have-runtime-effect': {
    enforcement: 'not-implemented',
    specs: [],
  },
  'editor-role-capability-enforcement': {
    enforcement: 'payload-access-and-integration-tests',
    specs: ['tests/int/admin-role-visibility.int.spec.ts', 'tests/int/editor-experience.int.spec.ts'],
  },
  'migration-relationship-resolution': {
    enforcement: 'migration-validation',
    specs: ['tests/int/migration-safety.int.spec.ts'],
  },
  'migration-idempotency': {
    enforcement: 'migration-validation',
    specs: ['tests/int/migration-safety.int.spec.ts'],
  },
  'market-data-storage-boundary': {
    enforcement: 'schema-and-migration-validation',
    specs: ['tests/int/market-data-gate.int.spec.ts'],
  },
  'content-review-queue-cleared': {
    enforcement: 'migration-report-and-manual-review',
    specs: ['tests/int/imported-content.int.spec.ts'],
  },
}
