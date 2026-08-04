// @vitest-environment node

import { readFileSync } from 'node:fs'

import { describe, expect, it, vi } from 'vitest'

import { publicResponseSecurityHeaders } from '@/config/securityHeaders'
import { createSafeClientErrorReport, reportClientError } from '@/utilities/reportClientError'

const readProjectFile = (path: string): string =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

describe('Next.js runtime hardening contract', () => {
  it('wires a conservative security-header baseline without a broken CSP', () => {
    const nextConfig = readProjectFile('next.config.ts')

    expect(publicResponseSecurityHeaders).toEqual([
      {
        key: 'Permissions-Policy',
        value: 'browsing-topics=(), camera=(), geolocation=(), microphone=()',
      },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
    ])
    expect(
      publicResponseSecurityHeaders.some(({ key }) => /content-security-policy/i.test(key)),
    ).toBe(false)
    expect(nextConfig).toContain(
      "import { publicResponseSecurityHeaders } from './src/config/securityHeaders'",
    )
    expect(nextConfig).toContain('headers: publicResponseSecurityHeaders.map')
    expect(nextConfig).toContain("source: '/:path*'")
  })

  it('provides the root-layout error convention with a self-contained document', () => {
    const source = readProjectFile('src/app/global-error.tsx')

    expect(source.startsWith("'use client'\n")).toBe(true)
    expect(source).toContain('<html lang="en">')
    expect(source).toContain('<head>')
    expect(source).toContain('<body style={bodyStyle}>')
    expect(source).toContain('<title>Something went wrong | Trayport</title>')
    expect(source).toContain('unstable_retry: () => void')
    expect(source).toContain("reportClientError(error, 'root-layout')")
    expect(source).not.toContain('error.message')
    expect(source).not.toContain('error.stack')
    expect(source).not.toContain('console.error(error)')
  })

  it('reports only a bounded opaque digest from browser errors', () => {
    const error = Object.assign(new Error('postgresql://admin:secret@example.invalid/site'), {
      digest: '1938475620',
    })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(createSafeClientErrorReport(error, 'root-layout')).toEqual({
      boundary: 'root-layout',
      digest: '1938475620',
    })
    reportClientError(error, 'root-layout')

    expect(consoleError).toHaveBeenCalledWith('[trayport] application boundary error', {
      boundary: 'root-layout',
      digest: '1938475620',
    })
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain('admin:secret')
    expect(
      createSafeClientErrorReport(
        Object.assign(new Error('private content'), { digest: 'unsafe digest with spaces' }),
        'frontend-route',
      ),
    ).toEqual({ boundary: 'frontend-route', digest: null })

    consoleError.mockRestore()
  })

  it('uses the same sanitized reporter for the ordinary frontend boundary', () => {
    const source = readProjectFile('src/app/(frontend)/error.tsx')

    expect(source).toContain("reportClientError(error, 'frontend-route')")
    expect(source).not.toContain('console.error(error)')
    expect(source).not.toContain('error.message')
    expect(source).not.toContain('error.stack')
  })

  it('records the nonce and report-only CSP release gate', () => {
    const frontendContract = readProjectFile('docs/frontend-system.md')

    expect(frontendContract).toContain('does not enforce a\nContent Security Policy yet')
    expect(frontendContract).toContain('Content-Security-Policy-Report-Only')
    expect(frontendContract).toContain('fresh unpredictable nonce per request')
    expect(frontendContract).toContain('incompatible with the current partial-prerender shell')
    expect(frontendContract).toContain('Payload admin')
    expect(frontendContract).toContain('chart runtime')
  })
})
