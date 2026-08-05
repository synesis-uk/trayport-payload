// @vitest-environment node

import type { NormalizedValue, SourceRecord } from '../../migration/contracts/v1'
import { footerFromOptions, navigationFromOptions } from '../../migration/transform'
import { mapPageLayout } from '../../migration/transform/blocks'
import { htmlToLexical } from '../../migration/transform/lexical'
import type { TransformCoverage } from '../../migration/transform/types'
import { migrationDestination } from '../../migration/transform/url'
import { managedLexicalLinkCollections, managedLexicalLinkFields } from '@/fields/defaultLexical'
import { describe, expect, it } from 'vitest'

type TestTextField = {
  hooks?: {
    beforeValidate?: Array<(args: Record<string, unknown>) => unknown>
  }
  name?: string
  validate?: (value: unknown, options?: Record<string, unknown>) => unknown
}

type LexicalNode = {
  children?: LexicalNode[]
  fields?: {
    linkType?: string
    newTab?: boolean
    url?: string
  }
  text?: string
  tag?: string
  type?: string
  value?: number
}

type SourceOptions = Extract<SourceRecord, { entity: 'options' }>

const coverage = (): TransformCoverage => ({
  componentLayouts: {},
  ignoredComponentLayouts: {},
  topLevelLayouts: {},
  ignoredTaxonomies: {},
  unsupportedComponentLayouts: [],
  unsupportedTopLevelLayouts: [],
})

const lexicalChildren = (value: Record<string, unknown>): LexicalNode[] =>
  ((value.root as LexicalNode | undefined)?.children || []) as LexicalNode[]

const descendantLinks = (nodes: LexicalNode[]): LexicalNode[] =>
  nodes.flatMap((node) => [
    ...(node.type === 'link' ? [node] : []),
    ...descendantLinks(node.children || []),
  ])

const descendantText = (nodes: LexicalNode[]): string =>
  nodes.map((node) => node.text || descendantText(node.children || [])).join('')

const buttonLayout = (url: string) =>
  mapPageLayout(
    {
      sections_new: [
        {
          acf_fc_layout: 'single',
          components: [
            {
              acf_fc_layout: 'buttons',
              buttons: [
                {
                  new_link: {
                    target: '_blank',
                    title: 'Imported action',
                    url,
                  },
                  style: 'primary',
                },
              ],
            },
          ],
        },
      ],
    } satisfies Record<string, NormalizedValue>,
    coverage(),
  )

