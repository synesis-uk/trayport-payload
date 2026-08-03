// @vitest-environment node

import fs from 'node:fs'
import path from 'node:path'

import { migrationConfig } from '../../migration/lib/config'
import type { TargetRecord } from '../../migration/transform/types'
import { afterEach, describe, expect, it, vi } from 'vitest'

const loaderHarness = vi.hoisted(() => ({
  payload: null as unknown,
}))

vi.mock('@payload-config', () => ({
  default: Promise.resolve({}),
}))

vi.mock('payload', () => ({
  getPayload: async () => loaderHarness.payload,
}))

vi.mock('../../migration/load/marketData', () => ({
  loadMarketData: async () => ({
    importedRows: 0,
    scopeRowsAfterLoad: 0,
  }),
}))

import { inventoryProduction } from '../../migration/inventory'
import { isEquivalentPayloadData, load } from '../../migration/load'
import { transform } from '../../migration/transform'

const temporaryRunDirectories: string[] = []

const migrationRunDirectory = (runId: string): string => {
  const runDirectory = path.join(migrationConfig.workDir, runId)
  temporaryRunDirectories.push(runDirectory)
  fs.mkdirSync(path.join(runDirectory, 'reports'), { recursive: true })
  return runDirectory
}

afterEach(() => {
  for (const runDirectory of temporaryRunDirectories.splice(0)) {
    fs.rmSync(runDirectory, { recursive: true, force: true })
  }
})

