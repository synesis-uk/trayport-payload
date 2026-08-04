import { expect, test, type Page } from '@playwright/test'

const STORAGE_KEY = 'trayport-cookie-consent'

const resetConsent = async (page: Page) => {
  await page.evaluate((key: string) => window.localStorage.removeItem(key), STORAGE_KEY)
  await page.reload()
  await page.waitForFunction(
    () =>
      typeof document.querySelector<HTMLButtonElement>('.cookie-notice button')?.onclick ===
      'function',
  )
}

test.describe('footer and aggregate cookie consent', () => {
  test('renders the 13 active footer destinations and exact supporting copy', async ({ page }) => {
    await page.goto('/venue/eex/')

    const footer = page.getByRole('contentinfo')
    // The reference intentionally hides this navigation on mobile, but keeps
    // the same bounded destinations in the rendered footer contract.
    await expect(footer.locator('.site-footer__navigation a')).toHaveCount(13)
    await expect(footer.locator('.site-footer__navigation a[href="/legal/"]')).toHaveText('Legal')
    await expect(footer.getByText('Connect with us:')).toBeVisible()
    await expect(footer.getByText('Head Office:')).toBeVisible()
    await expect(
      footer.getByText(/Trayport Holdings Limited is a wholly-owned subsidiary/),
    ).toBeVisible()
  })

  test('persists accept and reject as distinct one-year aggregate decisions', async ({ page }) => {
    await page.goto('/venue/eex/')
    await resetConsent(page)

    const notice = page.getByRole('complementary', { name: 'Trayport Cookie Consent' })
    await notice.getByRole('button', { name: 'Accept All' }).click()
    await expect(notice).toBeHidden()
    await expect
      .poll(() =>
        page.evaluate((key: string) => {
          const value = window.localStorage.getItem(key)
          return value ? JSON.parse(value).choice : null
        }, STORAGE_KEY),
      )
      .toBe('accepted')

    await page.reload()
    await expect(page.getByRole('complementary', { name: 'Trayport Cookie Consent' })).toBeHidden()

    await resetConsent(page)
    await page.getByRole('button', { name: 'Reject All' }).click()
    await expect
      .poll(() =>
        page.evaluate((key: string) => {
          const value = window.localStorage.getItem(key)
          return value ? JSON.parse(value).choice : null
        }, STORAGE_KEY),
      )
      .toBe('rejected')
  })
})
