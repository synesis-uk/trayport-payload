import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { ControlIcon } from '@/components/icons/ControlIcon'

const buttonVariants = cva(
  "duration-fast inline-flex min-h-control items-center justify-center gap-2 rounded-control border border-transparent text-sm font-semibold whitespace-nowrap no-underline transition-[background-color,border-color,color,box-shadow,translate] ease-standard outline-none focus-visible:focus-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 motion-safe:active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-trayport-blue text-white shadow-xs hover:bg-trayport-deep focus-visible:bg-trayport-deep',
        destructive: 'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
        outline:
          'border-current bg-transparent text-trayport-deep hover:border-trayport-blue hover:bg-trayport-soft hover:text-trayport-blue',
        secondary:
          'border-trayport-soft bg-trayport-soft text-trayport-deep hover:border-trayport-light-blue hover:bg-trayport-light-blue hover:text-trayport-deep',
        ghost: 'text-trayport-deep hover:bg-trayport-soft hover:text-trayport-blue',
        link: 'min-h-0 border-0 p-0 text-trayport-blue underline-offset-4 hover:underline',
      },
      size: {
        clear: '',
        default: 'px-4 py-2.5 has-[>svg]:px-3.5',
        sm: 'min-h-control-sm px-3 py-1.5 text-[0.8125rem] has-[>svg]:px-2.5',
        lg: 'min-h-control-lg px-6 py-3 has-[>svg]:px-5',
        icon: 'size-control p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingLabel?: string
}

const Button: React.FC<ButtonProps> = ({
  asChild = false,
  children,
  className,
  disabled,
  isLoading = false,
  loadingLabel = 'Loading',
  onClick,
  size,
  tabIndex,
  variant,
  ...props
}) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      aria-busy={isLoading || undefined}
      aria-disabled={asChild && (disabled || isLoading) ? true : undefined}
      data-slot="button"
      data-loading={isLoading ? '' : undefined}
      disabled={asChild ? undefined : disabled || isLoading}
      onClick={(event) => {
        if (asChild && (disabled || isLoading)) {
          event.preventDefault()
          event.stopPropagation()
          return
        }
        onClick?.(event)
      }}
      tabIndex={asChild && (disabled || isLoading) ? -1 : tabIndex}
      {...props}
    >
      {asChild ? (
        children
      ) : isLoading ? (
        <>
          <ControlIcon
            aria-hidden
            className="animate-spin motion-reduce:animate-none"
            name="spinner"
          />
          <span className={cn(size === 'icon' && 'sr-only')}>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
