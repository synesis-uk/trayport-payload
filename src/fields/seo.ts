import type { GroupField } from 'payload'

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
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'canonicalURL',
      type: 'text',
      admin: {
        description: 'Only set this when the canonical URL differs from this page.',
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
