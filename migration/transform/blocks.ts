import type { NormalizedValue, SourceReusable } from '../contracts/v1'
import {
  asArray,
  asBoolean,
  asObject,
  asString,
  legacyRef,
  mediaToken,
  referenceId,
} from './helpers'
import { htmlToLexical, htmlToPlainText } from './lexical'
import type { LegacyReference, TransformCoverage } from './types'
import { normalizeHubSpotFormID } from '../../src/integrations/hubSpotForm'
import { migrationDestination } from './url'

type TargetComponent = Record<string, unknown> & { blockType: string }
type TargetSection = Record<string, unknown> & { blockType: string }
export type ReusableLookup = Map<number, SourceReusable>
export type ManagedLinkLookup = Map<
  number,
  | {
      kind: LegacyReference['$legacyRef']
      legacyId?: number
      relationTo: 'articles' | 'hubs' | 'learning-videos' | 'pages' | 'people' | 'venues'
    }
  | { url: string }
>

// WordPress `map-all` is the standard dark connection-map background used by the live site.
const LEGACY_MAP_ALL_BACKGROUND_MEDIA_ID = 6101
const LEGACY_ASSET_CLASS_ID_BY_SLUG: Record<string, number> = {
  bulk: 108,
  climate: 109,
  coal: 90,
  emissions: 114,
  envrionmentals: 25,
  freight: 88,
  gas: 22,
  iron_ore: 27,
  oil: 26,
  power: 21,
  renewables: 89,
  weather: 192,
}
const CONNECTION_MAP_LINE_COLORS = new Set([
  '#1f2a44',
  '#002d72',
  '#0057b8',
  '#009cde',
  '#00c1d5',
  '#32b77b',
  '#ff671f',
  '#f7ea48',
])
const REGION_PAGE_LEGACY_ID_BY_REGION_LEGACY_ID: Record<number, number> = {
  843: 2221,
  844: 5981,
  845: 5983,
}

const count = (target: Record<string, number>, key: string): void => {
  target[key] = (target[key] || 0) + 1
}

export const hubSpotFormComponentFromWordPress = (
  value: unknown,
): { blockType: 'hubspotForm'; formId: string; title: string } | null => {
  const source = asObject(value)
  const form = asObject(source.form)
  const formId = normalizeHubSpotFormID(form.hubspot_form_id || source.hubspot_form_id)
  if (!formId) return null

  return {
    blockType: 'hubspotForm',
    formId,
    title: htmlToPlainText(form.form_title || source.form_title) || 'Contact the Trayport team',
  }
}

const normalizedFeatureIcon = (value: unknown): string | undefined => {
  const icon = asString(value)
  if (icon === 'arrow-trend-up') return 'trend'
  return ['lightbulb', 'trend', 'clock', 'chart', 'scan'].includes(icon) ? icon : undefined
}

const normalizedFeatureDisplay = (
  value: unknown,
  media: unknown,
  icon: string | undefined,
): 'icon' | 'image' | 'plain' => {
  const display = asString(value)
  if (display === 'image' && media) return 'image'
  if (display === 'icon' && icon) return 'icon'
  return 'plain'
}

const normalizedStandaloneIcon = (value: unknown): string | undefined => {
  const icons: Record<string, string> = {
    'fire-flame': 'gas',
    industry: 'emissions',
    lightbulb: 'power',
  }

  return icons[asString(value)]
}

const normalizedActionIcon = (value: unknown): string | undefined => {
  const icons: Record<string, string> = {
    'chart-mixed': 'chart',
    'earth-europe': 'europe',
    forward: 'forward',
    gear: 'settings',
    people: 'people',
    play: 'play',
    users: 'people',
  }

  return icons[asString(value)]
}

const normalizedBadgeIcon = (value: unknown): string | undefined => {
  const icons: Record<string, string> = {
    'display-chart-up-circle-currency': 'tradingScreen',
    people: 'people',
  }

  return icons[asString(value)]
}

type DataChartRange = {
  fromQuarter: number
  fromYear: number
  toQuarter: number
  toYear: number
}

const normalizedChartYear = (value: NormalizedValue): number | null => {
  const year = Number(value)
  if (!Number.isInteger(year) || year <= 0) return null
  const normalized = year < 100 ? 2000 + year : year
  return normalized >= 2000 && normalized <= 2100 ? normalized : null
}

const normalizedChartQuarter = (value: NormalizedValue): number | null => {
  const quarter = Number(value)
  return Number.isInteger(quarter) && quarter >= 1 && quarter <= 4 ? quarter : null
}

const completeDataChartRange = (
  fromYearValue: NormalizedValue,
  fromQuarterValue: NormalizedValue,
  toYearValue: NormalizedValue,
  toQuarterValue: NormalizedValue,
): DataChartRange | null => {
  const fromYear = normalizedChartYear(fromYearValue)
  const fromQuarter = normalizedChartQuarter(fromQuarterValue)
  const toYear = normalizedChartYear(toYearValue)
  const toQuarter = normalizedChartQuarter(toQuarterValue)

  if (fromYear === null || fromQuarter === null || toYear === null || toQuarter === null) {
    return null
  }
  if (fromYear * 4 + fromQuarter > toYear * 4 + toQuarter) return null

  return { fromQuarter, fromYear, toQuarter, toYear }
}

const dataChartRangeFromLegacy = (
  component: Record<string, NormalizedValue>,
): DataChartRange | null => {
  const interval = asString(component.interval) || 'all'

  if (interval === 'year') {
    const year = normalizedChartYear(component.year)
    return year === null ? null : completeDataChartRange(year, 1, year, 4)
  }

  if (interval === 'year_range') {
    const range = asObject(component.year_range)
    return completeDataChartRange(range.from_year, 1, range.to_year, 4)
  }

  if (interval === 'quarter') {
    const quarter = asObject(component.single_quarter)
    return completeDataChartRange(
      quarter.sq_year,
      quarter.sq_quarter,
      quarter.sq_year,
      quarter.sq_quarter,
    )
  }

  if (interval === 'quarter_range') {
    const range = asObject(component.quarter_range)
    return completeDataChartRange(
      range.qr_from_year,
      range.qr_from_quarter,
      range.qr_to_year,
      range.qr_to_quarter,
    )
  }

  // `all` deliberately has no bounds. The legacy `latest_*` intervals are resolved against live
  // market data at request time, so a static migration must also leave them unbounded.
  return null
}

const dataChartHubReferences = (value: NormalizedValue): LegacyReference[] =>
  asArray(value).flatMap((hub) => {
    const reference = legacyRef('hub', hub)
    return reference ? [reference] : []
  })

