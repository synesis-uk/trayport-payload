# Remaining delivery plan

## Authority

This document is the working plan for the work that remains after commit
`b550ef3`. It supersedes the "Remaining delivery order" section of
[delivery-slices.md](delivery-slices.md); that document remains authoritative
for the locked decisions and for the delivered status of slices 0–6.

It does not restate the parity baseline, the 317-route formula, or the
architecture decisions. Those stay in
[content-architecture/decisions.md](content-architecture/decisions.md) and
[content-architecture/scope.md](content-architecture/scope.md), and the
machine-readable contract remains authoritative for gate status.

The plan is organised around the non-passing blocker gates rather than around
feature areas, because those gates are machine-checked. A track is finished when
its gates pass, not when its description feels complete.

That premise was only half true when this plan was written. Six gates were
non-passing, but three of them carried `enforcement: "not-implemented"` — they
measured nothing, and their status was hand-maintained prose. Those three were
given real assertion ledgers on 2026-08-08 and re-graded on the evidence, leaving
three. The contract schema now refuses a `passing` status on any gate that names
no enforcing spec, so the premise holds going forward.

## Change policy

The live public site is the acceptance bar. Every difference from it falls into
exactly one of three classes, and they carry different approval costs.

| Class                      | Definition                                                                | Approval                                          | Record                                                          |
| -------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------- |
| 1 — Defect                 | The current build is worse than the WordPress baseline.                   | None. Fix it.                                     | [visual-parity.md](visual-parity.md) as a parity restoration.   |
| 2 — Invisible improvement  | Architecture, performance, accessibility, security, or maintainability with no client-visible change. | None. Proceed.                                    | [frontend-improvements.md](frontend-improvements.md) with an isolated implementation hook and rollback. |
| 3 — Visible change         | Any change a client would notice in layout, interaction, or hierarchy.    | Explicit approval before implementation.          | Ledger entry plus before/after desktop and mobile screenshots.  |

A class 3 change must survive one test: it can be explained to the client in a
single sentence they would agree with. "The hub filters collapse into one
control on mobile instead of stacking four" passes. "The map is now a two-pane
explorer with a results panel" does not — that is a redesign, and redesigns are
recorded as deferred proposals rather than implemented during parity delivery.

Deferred class 3 proposals are not discarded. They are listed at the end of this
document and revisited after content completion, when there is enough of the
site to judge them against.

## Track A — Parity restoration and the market map

The map is the first component family to go through the policy end to end, and
it is the smallest. It establishes the pattern the remaining families follow.

### A1 — Map defects (class 1)

**Delivered 2026-08-06.** Both defects are fixed, verified in a real browser, and
recorded as VP-036 in [visual-parity.md](visual-parity.md).

Investigation corrected two assumptions in the original write-up of this slice:

- The stretched chevrons were **not** caused by `width: 100%` at `globals.css:1972`
  — Tailwind's `size-4` utility outranks it. The cause was `min-height` in
  `parity-blocks.css`, which no utility competes with, and there were **four**
  over-broad descendant rules across three files rather than one. One of them, in
  `parity-home.css`, sits outside any `@layer` and so outranks every layered rule.
- The fix is a dedicated `trayport-coverage-map__surface` class on the two real map
  SVGs rather than a `> svg` child combinator. The combinator would have dropped
  `z-index: 1` from the regional fallback SVG, letting the Mapbox canvas paint over
  it during load, and would not have reached the two mobile rules.
- Recovering the Mapbox token alone was insufficient. `.env.example` is not loaded
  at runtime, so all three of `MAPBOX_PUBLIC_TOKEN`, `MAPBOX_STYLE_DARK_URL`, and
  `MAPBOX_STYLE_LIGHT_URL` must be present in `.env`. Adding them also required
  making `tests/int/connections-map-config.int.spec.ts` hermetic — `vitest.setup.ts`
  loads `.env` into `process.env`, and the ambient dark style shadowed the values
  under test, failing 17 of its 22 cases.

A regression guard now fails the build if any rule reintroduces a descendant `svg`
selector under `.trayport-coverage-map`; this defect class was previously untested.

### A2 — Map parity matrix

