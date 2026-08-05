'use client'

import { useState, type ReactNode } from 'react'

import { ControlIcon } from '@/components/icons/ControlIcon'

export const DismissibleBanner = ({
  ariaLabel,
  children,
  className,
  dismissible,
}: {
  ariaLabel: string
  children: ReactNode
  className: string
  dismissible: boolean
}) => {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <aside aria-label={ariaLabel} className={className}>
      {children}
      {dismissible ? (
        <button
          aria-label="Dismiss announcement"
          className="site-banner__dismiss"
          onClick={() => setVisible(false)}
          type="button"
        >
          <ControlIcon aria-hidden name="close" />
        </button>
      ) : null}
    </aside>
  )
}
