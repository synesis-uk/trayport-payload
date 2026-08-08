/**
 * Gate: `article-detail-content-ownership`.
 *
 * "Every published internal article listing destination owns a complete Payload body, or is a
 * contract-declared source-empty legacy event; metadata-only records are non-routable or have an
 * explicit external destination or redirect."
 *
 * The obvious implementation — assert `layout.length > 0` — is worthless twice over. It duplicates
 * a rule `src/routing/archetypes.ts` already enforces at publish time, and it passes three articles
 * whose rendered body is empty. So this measures *rendered text* rather than block count, and it
 * measures the transform's own losses, which nothing did before:
 * `migration/transform/blocks.ts` drops a source section whenever its mapped component list comes
 * back empty, with no counter and no warning. A future body regression would have been silent.
 *
 * Three articles legitimately have no body. They are declared in the contract, and the gate
 * re-derives that emptiness from the WordPress source rather than taking the declaration's word for
 * it, so the exception list cannot become a place to hide defects.
 */
import { contentArchitectureContract } from '../mappings/contentArchitecture'
import { buildGateVerification, countAssertion, type GateVerification } from './ledger'

export const GATE_ID = 'article-detail-content-ownership'

/**
 * Minimum rendered body characters outside the hero for an article to count as having a body.
 *
 * The corpus separates cleanly: the three declared exceptions render 0, 0 and 6 characters, and the
 * next smallest article renders 274. Any threshold in that gap classifies identically, so the exact
 * value is not load-bearing — it is set well below the real floor so a genuinely short article is
 * never misread as empty.
 */
export const MINIMUM_BODY_CHARACTERS = 40

/** Blocks that frame a page rather than carry its body. */
const NON_BODY_BLOCKS = new Set(['trayportHero'])

export type ArticleTarget = {
  legacyId: number
  path: string | null
  contentMode: string
  externalDestination: string | null
  layout: unknown[]
}

export type ArticleSource = {
  legacyId: number
  /** Top-level ACF sections, from `acf.sections` or `acf.page_content.sections`. */
  sections: unknown[]
}

export type ArticleBodySnapshot = {
  targets: ArticleTarget[]
  sources: ArticleSource[]
  /**
   * `coverage.droppedSections` from the run's `transform-coverage.json`.
   *
   * Read from the transform rather than inferred by comparing section and block counts: layout
   * consolidation makes one source section legitimately produce several blocks, and an article
   * `header` section is consumed into the article header rather than emitted as a body block, so
   * any count-based comparison reports losses that did not happen.
   */
  droppedSections: Array<{ layout: string; hadContent: boolean; scope: string }>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

/** Every string under `text` keys, which is how both Lexical nodes and heading fields store copy. */
export const renderedText = (value: unknown): string => {
  const parts: string[] = []
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) return node.forEach(walk)
    if (!isRecord(node)) return
    if (typeof node.text === 'string') parts.push(node.text)
    for (const child of Object.values(node)) walk(child)
  }
  walk(value)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

export const bodyCharacters = (target: ArticleTarget): number =>
  renderedText(
    target.layout.filter(
      (block) => !(isRecord(block) && NON_BODY_BLOCKS.has(String(block.blockType))),
    ),
  ).length

/**
 * True when a WordPress record carries no authored body at all.
 *
 * Two shapes qualify, and both are checked against source rather than assumed: no sections, or
 * sections that exist but are unfilled ACF scaffolding. WordPress marks the latter with
 * `lipsum: "1"`, which is what legacy 2461 carries — a `stats-right` block whose paragraph is
 * empty, whose three stats have blank numbers and titles, and whose heading is the literal
 * placeholder "Header".
 */
export const isSourceEmpty = (source: ArticleSource): boolean => {
  if (source.sections.length === 0) return true

  const isPlaceholder = (node: unknown): boolean => {
    if (Array.isArray(node)) return node.some(isPlaceholder)
    if (!isRecord(node)) return false
    if (node.lipsum === '1' || node.lipsum === 1 || node.lipsum === true) return true
    return Object.values(node).some(isPlaceholder)
  }

  return source.sections.every(isPlaceholder)
}

