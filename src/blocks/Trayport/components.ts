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
      name: 'style',
      type: 'select',
      dbName: 'map_style',
      defaultValue: 'dark',
      options: [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
      ],
      required: true,
    },
    {
      name: 'backgroundMedia',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Managed static background used by the map presentation when configured.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'height',
          type: 'number',
          defaultValue: 300,
          min: 100,
          max: 600,
          required: true,
          admin: {
            step: 50,
          },
        },
        {
          name: 'markerSize',
          type: 'number',
          defaultValue: 5,
          min: 2,
          max: 8,
          required: true,
          admin: {
            step: 1,
          },
        },
      ],
    },
    {
      name: 'showLines',
      type: 'checkbox',
      defaultValue: true,
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'lineColor',
          type: 'select',
          dbName: 'line_color',
          defaultValue: '#009cde',
          options: [
            { label: 'Navy', value: '#1f2a44' },
            { label: 'Dark blue', value: '#002d72' },
            { label: 'Mid blue', value: '#0057b8' },
            { label: 'Light blue', value: '#009cde' },
            { label: 'Turquoise', value: '#00c1d5' },
            { label: 'Green', value: '#32b77b' },
            { label: 'Orange', value: '#ff671f' },
            { label: 'Yellow', value: '#f7ea48' },
          ],
          required: true,
        },
        {
          name: 'lineWidth',
          type: 'number',
          defaultValue: 0.5,
          min: 0,
          max: 1,
          required: true,
          admin: {
            step: 0.1,
          },
        },
        {
          name: 'lineOpacity',
          type: 'number',
          defaultValue: 0.5,
          min: 0,
          max: 1,
          required: true,
          admin: {
            step: 0.1,
          },
        },
      ],
    },
    {
      name: 'assetClasses',
      type: 'relationship',
      relationTo: 'asset-classes',
      hasMany: true,
    },
    {
      name: 'venueTypes',
      type: 'relationship',
      relationTo: 'venue-types',
      hasMany: true,
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
      name: 'chartType',
      type: 'select',
      dbName: 'chart_type',
      defaultValue: 'stackedColumn',
      options: [
        { label: 'Stacked columns', value: 'stackedColumn' },
        { label: 'Columns', value: 'column' },
        { label: 'Line', value: 'line' },
      ],
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
    {
      type: 'row',
      fields: [
        {
          name: 'fromYear',
          type: 'number',
          min: 2000,
          max: 2100,
        },
        {
          name: 'fromQuarter',
          type: 'number',
          min: 1,
          max: 4,
        },
        {
          name: 'toYear',
          type: 'number',
          min: 2000,
          max: 2100,
        },
        {
          name: 'toQuarter',
          type: 'number',
          min: 1,
          max: 4,
        },
      ],
    },
    {
      name: 'axisLabel',
      type: 'text',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'height',
          type: 'number',
          defaultValue: 350,
          min: 280,
          max: 560,
        },
        {
          name: 'scalePower',
          type: 'number',
          defaultValue: 0,
          min: 0,
          max: 12,
          admin: {
            description: 'Divide source values by 10 to this power before display.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'showAxes',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'showLegend',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'showValues',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'showDataTable',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Accessibility enhancement. Disable to restore chart-only parity.',
          },
        },
      ],
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
