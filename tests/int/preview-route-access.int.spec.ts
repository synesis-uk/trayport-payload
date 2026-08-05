// @vitest-environment node

import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const previewRouteHarness = vi.hoisted(() => {
  const auth = vi.fn()
  const loggerError = vi.fn()
  const payload = {
    auth,
    logger: { error: loggerError },
  }

  return {
    auth,
    cookieSet: vi.fn(),
    cookies: vi.fn(),
    draftDisable: vi.fn(),
    draftEnable: vi.fn(),
    draftMode: vi.fn(),
    findRouteClaim: vi.fn(),
    getPayload: vi.fn(),
    loggerError,
    payload,
    redirect: vi.fn(),
  }
})

vi.mock('@payload-config', () => ({
  default: Promise.resolve({}),
}))

vi.mock('payload', () => ({
  getPayload: previewRouteHarness.getPayload,
}))

vi.mock('next/headers', () => ({
  cookies: previewRouteHarness.cookies,
  draftMode: previewRouteHarness.draftMode,
}))

vi.mock('next/navigation', () => ({
  redirect: previewRouteHarness.redirect,
}))

vi.mock('@/routing/registry', () => ({
  findRouteClaim: previewRouteHarness.findRouteClaim,
}))

import { GET } from '@/app/(frontend)/next/preview/route'
import {
  createPreviewRouteToken,
  previewRouteCookieName,
  previewRouteTokenTTLSeconds,
  verifyPreviewRouteToken,
} from '@/routing/previewAccess'

const originalPreviewSecret = process.env.PREVIEW_SECRET

const previewRequest = (params: Record<string, string>): NextRequest =>
  new NextRequest(`http://localhost/next/preview?${new URLSearchParams(params)}`)

beforeEach(() => {
  vi.clearAllMocks()
  previewRouteHarness.getPayload.mockResolvedValue(previewRouteHarness.payload)
  previewRouteHarness.cookies.mockResolvedValue({ set: previewRouteHarness.cookieSet })
  previewRouteHarness.draftMode.mockResolvedValue({
    disable: previewRouteHarness.draftDisable,
    enable: previewRouteHarness.draftEnable,
  })
  previewRouteHarness.auth.mockResolvedValue({
    user: { id: 1, roles: ['editor'] },
  })
  previewRouteHarness.findRouteClaim.mockResolvedValue({ id: 'managed-draft-route' })
  previewRouteHarness.redirect.mockImplementation((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
  })
})

afterEach(() => {
  if (originalPreviewSecret === undefined) {
    delete process.env.PREVIEW_SECRET
  } else {
    process.env.PREVIEW_SECRET = originalPreviewSecret
  }
})

describe('path-bound preview route access', () => {
  const now = Date.UTC(2026, 7, 4, 6, 0, 0)
  const path = '/draft/example/'
  const secret = 'integration-preview-secret-with-enough-entropy'

  it('issues a short-lived token for one exact managed path', () => {
    const token = createPreviewRouteToken(path, secret, now)

    expect(previewRouteCookieName).toBe('trayport-preview-route')
    expect(previewRouteTokenTTLSeconds).toBe(15 * 60)
    expect(
      verifyPreviewRouteToken({
        now: now + 1_000,
        path,
        secret,
        token,
      }),
    ).toBe(true)
  })

  it('rejects forgery, another path, another secret, malformed input, and expiry', () => {
    const token = createPreviewRouteToken(path, secret, now)

    for (const candidate of [
      { path, secret, token: 'forged' },
      { path: '/draft/other/', secret, token },
      { path, secret: 'another-secret', token },
      { path, secret, token: `${token}x` },
      { path, secret: undefined, token },
    ]) {
      expect(verifyPreviewRouteToken({ ...candidate, now: now + 1_000 })).toBe(false)
    }

    expect(
      verifyPreviewRouteToken({
        now: now + previewRouteTokenTTLSeconds * 1_000,
        path,
        secret,
        token,
      }),
    ).toBe(false)
  })
})

describe('preview route request boundary', () => {
  const path = '/draft/example/'
  const secret = 'integration-preview-secret-with-enough-entropy'

  it('fails closed before Payload initialization when PREVIEW_SECRET is missing', async () => {
    delete process.env.PREVIEW_SECRET

    const response = await GET(previewRequest({ path, previewSecret: secret }))

    expect(response.status).toBe(403)
    await expect(response.text()).resolves.toBe('You are not allowed to preview this page')
    expect(previewRouteHarness.getPayload).not.toHaveBeenCalled()
  })

  it('rejects a wrong request secret before Payload initialization', async () => {
    process.env.PREVIEW_SECRET = secret

    const response = await GET(previewRequest({ path, previewSecret: 'wrong-secret' }))

    expect(response.status).toBe(403)
    expect(previewRouteHarness.getPayload).not.toHaveBeenCalled()
  })

  it.each([
    { expectedStatus: 404, path: undefined },
    { expectedStatus: 400, path: '//external.example/preview/' },
    { expectedStatus: 400, path: '/draft\\example/' },
    { expectedStatus: 400, path: 'https://external.example/preview/' },
  ])(
    'rejects an invalid relative path before Payload initialization',
    async ({ expectedStatus, path: candidatePath }) => {
      process.env.PREVIEW_SECRET = secret
      const params: Record<string, string> = { previewSecret: secret }
      if (candidatePath) params.path = candidatePath

      const response = await GET(previewRequest(params))

      expect(response.status).toBe(expectedStatus)
      expect(previewRouteHarness.getPayload).not.toHaveBeenCalled()
    },
  )

  it('authenticates a managed route, binds the preview cookie, enables draft mode, and redirects', async () => {
    process.env.PREVIEW_SECRET = secret

    await expect(GET(previewRequest({ path, previewSecret: secret }))).rejects.toThrow(
      `NEXT_REDIRECT:${path}`,
    )

    expect(previewRouteHarness.getPayload).toHaveBeenCalledTimes(1)
    expect(previewRouteHarness.auth).toHaveBeenCalledTimes(1)
    expect(previewRouteHarness.findRouteClaim).toHaveBeenCalledWith({
      draft: true,
      path,
      payload: previewRouteHarness.payload,
    })
    expect(previewRouteHarness.cookieSet).toHaveBeenCalledTimes(1)

    const [cookieName, token, options] = previewRouteHarness.cookieSet.mock.calls[0] as [
      string,
      string,
      Record<string, unknown>,
    ]
    expect(cookieName).toBe(previewRouteCookieName)
    expect(verifyPreviewRouteToken({ path, secret, token })).toBe(true)
    expect(options).toMatchObject({
      httpOnly: true,
      maxAge: previewRouteTokenTTLSeconds,
      path: '/',
      sameSite: 'lax',
    })
    expect(previewRouteHarness.draftEnable).toHaveBeenCalledTimes(1)
    expect(previewRouteHarness.draftDisable).not.toHaveBeenCalled()
    expect(previewRouteHarness.redirect).toHaveBeenCalledWith(path)
  })

  it('carries a validated banner identifier into an authenticated page preview', async () => {
    process.env.PREVIEW_SECRET = secret

    await expect(
      GET(previewRequest({ banner: '17', path, previewSecret: secret })),
    ).rejects.toThrow(`NEXT_REDIRECT:${path}?bannerPreview=17`)
    expect(previewRouteHarness.redirect).toHaveBeenCalledWith(`${path}?bannerPreview=17`)

    const invalid = await GET(previewRequest({ banner: '../17', path, previewSecret: secret }))
    expect(invalid.status).toBe(400)
    await expect(invalid.text()).resolves.toBe('Invalid banner preview identifier')
  })
})
