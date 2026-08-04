import { getCachedGlobal } from '@/utilities/getGlobals'

import { footerModelFromGlobals } from './adapter'
import { CookieNotice } from './CookieNotice'
import { FooterPresentation } from './FooterPresentation'

export async function Footer() {
  const [footer, settings] = await Promise.all([
    getCachedGlobal('footer', 3),
    getCachedGlobal('site-settings', 2),
  ])
  const policyPath =
    settings.cookieNotice?.policyPage && typeof settings.cookieNotice.policyPage === 'object'
      ? settings.cookieNotice.policyPage.path
      : settings.cookieNotice?.policyURL

  return (
    <>
      <FooterPresentation model={footerModelFromGlobals(footer, settings)} />
      {settings.cookieNotice?.enabled && settings.cookieNotice.message ? (
        <CookieNotice
          acceptLabel={settings.cookieNotice.acceptLabel || undefined}
          message={settings.cookieNotice.message}
          policyLabel={settings.cookieNotice.policyLinkLabel || undefined}
          policyPath={policyPath}
          rejectLabel={settings.cookieNotice.rejectLabel || undefined}
          title={settings.cookieNotice.title || undefined}
        />
      ) : null}
    </>
  )
}
