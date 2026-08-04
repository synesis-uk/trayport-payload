// @vitest-environment node

import type { SourceRecord } from '../../migration/contracts/v1'
import { navigationFromOptions } from '../../migration/transform'
import { describe, expect, it } from 'vitest'

type SourceOptions = Extract<SourceRecord, { entity: 'options' }>

describe('grouped navigation migration', () => {
  it('retains menu groups, spans, feature media, semantic icons, accents, and shell actions', () => {
    const options: SourceOptions = {
      schemaVersion: 1,
      entity: 'options',
      values: {
        dropdown: [
          {
            acf_fc_layout: 'menu_dropdown',
            for_page: 'http://trayport.local/products/',
            title: 'Products',
            menu_block: [
              {
                acfe_layout_col: '2',
                menu_items: [
                  {
                    acf_fc_layout: 'menu_section_title',
                    title: 'Joule',
                  },
                  {
                    acf_fc_layout: 'page_link',
                    page_link: {
                      color: '#00c1d5',
                      icon: 'chart-user',
                      link: {
                        name: 'Joule',
                        target: '',
                        title: 'Joule for Traders',
                        type: 'post',
                        url: 'http://trayport.local/products/joule/',
                        value: '1924',
                      },
                    },
                  },
                ],
              },
              {
                acfe_layout_col: '4',
                menu_items: [
                  {
                    acf_fc_layout: 'menu_feature',
                    icon: 'people-group ',
                    image: {
                      $ref: 'media',
                      id: 10246,
                      title: 'About Trayport',
                      url: 'http://trayport.local/app/uploads/about.jpg',
                    },
                    link: {
                      name: 'About Us',
                      target: '',
                      title: 'About Us',
                      type: 'post',
                      url: 'http://trayport.local/company/about-us/',
                      value: '2203',
                    },
                    text: '',
                  },
                ],
              },
            ],
          },
        ],
      },
    }

    const transformed = navigationFromOptions(options)

    expect(transformed).toMatchObject({
      primaryItems: [
        {
          label: 'Products',
          link: {
            newTab: false,
            type: 'custom',
            url: 'https://www.trayport.com/products/',
          },
          groups: [
            {
              title: 'Joule',
              span: '2',
              items: [
                {
                  accent: 'cyan',
                  icon: 'tradingScreen',
                  kind: 'link',
                  label: 'Joule for Traders',
                  link: { newTab: false, type: 'custom', url: '/products/joule/' },
                },
              ],
            },
            {
              span: '4',
              items: [
                {
                  accent: 'blue',
                  icon: 'people',
                  kind: 'feature',
                  label: 'About Us',
                  link: { newTab: false, type: 'custom', url: '/company/about-us/' },
                  media: { $legacyRef: 'media', legacyId: 10246 },
                },
              ],
            },
          ],
        },
      ],
      utilityItems: [
        { icon: 'playCircle', link: { label: 'See Joule', url: '/products/joule/' } },
        { icon: 'calendar', link: { label: 'Request A Demo', url: '/request-a-demo/' } },
        { icon: 'messages', link: { label: 'Contact Us', url: '/contact/' } },
      ],
    })
    expect(transformed).not.toHaveProperty('primaryAction')
  })
})
