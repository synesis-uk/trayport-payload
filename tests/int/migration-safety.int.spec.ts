// @vitest-environment node

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import {
  acceptedRunMarkerName,
  acceptedRunSupportArtifactPaths,
  sealAcceptedRun,
} from '../../migration/lib/acceptedRun'
import { migrationConfig } from '../../migration/lib/config'
import type { TargetRecord } from '../../migration/transform/types'
import { afterEach, describe, expect, it, vi } from 'vitest'

const loaderHarness = vi.hoisted(() => ({
  marketLoads: 0,
  payload: null as unknown,
  payloadStarts: 0,
}))
const migrationProcessHarness = vi.hoisted(() => ({
  run: vi.fn((_command: string, _args: string[]) => ({ stderr: '', stdout: '' })),
}))

vi.mock('@payload-config', () => ({
  default: Promise.resolve({}),
}))

vi.mock('payload', () => ({
  getPayload: async () => {
    loaderHarness.payloadStarts += 1
    return loaderHarness.payload
  },
}))

vi.mock('../../migration/load/marketData', () => ({
  loadMarketData: async () => {
    loaderHarness.marketLoads += 1
    return {
      importedRows: 0,
      scopeRowsAfterLoad: 0,
    }
  },
}))

vi.mock('../../migration/lib/process', () => ({
  run: migrationProcessHarness.run,
}))

import { extract } from '../../migration/extract'
import { inventoryProduction } from '../../migration/inventory'
import { isEquivalentPayloadData, load } from '../../migration/load'
import { transform } from '../../migration/transform'
import {
  assertTransformedDataChartContracts,
  assertTransformedReferenceClosure,
  validateRun,
} from '../../migration/validate'

const temporaryRunDirectories: string[] = []

const migrationRunDirectory = (runId: string): string => {
  const runDirectory = path.join(migrationConfig.workDir, runId)
  temporaryRunDirectories.push(runDirectory)
  fs.mkdirSync(path.join(runDirectory, 'reports'), { recursive: true })
  return runDirectory
}

const acceptSyntheticRun = (runId: string, runDirectory: string, targets: TargetRecord[]): void => {
  const sourceText = '{}\n'
  fs.writeFileSync(path.join(runDirectory, 'source.ndjson'), sourceText)
  fs.writeFileSync(
    path.join(runDirectory, 'source-manifest.json'),
    `${JSON.stringify({
      runId,
      sourceHash: crypto.createHash('sha256').update(sourceText).digest('hex'),
    })}\n`,
  )
  fs.writeFileSync(
    path.join(runDirectory, 'transformed.ndjson'),
    `${targets.map((target) => JSON.stringify(target)).join('\n')}\n`,
  )
  fs.writeFileSync(path.join(runDirectory, 'market-volume.ndjson'), '')
  fs.writeFileSync(
    path.join(runDirectory, 'reports', 'acceptance-source.json'),
    `${JSON.stringify({ ok: true, runId, checks: {} })}\n`,
  )
  fs.writeFileSync(
    path.join(runDirectory, 'reports', 'acceptance-transform.json'),
    `${JSON.stringify({ ok: true, runId, checks: {} })}\n`,
  )
  fs.writeFileSync(
    path.join(runDirectory, 'reports', 'content-review.json'),
    `${JSON.stringify({ runId })}\n`,
  )
  fs.writeFileSync(
    path.join(runDirectory, 'reports', 'transform-coverage.json'),
    `${JSON.stringify({ runId })}\n`,
  )
  sealAcceptedRun(runId, runDirectory)
}

