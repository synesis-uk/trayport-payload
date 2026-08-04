import type { GroupField } from 'payload'

import { normalizeContentPath, validateContentPath } from './contentPath'
import { imageUploadField } from './mediaUpload'

const canonicalError = 'Use a normalized root-relative path or a complete HTTP(S) URL.'

export const seoField = (): GroupField => ({
  name: 'meta',
  type: 'group',
  label: 'Search and sharing',
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Optional override for search results and browser tabs.',
      },
      maxLength: 70,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'A concise summary for search results and link previews.',
      },
      maxLength: 180,
    },
    imageUploadField({
      name: 'image',
    }),
    {
      name: 'canonicalURL',
      type: 'text',
      admin: {
        description:
          'Only set this when the canonical URL differs from this page. Use a root-relative path or a complete HTTP(S) URL.',
      },
      validate: (value: string | null | undefined) => {
        const canonical = value?.trim()
        if (!canonical) return true
        if (/^\/(?!\/)/.test(canonical)) {
          return normalizeContentPath(canonical) === canonical &&
            validateContentPath(canonical) === true
            ? true
            : canonicalError
        }

        try {
          const parsed = new URL(canonical)
          return (
            (['http:', 'https:'].includes(parsed.protocol) &&
              !parsed.username &&
              !parsed.password &&
              !parsed.hash &&
              !/[\s\\\u0000-\u001F\u007F]/u.test(canonical)) ||
            canonicalError
          )
        } catch {
          return canonicalError
        }
      },
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      defaultValue: false,
      label: 'Hide from search engines',
    },
    {
      name: 'noFollow',
      type: 'checkbox',
      defaultValue: false,
      label: 'Ask search engines not to follow links on this page',
    },
    {
      name: 'structuredData',
      type: 'json',
      admin: {
        description:
          'Optional validated JSON-LD object. Script tags and executable markup are not accepted.',
      },
      label: 'Structured data (JSON-LD)',
    },
  ],
})
