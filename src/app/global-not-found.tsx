import type { Metadata } from 'next'
import Link from 'next/link'

import { Logo } from '@/components/Logo/Logo'
import { NotFoundView } from '@/components/site/NotFoundView'
import { FooterBrand } from '@/Footer/FooterBrand'

import './(frontend)/globals.css'
import './(frontend)/parity-shell.css'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: 'Page not found | Trayport',
}

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <header className="site-header">
          <div className="site-header__bar">
            <div className="site-header__inner trayport-container">
              <Link aria-label="Trayport home" className="site-header__brand" href="/">
                <Logo title="TMX Trayport" />
              </Link>
            </div>
          </div>
        </header>
        <NotFoundView />
        <footer className="site-footer">
          <div className="site-footer__main trayport-container">
            <FooterBrand siteName="Trayport" />
          </div>
        </footer>
      </body>
    </html>
  )
}
