import { z } from 'zod'

export const schemaVersion = 1 as const

const referenceSchema = z.object({
  $ref: z.enum(['post', 'term', 'media']),
  id: z.number().int().positive(),
  postType: z.string().optional(),
  taxonomy: z.string().optional(),
  title: z.string().optional(),
  path: z.string().nullable().optional(),
  url: z.string().url().nullable().optional(),
})

export type NormalizedValue =
  | null
  | boolean
  | number
  | string
  | NormalizedValue[]
  | { [key: string]: NormalizedValue }
  | z.infer<typeof referenceSchema>

export const normalizedValueSchema: z.ZodType<NormalizedValue> = z.lazy(() =>
  z.union([
    z.null(),
    z.boolean(),
    z.number(),
    z.string(),
    z.array(normalizedValueSchema),
    referenceSchema,
    z.record(z.string(), normalizedValueSchema),
  ]),
)

const baseRecordSchema = z.object({
  schemaVersion: z.literal(schemaVersion),
})

export const sourceManifestSchema = baseRecordSchema.extend({
  entity: z.literal('manifest'),
  source: z.object({
    home: z.string().url(),
    site: z.string().url(),
    tablePrefix: z.string().min(1),
    wordpressVersion: z.string().min(1),
    acfVersion: z.string().min(1),
  }),
  rootIds: z.array(z.number().int().positive()),
})

export const sourcePostSchema = baseRecordSchema.extend({
  entity: z.literal('post'),
  legacyId: z.number().int().positive(),
  postType: z.string().min(1),
  status: z.string().min(1),
  title: z.string(),
  slug: z.string(),
  path: z.string().nullable(),
  parentId: z.number().int().nonnegative(),
  menuOrder: z.number().int(),
  excerpt: z.string(),
  content: z.string(),
  publishedAt: z.string().nullable(),
  modifiedAt: z.string().nullable(),
  featuredMediaId: z.number().int().positive().nullable(),
  scopeRole: z.enum([
    'root',
    'banner-action',
    'banner-target',
    'insights-listing',
    'news-listing',
    'learning-listing',
    'event-listing',
    'venue-summary',
  ]),
  featuredOrder: z.number().int().nonnegative().nullable(),
  taxonomies: z.record(z.string(), z.array(z.number().int().positive())),
  acf: z.record(z.string(), normalizedValueSchema),
})

export const sourceTermSchema = baseRecordSchema.extend({
  entity: z.literal('term'),
  legacyId: z.number().int().positive(),
  taxonomy: z.string().min(1),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  parentId: z.number().int().nonnegative(),
  acf: z.record(z.string(), normalizedValueSchema),
})

export const sourceMediaSchema = baseRecordSchema.extend({
  entity: z.literal('media'),
  legacyId: z.number().int().positive(),
  title: z.string(),
  alt: z.string(),
  altSource: z.enum(['wordpress', 'title-fallback', 'editor-review']),
  decorative: z.boolean(),
  needsAltReview: z.boolean(),
  caption: z.string(),
  description: z.string(),
  mimeType: z.string(),
  fileSize: z.number().int().positive().nullable().default(null),
  fileHash: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .nullable(),
  url: z.string().url().nullable(),
  relativePath: z.string().nullable(),
  recoveryURL: z.string().url().nullable().default(null),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  availability: z.enum(['local', 'recovered', 'unavailable']),
  availabilityReason: z
    .enum(['unsupported-object-storage-path', 'missing-or-unreadable-local-file'])
    .nullable(),
})

export const sourceMenuSchema = baseRecordSchema.extend({
  entity: z.literal('menu'),
  location: z.string(),
  legacyId: z.number().int().positive(),
  name: z.string(),
  items: z.array(
    z.object({
      legacyId: z.number().int().positive(),
      parentId: z.number().int().nonnegative(),
      order: z.number().int(),
      title: z.string(),
      url: z.string(),
      target: z.string(),
      description: z.string(),
      classes: z.array(z.string()),
      objectId: z.number().int().nonnegative(),
      objectType: z.string(),
      itemType: z.string(),
      acf: z.record(z.string(), normalizedValueSchema),
    }),
  ),
})

export const sourceHubConnectionsSchema = baseRecordSchema.extend({
  entity: z.literal('hub-connections'),
  hubLegacyId: z.number().int().positive(),
  connections: z.array(
    z.object({
      venueLegacyId: z.number().int().positive(),
      venueTypeLegacyId: z.number().int().positive().nullable(),
      connectionType: z.string(),
      supportsJoule: z.boolean(),
      supportsAutoTrader: z.boolean(),
    }),
  ),
})

export const sourceOptionsSchema = baseRecordSchema.extend({
  entity: z.literal('options'),
  values: z.record(z.string(), normalizedValueSchema),
})

