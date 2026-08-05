# Editorial workflows

## Workflow model

Payload replaces the useful publishing capabilities of WordPress without
copying its unused admin architecture. The two CMS roles are Administrator and
Editor.

Editors can create, update, preview, draft, publish, schedule, and inspect
versions for in-scope content. Administrators can also delete content and
manage accounts, roles, and migration controls. Migration provenance is
read-only to both normal editing workflows.

Public reads return published versions only.

## Create or update a page

1. Choose the semantic page type: homepage, standard, product, landing, legal,
   conversion, interactive, or content index.
2. Enter the title, optional summary/navigation label, and canonical path.
3. Compose with only the blocks allowed for that archetype.
4. Add SEO title/description/image and verify indexing settings.
5. Preview at mobile, tablet, and desktop sizes.
6. Save a draft, schedule it, or publish it.

Publication validates:

- the page type’s required blocks and fields;
- global path ownership;
- learning/video media where applicable; and
- the singleton/root rule for the homepage.

Interactive Market Matrix pages publish with exactly one managed matrix block.
Conversion pages can be composed and previewed, but publication remains guarded
while the bounded HubSpot component is an inert local mount without approved
provider and consent behavior. CookieYes behavior and complete
managed-link validation remain production work under separate gates.

Changing a published path keeps the old route live and reserves the new draft
path. Publishing requires the editor to confirm the redirect; the new content
claim and old-path redirect are then written in the same transaction.

## Create or update an article

1. Choose News, Event, or Insights classification.
2. Enter listing metadata: excerpt, hero image, editorial date, category,
   featured state/order, byline/location where relevant.
3. Compose the complete article body.
4. Add related articles/hubs and SEO.
5. Preview both the detail page and its listing-card presentation.
6. Publish or schedule.

An internal published article must use `contentMode=full` and own a non-empty
body. A listing-metadata-only record stays non-routable unless it has an
explicit external destination or redirect. Removing the body from a linked
published article must fail validation or unpublish the destination.

Index pages query article metadata automatically. Editors do not maintain
duplicate card content on each index.

Event Articles use the canonical `/event/<slug>/` namespace. Editors manage
structured start/end dates, venue/location, coordinates, and the retained form
identity alongside the normal Article body. The five imported
`/events/<slug>/` paths are aliases, not additional documents. Legacy Event
records may opt into a finished notice and post-end form suppression; those
lifecycle flags are not applied globally to ordinary Event posts.

## Manage People

Editors manage each public Person once in the versioned `people` collection:

- canonical profile path and team;
- role and display order;
- portrait, biography, and optional Careers quote;
- optional external profile; and
- SEO, preview, publication, and scheduling.

The source contains valid sparse profiles, so portrait, role, and biography are
not invented merely to fill a CMS field. A `peopleList` component either keeps
an explicit ordered set of managed People relationships or selects a managed
team. Editing a profile therefore updates its detail and every team-backed list
without copying prose into Pages.

## Manage market coverage

### Hub

Editors choose `page` or `map-only`.

- A public-page hub requires a unique path, complete detail content, SEO, map
  configuration, classifications, and validated relationships.
- A map-only hub can supply marker and relationship data, but cannot have a
  public path or appear as a detail link.

### Venue

Editors choose `page` or `relationship-only` using `contentMode`.

- A public-detail venue requires a unique path, detail presentation, SEO,
  classifications, and connectivity. Publication requires managed description
  or layout content.
- A relationship-only venue is available to hub components but cannot own a
  detail route or layout.

### Indexes and interactive components

Editors configure index eyebrow, title, introduction, and SEO in the versioned
`route-indexes` global. Those groups back the system-owned `/venue/` and
`/market-coverage/` claims; they are not editable page documents. Child cards
come from published `page`-mode venues or hubs. A map, matrix, or index must
never link a relationship-only record.

