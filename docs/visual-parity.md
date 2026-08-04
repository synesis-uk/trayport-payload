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
and scroll state. Approved reference images are tracked; candidate and diff artifacts remain
ignored:

```text
tests/visual/reference/visual-desktop/<route>.png
tests/visual/reference/visual-mobile/<route>.png
output/playwright/visual-results/**
```

The baseline provenance, update guard, and promoted hashes are recorded in
`tests/visual/reference/README.md`. `pnpm test:visual` compares the candidate; reference updates
require the separate `pnpm visual:update-reference` command and human review.

### Current comparison checkpoint

The fresh production-build comparison on 2026-08-04 intentionally remains failing after the
frontend-system foundation slice. This is the starting point for route-by-route parity work, not an
accepted baseline replacement:

| Route | Desktop reference -> candidate height | Desktop changed pixels | Mobile reference -> candidate height | Mobile changed pixels |
| --- | --- | --- | --- | --- |
| Home | 8,908 -> 9,017 px | 24% | 10,904 -> 12,164 px | 36% |
| Joule | 6,758 -> 7,074 px | 34% | 7,990 -> 9,539 px | 36% |
| Insights | 5,488 -> 5,216 px | 14% | 12,105 -> 5,671 px | 15% |
| German Power | 2,112 -> 1,948 px | 17% | 2,220 -> 2,750 px | 48% |
| EEX | 2,339 -> 2,391 px | 12% | 2,548 -> 3,524 px | 41% |

Height differences make the pixel ratios directional rather than a standalone quality score. The
candidate, expected, and diff images are emitted under `output/playwright/visual-results/` for
review. The tracked WordPress references were not updated.

### Structured-route acceptance checkpoint

The focused clean-browser comparison after VP-026 uses the same 1,440 px and 390 px viewports,
Playwright's 0.2 pixel-match threshold, and the existing WordPress captures. These artifacts are
working evidence under `output/playwright/structured-golden-routes/`, not promoted baselines:

| Route | Desktop reference -> candidate height | Desktop changed pixels | Mobile reference -> candidate height | Mobile changed pixels |
| --- | --- | --- | --- | --- |
| German Power | 2,112 -> 2,112 px | 10% | 2,220 -> 2,281 px | 13% |
| EEX | 2,339 -> 2,297 px | 6% | 2,548 -> 2,727 px | 14% |

German Power's structured stage, card, header, connection-grid heights, and desktop page height now
match the reference; the remaining image difference includes the explicit VP-021 missing-media
bridge and a 61 px mobile whole-page shell delta. EEX is 42 px shorter on desktop because VP-022
removes the duplicate market row. Its 179 px mobile increase primarily records VP-027's 48 px
market-link targets and 44 px Contact action rather than an accidental layout drift.

### Home-route acceptance checkpoint

The focused clean-browser comparison after VP-028 uses the tracked 1,440 px and 390 px WordPress
captures and leaves them unchanged. The visual test still fails, correctly, while the remaining
Home differences are reviewed:

| Viewport | Before reference -> candidate height | Before changed pixels | After reference -> candidate height | After changed pixels |
| --- | --- | --- | --- | --- |
| Desktop | 9,156 -> 8,710 px | 34% | 9,156 -> 9,172 px | 11% |
| Mobile | 11,599 -> 11,638 px | 20% | 11,599 -> 11,630 px | 19% |

Desktop section geometry is now within 39 px of the reference for every section, with the hero,
Market Matrix, and client-logo section at the reference height or within 2 px. Mobile whole-page
height is within 31 px; larger local offsets remain around source-hidden Home headings, the owned
product carousel controls, and the intentionally accessible chart-data disclosures. These are
recorded deltas, not permission to replace the reference snapshots. The Home feature carousel also
retains native list semantics, and a focused Axe A/AA pass reports no violations at desktop or
mobile widths.

### Final implementation-slice checkpoint

The complete strict suite was rerun against the production build on 2026-08-04 after the accepted
six-chart import/runtime work, exact VP-031 hero artwork, no-configuration VP-032 map fallback,
Insights layout repair, compiled Tailwind prose fix, and final route hardening. Zero of ten
comparisons pass the zero-tolerance acceptance rule, so all remain open and the WordPress references
were not updated:

