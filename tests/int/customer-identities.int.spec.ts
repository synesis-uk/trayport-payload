import type { Field } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  createCustomerIdentityKey,
  CustomerIdentities,
  normalizeExternalSubject,
  normalizeIdentityProvider,
  synchronizeCustomerIdentityKey,
} from '@/collections/CustomerIdentities'

const accessArgs = (roles?: Array<'admin' | 'editor'>) =>
  ({
    req: {
      user: roles ? { roles } : null,
    },
  }) as never

const namedFields = (fields: Field[]): string[] =>
  fields.flatMap((field) => {
    const name = 'name' in field && typeof field.name === 'string' ? [field.name] : []
    const children =
      'fields' in field && Array.isArray(field.fields) ? namedFields(field.fields) : []

    return [...name, ...children]
  })

describe('customer identity collection contract', () => {
  it('is separate from CMS authentication and restricts mutations to administrators', async () => {
    expect(CustomerIdentities.slug).toBe('customer-identities')
    expect('auth' in CustomerIdentities).toBe(false)

    expect(await CustomerIdentities.access?.admin?.(accessArgs(['admin']))).toBe(true)
    expect(await CustomerIdentities.access?.admin?.(accessArgs(['editor']))).toBe(true)
    expect(await CustomerIdentities.access?.admin?.(accessArgs())).toBe(false)
    expect(await CustomerIdentities.access?.read?.(accessArgs(['editor']))).toBe(true)
    expect(await CustomerIdentities.access?.read?.(accessArgs())).toBe(false)

    for (const operation of ['create', 'delete', 'update'] as const) {
      expect(await CustomerIdentities.access?.[operation]?.(accessArgs(['admin']))).toBe(true)
      expect(await CustomerIdentities.access?.[operation]?.(accessArgs(['editor']))).toBe(false)
    }
  })

  it('derives one stable unique key without changing provider subject casing', async () => {
    expect(normalizeIdentityProvider('  Example.Provider  ')).toBe('example.provider')
    expect(normalizeExternalSubject('  Customer/ABC-123  ')).toBe('Customer/ABC-123')
    expect(createCustomerIdentityKey(' Example.Provider ', ' Customer/ABC-123 ')).toBe(
      'example.provider:Customer/ABC-123',
    )

    const created = await synchronizeCustomerIdentityKey({
      data: {
        externalSubject: ' Customer/ABC-123 ',
        identityKey: 'forged:value',
        provider: ' Example.Provider ',
      },
    } as never)

    expect(created).toMatchObject({
      externalSubject: 'Customer/ABC-123',
      identityKey: 'example.provider:Customer/ABC-123',
      provider: 'example.provider',
    })

    const updated = await synchronizeCustomerIdentityKey({
      data: { status: 'active' },
      originalDoc: {
        externalSubject: 'Customer/ABC-123',
        identityKey: 'example.provider:Customer/ABC-123',
        provider: 'example.provider',
      },
    } as never)

    expect(updated).toMatchObject({
      identityKey: 'example.provider:Customer/ABC-123',
      status: 'active',
    })

    const identityKey = CustomerIdentities.fields.find(
      (field) => 'name' in field && field.name === 'identityKey',
    )
    expect(identityKey).toMatchObject({ index: true, required: true, unique: true })
  })

  it('stores bounded identity, customer, account, entitlement, and sync metadata only', () => {
    const names = namedFields(CustomerIdentities.fields)

    expect(names).toEqual(
      expect.arrayContaining([
        'provider',
        'externalSubject',
        'identityKey',
        'status',
        'email',
        'displayName',
        'customer',
        'account',
        'entitlements',
        'sync',
        'lastAttemptAt',
        'lastSuccessAt',
        'sourceUpdatedAt',
      ]),
    )

    const forbiddenNames = [
      'accessToken',
      'apiKey',
      'credential',
      'password',
      'refreshToken',
      'secret',
      'token',
    ]
    expect(names.filter((name) => forbiddenNames.includes(name))).toEqual([])
    expect(CustomerIdentities.fields.some((field) => field.type === 'json')).toBe(false)
  })
})
