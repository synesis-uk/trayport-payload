import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import configPromise from '@payload-config'
import {
  ArrowRight,
  ChartNoAxesCombined,
  Clock3,
  ExternalLink,
  Lightbulb,
  Mail,
  MapPin,
  Phone,
  ScanLine,
  TrendingUp,
} from 'lucide-react'
import { getPayload } from 'payload'

import type { Media as MediaType } from '@/payload-types'
import RichText from '@/components/RichText'
import { ArticleListingClient } from './ArticleListingClient'
import type { ContentLink } from './contentLink'
import { ManagedLink } from './ManagedLink'
import { resolveContentLink } from './contentLink'
import { LearningVideoListingClient } from './LearningVideoListingClient'
import { MarketVolumeChart } from './MarketVolumeChart.client'
import { getMarketVolumeQuarterly } from './marketData'
import { TrayportMedia } from './TrayportMedia'

type UnknownRecord = Record<string, unknown>

const record = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : {}

const array = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const text = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : ''

const richText = (value: unknown, className?: string) => {
  if (!value || typeof value !== 'object') return null
  return (
    <RichText className={className} data={value as DefaultTypedEditorState} enableGutter={false} />
  )
}

const legacyOrManagedLink = (value: UnknownRecord): ContentLink => {
  if (value.link && typeof value.link === 'object') return value.link as ContentLink
  return {
    label: text(value.label || value.linkLabel),
    newTab: Boolean(value.newTab),
    type: 'custom',
    url: text(value.url),
  }
}

const Actions = ({ value }: { value: unknown }) => {
  const actions = array(value)
    .map(record)
    .filter(
      (item) => text(item.label) && resolveContentLink(legacyOrManagedLink(item)).href !== '#',
    )
  if (!actions.length) return null

  return (
    <div className="trayport-actions">
      {actions.map((action, index) => {
        const link = legacyOrManagedLink(action)
        const { isExternal, newTab } = resolveContentLink(link)
        const style = text(action.style) || 'primary'
        return (
          <ManagedLink
            className={`trayport-action trayport-action--${style}`}
            key={`${text(action.label)}-${index}`}
            link={link}
          >
            <span>{text(action.label)}</span>
            {newTab || isExternal ? (
              <ExternalLink aria-hidden size={16} />
            ) : (
              <ArrowRight aria-hidden size={17} />
            )}
          </ManagedLink>
        )
      })}
    </div>
  )
}

