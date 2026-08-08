# Trayport web

The current implementation combines a production-pilot frontend with the
production content-architecture baseline for replacing the live Trayport
WordPress site. Next.js and Payload run as one self-hostable application,
editorial content and media controls live in Payload, and market facts live in
application-owned PostgreSQL tables.

The implementation follows the currently used live navigation and content rather
than recreating dormant WordPress administration structures.

## Initial production-pilot roots

- `/`
- `/company/about-us/`
- `/products/joule/`
- `/resources/insights/`
- `/insights/on-demand-webinar-data-analytics-for-energy-traders/`
- `/market-coverage/german-power/`
- `/company/offices/`
- `/products/tradesignal/`
- `/resources/faqs/`
- `/resources/news/`
- `/event/e-world-2026/`
- `/learning-hub/`
- `/learning-hub-video/trading-in-joule/`
- `/venue/eex/`
- `/legal/cookie-policy/`
- `/resources/market-matrix/`
- `/resources/markets-map/`
- `/legal/`
- `/terms-of-use-disclaimer/`
- `/legal/legal-notice/`
- `/legal/modern-slavery/`
- `/regions/asia-pacific/`
- `/regions/north-america/`
- `/company/careers/`
- `/regions/europe/`
- `/contact/`

These 26 content routes formed the initial rendered frontend slice. WordPress root 4031 is
also accepted as a temporary managed `302` from `/request-a-demo/` to
`/contact/`, giving 27 immutable source roots without importing the unused
HubSpot form or its presentation media. The redirect is removed when a real
approved HubSpot-backed submission journey is ready. This route-specific bridge
does not remove retained HubSpot form identifiers from launch scope.

Five additional Pages required by published banner targeting or internal banner
CTAs are also imported and rendered. The current accepted population extends
that initial slice with all 17 public People profiles and all 23 canonical Event
details. Events consolidate into Articles: 20 come from canonical WordPress
posts, three are unique legacy Event records, and five legacy `/events/*` aliases
redirect to `/event/*`. The resulting accepted boundary is 73 route owners: 70
rendered managed documents, the temporary Request A Demo redirect, and two
virtual indexes.

The verified production source corpus contains 317 canonical routes. The
deterministic production target plan describes 315 Payload document owners and
two virtual indexes: 71 documents are marked accepted/pilot-ready and 244 remain
plan-only. The plan is inventory evidence; it is not proof that those 244
remaining documents have been migrated or remediated.

The Insights, News, and Event families are backed by all 39, 31, and 23
published canonical records respectively. The Learning Hub owns 15 protected
metadata records, and the People collection owns all 17 public leadership and
Careers profiles. The market graph imports 72 hubs, 62 markers, 66 venues, and 655 normalized
venue-to-hub relationships; German Power retains its 21 derived compatibility
relationships, while EEX renders 37 unique connected markets.

The 26 named roots remain the primary visual/golden-route acceptance set; the
larger People/Event population closes those route families without claiming
complete live-site content parity. Navigation and footer destinations that are
still plan-only remain HTTPS links to the live WordPress site. Each fallback can
be switched back to an internal path when its route is imported and accepted.

The current slice status, locked external-service decisions, and local → simple
AWS review → Trayport ECS delivery order are recorded in
[docs/delivery-slices.md](docs/delivery-slices.md).

## Architecture

- Next.js 16 serves the public site and Payload admin.
- Payload 3 owns pages, articles, people, hubs, venues, learning videos and their
  categories, taxonomies, navigation, footer, site settings, virtual-index
  configuration, media metadata, non-authenticating customer identities,
  controlled market-data import history, drafts, previews, roles, and publishing.
- PostgreSQL 16 stores Payload data and the separate
  `app.market_volume_monthly` application table. A protected `route-registry`
  collection uses a PostgreSQL unique path constraint and transaction-aware
  hooks to reserve one canonical owner across content, redirects, and virtual
  routes.
- MinIO provides S3-compatible media storage locally.
- Mailpit captures local SMTP traffic.

The public catch-all resolves the route registry first, then loads only the
claimed document, redirect, or virtual index. Draft claims are visible only in
authenticated Administrator/Editor preview sessions. The content sitemap is
generated from published content and virtual claims, so non-routable records
and redirect sources are excluded.

