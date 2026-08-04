// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { resolveMediaStorageConfig } from '@/config/mediaStorage'

const completeS3Environment: Partial<NodeJS.ProcessEnv> = {
  S3_ACCESS_KEY_ID: 'test-access-key',
  S3_BUCKET: 'trayport-media',
  S3_ENDPOINT: 'http://127.0.0.1:9000',
  S3_FORCE_PATH_STYLE: 'true',
  S3_REGION: 'eu-west-2',
  S3_SECRET_ACCESS_KEY: 'test-secret-key',
}

describe('media storage configuration', () => {
  it('preserves the local MinIO S3 flow', () => {
    expect(
      resolveMediaStorageConfig({
        ...completeS3Environment,
        MEDIA_STORAGE_MODE: 's3',
        NODE_ENV: 'development',
      }),
    ).toMatchObject({
      mode: 's3',
      s3: {
        accessKeyId: 'test-access-key',
        bucket: 'trayport-media',
        endpoint: 'http://127.0.0.1:9000',
        forcePathStyle: true,
        region: 'eu-west-2',
        secretAccessKey: 'test-secret-key',
      },
    })
  })

  it('keeps complete legacy development S3 configuration working while modes are adopted', () => {
    expect(
      resolveMediaStorageConfig({
        ...completeS3Environment,
        NODE_ENV: 'development',
      }).mode,
    ).toBe('s3')
  })

  it('fails every partial S3 configuration before selecting a storage mode', () => {
    expect(() =>
      resolveMediaStorageConfig({
        MEDIA_STORAGE_MODE: 'build',
        NODE_ENV: 'production',
        S3_BUCKET: 'trayport-media',
        npm_lifecycle_event: 'build',
      }),
    ).toThrow(
      'S3 configuration is incomplete; missing S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION.',
    )
  })

  it('requires an explicit durable mode in production even when S3 is complete', () => {
    expect(() =>
      resolveMediaStorageConfig({
        ...completeS3Environment,
        NODE_ENV: 'production',
      }),
    ).toThrow('MEDIA_STORAGE_MODE must explicitly select s3 or local-persistent in production.')
  })

  it('rejects development filesystem storage in production', () => {
    expect(() =>
      resolveMediaStorageConfig({
        MEDIA_STORAGE_MODE: 'local-development',
        NODE_ENV: 'production',
      }),
    ).toThrow(
      'MEDIA_STORAGE_MODE=local-development is not durable and cannot be used in production.',
    )
  })

  it('rejects the filesystem root for development storage', () => {
    expect(() =>
      resolveMediaStorageConfig({
        MEDIA_STORAGE_LOCAL_PATH: '/',
        MEDIA_STORAGE_MODE: 'local-development',
        NODE_ENV: 'development',
      }),
    ).toThrow('must be an absolute directory below the filesystem root')
  })

  it('requires a safe absolute mounted path for persistent filesystem storage', () => {
    expect(() =>
      resolveMediaStorageConfig({
        MEDIA_STORAGE_MODE: 'local-persistent',
        NODE_ENV: 'production',
      }),
    ).toThrow('MEDIA_STORAGE_LOCAL_PATH is required')

    expect(() =>
      resolveMediaStorageConfig({
        MEDIA_STORAGE_LOCAL_PATH: '/',
        MEDIA_STORAGE_MODE: 'local-persistent',
        NODE_ENV: 'production',
      }),
    ).toThrow('must be an absolute directory below the filesystem root')

    expect(
      resolveMediaStorageConfig({
        MEDIA_STORAGE_LOCAL_PATH: '/var/lib/trayport/media',
        MEDIA_STORAGE_MODE: 'local-persistent',
        NODE_ENV: 'production',
      }),
    ).toEqual({
      localPath: '/var/lib/trayport/media',
      mode: 'local-persistent',
    })
  })

  it('allows build mode only during an explicit build lifecycle', () => {
    expect(
      resolveMediaStorageConfig({
        MEDIA_STORAGE_MODE: 'build',
        NODE_ENV: 'production',
        npm_lifecycle_event: 'build',
      }).mode,
    ).toBe('build')

    expect(() =>
      resolveMediaStorageConfig({
        MEDIA_STORAGE_MODE: 'build',
        NODE_ENV: 'production',
      }),
    ).toThrow('MEDIA_STORAGE_MODE=build is build-only')
  })

  it('rejects ambiguous local and S3 configuration', () => {
    expect(() =>
      resolveMediaStorageConfig({
        ...completeS3Environment,
        MEDIA_STORAGE_MODE: 'local-development',
        NODE_ENV: 'development',
      }),
    ).toThrow('S3_* variables cannot be combined with MEDIA_STORAGE_MODE=local-development.')
  })

  it('validates the S3 endpoint and path-style flag without exposing credentials', () => {
    expect(() =>
      resolveMediaStorageConfig({
        ...completeS3Environment,
        MEDIA_STORAGE_MODE: 's3',
        NODE_ENV: 'development',
        S3_ENDPOINT: 'file:///tmp/media',
      }),
    ).toThrow('S3_ENDPOINT must be an absolute HTTP(S) URL.')

    expect(() =>
      resolveMediaStorageConfig({
        ...completeS3Environment,
        MEDIA_STORAGE_MODE: 's3',
        NODE_ENV: 'development',
        S3_FORCE_PATH_STYLE: 'yes',
      }),
    ).toThrow('S3_FORCE_PATH_STYLE must be either "true" or "false".')
  })
})
