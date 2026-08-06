'use client'

import dynamic from 'next/dynamic'
import {
  Component,
  type CSSProperties,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'

import { AppLink } from '@/components/site/AppLink'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ConnectionsMapRuntimeConfig } from '@/config/connectionsMap'
import type {
  RegionalMapHub,
  RegionalMapVenue,
  RegionalMarketMapIndex,
} from '@/data/regionalMarketMap'
import { cn } from '@/utilities/ui'
import { reportClientError } from '@/utilities/reportClientError'

import type { RegionalMarketMapPresentationModel } from './RegionalMarketMapPresentation'
const RegionalMarketMapRuntime = dynamic(() => import('./RegionalMarketMapRuntime.client'), {
  ssr: false,
})

type MarketMapDataResponse = {
  assetClassKey: string
  interval: 'month' | 'quarter' | 'year'
  period: string
  periods: Array<{ key: string; label: string }>
  status: 'available' | 'empty' | 'unavailable'
  summaries: Record<
    string,
    {
      changeLabel?: 'MoM' | 'QoQ' | 'YoY'
      changePercent: number | null
      label: string
      value: number | null
    }
  >
}

const emptyMarketData = (interval: MarketMapDataResponse['interval']): MarketMapDataResponse => ({
  assetClassKey: '',
  interval,
  period: '',
  periods: [],
  status: 'empty',
  summaries: {},
})

class RegionalMapErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
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

const visibleHubsFor = (
  index: RegionalMarketMapIndex,
  assetClassID: string,
  regionID: string,
): RegionalMapHub[] =>
  index.hubs.filter(
    (hub) =>
      (!assetClassID || hub.assetClassIDs.includes(assetClassID)) &&
      (!regionID || hub.regionIDs.includes(regionID)),
  )

const connectionLabel = (type: 'a' | 'b' | 'd'): string =>
  type === 'a' ? 'autoTRADER' : type === 'd' ? 'Joule' : 'Joule and autoTRADER'

const venuesForHub = (
  index: RegionalMarketMapIndex,
  hubID: string,
): Array<{ type: 'a' | 'b' | 'd'; venue: RegionalMapVenue }> =>
  index.venues.flatMap((venue) => {
    const connection = venue.connections.find((item) => item.hubID === hubID)
    return connection ? [{ type: connection.type, venue }] : []
  })

type SelectedVenue = {
  types: Array<'a' | 'b' | 'd'>
  venue: RegionalMapVenue
}

type VenueGroup = {
  common: SelectedVenue[]
  hubSpecific: Array<{ hub: RegionalMapHub; venues: SelectedVenue[] }>
  id: string
  label: string
  order: number
}

const rootVenueType = (index: RegionalMarketMapIndex, venue: RegionalMapVenue) => {
  const venueTypesByID = new Map(index.venueTypes.map((venueType) => [venueType.id, venueType]))
  const roots = venue.venueTypeIDs.flatMap((id) => {
    let current = venueTypesByID.get(id)
    const visited = new Set<string>()
    while (current?.parentID && !visited.has(current.id)) {
      visited.add(current.id)
      current = venueTypesByID.get(current.parentID) || current
      if (!current.parentID) break
    }
    return current || []
  })
  return roots.sort(
    (left, right) =>
      left.displayOrder - right.displayOrder || left.title.localeCompare(right.title),
  )[0]
}

