import { JSDOM } from 'jsdom'

import { migrationDestination } from './url'

type LexicalNode = Record<string, unknown>

const headingTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
const listTags = new Set(['ol', 'ul'])
const blockContainerTags = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'dd',
  'div',
  'dl',
  'dt',
  'figcaption',
  'figure',
  'footer',
  'header',
  'main',
  'nav',
  'pre',
  'section',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
])

const textNode = (text: string, format = 0): LexicalNode => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

const lineBreakNode = (): LexicalNode => ({
  type: 'linebreak',
  version: 1,
})

const inlineNodes = (node: Node, inheritedFormat = 0): LexicalNode[] => {
  if (node.nodeType === 3) {
    const text = node.textContent || ''
    return text ? [textNode(text, inheritedFormat)] : []
  }
  if (node.nodeType !== 1) {
    return []
  }

  const element = node as HTMLElement
  const tag = element.tagName.toLowerCase()
  const nextFormat =
    inheritedFormat |
    (['strong', 'b'].includes(tag) ? 1 : 0) |
    (['em', 'i'].includes(tag) ? 2 : 0) |
    (tag === 'u' ? 8 : 0)

  if (tag === 'br') {
    return [lineBreakNode()]
  }

  if (listTags.has(tag)) {
    return []
  }

  const children = [...element.childNodes].flatMap((child) => inlineNodes(child, nextFormat))

  if (tag === 'a') {
    const url = element.getAttribute('href')
    if (!url || children.length === 0) {
      return children
    }

    const destination = migrationDestination(url)
    if (!destination) {
      return children
    }

    return [
      {
        type: 'link',
        children,
        direction: 'ltr',
        fields: {
          linkType: 'custom',
          newTab: element.getAttribute('target') === '_blank',
          url: destination,
        },
        format: '',
        indent: 0,
        version: 3,
      },
    ]
  }

  return children
}

const paragraphNode = (children: LexicalNode[]): LexicalNode => ({
  type: 'paragraph',
  children: children.length ? children : [textNode('')],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})

const headingNode = (children: LexicalNode[], sourceTag: string): LexicalNode => {
  const sourceLevel = Number(sourceTag.slice(1))
  const level = Math.min(Math.max(sourceLevel, 2), 4)

  return {
    type: 'heading',
    children: children.length ? children : [textNode('')],
    direction: 'ltr',
    format: '',
    indent: 0,
    tag: `h${level}`,
    version: 1,
  }
}

const meaningfulInlineNodes = (nodes: LexicalNode[]): boolean =>
  nodes.some((node) => node.type !== 'text' || String(node.text || '').trim().length > 0)

const integerAttribute = (element: HTMLElement, name: string): number | null => {
  const raw = element.getAttribute(name)
  if (raw === null || !/^-?\d+$/u.test(raw.trim())) return null
  const value = Number(raw)
  return Number.isSafeInteger(value) ? value : null
}

const listItemChildren = (element: HTMLElement): LexicalNode[] => {
  const children: LexicalNode[] = []
  let inlineBuffer: Node[] = []

  const appendInline = (nodes: LexicalNode[]) => {
    if (!meaningfulInlineNodes(nodes)) return
    const previous = children.at(-1)
    if (previous && previous.type !== 'list' && previous.type !== 'linebreak') {
      children.push(lineBreakNode())
    }
    children.push(...nodes)
  }
  const flushInline = () => {
    appendInline(inlineBuffer.flatMap((node) => inlineNodes(node)))
    inlineBuffer = []
  }
  const visit = (node: Node) => {
    if (node.nodeType !== 1) {
      inlineBuffer.push(node)
      return
    }

    const childElement = node as HTMLElement
    const tag = childElement.tagName.toLowerCase()
    if (listTags.has(tag)) {
      flushInline()
      children.push(listNode(childElement))
      return
    }
    if (tag === 'p' || headingTags.has(tag)) {
      flushInline()
      appendInline(inlineNodes(childElement))
      return
    }
    if (blockContainerTags.has(tag)) {
      flushInline()
      for (const child of [...childElement.childNodes]) visit(child)
      flushInline()
      return
    }

    inlineBuffer.push(node)
  }

  for (const child of [...element.childNodes]) visit(child)
  flushInline()
  return children.length ? children : [textNode('')]
}

