import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { draftMode } from 'next/headers'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import './globals.css'

const inter = localFont({
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
  src: './InterVariable.woff2',
  variable: '--font-inter',
  weight: '100 900',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html className={inter.variable} lang="en">
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <AdminBar
          adminBarProps={{
            preview: isEnabled,
          }}
        />
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  description:
    'Trayport connects people and markets through energy trading solutions and a global commodities network.',
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
