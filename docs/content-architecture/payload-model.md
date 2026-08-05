# Payload model and production target

## Baseline and target

The current implementation includes Payload collections for pages, articles,
hubs, venues, learning videos, learning-video categories, media, taxonomies,
users, non-authenticating customer identities, controlled market-data imports,
and the protected route registry; globals for navigation, footer, site settings,
and virtual-index configuration; and the redirects plugin. It stores bulk
market facts in application PostgreSQL.

The routable-content foundation below is implemented. The larger field and
content-parity requirements remain the production contract. The production
importer and admin UI must target this model rather than preserving WordPress
admin structure.

## Resource model

| Resource | System of record | Public-route role | Production responsibility |
| --- | --- | --- | --- |
| `pages` | Payload | Routable | Homepage, standard, product, landing, legal, conversion, interactive, and content-index pages |
| `articles` | Payload | Routable for full articles | Complete News, Event, and Insights detail bodies and listing metadata |
| `hubs` | Payload | Routable or map-only by mode | Public market details, map markers, relationships, and `/market-coverage/` index configuration |
| `venues` | Payload | Routable or relationship-only by mode | Complete public venue details, connectivity data, and `/venue/` index configuration |
| `learning-videos` | Payload | Routable | Learning Hub watch details, media, taxonomy, access policy, and SEO |
| `learning-video-categories` | Payload | Non-routable taxonomy | Managed `lh-category` values and Learning Hub filtering order |
| `media` | Payload + object storage | Non-routable asset | Files, derivatives, captions, attribution, focal point, alt/decorative state, review provenance |
| `article-categories` | Payload | Non-routable taxonomy | News/Event/Insights discovery and filtering |
| `asset-classes` | Payload | Non-routable taxonomy | Market classification and stable market-data key |
| `venue-types` | Payload | Non-routable taxonomy | Broker/exchange/clearing grouping |
| `regions` | Payload | Non-routable taxonomy | Managed boundaries, centers, points of interest, map grouping, and default view configuration |
| `navigation` | Payload global | Links to route owners | Primary roots, dropdowns, shared actions, utility links |
| `footer` | Payload global | Links to route owners | Footer columns, legal links, certification marks, copyright |
| `site-settings` | Payload global | None | Brand, default SEO, contact, social, notices, consent integration |
| `route-indexes` | Payload global | Configures two virtual claims | Venue and market-coverage index headings, introductions, and SEO |
| `redirects` | Payload plugin collection | Claims legacy source paths | URL continuity with validated destinations |
| `route-registry` | Payload + PostgreSQL | Authoritative route namespace | Protected content, redirect, and virtual claims with a globally unique normalized path |
| `users` | Payload auth collection | None | CMS authentication and administrator/editor roles |
| `customer-identities` | Payload | None | Non-authenticating TIM reconciliation/status metadata; never credentials, tokens, sessions, or passwords |
| `market-data-imports` | Payload + application PostgreSQL | None | Administrator-controlled validation/preview/commit history for transactional market-fact ingestion |
| `legacySource` | Migration-owned field group | None | Stable source key, legacy ID, original URL, source timestamp, content hash |
| `app.market_volume_monthly` | Application PostgreSQL | None | Normalized market-volume facts read by the frontend |

## Shared document fields

Every routable Payload document requires:

- title and optional navigation/listing label;
- semantic archetype discriminator where the collection has multiple modes;
- stable slug and normalized canonical `path`;
- draft/published state and `publishedAt`;
- SEO title, description, canonical policy, social image, and indexing controls;
- the fields required by its content owner: layout, structured detail, or
  derived index configuration;
- preview and live-preview support;
- version history and scheduled publication; and
- optional read-only `legacySource` provenance.

`legacySource` is not required for Payload-native content. When present, its
`source + legacyId` key is unique and drives idempotent imports. Editors can
read provenance but cannot mutate it.

The shared `route-registry` collection reserves normalized paths across all
routable collections, the two virtual indexes, and redirects. PostgreSQL
enforces a unique `path`; each content/redirect hook passes its originating
Payload request to registry writes so claims and owner mutations share a
transaction. Draft path changes can retain one published claim and one reserved
claim for the same document because claim identity includes owner, kind, and
state. Per-document mutation state is keyed by collection and document identity,
so concurrent bulk operations cannot exchange route decisions. When an editor
approves a redirect before scheduling a path change, the reserved claim retains
that exact old/new path pair; the scheduled publish consumes the approval and
creates the redirect atomically.

The collection is hidden from admin navigation. Administrators can inspect
claims through authorized API reads, but direct create, update, and delete are
denied to all CMS clients; only internal hooks manage it.

## Pages

Target `pageType` values:

