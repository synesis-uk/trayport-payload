'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import {
  COOKIE_CONSENT_CHANGE_EVENT,
  readCookieConsent,
} from '@/Footer/cookieConsent'
import {
  HUBSPOT_CONSENT_CATEGORY,
  cookieYesSiteKey,
  readCookieYesCategory,
} from '@/integrations/cookieYes'

/**
 * The HubSpot embed, loaded only after consent.
 *
 * The reference embeds this inline and unconditionally — a `<script>` from js.hsforms.net followed
 * by `hbspt.forms.create({ portalId, formId })` — so the third-party script runs before any consent
 * decision. Here the script is not requested at all until consent is granted, and a refusal is
 * shown as an explicit state rather than an empty gap, so a visitor who declined can see why the
 * form is absent and how to change it.
 *
 * The portal and form identifiers are the live ones carried through the migration; nothing about
 * the submission target differs from the reference.
 */

const HUBSPOT_SCRIPT_SRC = 'https://js.hsforms.net/forms/embed/v2.js'

type HubSpotGlobal = {
  forms?: {
    create: (options: {
      formId: string
      portalId: string
      target: string
      onFormReady?: () => void
    }) => void
  }
}

declare global {
  interface Window {
    hbspt?: HubSpotGlobal
  }
}

/** Shared across every form on the page so the script is requested once. */
let scriptPromise: Promise<void> | null = null

/**
 * Clears the shared script cache.
 *
 * Module-level state survives between tests in the same file, so without this a spec that loads the
 * script makes every later spec see it as already loaded. Production code never calls it.
 */
export const resetHubSpotScriptCache = () => {
  scriptPromise = null
}

const loadHubSpotScript = (): Promise<void> => {
  if (scriptPromise) return scriptPromise
  if (window.hbspt?.forms) {
    scriptPromise = Promise.resolve()
    return scriptPromise
  }

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${HUBSPOT_SCRIPT_SRC}"]`,
    )
    const script = existing ?? document.createElement('script')

    const settle = () => (window.hbspt?.forms ? resolve() : reject(new Error('hbspt unavailable')))
    script.addEventListener('load', settle, { once: true })
    script.addEventListener('error', () => reject(new Error('HubSpot script failed')), {
      once: true,
    })

    if (!existing) {
      script.async = true
      script.src = HUBSPOT_SCRIPT_SRC
      document.head.append(script)
    }
  }).catch((error) => {
    // Allow a later attempt rather than caching the failure forever.
    scriptPromise = null
    throw error
  })

  return scriptPromise
}

const subscribeToConsent = (callback: () => void) => {
  window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)
  // CookieYes writes a cookie rather than firing an event we can rely on, so poll while it is the
  // authority. One second is imperceptible against a banner interaction and costs nothing.
  const poll = cookieYesSiteKey() ? window.setInterval(callback, 1_000) : null

  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, callback)
    window.removeEventListener('storage', callback)
    if (poll !== null) window.clearInterval(poll)
  }
}

/**
 * Whether the visitor has allowed the HubSpot embed.
 *
 * CookieYes is the authority wherever it is configured — its blocking cannot reach a script created
 * at runtime, so the decision has to be read rather than relied upon. Everywhere else the FE-018
 * local banner stands in, which keeps development and tests honest instead of defaulting to
 * "granted".
 */
const readConsentGranted = (): boolean => {
  if (cookieYesSiteKey()) {
    return readCookieYesCategory(document.cookie, HUBSPOT_CONSENT_CATEGORY) === true
  }
  return readCookieConsent(window.localStorage) === 'accepted'
}

const useConsentGranted = (): boolean =>
  useSyncExternalStore(
    subscribeToConsent,
    readConsentGranted,
    () => false,
  )

/**
 * Only the *outcome* of the async work is state. Whether the form is blocked or still loading is
 * derived from consent plus that outcome, which keeps the effect free of synchronous state updates
 * and means the two can never disagree.
 */
type Outcome = 'ready' | 'error'

export const HubSpotFormRuntime = ({
  formId,
  portalId,
}: {
  formId: string
  portalId: string
}) => {
  const consentGranted = useConsentGranted()
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const createdRef = useRef(false)

  useEffect(() => {
    if (!consentGranted) return
    if (createdRef.current || !targetRef.current) return

    createdRef.current = true
    const target = `#${targetRef.current.id}`
    let cancelled = false

    loadHubSpotScript()
      .then(() => {
        if (cancelled) return
        if (!window.hbspt?.forms) throw new Error('hbspt.forms unavailable')

        window.hbspt.forms.create({
          formId,
          portalId,
          target,
          onFormReady: () => setOutcome('ready'),
        })
        // `onFormReady` is not emitted by every HubSpot version, so treat creation as success too;
        // a working form must never be left announcing that it is still loading.
        setOutcome((current) => current ?? 'ready')
      })
      .catch(() => {
        createdRef.current = false
        if (!cancelled) setOutcome('error')
      })

    return () => {
      cancelled = true
    }
  }, [consentGranted, formId, portalId])

  const status = !consentGranted ? 'blocked' : (outcome ?? 'loading')
  const targetID = `hubspot-form-target-${formId}`

  const message = {
    blocked: 'This form is provided by HubSpot and loads once you accept cookies.',
    loading: 'Loading the form…',
    error: 'The form could not be loaded. Please refresh the page or email us directly.',
    ready: '',
  }[status]

  return (
    <>
      <div
        className="trayport-hubspot-form__mount"
        data-hubspot-form-mount=""
        data-hubspot-form-status={status}
        id={targetID}
        ref={targetRef}
      />
      {message ? (
        <p aria-live="polite" className="trayport-hubspot-form__status" role="status">
          {message}
        </p>
      ) : null}
    </>
  )
}
