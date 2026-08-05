import crypto from 'node:crypto'

type PayloadDocument = {
  id: number | string
  email?: string | null
  notifyUsers?: Array<number | string | { id: number | string }> | null
  roles?: string[] | null
}

type RecipientMappingPayload = {
  create(args: Record<string, unknown>): Promise<PayloadDocument>
  find(args: Record<string, unknown>): Promise<{ docs: PayloadDocument[] }>
  update(args: Record<string, unknown>): Promise<PayloadDocument>
}

type ApprovedBannerRecipientMapping = {
  bannerLegacyId: number
  email: string
  name: string
}

export type BannerRecipientMappingReport = {
  createdNotificationOnlyUsers: string[]
  mappedBanners: Array<{
    bannerLegacyId: number
    email: string
    userId: number | string
  }>
  reusedCMSUsers: string[]
}

export const approvedBannerRecipientMappings: ApprovedBannerRecipientMapping[] = [
  {
    bannerLegacyId: 11602,
    email: 'sophie.inghamclark@trayport.com',
    name: 'Sophie Ingham-Clark',
  },
]

const findOne = async (
  payload: RecipientMappingPayload,
  collection: 'banners' | 'users',
  where: Record<string, unknown>,
): Promise<PayloadDocument | undefined> => {
  const result = await payload.find({
    collection,
    depth: 0,
    draft: collection === 'banners' ? false : undefined,
    limit: 1,
    overrideAccess: true,
    where,
  })

  return result.docs[0]
}

const notificationOnlyUser = async (
  payload: RecipientMappingPayload,
  mapping: ApprovedBannerRecipientMapping,
  report: BannerRecipientMappingReport,
): Promise<PayloadDocument> => {
  const existing = await findOne(payload, 'users', { email: { equals: mapping.email } })
  if (existing) {
    report.reusedCMSUsers.push(mapping.email)
    return existing
  }

  const created = await payload.create({
    collection: 'users',
    context: {
      disableRevalidate: true,
      migration: true,
      notificationRecipientMigration: true,
    },
    data: {
      email: mapping.email,
      name: mapping.name,
      // Payload requires a password for an auth document. This random value is
      // never returned or stored outside its one-way hash; the empty role list
      // and Users.beforeLogin guard keep the identity inert until an admin acts.
      password: crypto.randomBytes(48).toString('base64url'),
      roles: [],
    },
    overrideAccess: true,
  })

  if (created.roles?.length) {
    throw new Error(
      `Notification-only recipient ${mapping.email} was unexpectedly granted CMS roles.`,
    )
  }

  report.createdNotificationOnlyUsers.push(mapping.email)
  return created
}

const relationshipID = (value: number | string | { id: number | string }): number | string =>
  typeof value === 'object' ? value.id : value

export const applyApprovedBannerRecipientMappings = async (
  payload: RecipientMappingPayload,
): Promise<BannerRecipientMappingReport> => {
  const report: BannerRecipientMappingReport = {
    createdNotificationOnlyUsers: [],
    mappedBanners: [],
    reusedCMSUsers: [],
  }

  for (const mapping of approvedBannerRecipientMappings) {
    const banner = await findOne(payload, 'banners', {
      and: [
        { 'legacySource.source': { equals: 'wordpress' } },
        { 'legacySource.legacyId': { equals: mapping.bannerLegacyId } },
        { _status: { equals: 'published' } },
      ],
    })

    if (!banner) {
      throw new Error(
        `Cannot map approved recipient ${mapping.email}: published WordPress banner ${mapping.bannerLegacyId} is missing.`,
      )
    }

    const recipient = await notificationOnlyUser(payload, mapping, report)
    const currentRecipientIDs = (banner.notifyUsers || []).map(relationshipID)
    if (
      currentRecipientIDs.length !== 1 ||
      String(currentRecipientIDs[0]) !== String(recipient.id)
    ) {
      await payload.update({
        collection: 'banners',
        context: { disableRevalidate: true, migration: true },
        data: { notifyUsers: [recipient.id] },
        draft: false,
        id: banner.id,
        overrideAccess: true,
      })
    }
    report.mappedBanners.push({
      bannerLegacyId: mapping.bannerLegacyId,
      email: mapping.email,
      userId: recipient.id,
    })
  }

  return report
}