export const venueGroupsForHubs = (
  index: RegionalMarketMapIndex,
  selectedHubs: RegionalMapHub[],
): VenueGroup[] => {
  if (!selectedHubs.length) return []
  const selectedHubIDs = new Set(selectedHubs.map(({ id }) => id))
  const groups = new Map<string, VenueGroup>()

  for (const venue of index.venues) {
    const matches = venue.connections.filter(({ hubID }) => selectedHubIDs.has(hubID))
    if (!matches.length) continue
    const root = rootVenueType(index, venue)
    const groupID = root?.id || 'other'
    const group = groups.get(groupID) || {
      common: [],
      hubSpecific: selectedHubs.map((hub) => ({ hub, venues: [] })),
      id: groupID,
      label: root?.label || root?.title || 'Other venues',
      order: root?.displayOrder ?? Number.MAX_SAFE_INTEGER,
    }
    const connectedHubIDs = new Set(matches.map(({ hubID }) => hubID))
    const itemFor = (hubID?: string): SelectedVenue => ({
      types: [
        ...new Set(
          matches
            .filter((connection) => !hubID || connection.hubID === hubID)
            .map(({ type }) => type),
        ),
      ],
      venue,
    })

    if (connectedHubIDs.size === selectedHubs.length) {
      group.common.push(itemFor())
    } else {
      for (const entry of group.hubSpecific) {
        if (connectedHubIDs.has(entry.hub.id)) entry.venues.push(itemFor(entry.hub.id))
      }
    }
    groups.set(groupID, group)
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      common: group.common.sort((left, right) => left.venue.title.localeCompare(right.venue.title)),
      hubSpecific: group.hubSpecific
        .map((entry) => ({
          ...entry,
          venues: entry.venues.sort((left, right) =>
            left.venue.title.localeCompare(right.venue.title),
          ),
        }))
        .filter(({ venues }) => venues.length > 0),
    }))
    .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label))
}

const summaryText = (
  summary: MarketMapDataResponse['summaries'][string] | undefined,
  volumeLabel: string,
): string => {
  if (!summary || summary.value === null) return ''
  const value = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(summary.value)
  const change =
    summary.changePercent === null
      ? ''
      : ` (${summary.changePercent >= 0 ? '+' : ''}${summary.changePercent.toFixed(1)}%${summary.changeLabel ? ` ${summary.changeLabel}` : ''})`
  return `${summary.label}: ${value}${volumeLabel ? ` ${volumeLabel}` : ''}${change}`
}

const venueConnectionLabel = (types: Array<'a' | 'b' | 'd'>): string => {
  const capabilities = new Set(
    types.flatMap((type) =>
      type === 'b' ? (['Joule', 'autoTRADER'] as const) : [connectionLabel(type)],
    ),
  )
  return ['Joule', 'autoTRADER'].filter((capability) => capabilities.has(capability)).join(' and ')
}

const worldX = (longitude: number) => ((longitude + 180) / 360) * 1000
const worldY = (latitude: number) => ((90 - latitude) / 180) * 562

export interface DynamicRegionalMarketMapProps {
  fallbackBackground?: ReactNode
  model: RegionalMarketMapPresentationModel
  runtime: ConnectionsMapRuntimeConfig | null
  style?: CSSProperties
}

