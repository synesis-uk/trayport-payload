import { normalizeContentPath, validateContentPath } from '@/fields/contentPath'

export type DestinationPolicy = {
  allowAnchor?: boolean
  allowEmail?: boolean
  allowExternalHTTPS?: boolean
  allowInternalPath?: boolean
  allowPhone?: boolean
}

export const managedLinkDestinationPolicy = {
  allowAnchor: true,
  allowEmail: true,
  allowExternalHTTPS: true,
  allowInternalPath: true,
  allowPhone: true,
} as const satisfies DestinationPolicy

export const internalOrHTTPSDestinationPolicy = {
  allowExternalHTTPS: true,
  allowInternalPath: true,
} as const satisfies DestinationPolicy

export const externalHTTPSDestinationPolicy = {
  allowExternalHTTPS: true,
} as const satisfies DestinationPolicy

const anchorPattern = /^#[A-Za-z][\w:-]*$/u
const emailPattern = /^mailto:[^\s@]+@[^\s@]+$/iu
const phonePattern = /^tel:\+?[\d\s().-]+$/iu
const unsafeCharacterPattern = /[\s\u0000-\u001F\u007F]/u

const normalizedHTTPSURL = (value: string): string | null => {
  if (value.startsWith('//') || unsafeCharacterPattern.test(value)) return null

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return null

    return url.href
  } catch {
    return null
  }
}

const normalizedInternalPath = (value: string): string | null => {
  if (!value.startsWith('/') || value.startsWith('//') || /[?#]/u.test(value)) return null

  const normalized = normalizeContentPath(value)
  return typeof normalized === 'string' && validateContentPath(normalized) === true
    ? normalized
    : null
}

export const safeDestination = (
  value: unknown,
  policy: DestinationPolicy = managedLinkDestinationPolicy,
): string | null => {
  if (typeof value !== 'string') return null
  const candidate = value.trim()
  if (!candidate) return null

  if (policy.allowAnchor && anchorPattern.test(candidate)) return candidate
  if (policy.allowEmail && emailPattern.test(candidate)) return candidate
  if (policy.allowPhone && phonePattern.test(candidate)) return candidate
  if (policy.allowInternalPath) {
    const internalPath = normalizedInternalPath(candidate)
    if (internalPath) return internalPath
  }
  if (policy.allowExternalHTTPS) return normalizedHTTPSURL(candidate)

  return null
}

export const normalizeDestinationValue = (
  value: unknown,
  policy: DestinationPolicy = managedLinkDestinationPolicy,
): unknown => {
  if (typeof value !== 'string') return value
  return safeDestination(value, policy) || value.trim()
}

export const validateDestination = (
  value: unknown,
  {
    message = 'Use an allowed destination without credentials.',
    policy = managedLinkDestinationPolicy,
    required = false,
  }: {
    message?: string
    policy?: DestinationPolicy
    required?: boolean
  } = {},
): true | string => {
  if (value === null || value === undefined || value === '') {
    return required ? 'Add a destination URL.' : true
  }

  return safeDestination(value, policy) ? true : message
}

export const safeExternalHTTPSURL = (value: unknown): string | null =>
  safeDestination(value, externalHTTPSDestinationPolicy)

const allowedExternalMediaHostnames = new Set(['cdn.trayport.com'])
const externalImagePathPattern = /\.(?:avif|gif|jpe?g|png|webp)$/iu
const externalVideoPathPattern = /\.(?:m4v|mov|mp4|ogv|webm)$/iu

export const safeExternalMediaURL = (
  value: unknown,
  kind: 'image' | 'video' | 'either' = 'either',
): string | null => {
  const safe = safeExternalHTTPSURL(value)
  if (!safe) return null

  const url = new URL(safe)
  if (
    !allowedExternalMediaHostnames.has(url.hostname.toLowerCase()) ||
    !url.pathname.startsWith('/app/uploads/')
  ) {
    return null
  }

  const isImage = externalImagePathPattern.test(url.pathname)
  const isVideo = externalVideoPathPattern.test(url.pathname)
  if (
    (kind === 'image' && !isImage) ||
    (kind === 'video' && !isVideo) ||
    (kind === 'either' && !isImage && !isVideo)
  ) {
    return null
  }

  return safe
}

export const validateExternalHTTPSURL = (value: unknown, required = false): true | string =>
  validateDestination(value, {
    message: 'Use a complete HTTPS URL without credentials.',
    policy: externalHTTPSDestinationPolicy,
    required,
  })

export const validateExternalMediaURL = (value: unknown): true | string =>
  !value || safeExternalMediaURL(value)
    ? true
    : 'Use an HTTPS image or video URL under cdn.trayport.com/app/uploads/ without credentials.'

export const validateExternalVideoMediaURL = (value: unknown): true | string =>
  !value || safeExternalMediaURL(value, 'video')
    ? true
    : 'Use an HTTPS video URL under cdn.trayport.com/app/uploads/ without credentials.'
