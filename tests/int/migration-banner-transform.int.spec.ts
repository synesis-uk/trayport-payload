import { describe, expect, it } from 'vitest'

import type { SourceReusable } from '../../migration/contracts/v1'
import { mapBannerReusable } from '../../migration/transform/banner'

const sourceBanner = (overrides: Partial<SourceReusable> = {}): SourceReusable => ({
  schemaVersion: 1,
  entity: 'reusable',
  legacyId: 11602,
  postType: 'banner',
  status: 'publish',
  title: "EEX's New Natural Gas Spot Trading System - Find out more!",
  path: null,
  menuOrder: 0,
  publishedAt: '2026-07-15T10:00:00+00:00',
  modifiedAt: '2026-07-16T10:00:00+00:00',
  data: {
    bg_color: { color: { color: '#00c1d5', shade: '#52afde', type: 'brand' } },
    display_order: 0,
    end_at: '2026-12-31T17:00:00+00:00',
    header: 'EEX Gas Spot - M7G migration. Find out more!',
    layout: 'small',
    link: {
      name: 'EEX News',
      target: '_blank',
      title: '',
      type: 'post',
      url: 'http://trayport.local/eex-news/',
      value: '11299',
    },
    notification_recipient_emails: ['sophie.inghamclark@trayport.com'],
    pages: [1940, 6773],
    position: 'first',
    show_on: 'specific',
    start_at: '2026-07-20T00:00:00+00:00',
  },
  ...overrides,
})

describe('WordPress banner migration', () => {
  it('preserves scheduling, placement, selected Pages, presentation and recipient review data', () => {
    expect(mapBannerReusable(sourceBanner())).toMatchObject({
      target: 'banners',
      legacy: {
        legacyId: 11602,
        modifiedGmt: '2026-07-16T10:00:00+00:00',
      },
      data: {
        _status: 'published',
        dismissible: true,
        endAt: '2026-12-31T17:00:00.000Z',
        headline: 'EEX Gas Spot - M7G migration. Find out more!',
        layout: 'small',
        link: {
          label: 'EEX News',
          newTab: true,
          reference: {
            relationTo: 'pages',
            value: { $legacyRef: 'page', legacyId: 11299 },
          },
          type: 'reference',
        },
        migratedRecipientEmails: [{ email: 'sophie.inghamclark@trayport.com' }],
        position: 'first',
        startAt: '2026-07-20T00:00:00.000Z',
        targetMode: 'specific',
        targetPages: [
          { $legacyRef: 'page', legacyId: 1940 },
          { $legacyRef: 'page', legacyId: 6773 },
        ],
        tone: 'cyan',
      },
    })
  })

  it('maps all-page large banners, nested media and safe custom actions', () => {
    const mapped = mapBannerReusable(
      sourceBanner({
        legacyId: 4363,
        data: {
          ...sourceBanner().data,
          bg_color: { color: { color: '#ff671f', type: 'brand' } },
          image: { image: { image: { $ref: 'media', id: 4319 } } },
          layout: 'large',
          link: {
            target: '_blank',
            title: 'Contact your Account Manager',
            type: 'url',
            url: 'mailto:clientmanagerstraders@trayport.com',
            value: 'mailto:clientmanagerstraders@trayport.com',
          },
          pages: [],
          show_on: 'all',
          text: '<p>Supporting copy</p>',
        },
      }),
    )

    expect(mapped.data).toMatchObject({
      dismissible: false,
      image: { $legacyRef: 'media', legacyId: 4319 },
      layout: 'large',
      link: {
        label: 'Contact your Account Manager',
        type: 'custom',
        url: 'mailto:clientmanagerstraders@trayport.com',
      },
      targetMode: 'all',
      targetPages: [],
      tone: 'orange',
    })
    expect(mapped.data.body).toBeTruthy()
  })

  it('fails closed when a required schedule boundary or selected Page is missing', () => {
    expect(() =>
      mapBannerReusable(sourceBanner({ data: { ...sourceBanner().data, end_at: null } })),
    ).toThrow(/no valid end instant/i)
    expect(() =>
      mapBannerReusable(sourceBanner({ data: { ...sourceBanner().data, pages: [] } })),
    ).toThrow(/targets specific pages but has none/i)
  })
})
