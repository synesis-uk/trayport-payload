# Content and route archetypes

## Purpose

An archetype defines who owns a public route, which content is required, which
blocks or structured fields are allowed, and what editors can do. It is not
just a label for a WordPress template.

The machine-readable contract currently defines 17 target archetypes. Their
classification is an architecture decision; several still require schema,
importer, or frontend enforcement before production.

## Target archetypes

| Archetype | Owner | Route policy | Body/behavior owner | Current state |
| --- | --- | --- | --- | --- |
| `page.homepage` | `pages` | Required; exactly `/` | Layout | Blocked: root ownership and singleton rule are not enforced |
| `page.standard` | `pages` | Required | Layout | Partial: discriminator and allowed blocks are not enforced |
| `page.product` | `pages` | Required | Layout | Partial: product invariant is not enforced |
| `page.landing` | `pages` | Required | Layout | Partial: landing invariant is not enforced |
| `page.legal` | `pages` | Required | Layout and policy semantics | Blocked: legal rules and cookie-category behavior are absent |
| `page.conversion` | `pages` | Required | Layout and first-party form | Blocked: form behavior is absent |
| `page.interactive-market-matrix` | `pages` | Required | Layout and managed market relationships | Blocked: component and complete destinations are absent |
| `page.content-index` | `pages` | Required | Layout plus generated listing | Blocked: listing block placement is not enforced |
| `article.full` | `articles` | Required | Complete article layout | Partial: a full article can publish without a body |
| `article.listing-metadata` | `articles` | Forbidden | Listing metadata only | Blocked: current PoC can expose empty internal details |
| `learning-video.public-detail` | `learning-videos` | Required | Video metadata, media, access policy, SEO | Blocked: collection and route owner are absent |
| `hub.public-page` | `hubs` | Required | Layout and structured market data | Partial: path and body rules are not conditional |
| `hub.map-only` | `hubs` | Forbidden | Structured market data | Partial: schema can still assign a path/layout |
| `venue.structured-record` | `venues` | Forbidden | Structured market data | Blocked: `contentMode` is absent |
| `venue.public-detail` | `venues` | Required | Detail layout and structured market data | Blocked: path, SEO, layout, preview, and renderer are absent |
| `index.venue` | `venues` | Required virtual `/venue/` | Derived collection index | Blocked: route and index configuration are absent |
| `index.market-coverage` | `hubs` | Required virtual `/market-coverage/` | Derived collection index | Blocked: route and index configuration are absent |

“Forbidden” means the record may be publicly readable as data for a managed
component, but it cannot claim a standalone public path or appear as an
internal detail destination.

## Source-template mapping

| WordPress source | Target classification |
| --- | --- |
| Front page using `default-new` | `page.homepage` |
| General `default-new` pages | `page.standard`, `page.product`, `page.landing`, or `page.conversion`, selected by route purpose and content |
| `article.blade.php` and cookie policy | `page.legal` |
| Pages whose primary purpose is first-party enquiry/demo submission | `page.conversion` |
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

The direct-page archetypes collectively own the 51 Payload page documents. The
source template footprint for those documents is fixed in
[scope.md](scope.md#page-document-footprint). The retained inventory verifies
that all 51 source routes receive a known archetype candidate. Final `pageType`
assignment and target publication invariants remain enforced by the blocked
archetype-discriminator gate; inventory classification alone does not implement
them.

The remaining route ownership is explicit:

| Target owner | Required public routes |
| --- | ---: |
| `articles` using `article.full` | 90 |
| `venues` using `venue.public-detail` | 66 |
| `hubs` using `hub.public-page` | 72 |
| `learning-videos` | 15 |
| Venue and market-coverage virtual indexes | 2 |

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

One normalized path may have exactly one owner. Normalization lowercases the
host for comparison, removes source hosts, removes query/fragment presentation
data where safe, collapses duplicate slashes, and applies the target trailing
slash policy.

The frontend must resolve through an explicit route registry or equivalent
cross-collection lookup. Resolver order is not ownership. The current
pages-before-articles-before-hubs fallback must not be used to mask a
collision.

Path changes must reserve the new route atomically and either create or require
a redirect from the former public path. A redirect cannot shadow a current
content owner, virtual index, or another redirect.

The two virtual indexes are frontend routes backed by collection queries and
index configuration. They are not fake Payload page documents and do not
duplicate their child route owners.

## Publication invariants

Before an archetype can publish:

- required route owners have a normalized, globally unique path;
- forbidden-route records have no path, canonical metadata, sitemap entry, or
  public detail link;
- the homepage is the sole owner of `/`;
- a full article has a complete body;
- every content index uses only the listing behavior allowed for that index;
- a conversion page has a valid first-party form and consent configuration;
- a legal cookie page uses the explicit consent-category component, never a
  generic shortcode;
- a public hub or venue has the required structured relationships and complete
  detail presentation;
- a Learning Hub detail has playable managed/external media, required metadata,
  and an explicit access policy;
- internal references resolve to published owners or an approved redirect; and
- every editor-visible setting is supported by frontend behavior.

The importer and Payload publish hooks must apply the same rules. An importer
must not be able to create a document state that the CMS would reject.

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

Every card with an internal link is checked against the route registry. There
must be no published listing card whose only destination is an empty or
forbidden route.

## Access policy is separate from route existence

The current Learning Hub renders 15 public watch paths while applying
permissions to the underlying content. In the target model, route ownership and
access policy are separate fields:

- route ownership decides whether the canonical detail exists;
- access policy decides whether the full media, transcript, or gated action is
  available to the current visitor.

Private WordPress records are not imported as additional public routes merely
to reproduce a legacy permission mechanism.
