# Architecture decisions and readiness gates

## Decision record

| ID | Decision | Status | Consequence |
| --- | --- | --- | --- |
| CA-001 | Use self-hosted Payload with Next.js and PostgreSQL | Accepted | CMS, frontend, and workflow remain under application control |
| CA-002 | Fix production scope at 50 Payload page documents + 1 redirects-owned source-page route + 2 virtual indexes + 243 listing children = 296 routes | Accepted; evidence verified | Future generated evidence must continue to prove the count; it cannot redefine it |
| CA-003 | Include FAQ (`7609`) and exclude Commodities Report (`2233`) | Accepted | The public/local navigation drift is resolved explicitly |
| CA-004 | Use active ACF `dropdown` and `footer_new`, not classic WordPress menus | Accepted | Dropdown roots with `menu_block` remain non-link buttons |
| CA-005 | Model semantic target archetypes instead of copying WordPress templates/admin types | Accepted | Target validation is based on page purpose and route behavior |
| CA-006 | Read one authoritative body field per source archetype | Accepted | Stale `sections`, `page_content`, and cached/template output are not merged |
| CA-007 | Give every public path one explicit owner across all collections, virtual indexes, and redirects | Accepted and implemented; gate passing | Protected Payload registry writes share the owner transaction, and PostgreSQL uniquely constrains normalized paths |
| CA-008 | Use a constrained typed block library and explicit source dispositions | Accepted | Unknown renderable layouts fail; arbitrary shortcodes/CSS controls do not migrate |
| CA-009 | Generate listings from child collections | Accepted | Cards are not duplicated into page bodies; every linked child needs a complete owner |
| CA-010 | Add routable venue and Learning Hub detail models for production | Accepted; runtime foundation implemented | Venue page rendering and learning-video/category collections exist; all 66 + 15 production documents and parity fields still require import/remediation |
| CA-011 | Keep map-only hubs, relationship-only venues, and metadata-only articles non-routable | Accepted and enforced; gate passing | Publication hooks forbid paths and layouts, preventing accidental empty details |
| CA-012 | Store market facts in application PostgreSQL; store editorial chart configuration and controlled import records in Payload | Accepted; local implementation delivered | `app.market_volume_monthly` stays outside field-level CMS editing; stable managed keys/aliases and validated preview/commit history make ingestion operable |
| CA-013 | Retain the live HubSpot form identifiers and reproduce active forms through one bounded Next.js embed integration | Accepted; external integration deferred | Unused WordPress form-builder/admin architecture remains excluded; real submissions wait for an approved test destination and consent flow |
| CA-014 | Retain CookieYes and reproduce the live consent categories/behavior through its Next.js integration | Accepted; external integration deferred | Generic shortcode execution remains excluded; Trayport does not assume ownership of a new first-party consent platform |
| CA-015 | Store media metadata in Payload and files in S3-compatible object storage | Accepted | WordPress attachment pages/hosts are not runtime dependencies |
| CA-016 | Preserve useful legacy URLs through validated redirect records | Accepted target; review blocked | Duplicate, private, missing, chained, looped, or shadowing redirects cannot launch |
| CA-017 | Keep read-only source identity and content hash for idempotent migration | Accepted and baseline passing | Payload-native content remains possible without provenance |
| CA-018 | Generate, do not hand-author, the production route manifest | Accepted; evidence verified | The retained manifest and verification artifacts are generated from the local WordPress source |
| CA-019 | Separate architecture milestone status from production readiness | Accepted | Architecture is complete; production remains blocked until all blocker gates pass |
| CA-020 | Own WordPress page 4031 temporarily as a `302` from `/request-a-demo/` to managed `/contact/` | Accepted; implemented for the pilot | The inactive source form/prompt/media are not imported into this route; remove the bridge only when an approved HubSpot-backed conversion page can atomically claim the path |
| CA-021 | Bridge not-yet-imported Navigation/Footer destinations to canonical `https://www.trayport.com/` URLs | Accepted; implemented for the pilot | The 27 roots and two virtual indexes stay internal; exactly 34 unique live fallback paths are validated (29 leaf destinations plus five clickable section roots), and each is individually reversible when its route passes migration/runtime acceptance |
| CA-022 | Keep TIM customer identity separate from Payload editor authentication | Accepted; model delivered, integration deferred | Payload may store reconciliation/status metadata but never TIM credentials, tokens, sessions, or password material; TIM, protected documentation links, and auto-login are launch requirements |
| CA-023 | Use Mapbox for full regional maps and a deterministic accessible fallback for the simple global connection schematic | Accepted; local implementation delivered | Payload owns bounded regions, geometry, points, relationships, appearance, and filters; deployment owns public provider tokens/styles |
| CA-024 | Keep Venue relationships as the Market Matrix authority and provide safe CSV plus formatted Excel export | Accepted; local implementation delivered | Filtering/grouping/export derive from one Payload projection; exports neutralize spreadsheet formulas and preserve the current selection |
| CA-025 | Deliver locally, then use a deliberately simple controlled AWS review stack, while keeping the release ECS-ready for Trayport production | Accepted | EC2/RDS/S3 is the first review target; immutable containers, a separate migrator, external PostgreSQL/S3, health checks, and runtime configuration remain portable to ECS |
| CA-026 | Allow Administrators and Editors to publish while reserving users, roles, destructive actions, and migration controls for Administrators | Accepted; locally enforced | Editorial review does not depend on Administrator access; operational authority remains bounded |