Market chart presentation is editable in Payload; raw monthly facts are maintained
through the controlled application-data import. Editors select a managed Asset Class,
Volume or Price, an Execution type or Hub series dimension, and Month, Quarter, or
Year grouping. Execution type is limited to stacked Volume columns and cannot carry
Hub filters. Hub series are limited to Volume columns or Price lines; their optional
Included Hubs and Excluded Hubs relationships must not overlap.

Optional date bounds are complete year/quarter pairs and cannot run backwards. The
runtime caps output at 40 matching periods. Preview identifies successful-but-empty,
temporarily unavailable, and retained unsupported configurations separately; publication
blocks unsupported combinations rather than relying on a renderer fallback. WordPress
`charts-new` values are mapped into these same fields during migration, including managed
Hub relationships, so imported and newly authored charts share one contract.

Editors maintain maps through the same managed resources rather than editing
frontend code. Regions own bounded boundaries, centers, and points of interest;
Hubs own coordinates, classification, countries, stable market-data identity,
and optional explicit routes; Asset Classes own labels and colours; Venue Types
own their grouping hierarchy. A global connection block uses the simple
schematic, while a regional block enables Mapbox region/asset/Hub/route
interaction and the corresponding accessible list. Provider tokens and styles
are deployment settings, not editor fields.

The Market Matrix reads Venue market connections. Editors correct a connection
once on the Venue and preview its effect in filters, grouped rows, links, CSV,
and Excel. Duplicate Venue/Hub connections are rejected or normalized at this
boundary rather than hidden by the presentation.

## Manage Learning Hub content

The implemented `learning-videos` collection lets editors manage:

- title and summary;
- canonical watch path;
- video/file or validated external source;
- managed `learning-video-categories`;
- `public`, `authenticated`, or `subscriber` access mode;
- supporting content and SEO; and
- draft, preview, publication, and scheduling.

Publication currently requires `public` access mode, a reserved path, and
managed or external video media. Editors can prepare and preview
`authenticated` or `subscriber` records as drafts, but cannot publish them.
Real identity/subscription authorization and protected asset delivery remain
production work.

Poster, caption/transcript, full description, ordering, and complete
product/tag relationships are still production-parity requirements. All 15
source details and their 11 managed Learning Hub categories still need the full
production import and review.

## Manage navigation, footer, and settings

### Navigation

Editors can:

- order the five primary roots;
- keep a root as an intentional non-linking dropdown button;
- manage one level of child links, descriptions, groups, and feature media;
- manage shared utility links and calls to action; and
- choose managed content references for internal destinations.

Preview/validation reports unpublished, forbidden, missing, or duplicate
destinations. The legacy dropdown-root `for_page` value is not presented as an
imported link when `menu_block` exists.

### Footer

Editors manage ordered columns, legal links, certification marks, copyright,
and optional introductory copy. The imported footer must point to the current
Careers route, not private page `2207`.

### Site settings

Editors manage brand assets, default SEO, contact information, social links,
notices, retained HubSpot form identifiers, and bounded CookieYes settings.
Social destinations are not hard-coded; CookieYes remains the consent-category
authority.

Globals support draft, version, preview where meaningful, scheduling, and
revalidation in the same way as documents.

## Manage links and redirects

For an internal destination, choose a managed content reference. Use a custom
URL only for an external destination or a deliberate protocol such as `mailto:`
or `tel:`. Choose a media/file reference for downloads.

The 27-root incremental import applies a reversible bridge: only accepted roots
and the two virtual indexes remain root-relative in Navigation/Footer. Other
same-site destinations are rendered as canonical HTTPS links to the live site,
preventing Next.js prefetch from requesting routes this build does not own. The
current acceptance report requires exactly 30 unique live fallback paths, including the five
clickable Company, Products, Markets, Regions, and Resources section roots.
When a route is migrated, add it to the immutable accepted scope, pass route and
runtime acceptance, then change that one destination back to its internal path.

