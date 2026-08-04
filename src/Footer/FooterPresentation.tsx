import { cn } from '@/utilities/ui'

import { FooterBrand } from './FooterBrand'
import { FooterLegal } from './FooterLegal'
import { FooterNavigation } from './FooterNavigation'
import { FooterSupporting } from './FooterSupporting'
import type { FooterModel } from './types'

export function FooterPresentation({
  className,
  model,
}: {
  className?: string
  model: FooterModel
}) {
  return (
    <footer className={cn('site-footer', className)}>
      <div className="site-footer__main trayport-container">
        <FooterBrand siteName={model.siteName} />
        <FooterNavigation columns={model.columns} />
      </div>
      <FooterSupporting model={model} />
      <FooterLegal model={model} />
    </footer>
  )
}
