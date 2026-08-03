import type { Field, GroupField } from 'payload'

import { normalizeContentPath } from './contentPath'

type NavigationLinkOptions = {
  includeLabel?: boolean
  name?: string
  required?: boolean
  typeDBName?: string
}

const validateCustomURL = (value: unknown): true | string => {
  if (typeof value !== 'string' || !value.trim()) return 'Add a destination URL.'
  const url = value.trim()
  if (/^(?:#[A-Za-z][\w:-]*|mailto:[^\s@]+@[^\s@]+|tel:\+?[\d\s().-]+)$/i.test(url)) {
    return true
  }
  if (url.startsWith('/')) {
    const normalized = normalizeContentPath(url)
    return normalized === url
      ? true
      : 'Use a normalized internal path with leading and trailing slashes.'
  }
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && Boolean(parsed.hostname)
      ? true
      : 'External destinations must use HTTPS.'
  } catch {
    return 'Use a normalized internal path, anchor, email, phone number, or complete HTTPS URL.'
  }
}

export const navigationLinkField = ({
  includeLabel = false,
  name = 'link',
  required = true,
  typeDBName,
}: NavigationLinkOptions = {}): GroupField => {
  const fields: Field[] = [
    {
      name: 'type',
      type: 'radio',
      ...(typeDBName ? { dbName: typeDBName } : {}),
      admin: {
        layout: 'horizontal',
      },
      ...(required ? { defaultValue: 'reference' } : {}),
      options: [
        {
          label: 'Content',
          value: 'reference',
        },
        {
          label: 'Custom URL',
          value: 'custom',
        },
      ],
      required,
    },
    {
      name: 'reference',
      type: 'relationship',
      admin: {
        condition: (_data, siblingData) => siblingData?.type === 'reference',
      },
      label: 'Content',
      maxDepth: 1,
      relationTo: ['pages', 'articles', 'hubs', 'venues', 'learning-videos'],
      validate: (value: unknown, { siblingData }: { siblingData?: { type?: string } }) => {
        if (!siblingData?.type) return required ? 'Choose a link type.' : true
        return siblingData.type !== 'reference' || value ? true : 'Choose managed content.'
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_data, siblingData) => siblingData?.type === 'custom',
      },
      label: 'URL',
      validate: (value: unknown, { siblingData }: { siblingData?: { type?: string } }) => {
        if (!siblingData?.type) return required ? 'Choose a link type.' : true
        return siblingData.type === 'custom' ? validateCustomURL(value) : true
      },
    },
    {
      name: 'newTab',
      type: 'checkbox',
      ...(required ? { defaultValue: false } : {}),
      label: 'Open in a new tab',
    },
  ]

  if (includeLabel) {
    fields.unshift({
      name: 'label',
      type: 'text',
      required,
      ...(!required
        ? {
            validate: (value: unknown, { siblingData }: { siblingData?: { type?: string } }) =>
              !siblingData?.type || (typeof value === 'string' && value.trim())
                ? true
                : 'Add a link label.',
          }
        : {}),
    })
  }

  return {
    name,
    type: 'group',
    admin: {
      hideGutter: true,
    },
    fields,
    required,
  }
}
