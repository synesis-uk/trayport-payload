import { cn } from '@/utilities/ui'
import { type VariantProps, cva } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'

const surfaceVariants = cva('rounded-panel', {
  variants: {
    tone: {
      plain: 'bg-background text-foreground',
      soft: 'bg-trayport-soft text-trayport-ink',
      dark: 'bg-trayport-deep text-white',
      outlined: 'border border-border bg-background text-foreground',
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-6 md:p-8',
    },
    elevation: {
      none: 'shadow-none',
      editorial: 'shadow-editorial',
      overlay: 'shadow-overlay',
    },
  },
  defaultVariants: {
    tone: 'plain',
    padding: 'md',
    elevation: 'none',
  },
})

export interface SurfaceProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof surfaceVariants> {}

export function Surface({ className, elevation, padding, tone, ...props }: SurfaceProps) {
  return <div className={cn(surfaceVariants({ elevation, padding, tone }), className)} {...props} />
}

export type StatItem = {
  description?: ReactNode
  label: ReactNode
  value: ReactNode
}

export interface StatListProps extends HTMLAttributes<HTMLDListElement> {
  items: StatItem[]
}

export interface StatGridProps extends StatListProps {
  appearance?: 'default' | 'editorial' | 'hero'
  label?: string
}

export function StatGrid({
  appearance = 'default',
  className,
  items,
  label,
  ...props
}: StatGridProps) {
  return (
    <dl
      aria-label={label}
      className={cn(
        appearance === 'hero'
          ? 'trayport-hero__statistics'
          : appearance === 'editorial'
            ? 'trayport-statistics'
            : 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4',
        className,
      )}
      data-appearance={appearance}
      data-slot="stat-grid"
      {...props}
    >
      {items.map((item, index) => (
        <div
          className={cn(
            appearance === 'default' && 'grid gap-1 border-l-2 border-trayport-cyan pl-4',
          )}
          key={index}
        >
          {appearance === 'hero' ? (
            <>
              <dd>{item.value}</dd>
              <dt>{item.label}</dt>
            </>
          ) : (
            <>
              <dt
                className={cn('trayport-statistics__label', appearance === 'default' && 'text-sm')}
              >
                {item.label}
              </dt>
              <dd
                className={cn(
                  appearance === 'default' &&
                    'order-first m-0 text-3xl font-semibold tracking-tight',
                )}
              >
                {item.value}
              </dd>
              {item.description ? (
                <dd
                  className={cn(
                    'trayport-statistics__description',
                    appearance === 'default' && 'm-0 text-sm',
                  )}
                >
                  {item.description}
                </dd>
              ) : null}
            </>
          )}
        </div>
      ))}
    </dl>
  )
}

export function StatList(props: StatListProps) {
  return <StatGrid {...props} />
}

export { surfaceVariants }
