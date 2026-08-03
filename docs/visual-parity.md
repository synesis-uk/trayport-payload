# Visual parity: decisions, acceptance, and rollback

## Purpose and boundary

This document is the change ledger and acceptance contract for the first reference-led
visual parity slice. The local WordPress site at `http://trayport.local` is the source of
truth and is equivalent to the live production presentation for this work. The target is
the local Next.js and Payload application.

Parity does not mean reproducing WordPress theme internals. It means reproducing the
visible information hierarchy, content, brand assets, typography, material geometry,
responsive behavior, and meaningful interactions with a smaller typed implementation.
Browser and font rasterization may differ by platform. Bounded Payload controls may
recreate approved compositions; editors do not receive arbitrary CSS, layout, or script
controls.

The following remain architectural constraints:

- content is deterministically imported from the local WordPress database rather than
  manually recreated in Payload;
- market-volume facts live in application PostgreSQL, with only typed chart
  presentation in Payload;
- exact fonts, icons, and brand assets are used where the repository has an approved
  source asset; and
- every intentional improvement or temporary divergence has an explicit rollback hook
  below.

## Golden routes

| Route | Archetype | Material acceptance points |
| --- | --- | --- |
| `/` | Home | Header and mega navigation; image hero and four statistics; section rhythm; market-volume charts; regional connection map; footer |
| `/products/joule/` | Product | Image hero; proposition and feature hierarchy; section surfaces; FAQs; final action |
| `/resources/insights/` | Editorial index | Hero; four featured items; category/year/search controls; compact article result rows |
| `/market-coverage/german-power/` | Hub detail | Pale-blue page surround; white content card; cover and asset-class treatment; structured market/venue grids |
| `/venue/eex/` | Venue detail | White detail card; venue type/logo identity row; market pills; contact action |

Reference and candidate captures use the same browser, viewport, device scale, content,
and scroll state. The current capture convention is:

```text
output/playwright/reference/<route>-desktop.png
output/playwright/reference/<route>-mobile.png
output/playwright/current/<route>-desktop.png
output/playwright/current/<route>-mobile.png
```

These screenshots are working evidence, not content or permanent build artifacts.

## Decision and reversibility ledger

`Exact` reproduces the reference. `Improvement` deliberately changes it at low cost.
`Bridge` is temporary and cannot be silently reclassified as accepted final parity.

| ID | Class | Decision and reason | Control or implementation hook | Rollback |
| --- | --- | --- | --- | --- |
| VP-001 | Exact | Self-host the Inter variable font to match the reference and avoid a third-party font request. | `InterVariable.woff2` and the local font declaration in the frontend layout | Remove the local declaration and restore the prior font token in one layout/CSS change. |
| VP-002 | Exact | Preserve the reference desktop header hierarchy, full-width dropdown behavior, search affordance, full-screen mobile navigation, and footer structure. | Payload navigation/footer globals plus the shell components and `parity-shell.css` | Revert the shell component/style layer; content globals are unchanged. |
| VP-003 | Exact | Respect the active WordPress hero background selector. Retained video/image fields must not override the selected image, video, or no-background state. | `mapPageLayout` hero transform; covered by migration integration tests | Revert only the hero media selector mapping and retransplant the accepted run. |
| VP-004 | Exact | Import the reusable Home/Joule hero statistics as four typed value-label pairs. Editors can change content, not their geometry. | `trayportHero.statistics`, reusable transform, and hero renderer | Clear the array or revert the transform/renderer; source reusable data remains intact. |
| VP-005 | Exact | Reproduce the WordPress quarterly stacked-volume charts with the pinned Highcharts `12.1.2` runtime, reference colors, range, axes, legend, typography, and height. | `dataChart` controls and `MarketVolumeChart.client.tsx`; facts queried from application PostgreSQL | The chart block can fall back to its table, or the client renderer/version can be reverted without changing facts. |
| VP-006 | Improvement | Keep **View chart data** as a native disclosure so values remain available without interpreting the graphic. | Bounded `dataChart.showDataTable` switch, defaulted on for imported charts | Set the switch false or remove the disclosure; chart data and chart rendering are unchanged. |
| VP-007 | Improvement | Load Highcharts only when a chart block is rendered. Do not add it to the global shell bundle. | Client-side dynamic import inside the chart component | Replace the dynamic import with the prior renderer; the Payload model and PostgreSQL boundary are unchanged. |
| VP-008 | Bridge | Use the managed legacy `map-all` image with an accessible, bounded SVG connection overlay for the Home regional map. This retains the visual role without loading a general map runtime. | `marketCoverage.backgroundMedia` and typed line/marker controls | Disable the overlay/background fields or revert the market-coverage renderer and reimport. |
| VP-009 | Exact | Render German Power and EEX from typed hub/venue relationships instead of generic rich text. | Hub and venue content views; existing hub/venue collections | Revert the specialized view selection; relationship data remains available. |
| VP-010 | Improvement | Scope the first search affordance to the migrated Insights library and say so in the dialog. This avoids implying unsupported whole-site coverage. | Header search form submits `q` to `/resources/insights/`; listing owns the filter | Remove the header search control, or change its destination when a full managed index exists. |
| VP-011 | Improvement | Use the small imported icon set and inline social marks instead of shipping the legacy global icon kit. | Shell components and the pinned icon dependency | Restore an approved, licensed icon subset behind the same component APIs. |
| VP-012 | Exact | Preserve only selected wrapper, inset, background-media, opacity, width, and spacing states from WordPress. Retained inactive values do not become active styling. | Bounded `contentSection` fields and importer mapping | Reset the bounded fields to defaults or revert the transform; body content and source provenance remain intact. |
| VP-013 | Improvement | Retain accessible foreground contrast, programmatic filter names, focus containment, and chart-region semantics where the reference is visually or structurally weaker. These changes do not add editorial freedom. | Parity foreground rules, native form/ARIA semantics, and the existing automated accessibility suite | Revert the isolated semantics/styles while leaving imported content and component geometry unchanged. |

