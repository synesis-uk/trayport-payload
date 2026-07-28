import { expect, test } from '@playwright/test'

import { activeNavigationRoots } from '../helpers/site'

test.describe('content-managed global navigation', () => {
  test('desktop navigation exposes the five active ACF option roots and a usable dropdown', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium')
    await page.goto('/')

    const navigation = page.getByRole('navigation', { name: 'Primary navigation' })
    await expect(navigation).toBeVisible()

    for (const label of activeNavigationRoots) {
      await expect(navigation.getByRole('link', { exact: true, name: label })).toBeVisible()
    }
    await expect(navigation.getByRole('link', { name: /Commodities Report/i })).toHaveCount(0)

    const companyButton = navigation.getByRole('button', { name: /Company menu$/ })
    await companyButton.click()
    await expect(companyButton).toHaveAttribute('aria-expanded', 'true')

    const aboutLink = navigation.getByRole('link', { exact: true, name: 'About Us' })
    await expect(aboutLink).toBeVisible()
    await expect(aboutLink).toHaveAttribute('href', '/company/about-us/')
    await aboutLink.click()
    await expect(page).toHaveURL(/\/company\/about-us\/$/)
    await expect(
      page.getByRole('heading', {
        exact: true,
        level: 1,
        name: 'A mature company with a young spirit',
      }),
    ).toBeVisible()
  })

  test('mobile menu opens, exposes imported navigation, and closes with Escape', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chromium')
    await page.goto('/')

    const menuButton = page.getByRole('button', { name: 'Open navigation menu' })
    await expect(menuButton).toBeVisible()
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    await menuButton.click()
    const mobileNavigation = page.getByRole('navigation', { name: 'Mobile navigation' })
    await expect(mobileNavigation).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    for (const label of activeNavigationRoots) {
      await expect(mobileNavigation.getByRole('link', { exact: true, name: label })).toBeVisible()
    }
    await expect(mobileNavigation.getByRole('link', { name: /Commodities Report/i })).toHaveCount(0)

    await page.keyboard.press('Escape')
    await expect(mobileNavigation).toBeHidden()
    await expect(menuButton).toBeFocused()
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })
})
