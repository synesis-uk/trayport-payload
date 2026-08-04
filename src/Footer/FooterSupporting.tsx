import { AppIcon } from '@/components/icons'

import { FooterLink } from './FooterLink'
import type { FooterCertificationModel, FooterModel, FooterSocialLinkModel } from './types'

function SocialLinks({ links }: { links: FooterSocialLinkModel[] }) {
  if (!links.length) return null

  return (
    <div className="site-footer__social-group">
      <span>Connect with us:</span>
      <nav aria-label="Social media" className="site-footer__social-navigation">
        <ul className="site-footer__social">
          {links.map((item, index) => (
            <li key={`${item.label}-${index}`}>
              <FooterLink link={item}>
                {item.icon ? <AppIcon aria-hidden name={item.icon} /> : null}
                <span className={item.icon ? 'sr-only' : ''}>
                  {item.label}
                  {item.newTab ? ' (opens in a new tab)' : ''}
                </span>
              </FooterLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function ContactDetails({ contact }: { contact: FooterModel['contact'] }) {
  if (!contact?.address && !contact?.email && !contact?.phone) return null

  return (
    <address className="site-footer__contact">
      <span className="site-footer__supporting-label">Head Office:</span>
      {contact.address ? <span>{contact.address}</span> : null}
      {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : null}
      {contact.phone ? (
        <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
      ) : null}
    </address>
  )
}

function CertificationMarks({ marks }: { marks: FooterCertificationModel[] }) {
  if (!marks.length) return null

  return (
    <ul aria-label="Certifications" className="site-footer__certifications">
      {marks.map((mark, index) => (
        <li key={`${mark.name}-${index}`}>
          {mark.url ? (
            <a aria-label={mark.name} href={mark.url}>
              {mark.media}
            </a>
          ) : (
            mark.media
          )}
        </li>
      ))}
    </ul>
  )
}

export function FooterSupporting({ model }: { model: FooterModel }) {
  const hasContact = Boolean(model.contact?.address || model.contact?.email || model.contact?.phone)
  if (
    !model.disclaimer &&
    !model.socialLinks.length &&
    !hasContact &&
    !model.certifications.length
  ) {
    return null
  }

  return (
    <div className="site-footer__supporting trayport-container">
      {model.disclaimer ? <p className="site-footer__disclaimer">{model.disclaimer}</p> : null}
      <SocialLinks links={model.socialLinks} />
      <ContactDetails contact={model.contact} />
      <CertificationMarks marks={model.certifications} />
    </div>
  )
}
