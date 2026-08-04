import type { ReactNode } from 'react'

import type { AppIconName } from '@/components/icons'
import type { Media, Navigation, SiteSetting } from '@/payload-types'
import type { ContentLink } from '@/routing/contentLink'
import { resolveContentLink } from '@/routing/contentLink'

export type PrimaryNavigationItem = NonNullable<Navigation['primaryItems']>[number]
type NavigationGroup = NonNullable<PrimaryNavigationItem['groups']>[number]
type NavigationGroupItem = NavigationGroup['items'][number]
export type NavigationIconName = NonNullable<NavigationGroupItem['icon']>
export type NavigationAccent = NonNullable<NavigationGroupItem['accent']>
export type NavigationGroupSpan = NavigationGroup['span']

export interface HeaderLinkModel {
  href: string
  label: string
  newTab: boolean
}

export interface HeaderMediaModel {
  alt: string
  height: number
  src: string
  width: number
}

export interface HeaderNavigationItemModel {
  accent?: NavigationAccent
  description?: string
  icon?: AppIconName
  kind: 'feature' | 'link'
  link: HeaderLinkModel
  media?: HeaderMediaModel
}

export interface HeaderNavigationGroupModel {
  id: string
  items: HeaderNavigationItemModel[]
  span: NavigationGroupSpan
  title?: string
  titleLink?: HeaderLinkModel
}

export interface HeaderNavigationRootModel {
  id: string
  groups: HeaderNavigationGroupModel[]
  label: string
  link: HeaderLinkModel | null
}

export interface HeaderModel {
  items: HeaderNavigationRootModel[]
  siteName: string
  siteNotice?: {
    action?: HeaderLinkModel
    message: string
  }
  utilityItems: Array<HeaderLinkModel & { icon?: AppIconName }>
}

export interface HeaderPresentationNavigationItemModel extends Omit<
  HeaderNavigationItemModel,
  'icon'
> {
  icon?: ReactNode
}

export interface HeaderPresentationNavigationGroupModel extends Omit<
  HeaderNavigationGroupModel,
  'items'
> {
  items: HeaderPresentationNavigationItemModel[]
}

export interface HeaderPresentationNavigationRootModel extends Omit<
  HeaderNavigationRootModel,
  'groups'
> {
  groups: HeaderPresentationNavigationGroupModel[]
}

export interface HeaderPresentationModel extends Omit<HeaderModel, 'items' | 'utilityItems'> {
  items: HeaderPresentationNavigationRootModel[]
  utilityItems: Array<HeaderLinkModel & { icon?: ReactNode }>
}

