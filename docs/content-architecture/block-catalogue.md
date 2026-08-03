# Block catalogue and layout coverage

## Catalogue principles

The target keeps a constrained, typed block library. It preserves content
semantics and useful editor control without reproducing arbitrary WordPress
layout settings or executing generic shortcodes.

There are three levels:

1. top-level page/article blocks;
2. components inside a structured content section; and
3. application or structured-detail components backed by managed
   relationships/data.

“Observed” means present in the approved local WordPress source corpus. A
layout disposition can be complete in the architecture contract while its
target implementation is still planned. The retained
[layout-coverage report](layout-coverage.json) records 453 reachable source
nodes, 2,325 layout occurrences, 40 layout/scope combinations, and zero unknown
layouts for the verified snapshot. It also records all eight reachable taxonomy
types and their dispositions, with zero unknown taxonomies.

## Implemented baseline

### Top-level blocks

| Block | Purpose | Principal source |
| --- | --- | --- |
| `trayportHero` | Page proposition, copy, media/video, actions, appearance | `hero` |
| `contentSection` | Theme, width, spacing, anchor, and controlled responsive columns | `columns`, `single`, and article reading sections |
| `articleListing` | Generated article listing with heading, intro, page size, and filter behavior | Article-list index behavior |

### Section components

| Component | Purpose | Principal source layouts |
| --- | --- | --- |
| `heading` | Eyebrow and controlled H2–H4 heading | `header`, `subheader`, `preheader`, article `index-point` |
| `richText` | Lexical body with controlled text size | `paragraph` |
| `actions` | Managed calls to action | `buttons` |
| `media` | Managed image/video/file or validated external video | `image`, `videos`, article `media` |
| `featureList` | Grid, stacked, or logo feature items | `features`, product-feature semantics |
| `statistics` | Structured value/label/description items | `stats` |
| `faq` | Structured questions and answers | `faqs` |
| `entityList` | Products, people, clients, venues, or general entities | `products`, `people`, `clients` |
| `timeline` | Ordered labelled milestones | `timeline` |
| `dataTable` | Accessible caption, headers, rows, and cells | `table` |
| `gallery` | Ordered managed media and captions | `gallery` |
| `divider` | Semantic line or spacing break | `divider` |
| `marketCoverage` | Editorial market view backed by managed regions/hubs/venues | `connections` |
| `embed` | Validated external embed with poster | compatible legacy video/embed semantics |
| `dataChart` | Editorial chart configuration backed by application PostgreSQL | `charts-new` |

The current contract tests prove that every implemented block has a frontend
renderer and that the current importer emits only configured implemented block
types. Payload publication tests also enforce the archetype-level top-block
rules:

- `page.content-index` may use `articleListing` and must include one to publish;
- other page types, full articles, public hubs, public venues, and learning
  videos are limited to `trayportHero` and `contentSection`;
- article listing metadata, map-only hubs, and relationship-only venues cannot
  own layout blocks; and
- conversion and interactive market-matrix pages remain draft-only until their
  planned blocks exist.

These passing route/block invariants do not prove that the planned production
catalogue is implemented.

## Planned production targets

| Target | Kind | Source | Required production behavior |
| --- | --- | --- | --- |
| `contentSection.columns` | Structure | nested `column` | Normalize column spans and child components without a presentational wrapper block |
| `form` | Section component | `form` | First-party fields, validation, consent, spam controls, submission storage/delivery, and accessible status behavior |
| `checklist` | Section component | `checklist` | Structured accessible list with controlled style |
| `lifecycle` | Section component | `lifecycle` | Ordered lifecycle stages and managed supporting content |
| `marketMatrix` | Section/application component | `market-matrix` | Interactive matrix backed by managed public hub and venue route owners |
| `office` | Section component | `office` | Structured address, contact, and map behavior |
| `marketsMap` | Section/application component | `markets-map` | Interactive regions and routable hubs |
| `regions` | Section component | `regions` | Curated region listing using managed relationships |
| `cookiePreferences` | Consent integration | `[wcc_category_list]` | First-party consent-category view; no generic shortcode execution |

