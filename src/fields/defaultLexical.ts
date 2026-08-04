import type { TextFieldSingleValidation } from 'payload'
import {
  BoldFeature,
  HeadingFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  lexicalEditor,
  UnderlineFeature,
  type LinkFields,
  type LinkFeatureServerProps,
} from '@payloadcms/richtext-lexical'

import {
  managedLinkDestinationPolicy,
  normalizeDestinationValue,
  validateDestination,
} from '@/routing/urlPolicy'

type LexicalLinkFieldsFactory = Extract<
  NonNullable<LinkFeatureServerProps['fields']>,
  (...args: never[]) => unknown
>

export const managedLexicalLinkCollections = [
  'pages',
  'articles',
  'hubs',
  'venues',
  'learning-videos',
] as const

export const managedLexicalLinkFields: LexicalLinkFieldsFactory = ({ defaultFields }) => {
  const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
    if ('name' in field && field.name === 'url') return false
    return true
  })

  return [
    ...defaultFieldsWithoutUrl,
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
      },
      hooks: {
        beforeValidate: [
          ({ siblingData, value }) =>
            (siblingData as LinkFields)?.linkType === 'internal'
              ? value
              : normalizeDestinationValue(value, managedLinkDestinationPolicy),
        ],
      },
      label: ({ t }) => t('fields:enterURL'),
      required: true,
      validate: ((value, options) => {
        if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
          return true // no validation needed, as no url should exist for internal links
        }
        return validateDestination(value, {
          message:
            'Use a root-relative path, anchor, mailto:, tel:, or complete HTTPS URL without credentials.',
          policy: managedLinkDestinationPolicy,
          required: true,
        })
      }) as TextFieldSingleValidation,
    },
  ]
}

export const defaultLexical = lexicalEditor({
  features: [
    ParagraphFeature(),
    UnderlineFeature(),
    BoldFeature(),
    ItalicFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    OrderedListFeature(),
    UnorderedListFeature(),
    LinkFeature({
      enabledCollections: [...managedLexicalLinkCollections],
      fields: managedLexicalLinkFields,
    }),
  ],
})
