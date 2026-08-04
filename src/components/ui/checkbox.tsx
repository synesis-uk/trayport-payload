'use client'

import { cn } from '@/utilities/ui'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as React from 'react'

import { ControlIcon } from '@/components/icons/ControlIcon'

const Checkbox: React.FC<React.ComponentProps<typeof CheckboxPrimitive.Root>> = ({
  className,
  ...props
}) => (
  <CheckboxPrimitive.Root
    data-slot="checkbox"
    className={cn(
      "group peer relative size-5 shrink-0 rounded-control border border-input shadow-xs transition-[background-color,border-color,color] outline-none after:absolute after:-inset-3 after:content-[''] focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:focus-ring-error data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      className="flex items-center justify-center text-current"
    >
      <ControlIcon
        aria-hidden
        className="size-3.5 group-data-[state=indeterminate]:hidden"
        name="check"
      />
      <ControlIcon
        aria-hidden
        className="hidden size-3.5 group-data-[state=indeterminate]:block"
        name="minus"
      />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
)

export { Checkbox }