Each planned block is incomplete until its Payload schema, importer mapping,
frontend renderer, accessibility behavior, and tests all exist. The `form`
target must support both page and article sources without reinstating HubSpot.
In particular, the publication guard deliberately prevents conversion and
interactive pages from going live while `form` and `marketMatrix` are absent.

## Approved composed-page observations

The following counts cover the 42 in-scope
`layouts/default-new.blade.php` pages after applying the production decision:
FAQ is included and Commodities Report is excluded.

| Source layout | Occurrences | Target disposition |
| --- | ---: | --- |
| `hero` | 32 | `trayportHero` |
| `columns` | 155 | `contentSection` |
| `single` | 39 | one-column `contentSection` |
| `column` | 374 | `contentSection.columns` structure |
| `header` | 264 | `heading` |
| `subheader` | 56 | `heading` |
| `preheader` | 37 | `heading.eyebrow` or a constrained heading |
| `paragraph` | 183 | `richText` |
| `buttons` | 60 | `actions` |
| `image` | 61 | `media` |
| `videos` | 2 | `media` |
| `features` | 60 | `featureList` |
| `stats` | 2 | `statistics` |
| `faqs` | 12 | `faq` |
| `people` | 2 | `entityList(kind=people)` |
| `products` | 10 | `entityList(kind=products)` |
| `clients` | 8 | `entityList(kind=clients)` |
| `timeline` | 1 | `timeline` |
| `table` | 2 | `dataTable` |
| `gallery` | 5 | `gallery` |
| `divider` | 27 | `divider` |
| `connections` | 12 | `marketCoverage` |
| `charts-new` | 7 | `dataChart` plus application PostgreSQL facts |
| `form` | 8 | planned `form` |
| `checklist` | 2 | planned `checklist` |
| `lifecycle` | 1 | planned `lifecycle` |
| `market-matrix` | 1 | planned `marketMatrix` |
| `office` | 12 | planned `office` |
| `markets-map` | 5 | planned `marketsMap` |
| `regions` | 3 | planned `regions` |
| `icon` | 3 | Omit source wrapper; target component selects decorative icon |

Ten of these 42 pages have no source hero. A hero must therefore be allowed
but not globally required; individual semantic archetypes may impose a stricter
rule.

Compared with the local-navigation snapshot, the production swap from
Commodities to FAQ changes the counts by removing one hero, one form, one
single section, one column, two subheaders, and one columns row, then adding one
FAQ, one image, four columns, and two columns rows. Header and paragraph totals
remain unchanged.

## Special page-template observations

| Source template | Observed layouts/behavior | Target |
| --- | --- | --- |
| Four article-list pages | One `hero` each plus a generated post query | `page.content-index`, hero, constrained listing |
| Learning Hub home | `hero`, `single`, one nested `features`, plus 15 generated video links | Content index plus `learning-videos` query |
| Market matrix | One `columns` with nested `column`, `header`, and `paragraph`, plus generated matrix | Interactive page plus `marketMatrix` |
| Cookie consent | Two `columns` rows; three nested `column`, `header`, and `paragraph` layouts; `[wcc_category_list]` | Legal page plus `cookiePreferences` |
| Two legal article pages | Legacy `sections` body | Legal page using article-style reading sections |

The two legal pages contain these authoritative legacy `sections` layouts:

| Layout | Occurrences |
| --- | ---: |
| `buttons` | 3 |
| `divider` | 5 |
| `header` | 8 |
| `index-point` | 12 |
| `paragraph` | 8 |
| `post-content` | 4 |

`post-content` is converted to constrained rich text/reading-section content;
it is not retained as an executable WordPress template fragment.

## Published article observations

All 90 published post children use authoritative legacy `sections`.

