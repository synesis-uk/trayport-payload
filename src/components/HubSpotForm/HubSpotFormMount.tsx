import { HUBSPOT_PORTAL_ID, normalizeHubSpotFormID } from '@/integrations/hubSpotForm'

import { HubSpotFormRuntime } from './HubSpotFormRuntime.client'

/**
 * The managed shell around a HubSpot form.
 *
 * The heading and identifiers are server-rendered so the section exists in the document without
 * JavaScript; the form itself is created by `HubSpotFormRuntime`, which does not request the
 * third-party script until consent is granted.
 */
export const HubSpotFormMount = ({
  formId,
  title,
}: {
  formId?: string | null
  title?: string | null
}) => {
  const normalizedFormID = normalizeHubSpotFormID(formId)
  if (!normalizedFormID) return null

  return (
    <section
      aria-labelledby={`hubspot-form-${normalizedFormID}`}
      className="trayport-hubspot-form"
      data-hubspot-form-id={normalizedFormID}
      data-hubspot-portal-id={HUBSPOT_PORTAL_ID}
    >
      <h2 id={`hubspot-form-${normalizedFormID}`}>
        {title?.trim() || 'Contact the Trayport team'}
      </h2>
      <HubSpotFormRuntime formId={normalizedFormID} portalId={HUBSPOT_PORTAL_ID} />
    </section>
  )
}