`/request-a-demo/` is the bounded exception for this milestone. Payload owns it
as a temporary `302` redirect to `/contact/`; the source HubSpot form, dead form
prompt, and unused hero media are not imported. Replace the redirect atomically
with a publishable `page.conversion` only after the approved HubSpot embed exists,
then remove this exception and its redirect-specific assertions.

The shared route registry currently validates path ownership and prevents a
redirect source from shadowing content, virtual routes, or another redirect.
The production editor experience must additionally validate:

- source-host absolute URLs that should be internal references;
- broken relative/scheme-less URLs;
- draft, private, forbidden-route, missing, or excluded targets;
- unsafe placeholder protocols;
- invalid anchors;
- redirect chains/loops; and
- paths claimed by another content owner.

Redirect tasks:

1. Enter or receive the normalized old path.
2. Choose a managed current destination or validated external URL.
3. Validate that the source is not an active route.
4. Publish the rule and verify one-hop behavior.

For a content path change, editors use the document’s confirmation control
instead of creating the redirect separately. The route registry swaps claims
and creates the old-path redirect atomically. For scheduled publication, check
the confirmation before scheduling; Payload retains approval only for that
exact old/new path pair. Changing the draft path again requires fresh approval.

The imported redirect review must resolve the duplicate `/on-demand/` source,
the missing `/third-party/` target, the private `/careers/` target, stale
enterprise-security path, and the Summer of Sport canonical-route question.

## Manage media and accessibility

Editors upload or select a managed asset, then:

- provide a meaningful alternative description for informative images;
- explicitly mark purely decorative images;
- review any migration-generated title fallback;
- supply caption/attribution where needed;
- choose focal point and verify responsive crops;
- attach poster/caption/transcript for video; and
- verify that documents open as files rather than WordPress attachment pages.

Publishing fails for a required missing asset. Accessibility fallbacks and
unavailable optional media remain visible in the content review queue until
accepted, replaced, or removed.

## HubSpot forms and CookieYes consent

Active legacy form identifiers are retained through one bounded
`hubspotForm` component rather than a generic embed or a replacement form
builder. Editors can select the validated identifier and manage its title. The
current local mount is intentionally inert: it makes no HubSpot request and
cannot submit data. The production integration must own loading, blocked,
validation/error, consent, success, and accessibility states. Real submissions
remain disabled until an approved test destination and consent flow are
available. Conversion pages stay draft-only until that boundary exists.

CookieYes remains the consent provider. The Next.js integration must clone the
live categories and user-visible behavior, preserve policy links, and expose a
working preference control. Editors do not create arbitrary consent categories
or scripts in rich text.

## Customer identity and TIM

Administrators may inspect non-authenticating customer-identity reconciliation
records; Editors may read them only where their role permits. Neither role can
enter TIM credentials, tokens, sessions, passwords, cookies, auto-login secrets,
or protected-document credentials into Payload.

TIM sign-in and logout, status/entitlement synchronization, protected
documentation links, and the current auto-login outcome are required for launch
but deferred from the local slice. Previewing a gated Learning Hub record is not
evidence that this customer-authentication workflow exists.

## Preview, publishing, and rollback

Preview uses the draft version and the real target renderer at configured
mobile, tablet, and desktop breakpoints. The preview endpoint requires the
configured preview secret plus an authenticated Administrator or Editor
session. Only authenticated draft mode may resolve reserved route claims.
Unauthenticated visitors continue to resolve published claims only.

Publishing:

- runs archetype and route validation;
- checks the implemented content/media invariants;
- writes the published version;
- triggers route, listing, sitemap, and global revalidation as applicable; and
- records a version that can be restored.

A restored version is revalidated under current rules; rollback cannot
reintroduce a conflicting path or unresolved target.

The public root/catch-all resolver queries the route registry before loading a
document, redirect, or virtual index. The content sitemap likewise selects only
published `content` and `virtual` claims, excluding redirect sources and
non-routable structured records, then resolves each owner so stale claims and
records marked `noIndex` are omitted.

