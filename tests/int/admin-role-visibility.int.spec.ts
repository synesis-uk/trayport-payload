// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'

import { CustomerIdentities } from '@/collections/CustomerIdentities'
import { Users } from '@/collections/Users'
import { loadDashboardContent } from '@/components/AdminBranding/dashboardData'
import { RouteIndexes } from '@/globals/RouteIndexes'
import { SiteSettings } from '@/globals/SiteSettings'

const editor = { roles: ['editor'] }
const administrator = { roles: ['admin'] }

describe('admin role visibility', () => {
  it('keeps system configuration out of the editor navigation', () => {
    for (const entity of [Users, CustomerIdentities, SiteSettings, RouteIndexes]) {
      const hidden = entity.admin?.hidden
      expect(hidden).toBeTypeOf('function')
      expect((hidden as (args: { user: unknown }) => boolean)({ user: editor })).toBe(true)
      expect((hidden as (args: { user: unknown }) => boolean)({ user: administrator })).toBe(false)
    }
  })

  it('counts changed drafts from the latest-version view used by the editor', async () => {
    const draftTotals = {
      articles: 2,
      'learning-videos': 3,
      pages: 1,
    }
    const find = vi.fn(
      async (options: { collection: keyof typeof draftTotals; where?: unknown }) =>
        options.where
          ? { docs: [], totalDocs: draftTotals[options.collection] }
          : { docs: [], totalDocs: 0 },
    )

    const result = await loadDashboardContent({
      payload: {
        find,
        logger: { warn: vi.fn() },
      },
    } as never)

    expect(result.draftCounts).toEqual(draftTotals)
    const draftQueries = find.mock.calls
      .map(([options]) => options)
      .filter((options) => options.where)
    expect(draftQueries).toHaveLength(3)
    expect(draftQueries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collection: 'pages',
          draft: true,
          limit: 1,
          overrideAccess: false,
        }),
      ]),
    )
  })
})
