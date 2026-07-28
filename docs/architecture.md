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
- `venues`: the venue summaries and relationships rendered by German Power.
- `media`: normalized WordPress attachments and accessibility review metadata.
- Taxonomies for article categories, asset classes, venue types, and regions.

Payload globals:

- `navigation`: the active ACF options navigation, not the dormant classic
  WordPress menu.
- `footer`: footer columns, legal links, and certification marks.
- `site-settings`: brand, contact, social, default SEO, and notices.

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

## Follow-on production hardening

The proof of concept applies migrations from a source checkout before starting
the standalone application. A production container release should add a
separate migration job or migration-capable image rather than attempting schema
changes in the web process.

Paths are unique within each routable collection. Before opening unrestricted
page creation to a larger editorial team, add a shared route registry or
cross-collection validation so a page, article, and hub cannot claim the same
path. The current resolver intentionally keeps the deterministic precedence
used by the proof of concept.

## Publication workflow

Administrators and editors can create and update content. Only administrators
manage users, roles, destructive collection actions, and migration metadata.
Routable content supports drafts, scheduled publication, live preview, and
on-demand route revalidation. Imported source metadata is optional, so
Payload-native content can be created normally after the migration.