export function DynamicRegionalMarketMap({
  fallbackBackground,
  model,
  runtime,
  style,
}: DynamicRegionalMarketMapProps) {
  const instanceID = useId()
  const islandRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [active, setActive] = useState(false)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const initialAssetClassID =
    model.index.assetClasses.find(({ id }) => id === model.defaultAssetClassID)?.id ||
    model.index.assetClasses[0]?.id ||
    ''
  const initialRegionID = model.index.regions.length === 1 ? model.index.regions[0]?.id || '' : ''
  const [assetClassID, setAssetClassID] = useState(initialAssetClassID)
  const [regionID, setRegionID] = useState(initialRegionID)
  const [selectedHubIDs, setSelectedHubIDs] = useState<string[]>([])
  const [interval, setIntervalValue] = useState<MarketMapDataResponse['interval']>('quarter')
  const [period, setPeriod] = useState('')
  const [marketData, setMarketData] = useState(() => emptyMarketData('quarter'))
  const visibleHubs = useMemo(
    () => visibleHubsFor(model.index, assetClassID, regionID),
    [assetClassID, model.index, regionID],
  )
  const visibleHubIDs = useMemo(() => visibleHubs.map(({ id }) => id), [visibleHubs])
  const selectableHubIDs = useMemo(
    () =>
      new Set(
        model.index.hubs
          .filter(({ assetClassIDs }) => assetClassIDs.includes(assetClassID))
          .map(({ id }) => id),
      ),
    [assetClassID, model.index.hubs],
  )
  const effectiveSelectedHubIDs = useMemo(
    () => selectedHubIDs.filter((id) => selectableHubIDs.has(id)),
    [selectableHubIDs, selectedHubIDs],
  )
  const selectedHubs = useMemo(
    () => model.index.hubs.filter(({ id }) => effectiveSelectedHubIDs.includes(id)),
    [effectiveSelectedHubIDs, model.index.hubs],
  )
  const selectedVenueGroups = useMemo(
    () => venueGroupsForHubs(model.index, selectedHubs),
    [model.index, selectedHubs],
  )
  const visibleCountryGroups = useMemo(() => {
    const groups = new Map<string, RegionalMapHub[]>()
    for (const hub of visibleHubs) {
      if (hub.hubType === 'ohub') continue
      for (const code of hub.countryCodes) {
        groups.set(code, [...(groups.get(code) || []), hub])
      }
    }
    return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right))
  }, [visibleHubs])
  const selectedAssetClass = model.index.assetClasses.find(({ id }) => id === assetClassID)
  const marketDataEnabled = Boolean(model.showMarketData && selectedAssetClass?.marketDataKey)
  const marketDataMatchesSelection = Boolean(
    marketDataEnabled &&
    marketData.assetClassKey === selectedAssetClass?.marketDataKey &&
    marketData.interval === interval &&
    (!period || marketData.period === period),
  )
  const displayedMarketData = marketDataMatchesSelection ? marketData : emptyMarketData(interval)
  const marketDataLoading = marketDataEnabled && !marketDataMatchesSelection

  const handleError = useCallback(() => {
    setFailed(true)
    setReady(false)
  }, [])
  const handleReady = useCallback(() => setReady(true), [])
  const selectHubs = useCallback(
    (hubIDs: string[]) => {
      setSelectedHubIDs(hubIDs)
      if (model.showSidebar) {
        window.requestAnimationFrame(() => closeButtonRef.current?.focus())
      }
    },
    [model.showSidebar],
  )
  const selectHub = useCallback((hubID: string) => selectHubs([hubID]), [selectHubs])
  const selectCountry = useCallback(
    (countryCode: string) => {
      const matches = visibleHubs.filter(
        ({ countryCodes, hubType }) => hubType !== 'ohub' && countryCodes.includes(countryCode),
      )
      if (matches.length) selectHubs(matches.map(({ id }) => id))
    },
    [selectHubs, visibleHubs],
  )
  const selectRegion = useCallback((selectedRegionID: string) => {
    setRegionID(selectedRegionID)
    setSelectedHubIDs([])
  }, [])

  useEffect(() => {
    const island = islandRef.current
    if (!island) return
    if (!('IntersectionObserver' in window)) {
      const frame = requestAnimationFrame(() => setActive(true))
      return () => cancelAnimationFrame(frame)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some(({ isIntersecting }) => isIntersecting)) return
        setActive(true)
        observer.disconnect()
      },
      { rootMargin: '350px 0px' },
    )
    observer.observe(island)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!marketDataEnabled || !selectedAssetClass?.marketDataKey) return

    const controller = new AbortController()
    const query = new URLSearchParams({
      assetClassKey: selectedAssetClass.marketDataKey,
      interval,
    })
    if (period) query.set('period', period)
    fetch(`/api/market-map-data/?${query}`, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Market map data returned ${response.status}.`)
        return (await response.json()) as MarketMapDataResponse
      })
      .then((result) => {
        setMarketData(result)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        reportClientError(
          error instanceof Error ? error : new Error(String(error)),
          'frontend-route',
        )
        setMarketData({
          ...emptyMarketData(interval),
          assetClassKey: selectedAssetClass.marketDataKey || '',
          period,
          status: 'unavailable',
        })
      })

    return () => controller.abort()
  }, [interval, marketDataEnabled, period, selectedAssetClass?.marketDataKey])

  return (
    <section aria-labelledby={`${instanceID}-title`} className="grid gap-4">
      <div className="flex flex-wrap items-end gap-3 rounded-panel border border-border bg-muted/35 p-3">
        {model.index.regions.length > 1 ? (
          <div className="min-w-52 flex-1">
            <Label htmlFor={`${instanceID}-region`}>Region</Label>
            <Select
              onValueChange={(value) => {
                setRegionID(value === 'all' ? '' : value)
                setSelectedHubIDs([])
              }}
              value={regionID || 'all'}
            >
              <SelectTrigger id={`${instanceID}-region`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {model.index.regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : model.index.regions[0] ? (
          <div className="min-w-52 flex-1">
            <span className="text-sm font-medium">Region</span>
            <p className="mt-2 flex min-h-control items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
              {model.index.regions[0].title}
            </p>
          </div>
        ) : null}
        {model.showAssetClassFilter && model.index.assetClasses.length > 1 ? (
          <div className="min-w-52 flex-1">
            <Label htmlFor={`${instanceID}-asset-class`}>Asset class</Label>
            <Select
              onValueChange={(value) => {
                setAssetClassID(value)
                setSelectedHubIDs([])
                setPeriod('')
              }}
              value={assetClassID}
            >
              <SelectTrigger id={`${instanceID}-asset-class`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {model.index.assetClasses.map((assetClass) => (
                  <SelectItem key={assetClass.id} value={assetClass.id}>
                    {assetClass.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        {model.showMarketData ? (
          <>
            <div className="min-w-36">
              <Label htmlFor={`${instanceID}-interval`}>Data interval</Label>
              <Select
                onValueChange={(value: MarketMapDataResponse['interval']) => {
                  setIntervalValue(value)
                  setPeriod('')
                }}
                value={interval}
              >
                <SelectTrigger id={`${instanceID}-interval`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Year to date</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-40">
              <Label htmlFor={`${instanceID}-period`}>Period</Label>
              <Select
                disabled={marketDataLoading || !displayedMarketData.periods.length}
                onValueChange={setPeriod}
                value={period || displayedMarketData.period || ''}
              >
                <SelectTrigger id={`${instanceID}-period`}>
                  <SelectValue placeholder={marketDataLoading ? 'Loading…' : 'Latest'} />
                </SelectTrigger>
                <SelectContent>
                  {displayedMarketData.periods.map((item) => (
                    <SelectItem key={item.key} value={item.key}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : null}
      </div>

      <div
        className="relative isolate min-h-80 overflow-hidden rounded-panel bg-trayport-deep shadow-sm"
        data-map-error={String(failed)}
        data-map-provider={runtime?.provider || 'fallback'}
        data-map-ready={String(ready)}
        ref={islandRef}
        style={style}
      >
        <h3 className="sr-only" id={`${instanceID}-title`}>
          {model.title}
        </h3>
        {fallbackBackground ? (
          <div aria-hidden className="trayport-coverage-map__media">
            {fallbackBackground}
          </div>
        ) : null}
        <svg
          aria-hidden
          className={cn(
            'trayport-coverage-map__surface',
            'pointer-events-none absolute inset-0 size-full transition-opacity duration-300',
            ready && 'opacity-0',
          )}
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1000 562"
        >
          <defs>
            <radialGradient id={`${instanceID}-map-gradient`}>
              <stop offset="0" stopColor={model.mapStyle === 'dark' ? '#174975' : '#dff3ff'} />
              <stop offset="1" stopColor={model.mapStyle === 'dark' ? '#001f3f' : '#eef8fc'} />
            </radialGradient>
          </defs>
          <rect
            fill={fallbackBackground ? 'transparent' : `url(#${instanceID}-map-gradient)`}
            height="562"
            width="1000"
          />
          {model.showLines
            ? model.index.connections.flatMap((connection) => {
                if (
                  !visibleHubIDs.includes(connection.sourceHubID) &&
                  !visibleHubIDs.includes(connection.targetHubID)
                ) {
                  return []
                }
                const sourcePoint = model.index.hubs.find(({ id }) => id === connection.sourceHubID)
                  ?.points[0]
                const targetPoint = model.index.hubs.find(({ id }) => id === connection.targetHubID)
                  ?.points[0]
                if (!sourcePoint || !targetPoint) return []
                return [
                  <line
                    key={connection.id}
                    stroke={model.lineColor}
                    strokeLinecap="round"
                    strokeOpacity={model.lineOpacity}
                    strokeWidth={model.lineWidth}
                    x1={worldX(sourcePoint.location[0])}
                    x2={worldX(targetPoint.location[0])}
                    y1={worldY(sourcePoint.location[1])}
                    y2={worldY(targetPoint.location[1])}
                  />,
                ]
              })
            : null}
          {visibleHubs.flatMap((hub) =>
            hub.points.map((point) => (
              <circle
                cx={worldX(point.location[0])}
                cy={worldY(point.location[1])}
                fill={
                  model.index.assetClasses.find(({ id }) => hub.assetClassIDs.includes(id))
                    ?.color || '#00c1d5'
                }
                key={point.id}
                r={model.markerRadius}
                stroke="#fff"
                strokeWidth="1"
              />
            )),
          )}
        </svg>
        {active && runtime && !failed ? (
          <RegionalMapErrorBoundary onError={handleError}>
            <RegionalMarketMapRuntime
              activeAssetClassID={assetClassID}
              activeRegionID={regionID}
              dataDisplay={model.dataDisplay}
              index={model.index}
              lineColor={model.lineColor}
              lineOpacity={model.lineOpacity}
              lineWidth={model.lineWidth}
              markerRadius={model.markerRadius}
              onCountrySelect={selectCountry}
              onError={handleError}
              onHubSelect={selectHub}
              onRegionSelect={selectRegion}
              onReady={handleReady}
              runtime={runtime}
              selectedHubIDs={effectiveSelectedHubIDs}
              showSidebar={model.showSidebar}
              showLines={model.showLines}
              summaries={displayedMarketData.summaries}
              visibleHubIDs={visibleHubIDs}
              zoomTo={model.zoomTo}
            />
          </RegionalMapErrorBoundary>
        ) : null}

        {selectedHubs.length && model.showSidebar ? (
          <aside
            aria-label={`${selectedHubs.map(({ title }) => title).join(', ')} connectivity`}
            className="absolute inset-x-2 bottom-2 z-4 max-h-[70%] overflow-auto rounded-panel bg-white p-4 text-trayport-deep shadow-xl sm:inset-y-2 sm:right-2 sm:left-auto sm:w-80"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="trayport-eyebrow">
                  {selectedHubs.length === 1 ? 'Market hub' : 'Market hubs'}
                </p>
                <h4 className="text-lg font-bold">
                  {selectedHubs.length === 1
                    ? selectedHubs[0]?.title
                    : `${selectedHubs.length} connected hubs`}
                </h4>
              </div>
              <Button
                aria-label="Close hub details"
                onClick={() => setSelectedHubIDs([])}
                ref={closeButtonRef}
                size="sm"
                variant="outline"
              >
                Close
              </Button>
            </div>
            <ul className="mt-3 grid gap-2">
              {selectedHubs.map((hub) => {
                const summary = hub.marketDataKey
                  ? displayedMarketData.summaries[hub.marketDataKey]
                  : undefined
                const marketText = summaryText(summary, selectedAssetClass?.volumeLabel || '')
                return (
                  <li className="rounded-md bg-trayport-soft p-3" key={hub.id}>
                    {hub.destination ? (
                      <AppLink
                        className="text-trayport-mid font-semibold underline underline-offset-4"
                        link={{ type: 'custom', url: hub.destination }}
                      >
                        {hub.title}
                      </AppLink>
                    ) : (
                      <strong>{hub.title}</strong>
                    )}
                    {model.showMarketData && marketText ? (
                      <p className="mt-1 text-sm" data-market-map-summary>
                        {marketText}
                      </p>
                    ) : null}
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 grid gap-3">
              <h5 className="font-semibold">Connected venues</h5>
              {selectedVenueGroups.length ? (
                selectedVenueGroups.map((group) => (
                  <section className="rounded-md border border-border p-3" key={group.id}>
                    <h6 className="font-semibold">{group.label}</h6>
                    {group.common.length ? (
                      <ul className="mt-2 grid gap-2">
                        {group.common.map(({ types, venue }) => (
                          <li key={venue.id}>
                            {venue.destination ? (
                              <AppLink
                                className="font-semibold underline underline-offset-4"
                                link={{ type: 'custom', url: venue.destination }}
                              >
                                {venue.title}
                              </AppLink>
                            ) : (
                              <strong>{venue.title}</strong>
                            )}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {venueConnectionLabel(types)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {group.hubSpecific.map(({ hub, venues }) => (
                      <div className="mt-3" key={hub.id}>
                        <p className="text-sm font-semibold">{hub.title}</p>
                        <ul className="mt-1 grid gap-2">
                          {venues.map(({ types, venue }) => (
                            <li key={venue.id}>
                              {venue.destination ? (
                                <AppLink
                                  className="font-semibold underline underline-offset-4"
                                  link={{ type: 'custom', url: venue.destination }}
                                >
                                  {venue.title}
                                </AppLink>
                              ) : (
                                <strong>{venue.title}</strong>
                              )}
                              <span className="ml-2 text-xs text-muted-foreground">
                                {venueConnectionLabel(types)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </section>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No connected venues.</p>
              )}
            </div>
          </aside>
        ) : null}
      </div>

      <p aria-live="polite" className="text-sm text-muted-foreground">
        Showing {visibleHubs.length} {visibleHubs.length === 1 ? 'hub' : 'hubs'} for{' '}
        {selectedAssetClass?.title || 'the selected asset class'}
        {regionID
          ? ` in ${model.index.regions.find(({ id }) => id === regionID)?.title || 'the selected region'}`
          : ' across all regions'}
        .
      </p>

      <details className="rounded-panel border border-border bg-white p-4 text-foreground">
        <summary className="min-h-control cursor-pointer font-semibold focus-visible:focus-ring">
          Accessible market-hub and venue list
        </summary>
        {model.showSidebar && visibleCountryGroups.some(([, hubs]) => hubs.length > 1) ? (
          <div className="mt-3 rounded-md bg-muted/45 p-3">
            <p className="text-sm font-semibold">Countries with multiple market hubs</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {visibleCountryGroups
                .filter(([, hubs]) => hubs.length > 1)
                .map(([countryCode, hubs]) => (
                  <Button
                    key={countryCode}
                    onClick={() => selectCountry(countryCode)}
                    size="sm"
                    variant="outline"
                  >
                    {countryCode}: {hubs.length} hubs
                  </Button>
                ))}
            </div>
          </div>
        ) : null}
        {visibleHubs.length === 0 ? (
          <p className="mt-3 text-sm">
            No market hubs match the current selection. Choose another asset class or region.
          </p>
        ) : null}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleHubs.map((hub) => {
            const venues = venuesForHub(model.index, hub.id)
            const summary = hub.marketDataKey
              ? displayedMarketData.summaries[hub.marketDataKey]
              : undefined
            const marketText = summaryText(summary, selectedAssetClass?.volumeLabel || '')
            return (
              <article className="rounded-md border border-border p-3" key={hub.id}>
                <h4 className="font-semibold">
                  {hub.destination ? (
                    <AppLink
                      className="underline underline-offset-4"
                      link={{ type: 'custom', url: hub.destination }}
                    >
                      {hub.title}
                    </AppLink>
                  ) : (
                    hub.title
                  )}
                </h4>
                {model.showMarketData && marketText ? (
                  <p className="mt-1 text-sm">{marketText}</p>
                ) : null}
                <details className="mt-2">
                  <summary className="min-h-control cursor-pointer text-sm text-muted-foreground focus-visible:focus-ring">
                    {venues.length} connected {venues.length === 1 ? 'venue' : 'venues'}
                  </summary>
                  {venues.length ? (
                    <ul className="mt-2 grid gap-1 text-sm">
                      {venues.map(({ type, venue }) => (
                        <li key={venue.id}>
                          {venue.destination ? (
                            <AppLink
                              className="font-semibold underline underline-offset-4"
                              link={{ type: 'custom', url: venue.destination }}
                            >
                              {venue.title}
                            </AppLink>
                          ) : (
                            <strong>{venue.title}</strong>
                          )}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {connectionLabel(type)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </details>
                {model.showSidebar ? (
                  <Button
                    className="mt-2"
                    onClick={() => selectHub(hub.id)}
                    size="sm"
                    variant="outline"
                  >
                    Show connections
                  </Button>
                ) : null}
              </article>
            )
          })}
        </div>
      </details>
    </section>
  )
}
