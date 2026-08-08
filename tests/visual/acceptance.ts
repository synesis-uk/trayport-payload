/**
 * The visual acceptance standard (C1).
 *
 * Requirements 9 and 10 of `docs/frontend-plan-completion.md` sat open because "exact visual
 * acceptance" had never been given a threshold. The harness was already strong — deterministic
 * settling, an audited reference forwarder, hash-pinned baselines — but `toHaveScreenshot` carried
 * no `maxDiffPixelRatio`, so Playwright's default of *zero* differing pixels applied. Against a
 * WordPress capture that can never pass, which is why the suite was never run to green rather than
 * failing loudly.
 *
 * The fix is not a global tolerance. Measured against the tracked references, Insights on mobile
 * differs by 15% and Home on mobile by 18% — and those two numbers mean opposite things. The legacy
 * Insights mobile page has a broken narrow layout that we deliberately repaired, so its difference
 * is approved and permanent. Home's is an outstanding gap we intend to close. A single number
 * cannot express that, and a number large enough to admit Insights would hide every regression on
 * Home.
 *
 * So acceptance has three tiers, in the order a difference should be diagnosed:
 *
 *   1. **Structural** — zero tolerance, no pixels. The heading outline, landmark counts and
 *      internal link destinations must match the tracked reference outline exactly. This is what
 *      "the same page" actually means, and it catches content loss that a pixel diff reports as
 *      indistinguishable noise.
 *   2. **Height parity** — the full-page height against the tracked reference, in pixels. This is
 *      the tier the original harness could not express and the one that matters most: a page that
 *      is 273px short is missing something, and no pixel ratio will say so. It is also a hard
 *      precondition, because `toHaveScreenshot` cannot compare images of different sizes at all —
 *      which is why the suite failed on eight of ten routes before heights were measured
 *      separately.
 *   3. **Pixel** — a per-route, per-viewport ratio budget that may only ratchet *down*. It runs
 *      only where heights already match; elsewhere it is explicitly pending rather than silently
 *      skipped. Nobody can justify an absolute tolerance a priori, but everyone can agree it must
 *      never get worse, and a budget carrying more slack than `MAX_BUDGET_SLACK` fails too, so
 *      budgets track reality instead of rotting generous.
 *
 * Every budget states why it is where it is. `approved-deviation` is a permanent, explained
 * difference; `outstanding-gap` is debt with a number attached.
 *
 * A *localized* approved change — one that alters a region rather than the whole page — must be
 * recorded as a masked region, never by inflating a budget. Inflating one buys silence for every
 * other pixel on the route.
 */

export type VisualProject = 'visual-desktop' | 'visual-mobile'

export type BudgetRationale = 'approved-deviation' | 'outstanding-gap'

export type VisualBudget = {
  route: string
  project: VisualProject
  /**
   * Maximum absolute difference in full-page height, in pixels, against the tracked reference.
   * Ratchets down only. Zero means the page must match the reference height exactly.
   */
  maxHeightDelta: number
  /**
   * Maximum differing-pixel ratio, applied only once `maxHeightDelta` is 0 and the heights in fact
   * match — Playwright cannot compare differently-sized images. Ratchets down only.
   */
  maxDiffPixelRatio: number
  rationale: BudgetRationale
  note: string
}

/**
 * How much unused headroom a budget may carry before it is considered stale.
 *
 * Without this the ratchet only works in one direction: an improvement would silently bank slack
 * that a later regression could spend. 3 points absorbs font-rendering and antialiasing noise
 * between runs without leaving room for a real change to hide.
 */
export const MAX_BUDGET_SLACK = 0.03

/**
 * Measured on 2026-08-08 against the references promoted on 2026-08-04, with the corpus loaded from
 * accepted run `trackb-gates-f`. Lower these as routes are brought closer; never raise one without
 * moving its rationale to `approved-deviation` and saying why.
 */
