// @vitest-environment node

import { readFileSync } from 'node:fs'

import { footerAccentOptions, footerIconOptions } from '@/config/footer'

import type { SourceRecord } from '../../migration/contracts/v1'
import { footerFromOptions, siteSettingsFromOptions } from '../../migration/transform'
import { describe, expect, it } from 'vitest'

const menuItem = (label: string, value: number, url: string, icon: string, color = '') => ({
  acf_fc_layout: 'page_link',
  page_link: {
    color,
    icon,
    link: {
      name: label,
      target: '',
      title: label,
      type: 'post',
      url,
      value: String(value),
    },
  },
})

const options = {
  entity: 'options',
  schemaVersion: 1,
  values: {
    cookie_notice: {
      accept_label: 'Accept All',
      enabled: true,
      message:
        'By clicking “Accept All”, you agree to the storing of cookies on your device to enhance site navigation, analyse site usage, and assist in our marketing efforts. For more information please refer to our',
      policy_label: 'Cookie Policy',
      policy_path: '/legal/cookie-policy/',
      reject_label: 'Reject All',
      title: 'Trayport Cookie Consent',
    },
    footer_company_registration_text: 'Registered company statement',
    footer_new: {
      menu_block: [
        {
          menu_items: [
            { acf_fc_layout: 'menu_section_title', link: '', title: '' },
            menuItem(
              'About Us',
              2203,
              'http://trayport.local/company/about-us/',
              'address-card',
              '{"brand":"#00c1d5"}',
            ),
            menuItem(
              'Office Locations',
              2205,
              'http://trayport.local/company/offices/',
              'buildings',
              '{"brand":"#00c1d5"}',
            ),
            menuItem('Careers', 2207, 'http://trayport.local/?page_id=2207', 'handshake'),
            menuItem('Contact', 34, 'http://trayport.local/contact/', 'envelope'),
          ],
        },
        {
          menu_items: [
            { acf_fc_layout: 'menu_section_title', link: '', title: '' },
            menuItem(
              'Market Matrix',
              2231,
              'http://trayport.local/resources/market-matrix/',
              'grid-round-4',
              '{"brand":"#ff671f"}',
            ),
            menuItem(
              'Europe',
              5981,
              'http://trayport.local/regions/europe/',
              'earth-europe',
              '{"brand":"#f7ea48"}',
            ),
            menuItem(
              'North America',
              2221,
              'http://trayport.local/regions/north-america/',
              'earth-americas',
              '{"brand":"#f7ea48"}',
            ),
            menuItem(
              'Asia Pacific',
              5983,
              'http://trayport.local/regions/asia-pacific/',
              'earth-asia',
              '{"brand":"#f7ea48"}',
            ),
          ],
        },
        {
          menu_items: [
            {
              acf_fc_layout: 'menu_section_title',
              link: {
                name: 'Legal',
                target: '',
                title: 'Legal',
                type: 'post',
                url: 'http://trayport.local/legal/',
                value: '4737',
              },
              title: '',
            },
            menuItem(
              'Modern Slavery',
              7573,
              'http://trayport.local/legal/modern-slavery/',
              'file-pen',
            ),
            menuItem('Legal Notice', 4803, 'http://trayport.local/legal/legal-notice/', 'file-pen'),
            menuItem(
              'Terms of Use & Disclaimer',
              7585,
              'http://trayport.local/terms-of-use-disclaimer/',
              'file-pen',
            ),
            menuItem(
              'Privacy & Cookies',
              7589,
              'http://trayport.local/legal/cookie-policy/',
              'file-pen',
            ),
          ],
        },
      ],
    },
    footer_parent_company_text: 'Parent company statement',
    legal: {
      address: 'Trayport Limited, London',
      company_number: '02769279',
      disclaimer:
        '<p>Any trading activity is conducted with the specific trading venue.</p><p>Trayport is a software provider of trading solutions and is not a trading venue.<br>Trayport does not arrange investments or provide investment advice.</p>',
    },
  },
} satisfies Extract<SourceRecord, { entity: 'options' }>

