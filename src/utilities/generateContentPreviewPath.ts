export const generateContentPreviewPath = (path: unknown): string | null => {
  if (typeof path !== 'string' || !path.startsWith('/')) {
    return null
  }

  const encodedParams = new URLSearchParams({
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  return `/next/preview?${encodedParams.toString()}`
}
