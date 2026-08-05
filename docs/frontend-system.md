# Frontend system contract

## Purpose

This document is the implementation contract for the Trayport public frontend. It keeps
the WordPress parity work, Payload editing model, and reusable React UI on one coherent
stack instead of allowing each page or migration slice to introduce another component
library or styling convention.

## Ownership stack

Public content flows through one direction:

```text
Payload document
  -> typed block adapter
  -> Trayport site component
  -> shared UI primitive when interaction is required
  -> Tailwind utilities backed by semantic Trayport tokens
  -> Font Awesome icon when an interface icon is required
```

- Payload owns editorial data, approved semantic variants, relationships, and workflow.
- Block adapters default and normalize Payload values; they do not own visual design.
- Site components own reusable Trayport compositions such as containers, sections,
  heading groups, actions, heroes, statistics, cards, and shells.
- `src/components/ui` is the only primitive interaction layer. It uses Radix selectively
  where native HTML does not provide the required accessible behavior.
- Tailwind CSS `4.3.3` and `src/styles/tokens.css` own the styling language and semantic tokens.
- Font Awesome is the only interface icon library. Product/Trayport logos, flags, chart
  glyphs, and specialist map geometry are explicit brand/data-visualization exceptions.

The frontend self-hosts deterministic normal and italic subsets of the exact Inter 4.1 variable
fonts used by the active WordPress reference. Their source and output hashes are locked beside the
font files; Unicode-range splitting lets the common path fetch only its Latin face while avoiding
the reference site's runtime `rsms.me` dependency. Replacing the font generation or subset process
is a brand change and requires new parity evidence.

## Approved sources and dependencies

- Tailwind Plus examples are source-owned layout references. When used, their structure
  is adapted to Trayport components and tokens; Headless UI and Heroicons are replaced by
  the existing Radix/native primitive layer and Font Awesome.
- Catalyst is a reference for component APIs and composition, not a second installed
  primitive system.
- Material Design contributes principles only: clear hierarchy, predictable states,
  accessible targets, restrained elevation, and purposeful motion. Material UI,
  Material tokens, and Material visual styling are not dependencies.
- No page may add another icon package, primitive library, or free-form design-token set.

The primitive packages are pinned to the current Radix releases used by this repository rather
than introduced indirectly through a second component library. Their styling and public APIs are
owned in `src/components/ui`; route and CMS code do not import Radix directly.

Market-volume charts load the pinned Highcharts core and accessibility UMD distributions from the
same-origin `/next/chart-runtime/` endpoint only when a chart mounts. The endpoint concatenates core
before accessibility because the latter consumes the browser globals created by core. This keeps
Highcharts off non-chart routes while retaining keyboard and assistive-technology support. The
standalone build explicitly traces the two package files used by this endpoint. Chart labels render
with the exact self-hosted static Inter 400 and 700 faces used by WordPress. Chart creation is not
gated on those font requests: the reference Highcharts instance measures its initial fallback text,
then the static faces swap into the already-positioned SVG without a chart redraw. Preserving that
order reproduces the reference plot margins, legend wrapping, and automatic quarter-label selection
at desktop and mobile widths while avoiding an extra render gate. Shared tooltips use the reference
HTML total-plus-series format; the native data-table disclosure remains the durable accessible view.

### Market-data chart contract

The `dataChart` block is a bounded editorial query over imported WordPress configuration and
application-owned PostgreSQL facts. Payload stores the title, accessible summary, presentation,
optional range, one managed Asset Class, and optional managed Hub filters. It never stores or lets
editors change the monthly facts in `app.market_volume_monthly`. The runtime derives every query key
from the related records' stable normalized `marketDataKey`; managed aliases resolve approved
source labels during import. Numeric legacy IDs are migration provenance and an older-draft
compatibility path only.

Exactly three presentation shapes are supported:

| Series dimension | Metric | Chart | Series meaning |
| --- | --- | --- | --- |
| `executionType` | `volume` | `stackedColumn` | OTC bilateral, OTC cleared, and exchange-traded totals; Hub filters are forbidden |
| `hub` | `volume` | `column` | One Hub series containing the sum of all execution-volume fields |
| `hub` | `price` | `line` | One Hub series containing the mean imported price |

