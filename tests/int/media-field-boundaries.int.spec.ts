// @vitest-environment node

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { Media } from '@/collections/Media'
import { imageOrVideoUploadField, imageUploadField, videoUploadField } from '@/fields/mediaUpload'
import { describe, expect, it, vi } from 'vitest'

type SingleUploadField = ReturnType<typeof imageUploadField>

const validationOptions = (findByID = vi.fn()) => {
  const req = {
    payload: {
      findByID,
    },
  }

  return {
    findByID,
    options: { req } as never,
    req,
  }
}

const validate = async (field: SingleUploadField, value: unknown, options: never) => {
  if (typeof field.validate !== 'function') throw new Error('Expected a server validator')
  return field.validate(value, options)
}

const schemaFiles = [
  '../../src/blocks/Trayport/components.ts',
  '../../src/blocks/Trayport/config.ts',
  '../../src/collections/Articles.ts',
  '../../src/collections/Hubs.ts',
  '../../src/collections/LearningVideos.ts',
  '../../src/collections/Media.ts',
  '../../src/collections/Venues.ts',
  '../../src/fields/seo.ts',
  '../../src/globals/Footer.ts',
  '../../src/globals/Navigation.ts',
  '../../src/globals/SiteSettings.ts',
] as const

describe('visual media field boundaries', () => {
  it('filters the editor picker to the MIME families supported by each field', () => {
    expect(imageUploadField({ name: 'image' }).filterOptions).toEqual({
      mimeType: { contains: 'image/' },
    })
    expect(videoUploadField({ name: 'video' }).filterOptions).toEqual({
      mimeType: { contains: 'video/' },
    })
    expect(imageOrVideoUploadField({ name: 'media' }).filterOptions).toEqual({
      or: [{ mimeType: { contains: 'image/' } }, { mimeType: { contains: 'video/' } }],
    })
  })

  it('rejects documents and unsupported MIME types even when API callers bypass the editor filter', async () => {
    const mimeTypes = new Map<number, string>([
      [1, 'image/webp'],
      [2, 'video/mp4'],
      [3, 'image/avif'],
      [4, 'video/webm'],
      [5, 'application/pdf'],
      [6, 'video/mp4'],
      [7, 'application/octet-stream'],
    ])
    const { options } = validationOptions(
      vi.fn(({ id }: { id: number }) => Promise.resolve({ id, mimeType: mimeTypes.get(id) })),
    )
    const image = imageUploadField({ name: 'image' })
    const visualMedia = imageOrVideoUploadField({ name: 'media' })
    const video = videoUploadField({ name: 'video' })

    await expect(validate(image, { id: 1, mimeType: 'image/webp' }, options)).resolves.toBe(true)
    await expect(validate(image, { id: 2, mimeType: 'video/mp4' }, options)).resolves.toEqual(
      expect.any(String),
    )
    await expect(validate(visualMedia, { id: 3, mimeType: 'image/avif' }, options)).resolves.toBe(
      true,
    )
    await expect(validate(visualMedia, { id: 4, mimeType: 'video/webm' }, options)).resolves.toBe(
      true,
    )
    await expect(
      validate(visualMedia, { id: 5, mimeType: 'application/pdf' }, options),
    ).resolves.toEqual(expect.any(String))
    await expect(validate(video, { id: 6, mimeType: 'video/mp4' }, options)).resolves.toBe(true)
    await expect(
      validate(video, { id: 7, mimeType: 'application/octet-stream' }, options),
    ).resolves.toEqual(expect.any(String))
  })

  it('does not trust client-supplied MIME metadata for a referenced Media ID', async () => {
    const field = imageUploadField({ name: 'image' })
    const { options } = validationOptions(
      vi.fn().mockResolvedValue({ id: 9, mimeType: 'application/pdf' }),
    )

    await expect(validate(field, { id: 9, mimeType: 'image/png' }, options)).resolves.toEqual(
      expect.any(String),
    )
  })

  it('resolves an ID on the server and fails closed when media is missing or has no MIME type', async () => {
    const field = imageUploadField({ name: 'image' })
    const found = validationOptions(vi.fn().mockResolvedValue({ id: 41, mimeType: 'image/png' }))

    await expect(validate(field, 41, found.options)).resolves.toBe(true)
    expect(found.findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'media',
        depth: 0,
        id: 41,
        req: found.req,
        select: { mimeType: true },
      }),
    )

    const missingMime = validationOptions(vi.fn().mockResolvedValue({ id: 42 }))
    await expect(validate(field, 42, missingMime.options)).resolves.toEqual(expect.any(String))

    const missingRecord = validationOptions(vi.fn().mockRejectedValue(new Error('Not found')))
    await expect(validate(field, 43, missingRecord.options)).resolves.toEqual(expect.any(String))
  })

  it('routes every visual upload schema through the shared guarded field factories', () => {
    for (const relativePath of schemaFiles) {
      const source = readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8')

      expect(source, relativePath).not.toMatch(/type:\s*['"]upload['"]/u)
      expect(source, relativePath).not.toMatch(/relationTo:\s*['"]media['"]/u)
    }
  })

  it('continues to allow explicit document uploads in the Media collection', () => {
    const upload = Media.upload
    expect(upload && typeof upload === 'object' ? upload.mimeTypes : []).toContain(
      'application/pdf',
    )
  })
})
