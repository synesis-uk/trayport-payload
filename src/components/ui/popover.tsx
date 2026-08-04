'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

import { cn } from '@/utilities/ui'

const Popover: React.FC<React.ComponentProps<typeof PopoverPrimitive.Root>> = (props) => (
  <PopoverPrimitive.Root data-slot="popover" {...props} />
)

const PopoverTrigger: React.FC<React.ComponentProps<typeof PopoverPrimitive.Trigger>> = (props) => (
  <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
)

const PopoverAnchor: React.FC<React.ComponentProps<typeof PopoverPrimitive.Anchor>> = (props) => (
  <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
)

const PopoverContent: React.FC<React.ComponentProps<typeof PopoverPrimitive.Content>> = ({
  align = 'center',
  className,
  sideOffset = 8,
  ...props
}) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      align={align}
      className={cn(
        'z-dropdown w-72 rounded-panel border border-border bg-popover p-4 text-popover-foreground shadow-overlay outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:animate-none',
        className,
      )}
      data-slot="popover-content"
      sideOffset={sideOffset}
      {...props}
    />
  </PopoverPrimitive.Portal>
)

const PopoverClose: React.FC<React.ComponentProps<typeof PopoverPrimitive.Close>> = (props) => (
  <PopoverPrimitive.Close data-slot="popover-close" {...props} />
)

export { Popover, PopoverAnchor, PopoverClose, PopoverContent, PopoverTrigger }