describe('migration retry and artifact safety', () => {
  it('treats Payload-normalized ISO timestamps as equivalent migration data', () => {
    expect(
      isEquivalentPayloadData(
        {
          publishedAt: '2026-07-30T10:15:30.000Z',
          legacySource: {
            modifiedGmt: '2026-07-30T11:15:30.000+01:00',
          },
        },
        {
          publishedAt: '2026-07-30T10:15:30+00:00',
          legacySource: {
            modifiedGmt: '2026-07-30T10:15:30+00:00',
          },
        },
      ),
    ).toBe(true)

    expect(
      isEquivalentPayloadData(
        { publishedAt: '2026-07-30T10:15:31.000Z' },
        { publishedAt: '2026-07-30T10:15:30+00:00' },
      ),
    ).toBe(false)
  })

  it('repairs relationships on retry even when the first pass already stored the final hash', async () => {
    const runId = `relationship-retry-${process.pid}-${Date.now()}`
    const runDirectory = migrationRunDirectory(runId)
    const targets: TargetRecord[] = [
      {
        target: 'venues',
        legacy: {
          source: 'wordpress',
          legacyId: 1,
          originalUrl: 'http://trayport.local/venue/owner/',
          modifiedGmt: null,
          contentHash: '1'.repeat(64),
        },
        data: {
          title: 'Relationship owner',
          relatedVenue: {
            $legacyRef: 'venue',
            legacyId: 2,
          },
        },
      },
      {
        target: 'venues',
        legacy: {
          source: 'wordpress',
          legacyId: 2,
          originalUrl: 'http://trayport.local/venue/target/',
          modifiedGmt: null,
          contentHash: '2'.repeat(64),
        },
        data: {
          title: 'Relationship target',
        },
      },
    ]
    fs.writeFileSync(
      path.join(runDirectory, 'transformed.ndjson'),
      `${targets.map((target) => JSON.stringify(target)).join('\n')}\n`,
    )

    const documents = new Map<number, Record<string, unknown>>()
    let nextId = 100
    let interruptRelationshipPass = true
    const clone = <Value>(value: Value): Value => structuredClone(value)
    loaderHarness.payload = {
      create: async (args: Record<string, unknown>) => {
        const data = clone(args.data as Record<string, unknown>)
        const legacyId = (data.legacySource as TargetRecord['legacy']).legacyId
        const document = { id: ++nextId, ...data }
        documents.set(legacyId, document)
        return clone(document)
      },
      destroy: async () => undefined,
      find: async (args: Record<string, unknown>) => {
        const where = args.where as {
          and: Array<Record<string, { equals: number | string }>>
        }
        const legacyId = where.and[1]?.['legacySource.legacyId']?.equals
        const document = typeof legacyId === 'number' ? documents.get(legacyId) : undefined
        return { docs: document ? [clone(document)] : [] }
      },
      findGlobal: async () => {
        throw new Error('Unexpected global read')
      },
      update: async (args: Record<string, unknown>) => {
        const data = clone(args.data as Record<string, unknown>)
        const legacyId = (data.legacySource as TargetRecord['legacy']).legacyId
        const targetId = documents.get(2)?.id
        if (interruptRelationshipPass && data.relatedVenue === targetId) {
          interruptRelationshipPass = false
          throw new Error('Simulated interruption during relationship pass')
        }
        const current = documents.get(legacyId)
        if (!current) throw new Error(`Missing mock document ${legacyId}`)
        const document = { ...current, ...data }
        documents.set(legacyId, document)
        return clone(document)
      },
      updateGlobal: async () => {
        throw new Error('Unexpected global update')
      },
    }

    await expect(load({ publish: true, runId })).rejects.toThrow(
      'Simulated interruption during relationship pass',
    )
    expect(documents.get(1)?.relatedVenue).toBeUndefined()
    expect(
      (documents.get(1)?.legacySource as TargetRecord['legacy'] | undefined)?.contentHash,
    ).toBe('1'.repeat(64))

    await expect(load({ publish: true, runId })).resolves.toBeUndefined()

    expect(documents.get(1)?.relatedVenue).toBe(documents.get(2)?.id)
    const report = JSON.parse(
      fs.readFileSync(path.join(runDirectory, 'reports', 'load.json'), 'utf8'),
    )
    expect(report).toMatchObject({
      inserted: 0,
      updated: 1,
      unchanged: 1,
      unresolved: [],
    })
  })

  it('fails transformation instead of turning a missing listing path into the homepage URL', () => {
    const runId = `missing-listing-path-${process.pid}-${Date.now()}`
    const runDirectory = migrationRunDirectory(runId)
    fs.writeFileSync(
      path.join(runDirectory, 'source.ndjson'),
      `${JSON.stringify({
        schemaVersion: 1,
        entity: 'post',
        legacyId: 12_345,
        postType: 'post',
        status: 'publish',
        title: 'Listing article without a path',
        slug: 'listing-article-without-a-path',
        path: null,
        parentId: 0,
        menuOrder: 0,
        excerpt: '',
        content: '',
        publishedAt: null,
        modifiedAt: null,
        featuredMediaId: null,
        scopeRole: 'insights-listing',
        featuredOrder: null,
        taxonomies: { category: [] },
        acf: {},
      })}\n`,
    )

    expect(() => transform(runId)).toThrow(
      'Listing-only WordPress article 12345 has no source path',
    )
  })

  it('refuses to reuse an inventory run directory before contacting WordPress', () => {
    const runId = `existing-inventory-${process.pid}-${Date.now()}`
    const reportDirectory = path.join(migrationConfig.workDir, 'inventory', runId)
    const markerPath = path.join(reportDirectory, 'production-target-plan.json')
    const latestPath = path.join(migrationConfig.workDir, 'inventory', 'latest-run.txt')
    const latestBefore = fs.existsSync(latestPath) ? fs.readFileSync(latestPath, 'utf8') : null
    temporaryRunDirectories.push(reportDirectory)
    fs.mkdirSync(reportDirectory, { recursive: true })
    fs.writeFileSync(markerPath, 'stale evidence must not be overwritten\n')

    expect(() => inventoryProduction(runId)).toThrow(
      'Inventory run directory already exists; choose a new run ID',
    )
    expect(fs.readFileSync(markerPath, 'utf8')).toBe('stale evidence must not be overwritten\n')
    expect(fs.existsSync(latestPath) ? fs.readFileSync(latestPath, 'utf8') : null).toBe(
      latestBefore,
    )
  })
})
