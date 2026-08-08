// @vitest-environment node

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  GATE_ID,
  MINIMUM_BODY_CHARACTERS,
  bodyCharacters,
  isSourceEmpty,
  verifyArticleBodyOwnership,
  type ArticleBodySnapshot,
  type ArticleSource,
  type ArticleTarget,
} from '../../migration/gates/articleBodyOwnership'
import { contentArchitectureContract } from '../../migration/mappings/contentArchitecture'
import { readRunReport, resolveCompleteMigrationRun } from '../helpers/migrationRun'

const runDirectory = resolveCompleteMigrationRun()

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const readNDJSON = (name: string): Record<string, unknown>[] => {
  const file = path.join(runDirectory, name)
  // `transformed.ndjson` is not one of the reports `resolveCompleteMigrationRun` requires, so a run
  // can satisfy that check and still lack it. Fail loudly rather than measuring an empty corpus.
  if (!fs.existsSync(file)) {
    throw new Error(`${name} is missing from ${runDirectory}; the gate cannot measure the corpus.`)
  }
  return fs
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>)
}

const sha256 = (value: Buffer): string => crypto.createHash('sha256').update(value).digest('hex')

const sections = (acf: unknown): unknown[] => {
  if (!isRecord(acf)) return []
  if (Array.isArray(acf.sections)) return acf.sections
  const pageContent = acf.page_content
  if (isRecord(pageContent) && Array.isArray(pageContent.sections)) return pageContent.sections
  return []
}

const buildSnapshot = (): ArticleBodySnapshot => {
  const targets: ArticleTarget[] = readNDJSON('transformed.ndjson')
    .filter((record) => record.target === 'articles')
    .map((record) => {
      const data = isRecord(record.data) ? record.data : {}
      const legacy = isRecord(record.legacy) ? record.legacy : {}
      return {
        legacyId: Number(legacy.legacyId),
        path: typeof data.path === 'string' ? data.path : null,
        contentMode: String(data.contentMode ?? ''),
        externalDestination:
          typeof data.externalDestination === 'string' ? data.externalDestination : null,
        layout: Array.isArray(data.layout) ? data.layout : [],
      }
    })

  const articleIds = new Set(targets.map(({ legacyId }) => legacyId))
  const sources: ArticleSource[] = readNDJSON('source.ndjson')
    .filter((record) => record.entity === 'post' && articleIds.has(Number(record.legacyId)))
    .map((record) => ({
      legacyId: Number(record.legacyId),
      sections: sections(record.acf),
    }))

  const coverage = readRunReport<{ coverage: { droppedSections: ArticleBodySnapshot['droppedSections'] } }>(
    runDirectory,
    'transform-coverage.json',
  )

  return { targets, sources, droppedSections: coverage.coverage.droppedSections ?? [] }
}

const snapshot = buildSnapshot()

describe(GATE_ID, () => {
  it('reads a run whose transformed corpus matches its sealed evidence', () => {
    const marker = readRunReport<{ artifacts?: Record<string, { sha256?: string }> }>(
      runDirectory,
      'accepted-run.json',
    )
    const recorded = marker.artifacts?.['transformed.ndjson']?.sha256
    if (!recorded) return

    expect(sha256(fs.readFileSync(path.join(runDirectory, 'transformed.ndjson')))).toBe(recorded)
  })

  it('holds across the transformed corpus', () => {
    const verification = verifyArticleBodyOwnership(snapshot)

    expect(verification.failures, JSON.stringify(verification.details, null, 2)).toEqual([])
    expect(verification.status).toBe('passed')
  })

  it('separates the declared exceptions from every other article by a wide margin', () => {
    const measured = snapshot.targets
      .map((target) => ({ legacyId: target.legacyId, chars: bodyCharacters(target) }))
      .sort((left, right) => left.chars - right.chars)

    const declared = contentArchitectureContract.approvedProductionScope.sourceEmptyArticleBodies
    expect(measured.slice(0, declared.length).map(({ legacyId }) => legacyId).sort()).toEqual(
      declared.map(({ legacyId }) => legacyId).sort(),
    )

    // The threshold is not load-bearing: the declared exceptions render almost nothing and the next
    // article renders hundreds of characters, so anything inside that gap classifies identically.
    const smallestRealBody = measured[declared.length]?.chars ?? 0
    expect(smallestRealBody).toBeGreaterThan(MINIMUM_BODY_CHARACTERS * 4)
  })

  it('justifies every declared exception from its WordPress source', () => {
    const sourceById = new Map(snapshot.sources.map((source) => [source.legacyId, source]))

    for (const { legacyId, path: routePath } of contentArchitectureContract.approvedProductionScope
      .sourceEmptyArticleBodies) {
      const source = sourceById.get(legacyId)
      expect(source, `${legacyId} ${routePath} has no source record`).toBeDefined()
      expect(isSourceEmpty(source!), `${legacyId} ${routePath} source carries a body`).toBe(true)
    }
  })

  describe('drift detection', () => {
    it('fails when an undeclared article loses its body', () => {
      const victim = snapshot.targets.find(
        (target) => bodyCharacters(target) >= MINIMUM_BODY_CHARACTERS,
      )
      expect(victim).toBeDefined()

      const verification = verifyArticleBodyOwnership({
        ...snapshot,
        targets: snapshot.targets.map((target) =>
          target === victim ? { ...target, layout: [{ blockType: 'contentSection' }] } : target,
        ),
      })

      expect(verification.status).toBe('failed')
      expect(verification.failures).toContain('undeclared-textless-body: expected 0, received 1')
      expect(verification.details['undeclared-textless-body']?.[0]).toContain(
        `textless-body:${victim!.legacyId}`,
      )
    })

    it('fails when the transform drops a source section that carried content', () => {
      const verification = verifyArticleBodyOwnership({
        ...snapshot,
        droppedSections: [
          ...snapshot.droppedSections,
          { layout: 'paragraph', hadContent: true, scope: 'article' },
        ],
      })

      expect(verification.status).toBe('failed')
      expect(verification.failures).toContain(
        'dropped-non-empty-source-sections: expected 0, received 1',
      )
    })

    it('fails when a declared exception gains a body but stays on the list', () => {
      const declared = contentArchitectureContract.approvedProductionScope.sourceEmptyArticleBodies[0]
      const verification = verifyArticleBodyOwnership({
        ...snapshot,
        targets: snapshot.targets.map((target) =>
          target.legacyId === declared.legacyId
            ? {
                ...target,
                layout: [
                  ...target.layout,
                  {
                    blockType: 'contentSection',
                    text: 'A body long enough to clear the minimum body character threshold.',
                  },
                ],
              }
            : target,
        ),
      })

      expect(verification.status).toBe('failed')
      expect(verification.failures.join(' ')).toContain('declared-exceptions-still-empty')
    })

    it('fails when a declared exception is not justified by its source', () => {
      const declared = contentArchitectureContract.approvedProductionScope.sourceEmptyArticleBodies[0]
      const verification = verifyArticleBodyOwnership({
        ...snapshot,
        sources: snapshot.sources.map((source) =>
          source.legacyId === declared.legacyId
            ? { ...source, sections: [{ acf_fc_layout: 'paragraph', paragraph: 'Real copy.' }] }
            : source,
        ),
      })

      expect(verification.status).toBe('failed')
      expect(verification.failures).toContain(
        'declared-exception-source-has-body: expected 0, received 1',
      )
    })
  })
})
