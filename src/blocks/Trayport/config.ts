import type { Block } from 'payload'

import { imageOrVideoUploadField, imageUploadField } from '@/fields/mediaUpload'
import { safeExternalMediaURL, validateExternalVideoMediaURL } from '@/routing/urlPolicy'

import { blockActions } from './actions'
import { sectionComponents } from './components'

export const TrayportHero: Block = {
  slug: 'trayportHero',
  interfaceName: 'TrayportHeroBlock',
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
  labels: {
    singular: 'Content section',
    plural: 'Content sections',
  },
  fields: [
    {
      name: 'anchor',
      type: 'text',
    },
    {
      name: 'surfaceTone',
      type: 'select',
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
        description: 'Optional managed background asset; presentation and opacity remain bounded.',
      },
    }),
    {
      name: 'backgroundOpacity',
      type: 'select',
      dbName: 'bg_opacity',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: '10%', value: '10' },
        { label: '20%', value: '20' },
        { label: '50%', value: '50' },
      ],
      required: true,
    },
    {
      name: 'surfaceRadius',
      type: 'select',
      dbName: 'surface_radius',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Extra large', value: 'xl' },
      ],
    },
    {
      name: 'surfacePadding',
      type: 'select',
      dbName: 'surface_padding',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Medium', value: 'medium' },
      ],
    },
    {
      name: 'width',
      type: 'select',
      defaultValue: 'wide',
      options: [
        { label: 'Reading', value: 'reading' },
        { label: 'Standard', value: 'standard' },
        { label: 'Wide', value: 'wide' },
        { label: 'Full', value: 'full' },
      ],
      required: true,
    },
    {
      name: 'spacingTop',
      type: 'select',
      dbName: 'spacing_top',
      defaultValue: 'regular',
      options: [
        { label: 'Tight', value: 'tight' },
        { label: 'Regular', value: 'regular' },
        { label: 'Large', value: 'large' },
      ],
    },
    {
      name: 'spacingBottom',
      type: 'select',
      dbName: 'spacing_bottom',
      defaultValue: 'regular',
      options: [
        { label: 'Tight', value: 'tight' },
        { label: 'Regular', value: 'regular' },
        { label: 'Large', value: 'large' },
      ],
    },
    {
      name: 'columnGap',
      type: 'select',
      dbName: 'column_gap',
      defaultValue: 'regular',
      options: [
        { label: 'Tight', value: 'tight' },
        { label: 'Regular', value: 'regular' },
      ],
    },
    {
      name: 'columns',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      required: true,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'span',
          type: 'select',
          defaultValue: '12',
          options: ['4', '6', '8', '12'],
          required: true,
        },
        {
          name: 'horizontalAlign',
          type: 'select',
          dbName: 'horizontal_align',
          defaultValue: 'left',
          options: ['left', 'center'],
        },
        {
          name: 'verticalAlign',
          type: 'select',
          dbName: 'vertical_align',
          defaultValue: 'start',
          options: ['start', 'center'],
        },
        {
          name: 'heightMode',
          type: 'select',
          dbName: 'height_mode',
          defaultValue: 'fill',
          options: ['fill', 'content'],
        },
        {
          name: 'componentGap',
          type: 'select',
          dbName: 'component_gap',
          defaultValue: 'regular',
          options: ['none', 'regular'],
        },
        {
          name: 'padding',
          type: 'select',
          defaultValue: 'none',
          options: ['none', 'medium'],
        },
        {
          name: 'surface',
          type: 'select',
          defaultValue: 'none',
          options: ['none', 'muted', 'soft'],
        },
        {
          name: 'border',
          type: 'select',
          defaultValue: 'none',
          options: ['none', 'subtle'],
        },
        imageUploadField({
          name: 'backgroundMedia',
        }),
        {
          name: 'backgroundOpacity',
          type: 'select',
          dbName: 'bg_opacity',
          defaultValue: 'none',
          options: ['none', '10', '20', '50'],
        },
        {
          name: 'radius',
          type: 'select',
          defaultValue: 'default',
          options: ['default', 'xl'],
        },
        {
          name: 'components',
          type: 'blocks',
          blocks: sectionComponents,
          filterOptions: ({ data }) =>
            data?.pageType === 'interactive'
              ? true
              : sectionComponents
                  .filter(({ slug }) => slug !== 'marketMatrix')
                  .map(({ slug }) => slug),
          required: true,
          admin: {
            initCollapsed: true,
          },
        },
      ],
    },
  ],
}

export const ArticleListing: Block = {
  slug: 'articleListing',
  interfaceName: 'ArticleListingBlock',
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