**Delivered 2026-08-06.** See
[map-parity-matrix.md](content-architecture/map-parity-matrix.md).

The matrix contradicts the earlier judgement that the maps are at functional
parity. The data migrated faithfully — coordinates, polygons, routes, venue
edges and market values all reconcile — but the rendering does not match, and
the exercise found five class 1 defects that must be fixed before A3:

1. first paint renders empty and wrongly tinted on two of the four map surfaces;
2. the map click path into the sidebar is dead;
3. the control panel renders white on white;
4. coordinate-less hubs plot at `[0, 0]` off West Africa;
5. hub and venue links leave the site (a Track B symptom, not a map defect).

Seven visible differences need an explicit decision before A3 — most
importantly that the hub marker type hierarchy was flattened and that region
boundaries, which the live site draws invisibly, are now visible circles.

A3 does not start until 1–4 are fixed and the class 3 list is decided.

### A2b — Class 3 decisions on the map (approved 2026-08-06)

The seven visible differences the parity matrix surfaced were decided together. Six
are restorations to the live baseline; one difference is kept. The governing test
was the change policy above: a visible difference has to be defensible to the
client in one sentence they would accept, and none of these six were.

| # | Difference | Decision | Reason |
| - | ---------- | -------- | ------ |
| 1 | Hub marker type hierarchy flattened to uniform 7–8px dots | **Restore** | The live site's 100px named bubbles for regional/offshore hubs versus small dots for venue/physical hubs encode hub type. Flattening them discards information rather than simplifying it. |
| 2 | Region boundaries drawn as visible yellow circles | **Restore to invisible** | The live site draws the same GeoJSON at zero fill opacity and zero outline width deliberately. The circles are crude approximations of the region shapes, so showing them adds noise that means nothing. Keep them as hit targets. |
| 3 | Country tint reduced to a 42% wash | **Restore solid** | Connected-country fill is the map's primary visual signal. Restore fill opacity 1 for connected countries and 1 for the selected country. |
| 4 | Region pages default to Natural Gas | **Restore Power** | A data-level difference (`default_asset_class_id` 2 versus 1). On Asia Pacific it changes the entire first view a visitor sees. |
| 5 | Route lines and mid-point markers restyled | **Restore** | Return to the live 2px orange lines and the 32px yellow glyph markers, and reinstate the route hover highlight (`#F56A00`, width 2) that the migration dropped entirely. |
| 6 | Controls moved from a hover overlay inside the map to a bar above it | **Keep** | The only difference worth defending: a hover-opening overlay is unusable by touch and keyboard, so this is a real accessibility gain and states in one sentence — "the map filters are always visible instead of hidden behind a hover menu." The stale instruction "Use the menu tool in the top left corner to assist your search" must be corrected as managed content. |
| 7 | Fit padding no longer editor-controlled (~0.3 zoom tighter) | **Restore** | Restore the per-placement padding control and match the live fit so every view frames identically. |

Decisions 1–5 and 7 are parity restorations and need no ledger entry beyond
[visual-parity.md](visual-parity.md). Decision 6 is recorded as FE-099 in the
[FE ledger](frontend-improvements.md) with its rollback.

**Open editorial task from decision 6.** The markets-map hero still tells
visitors to "Use the menu tool in the top left corner to assist your search",
which no longer describes the interface. That sentence is imported WordPress
content (`pages_blocks_trayport_hero`, parent page 1380), so correcting it in the
database now would be silently reverted by the next content import — and Track B
re-imports repeatedly. It must therefore be corrected either as an editorial
change in Payload after the final import, or as a recorded content override in
the migration transform. It is deliberately not patched here, because a fix that
a later import undoes is worse than a known open task.

**All seven delivered 2026-08-06** across commits `98ab1cc`, `1947cb9` and
`bebdd63`, except decision 6, which is a keep. Two findings changed the work as
scoped:

- Decision 4 was a **transform bug**, not editorial data, so it is fixed at
  source as well as in the loaded rows; otherwise the next import would have
  reverted it.
- Decision 5's route hover highlight **does not exist** in the reference.
  `HOVER_LINE_COLOR`/`HOVER_LINE_WIDTH` are byte-identical to the defaults, so
  the parity matrix row claiming one was wrong and no highlight was added.

