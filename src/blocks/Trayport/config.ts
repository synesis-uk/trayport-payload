import type { Block } from 'payload'

import { imageOrVideoUploadField, imageUploadField } from '@/fields/mediaUpload'
import { safeExternalMediaURL, validateExternalVideoMediaURL } from '@/routing/urlPolicy'
import { createDefaultContentColumn } from '@/editor/sectionPresets'

import { blockActions } from './actions'
import { sectionComponents } from './components'

export const TrayportHero: Block = {
  slug: 'trayportHero',
  interfaceName: 'TrayportHeroBlock',
  admin: {
    components: {
      Label: '@/components/AdminEditor/RowLabels.client#LayoutRowLabel',
    },
    group: 'Page structure',
    images: {
      thumbnail: '/admin/blocks/hero.svg',
    },
  },
  labels: {
    singular: 'Hero',
    plural: 'Heroes',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
    },
    {
      name: 'badgeLabel',
      type: 'text',
      admin: {
        description: 'Optional compact label displayed above the hero heading.',
      },
    },
    {
      name: 'badgeIcon',
      type: 'select',
      options: [
        { label: 'People', value: 'people' },
        { label: 'Trading screen', value: 'tradingScreen' },
      ],
    },
    {
      name: 'badgeTone',
      type: 'select',
      defaultValue: 'secondary',
      options: [
        { label: 'Secondary', value: 'secondary' },
        { label: 'Info', value: 'info' },
      ],
    },
    {
      name: 'heading',
      type: 'textarea',
      required: true,
    },
    {
      name: 'body',
      type: 'richText',
    },
    imageOrVideoUploadField({
      name: 'media',
    }),
    {
      name: 'externalVideoURL',
      type: 'text',
      hooks: {
        beforeValidate: [
          ({ value }) =>
            safeExternalMediaURL(value, 'video') ||
            (typeof value === 'string' ? value.trim() : value),
        ],
      },
      validate: (value: string | null | undefined) => validateExternalVideoMediaURL(value),
    },
    {
      name: 'mediaAspect',
      type: 'select',
      defaultValue: 'twoToOne',
      options: [
        { label: '2:1', value: 'twoToOne' },
        { label: '16:9', value: 'sixteenToNine' },
      ],
    },
    blockActions,
    {
      name: 'statistics',
      type: 'array',
      maxRows: 4,
      admin: {
        description: 'Optional summary statistics shown beneath image heroes on larger screens.',
        initCollapsed: true,
      },
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
      ],
    },
    {
      name: 'appearance',
      type: 'select',
      admin: {
        description:
          'Image displays the selected media behind the hero. Dark and Light are text-led treatments and do not display hero media.',
      },
      defaultValue: 'dark',
      options: [
        { label: 'Dark', value: 'dark' },
        { label: 'Image', value: 'image' },
        { label: 'Light', value: 'light' },
      ],
      required: true,
    },
  ],
}

