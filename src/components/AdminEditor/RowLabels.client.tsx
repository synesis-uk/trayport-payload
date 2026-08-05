'use client'

import { useRowLabel } from '@payloadcms/ui'

import { describeColumn, describeComponent, describeLayout } from '@/editor/describeLayout'

const Label = ({ children }: { children: string }) => (
  <span className="trayport-admin-row-label">{children}</span>
)

const getColumnSpan = (data: unknown): '4' | '6' | '8' | '12' => {
  if (!data || typeof data !== 'object' || !('span' in data)) return '12'

  const span = String(data.span)
  return span === '4' || span === '6' || span === '8' || span === '12' ? span : '12'
}

export const LayoutRowLabel = () => {
  const { data, rowNumber } = useRowLabel<unknown>()
  return <Label>{describeLayout(data, rowNumber)}</Label>
}

export const ColumnRowLabel = () => {
  const { data, rowNumber } = useRowLabel<unknown>()
  return (
    <span
      className="trayport-admin-column-label trayport-admin-row-label"
      data-column-span={getColumnSpan(data)}
    >
      {describeColumn(data, rowNumber)}
    </span>
  )
}

export const ComponentRowLabel = () => {
  const { data } = useRowLabel<unknown>()
  return <Label>{describeComponent(data)}</Label>
}
