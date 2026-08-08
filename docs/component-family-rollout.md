# Track C2 — Component-family rollout

The delivery plan for closing the visual gap to the WordPress reference, family by family.
[remaining-plan.md](remaining-plan.md) remains the top-level plan; this is the detail for its C2
section.

## The rule

**All layout and styling comes from modular components that can be added to any page. Nothing is
styled by which page it happens to be.**

In WordPress, two pages look different because the editor chose different ACF components and
configured them differently — not because the theme carries per-page CSS. Payload has to work the
same way, or an editor cannot build a new page that looks like an existing one, which is most of the
reason for moving off WordPress at all.

The only legitimate axis of variation is the **template**, and the permitted set mirrors the
WordPress split:

| Template | Applies to |
| -------- | ---------- |
| Page (page builder) | `page.standard`, `page.product`, `page.landing`, `page.conversion`, `page.legal`, `page.homepage` |
| Article / post | `article.full` |
| Careers | the careers page |
| Learning hub | `/learning-hub/` and learning-video detail |
| Listing / index | `page.content-index` — insights, news, learning hub |
| Hub detail, venue detail | `hub.public-page`, `venue.public-detail` |
| Hub and venue listings | `index.market-coverage`, `index.venue` |

**Not permitted:** any styling keyed to an individual page. No `[data-page-path='…']`, no
`.trayport-page--home`, no `--product`. Within pages, posts, or anything using the page builder, a
rule that needs to know *which* page it is on is a defect.

When a route looks wrong, fix the component or the template so every route using it improves. If a
rule seems to need a page selector, that is the signal that a component is missing a bounded option
an editor should be able to set.

### Current violations

Measured 2026-08-08. 309 selectors breach the rule:

| File | Selectors | Locked to |
| ---- | --------: | --------- |
| `parity-joule.css` | 124 | `[data-page-path='/products/joule/']` |
| `parity-home.css` | 111 | `.trayport-page--home` |
| `parity-insights.css` | 60 | `[data-page-path='/resources/insights/']` |
| `parity-blocks.css` | 14 | mixed |

The inverse defect also exists and is worse, because it is invisible: **3,790 of the 4,975 parity
lines are globally-applying rules living in files named after routes.** `parity-blocks.css:276-290`
redefines `.trayport-section--space-top-tight` with no route selector at all, halving the section
rhythm on *every route in the site* and killing the ≥64rem step-up, from a file whose header
describes itself as route-specific.

This is not merely untidy. It is the direct cause of the measured pathology: the five routes with
per-route CSS sit within ~100px of the reference while untouched routes average ~1,000px. Hand-tuning
a page teaches the codebase nothing transferable.

## Enforcement

Add a gate — `page-specific-styling-forbidden` — asserting that no stylesheet under `src/`
contains a selector keyed to an individual page, and registering it in
[`gateEnforcement.ts`](../migration/mappings/gateEnforcement.ts) like the others. The allowlist is
the template table above, expressed as class prefixes. Until the violations are cleared the gate
declares its current count and ratchets down, in the same shape as the visual budgets.

This is what stops the layer regrowing. It grew from 1,940 to 4,975 lines in three days with no
commit ever net-shrinking it, precisely because nothing objected.

## Measurement

`corepack pnpm measure:parity [-- --viewport mobile]` samples every route-owning archetype and ranks
by **routes owned × mean absolute height delta**, because a 200px error across 93 articles matters
more than 1,400px on one page.

Height is a triage signal, not the bar. The bar is "indistinguishable to a client, or clearly
better". Two measured cases prove height alone certifies the wrong thing in both directions:

- **Learning-video routes.** The reference `<main>` is empty whitespace — WordPress gates video
  pages behind login. We render title, player, access notice and metadata. Height parity there would
  mean *deleting correct content*.
- **`/resources/insights/`.** −273px on desktop earned it the label "control, at parity"; it is
  −6,128px at 390px, the worst route in the sample.

### Baseline (2026-08-08, corpus `tokens-a`)

