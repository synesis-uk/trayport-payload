# Proof-of-concept architecture

## Purpose

This repository proves the replacement path for the currently used Trayport
WordPress site. It currently closes 27 audited source roots: 26 rendered content
routes and one temporary managed redirect. It does not reproduce every dormant
WordPress content type or administration screen. The functional/editorial
baseline is the live public site and its equivalent local WordPress deployment;
the [delivery-slice plan](delivery-slices.md) records what the current local
implementation adds and what remains before launch.

## Runtime

- Next.js serves the public site and the Payload admin application.
- Payload owns editorial documents, navigation, site settings, workflow, media
  metadata, drafts, previews, and publishing.
- PostgreSQL stores Payload data and application-owned market facts.
- MinIO provides an S3-compatible local media service. Production can use an
  S3-compatible managed or self-hosted service without changing the content
  model.
- Media storage is fail-closed: production explicitly selects durable `s3` or
  `local-persistent` mode, development-only filesystem storage is opt-in, and
  partial S3 configuration is rejected. `build` mode exists only while compiling
  the standalone application.
- Mailpit captures development email. Production supplies a normal SMTP
  endpoint.
- The simple global connections map keeps a deterministic server-rendered
  media/SVG fallback. Full regional connectivity maps use a route-owned,
  viewport-lazy Mapbox island with managed region geometry, points of interest,
  Hubs, routes, filters, and a corresponding accessible data view.

## Content boundary

Payload collections:

- `pages`: the 20 accepted homepage, marketing, listing, support, office, region,
  contact, Market Matrix, and legal roots.
- `articles`: all records needed by the Insights listing and the scoped article
  body.
- `hubs`: German Power plus the minimal hub-marker records used by the
  connectivity map.
- `venues`: public-page or relationship-only venue records used by market
  coverage and connectivity.
- `learning-videos`: routable learning details with managed/external media and
  an explicit access mode.
- `learning-video-categories`: the managed Learning Hub filter taxonomy.
- `media`: normalized WordPress attachments and accessibility review metadata.
- Taxonomies for article categories, asset classes, venue types, and regions.
- `customer-identities`: non-authenticating TIM reconciliation/status metadata,
  separate from CMS users.
- `market-data-imports`: controlled administrator validation/preview/commit
  records for application market facts.
- `route-registry`: a protected, hook-managed table of content, redirect, and
  virtual claims. CMS/API clients cannot write it directly.

Payload globals:

- `navigation`: the active ACF options navigation, not the dormant classic
  WordPress menu.
- `footer`: footer columns, legal links, and certification marks.
- `site-settings`: brand, contact, social, default SEO, and notices.
- `route-indexes`: headings, introductions, and SEO for the virtual `/venue/`
  and `/market-coverage/` indexes.

Application PostgreSQL:

- `app.market_volume_monthly`: normalized monthly market facts. Payload blocks
  store editorial chart configuration; Payload import records operate bounded,
  audited, transactional ingestion without exposing raw facts as CMS fields.

Application-owned map runtime:

- Payload stores bounded map presentation controls, managed region GeoJSON and
  points of interest, Hub/country/type metadata, explicit routes, Venue/type
  hierarchy, Asset Class appearance, and stable market-data identities. It does
  not store provider credentials or arbitrary style URLs.
- The global runtime derives the accepted 55-location, 759-connection schematic
  from managed relationships. Regional maps preserve live region/asset/country/
  Hub/route interactions and optional period summaries.
- `MAPBOX_PUBLIC_TOKEN`, `MAPBOX_STYLE_DARK_URL`, and
  `MAPBOX_STYLE_LIGHT_URL` are runtime deployment configuration. Missing or
  invalid values leave the accessible fallback/data view active.

Deliberately excluded from the production pilot:

- Unused generic WordPress form-builder and HubSpot administration structures.
  Active HubSpot form identifiers remain in launch scope through a bounded
  Next.js embed integration.
- Commodities Report pages.
- The unused WordPress banner system and development theme switches.
- WordPress users, shortcodes as a generic content type, and dormant admin
  structures.

CookieYes remains the launch consent provider, and TIM remains the launch
customer-authentication authority. Both external integrations are deferred from
the current local slice; neither is replaced by Payload users or arbitrary
shortcode execution.

## Migration flow

1. Preflight proves that the expected local WordPress/ACF runtime, root IDs,
   uploads, PostgreSQL, and object storage are available.
2. Extraction runs through WP-CLI inside the source container so ACF clone
   fields, repeaters, post objects, and options are resolved by WordPress.
3. The extractor writes deterministic, versioned NDJSON with secrets and
   source-only UI state removed. It advances the latest-run pointer only after
   source acceptance.
4. An optional, reviewed media-recovery stage may fetch explicitly selected unavailable image IDs
   from one audited HTTPS origin before transformation. It validates path, type, dimensions, size,
   hash, and complete source-manifest provenance, and keeps binaries inside the immutable run.
5. Transformation maps every observed layout to typed Payload blocks and
   creates a coverage report. Unknown layouts fail the run. Passing source and
   transformed validation seals an immutable `accepted-run.json` hash manifest.
6. Loading first verifies the accepted-run marker and all bound artifacts, then
   upserts documents by the stable WordPress source identity, resolves
   relationships in a second pass, and imports market facts in a transaction.
7. Verification checks the agreed record totals, route identities,
   relationship totals, missing-media review queue, and idempotency.

