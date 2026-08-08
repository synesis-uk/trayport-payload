// @vitest-environment node

import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  GATE_ID,
  verifyManagedLinkIntegrity,
  type LinkSite,
  type LinkSnapshot,
  type RedirectRecord,
} from '../../migration/gates/managedLinkIntegrity'
import { contentArchitectureContract } from '../../migration/mappings/contentArchitecture'
import { resolveCompleteMigrationRun } from '../helpers/migrationRun'

const runDirectory = resolveCompleteMigrationRun()

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const readTransformed = (): Record<string, unknown>[] => {
  const file = path.join(runDirectory, 'transformed.ndjson')
  if (!fs.existsSync(file)) {
    throw new Error(`transformed.ndjson is missing from ${runDirectory}.`)
  }
  return fs
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>)
}

/**
 * Collects every `url` in a record, not just the ones under `layout`.
 *
 * The check this replaces walked `data.layout` alone, which is why Home's JSON-LD organisation
 * logo — a WordPress theme asset that would 404 on this host — was invisible to it.
 */
const collectURLs = (value: unknown, into: string[]): void => {
  if (Array.isArray(value)) return value.forEach((child) => collectURLs(child, into))
  if (!isRecord(value)) return
  for (const [key, child] of Object.entries(value)) {
    if (key === 'url' && typeof child === 'string' && child) into.push(child)
    collectURLs(child, into)
  }
}

const collectReferences = (value: unknown, into: string[]): void => {
  if (Array.isArray(value)) return value.forEach((child) => collectReferences(child, into))
  if (!isRecord(value)) return

  if (value.type === 'reference' && isRecord(value.reference)) {
    const reference = value.reference
    const target = isRecord(reference.value) ? reference.value : {}
    if (typeof reference.relationTo === 'string' && typeof target.legacyId === 'number') {
      into.push(`${reference.relationTo}:${target.legacyId}`)
    }
  }

  Object.values(value).forEach((child) => collectReferences(child, into))
}

/** `relationTo` a redirect destination points into, as the transform records it. */
const redirectDestination = (
  data: Record<string, unknown>,
): { legacyId: number | null; relationTo: string | null } => {
  const to = isRecord(data.to) ? data.to : {}
  const reference = isRecord(to.reference) ? to.reference : {}
  const value = isRecord(reference.value) ? reference.value : {}
  return {
    legacyId: typeof value.legacyId === 'number' ? value.legacyId : null,
    relationTo: typeof reference.relationTo === 'string' ? reference.relationTo : null,
  }
}

const buildSnapshot = (): LinkSnapshot => {
  const records = readTransformed()

  const links: LinkSite[] = []
  const managedReferences: string[] = []
  const ownedPaths = new Set<string>()
  const redirects: RedirectRecord[] = []
  const routableTargets = new Set<string>()

  for (const record of records) {
    const data = isRecord(record.data) ? record.data : {}
    const legacy = isRecord(record.legacy) ? record.legacy : {}
    const target = String(record.target ?? '')
    const globalSlug = typeof record.globalSlug === 'string' ? record.globalSlug : ''
    const owner = target === 'global' ? `global:${globalSlug}` : `${target}:${legacy.legacyId ?? '?'}`

    if (target === 'redirects') {
      const { legacyId, relationTo } = redirectDestination(data)
      redirects.push({ from: String(data.from ?? ''), toLegacyId: legacyId, toRelationTo: relationTo })
      continue
    }

    if (typeof data.path === 'string' && data.path) ownedPaths.add(data.path)
    if (typeof legacy.legacyId === 'number') routableTargets.add(`${target}:${legacy.legacyId}`)

    const found: string[] = []
    collectURLs(data, found)
    const chrome = target === 'global' && ['navigation', 'footer'].includes(globalSlug)
    for (const url of found) links.push({ owner, url, chrome })

    collectReferences(data, managedReferences)
  }

  return {
    links,
    redirects,
    ownedPaths,
    systemPaths: new Set(['/venue/', '/market-coverage/']),
    routableTargets,
    managedReferences,
  }
}