The three permanent region name labels, recorded in the matrix as `missing`
rather than as one of the seven decisions, were restored in the same pass.

### A3 — Approved map increments (class 3)

Implement only the increments that pass the one-sentence test:

- a legend for hub types, route lines, and selected countries;
- region labels and larger click targets on the world map;
- one mobile "Filters" disclosure replacing four permanently visible controls;
- explicit zoom controls with scroll-wheel capture disabled;
- selected-hub emphasis with unrelated markers faded.

Deferred: the two-pane explorer shell, the results/details panel, and the
draggable bottom sheet.

Exit: each increment has a ledger entry with rollback, before/after screenshots,
and passing keyboard, touch, and reduced-motion checks.

## Track B — Content completion

The largest remaining body of work and the one that unblocks three gates.
73 of 317 route owners are loaded; 244 remain plan-only.

Those 244 are not 244 outstanding imports. The local database was inspected on
2026-08-06 and 219 of them are **already loaded as records in a reduced content
mode**; only 25 Pages are genuinely absent. `contentMode` is a schema
discriminator, and the reduced modes forbid a path and a layout, so a record in
`map-only` or `relationship-only` cannot own a public route by construction.

| Family          | Records | Route-owning        | Reduced mode                | Outstanding |
| --------------- | ------: | ------------------- | --------------------------- | ----------: |
| Pages           |      26 | 26                  | —                           |          25 |
| Articles        |      93 | 24 `full`           | 69 `listing`                |          69 |
| Hubs            |      72 | 1 `page`            | 71 `map-only`               |          71 |
| Venues          |      66 | 1 `page`            | 65 `relationship-only`      |          65 |
| Learning videos |      15 | 1 `full`            | 14 `listing`                |          14 |
| People          |      17 | 17                  | —                           |           0 |

So the work splits into two different shapes, and they carry different risk:

- **Promotion (219).** The hub, venue, article, and learning-video records are
  already migrated with their codes, relationships, coordinates, and market-data
  keys intact — they were loaded to serve the maps and the Matrix. Promotion is a
  guarded `contentMode` transition plus detail content and SEO, not a fresh
  import. The archetype discriminator invariants enforce correctness on the way
  through, which is why this is lower risk than the raw count suggests.
- **Import (25).** The remaining Pages run the full
  extract → transform → validate → load cycle.

### Status — delivered 2026-08-07

The corpus is loaded. All 316 content routes serve locally against 73 before,
and the route registry holds 93 articles, 72 hubs, 66 venues, 51 pages, 17
people, 15 learning videos, 7 redirects and 2 virtual indexes.

Verified route by route against the reference: every route returns 200, and only
four headings differ — `/company/offices/`, where our `h1` is the page title
rather than the first office card, and three routes where the reference itself
is broken (two People pages return a Symfony exception, and `/venue/nasdaq-omx/`
headlines a URL because its source display name is a link).

**Open items carried forward**

Navigation and footer live fallbacks fell from 30 to 6, and then to 3 on
2026-08-08 once the transform started treating a path the corpus redirects as a
path the corpus owns. `/company/`, `/markets/` and `/regions/` are now internal
links served by our own 301s. Three remain, declared in the contract as
`approvedLiveFallbackPaths` and asserted by set equality rather than by count:

| Path | Reference | Status |
| ---- | --------- | ------ |
| `/products/` | **200** | Not in the 317-route plan — investigate before launch |
| `/resources/` | **200** | Not in the 317-route plan — investigate before launch |
| `/home/enterprise-security/` | 301 → `/products/enterprise-security/` | Destination is outside the corpus, so the bridge stands |

The first two matter: the reference serves real pages there and the discovery-led
inventory did not classify them as route owners. That is either a scope decision
to record or a gap in the inventory, and it should be settled before the route
total is treated as final.

Also open: the execution-type chart on `/products/broker-trading-system/` renders
through the frontend's accessible data-table fallback rather than as a chart,
because the supported-presentation set does not yet include an unstacked
execution-type column.

### B1 — Promote and load the remaining route owners