| Route | Desktop reference -> candidate height | Desktop changed pixels | Mobile reference -> candidate height | Mobile changed pixels |
| --- | --- | --- | --- | --- |
| Home | 9,156 -> 9,082 px | 15% | 11,599 -> 11,465 px | 20% |
| Joule | 6,902 -> 6,942 px | 12% | 8,722 -> 8,753 px | 16% |
| Insights | 5,488 -> 5,217 px | 12% | 12,105 -> 5,977 px | 15% |
| German Power | 2,112 -> 2,112 px | 10% | 2,220 -> 2,220 px | 11% |
| EEX | 2,339 -> 2,297 px | 6% | 2,548 -> 2,666 px | 13% |

German Power matched the reference canvas height at both viewports before VP-021 recovered the exact
media `9727` binary. EEX remains the closest desktop route; its height deltas retain the
recorded VP-022 deduplication and VP-027 touch-target improvements. Home includes the exact six
source chart configurations, accessible data disclosures, and the deterministic 55-marker fallback;
provider-rendered map acceptance remains gated by approved runtime configuration. Insights desktop
is now 271 px shorter with 12% changed pixels. Its readable mobile presentation remains intentionally
assessed against the severely clipped 12,105 px source capture rather than copying that defect.
Candidate, expected, diff, and trace artifacts are available under
`output/playwright/visual-results/` and `output/playwright/visual-report/` for the next route slice.

### Source-measured finishing checkpoint

The strict production-build suite was rerun on 2026-08-04 after the source-measured Home card,
badge, hero, chart, and carousel pass; the Joule FAQ correction; and the fresh immutable content
run. The zero-tolerance suite still reports all ten comparisons as open, and the WordPress
references remain unchanged:

| Route | Desktop reference -> candidate height | Desktop changed pixels | Mobile reference -> candidate height | Mobile changed pixels |
| --- | --- | --- | --- | --- |
| Home | 9,156 -> 9,215 px | 11% | 11,599 -> 11,723 px | 18% |
| Joule | 6,902 -> 6,901 px | 3% | 8,722 -> 8,722 px | 3% |
| Insights | 5,488 -> 5,215 px | 13% | 12,105 -> 5,955 px | 15% |
| German Power | 2,112 -> 2,110 px | 9% | 2,220 -> 2,220 px | 10% |
| EEX | 2,339 -> 2,295 px | 6% | 2,548 -> 2,666 px | 12% |

Joule now matches every content-section height within sub-pixel rounding; the one-pixel desktop
canvas difference is accumulated shell rounding. Home's remaining positive height is bounded and
predominantly intentional: native chart-data disclosures and 44 px actions are retained while the
source-measured hero, card, badge, map, and carousel recipes stay route-scoped. Insights mobile
continues to preserve the repaired readable layout rather than the reference's clipped capture;
German Power retains the recovered source image, and EEX retains the documented relationship
deduplication and touch targets. These differences remain explicit review items, not permission to
promote the candidate images.

Home's 59 px desktop canvas delta consists of a 61 px main-content delta—37 px in Market Coverage,
12 px in Products, and 12 px in Learning—offset by approximately 2 px of shell rounding. Its 124 px
mobile delta consists of 75 px in Market Coverage, 24 px in Products, 12 px in Market Matrix, 12 px
in Learning, and approximately 1 px of accumulated rounding. The material increments are the
documented disclosure rows and accessible action heights, so each can be removed independently if
exact footprint is later preferred.

## Decision and reversibility ledger

`Exact` reproduces the reference. `Improvement` deliberately changes it at low cost.
`Bridge` is temporary and cannot be silently reclassified as accepted final parity.

