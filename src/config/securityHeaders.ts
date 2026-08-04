export type PublicResponseSecurityHeader = {
  key: string
  value: string
}

/**
 * A deliberately conservative baseline that is safe for the public site, Payload admin,
 * same-origin live preview, and route handlers. CSP is excluded until the Next.js bootstrap
 * and Cache Components rendering strategy have a verified nonce/report-only implementation.
 */
export const publicResponseSecurityHeaders: PublicResponseSecurityHeader[] = [
  {
    key: 'Permissions-Policy',
    value: 'browsing-topics=(), camera=(), geolocation=(), microphone=()',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000',
  },
  {
    // SAMEORIGIN preserves the Payload live-preview iframe while blocking third-party framing.
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
]