## Architecture milestone completion

The architecture milestone is complete because:

- the public content boundary and 296-route formula are approved;
- FAQ and Commodities decisions are explicit;
- all observed source layout/taxonomy/shortcode semantics have a declared
  disposition;
- 18 content-route archetypes plus the temporary Contact redirect archetype and their route policies are defined;
- collection/global/application-data ownership is assigned;
- implemented and planned block catalogues are separated;
- all 18 content-route runtime archetypes now have enforced route/discriminator
  publication behavior, including publication denial for conversion pages until
  the bounded HubSpot integration exists and the exactly-one component rule for
  Market Matrix pages;
- editor tasks and role expectations are defined; and
- production gates and known gaps are explicit and machine-validated.

This is a design/contract status. It does not assert that every target
collection, block, importer transform, route, or validation is implemented.

## Production-readiness gates

The machine-readable contract is authoritative for current status. At the time
of this documentation:

| Gate | Status | What must be true |
| --- | --- | --- |
| `contract-schema-valid` | Passing | Versioned JSON parses against its Zod contract |
| `block-schema-renderer-totality` | Passing for implemented baseline | Every implemented configured block has one renderer; importer emissions stay inside that library |
| `legacy-layout-disposition-totality` | Passing as architecture classification | Every observed layout, reachable taxonomy, and supported shortcode semantic has a declared target disposition |
| `production-source-scope-complete` | Passing | Generated inventory proves the exact 296 routes, inclusions/exclusions, and zero unknown or duplicate included route owners |
| `cross-collection-route-uniqueness` | Passing | Transaction-backed registry hooks plus a PostgreSQL unique path index enforce one owner across content, virtual indexes, and redirects |
| `archetype-discriminator-invariants` | Passing | Schema/publication hooks and target-plan validation enforce all 18 content-route policies, discriminators, allowed blocks, and derived-index rules; redirects use their own guarded collection workflow |
| `article-detail-content-ownership` | **Blocked** | Every internal listed article owns a complete body or has an approved non-route destination |
| `listing-detail-route-ownership` | **Blocked** | All 90 posts, 72 hubs, 66 venues, and 15 learning videos resolve to complete managed details |
| `production-block-catalogue-implemented` | **Blocked** | Structural columns, checklist, lifecycle, Matrix, regional maps, charts, and office rendering are implemented for the accepted local slice; HubSpot form and CookieYes consent targets must still work end to end |
| `managed-internal-link-integrity` | **Blocked** | Internal links are managed/validated and route changes integrate redirects |
| `editor-controls-have-runtime-effect` | **Blocked** | Every visible control has tested frontend behavior or is removed |
| `editor-role-capability-enforcement` | Partial | Access tests cover all resources, versions, publish actions, deletion, roles, and provenance |
| `migration-relationship-resolution` | Passing baseline | Unresolved legacy relationships fail with explicit evidence |
| `migration-idempotency` | Passing baseline | Stable source identity/hash prevents duplicate imports |
| `market-data-storage-boundary` | Passing baseline | Market facts load transactionally outside Payload |
| `content-review-queue-cleared` | Partial warning | Missing media, alt fallbacks, stale links, exclusions, host rewrites, and SEO have recorded dispositions |

CA-013, CA-014, and CA-022–CA-026 are reflected in the versioned
machine-readable contract. Its HubSpot, CookieYes, TIM, map, data, and
environment ownership now matches this decision record.

Any non-passing blocker keeps `productionReadiness` set to `blocked`.

The current v1 machine snapshot contains exactly six non-passing blocker gates:

1. `article-detail-content-ownership` — blocked;
2. `listing-detail-route-ownership` — blocked;
3. `production-block-catalogue-implemented` — blocked;
4. `managed-internal-link-integrity` — blocked;
5. `editor-controls-have-runtime-effect` — blocked; and
6. `editor-role-capability-enforcement` — partial.

`content-review-queue-cleared` is also partial, but it is a warning rather than
a blocker. TIM launch acceptance from CA-022 is an additional required condition
that the next contract revision must model. The two newly passing gates do not
change `productionReadiness: blocked`.

