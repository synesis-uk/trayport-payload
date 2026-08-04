export type ClientBoundaryError = Error & {
  digest?: string
}

export type ClientErrorBoundary = 'frontend-route' | 'root-layout'

export type SafeClientErrorReport = {
  boundary: ClientErrorBoundary
  digest: string | null
}

const SAFE_DIGEST = /^[A-Za-z0-9_-]{1,128}$/

export const createSafeClientErrorReport = (
  error: ClientBoundaryError,
  boundary: ClientErrorBoundary,
): SafeClientErrorReport => ({
  boundary,
  digest: typeof error.digest === 'string' && SAFE_DIGEST.test(error.digest) ? error.digest : null,
})

/**
 * Report only the boundary and Next's opaque digest. Error messages and stacks can contain request,
 * credential, or content data and must not cross this browser reporting boundary.
 */
export const reportClientError = (
  error: ClientBoundaryError,
  boundary: ClientErrorBoundary,
): void => {
  console.error(
    '[trayport] application boundary error',
    createSafeClientErrorReport(error, boundary),
  )
}
