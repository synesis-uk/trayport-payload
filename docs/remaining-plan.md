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

The plan is organised around the six non-passing blocker gates rather than
around feature areas, because those gates are already machine-checked. A track
is finished when its gates pass, not when its description feels complete.

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

- Scope `.trayport-coverage-map svg` at `src/app/(frontend)/globals.css:1972` to
  the fallback map figure only. It currently matches every descendant SVG,
  including Font Awesome chevrons inside the map's select controls, which
  stretches them to the container width.
- Recover `MAPBOX_PUBLIC_TOKEN` from the legacy theme
  (`~/site/tp/web/app/themes/trayport/functions.php`) into `.env`. The two style
  URLs already exist in `.env.example`; `src/config/connectionsMap.server.ts`
  resolves the token, and its absence is why every regional map currently
  renders the static fallback.
- Restart the review server and confirm the regional maps render through Mapbox
  rather than the fallback, on desktop and at 390px.

Exit: both defects fixed, screenshots retaken, no other visual change.

### A2 — Map parity matrix

Build the formal capability matrix against the live map and verify the migrated
data behind it. The functional review already concluded the migrated maps are at
parity with a stronger data model; this converts that conclusion into a checked
artifact rather than a judgement.

Exit: every live map capability is either proven present or recorded as an
approved deviation.

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
73 of 317 route owners are loaded; 244 documents remain plan-only.

| Family          | Owners | Position                                     |
| --------------- | -----: | -------------------------------------------- |
| Pages           |     51 | Partially loaded within the accepted slice   |
| Articles        |     93 | 23 canonical Events loaded; bodies incomplete |
| Hubs            |     72 | Plan-only                                    |
| Venues          |     66 | Plan-only                                    |
| Learning videos |     15 | Plan-only                                    |
| People          |     17 | Complete                                     |

### B1 — Load the remaining route owners

Extend the accepted population family by family through the existing
extract → transform → validate → load cycle. Each family runs its own immutable
inventory run and keeps its evidence; a family that fails validation fails the
gate rather than silently reducing scope.

Exit: all 317 route owners resolve to a managed document.
Gate: `listing-detail-route-ownership`.

### B2 — Body and media remediation

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

| Gate                                     | Closed by |
| ---------------------------------------- | --------- |
| `article-detail-content-ownership`       | B2        |
| `listing-detail-route-ownership`         | B1        |
| `managed-internal-link-integrity`        | B3        |
| `production-block-catalogue-implemented` | C3        |
| `editor-controls-have-runtime-effect`    | C3        |
| `editor-role-capability-enforcement`     | C3        |

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
