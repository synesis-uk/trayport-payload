'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'trayport-cookie-notice-dismissed'
const CHANGE_EVENT = 'trayport-cookie-notice-change'

const subscribe = (callback: () => void) => {
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

const dismissedSnapshot = () => window.localStorage.getItem(STORAGE_KEY) === 'true'

export const CookieNotice = ({
  message,
  policyPath,
}: {
  message: string
  policyPath?: string | null
}) => {
  const dismissed = useSyncExternalStore(subscribe, dismissedSnapshot, () => true)

  if (dismissed) return null

  return (
    <aside aria-label="Cookie notice" className="cookie-notice">
      <p>
        {message}{' '}
        {policyPath ? (
          <Link href={policyPath}>
            Read our cookie policy<span className="sr-only"> for more information</span>
          </Link>
        ) : null}
      </p>
      <button
        onClick={() => {
          window.localStorage.setItem(STORAGE_KEY, 'true')
          window.dispatchEvent(new Event(CHANGE_EVENT))
        }}
        type="button"
      >
        Close
      </button>
    </aside>
  )
}
