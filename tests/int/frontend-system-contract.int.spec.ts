// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'

import packageJSON from '../../package.json'
import { appIcons, featureIconNames } from '@/components/icons'

describe('locked frontend system', () => {
  it('uses the approved Tailwind, Radix, and Font Awesome stack', () => {
    expect(packageJSON.devDependencies.tailwindcss).toBe('4.3.3')
    expect(packageJSON.devDependencies['@tailwindcss/postcss']).toBe('4.3.3')
    expect(packageJSON.dependencies['@fortawesome/react-fontawesome']).toBe('3.5.0')
    expect(packageJSON.dependencies['@awesome.me/kit-9e17af3472']).toBe('1.0.10')
    expect('@fontsource-variable/inter' in packageJSON.dependencies).toBe(false)
    expect(packageJSON.dependencies['@radix-ui/react-dialog']).toBe('1.1.23')
    expect(packageJSON.dependencies['@radix-ui/react-accordion']).toBe('1.2.20')
    expect(packageJSON.dependencies['@radix-ui/react-dropdown-menu']).toBe('2.1.24')
    expect(packageJSON.dependencies['@radix-ui/react-popover']).toBe('1.1.23')
  })

  it('does not retain competing icon or component systems', () => {
    const dependencies: Record<string, string> = {
      ...packageJSON.dependencies,
      ...packageJSON.devDependencies,
    }

    for (const dependency of [
      'lucide-react',
      '@headlessui/react',
      '@heroicons/react',
      '@mui/material',
    ]) {
      expect(dependencies[dependency]).toBeUndefined()
    }
  })

  it('keeps the application icon vocabulary semantic and bounded', () => {
    expect(Object.keys(appIcons).sort()).toEqual([
      'arrowRight',
      'asiaPacific',
      'ballot',
      'buildingSecurity',
      'bulkMarkets',
      'calculator',
      'calendar',
      'candlestickChart',
      'careers',
      'chart',
      'chartLine',
      'check',
      'chevronDown',
      'chevronLeft',
      'chevronRight',
      'chevronUp',
      'climate',
      'clock',
      'close',
      'code',
      'companyProfile',
      'compare',
      'connections',
      'connectivity',
      'contact',
      'csvFile',
      'demo',
      'email',
      'emissions',
      'europe',
      'externalLink',
      'file',
      'forward',
      'gas',
      'image',
      'insight',
      'legalDocument',
      'lifecycle',
      'lightbulb',
      'linkedin',
      'list',
      'location',
      'lock',
      'map',
      'marketAccess',
      'marketMatrix',
      'menu',
      'messages',
      'metals',
      'minus',
      'more',
      'network',
      'news',
      'northAmerica',
      'offices',
      'oil',
      'pause',
      'people',
      'phone',
      'pieChart',
      'play',
      'playCircle',
      'plus',
      'power',
      'powerVolume',
      'quote',
      'regionAsiaPacific',
      'regionEurope',
      'regionNorthAmerica',
      'scan',
      'search',
      'searchInsight',
      'settings',
      'shield',
      'spinner',
      'tradingScreen',
      'trend',
      'users',
      'video',
      'waterfallChart',
      'world',
      'x',
    ])
    expect(featureIconNames).toEqual(['lightbulb', 'trend', 'clock', 'chart', 'scan'])
  })

  it('defines every planned semantic token family in the CSS-first source', () => {
    const tokens = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8')

    for (const token of [
      '--text-display',
      '--font-weight-heading',
      '--spacing-control',
      '--spacing-section-regular',
      '--container-reading',
      '--border-strong',
      '--radius-panel',
      '--shadow-overlay',
      '--breakpoint-lg',
      '--focus-ring-color',
      '--duration-fast',
      '--chart-1',
      '--map-marker',
      '--layer-overlay',
    ]) {
      expect(tokens).toContain(token)
    }

    expect(tokens).toContain('@utility focus-ring')
    expect(tokens).toContain('@utility z-overlay')
    expect(tokens).toContain('--breakpoint-2xl: 96rem;')
  })

  it('keeps semantic token declarations in one source without accidental duplicates', () => {
    const tokensURL = new URL('../../src/styles/tokens.css', import.meta.url)
    const tokens = readFileSync(tokensURL, 'utf8')
    const definitions = [...tokens.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map(([, token]) => token)
    const counts = definitions.reduce<Map<string, number>>(
      (result, token) => result.set(token, (result.get(token) || 0) + 1),
      new Map(),
    )
    const responsiveOverrides = new Set(['--gutter'])
    const unexpectedDuplicates = [...counts]
      .filter(([token, count]) => count > 1 && !responsiveOverrides.has(token))
      .map(([token]) => token)
      .sort()

    expect(unexpectedDuplicates).toEqual([])

    const canonicalTokens = new Set(definitions)
    const frontendStyles = new URL('../../src/app/(frontend)/', import.meta.url)
    const competingDefinitions = readdirSync(frontendStyles)
      .filter((file) => file.endsWith('.css'))
      .flatMap((file) => {
        const source = readFileSync(new URL(file, frontendStyles), 'utf8')
        return [...source.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)]
          .map(([, token]) => token)
          .filter((token) => canonicalTokens.has(token) && !responsiveOverrides.has(token))
          .map((token) => `${file}:${token}`)
      })

    expect(competingDefinitions).toEqual([])
  })

  it('uses Tailwind 4 CSS-first configuration without a legacy JavaScript bridge', () => {
    const globals = readFileSync(
      new URL('../../src/app/(frontend)/globals.css', import.meta.url),
      'utf8',
    )

    expect(globals).not.toContain('@config')
    expect(globals).toContain('@plugin "@tailwindcss/typography"')
    expect(globals).toContain('.trayport-prose.trayport-prose')
    expect(existsSync(new URL('../../tailwind.config.mjs', import.meta.url))).toBe(false)
    expect('autoprefixer' in packageJSON.devDependencies).toBe(false)
    expect('@types/escape-html' in packageJSON.devDependencies).toBe(false)
  })

  it('keeps resets layered and retired renderer selectors absent', () => {
    const globals = readFileSync(
      new URL('../../src/app/(frontend)/globals.css', import.meta.url),
      'utf8',
    )

    expect(globals).toContain('@layer base {')
    expect(globals).toContain('@layer components {')
    for (const retiredSelector of [
      '.desktop-navigation__description',
      '.site-footer__brand-column',
      '.trayport-chart__bar',
      '.trayport-chart__legend',
      '.trayport-chart__plot',
      '.trayport-chart__quarter',
      '.trayport-connectivity__groups',
      '.trayport-coverage-map__grid',
      '.trayport-detail__grid',
      '.trayport-detail__logo',
      '.trayport-detail__primary',
      '.trayport-detail__summary',
      '.trayport-hub__content',
      '.trayport-hub__hero',
      '.trayport-hub__inner',
      '.trayport-venue-group',
    ]) {
      expect(globals, retiredSelector).not.toContain(retiredSelector)
    }
  })

  it('self-hosts the reference Inter generation without a runtime font CDN', () => {
    const globals = readFileSync(
      new URL('../../src/app/(frontend)/globals.css', import.meta.url),
      'utf8',
    )
    const layout = readFileSync(
      new URL('../../src/app/(frontend)/layout.tsx', import.meta.url),
      'utf8',
    )
    const galleryLayout = readFileSync(
      new URL('../../src/app/(design-system)/design-system/layout.tsx', import.meta.url),
      'utf8',
    )
    const globalNotFound = readFileSync(
      new URL('../../src/app/global-not-found.tsx', import.meta.url),
      'utf8',
    )
    const fonts = readFileSync(new URL('../../src/styles/fonts.css', import.meta.url), 'utf8')
    const tokens = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8')
    const provenance = readFileSync(
      new URL('../../src/styles/fonts/README.md', import.meta.url),
      'utf8',
    )
    const expectedFaces = {
      'inter-v4.1-latin-ext-static-bold.woff2':
        'ef8262fb43b762c380ecd732b1922da54d783dabf69d6cdc5a4a80b8487e9505',
      'inter-v4.1-latin-ext-static-regular.woff2':
        '339329e0c580a9a660b761a2418a87df4abed573126923c471e03edf36c583fb',
      'inter-v4.1-latin-ext-variable-italic.woff2':
        'a74f5931e84e245f00e02e0010085706b4e9e6acd048932350bfcecfeb6110ef',
      'inter-v4.1-latin-ext-variable-normal.woff2':
        '2cf0b6c201f0d80be1ff968f8ba2484585d2d9182cb9baa3ebd3bac869860183',
      'inter-v4.1-latin-variable-italic.woff2':
        'e786bf233dddee31fa7b581dbe73fddc265b3c52e00ac19c7db673ce16d20240',
      'inter-v4.1-latin-variable-normal.woff2':
        '912025911cfbd8d1da955b543eabc79bcd07ceded63c2a8ba39a7adf1768a4c5',
      'inter-v4.1-latin-static-bold.woff2':
        '39e54e048d7e6fd175f80b941b174c445b4b130bdcc78dc993307383f91c0a31',
      'inter-v4.1-latin-static-regular.woff2':
        '1026c48f5b1eb4979f3f9e802f58b74fa3d3a7cbaf779cfffc47bb145d740188',
    }

    expect(globals).not.toContain('rsms.me')
    expect(globals).toContain("@import '../../styles/fonts.css';")
    expect(fonts).not.toContain('rsms.me')
    expect(fonts.match(/@font-face/g)).toHaveLength(8)
    expect(fonts.match(/font-family: 'InterVariable'/g)).toHaveLength(4)
    expect(fonts.match(/font-family: 'Inter'/g)).toHaveLength(4)
    expect(fonts.match(/font-weight: 100 900/g)).toHaveLength(4)
    expect(fonts.match(/font-weight: 400/g)).toHaveLength(2)
    expect(fonts.match(/font-weight: 700/g)).toHaveLength(2)
    expect(fonts.match(/font-display: swap/g)).toHaveLength(8)
    expect(fonts).toContain('font-style: normal')
    expect(fonts).toContain('font-style: italic')
    expect(tokens).toContain("--font-inter: 'InterVariable';")
    expect(layout).not.toContain('next/font/local')
    expect(layout).not.toContain('rsms.me')
    expect(layout).not.toContain('@fontsource-variable/inter')
    expect(galleryLayout).not.toContain('@fontsource-variable/inter')
    expect(galleryLayout).not.toContain('next/font/local')
    expect(globalNotFound).not.toContain('@fontsource-variable/inter')
    expect(provenance).toContain('693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3')

    for (const [filename, hash] of Object.entries(expectedFaces)) {
      const face = readFileSync(new URL(`../../src/styles/fonts/${filename}`, import.meta.url))
      expect(fonts).toContain(`./fonts/${filename}`)
      expect(createHash('sha256').update(face).digest('hex')).toBe(hash)
    }

    const license = readFileSync(new URL('../../src/styles/fonts/LICENSE.txt', import.meta.url))
    expect(createHash('sha256').update(license).digest('hex')).toBe(
      '262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a',
    )
  })

  it('keeps the accepted WordPress hero polygon asset code-owned and immutable', () => {
    const asset = readFileSync(
      new URL('../../public/brand/bg-poly-angle-opacity-02.png', import.meta.url),
    )
    const parityCSS = readFileSync(
      new URL('../../src/app/(frontend)/parity-blocks.css', import.meta.url),
      'utf8',
    )

    expect(createHash('sha256').update(asset).digest('hex')).toBe(
      '327fbdfef7fb970a7a49e186825ba930745c91cacc40270561289e78e11af2dd',
    )
    expect(parityCSS).toContain("url('/brand/bg-poly-angle-opacity-02.png')")
  })

  it('keeps the Home map height and legacy Mapbox chrome treatment explicit and scoped', () => {
    const parityCSS = readFileSync(
      new URL('../../src/app/(frontend)/parity-blocks.css', import.meta.url),
      'utf8',
    )
    const runtimeCSS = readFileSync(
      new URL('../../src/components/blocks/connections-map-runtime.css', import.meta.url),
      'utf8',
    )

    expect(parityCSS).toContain(
      '.trayport-market-coverage:not(.trayport-market-coverage--map-only) .trayport-coverage-map',
    )
    expect(parityCSS).not.toMatch(
      /@media \(max-width: 47\.999rem\)[\s\S]*?\n\s{4}\.trayport-coverage-map \{\n\s+min-height: min/,
    )
    expect(parityCSS).not.toContain('mapboxgl-ctrl-logo')
    expect(runtimeCSS).toContain('.trayport-coverage-map__interactive .mapboxgl-ctrl-logo {')
    expect(runtimeCSS).toContain(
      '.trayport-coverage-map__interactive .mapboxgl-ctrl-bottom-right {',
    )
    expect(runtimeCSS).toContain('.trayport-coverage-map__interactive .mapboxgl-popup-tip {')
  })

  it('targets the map surface by class so control icons never inherit map geometry', () => {
    // `.trayport-coverage-map` wraps the whole regional explorer, including its Radix
    // select triggers and their inline Font Awesome chevrons. A descendant `svg` selector
    // therefore applies map sizing to every control icon; `min-height` in particular has
    // no competing Tailwind utility, so chevrons inherited the full map height.
    const sources = [
      'src/app/(frontend)/globals.css',
      'src/app/(frontend)/parity-blocks.css',
      'src/app/(frontend)/parity-home.css',
    ]

    for (const source of sources) {
      const css = readFileSync(new URL(`../../${source}`, import.meta.url), 'utf8')
      expect(css, `${source} must not size every svg inside the coverage map`).not.toMatch(
        /\.trayport-coverage-map\s+svg\b/,
      )
    }
  })

  it('keeps source-measured Home and Joule corrections route-scoped and reversible', () => {
    const home = readFileSync(
      new URL('../../src/app/(frontend)/parity-home.css', import.meta.url),
      'utf8',
    )
    const joule = readFileSync(
      new URL('../../src/app/(frontend)/parity-joule.css', import.meta.url),
      'utf8',
    )

    expect(home).not.toContain('.trayport-hero__polygon')
    expect(home).toContain(
      '> .trayport-section--has-feature-list.trayport-section--has-rich-text:not(',
    )
    expect(home).toContain('.trayport-video-fallback:focus-visible')
    expect(home).toContain('grid-template-columns: repeat(3, minmax(0, 1fr));')
    expect(home).toContain('font-size: 1.5rem;')
    expect(home).toContain('padding-inline: 3rem;')

    expect(joule).toContain(".trayport-page[data-page-path='/products/joule/']")
    expect(joule).toMatch(
      /@media \(min-width: 48rem\)[\s\S]*?> \.trayport-section--has-faq[\s\S]*?font-size: 1\.25rem;[\s\S]*?flex-basis: 0;[\s\S]*?min-height: 4\.25rem;/,
    )
    expect(joule).toMatch(
      /> \.trayport-section--has-faq[\s\S]*?> \.trayport-column__content::after \{[\s\S]*?flex-basis: 1\.75rem;/,
    )
  })

  it('starts the configured standalone production output through the asset-staging wrapper', () => {
    expect(packageJSON.scripts.start).toContain('scripts/start-standalone.mjs')
  })
})