export const visualBudgets: VisualBudget[] = [
  {
    route: 'home',
    project: 'visual-desktop',
    maxHeightDelta: 59,
    maxDiffPixelRatio: 0.12,
    rationale: 'outstanding-gap',
    note: 'The most heavily composed route: hero, charts, testimonials, client logos and video. Largest remaining desktop gap.',
  },
  {
    route: 'home',
    project: 'visual-mobile',
    maxHeightDelta: 124,
    maxDiffPixelRatio: 0.19,
    rationale: 'outstanding-gap',
    note: 'Our page renders 124px taller than the reference. Largest gap in the suite and the first one C2 should close.',
  },
  {
    route: 'joule',
    project: 'visual-desktop',
    maxHeightDelta: 1,
    maxDiffPixelRatio: 0.04,
    rationale: 'outstanding-gap',
    note: 'Closest desktop route; total height differs by one pixel.',
  },
  {
    route: 'joule',
    project: 'visual-mobile',
    maxHeightDelta: 0,
    maxDiffPixelRatio: 0.04,
    rationale: 'outstanding-gap',
    note: 'Pixel height is identical to the reference. The best result in the suite and the realistic target for the others.',
  },
  {
    route: 'insights',
    project: 'visual-desktop',
    maxHeightDelta: 273,
    maxDiffPixelRatio: 0.14,
    rationale: 'outstanding-gap',
    note: 'Listing card layout and display dates differ; our page is 273px shorter.',
  },
  {
    route: 'insights',
    project: 'visual-mobile',
    maxHeightDelta: 6150,
    maxDiffPixelRatio: 0.16,
    rationale: 'approved-deviation',
    note: 'The legacy mobile page has an extreme narrow-layout failure recorded in tests/visual/reference/README.md; our repaired page is 12105px against 5955px. This difference is intended and permanent, so the budget will not fall to the others.',
  },
  {
    route: 'german-power',
    project: 'visual-desktop',
    maxHeightDelta: 2,
    maxDiffPixelRatio: 0.1,
    rationale: 'outstanding-gap',
    note: 'Hub detail with the regional map. Height matches within two pixels.',
  },
  {
    route: 'german-power',
    project: 'visual-mobile',
    maxHeightDelta: 0,
    maxDiffPixelRatio: 0.11,
    rationale: 'outstanding-gap',
    note: 'Pixel height is identical to the reference.',
  },
  {
    route: 'eex',
    project: 'visual-desktop',
    maxHeightDelta: 44,
    maxDiffPixelRatio: 0.07,
    rationale: 'outstanding-gap',
    note: 'Venue detail; our page is 44px shorter.',
  },
  {
    route: 'eex',
    project: 'visual-mobile',
    maxHeightDelta: 118,
    maxDiffPixelRatio: 0.13,
    rationale: 'outstanding-gap',
    note: 'Our page is 118px taller than the reference.',
  },
]

/**
 * The golden route set: one exemplar per route-owning archetype.
 *
 * The five captured routes were chosen by hand before the corpus was complete. Grounding the set in
 * the contract's archetypes instead makes coverage answerable — every archetype the site can
 * publish has a representative, or is visibly missing one.
 *
 * `captured: false` means no tracked reference PNG exists yet. Promoting one requires the audited
 * forwarder and image-by-image human review per `tests/visual/reference/README.md`, so those are
 * scheduled work rather than something a test run should create.
 */
export type GoldenRouteTarget = {
  archetype: string
  /** The captured route's name in `goldenRoutes`, or the intended path when not yet captured. */
  name: string
  path: string
  captured: boolean
}

export const goldenRouteTargets: GoldenRouteTarget[] = [
  { archetype: 'page.homepage', name: 'home', path: '/', captured: true },
  { archetype: 'page.product', name: 'joule', path: '/products/joule/', captured: true },
  { archetype: 'page.content-index', name: 'insights', path: '/resources/insights/', captured: true },
  { archetype: 'hub.public-page', name: 'german-power', path: '/market-coverage/german-power/', captured: true },
  { archetype: 'venue.public-detail', name: 'eex', path: '/venue/eex/', captured: true },

  { archetype: 'page.standard', name: 'about-us', path: '/company/about-us/', captured: false },
  { archetype: 'page.legal', name: 'legal-notice', path: '/legal/legal-notice/', captured: false },
  { archetype: 'page.conversion', name: 'request-a-demo', path: '/request-a-demo/', captured: false },
  { archetype: 'page.landing', name: 'eex-news', path: '/eex-news/', captured: false },
  { archetype: 'page.interactive-market-matrix', name: 'market-matrix', path: '/resources/market-matrix/', captured: false },
  { archetype: 'article.full', name: 'insight-article', path: '/insights/the-role-of-algorithms-in-energy-trading/', captured: false },
  { archetype: 'person.public-profile', name: 'person', path: '/people/andrew-taylor/', captured: false },
  { archetype: 'learning-video.public-detail', name: 'learning-video', path: '/learning-hub/watch/what-is-joule/', captured: false },
  { archetype: 'index.venue', name: 'venue-index', path: '/venue/', captured: false },
  { archetype: 'index.market-coverage', name: 'market-coverage-index', path: '/market-coverage/', captured: false },
]

export const budgetFor = (route: string, project: VisualProject): VisualBudget | undefined =>
  visualBudgets.find((budget) => budget.route === route && budget.project === project)