## Migration and review workflow

The production content import follows a repeatable pipeline:

1. **Preflight:** prove the expected WordPress/ACF versions, database, uploads,
   Payload database, and object storage are available.
2. **Inventory:** discover live ACF navigation/footer routes, Page targeting and
   internal CTAs from every published banner, explicit inclusions, virtual
   indexes, recursive dependencies, terminal content links, listing children,
   and redirects.
3. **Scope validation:** prove the 317-route formula, FAQ and published-banner
   EEX News inclusion, Commodities
   exclusion, known archetypes, and unique route ownership.
4. **Extract:** read through the local WordPress runtime so ACF relationships,
   repeaters, clones, and option fields are resolved without mutating WordPress.
5. **Recover reviewed media (optional):** before transformation, fetch only explicitly approved
   unavailable image attachment IDs from one audited HTTPS origin. Require exact uploads-relative
   paths, recorded MIME/dimensions, a bounded response, and hash-pinned run evidence. Never use this
   stage to substitute or generate an asset.
6. **Transform:** read only the authoritative body/structured fields, map typed
   content, normalize links, and fail on unknown renderable layouts.
7. **Load:** upsert by stable source identity, import media, resolve
   relationships in a later pass, and load market facts transactionally into
   application PostgreSQL.
8. **Validate:** check route/document counts, complete bodies, relationships,
   media availability, links/redirects, schema validity, and target rendering.
9. **Rerun:** prove equivalent source input does not create duplicates or
   unintended changes.
10. **Review:** clear or explicitly disposition missing media, accessibility
    fallbacks, stale links, exclusions, SEO differences, forms, gated video, and
    interactive behavior.

Run stages 2 and 3 with `make content-inventory` after the WordPress source
container is available. This inventory command validates the source site
identity, but it does not run stage 1 or prove the uploads, Payload database,
and object-storage preflight checks; run `make import-preflight` before the
extract/load pipeline. The inventory command also generates
`production-target-plan.json`, its NDJSON representation,
`target-plan-verification.json`, and `target-plan-summary.json` beneath
`migration/work/inventory/<run-id>/`. Generated inventory and migration evidence
belongs under ignored run output except for the deliberately retained sanitized
[summary](inventory-summary.json), [verification](verification.json),
[layout coverage](layout-coverage.json), and [route manifest](route-manifest.csv).
Inventory run IDs are immutable and cannot be reused; `latest-run.txt` advances
only after both inventory and target-plan verification pass. Editors do not
maintain those artifacts.

The target plan is deterministic planning evidence: it accounts for 317 source
routes, comprising 315 Payload documents and two virtual indexes. Of those
documents, 71 are marked pilot-ready and 244 remain plan-only. The accepted
route-owner boundary is 70 rendered content routes, the temporary Request A
Demo redirect, and the two virtual indexes.

## Launch validation

Editorial launch approval requires:

- all 317 source routes accounted for (now verified) and rendered by their
  assigned target owner (not yet complete);
- no empty listing-linked detail;
- no unknown layout or silently dropped source content;
- no broken internal navigation/footer/content link;
- redirect cases resolved without chains, loops, or shadowed routes;
- required media present and review decisions recorded;
- SEO/canonical/sitemap output verified;
- forms, consent, charts, maps, matrices, and gated video behavior verified;
- TIM sign-in/logout, protected documentation links, and auto-login behavior verified;
- role restrictions proven through the admin UI and API; and
- a clean, idempotent production-shaped import with retained validation
  evidence.

These are production gates, not conditions for calling the architecture design
milestone complete. Cross-collection uniqueness and the 19 content-route runtime archetype
invariants now pass; production readiness remains blocked by complete article
bodies, complete listing-linked route ownership, deferred HubSpot/CookieYes
integrations, managed links, editor-control effects, and full editor-role
enforcement.