| ID | Class | Decision and reason | Control or implementation hook | Rollback |
| --- | --- | --- | --- | --- |
| VP-001 | Exact | Self-host deterministic normal and italic subsets of the exact Inter 4.1 variable fonts used by the reference, split by Unicode range to avoid its third-party runtime request. | `src/styles/fonts.css`, hash-locked faces/provenance, and `--font-inter` | Restore the former Fontsource or `next/font/local` declarations; content and type-scale tokens are unchanged. |
| VP-002 | Exact | Preserve the reference desktop header hierarchy, full-width dropdown behavior, search affordance, full-screen mobile navigation, and footer structure. | Payload navigation/footer globals plus the shell components and `parity-shell.css` | Revert the shell component/style layer; content globals are unchanged. |
| VP-003 | Exact | Respect the active WordPress hero background selector. Retained video/image fields must not override the selected image, video, or no-background state. | `mapPageLayout` hero transform; covered by migration integration tests | Revert only the hero media selector mapping and retransplant the accepted run. |
| VP-004 | Exact | Import the reusable Home/Joule hero statistics as four typed value-label pairs. Editors can change content, not their geometry. | `trayportHero.statistics`, reusable transform, and hero renderer | Clear the array or revert the transform/renderer; source reusable data remains intact. |
| VP-005 | Exact | Reproduce the WordPress quarterly stacked-volume charts with its observed Highcharts `12.2.0` runtime, reference colors, range, neutral external title/licence, axes, initial fallback-font measurement and final static Inter rendering, legend, HTML total-plus-series tooltip, typography, and height. | `dataChart` controls and `MarketVolumeChartRuntime.client.tsx`; facts queried from application PostgreSQL | The chart block can fall back to its table, or the client renderer/version/timing can be reverted without changing facts. |
| VP-006 | Improvement | Keep **View chart data** as a native disclosure so values remain available without interpreting the graphic. | Bounded `dataChart.showDataTable` switch, defaulted on for imported charts | Set the switch false or remove the disclosure; chart data and chart rendering are unchanged. |
| VP-007 | Improvement | Load Highcharts only when a chart block is rendered. Do not add it to the global shell bundle. | Client-side request to the traced same-origin `/next/chart-runtime/` endpoint inside the chart component | Replace the isolated runtime loader with the prior renderer; the Payload model and PostgreSQL boundary are unchanged. |
| VP-008 | Bridge | Use the managed legacy `map-all` image with an accessible, bounded SVG connection overlay for the Home regional map. This retains the visual role without loading a general map runtime. | `marketCoverage.backgroundMedia` and typed line/marker controls | Disable the overlay/background fields or revert the market-coverage renderer and reimport. |
| VP-009 | Exact | Render German Power and EEX from typed hub/venue relationships instead of generic rich text. | Hub and venue content views; existing hub/venue collections | Revert the specialized view selection; relationship data remains available. |
| VP-010 | Improvement | Scope the first search affordance to the migrated Insights library and say so in the dialog. This avoids implying unsupported whole-site coverage. | Header search form submits `q` to `/resources/insights/`; listing owns the filter | Remove the header search control, or change its destination when a full managed index exists. |
| VP-011 | Exact | Use the licensed WordPress Font Awesome kit for interface icons through a bounded semantic registry, including social marks. | `components/icons`, the pinned private kit, and Font Awesome package registries | Repoint the semantic registry to the former definitions; component and CMS APIs remain unchanged. |
| VP-012 | Exact | Keep wrapper theme separate from the inner content surface, preserve asymmetric section spacing and column gaps, and activate column alignment, height, padding, surface, border, radius, background media, and opacity only when their WordPress flags select them. Retained inactive values do not become active styling. | Bounded `contentSection` and column fields, typed layout adapters, and importer mapping | Reset the bounded fields to defaults or revert the transform and migration; body content and source provenance remain intact. |
| VP-013 | Improvement | Retain accessible foreground contrast, programmatic filter names, focus containment, and chart-region semantics where the reference is visually or structurally weaker. These changes do not add editorial freedom. | Parity foreground rules, native form/ARIA semantics, and the existing automated accessibility suite | Revert the isolated semantics/styles while leaving imported content and component geometry unchanged. |
| VP-014 | Exact | Keep the `2xl` breakpoint at Tailwind's 1,536 px default used by the WordPress theme, so the 64 px shell gutter does not begin early at 1,376 px. | `--breakpoint-2xl` and the matching shell media query | Restore the former 86 rem breakpoint in the two isolated declarations. |
| VP-015 | Exact | Import only the hero action branch selected by WordPress, discard blank destinations, preserve the bounded five-style action vocabulary and semantic leading icons, and render the selected badge and media aspect. Dormant action data cannot leak into the page. | `trayportHero` badge/aspect fields, shared action fields, hero transform, and typed hero presentation | Reset the new hero fields or revert the transform, presentation, and migration; the accepted source run remains immutable. |
| VP-016 | Exact | Keep heading semantics separate from visual scale. Imported `h2`-`h4` elements retain their semantic level while WordPress size maps to a bounded `h1`-`h4` appearance; legacy `div` pseudo-headings become real headings without changing their intended scale. | Heading `level` and `appearance` fields, importer mapping, and typography presentation | Reset appearance to match level or revert the heading transform/presentation; heading text remains unchanged. |
| VP-017 | Exact | Match the shared Home/Joule two-to-one desktop hero rail: 47% copy width with the reference gutter, natural one-line/three-line title wrapping, and four in-frame statistic cards at the WordPress `xl` breakpoint. Below `xl`, statistics remain hidden as on the reference; the existing stacked mobile content keeps readable source order. | Shared `Hero` full-width container, semantic `trayport-hero--aspect-twoToOne` hook, and the hero family in `parity-blocks.css` | Revert the shared container width and isolated hero geometry rules; imported hero content and statistics remain unchanged. |
| VP-018 | Exact | Preserve WordPress feature semantics on Home and Joule: explicit plain/image/icon item displays, source-selected action visibility/style/icon, static grids below four items, and user-controlled 1/2/3-item carousels at the reference 998 px and 1,600 px breakpoints with a 20 px gap. Home Our Products retains its 4/12 lead plus 8/12 carousel composition. | Bounded `featureList` fields, owned carousel, importer merge, and typed feature presentation | Reimport with `presentation=grid` or revert the feature transform/presentation and migration; source items and links remain available. |
| VP-019 | Exact | Resolve reusable video 7665 to managed video 7666 with poster 8519 and reproduce the poster-first central Font Awesome play affordance before native playback controls. | Reusable-video transform, `Media.poster`, `TrayportMedia`, and `TrayportVideo.client` | Remove the poster relationship and restore immediate video-source rendering; the managed media records remain intact. |
| VP-020 | Exact | Match the structured German Power and EEX compositions: Power uses the sharp-solid `lightbulb-cfl` identity, plural venue headings and one four-column product grid; EEX uses its filled Exchange identity, right-hand logo, cyan rule and 2/3/4-column market tiles. Relationship links keep accessible new-tab copy without visible arrow glyphs. | `HubView`, `VenueView`, the bounded semantic icon registry, and `parity-structured.css` | Revert the two structured views and isolated structured parity rules; imported relationships remain unchanged. |
| VP-021 | Exact | Recover the original German Power header image for WordPress media `9727` from the audited reference origin, pin its SHA-256 and size in run evidence, load it only from the run-local recovery directory, and publish it through the same managed Media relationship as locally available files. No substitute or generated artwork is used. | Optional `content:recover-media` stage, accepted run `visual-final-parity-20260804-1835`, recovery-evidence validation, and `HubView` `data-media="image"` | Re-run the immutable source without the recovery stage and publish the record as unavailable to restore the explicit bridge; the recovered binary and provenance remain independently auditable. |
| VP-022 | Improvement | Deduplicate the repeated Czech Power relationship on EEX, retain the broader connection type, and keep every market in its first WordPress source-row position instead of reproducing the duplicate and template-side reordering. | Ordered Map normalization in the venue importer plus source/target order validation | Replace ordered normalization with raw rows and restore view-side sorting; the immutable source run still contains the duplicate for audit. |
| VP-023 | Exact | Keep article publication chronology separate from the WordPress editorial display date. Listings render the managed date as `MMM yyyy`, but ordering and year filters use the actual publication timestamp; Insights, News, and Events rows use their corresponding bounded Font Awesome icons. | `Articles.displayDate`, WordPress article transform, compact listing select, and `ArticleListingClient` | Copy display date back to `publishedAt`, remove the separate field, and restore the single generic row icon; the source export still retains both dates. |
| VP-024 | Exact | Preserve the Home source presentation rather than exposing template-only labels: omit the source-hidden `Why Trayport?` and `Who we serve` headings, keep client names as accessible screen-reader labels beneath logo-only artwork, and render the connection map as the right half of the existing managed dark panel without injecting a duplicate summary. | Home-specific importer semantics, the bounded `marketCoverage.presentation` variant, typed entity/map presentation, and isolated map-only CSS | Re-enable either heading in the importer, set the map block to `summary`, or remove the client-title `sr-only` treatment; all source content and managed labels remain intact. |
| VP-025 | Improvement | Preserve the healthy WordPress Insights hierarchy and desktop geometry while repairing its clipped mobile result rows into readable, touch-safe rows. Keep the managed missing-media artwork and featured-item deduplication instead of reproducing the source's broken image and repeated records. | Route-scoped `parity-insights.css`, compact media projections that retain S3 URL-generation metadata, the existing managed missing-media record, and `ArticleListingClient` featured-ID exclusion | Remove the isolated stylesheet and FE-026 exclusion to restore the prior generic index presentation; imported article order, dates, taxonomy, and media records remain unchanged. |
| VP-026 | Exact | Match the structured-route stage/card geometry, Inter type metrics, labels, dividers, four-column connection grid, WordPress runtime venue order, EEX logo crop, responsive group hierarchy, and desktop market tiles without coupling styles to imported row position. | Semantic Hub/Venue classes in isolated `parity-structured.css` plus group-local connection presentation in `HubView` | Revert the isolated structured stylesheet and connection-order presentation changes; typed relationships, media, and route ownership remain unchanged. |
| VP-027 | Improvement | Keep every EEX market link at least 48 px high on narrow screens and the Contact action at least 44 px high, instead of reproducing the smaller WordPress targets. This increases the page height but does not alter grouping, order, or desktop geometry. | Mobile structured-link rules in `parity-structured.css` | Remove the two minimum-height declarations to restore the reference's 38 px market tiles and 40 px Contact action; relationship data and link destinations are unchanged. |
| VP-028 | Exact | Match Home's reference container gutters, asymmetric section spacing, inner-panel padding, semantic type appearances, two-to-one media, connection-panel geometry, client-logo grid, and mobile hero/carousel presentation without coupling styles to imported row position or link destinations. Retain the owned chart disclosure and accessible carousel status. | Home-archetype selectors in isolated `parity-home.css`, imported after the reusable block layer; native carousel list items in `FeatureCarousel.client.tsx` | Remove the `parity-home.css` import/file and restore the explicit carousel child role; managed content, bounded controls, charts, map presentation, and reusable component APIs remain unchanged. |
| VP-029 | Improvement | Show the same three managed utility destinations at the foot of the mobile menu that WordPress exposes only in desktop dropdowns. This removes a small responsive discoverability gap without adding a new editor control or duplicating Contact. | `MobileNavigationPanel` utility list and portal-scoped rules in `parity-shell.css` | Remove the mobile utility list and its isolated styles; the desktop dropdown utilities and imported CMS values are unchanged. |
| VP-030 | Improvement | Use deep ink rather than white on Joule's cyan and light-blue compact labels/actions, and make horizontally scrollable carousel viewports keyboard-focusable with Left/Right navigation. These retain the reference geometry and brand fills while meeting contrast and keyboard-access requirements. | Joule-scoped foreground rules plus the owned `FeatureCarousel` viewport keyboard handler | Restore the three white foreground rules and remove the viewport label, tab stop, and key handler; imported content, carousel controls, and geometry are unchanged. |
| VP-031 | Exact | Reuse the accepted WordPress low-poly angle artwork over image heroes instead of approximating it with a flat gradient. The immutable code-owned copy is hash-guarded and remains decorative; mobile keeps the reference image-first stack without the overlay. | `public/brand/bg-poly-angle-opacity-02.png`, the shared hero rule in `parity-blocks.css`, and the frontend-system asset contract | Restore the former gradient/clip rule and remove the copied asset; hero content and CMS-selected background media remain unchanged. |
| VP-032 | Exact | Reproduce the Home reference map from the 55 managed locations as 759 same-Asset-Class connections with the observed Mapbox version, style hook, fit, marker colours, line paint, labels, logo, and attribution. Keep the deterministic managed-media/SVG view as the no-config, loading, and provider-failure fallback, and load Mapbox only near the Home map viewport. | Typed Hub/Asset Class/Region projection, `connectionsMapData`, `DynamicConnectionsMap.client`, pinned `mapbox-gl` `3.11.1`, and validated runtime configuration | Leave either runtime setting blank to use the existing fallback, or remove the isolated client/runtime modules and package; Payload content, imported coordinates, and fallback rendering remain unchanged. |
| VP-033 | Exact | Finish the measured Home and Joule source geometry: render the hero polygon once at its intrinsic artwork width, restore normal-case section badges and source stat/card/media/grid recipes, keep product carousel controls overlaid at the reference insets, omit reusable-video admin labels from public captions, and apply the FAQ typography correction only on desktop. | `parity-home.css`, `parity-joule.css`, reusable-video transform, accepted run `visual-final-parity-20260804-1835`, and route-scoped contracts | Remove the isolated rules and reimport with the former caption mapping; shared component APIs, source media, and prior immutable runs remain intact. |
| VP-034 | Improvement | Keep Home content actions at 44 px and retain native chart-data disclosures even though the reference uses smaller actions and no disclosure rows. These account for explicit, measured residual height rather than hidden parity drift. | Shared action minimum height, imported `dataChart.showDataTable`, strict visual evidence, and FE-093 | Remove the scoped action minimum or set the disclosure control false to reproduce the source footprint; link destinations, chart rendering, and PostgreSQL facts are unchanged. |

