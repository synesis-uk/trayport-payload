import {
  type DefaultNodeTypes,
  type DefaultTypedEditorState,
  type SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import {
  type JSXConvertersFunction,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { safeDestination } from '@/routing/urlPolicy'
import { cn } from '@/utilities/ui'

type LinkedDocument = {
  path?: string | null
  slug?: string | null
}

const RichTextLink = ({
  children,
  href,
  newTab,
}: {
  children: ReactNode
  href: string
  newTab?: boolean | null
}) => {
  const attributes = {
    rel: newTab ? 'noopener noreferrer' : undefined,
    target: newTab ? '_blank' : undefined,
  }

  return href.startsWith('/') ? (
    <Link href={href} {...attributes}>
      {children}
    </Link>
  ) : (
    <a href={href} {...attributes}>
      {children}
    </a>
  )
}

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const value = linkNode.fields.doc?.value

  if (value && typeof value === 'object') {
    const document = value as LinkedDocument
    if (document.path) return document.path
    if (document.slug) return `/${document.slug}/`
  }

  return '#'
}

const jsxConverters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  autolink: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const href = safeDestination(node.fields.url)
    if (!href) return <>{children}</>

    return (
      <RichTextLink href={href} newTab={node.fields.newTab}>
        {children}
      </RichTextLink>
    )
  },
  link: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const candidate =
      node.fields.linkType === 'internal' ? internalDocToHref({ linkNode: node }) : node.fields.url
    const href = safeDestination(candidate)
    if (!href) return <>{children}</>

    return (
      <RichTextLink href={href} newTab={node.fields.newTab}>
        {children}
      </RichTextLink>
    )
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props

  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          'trayport-container': enableGutter,
          'max-w-none': !enableGutter,
          'trayport-prose mx-auto prose': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
