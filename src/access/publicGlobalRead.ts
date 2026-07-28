import type { Access } from 'payload'

import { isAdminOrEditor } from './roles'

const requestsDraft = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.some(requestsDraft)
  }

  return value === true || value === 'true' || value === '1' || value === 1
}

/**
 * Globals cannot return a `_status` query constraint from access control.
 * Explicitly reject public REST requests for their draft projection instead.
 */
export const publicGlobalRead: Access = ({ req }) => {
  if (isAdminOrEditor(req.user)) {
    return true
  }

  return !requestsDraft(req.query?.draft)
}