- `homepage`
- `standard`
- `product`
- `landing`
- `legal`
- `conversion`
- `interactive`
- `index`

All eight values now exist. Runtime hooks resolve them to the matching contract
archetype and enforce required paths, root ownership, allowed top-level blocks,
minimum publishable layout, and content-index listing placement.

The homepage is a singleton and must own `/`. Content indexes require their
approved listing behavior. Conversion pages remain draft-only until the bounded
HubSpot embed exists and has approved consent/error behavior. Interactive pages
can publish only with exactly one managed `marketMatrix` component. Legal cookie
content can use the current route/layout foundation, but the CookieYes Next.js
integration remains an external-service gate.

Page hierarchy may support admin organization and breadcrumbs, but `parent`
does not implicitly create a path. The canonical path remains explicit and
globally reserved.

## Articles

All 90 listing-linked posts must import as complete `article.full` documents.
They require:

- source category/type: News, Event, or Insights;
- title, excerpt, image, publication/editorial date;
- complete typed body converted from authoritative `sections`;
- category relationships;
- featured flag and order where used;
- byline and event location where present;
- related articles/hubs where present;
- canonical path and SEO; and
- redirect/destination handling for any intentional external article.

The `contentMode=listing` state is enforced as non-routable metadata: it cannot
own a path or layout. A full article requires a path and non-empty allowed
layout before publication. The current article-type choices must still be
reconciled with the three observed public index families, including Event, and
the other production bodies still need migration/remediation.

## Hubs

Target hub modes:

- `page`: owns a public detail route and combines a managed layout with
  structured market data;
- `map-only`: supports maps and relationships but owns no public detail route.

Hub structured data includes title/display label, code, Hub type, country and
connected-country codes, location/coordinates, marker locations, media, asset
classes, venue types, regions, related hubs, venue connections, and optional
explicit route geometry. Stable `marketDataKey` values and aliases connect
editorial configuration to application data without copying market facts into
Payload. Regions own bounded GeoJSON, centers, and points of interest; Asset
Classes own map appearance and their stable market-data identity.

Venue `marketConnections` is the authoritative editable connectivity source for
the Market Matrix. The German Power hub `connections` array remains a hidden,
read-only compatibility projection for source parity; it is not a second
editorial source of truth.

The mode discriminator and path/layout policy are implemented: `page` requires
a route to publish, while `map-only` forbids both path and layout. The 72
approved listing children still need complete production import as public-page
owners; any additional dependency-only hubs remain `map-only`.

The derived `/market-coverage/` index has a system-owned route claim and reads
its editable presentation/SEO from the `route-indexes` global. It is a frontend
route backed by hub queries, not an additional hub document.

## Venues

Target venue modes:

- `page`: owns a complete public venue detail route;
- `relationship-only`: supplies structured connectivity data and owns no route.

The `contentMode` discriminator is implemented. `page` mode requires a
canonical route and managed description or layout before publication;
`relationship-only` mode forbids path and layout. Both modes share the existing
structured relationship fields. Public venue routes have a frontend detail
view, SEO, authenticated draft preview, revalidation, and sitemap behavior.

Existing structured fields—code, display name, website, logo, types, asset
classes, regions, location, description, and display order—remain managed
data. Connectivity is expressed through relationships, not copied prose. Those
relationships are also the single source for the accessible Market Matrix,
including Asset Class/Region/Hub filters, grouped venues, managed links, and the
current-view CSV and formatted Excel exports.

The 66 approved listing children still require production import/content
review in `page` mode, including any additional contacts/about fields needed
for parity. The derived `/venue/` index has a system route claim and editable
presentation/SEO in the `route-indexes` global.

## Learning videos

`learning-videos` and `learning-video-categories` are implemented Payload
collections. A learning video has title/summary, `public`, `authenticated`, or
`subscriber` access mode, duration, category relationships, SEO, path,
drafts/versions/scheduling, preview, revalidation, and provenance. Public
records may use managed media or a validated HTTPS video URL plus optional
supporting layout. Authenticated and subscriber records may publish only as
metadata-only gate pages: they cannot reference the public media library, an
external video URL, or supporting layout until private delivery exists.

For full production parity, each of the 15 public watch details additionally
requires:

- title/name, slug, canonical path, short description, full description;
- managed video or validated external video reference;
- caption/transcript and poster/image;
- display order;
- product, category, and tag relationships where they affect the live
  experience;
- legacy `lh-category` terms normalized into the managed `categories` field
  used by Learning Hub filtering;
- an explicit access policy derived from legacy permissions;
- optional supporting layout;
- SEO, preview, drafts, versions, scheduling, revalidation, and sitemap policy;
  and
- read-only migration provenance.