| Source layout | News (31) | Event (20) | Insights (39) | Total |
| --- | ---: | ---: | ---: | ---: |
| `paragraph` | 53 | 39 | 195 | 287 |
| `divider` | 22 | 32 | 138 | 192 |
| `index-point` | 9 | 24 | 126 | 159 |
| `buttons` | 4 | 3 | 47 | 54 |
| `media` | 15 | 18 | 45 | 78 |
| `header` | 1 | 3 | 30 | 34 |
| `form` | 0 | 16 | 0 | 16 |
| `table` | 0 | 0 | 1 | 1 |

Featured records observed: 1 News, 3 Event, and 4 Insights. The importer
preserves featured state/order as child metadata; it does not copy featured
cards into index-page bodies.

Article top-level layouts normalize to reading-width `contentSection` blocks:

- `paragraph` → `richText`;
- `media` → `media`;
- `divider` → `divider`;
- `buttons` → `actions`;
- `index-point` → anchored `heading`;
- `header` → `heading`;
- `table` → `dataTable`; and
- `form` → planned first-party `form`.

## Structured record observations

These are not flexible layouts, but they are part of content parity:

### Hubs

- 72 records have `class`, `code`, `location`, `marker_locations`, and `image`.
- 60 have latitude/longitude data.
- 53 use `connected_hub`.
- 5 use `connected_hubs`.

Relationships must be normalized rather than preserving two singular/plural
source shapes.

### Venues

All 66 published records have connections, contacts, logo, display name,
website, and type data. Five have extended `about_content` /
`with_trayport_content`. The target public-detail model must preserve the
meaning of those fields without reproducing template-specific switches.

### Learning videos

All 15 published records provide name, description, short description, video,
caption, image, order, permissions, and product/category/tag associations.
These map to the dedicated `learning-videos` model and its explicit access
policy.

### Lifecycle and component dependencies

Twelve published lifecycle records support the observed lifecycle component.
They are dependency content rather than additional public routes. The same rule
applies to referenced client, people, product, office, and reusable-video
records unless a separate route decision is approved.

### Taxonomy dispositions

| Source taxonomy | Target disposition |
| --- | --- |
| `category` | Managed `article-categories` |
| `lh-category` | Managed `learning-video-categories` related from `learning-videos` for the live Learning Hub filter |
| `asset-class` | Managed `asset-classes` |
| `venue-type` | Managed `venue-types` |
| `region` | Managed `regions` |
| `post_tag` | Omit; not used by the agreed article discovery experience |
| `product-feature` | Consolidate into typed `featureList` content |
| `software-category` | Omit; reachable only through a dependency-only product and unused by target navigation, filtering, rendering, or routing |

## Authoritative-field rule

Only the body source declared for an archetype is traversed:

- `sections_new` for composed/current page templates;
- `sections` for legal article pages and published posts; and
- structured ACF fields for hubs, venues, learning videos, and reusable
  entities.

Stale `sections`, `page_content`, HTML caches, and template output are not
merged into the target. This prevents duplicate copy and layouts from entering
the new CMS.

## Coverage gates

The source-disposition part of coverage passes: every observed layout/scope and
reachable taxonomy type has an explicit contract disposition, and the inventory
reports zero unknown layouts and taxonomies. That does not mean every
disposition has an implemented target.

Production block implementation passes only when:

- every observed source layout and supported shortcode semantic has an explicit
  map, consolidation, structural transform, split, or omission;
- every non-omitted target has a Payload schema, transformer, renderer, and
  behavioral tests;
- an unknown renderable source layout stops the transform with source document
  and field-path evidence;
- every imported block validates against the same allowlist enforced at
  publication;
- no source row is silently discarded;
- editor-visible controls have tested frontend effects; and
- visual/content review covers representative instances and every exceptional
  transform.

The contract and retained inventory pass disposition totality for the observed
source, and the 17 runtime archetypes pass their current allowlist/publication
invariants. The planned production targets still block
`production-block-catalogue-implemented`; runtime rejection of unsupported
publication is a safe invariant, not an implementation of the missing block.

The production inventory command also emits a deterministic 296-route target
plan:

```bash
make content-inventory
```

That plan records where these block transforms will be needed, but it is
planning evidence only. The current imported/rendered acceptance slice remains
six routes, and the other production bodies have not been transformed or
content-remediated.
