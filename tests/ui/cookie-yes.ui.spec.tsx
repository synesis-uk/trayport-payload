import { describe, expect, it } from 'vitest'

import {
  COOKIE_YES_CONSENT_COOKIE,
  HUBSPOT_CONSENT_CATEGORY,
  cookieYesScriptSrc,
  readCookieYesCategory,
} from '@/integrations/cookieYes'

const consentCookie = (value: string) => `${COOKIE_YES_CONSENT_COOKIE}=${encodeURIComponent(value)}`

describe('CookieYes consent', () => {
  it('builds the vendor script URL from a site key', () => {
    expect(cookieYesScriptSrc('abc123')).toBe('https://cdn-cookieyes.com/client_data/abc123/script.js')
  })

  it('reads a granted category', () => {
    const cookie = consentCookie('consentid:xyz,consent:yes,necessary:yes,functional:yes,analytics:no')

    expect(readCookieYesCategory(cookie, 'functional')).toBe(true)
    expect(readCookieYesCategory(cookie, 'analytics')).toBe(false)
  })

  /*
   * The distinction that matters: no decision is not the same as a granted one. CookieYes cannot
   * block a script created at runtime, so if this returned anything truthy before the visitor chose,
   * the HubSpot embed would load against their wishes.
   */
  it('reports no decision as null rather than granted', () => {
    expect(readCookieYesCategory('', 'functional')).toBeNull()
    expect(readCookieYesCategory('other=1; unrelated=2', 'functional')).toBeNull()
    expect(readCookieYesCategory(consentCookie('consent:yes,necessary:yes'), 'functional')).toBeNull()
  })

  it('ignores a category whose name merely prefixes another', () => {
    const cookie = consentCookie('necessary:yes,functionalextra:yes')

    expect(readCookieYesCategory(cookie, 'functional')).toBeNull()
  })

  it('gates HubSpot on a category the banner actually offers', () => {
    expect(['necessary', 'functional', 'analytics', 'performance', 'advertisement']).toContain(
      HUBSPOT_CONSENT_CATEGORY,
    )
    // `necessary` is always granted, so gating on it would be no gate at all.
    expect(HUBSPOT_CONSENT_CATEGORY).not.toBe('necessary')
  })
})
