type StructuredDataValue =
  Record<string, unknown> | unknown[] | string | number | boolean | null | undefined

export const StructuredData = ({ value }: { value: StructuredDataValue }) => {
  if (!value || typeof value !== 'object') return null

  const serialized = JSON.stringify(value).replaceAll('<', '\\u003c')

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: serialized,
      }}
      type="application/ld+json"
    />
  )
}
