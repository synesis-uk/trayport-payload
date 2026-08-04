import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import sharp from 'sharp'
import { afterEach, describe, expect, it } from 'vitest'

import { sourceMediaSchema } from '../../migration/contracts/v1'
import { safeSourceFile } from '../../migration/load'
import {
  assertMediaRecoveryEvidenceMatchesSource,
  parseMediaRecoveryEvidence,
  recoveryEvidenceForMedia,
} from '../../migration/lib/mediaRecoveryEvidence'
import {
  mediaRecordFromEvidence,
  normalizeMediaRecoveryOrigin,
  readRecoveryResponseBody,
  recoverMediaRecord,
  verifiedRecoveryResult,
} from '../../migration/recover-media'
import type { TargetRecord } from '../../migration/transform/types'

const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { force: true, recursive: true })
  }
})

describe('WordPress media recovery', () => {
  it('recovers an explicitly selected image with origin, path, MIME, dimensions, size, and hash evidence', async () => {
    const body = await sharp({
      create: {
        background: { alpha: 1, b: 120, g: 80, r: 40 },
        channels: 4,
        height: 4,
        width: 8,
      },
    })
      .jpeg()
      .toBuffer()
    const record = sourceMediaSchema.parse({
      schemaVersion: 1,
      entity: 'media',
      legacyId: 9727,
      title: 'Recovered source image',
      alt: '',
      altSource: 'title-fallback',
      decorative: false,
      needsAltReview: true,
      caption: '',
      description: '',
      mimeType: 'image/jpeg',
      fileSize: body.length,
      fileHash: null,
      url: 'http://trayport.local/app/uploads/2024/12/recovered-source.jpeg',
      relativePath: '2024/12/recovered-source.jpeg',
      recoveryURL: null,
      width: 8,
      height: 4,
      availability: 'unavailable',
      availabilityReason: 'missing-or-unreadable-local-file',
    })
    const recoveryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trayport-media-recovery-'))
    temporaryDirectories.push(recoveryRoot)

    const recovered = await recoverMediaRecord(
      record,
      'https://assets.example.test',
      recoveryRoot,
      async (input) => {
        expect(String(input)).toBe(
          'https://assets.example.test/app/uploads/2024/12/recovered-source.jpeg',
        )
        return new Response(body, {
          headers: {
            'content-length': String(body.length),
            'content-type': 'image/jpeg',
          },
        })
      },
    )

    expect(recovered.record).toMatchObject({
      availability: 'recovered',
      availabilityReason: null,
      fileHash: crypto.createHash('sha256').update(body).digest('hex'),
      fileSize: body.length,
      recoveryURL: 'https://assets.example.test/app/uploads/2024/12/recovered-source.jpeg',
    })
    expect(fs.readFileSync(path.join(recoveryRoot, record.relativePath!))).toEqual(body)
  })

  it('rejects unsafe origins and a response whose bytes do not match WordPress metadata', async () => {
    expect(() => normalizeMediaRecoveryOrigin('http://assets.example.test')).toThrow(/HTTPS/)
    expect(() => normalizeMediaRecoveryOrigin('https://user@example.test/assets')).toThrow(
      /credentials, a path/,
    )

    const body = await sharp({
      create: {
        background: { alpha: 1, b: 0, g: 0, r: 0 },
        channels: 4,
        height: 2,
        width: 2,
      },
    })
      .png()
      .toBuffer()
    const record = sourceMediaSchema.parse({
      schemaVersion: 1,
      entity: 'media',
      legacyId: 9698,
      title: 'Mismatched source image',
      alt: '',
      altSource: 'title-fallback',
      decorative: false,
      needsAltReview: true,
      caption: '',
      description: '',
      mimeType: 'image/png',
      fileSize: body.length + 1,
      fileHash: null,
      url: 'http://trayport.local/app/uploads/2024/12/mismatched.png',
      relativePath: '2024/12/mismatched.png',
      width: 2,
      height: 2,
      availability: 'unavailable',
      availabilityReason: 'missing-or-unreadable-local-file',
    })
    const recoveryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trayport-media-recovery-'))
    temporaryDirectories.push(recoveryRoot)

    await expect(
      recoverMediaRecord(record, 'https://assets.example.test', recoveryRoot, async () =>
        Promise.resolve(
          new Response(body, {
            headers: { 'content-type': 'image/png' },
          }),
        ),
      ),
    ).rejects.toThrow(/expected/)
  })

  it('enforces the streaming byte cap even when the response omits content-length', async () => {
    const response = new Response(
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(Uint8Array.from([1, 2, 3]))
          controller.enqueue(Uint8Array.from([4, 5, 6]))
          controller.close()
        },
      }),
    )

    await expect(readRecoveryResponseBody(response, 9727, 4)).rejects.toThrow(/byte limit/i)
  })

  it('requires deterministic complete provenance for every recovered source record', () => {
    const recovered = ([9698, 9727] as const).map((legacyId, index) =>
      sourceMediaSchema.parse({
        schemaVersion: 1,
        entity: 'media',
        legacyId,
        title: `Recovered ${legacyId}`,
        alt: '',
        altSource: 'title-fallback',
        decorative: false,
        needsAltReview: true,
        caption: '',
        description: '',
        mimeType: 'image/jpeg',
        fileSize: 100 + index,
        fileHash: String(index + 1).repeat(64),
        url: `http://trayport.local/app/uploads/2024/12/${legacyId}.jpeg`,
        relativePath: `2024/12/${legacyId}.jpeg`,
        recoveryURL: `https://assets.example.test/app/uploads/2024/12/${legacyId}.jpeg`,
        width: 8,
        height: 4,
        availability: 'recovered',
        availabilityReason: null,
      }),
    )
    const evidence = recovered.map(recoveryEvidenceForMedia)
    const manifest = {
      mediaRecovery: { origin: 'https://assets.example.test', records: evidence },
    }

    expect(() => assertMediaRecoveryEvidenceMatchesSource(recovered, manifest)).not.toThrow()
    expect(() =>
      assertMediaRecoveryEvidenceMatchesSource(recovered, {
        mediaRecovery: { origin: 'https://assets.example.test', records: evidence.slice(0, 1) },
      }),
    ).toThrow(/does not match source\.ndjson/i)
    expect(() =>
      parseMediaRecoveryEvidence({
        mediaRecovery: { origin: 'https://assets.example.test', records: [...evidence].reverse() },
      }),
    ).toThrow(/sorted by legacy ID/i)
  })

  it('repairs a manifest-ahead interrupted commit and replays its verified binary', async () => {
    const body = await sharp({
      create: {
        background: { alpha: 1, b: 10, g: 20, r: 30 },
        channels: 4,
        height: 4,
        width: 8,
      },
    })
      .jpeg()
      .toBuffer()
    const sourceRecord = sourceMediaSchema.parse({
      schemaVersion: 1,
      entity: 'media',
      legacyId: 9727,
      title: 'Interrupted source image',
      alt: '',
      altSource: 'title-fallback',
      decorative: false,
      needsAltReview: true,
      caption: '',
      description: '',
      mimeType: 'image/jpeg',
      fileSize: body.length,
      fileHash: null,
      url: 'http://trayport.local/app/uploads/2024/12/interrupted.jpeg',
      relativePath: '2024/12/interrupted.jpeg',
      recoveryURL: null,
      width: 8,
      height: 4,
      availability: 'unavailable',
      availabilityReason: 'missing-or-unreadable-local-file',
    })
    const evidence = {
      fileHash: crypto.createHash('sha256').update(body).digest('hex'),
      fileSize: body.length,
      legacyId: 9727,
      recoveryURL: 'https://assets.example.test/app/uploads/2024/12/interrupted.jpeg',
      relativePath: '2024/12/interrupted.jpeg',
    }
    const recoveryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trayport-media-recovery-'))
    temporaryDirectories.push(recoveryRoot)
    const binaryPath = path.join(recoveryRoot, evidence.relativePath)
    fs.mkdirSync(path.dirname(binaryPath), { recursive: true })
    fs.writeFileSync(binaryPath, body)

    const repaired = mediaRecordFromEvidence(sourceRecord, evidence, 'https://assets.example.test')
    expect(repaired.availability).toBe('recovered')
    expect(verifiedRecoveryResult(repaired, 'https://assets.example.test', recoveryRoot)).toEqual(
      evidence,
    )
  })

  it('loads recovered media only from the run-local directory and rechecks its hash', async () => {
    const runDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'trayport-recovered-loader-'))
    temporaryDirectories.push(runDirectory)
    const relativePath = '2024/12/recovered.jpeg'
    const body = Buffer.from('verified recovered media')
    const sourcePath = path.join(runDirectory, 'recovered-media', relativePath)
    fs.mkdirSync(path.dirname(sourcePath), { recursive: true })
    fs.writeFileSync(sourcePath, body)
    const fileHash = crypto.createHash('sha256').update(body).digest('hex')
    const record: TargetRecord = {
      target: 'media',
      legacy: {
        source: 'wordpress',
        legacyId: 9727,
        originalUrl: 'http://trayport.local/app/uploads/2024/12/recovered.jpeg',
        modifiedGmt: null,
        contentHash: '1'.repeat(64),
      },
      data: {
        source: {
          availability: 'recovered',
          fileHash,
          mimeType: 'image/jpeg',
          relativePath,
        },
      },
    }

    await expect(safeSourceFile(record, runDirectory)).resolves.toBe(sourcePath)
    fs.writeFileSync(sourcePath, 'changed')
    await expect(safeSourceFile(record, runDirectory)).rejects.toThrow(/changed after extraction/i)
  })
})