export const sourceReusableSchema = baseRecordSchema.extend({
  entity: z.literal('reusable'),
  legacyId: z.number().int().positive(),
  postType: z.string().min(1),
  status: z.string().min(1).optional(),
  title: z.string(),
  path: z.string().nullable(),
  menuOrder: z.number().int().optional(),
  publishedAt: z.string().nullable().optional(),
  modifiedAt: z.string().nullable().optional(),
  data: z.record(z.string(), normalizedValueSchema),
})

const sourceLifecycleProductSchema = z.union([
  referenceSchema.refine((value) => value.$ref === 'post', {
    message: 'Lifecycle product must reference a WordPress post.',
  }),
  z.literal(false),
  z.null(),
])

const sourceOptionalLifecycleTextSchema = z.union([z.string(), z.literal(false), z.null()])

/** Bounded contract for the only reusable lifecycle fields the migration consumes. */
export const sourceLifecycleReusableSchema = sourceReusableSchema.extend({
  postType: z.literal('lifecycle'),
  data: z
    .object({
      product: sourceLifecycleProductSchema,
      name: z.string(),
      duration: sourceOptionalLifecycleTextSchema,
      eol_version: sourceOptionalLifecycleTextSchema,
      eol_date: z.string().regex(/^\d{8}$/),
      eoa_date: z.union([z.literal(''), z.string().regex(/^\d{8}$/), z.literal(false), z.null()]),
      description: sourceOptionalLifecycleTextSchema,
    })
    .strict(),
})

export const sourceMapHubSchema = baseRecordSchema.extend({
  entity: z.literal('map-hub'),
  legacyId: z.number().int().positive(),
  title: z.string(),
  slug: z.string(),
  path: z.string().nullable(),
  assetClassLegacyId: z.number().int().positive(),
  regionLegacyId: z.number().int().positive(),
  countryCode: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .nullable()
    .default(null),
  connectedCountryCodes: z.array(z.string().regex(/^[A-Z]{3}$/)).default([]),
  hubType: z.enum(['vhub', 'phub', 'ohub', 'rhub']).default('vhub'),
  showOnMap: z.boolean(),
  markers: z.array(
    z.object({
      name: z.string(),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  ),
  connections: z
    .array(
      z.object({
        hubLegacyId: z.number().int().positive(),
        route: normalizedValueSchema.nullable(),
        showLineMarker: z.boolean(),
        lineMarkerLabel: z.string(),
      }),
    )
    .default([]),
})

export const sourceMapRegionSchema = baseRecordSchema.extend({
  entity: z.literal('map-region'),
  legacyId: z.number().int().positive(),
  title: z.string(),
  regionLegacyId: z.number().int().positive(),
  label: z.string(),
  centre: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .nullable(),
  boundary: normalizedValueSchema.nullable(),
  pointsOfInterest: z.array(
    z.object({
      label: z.string(),
      popupText: z.string(),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  ),
  destinationPath: z.string().nullable(),
})

export const sourceMarketVolumeSchema = baseRecordSchema.extend({
  entity: z.literal('market-volume'),
  assetClassLegacyId: z.number().int().positive(),
  hubLegacyId: z.number().int().positive(),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  otcBilateral: z.string().nullable(),
  otcCleared: z.string().nullable(),
  exchangeTraded: z.string().nullable(),
  price: z.string().nullable(),
  sourcePostLegacyId: z.number().int().positive(),
})

export const sourceWarningSchema = baseRecordSchema.extend({
  entity: z.literal('warning'),
  code: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error']),
  legacyId: z.number().int().positive().nullable(),
  sourcePath: z.string().nullable(),
  message: z.string().min(1),
})

export const sourceRecordSchema = z.discriminatedUnion('entity', [
  sourceManifestSchema,
  sourcePostSchema,
  sourceTermSchema,
  sourceMediaSchema,
  sourceMenuSchema,
  sourceHubConnectionsSchema,
  sourceOptionsSchema,
  sourceReusableSchema,
  sourceMapHubSchema,
  sourceMapRegionSchema,
  sourceMarketVolumeSchema,
  sourceWarningSchema,
])

export type SourceRecord = z.infer<typeof sourceRecordSchema>
export type SourcePost = z.infer<typeof sourcePostSchema>
export type SourceMedia = z.infer<typeof sourceMediaSchema>
export type SourceTerm = z.infer<typeof sourceTermSchema>
export type SourceReusable = z.infer<typeof sourceReusableSchema>
export type SourceLifecycleReusable = z.infer<typeof sourceLifecycleReusableSchema>
export type SourceMapHub = z.infer<typeof sourceMapHubSchema>
export type SourceMapRegion = z.infer<typeof sourceMapRegionSchema>
export type SourceMarketVolume = z.infer<typeof sourceMarketVolumeSchema>
