# Delivery slices and remaining plan

## Authority and status

This document records the delivery order agreed for the WordPress-to-Next.js /
Payload migration. The live public Trayport site, reproduced by the local
WordPress checkout, is the functional and editorial baseline. A difference from
that baseline must be an explicit improvement or a recorded deferral; dormant
WordPress code is not automatically in scope.

The current local implementation includes slices 0, 1, 4, 5, and 6. “Delivered”
below means the feature has an end-to-end local schema, migration/import,
frontend, and test boundary. It does not mean that the complete 296-route
corpus, external-service acceptance, production infrastructure, or Trayport
user acceptance is complete.

## Locked decisions

- The live public site/local WordPress deployment is the parity baseline.
- The Commodities Report and its unused feature architecture remain excluded.
- Administrators and Editors may publish. Only Administrators manage users,
  roles, destructive operations, and migration controls.
- TIM is required at launch. It remains separate from Payload editor accounts,
  and its integration is deferred from the current local implementation.
- The existing documentation links and TIM auto-login workflow must work at
  launch. They may be hardened or simplified without changing the user-visible
  outcome.
- Existing HubSpot form identifiers are retained. The first Next.js integration
  should reproduce those embeds; real submissions are deferred until an
  approved test destination and consent flow are available.
- CookieYes remains the consent provider. The Next.js implementation should
  clone the current categories and behavior rather than introduce a first-party
  consent system.
- Payload owns map, matrix, and chart editorial configuration. Bulk market facts
  remain in application PostgreSQL.
- Mapbox is required for the full regional market maps. The simpler global
  connection schematic keeps a deterministic, accessible SVG fallback.
- Highcharts remains the chart renderer. Licensing is a release gate, not a
  blocker to local development.
- Development remains local until the core product is accepted. The first
  controlled AWS review environment should be intentionally simple. Trayport's
  production target is ECS, so the application and release contract must remain
  container- and ECS-ready even though ECS is not the first review deployment.

## Slice status

| Slice | Status | Delivered boundary |
| --- | --- | --- |
| 0 — scope and parity contract | Delivered | The source baseline, inclusions/exclusions, system ownership, deferred integrations, and environment sequence are explicit. |
| 1 — Payload completion and admin experience | Delivered locally | Branded admin entry/dashboard, Administrator and Editor publication permissions, editorial models required by the accepted blocks, and a non-authenticating customer-identity record for later TIM reconciliation. No TIM credentials, tokens, or sessions are stored in Payload. |
| 2 — HubSpot and CookieYes | Deferred | Retain managed HubSpot identifiers and implement the existing forms as bounded Next.js embeds; clone the live CookieYes consent categories/behavior. Do not send real submissions until an approved test destination exists. |
| 3 — TIM and review environments | Deferred | Implement TIM sign-in, protected documentation links, and the current auto-login outcome; then deploy the simple controlled AWS review environment. Complete the ECS handoff design after product acceptance. |
| 4 — market maps | Delivered locally | Payload-managed regions, boundaries, points of interest, Hub metadata, explicit connections, venue/type hierarchy, Asset Class appearance, global connection schematic, regional Mapbox interactions, accessible fallbacks, and period market summaries. |
| 5 — Market Matrix | Delivered locally | Payload-owned venue-to-Hub connectivity, Asset Class/Region/Hub filters, accessible collapsible venue groups, managed venue links, deterministic CSV, and formatted Excel export. |
| 6 — charts and market-data operations | Delivered locally | Stable managed Asset Class/Hub keys and aliases, validated preview/commit import workflow and history, transactional application-data upserts, and the bounded volume/price Highcharts presentations. Raw facts are not editable as CMS fields. |

## Remaining delivery order

### 1. Complete stakeholder local acceptance

Automated local acceptance is complete: the schema migrations and locked-source
import run cleanly, a second load is idempotent, all 453 migration targets load
without unresolved relationships, and all 1,194 market facts reconcile. Browser
checks cover the representative global and regional maps, chart rendering,
Matrix filters and both exports, branded Payload entry, private-operation access
controls, and health endpoints. The remaining local gate is stakeholder visual,
responsive, and keyboard UAT across the agreed golden routes; any issue found
there should be resolved before opening the external-service and environment
slices.

### 2. Complete the external experience

Implement bounded HubSpot embeds from the retained form identifiers and the
CookieYes Next.js integration from the live configuration. Verify loading,
blocked/error, accessibility, consent, and analytics behavior before enabling a
real HubSpot test submission.

Implement TIM as a separate customer-authentication boundary. Map a successful
TIM subject to the non-authenticating Payload identity record, preserve the
existing protected documentation-link and auto-login outcome, and test expiry,
revocation, unavailable-provider, and logout behavior. Do not turn Payload users
into public customer accounts.

### 3. Finish content and launch parity

Load and review the full approved 296-route corpus, complete every listing-linked
detail, repair managed links and redirects, disposition missing media, and review
SEO/canonical/sitemap output. The Commodities Report remains excluded from the
accepted route owners.

### 4. Performance and look-and-feel acceptance

- Re-run production route budgets and desktop/mobile Web Vitals for all golden
  routes and the new regional-map and Matrix routes.
- Keep Highcharts, Mapbox, Matrix Excel generation, video, and listing controls
  behind route- or viewport-owned lazy boundaries.
- Recheck image sizing, font loading, responsive layout, cumulative layout
  shift, server response time, and client hydration on representative content.
- Compare the candidate against the live/local baseline, recording intentional
  accessibility or usability improvements separately from unresolved parity.
- Profile regional map source size and market-data responses with production-like
  records before changing current caps or cache policy.

### 5. Create the simple controlled AWS review environment

Use the fewest operational components needed for reliable review: one application
host/container on EC2, RDS PostgreSQL, S3 media, managed DNS/TLS, and securely
supplied runtime configuration. Use the same immutable runner and migrator
images, keep the web process stateless, and keep database migration separate
from application startup. Full infrastructure-as-code, high availability,
autoscaling, and multi-environment promotion can follow product sign-off.

### 6. Prepare Trayport's ECS production handoff

Translate the proven container contract into an ECS service plus one-off
migration task, ALB health checks, RDS, S3, managed secrets, logs/metrics,
backup/restore, and rollback instructions. Resolve shared Next.js cache and
cross-task invalidation before horizontal scaling. Provide Trayport with the
environment contract, image build/release process, data migration runbook,
service dependencies, smoke tests, and ownership/licensing checklist.

## Launch-only gates

The following do not block local feature development but do block launch:

- TIM and protected-document workflow acceptance;
- production HubSpot and CookieYes configuration;
- approved Mapbox tokens/styles and Highcharts licensing;
- full route/content/link/media review;
- a production-shaped, repeatable data migration;
- security, accessibility, performance, backup/restore, monitoring, and
  rollback evidence; and
- Trayport approval of the ECS topology and operational ownership.
