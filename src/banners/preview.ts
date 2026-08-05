import type { Payload } from 'payload'

import { generateContentPreviewPath } from '@/utilities/generateContentPreviewPath'

type BannerPreviewDocument = Record<string, unknown>

const relationshipID = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (!value || typeof value !== 'object') return null

  const candidate = value as { id?: unknown; value?: unknown }
  return relationshipID(candidate.id ?? candidate.value)
}

const relationshipPath = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') return null
  const path = (value as { path?: unknown }).path
  return typeof path === 'string' && path.startsWith('/') ? path : null
}

const previewPagePath = async ({
  data,
  payload,
}: {
  data: BannerPreviewDocument
  payload: Payload
}): Promise<string | null> => {
  if (data.targetMode === 'all') return '/'
  if (!Array.isArray(data.targetPages) || data.targetPages.length === 0) return null

  const firstTarget = data.targetPages[0]
  const populatedPath = relationshipPath(firstTarget)
  if (populatedPath) return populatedPath

  const pageID = relationshipID(firstTarget)
  if (pageID === null) return null

  try {
    const page = await payload.findByID({
      collection: 'pages',
      depth: 0,
      id: pageID,
      overrideAccess: true,
      select: { path: true },
    })

    return typeof page.path === 'string' && page.path.startsWith('/') ? page.path : null
  } catch {
    return null
  }
}

export const generateBannerPreviewPath = async ({
  data,
  payload,
}: {
  data: BannerPreviewDocument
  payload: Payload
}): Promise<string | null> => {
  const bannerID = relationshipID(data.id)
  if (bannerID === null) return null

  const pagePath = await previewPagePath({ data, payload })
  const previewPath = generateContentPreviewPath(pagePath)
  if (!previewPath) return null

  const separator = previewPath.includes('?') ? '&' : '?'
  return `${previewPath}${separator}banner=${encodeURIComponent(String(bannerID))}`
}