const listItemNode = (element: HTMLElement, value: number): LexicalNode => ({
  type: 'listitem',
  children: listItemChildren(element),
  direction: 'ltr',
  format: '',
  indent: 0,
  value,
  version: 1,
})

function listNode(element: HTMLElement): LexicalNode {
  const tag = element.tagName.toLowerCase() === 'ol' ? 'ol' : 'ul'
  const start = tag === 'ol' ? (integerAttribute(element, 'start') ?? 1) : 1
  let nextValue = start
  const children = [...element.children].flatMap((child) => {
    if (child.tagName.toLowerCase() !== 'li') return []
    const item = child as HTMLElement
    const value = tag === 'ol' ? (integerAttribute(item, 'value') ?? nextValue) : nextValue
    nextValue = value + 1
    return [listItemNode(item, value)]
  })

  return {
    type: 'list',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    listType: tag === 'ol' ? 'number' : 'bullet',
    start,
    tag,
    version: 1,
  }
}

const blockNodes = (node: Node): LexicalNode[] => {
  if (node.nodeType === 3) {
    const inline = inlineNodes(node)
    return meaningfulInlineNodes(inline) ? [paragraphNode(inline)] : []
  }
  if (node.nodeType !== 1) return []

  const element = node as HTMLElement
  const tag = element.tagName.toLowerCase()
  if (tag === 'p') return [paragraphNode(inlineNodes(element))]
  if (headingTags.has(tag)) return [headingNode(inlineNodes(element), tag)]
  if (listTags.has(tag)) return [listNode(element)]
  if (blockContainerTags.has(tag)) return containerNodes(element)

  const inline = inlineNodes(element)
  return meaningfulInlineNodes(inline) ? [paragraphNode(inline)] : []
}

function containerNodes(element: Element): LexicalNode[] {
  const children: LexicalNode[] = []
  let inlineBuffer: Node[] = []
  const flushInline = () => {
    const inline = inlineBuffer.flatMap((node) => inlineNodes(node))
    if (meaningfulInlineNodes(inline)) children.push(paragraphNode(inline))
    inlineBuffer = []
  }

  for (const child of [...element.childNodes]) {
    const isBlock =
      child.nodeType === 1 &&
      (() => {
        const tag = (child as HTMLElement).tagName.toLowerCase()
        return (
          tag === 'p' || headingTags.has(tag) || listTags.has(tag) || blockContainerTags.has(tag)
        )
      })()

    if (isBlock) {
      flushInline()
      children.push(...blockNodes(child))
    } else {
      inlineBuffer.push(child)
    }
  }
  flushInline()
  return children
}

export const htmlToLexical = (html: unknown): Record<string, unknown> => {
  const value = typeof html === 'string' ? html : ''
  const dom = new JSDOM(`<body>${value}</body>`)
  const { body } = dom.window.document

  for (const unsafe of [...body.querySelectorAll('script, style, iframe, object')]) {
    unsafe.remove()
  }

  const children = containerNodes(body)

  if (children.length === 0) {
    children.push(paragraphNode([textNode('')]))
  }

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

export const htmlToPlainText = (html: unknown): string => {
  if (typeof html !== 'string' || !html) {
    return ''
  }

  const dom = new JSDOM(`<body>${html}</body>`)
  return (dom.window.document.body.textContent || '').replace(/\s+/g, ' ').trim()
}

/**
 * Convert small, presentation-sensitive HTML fragments to editor-friendly plain text while
 * retaining authored block and line-break boundaries. This is intentionally separate from the
 * general plain-text helper: titles, labels, and metadata must continue to collapse whitespace.
 */
export const htmlToMultilinePlainText = (html: unknown): string => {
  if (typeof html !== 'string' || !html) {
    return ''
  }

  const dom = new JSDOM(`<body>${html}</body>`)
  const { document } = dom.window

  document.querySelectorAll('br').forEach((element) => element.replaceWith('\n'))
  document
    .querySelectorAll(
      'address, article, aside, blockquote, div, footer, h1, h2, h3, h4, h5, h6, header, li, main, p, section',
    )
    .forEach((element) => element.append('\n'))

  return (document.body.textContent || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}
