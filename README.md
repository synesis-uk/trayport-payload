# Trayport web

The current implementation combines a proof-of-concept frontend with the
production content-architecture baseline for replacing the live Trayport
WordPress site. Next.js and Payload run as one self-hostable application,
editorial content and media controls live in Payload, and market facts live in
application-owned PostgreSQL tables.

The implementation follows the currently used live navigation and content rather
than recreating dormant WordPress administration structures.

## Proof-of-concept routes

- `/`
- `/company/about-us/`
- `/products/joule/`
- `/resources/insights/`
- `/insights/on-demand-webinar-data-analytics-for-energy-traders/`
- `/market-coverage/german-power/`

These six routes are the implemented frontend slice. The verified production
source corpus contains 296 canonical routes; those routes are inventoried and
classified, but they are not all imported or rendered by this frontend yet.

The Insights page is backed by all 39 published source records. The connectivity
view uses 50 imported hubs and 55 locations. German Power uses its 21 live venue
relationships.

## Architecture

- Next.js 16 serves the public site and Payload admin.
- Payload 3 owns pages, articles, hubs, venues, taxonomies, navigation, footer,
  site settings, media metadata, drafts, previews, roles, and publishing.
- PostgreSQL 16 stores Payload data and the separate
  `app.market_volume_monthly` application table.
- MinIO provides S3-compatible media storage locally.
- Mailpit captures local SMTP traffic.

See [docs/architecture.md](docs/architecture.md) for the content boundary and
migration flow, and [docs/design-direction.md](docs/design-direction.md) for the
visual and interaction direction. The [proof-of-concept editor
guide](docs/editor-guide.md) summarizes the available CMS controls. The
[production content-architecture contract](docs/content-architecture/README.md)
defines the approved 296-route source scope, target archetypes, Payload
ownership, block catalogue, editor workflows, and production gates.

## Local setup

Requirements:

- Node.js 22
- Corepack
- Docker with Compose v2
- The local source repository at `/home/admin/site/tp` for a live WordPress import

Start the source WordPress stack if it is not already running:

```bash
make -C /home/admin/site/tp up-local
```

Set up this repository:

```bash
make setup
make import-poc
make dev
```

`make setup` creates `.env` from `.env.example` when needed, installs the pinned
pnpm dependencies, starts PostgreSQL, MinIO, and Mailpit, and initializes the
development media bucket. It never overwrites an existing `.env`.

Local services:

- Site: <http://localhost:3000>
- Payload admin: <http://localhost:3000/admin>
- MinIO console: <http://localhost:9001>
- Mailpit: <http://localhost:8025>

The credentials and secrets in `.env.example` are local-only defaults. Replace
all of them outside development. HTTPS deployments should set
`PAYLOAD_COOKIE_SECURE=true`.

## Importing WordPress content

The importer is read-only against WordPress. It runs through WP-CLI inside the
source container so ACF clone fields, repeaters, options, and post-object
relationships are resolved by WordPress itself.

Run the complete proof-of-concept import:

```bash
make import-poc
```

This command:

1. verifies the exact WordPress source, six root IDs, uploads, PostgreSQL, and
   object storage;
2. extracts a deterministic, secret-scrubbed NDJSON source graph;
3. transforms every observed layout into typed Payload blocks;
4. validates the audited dependency and record totals;
5. upserts market facts transactionally;
6. loads media and content in two relationship-aware passes; and
7. publishes the scoped imported content.

Run the production-scope inventory independently:

```bash
make content-inventory
```

The proof-of-concept import stages are also available individually:

```bash
make import-preflight
make import-extract
make import-transform
make import-validate
make import-dry-run
make import-load
```

Generated data and reports are written to `migration/work/<run-id>/` and ignored
by Git. Reports include content coverage, curated exclusions, stale/private
links, missing media, the alt-text review queue, market-row results, load
changes, and source/target fingerprints.

`make content-inventory` is the production-scope discovery gate. It reads the
active ACF navigation and footer, applies the approved FAQ inclusion and
Commodities Report exclusion, closes over generated listings and dependencies,
and fails on count drift, unknown archetypes/layouts, error issues, or duplicate
canonical owners. Per-run output is written to
`migration/work/inventory/<run-id>/`; sanitized retained evidence lives in
[`docs/content-architecture`](docs/content-architecture/README.md).

The importer is idempotent. Re-running it against unchanged source data must
produce no Payload or market-data writes.

## Content administration

Open <http://localhost:3000/admin> and create the first account. The first
account becomes an administrator.

- Administrators manage users, roles, destructive actions, and migration
  provenance.
- Editors create and update content, media, navigation, and site configuration.
- Pages, articles, and public hubs support drafts, live preview, scheduled
  publishing, and route-aware revalidation.
- WordPress provenance is optional, so editors can create native Payload content
  without migration fields.

The media library records whether alt text was authored in WordPress, generated
as a title fallback, or still requires editor review. Decorative assets are
marked explicitly.

## Development commands

```bash
make up
make down
make status
make logs
make db-shell
make storage-init
make typecheck
make lint
make content-inventory
make test-setup
make test
make build
```

Direct package commands:

```bash
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test:int
corepack pnpm test:e2e
corepack pnpm build
```

Playwright may require a one-time local browser install:

```bash
corepack pnpm exec playwright install chromium
```

## Production posture

The included multi-stage Dockerfile builds a standalone Node.js image. A
self-hosted environment must provide:

- PostgreSQL;
- S3-compatible object storage;
- SMTP;
- strong Payload, preview, and cron secrets; and
- a reverse proxy with TLS.

Keep `PAYLOAD_DB_PUSH=false` in every environment and run committed Payload
migrations before starting the application. Run the content importer against an
approved source snapshot or controlled WordPress runtime, then retain its
reports as migration evidence.

Before a migration release, rerun `make content-inventory` against the approved
source and review any diff from the retained architecture baseline. A passing
scope inventory proves source closure only; it does not clear the separate
schema, importer, rendering, media, link, or content-review gates.

The proof-of-concept runtime image is web-only. Run `corepack pnpm payload
migrate` from a source checkout or a dedicated migration image/job before
rolling out the standalone web image.

Build the container with the public origin that should be baked into Next.js and
the generated robots file:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SERVER_URL=https://www.example.com \
  --tag trayport-web .
```

The Docker build uses non-secret placeholders only while compiling. Supply the
real `PAYLOAD_SECRET`, `DATABASE_URL`, S3, SMTP, preview, cron, and
`NEXT_PUBLIC_SERVER_URL` values to the running container. Never reuse the
build-only Payload placeholder at runtime.
