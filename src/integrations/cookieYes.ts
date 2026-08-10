/**
 * CookieYes consent, and the seam that lets the site work with or without it.
 *
 * CookieYes blocks third-party scripts by rewriting `<script>` **tags in the served HTML** to
 * `type="text/plain" data-cookieyes="…"`. Anything created by JavaScript at runtime — our HubSpot
 * embed, for one — is invisible to that mechanism and would load regardless of the visitor's
 * choice. So consumers read consent from here rather than relying on CookieYes to stop them.
 *
 * When no site key is configured the local FE-018 banner remains in charge, so development, tests
 * and any environment without the key keep a working consent decision instead of silently granting
 * one.
 */

/**
 * CookieYes' own categories, verified against the served script rather than its documentation.
 * `necessary` is always granted and never gates anything here.
 */
export type CookieYesCategory =
  | 'necessary'
  | 'functional'
  | 'analytics'
  | 'performance'
  | 'advertisement'

/** Set by CookieYes once a decision exists. Also readable server-side if ever needed. */
export const COOKIE_YES_CONSENT_COOKIE = 'cookieyes-consent'

/**
 * HubSpot forms are gated on `functional`.
 *
 * The embed exists to let a visitor contact Trayport, which is the function they came for, and it
 * sets its own tracking cookies as a side effect rather than as its purpose. Moving it to
 * `advertisement` is a one-line change if Trayport's privacy owner disagrees.
 */
export const HUBSPOT_CONSENT_CATEGORY: CookieYesCategory = 'functional'

export const cookieYesSiteKey = (): string | null => {
  const key = process.env.NEXT_PUBLIC_COOKIEYES_SITE_KEY?.trim()
  return key ? key : null
}

export const cookieYesScriptSrc = (key: string): string =>
  `https://cdn-cookieyes.com/client_data/${key}/script.js`

/**
 * Reads a category from the `cookieyes-consent` cookie.
 *
 * The cookie is a flat `key:value,key:value` list — for example
 * `consentid:…,consent:yes,necessary:yes,functional:no,…`. Returns null when CookieYes has not yet
 * written a decision, which callers must treat as "not granted" rather than "granted".
 */
export const readCookieYesCategory = (
  cookieString: string,
  category: CookieYesCategory,
): boolean | null => {
  const entry = cookieString
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_YES_CONSENT_COOKIE}=`))

  if (!entry) return null

  const value = decodeURIComponent(entry.slice(COOKIE_YES_CONSENT_COOKIE.length + 1))
  const pair = value
    .split(',')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${category}:`))

  if (!pair) return null
  return pair.slice(category.length + 1) === 'yes'
}