### Map activation gate

VP-008 remains the durable fallback, while VP-032 pulls the exact Home runtime into scope. The
reference German Power, EEX, and virtual index routes do not render this general Mapbox map, so the
runtime is deliberately restricted to the Home `mapOnly` block. The code and imported topology are
complete, but exact provider-rendered visual acceptance remains open until deployment supplies an
approved origin-restricted public token, approves use of the Synesis reference style or a
Trayport-owned clone, and records Mapbox licence/attribution approval. No secret token may be used:
the configured token is browser-visible by design, and invalid or incomplete configuration must
retain the fallback and issue zero Mapbox requests.

### Highcharts deployment gate

Highcharts is pinned for deterministic visual behavior, but the application must not be
deployed with it until the project owner has verified that this site and deployment model
are covered by the appropriate Highcharts commercial licence and the evidence is recorded
in the release checklist. The accessible data table remains the reversible non-chart
fallback if that gate cannot be cleared.

## Performance decisions and checks

- Inter is self-hosted with `font-display: swap`; the shell does not wait on a remote font
  host.
- Highcharts is requested from the same-origin traced runtime endpoint only on pages that render
  `dataChart`.
- The Home connection graphic always server-renders managed media/SVG and loads Mapbox only within
  300 px of the viewport when both approved runtime values are present. Other routes and the
  initial public shell do not include or request the map SDK.
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
two chunks containing Highcharts while `/` did. This boundary is now guarded by
`tests/e2e/performance-boundaries.e2e.spec.ts`. The five golden routes also pass a desktop/mobile
browser evidence probe for LCP, CLS, FCP, TTFB, load timing, and transferred resources; the current
machine-local baseline is generated at `output/performance/web-vitals-current.json`. No genuine
pre-refactor browser-timing artifact exists, so this is a comparison baseline for subsequent work,
not a fabricated before/after claim, and its timing values are intentionally not CI thresholds.
The desktop crash left one zero-byte
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
pnpm test:ui
pnpm test:visual
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
