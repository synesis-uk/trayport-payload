import path from 'node:path'

import type {
  CollectionConfig,
  FieldAccess,
  RelationshipFieldSingleValidation,
  TextareaFieldValidation,
} from 'payload'
import { APIError } from 'payload'

import { admins } from '@/access/roles'
import {
  MARKET_DATA_IMPORT_MAX_BYTES,
  MARKET_DATA_IMPORT_STATIC_DIR,
} from '@/data/market-data/imports/constants'
import { marketDataImportEndpoints } from '@/data/market-data/imports/endpoints'

const systemFieldAccess: FieldAccess = () => false
const noDocumentAccess = () => false

const siblingValue = (siblingData: unknown, key: string): unknown =>
  siblingData && typeof siblingData === 'object'
    ? (siblingData as Record<string, unknown>)[key]
    : undefined

const validateVolumeAssetClass: RelationshipFieldSingleValidation = (value, { siblingData }) =>
  siblingValue(siblingData, 'importType') !== 'volume' || value
    ? true
    : 'Select an asset class for a volume import.'

const validateForceReason: TextareaFieldValidation = (value, { siblingData }) =>
  !siblingValue(siblingData, 'forceMissingHubs') ||
  (typeof value === 'string' && value.trim().length >= 8)
    ? true
    : 'Give a short reason (at least 8 characters) for forcing missing hub coverage.'

const systemField = {
  access: {
    create: systemFieldAccess,
    update: systemFieldAccess,
  },
  admin: {
    readOnly: true,
  },
} as const

export const MarketDataImports: CollectionConfig = {
  slug: 'market-data-imports',
  access: {
    create: admins,
    delete: noDocumentAccess,
    read: admins,
    update: noDocumentAccess,
  },
  admin: {
    defaultColumns: ['filename', 'importType', 'status', 'validatedAt', 'importedAt', 'createdAt'],
    description:
      'Private CSV history. Create an upload, POST /api/market-data-imports/:id/validate, review GET /:id/preview, then explicitly POST /:id/commit.',
    group: 'Market data',
    useAsTitle: 'filename',
  },
  endpoints: marketDataImportEndpoints,
  fields: [
    {
      name: 'importType',
      type: 'select',
      options: [
        { label: 'Volume', value: 'volume' },
        { label: 'Price', value: 'price' },
      ],
      required: true,
    },
    {
      name: 'assetClass',
      type: 'relationship',
      admin: {
        condition: (_data, siblingData) => siblingValue(siblingData, 'importType') === 'volume',
        description:
          'Required for volume files. Price files may select a fallback or declare asset-class blocks in the CSV.',
      },
      relationTo: 'asset-classes',
      validate: validateVolumeAssetClass,
    },
    {
      name: 'forceMissingHubs',
      type: 'checkbox',
      admin: {
        condition: (_data, siblingData) => siblingValue(siblingData, 'importType') === 'volume',
        description:
          'Accept only a missing-hub coverage error. Unresolved aliases, duplicate values, and malformed data can never be forced.',
      },
      defaultValue: false,
    },
    {
      name: 'forceReason',
      type: 'textarea',
      admin: {
        condition: (_data, siblingData) => Boolean(siblingValue(siblingData, 'forceMissingHubs')),
        description: 'Audit reason recorded with a forced missing-hub import.',
      },
      maxLength: 500,
      validate: validateForceReason,
    },
    {
      name: 'workflowActions',
      type: 'ui',
      admin: {
        components: {
          Field:
            '@/data/market-data/imports/MarketDataImportActions.client#MarketDataImportActions',
        },
      },
    },
    {
      ...systemField,
      name: 'status',
      type: 'select',
      defaultValue: 'uploaded',
      index: true,
      options: [
        { label: 'Uploaded', value: 'uploaded' },
        { label: 'Validating', value: 'validating' },
        { label: 'Invalid', value: 'invalid' },
        { label: 'Validated', value: 'validated' },
        { label: 'Importing', value: 'importing' },
        { label: 'Imported', value: 'imported' },
        { label: 'Failed', value: 'failed' },
      ],
      required: true,
    },
    {
      ...systemField,
      name: 'fileHash',
      type: 'text',
      index: true,
    },
    {
      ...systemField,
      name: 'parserVersion',
      type: 'text',
    },
    {
      ...systemField,
      name: 'stagingFingerprint',
      type: 'text',
    },
    {
      ...systemField,
      name: 'validation',
      type: 'json',
    },
    {
      ...systemField,
      name: 'preview',
      type: 'json',
    },
    {
      ...systemField,
      name: 'result',
      type: 'json',
    },
    {
      ...systemField,
      name: 'failureCode',
      type: 'text',
    },
    {
      ...systemField,
      name: 'failureMessage',
      type: 'textarea',
    },
    {
      ...systemField,
      name: 'validatedAt',
      type: 'date',
    },
    {
      ...systemField,
      name: 'validatedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      ...systemField,
      name: 'importedAt',
      type: 'date',
    },
    {
      ...systemField,
      name: 'importedBy',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
  hooks: {
    beforeValidate: [
      ({ operation, req }) => {
        if (operation !== 'create' || !req.file) return
        const extension = path.extname(req.file.name).toLocaleLowerCase('en-GB')
        if (extension !== '.csv')
          throw new APIError('Market-data imports must use a .csv file.', 400)
        if (req.file.size <= 0 || req.file.size > MARKET_DATA_IMPORT_MAX_BYTES) {
          throw new APIError(
            `CSV files must be between 1 byte and ${MARKET_DATA_IMPORT_MAX_BYTES / 1024 / 1024} MB.`,
            413,
          )
        }
      },
    ],
  },
  upload: {
    bulkUpload: false,
    displayPreview: false,
    hideRemoveFile: true,
    mimeTypes: ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain'],
    pasteURL: false,
    staticDir: MARKET_DATA_IMPORT_STATIC_DIR,
  },
}
