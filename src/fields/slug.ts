import type { TextField } from 'payload'

export const normalizeTrayportSlug = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const trayportSlugField = (): TextField => ({
  name: 'slug',
  type: 'text',
  admin: {
    position: 'sidebar',
  },
  hooks: {
    beforeValidate: [
      ({ siblingData, value }) => {
        const source =
          typeof value === 'string' && value.trim()
            ? value
            : typeof siblingData?.title === 'string'
              ? siblingData.title
              : ''

        return normalizeTrayportSlug(source)
      },
    ],
  },
  index: true,
  required: true,
  validate: (value: string | null | undefined) =>
    Boolean(value && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) ||
    'Use lowercase letters, numbers, and hyphens only.',
})
