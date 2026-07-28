import type { Field, GroupField } from 'payload'

type NavigationLinkOptions = {
  includeLabel?: boolean
  name?: string
}

export const navigationLinkField = ({
  includeLabel = false,
  name = 'link',
}: NavigationLinkOptions = {}): GroupField => {
  const fields: Field[] = [
    {
      name: 'type',
      type: 'radio',
      admin: {
        layout: 'horizontal',
      },
      defaultValue: 'reference',
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
      required: true,
    },
    {
      name: 'reference',
      type: 'relationship',
      admin: {
        condition: (_data, siblingData) => siblingData?.type === 'reference',
      },
      label: 'Content',
      maxDepth: 1,
      relationTo: ['pages', 'articles', 'hubs'],
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_data, siblingData) => siblingData?.type === 'custom',
      },
      label: 'URL',
    },
    {
      name: 'newTab',
      type: 'checkbox',
      defaultValue: false,
      label: 'Open in a new tab',
    },
  ]

  if (includeLabel) {
    fields.unshift({
      name: 'label',
      type: 'text',
      required: true,
    })
  }

  return {
    name,
    type: 'group',
    admin: {
      hideGutter: true,
    },
    fields,
  }
}