const dataChartDisplayInterval = (value: NormalizedValue): 'month' | 'quarter' | 'year' => {
  const intervals: Record<string, 'month' | 'quarter' | 'year'> = {
    months: 'month',
    quarters: 'quarter',
    ytd: 'year',
  }
  return intervals[asString(value)] || 'quarter'
}

const normalizedHeadingAppearance = (value: unknown): 'h1' | 'h2' | 'h3' | 'h4' => {
  const size = asString(value)
  return ['h1', 'h2', 'h3', 'h4'].includes(size) ? (size as 'h1' | 'h2' | 'h3' | 'h4') : 'h2'
}

const normalizedHeadingLevel = (
  tagValue: unknown,
  appearance: 'h1' | 'h2' | 'h3' | 'h4',
): 'h2' | 'h3' | 'h4' => {
  const tag = asString(tagValue)
  if (['h2', 'h3', 'h4'].includes(tag)) return tag as 'h2' | 'h3' | 'h4'
  return appearance === 'h3' || appearance === 'h4' ? appearance : 'h2'
}

const linkFromValue = (
  value: unknown,
  links: ManagedLinkLookup = new Map(),
): Record<string, unknown> | null => {
  const object = asObject(value)
  const link = asObject(object.new_link || object.link || value)
  const label = asString(link.title || link.name || object.label)
  const url = asString(link.url || link.path)

  if (!label || !url) {
    return null
  }

  const legacyStyle = asString(object.style)
  const style = ['primary', 'secondary', 'accent', 'info', 'link'].includes(legacyStyle)
    ? legacyStyle
    : legacyStyle === 'cta'
      ? 'accent'
      : 'link'
  const icon = normalizedActionIcon(object.icon)

  const numericValue = Number(asString(link.value)) || referenceId(link.value, 'post') || 0
  const target =
    Number.isInteger(numericValue) && !url.startsWith('#') ? links.get(numericValue) : null
  const fallbackDestination = target ? null : migrationDestination(url)
  if (!target && !fallbackDestination) {
    return null
  }
  const managedLink = target
    ? 'url' in target
      ? {
          type: 'custom',
          url: target.url,
          newTab: asString(link.target) === '_blank',
        }
      : {
          type: 'reference',
          reference: {
            relationTo: target.relationTo,
            value: legacyRef(target.kind, target.legacyId || numericValue),
          },
          newTab: asString(link.target) === '_blank',
        }
    : {
        type: 'custom',
        url: fallbackDestination,
        newTab: asString(link.target) === '_blank',
      }

  return {
    label,
    link: managedLink,
    style,
    ...(icon ? { icon } : {}),
  }
}

const actionsFrom = (value: unknown, links: ManagedLinkLookup): Record<string, unknown>[] =>
  asArray(value)
    .map((item) => linkFromValue(item, links))
    .filter((item): item is Record<string, unknown> => Boolean(item))

const entityItemsFrom = (
  value: unknown,
  reusables: ReusableLookup,
  links: ManagedLinkLookup,
): Record<string, unknown>[] => {
  const references = Array.isArray(value) ? value : value ? [value] : []
  return references
    .map((candidate) => {
      const item = asObject(candidate)
      const reusableId = referenceId(item, 'post')
      const reusable = reusableId ? reusables.get(reusableId) : undefined
      const data = reusable?.data || item
      const title = asString(data.name || reusable?.title || item.title || item.name)
      if (!title) return null
      const redirect = asObject(asArray(data.page_redirect)[0])
      const externalLink = asObject(data.external_link)
      const rawURL = asString(
        externalLink.url ||
          redirect.path ||
          data.website ||
          reusable?.path ||
          item.path ||
          item.url,
      )
      const rawValue = redirect.value || redirect.post || redirect.page || redirect
      const mappedLink = rawURL
        ? linkFromValue(
            {
              new_link: {
                ...redirect,
                title: htmlToPlainText(title),
                url: rawURL,
                value: rawValue,
              },
            },
            links,
          )
        : null
      return {
        title: htmlToPlainText(title),
        description: htmlToLexical(
          data.short_description || data.description || data.job_role || data.testimonial || '',
        ),
        media: mediaToken(data.display_logo || data.image || data.logo),
        link: mappedLink?.link,
      }
    })
    .filter(Boolean) as Record<string, unknown>[]
}

export const statsRightComponentsFromWordPress = (value: unknown): TargetComponent[] => {
  const source = asObject(value)
  const content = asObject(source.content || value)
  const components: TargetComponent[] = []
  const heading = htmlToPlainText(asObject(content.header).text)
  const paragraph = asString(content.paragraph)
  const items = asArray(content.stats)
    .map((candidate) => {
      const item = asObject(candidate)
      const data = asObject(item.data)
      const value = `${asString(data.prefix)}${asString(data.number)}${asString(data.suffix)}`
      const label = htmlToPlainText(item.title)
      const description = htmlToPlainText(item.description)
      return value || label || description
        ? { value: value || '—', label: label || 'Statistic', description }
        : null
    })
    .filter(Boolean) as Record<string, unknown>[]

  if (heading) {
    components.push({ blockType: 'heading', text: heading, level: 'h2', appearance: 'h3' })
  }
  if (paragraph) {
    components.push({ blockType: 'richText', body: htmlToLexical(paragraph), size: 'regular' })
  }
  if (items.length) components.push({ blockType: 'statistics', items })
  return components
}

const productFeatureItemsFrom = (
  value: unknown,
  reusables: ReusableLookup,
  links: ManagedLinkLookup,
): Record<string, unknown>[] => {
  const references = Array.isArray(value) ? value : value ? [value] : []

  return references
    .map((candidate) => {
      const item = asObject(candidate)
      const reusableId = referenceId(item, 'post')
      const reusable = reusableId ? reusables.get(reusableId) : undefined
      const data = reusable?.data || item
      const title = htmlToPlainText(data.name || reusable?.title || item.title || item.name)
      if (!title) return null

      const redirect = asObject(asArray(data.page_redirect)[0])
      const externalLink = asObject(data.external_link)
      const rawURL = asString(
        externalLink.url ||
          redirect.path ||
          data.website ||
          reusable?.path ||
          item.path ||
          item.url,
      )
      const rawValue = redirect.value || redirect.post || redirect.page || redirect
      const action = rawURL
        ? linkFromValue(
            {
              icon: data.icon,
              new_link: {
                ...redirect,
                title,
                url: rawURL,
                value: rawValue,
              },
              style: 'link',
            },
            links,
          )
        : null

      return {
        title,
        display: 'image',
        media: mediaToken(data.display_logo || data.image || data.logo),
        showAction: Boolean(action),
        actionStyle: action ? asString(action.style) || 'link' : 'link',
        ...(action?.icon ? { actionIcon: action.icon } : {}),
        ...(action
          ? {
              link: {
                ...(asObject(action.link) as Record<string, unknown>),
                label: asString(action.label) || title,
              },
            }
          : {}),
      }
    })
    .filter(Boolean) as Record<string, unknown>[]
}

