import type { CollectionConfig } from 'payload'

import { admins, adminsOrEditors, publicOrCMSUsers } from '@/access/roles'
import { trayportLayoutBlocks } from '@/blocks/Trayport/config'
import { contentPathField } from '@/fields/contentPath'
import { coordinatesField } from '@/fields/coordinates'
import { createLegacySourceField } from '@/fields/legacySource'
import {
  ensureMarketDataKey,
  marketDataAliasesField,
  marketDataKeyField,
} from '@/fields/marketData'
import { imageOrVideoUploadField } from '@/fields/mediaUpload'
import { publishedAtField } from '@/fields/publishedAt'
import { confirmPathRedirectField } from '@/fields/routeControls'
import { seoField } from '@/fields/seo'
import { trayportSlugField } from '@/fields/slug'
import { validateRoutableDocument } from '@/routing/archetypes'
import { releaseRoutableRoute, syncRoutableRoute } from '@/routing/registry'
import {
  externalHTTPSDestinationPolicy,
  normalizeDestinationValue,
  validateExternalHTTPSURL,
} from '@/routing/urlPolicy'
import { generateContentPreviewPath } from '@/utilities/generateContentPreviewPath'
import { validateMapRouteGeoJSON } from '@/maps/geoJSON'

import {
  revalidateDeletedRoutableContent,
  revalidateRoutableContent,
} from './hooks/revalidateContent'

