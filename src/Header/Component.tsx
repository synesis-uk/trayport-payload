import Link from 'next/link'

import { Logo } from '@/components/Logo/Logo'
import { getCachedGlobal } from '@/utilities/getGlobals'

import { DesktopNavigation } from './DesktopNavigation.client'
import {
  MobileNavigationPanel,
  MobileNavigationRoot,
  MobileNavigationTrigger,
} from './MobileNavigation.client'
import { normalizeHeader } from './navigation'
import { presentHeader } from './presentation'
import { SiteSearchDialog } from './SiteSearchDialog.client'

export async function Header() {
  const [navigation, settings] = await Promise.all([
    getCachedGlobal('navigation', 3),
    getCachedGlobal('site-settings', 2),
  ])
  const model = presentHeader(normalizeHeader(navigation, settings))

  return (
    <MobileNavigationRoot>
      <header className="site-header">
        {model.siteNotice ? (
          <div className="site-notice">
            <div className="site-notice__inner trayport-container">
              <p>{model.siteNotice.message}</p>
              {model.siteNotice.action ? (
                <Link
                  className="site-notice__link"
                  href={model.siteNotice.action.href}
                  rel={model.siteNotice.action.newTab ? 'noopener noreferrer' : undefined}
                  target={model.siteNotice.action.newTab ? '_blank' : undefined}
                >
                  {model.siteNotice.action.label}
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="site-header__bar">
          <div className="site-header__inner trayport-container">
            <Link aria-label={`${model.siteName} home`} className="site-header__brand" href="/">
              <Logo title={`TMX ${model.siteName}`} />
            </Link>

            <DesktopNavigation items={model.items} utilityItems={model.utilityItems} />

            <div className="site-header__actions">
              <SiteSearchDialog />
              <MobileNavigationTrigger />
            </div>
          </div>
        </div>
      </header>

      <MobileNavigationPanel
        items={model.items}
        siteName={model.siteName}
        utilityItems={model.utilityItems}
      />
    </MobileNavigationRoot>
  )
}