const boundedNumber = (value: unknown, fallback: number, min: number, max: number): number => {
  const rawValue = asString(value)
  if (!rawValue) return fallback
  const numericValue = Number(rawValue)
  return Number.isFinite(numericValue) ? Math.min(Math.max(numericValue, min), max) : fallback
}

const marketCoverageFrom = (
  component: Record<string, NormalizedValue>,
  presentation: 'mapOnly' | 'summary',
): TargetComponent => {
  const mode =
    asString(component.acf_fc_layout) === 'markets-map'
      ? 'regionalConnectivity'
      : 'globalConnections'
  const style = asString(component.style) === 'light' ? 'light' : 'dark'
  const assetClasses = asArray(component.asset_classes)
    .map((term) => legacyRef('asset-class', term))
    .filter(Boolean)
  const venueTypes = asArray(component.venue_types)
    .map((term) => legacyRef('venue-type', term))
    .filter(Boolean)
  const regions = asArray(component.regions)
    .map((term) => legacyRef('region', term))
    .filter(Boolean)
  const sourceLineColor = asObject(component.line_color || component.color)
  const rawLineColor = asString(
    asString(sourceLineColor.type) === 'shades'
      ? sourceLineColor.shade
      : sourceLineColor.color || sourceLineColor.shade || component.line_color,
  ).toLowerCase()
  const lineColor = CONNECTION_MAP_LINE_COLORS.has(rawLineColor) ? rawLineColor : '#009cde'
  const rawShowLines = component.show_lines
  const showLines =
    rawShowLines === undefined || rawShowLines === null || rawShowLines === ''
      ? true
      : asBoolean(rawShowLines)
  const height = asObject(component.height)
  const includedHubs = asArray(component.connections)
    .map((hub) => legacyRef('hub', hub))
    .filter(Boolean)
  const explicitDefaultAssetClassID =
    LEGACY_ASSET_CLASS_ID_BY_SLUG[asString(component.default_class_slug).trim().toLowerCase()]
  // `markets-map.blade.php:5` hardcodes `$defaultClassSlug = 'power'` for every placement, which
  // shadows the composer's 'gas' fallback, and the live site only picks another class when Power
  // is absent from the selected subset. Single-region maps are not an exception: preferring gas
  // for them opened all three region pages on Natural Gas where the reference opens on Power.
  const preferredDefaultAssetClassIDs = explicitDefaultAssetClassID
    ? [explicitDefaultAssetClassID]
    : [LEGACY_ASSET_CLASS_ID_BY_SLUG.power, LEGACY_ASSET_CLASS_ID_BY_SLUG.gas]
  const selectedAssetClassIDs = new Set(
    assetClasses.map((value) => Number(asObject(value).legacyId)).filter(Number.isInteger),
  )
  const preferredDefaultAssetClassID = preferredDefaultAssetClassIDs.find(
    (legacyId) =>
      explicitDefaultAssetClassID || !assetClasses.length || selectedAssetClassIDs.has(legacyId),
  )
  const defaultAssetClass = preferredDefaultAssetClassID
    ? legacyRef('asset-class', preferredDefaultAssetClassID)
    : assetClasses[0] || null
  const rawShowSidebar = component.show_sidebar
  const showSidebar =
    rawShowSidebar === undefined || rawShowSidebar === null || rawShowSidebar === ''
      ? true
      : asBoolean(rawShowSidebar)
  const rawShowToggle = component.show_toggle
  const showAssetClassFilter =
    rawShowToggle === undefined || rawShowToggle === null || rawShowToggle === ''
      ? true
      : asBoolean(rawShowToggle)

  return {
    blockType: 'marketCoverage',
    mode,
    presentation,
    title: 'Explore our connectivity',
    style,
    backgroundMedia: style === 'dark' ? mediaToken(LEGACY_MAP_ALL_BACKGROUND_MEDIA_ID) : null,
    height: boundedNumber(
      height.fixed_height || component.height,
      mode === 'regionalConnectivity' ? 600 : 300,
      100,
      800,
    ),
    markerSize: boundedNumber(component.marker_size, 5, 2, 8),
    showLines,
    lineColor,
    lineWidth: boundedNumber(component.line_width, 0.5, 0, 1),
    lineOpacity: boundedNumber(component.line_opacity, 0.5, 0, 1),
    assetClasses,
    venueTypes,
    regions,
    includedHubs,
    defaultAssetClass,
    showAssetClassFilter,
    autoplayAssetClasses: mode === 'globalConnections' && asBoolean(component.slides),
    autoplayDelay: boundedNumber(component.delay, 5, 2, 30),
    zoomTo: asString(component.zoom_to) === 'region' ? 'region' : 'markers',
    showSidebar,
    showMarketData:
      mode === 'regionalConnectivity' && asString(component.commsrep_data) === 'latest',
    dataDisplay: ['hover', 'toggle'].includes(asString(component.data_display))
      ? 'hover'
      : 'always',
    actions: [],
  }
}

const regionFeatureItemsFrom = (value: unknown): Record<string, unknown>[] =>
  asArray(value)
    .map((candidate) => {
      const region = asObject(candidate)
      const sourceLegacyId = referenceId(region, 'post')
      const pageLegacyId = sourceLegacyId
        ? REGION_PAGE_LEGACY_ID_BY_REGION_LEGACY_ID[sourceLegacyId]
        : undefined
      const title = htmlToPlainText(region.title || region.name)
      if (!pageLegacyId || !title) return null

      return {
        display: 'plain',
        title,
        showAction: true,
        actionStyle: 'link',
        link: {
          label: `Explore ${title}`,
          type: 'reference',
          reference: {
            relationTo: 'pages',
            value: legacyRef('page', pageLegacyId),
          },
          newTab: false,
        },
      }
    })
    .filter(Boolean) as Record<string, unknown>[]

