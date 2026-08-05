# Content and route archetypes

## Purpose

An archetype defines who owns a public route, which content is required, which
blocks or structured fields are allowed, and what editors can do. It is not
just a label for a WordPress template.

The machine-readable contract defines 18 content-route archetypes plus the
temporary Contact redirect archetype. The content runtime registry contains the
same 18 content-route IDs. Payload integration tests now prove their
discriminators, required/forbidden route policies, top-level block policies,
publication guards, virtual claims, and cross-collection collision behavior.
This passing runtime gate is narrower than production parity: deferred
HubSpot/CookieYes integrations and the remaining 267 plan-only documents are
still incomplete.

## Target archetypes

| Archetype | Owner | Route policy | Body/behavior owner | Current state |
| --- | --- | --- | --- | --- |
| `page.homepage` | `pages` | Required; exactly `/` | Layout | Passing: only this type may claim `/` |
| `page.standard` | `pages` | Required | Layout | Passing runtime route/block invariant |
| `page.product` | `pages` | Required | Layout | Passing runtime route/block invariant |
| `page.landing` | `pages` | Required | Layout | Passing runtime route/block invariant |
| `page.legal` | `pages` | Required | Layout and policy semantics | Passing route/block baseline; the accepted cookie-policy page and consent relationship are imported and rendered |
| `page.conversion` | `pages` | Required | Layout and bounded HubSpot form | Passing guard: draftable but publication is denied until the approved integration exists |
| `page.interactive-market-matrix` | `pages` | Required | Layout and managed market relationships | Passing: publication requires exactly one managed `marketMatrix` component |
| `page.content-index` | `pages` | Required | Layout plus generated listing | Passing: publication requires `articleListing`, which is forbidden on other page types |
| `article.full` | `articles` | Required | Complete article layout | Passing: publication requires a path and non-empty allowed layout |
| `article.listing-metadata` | `articles` | Forbidden | Listing metadata only | Passing: path and layout are forbidden |
| `learning-video.public-detail` | `learning-videos` | Required | Video metadata, media, access policy, SEO | Passing guard: public media may publish; restricted modes publish metadata-only gates without protected media or body content |
| `hub.public-page` | `hubs` | Required | Layout and structured market data | Passing runtime route/block invariant |
| `hub.map-only` | `hubs` | Forbidden | Structured market data | Passing: path and layout are forbidden |
| `venue.structured-record` | `venues` | Forbidden | Structured market data | Passing: `relationship-only` mode forbids path and layout |
| `venue.public-detail` | `venues` | Required | Detail layout and structured market data | Passing: `page` mode has route, preview, renderer, SEO, and minimum-detail validation |
| `index.venue` | System claim; `route-indexes` config; `venues` query | Required virtual `/venue/` | Derived collection index | Passing: system claim and CMS configuration are implemented |
| `index.market-coverage` | System claim; `route-indexes` config; `hubs` query | Required virtual `/market-coverage/` | Derived collection index | Passing: system claim and CMS configuration are implemented |
| `redirect.temporary-contact` | `redirects` | Required `/request-a-demo/` source | Temporary journey bridge | Passing: imported `302` resolves to managed `/contact/`; reversible when an approved HubSpot-backed demo page exists |

“Forbidden” means the record may be publicly readable as data for a managed
component, but it cannot claim a standalone public path or appear as an
internal detail destination.

## Source-template mapping

| WordPress source | Target classification |
| --- | --- |
| Front page using `default-new` | `page.homepage` |
| General `default-new` pages | `page.standard`, `page.product`, `page.landing`, or `page.conversion`, selected by route purpose and content |
| `article.blade.php` and cookie policy | `page.legal` |
| Pages whose primary purpose is HubSpot-backed enquiry/demo submission | `page.conversion`; remains draft-only until the bounded integration exists |
| Current `/request-a-demo/` source root | `redirect.temporary-contact` to managed `/contact/`; no HubSpot form or unused hero media is imported |
| `market-matrix.blade.php` | `page.interactive-market-matrix` |
| `articles-list.blade.php` and Learning Hub home | `page.content-index` with a constrained listing behavior |
| Published `post` details linked by News, Event, or Insights listings | `article.full` |
| Imported article metadata with no complete internal body | `article.listing-metadata`; never a public route |
| Published `learning-hub-video` listing children | `learning-video.public-detail` |
| Published, listing-linked `hub` details | `hub.public-page` |
| Hub records used only as map/relationship data | `hub.map-only` |
| Published, listing-linked `venue` details | `venue.public-detail` |
| Venue records used only as relationships | `venue.structured-record` |
| WordPress virtual archives | `index.venue` and `index.market-coverage` |

Template mapping is followed by content validation. For example, the source
template alone does not distinguish a standard information page from a
conversion page; the presence and purpose of a form does.