## Gate evidence required for launch

### Scope and route evidence

- reproducible route inventory and generated manifest;
- exact `50 + 1 + 2 + 243 = 296` acceptance;
- FAQ included, Commodities and stale private Careers excluded;
- zero unknown archetypes;
- zero duplicate canonical paths among included content and virtual owners;
- zero unresolved or non-public included route owners; and
- every listing card validated against a complete public detail.

### Model and renderer evidence

- the implemented foundation already has generated Payload types/migrations,
  schemas and hooks for all 18 content-route archetypes, learning-video/category collections,
  venue route modes/details, and both virtual index routes/configuration;
- the complete production population of those models and representative
  rendering for every archetype;
- every in-scope block and external integration implemented from schema/configuration through renderer;
- behavior tests for every editor control; and
- representative frontend parity checks for each archetype and exceptional
  layout.

### Migration evidence

- clean production-shaped database migration;
- deterministic extraction from the local WordPress source;
- authoritative-field-only transforms;
- no unknown or silently dropped layouts;
- stable ID/hash upserts;
- complete relationship and media resolution;
- transactional market-data load;
- successful equivalent rerun with no duplicate records; and
- retained validation and review reports.

### Content-quality evidence

- internal links normalized and resolved;
- attachment permalinks converted to file/media links;
- known stale/private/missing routes decided;
- redirect duplicates and invalid targets resolved;
- required files present in production object storage;
- meaningful alt/decorative decisions recorded;
- SEO, canonical, sitemap, and social metadata reviewed;
- HubSpot form and CookieYes consent behavior verified;
- TIM sign-in/logout, protected documentation links, and auto-login behavior verified; and
- Learning Hub access policies verified.

### Operational evidence

- production schema migrations run through a dedicated migration-capable job or
  release step before the standalone web runtime;
- backups and restore procedure cover Payload data, application market data,
  and object storage;
- secrets, SMTP, object storage, HubSpot, CookieYes, TIM, Mapbox, and scheduled
  publishing are configured; and
- post-publish revalidation, logs, and failure reporting are observable.

### Foundation rollback policy

The routable-content foundation migration can run down only while its new
collections, venue/page extensions, external destinations, and index global
remain at the seed/default state created by the migration. Its down migration
acquires write-blocking locks before checking those conditions, then aborts
before any destructive DDL if editor or importer content would be discarded.
The corresponding up migration also freezes legacy route owners and refuses
noncanonical or duplicate backfill paths. It also refuses to seed claims while
a published page, article, or hub has a latest draft that changes its route or
route-owning discriminator; that draft must first be published or discarded.
Both directions follow the application lock order, with the route registry
locked after owner, version, relation, and block tables. Listing-article routes
are restored on down only from a strict canonical Trayport destination;
pathless, noncanonical, Unicode-whitespace, scheme-like, or colliding records
force backup restoration instead.

Before applying the foundation in any shared environment, take and verify a
database backup and retain the matching prior application release. Once the new
models have been used, rollback means restoring that pre-foundation backup and
deploying the prior release together; it does not mean forcing
`payload migrate:down`. Object storage must be backed up and restored alongside
the database whenever referenced media may also have changed.

## Change control

Changes to route count, inclusion/exclusion, route ownership, authoritative
fields, or source disposition require:

1. an updated decision in this file;
2. a matching change to the machine-readable contract;
3. updated inventory evidence and tests; and
4. a review of affected importer, editor, frontend, redirect, and migration
   gates.

Generated evidence may reveal a needed decision, but it must not silently
overwrite one.

## Retained inventory evidence

The generated [inventory summary](inventory-summary.json),
[verification report](verification.json), [layout coverage](layout-coverage.json),
and [route manifest](route-manifest.csv) are retained with this contract. The
manifest includes canonical path, archetype, route owner, provenance, and
disposition. The full reference-only snapshot and dependency graph remain
ignored run artifacts because they are reproducible and unnecessarily large for
the architecture baseline.

Run the production inventory and target-plan generator with:

```bash
make content-inventory
```

The run writes `production-target-plan.json`,
`production-target-plan.ndjson`, `target-plan-verification.json`, and
`target-plan-summary.json` beneath `migration/work/inventory/<run-id>/`. The
plan deterministically describes 296 routes: 294 Payload documents (27 marked
pilot-ready and 267 plan-only) plus two system-ready virtual indexes. It is
planning evidence, not a content load or remediation report.

The retained scope evidence and the two route-foundation gates pass while
`productionReadiness` remains blocked. The actual imported/rendered acceptance
slice now covers 27 source roots (26 rendered content routes and one redirect);
full article/listing ownership, importer
transformations, planned renderers, managed links, role coverage, media review,
and the other gates above are still incomplete.
