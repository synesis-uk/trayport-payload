import type { PayloadRequest } from 'payload'
import { getPayload } from 'payload'

import { cookies, draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import configPromise from '@payload-config'
import { isAdminOrEditor } from '@/access/roles'
import { normalizeContentPath } from '@/fields/contentPath'
import {
  createPreviewRouteToken,
  previewRouteCookieName,
  previewRouteTokenTTLSeconds,
} from '@/routing/previewAccess'
import { findRouteClaim } from '@/routing/registry'

export type PreviewSearchParams = {
  path: string
  previewSecret: string
}

export async function GET(req: NextRequest): Promise<Response> {
  // Resolve and reject request-bound input before any asynchronous Payload work.
  // This keeps the route unambiguously dynamic during Next's build-time analysis
  // and avoids initializing Payload for malformed or unauthorized requests.
  const { searchParams } = req.nextUrl

  const path = searchParams.get('path')
  const previewSecret = searchParams.get('previewSecret')
  const expectedPreviewSecret = process.env.PREVIEW_SECRET

  if (!expectedPreviewSecret || previewSecret !== expectedPreviewSecret) {
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  if (!path) {
    return new Response('Insufficient search params', { status: 404 })
  }

  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return new Response('This endpoint can only be used for relative previews', { status: 400 })
  }

  const normalizedPath = normalizeContentPath(path)
  if (typeof normalizedPath !== 'string' || !normalizedPath.startsWith('/')) {
    return new Response('Invalid preview path', { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  let user

  try {
    const authResult = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    })
    user = authResult.user
  } catch (error) {
    payload.logger.error({ err: error }, 'Error verifying token for live preview')
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  const draft = await draftMode()

  if (!isAdminOrEditor(user)) {
    draft.disable()
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  const claim = await findRouteClaim({
    draft: true,
    path: normalizedPath,
    payload,
  })
  if (!claim) {
    draft.disable()
    return new Response('No managed route exists for this preview path', { status: 404 })
  }

  const cookieStore = await cookies()
  cookieStore.set(
    previewRouteCookieName,
    createPreviewRouteToken(normalizedPath, expectedPreviewSecret),
    {
      httpOnly: true,
      maxAge: previewRouteTokenTTLSeconds,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  )
  draft.enable()

  redirect(normalizedPath)
}
