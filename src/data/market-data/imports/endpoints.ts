import type { Endpoint, PayloadHandler, PayloadRequest } from 'payload'

import { isAdmin } from '@/access/roles'

import {
  commitMarketDataImport,
  getMarketDataImportPreview,
  MarketDataImportError,
  validateMarketDataImport,
} from './service.server'

const jsonError = (message: string, status: number, code: string): Response =>
  Response.json({ error: { code, message } }, { status })

const authorized = (req: PayloadRequest): Response | null => {
  if (!req.user) return jsonError('Authentication is required.', 401, 'authentication_required')
  if (!isAdmin(req.user)) return jsonError('Administrator access is required.', 403, 'forbidden')
  return null
}

const routeImportID = (req: PayloadRequest): number | string | null => {
  const value = req.routeParams?.id
  return typeof value === 'number' || typeof value === 'string' ? value : null
}

const endpoint = (
  action: (req: PayloadRequest, id: number | string) => Promise<unknown>,
): PayloadHandler => {
  return async (req) => {
    const denied = authorized(req)
    if (denied) return denied
    const id = routeImportID(req)
    if (id === null) return jsonError('Invalid import identifier.', 400, 'invalid_import_id')

    try {
      return Response.json(await action(req, id))
    } catch (error) {
      if (error instanceof MarketDataImportError) {
        return jsonError(error.message, error.status, error.code)
      }
      req.payload.logger.error({
        err: error,
        importID: id,
        msg: 'Market-data import endpoint failed.',
      })
      return jsonError(
        'The market-data import could not be completed.',
        500,
        'market_data_import_failed',
      )
    }
  }
}

export const marketDataImportEndpoints: Endpoint[] = [
  {
    handler: endpoint(validateMarketDataImport),
    method: 'post',
    path: '/:id/validate',
  },
  {
    handler: endpoint(getMarketDataImportPreview),
    method: 'get',
    path: '/:id/preview',
  },
  {
    handler: endpoint(commitMarketDataImport),
    method: 'post',
    path: '/:id/commit',
  },
]
