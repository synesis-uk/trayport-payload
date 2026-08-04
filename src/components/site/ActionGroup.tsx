import type { HTMLAttributes } from 'react'

import { cn } from '@/utilities/ui'

export type ActionGroupProps = HTMLAttributes<HTMLDivElement>

export function ActionGroup({ className, ...props }: ActionGroupProps) {
  return <div className={cn('trayport-actions', className)} {...props} />
}