export const ContentSection: Block = {
  slug: 'contentSection',
  interfaceName: 'ContentSectionBlock',
  admin: {
    components: {
      Label: '@/components/AdminEditor/RowLabels.client#LayoutRowLabel',
    },
    group: 'Page structure',
    images: {
      thumbnail: '/admin/blocks/content-section.svg',
    },
  },
  labels: {
    singular: 'Content section',
    plural: 'Content sections',
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      defaultValue: [createDefaultContentColumn()],
      labels: {
        singular: 'Column',
        plural: 'Columns',
      },
      minRows: 1,
      // The reference authors up to ten columns in a single section — /products/customer-portal/
      // alternates five text/media pairs — so the pilot-era bound of eight rejected real content.
      // Twelve matches the grid the `span` values already divide.
      maxRows: 12,
      required: true,
      admin: {
        className: 'trayport-admin-columns',
        components: {
          RowLabel: '@/components/AdminEditor/RowLabels.client#ColumnRowLabel',
        },
        description:
          'Add and order the content columns in this section. Most pages use one or two columns.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'components',
          type: 'blocks',
          blocks: sectionComponents,
          // The connectivity matrix is embeddable on any page — the reference uses it on the
          // homepage and /markets/power/ as well as its dedicated page — so every section
          // component is offered. At most one per page is enforced by the archetype invariants.
          filterOptions: () => true,
          required: true,
          admin: {
            description: 'Add the editorial, media or data components shown in this column.',
            initCollapsed: true,
          },
        },
        {
          type: 'collapsible',
          label: 'Column layout and appearance',
          admin: {
            initCollapsed: true,
          },
          fields: [
            {
              name: 'span',
              type: 'select',
              label: 'Column width',
              admin: {
                description: 'Width in a 12-column grid. Two equal columns use 6 and 6.',
              },
              defaultValue: '12',
              options: [
                { label: 'One third (4/12)', value: '4' },
                { label: 'One half (6/12)', value: '6' },
                { label: 'Two thirds (8/12)', value: '8' },
                { label: 'Full width (12/12)', value: '12' },
              ],
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'horizontalAlign',
                  type: 'select',
                  label: 'Text alignment',
                  dbName: 'horizontal_align',
                  defaultValue: 'left',
                  options: [
                    { label: 'Left', value: 'left' },
                    { label: 'Centred', value: 'center' },
                  ],
                },
                {
                  name: 'verticalAlign',
                  type: 'select',
                  label: 'Vertical alignment',
                  dbName: 'vertical_align',
                  defaultValue: 'start',
                  options: [
                    { label: 'Top', value: 'start' },
                    { label: 'Centre', value: 'center' },
                  ],
                },
                {
                  name: 'heightMode',
                  type: 'select',
                  label: 'Column height',
                  dbName: 'height_mode',
                  defaultValue: 'fill',
                  options: [
                    { label: 'Match the row', value: 'fill' },
                    { label: 'Fit content', value: 'content' },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'componentGap',
                  type: 'select',
                  label: 'Space between components',
                  dbName: 'component_gap',
                  defaultValue: 'regular',
                  options: [
                    { label: 'None', value: 'none' },
                    { label: 'Standard', value: 'regular' },
                  ],
                },
                {
                  name: 'padding',
                  type: 'select',
                  label: 'Inner padding',
                  defaultValue: 'none',
                  options: [
                    { label: 'None', value: 'none' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'Large', value: 'large' },
                  ],
                },
                {
                  name: 'surface',
                  type: 'select',
                  label: 'Column background',
                  defaultValue: 'none',
                  options: [
                    { label: 'None', value: 'none' },
                    { label: 'Muted', value: 'muted' },
                    { label: 'Soft', value: 'soft' },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'border',
                  type: 'select',
                  label: 'Border',
                  defaultValue: 'none',
                  options: [
                    { label: 'None', value: 'none' },
                    { label: 'Subtle', value: 'subtle' },
                  ],
                },
                {
                  name: 'radius',
                  type: 'select',
                  label: 'Corners',
                  defaultValue: 'default',
                  options: [
                    { label: 'Standard', value: 'default' },
                    { label: 'Extra large', value: 'xl' },
                  ],
                },
              ],
            },
            imageUploadField({
              name: 'backgroundMedia',
              admin: {
                description: 'Optional image behind this column only.',
              },
            }),
            {
              name: 'backgroundOpacity',
              type: 'select',
              label: 'Background image strength',
              admin: {
                condition: (_data, siblingData) => Boolean(siblingData?.backgroundMedia),
              },
              dbName: 'bg_opacity',
              defaultValue: 'none',
              options: [
                { label: 'Hidden', value: 'none' },
                { label: 'Subtle (10%)', value: '10' },
                { label: 'Light (20%)', value: '20' },
                { label: 'Strong (50%)', value: '50' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Section appearance',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'surfaceTone',
          type: 'select',
          label: 'Section panel background',
          admin: {
            description: 'Applies a bounded background behind the section content.',
          },
          dbName: 'theme',
          defaultValue: 'none',
          options: [
            { label: 'None', value: 'none' },
            { label: 'White', value: 'white' },
            { label: 'Soft blue', value: 'softBlue' },
            { label: 'Dark blue', value: 'dark' },
          ],
        },
        {
          name: 'wrapperTheme',
          type: 'select',
          label: 'Full-width background band',
          admin: {
            description: 'Extends a branded colour across the full browser width.',
          },
          dbName: 'wrapper_theme',
          defaultValue: 'none',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Soft blue', value: 'softBlue' },
            { label: 'Green', value: 'green' },
            { label: 'Dark blue', value: 'dark' },
          ],
          required: true,
        },
        imageUploadField({
          name: 'backgroundMedia',
          admin: {
            description: 'Optional image behind the complete section panel.',
          },
        }),
        {
          name: 'backgroundOpacity',
          type: 'select',
          label: 'Background image strength',
          admin: {
            condition: (_data, siblingData) => Boolean(siblingData?.backgroundMedia),
          },
          dbName: 'bg_opacity',
          defaultValue: 'none',
          options: [
            { label: 'Hidden', value: 'none' },
            { label: 'Subtle (10%)', value: '10' },
            { label: 'Light (20%)', value: '20' },
            { label: 'Strong (50%)', value: '50' },
          ],
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'surfaceRadius',
              type: 'select',
              label: 'Panel corners',
              admin: {
                condition: (_data, siblingData) =>
                  siblingData?.surfaceTone !== 'none' || Boolean(siblingData?.backgroundMedia),
              },
              dbName: 'surface_radius',
              defaultValue: 'default',
              options: [
                { label: 'Standard', value: 'default' },
                { label: 'Extra large', value: 'xl' },
              ],
            },
            {
              name: 'surfacePadding',
              type: 'select',
              label: 'Panel padding',
              admin: {
                condition: (_data, siblingData) =>
                  siblingData?.surfaceTone !== 'none' || Boolean(siblingData?.backgroundMedia),
              },
              dbName: 'surface_padding',
              defaultValue: 'none',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Medium', value: 'medium' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Advanced section layout',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'anchor',
          type: 'text',
          label: 'Section anchor',
          admin: {
            description: 'Optional short ID used for direct links to this section.',
          },
        },
        {
          name: 'width',
          type: 'select',
          label: 'Content width',
          defaultValue: 'wide',
          options: [
            { label: 'Reading width', value: 'reading' },
            { label: 'Standard', value: 'standard' },
            { label: 'Wide', value: 'wide' },
            { label: 'Full browser width', value: 'full' },
          ],
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'spacingTop',
              type: 'select',
              label: 'Space above',
              dbName: 'spacing_top',
              defaultValue: 'regular',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Compact', value: 'tight' },
                { label: 'Standard', value: 'regular' },
                { label: 'Spacious', value: 'large' },
              ],
            },
            {
              name: 'spacingBottom',
              type: 'select',
              label: 'Space below',
              dbName: 'spacing_bottom',
              defaultValue: 'regular',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Compact', value: 'tight' },
                { label: 'Standard', value: 'regular' },
                { label: 'Spacious', value: 'large' },
              ],
            },
            {
              name: 'columnGap',
              type: 'select',
              label: 'Space between columns',
              dbName: 'column_gap',
              defaultValue: 'regular',
              options: [
                { label: 'Compact', value: 'tight' },
                { label: 'Standard', value: 'regular' },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export const ArticleListing: Block = {
  slug: 'articleListing',
  interfaceName: 'ArticleListingBlock',
  admin: {
    components: {
      Label: '@/components/AdminEditor/RowLabels.client#LayoutRowLabel',
    },
    group: 'Managed listings',
    images: {
      thumbnail: '/admin/blocks/article-listing.svg',
    },
  },
  fields: [
    {
      name: 'family',
      type: 'select',
      defaultValue: 'insights',
      options: [
        { label: 'Insights', value: 'insights' },
        { label: 'News', value: 'news' },
        { label: 'Events', value: 'events' },
        { label: 'All editorial content', value: 'all' },
      ],
      required: true,
    },
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Latest insights',
    },
    {
      name: 'intro',
      type: 'richText',
    },
    {
      name: 'pageSize',
      type: 'number',
      defaultValue: 100,
      min: 3,
      max: 100,
      required: true,
    },
    {
      name: 'showCategoryFilter',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}

export const LearningVideoListing: Block = {
  slug: 'learningVideoListing',
  interfaceName: 'LearningVideoListingBlock',
  admin: {
    components: {
      Label: '@/components/AdminEditor/RowLabels.client#LayoutRowLabel',
    },
    group: 'Managed listings',
    images: {
      thumbnail: '/admin/blocks/video-listing.svg',
    },
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Explore the Learning Hub',
    },
    {
      name: 'intro',
      type: 'richText',
    },
    {
      name: 'pageSize',
      type: 'number',
      defaultValue: 15,
      min: 3,
      max: 30,
      required: true,
    },
    {
      name: 'showProductFilter',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showCategoryFilter',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}

export const trayportLayoutBlocks = [
  TrayportHero,
  ContentSection,
  ArticleListing,
  LearningVideoListing,
]