The frontend detail renderer keeps the canonical route public and renders media
and supporting layout only for `public` records. Authenticated and subscriber
records render a public metadata gate without protected binaries. Validation
enforces that boundary for drafts as well as publication, and the renderer
ignores stale protected layout defensively. Identity/subscription authorization
and protected asset delivery are not implemented yet. The production pilot
therefore owns one selected metadata gate and keeps the other 14 records as
listing-only fallbacks to the live site.

## Customer identity and TIM boundary

Payload editor accounts and customer identities are deliberately different
models. `users` authenticates Administrators and Editors in the CMS.
`customer-identities` is a non-auth collection that can retain provider,
external-subject, display, customer/account, entitlement, status, and last-sync
metadata needed to reconcile a future TIM session.

The collection must not accept or expose a TIM password, access/refresh token,
session, cookie, auto-login secret, or protected document credential. TIM remains
the launch authentication authority. Its sign-in, logout, expiry/revocation,
protected documentation links, and existing auto-login outcome are deferred from
the local slice and require an explicit server-side integration.

## Taxonomies and structured dependencies

Keep only taxonomies that drive the target experience:

- article categories;
- learning-video categories;
- asset classes;
- venue types; and
- regions.

Legacy `post_tag` is omitted unless a documented target filter requires it.
`product-feature` semantics are absorbed into feature blocks. Reusable people,
clients, products, offices, lifecycle items, and legacy videos should become
typed embedded content or first-class relationships only where reuse and
editorial updates justify a collection. They do not gain routes by default.

## Site configuration

### Navigation

Model:

- five ordered primary root items;
- one supported dropdown depth;
- managed internal reference or validated custom URL per link;
- optional description, group label, and media;
- three shared utility items for Joule, Request a Demo, and Contact, reused by
  desktop dropdowns and the mobile menu.

Dropdown roots may intentionally have no link. The import must not turn legacy
`for_page` values into anchors when `menu_block` exists.

During incremental migration, a navigation or footer destination remains
root-relative only when one of the 27 accepted roots or two virtual routes owns
it. Every other same-site destination is rewritten to its canonical
`https://www.trayport.com/` URL. Acceptance currently validates exactly 34 unique
live fallback paths: 29 leaf destinations plus the five clickable section roots.
This bridge is removed per route when that destination
joins the accepted imported set.

### Temporary Request A Demo redirect

WordPress page 4031 is identity-only migration input. Payload does not import
its HubSpot form, dead form prompt, or unused hero media. The redirects
collection owns `/request-a-demo/` as a `302` reference to managed `/contact/`.
This is a route-specific pilot disposition, not a global removal of HubSpot.
Rollback is per-route: remove the redirect only when an approved HubSpot-backed
conversion page is publishable at the same path, then transfer the route claim
atomically.

### Footer

Model ordered columns, legal links, certification marks, managed copyright
text, and optional brand intro. Replace the stale Careers target during import.

### Site settings

Model brand assets, default SEO, contact details, social links, notices,
retained HubSpot form identifiers, and CookieYes configuration references. This
replaces hard-coded social URLs and the shortcode wrapper without replacing
CookieYes as the consent authority.

Globals retain drafts, versions, scheduled publication, and revalidation.

### Virtual route indexes

The versioned `route-indexes` global contains `venueIndex` and
`marketCoverageIndex` groups with eyebrow, title, introduction, and SEO fields.
They back the system-owned `/venue/` and `/market-coverage/` claims. Updating
the global revalidates both paths and the content sitemap. The indexes derive
their cards and ordering from published `page`-mode records rather than storing
copies. Editors manage the index copy and SEO, but do not select listing members
or use a dedicated index-preview control in this slice.

## Managed links and redirects

All CTA-bearing blocks, navigation items, footer links, cards, and entity lists
use one shared link shape:

- internal managed reference;
- external URL;
- file/media reference;
- anchor;
- email/telephone; and
- `newTab` plus accessible label where applicable.

The registry and redirect plugin support page, article, hub, venue, and
learning-video route owners. Navigation and other managed-link field shapes
still need consistent support for all those owners; replacing remaining
free-text internal URLs and validating every reference is a separate blocked
gate.

Redirects require a normalized unique `from`, a managed internal destination or
validated external `to`, and an explicit `301` permanent or `302` temporary
status. The Next.js network proxy resolves published redirect claims before page
rendering and preserves those exact HTTP statuses. Redirects are
claimed in the shared namespace, so a source cannot shadow content, a virtual
index, or another redirect. Confirmed published path changes create a permanent
redirect in the same transaction. The confirmation for a scheduled change
applies only to the approved old/new path pair and is discarded if the draft
path changes again. Chains, loops, missing/private targets, and the production
candidate review remain incomplete.

## Media

