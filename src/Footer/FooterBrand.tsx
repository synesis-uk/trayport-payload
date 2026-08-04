import { Logo } from '@/components/Logo/Logo'

import { FooterLink } from './FooterLink'

export function FooterBrand({ siteName }: { siteName: string }) {
  return (
    <>
      <FooterLink className="site-footer__brand" link={{ href: '/', label: `${siteName} home` }}>
        <Logo title={siteName === 'Trayport' ? 'TMX Trayport' : siteName} />
      </FooterLink>

      <div aria-hidden className="site-footer__signature">
        <span />
        <span />
        <span />
      </div>
    </>
  )
}
