# Target Payload model

## Baseline and target

The current PoC already implements Payload collections for pages, articles,
hubs, venues, media, taxonomies and users; globals for navigation, footer and
site settings; and the redirects plugin. It also stores market facts in
application PostgreSQL.

The target model below is the production contract. Where it extends the current
schema, that delta is explicit. The production importer and admin UI must target
this model rather than preserving WordPress admin structure.

## Resource model

| Resource | System of record | Public-route role | Production responsibility |
| --- | --- | --- | --- |
| `pages` | Payload | Routable | Homepage, standard, product, landing, legal, conversion, interactive, and content-index pages |
| `articles` | Payload | Routable for full articles | Complete News, Event, and Insights detail bodies and listing metadata |
| `hubs` | Payload | Routable or map-only by mode | Public market details, map markers, relationships, and `/market-coverage/` index configuration |
| `venues` | Payload | Routable or relationship-only by mode | Complete public venue details, connectivity data, and `/venue/` index configuration |
| `learning-videos` | Payload | Routable | Learning Hub watch details, media, taxonomy, access policy, and SEO |
| `media` | Payload + object storage | Non-routable asset | Files, derivatives, captions, attribution, focal point, alt/decorative state, review provenance |
| `article-categories` | Payload | Non-routable taxonomy | News/Event/Insights discovery and filtering |
| `asset-classes` | Payload | Non-routable taxonomy | Market classification and stable market-data key |
| `venue-types` | Payload | Non-routable taxonomy | Broker/exchange/clearing grouping |
| `regions` | Payload | Non-routable taxonomy | Map grouping and default view configuration |
| `navigation` | Payload global | Links to route owners | Primary roots, dropdowns, shared actions, utility links |
| `footer` | Payload global | Links to route owners | Footer columns, legal links, certification marks, copyright |
| `site-settings` | Payload global | None | Brand, default SEO, contact, social, notices, consent integration |
| `redirects` | Payload plugin collection | Claims legacy source paths | URL continuity with validated destinations |
| `users` | Payload auth collection | None | CMS authentication and administrator/editor roles |
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

A shared route registry, or an equivalent transactionally enforced table, must
reserve normalized paths across all routable collections, the two virtual
indexes, and redirects.

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

The current schema has only `standard`, `product`, `landing`, and `index`.
Production must add the missing types and enforce each type’s allowed blocks
and required fields.

The homepage is a singleton and must own `/`. Content indexes require their
approved listing behavior. Conversion pages require a first-party form. Legal
cookie content requires explicit consent-category behavior. Interactive pages
require a supported application component and managed relationships.

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

The current `contentMode=listing` state is useful only as a non-routable draft
or as an explicit external/redirect record. It cannot publish with an internal
path. The current article-type choices must be reconciled with the three
observed public index families, including Event.

## Hubs

Target hub modes:

- `page`: owns a public detail route and combines a managed layout with
  structured market data;
- `map-only`: supports maps and relationships but owns no public detail route.

Hub structured data includes title/display label, code, location and
coordinates, marker locations, media, asset classes, venue types, regions,
related hubs, and venue connections. Stable `marketDataKey` values connect
editorial configuration to application data without copying market facts into
Payload.

The 72 approved listing children must be public-page owners. Any additional
dependency-only hubs must be explicitly `map-only`. Publication hooks must
require or forbid path/layout/SEO according to mode.

The collection also owns configuration for the derived
`/market-coverage/` index; the index itself is a frontend route, not an
additional hub document.

## Venues

Target venue modes:

- `page`: owns a complete public venue detail route;
- `relationship-only`: supplies structured connectivity data and owns no route.

The 66 approved listing children require `page` mode. Production adds the
fields missing from the PoC venue schema:

- `contentMode`;
- canonical path and route reservation;
- summary/detail layout and SEO;
- preview, revalidation, and sitemap behavior; and
- any structured contacts/about fields needed for parity.

Existing structured fields—code, display name, website, logo, types, asset
classes, regions, location, description, and display order—remain managed
data. Connectivity is expressed through relationships, not copied prose.

The collection owns configuration for the derived `/venue/` index.

## Learning videos

`learning-videos` is a required new Payload collection. Each of the 15 public
watch details requires:

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

The Learning Hub index queries this collection. An access restriction can gate
media or actions without removing the canonical route unless the approved
policy says otherwise.

## Taxonomies and structured dependencies

Keep only taxonomies that drive the target experience:

- article categories;
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
- shared utility items; and
- shared primary/dropdown actions for Joule, Request a Demo, and Contact.

Dropdown roots may intentionally have no link. The import must not turn legacy
`for_page` values into anchors when `menu_block` exists.

### Footer

Model ordered columns, legal links, certification marks, managed copyright
text, and optional brand intro. Replace the stale Careers target during import.

### Site settings

Model brand assets, default SEO, contact details, social links, notices, and
cookie/consent integration. This replaces the current hard-coded social URLs
and shortcode-driven cookie category view.

Globals retain drafts, versions, scheduled publication, and revalidation.

## Managed links and redirects

All CTA-bearing blocks, navigation items, footer links, cards, and entity lists
use one shared link shape:

- internal managed reference;
- external URL;
- file/media reference;
- anchor;
- email/telephone; and
- `newTab` plus accessible label where applicable.

The current navigation field already supports page/article/hub references, but
the target must also support venue and learning-video route owners. The same
validated shape must replace free-text URLs in actions, feature lists, entity
lists, and appropriate rich-text links.

Redirects require a normalized unique `from`, a managed internal destination or
validated external `to`, and an explicit permanent/temporary status. They are
validated against the shared route namespace. Redirect chains, loops, missing
targets, private targets, and duplicate sources fail production validation.

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

## Application market data

Payload owns chart title, unit, accessible summary, series selection, and
relationships to editorial entities. Monthly market facts live only in
`app.market_volume_monthly` and are loaded transactionally from the source
tables.

The frontend queries those facts through an application data layer using stable
keys. CMS editors cannot alter raw values. The `dataType` and other visible
chart controls must either affect the query/rendering or be removed.

## Roles and workflow enforcement

Administrators and editors can create, read, update, preview, draft, publish,
schedule, and inspect versions for in-scope content. Editors cannot:

- delete content;
- manage users or roles; or
- mutate migration provenance.

Administrators retain those destructive and account controls. Public access is
published-only for versioned content. Access tests must cover collections,
globals, taxonomies, media, redirects, versions, publication actions, and
direct API mutation attempts.
