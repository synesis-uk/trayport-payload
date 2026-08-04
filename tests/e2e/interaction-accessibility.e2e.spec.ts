import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page, type TestInfo } from '@playwright/test'

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const assertAccessibleState = async (
  page: Page,
  testInfo: TestInfo,
  state: string,
  include?: string,
) => {
  const builder = new AxeBuilder({ page }).withTags(wcagTags)

  if (include) {
    builder.include(include)
  }

  const result = await builder.analyze()
  await testInfo.attach(`axe-${state}-${testInfo.project.name}.json`, {
    body: JSON.stringify(result, null, 2),
    contentType: 'application/json',
  })

  const summary = result.violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact || 'unknown'}): ${violation.help} [${violation.nodes.length} node(s)]\n${violation.nodes
          .map((node) => `  - ${node.target.join(' > ')}`)
          .join('\n')}`,
    )
    .join('\n')

  expect(result.violations, summary).toEqual([])
}

test.describe('interactive accessibility states', () => {
  test('light rich text remains readable with a dark OS preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/legal/cookie-policy/')

    const paragraph = page.locator('.payload-richtext p').first()
    await expect(paragraph).toBeVisible()
    const colours = await paragraph.evaluate((element) => ({
      body: getComputedStyle(document.body).color,
      paragraph: getComputedStyle(element).color,
    }))
    expect(colours.paragraph).toBe(colours.body)
  })

  test('desktop navigation opens a managed dropdown and remains accessible', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop-chromium',
      'Desktop navigation is viewport-specific.',
    )

    await page.goto('/')

    const navigation = page.getByRole('navigation', { name: 'Primary navigation' })
    const companyMenu = navigation.getByRole('button', {
      exact: true,
      name: 'Company menu',
    })
    const companyDropdown = navigation.locator(
      '.desktop-navigation__dropdown[aria-label="Company menu"]',
    )
    const aboutLink = companyDropdown.locator('a[href="/company/about-us/"]')

    await expect(companyMenu).toHaveAttribute('aria-expanded', 'false')
    await companyMenu.focus()
    await page.keyboard.press('Enter')
    await expect(companyMenu).toHaveAttribute('aria-expanded', 'true')
    await expect(aboutLink).toBeVisible()
    await assertAccessibleState(page, testInfo, 'desktop-company-menu-open')

    await page.keyboard.press('Escape')
    await expect(companyMenu).toHaveAttribute('aria-expanded', 'false')
    await expect(aboutLink).toBeHidden()
  })

  test('site search contains focus, closes with Escape, and restores its trigger', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop-chromium',
      'Desktop search is tested at its visible breakpoint.',
    )

    await page.goto('/')

    const openSearch = page.getByRole('button', { name: 'Open site search' })
    await openSearch.focus()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog', { name: 'Site Search' })
    const field = page.getByRole('searchbox', { name: 'Search Trayport insights' })
    const submit = dialog.getByRole('button', { exact: true, name: 'Search' })
    const close = dialog.getByRole('button', { name: 'Close site search' })

    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(field).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(submit).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(close).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(submit).toBeFocused()

    await assertAccessibleState(page, testInfo, 'site-search-open')

    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(openSearch).toBeFocused()
    await expect(openSearch).toHaveAttribute('aria-expanded', 'false')
  })

  test('mobile navigation closes with Escape and restores focus', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile-chromium',
      'Mobile navigation is viewport-specific.',
    )

    await page.goto('/')

    const openMenu = page.getByRole('button', { name: 'Open navigation menu' })
    await openMenu.focus()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog', { name: 'Navigation' })
    const navigation = dialog.getByRole('navigation', { name: 'Mobile navigation' })
    const closeMenu = dialog.getByRole('button', { name: 'Close navigation menu' })
    const companyDisclosure = navigation.getByRole('button', {
      exact: true,
      name: 'Company',
    })
    await expect(dialog).toBeVisible()
    await expect(navigation).toBeVisible()
    expect(await closeMenu.getAttribute('aria-expanded')).toBeNull()
    await expect(companyDisclosure).toHaveAttribute('aria-expanded', 'false')
    await companyDisclosure.click()
    await expect(companyDisclosure).toHaveAttribute('aria-expanded', 'true')
    await expect(navigation.locator('a[href="/company/about-us/"]')).toBeVisible()
    await assertAccessibleState(page, testInfo, 'mobile-navigation-open')

    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(openMenu).toBeFocused()
    await expect(openMenu).toHaveAttribute('aria-expanded', 'false')
  })

  test('chart data disclosure exposes the semantic table without hiding the chart', async ({
    page,
  }, testInfo) => {
    await page.goto('/')

    // Highcharts adds a trailing full stop when it replaces the server label
    // during hydration; accept both accessible-name forms.
    const chart = page.getByRole('region', { name: /interactive chart\.?$/i }).first()
    const disclosure = page.getByText('View chart data', { exact: true }).first()
    const tableRegion = page.getByRole('region', { name: /data table$/ }).first()

    await expect(chart).toBeVisible()
    await expect(tableRegion).toBeHidden()
    await disclosure.focus()
    await page.keyboard.press('Enter')
    await expect(tableRegion).toBeVisible()
    await expect(tableRegion.getByRole('table')).toBeVisible()
    await expect(chart).toBeVisible()
    await assertAccessibleState(page, testInfo, 'chart-data-open')
  })

  test('product FAQs expose Font Awesome disclosure state and native keyboard behavior', async ({
    page,
  }, testInfo) => {
    await page.goto('/products/joule/')

    const disclosure = page.locator('.trayport-faq details').first()
    const summary = disclosure.locator('summary')
    const closedIcon = summary.locator('[data-icon="plus"]')
    const openIcon = summary.locator('[data-icon="minus"]')

    await expect(disclosure).not.toHaveAttribute('open', '')
    await expect(closedIcon).toBeVisible()
    await expect(openIcon).toBeHidden()

    await summary.focus()
    await page.keyboard.press('Enter')

    await expect(disclosure).toHaveAttribute('open', '')
    await expect(closedIcon).toBeHidden()
    await expect(openIcon).toBeVisible()
    await expect(summary).toBeFocused()
    await assertAccessibleState(page, testInfo, 'product-faq-open', '.trayport-faq details')
  })

  test('Insights filters expose filtered and empty states accessibly', async ({
    page,
  }, testInfo) => {
    await page.goto('/resources/insights/')

    const search = page.getByRole('searchbox', { name: 'Search insights' })
    const category = page.getByRole('combobox', { name: 'Category' })
    const year = page.getByRole('combobox', { name: 'Year' })

    await search.fill('Data Analytics for Energy Traders')
    await expect(
      page.getByRole('heading', { exact: true, name: 'Data Analytics for Energy Traders' }),
    ).toBeVisible()

    await search.fill('no-result-query-for-accessibility')
    await expect(page.getByText('No insights match those filters.', { exact: true })).toBeVisible()

    await search.clear()
    await category.selectOption({ label: 'Insights' })
    await year.selectOption('2026')
    await expect(category).toHaveValue('Insights')
    await expect(year).toHaveValue('2026')
    await expect(
      page.getByRole('heading', {
        exact: true,
        name: 'ETCSEE 2026: Automate your trading or lose',
      }),
    ).toBeVisible()
    await assertAccessibleState(page, testInfo, 'insights-filtered')
  })

  test('Learning Hub product and topic filters update the result set accessibly', async ({
    page,
  }, testInfo) => {
    await page.goto('/learning-hub/')

    const product = page.getByRole('combobox', { name: 'Product' })
    const topic = page.getByRole('combobox', { name: 'Topic' })

    await product.selectOption({ label: 'Joule' })
    await expect(product).toHaveValue('Joule')
    await expect(page.getByText('Trayport login required', { exact: true })).toHaveCount(4)

    await topic.selectOption({ label: 'Trading' })
    await expect(topic).toHaveValue('Trading')
    await expect(page.getByText('Trading in Joule', { exact: true })).toBeVisible()
    await assertAccessibleState(page, testInfo, 'learning-hub-filtered')
  })
})

test.describe('design-system primitive states', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(
      process.env.DESIGN_SYSTEM_ENABLED !== 'true',
      'Set DESIGN_SYSTEM_ENABLED=true to exercise the guarded gallery.',
    )
    test.skip(
      testInfo.project.name !== 'desktop-chromium',
      'The deterministic gallery needs one browser project.',
    )
  })

  test('gallery exposes deterministic primitive states and an accessible open select', async ({
    page,
  }, testInfo) => {
    const response = await page.goto('/design-system/')
    expect(response?.status()).toBe(200)

    await expect(page.locator('[data-visual-test="design-system-gallery"]')).toBeVisible()
    await expect(page.locator('[data-visual-test="button-variants"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Disabled action' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Sending' })).toBeDisabled()
    await expect(page.getByRole('link', { name: 'Disabled link' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    await expect(page.getByRole('textbox', { name: 'Account reference' })).toBeDisabled()

    const invalidEmail = page.getByRole('textbox', { name: 'Email address' })
    await expect(invalidEmail).toHaveAttribute('aria-invalid', 'true')
    await expect(invalidEmail).toHaveAccessibleDescription('Enter a complete email address.')

    const updates = page.getByRole('checkbox', { name: 'Receive product updates' })
    const unavailable = page.getByRole('checkbox', { name: 'Unavailable option' })
    const partial = page.getByRole('checkbox', { name: 'Partially selected option' })
    await expect(updates).toBeChecked()
    await updates.focus()
    await page.keyboard.press('Space')
    await expect(updates).not.toBeChecked()
    await expect(updates).toBeFocused()
    await expect(unavailable).toBeDisabled()
    await expect(partial).toHaveAttribute('data-state', 'indeterminate')

    const message = page.getByRole('textbox', { name: 'Message' })
    await message.focus()
    await page.keyboard.press('End')
    await page.keyboard.type(' Please contact me.')
    await expect(message).toHaveValue(
      'Please tell me more about market access through Joule. Please contact me.',
    )
    await expect(message).toBeFocused()

    await assertAccessibleState(page, testInfo, 'gallery-primitives')

    const market = page.getByRole('combobox', { name: 'Market' })
    await expect(market).toHaveText('Power')
    await market.focus()
    await page.keyboard.press('ArrowDown')
    const listbox = page.getByRole('listbox')
    const naturalGas = page.getByRole('option', { name: 'Natural gas' })
    await expect(listbox).toBeVisible()
    await page.keyboard.press('ArrowDown')
    await expect(naturalGas).toHaveAttribute('data-highlighted', '')
    // Radix intentionally aria-hides the background while the portalled select
    // is open, so scan the active interaction surface rather than hidden content.
    await assertAccessibleState(page, testInfo, 'gallery-select-open', '[role="listbox"]')

    await page.keyboard.press('Enter')
    await expect(listbox).toHaveCount(0)
    await expect(market).toHaveText('Natural gas')
    await expect(market).toBeFocused()
  })

  test('gallery interaction primitives expose complete keyboard and focus states', async ({
    page,
  }, testInfo) => {
    const response = await page.goto('/design-system/')
    expect(response?.status()).toBe(200)

    const interactionSection = page.locator('[data-visual-test="interaction-primitives"]')

    const dialogTrigger = interactionSection.getByRole('button', { name: 'Open dialog' })
    await dialogTrigger.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'Request a conversation' })
    const cancelDialog = dialog.getByRole('button', { name: 'Cancel' })
    const continueDialog = dialog.getByRole('button', { name: 'Continue' })
    await expect(dialog).toBeVisible()
    await expect(cancelDialog).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(continueDialog).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(cancelDialog).toBeFocused()
    await assertAccessibleState(page, testInfo, 'gallery-dialog-open', '[role="dialog"]')
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(dialogTrigger).toBeFocused()

    const popoverTrigger = interactionSection.getByRole('button', { name: 'Open popover' })
    await popoverTrigger.focus()
    await page.keyboard.press('Enter')
    const closePopover = page.getByRole('button', { exact: true, name: 'Close' })
    await expect(page.getByText('All monitored services are operating normally.')).toBeVisible()
    await expect(closePopover).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(closePopover).toHaveCount(0)
    await expect(popoverTrigger).toBeFocused()

    const menuTrigger = interactionSection.getByRole('button', { name: 'Actions' })
    await menuTrigger.focus()
    await page.keyboard.press('ArrowDown')
    const menu = page.getByRole('menu')
    const previewPage = page.getByRole('menuitem', { name: 'Preview page' })
    const copyLink = page.getByRole('menuitem', { name: 'Copy link' })
    await expect(menu).toBeVisible()
    await expect(previewPage).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(copyLink).toBeFocused()
    await expect(page.getByRole('menuitem', { name: 'Archive unavailable' })).toHaveAttribute(
      'data-disabled',
      '',
    )
    await page.keyboard.press('Escape')
    await expect(menuTrigger).toBeFocused()

    const markets = interactionSection.getByRole('button', {
      name: 'Which markets are connected?',
    })
    await expect(markets).toHaveAttribute('aria-expanded', 'true')
    await markets.click()
    await expect(markets).toHaveAttribute('aria-expanded', 'false')

    await expect(interactionSection.getByRole('link', { name: 'Page 4' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await assertAccessibleState(page, testInfo, 'gallery-interactions-closed')
  })
})
