import { expect, test } from '@playwright/test'
import { JSDOM } from 'jsdom'

import { featuredInsights } from '../helpers/site'

test.describe('imported dynamic content', () => {
  test('Insights renders four ordered featured records and all 39 imported listing records', async ({
    page,
  }) => {
    await page.goto('/resources/insights/')

    const featuredSection = page.locator('section.trayport-featured-articles')
    await expect(
      featuredSection.getByRole('heading', { exact: true, name: 'Featured insights' }),
    ).toBeVisible()

    const featuredCards = featuredSection.locator('.trayport-article-card')
    await expect(featuredCards).toHaveCount(4)
    for (const [index, article] of featuredInsights.entries()) {
      const card = featuredCards.nth(index)
      await expect(card.getByRole('heading', { exact: true, name: article.title })).toBeVisible()
      const href = await card.getAttribute('href')
      expect(href).toBeTruthy()
      const destination = new URL(href!)
      expect(destination.hostname).toMatch(/^(www\.)?trayport\.com$/)
      expect(destination.pathname).toBe(article.path)
      await expect(card).toHaveAttribute('target', '_blank')
    }

    const articleRows = page.locator('.trayport-article-list .trayport-article-row')
    await expect(page.getByRole('button', { name: 'Load more insights' })).toHaveCount(0)
    await expect(articleRows).toHaveCount(35)
    expect((await featuredCards.count()) + (await articleRows.count())).toBe(39)
  })

  test('Insights search finds the scoped full-body article and preserves its route', async ({
    page,
  }) => {
    await page.goto('/resources/insights/')

    const search = page.getByRole('searchbox', { name: 'Search insights' })
    await expect(search).toBeEditable()
    await search.fill('Data Analytics for Energy Traders')

    await expect(page.locator('section.trayport-featured-articles')).toHaveCount(0)
    const result = page.locator('.trayport-article-list a.trayport-article-row')
    await expect(result).toHaveCount(1)
    await expect(
      result.getByRole('heading', { exact: true, name: 'Data Analytics for Energy Traders' }),
    ).toBeVisible()
    await expect(result).toHaveAttribute(
      'href',
      '/insights/on-demand-webinar-data-analytics-for-energy-traders/',
    )
  })

  test('Insights query state is correct in server HTML before client hydration', async ({
    request,
  }) => {
    const response = await request.get(
      '/resources/insights/?q=definitely-no-such-insight-for-server-rendering',
    )
    expect(response.status()).toBe(200)

    const html = await response.text()
    const document = new JSDOM(html).window.document
    document.querySelectorAll('script').forEach((script) => script.remove())
    const serverMarkupText = document.body.textContent?.replace(/\s+/g, ' ').trim()

    expect(serverMarkupText).toContain('No insights match those filters.')
    expect(serverMarkupText).not.toContain('ETCSEE 2026: Automate your trading or lose')
  })

  test('German Power renders relationship-driven Joule and autoTRADER groups', async ({ page }) => {
    await page.goto('/market-coverage/german-power/')

    const hub = page.locator('main[data-content-type="hub"]')
    await expect(hub).toBeVisible()
    await expect(hub.locator('.trayport-structured-hub__header')).toHaveAttribute(
      'data-media',
      'image',
    )
    const headerImage = hub.locator('.trayport-structured-hub__header img')
    await expect(headerImage).toBeVisible()
    await expect(headerImage).toHaveAttribute('src', /AdobeStock_525262198-scaled\.jpeg/)
    await expect
      .poll(() =>
        headerImage.evaluate(
          (image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
        ),
      )
      .toBe(true)
    const classification = hub.locator('.trayport-structured-hub__classification')
    await expect(classification).toHaveText('Power')
    await expect(classification.locator('svg')).toHaveAttribute('data-icon', 'lightbulb-cfl')
    await expect(
      hub.locator('.trayport-structured-hub__title-tab').getByRole('heading', {
        exact: true,
        level: 1,
        name: 'German Power',
      }),
    ).toBeVisible()

    const productSections = page.locator('section.trayport-connectivity')
    await expect(productSections).toHaveCount(2)
    await expect(
      hub.getByRole('heading', { exact: true, level: 2, name: 'Connected Venues' }),
    ).toBeVisible()

    const joule = productSections.filter({
      has: page.getByRole('heading', { exact: true, level: 3, name: 'Joule' }),
    })
    const autoTrader = productSections.filter({
      has: page.getByRole('heading', { exact: true, level: 3, name: 'autoTRADER' }),
    })
    await expect(
      joule.locator('.trayport-venue-list > li:not(.trayport-venue-list__group-heading)'),
    ).toHaveCount(19)
    await expect(
      autoTrader.locator('.trayport-venue-list > li:not(.trayport-venue-list__group-heading)'),
    ).toHaveCount(11)

    const visibleVenueNames = await productSections
      .locator('.trayport-venue-list > li:not(.trayport-venue-list__group-heading)')
      .allTextContents()
    expect(
      new Set(
        visibleVenueNames.map((name) => name.replace(/\s*\(opens in a new tab\)$/, '').trim()),
      ).size,
    ).toBe(21)

    for (const group of ['Brokers', 'Exchanges', 'Clearing Houses']) {
      await expect(joule.getByRole('heading', { exact: true, level: 4, name: group })).toBeVisible()
    }

    const jouleVenueTitles = await joule
      .locator('.trayport-venue-list > li:not(.trayport-venue-list__group-heading) > :first-child')
      .evaluateAll((elements) =>
        elements.map(
          (element) => element.querySelector('span')?.textContent || element.textContent,
        ),
      )
    expect(jouleVenueTitles).toEqual([
      'GMG Brokers Europe B.V.',
      'Tullett Prebon',
      'Tradition',
      'OTCex',
      'Marex Spectron',
      'ICAP',
      'Griffin Markets',
      'GFI',
      'CIMD',
      'BGC Partners',
      '42 Financial',
      'CME Group',
      'ICE ENDEX',
      'EPEX***',
      'EEX',
      'OMIP',
      'ICE Clear Europe',
      'ECC',
      'CME ClearPort',
    ])
    await expect(
      joule.getByRole('link', {
        exact: true,
        name: '42 Financial (opens in a new tab)',
      }),
    ).toHaveAttribute('href', 'https://www.42fs.com/')

    const grid = joule.locator('.trayport-venue-list')
    await expect(grid.locator('svg')).toHaveCount(0)
    expect(await grid.evaluate((element) => getComputedStyle(element).columnGap)).toBe('4px')
    expect(
      await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ')),
    ).toHaveLength(4)
    const firstCell = grid.locator('li:not(.trayport-venue-list__group-heading)').first()
    expect(
      await firstCell
        .locator(':scope > *')
        .evaluate((element) => getComputedStyle(element).padding),
    ).toBe('8px')
    expect(
      await firstCell
        .locator(':scope > *')
        .evaluate((element) => getComputedStyle(element).backgroundColor),
    ).toBe('rgb(250, 250, 250)')

    await page.setViewportSize({ height: 844, width: 390 })
    expect(
      await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ')),
    ).toHaveLength(4)
  })

  test('News renders all 31 imported listing records through its managed index', async ({
    page,
  }) => {
    await page.goto('/resources/news/')

    const featuredCards = page.locator('.trayport-featured-articles .trayport-article-card')
    const articleRows = page.locator('.trayport-article-list .trayport-article-row')
    await expect(featuredCards).toHaveCount(1)
    await expect(page.getByRole('button', { name: 'Load more news' })).toHaveCount(0)
    await expect(articleRows).toHaveCount(30)
    expect((await featuredCards.count()) + (await articleRows.count())).toBe(31)
  })

  test('Home uses image heroes, imported statistics, Highcharts, and the managed map', async ({
    page,
  }, testInfo) => {
    await page.goto('/')

    const hero = page.locator('.trayport-hero')
    await expect(hero.locator('.trayport-hero__media img')).toHaveCount(1)
    await expect(hero.locator('video')).toHaveCount(0)
    await expect(hero.locator('.trayport-hero__statistics > div')).toHaveCount(4)

    await expect(page.locator('.highcharts-root')).toHaveCount(2)
    const chartData = page.locator('.trayport-chart__data').first()
    await chartData.locator('summary').click()
    await expect(chartData).toHaveAttribute('open', '')
    await expect(chartData.locator('tbody tr')).toHaveCount(20)

    await expect(page.locator('.trayport-coverage-map__media img')).toHaveCount(1)

    await expect(page.getByRole('heading', { name: 'Why Trayport?' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Who we serve' })).toHaveCount(0)

    const mapOnly = page.locator('.trayport-market-coverage--map-only')
    await expect(mapOnly).toHaveCount(1)
    await expect(mapOnly.locator('.trayport-market-coverage__copy')).toHaveCount(0)
    await expect(mapOnly.locator('figcaption')).toHaveClass(/sr-only/)

    const clientGrid = page.locator('.trayport-entities--clients')
    const clientNames = clientGrid.locator('h3')
    await expect(clientNames).toHaveCount(26)
    expect(
      await clientNames.evaluateAll((headings) =>
        headings.every((heading) => heading.classList.contains('sr-only')),
      ),
    ).toBe(true)
    await expect(clientGrid.locator('.trayport-entity > svg')).toHaveCount(0)
    expect(
      await clientGrid.evaluate(
        (element) => getComputedStyle(element).gridTemplateColumns.split(' ').length,
      ),
    ).toBe(testInfo.project.name === 'mobile-chromium' ? 2 : 4)
  })

  test('Home and Joule share the reference desktop hero geometry', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium')

    for (const [path, expectedHeadingLines] of [
      ['/', 1],
      ['/products/joule/', 3],
    ] as const) {
      await page.goto(path)

      const hero = page.locator('.trayport-hero')
      await expect(hero).toBeVisible()
      await expect(hero.locator('h1')).toBeVisible()
      await expect(hero.locator('.trayport-hero__statistics > div')).toHaveCount(4)

      const geometry = await hero.evaluate((hero) => {
        const content = hero.querySelector<HTMLElement>('.trayport-hero__content')!
        const body = hero.querySelector<HTMLElement>('.trayport-prose p')!
        const heading = hero.querySelector<HTMLElement>('h1')!
        const cards = Array.from(
          hero.querySelectorAll<HTMLElement>('.trayport-hero__statistics > div'),
        )
        const heroBox = hero.getBoundingClientRect()
        const contentBox = content.getBoundingClientRect()
        const headingBox = heading.getBoundingClientRect()
        const cardBoxes = cards.map((card) => card.getBoundingClientRect())
        const headingRange = document.createRange()
        headingRange.selectNodeContents(heading)

        return {
          cardBottomInset: heroBox.bottom - cardBoxes.at(-1)!.bottom,
          cardGap: cardBoxes[1].left - cardBoxes[0].right,
          cardHeight: cardBoxes[0].height,
          bodyColor: getComputedStyle(body).color,
          contentRatio: contentBox.width / heroBox.width,
          headingInset: headingBox.left - heroBox.left,
          headingLines: new Set(
            Array.from(headingRange.getClientRects(), (rect) => Math.round(rect.top)),
          ).size,
          heroHeight: heroBox.height,
          heroRatio: heroBox.width / heroBox.height,
          statsInset: cardBoxes[0].left - heroBox.left,
        }
      })

      expect(geometry.heroHeight).toBeCloseTo(720, 0)
      expect(geometry.heroRatio).toBeCloseTo(2, 2)
      expect(geometry.contentRatio).toBeCloseTo(0.47, 2)
      expect(geometry.headingInset).toBeCloseTo(48, 0)
      expect(geometry.headingLines).toBe(expectedHeadingLines)
      expect(geometry.statsInset).toBeCloseTo(48, 0)
      expect(geometry.cardGap).toBeCloseTo(24, 0)
      expect(geometry.cardHeight).toBeGreaterThanOrEqual(98)
      expect(geometry.cardHeight).toBeLessThanOrEqual(104)
      expect(geometry.cardBottomInset).toBeCloseTo(16, 0)
      expect(geometry.bodyColor).toMatch(/rgba?\(255, 255, 255/)
    }
  })

  test('the shared hero keeps a readable, overflow-safe compact layout', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chromium')

    await page.goto('/products/joule/')
    const hero = page.locator('.trayport-hero')
    await expect(hero).toBeVisible()
    await expect(hero.locator('h1')).toBeVisible()

    const geometry = await hero.evaluate((hero) => {
      const content = hero.querySelector<HTMLElement>('.trayport-hero__content')!
      const body = hero.querySelector<HTMLElement>('.trayport-prose p')!
      const inner = hero.querySelector<HTMLElement>('.trayport-hero__inner')!
      const media = hero.querySelector<HTMLElement>('.trayport-hero__media')!
      const statistics = hero.querySelector<HTMLElement>('.trayport-hero__statistics')!
      const heroBox = hero.getBoundingClientRect()
      const contentBox = content.getBoundingClientRect()

      return {
        contentWidth: contentBox.width,
        bodyColor: getComputedStyle(body).color,
        heroWidth: heroBox.width,
        mediaBeforeContent:
          media.getBoundingClientRect().bottom <= inner.getBoundingClientRect().top,
        overflows: hero.scrollWidth > hero.clientWidth,
        statisticsDisplay: getComputedStyle(statistics).display,
      }
    })

    expect(geometry.statisticsDisplay).toBe('none')
    expect(geometry.bodyColor).toBe('rgb(31, 42, 68)')
    expect(geometry.mediaBeforeContent).toBe(true)
    expect(geometry.contentWidth).toBeCloseTo(geometry.heroWidth, 0)
    expect(geometry.overflows).toBe(false)
  })

  test('desktop site search restores focus and opens whole-site results', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium')

    await page.goto('/')
    const openSearch = page.getByRole('button', { name: 'Open site search' })
    await openSearch.click()

    const dialog = page.getByRole('dialog', { name: 'Site Search' })
    const field = page.getByRole('searchbox', { name: 'Search Trayport' })
    await expect(dialog).toBeVisible()
    await expect(field).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(openSearch).toBeFocused()

    await openSearch.click()
    await field.fill('energy')
    await field.press('Enter')
    await expect(page).toHaveURL('/?s=energy')
    await expect(page.getByRole('searchbox', { name: 'What are you looking for?' })).toHaveValue(
      'energy',
    )
    await expect(page.getByRole('heading', { name: /results? for “energy”/i })).toBeVisible()
  })

  test('Learning Hub renders 15 protected records and filters them by product', async ({
    page,
  }) => {
    await page.goto('/learning-hub/')

    const cards = page.locator('.trayport-video-grid .trayport-video-card')
    await expect(cards).toHaveCount(15)
    await expect(page.getByText('Trayport login required', { exact: true })).toHaveCount(15)

    const managedVideo = cards.filter({ hasText: 'Trading in Joule' })
    await expect(managedVideo).toHaveAttribute('href', '/learning-hub-video/trading-in-joule/')

    await page.getByRole('combobox', { name: 'Product' }).selectOption('Joule')
    await expect(cards).toHaveCount(4)
  })

  test('the selected Learning Hub detail is a protected metadata gate with a canonical alias', async ({
    page,
  }) => {
    const redirect = await page.request.get('/learning-hub/watch/trading-in-joule/', {
      maxRedirects: 0,
    })
    expect(redirect.status()).toBe(301)
    const location = redirect.headers().location
    expect(location).toBeTruthy()
    expect(new URL(location!, 'http://localhost:3000').pathname).toBe(
      '/learning-hub-video/trading-in-joule/',
    )

    const response = await page.goto('/learning-hub/watch/trading-in-joule/')

    expect(response?.status()).toBe(200)
    await expect(page).toHaveURL(/\/learning-hub-video\/trading-in-joule\/$/)
    await expect(
      page.getByRole('heading', {
        exact: true,
        level: 2,
        name: 'This video is available to customers with a Trayport login.',
      }),
    ).toBeVisible()
    await expect(page.locator('video, iframe[src*="video"], source[src]')).toHaveCount(0)
  })

  test('Office Locations renders all four structured office records', async ({ page }) => {
    await page.goto('/company/offices/')

    const offices = page.locator('.trayport-office')
    await expect(offices).toHaveCount(4)
    for (const office of [
      'Trayport Limited',
      'Trayport Austria GmbH',
      'Trayport Germany GmbH',
      'Trayport Pte Ltd',
    ]) {
      await expect(page.getByRole('heading', { exact: true, level: 3, name: office })).toBeVisible()
    }
  })

  test('EEX renders 37 unique connected hubs in four market groups', async ({ page }, testInfo) => {
    await page.goto('/venue/eex/')

    const venue = page.locator('main[data-content-type="venue"]')
    await expect(venue).toBeVisible()
    await expect(
      venue.locator('.trayport-structured-venue__identity').getByRole('heading', {
        exact: true,
        level: 1,
        name: 'EEX',
      }),
    ).toBeVisible()
    await expect(venue.locator('.trayport-structured-venue__logo')).toHaveCount(1)
    await expect(venue.locator('.trayport-structured-venue__logo')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    await expect(
      venue.locator('.trayport-structured-venue__identity .trayport-eyebrow'),
    ).toHaveText('Exchange')
    await expect(
      venue.getByRole('heading', { exact: true, level: 2, name: 'About EEX' }),
    ).toHaveCount(0)
    await expect(
      venue.getByText(
        'Discover EEX on Trayport: access real-time trading, market insights, and exchange opportunities for efficient commodity trading.',
        { exact: true },
      ),
    ).toHaveCount(0)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Discover EEX on Trayport: access real-time trading, market insights, and exchange opportunities for efficient commodity trading.',
    )
    await expect(venue.getByRole('link', { exact: true, name: 'Contact Us' })).toHaveAttribute(
      'href',
      '/contact/',
    )

    const marketGroups = page.locator('.trayport-venue-markets__groups > section')
    await expect(marketGroups).toHaveCount(4)
    await expect(marketGroups.locator(':scope > h3')).toHaveText([
      'Power',
      'Natural Gas',
      'Climate',
      'Bulk',
    ])
    for (const group of ['Power', 'Natural Gas', 'Climate', 'Bulk']) {
      await expect(page.getByRole('heading', { exact: true, level: 3, name: group })).toBeVisible()
    }
    await expect(marketGroups.locator('li')).toHaveCount(37)
    await expect(marketGroups.locator('svg')).toHaveCount(0)
    await expect(marketGroups.getByText('Czech Power', { exact: true })).toHaveCount(1)
    await expect(page.getByRole('link', { exact: true, name: 'German Power' })).toHaveAttribute(
      'href',
      '/market-coverage/german-power/',
    )

    const powerMarkets = (await marketGroups.first().locator('li').allTextContents()).map((title) =>
      title.replace(/\s*\(opens in a new tab\)$/, '').trim(),
    )
    expect(powerMarkets.slice(0, 6)).toEqual([
      'Austrian Power',
      'Belgian Power',
      'Czech Power',
      'Dutch Power',
      'French Power',
      'German Power',
    ])

    const marketsGrid = marketGroups.first().locator('ul')
    expect(
      await marketsGrid.evaluate((element) =>
        getComputedStyle(element).gridTemplateColumns.split(' '),
      ),
    ).toHaveLength(testInfo.project.name === 'mobile-chromium' ? 2 : 4)

    await page.setViewportSize({ height: 844, width: 390 })
    const firstMarketLink = marketGroups.locator('a').first()
    await expect(firstMarketLink).toBeVisible()
    expect((await firstMarketLink.boundingBox())?.height).toBeGreaterThanOrEqual(48)
    expect(
      await marketsGrid.evaluate((element) =>
        getComputedStyle(element).gridTemplateColumns.split(' '),
      ),
    ).toHaveLength(2)
    await expect(venue.locator('.trayport-structured-venue__logo')).toBeHidden()
    const contact = venue.getByRole('link', { exact: true, name: 'Contact Us' })
    expect((await contact.boundingBox())?.width).toBeLessThan(200)
  })
})