## Count ownership

The direct-page archetypes collectively target 50 Payload page documents; the
source Request A Demo page is temporarily owned by `redirects` instead.
The source template footprint for those documents is fixed in
[scope.md](scope.md#page-document-footprint). The retained inventory verifies
that all 51 source routes receive a known archetype candidate. Runtime
`pageType` and publication invariants now pass, but the production importer has
not yet transformed and loaded all 51 documents.

The remaining route ownership is explicit:

| Target owner | Required public routes |
| --- | ---: |
| `articles` using `article.full` | 90 |
| `venues` using `venue.public-detail` | 66 |
| `hubs` using `hub.public-page` | 72 |
| `learning-videos` | 15 |
| Venue and market-coverage virtual indexes | 2 |
| Temporary Contact redirect sourced from a WordPress page | 1 |

Relationship-only venue records, map-only hub records, and article
listing-metadata records are not counted as public routes. The retained
[inventory summary](inventory-summary.json) verifies these owner totals against
the 296-route source corpus.

## Route ownership rules

The target public route namespace is shared by:

- Payload `pages`;
- Payload `articles`;
- Payload `hubs`;
- Payload `venues`;
- Payload `learning-videos`;
- the two derived virtual indexes; and
- redirect sources.

One normalized path has exactly one registry row. Path normalization removes
query/fragment presentation data, collapses duplicate slashes, and applies the
trailing-slash policy. Absolute URLs, protocol-relative values, dot segments,
encoded separators, backslashes, control characters, and whitespace are
rejected within path segments rather than reinterpreted as local aliases.
PostgreSQL uniquely indexes `route-registry.path`; hooks write claims with the
originating Payload request so a collision rolls back the content or redirect
mutation in the same transaction.

The frontend now resolves the registry before loading a collection document.
There is no pages-before-articles-before-hubs ownership fallback. Public
requests see only `published` claims; authenticated draft preview can also see
`reserved` claims.

When an already-published document changes path, its former claim remains
published and the draft path is reserved. Publication requires explicit
redirect confirmation, then atomically publishes the new claim and creates a
redirect claim for the old path. A redirect cannot shadow content, a virtual
index, or another redirect. Scheduled changes persist approval on the reserved
claim for the exact old/new path pair, so later path edits cannot reuse stale
approval.

The two virtual indexes are system-owned claims backed by collection queries
and the versioned `route-indexes` Payload global. They are not fake page
documents and do not duplicate child route owners.

## Publication invariants

The implemented publication hook enforces:

- required route owners have a normalized, globally unique path;
- forbidden-route records have no path or layout and therefore receive no
  route claim, sitemap entry, or public detail link;
- the homepage is the sole owner of `/`;
- a full article has a non-empty allowed layout;
- every content index uses only the listing behavior allowed for that index;
- conversion pages cannot publish while their bounded HubSpot form is absent;
- interactive Market Matrix pages require exactly one managed matrix component;
- a public venue has managed description or layout content;
- a publishable Learning Hub detail has public access mode, playable
  managed/external media, and required metadata; and
- imported and native writes use the same route/discriminator rules.

Production still requires the planned form and cookie-consent components,
complete 296-route managed-link validation, and verification that every
editor-visible setting affects the frontend. Those requirements remain under
their separate non-passing gates; the passing archetype gate does not claim
they are complete.

## Listing behavior

Listings query their target collections. They do not own copied child cards as
page-body data.

- News, Event, and Insights indexes query complete published `articles` and
  preserve the source category, date, featured state, featured order, excerpt,
  image, and destination.
- The Learning Hub index queries published `learning-videos`.
- `/venue/` queries public-detail venues.
- `/market-coverage/` and market-map/matrix components query public-page hubs
  plus any explicitly allowed non-routable supporting records.
- Featured content is an editorial field on the child, not a duplicate page
  relationship unless a curated override is explicitly required.

The production target requires every internal listing destination to resolve
through the route registry. Complete validation of all 243 listing-linked
children is not yet implemented, so the listing-detail and managed-link gates
remain blocked.

## Access policy is separate from route existence

The live source Learning Hub renders 15 public watch paths while applying
permissions to the underlying content. In the target model, route ownership and
access policy are separate fields:

- route ownership decides whether the canonical detail exists;
- access policy decides whether the full media, transcript, or gated action is
  available to the current visitor.

The current renderer publishes `authenticated` and `subscriber` records as
metadata-only gate pages. Collection access redacts their media and body fields,
and publication validation forbids those protected values until
identity/subscription authorization and protected asset delivery are
implemented and verified. Public records may publish full managed or external
video content.

Private WordPress records are not imported as additional public routes merely
to reproduce a legacy permission mechanism.
