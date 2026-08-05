# Trayport website editor guide

## First sign-in

Open `/admin/` and create the first account. Payload makes the first account an
administrator. Administrators can create further administrators and editors;
editors cannot manage roles, delete content, or alter WordPress migration
provenance.

## Content workspace

The dashboard is organised around editorial work rather than Payload's data
model. Use **Start something** for the most common create and upload tasks,
**Recently edited** to resume work, and **Drafts and changes** to find content
that still needs review. The website-management links provide direct routes to
navigation, media, market coverage, and footer content.

Administrators also see a separate restricted workspace for imports, customer
identity records, CMS users, and site settings. Redirects remain in the shared
website workspace because editors may create and update them; permanent
deletion is administrator-only. Server-side access rules remain the final
authority for every request.

## Content areas

- **Pages** compose marketing and index pages from the curated Trayport block
  library.
- **Articles** manage Insights listing metadata, featured order, taxonomy,
  editorial dates, and full article bodies.
- **Banners** manage reusable announcements with bounded presentation,
  scheduling, placement, Page targeting, and lifecycle recipients.
- **Hubs** store market-map data and, when set to `Public page`, a routable
  market-coverage page.
- **Venues** provide the broker, exchange, and clearing-house relationships used
  by hub pages.
- **Media** stores images, videos, documents, captions, focal points, and
  accessibility metadata.
- **Taxonomies** manage article categories, regions, asset classes, and venue
  types.
- **Customer identities** expose non-authenticating TIM reconciliation/status
  records. They do not authenticate CMS editors or store customer credentials.
- **Market data imports** let Administrators validate, preview, and commit
  bounded application-data files; Editors do not edit raw facts.

## Page composition

Pages, full articles, and public hubs use a deliberately small block set:

- Hero
- Content section with controlled column spans and themes
- Heading, rich text, actions, and media
- Feature, entity, statistic, FAQ, checklist, lifecycle, timeline, table, and
  gallery components
- Insights listing
- Market coverage map, venue connectivity, and market-data charts

Editors choose named variants rather than arbitrary CSS, colours, or HTML. This
keeps new pages consistent with the refreshed frontend while retaining enough
controls to reconstruct the proof-of-concept routes.

### Adding a section

Use **Add a content section** at the top of the Content tab for routine page
authoring. Each visual preset inserts the existing `contentSection` structure,
with safe Trayport defaults and editable content; it does not create a second
frontend format or store preset-specific data. The available starting points
cover:

- introductory copy and text with actions;
- text/media and media/text splits;
- feature grids, FAQs, calls to action, and statistics; and
- charts, market coverage, and the Market Matrix where the page type supports
  them.

After insertion, edit the named section, column, and component rows in place.
Row summaries show the useful content and layout shape, so collapsed sections
can be identified without opening every field. Drag handles reorder existing
rows. The standard Payload block selector remains available below the page
sections for uncommon structures and top-level Hero or listing blocks.

### Content first, appearance second

Content fields appear before presentation controls. Section appearance, column
appearance, and advanced layout controls are collapsed until needed. Start with
the preset defaults and open these groups only when the design calls for a
different width, surface, spacing, alignment, or column treatment. Controls
that cannot affect the current configuration are hidden until their parent
option is enabled.

The visual cards and thumbnails are authoring aids only. The preview remains the
source of truth for the public result.

Imported rich text retains semantic H2-H4 headings, ordered and unordered lists,
and nested list structure as native Lexical nodes. Full-article source sections
are wrapped in the same current, bounded Content Section fields used by authored
pages; legacy `theme` and `spacing` switches are not exposed or carried forward.

Venue descriptions are authored page content and always render when present,
even when the same copy is also used as the SEO description. The public site is
currently light-only: an operating-system dark preference does not invert rich
text or enable an unapproved dark theme.

## Preview and publishing

Routable content supports drafts, versions, autosave, scheduled publishing, and
live preview at mobile, tablet, and desktop breakpoints. Use **Preview** before
publishing; publishing revalidates the route and related sitemap/listing data.

## Site-wide controls

- **Navigation** controls the five primary roots, dropdown links, and the three
  shared utility destinations used for Joule, Request a Demo, and Contact Us.
- **Footer** controls link columns, legal links, certification marks, and
  copyright text.
- **Site settings** controls brand assets, default SEO, contact/social details,
  notices, retained HubSpot form identifiers, and bounded CookieYes settings.
- **Redirects** can be maintained by administrators and editors; deletion is
  administrator-only.

## Scheduled banners

Create a Banner when one announcement must appear on every Page or a selected
set of managed Pages. Use a compact announcement for the dismissible notice bar
or a large promotional banner for image, heading, supporting copy, and action.
The public banner is shown inclusively from **Start** through **End**; both
values are stored as exact instants.

Placement controls are intentionally bounded: **First** appears before page
content, **Second** follows its first section, and **Last** follows all page
content. Lower priority numbers appear first when two active banners share a
slot. Preview a target Page before publishing; during active-window acceptance,
also inspect an untargeted Page to confirm that it remains absent.

