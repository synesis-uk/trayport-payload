import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import configPromise from '@payload-config'
import { ArrowRight, BarChart3, ExternalLink } from 'lucide-react'
import { getPayload } from 'payload'

import type { Media as MediaType } from '@/payload-types'
import RichText from '@/components/RichText'
import { ArticleListingClient } from './ArticleListingClient'
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

const Actions = ({ value }: { value: unknown }) => {
  const actions = array(value)
    .map(record)
    .filter((item) => text(item.label) && text(item.url))
  if (!actions.length) return null

  return (
    <div className="trayport-actions">
      {actions.map((action, index) => {
        const newTab = Boolean(action.newTab)
        const style = text(action.style) || 'primary'
        return (
          <a
            className={`trayport-action trayport-action--${style}`}
            href={text(action.url)}
            key={`${text(action.url)}-${index}`}
            rel={newTab ? 'noreferrer' : undefined}
            target={newTab ? '_blank' : undefined}
          >
            <span>{text(action.label)}</span>
            {newTab ? <ExternalLink aria-hidden size={16} /> : <ArrowRight aria-hidden size={17} />}
          </a>
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
  const y = (latitude: number) => ((90 - latitude) / 180) * 500

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

      <figure className="trayport-coverage-map">
        <svg
          aria-labelledby="trayport-coverage-map-title trayport-coverage-map-description"
          role="img"
          viewBox="0 0 1000 500"
        >
          <title id="trayport-coverage-map-title">Trayport market connectivity locations</title>
          <desc id="trayport-coverage-map-description">
            Schematic longitude and latitude field containing {markers.length} imported market
            markers.
          </desc>
          <rect className="trayport-coverage-map__field" height="500" rx="8" width="1000" />
          {[250, 500, 750].map((value) => (
            <line
              className="trayport-coverage-map__grid"
              key={`vertical-${value}`}
              x1={value}
              x2={value}
              y1="0"
              y2="500"
            />
          ))}
          {[125, 250, 375].map((value) => (
            <line
              className="trayport-coverage-map__grid"
              key={`horizontal-${value}`}
              x1="0"
              x2="1000"
              y1={value}
              y2={value}
            />
          ))}
          {markers.map((marker, index) => (
            <circle
              className="trayport-coverage-map__marker"
              cx={x(marker.longitude)}
              cy={y(marker.latitude)}
              key={`${marker.hub}-${marker.label}-${index}`}
              r="7"
            >
              <title>{`${marker.label}: ${marker.latitude.toFixed(2)}, ${marker.longitude.toFixed(2)}`}</title>
            </circle>
          ))}
        </svg>
        <figcaption>
          Imported market locations plotted without a third-party map service.
        </figcaption>
      </figure>
    </div>
  )
}

const DataChart = async ({ component }: { component: UnknownRecord }) => {
  const assetClassLegacyID = Number(component.assetClassLegacyId)
  const rows = await getMarketVolumeQuarterly(assetClassLegacyID, 10)
  const totals = rows.map((row) => row.otcBilateral + row.otcCleared + row.exchangeTraded)
  const maxTotal = Math.max(...totals, 0)
  const compact = new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 1,
    notation: 'compact',
  })
  const precise = new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 0,
  })

  return (
    <section className="trayport-chart" aria-labelledby={`market-chart-${assetClassLegacyID}`}>
      <div className="trayport-chart__header">
        <BarChart3 aria-hidden size={28} />
        <div>
          <h3 id={`market-chart-${assetClassLegacyID}`}>{text(component.title)}</h3>
          {text(component.accessibleSummary) ? <p>{text(component.accessibleSummary)}</p> : null}
          {text(component.unit) ? <span>Unit: {text(component.unit)}</span> : null}
        </div>
      </div>

      {rows.length ? (
        <>
          <div
            aria-label={`Stacked quarterly market volume for ${text(component.title)}. The latest ${rows.length} quarters are shown.`}
            className="trayport-chart__plot"
            role="img"
            style={{
              gridTemplateColumns: `repeat(${rows.length}, minmax(1.5rem, 1fr))`,
            }}
            tabIndex={0}
          >
            {rows.map((row, index) => {
              const total = totals[index] || 1
              const availableHeight = maxTotal ? (total / maxTotal) * 100 : 0
              return (
                <div className="trayport-chart__quarter" key={`${row.year}-${row.quarter}`}>
                  <div
                    aria-hidden
                    className="trayport-chart__bar"
                    style={{ height: `${availableHeight}%` }}
                    title={`${row.year} Q${row.quarter}: ${compact.format(total)}`}
                  >
                    <span
                      className="is-bilateral"
                      style={{ height: `${(row.otcBilateral / total) * 100}%` }}
                    />
                    <span
                      className="is-cleared"
                      style={{ height: `${(row.otcCleared / total) * 100}%` }}
                    />
                    <span
                      className="is-exchange"
                      style={{ height: `${(row.exchangeTraded / total) * 100}%` }}
                    />
                  </div>
                  <span>
                    Q{row.quarter}
                    <small>{row.year}</small>
                  </span>
                </div>
              )
            })}
          </div>
          <ul aria-label="Chart legend" className="trayport-chart__legend">
            <li>
              <span className="is-bilateral" />
              OTC bilateral
            </li>
            <li>
              <span className="is-cleared" />
              OTC cleared
            </li>
            <li>
              <span className="is-exchange" />
              Exchange traded
            </li>
          </ul>
          <details className="trayport-chart__data">
            <summary>View chart data</summary>
            <div
              aria-label={`${text(component.title)} data table`}
              className="trayport-table-wrap"
              role="region"
              tabIndex={0}
            >
              <table className="trayport-table">
                <thead>
                  <tr>
                    <th scope="col">Quarter</th>
                    <th scope="col">OTC bilateral</th>
                    <th scope="col">OTC cleared</th>
                    <th scope="col">Exchange traded</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
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
          {items.map((item, index) => (
            <article className="trayport-feature" key={`${text(item.title)}-${index}`}>
              {item.media ? (
                <TrayportMedia
                  className="trayport-feature__media"
                  media={item.media as MediaType}
                />
              ) : null}
              <div className="trayport-feature__body">
                {text(item.icon) ? (
                  <span className="trayport-feature__icon">{text(item.icon)}</span>
                ) : null}
                <h3>{text(item.title)}</h3>
                {richText(item.body, 'trayport-richtext')}
                {text(item.url) ? (
                  <a className="trayport-inline-link" href={text(item.url)}>
                    {text(item.linkLabel) || 'Learn more'} <ArrowRight aria-hidden size={16} />
                  </a>
                ) : null}
              </div>
            </article>
          ))}
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
              {richText(item.answer, 'trayport-richtext')}
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
            const body = (
              <>
                {item.media ? (
                  <TrayportMedia
                    className="trayport-entity__media"
                    media={item.media as MediaType}
                    showFallbackLink={!text(item.url)}
                  />
                ) : null}
                <h3>{text(item.title)}</h3>
                {richText(item.description, 'trayport-richtext')}
                {text(item.url) ? <ArrowRight aria-hidden size={17} /> : null}
              </>
            )
            return text(item.url) ? (
              <a
                className="trayport-entity"
                href={text(item.url)}
                key={`${text(item.title)}-${index}`}
              >
                {body}
              </a>
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
    default:
      return null
  }
}

const ContentSection = ({ block }: { block: UnknownRecord }) => {
  const columns = array(block.columns).map(record)
  return (
    <section
      className={`trayport-section trayport-section--${text(block.theme) || 'light'} trayport-section--${text(block.spacing) || 'regular'}`}
      id={text(block.anchor) || undefined}
    >
      <div className={`trayport-container trayport-container--${text(block.width) || 'wide'}`}>
        <div className="trayport-grid">
          {columns.map((column, index) => (
            <div
              className="trayport-column"
              key={index}
              style={{ '--trayport-span': Number(text(column.span) || 12) } as React.CSSProperties}
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
    </section>
  )
}

const Hero = ({ block, priority = false }: { block: UnknownRecord; priority?: boolean }) => {
  const hasMedia = Boolean(block.media || text(block.externalVideoURL))
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
    </section>
  )
}

const ArticleListing = async ({ block }: { block: UnknownRecord }) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'articles',
    depth: 2,
    limit: 100,
    overrideAccess: false,
    sort: '-publishedAt',
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
          initialPageSize={Number(block.pageSize) || 12}
          showCategoryFilter={Boolean(block.showCategoryFilter)}
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
        return null
      })}
    </>
  )
}
