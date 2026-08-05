import type { SourceReusable } from '../contracts/v1'
import {
  asArray,
  asObject,
  asString,
  finalizeTarget,
  legacyRef,
  referenceId,
  sourceURL,
} from './helpers'
import { htmlToLexical, htmlToPlainText } from './lexical'
import type { TargetRecord } from './types'
import { migrationDestination } from './url'

const bannerTones = {
  '#002d72': 'deep',
  '#0057b8': 'blue',
  '#009cde': 'blue',
  '#00c1d5': 'cyan',
  '#52afde': 'blue',
  '#f7ea48': 'yellow',
  '#ff6021': 'orange',
  '#ff671f': 'orange',
} as const

const legacyBannerTone = (value: unknown): (typeof bannerTones)[keyof typeof bannerTones] => {
  const wrapper = asObject(value)
  const color = asObject(wrapper.color)
  const hex = asString(color.color || color.shade || wrapper.color || wrapper.shade).toLowerCase()
  return bannerTones[hex as keyof typeof bannerTones] || 'deep'
}

const nestedReferenceID = (value: unknown, kind: 'media' | 'post'): number | null => {
  const direct = referenceId(value, kind)
  if (direct) return direct
  if (Array.isArray(value)) {
    for (const child of value) {
      const nested = nestedReferenceID(child, kind)
      if (nested) return nested
    }
  } else if (value && typeof value === 'object') {
    for (const child of Object.values(value as Record<string, unknown>)) {
      const nested = nestedReferenceID(child, kind)
      if (nested) return nested
    }
  }
  return null
}

const bannerLink = (value: unknown): Record<string, unknown> => {
  const link = asObject(value)
  const label = htmlToPlainText(link.title || link.name) || 'Find out more'
  const linkedPageID = Number(asString(link.value)) || referenceId(link.value, 'post') || 0
  const newTab = asString(link.target) === '_blank'

  if (linkedPageID > 0) {
    return {
      label,
      newTab,
      reference: {
        relationTo: 'pages',
        value: legacyRef('page', linkedPageID),
      },
      type: 'reference',
    }
  }

  const destination = migrationDestination(asString(link.url || link.value))
  if (!destination) {
    throw new Error('Banner link has no safe managed or custom destination.')
  }
  return { label, newTab, type: 'custom', url: destination }
}

const requiredInstant = (value: unknown, field: 'end' | 'start', legacyID: number): string => {
  const instant = asString(value)
  if (!instant || !Number.isFinite(Date.parse(instant))) {
    throw new Error(`WordPress banner ${legacyID} has no valid ${field} instant.`)
  }
  return new Date(instant).toISOString()
}

export const mapBannerReusable = (record: SourceReusable): TargetRecord => {
  const data = record.data
  const layout = asString(data.layout) === 'large' ? 'large' : 'small'
  const position = ['first', 'second', 'last'].includes(asString(data.position))
    ? asString(data.position)
    : 'first'
  const targetMode = asString(data.show_on) === 'specific' ? 'specific' : 'all'
  const targetPages = asArray(data.pages).flatMap((value) => {
    const id = Number(asString(value)) || referenceId(value, 'post') || 0
    const reference = legacyRef('page', id)
    return reference ? [reference] : []
  })
  if (targetMode === 'specific' && targetPages.length === 0) {
    throw new Error(`WordPress banner ${record.legacyId} targets specific pages but has none.`)
  }
  const imageID = nestedReferenceID(data.image, 'media')
  const recipientEmails = asArray(data.notification_recipient_emails)
    .map((value) => asString(value).trim().toLowerCase())
    .filter(Boolean)
  const body = asString(data.text)

  return finalizeTarget({
    target: 'banners',
    legacy: {
      source: 'wordpress',
      legacyId: record.legacyId,
      originalUrl: sourceURL(`/wp-admin/post.php?post=${record.legacyId}&action=edit`),
      modifiedGmt: record.modifiedAt || null,
    },
    data: {
      title: record.title,
      headline: htmlToPlainText(data.header) || record.title,
      layout,
      ...(body ? { body: htmlToLexical(body) } : {}),
      ...(imageID ? { image: legacyRef('media', imageID) } : {}),
      link: bannerLink(data.link),
      tone: legacyBannerTone(data.bg_color),
      dismissible: layout === 'small',
      startAt: requiredInstant(data.start_at, 'start', record.legacyId),
      endAt: requiredInstant(data.end_at, 'end', record.legacyId),
      position,
      priority: Number(asString(data.display_order)) || 0,
      targetMode,
      targetPages: targetMode === 'specific' ? targetPages : [],
      migratedRecipientEmails: recipientEmails.map((email) => ({ email })),
      _status: record.status === 'publish' ? 'published' : 'draft',
    },
  })
}
