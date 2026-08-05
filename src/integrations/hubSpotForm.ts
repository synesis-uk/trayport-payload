export const hubSpotFormIDPattern = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/iu

export const normalizeHubSpotFormID = (value: unknown): string | null => {
  const normalized = typeof value === 'string' ? value.trim() : ''
  return hubSpotFormIDPattern.test(normalized) ? normalized : null
}

export const validateHubSpotFormID = (value: unknown): true | string =>
  normalizeHubSpotFormID(value) ? true : 'Enter a valid HubSpot form UUID.'

export const validateOptionalHubSpotFormID = (value: unknown): true | string => {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
    return true
  }
  return validateHubSpotFormID(value)
}