See [docs/architecture.md](docs/architecture.md) for the content boundary and
migration flow, and [docs/design-direction.md](docs/design-direction.md) for the
visual and interaction direction. The [proof-of-concept editor
guide](docs/editor-guide.md) summarizes the available CMS controls. The
[production content-architecture contract](docs/content-architecture/README.md)
defines the approved 317-route source scope, target archetypes, Payload
ownership, block catalogue, editor workflows, and production gates.

The public UI follows the [frontend system contract](docs/frontend-system.md): Tailwind 4 semantic
tokens, locally owned shadcn/Radix primitives, Font Awesome interface icons, typed Payload adapters,
and server components by default. The [component inventory](docs/frontend-inventory.md) records the
current migration boundary, while the [improvement ledger](docs/frontend-improvements.md) keeps each
intentional change explicit and reversible.

## Local setup

Requirements:

- Node.js 22
- Corepack
- Docker with Compose v2
- A licensed Font Awesome kit token available as `FONTAWESOME_NPM_TOKEN`
- The local source repository at `/home/admin/site/tp` for a live WordPress import

Start the source WordPress stack if it is not already running:

```bash
make -C /home/admin/site/tp up-local
```

Set up this repository:

```bash
export FONTAWESOME_NPM_TOKEN='<licensed-kit-token>'
make setup
unset FONTAWESOME_NPM_TOKEN
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

The global connections map works without external configuration by retaining its deterministic
managed-media/SVG fallback. Full regional maps use a viewport-lazy Mapbox runtime. Set
`MAPBOX_PUBLIC_TOKEN` to an approved browser-safe `pk` token and configure
`MAPBOX_STYLE_DARK_URL` plus `MAPBOX_STYLE_LIGHT_URL` with approved Mapbox style URIs. The token is
exposed to the browser and must be origin-restricted. Production activation also requires recorded
Mapbox licence/attribution approval and approved ownership/use of the selected styles; see
[docs/deployment.md](docs/deployment.md#market-map-activation).

## Importing WordPress content

The importer is read-only against WordPress. It runs through WP-CLI inside the
source container so ACF clone fields, repeaters, options, and post-object
relationships are resolved by WordPress itself.

Run the complete proof-of-concept import:

```bash
make import-poc
```

This command:

1. verifies the exact WordPress source, 26 ordered root IDs, uploads, PostgreSQL, and
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

That command also emits and verifies the deterministic full-production target
plan. Its run directory contains `production-target-plan.json`,
`production-target-plan.ndjson`, `target-plan-verification.json`, and
`target-plan-summary.json`. The equivalent direct command is:

```bash
TMPDIR=/tmp corepack pnpm exec tsx migration/cli.ts inventory --scope production
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

When an extracted image is unavailable in the local uploads mount but a reviewed original is still
served by an audited HTTPS origin, recover only the approved attachment IDs after extraction and
before transformation:

```bash
corepack pnpm content:recover-media -- \
  --run-id <fresh-extracted-run-id> \
  --origin https://trayport.com \
  --legacy-ids 9698,9727
```

Recovery is deliberately narrow: it accepts image records already present in the extracted graph,
requires the remote URL to retain the exact WordPress uploads-relative path, validates MIME type and
recorded dimensions, caps each streamed response at 64 MiB with a 30-second timeout, and pins every
binary's size, SHA-256, URL, and single HTTPS origin in the source manifest. Downloads are staged
sequentially and the manifest/source commit is retry-safe. Transform and load revalidate the complete
recovery evidence, while the loader reads recovered files only from that run's `recovered-media`
directory and rechecks their hashes. Accepted or already transformed runs cannot be mutated; extract
a new run instead.

Generated data and reports are written to `migration/work/<run-id>/` and ignored
by Git. Reports include content coverage, curated exclusions, stale/private
links, missing media, the alt-text review queue, market-row results, load
changes, and source/target fingerprints.

