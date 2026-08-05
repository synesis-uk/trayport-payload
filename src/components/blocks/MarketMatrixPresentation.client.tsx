'use client'

import { Fragment, useId, useMemo, useState, type ReactNode } from 'react'

import { AppLink } from '@/components/site/AppLink'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MarketMatrixConnectionType } from '@/data/marketMatrix'
import { reportClientError } from '@/utilities/reportClientError'
import { cn } from '@/utilities/ui'

import {
  downloadMarketMatrixCSV,
  downloadMarketMatrixXLSX,
  marketMatrixConnectionLabel,
  marketMatrixConnectionVisible,
  type MarketMatrixExportData,
} from './marketMatrixExport'
import type { MarketMatrixPresentationModel, MarketMatrixView } from './marketMatrixModel'

export { marketMatrixCSVCell } from './marketMatrixExport'

const viewLabels: Record<MarketMatrixView, string> = {
  autoTrader: 'autoTRADER',
  combined: 'Joule and autoTRADER',
  joule: 'Joule',
}

const connectionTone = (connection: MarketMatrixConnectionType, view: MarketMatrixView): string => {
  if (view === 'joule' || connection === 'd') return 'bg-matrix-joule text-trayport-deep'
  if (view === 'autoTrader' || connection === 'a') {
    return 'bg-matrix-auto-trader text-trayport-deep'
  }
  return 'bg-matrix-combined text-trayport-deep'
}

const updateSelection = (selection: Set<string>, id: string, checked: boolean): Set<string> => {
  const next = new Set(selection)
  if (checked) next.add(id)
  else next.delete(id)
  return next
}

const hubOccurrenceID = (groupID: string, hubID: string): string => `${groupID}:${hubID}`

const MatrixLink = ({ destination, title }: { destination: string | null; title: string }) => {
  if (!destination) return title

  const external = destination.startsWith('https://')

  return (
    <AppLink
      className="font-semibold text-inherit underline decoration-current/30 underline-offset-4 hover:decoration-current"
      link={{ newTab: external, type: 'custom', url: destination }}
    >
      {title}
      {external ? (
        <>
          {' '}
          <span className="sr-only">(opens in a new tab)</span>
        </>
      ) : null}
    </AppLink>
  )
}

type ExportStatus = 'error' | 'idle' | 'loading' | 'success-csv' | 'success-xlsx'

const exportStatusMessage: Record<Exclude<ExportStatus, 'idle'>, string> = {
  error: "We couldn't create the download. Please try again.",
  loading: 'Preparing the Excel workbook…',
  'success-csv': 'CSV download ready.',
  'success-xlsx': 'Excel download ready.',
}

export interface MarketMatrixPresentationProps {
  downloadIcon: ReactNode
  model: MarketMatrixPresentationModel
}