const expectedArticleCount = (): number =>
  contentArchitectureContract.approvedProductionScope.routeOwners
    .filter(({ targetOwner }) => targetOwner === 'articles')
    .reduce((total, { count }) => total + count, 0)

export const verifyArticleBodyOwnership = (snapshot: ArticleBodySnapshot): GateVerification => {
  const assertions = []
  const details: Record<string, string[]> = {}

  const declared = contentArchitectureContract.approvedProductionScope.sourceEmptyArticleBodies
  const declaredIds = new Set(declared.map(({ legacyId }) => legacyId))
  const sourceById = new Map(snapshot.sources.map((source) => [source.legacyId, source]))

  // 1. The corpus holds exactly the article route owners the contract approved.
  assertions.push(
    countAssertion('article-route-owners', expectedArticleCount(), snapshot.targets.length),
  )

  // 2. No article has an empty layout. Retained as a ledger row, not as the gate's substance —
  //    `archetypes.ts` already rejects this at publish time.
  const emptyLayout = snapshot.targets.filter(({ layout }) => layout.length === 0)
  assertions.push(countAssertion('empty-layout-articles', 0, emptyLayout.length))
  details['empty-layout-articles'] = emptyLayout.map(({ legacyId, path }) => `${legacyId} ${path}`)

  // 3. Every article with no rendered body is one the contract declared.
  const textless = snapshot.targets.filter(
    (target) => bodyCharacters(target) < MINIMUM_BODY_CHARACTERS,
  )
  const undeclared = textless.filter(({ legacyId }) => !declaredIds.has(legacyId))
  assertions.push(countAssertion('undeclared-textless-body', 0, undeclared.length))
  details['undeclared-textless-body'] = undeclared.map(
    (target) => `textless-body:${target.legacyId} ${target.path} (${bodyCharacters(target)} chars)`,
  )

  // 4. The exception list is exactly the size of the problem — a declared exception that has since
  //    gained a body must be removed, or the list quietly grows stale.
  const stillEmpty = declared.filter(({ legacyId }) =>
    textless.some((target) => target.legacyId === legacyId),
  )
  assertions.push(countAssertion('declared-exceptions-still-empty', declared.length, stillEmpty.length))
  details['declared-exceptions-still-empty'] = declared
    .filter(({ legacyId }) => !stillEmpty.some((entry) => entry.legacyId === legacyId))
    .map(({ legacyId, path }) => `${legacyId} ${path} now renders a body; remove the exception`)

  // 5. Every declared exception is justified by its WordPress source. This is what stops the list
  //    from becoming a dumping ground: an entry whose source does carry a body fails the gate.
  const unjustified = declared.filter(({ legacyId }) => {
    const source = sourceById.get(legacyId)
    return !source || !isSourceEmpty(source)
  })
  assertions.push(countAssertion('declared-exception-source-has-body', 0, unjustified.length))
  details['declared-exception-source-has-body'] = unjustified.map(
    ({ legacyId, path }) => `${legacyId} ${path} source carries an authored body`,
  )

  // 6. The transform lost nothing. `blocks.ts` discards a source section whose mapped component
  //    list comes back empty; that is correct for an unfilled stub and a content loss for anything
  //    else, and the transform now records which it was.
  const lossy = snapshot.droppedSections.filter(({ hadContent }) => hadContent)
  assertions.push(countAssertion('dropped-non-empty-source-sections', 0, lossy.length))
  details['dropped-non-empty-source-sections'] = lossy.map(
    ({ layout, scope }) => `${scope} section '${layout}' carried content but mapped to no block`,
  )

  // 7. Metadata-only articles stay non-routable. Vacuous today — the corpus holds none — and
  //    recorded as such rather than presented as coverage.
  const listingArticles = snapshot.targets.filter(({ contentMode }) => contentMode === 'listing')
  const routableListing = listingArticles.filter(
    (target) => Boolean(target.path) || (!target.externalDestination && target.layout.length > 0),
  )
  assertions.push(countAssertion('routable-listing-articles', 0, routableListing.length))
  details['routable-listing-articles'] = routableListing.map(
    ({ legacyId, path }) => `${legacyId} ${path}`,
  )

  return buildGateVerification(GATE_ID, assertions, details)
}
