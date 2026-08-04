import type { Block, TextFieldSingleValidation } from 'payload'

import { actionIconOptions, actionStyleOptions } from '@/fields/actions'
import { imageOrVideoUploadField, imageUploadField } from '@/fields/mediaUpload'
import { navigationLinkField } from '@/fields/navigationLink'
import {
  externalHTTPSDestinationPolicy,
  normalizeDestinationValue,
  safeExternalMediaURL,
  validateExternalMediaURL,
  validateExternalHTTPSURL,
} from '@/routing/urlPolicy'
import { blockActions } from './actions'

const validateMediaComponentExternalURL: TextFieldSingleValidation = (value, { data }) => {
  const document = data as { legacySource?: unknown } | undefined
  const legacySource =
    document?.legacySource && typeof document.legacySource === 'object'
      ? (document.legacySource as { source?: unknown })
      : null

  return legacySource?.source === 'wordpress' &&
    typeof value === 'string' &&
    /^http:\/\/trayport\.local\/app\/uploads\//iu.test(value)
    ? true
    : validateExternalMediaURL(value)
}

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
    {
      name: 'appearance',
      type: 'select',
      admin: {
        description: 'Visual scale is independent from the semantic heading level.',
      },
      defaultValue: 'h2',
      options: ['h1', 'h2', 'h3', 'h4'],
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
    imageOrVideoUploadField({
      name: 'media',
    }),
    {
      name: 'externalURL',
      type: 'text',
      admin: {
        description: 'Used for externally hosted video or a source asset not copied to this site.',
      },
      hooks: {
        beforeValidate: [
          ({ value }) =>
            safeExternalMediaURL(value) || (typeof value === 'string' ? value.trim() : value),
        ],
      },
      validate: validateMediaComponentExternalURL,
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
      name: 'presentation',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Carousel', value: 'carousel' },
        { label: 'Lead item and carousel', value: 'leadCarousel' },
      ],
      required: true,
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'display',
          type: 'select',
          defaultValue: 'plain',
          options: [
            { label: 'Plain', value: 'plain' },
            { label: 'Image', value: 'image' },
            { label: 'Icon', value: 'icon' },
          ],
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
        imageUploadField({
          name: 'media',
        }),
        navigationLinkField({
          includeLabel: true,
          required: false,
          typeDBName: 'content_link_type',
        }),
        {
          name: 'showAction',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Show the link as an action when a valid destination is configured.',
          },
          required: true,
        },
        {
          name: 'actionStyle',
          type: 'select',
          defaultValue: 'link',
          options: [...actionStyleOptions],
          required: true,
        },
        {
          name: 'actionIcon',
          type: 'select',
          options: [...actionIconOptions],
        },
      ],
    },
  ],
}

