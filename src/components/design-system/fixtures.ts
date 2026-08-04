import { appIcons, type AppIconName } from '@/components/icons'

export const gallerySections = [
  {
    description: 'Semantic brand and interface colours exposed through the shared token layer.',
    id: 'colour-tokens',
    title: 'Colour tokens',
  },
  {
    description: 'The production typeface and core editorial hierarchy at representative sizes.',
    id: 'typography',
    title: 'Typography',
  },
  {
    description:
      'The bounded application icon registry rendered through the shared icon component.',
    id: 'icons',
    title: 'Icons',
  },
  {
    description: 'Current button variants, including disabled and icon-led controls.',
    id: 'buttons',
    title: 'Buttons',
  },
  {
    description: 'Open, closed, selected, disabled, and keyboard-operable interaction patterns.',
    id: 'interaction-primitives',
    title: 'Interaction primitives',
  },
  {
    description: 'Bounded layout, heading, action, statistic, and surface compositions.',
    id: 'compositions',
    title: 'Site compositions',
  },
  {
    description: 'Default, invalid, selected, and disabled form-control states.',
    id: 'forms',
    title: 'Form controls',
  },
  {
    description: 'A representative composed surface built from the current card primitives.',
    id: 'cards',
    title: 'Cards',
  },
  {
    description: 'Short, long, empty, loading, error, and missing-media presentation states.',
    id: 'content-resilience',
    title: 'Content resilience',
  },
  {
    description: 'The same bounded composition shown at mobile, tablet, and desktop canvas widths.',
    id: 'responsive-surfaces',
    title: 'Responsive surfaces',
  },
] as const

export type GallerySectionID = (typeof gallerySections)[number]['id']

export const colourFixtures = [
  { label: 'Deep navy', token: '--trayport-deep' },
  { label: 'Trayport blue', token: '--trayport-blue' },
  { label: 'Light blue', token: '--trayport-light-blue' },
  { label: 'Cyan', token: '--trayport-cyan' },
  { label: 'Green', token: '--trayport-green' },
  { label: 'Yellow', token: '--trayport-yellow' },
  { label: 'Orange', token: '--trayport-orange' },
  { label: 'Soft surface', token: '--trayport-soft' },
  { label: 'Background', token: '--background' },
  { label: 'Foreground', token: '--foreground' },
  { label: 'Muted text', token: '--muted-foreground' },
  { label: 'Border', token: '--border' },
  { label: 'Success', token: '--success' },
  { label: 'Warning', token: '--warning' },
  { label: 'Error', token: '--error' },
  { label: 'Chart series 1', token: '--chart-1' },
  { label: 'Chart series 2', token: '--chart-2' },
  { label: 'Chart series 3', token: '--chart-3' },
  { label: 'Map land', token: '--map-land' },
  { label: 'Map water', token: '--map-water' },
  { label: 'Map marker', token: '--map-marker' },
] as const

export const iconFixtures = [
  { family: 'Classic solid', label: 'Arrow right', name: 'arrowRight' },
  { family: 'Classic light', label: 'Chart', name: 'chart' },
  { family: 'Classic solid', label: 'Check', name: 'check' },
  { family: 'Sharp duotone', label: 'External link', name: 'externalLink' },
  { family: 'Sharp duotone', label: 'Location', name: 'location' },
  { family: 'Sharp duotone', label: 'Lock', name: 'lock' },
  { family: 'Classic solid', label: 'Menu', name: 'menu' },
  { family: 'Classic solid', label: 'Play', name: 'play' },
  { family: 'Sharp regular', label: 'Search', name: 'search' },
  { family: 'Classic light', label: 'Trend', name: 'trend' },
  { family: 'Brands', label: 'LinkedIn', name: 'linkedin' },
  { family: 'Brands', label: 'X', name: 'x' },
] as const satisfies readonly { family: string; label: string; name: AppIconName }[]

/**
 * Keep the deterministic gallery coupled to the complete semantic registry,
 * while the visible shelf above remains a compact representative sample.
 * Sorting removes object-declaration order as a source of snapshot churn.
 */
export const appIconNames = Object.freeze(Object.keys(appIcons).sort() as AppIconName[])

export const iconSizeFixtures = [
  { className: 'size-3', label: '12px' },
  { className: 'size-4', label: '16px' },
  { className: 'size-5', label: '20px' },
  { className: 'size-6', label: '24px' },
] as const

export const buttonFixtures = [
  { label: 'Primary action', variant: 'default' },
  { label: 'Secondary action', variant: 'secondary' },
  { label: 'Outlined action', variant: 'outline' },
  { label: 'Quiet action', variant: 'ghost' },
  { label: 'Text action', variant: 'link' },
  { label: 'Destructive action', variant: 'destructive' },
] as const

export const marketOptions = [
  { label: 'Power', value: 'power' },
  { label: 'Natural gas', value: 'natural-gas' },
  { label: 'Climate', value: 'climate' },
] as const

export const responsiveCanvases = [
  { label: 'Mobile', width: 'max-w-[23.4375rem]' },
  { label: 'Tablet', width: 'max-w-[48rem]' },
  { label: 'Desktop', width: 'max-w-full' },
] as const
