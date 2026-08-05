import type { ArrayField, TextField } from 'payload'

import { isAdmin } from '@/access/roles'

export const MARKET_DATA_KEY_PATTERN = /^[a-z0-9]+(?:[._:-][a-z0-9]+)*$/u

export const normalizeMarketDataKey = (value: unknown): string =>
  typeof value === 'string'
    ? value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._:-]+/gu, '-')
        .replace(/^[._:-]+|[._:-]+$/gu, '')
    : ''

export const validateMarketDataKey = (value: unknown): true | string => {
  const key = normalizeMarketDataKey(value)
  return key && MARKET_DATA_KEY_PATTERN.test(key)
    ? true
    : 'Use lowercase letters and numbers separated only by ., _, : or -.'
}

type MarketDataDocument = Record<string, unknown> & {
  marketDataKey?: unknown
  slug?: unknown
  title?: unknown
}

export const ensureMarketDataKey = (
  prefix: 'asset-class' | 'hub',
  data: MarketDataDocument | undefined,
  originalDoc: MarketDataDocument | undefined,
): MarketDataDocument | undefined => {
  if (!data) return data
  const current = normalizeMarketDataKey(data.marketDataKey || originalDoc?.marketDataKey)
  if (current) return { ...data, marketDataKey: current }

  const identity = normalizeMarketDataKey(data.slug || originalDoc?.slug || data.title)
  return identity ? { ...data, marketDataKey: `${prefix}:${identity}` } : data
}

export const marketDataKeyField = (): TextField => ({
  name: 'marketDataKey',
  type: 'text',
  access: {
    create: ({ req }) => isAdmin(req.user),
    update: () => false,
  },
  admin: {
    description:
      'Immutable key used by chart imports and application data. Administrators can manage aliases when a source uses another name.',
    position: 'sidebar',
    readOnly: true,
  },
  hooks: {
    beforeValidate: [({ value }) => normalizeMarketDataKey(value)],
  },
  index: true,
  unique: true,
  validate: validateMarketDataKey,
})

export const marketDataAliasesField = (): ArrayField => ({
  name: 'marketDataAliases',
  type: 'array',
  access: {
    create: ({ req }) => isAdmin(req.user),
    update: ({ req }) => isAdmin(req.user),
  },
  admin: {
    condition: (_data, _siblingData, { user }) => isAdmin(user),
    description:
      'Optional source labels accepted by the market-data validator. Matching is case-insensitive and ambiguous aliases are rejected.',
    initCollapsed: true,
    position: 'sidebar',
  },
  fields: [
    {
      name: 'value',
      type: 'text',
      hooks: {
        beforeValidate: [
          ({ value }) => (typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : value),
        ],
      },
      required: true,
    },
  ],
})
