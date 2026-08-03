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
    await expect(articleRows).toHaveCount(12)

    for (let click = 0; click < 3; click += 1) {
      const loadMore = page.getByRole('button', { name: 'Load more insights' })
      if (!(await loadMore.isVisible())) break
      await loadMore.click()
    }

    await expect(page.getByRole('button', { name: 'Load more insights' })).toHaveCount(0)
    await expect(articleRows).toHaveCount(35)
    expect((await featuredCards.count()) + (await articleRows.count())).toBe(39)
  })

  test('Insights search finds the scoped full-body article and preserves its route', async ({
    page,
  }) => {
    await page.goto('/resources/insights/')

    // The listing is a client component. Prove hydration before dispatching a
    // filter event so a fast browser cannot fill the server-rendered input
    // before React has attached its handlers.
    await page.getByRole('button', { name: 'Load more insights' }).click()
    await expect(page.locator('.trayport-article-list a.trayport-article-row')).toHaveCount(21)

    await page
      .getByRole('searchbox', { name: 'Search insights' })
      .fill('Data Analytics for Energy Traders')

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

    const productSections = page.locator('section.trayport-connectivity')
    await expect(productSections).toHaveCount(2)

    const joule = productSections.filter({
      has: page.getByRole('heading', { exact: true, level: 2, name: 'Joule' }),
    })
    const autoTrader = productSections.filter({
      has: page.getByRole('heading', { exact: true, level: 2, name: 'autoTRADER' }),
    })
    await expect(joule.locator('.trayport-venue-list > li')).toHaveCount(19)
    await expect(autoTrader.locator('.trayport-venue-list > li')).toHaveCount(11)

    const visibleVenueNames = await productSections
      .locator('.trayport-venue-list > li')
      .allTextContents()
    expect(new Set(visibleVenueNames.map((name) => name.trim())).size).toBe(21)

    for (const group of ['Broker', 'Exchange', 'Clearing House']) {
      await expect(joule.getByRole('heading', { exact: true, level: 3, name: group })).toBeVisible()
    }
  })

  test('News renders all 31 imported listing records through its managed index', async ({
    page,
  }) => {
    await page.goto('/resources/news/')

    const featuredCards = page.locator('.trayport-featured-articles .trayport-article-card')
    const articleRows = page.locator('.trayport-article-list .trayport-article-row')
    await expect(featuredCards).toHaveCount(1)
    await expect(articleRows).toHaveCount(12)

    while (await page.getByRole('button', { name: 'Load more news' }).isVisible()) {
      await page.getByRole('button', { name: 'Load more news' }).click()
    }

    await expect(page.getByRole('button', { name: 'Load more news' })).toHaveCount(0)
    await expect(articleRows).toHaveCount(30)
    expect((await featuredCards.count()) + (await articleRows.count())).toBe(31)
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

    const marketGroups = page.locator('.trayport-venue-markets__groups > section')
    await expect(marketGroups).toHaveCount(4)
    for (const group of ['Bulk', 'Climate', 'Natural Gas', 'Power']) {
      await expect(page.getByRole('heading', { exact: true, level: 3, name: group })).toBeVisible()
    }
    await expect(marketGroups.locator('li')).toHaveCount(37)
    await expect(page.getByRole('link', { exact: true, name: 'German Power' })).toHaveAttribute(
      'href',
      '/market-coverage/german-power/',
    )
  })
})
