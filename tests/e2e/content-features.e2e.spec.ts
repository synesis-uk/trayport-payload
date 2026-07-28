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

    const featuredCards = featuredSection.locator('a.trayport-article-card')
    await expect(featuredCards).toHaveCount(4)
    for (const [index, article] of featuredInsights.entries()) {
      const card = featuredCards.nth(index)
      await expect(card.getByRole('heading', { exact: true, name: article.title })).toBeVisible()
      await expect(card).toHaveAttribute('href', article.path)
    }

    const articleRows = page.locator('.trayport-article-list a.trayport-article-row')
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
})
