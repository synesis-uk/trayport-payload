# Production content architecture

This directory is the human-readable companion to
`migration/mappings/content-architecture.v1.json`. The machine-readable
contract is the baseline for automated checks; these documents explain the
approved production target, source evidence, editor tasks, and launch gates.

The content-architecture milestone is complete. The routable-content foundation
is also implemented: a transaction-backed shared route registry and all 19
content-route runtime discriminator/publication invariants now pass their gates.
Article bodies, listing-linked route owners, and managed internal links closed
their gates on 2026-08-08, each backed by a measured assertion ledger rather than
prose. Production readiness remains `blocked` on the production block catalogue,
external-service acceptance, editor-control runtime parity, and full editor-role
capability enforcement. The current local delivery does include the
Payload/admin, market-map, Market Matrix, and chart/market-data slices described
in the [delivery plan](../delivery-slices.md).

The accepted population now covers the original 27 immutable source roots, five
Pages required by published banners, all 17 public People profiles, and all 23
canonical Event details. That is 70 rendered content routes plus the temporary
`/request-a-demo/` redirect to Contact; the two virtual indexes bring the
accepted route-owner total to 73. The verified 317-route inventory and
deterministic target plan describe 315 Payload documents (71 pilot-ready and
244 plan-only) plus the two virtual indexes. Planning classification does not
mean the remaining documents have been imported, rendered, or reviewed.

- [Scope and acceptance boundary](scope.md)
- [Content and route archetypes](archetypes.md)
- [Target Payload model](payload-model.md)
- [Block catalogue and observed layout coverage](block-catalogue.md)
- [Editorial workflows](editorial-workflows.md)
- [Architecture decisions and readiness gates](decisions.md)
- [Functional parity catalogue and audit](functional-parity.md)
- [Market map parity matrix](map-parity-matrix.md)
- [Delivery slices and remaining plan](../delivery-slices.md)
- [Thin visual and interaction direction](../design-direction.md)
- [Retained inventory summary](inventory-summary.json)
- [Inventory verification](verification.json)
- [Observed layout and taxonomy coverage](layout-coverage.json)
- [Generated route manifest](route-manifest.csv)

The retained evidence is generated reproducibly from the local WordPress
source; it is not hand-maintained. The larger reference-only source snapshot,
inventory graph, and NDJSON remain under ignored `migration/work/` run output.
They can be regenerated with:

```bash
make content-inventory
```

The same run emits `production-target-plan.json`,
`production-target-plan.ndjson`, `target-plan-verification.json`, and
`target-plan-summary.json` under `migration/work/inventory/<run-id>/`. The
equivalent direct command is:

```bash
TMPDIR=/tmp corepack pnpm exec tsx migration/cli.ts inventory --scope production
```

These target-plan artifacts are deterministic planning evidence only. The full
317-route import, content remediation, and production review are not complete.
