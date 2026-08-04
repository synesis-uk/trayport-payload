import { cn } from '@/utilities/ui'
import { type VariantProps, cva } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

import { Container, type ContainerProps } from './layout'

const sectionVariants = cva('trayport-section', {
  variants: {
    spacing: {
      compact: 'trayport-section--compact',
      regular: 'trayport-section--regular',
      generous: 'trayport-section--generous',
    },
    theme: {
      light: 'trayport-section--light',
      white: 'trayport-section--white',
      softBlue: 'trayport-section--softBlue',
      dark: 'trayport-section--dark',
    },
  },
  defaultVariants: {
    spacing: 'regular',
    theme: 'light',
  },
})

export interface SectionProps
  extends HTMLAttributes<HTMLElement>, VariantProps<typeof sectionVariants> {
  containerClassName?: string
  width?: ContainerProps['width']
}

export function Section({
  children,
  className,
  containerClassName,
  spacing,
  theme,
  width = 'page',
  ...props
}: SectionProps) {
  return (
    <section className={cn(sectionVariants({ spacing, theme }), className)} {...props}>
      <Container className={containerClassName} width={width}>
        {children}
      </Container>
    </section>
  )
}

export { sectionVariants }
