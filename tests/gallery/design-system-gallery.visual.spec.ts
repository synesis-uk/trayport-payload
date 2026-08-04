import { expect, test } from '@playwright/test'

import { appIconNames, gallerySections } from '../../src/components/design-system/fixtures'

const settleGallery = async (page: import('@playwright/test').Page) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
      }

      nextjs-portal {
        display: none !important;
      }
    `,
  })

  await page.evaluate(async () => {
    await document.fonts.ready

    for (let offset = 0; offset < document.documentElement.scrollHeight; offset += innerHeight) {
      window.scrollTo(0, offset)
      await new Promise((resolve) => window.setTimeout(resolve, 20))
    }

    window.scrollTo(0, 0)
  })
}

test('the explicit server gate exposes the complete deterministic gallery', async ({ page }) => {
  const response = await page.goto('/design-system/', { waitUntil: 'networkidle' })

  expect(response?.status()).toBe(200)
  await expect(page).toHaveTitle('Design system | Trayport')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex, nofollow/)

  const gallery = page.locator('[data-visual-test="design-system-gallery"]')
  await expect(gallery).toBeVisible()
  await expect(
    page.getByRole('heading', { exact: true, level: 1, name: 'Trayport design-system gallery' }),
  ).toBeVisible()

  for (const section of gallerySections) {
    const sectionElement = gallery.locator(`section[data-visual-test="${section.id}"]`)

    await expect(sectionElement).toHaveCount(1)
    await expect(
      sectionElement.getByRole('heading', { exact: true, level: 2, name: section.title }),
    ).toBeVisible()
  }

  const completeIconRegistry = gallery.locator(
    '[data-visual-test="complete-icon-registry"] [data-app-icon-name]',
  )
  await expect(completeIconRegistry).toHaveCount(appIconNames.length)
  expect(
    await completeIconRegistry.evaluateAll((icons) =>
      icons.map((icon) => icon.dataset.appIconName),
    ),
  ).toEqual(appIconNames)
  await expect(completeIconRegistry.locator('svg')).toHaveCount(appIconNames.length)

  await settleGallery(page)
  await expect(page).toHaveScreenshot('design-system-gallery.png', { fullPage: true })
})

test('the guarded gallery exercises composition cascade and primitive keyboard contracts', async ({
  page,
}) => {
  const response = await page.goto('/design-system/')
  expect(response?.status()).toBe(200)

  const compositions = page.locator('section[data-visual-test="compositions"]')
  const headingGroup = compositions.locator('.trayport-heading').first()
  const eyebrow = headingGroup.locator('.trayport-eyebrow')
  const actionGroup = compositions.locator('.trayport-actions').first()

  await expect(headingGroup).toHaveCSS('display', 'grid')
  await expect(eyebrow).toHaveCSS('margin-bottom', '0px')
  await expect(actionGroup).toHaveCSS('margin-top', '0px')

  const darkSurfaceProse = compositions.locator(
    '[data-visual-test="dark-surface-prose-contract"] p',
  )
  const darkStatisticLabel = compositions.locator(
    '[data-visual-test="dark-statistics-contract"] .trayport-statistics__label',
  )
  await expect(darkSurfaceProse).toHaveCSS('color', 'rgb(255, 255, 255)')
  await expect(darkStatisticLabel).toHaveCSS('color', 'rgba(255, 255, 255, 0.72)')

  // Exercise caller utilities without changing the deterministic screenshot fixture. Reusable
  // component defaults live in the components layer, so utilities merged through className must
  // own conflicting properties at every responsive breakpoint.
  const galleryIntroduction = page.locator(
    '[data-visual-test="gallery-introduction"] .trayport-container',
  )
  const compactSection = compositions.locator('[data-slot="cta-section"]')
  const hero = compositions.locator('[data-slot="hero"]')
  const mediaBlock = page.locator(
    '[data-visual-test="content-resilience"] [data-slot="media-block"]',
  )

  expect(
    await galleryIntroduction.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).paddingLeft),
    ),
  ).toBeGreaterThan(0)
  expect(
    await galleryIntroduction.evaluate((element) => getComputedStyle(element).maxWidth),
  ).not.toBe('none')
  expect(
    await compactSection.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).paddingTop),
    ),
  ).toBeGreaterThan(0)

  await galleryIntroduction.evaluate((element) =>
    element.classList.add('max-w-none', 'px-0', 'w-1/2'),
  )
  await compactSection.evaluate((element) => element.classList.add('py-0'))
  await mediaBlock.evaluate((element) => element.classList.add('m-4'))
  await hero.evaluate((element) => element.classList.add('overflow-visible'))

  await expect(galleryIntroduction).toHaveCSS('padding-left', '0px')
  await expect(galleryIntroduction).toHaveCSS('padding-right', '0px')
  await expect(galleryIntroduction).toHaveCSS('max-width', 'none')
  const containerWidths = await galleryIntroduction.evaluate((element) => ({
    callerWidth: element.getBoundingClientRect().width,
    containingWidth: element.parentElement?.getBoundingClientRect().width || 0,
  }))
  expect(containerWidths.callerWidth).toBeCloseTo(containerWidths.containingWidth / 2, 4)
  await expect(compactSection).toHaveCSS('padding-top', '0px')
  await expect(compactSection).toHaveCSS('padding-bottom', '0px')
  await expect(mediaBlock).toHaveCSS('margin', '16px')
  await expect(hero).toHaveCSS('overflow', 'visible')

  const interactions = page.locator('[data-visual-test="interaction-primitives"]')

  const dialogTrigger = interactions.getByRole('button', { name: 'Open dialog' })
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
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(dialogTrigger).toBeFocused()

  const popoverTrigger = interactions.getByRole('button', { name: 'Open popover' })
  await popoverTrigger.focus()
  await page.keyboard.press('Enter')
  const closePopover = page.getByRole('button', { name: 'Close', exact: true })
  await expect(page.getByText('All monitored services are operating normally.')).toBeVisible()
  await expect(closePopover).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(closePopover).toHaveCount(0)
  await expect(popoverTrigger).toBeFocused()

  const menuTrigger = interactions.getByRole('button', { name: 'Actions' })
  await menuTrigger.focus()
  await page.keyboard.press('ArrowDown')
  const menu = page.getByRole('menu')
  const previewPage = page.getByRole('menuitem', { name: 'Preview page' })
  const copyLink = page.getByRole('menuitem', { name: 'Copy link' })
  await expect(menu).toBeVisible()
  await expect(previewPage).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(copyLink).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  await expect(menuTrigger).toBeFocused()

  const market = page.getByRole('combobox', { name: 'Market' })
  await market.focus()
  await page.keyboard.press('ArrowDown')
  const listbox = page.getByRole('listbox')
  const naturalGas = page.getByRole('option', { name: 'Natural gas' })
  await expect(listbox).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await expect(naturalGas).toHaveAttribute('data-highlighted', '')
  await page.keyboard.press('Enter')
  await expect(listbox).toHaveCount(0)
  await expect(market).toHaveText('Natural gas')
  await expect(market).toBeFocused()
})
