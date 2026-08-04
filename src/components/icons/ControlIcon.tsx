import type { ComponentProps } from 'react'

import { BoundedIcon } from './BoundedIcon'
import { controlIcons, type ControlIconName } from './controlRegistry'

export interface ControlIconProps extends Omit<ComponentProps<typeof BoundedIcon>, 'icon'> {
  name: ControlIconName
}

export function ControlIcon({ name, ...props }: ControlIconProps) {
  return <BoundedIcon icon={controlIcons[name]} {...props} />
}
