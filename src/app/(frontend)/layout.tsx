import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'

import { DynamicAdminBar } from '@/components/AdminBar/DynamicAdminBar.client'
import '@/components/icons/config'
import { Logo } from '@/components/Logo/Logo'
import { Footer } from '@/Footer/Component'
import { FooterBrand } from '@/Footer/FooterBrand'
import { Header } from '@/Header/Component'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import './globals.css'
import './banners.css'
import './parity-shell.css'
import './parity-structured.css'
import './parity-blocks.css'
import './parity-joule.css'
import './parity-insights.css'
import './parity-home.css'

const DraftAdminBar = async () => {
  const { isEnabled } = await draftMode()

  return isEnabled ? <DynamicAdminBar preview /> : null
}

const HeaderFallback = () => (
  <header aria-busy="true" aria-label="Loading primary navigation" className="site-header">
    <div className="site-header__bar">
      <div className="site-header__inner trayport-container">
        <Link aria-label="Trayport home" className="site-header__brand" href="/">
          <Logo title="TMX Trayport" />
        </Link>
      </div>
    </div>
  </header>
)

const FooterFallback = () => (
  <footer aria-busy="true" aria-label="Loading footer" className="site-footer">
    <div className="site-footer__main trayport-container">
      <FooterBrand siteName="Trayport" />
    </div>
  </footer>
)

const RequestTimeHeader = async () => {
  await connection()
  return <Header />
}

const RequestTimeFooter = async () => {
  await connection()
  return <Footer />
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <Suspense fallback={null}>
          <DraftAdminBar />
        </Suspense>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <Suspense fallback={<HeaderFallback />}>
          <RequestTimeHeader />
        </Suspense>
        {children}
        <Suspense fallback={<FooterFallback />}>
          <RequestTimeFooter />
        </Suspense>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  description:
    'Trayport connects people and markets through energy trading solutions and a global commodities network.',
  icons: {
    icon: [
      { sizes: '32x32', url: '/favicon.ico' },
      { type: 'image/svg+xml', url: '/favicon.svg' },
    ],
  },
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph({
    title: 'Trayport',
  }),
  title: {
    default: 'Trayport',
    template: '%s',
  },
  twitter: {
    card: 'summary_large_image',
  },
}
