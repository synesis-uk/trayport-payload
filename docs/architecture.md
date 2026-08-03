# Proof-of-concept architecture

## Purpose

This repository proves the replacement path for the currently used Trayport
WordPress site. It intentionally follows the live navigation and the six agreed
representative routes instead of reproducing every dormant WordPress content
type or administration screen.

## Runtime

- Next.js serves the public site and the Payload admin application.
- Payload owns editorial documents, navigation, site settings, workflow, media
  metadata, drafts, previews, and publishing.
- PostgreSQL stores Payload data and application-owned market facts.
- MinIO provides an S3-compatible local media service. Production can use an
  S3-compatible managed or self-hosted service without changing the content
  model.
- Mailpit captures development email. Production supplies a normal SMTP
  endpoint.

## Content boundary

Payload collections:

- `pages`: Home, About Us, Joule, and the Insights index.
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
  store only editorial chart configuration.

Deliberately excluded from the proof of concept:

- HubSpot and form-builder architecture.
- Commodities Report pages.
- The unused WordPress banner system and development theme switches.
- WordPress users, shortcodes as a generic content type, and dormant admin
  structures.

## Migration flow

1. Preflight proves that the expected local WordPress/ACF runtime, root IDs,
   uploads, PostgreSQL, and object storage are available.
2. Extraction runs through WP-CLI inside the source container so ACF clone
   fields, repeaters, post objects, and options are resolved by WordPress.
3. The extractor writes deterministic, versioned NDJSON with secrets and
   source-only UI state removed.
4. Transformation maps every observed layout to typed Payload blocks and
   creates a coverage report. Unknown layouts fail the run.
5. Loading upserts documents by the stable WordPress source identity, resolves
   relationships in a second pass, and imports market facts in a transaction.
6. Verification checks the agreed record totals, route identities,
   relationship totals, missing-media review queue, and idempotency.

Generated run data and reports live under `migration/work/` and are ignored by
Git. Source WordPress data is never changed by the importer.

`make content-inventory` performs the separate production discovery pass and
also emits `production-target-plan.json`, its NDJSON form, a verification
report, and a summary under `migration/work/inventory/<run-id>/`. The plan
deterministically accounts for 296 routes, but it is planning evidence only.
The importer and rendered acceptance slice in this repository still cover the
six representative source routes; the other production documents have not been
loaded or content-remediated.

## Routable-content foundation

The proof of concept applies migrations from a source checkout before starting
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

The 17 contract archetypes are represented at runtime. Publication hooks
enforce discriminators, route-required/route-forbidden modes, root ownership,
top-level block allowlists, minimum content, learning-video media, venue detail
content, and content-index listing behavior. Conversion and interactive
market-matrix pages remain intentionally unpublishable until their planned
production blocks are implemented.

The Next.js catch-all is registry-first; collection precedence is no longer a
route ownership mechanism. It renders pages, full articles, public hubs,
public venues, learning videos, redirects, and the CMS-configured virtual
indexes. Published content and virtual claims feed the content sitemap.

## Publication workflow

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
