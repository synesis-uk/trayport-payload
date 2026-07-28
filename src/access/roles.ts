import type { Access } from 'payload'

export const cmsRoleOptions = [
  {
    label: 'Administrator',
    value: 'admin',
  },
  {
    label: 'Editor',
    value: 'editor',
  },
] as const

type CMSRole = (typeof cmsRoleOptions)[number]['value']

type UserWithRoles = {
  id?: number | string
  roles?: CMSRole[] | null
}

const userWithRoles = (user: unknown): UserWithRoles | null => {
  if (!user || typeof user !== 'object') {
    return null
  }

  return user as UserWithRoles
}

export const hasRole = (user: unknown, roles: CMSRole[]): boolean => {
  const candidate = userWithRoles(user)

  return Boolean(candidate?.roles?.some((role) => roles.includes(role)))
}

export const isAdmin = (user: unknown): boolean => hasRole(user, ['admin'])

export const isAdminOrEditor = (user: unknown): boolean => hasRole(user, ['admin', 'editor'])

export const admins: Access = ({ req: { user } }) => isAdmin(user)

export const adminsOrEditors: Access = ({ req: { user } }) => isAdminOrEditor(user)

export const adminsOrSelf: Access = ({ id, req: { user } }) => {
  if (isAdmin(user)) {
    return true
  }

  const candidate = userWithRoles(user)

  return Boolean(candidate?.id && id && String(candidate.id) === String(id))
}

export const adminsOrOwnUserRecord: Access = ({ req: { user } }) => {
  if (isAdmin(user)) {
    return true
  }

  const candidate = userWithRoles(user)

  if (!candidate?.id) {
    return false
  }

  return {
    id: {
      equals: candidate.id,
    },
  }
}

export const adminsOrFirstUser: Access = async ({ req }) => {
  if (isAdmin(req.user)) {
    return true
  }

  if (req.user) {
    return false
  }

  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
  })

  return totalDocs === 0
}

export const publicOrCMSUsers: Access = ({ req: { user } }) => {
  if (isAdminOrEditor(user)) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
