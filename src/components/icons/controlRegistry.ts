import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faCheck,
  faChevronUp,
  faCirclePlay,
  faMinus,
  faSpinnerThird,
} from '@awesome.me/kit-9e17af3472/icons/classic/solid'
import { faAngleDown } from '@awesome.me/kit-9e17af3472/icons/sharp-duotone/light'

/** Fixed state glyphs owned by reusable interactive primitives. */
export const controlIcons = {
  check: faCheck,
  chevronDown: faAngleDown,
  chevronUp: faChevronUp,
  minus: faMinus,
  playCircle: faCirclePlay,
  spinner: faSpinnerThird,
} as const satisfies Record<string, IconDefinition>

export type ControlIconName = keyof typeof controlIcons
