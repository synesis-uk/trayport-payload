import type { Field, GlobalConfig } from 'payload'

import { publicGlobalRead } from '@/access/publicGlobalRead'
import { adminsOrEditors } from '@/access/roles'
import { createLegacySourceField } from '@/fields/legacySource'
import { imageUploadField } from '@/fields/mediaUpload'
import { navigationLinkField } from '@/fields/navigationLink'
import { captureGlobalPublicProjectionIntent } from '@/hooks/publicProjection'

import { revalidateGlobal } from './hooks/revalidateGlobal'

const navigationIconOptions = [
  { label: 'People', value: 'people' },
  { label: 'Offices', value: 'offices' },
  { label: 'Careers', value: 'careers' },
  { label: 'Trading screen', value: 'tradingScreen' },
  { label: 'Network', value: 'network' },
  { label: 'Connections', value: 'connections' },
  { label: 'Connectivity', value: 'connectivity' },
  { label: 'Code', value: 'code' },
  { label: 'Compare', value: 'compare' },
  { label: 'Waterfall chart', value: 'waterfallChart' },
  { label: 'Candlestick chart', value: 'candlestickChart' },
  { label: 'Calculator', value: 'calculator' },
  { label: 'Users', value: 'users' },
  { label: 'Market access', value: 'marketAccess' },
  { label: 'Quote', value: 'quote' },
  { label: 'Pie chart', value: 'pieChart' },
  { label: 'Ballot', value: 'ballot' },
  { label: 'Shield', value: 'shield' },
  { label: 'Lock', value: 'lock' },
  { label: 'CSV file', value: 'csvFile' },
  { label: 'Building security', value: 'buildingSecurity' },
  { label: 'File', value: 'file' },
  { label: 'Power', value: 'power' },
  { label: 'Gas', value: 'gas' },
  { label: 'Metals', value: 'metals' },
  { label: 'Climate', value: 'climate' },
  { label: 'Bulk markets', value: 'bulkMarkets' },
  { label: 'Oil', value: 'oil' },
  { label: 'World', value: 'world' },
  { label: 'North America', value: 'northAmerica' },
  { label: 'Europe', value: 'europe' },
  { label: 'Asia Pacific', value: 'asiaPacific' },
  { label: 'Video', value: 'video' },
  { label: 'Play', value: 'playCircle' },
  { label: 'Market matrix', value: 'marketMatrix' },
  { label: 'Map', value: 'map' },
  { label: 'Lifecycle', value: 'lifecycle' },
  { label: 'News', value: 'news' },
  { label: 'Calendar', value: 'calendar' },
  { label: 'Insight', value: 'insight' },
  { label: 'List', value: 'list' },
  { label: 'Email', value: 'email' },
  { label: 'Messages', value: 'messages' },
  { label: 'Demo', value: 'demo' },
] as const

const navigationAccentOptions = [
  { label: 'Blue', value: 'blue' },
  { label: 'Cyan', value: 'cyan' },
  { label: 'Green', value: 'green' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Orange', value: 'orange' },
] as const

const groupedMenuItemFields = (): Field[] => [
  {
    name: 'kind',
    type: 'select',
    defaultValue: 'link',
    options: [
      { label: 'Link', value: 'link' },
      { label: 'Feature card', value: 'feature' },
    ],
    required: true,
  },
  {
    name: 'label',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    type: 'textarea',
  },
  navigationLinkField(),
  {
    name: 'icon',
    type: 'select',
    admin: {
      description: 'Choose from the bounded interface-icon vocabulary.',
    },
    options: [...navigationIconOptions],
  },
  {
    name: 'accent',
    type: 'select',
    admin: {
      description: 'Semantic Trayport accent used for the icon and rule.',
    },
    options: [...navigationAccentOptions],
  },
  imageUploadField({
    name: 'media',
    admin: {
      condition: (_data, siblingData) => siblingData?.kind === 'feature',
      description: 'Feature-card image. Ordinary navigation links do not render media.',
    },
  }),
]

const groupedMenuFields = (): Field[] => [
  {
    name: 'title',
    type: 'text',
  },
  navigationLinkField({ name: 'titleLink', required: false }),
  {
    name: 'span',
    type: 'select',
    admin: {
      description: 'Bounded width in the 12-column desktop menu.',
    },
    defaultValue: 'auto',
    options: [
      { label: 'Automatic', value: 'auto' },
      { label: '2 columns', value: '2' },
      { label: '3 columns', value: '3' },
      { label: '4 columns', value: '4' },
      { label: '6 columns', value: '6' },
    ],
    required: true,
  },
  {
    name: 'items',
    type: 'array',
    admin: {
      initCollapsed: true,
    },
    fields: groupedMenuItemFields(),
    maxRows: 32,
    minRows: 1,
    required: true,
  },
]

const childItemFields = (): Field[] => [
  {
    name: 'label',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    type: 'textarea',
  },
  {
    name: 'groupLabel',
    type: 'text',
    admin: {
      description: 'Retained from WordPress for migration provenance; not used by the active menu.',
      hidden: true,
    },
  },
  imageUploadField({
    name: 'media',
    admin: {
      description: 'Retained from WordPress for migration provenance; not used by the active menu.',
      hidden: true,
    },
  }),
  navigationLinkField(),
]

const primaryItemFields = (): Field[] => [
  {
    name: 'label',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    type: 'textarea',
  },
  navigationLinkField(),
  {
    name: 'groups',
    type: 'array',
    admin: {
      description:
        'Structured full-width menu groups. Titles, feature cards, widths, icons, and accents are bounded to the live navigation vocabulary.',
      initCollapsed: true,
    },
    fields: groupedMenuFields(),
    maxRows: 8,
  },
  {
    name: 'children',
    type: 'array',
    admin: {
      description:
        'Retained as a hidden migration fallback while grouped menus are rolled out. The active menu prefers groups.',
      hidden: true,
      initCollapsed: true,
    },
    fields: childItemFields(),
    maxRows: 32,
  },
]

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: publicGlobalRead,
    readVersions: adminsOrEditors,
    update: adminsOrEditors,
  },
  admin: {
    group: 'Site configuration',
  },
  fields: [
    {
      name: 'primaryItems',
      type: 'array',
      admin: {
        description:
          'Main desktop and mobile navigation. Dropdown content is organized into bounded groups.',
        initCollapsed: true,
      },
      fields: primaryItemFields(),
      maxRows: 12,
    },
    {
      name: 'utilityItems',
      type: 'array',
      admin: {
        description: 'Small supporting links shown separately from the primary navigation.',
        initCollapsed: true,
      },
      fields: [
        navigationLinkField({ includeLabel: true }),
        {
          name: 'icon',
          type: 'select',
          options: [...navigationIconOptions],
        },
      ],
      maxRows: 8,
    },
    createLegacySourceField(),
  ],
  hooks: {
    beforeOperation: [captureGlobalPublicProjectionIntent],
    afterChange: [revalidateGlobal('navigation')],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 800,
      },
      schedulePublish: true,
    },
  },
}
