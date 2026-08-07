import type {
  ArrayField,
  Block,
  RelationshipFieldManyValidation,
  SelectFieldSingleValidation,
  TextFieldSingleValidation,
} from 'payload'

import { actionIconOptions, actionStyleOptions } from '@/fields/actions'
import { imageOrVideoUploadField, imageUploadField } from '@/fields/mediaUpload'
import { navigationLinkField } from '@/fields/navigationLink'
import { validateHubSpotFormID } from '@/integrations/hubSpotForm'
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

const siblingSelectionMode = (value: unknown): unknown =>
  value && typeof value === 'object'
    ? (value as { selectionMode?: unknown }).selectionMode
    : undefined

const validateSpecificPeople: RelationshipFieldManyValidation = (value, { siblingData }) =>
  siblingSelectionMode(siblingData) !== 'specific' || (Array.isArray(value) && value.length > 0)
    ? true
    : 'Choose at least one Person.'

const validatePeopleTeam: SelectFieldSingleValidation = (value, { siblingData }) =>
  siblingSelectionMode(siblingData) !== 'team' || Boolean(value) ? true : 'Choose a team.'

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

export const PeopleListComponent: Block = {
  slug: 'peopleList',
  interfaceName: 'PeopleListComponent',
  labels: {
    singular: 'People listing',
    plural: 'People listings',
  },
  fields: [
    {
      name: 'selectionMode',
      type: 'select',
      defaultValue: 'specific',
      options: [
        { label: 'Choose people', value: 'specific' },
        { label: 'People in a team', value: 'team' },
      ],
      required: true,
    },
    {
      name: 'people',
      type: 'relationship',
      admin: {
        condition: (_data, siblingData) => siblingSelectionMode(siblingData) === 'specific',
        description:
          'Selected profiles and their order. Each card always uses the current Person record.',
      },
      hasMany: true,
      relationTo: 'people',
      validate: validateSpecificPeople,
    },
    {
      name: 'team',
      type: 'select',
      admin: {
        condition: (_data, siblingData) => siblingSelectionMode(siblingData) === 'team',
        description: 'Team listings update automatically as published profiles change.',
      },
      options: [
        { label: 'Leadership', value: 'ceo' },
        { label: 'Senior management', value: 'smt' },
        { label: 'Department heads', value: 'head' },
        { label: 'Careers', value: 'careers' },
      ],
      validate: validatePeopleTeam,
    },
    {
      name: 'presentation',
      type: 'select',
      defaultValue: 'leadershipGrid',
      options: [
        { label: 'Leadership grid', value: 'leadershipGrid' },
        { label: 'Careers carousel', value: 'careersCarousel' },
      ],
      required: true,
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

export const HubSpotFormComponent: Block = {
  slug: 'hubspotForm',
  interfaceName: 'HubSpotFormComponent',
  labels: {
    singular: 'HubSpot form',
    plural: 'HubSpot forms',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Public heading shown immediately above the form.',
      },
      required: true,
    },
    {
      name: 'formId',
      type: 'text',
      admin: {
        description: 'The HubSpot form UUID. The portal remains managed by the site integration.',
      },
      required: true,
      validate: validateHubSpotFormID,
    },
  ],
}

const marketCoverageActions: ArrayField = {
  ...(blockActions as ArrayField),
  admin: {
    ...(blockActions as ArrayField).admin,
    condition: (_data, siblingData) => siblingData?.presentation !== 'mapOnly',
    description: 'Optional links shown below the map introduction.',
  },
}

export const MarketCoverageComponent: Block = {
  slug: 'marketCoverage',
  interfaceName: 'MarketCoverageComponent',
  admin: {
    group: 'Market tools',
    images: {
      icon: {
        alt: 'Market coverage map',
        url: '/admin/blocks/specialist-market-map-icon.svg',
      },
      thumbnail: {
        alt: 'A map showing connected market locations',
        url: '/admin/blocks/specialist-market-map-thumbnail.svg',
      },
    },
  },
  labels: {
    singular: 'Market coverage map',
    plural: 'Market coverage maps',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'mode',
              type: 'select',
              label: 'Map experience',
              admin: {
                description:
                  'Use Global connections for the simple worldwide overview. Regional connectivity provides the detailed Mapbox explorer with hub, venue and market-data controls.',
              },
              defaultValue: 'globalConnections',
              options: [
                { label: 'Global connections', value: 'globalConnections' },
                { label: 'Regional connectivity explorer', value: 'regionalConnectivity' },
              ],
            },
            {
              name: 'presentation',
              type: 'select',
              label: 'Content layout',
              defaultValue: 'summary',
              options: [
                { label: 'Map only', value: 'mapOnly' },
                { label: 'Introduction and map', value: 'summary' },
              ],
              required: true,
              admin: {
                description:
                  'Choose Map only when the surrounding page already introduces the map. Introduction and map adds this block’s title, body and actions.',
              },
            },
            {
              name: 'title',
              type: 'text',
              admin: {
                condition: (_data, siblingData) => siblingData?.presentation !== 'mapOnly',
                description: 'Heading shown alongside the map.',
              },
              defaultValue: 'Explore our connectivity',
            },
            {
              name: 'body',
              type: 'richText',
              admin: {
                condition: (_data, siblingData) => siblingData?.presentation !== 'mapOnly',
                description: 'Optional introduction shown alongside the map.',
              },
            },
            marketCoverageActions,
          ],
        },
        {
          label: 'Markets shown',
          fields: [
            {
              name: 'assetClasses',
              type: 'relationship',
              label: 'Asset classes',
              admin: {
                description: 'Optional subset. Leave empty to include every mapped asset class.',
              },
              relationTo: 'asset-classes',
              hasMany: true,
            },
            {
              name: 'venueTypes',
              type: 'relationship',
              label: 'Venue types',
              admin: {
                condition: (_data, siblingData) => siblingData?.mode === 'regionalConnectivity',
                description: 'Optional venue-type subset for the regional explorer.',
              },
              relationTo: 'venue-types',
              hasMany: true,
            },
            {
              name: 'regions',
              type: 'relationship',
              label: 'Regions',
              admin: {
                description:
                  'Optional regional subset. Leave empty to use every region represented by the managed market data.',
              },
              relationTo: 'regions',
              hasMany: true,
            },
            {
              name: 'includedHubs',
              type: 'relationship',
              label: 'Specific hubs',
              admin: {
                condition: (_data, siblingData) => siblingData?.mode === 'regionalConnectivity',
                description:
                  'Optional hub allow-list for the regional explorer. Leave empty to use the broader market filters above.',
              },
              hasMany: true,
              relationTo: 'hubs',
            },
            {
              name: 'defaultAssetClass',
              type: 'relationship',
              label: 'Initially selected asset class',
              admin: {
                description:
                  'Optional class selected when the map first opens. It must also be available in the chosen asset-class subset.',
              },
              relationTo: 'asset-classes',
            },
          ],
        },
        {
          label: 'Visitor controls',
          fields: [
            {
              name: 'showAssetClassFilter',
              type: 'checkbox',
              label: 'Let visitors switch asset class',
              admin: {
                description: 'Show an asset-class selector when more than one class is available.',
              },
              defaultValue: true,
            },
            {
              name: 'autoplayAssetClasses',
              type: 'checkbox',
              label: 'Automatically cycle asset classes',
              admin: {
                condition: (_data, siblingData) => siblingData?.mode !== 'regionalConnectivity',
                description:
                  'Only applies to Global connections. Visitors who prefer reduced motion never see autoplay.',
              },
              defaultValue: false,
              required: true,
            },
            {
              name: 'autoplayDelay',
              type: 'number',
              label: 'Seconds per asset class',
              admin: {
                condition: (_data, siblingData) =>
                  siblingData?.mode !== 'regionalConnectivity' &&
                  siblingData?.autoplayAssetClasses === true,
                description: 'Time before the Global connections map moves to the next class.',
              },
              defaultValue: 5,
              max: 30,
              min: 2,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'zoomTo',
                  type: 'select',
                  label: 'Initial map extent',
                  admin: {
                    condition: (_data, siblingData) => siblingData?.mode === 'regionalConnectivity',
                    width: '50%',
                  },
                  defaultValue: 'markers',
                  options: [
                    { label: 'Visible market markers', value: 'markers' },
                    { label: 'Selected region', value: 'region' },
                  ],
                },
                {
                  name: 'showSidebar',
                  type: 'checkbox',
                  label: 'Show hub details panel',
                  admin: {
                    condition: (_data, siblingData) => siblingData?.mode === 'regionalConnectivity',
                    width: '50%',
                  },
                  defaultValue: true,
                },
              ],
            },
            {
              name: 'showMarketData',
              type: 'checkbox',
              label: 'Show market values',
              admin: {
                condition: (_data, siblingData) => siblingData?.mode === 'regionalConnectivity',
                description:
                  'Add period and value controls backed by the application market-data store.',
              },
              defaultValue: false,
            },
            {
              name: 'dataDisplay',
              type: 'select',
              label: 'Market-value labels',
              admin: {
                condition: (_data, siblingData) =>
                  siblingData?.mode === 'regionalConnectivity' &&
                  siblingData?.showMarketData === true,
              },
              defaultValue: 'always',
              options: [
                { label: 'Always on the map and in hub details', value: 'always' },
                { label: 'On map hover; always in accessible details', value: 'hover' },
              ],
            },
          ],
        },
        {
          label: 'Map appearance',
          fields: [
            {
              name: 'style',
              type: 'select',
              label: 'Map colour scheme',
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
              label: 'Fallback map background',
              admin: {
                description:
                  'Optional managed image shown behind the map and used if the interactive map cannot load.',
              },
            }),
            {
              type: 'row',
              fields: [
                {
                  name: 'height',
                  type: 'number',
                  label: 'Map height (pixels)',
                  defaultValue: 300,
                  min: 100,
                  max: 800,
                  required: true,
                  admin: {
                    description: 'Regional maps have an effective minimum height of 320 pixels.',
                    step: 50,
                    width: '50%',
                  },
                },
                {
                  name: 'markerSize',
                  type: 'number',
                  label: 'Location marker size',
                  defaultValue: 5,
                  min: 2,
                  max: 8,
                  required: true,
                  admin: {
                    step: 1,
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'showLines',
              type: 'checkbox',
              label: 'Show connections between locations',
              defaultValue: true,
              required: true,
            },
            {
              type: 'collapsible',
              label: 'Connection line styling',
              admin: {
                condition: (_data, siblingData) => siblingData?.showLines !== false,
                initCollapsed: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'lineColor',
                      type: 'select',
                      label: 'Colour',
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
                      admin: {
                        width: '40%',
                      },
                    },
                    {
                      name: 'lineWidth',
                      type: 'number',
                      label: 'Thickness',
                      defaultValue: 0.5,
                      min: 0,
                      max: 1,
                      required: true,
                      admin: {
                        step: 0.1,
                        width: '30%',
                      },
                    },
                    {
                      name: 'lineOpacity',
                      type: 'number',
                      label: 'Opacity',
                      defaultValue: 0.5,
                      min: 0,
                      max: 1,
                      required: true,
                      admin: {
                        step: 0.1,
                        width: '30%',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
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
  admin: {
    group: 'Data and charts',
    images: {
      icon: {
        alt: 'Market data chart',
        url: '/admin/blocks/specialist-data-chart-icon.svg',
      },
      thumbnail: {
        alt: 'A market data chart with columns and a trend line',
        url: '/admin/blocks/specialist-data-chart-thumbnail.svg',
      },
    },
  },
  labels: {
    singular: 'Market data chart',
    plural: 'Market data charts',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              admin: {
                description: 'Public heading shown above the chart and its accessible data table.',
              },
              required: true,
            },
            {
              name: 'accessibleSummary',
              type: 'textarea',
              label: 'Accessible chart summary',
              admin: {
                description:
                  'Optional plain-language explanation of the main trend or comparison. Do not repeat the title.',
                rows: 3,
              },
            },
          ],
        },
        {
          label: 'Data',
          fields: [
            {
              name: 'assetClass',
              type: 'relationship',
              label: 'Asset class',
              admin: {
                description:
                  'Select the managed asset class whose values are read from the application market-data store.',
              },
              filterOptions: {
                marketDataKey: {
                  exists: true,
                },
              },
              relationTo: 'asset-classes',
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'seriesDimension',
                  type: 'select',
                  label: 'Compare values by',
                  admin: {
                    description:
                      'Execution type compares OTC and exchange-traded activity. Hub compares individual market hubs.',
                    width: '50%',
                  },
                  defaultValue: 'executionType',
                  options: [
                    { label: 'Execution type', value: 'executionType' },
                    { label: 'Hub', value: 'hub' },
                  ],
                  required: true,
                },
                {
                  name: 'dataType',
                  type: 'select',
                  label: 'Measure',
                  admin: {
                    description:
                      'Price is available for hub comparisons. Execution-type charts show traded volume.',
                    width: '50%',
                  },
                  filterOptions: ({ options, siblingData }) =>
                    siblingData?.seriesDimension === 'executionType'
                      ? options.filter(
                          (option) =>
                            (typeof option === 'string' ? option : option.value) === 'volume',
                        )
                      : options,
                  options: [
                    { label: 'Traded volume', value: 'volume' },
                    { label: 'Price', value: 'price' },
                  ],
                  defaultValue: 'volume',
                  required: true,
                },
              ],
            },
            {
              name: 'displayInterval',
              type: 'select',
              label: 'Time interval',
              admin: {
                description: 'Aggregate and label chart points by month, quarter or year.',
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
              type: 'collapsible',
              label: 'Optional hub and date filters',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'includedHubs',
                  type: 'relationship',
                  label: 'Only include these hubs',
                  admin: {
                    description:
                      'Optional allow-list applied before chart values are aggregated. Leave empty to include all hubs.',
                  },
                  filterOptions: {
                    marketDataKey: {
                      exists: true,
                    },
                  },
                  hasMany: true,
                  relationTo: 'hubs',
                },
                {
                  name: 'excludedHubs',
                  type: 'relationship',
                  label: 'Exclude these hubs',
                  admin: {
                    description:
                      'Optional deny-list. A hub selected above and here will be excluded.',
                  },
                  filterOptions: {
                    marketDataKey: {
                      exists: true,
                    },
                  },
                  hasMany: true,
                  relationTo: 'hubs',
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'fromYear',
                      type: 'number',
                      label: 'From year',
                      min: 2000,
                      max: 2100,
                      admin: {
                        width: '25%',
                      },
                    },
                    {
                      name: 'fromQuarter',
                      type: 'number',
                      label: 'From quarter',
                      min: 1,
                      max: 4,
                      admin: {
                        condition: (_data, siblingData) => Boolean(siblingData?.fromYear),
                        description: '1–4. Leave empty to start at the beginning of the year.',
                        width: '25%',
                      },
                    },
                    {
                      name: 'toYear',
                      type: 'number',
                      label: 'To year',
                      min: 2000,
                      max: 2100,
                      admin: {
                        width: '25%',
                      },
                    },
                    {
                      name: 'toQuarter',
                      type: 'number',
                      label: 'To quarter',
                      min: 1,
                      max: 4,
                      admin: {
                        condition: (_data, siblingData) => Boolean(siblingData?.toYear),
                        description: '1–4. Leave empty to include the full final year.',
                        width: '25%',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Display',
          fields: [
            {
              name: 'chartType',
              type: 'select',
              label: 'Chart style',
              admin: {
                description:
                  'Only the chart style supported by the selected comparison and measure is offered.',
              },
              dbName: 'chart_type',
              defaultValue: 'stackedColumn',
              filterOptions: ({ options, siblingData }) => {
                // Price is only meaningful as a line. Volume can be plotted stacked or unstacked
                // for either comparison — the reference does both — so offer that choice rather
                // than pinning execution type to stacked columns.
                const allowed =
                  siblingData?.dataType === 'price'
                    ? ['line']
                    : ['stackedColumn', 'column']

                return options.filter((option) =>
                  allowed.includes(typeof option === 'string' ? option : String(option.value)),
                )
              },
              options: [
                { label: 'Stacked columns', value: 'stackedColumn' },
                { label: 'Columns', value: 'column' },
                { label: 'Line', value: 'line' },
              ],
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'unit',
                  type: 'text',
                  label: 'Value unit',
                  admin: {
                    description: 'For example MWh, therms or €/MWh.',
                    width: '50%',
                  },
                },
                {
                  name: 'axisLabel',
                  type: 'text',
                  label: 'Value-axis label',
                  admin: {
                    condition: (_data, siblingData) => siblingData?.showAxes !== false,
                    description: 'Optional longer label shown beside the value axis.',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'height',
              type: 'number',
              label: 'Chart height (pixels)',
              defaultValue: 350,
              min: 280,
              max: 560,
              admin: {
                step: 10,
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'showAxes',
                  type: 'checkbox',
                  label: 'Show chart axes',
                  defaultValue: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'showLegend',
                  type: 'checkbox',
                  label: 'Show series legend',
                  defaultValue: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'showValues',
                  type: 'checkbox',
                  label: 'Show values on chart',
                  defaultValue: false,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'showDataTable',
                  type: 'checkbox',
                  label: 'Include accessible data table',
                  defaultValue: true,
                  admin: {
                    description:
                      'Recommended. Gives keyboard and screen-reader users the source values behind the chart.',
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Advanced',
          fields: [
            {
              name: 'scalePower',
              type: 'number',
              label: 'Value scaling power',
              defaultValue: 0,
              min: 0,
              max: 12,
              admin: {
                description:
                  'Divide source values by 10 to this power before display. For example, 6 displays millions. Normally leave this at 0.',
              },
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
          ],
        },
      ],
    },
  ],
}

export const MarketMatrixComponent: Block = {
  slug: 'marketMatrix',
  interfaceName: 'MarketMatrixComponent',
  admin: {
    group: 'Market tools',
    images: {
      icon: {
        alt: 'Market matrix',
        url: '/admin/blocks/specialist-market-matrix-icon.svg',
      },
      thumbnail: {
        alt: 'A venue connectivity matrix organised by market hub',
        url: '/admin/blocks/specialist-market-matrix-thumbnail.svg',
      },
    },
  },
  labels: {
    singular: 'Market matrix',
    plural: 'Market matrices',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'caption',
              type: 'text',
              label: 'Matrix title',
              defaultValue: 'Trayport venue connectivity by market hub',
              required: true,
              admin: {
                description:
                  'Accessible name for the generated connectivity matrix. It is announced to assistive technology rather than displayed as a second heading.',
              },
            },
            {
              name: 'defaultView',
              type: 'select',
              label: 'Initially selected connectivity',
              admin: {
                description:
                  'Visitors can switch views after the matrix loads. Choose the most useful starting point for this page.',
              },
              defaultValue: 'joule',
              options: [
                { label: 'Joule', value: 'joule' },
                { label: 'autoTRADER', value: 'autoTrader' },
                { label: 'Joule and autoTRADER', value: 'combined' },
              ],
              required: true,
            },
          ],
        },
        {
          label: 'Markets shown',
          fields: [
            {
              name: 'assetClasses',
              type: 'relationship',
              label: 'Asset classes',
              hasMany: true,
              relationTo: 'asset-classes',
              admin: {
                description:
                  'Optional subset. Leave empty to include every managed asset class with connectivity data.',
              },
            },
            {
              name: 'venueTypes',
              type: 'relationship',
              label: 'Venue types',
              hasMany: true,
              relationTo: 'venue-types',
              admin: {
                description:
                  'Optional subset. Leave empty to include every managed venue type with connectivity data.',
              },
            },
            {
              name: 'regions',
              type: 'relationship',
              label: 'Hub regions',
              hasMany: true,
              relationTo: 'regions',
              admin: {
                description:
                  'Optional subset applied to market hubs. Leave empty to include hubs from every managed region.',
              },
            },
          ],
        },
        {
          label: 'Visitor controls',
          fields: [
            {
              name: 'showFilters',
              type: 'checkbox',
              label: 'Let visitors filter the matrix',
              defaultValue: true,
              required: true,
              admin: {
                description:
                  'Show filters when the selected data contains multiple asset classes, venue types or hubs.',
              },
            },
            {
              name: 'showDownload',
              type: 'checkbox',
              label: 'Offer data downloads',
              defaultValue: true,
              required: true,
              admin: {
                description:
                  'Let visitors export their current filtered view as either CSV or an Excel workbook.',
              },
            },
          ],
        },
      ],
    },
  ],
}

export const ChecklistComponent: Block = {
  slug: 'checklist',
  interfaceName: 'ChecklistComponent',
  labels: {
    singular: 'Checklist',
    plural: 'Checklists',
  },
  fields: [
    {
      name: 'appearance',
      type: 'select',
      defaultValue: 'checks',
      options: [
        { label: 'Check marks', value: 'checks' },
        { label: 'Numbered steps', value: 'numbers' },
      ],
      required: true,
    },
    {
      name: 'items',
      type: 'array',
      admin: {
        description: 'Keep each item concise. Longer explanatory content belongs in rich text.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          maxLength: 120,
        },
        {
          name: 'text',
          type: 'textarea',
          maxLength: 500,
          required: true,
        },
      ],
      maxRows: 24,
      minRows: 1,
      required: true,
    },
  ],
}

export const LifecycleComponent: Block = {
  slug: 'lifecycle',
  interfaceName: 'LifecycleComponent',
  labels: {
    singular: 'Lifecycle table',
    plural: 'Lifecycle tables',
  },
  fields: [
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Accessible name for the lifecycle tables.',
      },
      defaultValue: 'Product lifecycle schedule',
      maxLength: 160,
      required: true,
    },
    {
      name: 'lifecycleItems',
      type: 'relationship',
      admin: {
        description:
          'Select and order the managed rows to show. Inactive or unpublished rows are excluded from the public page.',
      },
      hasMany: true,
      maxRows: 100,
      minRows: 1,
      relationTo: 'lifecycle-items',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'upcomingHeading',
          type: 'text',
          admin: {
            width: '50%',
          },
          defaultValue: 'Upcoming End-of-Life Details',
          maxLength: 120,
          required: true,
        },
        {
          name: 'previousHeading',
          type: 'text',
          admin: {
            width: '50%',
          },
          defaultValue: 'Previous Versions',
          maxLength: 120,
          required: true,
        },
      ],
    },
    {
      name: 'showDescriptions',
      type: 'checkbox',
      defaultValue: false,
      required: true,
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

const sectionComponentGroups: Record<string, string> = {
  actions: 'Calls to action',
  checklist: 'Structured content',
  dataChart: 'Data and charts',
  dataTable: 'Data and charts',
  divider: 'Content',
  embed: 'Media',
  entityList: 'Structured content',
  faq: 'Structured content',
  featureList: 'Structured content',
  gallery: 'Media',
  heading: 'Content',
  hubspotForm: 'Integrations',
  lifecycle: 'Structured content',
  marketCoverage: 'Market tools',
  marketMatrix: 'Market tools',
  media: 'Media',
  office: 'Company information',
  peopleList: 'Company information',
  richText: 'Content',
  standaloneIcon: 'Content',
  statistics: 'Structured content',
  timeline: 'Structured content',
}

const withSectionComponentAdmin = (component: Block): Block => ({
  ...component,
  admin: {
    ...component.admin,
    components: {
      ...component.admin?.components,
      Label: '@/components/AdminEditor/RowLabels.client#ComponentRowLabel',
    },
    group: component.admin?.group || sectionComponentGroups[component.slug],
  },
})

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
  PeopleListComponent,
  TimelineComponent,
  DataTableComponent,
  GalleryComponent,
  DividerComponent,
  HubSpotFormComponent,
  MarketCoverageComponent,
  EmbedComponent,
  DataChartComponent,
  MarketMatrixComponent,
  ChecklistComponent,
  LifecycleComponent,
  OfficeComponent,
].map(withSectionComponentAdmin)
