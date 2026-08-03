import type { Block } from 'payload'

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
      name: 'heading',
      type: 'textarea',
      required: true,
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'externalVideoURL',
      type: 'text',
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
      name: 'theme',
      type: 'select',
      defaultValue: 'light',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Soft blue', value: 'softBlue' },
        { label: 'Dark blue', value: 'dark' },
        { label: 'White', value: 'white' },
      ],
      required: true,
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
    {
      name: 'appearance',
      type: 'select',
      dbName: 'presentation',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Inset card', value: 'inset' },
      ],
      required: true,
    },
    {
      name: 'backgroundMedia',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional managed background asset; presentation and opacity remain bounded.',
      },
    },
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
      name: 'spacing',
      type: 'select',
      defaultValue: 'regular',
      options: [
        { label: 'Compact', value: 'compact' },
        { label: 'Regular', value: 'regular' },
        { label: 'Generous', value: 'generous' },
      ],
      required: true,
    },
    {
      name: 'columns',
      type: 'array',
      minRows: 1,
      maxRows: 6,
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
          name: 'components',
          type: 'blocks',
          blocks: sectionComponents,
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