describe('rich-text and imported-link URL security', () => {
  it('offers every routable managed content collection to rich-text editors', () => {
    expect(managedLexicalLinkCollections).toEqual([
      'pages',
      'articles',
      'hubs',
      'venues',
      'learning-videos',
    ])
  })

  it('normalizes and validates the custom URL field installed in the Payload editor', async () => {
    const fields = managedLexicalLinkFields({
      config: {} as never,
      defaultFields: [
        { name: 'linkType', type: 'radio' },
        { name: 'url', type: 'text' },
      ] as never,
    }) as TestTextField[]
    const urlFields = fields.filter(({ name }) => name === 'url')
    expect(urlFields).toHaveLength(1)

    const urlField = urlFields[0]
    const normalize = urlField?.hooks?.beforeValidate?.[0]
    expect(normalize).toBeTypeOf('function')
    expect(urlField?.validate).toBeTypeOf('function')

    await expect(
      Promise.resolve(normalize?.({ siblingData: { linkType: 'custom' }, value: ' /contact ' })),
    ).resolves.toBe('/contact/')
    await expect(
      Promise.resolve(
        normalize?.({
          siblingData: { linkType: 'custom' },
          value: ' HTTPS://Example.COM/reports ',
        }),
      ),
    ).resolves.toBe('https://example.com/reports')
    await expect(
      Promise.resolve(
        normalize?.({ siblingData: { linkType: 'custom' }, value: ' javascript:alert(1) ' }),
      ),
    ).resolves.toBe('javascript:alert(1)')
    await expect(
      Promise.resolve(normalize?.({ siblingData: { linkType: 'internal' }, value: ' untouched ' })),
    ).resolves.toBe(' untouched ')

    for (const value of [
      '/contact/',
      '#details',
      'mailto:editor@example.com',
      'tel:+44 20 7960 5500',
      'https://example.com/reports',
    ]) {
      await expect(
        Promise.resolve(urlField?.validate?.(value, { siblingData: { linkType: 'custom' } })),
      ).resolves.toBe(true)
    }

    for (const value of [
      'javascript:alert(1)',
      'data:text/html,unsafe',
      'https://user:secret@example.com/private',
    ]) {
      await expect(
        Promise.resolve(urlField?.validate?.(value, { siblingData: { linkType: 'custom' } })),
      ).resolves.toEqual(expect.any(String))
    }
    await expect(
      Promise.resolve(urlField?.validate?.(undefined, { siblingData: { linkType: 'custom' } })),
    ).resolves.toBe('Add a destination URL.')
    await expect(
      Promise.resolve(urlField?.validate?.(undefined, { siblingData: { linkType: 'internal' } })),
    ).resolves.toBe(true)
  })

  it('keeps only bounded migration destinations and rejects credentials before path rewriting', () => {
    expect(migrationDestination('/contact/')).toBe('/contact/')
    expect(migrationDestination('http://trayport.local/eex-news/')).toBe('/eex-news/')
    expect(migrationDestination('#details')).toBe('#details')
    expect(migrationDestination('mailto:editor@example.com')).toBe('mailto:editor@example.com')
    expect(migrationDestination('tel:+44 20 7960 5500')).toBe('tel:+44 20 7960 5500')
    expect(migrationDestination('https://external.example/report')).toBe(
      'https://external.example/report',
    )
    expect(migrationDestination('http://trayport.local/not-yet-owned/')).toBe(
      'https://www.trayport.com/not-yet-owned/',
    )

    expect(migrationDestination('javascript:alert(1)')).toBeNull()
    expect(migrationDestination('data:text/html,unsafe')).toBeNull()
    expect(migrationDestination('https://user:secret@example.com/private')).toBeNull()
    expect(migrationDestination('http://user:secret@trayport.local/contact/')).toBeNull()
  })

  it('de-links unsafe imported HTML while retaining its text and safe new-tab metadata', () => {
    const lexical = htmlToLexical(`
      <p>
        <a href="javascript:alert(1)" target="_blank">Script</a>
        <a href="data:text/html,unsafe">Data</a>
        <a href="https://user:secret@example.com/private">Credentials</a>
        <a href="/contact/">Internal</a>
        <a href="#details">Anchor</a>
        <a href="mailto:editor@example.com">Email</a>
        <a href="tel:+44 20 7960 5500">Phone</a>
        <a href="https://external.example/report" target="_blank">HTTPS</a>
      </p>
    `)
    const children = lexicalChildren(lexical)
    const links = descendantLinks(children)

    expect(descendantText(children).replace(/\s+/g, ' ').trim()).toBe(
      'Script Data Credentials Internal Anchor Email Phone HTTPS',
    )
    expect(links.map((node) => node.fields?.url)).toEqual([
      '/contact/',
      '#details',
      'mailto:editor@example.com',
      'tel:+44 20 7960 5500',
      'https://external.example/report',
    ])
    expect(links.at(-1)?.fields).toMatchObject({ newTab: true })
    expect(links.some((node) => node.fields?.url?.startsWith('javascript:'))).toBe(false)
    expect(links.some((node) => node.fields?.url?.startsWith('data:'))).toBe(false)
  })

  it('preserves nested block, heading, ordered-list, and nested-list semantics', () => {
    const children = lexicalChildren(
      htmlToLexical(`
        <div class="legacy-wrapper">
          <h3>1. First section</h3>
          <p>Paragraph with <strong>bold text</strong>.</p>
          <ol start="3">
            <li>Third item<ul><li>Nested bullet</li></ul></li>
            <li value="8">Eighth item</li>
          </ol>
          <h5>Bounded heading</h5>
        </div>
      `),
    )

    expect(children.map(({ type }) => type)).toEqual(['heading', 'paragraph', 'list', 'heading'])
    expect(children[0]).toMatchObject({ tag: 'h3', type: 'heading' })
    expect(children[3]).toMatchObject({ tag: 'h4', type: 'heading' })
    expect(children[2]).toMatchObject({ listType: 'number', start: 3, tag: 'ol' })
    expect(children[2]?.children?.map(({ value }) => value)).toEqual([3, 8])
    expect(children[2]?.children?.[0]?.children?.at(-1)).toMatchObject({
      listType: 'bullet',
      tag: 'ul',
      type: 'list',
    })
    expect(descendantText(children)).toContain(
      '1. First sectionParagraph with bold text.Third itemNested bulletEighth itemBounded heading',
    )
  })

  it('drops unsafe imported action destinations instead of emitting nullable links', () => {
    expect(buttonLayout('javascript:alert(1)')).toEqual([])
    expect(buttonLayout('data:text/html,unsafe')).toEqual([])
    expect(buttonLayout('https://user:secret@example.com/private')).toEqual([])
    expect(buttonLayout('http://user:secret@trayport.local/contact/')).toEqual([])

    const safeLayout = buttonLayout('https://external.example/report')
    expect(safeLayout).toMatchObject([
      {
        columns: [
          {
            components: [
              {
                actions: [
                  {
                    label: 'Imported action',
                    link: {
                      newTab: true,
                      type: 'custom',
                      url: 'https://external.example/report',
                    },
                  },
                ],
                blockType: 'actions',
              },
            ],
          },
        ],
      },
    ])
  })

  it('reconciles nullable shell links by omitting unsafe navigation and footer destinations', () => {
    const unsafePageLink = {
      acf_fc_layout: 'page_link',
      page_link: {
        link: {
          target: '_blank',
          title: 'Unsafe destination',
          url: 'javascript:alert(1)',
        },
      },
    }
    const options: SourceOptions = {
      schemaVersion: 1,
      entity: 'options',
      values: {
        dropdown: [
          {
            for_page: 'data:text/html,unsafe',
            menu_block: [{ acfe_layout_col: '2', menu_items: [unsafePageLink] }],
            title: 'Unsafe group',
          },
        ],
        footer_new: {
          menu_block: [{ menu_items: [unsafePageLink] }],
        },
      },
    }

    const navigation = navigationFromOptions(options)
    const footer = footerFromOptions(options)

    expect(navigation).toMatchObject({
      primaryItems: [{ children: [], groups: [], label: 'Unsafe group' }],
    })
    expect((navigation.primaryItems as Array<Record<string, unknown>>)[0]).not.toHaveProperty(
      'link',
    )
    expect(footer).toMatchObject({ columns: [{ links: [] }] })
    expect(JSON.stringify({ footer, navigation })).not.toMatch(/javascript:|data:/i)
  })
})
