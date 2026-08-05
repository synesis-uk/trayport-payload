import type { Field, GroupField, Where } from 'payload'

import {
  managedLinkDestinationPolicy,
  normalizeDestinationValue,
  validateDestination,
} from '@/routing/urlPolicy'

type NavigationLinkOptions = {
  includeLabel?: boolean
  name?: string
  required?: boolean
  typeDBName?: string
}

const validateCustomURL = (value: unknown): true | string =>
  validateDestination(value, {
    message:
      'Use a normalized internal path, anchor, email, phone number, or complete HTTPS URL without credentials.',
    policy: managedLinkDestinationPolicy,
    required: true,
  })

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
      filterOptions: () =>
        ({
          _status: { equals: 'published' },
          path: { exists: true },
        }) satisfies Where,
      maxDepth: 1,
      relationTo: ['pages', 'articles', 'hubs', 'venues', 'learning-videos', 'people'],
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
      hooks: {
        beforeValidate: [({ value }) => normalizeDestinationValue(value)],
      },
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