After saving a Banner, **Preview** opens the homepage for an all-page banner or
the first selected Page for a targeted banner. That authenticated preview shows
only the selected Banner and temporarily ignores its date window, so a future
announcement can be reviewed without making it publicly discoverable. Public
requests and the public REST API cannot read the Banner collection directly.

Up to two CMS users can receive reminders 24 hours before start, at start, 24
hours before end, and at end. Imported WordPress email addresses remain visible
to CMS users as read-only review evidence; choose the matching current CMS users
before relying on notifications. Delivery state is private operational data in
a non-versioned ledger, so restoring a content version does not resend an event
for the same schedule.

## Media and accessibility

Supply useful alternative text for meaningful images and mark decorative assets
explicitly. Imported records identify whether alt text came from WordPress, a
title fallback, or requires editor review. The migration report contains the
initial review queue.

The Media library may also hold PDFs for explicit document workflows. Visual fields
show only the asset types their frontend presentation supports: image fields
accept images, video fields accept videos, and the general Hero/Media
presentations accept images or videos. The same MIME rules are enforced when a
document is saved through the API, so a PDF cannot be stored in a hero,
background, card, gallery, logo, poster, or sharing-image field.

## Data boundary

Payload stores editorial chart configuration, but not the imported monthly
market facts. Each Data Chart must select a managed Asset Class. For publication,
that relationship must resolve to an Asset Class with a stable `marketDataKey`;
that key, rather than an editable number on the chart, drives the query into
`app.market_volume_monthly`. Asset Classes and Hubs may have aliases used only
to resolve controlled import labels.

The editor exposes only implemented choices:

- metric: `Volume` or `Price`;
- series: `Execution type` or `Hub`; and
- display interval: `Month`, `Quarter`, or `Year`.

Execution-type charts must use Volume with Stacked columns and cannot filter Hubs.
Hub charts may use Volume with Columns or Price with a Line. Their optional Included
Hubs and Excluded Hubs relationships are respectively an allow-list and deny-list;
the same Hub cannot appear in both. These controls reference managed imported Hubs,
not free-form market-data keys.

A chart date bound is optional, but each supplied bound must include both year and
quarter. When both bounds are present, the start quarter cannot be later than the
end quarter. The runtime returns at most the most recent 40 matching month, quarter,
or year periods. Changing market facts or that safety cap remains an application-data
operation, not a CMS editing task.

Administrators create a Market Data Import and run validation before commit.
Review malformed/duplicate rows, unresolved Asset Class or Hub identities,
coverage, and preview counts. Commit revalidates and upserts transactionally.
The narrow force option accepts only a documented missing-Hub coverage case; it
does not bypass malformed, ambiguous, or duplicate data.

Preview distinguishes four outcomes. A populated query renders the chart and its
optional “View chart data” table; an empty result says no imported values matched;
an unavailable result reports a temporary data/relationship failure; and an older
unsupported draft is identified explicitly rather than silently rendered as another
chart shape. Publication rejects unsupported combinations.

## Maps and Market Matrix

Use `Global connections` for the simple whole-world Asset Class schematic. Use
`Regional connectivity` for the full Mapbox view with Region and Asset Class
controls, Hubs/routes/points of interest, the Venue/type sidebar, and optional
period summaries. Maintain boundary/center/point data on Regions; location,
country, type, route, and stable market identity on Hubs; display colour/labels
on Asset Classes; and grouping hierarchy on Venue Types. Mapbox tokens/styles
are deployment configuration and never editor fields.

The Market Matrix derives from Venue market connections. Edit a relationship on
the Venue rather than patching a page block. Preview Asset Class, Region, and Hub
filters; collapsible Venue groups; destination links; CSV; and Excel before
publishing.

The specialist components group their fields by task:

- **Content** names the experience and supplies accessible explanatory copy;
- **Data** or **Markets shown** selects managed Regions, Asset Classes, Hubs,
  Venues, and date boundaries;
- **Display**, **Visitor controls**, and **Map appearance** control the
  implemented public experience; and
- **Advanced**, where present, contains bounded technical tuning that most
  editors can leave at its Trayport default.

Options that would create an unsupported frontend combination are filtered or
hidden. Required relationships and publication validation still protect the
saved document, so the editor cannot publish a visually plausible but
unresolvable chart or map.

## Current limits

The Commodities Report, full-site search, and dormant WordPress content types
are excluded. HubSpot embeds and real public form submissions remain a functional
dependency before conversion-page authoring can be enabled; there is deliberately
no form preset until that bounded integration exists. The aggregate cookie notice
is implemented, while the provider-backed CookieYes category and preference
integration remains to be completed. TIM sign-in, protected-document/auto-login
behavior, and the full production content population also remain deferred. A
protected route registry reserves one canonical owner across every routable
collection, managed redirects, and virtual indexes before broad production
authoring.