export function MarketMatrixPresentation({ downloadIcon, model }: MarketMatrixPresentationProps) {
  const instanceID = useId()
  const [view, setView] = useState<MarketMatrixView>(model.defaultView)
  const [selectedAssetClasses, setSelectedAssetClasses] = useState(
    () => new Set(model.assetClasses.map(({ id }) => id)),
  )
  const [selectedVenueTypes, setSelectedVenueTypes] = useState(
    () => new Set(model.venueTypes.map(({ id }) => id)),
  )
  const [selectedHubOccurrences, setSelectedHubOccurrences] = useState(
    () =>
      new Set(
        model.groups.flatMap((group) => group.hubs.map((hub) => hubOccurrenceID(group.id, hub.id))),
      ),
  )
  const [collapsedVenueTypes, setCollapsedVenueTypes] = useState(() => new Set<string>())
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle')

  const visibleGroups = useMemo(
    () =>
      model.groups.flatMap((group) => {
        if (!selectedAssetClasses.has(group.id)) return []
        const hubs = group.hubs.filter((hub) =>
          selectedHubOccurrences.has(hubOccurrenceID(group.id, hub.id)),
        )
        return hubs.length ? [{ ...group, hubs }] : []
      }),
    [model.groups, selectedAssetClasses, selectedHubOccurrences],
  )
  const visibleHubOccurrences = useMemo(
    () => visibleGroups.flatMap((group) => group.hubs.map((hub) => ({ groupID: group.id, hub }))),
    [visibleGroups],
  )
  const visibleHubs = useMemo(
    () => visibleHubOccurrences.map(({ hub }) => hub),
    [visibleHubOccurrences],
  )
  const visibleHubIDs = useMemo(() => new Set(visibleHubs.map(({ id }) => id)), [visibleHubs])
  const visibleVenues = useMemo(
    () =>
      model.venues.filter(
        (venue) =>
          selectedVenueTypes.has(venue.venueType.id) &&
          Object.entries(venue.connections).some(
            ([hubID, connection]) =>
              visibleHubIDs.has(hubID) && marketMatrixConnectionVisible(connection, view),
          ),
      ),
    [model.venues, selectedVenueTypes, view, visibleHubIDs],
  )
  const venuesByType = useMemo(
    () =>
      model.venueTypes.flatMap((venueType) => {
        const venues = visibleVenues.filter(
          ({ venueType: itemType }) => itemType.id === venueType.id,
        )
        return venues.length ? [{ ...venueType, venues }] : []
      }),
    [model.venueTypes, visibleVenues],
  )
  const exportData = useMemo<MarketMatrixExportData>(
    () => ({
      caption: model.caption,
      filters: {
        assetClasses: visibleGroups.map(({ title }) => title),
        hubs: visibleHubOccurrences.map(({ groupID, hub }) => {
          const groupTitle = visibleGroups.find(({ id }) => id === groupID)?.title
          return groupTitle ? `${hub.title} (${groupTitle})` : hub.title
        }),
        venueTypes: model.venueTypes
          .filter(({ id }) => selectedVenueTypes.has(id))
          .map(({ title }) => title),
      },
      groups: visibleGroups.map(({ hubs, id, title }) => ({
        hubs: hubs.map(({ id: hubID, title: hubTitle }) => ({ id: hubID, title: hubTitle })),
        id,
        title,
      })),
      venues: visibleVenues.map(({ connections, id, title, venueType }) => ({
        connections,
        id,
        title,
        venueType,
      })),
      view,
    }),
    [
      model.caption,
      model.venueTypes,
      selectedVenueTypes,
      view,
      visibleGroups,
      visibleHubOccurrences,
      visibleVenues,
    ],
  )
  const columnCount = Math.max(visibleHubs.length + 1, 1)
  const canDownload = Boolean(visibleVenues.length && visibleHubs.length)
  const hasHubFilters = model.groups.reduce((count, group) => count + group.hubs.length, 0) > 1
  const hasFilters = model.assetClasses.length > 1 || model.venueTypes.length > 1 || hasHubFilters

  const downloadCSV = () => {
    try {
      downloadMarketMatrixCSV(exportData)
      setExportStatus('success-csv')
    } catch {
      setExportStatus('error')
      reportClientError(new Error('Market matrix CSV export failed.'), 'frontend-route')
    }
  }

  const downloadXLSX = async () => {
    setExportStatus('loading')
    try {
      await downloadMarketMatrixXLSX(exportData)
      setExportStatus('success-xlsx')
    } catch {
      setExportStatus('error')
      reportClientError(new Error('Market matrix XLSX export failed.'), 'frontend-route')
    }
  }

  return (
    <section aria-label={model.caption} className="grid gap-4" data-market-matrix>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full max-w-xs gap-1.5">
          <Label htmlFor={`${instanceID}-view`}>Connectivity</Label>
          <Select value={view} onValueChange={(value) => setView(value as MarketMatrixView)}>
            <SelectTrigger id={`${instanceID}-view`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="joule">Joule</SelectItem>
              <SelectItem value="autoTrader">autoTRADER</SelectItem>
              <SelectItem value="combined">Joule and autoTRADER</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {model.showDownload ? (
          <div className="flex flex-wrap gap-2">
            <Button disabled={!canDownload || exportStatus === 'loading'} onClick={downloadCSV}>
              {downloadIcon}
              Download CSV
            </Button>
            <Button
              disabled={!canDownload}
              isLoading={exportStatus === 'loading'}
              loadingLabel="Preparing Excel"
              onClick={downloadXLSX}
              variant="secondary"
            >
              Download Excel
            </Button>
          </div>
        ) : null}
      </div>

      {exportStatus !== 'idle' ? (
        <p
          aria-live={exportStatus === 'error' ? 'assertive' : 'polite'}
          className={cn(
            'text-sm',
            exportStatus === 'error' ? 'text-destructive' : 'text-muted-foreground',
          )}
          role={exportStatus === 'error' ? 'alert' : 'status'}
        >
          {exportStatusMessage[exportStatus]}
        </p>
      ) : null}

      {model.showFilters && hasFilters ? (
        <details className="rounded-panel border border-border bg-muted/35 px-4 py-3">
          <summary className="min-h-control cursor-pointer py-2 font-semibold text-trayport-deep focus-visible:focus-ring">
            Filter matrix
          </summary>
          <div className="grid gap-5 pt-3 lg:grid-cols-2">
            {model.assetClasses.length > 1 ? (
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">Asset classes</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {model.assetClasses.map((assetClass) => {
                    const id = `${instanceID}-asset-${assetClass.id}`
                    return (
                      <div className="flex min-h-control items-center gap-3" key={assetClass.id}>
                        <Checkbox
                          checked={selectedAssetClasses.has(assetClass.id)}
                          id={id}
                          onCheckedChange={(checked) =>
                            setSelectedAssetClasses((current) =>
                              updateSelection(current, assetClass.id, checked === true),
                            )
                          }
                        />
                        <Label htmlFor={id}>{assetClass.title}</Label>
                      </div>
                    )
                  })}
                </div>
              </fieldset>
            ) : null}

            {model.venueTypes.length > 1 ? (
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">Venue types</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {model.venueTypes.map((venueType) => {
                    const id = `${instanceID}-venue-${venueType.id}`
                    return (
                      <div className="flex min-h-control items-center gap-3" key={venueType.id}>
                        <Checkbox
                          checked={selectedVenueTypes.has(venueType.id)}
                          id={id}
                          onCheckedChange={(checked) =>
                            setSelectedVenueTypes((current) =>
                              updateSelection(current, venueType.id, checked === true),
                            )
                          }
                        />
                        <Label htmlFor={id}>{venueType.title}</Label>
                      </div>
                    )
                  })}
                </div>
              </fieldset>
            ) : null}

            {hasHubFilters ? (
              <fieldset className="lg:col-span-2">
                <legend className="mb-3 text-sm font-semibold">Market hubs</legend>
                <div className="grid gap-4 lg:grid-cols-2">
                  {model.groups.map((group) => {
                    const groupID = `${instanceID}-hub-group-${group.id}`
                    const groupEnabled = selectedAssetClasses.has(group.id)
                    return (
                      <div aria-labelledby={groupID} key={group.id} role="group">
                        <p className="mb-2 text-sm font-medium" id={groupID}>
                          {group.title}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {group.hubs.map((hub) => {
                            const occurrenceID = hubOccurrenceID(group.id, hub.id)
                            const id = `${instanceID}-hub-${group.id}-${hub.id}`
                            return (
                              <div
                                className="flex min-h-control items-center gap-3"
                                key={occurrenceID}
                              >
                                <Checkbox
                                  checked={selectedHubOccurrences.has(occurrenceID)}
                                  disabled={!groupEnabled}
                                  id={id}
                                  onCheckedChange={(checked) =>
                                    setSelectedHubOccurrences((current) =>
                                      updateSelection(current, occurrenceID, checked === true),
                                    )
                                  }
                                />
                                <Label className={cn(!groupEnabled && 'opacity-50')} htmlFor={id}>
                                  {hub.title} <span className="sr-only">in {group.title}</span>
                                </Label>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </fieldset>
            ) : null}
          </div>
        </details>
      ) : null}

      <div
        aria-label={`${viewLabels[view]} key`}
        className="flex flex-wrap gap-x-5 gap-y-2 text-sm"
      >
        {(view === 'combined'
          ? [
              ['d', 'Joule'],
              ['a', 'autoTRADER'],
              ['b', 'Joule and autoTRADER'],
            ]
          : [[view === 'joule' ? 'd' : 'a', viewLabels[view]]]
        ).map(([connection, label]) => (
          <span className="inline-flex items-center gap-2" key={connection}>
            <span
              aria-hidden
              className={cn(
                'size-4 rounded-sm border border-trayport-deep/20',
                connectionTone(connection as MarketMatrixConnectionType, view),
              )}
            />
            {label}
          </span>
        ))}
      </div>

      <p aria-live="polite" className="text-sm text-muted-foreground">
        Showing {visibleVenues.length} {visibleVenues.length === 1 ? 'venue' : 'venues'} across{' '}
        {visibleHubs.length} {visibleHubs.length === 1 ? 'market hub' : 'market hubs'}.
      </p>

      {visibleVenues.length && visibleHubs.length ? (
        <div
          aria-label={`${model.caption} table`}
          className="max-h-[80vh] max-w-full overflow-auto rounded-panel border border-border focus-visible:focus-ring"
          role="region"
          tabIndex={0}
        >
          <table className="w-max min-w-full border-separate border-spacing-0 text-sm">
            <caption className="sr-only">{model.caption}</caption>
            <thead>
              <tr>
                <th
                  className="sticky top-0 left-0 z-30 min-w-56 border-r border-b border-border bg-trayport-deep px-4 py-3 text-left text-white"
                  rowSpan={2}
                  scope="col"
                >
                  Venue
                </th>
                {visibleGroups.map((group) => (
                  <th
                    className="sticky top-0 z-20 border-r border-b border-white/25 bg-trayport-deep p-3 text-center text-white"
                    colSpan={group.hubs.length}
                    key={group.id}
                    scope="colgroup"
                  >
                    {group.title}
                  </th>
                ))}
              </tr>
              <tr>
                {visibleGroups.flatMap((group) =>
                  group.hubs.map((hub) => (
                    <th
                      className="sticky top-11 z-10 h-48 min-w-12 border-r border-b border-border bg-trayport-soft p-2 text-center align-bottom text-trayport-deep"
                      key={`${group.id}-${hub.id}`}
                      scope="col"
                    >
                      <span className="inline-block rotate-180 [writing-mode:vertical-rl]">
                        <MatrixLink destination={hub.destination} title={hub.title} />
                      </span>
                    </th>
                  )),
                )}
              </tr>
            </thead>
            {venuesByType.map((group) => {
              const venueTypeID = `${instanceID}-venue-type-${group.id}`
              const venueRowsID = `${venueTypeID}-rows`
              const collapsed = collapsedVenueTypes.has(group.id)

              return (
                <Fragment key={group.id}>
                  <tbody aria-labelledby={venueTypeID}>
                    <tr>
                      <th
                        className="border-b border-border bg-muted p-0 text-left font-semibold text-trayport-deep"
                        colSpan={columnCount}
                        scope="rowgroup"
                      >
                        <button
                          aria-controls={venueRowsID}
                          aria-expanded={!collapsed}
                          className="flex min-h-control w-full items-center justify-between gap-3 px-4 py-2 text-left focus-visible:focus-ring"
                          onClick={() =>
                            setCollapsedVenueTypes((current) =>
                              updateSelection(current, group.id, !collapsed),
                            )
                          }
                          type="button"
                        >
                          <span id={venueTypeID}>
                            {group.title} ({group.venues.length})
                          </span>
                          <span aria-hidden>{collapsed ? '+' : '−'}</span>
                        </button>
                      </th>
                    </tr>
                  </tbody>
                  <tbody aria-labelledby={venueTypeID} id={venueRowsID}>
                    {collapsed
                      ? null
                      : group.venues.map((venue) => (
                          <tr className="group/row" key={venue.id}>
                            <th
                              className="sticky left-0 z-10 border-r border-b border-border bg-background px-4 py-3 text-left font-medium group-hover/row:bg-trayport-soft"
                              scope="row"
                            >
                              <MatrixLink destination={venue.destination} title={venue.title} />
                            </th>
                            {visibleHubOccurrences.map(({ groupID, hub }) => {
                              const connection = venue.connections[hub.id]
                              const connected = marketMatrixConnectionVisible(connection, view)
                              return (
                                <td
                                  className={cn(
                                    'min-w-12 border-r border-b border-border p-0 text-center',
                                    connected && connection && connectionTone(connection, view),
                                  )}
                                  data-connection={connected ? connection : undefined}
                                  data-hub-occurrence={`${groupID}:${hub.id}`}
                                  key={`${groupID}-${hub.id}`}
                                >
                                  {connected && connection ? (
                                    <span className="flex min-h-control items-center justify-center">
                                      <span aria-hidden className="text-base leading-none">
                                        ●
                                      </span>
                                      <span className="sr-only">
                                        {marketMatrixConnectionLabel(connection, view)} connection
                                        to {hub.title}
                                      </span>
                                    </span>
                                  ) : null}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                  </tbody>
                </Fragment>
              )
            })}
          </table>
        </div>
      ) : (
        <p className="rounded-panel border border-border bg-muted/35 p-5" role="status">
          No managed venue connections match the selected matrix filters.
        </p>
      )}
    </section>
  )
}