const featureItems = (
  component: Record<string, NormalizedValue>,
  links: ManagedLinkLookup,
): Record<string, unknown>[] => {
  const candidates = [
    ...asArray(component.feature),
    ...asArray(component.features),
    ...asArray(component.items),
  ]

  return candidates
    .map((candidate) => {
      const item = asObject(candidate)
      const title = htmlToPlainText(item.name || item.title)
      const description = item.description || item.body || ''
      const imageGroup = asObject(item.image)
      const media = mediaToken(imageGroup.image || item.image || item.logo)
      const button = linkFromValue(item.button, links)
      const icon = normalizedFeatureIcon(item.icon)
      const showAction = asBoolean(item.show_button) && Boolean(button)

      if (!title && !description && !media) {
        return null
      }

      return {
        title,
        body: htmlToLexical(description),
        display: normalizedFeatureDisplay(item.display, media, icon),
        ...(icon ? { icon } : {}),
        media,
        showAction,
        actionStyle: button ? asString(button.style) || 'link' : 'link',
        ...(button?.icon ? { actionIcon: button.icon } : {}),
        ...(button
          ? {
              link: {
                ...(asObject(button.link) as Record<string, unknown>),
                label: asString(button.label),
              },
            }
          : {}),
      }
    })
    .filter(Boolean) as Record<string, unknown>[]
}

const lifecycleReferencesFrom = (
  categoryValue: unknown,
  reusables: ReusableLookup,
): LegacyReference[] => {
  const category = asObject(categoryValue)
  const mode = asString(category.type) || 'all'
  const lifecycleRecords = [...reusables.values()].filter(
    ({ postType }) => postType === 'lifecycle',
  )
  let selected: SourceReusable[] = []

  if (mode === 'specific') {
    const byLegacyID = new Map(lifecycleRecords.map((record) => [record.legacyId, record]))
    selected = asArray(category.specific).flatMap((value) => {
      const legacyID = referenceId(value, 'post')
      const record = legacyID ? byLegacyID.get(legacyID) : undefined
      return record ? [record] : []
    })
  } else if (mode === 'single') {
    const productLegacyID = referenceId(category.single, 'post')
    selected = productLegacyID
      ? lifecycleRecords.filter(({ data }) => referenceId(data.product, 'post') === productLegacyID)
      : []
  } else {
    selected = lifecycleRecords
  }

  const seen = new Set<number>()
  const ordered =
    mode === 'specific' ? selected : selected.sort((left, right) => left.legacyId - right.legacyId)
  return ordered
    .flatMap((record) => {
      if (seen.has(record.legacyId)) return []
      seen.add(record.legacyId)
      const reference = legacyRef('lifecycle-item', record.legacyId)
      return reference ? [reference] : []
    })
    .slice(0, 100)
}

