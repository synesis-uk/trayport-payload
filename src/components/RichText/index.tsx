import {
  type DefaultNodeTypes,
  type DefaultTypedEditorState,
  type SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { cn } from '@/utilities/ui'

type LinkedDocument = {
  path?: string | null
  slug?: string | null
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
  ...LinkJSXConverter({ internalDocToHref }),
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
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