export const Hubs: CollectionConfig = {
  slug: 'hubs',
  access: {
    create: adminsOrEditors,
    delete: admins,
    read: publicOrCMSUsers,
    readVersions: adminsOrEditors,
    update: adminsOrEditors,
  },
  admin: {
    defaultColumns: ['title', 'code', 'path', '_status', 'updatedAt'],
    group: 'Market coverage',
    livePreview: {
      url: ({ data }) => generateContentPreviewPath(data?.path),
    },
    preview: (data) => generateContentPreviewPath(data?.path),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    assetClasses: true,
    code: true,
    contentMode: true,
    externalDestination: true,
    heroMedia: true,
    legacySource: {
      legacyId: true,
    },
    marketDataKey: true,
    meta: {
      description: true,
      image: true,
    },
    path: true,
    slug: true,
    summary: true,
    title: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      index: true,
      required: true,
    },
    {
      name: 'contentMode',
      type: 'select',
      admin: {
        description:
          'Map-only hubs are market markers and relationship records. Page hubs also render a public editorial page.',
        position: 'sidebar',
      },
      defaultValue: 'map-only',
      options: [
        {
          label: 'Map only',
          value: 'map-only',
        },
        {
          label: 'Public page',
          value: 'page',
        },
      ],
      required: true,
    },
    {
      name: 'externalDestination',
      type: 'text',
      admin: {
        condition: (_data, siblingData) => siblingData?.contentMode === 'map-only',
        description:
          'Temporary live-site fallback used by managed relationships until this hub owns a migrated route.',
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => normalizeDestinationValue(value, externalHTTPSDestinationPolicy),
        ],
      },
      validate: (value: string | null | undefined) => validateExternalHTTPSURL(value),
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'summary',
              type: 'textarea',
            },
            imageOrVideoUploadField({
              name: 'heroMedia',
            }),
            {
              name: 'layout',
              type: 'blocks',
              admin: {
                condition: (_data, siblingData) => siblingData?.contentMode === 'page',
                initCollapsed: true,
              },
              blocks: trayportLayoutBlocks,
            },
          ],
        },
        {
          label: 'Market',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'code',
                  type: 'text',
                  admin: {
                    width: '50%',
                  },
                  index: true,
                  label: 'Market code',
                },
                {
                  name: 'hubType',
                  type: 'select',
                  admin: {
                    width: '50%',
                  },
                  defaultValue: 'vhub',
                  label: 'Map hub type',
                  options: [
                    { label: 'Virtual hub', value: 'vhub' },
                    { label: 'Physical hub', value: 'phub' },
                    { label: 'Offshore hub', value: 'ohub' },
                    { label: 'Regional hub', value: 'rhub' },
                  ],
                },
              ],
            },
            marketDataKeyField(),
            marketDataAliasesField(),
            {
              name: 'assetClasses',
              type: 'relationship',
              hasMany: true,
              relationTo: 'asset-classes',
            },
            {
              name: 'venueTypes',
              type: 'relationship',
              hasMany: true,
              relationTo: 'venue-types',
            },
            {
              name: 'regions',
              type: 'relationship',
              hasMany: true,
              relationTo: 'regions',
            },
            {
              name: 'relatedHubs',
              type: 'relationship',
              hasMany: true,
              relationTo: 'hubs',
            },
            {
              name: 'showOnMap',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'countryCode',
              type: 'text',
              admin: {
                description: 'ISO 3166-1 alpha-3 country code used by the Mapbox boundary layer.',
              },
              hooks: {
                beforeValidate: [
                  ({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value),
                ],
              },
              maxLength: 3,
              minLength: 3,
              validate: (value: unknown) =>
                value === null ||
                value === undefined ||
                value === '' ||
                /^[A-Z]{3}$/u.test(String(value))
                  ? true
                  : 'Use a three-letter ISO country code.',
            },
            {
              name: 'connectedCountryCodes',
              type: 'array',
              admin: {
                description: 'Additional countries served by this hub.',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'code',
                  type: 'text',
                  hooks: {
                    beforeValidate: [
                      ({ value }) =>
                        typeof value === 'string' ? value.trim().toUpperCase() : value,
                    ],
                  },
                  maxLength: 3,
                  minLength: 3,
                  required: true,
                  validate: (value: unknown) =>
                    /^[A-Z]{3}$/u.test(String(value))
                      ? true
                      : 'Use a three-letter ISO country code.',
                },
              ],
            },
            {
              name: 'map',
              type: 'group',
              fields: [
                {
                  name: 'locationLabel',
                  type: 'text',
                },
                coordinatesField({
                  label: 'Map centre',
                  name: 'centre',
                }),
                {
                  name: 'zoom',
                  type: 'number',
                  defaultValue: 6,
                  max: 20,
                  min: 1,
                },
                {
                  name: 'markers',
                  type: 'array',
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                    },
                    coordinatesField({
                      label: 'Location',
                      name: 'location',
                      required: true,
                    }),
                  ],
                },
                {
                  name: 'connections',
                  type: 'array',
                  admin: {
                    description:
                      'Explicit hub-to-hub routes. A route is optional; the renderer draws a direct connection when it is omitted.',
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'hub',
                      type: 'relationship',
                      relationTo: 'hubs',
                      required: true,
                    },
                    {
                      name: 'route',
                      type: 'json',
                      admin: {
                        description:
                          'Optional LineString, MultiLineString or FeatureCollection GeoJSON.',
                      },
                      validate: validateMapRouteGeoJSON,
                    },
                    {
                      name: 'showLineMarker',
                      type: 'checkbox',
                      defaultValue: false,
                    },
                    {
                      name: 'lineMarkerLabel',
                      type: 'text',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Venue connections',
          fields: [
            {
              name: 'connections',
              type: 'array',
              access: {
                create: () => false,
                update: () => false,
              },
              admin: {
                description:
                  'Legacy derived projection retained for migration provenance. Edit connectivity on each Venue; the market matrix reads Venue connections only.',
                hidden: true,
                initCollapsed: true,
                readOnly: true,
              },
              fields: [
                {
                  name: 'venue',
                  type: 'relationship',
                  relationTo: 'venues',
                  required: true,
                },
                {
                  name: 'connectionType',
                  type: 'select',
                  options: [
                    {
                      label: 'Joule',
                      value: 'd',
                    },
                    {
                      label: 'autoTRADER',
                      value: 'a',
                    },
                    {
                      label: 'Joule and autoTRADER',
                      value: 'b',
                    },
                  ],
                  required: true,
                },
                {
                  name: 'supportsJoule',
                  type: 'checkbox',
                  admin: {
                    readOnly: true,
                  },
                  hooks: {
                    beforeValidate: [
                      ({ siblingData }) =>
                        siblingData?.connectionType === 'd' || siblingData?.connectionType === 'b',
                    ],
                  },
                },
                {
                  name: 'supportsAutoTrader',
                  type: 'checkbox',
                  admin: {
                    readOnly: true,
                  },
                  hooks: {
                    beforeValidate: [
                      ({ siblingData }) =>
                        siblingData?.connectionType === 'a' || siblingData?.connectionType === 'b',
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [seoField()],
        },
      ],
    },
    trayportSlugField(),
    contentPathField({
      condition: (_data, siblingData) => siblingData?.contentMode === 'page',
      required: false,
    }),
    confirmPathRedirectField({
      condition: (_data, siblingData) => siblingData?.contentMode === 'page',
    }),
    publishedAtField(),
    createLegacySourceField(),
  ],
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) =>
        ensureMarketDataKey(
          'hub',
          data as Record<string, unknown>,
          originalDoc as Record<string, unknown>,
        ),
    ],
    beforeChange: [validateRoutableDocument('hubs')],
    afterChange: [syncRoutableRoute('hubs'), revalidateRoutableContent(['/market-coverage/'])],
    afterDelete: [
      releaseRoutableRoute('hubs'),
      revalidateDeletedRoutableContent(['/market-coverage/']),
    ],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 400,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
