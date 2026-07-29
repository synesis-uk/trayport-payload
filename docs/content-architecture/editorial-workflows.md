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
- internal links and media;
- first-party form behavior for a conversion page;
- consent behavior for a cookie/legal page;
- managed relationships for an interactive page; and
- the singleton/root rule for the homepage.

Changing a published path must reserve the new path and create or require an
approved redirect from the old path.

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

## Manage market coverage

### Hub

Editors choose `page` or `map-only`.

- A public-page hub requires a unique path, complete detail content, SEO, map
  configuration, classifications, and validated relationships.
- A map-only hub can supply marker and relationship data, but cannot have a
  public path or appear as a detail link.

### Venue

Editors choose `page` or `relationship-only`.

- A public-detail venue requires a unique path, detail presentation, SEO,
  contact/about data as applicable, classifications, and connectivity.
- A relationship-only venue is available to hub components but cannot own a
  detail route.

### Indexes and interactive components

Editors configure index headings, summaries, SEO, filters/order, and map/matrix
presentation through collection-scoped settings. Child cards come from
published public-detail records. A map, matrix, or index must never link a
relationship-only record.

Market chart presentation is editable in Payload. Raw monthly facts are not;
they are maintained through the application-data import.

## Manage Learning Hub content

For each Learning Hub video, editors manage:

- title and short/full description;
- canonical watch path;
- video/file or validated external source;
- poster, caption/transcript, and order;
- product/category/tag associations used by the live experience;
- access policy;
- supporting content and SEO; and
- draft, preview, publication, and scheduling.

Preview must show both an allowed and restricted visitor state. The access
policy governs protected content/actions; it does not accidentally create an
empty or missing public route.

The Learning Hub index is generated from published video records.

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
notices, and consent settings. Social destinations and cookie categories are
not hard-coded in the target frontend.

Globals support draft, version, preview where meaningful, scheduling, and
revalidation in the same way as documents.

## Manage links and redirects

For an internal destination, choose a managed content reference. Use a custom
URL only for an external destination or a deliberate protocol such as `mailto:`
or `tel:`. Choose a media/file reference for downloads.

The editor sees validation for:

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
3. Select permanent or temporary status.
4. Validate that the source is not an active route and the destination resolves.
5. Publish the rule and verify one-hop behavior.

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

## First-party forms

Conversion and Event content can use a typed first-party form. Editors configure
approved fields, labels, required state, consent copy, success behavior, and
submission routing. The platform supplies server validation, spam protection,
rate limiting, safe storage/delivery, error states, and audit behavior.

HubSpot fields, IDs, and admin screens are not migrated. Arbitrary embeds are
not a substitute for the approved form behavior.

## Preview, publishing, and rollback

Preview uses the draft version and the real target renderer at configured
mobile, tablet, and desktop breakpoints. It includes representative listing,
navigation, access-policy, form, and interactive states.

Publishing:

- runs archetype and route validation;
- checks managed links/relationships;
- writes the published version;
- triggers route, listing, sitemap, and global revalidation as applicable; and
- records a version that can be restored.

A restored version is revalidated under current rules; rollback cannot
reintroduce a conflicting path or unresolved target.

## Migration and review workflow

The production content import follows a repeatable pipeline:

1. **Preflight:** prove the expected WordPress/ACF versions, database, uploads,
   Payload database, and object storage are available.
2. **Inventory:** discover live ACF navigation/footer routes, explicit
   inclusions, virtual indexes, recursive internal links, listing children,
   dependencies, and redirects.
3. **Scope validation:** prove the 296-route formula, FAQ inclusion, Commodities
   exclusion, known archetypes, and unique route ownership.
4. **Extract:** read through the local WordPress runtime so ACF relationships,
   repeaters, clones, and option fields are resolved without mutating WordPress.
5. **Transform:** read only the authoritative body/structured fields, map typed
   content, normalize links, and fail on unknown renderable layouts.
6. **Load:** upsert by stable source identity, import media, resolve
   relationships in a later pass, and load market facts transactionally into
   application PostgreSQL.
7. **Validate:** check route/document counts, complete bodies, relationships,
   media availability, links/redirects, schema validity, and target rendering.
8. **Rerun:** prove equivalent source input does not create duplicates or
   unintended changes.
9. **Review:** clear or explicitly disposition missing media, accessibility
   fallbacks, stale links, exclusions, SEO differences, forms, gated video, and
   interactive behavior.

Run the first three stages with `make content-inventory`. Generated inventory
and migration evidence belongs under ignored run output except for the
deliberately retained sanitized [summary](inventory-summary.json),
[verification](verification.json), [layout coverage](layout-coverage.json), and
[route manifest](route-manifest.csv). Editors do not maintain those artifacts.

## Launch validation

Editorial launch approval requires:

- all 296 source routes accounted for (now verified) and rendered by their
  assigned target owner (not yet complete);
- no empty listing-linked detail;
- no unknown layout or silently dropped source content;
- no broken internal navigation/footer/content link;
- redirect cases resolved without chains, loops, or shadowed routes;
- required media present and review decisions recorded;
- SEO/canonical/sitemap output verified;
- forms, consent, charts, maps, matrices, and gated video behavior verified;
- role restrictions proven through the admin UI and API; and
- a clean, idempotent production-shaped import with retained validation
  evidence.

These are production gates, not conditions for calling the architecture design
milestone complete.
