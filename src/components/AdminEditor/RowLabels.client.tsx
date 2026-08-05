'use client'

import { useRowLabel } from '@payloadcms/ui'

import { describeColumn, describeComponent, describeLayout } from '@/editor/describeLayout'

const Label = ({ children }: { children: string }) => (
  <span className="trayport-admin-row-label">{children}</span>
)

export const LayoutRowLabel = () => {
  const { data, rowNumber } = useRowLabel<unknown>()
  return <Label>{describeLayout(data, rowNumber)}</Label>
}

export const ColumnRowLabel = () => {
  const { data, rowNumber } = useRowLabel<unknown>()
  return <Label>{describeColumn(data, rowNumber)}</Label>
}

export const ComponentRowLabel = () => {
  const { data } = useRowLabel<unknown>()
  return <Label>{describeComponent(data)}</Label>
}
