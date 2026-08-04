'use client'

import * as AccordionPrimitive from '@radix-ui/react-accordion'
import * as React from 'react'

import { ShellIcon } from '@/components/icons/ShellIcon'
import { cn } from '@/utilities/ui'

const Accordion = AccordionPrimitive.Root

const AccordionItem: React.FC<React.ComponentProps<typeof AccordionPrimitive.Item>> = ({
  className,
  ...props
}) => (
  <AccordionPrimitive.Item
    className={cn('border-b border-border', className)}
    data-slot="accordion-item"
    {...props}
  />
)

const AccordionTrigger: React.FC<React.ComponentProps<typeof AccordionPrimitive.Trigger>> = ({
  children,
  className,
  ...props
}) => (
  <AccordionPrimitive.Header className="flex" data-slot="accordion-header">
    <AccordionPrimitive.Trigger
      className={cn(
        'duration-fast group flex min-h-control flex-1 items-center justify-between gap-4 py-4 text-left text-base font-semibold text-foreground transition-colors outline-none hover:text-trayport-blue focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      data-slot="accordion-trigger"
      {...props}
    >
      <span>{children}</span>
      <ShellIcon
        aria-hidden
        className="duration-fast size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
        name="chevronDown"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
)

const AccordionContent: React.FC<React.ComponentProps<typeof AccordionPrimitive.Content>> = ({
  children,
  className,
  ...props
}) => (
  <AccordionPrimitive.Content
    className={cn(
      'overflow-hidden text-sm/6 text-muted-foreground data-[state=closed]:animate-out data-[state=open]:animate-in motion-reduce:animate-none',
      className,
    )}
    data-slot="accordion-content"
    {...props}
  >
    <div className="pb-4">{children}</div>
  </AccordionPrimitive.Content>
)

export interface DisclosureProps {
  children?: React.ReactNode
  className?: string
  defaultOpen?: boolean
  disabled?: boolean
  id?: string
}

function Disclosure({
  children,
  className,
  defaultOpen = false,
  disabled,
  ...props
}: DisclosureProps) {
  return (
    <AccordionPrimitive.Root
      className={cn(className)}
      collapsible
      data-slot="disclosure"
      defaultValue={defaultOpen ? 'disclosure' : undefined}
      type="single"
      {...props}
    >
      <AccordionItem disabled={disabled} value="disclosure">
        {children}
      </AccordionItem>
    </AccordionPrimitive.Root>
  )
}

const DisclosureTrigger = AccordionTrigger
const DisclosureContent = AccordionContent

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
}
