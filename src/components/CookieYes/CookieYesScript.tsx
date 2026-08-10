import Script from 'next/script'

import { cookieYesScriptSrc, cookieYesSiteKey } from '@/integrations/cookieYes'

/**
 * Loads the CookieYes banner.
 *
 * Deliberately **not** consent-gated: this script *is* the consent manager, so it has to run before
 * any decision exists. `beforeInteractive` is the strategy Next documents for exactly this case —
 * a consent banner that appears after the page is usable is one people have already scrolled past.
 *
 * Renders nothing when no site key is configured, which leaves the local FE-018 banner in charge
 * for development and tests rather than shipping a page with no consent mechanism at all.
 *
 * Note that CookieYes' own script-blocking does not reach anything this site does: it works by
 * rewriting `<script>` tags in the served HTML, and our only third-party embed is created at
 * runtime. Consent is therefore read explicitly by the consumers that need it — see
 * `integrations/cookieYes.ts`.
 */
export const CookieYesScript = () => {
  const key = cookieYesSiteKey()
  if (!key) return null

  // The lint rule below only recognises the pages router. The root layout is the App Router
  // equivalent of `_document`, which is where Next documents this strategy belonging.
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script id="cookieyes" src={cookieYesScriptSrc(key)} strategy="beforeInteractive" />
  )
}