afterEach(() => {
  for (const runDirectory of temporaryRunDirectories.splice(0)) {
    fs.rmSync(runDirectory, { recursive: true, force: true })
  }
  loaderHarness.marketLoads = 0
  loaderHarness.payloadStarts = 0
  loaderHarness.payload = null
  migrationProcessHarness.run.mockReset()
  migrationProcessHarness.run.mockReturnValue({ stderr: '', stdout: '' })
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

  it('retries safely after relationship-owner skeletons have established stable IDs', async () => {
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
          marketConnections: [
            {
              connectionType: 'd',
              hub: {
                $legacyRef: 'venue',
                legacyId: 2,
              },
            },
          ],
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
    acceptSyntheticRun(runId, runDirectory, targets)

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
    expect(documents.get(1)?.marketConnections).toBeUndefined()
    expect(
      (documents.get(1)?.legacySource as TargetRecord['legacy'] | undefined)?.contentHash,
    ).toBeNull()

    await expect(load({ publish: true, runId })).resolves.toBeUndefined()

    expect(documents.get(1)?.relatedVenue).toBe(documents.get(2)?.id)
    expect(documents.get(1)?.marketConnections).toEqual([
      {
        connectionType: 'd',
        hub: documents.get(2)?.id,
      },
    ])
    const report = JSON.parse(
      fs.readFileSync(path.join(runDirectory, 'reports', 'load.json'), 'utf8'),
    )
    expect(report).toMatchObject({
      inserted: 0,
      updated: 2,
      unchanged: 0,
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
    expect(fs.existsSync(path.join(runDirectory, 'reports', acceptedRunMarkerName))).toBe(false)
  })

  it('rejects an unaccepted run before starting Payload or market writes', async () => {
    const runId = `unaccepted-load-${process.pid}-${Date.now()}`
    const runDirectory = migrationRunDirectory(runId)
    fs.writeFileSync(path.join(runDirectory, 'transformed.ndjson'), '')

    await expect(load({ runId })).rejects.toThrow(`Migration run ${runId} is not accepted`)
    expect(loaderHarness.payloadStarts).toBe(0)
    expect(loaderHarness.marketLoads).toBe(0)
  })

  it('preflights every media source before Payload or market writes', async () => {
    const runId = `missing-media-preflight-${process.pid}-${Date.now()}`
    const runDirectory = migrationRunDirectory(runId)
    acceptSyntheticRun(runId, runDirectory, [
      {
        target: 'media',
        legacy: {
          source: 'wordpress',
          legacyId: 999_991,
          originalUrl: 'http://trayport.local/missing-media.png',
          modifiedGmt: null,
          contentHash: 'a'.repeat(64),
        },
        data: {
          sourceFileHash: 'b'.repeat(64),
          source: {
            availability: 'local',
            fileHash: 'b'.repeat(64),
            mimeType: 'image/png',
            relativePath: '__codex_missing_media__/missing-media.png',
          },
        },
      },
    ])

    await expect(load({ runId })).rejects.toThrow(/missing media source/i)
    expect(loaderHarness.payloadStarts).toBe(0)
    expect(loaderHarness.marketLoads).toBe(0)
  })

  it('rejects an uploads symlink that resolves outside the real uploads root', async () => {
    const runId = `symlink-media-preflight-${process.pid}-${Date.now()}`
    const runDirectory = migrationRunDirectory(runId)
    const uploadsRoot = path.join(runDirectory, 'uploads')
    const outsideFile = path.join(runDirectory, 'outside.png')
    const sourceBytes = Buffer.from('not-really-an-image')
    fs.mkdirSync(uploadsRoot)
    fs.writeFileSync(outsideFile, sourceBytes)
    fs.symlinkSync(outsideFile, path.join(uploadsRoot, 'escape.png'))
    acceptSyntheticRun(runId, runDirectory, [
      {
        target: 'media',
        legacy: {
          source: 'wordpress',
          legacyId: 999_992,
          originalUrl: 'http://trayport.local/escape.png',
          modifiedGmt: null,
          contentHash: 'c'.repeat(64),
        },
        data: {
          sourceFileHash: crypto.createHash('sha256').update(sourceBytes).digest('hex'),
          source: {
            availability: 'local',
            fileHash: crypto.createHash('sha256').update(sourceBytes).digest('hex'),
            mimeType: 'image/png',
            relativePath: 'escape.png',
          },
        },
      },
    ])

    const configuredUploads = migrationConfig.source.uploads
    migrationConfig.source.uploads = uploadsRoot
    try {
      await expect(load({ runId })).rejects.toThrow(/unsafe media source path/i)
    } finally {
      migrationConfig.source.uploads = configuredUploads
    }
    expect(loaderHarness.payloadStarts).toBe(0)
    expect(loaderHarness.marketLoads).toBe(0)
  })

  it('binds every importer-owned write support artifact into the accepted marker', () => {
    const runId = `support-artifact-${process.pid}-${Date.now()}`
    const runDirectory = migrationRunDirectory(runId)
    acceptSyntheticRun(runId, runDirectory, [])
    const marker = JSON.parse(
      fs.readFileSync(path.join(runDirectory, 'reports', acceptedRunMarkerName), 'utf8'),
    ) as {
      schemaVersion?: number
      supportArtifacts?: Record<string, string>
    }

    expect(marker.schemaVersion).toBe(3)
    expect(acceptedRunSupportArtifactPaths).toEqual([
      'migration/assets/missing-media.svg',
      'migration/sql/001_market_volume_monthly.sql',
    ])
    for (const artifactPath of acceptedRunSupportArtifactPaths) {
      expect(marker.supportArtifacts?.[artifactPath]).toMatch(/^[a-f0-9]{64}$/)
    }
  })

  it('rejects artifacts changed after acceptance before starting any write', async () => {
    const runId = `tampered-load-${process.pid}-${Date.now()}`
    const runDirectory = migrationRunDirectory(runId)
    acceptSyntheticRun(runId, runDirectory, [])
    fs.appendFileSync(path.join(runDirectory, 'transformed.ndjson'), '{}\n')

    await expect(load({ dryRun: true, runId })).rejects.toThrow(
      'Accepted migration artifact changed after validation: transformed.ndjson',
    )
    expect(loaderHarness.payloadStarts).toBe(0)
    expect(loaderHarness.marketLoads).toBe(0)
  })

  it('keeps accepted run artifacts immutable across transformation retries', () => {
    const runId = `immutable-transform-${process.pid}-${Date.now()}`
    const runDirectory = migrationRunDirectory(runId)
    acceptSyntheticRun(runId, runDirectory, [])

    expect(() => transform(runId)).toThrow(`Migration run ${runId} is already accepted`)
  })

  it('does not let validation re-bless an artifact changed after acceptance', () => {
    const runId = `tampered-validation-${process.pid}-${Date.now()}`
    const runDirectory = migrationRunDirectory(runId)
    acceptSyntheticRun(runId, runDirectory, [])
    const sourceAcceptancePath = path.join(runDirectory, 'reports', 'acceptance-source.json')
    const tamperedReport = `${JSON.stringify({ ok: true, runId, checks: { tampered: true } })}\n`
    fs.writeFileSync(sourceAcceptancePath, tamperedReport)

    expect(() => validateRun(runId)).toThrow(
      'Accepted migration artifact changed after validation: reports/acceptance-source.json',
    )
    expect(fs.readFileSync(sourceAcceptancePath, 'utf8')).toBe(tamperedReport)
  })

  it('treats validation of an accepted run as verification-only', () => {
    const runId = `accepted-validation-${process.pid}-${Date.now()}`
    const runDirectory = migrationRunDirectory(runId)
    acceptSyntheticRun(runId, runDirectory, [])
    const sourceAcceptancePath = path.join(runDirectory, 'reports', 'acceptance-source.json')
    const before = fs.readFileSync(sourceAcceptancePath, 'utf8')

    expect(() => validateRun(runId)).not.toThrow()
    expect(fs.readFileSync(sourceAcceptancePath, 'utf8')).toBe(before)
  })

  it('rejects duplicate target identities and unresolved relationship tokens', () => {
    const owner: TargetRecord = {
      target: 'pages',
      legacy: {
        source: 'wordpress',
        legacyId: 1,
        originalUrl: 'http://trayport.local/owner/',
        modifiedGmt: null,
        contentHash: '1'.repeat(64),
      },
      data: { title: 'Owner' },
    }
    expect(() => assertTransformedReferenceClosure([owner, structuredClone(owner)])).toThrow(
      /duplicate transformed target identity/i,
    )
    expect(() =>
      assertTransformedReferenceClosure([
        owner,
        {
          ...structuredClone(owner),
          legacy: { ...owner.legacy, legacyId: 2 },
          data: {
            media: { $legacyRef: 'media', legacyId: 404 },
          },
        },
      ]),
    ).toThrow(/unresolved transformed relationship media:404/i)
  })

  it('requires transformed data charts to use a managed relationship and a complete valid range', () => {
    const legacy = (legacyId: number) => ({
      contentHash: String(legacyId).padStart(64, '0'),
      legacyId,
      modifiedGmt: null,
      originalUrl: `http://trayport.local/${legacyId}/`,
      source: 'wordpress' as const,
    })
    const chart = {
      assetClass: { $legacyRef: 'asset-class', legacyId: 21 },
      assetClassLegacyId: 21,
      blockType: 'dataChart',
      chartType: 'stackedColumn',
      dataType: 'volume',
      displayInterval: 'quarter',
      excludedHubs: [],
      fromQuarter: 1,
      fromYear: 2024,
      includedHubs: [],
      seriesDimension: 'executionType',
      toQuarter: 4,
      toYear: 2025,
    }
    const targetsFor = (dataChart: Record<string, unknown>): TargetRecord[] => [
      { data: { title: 'Power' }, legacy: legacy(21), target: 'asset-classes' },
      { data: { title: 'A hub' }, legacy: legacy(2500), target: 'hubs' },
      {
        data: {
          layout: [
            {
              blockType: 'contentSection',
              columns: [{ components: [dataChart] }],
            },
          ],
        },
        legacy: legacy(1),
        target: 'pages',
      },
    ]

    expect(assertTransformedDataChartContracts(targetsFor(chart))).toBe(1)
    expect(() =>
      assertTransformedDataChartContracts(
        targetsFor({ ...chart, assetClass: null, assetClassLegacyId: null }),
      ),
    ).toThrow(/managed asset-class relationship/i)
    expect(() =>
      assertTransformedDataChartContracts(targetsFor({ ...chart, toQuarter: undefined })),
    ).toThrow(/complete range or no range/i)
    expect(() =>
      assertTransformedDataChartContracts(targetsFor({ ...chart, fromQuarter: 5 })),
    ).toThrow(/quarters from 1 through 4/i)
    expect(() =>
      assertTransformedDataChartContracts(targetsFor({ ...chart, fromYear: 1999 })),
    ).toThrow(/years from 2000 through 2100/i)
    expect(() =>
      assertTransformedDataChartContracts(
        targetsFor({ ...chart, fromQuarter: 4, fromYear: 2025, toQuarter: 1, toYear: 2025 }),
      ),
    ).toThrow(/must not start after it ends/i)
    expect(() =>
      assertTransformedDataChartContracts(
        targetsFor({
          ...chart,
          fromQuarter: null,
          fromYear: null,
          toQuarter: null,
          toYear: null,
        }),
      ),
    ).toThrow(/must omit all range fields/i)
    expect(() =>
      assertTransformedDataChartContracts(targetsFor({ ...chart, chartType: 'column' })),
    ).toThrow(/execution-type.*volume stacked columns/i)
    expect(() =>
      assertTransformedDataChartContracts(
        targetsFor({
          ...chart,
          includedHubs: [{ $legacyRef: 'hub', legacyId: 2500 }],
        }),
      ),
    ).toThrow(/execution-type.*cannot filter hubs/i)
    expect(() =>
      assertTransformedDataChartContracts(
        targetsFor({
          ...chart,
          chartType: 'line',
          dataType: 'price',
          excludedHubs: [{ $legacyRef: 'hub', legacyId: 2500 }],
          includedHubs: [{ $legacyRef: 'hub', legacyId: 2500 }],
          seriesDimension: 'hub',
        }),
      ),
    ).toThrow(/cannot include and exclude the same hub/i)
    expect(() =>
      assertTransformedDataChartContracts(
        targetsFor({ ...chart, chartType: 'column', dataType: 'price', seriesDimension: 'hub' }),
      ),
    ).toThrow(/hub data chart.*volume columns or a price line/i)
  })

  it('refuses to reuse an extraction run directory before contacting WordPress', () => {
    const runId = `existing-extract-${process.pid}-${Date.now()}`
    const runDirectory = migrationRunDirectory(runId)
    const markerPath = path.join(runDirectory, 'source.ndjson')
    const latestPath = path.join(migrationConfig.workDir, 'latest-run.txt')
    const latestBefore = fs.existsSync(latestPath) ? fs.readFileSync(latestPath, 'utf8') : null
    fs.writeFileSync(markerPath, 'stale evidence must not be overwritten\n')

    expect(() => extract(runId)).toThrow(`Migration run ${runId} already exists`)
    expect(fs.readFileSync(markerPath, 'utf8')).toBe('stale evidence must not be overwritten\n')
    expect(fs.existsSync(latestPath) ? fs.readFileSync(latestPath, 'utf8') : null).toBe(
      latestBefore,
    )
  })

  it('does not advance the latest-run pointer when source acceptance fails', () => {
    const runId = `rejected-extract-${process.pid}-${Date.now()}`
    const runDirectory = path.join(migrationConfig.workDir, runId)
    temporaryRunDirectories.push(runDirectory)
    const latestPath = path.join(migrationConfig.workDir, 'latest-run.txt')
    const latestBefore = fs.existsSync(latestPath) ? fs.readFileSync(latestPath, 'utf8') : null
    const manifest = {
      schemaVersion: 1,
      entity: 'manifest',
      source: {
        home: 'http://trayport.local',
        site: 'http://trayport.local',
        tablePrefix: 'wp_',
        wordpressVersion: '6.8.2',
        acfVersion: '6.4.2',
      },
      rootIds: [
        1898, 1924, 1926, 2203, 2205, 2495, 3311, 3363, 7609, 8454, 9244, 9248, 9351, 10030,
      ],
    }
    migrationProcessHarness.run.mockImplementation((_command, args) => ({
      stderr: '',
      stdout: args.includes('eval-file') ? `${JSON.stringify(manifest)}\n` : '',
    }))

    expect(() => extract(runId)).toThrow()
    expect(fs.existsSync(path.join(runDirectory, 'reports', 'acceptance-source.json'))).toBe(false)
    expect(fs.existsSync(latestPath) ? fs.readFileSync(latestPath, 'utf8') : null).toBe(
      latestBefore,
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