Work family by family. Each family runs its own immutable inventory run and
keeps its evidence; a family that fails validation fails the gate rather than
silently reducing scope. Confirm before starting each promotion batch that the
source WordPress records actually carry detail content — a hub that has no body
in WordPress should stay `map-only` rather than be promoted into an empty route.

Exit: all 317 route owners resolve to a managed document.
Gate: `listing-detail-route-ownership`.

### B2 — Body and media remediation

**Media investigated 2026-08-07.** The 83 unresolved media items are not a
migration defect: the reference 404s them too. They split into two different
problems with different owners.

| Count | Reason | Where the file actually is |
| ----: | ------ | -------------------------- |
| 57 | `missing-or-unreadable-local-file` | Absent from the local WordPress uploads copy. The reference cannot serve them either, so the local copy is incomplete against production. |
| 26 | `unsupported-object-storage-path` | Hosted on `cdn.trayport.com`, never in the uploads directory. Verified reachable — one sampled asset returns 200. |

The 26 CDN-hosted assets are recoverable now, but doing so changes where the
migration sources media from: today it reads only the local uploads directory,
and pulling from an external CDN is a new outbound dependency that needs an
explicit decision and an allowlist entry rather than being introduced quietly.

The 57 need a more complete uploads export from production. No amount of work on
this side recovers them.

Neither is blocking: both surface as absent media rather than broken pages, and
the review queue already records each one.

Complete article bodies, disposition missing media, and clear the content review
queue. Sparse source records stay sparse — the People work established that
precedent and it holds here.

Exit gates: `article-detail-content-ownership`, `content-review-queue-cleared`.

### B3 — Link and redirect closure

Validate every managed internal link against the route registry, integrate
redirects for moved paths, and confirm no duplicate, chained, looped, private,
or shadowing redirects. Then retire the CA-021 bridges to `www.trayport.com` as
their target routes become internal.

Exit gate: `managed-internal-link-integrity`.

### B5 — Gate enforcement (delivered 2026-08-08)

B1–B3 were substantially delivered by 2026-08-07, but their gates could not say so:
all three carried `enforcement: "not-implemented"`, meaning nothing measured them
and their status was hand-maintained prose. Each now has a pure assertion-ledger
builder under [`migration/gates/`](../migration/gates/) and an integration spec that
exercises both the passing case and negative-drift mutations, following the shape
`production-source-scope-complete` established.

Writing the checks found eight defects the previous validation could not see:

- Six links pointed at `www.trayport.com` for paths the corpus already redirects
  (`/company/`, `/markets/`, `/regions/`, `/traders/joule/`,
  `/products/solutions-providers/`, `/legal-notice/`) — visitors were being sent to
  the live WordPress site for pages this build serves. The transform now treats a
  redirect source as an owned path.
- Home's JSON-LD organisation logo pointed at `/app/themes/...`, a WordPress *theme*
  asset that is not in the uploads corpus and would 404 here. Structured-data URLs now
  go through the same live-site bridge policy as every other link. It was invisible
  because the old scan walked `data.layout` only.
- A link carrying `?page_id=2207` (a retired private Careers page) read as the
  homepage to a pathname-only comparison. The check now compares path *and* query.
  Bridging it to the live site is correct — the corpus genuinely does not own it.

Two further reporting defects were corrected in the same pass. The acceptance report
hard-coded `fullArticles: 24, listingArticles: 69` and `articleBodyBlocks: 12` from
the 26-root pilot while the corpus held 93 full, 0 listing and 819 body blocks; those
are now measured. And `blocks.ts` discarded any source section whose component mapper
returned nothing, with no counter — the transform now records each drop and whether it
carried content, so a future body regression cannot be silent.

Exit gates: all three passing, bound to their specs by
[`gateEnforcement.ts`](../migration/mappings/gateEnforcement.ts).

### B4 — SEO and indexing review

Review canonical URLs, metadata, Open Graph output, and sitemap inclusion across
the full corpus.

## Track C — Frontend acceptance

Blocked on Track B for exact acceptance: visual comparison against the
WordPress reference is not meaningful on routes with no content.

### C1 — Define the visual acceptance standard

Requirements 9 and 10 of
[frontend-plan-completion.md](frontend-plan-completion.md) are open because
"exact visual acceptance" has never been given a threshold. Decide the
comparison tolerance, the golden route set, and what counts as an approved
deviation, then apply it retrospectively to Home and Joule.

