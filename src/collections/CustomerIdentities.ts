import type {
  CollectionBeforeValidateHook,
  CollectionConfig,
  TextFieldSingleValidation,
} from 'payload'

import { admins, adminsOrEditors, isAdmin, isAdminOrEditor } from '@/access/roles'

const providerPattern = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/u

export const normalizeIdentityProvider = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

export const normalizeExternalSubject = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

export const createCustomerIdentityKey = (provider: string, externalSubject: string): string =>
  `${normalizeIdentityProvider(provider)}:${normalizeExternalSubject(externalSubject)}`

const validateIdentityProvider: TextFieldSingleValidation = (value) =>
  typeof value === 'string' && providerPattern.test(normalizeIdentityProvider(value))
    ? true
    : 'Use lowercase letters, numbers, dots, underscores, or hyphens.'

const hasOwn = (value: object, key: string): boolean => Object.hasOwn(value, key)

export const synchronizeCustomerIdentityKey: CollectionBeforeValidateHook = ({
  data,
  originalDoc,
}) => {
  if (!data) return data

  const provider = normalizeIdentityProvider(
    hasOwn(data, 'provider') ? data.provider : originalDoc?.provider,
  )
  const externalSubject = normalizeExternalSubject(
    hasOwn(data, 'externalSubject') ? data.externalSubject : originalDoc?.externalSubject,
  )

  return {
    ...data,
    ...(hasOwn(data, 'provider') ? { provider } : {}),
    ...(hasOwn(data, 'externalSubject') ? { externalSubject } : {}),
    identityKey:
      provider && externalSubject
        ? createCustomerIdentityKey(provider, externalSubject)
        : undefined,
  }
}

export const CustomerIdentities: CollectionConfig = {
  slug: 'customer-identities',
  labels: {
    plural: 'Customer identities',
    singular: 'Customer identity',
  },
  access: {
    admin: ({ req: { user } }) => isAdminOrEditor(user),
    create: admins,
    delete: admins,
    read: adminsOrEditors,
    update: admins,
  },
  admin: {
    defaultColumns: ['displayName', 'email', 'provider', 'status', 'updatedAt'],
    description:
      'Provider-neutral customer identity references for future external-service integration. These records are not CMS login accounts.',
    group: 'Customer access',
    hidden: ({ user }) => !isAdmin(user),
    useAsTitle: 'identityKey',
  },
  defaultSort: 'displayName',
  fields: [
    {
      name: 'provider',
      type: 'text',
      admin: {
        description:
          'Stable lowercase provider key, for example “tim”. This identifies the source system, not a login method.',
        position: 'sidebar',
      },
      index: true,
      maxLength: 64,
      required: true,
      validate: validateIdentityProvider,
    },
    {
      name: 'externalSubject',
      type: 'text',
      admin: {
        description:
          'Immutable subject identifier supplied by the provider. Do not enter passwords, access tokens, or other credentials.',
      },
      index: true,
      maxLength: 255,
      required: true,
    },
    {
      name: 'identityKey',
      type: 'text',
      admin: {
        description: 'System-managed unique key derived from the provider and external subject.',
        position: 'sidebar',
        readOnly: true,
      },
      index: true,
      maxLength: 320,
      required: true,
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      admin: {
        position: 'sidebar',
      },
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Disabled', value: 'disabled' },
      ],
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      index: true,
    },
    {
      name: 'displayName',
      type: 'text',
      admin: {
        description: 'Human-readable name used by editors; it is not an authentication claim.',
      },
      index: true,
    },
    {
      name: 'customer',
      type: 'group',
      admin: {
        description: 'Provider-neutral reference to the customer organisation.',
      },
      fields: [
        {
          name: 'reference',
          type: 'text',
          index: true,
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    {
      name: 'account',
      type: 'group',
      admin: {
        description: 'Provider-neutral reference to the customer account or tenancy.',
      },
      fields: [
        {
          name: 'reference',
          type: 'text',
          index: true,
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    {
      name: 'entitlements',
      type: 'array',
      admin: {
        description:
          'A concise list of product or content grants. Keep provider payloads and credentials outside Payload.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'granted',
          options: [
            { label: 'Granted', value: 'granted' },
            { label: 'Revoked', value: 'revoked' },
            { label: 'Expired', value: 'expired' },
          ],
          required: true,
        },
        {
          name: 'startsAt',
          type: 'date',
        },
        {
          name: 'expiresAt',
          type: 'date',
        },
      ],
      maxRows: 64,
    },
    {
      name: 'sync',
      type: 'group',
      admin: {
        description:
          'Operational state for a future synchronisation adapter. No provider secrets are stored here.',
      },
      fields: [
        {
          name: 'state',
          type: 'select',
          defaultValue: 'never',
          options: [
            { label: 'Never synchronised', value: 'never' },
            { label: 'Successful', value: 'success' },
            { label: 'Warning', value: 'warning' },
            { label: 'Error', value: 'error' },
          ],
          required: true,
        },
        {
          name: 'lastAttemptAt',
          type: 'date',
        },
        {
          name: 'lastSuccessAt',
          type: 'date',
        },
        {
          name: 'sourceUpdatedAt',
          type: 'date',
        },
        {
          name: 'revision',
          type: 'text',
        },
        {
          name: 'message',
          type: 'textarea',
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [synchronizeCustomerIdentityKey],
  },
  timestamps: true,
}
