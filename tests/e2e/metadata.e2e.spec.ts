import { expect, test } from '@playwright/test'

test.describe('metadata and structured data safety', () => {
  test('Home JSON-LD is parseable data with source hosts and executable markup removed', async ({
    page,
  }) => {
    await page.goto('/')

    const scripts = page.locator('script[type="application/ld+json"]')
    expect(await scripts.count()).toBeGreaterThan(0)

    for (const script of await scripts.all()) {
      const text = (await script.textContent()) || ''
      expect(() => JSON.parse(text)).not.toThrow()
      expect(text).not.toMatch(/trayport\.local|trayport\.kayson\.io/i)
      expect(text).not.toMatch(/<script|<\/script|AIza[0-9A-Za-z_-]{20,}/i)
      expect(JSON.parse(text)).toEqual(expect.any(Object))
    }
  })
})
