export type PublicOriginEnvironment = {
  NEXT_PUBLIC_SERVER_URL?: string
  VERCEL_PROJECT_PRODUCTION_URL?: string
}

const configurationError = (message: string): Error =>
  new Error(`Invalid public origin configuration: ${message}`)

const environmentValue = (value?: string): string | undefined => value?.trim() || undefined

/**
 * Resolve the one public HTTP(S) origin used by metadata, Payload CORS, image configuration,
 * previews, and sitemap output. Paths, credentials, query strings, and fragments are rejected so
 * callers cannot accidentally construct malformed canonical or asset URLs.
 */
export const resolvePublicOrigin = (environment: PublicOriginEnvironment = process.env): string => {
  const configured = environmentValue(environment.NEXT_PUBLIC_SERVER_URL)
  const vercelHostname = environmentValue(environment.VERCEL_PROJECT_PRODUCTION_URL)
  const candidate = configured || (vercelHostname ? `https://${vercelHostname}` : undefined)
  const value = candidate || 'http://localhost:3000'

  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw configurationError('NEXT_PUBLIC_SERVER_URL must be an absolute HTTP(S) origin.')
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw configurationError('NEXT_PUBLIC_SERVER_URL must use http or https.')
  }
  if (parsed.username || parsed.password) {
    throw configurationError('NEXT_PUBLIC_SERVER_URL must not contain credentials.')
  }
  if (parsed.pathname !== '/' || parsed.search || parsed.hash) {
    throw configurationError('NEXT_PUBLIC_SERVER_URL must be an origin without a path or suffix.')
  }

  return parsed.origin
}
