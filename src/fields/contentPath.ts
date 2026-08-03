import type { TextField } from 'payload'

const pathPattern = /^\/(?:[^/?#\\\u0000-\u001F\u007F]+\/)*$/u
const absoluteReferencePattern = /^(?:[a-z][a-z\d+.-]*:|\/\/|\/+[a-z][a-z\d+.-]*:\/)/i
const controlCharacterPattern = /[\u0000-\u001F\u007F]/u
const pathSeparatorPattern = /[\\/]/u
const whitespacePattern = /\s/u

type ContentPathOptions = {
  condition?: NonNullable<TextField['admin']>['condition']
  required?: boolean
}

const decodedSegment = (segment: string): string | null => {
  try {
    return decodeURIComponent(segment)
  } catch {
    return null
  }
}

const invalidPathSegment = (segment: string): boolean => {
  const decoded = decodedSegment(segment)

  return (
    decoded === null ||
    decoded === '.' ||
    decoded === '..' ||
    controlCharacterPattern.test(decoded) ||
    pathSeparatorPattern.test(decoded) ||
    whitespacePattern.test(decoded)
  )
}

const canonicalizeEncodedSegments = (path: string): string =>
  path
    .split('/')
    .map((segment) => {
      if (!segment) return segment

      const decoded = decodedSegment(segment)
      return decoded !== null &&
        !controlCharacterPattern.test(decoded) &&
        !pathSeparatorPattern.test(decoded) &&
        !whitespacePattern.test(decoded)
        ? decoded
        : segment
    })
    .join('/')

export const normalizeContentPath = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return trimmed
  }

  // Preserve unsafe URL-like input so validation can reject it instead of
  // silently turning an absolute destination into a plausible local path.
  if (absoluteReferencePattern.test(trimmed)) {
    return trimmed
  }

  const withoutQueryOrHash = trimmed.split(/[?#]/, 1)[0] || ''
  const withLeadingSlash = `/${withoutQueryOrHash.replace(/^\/+/, '')}`
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, '/')
  const decoded = canonicalizeEncodedSegments(collapsed)

  return decoded === '/' ? decoded : `${decoded.replace(/\/+$/, '')}/`
}

export const validateContentPath = (
  value: string | null | undefined,
  required = true,
): true | string => {
  if (!value) {
    return required ? 'A public path is required.' : true
  }

  if (absoluteReferencePattern.test(value)) {
    return 'Use a relative site path, not an absolute URL.'
  }

  if (!pathPattern.test(value)) {
    return 'Use a relative path that begins and ends with “/”.'
  }

  if (value.split('/').filter(Boolean).some(invalidPathSegment)) {
    return 'Paths cannot contain dot segments, whitespace, backslashes, control characters, or encoded separators.'
  }

  return true
}

export const contentPathField = ({
  condition,
  required = true,
}: ContentPathOptions = {}): TextField => ({
  name: 'path',
  type: 'text',
  admin: {
    condition,
    description:
      'Public path beginning and ending with “/”. Nested paths are supported, for example /company/about-us/.',
    position: 'sidebar',
  },
  hooks: {
    beforeValidate: [({ value }) => normalizeContentPath(value)],
  },
  index: true,
  required,
  unique: true,
  validate: (value: string | null | undefined) => validateContentPath(value, required),
})
