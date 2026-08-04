import {
  footerAccentOptions,
  footerIconOptions,
  type FooterAccent,
  type FooterIconName,
} from '@/config/footer'
import type { ContentLink } from '@/routing/contentLink'
import { resolveContentLink } from '@/routing/contentLink'
import { safeExternalHTTPSURL } from '@/routing/urlPolicy'
import type { Footer, SiteSetting } from '@/payload-types'
import { TrayportMedia } from '@/components/Trayport/TrayportMedia'

import type { FooterLinkModel, FooterModel } from './types'

const footerIconNames = new Set<string>(footerIconOptions.map(({ value }) => value))
const footerAccentNames = new Set<string>(footerAccentOptions.map(({ value }) => value))

const normalizedLink = (
  link: ContentLink | null | undefined,
  labelOverride?: string | null,
): FooterLinkModel | null => {
  const resolved = resolveContentLink(link)
  const label = labelOverride || resolved.label
  if (resolved.href === '#' || !label) return null

  return {
    href: resolved.href,
    label,
    newTab: resolved.newTab,
  }
}

const footerIconName = (value: unknown): FooterIconName | undefined =>
  typeof value === 'string' && footerIconNames.has(value) ? (value as FooterIconName) : undefined

const footerAccent = (value: unknown): FooterAccent | undefined =>
  typeof value === 'string' && footerAccentNames.has(value) ? (value as FooterAccent) : undefined

const socialIcon = (platform: string) => {
  if (platform === 'linkedin') return 'linkedin' as const
  if (platform === 'x') return 'x' as const
  return undefined
}

export const footerModelFromGlobals = (
  footer: Footer,
  settings: SiteSetting,
  year = new Date().getFullYear(),
): FooterModel => ({
  certifications: (footer.certificationMarks || []).map((mark) => ({
    media: <TrayportMedia composition="logo" media={mark.image} />,
    name: mark.name,
    url: safeExternalHTTPSURL(mark.url) || undefined,
  })),
  columns: (footer.columns || []).map((column) => ({
    links: (column.links || []).flatMap((item) => {
      const link = normalizedLink(item.link)
      return link
        ? [
            {
              ...link,
              accent: footerAccent(item.accent),
              icon: footerIconName(item.icon),
            },
          ]
        : []
    }),
    title: column.title || undefined,
    titleLink: normalizedLink(column.titleLink, column.title) || undefined,
  })),
  contact: {
    address: settings.contact?.address || undefined,
    email: settings.contact?.email || undefined,
    phone: settings.contact?.phone || undefined,
  },
  copyright:
    footer.copyright?.replaceAll('{year}', String(year)) || `Copyright © ${year} Trayport Limited`,
  disclaimer: footer.intro || settings.tagline || undefined,
  legalLinks: (footer.legalLinks || []).flatMap((item) => {
    const link = normalizedLink(item.link)
    return link ? [link] : []
  }),
  legalText: {
    companyRegistration: footer.companyRegistrationText || undefined,
    parentCompany: footer.parentCompanyText || undefined,
  },
  siteName: settings.siteName || 'Trayport',
  socialLinks: (settings.socialLinks || []).flatMap((item) => {
    const href = safeExternalHTTPSURL(item.url)
    return href
      ? [
          {
            href,
            icon: socialIcon(item.platform),
            label: item.label || item.platform,
            newTab: true,
          },
        ]
      : []
  }),
})
