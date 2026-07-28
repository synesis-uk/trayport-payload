import Link from 'next/link'

import { Logo } from '@/components/Logo/Logo'
import { ManagedLink } from '@/components/Trayport/ManagedLink'
import { TrayportMedia } from '@/components/Trayport/TrayportMedia'
import { getCachedGlobal } from '@/utilities/getGlobals'

import { CookieNotice } from './CookieNotice'

export async function Footer() {
  const [footer, settings] = await Promise.all([
    getCachedGlobal('footer', 3)(),
    getCachedGlobal('site-settings', 2)(),
  ])
  const year = String(new Date().getFullYear())
  const copyright = footer.copyright?.replaceAll('{year}', year) || `© ${year} Trayport Limited`
  const policyPage =
    settings.cookieNotice?.policyPage && typeof settings.cookieNotice.policyPage === 'object'
      ? settings.cookieNotice.policyPage.path
      : undefined

  return (
    <>
      <footer className="site-footer">
        <div aria-hidden className="site-footer__signature">
          <span />
          <span />
          <span />
        </div>

        <div className="trayport-container site-footer__main">
          <div className="site-footer__brand-column">
            <Link
              aria-label={`${settings.siteName || 'Trayport'} home`}
              className="site-footer__brand"
              href="/"
            >
              <Logo title={settings.siteName || 'TMX Trayport'} />
            </Link>
            {footer.intro || settings.tagline ? <p>{footer.intro || settings.tagline}</p> : null}
            {settings.contact ? (
              <address>
                {settings.contact.address ? <span>{settings.contact.address}</span> : null}
                {settings.contact.email ? (
                  <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>
                ) : null}
                {settings.contact.phone ? (
                  <a href={`tel:${settings.contact.phone.replace(/\s/g, '')}`}>
                    {settings.contact.phone}
                  </a>
                ) : null}
              </address>
            ) : null}
          </div>

          <nav aria-label="Footer navigation" className="site-footer__navigation">
            {(footer.columns || []).map((column, index) => (
              <section key={column.id || `${column.title}-${index}`}>
                <h2>{column.title}</h2>
                <ul>
                  {(column.links || []).map((item, itemIndex) => (
                    <li key={item.id || itemIndex}>
                      <ManagedLink link={item.link} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>

        {Boolean(settings.socialLinks?.length || footer.certificationMarks?.length) ? (
          <div className="trayport-container site-footer__supporting">
            {settings.socialLinks?.length ? (
              <nav aria-label="Social media">
                <ul className="site-footer__social">
                  {settings.socialLinks.map((item, index) => (
                    <li key={item.id || `${item.platform}-${index}`}>
                      <a href={item.url} rel="noopener noreferrer" target="_blank">
                        {item.label || item.platform}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            {footer.certificationMarks?.length ? (
              <ul aria-label="Certifications" className="site-footer__certifications">
                {footer.certificationMarks.map((mark, index) => (
                  <li key={mark.id || `${mark.name}-${index}`}>
                    {mark.url ? (
                      <a aria-label={mark.name} href={mark.url}>
                        <TrayportMedia media={mark.image} />
                      </a>
                    ) : (
                      <TrayportMedia media={mark.image} />
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="site-footer__legal">
          <div className="trayport-container site-footer__legal-inner">
            <p>{copyright}</p>
            {footer.legalLinks?.length ? (
              <nav aria-label="Legal">
                <ul>
                  {footer.legalLinks.map((item, index) => (
                    <li key={item.id || index}>
                      <ManagedLink link={item.link} />
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>
        </div>
      </footer>

      {settings.cookieNotice?.enabled && settings.cookieNotice.message ? (
        <CookieNotice message={settings.cookieNotice.message} policyPath={policyPage} />
      ) : null}
    </>
  )
}
