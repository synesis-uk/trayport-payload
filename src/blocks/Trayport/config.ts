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
      defaultValue: 12,
      min: 3,
      max: 24,
      required: true,
    },
    {
      name: 'showCategoryFilter',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}

export const trayportLayoutBlocks = [TrayportHero, ContentSection, ArticleListing]
