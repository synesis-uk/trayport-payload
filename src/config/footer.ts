/**
 * Shared Footer vocabulary for Payload schema controls and public rendering.
 * Keeping these values outside either layer prevents the CMS schema from
 * depending on presentation-owned modules.
 */
export const footerIconOptions = [
  { label: 'Company profile', value: 'companyProfile' },
  { label: 'Office locations', value: 'offices' },
  { label: 'Careers', value: 'careers' },
  { label: 'Contact', value: 'contact' },
  { label: 'Market matrix', value: 'marketMatrix' },
  { label: 'Europe', value: 'regionEurope' },
  { label: 'North America', value: 'regionNorthAmerica' },
  { label: 'Asia Pacific', value: 'regionAsiaPacific' },
  { label: 'Legal document', value: 'legalDocument' },
] as const

export const footerAccentOptions = [
  { label: 'Cyan', value: 'cyan' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Orange', value: 'orange' },
  { label: 'White', value: 'white' },
] as const

export type FooterAccent = (typeof footerAccentOptions)[number]['value']
export type FooterIconName = (typeof footerIconOptions)[number]['value']
