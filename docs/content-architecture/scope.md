# Production content scope

## Status and authority

The production content-architecture milestone is **complete**: the content
boundary, target ownership, archetypes, layout dispositions, and acceptance
gates have been decided.

The site is **not production-ready**. “Milestone complete” does not mean that
the target Payload schemas, production importer, frontend routes, or content
review are complete. The source-scope inventory now passes; the remaining work
is governed by the blocking gates in
[decisions.md](decisions.md#production-readiness-gates).

The live public site and the desktop-local WordPress copy represent the same
deployment and together form the functional/editorial parity baseline. The
public site answers what users currently experience; the local database and
theme provide the reproducible implementation evidence.

The sources of truth are:

1. The approved scope decision in this document.
2. The versioned machine-readable contract in
   `migration/mappings/content-architecture.v1.json`.
3. A reproducibly generated production inventory and route manifest.
4. The local WordPress database and uploads as migration source evidence.

The current delivery status and environment sequence are recorded in
[delivery-slices.md](../delivery-slices.md). Local completion of the Payload,
maps, Matrix, and chart/data slices does not close the remaining content,
external-service, AWS review, or Trayport ECS production gates.

If the generated inventory does not prove the approved counts or exposes a
conflict, it fails the gate; it does not silently change the scope.

## Approved and verified public route corpus

The acceptance total is:

**51 Payload page documents + 1 redirects-owned source-page route + 2 virtual
indexes + 263 listing children = 317 public routes.**

| Route class                          |   Count | Source and target ownership                                                                                                  |
| ------------------------------------ | ------: | ---------------------------------------------------------------------------------------------------------------------------- |
| Page documents                       |      51 | WordPress `page` records → Payload `pages`                                                                                   |
| Temporary Request A Demo route       |       1 | WordPress page `4031` identity → Payload `redirects`, `302` to managed `/contact/`                                           |
| Virtual indexes                      |       2 | `/venue/` owned by the venue frontend/index configuration; `/market-coverage/` owned by the hub frontend/index configuration |
| Published posts                      |      90 | 31 News + 20 Event + 39 Insights → Payload `articles`                                                                        |
| Published legacy Event details       |       3 | Unique WordPress `events` records → Payload `articles`; two further legacy records merge into matching canonical Event posts |
| Published People details             |      17 | WordPress `people` → routable Payload `people`                                                                               |
| Published venue details              |      66 | WordPress `venue` → routable Payload `venues`                                                                                |
| Published hub details                |      72 | WordPress `hub` → routable Payload `hubs`                                                                                    |
| Published Learning Hub watch details |      15 | WordPress `learning-hub-video` → Payload `learning-videos`                                                                   |
| **Total**                            | **317** | One canonical owner per public path                                                                                          |

The 263 listing children are therefore:

**90 posts + 3 unique legacy Events + 17 People + 66 venues + 72 hubs + 15
learning videos = 263.** The Article total includes 23 Event owners: 20
canonical `post` records and three additional unique legacy `events` records.

The route total counts public route owners, not navigation-link occurrences,
redirect records, media files, taxonomies, relationship-only records, or
market-data rows.

## Page-document footprint

The 52 in-scope WordPress page source identities use these active templates:

| WordPress template                    | Documents | Target behavior                                                              |
| ------------------------------------- | --------: | ---------------------------------------------------------------------------- |
| `layouts/default-new.blade.php`       |        42 | Composed Payload page                                                        |
| `layouts/default-new.blade.php`       |         1 | Identity-only temporary Request A Demo redirect; form and hero media omitted |
| `layouts/articles-list.blade.php`     |         4 | Content-index page plus generated article listing                            |
| `layouts/article.blade.php`           |         2 | Legal/policy page using legacy article sections                              |
| `layouts/learning-hub-home.blade.php` |         1 | Learning Hub index plus generated video listing                              |
| `layouts/market-matrix.blade.php`     |         1 | Interactive market-matrix page                                               |
| `layouts/cookie-consent.blade.php`    |         1 | Cookie-policy page plus CookieYes-managed consent categories                 |
| **Total**                             |    **52** |                                                                              |

The target `pageType` values are semantic archetypes rather than a permanent
copy of these template names. See [archetypes.md](archetypes.md).

## Explicit inclusion and exclusion decisions

Included:

- FAQ, WordPress page `7609`, at `/resources/faqs/`. It is present on the live
  public site even though the local ACF navigation snapshot omits it.
- EEX News, WordPress page `11299`, at `/eex-news/`. Its internal CTA from
  published banner `11602` makes it a canonical Page owner. All published
  banners contribute targeting and CTA reachability regardless of their current
  schedule window; unpublished banners do not widen production scope.
- The current published Careers page, WordPress page `11475`.
- The home page and the hard-coded live navigation destinations for Joule,
  Request a Demo, and Contact. The current pilot keeps Request A Demo as a
  reversible `302` to managed Contact; that bridge does not remove HubSpot from
  launch scope where the live workflow uses retained form identifiers.
- Internal details generated by the four editorial indexes, market matrix,
  venue index, market-coverage index, and Learning Hub index.
- All 17 published People profiles used by the live leadership and Careers
  experiences. People are first-class route owners in Payload, not flattened
  page-body snapshots.
- All 23 canonical Event details. Legacy `/events/<slug>/` requests redirect to
  `/event/<slug>/`; where both WordPress types describe the same event, their
  source evidence is merged into one Article rather than creating a duplicate
  route owner.
- Redirects required to preserve valid legacy URLs. Ordinary legacy aliases are
  operational claims outside the 317 canonical content-owner count; the one
  explicit exception is source page 4031, whose canonical milestone owner is
  the temporary Request A Demo redirect counted above.
- Media and taxonomy dependencies referenced by included content.
- HubSpot form identifiers used by the live experience. The Next.js target
  keeps a bounded embed integration; a real test submission is deferred until
  an approved destination and consent flow are available.
- CookieYes as the consent provider, with the live categories and behavior
  reproduced by its Next.js integration.
- TIM customer authentication, protected documentation links, and the current
  auto-login outcome for launch. TIM remains outside the local feature slice
  and separate from Payload editor authentication.

Excluded:

- Commodities Report, WordPress page `2233`, at
  `/resources/commodities-report/`, and its unused feature architecture.
- The stale private Careers page `2207` and the old Careers template route.
- Unused generic WordPress form-builder and HubSpot administration structures.
  The active form identifiers and required embed behavior are retained.
- Classic WordPress menus; the active ACF options navigation is authoritative.
- Dormant WordPress content types and admin structures that are neither
  rendered by an in-scope route nor required as a dependency.
- WordPress users. Payload authentication and roles replace editor accounts;
  public customer identity is a separate TIM-backed concern.
- Arbitrary shortcode execution. Supported semantics are mapped explicitly.
- WordPress market-data tables as CMS content. Market facts move to application
  PostgreSQL.

Exclusion from migration does not authorize a broken link. Any link to excluded
or private content must be removed, replaced, or redirected deliberately.

## Navigation and footer boundary

The active header is sourced from the ACF options field `dropdown`, not a
registered WordPress menu. It has five top-level roots: Company, Products,
Markets, Regions, and Resources.

When a root has `menu_block` content, its `for_page` value is presentation
metadata for the legacy dropdown and is **not** a public anchor. Those roots
must remain buttons unless an explicit target link is approved. The local
source contains 48 authored item-link occurrences representing 47 distinct
paths; Markets Map occurs twice.

Joule, Request a Demo, and Contact are also hard-coded into each of the five
legacy dropdown bottoms. That produces 15 repeated DOM links, but only three
canonical destinations. The target navigation should model these as shared
managed actions rather than duplicate route owners.

The active footer is sourced from `footer_new` and contains 13 links in the
local snapshot. Footer legal copy is option-managed. Social destinations that
are hard-coded in WordPress move to `site-settings`. The stale local private
Careers destination must be replaced with the current published Careers route.

## Authoritative content fields

For every source archetype, exactly one field family owns the rendered body:

| Source archetype                                                         | Authoritative body                                                                                                  |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `default-new`, article-list, Learning Hub, market matrix, cookie consent | `sections_new`                                                                                                      |
| Legal/article page template                                              | `sections`                                                                                                          |
| Published post details                                                   | `sections`                                                                                                          |
| Published legacy `events` details                                        | Structured ACF Event fields plus any retained form identifier; duplicate records enrich the canonical Article owner |
| Published People details                                                 | Structured ACF profile, team, biography, quote, portrait, ordering, and SEO fields                                  |
| Hubs, venues, Learning Hub videos, lifecycle and related entities        | Their structured ACF fields                                                                                         |

`page_content` and legacy `sections` values found alongside `sections_new` are
stale migration residue. They must not be merged into the target body. Of the
42 approved composed pages, 19 contain both stale `sections` and
`page_content`, 6 contain stale `page_content`, and 17 contain only
`sections_new`. FAQ and the excluded Commodities page have the same stale-field
profile, so swapping them does not change those counts.

The generated inventory records the authoritative field for each source node.
An absent or ambiguous authoritative field is a migration error, not a reason
to guess.

## Dependencies outside the route total

Included route documents may pull in:

- WordPress attachments and their files;
- article categories, asset classes, venue types, and regions;
- client, product, office, lifecycle, and reusable video records that are
  flattened into blocks or migrated as managed relationships;
- hub-to-hub, hub-to-venue, and region relationships;
- structured chart configuration; and
- normalized market-volume facts.

These records are imported when referenced, but do not become public detail
routes unless an archetype assigns them route ownership. Published People are
the explicit exception in the current corpus: `person.public-profile` assigns
all 17 of them canonical route ownership.

## Link and redirect evidence

The retained pre-People/Event source-link audit found 512 authored link
occurrences:

| Classification                     | Occurrences |
| ---------------------------------- | ----------: |
| Internal, published targets        |         227 |
| External HTTP(S)                   |         214 |
| Email or telephone                 |          35 |
| Same-page anchors                  |          27 |
| Private target                     |           1 |
| WordPress attachment permalinks    |           3 |
| Unresolved internal targets        |           3 |
| Unsafe placeholder (`about:blank`) |           1 |
| Virtual index                      |           1 |
| **Total**                          |     **512** |

These counts are preserved as historical link-remediation evidence for that
earlier scope. Launch validation must rerun the link audit across the expanded
317-route corpus rather than treating 512 as its final total.

The content also contains 230 absolute `trayport.local` links and 4 absolute
`www.trayport.com` links. Internal links must be normalized to managed
references or canonical relative paths. Attachment permalinks must become
media/file links.

Known review cases include:

- the private `/?page_id=2207` Careers target;
- a scheme-less LinkedIn URL that resolves as a broken relative path;
- an `about:blank` placeholder;
- the stale `/home/enterprise-security/` path;
- the Summer of Sport route whose current WordPress canonical destination sits
  beneath a private parent;
- three attachment permalinks that redirect to files; and
- redirect records that point at missing or private targets.

The normalized inventory contains 53 redirect candidates. It retains the
WordPress redirect rules and adds canonical Event aliases: all five published
legacy `/events/<slug>/` paths resolve to `/event/<slug>/`, including two
source records that merge into existing Event Articles and three that become
new Article owners. The duplicate `/on-demand/` source, missing `/third-party/`
target, and private `/careers/` target require explicit disposition. Legacy
`page_redirect` behavior must be extracted as redirect evidence rather than
copied as a generic template hook.

## Inventory acceptance

The production inventory is implemented and its retained evidence passes. It
is generated from the local WordPress database rather than hand-maintained.
Immutable inventory run `people-events-inventory-20260805-1400` is the source
of the current 317-route refresh:

- [inventory-summary.json](inventory-summary.json) records source identity,
  counts, and hashes;
- [verification.json](verification.json) records every hard assertion;
- [layout-coverage.json](layout-coverage.json) records authoritative fields,
  templates, all observed layouts, and reachable taxonomy dispositions; and
- [route-manifest.csv](route-manifest.csv) records canonical owners,
  provenance, dependencies, exclusions, and redirects.

The retained baseline identifies `http://trayport.local/` running WordPress
7.0.2 and ACF 6.8.5, and pins its reference-only source snapshot by SHA-256
`5e979983f2b096bf34bcae70477b13245a871244f44c755ec488e50868a9c36a`.
The snapshot contains route and relationship evidence rather than authored
bodies and remains reproducible ignored run output.

The retained run proves:

- exactly 317 included canonical routes using the approved formula;
- FAQ included and Commodities Report excluded;
- every route has one target owner and a known archetype;
- no duplicate canonical path exists across content, virtual indexes, and
  included content;
- no included route is draft, private, missing, or unresolved;
- all 41 observed source layout/scope combinations have a contract
  disposition;
- all eight reachable taxonomy types have an explicit map, consolidation, or
  omission; and
- the same source snapshot produces byte-equivalent generated evidence.

This closes source-scope discovery, not launch review. The inventory also
records 705 dependencies, 26 non-error review warnings, and 105 referenced
media records whose files are unavailable locally. Complete target documents,
missing-media disposition, managed-link repair, redirect review, and frontend
rendering remain separate production gates.
