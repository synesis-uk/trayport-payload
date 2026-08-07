import type { ArrayField } from 'payload'

import { navigationLinkField } from './navigationLink'

export const actionIconOptions = [
  { label: 'Arrow', value: 'arrowRight' },
  { label: 'Chart', value: 'chart' },
  { label: 'Europe', value: 'europe' },
  { label: 'Forward', value: 'forward' },
  { label: 'People', value: 'people' },
  { label: 'Play', value: 'play' },
  { label: 'Settings', value: 'settings' },
] as const

export const actionStyleOptions = [
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Accent', value: 'accent' },
  { label: 'Info', value: 'info' },
  { label: 'Text link', value: 'link' },
] as const

export const actionsField = (name = 'actions'): ArrayField => ({
  name,
  type: 'array',
  labels: {
    singular: 'Action',
    plural: 'Actions',
  },
  // The reference authors up to five actions in one group — /products/third-party-providers/
  // uses a five-item in-page jump list — so four rejected real content.
  maxRows: 6,
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    navigationLinkField({ typeDBName: 'content_link_type' }),
    {
      name: 'icon',
      type: 'select',
      admin: {
        description:
          'Optional semantic leading icon. The trailing destination indicator is automatic.',
      },
      options: [...actionIconOptions],
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'primary',
      options: [...actionStyleOptions],
      required: true,
    },
  ],
})
