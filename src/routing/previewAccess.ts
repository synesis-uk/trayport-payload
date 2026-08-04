import { createHmac, timingSafeEqual } from 'node:crypto'

export const previewRouteCookieName = 'trayport-preview-route'
export const previewRouteTokenTTLSeconds = 15 * 60

type PreviewRoutePayload = {
  expiresAt: number
  path: string
  version: 1
}

const signatureFor = (payload: string, secret: string): Buffer =>
  createHmac('sha256', secret).update(payload).digest()

export const createPreviewRouteToken = (path: string, secret: string, now = Date.now()): string => {
  if (!secret) throw new Error('PREVIEW_SECRET is required to issue a preview route token.')

  const payload = Buffer.from(
    JSON.stringify({
      expiresAt: now + previewRouteTokenTTLSeconds * 1000,
      path,
      version: 1,
    } satisfies PreviewRoutePayload),
  ).toString('base64url')

  return `${payload}.${signatureFor(payload, secret).toString('base64url')}`
}

export const verifyPreviewRouteToken = ({
  now = Date.now(),
  path,
  secret,
  token,
}: {
  now?: number
  path: string
  secret: string | undefined
  token: string | undefined
}): boolean => {
  if (!secret || !token || token.length > 2048) return false

  const [payload, suppliedSignature, extra] = token.split('.')
  if (!payload || !suppliedSignature || extra) return false

  try {
    const expectedSignature = signatureFor(payload, secret)
    const actualSignature = Buffer.from(suppliedSignature, 'base64url')
    if (
      actualSignature.length !== expectedSignature.length ||
      !timingSafeEqual(actualSignature, expectedSignature)
    ) {
      return false
    }

    const value = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as Partial<PreviewRoutePayload>
    return (
      value.version === 1 &&
      value.path === path &&
      typeof value.expiresAt === 'number' &&
      Number.isFinite(value.expiresAt) &&
      value.expiresAt > now
    )
  } catch {
    return false
  }
}
