/**
 * The shared shape for a validation-gate verification.
 *
 * This mirrors `InventoryVerification` in `migration/inventory/report.ts` deliberately. That gate
 * — `production-source-scope-complete` — is the only one in the contract that was ever enforced by
 * measurement rather than by prose, and its shape is the reason it can be trusted: expectations
 * come from the contract, actuals are derived from real artifacts, and every assertion carries both
 * so a failure names the drift instead of just failing.
 *
 * A gate builder is a pure function. It takes already-loaded evidence and returns this ledger; it
 * never reads the filesystem, queries a database, or throws on a failed assertion. Collecting the
 * evidence is the caller's job, which is what lets the same builder run against the live database in
 * an integration spec and against a mutated clone in a negative-drift test.
 */
export type GateAssertion = {
  id: string
  expected: number
  actual: number
  passed: boolean
}

export type GateVerification = {
  schemaVersion: 1
  gate: string
  status: 'passed' | 'failed'
  assertions: GateAssertion[]
  /**
   * Human-readable drift lines, one per failed assertion, in assertion order. These strings are
   * asserted verbatim by the negative-drift tests, so their format is part of the contract.
   */
  failures: string[]
  /**
   * Named offenders behind a failed count, keyed by assertion id. A bare `expected 0, received 8`
   * tells you a gate failed but not what to fix, and the whole point of these gates is that a red
   * result is actionable.
   */
  details: Record<string, string[]>
}

export const gateFailureLine = ({ actual, expected, id }: GateAssertion): string =>
  `${id}: expected ${expected}, received ${actual}`

/**
 * Assembles a ledger from assertions that have already been measured.
 *
 * `details` is filtered to the failed assertions so a passing ledger stays small and a failing one
 * carries exactly the offenders that explain it.
 */
export const buildGateVerification = (
  gate: string,
  assertions: GateAssertion[],
  details: Record<string, string[]> = {},
): GateVerification => {
  const failed = assertions.filter(({ passed }) => !passed)

  return {
    schemaVersion: 1,
    gate,
    status: failed.length === 0 ? 'passed' : 'failed',
    assertions,
    failures: failed.map(gateFailureLine),
    details: Object.fromEntries(
      failed.flatMap(({ id }) => (details[id]?.length ? [[id, details[id]]] : [])),
    ),
  }
}

/** Convenience for the overwhelmingly common `expected N, actual M` assertion. */
export const countAssertion = (id: string, expected: number, actual: number): GateAssertion => ({
  id,
  expected,
  actual,
  passed: actual === expected,
})