const MarketCoverage = async ({ component }: { component: UnknownRecord }) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'hubs',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: 'title',
  })
  const markers = result.docs.flatMap((hub) =>
    (hub.map?.markers || []).map((marker) => ({
      hub: hub.title,
      label: marker.label || hub.title,
      latitude: marker.location.latitude,
      longitude: marker.location.longitude,
    })),
  )
  const regions = array(component.regions)
  const x = (longitude: number) => ((longitude + 180) / 360) * 1000
  const y = (latitude: number) => ((90 - latitude) / 180) * 562
  const regionAnchors = regions
    .map(record)
    .map((region) => {
      const title = text(region.title)
      const normalized = title.toLowerCase()
      const coordinates = normalized.includes('north america')
        ? { latitude: 42, longitude: -101 }
        : normalized.includes('asia')
          ? { latitude: 30, longitude: 113 }
          : normalized.includes('europe')
            ? { latitude: 50, longitude: 10 }
            : null
      return coordinates ? { ...coordinates, title } : null
    })
    .filter(Boolean) as Array<{ latitude: number; longitude: number; title: string }>
  const routeOrigin =
    regionAnchors.find(({ title }) => title.toLowerCase().includes('europe')) || regionAnchors[0]
  const routeColors = ['#00c1d5', '#f7ea48', '#ff6021']
  const displayMarkers = regionAnchors.length
    ? regionAnchors
    : markers.slice(0, 12).map((marker) => ({
        latitude: marker.latitude,
        longitude: marker.longitude,
        title: marker.label,
      }))
  const mapHeight = Math.min(Math.max(Number(component.height) || 300, 100), 600)
  const lineWidth = Math.min(Math.max(Number(component.lineWidth) || 0.5, 0), 1)
  const lineOpacity = Math.min(Math.max(Number(component.lineOpacity) || 0.5, 0), 1)
  const lineColor = text(component.lineColor) || '#009cde'

  return (
    <div className="trayport-market-coverage">
      <div className="trayport-market-coverage__copy">
        <p className="trayport-eyebrow">Market coverage</p>
        <h3>{text(component.title) || 'Explore our connectivity'}</h3>
        {richText(component.body, 'trayport-richtext')}
        <p className="trayport-market-coverage__summary">
          {result.totalDocs} market hubs and {markers.length} imported locations are represented in
          this schematic view.
        </p>
        {regions.length ? (
          <ul className="trayport-market-coverage__regions">
            {regions.map((region, index) => {
              const item = record(region)
              return <li key={index}>{text(item.title) || 'Global market'}</li>
            })}
          </ul>
        ) : null}
        <Actions value={component.actions} />
      </div>

      <figure
        className="trayport-coverage-map"
        data-map-style={text(component.style) || 'dark'}
        style={
          {
            '--trayport-map-height': `${mapHeight}px`,
            '--trayport-map-line-color': lineColor,
            '--trayport-map-line-opacity': lineOpacity,
            '--trayport-map-line-width': Math.max(lineWidth * 8, 1),
          } as React.CSSProperties
        }
      >
        {component.backgroundMedia ? (
          <div aria-hidden className="trayport-coverage-map__media">
            <TrayportMedia
              background
              media={component.backgroundMedia as MediaType}
              showFallbackLink={false}
            />
          </div>
        ) : null}
        <svg
          aria-labelledby="trayport-coverage-map-title trayport-coverage-map-description"
          role="img"
          viewBox="0 0 1000 562"
        >
          <title id="trayport-coverage-map-title">Trayport market connectivity locations</title>
          <desc id="trayport-coverage-map-description">
            Regional connectivity overview for {regionAnchors.map(({ title }) => title).join(', ')}.
          </desc>
          <rect className="trayport-coverage-map__field" height="562" rx="8" width="1000" />
          {component.showLines !== false && routeOrigin
            ? regionAnchors
                .filter((region) => region !== routeOrigin)
                .map((region, index) => {
                  const originX = x(routeOrigin.longitude)
                  const originY = y(routeOrigin.latitude)
                  const targetX = x(region.longitude)
                  const targetY = y(region.latitude)
                  const controlY = Math.min(originY, targetY) - Math.abs(targetX - originX) * 0.2
                  return (
                    <path
                      className="trayport-coverage-map__route"
                      d={`M ${originX} ${originY} Q ${(originX + targetX) / 2} ${controlY} ${targetX} ${targetY}`}
                      key={`${routeOrigin.title}-${region.title}`}
                      style={{
                        stroke:
                          routeColors[index % routeColors.length] === '#00c1d5'
                            ? lineColor
                            : routeColors[index % routeColors.length],
                      }}
                    />
                  )
                })
            : null}
          {displayMarkers.map((marker, index) => (
            <circle
              className="trayport-coverage-map__marker"
              cx={x(marker.longitude)}
              cy={y(marker.latitude)}
              key={`${marker.title}-${index}`}
              r={Math.min(Math.max(Number(component.markerSize) || 5, 3), 9)}
            >
              <title>{marker.title}</title>
            </circle>
          ))}
        </svg>
        <figcaption>
          {regionAnchors.length} connected regions shown from managed content.
        </figcaption>
      </figure>
    </div>
  )
}

