'use client'

import { useId, useMemo, useState, type ReactNode } from 'react'

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
import { cn } from '@/utilities/ui'

import type { MarketMatrixPresentationModel, MarketMatrixView } from './marketMatrixModel'

const viewLabels: Record<MarketMatrixView, string> = {
  autoTrader: 'autoTRADER',
  combined: 'Joule and autoTRADER',
  joule: 'Joule',
}

const connectionVisible = (
  connection: MarketMatrixConnectionType | undefined,
  view: MarketMatrixView,
): boolean => {
  if (!connection) return false
  if (view === 'combined') return true
  if (view === 'joule') return connection === 'd' || connection === 'b'
  return connection === 'a' || connection === 'b'
}

const connectionLabel = (
  connection: MarketMatrixConnectionType,
  view: MarketMatrixView,
): string => {
  if (view === 'joule') return 'Joule connection'
  if (view === 'autoTrader') return 'autoTRADER connection'
  if (connection === 'd') return 'Joule connection'
  if (connection === 'a') return 'autoTRADER connection'
  return 'Joule and autoTRADER connection'
}

const connectionTone = (connection: MarketMatrixConnectionType, view: MarketMatrixView): string => {
  if (view === 'joule' || connection === 'd') return 'bg-matrix-joule text-trayport-deep'
  if (view === 'autoTrader' || connection === 'a') {
    return 'bg-matrix-auto-trader text-trayport-deep'
  }
  return 'bg-matrix-combined text-trayport-deep'
}

export const marketMatrixCSVCell = (value: string): string => {
  const safeValue = /^\s*[=+\-@]/u.test(value) ? `'${value}` : value
  return `"${safeValue.replaceAll('"', '""')}"`
}

const updateSelection = (selection: Set<string>, id: string, checked: boolean): Set<string> => {
  const next = new Set(selection)
  if (checked) next.add(id)
  else next.delete(id)
  return next
}

const MatrixLink = ({ destination, title }: { destination: string | null; title: string }) =>
  destination ? (
    <AppLink
      className="font-semibold text-inherit underline decoration-current/30 underline-offset-4 hover:decoration-current"
      link={{ newTab: false, type: 'custom', url: destination }}
    >
      {title}
    </AppLink>
  ) : (
    title
  )

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
  const visibleGroups = useMemo(
    () => model.groups.filter(({ id }) => selectedAssetClasses.has(id)),
    [model.groups, selectedAssetClasses],
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
              visibleHubIDs.has(hubID) && connectionVisible(connection, view),
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
  const columnCount = Math.max(visibleHubs.length + 1, 1)

  const download = () => {
    const header = ['Venue type', 'Venue', ...visibleHubs.map(({ title }) => title)]
    const rows = visibleVenues.map((venue) => [
      venue.venueType.title,
      venue.title,
      ...visibleHubs.map(({ id }) => {
        const connection = venue.connections[id]
        return connection && connectionVisible(connection, view)
          ? connectionLabel(connection, view).replace(' connection', '')
          : ''
      }),
    ])
    const csv = [header, ...rows].map((row) => row.map(marketMatrixCSVCell).join(',')).join('\r\n')
    const href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.download = 'trayport-market-matrix.csv'
    anchor.href = href
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(href), 0)
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
          <Button disabled={!visibleVenues.length || !visibleHubs.length} onClick={download}>
            {downloadIcon}
            Download CSV
          </Button>
        ) : null}
      </div>

      {model.showFilters && (model.assetClasses.length > 1 || model.venueTypes.length > 1) ? (
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
          </div>
        </details>
      ) : null}

      <div
        className="flex flex-wrap gap-x-5 gap-y-2 text-sm"
        aria-label={`${viewLabels[view]} key`}
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
              return (
                <tbody aria-labelledby={venueTypeID} key={group.id}>
                  <tr>
                    <th
                      className="border-b border-border bg-muted px-4 py-2 text-left font-semibold text-trayport-deep"
                      colSpan={columnCount}
                      id={venueTypeID}
                      scope="rowgroup"
                    >
                      {group.title} ({group.venues.length})
                    </th>
                  </tr>
                  {group.venues.map((venue) => (
                    <tr className="group/row" key={venue.id}>
                      <th
                        className="sticky left-0 z-10 border-r border-b border-border bg-background px-4 py-3 text-left font-medium group-hover/row:bg-trayport-soft"
                        scope="row"
                      >
                        <MatrixLink destination={venue.destination} title={venue.title} />
                      </th>
                      {visibleHubOccurrences.map(({ groupID, hub }) => {
                        const connection = venue.connections[hub.id]
                        const connected = connectionVisible(connection, view)
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
                                  {connectionLabel(connection, view)} to {hub.title}
                                </span>
                              </span>
                            ) : null}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
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
