import type { TextField } from 'payload'

const pathPattern = /^\/(?:[^/?#]+\/)*$/

type ContentPathOptions = {
  required?: boolean
}

export const normalizeContentPath = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return trimmed
  }

  const withoutQueryOrHash = trimmed.split(/[?#]/, 1)[0] || ''
  const withLeadingSlash = `/${withoutQueryOrHash.replace(/^\/+/, '')}`
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, '/')

  return collapsed === '/' ? collapsed : `${collapsed.replace(/\/+$/, '')}/`
}

export const contentPathField = ({ required = true }: ContentPathOptions = {}): TextField => ({
  name: 'path',
  type: 'text',
  admin: {
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
  validate: (value: string | null | undefined) => {
    if (!value) {
      return required ? 'A public path is required.' : true
    }

    return pathPattern.test(value) || 'Use a relative path that begins and ends with “/”.'
  },
})
