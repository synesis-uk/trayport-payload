import { cn } from '@/utilities/ui'
import type { ReactNode } from 'react'

import { Button, type ButtonProps } from './button'

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'size'> {
  icon: ReactNode
  label: string
  size?: 'sm' | 'default'
}

export function IconButton({
  className,
  icon,
  label,
  size = 'default',
  ...props
}: IconButtonProps) {
  return (
    <Button
      aria-label={label}
      className={cn(size === 'sm' && 'size-9 min-h-9', className)}
      size="icon"
      {...props}
    >
      {icon}
    </Button>
  )
}
