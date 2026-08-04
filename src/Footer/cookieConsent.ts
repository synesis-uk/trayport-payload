export const COOKIE_CONSENT_STORAGE_KEY = 'trayport-cookie-consent'
export const COOKIE_CONSENT_CHANGE_EVENT = 'trayport-cookie-consent-change'
export const COOKIE_CONSENT_VERSION = 1
export const COOKIE_CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000

export type CookieConsentChoice = 'accepted' | 'rejected'

type CookieConsentRecord = {
  choice: CookieConsentChoice
  decidedAt: number
  expiresAt: number
  version: typeof COOKIE_CONSENT_VERSION
}

type ConsentStorage = Pick<Storage, 'getItem' | 'setItem'>

const isChoice = (value: unknown): value is CookieConsentChoice =>
  value === 'accepted' || value === 'rejected'

export const readCookieConsent = (
  storage: Pick<ConsentStorage, 'getItem'>,
  now = Date.now(),
): CookieConsentChoice | null => {
  try {
    const serialized = storage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (!serialized) return null

    const parsed = JSON.parse(serialized) as Partial<CookieConsentRecord>
    if (
      parsed.version !== COOKIE_CONSENT_VERSION ||
      !isChoice(parsed.choice) ||
      typeof parsed.expiresAt !== 'number' ||
      parsed.expiresAt <= now
    ) {
      return null
    }

    return parsed.choice
  } catch {
    return null
  }
}

export const persistCookieConsent = (
  storage: Pick<ConsentStorage, 'setItem'>,
  choice: CookieConsentChoice,
  now = Date.now(),
) => {
  const record: CookieConsentRecord = {
    choice,
    decidedAt: now,
    expiresAt: now + COOKIE_CONSENT_MAX_AGE_MS,
    version: COOKIE_CONSENT_VERSION,
  }
  storage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record))
  return record
}
