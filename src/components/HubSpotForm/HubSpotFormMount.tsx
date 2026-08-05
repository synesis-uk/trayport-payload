import { normalizeHubSpotFormID } from '@/integrations/hubSpotForm'

/**
 * Consent-aware HubSpot runtime code hydrates this stable mount point. Keeping the
 * source identifier in managed markup preserves local review without submitting
 * data or loading third-party scripts before the shared integration is enabled.
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
      data-hubspot-portal-id="7257359"
    >
      <h2 id={`hubspot-form-${normalizedFormID}`}>
        {title?.trim() || 'Contact the Trayport team'}
      </h2>
      <div className="trayport-hubspot-form__mount" data-hubspot-form-mount="" />
    </section>
  )
}
