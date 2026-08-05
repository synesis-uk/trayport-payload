import type { ComponentProps } from 'react'

import RichText from '@/components/RichText'

import {
  normalizeChecklistComponent,
  normalizeLifecycleComponent,
  type ChecklistComponentInput,
  type LifecycleComponentInput,
} from './checklistLifecycleModels'
import { ChecklistPresentation, LifecyclePresentation } from './ChecklistLifecyclePresentation'

interface ChecklistComponentAdapterProps {
  block: ChecklistComponentInput
  index: number
}

interface LifecycleComponentAdapterProps {
  block: LifecycleComponentInput
  index: number
}

export const ChecklistComponentAdapter = ({ block }: ChecklistComponentAdapterProps) => (
  <ChecklistPresentation model={normalizeChecklistComponent(block)} />
)

export const LifecycleComponentAdapter = ({ block }: LifecycleComponentAdapterProps) => {
  const descriptions = (block.lifecycleItems || []).map((item, index) =>
    item && typeof item === 'object' && item.description ? (
      <RichText
        className="trayport-richtext"
        data={item.description as ComponentProps<typeof RichText>['data']}
        enableGutter={false}
        key={item.id || `lifecycle-description-${index + 1}`}
      />
    ) : undefined,
  )

  return <LifecyclePresentation model={normalizeLifecycleComponent(block, { descriptions })} />
}
