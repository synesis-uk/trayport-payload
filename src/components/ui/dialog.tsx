'use client'

import { cn } from '@/utilities/ui'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'

const Dialog: React.FC<React.ComponentProps<typeof DialogPrimitive.Root>> = (props) => (
  <DialogPrimitive.Root data-slot="dialog" {...props} />
)

const DialogTrigger: React.FC<React.ComponentProps<typeof DialogPrimitive.Trigger>> = (props) => (
  <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
)

const DialogPortal: React.FC<React.ComponentProps<typeof DialogPrimitive.Portal>> = (props) => (
  <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
)

export interface DialogOverlayProps extends React.ComponentProps<typeof DialogPrimitive.Overlay> {
  unstyled?: boolean
}

const DialogOverlay: React.FC<DialogOverlayProps> = ({ className, unstyled = false, ...props }) => (
  <DialogPrimitive.Overlay
    className={cn(
      !unstyled && 'fixed inset-0 z-overlay bg-trayport-deep/55',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none',
      className,
    )}
    data-slot="dialog-overlay"
    {...props}
  />
)

export interface DialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  unstyled?: boolean
}

const DialogContent: React.FC<DialogContentProps> = ({ className, unstyled = false, ...props }) => (
  <DialogPrimitive.Content
    className={cn(
      !unstyled &&
        'absolute top-1/2 left-1/2 w-[min(calc(100%-2rem),36rem)] -translate-1/2 rounded-panel border border-border bg-background p-6 text-foreground shadow-overlay',
      'outline-none focus-visible:focus-ring',
      className,
    )}
    data-slot="dialog-content"
    {...props}
  />
)

const DialogClose: React.FC<React.ComponentProps<typeof DialogPrimitive.Close>> = (props) => (
  <DialogPrimitive.Close data-slot="dialog-close" {...props} />
)

const DialogTitle: React.FC<React.ComponentProps<typeof DialogPrimitive.Title>> = ({
  className,
  ...props
}) => <DialogPrimitive.Title className={cn(className)} data-slot="dialog-title" {...props} />

const DialogDescription: React.FC<React.ComponentProps<typeof DialogPrimitive.Description>> = ({
  className,
  ...props
}) => (
  <DialogPrimitive.Description
    className={cn(className)}
    data-slot="dialog-description"
    {...props}
  />
)

const DialogHeader: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-2', className)} data-slot="dialog-header" {...props} />
)

const DialogFooter: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => (
  <div
    className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
    data-slot="dialog-footer"
    {...props}
  />
)

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
