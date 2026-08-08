// @vitest-environment node

import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { contentArchitectureContract } from '../../migration/mappings/contentArchitecture'
import { goldenRoutes } from '../helpers/site'
import {
  MAX_BUDGET_SLACK,
  goldenRouteTargets,
  visualBudgets,
  type VisualProject,
} from '../visual/acceptance'

const root = process.cwd()
const projects: VisualProject[] = ['visual-desktop', 'visual-mobile']

/**
 * The standard has to be as hard to let rot as the thing it measures.
 *
 * `visual-regression.e2e.spec.ts` only runs against a live server and the tracked references, so it
 * cannot be part of the routine suite. These assertions are the part that can: they keep the
 * budgets, the golden set, and the tracked baselines from drifting apart while nobody is looking.
 */
describe('visual acceptance standard', () => {
  it('gives every captured golden route a budget for both viewports', () => {
    const expected = goldenRoutes
      .flatMap(({ name }) => projects.map((project) => `${name}/${project}`))
      .sort()
    const declared = visualBudgets
      .map(({ project, route }) => `${route}/${project}`)
      .sort()

    expect(declared).toEqual(expected)
  })

  it('tracks a reference image for every budget', () => {
    const missing = visualBudgets
      .map(({ project, route }) => `tests/visual/reference/${project}/${route}.png`)
      .filter((file) => !fs.existsSync(path.resolve(root, file)))

    expect(missing).toEqual([])
  })

  it('keeps every budget explained and within a sane range', () => {
    for (const budget of visualBudgets) {
      const id = `${budget.route}/${budget.project}`

      expect(budget.note.length, `${id} needs a note`).toBeGreaterThan(20)
      expect(budget.maxDiffPixelRatio, `${id} ratio`).toBeGreaterThan(0)
      expect(budget.maxDiffPixelRatio, `${id} ratio`).toBeLessThanOrEqual(0.25)
      expect(budget.maxHeightDelta, `${id} height`).toBeGreaterThanOrEqual(0)
    }
  })

  /**
   * A budget below the slack allowance cannot ratchet — the tighter re-check would use a negative
   * bound and be skipped, so the route would silently stop being held to anything.
   */
  it('keeps every pixel budget above the slack allowance so the ratchet still applies', () => {
    const unratchetable = visualBudgets
      .filter(({ maxDiffPixelRatio }) => maxDiffPixelRatio <= MAX_BUDGET_SLACK)
      .map(({ project, route }) => `${route}/${project}`)

    expect(unratchetable).toEqual([])
  })

  it('requires an approved-deviation rationale to name its evidence', () => {
    for (const budget of visualBudgets.filter((entry) => entry.rationale === 'approved-deviation')) {
      expect(
        budget.note,
        `${budget.route}/${budget.project} is an approved deviation and must cite where the approval is recorded`,
      ).toMatch(/README|visual-parity|frontend-improvements|decisions/)
    }
  })

  it('names a golden exemplar for every route-owning archetype', () => {
    const owning = contentArchitectureContract.archetypes
      .filter(({ routePolicy }) => routePolicy === 'required')
      .map(({ id }) => id)
      // A redirect has no rendered page of its own to compare.
      .filter((id) => id !== 'redirect.temporary-contact')
      .sort()

    expect(goldenRouteTargets.map(({ archetype }) => archetype).sort()).toEqual(owning)
  })

  it('marks exactly the captured targets as captured', () => {
    const captured = goldenRouteTargets
      .filter(({ captured }) => captured)
      .map(({ name }) => name)
      .sort()

    expect(captured).toEqual(goldenRoutes.map(({ name }) => name).sort())
  })

  it('records how much archetype coverage is still uncaptured', () => {
    const pending = goldenRouteTargets.filter(({ captured }) => !captured)

    // Not a target to drive to zero silently — this asserts the known gap so that capturing a
    // reference, which needs the audited forwarder and human review, is a deliberate act.
    expect(pending.map(({ archetype }) => archetype).sort()).toEqual([
      'article.full',
      'index.market-coverage',
      'index.venue',
      'learning-video.public-detail',
      'page.conversion',
      'page.interactive-market-matrix',
      'page.landing',
      'page.legal',
      'page.standard',
      'person.public-profile',
    ])
  })
})
