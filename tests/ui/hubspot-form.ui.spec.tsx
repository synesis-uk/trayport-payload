import { render, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { COOKIE_CONSENT_STORAGE_KEY } from '@/Footer/cookieConsent'
import {
  HubSpotFormRuntime,
  resetHubSpotScriptCache,
} from '@/components/HubSpotForm/HubSpotFormRuntime.client'

const FORM_ID = 'e849d31f-3a3e-4945-9521-4afaf021e0d2'
const PORTAL_ID = '7257359'

const acceptCookies = () =>
  window.localStorage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify({
      choice: 'accepted',
      decidedAt: Date.now(),
      expiresAt: Date.now() + 86_400_000,
      version: 1,
    }),
  )

const hubspotScripts = () =>
  [...document.querySelectorAll('script')].filter((script) => script.src.includes('hsforms.net'))

beforeEach(() => {
  resetHubSpotScriptCache()
  window.localStorage.clear()
  for (const script of hubspotScripts()) script.remove()
  delete (window as { hbspt?: unknown }).hbspt
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('HubSpot form runtime', () => {
  it('requests no third-party script until cookies are accepted', () => {
    const { container } = render(<HubSpotFormRuntime formId={FORM_ID} portalId={PORTAL_ID} />)

    // The reference embeds js.hsforms.net unconditionally. Not requesting it before a decision is
    // the point of this component, so this assertion is the one that must never be relaxed.
    expect(hubspotScripts()).toHaveLength(0)
    expect(within(container).getByRole('status').textContent).toMatch(
      /loads once you accept cookies/i,
    )
    expect(
      container.querySelector('[data-hubspot-form-status]')?.getAttribute('data-hubspot-form-status'),
    ).toBe('blocked')
  })

  it('creates the form against the migrated portal and form identifiers once consent exists', async () => {
    acceptCookies()
    const create = vi.fn()

    render(<HubSpotFormRuntime formId={FORM_ID} portalId={PORTAL_ID} />)

    const script = await waitFor(() => {
      const [found] = hubspotScripts()
      expect(found).toBeDefined()
      return found
    })

    // Stand in for the real embed so the test never reaches the network.
    ;(window as { hbspt?: unknown }).hbspt = { forms: { create } }
    script.dispatchEvent(new Event('load'))

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1))
    expect(create.mock.calls[0][0]).toMatchObject({
      formId: FORM_ID,
      portalId: PORTAL_ID,
      target: `#hubspot-form-target-${FORM_ID}`,
    })
  })

  it('reports a failed embed instead of leaving an empty gap', async () => {
    acceptCookies()

    const { container } = render(<HubSpotFormRuntime formId={FORM_ID} portalId={PORTAL_ID} />)

    const script = await waitFor(() => {
      const [found] = hubspotScripts()
      expect(found).toBeDefined()
      return found
    })
    script.dispatchEvent(new Event('error'))

    await waitFor(() =>
      expect(within(container).getByRole('status').textContent).toMatch(/could not be loaded/i),
    )
    expect(
      container.querySelector('[data-hubspot-form-status]')?.getAttribute('data-hubspot-form-status'),
    ).toBe('error')
  })
})