Migration run IDs are immutable. Extraction refuses an existing run directory
and advances `migration/work/latest-run.txt` only after source validation passes.
Transformation writes its artifacts atomically, runs source and transformed
acceptance, and then writes `reports/accepted-run.json` last. That marker binds
the complete source, transformed, market-data, coverage, review, and acceptance
artifact set to SHA-256 hashes. It also binds the importer-owned fallback media
and market-schema SQL used during writes. Both dry-run and live load verify the
marker and every bound artifact before opening Payload or starting market-data
work; a missing marker or any post-acceptance change fails closed. Use a new run
ID to re-extract or re-transform accepted input.

`make content-inventory` is the production-scope discovery gate. It reads the
active ACF navigation and footer, applies the approved FAQ inclusion and
Commodities Report exclusion, adds Page reachability from every published
banner, closes over generated listings and dependencies,
and fails on count drift, unknown archetypes/layouts, error issues, or duplicate
canonical owners. Per-run output is written to
`migration/work/inventory/<run-id>/`; sanitized retained evidence lives in
[`docs/content-architecture`](docs/content-architecture/README.md).

The generated target plan is deterministic implementation input. The accepted
population is now the original 27 roots, five published-banner Page
dependencies, 17 People profiles, and the additional canonical Event Articles
described above. The full 317-route import, the other 244 plan-only document
bodies, media/link review, and parity validation remain future work.

The loader is idempotent across accepted runs. Loading equivalent source data
must produce no Payload or market-data writes.

The latest accepted local evidence is the immutable
`slices-01456-final-map-defaults-20260805` run. Its accepted source hash is
`9067458021348d8977310ff418cd2a901d9f709f0efefd044e19765539060089` and its acceptance hash is
`b3c504a4b85df01ba94bddeab98e02b94d3467fbe19a5180fe7adf0387dc2acc`. It records exact recovery
evidence for WordPress media `9698` and `9727`; the published binaries also pass direct Payload GET,
MIME, byte-size, and SHA-256 checks. The run also confirms that reusable-video administrative names
do not become visible captions. Its first publish changed only the full map's live-parity default;
the repeat published load was fully idempotent: 450 records and three globals were unchanged, all 1,194 market
rows were unchanged, and no relationships were unresolved. The ignored run directory remains the
local forensic source; these identifiers make it possible to reproduce or audit the exact accepted
input.

## Content administration

Open <http://localhost:3000/admin> and create the first account. The first
account becomes an administrator.

- Administrators manage users, roles, destructive actions, and migration
  provenance.
- Editors create and update content, media, navigation, and site configuration.
- Pages, full articles, People profiles, public hubs, public venues, and learning videos support
  drafts, authenticated live preview, scheduled publishing, and route-aware
  revalidation.
- Authenticated and subscriber learning videos may publish as metadata-only gate
  pages. Managed/external video fields and supporting layouts remain forbidden
  until identity checks and protected media delivery are implemented.
- Hub `map-only`, venue `relationship-only`, and article `listing` records are
  structured data only: publication hooks forbid public paths and layouts.
- The `route-indexes` global controls headings, introductions, and SEO for the
  virtual `/venue/` and `/market-coverage/` routes.
- Publishing validates the 19 content-route runtime archetypes. Conversion pages
  remain draft-only while the bounded HubSpot component is an inert local mount
  without approved provider and consent behavior; interactive Market Matrix
  pages require exactly one managed `marketMatrix` component before publication.