const canonicalNavigationPath = (value: string): string => {
  const path = value.split(/[?#]/, 1)[0] || '/'
  if (path === '/') return path
  return path.replace(/\/+$/, '') || '/'
}

export const isNavigationLinkCurrent = (
  pathname: string,
  link: HeaderLinkModel | null,
): boolean => {
  if (!link?.href.startsWith('/') || link.href.startsWith('//')) return false

  const currentPath = canonicalNavigationPath(pathname)
  const linkPath = canonicalNavigationPath(link.href)
  return currentPath === linkPath || (linkPath !== '/' && currentPath.startsWith(`${linkPath}/`))
}

type CurrentNavigationRoot = {
  groups: Array<{
    items: Array<{ link: HeaderLinkModel }>
    titleLink?: HeaderLinkModel
  }>
  link: HeaderLinkModel | null
}

export const isNavigationRootCurrent = (pathname: string, item: CurrentNavigationRoot): boolean =>
  [
    item.link,
    ...item.groups.flatMap((group) => [
      group.titleLink || null,
      ...group.items.map(({ link }) => link),
    ]),
  ].some((link) => isNavigationLinkCurrent(pathname, link))

const navigationIconMap = {
  asiaPacific: 'asiaPacific',
  ballot: 'ballot',
  buildingSecurity: 'buildingSecurity',
  bulkMarkets: 'bulkMarkets',
  calculator: 'calculator',
  calendar: 'calendar',
  candlestickChart: 'candlestickChart',
  careers: 'careers',
  climate: 'climate',
  code: 'code',
  compare: 'compare',
  connections: 'connections',
  connectivity: 'connectivity',
  csvFile: 'csvFile',
  demo: 'demo',
  email: 'email',
  europe: 'europe',
  file: 'file',
  gas: 'gas',
  insight: 'insight',
  lifecycle: 'lifecycle',
  list: 'list',
  lock: 'lock',
  map: 'map',
  marketAccess: 'marketAccess',
  marketMatrix: 'marketMatrix',
  messages: 'messages',
  metals: 'metals',
  network: 'network',
  news: 'news',
  northAmerica: 'northAmerica',
  offices: 'offices',
  oil: 'oil',
  people: 'people',
  pieChart: 'pieChart',
  playCircle: 'playCircle',
  power: 'power',
  quote: 'quote',
  shield: 'shield',
  tradingScreen: 'tradingScreen',
  users: 'users',
  video: 'video',
  waterfallChart: 'waterfallChart',
  world: 'world',
} as const satisfies Record<NavigationIconName, AppIconName>

const normalizeHeaderLink = (
  link: ContentLink | null | undefined,
  fallbackLabel = '',
): HeaderLinkModel | null => {
  const resolved = resolveContentLink({ ...link, label: link?.label || fallbackLabel })

  if (resolved.href === '#') return null

  return {
    href: resolved.href,
    label: resolved.label || fallbackLabel,
    newTab: resolved.newTab,
  }
}

const normalizeHeaderMedia = (
  value: Media | number | null | undefined,
): HeaderMediaModel | null => {
  if (!value || typeof value === 'number' || !value.url) return null

  return {
    alt: value.alt || '',
    height: value.height || 900,
    src: value.url,
    width: value.width || 1600,
  }
}

const normalizeGroupItem = (item: NavigationGroupItem): HeaderNavigationItemModel | null => {
  const media = normalizeHeaderMedia(item.media)
  const link = normalizeHeaderLink(item.link, item.label)

  if (!link) return null

  return {
    ...(item.accent ? { accent: item.accent } : {}),
    ...(item.description ? { description: item.description } : {}),
    ...(item.icon ? { icon: navigationIconMap[item.icon] } : {}),
    kind: item.kind,
    link,
    ...(media ? { media } : {}),
  }
}

const normalizeGroup = (
  group: NavigationGroup,
  rootIndex: number,
  groupIndex: number,
): HeaderNavigationGroupModel => {
  const titleLink = group.titleLink?.type
    ? normalizeHeaderLink(group.titleLink, group.title || '')
    : null

  return {
    id: group.id || `navigation-${rootIndex}-group-${groupIndex}`,
    items: group.items
      .map(normalizeGroupItem)
      .filter((item): item is HeaderNavigationItemModel => item !== null),
    span: group.span,
    ...(group.title ? { title: group.title } : {}),
    ...(titleLink ? { titleLink } : {}),
  }
}

const normalizeLegacyGroups = (
  item: PrimaryNavigationItem,
  rootIndex: number,
): HeaderNavigationGroupModel[] => {
  const children = item.children || []
  if (!children.length) return []

  return [
    {
      id: `navigation-${rootIndex}-legacy`,
      items: children.flatMap((child) => {
        const link = normalizeHeaderLink(child.link, child.label)
        if (!link) return []

        return [
          {
            ...(child.description ? { description: child.description } : {}),
            kind: 'link' as const,
            link,
          },
        ]
      }),
      span: 'auto',
    },
  ]
}

export const normalizeHeader = (navigation: Navigation, settings: SiteSetting): HeaderModel => {
  const noticeAction = settings.siteNotice?.action?.link
    ? normalizeHeaderLink(settings.siteNotice.action.link)
    : null

  return {
    items: (navigation.primaryItems || []).flatMap((item, rootIndex) => {
      const link = normalizeHeaderLink(getPrimaryNavigationLink(item), item.label)
      const groups = (
        item.groups?.length
          ? item.groups.map((group, groupIndex) => normalizeGroup(group, rootIndex, groupIndex))
          : normalizeLegacyGroups(item, rootIndex)
      ).filter((group) => group.items.length > 0 || Boolean(group.titleLink))

      if (!link && groups.length === 0) return []

      return [
        {
          groups,
          id: item.id || `navigation-${rootIndex}`,
          label: item.label,
          link,
        },
      ]
    }),
    siteName: settings.siteName || 'Trayport',
    ...(settings.siteNotice?.enabled && settings.siteNotice.message
      ? {
          siteNotice: {
            ...(noticeAction ? { action: noticeAction } : {}),
            message: settings.siteNotice.message,
          },
        }
      : {}),
    utilityItems: (navigation.utilityItems || []).flatMap((item) => {
      const link = normalizeHeaderLink(item.link)
      if (!link) return []

      return [
        {
          ...link,
          ...(item.icon ? { icon: navigationIconMap[item.icon] } : {}),
        },
      ]
    }),
  }
}

export const getPrimaryNavigationLink = (item: PrimaryNavigationItem): ContentLink => ({
  ...item.link,
  label: item.label,
})
