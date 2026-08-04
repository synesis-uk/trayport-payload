'use client'

import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'

import {
  COOKIE_CONSENT_CHANGE_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  type CookieConsentChoice,
  persistCookieConsent,
  readCookieConsent,
} from './cookieConsent'

const subscribe = (callback: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === COOKIE_CONSENT_STORAGE_KEY) callback()
  }
  window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}

const consentSnapshot = () => readCookieConsent(window.localStorage)

const applyConsentState = (choice: CookieConsentChoice) => {
  document.documentElement.dataset.cookieConsent = choice
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, { detail: { choice } }))
}

export type CookieNoticeProps = {
  acceptLabel?: string
  message: string
  policyLabel?: string
  policyPath?: string | null
  rejectLabel?: string
  title?: string
}

export const CookieNotice = ({
  acceptLabel = 'Accept All',
  message,
  policyLabel = 'Cookie Policy',
  policyPath,
  rejectLabel = 'Reject All',
  title = 'Trayport Cookie Consent',
}: CookieNoticeProps) => {
  const choice = useSyncExternalStore(subscribe, consentSnapshot, () => null)

  useEffect(() => {
    if (choice) document.documentElement.dataset.cookieConsent = choice
    else delete document.documentElement.dataset.cookieConsent
  }, [choice])

  if (choice) return null

  const decide = (nextChoice: CookieConsentChoice) => {
    persistCookieConsent(window.localStorage, nextChoice)
    applyConsentState(nextChoice)
  }

  return (
    <aside aria-label={title} className="cookie-notice">
      <div className="cookie-notice__content">
        <h2>{title}</h2>
        <p>
          {message}
          {policyPath ? (
            <>
              {' '}
              <Link href={policyPath}>{policyLabel}</Link>.
            </>
          ) : null}
        </p>
      </div>
      <div className="cookie-notice__actions">
        <button className="cookie-notice__reject" onClick={() => decide('rejected')} type="button">
          {rejectLabel}
        </button>
        <button className="cookie-notice__accept" onClick={() => decide('accepted')} type="button">
          {acceptLabel}
        </button>
      </div>
    </aside>
  )
}