export const StandaloneIconComponent: Block = {
  slug: 'standaloneIcon',
  interfaceName: 'StandaloneIconComponent',
  labels: {
    singular: 'Standalone icon',
    plural: 'Standalone icons',
  },
  fields: [
    {
      name: 'icon',
      type: 'select',
      options: [
        { label: 'Gas', value: 'gas' },
        { label: 'Power', value: 'power' },
        { label: 'Emissions', value: 'emissions' },
      ],
      required: true,
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
        imageUploadField({
          name: 'media',
        }),
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
        imageUploadField({
          name: 'media',
        }),
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
        imageUploadField({
          name: 'media',
          required: true,
        }),
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
      name: 'presentation',
      type: 'select',
      defaultValue: 'summary',
      options: [
        { label: 'Map only', value: 'mapOnly' },
        { label: 'Map with summary', value: 'summary' },
      ],
      required: true,
      admin: {
        description:
          'Map only is intended for a map beside an existing managed introduction. Map with summary includes this block’s own title, body, regions and actions.',
      },
    },
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
    imageUploadField({
      name: 'backgroundMedia',
      admin: {
        description: 'Managed static background used by the map presentation when configured.',
      },
    }),
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
      admin: {
        description: 'Retained for migration provenance; the active schematic uses regions only.',
        hidden: true,
      },
      relationTo: 'asset-classes',
      hasMany: true,
    },
    {
      name: 'venueTypes',
      type: 'relationship',
      admin: {
        description: 'Retained for migration provenance; the active schematic uses regions only.',
        hidden: true,
      },
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
      hooks: {
        beforeValidate: [
          ({ value }) => normalizeDestinationValue(value, externalHTTPSDestinationPolicy),
        ],
      },
      required: true,
      validate: (value: unknown) => validateExternalHTTPSURL(value, true),
    },
    imageUploadField({
      name: 'poster',
      admin: {
        description: 'Reserved for a future managed embed-preview implementation.',
        hidden: true,
      },
    }),
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
      admin: {
        description: 'Metric read from the application market-data store.',
      },
      options: [
        { label: 'Volume', value: 'volume' },
        { label: 'Price', value: 'price' },
      ],
      defaultValue: 'volume',
      required: true,
    },
    {
      name: 'chartType',
      type: 'select',
      admin: {
        description: 'Chart presentation supported by the selected series dimension.',
      },
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
      name: 'seriesDimension',
      type: 'select',
      admin: {
        description: 'Group each series by execution type or by market hub.',
      },
      defaultValue: 'executionType',
      options: [
        { label: 'Execution type', value: 'executionType' },
        { label: 'Hub', value: 'hub' },
      ],
      required: true,
    },
    {
      name: 'displayInterval',
      type: 'select',
      admin: {
        description: 'Aggregate and label points by month, quarter, or year.',
      },
      defaultValue: 'quarter',
      options: [
        { label: 'Month', value: 'month' },
        { label: 'Quarter', value: 'quarter' },
        { label: 'Year', value: 'year' },
      ],
      required: true,
    },
    {
      name: 'unit',
      type: 'text',
    },
    {
      name: 'assetClass',
      type: 'relationship',
      admin: {
        description:
          'Select the managed asset class whose facts are read from the application market-data store.',
      },
      filterOptions: {
        'legacySource.legacyId': {
          exists: true,
        },
      },
      relationTo: 'asset-classes',
      required: true,
    },
    {
      name: 'includedHubs',
      type: 'relationship',
      admin: {
        description: 'Optional allow-list for hub-series charts. Leave empty to include all hubs.',
      },
      filterOptions: {
        'legacySource.legacyId': {
          exists: true,
        },
      },
      hasMany: true,
      relationTo: 'hubs',
    },
    {
      name: 'excludedHubs',
      type: 'relationship',
      admin: {
        description: 'Optional deny-list for hub-series charts.',
      },
      filterOptions: {
        'legacySource.legacyId': {
          exists: true,
        },
      },
      hasMany: true,
      relationTo: 'hubs',
    },
    {
      name: 'assetClassLegacyId',
      type: 'number',
      admin: {
        description:
          'Imported application-data lookup key retained for migration provenance and older drafts.',
        hidden: true,
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

export const MarketMatrixComponent: Block = {
  slug: 'marketMatrix',
  interfaceName: 'MarketMatrixComponent',
  labels: {
    singular: 'Market matrix',
    plural: 'Market matrices',
  },
  fields: [
    {
      name: 'caption',
      type: 'text',
      defaultValue: 'Trayport venue connectivity by market hub',
      required: true,
      admin: {
        description: 'Accessible table name for the generated connectivity matrix.',
      },
    },
    {
      name: 'assetClasses',
      type: 'relationship',
      hasMany: true,
      relationTo: 'asset-classes',
      admin: {
        description: 'Optional curated subset. Leave empty to include every managed asset class.',
      },
    },
    {
      name: 'venueTypes',
      type: 'relationship',
      hasMany: true,
      relationTo: 'venue-types',
      admin: {
        description: 'Optional curated subset. Leave empty to include every managed venue type.',
      },
    },
    {
      name: 'regions',
      type: 'relationship',
      hasMany: true,
      relationTo: 'regions',
      admin: {
        description: 'Optional hub-region subset. Leave empty to include every managed region.',
      },
    },
    {
      name: 'defaultView',
      type: 'select',
      defaultValue: 'joule',
      options: [
        { label: 'Joule', value: 'joule' },
        { label: 'autoTRADER', value: 'autoTrader' },
        { label: 'Joule and autoTRADER', value: 'combined' },
      ],
      required: true,
    },
    {
      name: 'showFilters',
      type: 'checkbox',
      defaultValue: true,
      required: true,
    },
    {
      name: 'showDownload',
      type: 'checkbox',
      defaultValue: true,
      required: true,
      admin: {
        description: 'Offer a CSV export of the visitor’s current filtered view.',
      },
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
  StandaloneIconComponent,
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
  MarketMatrixComponent,
  OfficeComponent,
]
