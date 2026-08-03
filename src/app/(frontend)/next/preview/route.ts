import type { PayloadRequest } from 'payload'
import { getPayload } from 'payload'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import configPromise from '@payload-config'
import { isAdminOrEditor } from '@/access/roles'
import { normalizeContentPath } from '@/fields/contentPath'
import { findRouteClaim } from '@/routing/registry'

export type PreviewSearchParams = {
  path: string
  previewSecret: string
}

export async function GET(req: NextRequest): Promise<Response> {
  const payload = await getPayload({ config: configPromise })

  const { searchParams } = new URL(req.url)

  const path = searchParams.get('path')
  const previewSecret = searchParams.get('previewSecret')

  if (previewSecret !== process.env.PREVIEW_SECRET) {
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

  draft.enable()

  redirect(normalizedPath)
}
