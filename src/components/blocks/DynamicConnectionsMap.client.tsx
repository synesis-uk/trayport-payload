'use client'

import dynamic from 'next/dynamic'
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import type { ConnectionsMapRuntimeConfig } from '@/config/connectionsMap'
import { reportClientError } from '@/utilities/reportClientError'

import type { ConnectionsMapGroup } from './connectionsMapData'
import type { ConnectionsMapRuntimeProps } from './ConnectionsMapRuntime.client'

const ConnectionsMapRuntime = dynamic(() => import('./ConnectionsMapRuntime.client'), {
  ssr: false,
})

interface ConnectionsMapErrorBoundaryProps {
  children: ReactNode
  onError: () => void
}

interface ConnectionsMapErrorBoundaryState {
  failed: boolean
}

class ConnectionsMapErrorBoundary extends Component<
  ConnectionsMapErrorBoundaryProps,
  ConnectionsMapErrorBoundaryState
> {
  state: ConnectionsMapErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ConnectionsMapErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    reportClientError(error, 'frontend-route')
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export interface DynamicConnectionsMapProps extends Omit<
  ConnectionsMapRuntimeProps,
  'accessToken' | 'onError' | 'onReady' | 'styleURL'
> {
  groups: ConnectionsMapGroup[]
  runtime: ConnectionsMapRuntimeConfig
}

export function DynamicConnectionsMap({ runtime, ...mapProps }: DynamicConnectionsMapProps) {
  const islandRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  const handleError = useCallback(() => {
    setFailed(true)
    setReady(false)
  }, [])
  const handleReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    const island = islandRef.current
    if (!island) return

    if (!('IntersectionObserver' in window)) {
      const activationFrame = requestAnimationFrame(() => setActive(true))
      return () => cancelAnimationFrame(activationFrame)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setActive(true)
        observer.disconnect()
      },
      { rootMargin: '300px 0px' },
    )
    observer.observe(island)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const figure = islandRef.current?.closest<HTMLElement>('.trayport-coverage-map')
    if (!figure) return
    figure.dataset.mapError = String(failed)
    figure.dataset.mapReady = String(ready)

    return () => {
      figure.dataset.mapError = 'false'
      figure.dataset.mapReady = 'false'
    }
  }, [failed, ready])

  return (
    <div
      className="trayport-coverage-map__interactive"
      data-map-error={String(failed)}
      data-map-provider={runtime.provider}
      data-map-ready={String(ready)}
      ref={islandRef}
    >
      {active && !failed ? (
        <ConnectionsMapErrorBoundary onError={handleError}>
          <ConnectionsMapRuntime
            {...mapProps}
            accessToken={runtime.accessToken}
            onError={handleError}
            onReady={handleReady}
            styleURL={runtime.styleURL}
          />
        </ConnectionsMapErrorBoundary>
      ) : null}
    </div>
  )
}
