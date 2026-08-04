import type { ReactNode } from 'react'

import type { AppIconName } from '@/components/icons'
import type { FooterAccent, FooterIconName } from '@/config/footer'

export type FooterLinkModel = {
  href: string
  label: string
  newTab?: boolean
}

export type FooterNavigationItemModel = FooterLinkModel & {
  accent?: FooterAccent
  icon?: FooterIconName
}

export type FooterColumnModel = {
  links: FooterNavigationItemModel[]
  title?: string
  titleLink?: FooterLinkModel
}

export type FooterSocialLinkModel = FooterLinkModel & {
  icon?: AppIconName
}

export type FooterCertificationModel = {
  media: ReactNode
  name: string
  url?: string
}

export type FooterModel = {
  certifications: FooterCertificationModel[]
  columns: FooterColumnModel[]
  contact?: {
    address?: string
    email?: string
    phone?: string
  }
  copyright: string
  disclaimer?: string
  legalLinks: FooterLinkModel[]
  legalText: {
    companyRegistration?: string
    parentCompany?: string
  }
  siteName: string
  socialLinks: FooterSocialLinkModel[]
}