Media metadata stays in Payload; binaries live in S3-compatible object storage.
The migration:

- copies available in-scope files;
- preserves filename/MIME type and useful title/caption/attribution;
- resolves WordPress attachment permalinks to file relationships;
- records whether alt text came from WordPress, a title fallback, or review;
- distinguishes an intentionally decorative image from missing alt text; and
- emits missing files and fallback accessibility text to review.

Production URLs must not depend on the local WordPress uploads host.

## Market maps

`marketCoverage` has two bounded modes. `globalConnections` reproduces the
simple whole-world Asset Class connection schematic from managed Hub
relationships and always retains an accessible server-rendered fallback.
`regionalConnectivity` reproduces the live regional experience with managed
Region geometry and points of interest, Hub/country/type metadata, explicit
connection geometry, Venue/type hierarchy, Asset Class controls, optional
period market summaries, and a corresponding linked list/sidebar.

Mapbox is required for the full regional interaction, but the provider token
and style URLs remain runtime configuration rather than CMS data. Missing or
failed configuration leaves useful controls and the accessible data view in
place. Editors manage bounded content/data; they cannot enter provider secrets,
arbitrary executable code, or unvalidated geometry.

## Application market data

Payload owns chart title, unit, accessible summary, optional range, a required
managed Asset Class relationship, the `volume` or `price` metric, the
`executionType` or `hub` series dimension, and `month`, `quarter`, or `year`
grouping. Hub-series charts may also own disjoint managed `includedHubs` and
`excludedHubs` relationships. Monthly market facts live only in
`app.market_volume_monthly` and are loaded transactionally from the WordPress
source tables or a validated administrator import.

For publication, the related Asset Class must carry a stable normalized
`marketDataKey`; Asset Classes and Hubs may also carry aliases for resolving
controlled source files. The frontend derives application-data keys from those
relationships. Legacy numeric IDs retained on imported/older blocks or facts
are provenance/compatibility values, not editor-controlled authority. Optional
range endpoints are coherent quarter pairs: year and quarter must appear
together, and a complete start must not be after a complete end.

The only publishable combinations are execution-type volume stacked columns, Hub
volume columns, and Hub price lines. Execution-type charts cannot carry Hub filters.
The query selects no more than the latest 40 matching periods, then returns them in
chronological order. CMS editors cannot alter raw market values or this runtime cap;
every visible chart control changes the implemented query or presentation.

The importer maps WordPress `charts-new` `for`, `display_interval`, `hubs`, and
`excluded_hubs` values directly into these bounded fields and relationships. Active
interval semantics alone produce date bounds; malformed defaults in inactive ACF
groups are ignored. Transform and publication validation enforce the supported
shape, coherent range, disjoint Hub filters, and relationship closure.

Administrators operate new market-data loads through `market-data-imports`.
The workflow parses a bounded input, resolves Asset Class and Hub keys/titles/
aliases, reports malformed rows, duplicate facts, unresolved identities, and
coverage, and stores a preview before commit. Commit revalidates the same input
and performs metric-preserving transactional upserts into the application table;
the import record retains status, counts, evidence, and failure detail. A narrow
explicit override may accept missing-Hub coverage only; it cannot force malformed,
ambiguous, or duplicate values. Editors can inspect the resulting chart behavior
but cannot mutate facts or run imports.

The frontend reports `available`, `empty`, `unavailable`, and `unsupported` states
explicitly. An unavailable database or unresolved managed Hub never masquerades as
an empty result, and an unsupported retained draft never reaches the market-data
query.

## Roles and workflow enforcement

Administrators and editors can create, read, update, preview, draft, publish,
schedule, and inspect versions for in-scope content. Editors cannot:

- delete content;
- manage users or roles; or
- mutate migration provenance.

Administrators retain those destructive and account controls. Public access is
published-only for versioned content. Draft preview requires both the preview
secret and an authenticated Administrator or Editor session; public draft mode
cannot expose reserved claims. Registry integration tests cover direct-access
protection, while broader access tests must still cover every collection,
global, taxonomy, media action, redirect, version, publication action, and
provenance mutation before the editor-role gate can pass.

## Frontend route resolution and sitemap

The Next.js root and catch-all routes normalize the requested path and query
`route-registry` first. The claim selects exactly one page, article, hub, venue,
learning video, redirect, or virtual index; collection lookup order is not used
to resolve ownership. Public requests accept only published claims.
Authenticated draft preview also accepts reserved claims and loads draft
versions.

`content-sitemap.xml` is generated from published registry rows whose owner kind
is `content` or `virtual`. Each content owner is resolved before output so stale
claims and records marked `noIndex` are omitted. Redirect sources and
forbidden-route structured records are excluded by construction.
