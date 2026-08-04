import path from 'node:path'

export const mediaStorageModes = ['s3', 'local-development', 'local-persistent', 'build'] as const

export type MediaStorageMode = (typeof mediaStorageModes)[number]

type MediaStorageEnvironment = Partial<NodeJS.ProcessEnv>

type S3StorageConfiguration = {
  accessKeyId: string
  bucket: string
  endpoint?: string
  forcePathStyle: boolean
  region: string
  secretAccessKey: string
}

export type MediaStorageConfiguration = {
  localPath: string
  mode: MediaStorageMode
  s3?: S3StorageConfiguration
}

const s3RequiredEnvironmentVariables = [
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_REGION',
] as const

const s3EnvironmentVariables = [
  ...s3RequiredEnvironmentVariables,
  'S3_ENDPOINT',
  'S3_FORCE_PATH_STYLE',
] as const

const readEnvironmentValue = (
  environment: MediaStorageEnvironment,
  name: keyof MediaStorageEnvironment,
): string | undefined => {
  const value = environment[name]?.trim()
  return value || undefined
}

const configurationError = (message: string): Error =>
  new Error(`Invalid media storage configuration: ${message}`)

const parseForcePathStyle = (value: string | undefined): boolean => {
  if (!value) return false
  if (value === 'true') return true
  if (value === 'false') return false

  throw configurationError('S3_FORCE_PATH_STYLE must be either "true" or "false".')
}

const validateEndpoint = (endpoint: string | undefined): string | undefined => {
  if (!endpoint) return undefined

  let parsed: URL
  try {
    parsed = new URL(endpoint)
  } catch {
    throw configurationError('S3_ENDPOINT must be an absolute HTTP(S) URL.')
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw configurationError('S3_ENDPOINT must be an absolute HTTP(S) URL.')
  }

  return endpoint
}

const resolveLocalPath = (environment: MediaStorageEnvironment, mode: MediaStorageMode): string => {
  const configuredPath = readEnvironmentValue(environment, 'MEDIA_STORAGE_LOCAL_PATH')

  if (mode === 'local-persistent') {
    if (!configuredPath) {
      throw configurationError(
        'MEDIA_STORAGE_LOCAL_PATH is required for MEDIA_STORAGE_MODE=local-persistent.',
      )
    }
    if (!path.isAbsolute(configuredPath) || configuredPath === path.parse(configuredPath).root) {
      throw configurationError(
        'MEDIA_STORAGE_LOCAL_PATH must be an absolute directory below the filesystem root.',
      )
    }
    return configuredPath
  }

  if (
    configuredPath &&
    (!path.isAbsolute(configuredPath) || configuredPath === path.parse(configuredPath).root)
  ) {
    throw configurationError(
      'MEDIA_STORAGE_LOCAL_PATH must be an absolute directory below the filesystem root.',
    )
  }

  return configuredPath || path.resolve(process.cwd(), 'public/media')
}

const isBuildLifecycle = (environment: MediaStorageEnvironment): boolean =>
  environment.NEXT_PHASE === 'phase-production-build' || environment.npm_lifecycle_event === 'build'

export const resolveMediaStorageConfig = (
  environment: MediaStorageEnvironment = process.env,
): MediaStorageConfiguration => {
  const s3Values = Object.fromEntries(
    s3EnvironmentVariables.map((name) => [name, readEnvironmentValue(environment, name)]),
  ) as Record<(typeof s3EnvironmentVariables)[number], string | undefined>
  const hasAnyS3Configuration = s3EnvironmentVariables.some((name) => Boolean(s3Values[name]))
  const missingS3Variables = s3RequiredEnvironmentVariables.filter((name) => !s3Values[name])

  if (hasAnyS3Configuration && missingS3Variables.length > 0) {
    throw configurationError(
      `S3 configuration is incomplete; missing ${missingS3Variables.join(', ')}.`,
    )
  }

  const validatedS3Endpoint = hasAnyS3Configuration
    ? validateEndpoint(s3Values.S3_ENDPOINT)
    : undefined
  const validatedForcePathStyle = hasAnyS3Configuration
    ? parseForcePathStyle(s3Values.S3_FORCE_PATH_STYLE)
    : false

  const requestedMode = readEnvironmentValue(environment, 'MEDIA_STORAGE_MODE')
  if (requestedMode && !mediaStorageModes.includes(requestedMode as MediaStorageMode)) {
    throw configurationError(`MEDIA_STORAGE_MODE must be one of: ${mediaStorageModes.join(', ')}.`)
  }

  let mode = requestedMode as MediaStorageMode | undefined
  if (!mode) {
    if (environment.NODE_ENV === 'production') {
      throw configurationError(
        'MEDIA_STORAGE_MODE must explicitly select s3 or local-persistent in production.',
      )
    }

    // Preserve the existing local MinIO flow while new environments adopt the explicit mode.
    if (hasAnyS3Configuration && missingS3Variables.length === 0) mode = 's3'
    else if (environment.NODE_ENV === 'test') mode = 'local-development'
    else {
      throw configurationError(
        'MEDIA_STORAGE_MODE is required; use s3, local-development, or local-persistent.',
      )
    }
  }

  if (mode === 'build' && !isBuildLifecycle(environment)) {
    throw configurationError(
      'MEDIA_STORAGE_MODE=build is build-only and cannot be used by a running application.',
    )
  }

  if (environment.NODE_ENV === 'production' && mode === 'local-development') {
    throw configurationError(
      'MEDIA_STORAGE_MODE=local-development is not durable and cannot be used in production.',
    )
  }

  if (mode !== 's3' && mode !== 'build' && hasAnyS3Configuration) {
    throw configurationError(`S3_* variables cannot be combined with MEDIA_STORAGE_MODE=${mode}.`)
  }

  const configuredLocalPath = readEnvironmentValue(environment, 'MEDIA_STORAGE_LOCAL_PATH')
  if (mode === 's3' && configuredLocalPath) {
    throw configurationError(
      'MEDIA_STORAGE_LOCAL_PATH cannot be combined with MEDIA_STORAGE_MODE=s3.',
    )
  }

  const localPath = resolveLocalPath(environment, mode)

  if (mode !== 's3') return { localPath, mode }

  if (missingS3Variables.length > 0) {
    throw configurationError(`MEDIA_STORAGE_MODE=s3 requires ${missingS3Variables.join(', ')}.`)
  }

  return {
    localPath,
    mode,
    s3: {
      accessKeyId: s3Values.S3_ACCESS_KEY_ID!,
      bucket: s3Values.S3_BUCKET!,
      endpoint: validatedS3Endpoint,
      forcePathStyle: validatedForcePathStyle,
      region: s3Values.S3_REGION!,
      secretAccessKey: s3Values.S3_SECRET_ACCESS_KEY!,
    },
  }
}
