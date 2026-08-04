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
      const rootMenu = navigation.getByRole('button', {
        exact: true,
        name: `${label} menu`,
      })
      await expect(rootMenu).toBeVisible()
      await expect(rootMenu).toHaveAttribute('aria-expanded', 'false')
    }
    await expect(navigation.getByRole('link', { name: /Commodities Report/i })).toHaveCount(0)

    const companyButton = navigation.getByRole('button', {
      exact: true,
      name: 'Company menu',
    })
    await companyButton.click()
    await expect(companyButton).toHaveAttribute('aria-expanded', 'true')

    const companyMenu = navigation.locator(
      '.desktop-navigation__dropdown[aria-label="Company menu"]',
    )
    const aboutFeature = companyMenu
      .locator('li[data-kind="feature"]')
      .filter({ hasText: 'About Us' })
    const aboutLink = aboutFeature.locator('a[href="/company/about-us/"]')
    const utilityNavigation = companyMenu.locator('.desktop-navigation__utility')
    await expect(companyMenu).toBeVisible()
    await expect(companyMenu.locator('.desktop-navigation__group-items').first()).toHaveCSS(
      'display',
      'block',
    )
    await expect(companyMenu.locator('.desktop-navigation__feature').first()).toHaveCSS(
      'padding-top',
      '0px',
    )
    expect(
      await page.locator('.site-header').evaluate((element) => {
        const backdrop = getComputedStyle(element, '::after')
        return {
          background: backdrop.backgroundColor,
          content: backdrop.content,
        }
      }),
    ).toEqual({ background: 'rgba(0, 0, 0, 0.5)', content: '""' })
    await expect(aboutFeature).toHaveCount(1)
    await expect(aboutLink).toBeVisible()
    await expect(aboutLink).toContainText('About Us')
    await expect(aboutLink).toHaveAttribute('href', '/company/about-us/')
    await expect(utilityNavigation.getByRole('link')).toHaveCount(3)
    await expect(utilityNavigation.getByRole('link', { name: 'See Joule' })).toHaveAttribute(
      'href',
      '/products/joule/',
    )
    await expect(utilityNavigation.getByRole('link', { name: 'Request A Demo' })).toHaveAttribute(
      'href',
      '/request-a-demo/',
    )
    await expect(utilityNavigation.getByRole('link', { name: 'Contact Us' })).toHaveAttribute(
      'href',
      '/contact/',
    )
    await expect(
      page.locator('.site-header__actions').getByRole('link', { exact: true, name: 'Contact' }),
    ).toHaveCount(0)
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
    const dialog = page.getByRole('dialog', { name: 'Navigation' })
    const mobileNavigation = dialog.getByRole('navigation', { name: 'Mobile navigation' })
    const closeButton = dialog.getByRole('button', { name: 'Close navigation menu' })
    const utilityNavigation = mobileNavigation.locator('.mobile-navigation__utility')
    await expect(dialog).toBeVisible()
    await expect(mobileNavigation).toBeVisible()
    expect(await dialog.evaluate((element) => Boolean(element.closest('.site-header')))).toBe(false)
    await expect(dialog).toHaveCSS('position', 'fixed')
    await expect(dialog).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    expect(await closeButton.getAttribute('aria-expanded')).toBeNull()

    for (const label of activeNavigationRoots) {
      const rootDisclosure = mobileNavigation.getByRole('button', {
        exact: true,
        name: label,
      })
      await expect(rootDisclosure).toBeVisible()
      await expect(rootDisclosure).toHaveAttribute('aria-expanded', 'false')
    }
    await expect(mobileNavigation.getByRole('link', { name: /Commodities Report/i })).toHaveCount(0)
    await expect(utilityNavigation.getByRole('link')).toHaveCount(3)
    await expect(utilityNavigation.getByRole('link', { name: 'See Joule' })).toHaveAttribute(
      'href',
      '/products/joule/',
    )
    await expect(utilityNavigation.getByRole('link', { name: 'Request A Demo' })).toHaveAttribute(
      'href',
      '/request-a-demo/',
    )
    await expect(utilityNavigation.getByRole('link', { name: 'Contact Us' })).toHaveAttribute(
      'href',
      '/contact/',
    )

    const companyDisclosure = mobileNavigation.getByRole('button', {
      exact: true,
      name: 'Company',
    })
    await companyDisclosure.click()
    await expect(companyDisclosure).toHaveAttribute('aria-expanded', 'true')
    const mobileAboutLink = mobileNavigation.locator('a[href="/company/about-us/"]')
    await expect(mobileAboutLink).toBeVisible()
    await expect(mobileAboutLink).toContainText('About Us')

    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(menuButton).toBeFocused()
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })
})
