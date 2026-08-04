import { AppIcon } from '@/components/icons'
import type { FooterIconName } from '@/config/footer'

import { FooterLink } from './FooterLink'
import type { FooterColumnModel } from './types'

const iconName = (name: FooterIconName) => name

export function FooterNavigation({ columns }: { columns: FooterColumnModel[] }) {
  if (!columns.length) return null

  return (
    <nav aria-label="Footer navigation" className="site-footer__navigation">
      {columns.map((column, index) => (
        <div className="site-footer__navigation-column" key={`${column.title || 'links'}-${index}`}>
          {column.title ? (
            <h2>
              {column.titleLink ? (
                <FooterLink link={column.titleLink}>{column.title}</FooterLink>
              ) : (
                column.title
              )}
            </h2>
          ) : null}
          <ul>
            {column.links.map((item, itemIndex) => (
              <li key={`${item.label}-${itemIndex}`}>
                <FooterLink link={item}>
                  {item.icon ? (
                    <span
                      className="site-footer__navigation-icon"
                      data-accent={item.accent || 'white'}
                    >
                      <AppIcon aria-hidden name={iconName(item.icon)} />
                    </span>
                  ) : null}
                  <span>{item.label}</span>
                </FooterLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
