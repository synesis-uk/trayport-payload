import type { ReactNode } from 'react'

export interface ChecklistComponentInput {
  appearance?: unknown
  items?: Array<{
    id?: number | string | null
    text?: unknown
    title?: unknown
  }> | null
}

export interface ChecklistPresentationModel {
  appearance: 'checks' | 'numbers'
  items: Array<{
    key: string
    text: string
    title?: string
  }>
}

export interface LifecycleItemInput {
  active?: unknown
  description?: unknown
  duration?: unknown
  endOfAccessDate?: unknown
  endOfLifeDate?: unknown
  endOfLifeVersion?: unknown
  id?: number | string | null
  productLabel?: unknown
  serviceName?: unknown
  title?: unknown
}

export interface LifecycleComponentInput {
  caption?: unknown
  lifecycleItems?: Array<LifecycleItemInput | number | string> | null
  previousHeading?: unknown
  showDescriptions?: unknown
  upcomingHeading?: unknown
}

export interface LifecyclePresentationDate {
  iso: string
  label: string
}

export interface LifecyclePresentationItem {
  description?: ReactNode
  duration: string
  endOfAccessDate?: LifecyclePresentationDate
  endOfLifeDate?: LifecyclePresentationDate
  endOfLifeVersion: string
  key: string
  serviceName: string
}

export interface LifecyclePresentationGroup {
  items: LifecyclePresentationItem[]
  key: string
  label: string
}

export interface LifecyclePresentationPeriod {
  groups: LifecyclePresentationGroup[]
  heading: string
  key: 'previous' | 'upcoming'
}

export interface LifecyclePresentationModel {
  caption: string
  periods: [LifecyclePresentationPeriod, LifecyclePresentationPeriod]
}

const asText = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''

export const normalizeChecklistComponent = (
  component: ChecklistComponentInput,
): ChecklistPresentationModel => ({
  appearance: component.appearance === 'numbers' ? 'numbers' : 'checks',
  items: (component.items || []).flatMap((item, index) => {
    const text = asText(item.text)
    if (!text) return []

    const title = asText(item.title)
    return [
      {
        key:
          item.id === null || item.id === undefined
            ? `checklist-item-${index + 1}`
            : String(item.id),
        text,
        ...(title ? { title } : {}),
      },
    ]
  }),
})

const validDateParts = (value: unknown): { iso: string; key: string } | null => {
  const text = asText(value)
  const match = /^(\d{4})-(\d{2})-(\d{2})/u.exec(text)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const candidate = new Date(Date.UTC(year, month - 1, day))
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null
  }

  return {
    iso: `${match[1]}-${match[2]}-${match[3]}`,
    key: `${match[1]}${match[2]}${match[3]}`,
  }
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
  year: 'numeric',
})

const presentationDate = (
  parts: ReturnType<typeof validDateParts>,
): LifecyclePresentationDate | undefined =>
  parts
    ? {
        iso: parts.iso,
        label: dateFormatter.format(new Date(`${parts.iso}T00:00:00.000Z`)),
      }
    : undefined

const todayKey = (now: Date): string => {
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

type NormalizedLifecycleRow = LifecyclePresentationItem & {
  dateKey: string | null
  productLabel: string
}

const groupedRows = (
  rows: NormalizedLifecycleRow[],
  period: 'previous' | 'upcoming',
): LifecyclePresentationGroup[] => {
  const groups = new Map<string, NormalizedLifecycleRow[]>()

  for (const row of rows) {
    const existing = groups.get(row.productLabel) || []
    existing.push(row)
    groups.set(row.productLabel, existing)
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right, 'en-GB'))
    .map(([label, items]) => ({
      key: label
        .toLocaleLowerCase('en-GB')
        .replace(/[^a-z0-9]+/gu, '-')
        .replace(/(^-|-$)/gu, ''),
      label,
      items: items
        .sort((left, right) => {
          const leftDate = left.dateKey || '99999999'
          const rightDate = right.dateKey || '99999999'
          const dateOrder =
            period === 'upcoming'
              ? leftDate.localeCompare(rightDate)
              : rightDate.localeCompare(leftDate)
          return dateOrder || left.serviceName.localeCompare(right.serviceName, 'en-GB')
        })
        .map(({ dateKey: _dateKey, productLabel: _productLabel, ...item }) => item),
    }))
}

export const normalizeLifecycleComponent = (
  component: LifecycleComponentInput,
  {
    descriptions = [],
    now = new Date(),
  }: {
    descriptions?: Array<ReactNode | undefined>
    now?: Date
  } = {},
): LifecyclePresentationModel => {
  const currentDateKey = todayKey(now)
  const rows = (component.lifecycleItems || []).flatMap<NormalizedLifecycleRow>((item, index) => {
    if (!item || typeof item !== 'object' || item.active === false) return []

    const serviceName = asText(item.serviceName || item.title)
    const productLabel = asText(item.productLabel || serviceName)
    if (!serviceName || !productLabel) return []

    const endOfLifeDate = validDateParts(item.endOfLifeDate)
    const endOfAccessDate = validDateParts(item.endOfAccessDate)
    const description = component.showDescriptions === true ? descriptions[index] : undefined

    return [
      {
        dateKey: endOfLifeDate?.key || null,
        ...(description ? { description } : {}),
        duration: asText(item.duration),
        endOfAccessDate: presentationDate(endOfAccessDate),
        endOfLifeDate: presentationDate(endOfLifeDate),
        endOfLifeVersion: asText(item.endOfLifeVersion),
        key:
          item.id === null || item.id === undefined
            ? `lifecycle-item-${index + 1}`
            : String(item.id),
        productLabel,
        serviceName,
      },
    ]
  })

  const upcoming = rows.filter(({ dateKey }) => !dateKey || dateKey > currentDateKey)
  const previous = rows.filter(({ dateKey }) => Boolean(dateKey && dateKey <= currentDateKey))

  return {
    caption: asText(component.caption) || 'Product lifecycle schedule',
    periods: [
      {
        groups: groupedRows(upcoming, 'upcoming'),
        heading: asText(component.upcomingHeading) || 'Upcoming End-of-Life Details',
        key: 'upcoming',
      },
      {
        groups: groupedRows(previous, 'previous'),
        heading: asText(component.previousHeading) || 'Previous Versions',
        key: 'previous',
      },
    ],
  }
}
