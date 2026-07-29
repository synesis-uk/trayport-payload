# Production content architecture

This directory is the human-readable companion to
`migration/mappings/content-architecture.v1.json`. The machine-readable
contract is the baseline for automated checks; these documents explain the
approved production target, source evidence, editor tasks, and launch gates.

The content-architecture milestone is complete. Production readiness remains
blocked until the target schemas, route enforcement, full importer, and review
gates described here pass.

- [Scope and acceptance boundary](scope.md)
- [Content and route archetypes](archetypes.md)
- [Target Payload model](payload-model.md)
- [Block catalogue and observed layout coverage](block-catalogue.md)
- [Editorial workflows](editorial-workflows.md)
- [Architecture decisions and readiness gates](decisions.md)
- [Thin visual and interaction direction](../design-direction.md)
- [Retained inventory summary](inventory-summary.json)
- [Inventory verification](verification.json)
- [Observed layout and taxonomy coverage](layout-coverage.json)
- [Generated route manifest](route-manifest.csv)

The retained evidence is generated reproducibly from the local WordPress
source; it is not hand-maintained. The larger reference-only source snapshot,
inventory graph, and NDJSON remain under ignored `migration/work/` run output.
They can be regenerated with `make content-inventory`.
