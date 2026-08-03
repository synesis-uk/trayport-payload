import Link from 'next/link'

import { Logo } from '@/components/Logo/Logo'
import { ManagedLink } from '@/components/Trayport/ManagedLink'
import { TrayportMedia } from '@/components/Trayport/TrayportMedia'
import { getCachedGlobal } from '@/utilities/getGlobals'

import { CookieNotice } from './CookieNotice'

const SocialIcon = ({ platform }: { platform: string }) => {
  if (platform === 'linkedin') {
    return (
      <svg aria-hidden viewBox="0 0 448 512">
        <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3C448 46.5 433.6 32 416 32ZM135.4 416H69V202.2h66.5V416ZM102.2 173c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96s38.5 17.3 38.5 38.5c0 21.3-17.2 38.5-38.5 38.5ZM384.3 416h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416Z" />
      </svg>
    )
  }

  if (platform === 'x') {
    return (
      <svg aria-hidden viewBox="0 0 512 512">
        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8l164.9-188.5L26.8 48H172.4L272.9 180.9 389.2 48Zm-24.8 373.8h39.1L151.1 88h-42l255.3 333.8Z" />
      </svg>
    )
  }

  return null
}

const hasSocialIcon = (platform: string) => platform === 'linkedin' || platform === 'x'

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
  const footerIntro = footer.intro || settings.tagline
  const hasContact = Boolean(
    settings.contact?.address || settings.contact?.email || settings.contact?.phone,
  )

  return (
    <>
      <footer className="site-footer">
        <div className="trayport-container site-footer__main">
          <Link
            aria-label={`${settings.siteName || 'Trayport'} home`}
            className="site-footer__brand"
            href="/"
          >
            <Logo title={settings.siteName || 'TMX Trayport'} />
          </Link>

          <div aria-hidden className="site-footer__signature">
            <span />
            <span />
            <span />
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

        {Boolean(
          footerIntro ||
          hasContact ||
          settings.socialLinks?.length ||
          footer.certificationMarks?.length,
        ) ? (
          <div className="trayport-container site-footer__supporting">
            {footerIntro ? <p className="site-footer__disclaimer">{footerIntro}</p> : null}

            {settings.socialLinks?.length ? (
              <nav aria-label="Social media" className="site-footer__social-navigation">
                <ul className="site-footer__social">
                  {settings.socialLinks.map((item, index) => (
                    <li key={item.id || `${item.platform}-${index}`}>
                      <a
                        aria-label={`${item.label || item.platform} (opens in a new tab)`}
                        href={item.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <SocialIcon platform={item.platform} />
                        <span className={hasSocialIcon(item.platform) ? 'sr-only' : ''}>
                          {item.label || item.platform}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            {hasContact ? (
              <address className="site-footer__contact">
                {settings.contact?.address ? <span>{settings.contact.address}</span> : null}
                {settings.contact?.email ? (
                  <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>
                ) : null}
                {settings.contact?.phone ? (
                  <a href={`tel:${settings.contact.phone.replace(/\s/g, '')}`}>
                    {settings.contact.phone}
                  </a>
                ) : null}
              </address>
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
