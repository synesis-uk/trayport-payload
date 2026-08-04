import type { UploadField, UploadFieldSingleValidation, Where } from 'payload'

type VisualMediaKind = 'image' | 'video'

type SingleUploadField = Omit<
  Extract<UploadField, { relationTo: string }>,
  'hasMany' | 'max' | 'maxRows' | 'min' | 'minRows' | 'validate'
> & {
  hasMany?: false
  max?: undefined
  maxRows?: undefined
  min?: undefined
  minRows?: undefined
  validate?: UploadFieldSingleValidation
}

type VisualMediaUploadField = Omit<
  SingleUploadField,
  'filterOptions' | 'hasMany' | 'relationTo' | 'type' | 'validate'
>

const mediaKindLabels: Record<VisualMediaKind, string> = {
  image: 'image',
  video: 'video',
}

const mediaFilter = (allowedKinds: readonly VisualMediaKind[]): Where => {
  const filters = allowedKinds.map((kind) => ({
    mimeType: {
      contains: `${kind}/`,
    },
  }))

  return filters.length === 1 ? filters[0] : { or: filters }
}

const referencedMedia = (value: unknown): unknown => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value

  return 'value' in value ? value.value : value
}

const mediaID = (value: unknown): number | string | null => {
  const reference = referencedMedia(value)
  if (typeof reference === 'number' || typeof reference === 'string') return reference
  if (!reference || typeof reference !== 'object' || Array.isArray(reference)) return null

  const id = 'id' in reference ? reference.id : null
  return typeof id === 'number' || typeof id === 'string' ? id : null
}

const validationMessage = (allowedKinds: readonly VisualMediaKind[]) => {
  const allowed = allowedKinds.map((kind) => mediaKindLabels[kind])
  const label =
    allowed.length === 1 ? allowed[0] : `${allowed.slice(0, -1).join(', ')} or ${allowed.at(-1)}`

  return `Choose a managed ${label}. Documents and unsupported media cannot be used in this visual field.`
}

export const validateVisualMediaReference = async (
  value: unknown,
  { req }: Parameters<UploadFieldSingleValidation>[1],
  allowedKinds: readonly VisualMediaKind[],
): Promise<string | true> => {
  if (value === null || value === undefined || value === '') return true

  const allowedPrefixes = allowedKinds.map((kind) => `${kind}/`)
  const id = mediaID(value)
  if (id === null) return validationMessage(allowedKinds)

  try {
    const media = await req.payload.findByID({
      collection: 'media',
      depth: 0,
      id,
      req,
      select: {
        mimeType: true,
      },
    })
    const mimeType = typeof media.mimeType === 'string' ? media.mimeType : null

    return mimeType && allowedPrefixes.some((prefix) => mimeType.startsWith(prefix))
      ? true
      : validationMessage(allowedKinds)
  } catch {
    return validationMessage(allowedKinds)
  }
}

const visualMediaUploadField = (
  allowedKinds: readonly VisualMediaKind[],
  field: VisualMediaUploadField,
): SingleUploadField => ({
  ...field,
  type: 'upload',
  filterOptions: mediaFilter(allowedKinds),
  relationTo: 'media',
  validate: (value, options) => validateVisualMediaReference(value, options, allowedKinds),
})

export const imageUploadField = (field: VisualMediaUploadField): SingleUploadField =>
  visualMediaUploadField(['image'], field)

export const imageOrVideoUploadField = (field: VisualMediaUploadField): SingleUploadField =>
  visualMediaUploadField(['image', 'video'], field)

export const videoUploadField = (field: VisualMediaUploadField): SingleUploadField =>
  visualMediaUploadField(['video'], field)
