import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { SVGProps } from 'react'

import { cn } from '@/utilities/ui'

export interface BoundedIconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  icon: IconDefinition
}

/**
 * Minimal Font Awesome definition renderer for the two fixed client registries.
 * The general semantic registry keeps the official React renderer on the server.
 */
export function BoundedIcon({ className, icon, ...props }: BoundedIconProps) {
  const [width, height, , , pathData] = icon.icon

  return (
    <svg
      className={cn('svg-inline--fa', `fa-${icon.iconName}`, 'shrink-0', className)}
      data-icon={icon.iconName}
      data-prefix={icon.prefix}
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      {...props}
    >
      {Array.isArray(pathData) ? (
        <g className="fa-duotone-group">
          {pathData.map((path, index) => (
            <path
              className={index === 0 ? 'fa-secondary' : 'fa-primary'}
              d={path}
              fill="currentColor"
              key={`${icon.iconName}-${index}`}
            />
          ))}
        </g>
      ) : (
        <path d={pathData} fill="currentColor" />
      )}
    </svg>
  )
}
