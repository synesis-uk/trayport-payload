import { FooterLink } from './FooterLink'
import type { FooterModel } from './types'

export function FooterLegal({ model }: { model: FooterModel }) {
  return (
    <div className="site-footer__legal">
      <div className="site-footer__legal-inner trayport-container">
        {model.legalText.companyRegistration ? <p>{model.legalText.companyRegistration}</p> : null}
        {model.legalText.parentCompany ? <p>{model.legalText.parentCompany}</p> : null}
        <p className="site-footer__copyright">{model.copyright}</p>
        {model.legalLinks.length ? (
          <nav aria-label="Legal">
            <ul>
              {model.legalLinks.map((item, index) => (
                <li key={`${item.label}-${index}`}>
                  <FooterLink link={item} />
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </div>
  )
}