### Deferred map parity

VP-008 is a milestone bridge, not final acceptance of approximate map topology. The
reference German Power and EEX golden routes do not render the general interactive map,
so adding Mapbox to those detail pages would be incorrect. The Home route does include a
regional connection graphic and must pass visual review with the managed background.

Exact full-map geometry, topology, hover/selection behavior, and any Mapbox interaction
are deferred until a reachable route that requires them is brought into scope. That work
needs a typed topology/connection data contract, approved map assets/style, keyboard and
screen-reader behavior, and performance measurement. If Home visual review finds the
bridge materially different, Home remains unaccepted until the bridge is corrected or
the full-map slice is pulled forward.

### Highcharts deployment gate

Highcharts is pinned for deterministic visual behavior, but the application must not be
deployed with it until the project owner has verified that this site and deployment model
are covered by the appropriate Highcharts commercial licence and the evidence is recorded
in the release checklist. The accessible data table remains the reversible non-chart
fallback if that gate cannot be cleared.

## Performance decisions and checks

- Inter is self-hosted with `font-display: swap`; the shell does not wait on a remote font
  host.
- Highcharts is dynamically imported only on pages that render `dataChart`.
- The Home connection graphic uses managed media and SVG rather than hydrating a general
  map SDK.
- Static content sections, hub details, and venue details remain server-rendered; client
  code is reserved for navigation, search/filter interactions, and charts.
- Hero/background media must retain intrinsic dimensions and responsive image sizing to
  avoid layout shift and oversized mobile downloads.
- Exact-parity changes must not introduce polling, duplicate global libraries, or
  animation required for comprehension.

Before acceptance, confirm from a production build that a route without charts does not
download Highcharts, record the before/after browser network and Lighthouse/Web Vitals
evidence, and investigate any material regression rather than masking it with a new
budget.

Current slice evidence (2026-08-04): the production build served optimized Payload PNG
and JPEG responses with non-zero bodies, and `/venue/eex/` did not request either of the
two chunks containing Highcharts while `/` did. The desktop crash left one zero-byte
entry under `.next/dev/cache/images`; Next.js `16.2.6` then rejected that entry while
replaying its development disk-LRU and logged later valid image requests as cache-write
failures. The single key was quarantined and the production `.next/cache/images` path was
clean. The same framework initializer can affect a persisted production cache, so track
[Next.js issue 93757](https://github.com/vercel/next.js/issues/93757) and its
[proposed fix](https://github.com/vercel/next.js/pull/93840) during dependency upgrades.
Do not globally mark images `unoptimized` to hide this failure, because that would discard
the verified production optimization path.

## Accessibility decisions and checks

- Navigation and search must be operable by keyboard, close with Escape, expose expanded
  state, and return focus sensibly. The final search dialog review must include focus
  containment and restoration.
- Visible focus indicators and contrast are retained even when the reference presentation
  is visually subtler.
- Chart animation is disabled. Charts expose an accessible description, and imported
  charts default to the semantic **View chart data** table.
- The connection graphic has a programmatic title and description; its photographic base
  is decorative to assistive technology.
- Ornamental motion is disabled under `prefers-reduced-motion`; content order and meaning
  never depend on motion.
- Desktop and mobile golden routes must complete the axe smoke suite with no critical or
  serious violations, followed by a manual keyboard pass for menus, search, filters,
  disclosures, and links.

## Acceptance procedure

1. Load the same accepted WordPress extraction through the current transform and importer.
2. Confirm all five golden routes use the expected managed content, media, taxonomy, and
   market-data records. Do not repair parity by hand-editing imported content.
3. Capture reference and candidate desktop/mobile screenshots at identical dimensions.
4. Compare header/footer geometry, typography, assets, responsive ordering, whitespace,
   colors, charts, maps, and route-specific structure. Record each material delta against
   a ledger ID or add a new reversible decision before changing it.
5. Exercise desktop dropdowns, the mobile menu, search-to-Insights filtering, chart data
   disclosures, article filters, FAQ disclosures, and route links with keyboard and pointer.
6. Verify a production build, focused migration contracts, route/content integration,
   accessibility, and performance behavior.

Minimum repository evidence:

```bash
pnpm test:int
pnpm lint
pnpm typecheck
pnpm build
pnpm test:e2e
```

Acceptance requires passing checks plus signed-off visual comparison. A successful build
or a screenshot alone is not visual-parity acceptance. Any unresolved bridge, licensing
gate, missing media, accessibility defect, or materially different golden-route layout is
recorded explicitly and keeps the affected route open.

## Change control

An enhancement is admissible only when it is low-cost, meaningful, bounded, documented
here before acceptance, and reversible without undoing migrated content. Add a ledger row
for every such change with its editor/runtime hook and rollback. Changes to the golden
route set, source of truth, market-data ownership, or arbitrary editor freedom require an
architecture decision rather than an unrecorded parity adjustment.