const mapComponent = (
  componentValue: unknown,
  coverage: TransformCoverage,
  reusables: ReusableLookup = new Map(),
  links: ManagedLinkLookup = new Map(),
): TargetComponent[] => {
  const component = asObject(componentValue)
  const layout = asString(component.acf_fc_layout)
  if (!layout) {
    coverage.unsupportedComponentLayouts.push('(missing)')
    return []
  }
  count(coverage.componentLayouts, layout)

  switch (layout) {
    case 'header': {
      const header = asObject(component.header)
      const text = htmlToPlainText(header.text)
      if (!text) return []
      const appearance = normalizedHeadingAppearance(header.size)
      return [
        {
          blockType: 'heading',
          text,
          level: normalizedHeadingLevel(header.tag, appearance),
          appearance,
        },
      ]
    }
    case 'subheader':
    case 'preheader': {
      const field =
        layout === 'subheader' ? component.sub_header || component.subheader : component.pre_header
      const data = asObject(field)
      const text = htmlToPlainText(data.text || field)
      if (!text) return []
      const appearance =
        layout === 'preheader' ? 'h4' : normalizedHeadingAppearance(data.size || 'h3')
      return [
        {
          blockType: 'heading',
          eyebrow: layout === 'preheader' ? text : '',
          text,
          level: layout === 'preheader' ? 'h4' : normalizedHeadingLevel(data.tag, appearance),
          appearance,
        },
      ]
    }
    case 'paragraph': {
      const body = component.paragraph
      if (!asString(body).trim()) return []
      return [
        {
          blockType: 'richText',
          body: htmlToLexical(body),
          size: asString(component.text_size) === 'larger' ? 'large' : 'regular',
        },
      ]
    }
    case 'buttons': {
      const actions = actionsFrom(component.buttons, links)
      return actions.length ? [{ blockType: 'actions', actions }] : []
    }
    case 'image': {
      const image = asObject(component.image)
      const media = mediaToken(image.image || component.image)
      if (!media) return []
      return [
        {
          blockType: 'media',
          media,
          caption: asString(image.caption),
          aspect: asString(image.aspect).includes('1/1') ? 'square' : 'landscape',
        },
      ]
    }
    case 'videos': {
      const category = asObject(component.category)
      const single = asObject(category.single)
      const reusableId = referenceId(single, 'post')
      const reusable = reusableId ? reusables.get(reusableId) : undefined
      const media = mediaToken(reusable?.data.video)
      return media
        ? [
            {
              blockType: 'media',
              media,
              aspect: 'wide',
            },
          ]
        : []
    }
    case 'features': {
      const reusableId =
        asString(component.type) === 'pre' ? referenceId(component.category, 'post') : null
      const reusable = reusableId ? reusables.get(reusableId) : undefined
      const source = reusable
        ? ({
            ...component,
            feature: reusable.data.feature,
          } as Record<string, NormalizedValue>)
        : component
      const items = featureItems(source, links)
      return items.length
        ? [
            {
              blockType: 'featureList',
              presentation: items.length >= 4 ? 'carousel' : 'grid',
              items,
            },
          ]
        : []
    }
    case 'stats': {
      const reusableId = referenceId(component.stats_group, 'post')
      const reusable = reusableId ? reusables.get(reusableId) : undefined
      const items = asArray(reusable?.data.stats || component.stats || component.stat)
        .map((candidate) => {
          const item = asObject(candidate)
          const data = asObject(item.data)
          const value = `${asString(data.prefix)}${asString(data.number || item.value)}${asString(data.suffix)}`
          const label = htmlToPlainText(item.title || item.label)
          if (!value && !label) return null
          return {
            value: value || '—',
            label: label || 'Statistic',
            description: htmlToPlainText(item.description),
          }
        })
        .filter(Boolean) as Record<string, unknown>[]
      return items.length ? [{ blockType: 'statistics', items }] : []
    }
    case 'stats-right':
      return statsRightComponentsFromWordPress(component)
    case 'faqs': {
      const items = asArray(component.content || component.faqs)
        .map((candidate) => {
          const item = asObject(candidate)
          const question = htmlToPlainText(item.question)
          if (!question) return null
          return {
            question,
            answer: htmlToLexical(item.answer),
            media: mediaToken(item.image),
          }
        })
        .filter(Boolean) as Record<string, unknown>[]
      return items.length ? [{ blockType: 'faq', items }] : []
    }
    case 'products': {
      const category = asObject(component.category)
      const items = productFeatureItemsFrom(category.specific || category.single, reusables, links)
      return items.length
        ? [
            {
              blockType: 'featureList',
              presentation: 'grid',
              items,
            },
          ]
        : []
    }
    case 'people': {
      const category = asObject(component.category)
      const selectionMode = asString(category.type) === 'team' ? 'team' : 'specific'
      const team = asString(asObject(category.team).team)
      const source =
        selectionMode === 'team'
          ? [...reusables.values()]
              .filter(
                ({ data, postType, status }) =>
                  postType === 'people' && status === 'publish' && asString(data.team) === team,
              )
              .sort(
                (left, right) =>
                  (left.menuOrder || 0) - (right.menuOrder || 0) ||
                  Date.parse(right.publishedAt || '') - Date.parse(left.publishedAt || '') ||
                  right.legacyId - left.legacyId,
              )
          : Array.isArray(category.specific)
            ? category.specific
            : category.single
              ? [category.single]
              : []
      const people = source
        .map((candidate) =>
          legacyRef(
            'person',
            'legacyId' in Object(candidate)
              ? Number((candidate as { legacyId?: number }).legacyId)
              : candidate,
          ),
        )
        .filter(Boolean)

      return people.length
        ? [
            {
              blockType: 'peopleList',
              selectionMode,
              people,
              ...(selectionMode === 'team' && team ? { team } : {}),
              presentation: team === 'careers' ? 'careersCarousel' : 'leadershipGrid',
            },
          ]
        : []
    }
    case 'clients': {
      const category = asObject(component.category)
      const items = entityItemsFrom(category.specific || category.single, reusables, links)
      return items.length
        ? [
            {
              blockType: 'entityList',
              kind: layout,
              items,
            },
          ]
        : []
    }
    case 'timeline': {
      const items = asArray(component.content)
        .map((candidate) => {
          const item = asObject(candidate)
          const label = htmlToPlainText(item.point_text)
          const title = htmlToPlainText(item.text)
          if (!label && !title) return null
          return {
            label: label || 'Milestone',
            title,
          }
        })
        .filter(Boolean) as Record<string, unknown>[]
      return items.length ? [{ blockType: 'timeline', items }] : []
    }
    case 'market-matrix': {
      // The reference embeds the same venue connectivity matrix the dedicated page renders and
      // exposes no per-placement configuration, so the managed defaults carry it.
      return [
        {
          blockType: 'marketMatrix',
          caption: htmlToPlainText(component.title) || 'Trayport venue connectivity by market hub',
          assetClasses: [],
          venueTypes: [],
          regions: [],
          defaultView: 'joule',
          showFilters: true,
          showDownload: true,
        },
      ]
    }
    case 'table': {
      const table = asObject(component.table)
      const fields = asObject(table.fields)
      const headers = asArray(fields.header).map((cell) => ({
        text: htmlToPlainText(asObject(cell).c ?? cell),
      }))
      const rows = asArray(fields.body).map((row) => ({
        cells: asArray(row).map((cell) => ({
          text: htmlToPlainText(asObject(cell).c ?? cell),
        })),
      }))
      return [
        {
          blockType: 'dataTable',
          caption: htmlToPlainText(table.title || fields.caption),
          headers,
          rows,
        },
      ]
    }
    case 'gallery': {
      const items = asArray(component.gallery || component.images || component.content)
        .map((candidate) => {
          const item = asObject(candidate)
          const media = mediaToken(item.image || item.media || candidate)
          return media
            ? {
                media,
                caption: asString(item.caption),
              }
            : null
        })
        .filter(Boolean) as Record<string, unknown>[]
      return items.length ? [{ blockType: 'gallery', items }] : []
    }
    case 'checklist': {
      const items = asArray(component.items)
        .slice(0, 24)
        .flatMap((candidate) => {
          const item = asObject(candidate)
          const text = htmlToPlainText(item.item)
          if (!text) return []
          const title = htmlToPlainText(item.header)
          return [
            {
              ...(title ? { title } : {}),
              text,
            },
          ]
        })
      return items.length
        ? [
            {
              appearance: 'checks',
              blockType: 'checklist',
              items,
            },
          ]
        : []
    }
    case 'lifecycle': {
      const lifecycleItems = lifecycleReferencesFrom(component.category, reusables)
      return lifecycleItems.length
        ? [
            {
              blockType: 'lifecycle',
              caption: 'Product lifecycle schedule',
              lifecycleItems,
              previousHeading: 'Previous Versions',
              showDescriptions: false,
              upcomingHeading: 'Upcoming End-of-Life Details',
            },
          ]
        : []
    }
    case 'divider':
      return [{ blockType: 'divider', style: 'line' }]
    case 'connections': {
      return [marketCoverageFrom(component, 'summary')]
    }
    case 'markets-map':
      return [marketCoverageFrom(component, 'mapOnly')]
    case 'regions': {
      const category = asObject(component.category)
      const items = regionFeatureItemsFrom(category.specific || category.single)
      return items.length ? [{ blockType: 'featureList', presentation: 'grid', items }] : []
    }
    case 'charts-new': {
      const assetClassLegacyID = Number(component.asset_class) || null
      const sourceType = asString(component.chart_type)
      const range = dataChartRangeFromLegacy(component)
      const seriesDimension = asString(component.for) === 'trade_type' ? 'executionType' : 'hub'

      return [
        {
          blockType: 'dataChart',
          title: asString(component.title) || 'Market data',
          dataType: asString(component.data_type) === 'price' ? 'price' : 'volume',
          chartType: sourceType.includes('stacked')
            ? 'stackedColumn'
            : sourceType.includes('line')
              ? 'line'
              : 'column',
          seriesDimension,
          displayInterval: dataChartDisplayInterval(component.display_interval),
          unit: asString(component.unit),
          assetClass: assetClassLegacyID ? legacyRef('asset-class', assetClassLegacyID) : null,
          includedHubs: dataChartHubReferences(component.hubs),
          excludedHubs: dataChartHubReferences(component.excluded_hubs),
          assetClassLegacyId: assetClassLegacyID,
          ...(range || {}),
          axisLabel: asString(component.y_axis_text),
          height: Math.min(Math.max(Number(component.height) || 350, 280), 560),
          scalePower: Math.min(Math.max(Number(component.power) || 0, 0), 12),
          showAxes: asString(component.show_axes) !== '0',
          showLegend: asString(component.show_legend) !== '0',
          showValues: asString(component.show_values_on_chart) === '1',
          showDataTable: true,
          accessibleSummary:
            'Chart series are supplied by the application market-data store rather than Payload.',
        },
      ]
    }
    case 'office': {
      const category = asObject(component.category)
      const officeId = referenceId(category.single, 'post')
      const office = officeId ? legacyRef('office', officeId) : null
      return office
        ? [
            {
              blockType: 'office',
              office,
              appearance: asString(category.style) === 'dark' ? 'featured' : 'standard',
            },
          ]
        : []
    }
    case 'form': {
      const form = hubSpotFormComponentFromWordPress(component)
      if (form) return [form]
      coverage.ignoredComponentLayouts.form = {
        count: (coverage.ignoredComponentLayouts.form?.count || 0) + 1,
        reason: 'Legacy form has no valid HubSpot form UUID.',
      }
      return []
    }
    case 'icon': {
      const icon = normalizedStandaloneIcon(component.icon)
      if (!icon) {
        coverage.ignoredComponentLayouts.icon = {
          count: (coverage.ignoredComponentLayouts.icon?.count || 0) + 1,
          reason: 'Legacy icon is outside the bounded standalone icon vocabulary.',
        }
        return []
      }
      return [{ blockType: 'standaloneIcon', icon }]
    }
    default:
      coverage.unsupportedComponentLayouts.push(layout)
      return []
  }
}

