import 'server-only'

import { AppIcon } from '@/components/icons'

import type {
  HeaderModel,
  HeaderNavigationGroupModel,
  HeaderNavigationItemModel,
  HeaderNavigationRootModel,
  HeaderPresentationModel,
  HeaderPresentationNavigationGroupModel,
  HeaderPresentationNavigationItemModel,
  HeaderPresentationNavigationRootModel,
} from './navigation'

const presentNavigationItem = (
  item: HeaderNavigationItemModel,
): HeaderPresentationNavigationItemModel => ({
  ...item,
  ...(item.icon ? { icon: <AppIcon aria-hidden name={item.icon} /> } : {}),
})

const presentNavigationGroup = (
  group: HeaderNavigationGroupModel,
): HeaderPresentationNavigationGroupModel => ({
  ...group,
  items: group.items.map(presentNavigationItem),
})

const presentNavigationRoot = (
  item: HeaderNavigationRootModel,
): HeaderPresentationNavigationRootModel => ({
  ...item,
  groups: item.groups.map(presentNavigationGroup),
})

/**
 * Converts semantic icon names into server-rendered slots before the navigation
 * model reaches a client boundary. Links and current-page behavior stay as
 * compact serializable data; the general icon registry stays server-only.
 */
export const presentHeader = (model: HeaderModel): HeaderPresentationModel => ({
  ...model,
  items: model.items.map(presentNavigationRoot),
  utilityItems: model.utilityItems.map((item) => ({
    ...item,
    ...(item.icon ? { icon: <AppIcon aria-hidden name={item.icon} /> } : {}),
  })),
})