describe('footer and consent import contract', () => {
  it('shares one neutral Footer option vocabulary between schema and rendering', () => {
    expect(footerIconOptions.map(({ value }) => value)).toEqual([
      'companyProfile',
      'offices',
      'careers',
      'contact',
      'marketMatrix',
      'regionEurope',
      'regionNorthAmerica',
      'regionAsiaPacific',
      'legalDocument',
    ])
    expect(footerAccentOptions.map(({ value }) => value)).toEqual([
      'cyan',
      'yellow',
      'orange',
      'white',
    ])

    const footerSchema = readFileSync(
      new URL('../../src/globals/Footer.ts', import.meta.url),
      'utf8',
    )
    const footerAdapter = readFileSync(
      new URL('../../src/Footer/adapter.tsx', import.meta.url),
      'utf8',
    )
    const footerTypes = readFileSync(new URL('../../src/Footer/types.ts', import.meta.url), 'utf8')

    expect(footerSchema).toContain("from '@/config/footer'")
    expect(footerSchema).not.toContain("from '@/Footer/")
    expect(footerAdapter).toContain("from '@/config/footer'")
    expect(footerTypes).not.toMatch(/export const footer(?:Icon|Accent)Options/)
  })

  it('maps all 13 reachable footer destinations and bounded icon/accent controls', () => {
    const footer = footerFromOptions(options) as {
      columns: Array<{
        links: Array<{
          accent: string
          icon: string
          link: { label: string; url: string }
        }>
        title?: string
        titleLink?: { url: string }
      }>
      companyRegistrationText: string
      copyright: string
      intro: string
      parentCompanyText: string
    }

    expect(footer.columns).toHaveLength(3)
    expect(footer.columns[0].title).toBeUndefined()
    expect(footer.columns[1].title).toBeUndefined()
    expect(footer.columns[2]).toMatchObject({ title: 'Legal', titleLink: { url: '/legal/' } })
    expect(footer.columns.reduce((count, column) => count + column.links.length, 1)).toBe(13)
    expect(footer.columns.flatMap(({ links }) => links).map(({ icon }) => icon)).toEqual([
      'companyProfile',
      'offices',
      'careers',
      'contact',
      'marketMatrix',
      'regionEurope',
      'regionNorthAmerica',
      'regionAsiaPacific',
      'legalDocument',
      'legalDocument',
      'legalDocument',
      'legalDocument',
    ])
    expect(footer.columns[0].links[0]).toMatchObject({ accent: 'cyan' })
    expect(footer.columns[1].links.map(({ accent }) => accent)).toEqual([
      'orange',
      'yellow',
      'yellow',
      'yellow',
    ])
    expect(footer.columns[0].links[2].link.url).toBe('/company/careers/')
    expect(footer).toMatchObject({
      companyRegistrationText: 'Registered company statement',
      copyright: 'Copyright © {year} Trayport Limited',
      intro:
        'Any trading activity is conducted with the specific trading venue.\nTrayport is a software provider of trading solutions and is not a trading venue.\nTrayport does not arrange investments or provide investment advice.',
      parentCompanyText: 'Parent company statement',
    })
  })

  it('imports only the public aggregate cookie notice and managed policy relation', () => {
    expect(siteSettingsFromOptions(options)).toMatchObject({
      cookieNotice: {
        acceptLabel: 'Accept All',
        enabled: true,
        message: expect.stringContaining('By clicking “Accept All”'),
        policyLinkLabel: 'Cookie Policy',
        policyPage: { $legacyRef: 'page', legacyId: 7589 },
        policyURL: '/legal/cookie-policy/',
        rejectLabel: 'Reject All',
        title: 'Trayport Cookie Consent',
      },
      contact: { address: 'Trayport Limited, London' },
    })
    expect(JSON.stringify(siteSettingsFromOptions(options))).not.toMatch(
      /necessary|analytics|advertisement|vendor/i,
    )
  })

  it('retains imported accent data behind the exact white footer-icon presentation', () => {
    const shellCSS = readFileSync(
      new URL('../../src/app/(frontend)/parity-shell.css', import.meta.url),
      'utf8',
    )
    const iconRule = shellCSS.match(/\.site-footer \.site-footer__navigation-icon\s*{([^}]*)}/)?.[1]

    expect(iconRule).toMatch(/color:\s*#fff/)
    expect(shellCSS).not.toMatch(/\.site-footer \.site-footer__navigation-icon\[data-accent=/)
  })
})
