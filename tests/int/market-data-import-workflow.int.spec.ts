// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { MarketDataImports } from '@/collections/MarketDataImports'
import { marketDataImportServiceContract } from '@/data/market-data/imports/service.server'

const accessResult = async (operation: 'create' | 'delete' | 'read' | 'update', user: unknown) => {
  const access = MarketDataImports.access?.[operation]
  if (typeof access !== 'function') return access
  return access({ req: { user } } as never)
}

describe('market-data import workflow', () => {
  it('keeps upload records private, administrator-only, and immutable after creation', async () => {
    const admin = { id: 1, roles: ['admin'] }
    const editor = { id: 2, roles: ['editor'] }

    await expect(accessResult('create', admin)).resolves.toBe(true)
    await expect(accessResult('read', admin)).resolves.toBe(true)
    await expect(accessResult('create', editor)).resolves.toBe(false)
    await expect(accessResult('read', editor)).resolves.toBe(false)
    await expect(accessResult('update', admin)).resolves.toBe(false)
    await expect(accessResult('delete', admin)).resolves.toBe(false)
    const upload =
      MarketDataImports.upload && typeof MarketDataImports.upload === 'object'
        ? MarketDataImports.upload
        : null
    expect(upload).toEqual(
      expect.objectContaining({
        bulkUpload: false,
        hideRemoveFile: true,
        pasteURL: false,
      }),
    )
    expect(String(upload?.staticDir)).not.toContain('/public/')
  })

  it('provides validate, preview, and explicit commit endpoints with their own auth checks', async () => {
    const endpoints = Array.isArray(MarketDataImports.endpoints) ? MarketDataImports.endpoints : []
    expect(endpoints.map(({ method, path }) => `${method.toUpperCase()} ${path}`)).toEqual([
      'POST /:id/validate',
      'GET /:id/preview',
      'POST /:id/commit',
    ])

    const validate = endpoints.find(({ path }) => path === '/:id/validate')
    expect(validate).toBeDefined()
    const unauthenticated = await validate!.handler({
      headers: new Headers(),
      payload: {},
      routeParams: { id: '1' },
      user: null,
    } as never)
    expect(unauthenticated.status).toBe(401)
    await expect(unauthenticated.json()).resolves.toEqual({
      error: { code: 'authentication_required', message: 'Authentication is required.' },
    })

    const editor = await validate!.handler({
      headers: new Headers(),
      payload: {},
      routeParams: { id: '1' },
      user: { id: 2, roles: ['editor'] },
    } as never)
    expect(editor.status).toBe(403)
  })

  it('declares transactional, idempotent, metric-preserving commit semantics', () => {
    expect(marketDataImportServiceContract).toEqual({
      cacheInvalidation: 'after-transaction-commit',
      commit: 'explicit-admin-endpoint',
      concurrency: 'transaction-scoped-advisory-lock',
      facts: 'app.market_volume_monthly',
      idempotency: 'metric-diff-upsert',
      metricMerge: {
        price: 'preserve-volume',
        volume: 'preserve-price-and-omitted-volume-cells',
      },
      staging: 'app.market_data_import_staging',
      validation: 'file-hash-parser-version-staging-fingerprint',
    })
  })
})
