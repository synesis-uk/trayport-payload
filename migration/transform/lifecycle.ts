import {
  sourceLifecycleReusableSchema,
  type SourceLifecycleReusable,
  type SourceReusable,
} from '../contracts/v1'
import { asObject, asString, finalizeTarget, sourceURL } from './helpers'
import { htmlToLexical, htmlToPlainText } from './lexical'
import type { TargetRecord } from './types'

export const legacyLifecycleDateToISO = (value: unknown): string => {
  const match = /^(\d{4})(\d{2})(\d{2})$/u.exec(asString(value))
  if (!match) throw new Error(`Invalid WordPress lifecycle date: ${asString(value) || '(empty)'}`)

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid WordPress lifecycle date: ${asString(value)}`)
  }

  return date.toISOString()
}

export const mapLifecycleReusable = (source: SourceReusable): TargetRecord => {
  const record: SourceLifecycleReusable = sourceLifecycleReusableSchema.parse(source)
  const product = asObject(record.data.product)
  const serviceName = htmlToPlainText(record.data.name) || record.title
  const productLabel = htmlToPlainText(product.title) || serviceName
  const endOfAccessDate = asString(record.data.eoa_date)
  const description = asString(record.data.description).trim()
  const data = {
    title: record.title,
    productLabel,
    serviceName,
    duration: htmlToPlainText(record.data.duration),
    endOfLifeVersion: htmlToPlainText(record.data.eol_version),
    endOfLifeDate: legacyLifecycleDateToISO(record.data.eol_date),
    endOfAccessDate: endOfAccessDate ? legacyLifecycleDateToISO(endOfAccessDate) : null,
    ...(description ? { description: htmlToLexical(description) } : {}),
    active: true,
    _status: 'published',
  }

  return finalizeTarget({
    target: 'lifecycle-items',
    legacy: {
      source: 'wordpress',
      legacyId: record.legacyId,
      originalUrl: sourceURL(record.path),
      modifiedGmt: null,
    },
    data,
  })
}
