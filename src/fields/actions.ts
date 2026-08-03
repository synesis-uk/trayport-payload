import type { ArrayField } from 'payload'

import { navigationLinkField } from './navigationLink'

export const actionsField = (name = 'actions'): ArrayField => ({
  name,
  type: 'array',
  labels: {
    singular: 'Action',
    plural: 'Actions',
  },
  maxRows: 4,
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    navigationLinkField({ typeDBName: 'content_link_type' }),
    {
      name: 'style',
      type: 'select',
      defaultValue: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Text link', value: 'link' },
      ],
      required: true,
    },
  ],
})