Each shape may group matching facts by `month`, `quarter`, or `year`. Optional from/to bounds remain
complete year-and-quarter pairs, while selected periods are capped at the most recent 40 matches and
returned in chronological order. `includedHubs` is an allow-list and `excludedHubs` is a deny-list;
the two managed relationship sets must be disjoint and are available only to Hub-series charts.

The accepted WordPress navigation slice imports these six configurations without inferring from
titles at runtime:

| Source chart | Target signature | Managed Hub filter |
| --- | --- | --- |
| Home gas volume | execution type / volume / stacked columns / quarter | none |
| Home power volume | execution type / volume / stacked columns / quarter | none |
| Asia-Pacific Japan power volume | Hub / volume / columns / month | include Japanese Power (`2500`) |
| Europe power volume | Hub / volume / columns / year | exclude Swiss, Greek, and Japanese Power (`2511`, `2496`, `2500`) |
| Europe power price | Hub / price / line / month | include UK, German, French, Italian, and Nordic Power (`2513`, `2495`, `2494`, `2499`, `2502`) |
| Europe gas volume | Hub / volume / columns / quarter | include PEG, THE, PSV, and NBP (`3315`, `3316`, `3320`, `2488`) |

Presentation state is explicit: `available` renders Highcharts and, when enabled, the accessible
“View chart data” table; `empty` means the query succeeded with no matching imported values;
`unavailable` means PostgreSQL or a required managed relationship could not be resolved; and
`unsupported` means a retained draft/configuration does not match one of the three supported shapes.
Unsupported configurations do not query market data, and publication guards prevent editors from
creating new ones.

The `market-data-imports` collection gives Administrators a bounded validate/preview/commit
workflow. It resolves Asset Class and Hub keys, titles, and aliases; rejects malformed,
ambiguous, or duplicate facts; records coverage and history; and commits metric-preserving upserts
transactionally. It operates application data without turning raw facts into editable Payload
fields.

### Market-map contract

The `marketCoverage` block owns two bounded application-derived models. `globalConnections`
resolves managed Hub coordinates and classifications, then reproduces the accepted 33 Power and 22
Natural Gas locations and their 759 same-class connection segments. `regionalConnectivity` uses
managed Region boundaries/centers/points of interest, Hub country/type/classification data,
explicit route geometry, Venue/type hierarchy, Asset Class appearance, filters, and optional
period market summaries to reproduce the live regional map interactions.

The global schematic always server-renders its deterministic managed-media/SVG fallback. Mapbox is
required for the full regional view, but its client/runtime/CSS stay behind the owning block and an
accessible fallback/list remains available during loading or provider failure. Regional controls
cover region/reset, boundary selection/fit, Asset Class selection, country/Hub/route/point-of-
interest selection, Venue links grouped by type, and the configured market-data periods. Reduced
motion disables nonessential animation; provider logo and attribution remain visible.

`MAPBOX_PUBLIC_TOKEN` must be a browser-safe `pk` token;
`MAPBOX_STYLE_DARK_URL` and `MAPBOX_STYLE_LIGHT_URL` must be valid Mapbox style URIs or
`https://api.mapbox.com` style URLs. These are server-read runtime values and must validate before
configuration reaches a bounded client island. Missing or invalid configuration loads no provider
resources. Production activation additionally requires an origin-restricted token, approved use
or Trayport-owned clones of the reference styles, and recorded Mapbox licence/attribution approval.

The application sends a conservative response-header baseline, but deliberately does not enforce a
Content Security Policy yet. `script-src 'self'` on its own would block Next.js inline bootstrap
scripts. The production CSP follow-up must begin in `Content-Security-Policy-Report-Only`, exercise
the public routes, Payload admin, same-origin live preview, and chart runtime, and resolve every
expected violation before enforcement. If a strict policy is required, the proxy must generate a
fresh unpredictable nonce per request, forward the matching CSP on both the request and response,
and let Next.js apply that nonce to framework scripts. Because a nonce policy makes matched routes
fully dynamic and is incompatible with the current partial-prerender shell, that cache/performance
trade-off is an explicit release decision. Do not hide violations with production `unsafe-eval` or
treat `unsafe-inline` as the final policy.

The private Font Awesome kit is installed from the official registry. Every clean local or CI
install must provide `FONTAWESOME_NPM_TOKEN`; the value is never committed. Container builds mount
it as a required BuildKit secret for the dependency instruction only. The token is never accepted
as a Docker build argument or image environment variable.

