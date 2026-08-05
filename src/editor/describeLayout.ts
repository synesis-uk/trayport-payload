type UnknownRecord = Record<string, unknown>

const record = (value: unknown): UnknownRecord | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : null

const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null

const truncate = (value: string, length = 72): string =>
  value.length > length ? `${value.slice(0, length - 1).trimEnd()}…` : value

const firstComponent = (section: UnknownRecord): UnknownRecord | null => {
  const columns = Array.isArray(section.columns) ? section.columns : []
  for (const candidate of columns) {
    const column = record(candidate)
    const components = column && Array.isArray(column.components) ? column.components : []
    for (const component of components) {
      const result = record(component)
      if (result) return result
    }
  }
  return null
}

const componentPrimaryText = (component: UnknownRecord): string | null =>
  text(component.text) ||
  text(component.title) ||
  text(component.caption) ||
  text(component.question) ||
  text(component.label)

const componentNames: Record<string, string> = {
  actions: 'Actions',
  checklist: 'Checklist',
  dataChart: 'Market data chart',
  dataTable: 'Data table',
  divider: 'Divider',
  embed: 'Embed',
  entityList: 'Managed content list',
  faq: 'Frequently asked questions',
  featureList: 'Feature list',
  gallery: 'Gallery',
  heading: 'Heading',
  lifecycle: 'Lifecycle table',
  marketCoverage: 'Market coverage map',
  marketMatrix: 'Market matrix',
  media: 'Media',
  office: 'Office',
  richText: 'Rich text',
  standaloneIcon: 'Icon',
  statistics: 'Statistics',
  timeline: 'Timeline',
}

export const describeComponent = (value: unknown): string => {
  const component = record(value) || {}
  const blockType = text(component.blockType) || 'component'
  const name = componentNames[blockType] || blockType.replace(/([A-Z])/g, ' $1')
  const primary = componentPrimaryText(component)
  return primary ? `${name} — ${truncate(primary)}` : name
}

export const describeColumn = (value: unknown, rowNumber?: number): string => {
  const column = record(value) || {}
  const components = Array.isArray(column.components) ? column.components : []
  const first = components[0]
  const name = first ? describeComponent(first) : `Column ${rowNumber || ''}`.trim()
  const span = text(column.span)
  return span ? `${name} · ${span}/12` : name
}

export const describeLayout = (value: unknown, rowNumber?: number): string => {
  const block = record(value) || {}
  const blockType = text(block.blockType)

  if (blockType === 'trayportHero') {
    return `Hero${text(block.heading) ? ` — ${truncate(text(block.heading) as string)}` : ''}`
  }
  if (blockType === 'articleListing') {
    return `Article listing${text(block.heading) ? ` — ${truncate(text(block.heading) as string)}` : ''}`
  }
  if (blockType === 'learningVideoListing') {
    return `Learning video listing${text(block.heading) ? ` — ${truncate(text(block.heading) as string)}` : ''}`
  }
  if (blockType === 'contentSection') {
    const columns = Array.isArray(block.columns) ? block.columns : []
    const first = firstComponent(block)
    const primary = first ? componentPrimaryText(first) : null
    const specialist = first ? componentNames[text(first.blockType) || ''] : null
    const subject = primary ? truncate(primary) : specialist || 'Content section'
    const details = [
      `${columns.length || 1} ${columns.length === 1 ? 'column' : 'columns'}`,
      text(block.surfaceTone) && block.surfaceTone !== 'none' ? text(block.surfaceTone) : null,
    ].filter(Boolean)
    return `${subject} · ${details.join(' · ')}`
  }

  return `Section ${rowNumber || ''}`.trim()
}
