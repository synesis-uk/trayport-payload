import { FontAwesomeIcon, type FontAwesomeIconProps } from '@fortawesome/react-fontawesome'

import { cn } from '@/utilities/ui'

import { appIcons, type AppIconName } from './registry'

export interface AppIconProps extends Omit<FontAwesomeIconProps, 'icon'> {
  name: AppIconName
}

export function AppIcon({ className, name, ...props }: AppIconProps) {
  return <FontAwesomeIcon className={cn('shrink-0', className)} icon={appIcons[name]} {...props} />
}
