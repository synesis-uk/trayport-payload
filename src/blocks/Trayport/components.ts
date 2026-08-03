import type { Block } from 'payload'

import { navigationLinkField } from '@/fields/navigationLink'
import { blockActions } from './actions'

export const HeadingComponent: Block = {
  slug: 'heading',
  interfaceName: 'HeadingComponent',
  labels: {
    singular: 'Heading',
    plural: 'Headings',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
    {
      name: 'level',
      type: 'select',
      defaultValue: 'h2',
      options: ['h2', 'h3', 'h4'],
      required: true,
    },
  ],
}

export const RichTextComponent: Block = {
  slug: 'richText',
  interfaceName: 'RichTextComponent',
  labels: {
    singular: 'Rich text',
    plural: 'Rich text',
  },
  fields: [
    {
      name: 'body',
      type: 'richText',
      required: true,
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'regular',
      options: [
        { label: 'Regular', value: 'regular' },
        { label: 'Large', value: 'large' },
      ],
      required: true,
    },
  ],
}

export const ActionsComponent: Block = {
  slug: 'actions',
  interfaceName: 'ActionsComponent',
  fields: [blockActions],
}

export const MediaComponent: Block = {
  slug: 'media',
  interfaceName: 'TrayportMediaComponent',
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'externalURL',
      type: 'text',
      admin: {
        description: 'Used for externally hosted video or a source asset not copied to this site.',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'aspect',
      type: 'select',
      defaultValue: 'landscape',
      options: [
        { label: 'Landscape', value: 'landscape' },
        { label: 'Wide', value: 'wide' },
        { label: 'Square', value: 'square' },
        { label: 'Portrait', value: 'portrait' },
        { label: 'Natural', value: 'natural' },
      ],
    },
  ],
}

export const FeatureListComponent: Block = {
  slug: 'featureList',
  interfaceName: 'FeatureListComponent',
  fields: [
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Stacked', value: 'stacked' },
        { label: 'Logos', value: 'logos' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'body',
          type: 'richText',
        },
        {
          name: 'icon',
          type: 'select',
          options: [
            { label: 'Idea', value: 'lightbulb' },
            { label: 'Growth', value: 'trend' },
            { label: 'Time', value: 'clock' },
            { label: 'Chart', value: 'chart' },
            { label: 'Scan', value: 'scan' },
          ],
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
        },
        navigationLinkField({
          includeLabel: true,
          required: false,
          typeDBName: 'content_link_type',
        }),
      ],
    },
  ],
}

export const StatisticsComponent: Block = {
  slug: 'statistics',
  interfaceName: 'StatisticsComponent',
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'value',
          type: 'text',
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
      ],
    },
  ],
}

export const FAQComponent: Block = {
  slug: 'faq',
  interfaceName: 'FAQComponent',
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'richText',
          required: true,
        },
        {
          name: 'media',
          type: 'upload',
          filterOptions: {
            mimeType: {
              contains: 'image/',
            },
          },
          relationTo: 'media',
        },
      ],
    },
  ],
}

export const EntityListComponent: Block = {
  slug: 'entityList',
  interfaceName: 'EntityListComponent',
  fields: [
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Products', value: 'products' },
        { label: 'People', value: 'people' },
        { label: 'Clients', value: 'clients' },
        { label: 'Venues', value: 'venues' },
      ],
      required: true,
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'richText',
        },
        navigationLinkField({ required: false, typeDBName: 'content_link_type' }),
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}

export const TimelineComponent: Block = {
  slug: 'timeline',
  interfaceName: 'TimelineComponent',
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'body',
          type: 'richText',
        },
      ],
    },
  ],
}

export const DataTableComponent: Block = {
  slug: 'dataTable',
  interfaceName: 'DataTableComponent',
  fields: [
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'headers',
      type: 'array',
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'rows',
      type: 'array',
      fields: [
        {
          name: 'cells',
          type: 'array',
          fields: [
            {
              name: 'text',
              type: 'textarea',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}

export const GalleryComponent: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryComponent',
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
  ],
}

export const DividerComponent: Block = {
  slug: 'divider',
  interfaceName: 'DividerComponent',
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'line',
      options: ['line', 'space'],
    },
  ],
}

export const MarketCoverageComponent: Block = {
  slug: 'marketCoverage',
  interfaceName: 'MarketCoverageComponent',
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Explore our connectivity',
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'regions',
      type: 'relationship',
      relationTo: 'regions',
      hasMany: true,
    },
    blockActions,
  ],
}

export const EmbedComponent: Block = {
  slug: 'embed',
  interfaceName: 'EmbedComponent',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}

export const DataChartComponent: Block = {
  slug: 'dataChart',
  interfaceName: 'DataChartComponent',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'dataType',
      type: 'select',
      options: [
        { label: 'Volume', value: 'volume' },
        { label: 'Price', value: 'price' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'volume',
      required: true,
    },
    {
      name: 'unit',
      type: 'text',
    },
    {
      name: 'assetClassLegacyId',
      type: 'number',
      admin: {
        description: 'Application-data lookup key. Chart series remain outside the editorial CMS.',
        readOnly: true,
      },
    },
    {
      name: 'accessibleSummary',
      type: 'textarea',
    },
  ],
}

export const OfficeComponent: Block = {
  slug: 'office',
  interfaceName: 'OfficeComponent',
  labels: {
    singular: 'Office',
    plural: 'Offices',
  },
  fields: [
    {
      name: 'office',
      type: 'relationship',
      relationTo: 'offices',
      required: true,
    },
    {
      name: 'appearance',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Featured', value: 'featured' },
      ],
      required: true,
    },
  ],
}

export const sectionComponents = [
  HeadingComponent,
  RichTextComponent,
  ActionsComponent,
  MediaComponent,
  FeatureListComponent,
  StatisticsComponent,
  FAQComponent,
  EntityListComponent,
  TimelineComponent,
  DataTableComponent,
  GalleryComponent,
  DividerComponent,
  MarketCoverageComponent,
  EmbedComponent,
  DataChartComponent,
  OfficeComponent,
]
