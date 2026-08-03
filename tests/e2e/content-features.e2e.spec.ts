import { expect, test } from '@playwright/test'

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

  test('German Power renders relationship-driven Joule and autoTRADER groups', async ({ page }) => {
    await page.goto('/market-coverage/german-power/')

    const hub = page.locator('main[data-content-type="hub"]')
    await expect(hub).toBeVisible()
    await expect(hub.locator('.trayport-structured-hub__header')).toHaveAttribute(
      'data-media',
      'image',
    )
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
    await expect(joule.locator('.trayport-venue-list > li')).toHaveCount(19)
    await expect(autoTrader.locator('.trayport-venue-list > li')).toHaveCount(11)

    const visibleVenueNames = await productSections
      .locator('.trayport-venue-list > li')
      .allTextContents()
    expect(new Set(visibleVenueNames.map((name) => name.trim())).size).toBe(21)

    for (const group of ['Broker', 'Exchange', 'Clearing House']) {
      await expect(joule.getByRole('heading', { exact: true, level: 4, name: group })).toBeVisible()
    }
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
  }) => {
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
  })

  test('desktop site search restores focus and applies its query to Insights', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium')

    await page.goto('/')
    const openSearch = page.getByRole('button', { name: 'Open site search' })
    await openSearch.click()

    const dialog = page.getByRole('dialog', { name: 'Site Search' })
    const field = page.getByRole('searchbox', { name: 'Search Trayport insights' })
    await expect(dialog).toBeVisible()
    await expect(field).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(openSearch).toBeFocused()

    await openSearch.click()
    await field.fill('energy')
    await field.press('Enter')
    await expect(page).toHaveURL('/resources/insights/?q=energy')
    await expect(page.getByRole('searchbox', { name: 'Search insights' })).toHaveValue('energy')
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

  test('EEX renders 37 unique connected hubs in four market groups', async ({ page }) => {
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
      venue.getByRole('heading', { exact: true, level: 2, name: 'About EEX' }),
    ).toBeVisible()
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
    await expect(page.getByRole('link', { exact: true, name: 'German Power' })).toHaveAttribute(
      'href',
      '/market-coverage/german-power/',
    )

    await page.setViewportSize({ height: 844, width: 390 })
    const firstMarketLink = marketGroups.locator('a').first()
    await expect(firstMarketLink).toBeVisible()
    expect((await firstMarketLink.boundingBox())?.height).toBeGreaterThanOrEqual(48)
  })
})