const DataChart = async ({ component }: { component: UnknownRecord }) => {
  const assetClassLegacyID = Number(component.assetClassLegacyId)
  const rows = await getMarketVolumeQuarterly(assetClassLegacyID, {
    fromQuarter: Number(component.fromQuarter) || null,
    fromYear: Number(component.fromYear) || null,
    limit: 40,
    toQuarter: Number(component.toQuarter) || null,
    toYear: Number(component.toYear) || null,
  })
  const scale = 10 ** Math.min(Math.max(Number(component.scalePower) || 0, 0), 12)
  const displayRows = rows.map((row) => ({
    ...row,
    exchangeTraded: row.exchangeTraded / scale,
    otcBilateral: row.otcBilateral / scale,
    otcCleared: row.otcCleared / scale,
  }))
  const totals = displayRows.map((row) => row.otcBilateral + row.otcCleared + row.exchangeTraded)
  const precise = new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 2,
  })
  const title = text(component.title)
  const unit = text(component.unit)
  const showDataTable = component.showDataTable !== false

  return (
    <section className="trayport-chart" aria-labelledby={`market-chart-${assetClassLegacyID}`}>
      <div className="trayport-chart__header">
        <div>
          <h3 id={`market-chart-${assetClassLegacyID}`}>{title}</h3>
          {text(component.accessibleSummary) ? (
            <p className="sr-only">{text(component.accessibleSummary)}</p>
          ) : null}
        </div>
      </div>

      {displayRows.length ? (
        <>
          <MarketVolumeChart
            axisLabel={text(component.axisLabel)}
            height={Number(component.height) || 350}
            rows={displayRows}
            showAxes={component.showAxes !== false}
            showLegend={component.showLegend !== false}
            showValues={component.showValues === true}
            title={title}
            unit={unit}
          />
          {showDataTable ? (
            <details className="trayport-chart__data">
              <summary>View chart data</summary>
              <div
                aria-label={`${title} data table`}
                className="trayport-table-wrap"
                role="region"
                tabIndex={0}
              >
                <table className="trayport-table">
                  <thead>
                    <tr>
                      <th scope="col">Quarter</th>
                      <th scope="col">OTC bilateral{unit ? ` (${unit})` : ''}</th>
                      <th scope="col">OTC cleared{unit ? ` (${unit})` : ''}</th>
                      <th scope="col">Exchange traded{unit ? ` (${unit})` : ''}</th>
                      <th scope="col">Total{unit ? ` (${unit})` : ''}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((row, index) => (
                      <tr key={`${row.year}-${row.quarter}`}>
                        <th scope="row">
                          {row.year} Q{row.quarter}
                        </th>
                        <td>{precise.format(row.otcBilateral)}</td>
                        <td>{precise.format(row.otcCleared)}</td>
                        <td>{precise.format(row.exchangeTraded)}</td>
                        <td>{precise.format(totals[index])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ) : null}
        </>
      ) : (
        <p className="trayport-chart__empty">
          No imported market-volume rows are available for this asset class yet.
        </p>
      )}
    </section>
  )
}

const Component = ({ component }: { component: UnknownRecord }) => {
  const type = text(component.blockType)

  switch (type) {
    case 'heading': {
      const level = ['h2', 'h3', 'h4'].includes(text(component.level))
        ? text(component.level)
        : 'h2'
      const Heading = level as 'h2' | 'h3' | 'h4'
      return (
        <div className="trayport-heading">
          {text(component.eyebrow) ? (
            <p className="trayport-eyebrow">{text(component.eyebrow)}</p>
          ) : null}
          <Heading>{text(component.text)}</Heading>
        </div>
      )
    }
    case 'richText':
      return richText(
        component.body,
        text(component.size) === 'large'
          ? 'trayport-richtext trayport-richtext--lead'
          : 'trayport-richtext',
      )
    case 'actions':
      return <Actions value={component.actions} />
    case 'media':
      return (
        <figure className={`trayport-media trayport-media--${text(component.aspect) || 'natural'}`}>
          <TrayportMedia
            externalURL={text(component.externalURL)}
            media={component.media as MediaType}
          />
          {text(component.caption) ? <figcaption>{text(component.caption)}</figcaption> : null}
        </figure>
      )
    case 'featureList': {
      const items = array(component.items).map(record)
      if (!items.length) return null
      return (
        <div className={`trayport-features trayport-features--${text(component.layout) || 'grid'}`}>
          {items.map((item, index) => {
            const icon = text(item.icon)
            const Icon =
              icon === 'lightbulb'
                ? Lightbulb
                : icon === 'trend'
                  ? TrendingUp
                  : icon === 'clock'
                    ? Clock3
                    : icon === 'chart'
                      ? ChartNoAxesCombined
                      : icon === 'scan'
                        ? ScanLine
                        : null
            const link = legacyOrManagedLink(item)
            const hasLink = resolveContentLink(link).href !== '#'
            return (
              <article className="trayport-feature" key={`${text(item.title)}-${index}`}>
                {item.media ? (
                  <TrayportMedia
                    className="trayport-feature__media"
                    media={item.media as MediaType}
                  />
                ) : null}
                <div className="trayport-feature__body">
                  {Icon ? (
                    <span className="trayport-feature__icon">
                      <Icon aria-hidden size={22} />
                    </span>
                  ) : null}
                  {text(item.title) ? <h3>{text(item.title)}</h3> : null}
                  {richText(item.body, 'trayport-richtext')}
                  {hasLink ? (
                    <ManagedLink className="trayport-inline-link" link={link}>
                      {link.label || 'Learn more'} <ArrowRight aria-hidden size={16} />
                    </ManagedLink>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )
    }
    case 'statistics': {
      const items = array(component.items).map(record)
      return (
        <dl className="trayport-statistics">
          {items.map((item, index) => (
            <div key={`${text(item.label)}-${index}`}>
              <dt>{text(item.label)}</dt>
              <dd>
                <span>{text(item.value)}</span>
                {text(item.description) ? (
                  <span className="trayport-statistics__description">{text(item.description)}</span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      )
    }
    case 'faq': {
      const items = array(component.items).map(record)
      return (
        <div className="trayport-faq">
          {items.map((item, index) => (
            <details key={`${text(item.question)}-${index}`}>
              <summary>{text(item.question)}</summary>
              <div
                className={
                  item.media
                    ? 'trayport-faq__answer trayport-faq__answer--media'
                    : 'trayport-faq__answer'
                }
              >
                {richText(item.answer, 'trayport-richtext')}
                {item.media ? (
                  <TrayportMedia media={item.media as MediaType} showFallbackLink={false} />
                ) : null}
              </div>
            </details>
          ))}
        </div>
      )
    }
    case 'entityList': {
      const items = array(component.items).map(record)
      return (
        <div
          className={`trayport-entities trayport-entities--${text(component.kind) || 'general'}`}
        >
          {items.map((item, index) => {
            const link = legacyOrManagedLink(item)
            const hasLink = resolveContentLink(link).href !== '#'
            const body = (
              <>
                {item.media ? (
                  <TrayportMedia
                    className="trayport-entity__media"
                    media={item.media as MediaType}
                    showFallbackLink={!hasLink}
                  />
                ) : null}
                <h3>{text(item.title)}</h3>
                {richText(item.description, 'trayport-richtext')}
                {hasLink ? <ArrowRight aria-hidden size={17} /> : null}
              </>
            )
            return hasLink ? (
              <ManagedLink
                className="trayport-entity"
                key={`${text(item.title)}-${index}`}
                link={link}
              >
                {body}
              </ManagedLink>
            ) : (
              <article className="trayport-entity" key={`${text(item.title)}-${index}`}>
                {body}
              </article>
            )
          })}
        </div>
      )
    }
    case 'timeline': {
      const items = array(component.items).map(record)
      return (
        <ol className="trayport-timeline">
          {items.map((item, index) => (
            <li key={`${text(item.label)}-${index}`}>
              <span>{text(item.label)}</span>
              <h3>{text(item.title)}</h3>
              {richText(item.body, 'trayport-richtext')}
            </li>
          ))}
        </ol>
      )
    }
    case 'dataTable': {
      const headers = array(component.headers).map(record)
      const rows = array(component.rows).map(record)
      return (
        <div
          aria-label={text(component.caption) || 'Data table'}
          className="trayport-table-wrap"
          role="region"
          tabIndex={0}
        >
          <table className="trayport-table">
            {text(component.caption) ? <caption>{text(component.caption)}</caption> : null}
            {headers.length ? (
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} scope="col">
                      {text(header.text)}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {array(row.cells)
                    .map(record)
                    .map((cell, cellIndex) => (
                      <td key={cellIndex}>{text(cell.text)}</td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    case 'gallery': {
      const items = array(component.items).map(record)
      return (
        <div className="trayport-gallery">
          {items.map((item, index) => (
            <figure key={index}>
              <TrayportMedia media={item.media as MediaType} />
              {text(item.caption) ? <figcaption>{text(item.caption)}</figcaption> : null}
            </figure>
          ))}
        </div>
      )
    }
    case 'divider':
      return text(component.style) === 'space' ? (
        <div aria-hidden className="trayport-spacer" />
      ) : (
        <hr className="trayport-divider" />
      )
    case 'marketCoverage': {
      return <MarketCoverage component={component} />
    }
    case 'embed':
      return (
        <a className="trayport-embed" href={text(component.url)}>
          <span>{text(component.title) || 'View media'}</span>
          <ArrowRight aria-hidden size={18} />
        </a>
      )
    case 'dataChart':
      return <DataChart component={component} />
    case 'office': {
      const office = record(component.office)
      if (!text(office.legalName || office.title)) return null
      const prefix = text(office.addressPrefix)
      const address = text(office.address)
      const mapURL =
        office.coordinates && typeof office.coordinates === 'object'
          ? `https://www.openstreetmap.org/?mlat=${text(record(office.coordinates).latitude)}&mlon=${text(record(office.coordinates).longitude)}`
          : ''
      return (
        <article
          className={`trayport-office trayport-office--${text(component.appearance) || 'standard'}`}
        >
          <p className="trayport-eyebrow">{text(office.title)}</p>
          <h3>{text(office.legalName || office.title)}</h3>
          <address>
            {prefix ? <span>{prefix}</span> : null}
            <span>{address}</span>
          </address>
          <div className="trayport-office__contacts">
            {text(office.phone) ? (
              <a href={`tel:${text(office.phone).replace(/[^+\d]/g, '')}`}>
                <Phone aria-hidden size={16} />
                {text(office.phone)}
              </a>
            ) : null}
            {text(office.email) ? (
              <a href={`mailto:${text(office.email)}`}>
                <Mail aria-hidden size={16} />
                {text(office.email)}
              </a>
            ) : null}
            {mapURL ? (
              <a href={mapURL} rel="noopener noreferrer" target="_blank">
                <MapPin aria-hidden size={16} />
                View map
              </a>
            ) : null}
          </div>
        </article>
      )
    }
    default:
      return null
  }
}

const ContentSection = ({ block }: { block: UnknownRecord }) => {
  const columns = array(block.columns).map(record)
  return (
    <section
      className={`trayport-section trayport-section--${text(block.theme) || 'light'} trayport-section--${text(block.spacing) || 'regular'} trayport-section--wrapper-${text(block.wrapperTheme) || 'none'} trayport-section--appearance-${text(block.appearance) || 'default'}`}
      id={text(block.anchor) || undefined}
    >
      <div className={`trayport-container trayport-container--${text(block.width) || 'wide'}`}>
        <div className="trayport-section__surface">
          {block.backgroundMedia ? (
            <div
              aria-hidden
              className="trayport-section__background"
              data-opacity={text(block.backgroundOpacity) || 'none'}
            >
              <TrayportMedia
                background
                media={block.backgroundMedia as MediaType}
                showFallbackLink={false}
              />
            </div>
          ) : null}
          <div className="trayport-grid">
            {columns.map((column, index) => (
              <div
                className="trayport-column"
                key={index}
                style={
                  { '--trayport-span': Number(text(column.span) || 12) } as React.CSSProperties
                }
              >
                {array(column.components)
                  .map(record)
                  .map((component, componentIndex) => (
                    <Component
                      component={component}
                      key={`${text(component.blockType)}-${componentIndex}`}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const Hero = ({ block, priority = false }: { block: UnknownRecord; priority?: boolean }) => {
  const hasMedia = Boolean(block.media || text(block.externalVideoURL))
  const statistics = array(block.statistics).map(record)
  return (
    <section className={`trayport-hero trayport-hero--${text(block.appearance) || 'dark'}`}>
      {hasMedia ? (
        <div className="trayport-hero__media" aria-hidden>
          <TrayportMedia
            background
            externalURL={text(block.externalVideoURL)}
            media={block.media as MediaType}
            priority={priority}
          />
        </div>
      ) : null}
      <div className="trayport-hero__polygon" aria-hidden />
      <div className="trayport-container trayport-hero__inner">
        <div className="trayport-hero__content">
          {text(block.eyebrow) ? <p className="trayport-eyebrow">{text(block.eyebrow)}</p> : null}
          <h1>{text(block.heading)}</h1>
          {richText(block.body, 'trayport-richtext trayport-richtext--lead')}
          <Actions value={block.actions} />
        </div>
      </div>
      {statistics.length ? (
        <dl aria-label="Trayport at a glance" className="trayport-hero__statistics">
          {statistics.map((item, index) => (
            <div key={`${text(item.label)}-${index}`}>
              <dd>{text(item.value)}</dd>
              <dt>{text(item.label)}</dt>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}

const ArticleListing = async ({ block }: { block: UnknownRecord }) => {
  const payload = await getPayload({ config: configPromise })
  const family = text(block.family) || 'insights'
  const types =
    family === 'news'
      ? ['news']
      : family === 'events'
        ? ['event']
        : family === 'all'
          ? ['insight', 'webinar', 'video', 'case-study', 'news', 'event']
          : ['insight', 'webinar', 'video', 'case-study']
  const result = await payload.find({
    collection: 'articles',
    depth: 2,
    limit: 100,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      articleType: { in: types },
    },
  })

  return (
    <section className="trayport-section trayport-section--light trayport-listing">
      <div className="trayport-container">
        <div className="trayport-listing__header">
          <p className="trayport-eyebrow">Resources</p>
          <h2>{text(block.heading) || 'Latest insights'}</h2>
          {richText(block.intro, 'trayport-richtext')}
        </div>
        <ArticleListingClient
          articles={result.docs}
          family={family}
          initialPageSize={Number(block.pageSize) || 12}
          showCategoryFilter={Boolean(block.showCategoryFilter)}
        />
      </div>
    </section>
  )
}

const LearningVideoListing = async ({ block }: { block: UnknownRecord }) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'learning-videos',
    depth: 2,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    select: {
      accessMode: true,
      categories: true,
      contentMode: true,
      duration: true,
      externalDestination: true,
      path: true,
      poster: true,
      product: true,
      summary: true,
      title: true,
    },
    sort: 'displayOrder',
  })

  return (
    <section className="trayport-section trayport-section--light trayport-listing trayport-learning-listing">
      <div className="trayport-container">
        <div className="trayport-listing__header">
          <p className="trayport-eyebrow">Learning Hub</p>
          <h2>{text(block.heading) || 'Explore the Learning Hub'}</h2>
          {richText(block.intro, 'trayport-richtext')}
        </div>
        <LearningVideoListingClient
          initialPageSize={Number(block.pageSize) || 15}
          showCategoryFilter={Boolean(block.showCategoryFilter)}
          showProductFilter={Boolean(block.showProductFilter)}
          videos={result.docs}
        />
      </div>
    </section>
  )
}

export const TrayportBlocks = async ({ blocks }: { blocks: unknown }) => {
  const values = array(blocks).map(record)

  return (
    <>
      {values.map((block, index) => {
        const type = text(block.blockType)
        if (type === 'trayportHero') {
          return <Hero block={block} key={`${type}-${index}`} priority={index === 0} />
        }
        if (type === 'contentSection') {
          return <ContentSection block={block} key={`${type}-${index}`} />
        }
        if (type === 'articleListing') {
          return <ArticleListing block={block} key={`${type}-${index}`} />
        }
        if (type === 'learningVideoListing') {
          return <LearningVideoListing block={block} key={`${type}-${index}`} />
        }
        return null
      })}
    </>
  )
}