| Archetype | Routes | Desktop | Mobile | Combined impact |
| --------- | -----: | ------: | -----: | --------------: |
| `article.full` | 93 | 802 | 1117 | **178,467** |
| `page.standard` | 17 | 622 | 1665 | 38,879 |
| `hub.public-page` | 72 | 214 | 292 | 36,432 |
| `page.product` | 22 | 688 | 611 | 28,578 |
| `page.content-index` | 5 | 602 | 3950 | 22,760 |
| `page.legal` | 5 | 1616 | 2432 | 20,240 |
| `learning-video.public-detail` | 15 | 504 | 567 | 16,065 |
| `venue.public-detail` | 66 | 23 | 97 | 7,920 |
| `person.public-profile` | 17 | 125 | 330 | 7,735 |
| `page.landing` | 3 | 753 | 1116 | 5,607 |
| `page.interactive-market-matrix` | 1 | 1389 | 1079 | 2,468 |
| `page.homepage` | 1 | 96 | 313 | 409 |

Mean absolute delta: **645px desktop, 1,326px mobile.** Mobile is roughly twice as bad and was
unmeasured until now; three of the four diagnosed families *change sign* between viewports, so any
ordering derived from desktop alone is unsafe.

`venue.public-detail` is effectively done — 23px across 66 routes. It got there through
`parity-structured.css`, which is scoped by **archetype** rather than URL and therefore generalises.
That is the pattern to copy.

## Method, per family

1. Measure both viewports before touching anything.
2. Diagnose root cause in a browser against both sites. "It is taller" is not a cause.
3. Fix the **component or template**, never the route.
4. Re-measure both viewports, plus the five golden routes, and confirm no regression.
5. Delete whatever parity CSS the fix makes redundant, in the same change.
6. Record any deliberate difference in [visual-parity.md](visual-parity.md) or
   [frontend-improvements.md](frontend-improvements.md).

## Sequence

Ordered by verified value per unit of risk, which is **not** the same as the impact table — the
people list is two sections but is the largest single verified defect once mobile counts.

### Phase 0 — instrument (done 2026-08-08)

`measure:parity` now samples both viewports, covers all 12 archetypes, and no longer waits for
`networkidle` — the Mapbox runtime polls indefinitely on both sites, so the three `/regions/` pages,
`/products/exchange-connectivity/` and `/resources/markets-map/` were being dropped from every
measurement without failing anything. A viewport bug meant the first runs silently measured
1280×720 regardless of the flag; both are fixed.

### Phase 1 — people list

The largest verified win, and the cheapest: one adapter file plus a few CSS lines, no corpus reload,
no shared selectors.

- `peopleListAdapter.server.tsx:83-89` renders `person.description` inline. The reference emits the
  same text and hides it (`.people-description { @apply hidden }`). A three-paragraph bio becomes
  1,076px of copy in a 288px column. **~1,962px on `/company/about-us/`.**
- The portrait never fills its aspect box: `TrayportMedia` is called with no `className`, so the
  sizing rules never apply, `object-fit` computes to `fill`, and faces are clipped rather than
  cropped. No height impact, but it is the visible fidelity defect.
- The grid reflows 9 cards onto 3 rows and `min-height: 100%` equalises each row to its tallest
  card, multiplying the bio problem. At 390px it collapses to a single column: **+7,639px on one
  section.**

Do the bio and portrait fixes first; they are independently safe. **Do not** adopt the existing
careers carousel for the leadership list yet — with JavaScript disabled its container computes to
height 0, and it has no `role`, no `tabindex`, and `aria-label="Featured content"` on a people list.
Fix those first or the conversion is a regression.

### Phase 2 — article body, scoped

93 routes, the largest impact. We are *shorter* than the reference, which usually means missing
content rather than styling.