- A changed published path keeps its current public claim while the draft path
  is reserved; publication requires redirect confirmation and creates the
  redirect in the same transaction. Scheduled changes retain approval only for
  the exact old/new path pair.
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
corepack pnpm test:ui
corepack pnpm test:e2e
corepack pnpm test:visual
corepack pnpm build
```

Interface icons come from the licensed Font Awesome kit used by the WordPress reference.
Dependency installation therefore requires the kit token in the shell environment; it is not a
runtime application secret and must not be committed. The committed `.npmrc` contains only scoped
registry definitions and an environment-variable placeholder:

```bash
export FONTAWESOME_NPM_TOKEN='<licensed-kit-token>'
corepack pnpm install
unset FONTAWESOME_NPM_TOKEN
```

Do not add the token value to `.npmrc`, a Docker build argument, an image environment variable, or
the build context.

Set `DESIGN_SYSTEM_ENABLED=true` on a local server to open the database-free component gallery at
<http://localhost:3000/design-system/>. It is disabled by default and always marked no-index.

`pnpm test:visual` compares a production build already running at
`PLAYWRIGHT_BASE_URL` (default `http://127.0.0.1:3000`) with the tracked WordPress references; it
never starts a development server. Use `pnpm test:visual:dev` only for an explicitly non-acceptance
development comparison. `pnpm visual:update-reference` is deliberately separate and first verifies
each expected H1 so a wrong `trayport.local` vhost cannot overwrite the approved baseline.

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
rendering, block, role, or content-review gates. Production readiness remains
blocked on the block catalogue, editor-control runtime parity, and editor-role
capability enforcement; route uniqueness, archetype invariants, article bodies,
listing route ownership, and managed link integrity now pass.

The Dockerfile now exposes separate `migrator` and `runner` targets. The first
production release runs one web replica with a stop-first replacement strategy;
the dedicated migrator runs and verifies committed Payload migrations before the
replacement web process starts. The complete build, release, rollback, and
health-probe contract is in [docs/deployment.md](docs/deployment.md).

BuildKit must receive the Font Awesome token as a secret while installing dependencies. Build the
container with the public origin that should be baked into Next.js and the generated robots file:

```bash
export FONTAWESOME_NPM_TOKEN='<licensed-kit-token>'
docker build \
  --secret id=FONTAWESOME_NPM_TOKEN,env=FONTAWESOME_NPM_TOKEN \
  --build-arg NEXT_PUBLIC_SERVER_URL=https://www.example.com \
  --tag trayport-web .
unset FONTAWESOME_NPM_TOKEN
```

The dependency stage fails when the BuildKit secret is absent. The token is available only to the
single `pnpm install` instruction and is neither copied into a layer nor accepted as `ARG`/`ENV`.
The application build uses `MEDIA_STORAGE_MODE=build`, which cannot start a runtime server.

Every runtime must set `MEDIA_STORAGE_MODE` explicitly in production:

- `s3` is the normal durable mode and requires `S3_BUCKET`, `S3_ACCESS_KEY_ID`,
  `S3_SECRET_ACCESS_KEY`, and `S3_REGION`. `S3_ENDPOINT` is optional for AWS and required for local
  MinIO or another S3-compatible endpoint. `S3_FORCE_PATH_STYLE` accepts only `true` or `false`.

  ```dotenv
  MEDIA_STORAGE_MODE=s3
  ```

- `local-persistent` is the alternative durable mode. It requires an absolute
  `MEDIA_STORAGE_LOCAL_PATH` backed by a persistent mount, for example:

  ```bash
  docker run \
    --env MEDIA_STORAGE_MODE=local-persistent \
    --env MEDIA_STORAGE_LOCAL_PATH=/var/lib/trayport/media \
    --mount type=volume,source=trayport_media,target=/var/lib/trayport/media \
    trayport-web
  ```

  The mounted directory must be writable by the image's `nextjs` user (UID 1001).

- `local-development` writes to `public/media` by default and is rejected when
  `NODE_ENV=production`. It must be selected explicitly when developing without MinIO.

  ```dotenv
  MEDIA_STORAGE_MODE=local-development
  ```

- `build` is reserved for `next build`; startup validation rejects it outside the build lifecycle.

Any partial S3 configuration fails startup, including in a non-S3 or build mode. Complete S3
variables also cannot be combined with a local runtime mode. The checked-in `.env.example` selects
`s3`, so the existing Compose-managed MinIO workflow remains the default local setup.

Supply the real `PAYLOAD_SECRET`, `DATABASE_URL`, media storage, SMTP, preview, cron, and
`NEXT_PUBLIC_SERVER_URL` values to the running container. `NEXT_PUBLIC_SERVER_URL` must be the
exact public HTTP(S) origin with no path, query string, fragment, or credentials. Never reuse the
build-only Payload placeholder at runtime. The public origin is also baked into Next.js by the
documented build argument; changing only the runtime value does not retarget compiled browser code,
so build and runtime configuration must agree.