const activeBackgroundTone = (background: Record<string, NormalizedValue>): string => {
  const color = asObject(background.background_color)
  const style = asString(color.style)
  const light = asString(color.light).toLowerCase()

  if (style === 'dark') return 'dark'
  if (style === 'light' && light === '#eff7ff') return 'softBlue'
  if (style === 'light' && ['#fff', '#ffffff'].includes(light)) return 'white'
  return 'none'
}

const activeColumnSurface = (column: Record<string, NormalizedValue>): string => {
  const background = asObject(column.background_color)
  if (asString(background.style) !== 'light') return 'none'
  const color = asString(background.light).toLowerCase()
  if (color === '#eff7ff') return 'soft'
  return ['#eeeeee', '#f4f4f4', '#f5f5f5', '#fafafa'].includes(color) ? 'muted' : 'none'
}

const hasActiveBorder = (column: Record<string, NormalizedValue>): boolean => {
  const color = asObject(asObject(column.border).background_color)
  const style = asString(color.style)
  return style === 'light'
    ? Boolean(asString(color.light))
    : style === 'dark'
      ? Boolean(asString(color.dark))
      : false
}

const spacingValue = (value: unknown): 'tight' | 'regular' | 'large' => {
  const spacing = asString(value)
  if (spacing.includes('tight')) return 'tight'
  if (spacing.includes('large')) return 'large'
  return 'regular'
}

const mapHero = (
  section: Record<string, NormalizedValue>,
  reusables: ReusableLookup,
  links: ManagedLinkLookup,
): TargetSection => {
  const hero = asObject(section.hero)
  const settings = asObject(hero.settings)
  const content = asObject(hero.new_content || hero.content)
  const header = asObject(content.header)
  const subheader = asObject(content.subheader)
  const video = asObject(content.video)
  const videoMedia = asObject(video.video)
  const importedVideo = mediaToken(video.video)
  const externalVideoURL = asString(videoMedia.url)
  const isLegacyLocalVideo = /^https?:\/\/trayport\.local\/app\/uploads\//i.test(externalVideoURL)
  const backgroundType = asString(settings.bg_type)
  const selectsVideo = backgroundType === 'video'
  const selectsImage = backgroundType !== 'video' && backgroundType !== 'none'
  const media = selectsVideo ? importedVideo : selectsImage ? mediaToken(content.image) : null
  const selectedExternalVideoURL =
    selectsVideo && !importedVideo && !isLegacyLocalVideo ? externalVideoURL : ''
  const statisticsID = referenceId(content.stats_group, 'post')
  const statisticsSource = statisticsID ? reusables.get(statisticsID) : undefined
  const statistics = asArray(statisticsSource?.data.stats)
    .map((candidate) => {
      const item = asObject(candidate)
      const data = asObject(item.data)
      const value = `${asString(data.prefix)}${asString(data.number)}${asString(data.suffix)}`
      const label = htmlToPlainText(item.description || item.title)
      return value && label ? { value, label } : null
    })
    .filter(Boolean)
  const buttonStyle = asString(content.button_style)
  const selectedActions =
    buttonStyle === 'links'
      ? actionsFrom(content.links, links)
      : buttonStyle === 'buttons'
        ? actionsFrom(content.buttons, links)
        : []
  const badge = asObject(content.badge)
  const badgeLink = asObject(badge.new_link)
  const badgeLabel = htmlToPlainText(badgeLink.title)
  const badgeIcon = normalizedBadgeIcon(badge.icon)
  const badgeTone = asString(badge.style) === 'info' ? 'info' : 'secondary'
  const mediaAspect = asString(settings.aspect) === '[16/9]' ? 'sixteenToNine' : 'twoToOne'

  return {
    blockType: 'trayportHero',
    eyebrow: htmlToPlainText(asObject(content.badge).text),
    ...(badgeLabel ? { badgeLabel } : {}),
    ...(badgeIcon ? { badgeIcon } : {}),
    badgeTone,
    heading: htmlToPlainText(header.text) || 'Trayport',
    body: htmlToLexical(subheader.text || content.subtitle),
    media,
    externalVideoURL: selectedExternalVideoURL,
    mediaAspect,
    actions: selectedActions,
    statistics,
    appearance: media || selectedExternalVideoURL ? 'image' : 'dark',
  }
}

