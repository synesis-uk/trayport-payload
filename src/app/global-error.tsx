'use client'

import { useEffect, type CSSProperties } from 'react'

import { GlobalErrorFallback } from '@/components/site/GlobalErrorFallback'
import { reportClientError, type ClientBoundaryError } from '@/utilities/reportClientError'

type GlobalErrorProps = {
  error: ClientBoundaryError
  unstable_retry: () => void
}

const bodyStyle: CSSProperties = {
  background: '#ffffff',
  color: '#111827',
  fontFamily: "'InterVariable', Inter, ui-sans-serif, system-ui, sans-serif",
  margin: 0,
}

export default function GlobalError({ error, unstable_retry }: GlobalErrorProps) {
  useEffect(() => {
    reportClientError(error, 'root-layout')
  }, [error])

  return (
    <html lang="en">
      <head>
        <title>Something went wrong | Trayport</title>
      </head>
      <body style={bodyStyle}>
        <GlobalErrorFallback onRetry={unstable_retry} />
      </body>
    </html>
  )
}