- `.trayport-article__body` has a hard 800px ceiling (70rem cap, minus `margin-inline` gutter, minus
  the inner container's padding). The reference card is `max-w-6xl` with a 992px inner grid, so the
  same hero image renders 992×661 there and 760×428 here — **−233px on each of 66 articles.**
- The transform flattens every article layout into one envelope: `width: 'reading'`,
  `spacing: 'tight'`, `span: '12'`. The reference varies span and margin per layout type.
- Two reference blocks have no data at all: the exporter's ACF allowlist omits `show_nav`,
  `show_disclaimer`, `show_location` and `show_date`, so the sticky index bar and legal disclaimer
  cannot be rendered. **−188px universally** for the disclaimer.
- `index-point` — an invisible 0px anchor in WordPress — is converted into a visible `<h2>`,
  duplicating the following paragraph's lead. Reference article bodies contain **zero** `h2`; ours
  contain up to 17. This is why heading-based section pairing fails on articles.

Scope every new rule under `.trayport-article__body` and leave `parity-blocks.css:276-290` alone in
the first cut. Removing the duplicate `index-point` headings *before* the width fix lands makes the
sample worse (813 → 1,033), because they are currently masking the deficits.

The article index nav is `display: none` at 390px in the reference. Build it desktop-only or it adds
height on mobile across 51 of 90 posts.

### Phase 3 — promote the index template

The clearest instance of the rule paying off. `parity-insights.css` is locked to
`[data-page-path='/resources/insights/']`, but **all five index routes already carry
`.trayport-page--index`**. Renaming the prefix fixes the other four for free.

Two conditions. First, `parity-blocks.css`'s own `--index` block is dead code — it sits inside
`@layer components` while the generic defaults it means to override are *unlayered*, and unlayered
declarations beat layered ones regardless of specificity. Delete it rather than merging it; it
encodes a different, denser design that would undershoot. Second, wrap the row geometry in
`@media (min-width: 48rem)`: `parity-insights.css:181` sets `min-height: 3.8125rem` outside any media
query, which is exactly why the "control" route is 50% short on mobile. Broadcasting it as-is spreads
that defect to three more routes.

Also unaddressed by any row-height fix: the rebuild renders 35 article rows where the reference
renders 39, and the reference has a "Show more" control we do not.

### Phase 4 — one batched transform and reload

Heading rungs (h5/h6 fall back to h2, rendering at 43px instead of 20px — **+5,234px across 8
routes**, the single largest defect in the product/standard family), `clients` selection mode,
feature presentation, column padding tokens (`column-p-lg` and `-xl` both collapse to `none`),
`index-point` anchors, per-layout article width and spacing, and the legal `dataTable`.

**All of these must land in one re-derive and one reload.** Four diagnoses each independently assume
their own `content:transform` + `content:load`; run separately they overwrite each other's corpus.
Resolve the `index-point` collision here too — the article and legal diagnoses prescribe opposite
treatments for `blocks.ts:1594-1601`.

### Phase 5 — restore missing content

The only category that is a genuine deficit at *both* viewports: HubSpot height reservation (the
mount is an inert 1px stub, **−4,208px across 7 routes**), the legal disclaimer, inline prose figures
and per-paragraph inset media (dropped entirely by the transform and the HTML-to-Lexical converter),
and `/learning-hub/`'s missing "Become a Product Pro" section.

### Phase 6 — global typography, behind a pixel check

`prose` and `max-w-none` from the RichText wrapper sit in `@layer utilities` and beat every
`.trayport-richtext` rule. Removing them moves height by almost nothing — and changes computed
font-size on 51 rich-text elements on Home alone. **It passes the height metric and fails the pixel
gate.** Run it against the golden screenshot comparison, not `measure:parity`.

Same for feature-grid density: the proposed 2-across change is verified to move `/products/joule/`
from 6,901px to 7,404px — a 503px regression on a route currently 35px from the reference.

### Phase 7 — delete the page-specific CSS

By this point most of the 309 violating selectors should be redundant. Delete them; promote anything
still load-bearing to its template. Then turn the Phase 0 gate from a ratchet into a hard zero, and
retire the C4 compatibility-bridge item — it is the same work.

## Decisions needed before the relevant phase

1. **Learning-video routes (15).** The reference `<main>` is empty because WordPress gates video
   behind login; we render title, player, access notice and metadata. Is that "clearly better", or a
   content-gating regression to fix? Nothing can be measured on these routes until this is settled.
2. **Index pagination.** The reference progressively discloses with "Show more"; we stream all 89
   rows. Keep ours as the simplification, or match?
3. **Leadership presentation.** The reference uses a carousel; we use a grid. The grid is arguably
   better — it shows all nine people without interaction — but it is the reason the section is tall.
   Keep the grid and accept the difference, or match the carousel?
4. **Four missing articles** on `/resources/insights/` (35 rendered against 39). Content gap to
   investigate, separate from layout.

## Traps

- **Fix-largest-first is wrong when a route is short at the other viewport.** The legal fixes remove
  ~2,500px from `/legal/legal-notice/`, which is +1,327 desktop but only −217 mobile: it would land
  at roughly −2,700 mobile.
- **The five tuned routes have no headroom.** home +96/+127, joule +35/0, german-power −2/0, eex
  −44/+118. Several proposed changes reach them, and any one exceeds a route's entire budget.
- **Axe will not catch the accessibility changes this work introduces.** Automated WCAG rules do not
  detect a zero-height no-JS container, a missing carousel role, or a mislabelled `aria-label`. A
  green axe run after the carousel conversion is false confidence.
- **`/company/about-us/` has three reference carousels, not one.** Only the 9-slide leadership one
  has been diagnosed.
