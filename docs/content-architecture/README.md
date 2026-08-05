# Production content architecture

This directory is the human-readable companion to
`migration/mappings/content-architecture.v1.json`. The machine-readable
contract is the baseline for automated checks; these documents explain the
approved production target, source evidence, editor tasks, and launch gates.

The content-architecture milestone is complete. The routable-content foundation
is also implemented: a transaction-backed shared route registry and all 18
content-route runtime discriminator/publication invariants now pass their gates.
Production readiness remains `blocked` because complete article bodies,
complete listing-linked route owners, managed internal links, external-service
acceptance, editor-control runtime parity, and full editor-role capability
enforcement are not yet complete. The current local delivery does include the
Payload/admin, market-map, Market Matrix, and chart/market-data slices described
in the [delivery plan](../delivery-slices.md).

This status does not widen the delivered content slice. The current importer and
frontend acceptance cover 27 immutable source roots plus five Pages required by
published banners: 31 rendered content routes and the temporary
`/request-a-demo/` redirect to Contact. The verified 297-route inventory and
deterministic target plan describe the remaining 263 plan-only documents;
they do not mean those documents have been imported, rendered, or reviewed.

- [Scope and acceptance boundary](scope.md)
- [Content and route archetypes](archetypes.md)
- [Target Payload model](payload-model.md)
- [Block catalogue and observed layout coverage](block-catalogue.md)
- [Editorial workflows](editorial-workflows.md)
- [Architecture decisions and readiness gates](decisions.md)
- [Functional parity catalogue and audit](functional-parity.md)
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
297-route import, content remediation, and production review are not complete.
