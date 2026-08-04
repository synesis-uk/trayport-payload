'use client'

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import * as React from 'react'

import { ControlIcon } from '@/components/icons/ControlIcon'
import { cn } from '@/utilities/ui'

const DropdownMenu: React.FC<React.ComponentProps<typeof DropdownMenuPrimitive.Root>> = (props) => (
  <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
)

const DropdownMenuTrigger: React.FC<React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>> = (
  props,
) => <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />

const DropdownMenuGroup: React.FC<React.ComponentProps<typeof DropdownMenuPrimitive.Group>> = (
  props,
) => <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuContent: React.FC<React.ComponentProps<typeof DropdownMenuPrimitive.Content>> = ({
  align = 'start',
  className,
  sideOffset = 8,
  ...props
}) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      align={align}
      className={cn(
        'z-dropdown min-w-48 overflow-hidden rounded-panel border border-border bg-popover p-1 text-popover-foreground shadow-overlay outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:animate-none',
        className,
      )}
      data-slot="dropdown-menu-content"
      sideOffset={sideOffset}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
)

export interface DropdownMenuItemProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Item
> {
  inset?: boolean
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ className, inset, ...props }) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      'relative flex min-h-control cursor-default items-center gap-2 rounded-control px-3 py-2 text-sm outline-none select-none focus:bg-secondary focus:text-secondary-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      inset && 'pl-9',
      className,
    )}
    data-inset={inset ? '' : undefined}
    data-slot="dropdown-menu-item"
    {...props}
  />
)

export interface DropdownMenuLabelProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Label
> {
  inset?: boolean
}

const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({ className, inset, ...props }) => (
  <DropdownMenuPrimitive.Label
    className={cn(
      'px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase',
      inset && 'pl-9',
      className,
    )}
    data-inset={inset ? '' : undefined}
    data-slot="dropdown-menu-label"
    {...props}
  />
)

const DropdownMenuSeparator: React.FC<
  React.ComponentProps<typeof DropdownMenuPrimitive.Separator>
> = ({ className, ...props }) => (
  <DropdownMenuPrimitive.Separator
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    data-slot="dropdown-menu-separator"
    {...props}
  />
)

const DropdownMenuCheckboxItem: React.FC<
  React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>
> = ({ children, checked, className, ...props }) => (
  <DropdownMenuPrimitive.CheckboxItem
    checked={checked}
    className={cn(
      'relative flex min-h-control cursor-default items-center rounded-control py-2 pr-3 pl-9 text-sm outline-none select-none focus:bg-secondary focus:text-secondary-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
      className,
    )}
    data-slot="dropdown-menu-checkbox-item"
    {...props}
  >
    <span className="absolute left-3 flex size-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <ControlIcon aria-hidden className="size-3.5" name="check" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
)

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuRadioItem: React.FC<
  React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>
> = ({ children, className, ...props }) => (
  <DropdownMenuPrimitive.RadioItem
    className={cn(
      'relative flex min-h-control cursor-default items-center rounded-control py-2 pr-3 pl-9 text-sm outline-none select-none focus:bg-secondary focus:text-secondary-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
      className,
    )}
    data-slot="dropdown-menu-radio-item"
    {...props}
  >
    <span className="absolute left-3 flex size-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <span className="size-2 rounded-full bg-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
)

const DropdownMenuShortcut: React.FC<React.ComponentProps<'span'>> = ({ className, ...props }) => (
  <span
    className={cn('ml-auto pl-4 text-xs tracking-widest text-muted-foreground', className)}
    data-slot="dropdown-menu-shortcut"
    {...props}
  />
)

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
}
