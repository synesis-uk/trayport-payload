'use client'

import dynamic from 'next/dynamic'
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
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
  autoplay?: boolean
  autoplayDelay?: number
  defaultGroupKey?: string
  showGroupFilter?: boolean
}

export function DynamicConnectionsMap({
  autoplay = false,
  autoplayDelay = 5,
  defaultGroupKey,
  groups,
  runtime,
  showGroupFilter = false,
  ...mapProps
}: DynamicConnectionsMapProps) {
  const islandRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [activeGroupKey, setActiveGroupKey] = useState(
    () => groups.find(({ key }) => key === defaultGroupKey)?.key || groups[0]?.key || '',
  )
  const [autoplayStopped, setAutoplayStopped] = useState(false)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const effectiveActiveGroupKey = groups.some(({ key }) => key === activeGroupKey)
    ? activeGroupKey
    : groups.find(({ key }) => key === defaultGroupKey)?.key || groups[0]?.key || ''
  const visibleGroups = useMemo(
    () =>
      showGroupFilter && groups.length > 1
        ? groups.filter(({ key }) => key === effectiveActiveGroupKey)
        : groups,
    [effectiveActiveGroupKey, groups, showGroupFilter],
  )

  const handleError = useCallback(() => {
    setFailed(true)
    setReady(false)
  }, [])
  const handleReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    if (
      !autoplay ||
      autoplayStopped ||
      !showGroupFilter ||
      groups.length < 2 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const interval = window.setInterval(
      () => {
        setActiveGroupKey((current) => {
          const currentIndex = groups.findIndex(({ key }) => key === current)
          return groups[(currentIndex + 1 + groups.length) % groups.length]?.key || current
        })
      },
      Math.min(Math.max(autoplayDelay, 2), 30) * 1000,
    )

    return () => window.clearInterval(interval)
  }, [autoplay, autoplayDelay, autoplayStopped, groups, showGroupFilter])

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
      {showGroupFilter && groups.length > 1 ? (
        <div
          aria-label="Asset class"
          className="absolute top-3 left-3 z-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1 rounded-md bg-trayport-deep/90 p-1 shadow-lg backdrop-blur-sm"
          role="group"
        >
          {groups.map((group) => (
            <button
              aria-pressed={effectiveActiveGroupKey === group.key}
              className="min-h-9 rounded px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:focus-ring aria-pressed:bg-white aria-pressed:text-trayport-deep"
              key={group.key}
              onClick={() => {
                setAutoplayStopped(true)
                setActiveGroupKey(group.key)
              }}
              type="button"
            >
              <span
                aria-hidden
                className="mr-2 inline-block size-2.5 rounded-full border border-white/60"
                style={{ backgroundColor: group.color }}
              />
              {group.title}
            </button>
          ))}
        </div>
      ) : null}
      {active && !failed ? (
        <ConnectionsMapErrorBoundary onError={handleError}>
          <ConnectionsMapRuntime
            {...mapProps}
            accessToken={runtime.accessToken}
            groups={visibleGroups}
            onError={handleError}
            onReady={handleReady}
            styleURL={runtime.styleURL}
          />
        </ConnectionsMapErrorBoundary>
      ) : null}
    </div>
  )
}
