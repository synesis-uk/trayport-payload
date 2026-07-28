# Proof-of-concept editor guide

## First sign-in

Open `/admin/` and create the first account. Payload makes the first account an
administrator. Administrators can create further administrators and editors;
editors cannot manage roles, delete content, or alter WordPress migration
provenance.

## Content areas

- **Pages** compose marketing and index pages from the curated Trayport block
  library.
- **Articles** manage Insights listing metadata, featured order, taxonomy,
  editorial dates, and full article bodies.
- **Hubs** store market-map data and, when set to `Public page`, a routable
  market-coverage page.
- **Venues** provide the broker, exchange, and clearing-house relationships used
  by hub pages.
- **Media** stores images, videos, documents, captions, focal points, and
  accessibility metadata.
- **Taxonomies** manage article categories, regions, asset classes, and venue
  types.

## Page composition

Pages, full articles, and public hubs use a deliberately small block set:

- Hero
- Content section with controlled column spans and themes
- Heading, rich text, actions, and media
- Feature, entity, statistic, FAQ, timeline, table, and gallery components
- Insights listing
- Market coverage map, venue connectivity, and market-data charts

Editors choose named variants rather than arbitrary CSS, colours, or HTML. This
keeps new pages consistent with the refreshed frontend while retaining enough
controls to reconstruct the proof-of-concept routes.

## Preview and publishing

Routable content supports drafts, versions, autosave, scheduled publishing, and
live preview at mobile, tablet, and desktop breakpoints. Use **Preview** before
publishing; publishing revalidates the route and related sitemap/listing data.

## Site-wide controls

- **Navigation** controls the five primary roots, dropdown links, utility links,
  and primary action.
- **Footer** controls link columns, legal links, certification marks, and
  copyright text.
- **Site settings** controls brand assets, default SEO, contact/social details,
  notices, and the cookie notice.
- **Redirects** can be maintained by administrators and editors; deletion is
  administrator-only.

## Media and accessibility

Supply useful alternative text for meaningful images and mark decorative assets
explicitly. Imported records identify whether alt text came from WordPress, a
title fallback, or requires editor review. The migration report contains the
initial review queue.

## Data boundary

Payload stores editorial chart configuration, but not the imported monthly
market facts. Those facts live in `app.market_volume_monthly` and are read by
the frontend chart component. Changing market facts is an application-data
operation, not a CMS editing task.

## Proof-of-concept limits

HubSpot, public forms, Commodities Report, public-user accounts, full-site
search, and dormant WordPress content types are not included. Paths are unique
inside each routable content type; cross-type route reservation is a follow-on
hardening item before broad production authoring.
