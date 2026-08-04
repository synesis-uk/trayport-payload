import { cn } from '@/utilities/ui'
import { type VariantProps, cva } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

const containerVariants = cva('trayport-container', {
  variants: {
    width: {
      page: '',
      wide: 'trayport-container--wide',
      reading: 'trayport-container--reading',
      full: 'trayport-container--full',
    },
  },
  defaultVariants: {
    width: 'page',
  },
})

export interface ContainerProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {}

export function Container({ className, width, ...props }: ContainerProps) {
  return <div className={cn(containerVariants({ width }), className)} {...props} />
}

const stackVariants = cva('grid', {
  variants: {
    gap: {
      none: 'gap-0',
      xs: 'gap-2',
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-12',
    },
  },
  defaultVariants: {
    gap: 'md',
  },
})

export interface StackProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof stackVariants> {}

export function Stack({ className, gap, ...props }: StackProps) {
  return <div className={cn(stackVariants({ gap }), className)} {...props} />
}

const clusterVariants = cva('flex flex-wrap items-center', {
  variants: {
    gap: {
      xs: 'gap-2',
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      between: 'justify-between',
      end: 'justify-end',
    },
  },
  defaultVariants: {
    gap: 'md',
    justify: 'start',
  },
})

export interface ClusterProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof clusterVariants> {}

export function Cluster({ className, gap, justify, ...props }: ClusterProps) {
  return <div className={cn(clusterVariants({ gap, justify }), className)} {...props} />
}

const gridVariants = cva('grid', {
  variants: {
    columns: {
      one: 'grid-cols-1',
      two: 'grid-cols-1 md:grid-cols-2',
      three: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      four: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      twelve: 'grid-cols-12',
    },
    gap: {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    },
  },
  defaultVariants: {
    columns: 'one',
    gap: 'md',
  },
})

export interface GridProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {}

export function Grid({ className, columns, gap, ...props }: GridProps) {
  return <div className={cn(gridVariants({ columns, gap }), className)} {...props} />
}
