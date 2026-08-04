import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faBars, faXmark } from '@awesome.me/kit-9e17af3472/icons/classic/solid'
import { faMagnifyingGlass } from '@awesome.me/kit-9e17af3472/icons/sharp/regular'
import { faAngleDown } from '@awesome.me/kit-9e17af3472/icons/sharp-duotone/light'

/**
 * Fixed icons needed by the always-hydrated public shell.
 *
 * CMS and route-content icons belong in the general semantic registry and are
 * rendered on the server. Keeping this list explicit prevents that much larger
 * registry from becoming a site-wide client dependency.
 */
export const shellIcons = {
  chevronDown: faAngleDown,
  close: faXmark,
  menu: faBars,
  search: faMagnifyingGlass,
} as const satisfies Record<string, IconDefinition>

export type ShellIconName = keyof typeof shellIcons