Exit: the standard is written into the completion matrix and enforced by the
visual suite.

### C2 — Component-family rollout

Work the remaining families — shell/navigation, heroes, content sections,
cards/listings/filters, forms/CTA, structured market content, charts and data
tables — through the same per-family gate the map used in Track A.

### C3 — Editor-control and block-catalogue closure

Every visible Payload control must have tested runtime effect or be removed, and
the configured block catalogue must be fully implemented. Complete editor-role
capability enforcement in the same pass.

Exit gates: `editor-controls-have-runtime-effect`,
`production-block-catalogue-implemented`, `editor-role-capability-enforcement`.

### C4 — Retire the compatibility bridge

Remove the route-specific parity CSS only after every route consuming it passes
acceptance. This is the last frontend step, not an opportunistic one.

### C5 — Performance acceptance

Re-run route budgets and desktop/mobile Web Vitals across all golden routes plus
the regional-map and Matrix routes, with production-like record counts. Confirm
Highcharts, Mapbox, Excel generation, and video stay behind lazy boundaries.

## Track D — External services

Independent of Tracks B and C and can run in parallel.

- **D1 — HubSpot.** Activate the bounded provider lifecycle behind the retained
  form identifiers. Verify loading, blocked, error, consent, and accessibility
  behaviour before enabling a real test submission.
- **D2 — CookieYes.** Clone the live consent categories and behaviour through the
  Next.js integration, and retire the FE-018 local bridge.
- **D3 — TIM.** Implement TIM as a separate customer-authentication boundary,
  mapped to the existing non-authenticating identity record. Preserve the
  protected documentation-link and auto-login outcome. Test expiry, revocation,
  provider-unavailable, and logout. Payload users never become customer accounts.

## Track E — Environments

- **E1 — AWS review environment.** One application host on EC2, RDS PostgreSQL,
  S3 media, managed DNS/TLS, and securely supplied configuration. Same immutable
  runner and migrator images; migration stays separate from startup.
- **E2 — ECS handoff.** Translate the proven container contract into an ECS
  service plus one-off migration task, ALB health checks, secrets, logs,
  backup/restore, and rollback. Resolve shared Next.js cache invalidation before
  horizontal scaling. Deliver the environment contract, release process, data
  migration runbook, smoke tests, and ownership/licensing checklist.

## Sequencing

Track A runs first and alone; it is small and it validates the change policy.
Track B then becomes the critical path, with Track D running alongside it since
it shares no files. Track C follows B for exact acceptance, though C1 and C3 can
start earlier. Track E follows product acceptance.

| Gate                                     | Closed by | Status                |
| ---------------------------------------- | --------- | --------------------- |
| `article-detail-content-ownership`       | B2        | **Passing 2026-08-08** |
| `listing-detail-route-ownership`         | B1        | **Passing 2026-08-08** |
| `managed-internal-link-integrity`        | B3        | **Passing 2026-08-08** |
| `production-block-catalogue-implemented` | C3        | Blocked, unbacked      |
| `editor-controls-have-runtime-effect`    | C3        | Blocked, unbacked      |
| `editor-role-capability-enforcement`     | C3        | Partial                |

"Unbacked" is a declared state, not an oversight: both gates name no enforcing
spec in [`gateEnforcement.ts`](../migration/mappings/gateEnforcement.ts), and the
contract schema forbids grading either `passing` while that is true. They can only
go green by acquiring a real check.

## Deferred class 3 proposals

Recorded for review after content completion, not scheduled:

- the two-pane map explorer shell with a results/details panel;
- the mobile map bottom sheet or full-screen drawer;
- the visual Payload map editor with click-to-place markers, boundary preview,
  route preview, and connectivity summary.

## Launch-only gates

Unchanged from [delivery-slices.md](delivery-slices.md#launch-only-gates): TIM
and protected-document acceptance, production HubSpot and CookieYes
configuration, approved Mapbox tokens and Highcharts licensing, full content and
link review, a production-shaped repeatable migration, security/accessibility/
performance/backup/rollback evidence, and Trayport approval of the ECS topology.