Generated run data and reports live under `migration/work/` and are ignored by
Git. Source WordPress data is never changed by the importer.

`make content-inventory` performs the separate production discovery pass and
also emits `production-target-plan.json`, its NDJSON form, a verification
report, and a summary under `migration/work/inventory/<run-id>/`. The plan
deterministically accounts for 296 routes, but it is planning evidence only.
The importer acceptance slice covers 27 source roots: 26 rendered content routes
and `/request-a-demo/` as a reversible `302` to the managed Contact page. The
other 267 plan-only production documents have not been loaded or
content-remediated. Navigation and footer destinations outside this slice and
the two virtual indexes remain explicit HTTPS live-site fallbacks until their
routes are migrated.

## Routable-content foundation

The production pilot applies migrations from a source checkout before starting
the standalone application. A production container release should add a
separate migration job or migration-capable image rather than attempting schema
changes in the web process.

One normalized path is now owned through a shared Payload `route-registry`
collection backed by a PostgreSQL unique constraint. Collection and redirect
hooks write claims with the originating Payload request, so a conflicting claim
rolls back the document mutation in the same transaction. Published documents
retain a published claim while a changed draft path receives a reserved claim.
Publishing the change requires confirmation and atomically replaces the old
content claim with a redirect.

The 18 content-route contract archetypes are represented at runtime. The
temporary Contact redirect is a separate redirects-owned contract archetype.
Publication hooks
enforce discriminators, route-required/route-forbidden modes, root ownership,
top-level block allowlists, minimum content, learning-video media, venue detail
content, and content-index listing behavior. Conversion pages remain
unpublishable until the bounded HubSpot integration exists; interactive Market
Matrix pages must contain exactly one managed `marketMatrix` component.

The Next.js catch-all is registry-first; collection precedence is no longer a
route ownership mechanism. It renders pages, full articles, public hubs,
public venues, learning videos, redirects, and the CMS-configured virtual
indexes. Published content and virtual claims feed the content sitemap.

Checked-in brand artwork uses the reserved `/brand/*` public namespace. Both content-path
validation and proxy preflight bypass that namespace, and the exact copied hero artwork is guarded
by its source hash plus a production HTTP asset check so it cannot be mistaken for a CMS route.

## Rendering and cache boundary

Next.js Cache Components are enabled. The public route group can therefore
emit a useful partial-prerender shell while CMS-backed content remains
request-time. Its header, page, and footer fallbacks are semantic and
database-free because the production image compiles with a deliberately fake
database URL; a build never snapshots local or production editorial content.
Catch-all parameters and request APIs are kept inside close Suspense and
request-time boundaries.

Only published route, global, and content-index reads enter `use cache`.
Their shared policy is five minutes stale/revalidate and one hour expiry, with
the existing `content-sitemap`, `redirects`, and `global_<slug>` tags preserved
for Payload hook invalidation. Authenticated preview resolution happens after
the request boundary and reads `draft: true` with privileged access only after
the Administrator or Editor check. It never calls a persistent cache. An
unauthenticated preview request falls back to the normal published path.

Metadata is request-time but intentionally published-only, so draft-only text
cannot be persisted in metadata caches or exposed to unauthenticated clients.
The sitemap explicitly enters request-time rendering. The proxy reads one bounded,
five-minute snapshot of all published route claims and redirect dispositions, tagged by
both `redirects` and `route-registry`, rather than allocating a cache entry for every
requested path. Its PostgreSQL connection, statement, and query waits are bounded. It
establishes an HTTP 404 before a streamed unknown route reaches the
designed global not-found view and retains exact 301/302 behavior for safe redirects.
Draft-only paths can bypass that published preflight only with a signed, short-lived,
path-bound token issued by the authenticated preview endpoint.
This first slice prioritizes safe cache ownership; response headers and route
timings are measured separately before any CDN-wide HTML-cache policy is added.

## Environment progression

Feature development and acceptance stay local until the core product is signed
off. The first controlled AWS review environment uses the simplest supportable
shape—one EC2 application host/container, RDS PostgreSQL, and S3 media—while
retaining the same immutable runner/migrator images and externalized runtime
configuration.

Trayport production is an ECS target. The application therefore remains
stateless, keeps schema migration in a separate one-off process, exposes
liveness/readiness probes, and treats PostgreSQL, object storage, SMTP, secrets,
HubSpot, CookieYes, TIM, Mapbox, and public origins as deployment dependencies.
Full ECS service, ALB, task, logging, backup, scaling, and operational ownership
design follows product acceptance rather than blocking the first review build.

## Publication workflow

The Payload login, favicon/icon, logo, navigation surfaces, and dashboard intro
use the Trayport brand and explain the local editorial areas without changing
Payload's supported admin behavior. This is an owned presentation layer rather
than a fork of the CMS.

Administrators and editors can create and update content. Only administrators
manage users, roles, destructive collection actions, and migration metadata.
Routable content supports drafts, scheduled publication, authenticated live
preview, and on-demand route and sitemap revalidation. Preview requires both
the configured preview secret and an authenticated Administrator or Editor;
only then may the frontend resolve reserved draft claims. Imported source
metadata is optional, so Payload-native content can be created normally after
the migration.

This foundation clears the cross-collection uniqueness and runtime archetype
invariant gates. It does not imply production readiness: complete 296-route
content ownership, planned blocks, managed-link validation, editor-control
parity, and broader role coverage are still outstanding.
