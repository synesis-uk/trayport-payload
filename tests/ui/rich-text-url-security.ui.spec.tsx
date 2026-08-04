import type { ComponentProps } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, ...props }: ComponentProps<'a'>) => (
    <a data-next-link="true" {...props}>
      {children}
    </a>
  ),
}))

import RichText from '@/components/RichText'
import { htmlToLexical } from '../../migration/transform/lexical'

type RichTextData = ComponentProps<typeof RichText>['data']
type LinkKind = 'autolink' | 'link'

const textNode = (text: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

const linkNode = (
  label: string,
  url: string,
  { kind = 'link', newTab = false }: { kind?: LinkKind; newTab?: boolean } = {},
) => ({
  type: kind,
  children: [textNode(label)],
  direction: 'ltr',
  fields: {
    linkType: 'custom',
    newTab,
    url,
  },
  format: '',
  indent: 0,
  version: kind === 'link' ? 3 : 2,
})

const internalLinkNode = (label: string, path: string) => ({
  type: 'link',
  children: [textNode(label)],
  direction: 'ltr',
  fields: {
    doc: {
      relationTo: 'pages',
      value: { id: 'page-1', path },
    },
    linkType: 'internal',
    newTab: false,
  },
  format: '',
  indent: 0,
  version: 3,
})

const editorState = (nodes: Array<Record<string, unknown>>): RichTextData =>
  ({
    root: {
      type: 'root',
      children: nodes.map((node) => ({
        type: 'paragraph',
        children: [node],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }) as RichTextData

describe('RichText link URL security', () => {
  it('renders imported headings and nested lists as native document structure', () => {
    render(
      <RichText
        data={
          htmlToLexical(`
            <div>
              <h3>Cookie categories</h3>
              <p>Choose the categories you permit.</p>
              <ol start="3">
                <li>Analytics<ul><li>Audience measurement</li></ul></li>
                <li>Preferences</li>
              </ol>
            </div>
          `) as RichTextData
        }
        enableGutter={false}
      />,
    )

    expect(screen.getByRole('heading', { level: 3, name: 'Cookie categories' })).toBeTruthy()
    const lists = screen.getAllByRole('list')
    expect(lists).toHaveLength(2)
    expect(lists[0]?.tagName).toBe('OL')
    expect(lists[1]?.tagName).toBe('UL')
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]?.getAttribute('value')).toBe('3')
  })

  it('renders the bounded link vocabulary, including managed internal content', () => {
    render(
      <RichText
        data={editorState([
          internalLinkNode('Managed internal', '/company/about-us/'),
          linkNode('Custom internal', '/contact'),
          linkNode('Anchor', '#details'),
          linkNode('Email', 'mailto:editor@example.com'),
          linkNode('Phone', 'tel:+44 20 7960 5500'),
          linkNode('HTTPS', 'https://example.com/report'),
          linkNode('Autolink', 'https://example.com/automatic', { kind: 'autolink' }),
        ])}
        enableGutter={false}
      />,
    )

    expect(screen.getByRole('link', { name: 'Managed internal' }).getAttribute('href')).toBe(
      '/company/about-us/',
    )
    const managedInternal = screen.getByRole('link', { name: 'Managed internal' })
    const customInternal = screen.getByRole('link', { name: 'Custom internal' })
    expect(managedInternal.dataset.nextLink).toBe('true')
    expect(customInternal.getAttribute('href')).toBe('/contact/')
    expect(customInternal.dataset.nextLink).toBe('true')
    expect(screen.getByRole('link', { name: 'Anchor' }).getAttribute('href')).toBe('#details')
    expect(screen.getByRole('link', { name: 'Email' }).getAttribute('href')).toBe(
      'mailto:editor@example.com',
    )
    expect(screen.getByRole('link', { name: 'Phone' }).getAttribute('href')).toBe(
      'tel:+44 20 7960 5500',
    )
    expect(screen.getByRole('link', { name: 'HTTPS' }).getAttribute('href')).toBe(
      'https://example.com/report',
    )
    expect(screen.getByRole('link', { name: 'HTTPS' }).dataset.nextLink).toBeUndefined()
    expect(screen.getByRole('link', { name: 'Autolink' }).getAttribute('href')).toBe(
      'https://example.com/automatic',
    )
  })

  it.each([
    ['Script', 'javascript:alert(1)', 'link'],
    ['Data', 'data:text/html,unsafe', 'link'],
    ['Credentials', 'https://user:secret@example.com/private', 'link'],
    ['Autolink script', 'javascript:alert(1)', 'autolink'],
  ] as const)('de-links unsafe %s destinations while preserving their text', (label, url, kind) => {
    render(
      <RichText
        data={editorState([linkNode(label, url, { kind, newTab: true })])}
        enableGutter={false}
      />,
    )

    expect(screen.getByText(label)).not.toBeNull()
    expect(screen.queryByRole('link', { name: label })).toBeNull()
  })

  it('protects safe new-tab links and omits target metadata for ordinary links', () => {
    render(
      <RichText
        data={editorState([
          linkNode('New tab link', 'https://example.com/report', { newTab: true }),
          linkNode('Same tab link', '/contact/'),
          linkNode('New tab autolink', 'https://example.com/automatic', {
            kind: 'autolink',
            newTab: true,
          }),
        ])}
        enableGutter={false}
      />,
    )

    for (const label of ['New tab link', 'New tab autolink']) {
      const link = screen.getByRole('link', { name: label })
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    }

    const sameTab = screen.getByRole('link', { name: 'Same tab link' })
    expect(sameTab.getAttribute('target')).toBeNull()
    expect(sameTab.getAttribute('rel')).toBeNull()
  })
})
