import type { NormalizedValue, SourceReusable } from '../contracts/v1'
import { asArray, asObject, asString, legacyRef, mediaToken, referenceId } from './helpers'
import { htmlToLexical, htmlToPlainText } from './lexical'
import type { LegacyReference, TransformCoverage } from './types'

type TargetComponent = Record<string, unknown> & { blockType: string }
type TargetSection = Record<string, unknown> & { blockType: string }
export type ReusableLookup = Map<number, SourceReusable>
export type ManagedLinkLookup = Map<
  number,
  {
    kind: LegacyReference['$legacyRef']
    relationTo: 'articles' | 'hubs' | 'learning-videos' | 'pages' | 'venues'
  }
>

const count = (target: Record<string, number>, key: string): void => {
  target[key] = (target[key] || 0) + 1
}

const normalizedFeatureIcon = (value: unknown): string | undefined => {
  const icon = asString(value)
  if (icon === 'arrow-trend-up') return 'trend'
  return ['lightbulb', 'trend', 'clock', 'chart', 'scan'].includes(icon) ? icon : undefined
}

const liveFallbackURL = (value: string): string => {
  if (/^(?:#|mailto:|tel:)/i.test(value)) return value
  try {
    const url = new URL(value, 'http://trayport.local')
    if (
      ['trayport.local', 'prod.trayport.com', 'trayport.com', 'www.trayport.com'].includes(
        url.hostname,
      )
    ) {
      return new URL(
        `${url.pathname}${url.search}${url.hash}`,
        'https://www.trayport.com',
      ).toString()
    }
  } catch {
    return value
  }
  return value
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
  const style =
    legacyStyle === 'secondary' ? 'secondary' : legacyStyle === 'primary' ? 'primary' : 'link'

  const numericValue = Number(asString(link.value)) || referenceId(link.value, 'post') || 0
  const target =
    Number.isInteger(numericValue) && !url.startsWith('#') ? links.get(numericValue) : null
  const managedLink = target
    ? {
        type: 'reference',
        reference: {
          relationTo: target.relationTo,
          value: legacyRef(target.kind, numericValue),
        },
        newTab: asString(link.target) === '_blank',
      }
    : {
        type: 'custom',
        url: liveFallbackURL(url),
        newTab: asString(link.target) === '_blank',
      }

  return {
    label,
    link: managedLink,
    style,
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
      const rawValue = redirect.value || redirect.post || redirect.page
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

      if (!title && !description && !media) {
        return null
      }

      return {
        title,
        body: htmlToLexical(description),
        ...(icon ? { icon } : {}),
        media,
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
      const tag = asString(header.tag)
      return [
        {
          blockType: 'heading',
          text,
          level: ['h2', 'h3', 'h4'].includes(tag) ? tag : 'h2',
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
      return [
        {
          blockType: 'heading',
          eyebrow: layout === 'preheader' ? text : '',
          text,
          level: layout === 'preheader' ? 'h4' : 'h3',
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
              caption: asString(reusable?.data.name || reusable?.title),
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
              layout: asString(component.layout) === 'stacked' ? 'stacked' : 'grid',
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
    case 'people':
    case 'products':
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
    case 'table': {
      const table = asObject(component.table)
      const fields = asObject(table.fields)
      const headers = asArray(fields.header).map((cell) => ({
        text: htmlToPlainText(asObject(cell).c || cell),
      }))
      const rows = asArray(fields.body).map((row) => ({
        cells: asArray(row).map((cell) => ({
          text: htmlToPlainText(asObject(cell).c || cell),
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
    case 'divider':
      return [{ blockType: 'divider', style: 'line' }]
    case 'connections': {
      const regions = asArray(component.regions)
        .map((term) => legacyRef('region', term))
        .filter(Boolean)
      return [
        {
          blockType: 'marketCoverage',
          title: 'Explore our connectivity',
          regions,
          actions: [],
        },
      ]
    }
    case 'charts-new':
      return [
        {
          blockType: 'dataChart',
          title: asString(component.title) || 'Market data',
          dataType: asString(component.data_type) === 'price' ? 'price' : 'volume',
          unit: asString(component.unit),
          assetClassLegacyId: Number(component.asset_class) || null,
          accessibleSummary:
            'Chart series are supplied by the application market-data store rather than Payload.',
        },
      ]
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
    case 'form':
      coverage.ignoredComponentLayouts.form = {
        count: (coverage.ignoredComponentLayouts.form?.count || 0) + 1,
        reason: 'Legacy HubSpot forms are explicitly deferred from the production pilot.',
      }
      return []
    case 'icon':
      coverage.ignoredComponentLayouts.icon = {
        count: (coverage.ignoredComponentLayouts.icon?.count || 0) + 1,
        reason: 'Decorative legacy icon; presentation is selected by the target component.',
      }
      return []
    default:
      coverage.unsupportedComponentLayouts.push(layout)
      return []
  }
}

const sectionTheme = (section: Record<string, NormalizedValue>): string => {
  const newSettings = asObject(section.new_settings)
  const contentBackground = asObject(newSettings.content_background)
  const color = asObject(contentBackground.background_color)
  const style = asString(color.style)
  const dark = asString(color.dark)
  const light = asString(color.light)

  if (style === 'dark' || dark) return 'dark'
  if (light === '#eff7ff') return 'softBlue'
  return 'light'
}

const mapHero = (
  section: Record<string, NormalizedValue>,
  links: ManagedLinkLookup,
): TargetSection => {
  const hero = asObject(section.hero)
  const content = asObject(hero.new_content || hero.content)
  const header = asObject(content.header)
  const subheader = asObject(content.subheader)
  const video = asObject(content.video)
  const videoMedia = asObject(video.video)
  const importedVideo = mediaToken(video.video)
  const externalVideoURL = asString(videoMedia.url)
  const isLegacyLocalVideo = /^https?:\/\/trayport\.local\/app\/uploads\//i.test(externalVideoURL)

  return {
    blockType: 'trayportHero',
    eyebrow: htmlToPlainText(asObject(content.badge).text),
    heading: htmlToPlainText(header.text) || 'Trayport',
    body: htmlToLexical(subheader.text || content.subtitle),
    media: importedVideo || mediaToken(content.image),
    externalVideoURL: importedVideo || isLegacyLocalVideo ? '' : externalVideoURL,
    actions: [...actionsFrom(content.buttons, links), ...actionsFrom(content.links, links)],
    appearance: content.image || importedVideo || externalVideoURL ? 'image' : 'dark',
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
      return { span, components }
    })
    .filter((column): column is { span: string; components: TargetComponent[] } => Boolean(column))

  if (!columns.length) return null

  const settings = asObject(section.new_settings)
  const contentWidth = asString(settings.content_width)
  return {
    blockType: 'contentSection',
    anchor: asString(section.anchor),
    theme: sectionTheme(section),
    width:
      contentWidth === 'full'
        ? 'wide'
        : contentWidth === 'small'
          ? 'reading'
          : contentWidth === 'medium'
            ? 'standard'
            : 'wide',
    spacing:
      asString(settings.top_spacing).includes('large') ||
      asString(settings.bottom_spacing).includes('large')
        ? 'generous'
        : 'regular',
    columns,
  }
}

export const mapPageLayout = (
  acf: Record<string, NormalizedValue>,
  coverage: TransformCoverage,
  options: {
    appendArticleListing?: boolean
    articleFamily?: 'insights' | 'news'
    appendLearningVideoListing?: boolean
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
      blocks.push(mapHero(section, links))
      continue
    }
    if (layout === 'columns' || layout === 'single') {
      const block = mapColumnsSection(section, coverage, reusables, links)
      if (block) blocks.push(block)
      continue
    }

    coverage.unsupportedTopLevelLayouts.push(layout || '(missing)')
  }

  if (options.appendArticleListing) {
    blocks.push({
      blockType: 'articleListing',
      family: options.articleFamily || 'insights',
      heading: options.articleFamily === 'news' ? 'Latest news' : 'Latest insights',
      pageSize: 12,
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

export const mapArticleLayout = (
  sectionsValue: unknown,
  coverage: TransformCoverage,
  links: ManagedLinkLookup = new Map(),
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
    } else if (layout === 'form') {
      coverage.ignoredComponentLayouts.form = {
        count: (coverage.ignoredComponentLayouts.form?.count || 0) + 1,
        reason: 'Legacy HubSpot forms are explicitly deferred from the production pilot.',
      }
    } else {
      coverage.unsupportedTopLevelLayouts.push(layout || '(missing)')
    }

    if (component) {
      const mapped = mapComponent(component, coverage, new Map(), links)
      const block: TargetSection | null = mapped.length
        ? {
            blockType: 'contentSection',
            theme: 'white',
            width: 'reading',
            spacing: 'compact',
            columns: [{ span: '12', components: mapped }],
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