The always-hydrated Header and Accordion import only the fixed four-icon `ShellIcon` registry;
reusable interactive primitives import the separate six-icon `ControlIcon` registry. Both render
the official Font Awesome definitions through the small owned `BoundedIcon` SVG boundary, avoiding
the full React renderer in the public client shell. CMS-selected navigation and content icons stay
in the general semantic registry, use the official React renderer on the server, and enter client
components only as rendered slots. Editorial vocabulary therefore does not become a site-wide
client dependency. The production postbuild gate totals every client chunk owned by the frontend
layout, enforces a 60 KiB gzip ceiling, and rejects representative CMS-only icon definitions. If
another fixed shell control is added, extend the relevant small registry deliberately and rebuild
before changing the measured budget.

A second postbuild gate reads Next's emitted route-bundle diagnostics and the database-free partial
prerender artifacts for `/`, `/[...segments]`, and `/_not-found`. It independently caps first-load
JavaScript, linked CSS, HTML, and complete segment RSC bytes, verifies Next's reported JavaScript
total against the actual files, and rejects signatures from the optional listing, matrix, chart,
video, preview, and admin implementations. The sorted report is written to
`.next/diagnostics/public-route-budget-report.json`. These route-pattern budgets protect the shared
build graph; production E2E remains responsible for content-selected chunks and response sizes.

## Data, cache, and deployment boundaries

- Published route, global, listing, index, sitemap, and market-data projections use tagged Cache
  Components with a five-minute revalidation window. Authenticated draft reads branch before every
  persistent cache. Next.js Cache Components cannot currently execute inside Proxy, so its one
  published-route/redirect snapshot uses the tagged `unstable_cache` compatibility API behind the
  same five-minute policy; this is a bounded framework exception rather than a second cache model.
- Content writes invalidate the smallest public projection that can change: canonical route tags,
  article-family or learning-video listings, venue/market indexes, redirects, and the route-registry
  tag only when publication or a path move changes the public route set. A routable public edit also
  refreshes the sitemap tag because `lastmod` and `noIndex` can change without changing the path; the
  proxy route-status snapshot does not share that broader tag.
- Canonical route cache tags use a versioned SHA-256 digest of the normalized path, keeping all
  editor-controlled paths within Next.js's 256-character tag limit. Cached populated relationships
  additionally carry document-scoped `content-dependency:<collection>:<id>` tags. Each projection
  declares all primary owner tags before its complete dependency set is bounded: the common
  one-owner case has 127 of Next.js's 128 slots available, while the two-owner Market Matrix has
  126. If the final combined set exceeds its budget, the complete dependency set switches to one
  `content-dependency-collection:<collection>` tag per referenced collection instead of silently
  truncating records; mutation hooks invalidate both exact and collection forms. Media, offices,
  taxonomy records, and managed content links therefore remain correct, with intentionally broader
  refreshes only for unusually large projections. Private office autosaves do not invalidate public
  projections.
- Article and learning-video libraries currently send complete compact card projections to their
  client filter boundary. This is intentional for the verified 90-article/15-video source corpus.
  Move paging and filters into URL-backed server queries before either library exceeds 250
  published records or a production listing response exceeds 500 KiB transferred. Dependency tags
  coarsen by collection before the framework limit, so the 250-record gate remains a response-size
  and client-filtering boundary rather than an unsafe cache-tag allowance. Do not raise it by
  silently truncating Payload results.
- Slow listing, market-index, and market-data reads suspend at the owning block, not the entire
  page. Market data returns distinct `available`, `empty`, and `unavailable` states so an outage is
  observable and never presented as a valid empty dataset.
- Mapbox is a route-/block-owned viewport-lazy runtime for maps that require it. It is absent from
  the initial public shell and routes without regional or provider-backed map blocks; the global
  schematic and accessible regional data view remain usable when configuration/provider fails.
- The proxy and market-data PostgreSQL pools bound connection, statement, and query waits at three,
  four, and five seconds respectively. Proxy failures propagate as infrastructure failures instead
  of becoming false 404s; chart blocks retain their explicit unavailable presentation.
- The first production topology is exactly one combined Next.js/Payload web process, replaced
  stop-first after the dedicated migration image succeeds. Horizontal or overlapping web replicas
  require a durable shared Next.js cache handler and tested cross-process tag coordination first.
  Liveness checks only the HTTP process; readiness additionally verifies PostgreSQL and the exact
  committed Payload migration manifest.