const mapColumnsSection = (
  section: Record<string, NormalizedValue>,
  coverage: TransformCoverage,
  reusables: ReusableLookup,
  links: ManagedLinkLookup,
): TargetSection | null => {
  const sourceColumns =
    asString(section.acf_fc_layout) === 'single'
      ? [
          {
            acfe_layout_col: '12',
            components: section.components || [],
          } as unknown as NormalizedValue,
        ]
      : asArray(section.columns)

  const columns = sourceColumns
    .map((columnValue) => {
      const column = asObject(columnValue)
      const components = asArray(column.components)
        .filter(Boolean)
        .flatMap((component) => mapComponent(component, coverage, reusables, links))
      for (let index = 0; index < components.length - 1; index += 1) {
        const current = components[index]
        const next = components[index + 1]
        if (
          current?.blockType === 'heading' &&
          current.level === 'h4' &&
          current.eyebrow === current.text &&
          next?.blockType === 'heading'
        ) {
          next.eyebrow = current.text
          components.splice(index, 1)
          index -= 1
        }
      }
      if (!components.length) return null

      const rawSpan = asString(column.acfe_layout_col)
      const span = ['4', '6', '8', '12'].includes(rawSpan) ? rawSpan : '12'
      const hasImage = asString(column.has_image) === '1'
      const backgroundMedia = hasImage ? mediaToken(column.image) : null
      const opacity = asString(column.opacity)
      return {
        span,
        horizontalAlign: asString(column.align) === 'center' ? 'center' : 'left',
        verticalAlign: asString(column.valign) === 'center' ? 'center' : 'start',
        heightMode: asString(column.height) === 'content' ? 'content' : 'fill',
        componentGap:
          asString(column.component_spacing) === 'component-space-none' ? 'none' : 'regular',
        padding: asString(column.padding) === 'column-p-md' ? 'medium' : 'none',
        surface: activeColumnSurface(column),
        border: hasActiveBorder(column) ? 'subtle' : 'none',
        backgroundMedia,
        backgroundOpacity:
          backgroundMedia && ['10', '20', '50'].includes(opacity) ? opacity : 'none',
        radius: asString(column.rounded).includes('xl') ? 'xl' : 'default',
        components,
      }
    })
    .filter(Boolean) as Array<Record<string, unknown> & { components: TargetComponent[] }>

  for (let index = 0; index < columns.length - 1; index += 1) {
    const leadColumn = columns[index]
    const carouselColumn = columns[index + 1]
    const leadFeature = leadColumn?.components[0]
    const carouselFeature = carouselColumn?.components[0]
    const leadItems = Array.isArray(leadFeature?.items) ? leadFeature.items : []
    const carouselItems = Array.isArray(carouselFeature?.items) ? carouselFeature.items : []

    if (
      leadColumn?.span === '4' &&
      carouselColumn?.span === '8' &&
      leadColumn.components.length === 1 &&
      carouselColumn.components.length === 1 &&
      leadFeature?.blockType === 'featureList' &&
      carouselFeature?.blockType === 'featureList' &&
      leadItems.length === 1 &&
      carouselItems.length >= 4
    ) {
      columns.splice(index, 2, {
        ...leadColumn,
        components: [
          {
            ...leadFeature,
            items: [...leadItems, ...carouselItems],
            presentation: 'leadCarousel',
          },
        ],
        span: '12',
      })
    }
  }

  if (!columns.length) return null

  const settings = asObject(section.new_settings)
  const contentWidth = asString(settings.content_width)
  const contentBackground = asObject(settings.content_background)
  const wrapperBackground = asObject(settings.wrapper_background)
  const wrapperColor = asObject(wrapperBackground.background_color)
  const wrapperStyle = asString(wrapperColor.style)
  const wrapperDark = asString(wrapperColor.dark).toLowerCase()
  const wrapperLight = asString(wrapperColor.light).toLowerCase()
  const wrapperTheme =
    wrapperStyle === 'dark' && wrapperDark === '#32b77b'
      ? 'green'
      : wrapperStyle === 'dark'
        ? 'dark'
        : wrapperStyle === 'light' && wrapperLight === '#eff7ff'
          ? 'softBlue'
          : 'none'
  const legacySettings = asObject(section.settings)
  const rounded = asString(contentBackground.rounded)
  const opacity = asString(contentBackground.opacity)
  const backgroundMedia =
    asString(contentBackground.content_has_image) === '1'
      ? mediaToken(contentBackground.content_bg_image)
      : null
  const surfaceTone = activeBackgroundTone(contentBackground)
  return {
    blockType: 'contentSection',
    anchor: asString(section.anchor),
    surfaceTone,
    wrapperTheme,
    backgroundMedia,
    backgroundOpacity: backgroundMedia && ['10', '20', '50'].includes(opacity) ? opacity : 'none',
    surfaceRadius:
      rounded.includes('large') || asString(legacySettings.style).includes('inset')
        ? 'xl'
        : 'default',
    surfacePadding: surfaceTone !== 'none' || backgroundMedia ? 'medium' : 'none',
    width:
      contentWidth === 'full'
        ? 'wide'
        : contentWidth === 'small'
          ? 'reading'
          : contentWidth === 'medium'
            ? 'standard'
            : 'wide',
    spacingTop: spacingValue(settings.top_spacing),
    spacingBottom: spacingValue(settings.bottom_spacing),
    columnGap: asString(settings.column_gap) === 'tight' ? 'tight' : 'regular',
    columns,
  }
}

