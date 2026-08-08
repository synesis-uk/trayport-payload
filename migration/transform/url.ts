import type { SourceRecord } from '../contracts/v1'
import { pilotScope } from '../scopes/pilot'
import { productionRedirects } from '../scopes/productionRedirects'
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

const baselineMigrationOwnedPaths = [
  ...pilotScope.roots.map(({ path }) => path),
  ...pilotScope.acceptedRouteDependencies.map(({ path }) => path),
  /**
   * A path the corpus redirects is a path the corpus owns.
   *
   * Without these, `migrationDestination` sent every link to `/company/`, `/markets/`, `/regions/`,
   * `/traders/joule/`, `/products/solutions-providers/` and `/legal-notice/` out to
   * www.trayport.com — pushing visitors onto the live WordPress site for destinations this build
   * already serves through its own 301s. Linking to a redirect source is established practice here;
   * roughly sixty action links already point at `/request-a-demo/`.
   */
  ...productionRedirects.map(({ from }) => from),
  '/market-coverage/',
  '/venue/',
]

export const migrationOwnedPaths = new Set(baselineMigrationOwnedPaths)

export const ownedPathsFromSource = (records: readonly SourceRecord[]): string[] => {
  const owned = new Set<string>()

  for (const record of records) {
    if (
      record.entity === 'reusable' &&
      record.postType === 'people' &&
      record.status === 'publish' &&
      record.path
    ) {
      owned.add(normalizeMigrationPath(record.path))
      continue
    }

    if (record.entity !== 'post' || record.status !== 'publish') continue

    if (record.postType === 'post' && (record.taxonomies.category || []).includes(119)) {
      const slug = record.legacyId === 10974 ? 'commodity-trading-week-2026' : record.slug
      owned.add(normalizeMigrationPath(`/event/${slug}/`))
      continue
    }

    if (record.postType === 'events') {
      if (record.path) owned.add(normalizeMigrationPath(record.path))
      owned.add(normalizeMigrationPath(`/event/${record.slug}/`))
    }
  }

  return [...owned].sort()
}

export const setMigrationOwnedCorpusPaths = (paths: Iterable<string>): void => {
  migrationOwnedPaths.clear()
  baselineMigrationOwnedPaths.forEach((path) => migrationOwnedPaths.add(path))
  for (const path of paths) migrationOwnedPaths.add(path)
}

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
 * to the live WordPress site until that route joins the imported accepted set.
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
