# Architecture decisions and readiness gates

## Decision record

| ID | Decision | Status | Consequence |
| --- | --- | --- | --- |
| CA-001 | Use self-hosted Payload with Next.js and PostgreSQL | Accepted | CMS, frontend, and workflow remain under application control |
| CA-002 | Fix production scope at 51 page documents + 2 virtual indexes + 243 listing children = 296 routes | Accepted; evidence verified | Future generated evidence must continue to prove the count; it cannot redefine it |
| CA-003 | Include FAQ (`7609`) and exclude Commodities Report (`2233`) | Accepted | The public/local navigation drift is resolved explicitly |
| CA-004 | Use active ACF `dropdown` and `footer_new`, not classic WordPress menus | Accepted | Dropdown roots with `menu_block` remain non-link buttons |
| CA-005 | Model semantic target archetypes instead of copying WordPress templates/admin types | Accepted | Target validation is based on page purpose and route behavior |
| CA-006 | Read one authoritative body field per source archetype | Accepted | Stale `sections`, `page_content`, and cached/template output are not merged |
| CA-007 | Give every public path one explicit owner across all collections, virtual indexes, and redirects | Accepted target; enforcement blocked | A shared route registry or equivalent cross-collection constraint is required |
| CA-008 | Use a constrained typed block library and explicit source dispositions | Accepted | Unknown renderable layouts fail; arbitrary shortcodes/CSS controls do not migrate |
| CA-009 | Generate listings from child collections | Accepted | Cards are not duplicated into page bodies; every linked child needs a complete owner |
| CA-010 | Add routable venue and Learning Hub detail models for production | Accepted target; implementation blocked | The PoC’s structured-only venue and missing learning owner are insufficient |
| CA-011 | Keep map-only hubs, relationship-only venues, and metadata-only articles non-routable | Accepted target; enforcement blocked | Data records cannot accidentally create empty details |
| CA-012 | Store market facts in application PostgreSQL; store only editorial chart configuration in Payload | Accepted and baseline passing | `app.market_volume_monthly` is outside CMS editing |
| CA-013 | Replace HubSpot/form-builder architecture with a typed first-party form | Accepted target; implementation blocked | Forms need validation, consent, spam protection, delivery/storage, and tests |
| CA-014 | Replace cookie shortcode semantics with a first-party consent component | Accepted target; implementation blocked | Generic shortcode execution remains excluded |
| CA-015 | Store media metadata in Payload and files in S3-compatible object storage | Accepted | WordPress attachment pages/hosts are not runtime dependencies |
| CA-016 | Preserve useful legacy URLs through validated redirect records | Accepted target; review blocked | Duplicate, private, missing, chained, looped, or shadowing redirects cannot launch |
| CA-017 | Keep read-only source identity and content hash for idempotent migration | Accepted and baseline passing | Payload-native content remains possible without provenance |
| CA-018 | Generate, do not hand-author, the production route manifest | Accepted; evidence verified | The retained manifest and verification artifacts are generated from the local WordPress source |
| CA-019 | Separate architecture milestone status from production readiness | Accepted | Architecture is complete; production remains blocked until all blocker gates pass |

## Architecture milestone completion

The architecture milestone is complete because:

- the public content boundary and 296-route formula are approved;
- FAQ and Commodities decisions are explicit;
- all observed source layout/taxonomy/shortcode semantics have a declared
  disposition;
- 17 target archetypes and their route policies are defined;
- collection/global/application-data ownership is assigned;
- implemented and planned block catalogues are separated;
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
| `cross-collection-route-uniqueness` | **Blocked** | One canonical owner across pages, articles, hubs, venues, learning videos, virtual indexes, and redirects |
| `archetype-discriminator-invariants` | **Blocked** | Schema/importer/publish hooks enforce route policy, required fields, allowed blocks, and derived-index rules |
| `article-detail-content-ownership` | **Blocked** | Every internal listed article owns a complete body or has an approved non-route destination |
| `listing-detail-route-ownership` | **Blocked** | All 90 posts, 72 hubs, 66 venues, and 15 learning videos resolve to complete managed details |
| `production-block-catalogue-implemented` | **Blocked** | Structural column plus form, checklist, lifecycle, matrix, office, maps, regions, and consent targets work end to end |
| `managed-internal-link-integrity` | **Blocked** | Internal links are managed/validated and route changes integrate redirects |
| `editor-controls-have-runtime-effect` | **Blocked** | Every visible control has tested frontend behavior or is removed |
| `editor-role-capability-enforcement` | Partial | Access tests cover all resources, versions, publish actions, deletion, roles, and provenance |
| `migration-relationship-resolution` | Passing baseline | Unresolved legacy relationships fail with explicit evidence |
| `migration-idempotency` | Passing baseline | Stable source identity/hash prevents duplicate imports |
| `market-data-storage-boundary` | Passing baseline | Market facts load transactionally outside Payload |
| `content-review-queue-cleared` | Partial warning | Missing media, alt fallbacks, stale links, exclusions, host rewrites, and SEO have recorded dispositions |

Any non-passing blocker keeps `productionReadiness` set to `blocked`.

## Gate evidence required for launch

### Scope and route evidence

- reproducible route inventory and generated manifest;
- exact `51 + 2 + 243 = 296` acceptance;
- FAQ included, Commodities and stale private Careers excluded;
- zero unknown archetypes;
- zero duplicate canonical paths among included content and virtual owners;
- zero unresolved or non-public included route owners; and
- every listing card validated against a complete public detail.

### Model and renderer evidence

- generated Payload types and migrations for the full target model;
- schemas and publish hooks for all 17 archetypes;
- `learning-videos` collection;
- venue route mode/detail fields;
- both virtual index routes/configuration;
- every planned block implemented from schema through renderer;
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
- first-party forms and consent behavior verified; and
- Learning Hub access policies verified.

### Operational evidence

- production schema migrations run through a dedicated migration-capable job or
  release step before the standalone web runtime;
- backups and restore procedure cover Payload data, application market data,
  and object storage;
- secrets, SMTP, object storage, and scheduled publishing are configured; and
- post-publish revalidation, logs, and failure reporting are observable.

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

The retained scope evidence passes while `productionReadiness` remains blocked:
the target models, importer transformations, renderers, managed links, media
review, and other gates above are still incomplete.