export const mapPageLayout = (
  acf: Record<string, NormalizedValue>,
  coverage: TransformCoverage,
  options: {
    appendArticleListing?: boolean
    articleFamily?: 'all' | 'events' | 'insights' | 'news'
    appendLearningVideoListing?: boolean
    marketCoveragePresentation?: 'mapOnly' | 'summary'
    suppressedHeadingTexts?: readonly string[]
  } = {},
  reusables: ReusableLookup = new Map(),
  links: ManagedLinkLookup = new Map(),
): TargetSection[] => {
  const sections = asArray(
    Array.isArray(acf.sections_new) && acf.sections_new.length ? acf.sections_new : acf.sections,
  )
  const blocks: TargetSection[] = []

  for (const sectionValue of sections) {
    const section = asObject(sectionValue)
    const layout = asString(section.acf_fc_layout)
    count(coverage.topLevelLayouts, layout || '(missing)')

    if (layout === 'hero') {
      blocks.push(mapHero(section, reusables, links))
      continue
    }
    if (layout === 'columns' || layout === 'single') {
      const block = mapColumnsSection(section, coverage, reusables, links)
      if (block) blocks.push(block)
      continue
    }
    // A table authored at the top level is the same component the reference renders inside a
    // section, so wrap it in a reading-width section rather than introducing a second table path.
    if (layout === 'table') {
      const mapped = mapComponent(section, coverage, reusables, links)
      if (mapped.length) {
        blocks.push({
          blockType: 'contentSection',
          anchor: asString(section.anchor),
          surfaceTone: 'white',
          wrapperTheme: 'none',
          backgroundOpacity: 'none',
          surfaceRadius: 'default',
          surfacePadding: 'none',
          width: 'reading',
          spacingTop: 'regular',
          spacingBottom: 'regular',
          columnGap: 'regular',
          columns: [
            {
              span: '12',
              horizontalAlign: 'left',
              verticalAlign: 'start',
              heightMode: 'fill',
              componentGap: 'regular',
              padding: 'none',
              surface: 'none',
              border: 'none',
              backgroundOpacity: 'none',
              radius: 'default',
              components: mapped,
            },
          ],
        })
      }
      continue
    }

    coverage.unsupportedTopLevelLayouts.push(layout || '(missing)')
  }

  if (options.marketCoveragePresentation || options.suppressedHeadingTexts?.length) {
    const suppressedHeadingTexts = new Set(options.suppressedHeadingTexts || [])

    for (const block of blocks) {
      if (block.blockType !== 'contentSection' || !Array.isArray(block.columns)) continue

      block.columns = block.columns
        .map((columnValue) => {
          const column = asObject(columnValue)
          const components = asArray(column.components).flatMap((componentValue) => {
            const component = asObject(componentValue)
            if (
              component.blockType === 'heading' &&
              suppressedHeadingTexts.has(asString(component.text))
            ) {
              return []
            }
            if (component.blockType === 'marketCoverage' && options.marketCoveragePresentation) {
              return [{ ...component, presentation: options.marketCoveragePresentation }]
            }
            return [component]
          })

          return components.length ? [{ ...column, components }] : []
        })
        .flat()
    }
  }

  if (options.appendArticleListing) {
    blocks.push({
      blockType: 'articleListing',
      family: options.articleFamily || 'insights',
      heading: (
        {
          all: 'Latest news, events and insights',
          events: 'Upcoming and past events',
          insights: 'Latest insights',
          news: 'Latest news',
        } as Record<string, string>
      )[options.articleFamily || 'insights'],
      pageSize: 100,
      showCategoryFilter: true,
    })
  }

  if (options.appendLearningVideoListing) {
    blocks.push({
      blockType: 'learningVideoListing',
      heading: 'Explore the Learning Hub',
      pageSize: 15,
      showCategoryFilter: true,
      showProductFilter: true,
    })
  }

  return blocks
}

const companyDataHTML = (source: SourceReusable): string => {
  const fields = [
    ['name', 'Name'],
    ['company_type', 'Company Type'],
    ['nature_of_business', 'Nature of Business'],
    ['professional_law', 'Professional Law'],
    ['phone', 'Phone'],
    ['email', 'Email'],
    ['vat_id', 'VAT ID'],
    ['company_number', 'Company Number'],
    ['commercial_register', 'Commercial Register'],
    ['registered_in', 'Registered In'],
    ['registered_office', 'Registered Office'],
    ['directors', 'Directors'],
    ['company_secretary', 'Company Secretary'],
  ] as const

  return fields
    .flatMap(([field, label]) => {
      const rawValue = source.data[field]
      const value = Array.isArray(rawValue)
        ? rawValue
            .map((item) => asString(item))
            .filter(Boolean)
            .join(', ')
        : asString(rawValue)
      if (!value) return []
      if (/\[[^\]]+\]/.test(value)) {
        throw new Error(
          `Company-data reusable ${source.legacyId} retains unresolved shortcode content in ${field}.`,
        )
      }

      return [`<p><strong>${label}</strong><br>${value}</p>`]
    })
    .join('')
}

export const mapArticleLayout = (
  sectionsValue: unknown,
  coverage: TransformCoverage,
  links: ManagedLinkLookup = new Map(),
  reusables: ReusableLookup = new Map(),
): TargetSection[] => {
  const blocks: TargetSection[] = []

  for (const value of asArray(sectionsValue)) {
    const section = asObject(value)
    const layout = asString(section.acf_fc_layout)
    count(coverage.topLevelLayouts, layout || '(missing)')

    let component: Record<string, NormalizedValue> | null = null
    if (layout === 'media') {
      const selected = section.type === 'video' ? section.video : section.image
      const media = mediaToken(selected)
      if (media) {
        component = {
          acf_fc_layout: 'image',
          image: {
            image: selected,
            caption: section.caption,
            aspect: '[16/9]',
          },
        }
      }
    } else if (layout === 'paragraph') {
      const paragraph = asObject(section.paragraph)
      component = {
        acf_fc_layout: 'paragraph',
        paragraph: paragraph.paragraph,
        text_size: 'regular',
      }
    } else if (layout === 'divider') {
      component = { acf_fc_layout: 'divider' }
    } else if (layout === 'buttons') {
      component = { acf_fc_layout: 'buttons', buttons: section.buttons }
    } else if (layout === 'index-point') {
      component = {
        acf_fc_layout: 'header',
        header: {
          text: section.contents_label,
          tag: 'h2',
        },
      }
    } else if (layout === 'header') {
      component = {
        acf_fc_layout: 'header',
        header: section.header,
      }
    } else if (layout === 'post-content') {
      const postLegacyId = referenceId(asArray(section.post)[0], 'post')
      const source = postLegacyId ? reusables.get(postLegacyId) : undefined
      if (!source || source.postType !== 'company-data') {
        throw new Error(
          `Article post-content requires an exported company-data reusable; received ${postLegacyId || 'no source ID'}.`,
        )
      }
      component = {
        acf_fc_layout: 'paragraph',
        paragraph: companyDataHTML(source),
        text_size: 'regular',
      }
    } else if (layout === 'form') {
      component = {
        ...section,
        acf_fc_layout: 'form',
      }
    } else if (layout === 'table') {
      // Articles author tables at the same level as their prose, so they map through the shared
      // table component rather than a section wrapper.
      component = {
        ...section,
        acf_fc_layout: 'table',
      }
    } else {
      coverage.unsupportedTopLevelLayouts.push(layout || '(missing)')
    }

    if (component) {
      const mapped = mapComponent(component, coverage, new Map(), links)
      const block: TargetSection | null = mapped.length
        ? {
            blockType: 'contentSection',
            surfaceTone: 'white',
            wrapperTheme: 'none',
            backgroundOpacity: 'none',
            surfaceRadius: 'default',
            surfacePadding: 'none',
            width: 'reading',
            spacingTop: 'tight',
            spacingBottom: 'tight',
            columnGap: 'regular',
            columns: [
              {
                span: '12',
                horizontalAlign: 'left',
                verticalAlign: 'start',
                heightMode: 'fill',
                componentGap: 'regular',
                padding: 'none',
                surface: 'none',
                border: 'none',
                backgroundOpacity: 'none',
                radius: 'default',
                components: mapped,
              },
            ],
          }
        : null
      if (block) {
        if (layout === 'index-point') block.anchor = asString(section.anchor)
        blocks.push(block)
      }
    }
  }

  return blocks
}
