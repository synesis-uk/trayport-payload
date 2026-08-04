import { pilotScope } from '../scopes/pilot'
import {
  externalHTTPSDestinationPolicy,
  managedLinkDestinationPolicy,
  safeDestination,
} from '../../src/routing/urlPolicy'

const sourceHosts = new Set([
  'prod.trayport.com',
  'trayport.com',
  'trayport.local',
  'www.trayport.com',
])

export const migrationOwnedPaths = new Set([
  ...pilotScope.roots.map(({ path }) => path),
  '/market-coverage/',
  '/venue/',
])

export const normalizeMigrationPath = (value: string): string => {
  const url = new URL(value, 'http://trayport.local')
  const collapsed = `/${url.pathname.replace(/^\/+/, '')}`.replace(/\/{2,}/g, '/')
  const pathname = collapsed === '/' ? collapsed : `${collapsed.replace(/\/+$/, '')}/`
  return `${pathname}${url.search}${url.hash}`
}

/**
 * WordPress venue websites are trusted legacy content, but Payload intentionally
 * accepts only credential-free HTTPS destinations. Upgrade legacy HTTP links at
 * this one-way migration boundary, then defer to the shared destination policy.
 */
export const legacyExternalHTTPSDestination = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value.trim()) return null

  try {
    const url = new URL(value.trim())
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null

    url.protocol = 'https:'
    return safeDestination(url.href, externalHTTPSDestinationPolicy)
  } catch {
    return null
  }
}

/**
 * During incremental migration, keep links internal only when this build owns
 * the destination. Every other same-site link remains a reversible HTTPS bridge
 * to the live WordPress site until that route joins the imported root set.
 */
export const migrationDestination = (value: string): string | null => {
  if (/^(?:#|mailto:|tel:)/i.test(value)) {
    return safeDestination(value, managedLinkDestinationPolicy)
  }

  try {
    const url = new URL(value, 'http://trayport.local')
    if (url.username || url.password) {
      return null
    }
    if (!sourceHosts.has(url.hostname.toLowerCase())) {
      return safeDestination(value, managedLinkDestinationPolicy)
    }

    const normalized = normalizeMigrationPath(url.toString())
    const normalizedURL = new URL(normalized, 'http://trayport.local')
    const canRemainInternal =
      migrationOwnedPaths.has(normalizedURL.pathname) &&
      !normalizedURL.search &&
      !normalizedURL.hash
    const destination = canRemainInternal
      ? normalized
      : new URL(normalized, 'https://www.trayport.com').toString()

    return safeDestination(destination, managedLinkDestinationPolicy)
  } catch {
    return null
  }
}
