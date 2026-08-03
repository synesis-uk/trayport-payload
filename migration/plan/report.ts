import crypto from 'node:crypto'

import type { ProductionTargetPlan, TargetPlanVerification } from './contracts'

const sha256 = (value: string): string => crypto.createHash('sha256').update(value).digest('hex')

const jsonText = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

export const buildTargetPlanArtifacts = (
  plan: ProductionTargetPlan,
  verification: TargetPlanVerification,
): {
  planText: string
  ndjsonText: string
  verificationText: string
  summaryText: string
  hashes: {
    plan: string
    ndjson: string
    verification: string
  }
} => {
  const planText = jsonText(plan)
  const ndjsonText = `${[
    JSON.stringify({
      entity: 'manifest',
      schemaVersion: plan.schemaVersion,
      scope: plan.scope,
      evidence: plan.evidence,
      summary: plan.summary,
    }),
    ...plan.routes.map((route) => JSON.stringify({ entity: 'route-plan', ...route })),
    ...plan.taxonomies.map((taxonomy) => JSON.stringify({ entity: 'taxonomy-plan', ...taxonomy })),
    ...plan.redirects.map((redirect) =>
      JSON.stringify({ entity: 'redirect-candidate', ...redirect }),
    ),
  ].join('\n')}\n`
  const verificationText = jsonText(verification)
  const hashes = {
    plan: sha256(planText),
    ndjson: sha256(ndjsonText),
    verification: sha256(verificationText),
  }
  const summaryText = jsonText({
    schemaVersion: 1,
    scope: 'production',
    counts: plan.summary,
    verification: {
      status: verification.status,
      failures: verification.failures,
    },
    evidence: plan.evidence,
    hashes,
    artifacts: {
      plan: 'production-target-plan.json',
      ndjson: 'production-target-plan.ndjson',
      verification: 'target-plan-verification.json',
    },
  })

  return {
    planText,
    ndjsonText,
    verificationText,
    summaryText,
    hashes,
  }
}
