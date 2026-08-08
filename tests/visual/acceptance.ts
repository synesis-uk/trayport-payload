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
 * **What this standard is not.** It is not a instrument for driving every route to pixel-identity
 * with WordPress. That was never the goal and pursuing it would be actively wrong: the reference is
 * not especially well designed, its ACF layer is more complicated than the site needs, and
 * reproducing its defects faithfully would mean shipping known problems and paying to fix them
 * twice. The bar is the one in `docs/remaining-plan.md`: **indistinguishable to a client, or clearly
 * better.** A difference nobody would notice is not debt.
 *
 * So the budgets below are **drift guards, not targets**. A recorded number means "this is how this
 * route differs today, and it will not change again without someone deciding to". It does not mean
 * "reduce this to zero". The ratchet exists to stop silent movement in either direction, which is
 * what makes the numbers trustworthy — not to force convergence.
 *
 * The three tiers, in the order a difference should be diagnosed:
 *
 *   1. **Structural** — zero tolerance, and the only tier that is genuinely non-negotiable. The
 *      heading outline, landmark counts and internal link destinations must match. This is what
 *      "the same page" means, and it catches content loss that a pixel diff reports as noise.
 *   2. **Height parity** — full-page height against the tracked reference. Informative because a
 *      large delta almost always means a component is laid out wrongly rather than styled slightly
 *      differently; also a hard precondition, since `toHaveScreenshot` cannot compare images of
 *      different sizes at all.
 *   3. **Pixel** — a differing-pixel ratio, where heights already match. The least important tier,
 *      and deliberately last.
 *
 * **Known limitation of the golden set.** All five captured routes are covered by route-specific
 * parity CSS (`parity-home`, `parity-joule`, `parity-insights`, and `parity-structured` for the hub
 * and venue). They are therefore the five *least* representative routes on the site: measured
 * 2026-08-08, they sit within 1-127px of the reference while six sampled routes with no parity file
 * averaged 997px. This suite currently reports on the hand-tuned sample and is blind to everything
 * else, which is the single most valuable thing to fix about it — see the uncaptured targets below.
 */

export type VisualProject = 'visual-desktop' | 'visual-mobile'

/**
 * `approved-deviation` — a difference we chose and can defend in a sentence.
 * `tracked-difference` — a difference nobody has examined yet. Not automatically debt: it may be
 *   fine, or better. It is recorded so that it cannot move without being noticed.
 */
export type BudgetRationale = 'approved-deviation' | 'tracked-difference'

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
 * How much unused headroom a pixel budget may carry before it is considered stale.
 *
 * This is what keeps a recorded number honest in both directions: without it, an improvement would
 * silently bank slack that a later regression could spend, and the number would stop describing the
 * route. 3 points absorbs font-rendering and antialiasing noise between runs without leaving room
 * for a real change to hide.
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
    maxHeightDelta: 60,
    maxDiffPixelRatio: 0.12,
    rationale: 'tracked-difference',
    note: 'The most heavily composed route: hero, charts, testimonials, client logos and video. Largest remaining desktop gap.',
  },
  {
    route: 'home',
    project: 'visual-mobile',
    maxHeightDelta: 127,
    maxDiffPixelRatio: 0.19,
    rationale: 'tracked-difference',
    note: 'Our page renders 127px taller than the reference. The largest difference among the captured routes, though small next to the ~1000px seen on routes with no parity CSS.',
  },
  {
    route: 'joule',
    project: 'visual-desktop',
    maxHeightDelta: 1,
    maxDiffPixelRatio: 0.04,
    rationale: 'tracked-difference',
    note: 'Closest desktop route; total height differs by one pixel.',
  },
  {
    route: 'joule',
    project: 'visual-mobile',
    maxHeightDelta: 0,
    maxDiffPixelRatio: 0.04,
    rationale: 'tracked-difference',
    note: 'Pixel height is identical to the reference, so the pixel tier is live here. Achieved with the heaviest parity CSS file in the repo, which is the caveat, not the achievement.',
  },
  {
    route: 'insights',
    project: 'visual-desktop',
    maxHeightDelta: 273,
    maxDiffPixelRatio: 0.14,
    rationale: 'tracked-difference',
    note: 'Listing card layout and display dates differ; our page is 273px shorter.',
  },
  {
    route: 'insights',
    project: 'visual-mobile',
    maxHeightDelta: 6128,
    maxDiffPixelRatio: 0.16,
    rationale: 'approved-deviation',
    note: 'The legacy mobile listing is broken, not merely different: measured 2026-08-08 its rows are 117-447px tall with a median of ~230px for a title and a date, against ours at 50-93px. Recorded in tests/visual/reference/README.md. The repair now applies to the whole index template rather than this one route, so every page.content-index route carries the same intended difference on mobile.',
  },
  {
    route: 'german-power',
    project: 'visual-desktop',
    maxHeightDelta: 2,
    maxDiffPixelRatio: 0.1,
    rationale: 'tracked-difference',
    note: 'Hub detail with the regional map. Height matches within two pixels.',
  },
  {
    route: 'german-power',
    project: 'visual-mobile',
    maxHeightDelta: 0,
    maxDiffPixelRatio: 0.11,
    rationale: 'tracked-difference',
    note: 'Pixel height is identical to the reference.',
  },
  {
    route: 'eex',
    project: 'visual-desktop',
    maxHeightDelta: 44,
    maxDiffPixelRatio: 0.07,
    rationale: 'tracked-difference',
    note: 'Venue detail; our page is 44px shorter.',
  },
  {
    route: 'eex',
    project: 'visual-mobile',
    maxHeightDelta: 118,
    maxDiffPixelRatio: 0.13,
    rationale: 'tracked-difference',
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
