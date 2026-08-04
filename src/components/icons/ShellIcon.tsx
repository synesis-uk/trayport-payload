import type { ComponentProps } from 'react'

import { BoundedIcon } from './BoundedIcon'
import { shellIcons, type ShellIconName } from './shellRegistry'

export interface ShellIconProps extends Omit<ComponentProps<typeof BoundedIcon>, 'icon'> {
  name: ShellIconName
}

export function ShellIcon({ name, ...props }: ShellIconProps) {
  return <BoundedIcon icon={shellIcons[name]} {...props} />
}
