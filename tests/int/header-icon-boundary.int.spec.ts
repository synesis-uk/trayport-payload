// @vitest-environment node

import { readFileSync } from 'node:fs'
import { createElement, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { HeaderModel } from '@/Header/navigation'
import { presentHeader } from '@/Header/presentation'
import { ControlIcon } from '@/components/icons/ControlIcon'
import { ShellIcon } from '@/components/icons/ShellIcon'
import { controlIcons } from '@/components/icons/controlRegistry'
import { shellIcons } from '@/components/icons/shellRegistry'

const readProjectFile = (path: string): string =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

describe('public-shell Font Awesome boundary', () => {
  it('keeps the eager shell registry fixed and deliberately small', () => {
    expect(Object.keys(shellIcons).sort()).toEqual(['chevronDown', 'close', 'menu', 'search'])
    expect(Object.keys(controlIcons).sort()).toEqual([
      'check',
      'chevronDown',
      'chevronUp',
      'close',
      'minus',
      'playCircle',
      'spinner',
    ])

    const fixedMarkup = renderToStaticMarkup(
      createElement(
        Fragment,
        null,
        createElement(ShellIcon, { 'aria-hidden': true, name: 'chevronDown' }),
        createElement(ControlIcon, { 'aria-hidden': true, name: 'spinner' }),
      ),
    )
    expect(fixedMarkup).toContain('data-prefix="fasdl"')
    expect(fixedMarkup).toContain('data-icon="angle-down"')
    expect(fixedMarkup).toContain('class="fa-duotone-group"')
    expect(fixedMarkup).toContain('data-icon="spinner-third"')
    expect(readProjectFile('src/components/icons/BoundedIcon.tsx')).not.toContain(
      '@fortawesome/react-fontawesome',
    )
    expect(readProjectFile('src/components/icons/AppIcon.tsx')).toContain(
      '@fortawesome/react-fontawesome',
    )
  })

  it('renders CMS-selected navigation icons into server slots', () => {
    const model: HeaderModel = {
      items: [
        {
          groups: [
            {
              id: 'products-group',
              items: [
                {
                  icon: 'buildingSecurity',
                  kind: 'link',
                  link: { href: '/security/', label: 'Security', newTab: false },
                },
              ],
              span: 'auto',
            },
          ],
          id: 'products',
          label: 'Products',
          link: { href: '/products/', label: 'Products', newTab: false },
        },
      ],
      siteName: 'Trayport',
      utilityItems: [
        {
          href: '/request-a-demo/',
          icon: 'calendar',
          label: 'Request a demo',
          newTab: false,
        },
      ],
    }

    const presented = presentHeader(model)
    const markup = renderToStaticMarkup(
      createElement(
        Fragment,
        null,
        presented.items[0]?.groups[0]?.items[0]?.icon,
        presented.utilityItems[0]?.icon,
      ),
    )

    expect(markup).toContain('data-icon="building-lock"')
    expect(markup).toContain('data-icon="calendar-days"')
    expect(presented.items[0]?.groups[0]?.items[0]?.link).toEqual(
      model.items[0]?.groups[0]?.items[0]?.link,
    )
  })

  it('keeps the general registry behind a server-only adapter', () => {
    const presentation = readProjectFile('src/Header/presentation.tsx')
    const eagerClientFiles = [
      'src/Header/DesktopNavigation.client.tsx',
      'src/Header/MobileNavigation.client.tsx',
      'src/Header/SiteSearchDialog.client.tsx',
      'src/components/ui/accordion.tsx',
    ].map(readProjectFile)

    expect(presentation).toContain("import 'server-only'")
    expect(presentation).toContain("import { AppIcon } from '@/components/icons'")
    expect(eagerClientFiles.every((source) => source.includes('ShellIcon'))).toBe(true)
    expect(eagerClientFiles.join('\n')).not.toMatch(/from ['"]@\/components\/icons['"]/)
    expect(eagerClientFiles.join('\n')).not.toContain('appIcons')
  })

  it('keeps client content and primitive modules off the general icon registry', () => {
    const clientSafeFiles = [
      'src/components/Trayport/ArticleListingClient.tsx',
      'src/components/Trayport/LearningVideoListingClient.tsx',
      'src/components/Trayport/TrayportMedia.tsx',
      'src/components/Trayport/TrayportVideo.client.tsx',
      'src/components/blocks/MarketMatrixPresentation.client.tsx',
      'src/components/site/FeatureCarousel.client.tsx',
      'src/components/ui/button-link.tsx',
      'src/components/ui/button.tsx',
      'src/components/ui/checkbox.tsx',
      'src/components/ui/dropdown-menu.tsx',
      'src/components/ui/icon-button.tsx',
      'src/components/ui/select.tsx',
    ].map(readProjectFile)
    const serverSlotAdapters = [
      'src/components/blocks/layoutServerAdapters.tsx',
      'src/components/blocks/presentation.tsx',
      'src/components/blocks/serverAdapters.tsx',
    ].map(readProjectFile)

    expect(clientSafeFiles.join('\n')).not.toMatch(/from ['"]@\/components\/icons['"]/)
    expect(clientSafeFiles.join('\n')).not.toContain('appIcons')
    expect(serverSlotAdapters.every((source) => source.includes('AppIcon'))).toBe(true)
    expect(readProjectFile('src/components/site/index.ts')).not.toContain('FeatureCarousel')
    expect(readProjectFile('src/app/(frontend)/error.tsx')).not.toMatch(
      /from ['"]@\/components\/site['"]/,
    )
  })

  it('gates production builds on the public-shell chunks and CMS-icon exclusion', () => {
    const packageJSON = JSON.parse(readProjectFile('package.json')) as {
      scripts: Record<string, string>
    }
    const budget = readProjectFile('scripts/check-public-shell-budget.mjs')

    expect(packageJSON.scripts.postbuild).toMatch(/^node scripts\/check-public-shell-budget\.mjs/)
    expect(budget).toContain('MAX_PUBLIC_SHELL_GZIP_BYTES = 60 * 1024')
    expect(budget).toContain("'building-lock', 'chart-waterfall'")
    expect(budget).toContain('entry.endsWith(LAYOUT_ENTRY_SUFFIX)')
    expect(budget).toContain('gzipSync(source, { level: 9 })')
  })
})
