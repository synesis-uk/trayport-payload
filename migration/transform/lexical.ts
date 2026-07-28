import { JSDOM } from 'jsdom'

type LexicalNode = Record<string, unknown>

const textNode = (text: string, format = 0): LexicalNode => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
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
    return [textNode('\n', nextFormat)]
  }

  const children = [...element.childNodes].flatMap((child) => inlineNodes(child, nextFormat))

  if (tag === 'a') {
    const url = element.getAttribute('href')
    if (!url || children.length === 0) {
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
          url,
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

export const htmlToLexical = (html: unknown): Record<string, unknown> => {
  const value = typeof html === 'string' ? html : ''
  const dom = new JSDOM(`<body>${value}</body>`)
  const { body } = dom.window.document

  for (const unsafe of [...body.querySelectorAll('script, style, iframe, object')]) {
    unsafe.remove()
  }

  const children: LexicalNode[] = []
  for (const child of [...body.childNodes]) {
    if (child.nodeType === 3 && !(child.textContent || '').trim()) {
      continue
    }

    if (child.nodeType === 1) {
      const element = child as HTMLElement
      const tag = element.tagName.toLowerCase()

      if (['ul', 'ol'].includes(tag)) {
        for (const item of [...element.querySelectorAll(':scope > li')]) {
          children.push(paragraphNode([textNode('• '), ...inlineNodes(item)]))
        }
        continue
      }

      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        children.push(paragraphNode(inlineNodes(element, 1)))
        continue
      }
    }

    children.push(paragraphNode(inlineNodes(child)))
  }

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