## Component rules

- Components are small, typed, and server components by default. Add `use client` only
  where browser state or effects are required.
- Reusable components accept `className` and merge it with `cn`; external margins and
  page placement remain at the call site.
- Reusable and compatibility block recipes live in Tailwind's `components` layer so caller
  utilities retain precedence. Shared shell and route-specific parity styles stay explicit
  temporary compatibility owners until their consuming golden routes are accepted.
- Layout is expressed with `Container`, `Section`, `Stack`, `Cluster`, and `Grid` rather
  than repeating local max-width and spacing recipes.
- Form controls are organized by HTML element and always expose labels, names, validation,
  disabled states, focus states, and mobile-safe text sizing.
- Tailwind variants use semantic names such as `primary`, `secondary`, `dark`, `soft`, or
  `reading`; consumers do not pass arbitrary colors, pixel values, or utility strings
  through Payload.
- Lists rendered without visible bullets explicitly retain list semantics.
- Imported rich text preserves H2-H4 headings, ordered and unordered lists, and nested
  list structure as native Lexical nodes. The public site remains explicitly light-only:
  operating-system dark preference does not apply a prose inversion or introduce a
  second unapproved color system.
- A managed venue description is body content, not an SEO fallback. Render it whenever
  present even when its text matches `meta.description`.
- Link-style actions use their imported semantic leading icon and a consistent trailing chevron.
  New-tab actions expose that behavior in the accessible name and retain `noopener noreferrer`.

## Payload boundary

- Existing block schemas stay stable when their fields already express the observed live
  content. A schema changes only when the reachable-route inventory proves a missing,
  reusable semantic choice.
- CMS users never receive arbitrary CSS classes, raw HTML, script, color, width, spacing,
  or icon-name fields.
- CMS-selectable icons come from the typed application registry and importer mapping.
- Data Charts require a managed Asset Class relationship. Published charts resolve the
  application-data key from that related record's stable `marketDataKey`; managed aliases
  exist for import resolution, while hidden legacy numbers remain provenance and older-draft
  compatibility. Editors choose only volume or price, execution-type or Hub series, and
  month, quarter, or year grouping. Optional managed Hub allow/deny lists must be disjoint;
  execution-type charts cannot use them. Optional from/to ranges require complete
  year-and-quarter pairs and cannot run backwards.
- The Media collection accepts reviewed images, videos, and PDFs, but every visual upload
  relationship is created through the shared image-only, video-only, or image-or-video field
  factories. Their picker filters are an editor convenience; async server validation resolves the
  selected Media record and rejects PDFs, missing MIME metadata, unsupported types, and missing
  records. PDFs remain valid Media collection assets for explicit document workflows; the visual
  relationship boundary does not change the collection upload allowlist.
- `TrayportMedia` renders only populated `image/*` and `video/*` records (plus a separately
  validated external video URL) and returns no markup for documents or unsupported MIME types.
- Schema changes require a migration, `pnpm generate:types`, importer coverage, and
  integration tests. Local API calls made on behalf of a user use
  `overrideAccess: false`.

## Parity and change control

- `http://trayport.local` remains the presentation reference for reachable routes.
- `parity-*.css` is a compatibility layer, not the target component API. A selector is
  removed only after its replacement is used by all affected routes and the visual and
  behavioral checks pass.
- Every intentional improvement is recorded in `docs/frontend-improvements.md` before
  acceptance, with an isolated implementation hook and rollback.
- Exact-parity fixes and deliberate improvements are never silently mixed in one change.

## Verification contract

Every completed frontend slice must pass the relevant component/gallery checks, keyboard
and accessibility checks, reference/current screenshots, lint, typecheck, integration
tests, production build, and route E2E tests. A passing build alone is not evidence of
visual parity.

Production verification separates deterministic gates from environment-sensitive evidence:
route-pattern JavaScript/CSS/HTML/RSC budgets and optional-module network boundaries block
regressions, while the five desktop/mobile golden routes record browser LCP, CLS, FCP, TTFB,
load timing, and transfer summaries for comparison. Local timing values are not hard CI budgets.

The deterministic component gallery is served at `/design-system/` only when the server process
has `DESIGN_SYSTEM_ENABLED=true`. It uses the production font, tokens, CSS, icons, primitives, and
site compositions without querying Payload or mounting the public Header/Footer. The route returns
404 by default and is excluded from indexing.