const snapshot = buildSnapshot()

describe(GATE_ID, () => {
  it('holds across the transformed corpus', () => {
    const verification = verifyManagedLinkIntegrity(snapshot)

    expect(verification.failures, JSON.stringify(verification.details, null, 2)).toEqual([])
    expect(verification.status).toBe('passed')
  })

  it('leaves only the declared live fallbacks in navigation and footer', () => {
    const declared = [
      ...contentArchitectureContract.approvedProductionScope.approvedLiveFallbackPaths,
    ].sort()

    const observed = [
      ...new Set(
        snapshot.links
          .filter(({ chrome }) => chrome)
          .flatMap(({ url }) => {
            try {
              const parsed = new URL(url)
              return parsed.hostname.endsWith('trayport.com') ? [parsed.pathname] : []
            } catch {
              return []
            }
          }),
      ),
    ].sort()

    expect(observed).toEqual(declared)
  })

  describe('drift detection', () => {
    it('fails on a link to a path nothing serves', () => {
      const verification = verifyManagedLinkIntegrity({
        ...snapshot,
        links: [...snapshot.links, { owner: 'pages:1', url: '/not-a-route/', chrome: false }],
      })

      expect(verification.status).toBe('failed')
      expect(verification.failures).toContain(
        'internal-links-outside-namespace: expected 0, received 1',
      )
    })

    it('fails when a link is bridged to the live site for a path the corpus owns', () => {
      const owned = [...snapshot.ownedPaths].find((value) => value !== '/')
      expect(owned).toBeDefined()

      const verification = verifyManagedLinkIntegrity({
        ...snapshot,
        links: [
          ...snapshot.links,
          { owner: 'pages:1', url: `https://www.trayport.com${owned}`, chrome: false },
        ],
      })

      expect(verification.status).toBe('failed')
      expect(verification.failures).toContain('reclaimable-live-fallbacks: expected 0, received 1')
    })

    it('fails on a redirect whose source shadows a published content path', () => {
      const owned = [...snapshot.ownedPaths].find((value) => value !== '/')

      const verification = verifyManagedLinkIntegrity({
        ...snapshot,
        redirects: [
          ...snapshot.redirects,
          { from: owned!, toLegacyId: null, toRelationTo: 'pages' },
        ],
      })

      expect(verification.status).toBe('failed')
      expect(verification.failures).toContain(
        'redirect-shadows-content-path: expected 0, received 1',
      )
    })

    it('fails on a duplicated redirect source', () => {
      const first = snapshot.redirects[0]
      expect(first).toBeDefined()

      const verification = verifyManagedLinkIntegrity({
        ...snapshot,
        redirects: [...snapshot.redirects, { ...first }],
      })

      expect(verification.status).toBe('failed')
      expect(verification.failures).toContain('redirect-duplicate-from: expected 0, received 1')
    })

    it('fails on a redirect destination the proxy cannot resolve', () => {
      // `src/plugins/index.ts` accepts `people` as a redirect destination while `src/proxy.ts`
      // omits people from its join, so such a redirect would silently 404. Nothing hits this today.
      const verification = verifyManagedLinkIntegrity({
        ...snapshot,
        redirects: [
          ...snapshot.redirects,
          { from: '/a-person-redirect/', toLegacyId: 2561, toRelationTo: 'people' },
        ],
      })

      expect(verification.status).toBe('failed')
      expect(verification.failures).toContain(
        'redirect-destination-outside-proxy-join: expected 0, received 1',
      )
    })

    it('fails when a declared fallback has been retired but not removed', () => {
      const verification = verifyManagedLinkIntegrity({
        ...snapshot,
        links: snapshot.links.filter(
          ({ chrome, url }) => !(chrome && url.includes('/home/enterprise-security/')),
        ),
      })

      expect(verification.status).toBe('failed')
      expect(verification.failures).toContain('stale-declared-fallback: expected 0, received 1')
    })
  })
})
